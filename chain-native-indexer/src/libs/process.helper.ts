import { BigNumber } from "bignumber.js";
import {
  HEADERS,
  REDIS_KEY,
  QUEUE_NAME,
  FETCH_METHODS,
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  SOCKET_EVENT,
} from "../constant";
import {
  IBlock,
  IContractLogs,
  IContracts,
  ITokens,
  ITransaction,
  IVoters,
} from "../interface";
import { RabbitMqService, RedisService, SocketEventEmitter } from "../services";
import rabbitmqService from "../services/rabbitmq.service";
import redisHelper from "../services/redis.service";
import socketEventsHelper from "../services/socket-events.service";
import { EVENT_OPERATION_PATH_MAPPINGS, UNIQUE_EVENTS_ORDERED } from "../constant/events";
import { prisma } from "./db";
import {
  fetchRequest,
  noExponent,
  retrieveNumbers,
  parseTx,
  cleanEscapedString,
  getType,
  parseAmount,
  getActionAndSender,
  parseVoteOption,
} from "./utility/common";
import { ChainRpcClient } from "./chainClient.helper";
import dbHelper from "./db.helper";
import { WebSocketManager } from "./ws.helper";
import logger from "./logger";

class ProcessHelper {
  chainRpcProvider: ChainRpcClient;

  private readonly wsManager: WebSocketManager;

  private blockSubscriptionId: string | null = null;

  private txSubscriptionId: string | null = null;

  constructor() {
    this.chainRpcProvider = ChainRpcClient.getInstance();
    this.wsManager = WebSocketManager.getInstance(
      `${environment.wsUrl}/websocket`
    );

  }

  public subscribeLatestBlocks() {
    this.blockSubscriptionId = this.wsManager.subscribe(
      "tm.event='NewBlock'",
      QUEUE_NAME.LATEST_BLOCKS
    );
  }

  public subscribeLatestTxs() {
    this.txSubscriptionId = this.wsManager.subscribe(
      "tm.event='Tx'",
      QUEUE_NAME.LATEST_TXS
    );
  }

  async processDelegatorRewards(
    address: string,
    rewardEvent: string[],
    timeStamp: string
  ) {
    try {
      let rewardAmount = BigNumber(0);

      for (let i = 0; i < rewardEvent?.length; i++) {
        const element = rewardEvent[i];
        let amountToAdd = "0";

        if (
          typeof element === "string" &&
          element.includes(environment.symbol.toLowerCase())
        ) {
          amountToAdd = element.replace(/[^\d.]/g, "");
        }
        rewardAmount = rewardAmount.plus(amountToAdd || 0);
      }

      const rewardData = await prisma.rewards.findFirst({
        where: {
          address,
        },
      });

      if (rewardData) {
        const timeCondition =
          new Date(timeStamp).getTime() >
          new Date(rewardData?.timeStamp).getTime();

        if (timeCondition) {
          const newRewardToSet = rewardAmount
            .plus(rewardData.rewardAmount)
            .toString();

          await redisHelper.setHset(REDIS_KEY.REWARDS, address, {
            timeStamp,
            rewardAmount: newRewardToSet,
          });

          await prisma.rewards.update({
            where: { address },
            data: {
              timeStamp,
              rewardAmount: rewardAmount.toString(),
            },
          });
        }
      } else {
        await prisma.rewards.create({
          data: {
            address,
            timeStamp,
            rewardAmount: rewardAmount.toString(),
          },
        });

        await redisHelper.setHset(REDIS_KEY.REWARDS, address, {
          timeStamp,
          rewardAmount: rewardAmount.toString(),
        });
      }
    } catch (error) {
      logger.error("Error calculating delegator rewards:", error);
    }
  }

  /**
   * process latest transactions
   * @param message
   * @returns
   */
  public async processTxns(message: any) {
    try {
      const events = message?.result?.events;
      const data = message?.result?.data;
      if (data && events) {
        const code = data?.value?.TxResult?.result?.code;

        const status = code
          ? TRANSACTION_STATUS.FAILED
          : TRANSACTION_STATUS.SUCCESS;

        let txEvent;
        txEvent = events?.["message.action"]
          ? events?.["message.action"][0]
          : "";

        // Check if evm transaction is from precompiled staking contract
        // and map to correct staking event
        if (txEvent === '/ethermint.evm.v1.MsgEthereumTx') {

          const matchedEvent = UNIQUE_EVENTS_ORDERED.find((event) => message.result.events[event]);
          if (matchedEvent) {
            txEvent = EVENT_OPERATION_PATH_MAPPINGS[matchedEvent];
            logger.debug(`[EVM staking tx] Mapped to staking event: ${txEvent}`);
          }
        };



        const logs: string = data?.value?.TxResult?.result?.log;
        const hash = events["tx.hash"] ? `${events["tx.hash"][0]}` : "";

        let type: string;
        let val: string | number = 0;
        let contractAddress = "";

        const stakingRewardValue: string | number = 0;
        const firstIndexAddress: string = events["message.sender"]
          ? `${events["message.sender"][0]}`
          : "";
        const actionSender = getActionAndSender(events);
        let fromAddress = actionSender?.sender ?? firstIndexAddress;

        let toAddress = "";
        let method = "";
        let timeStamp = "";

        const url = `${environment.nativeSwaggerUrl}/cosmos/tx/v1beta1/txs/${hash}`;

        const fetchRes = await fetchRequest(
          url,
          FETCH_METHODS.GET,
          HEADERS.DEFAULT,
          null
        );

        if (!fetchRes.error) {
          timeStamp =
            fetchRes?.data?.tx_response?.timestamp.toString() ||
            fetchRes?.data.result.block?.header?.time ||
            null;

        }


        switch (txEvent) {
          // ---------------------------------------------
          // BANK TRANSFER
          // ---------------------------------------------
          case "/cosmos.bank.v1beta1.MsgSend":
            type = TRANSACTION_TYPE.COIN_TRANSFER;
            val =
              events["transfer.amount"]?.[1] ??
              events["transfer.amount"]?.[0] ??
              0;
            toAddress =
              events["transfer.recipient"]?.[1] ??
              events["transfer.recipient"]?.[0] ??
              "";
            break;

          // ---------------------------------------------
          // DELEGATION
          // ---------------------------------------------
          case "/cosmos.staking.v1beta1.MsgDelegate":
            if (events["message.sender"]?.length === 1) {
              type = TRANSACTION_TYPE.CREATE_DELEGATOR;
            } else {
              type = TRANSACTION_TYPE.BOND_MORE;
            }

            val = events["delegate.amount"]?.[0] ?? 0;
            toAddress = "/cosmos.staking.v1beta1.MsgDelegate";
            if (events["withdraw_rewards.amount"]) {
              this.processDelegatorRewards(
                fromAddress,
                events["withdraw_rewards.amount"],
                timeStamp
              );
            }

            break;

          // ---------------------------------------------
          // UNDELEGATION
          // ---------------------------------------------
          case "/cosmos.staking.v1beta1.MsgUndelegate":
            type = TRANSACTION_TYPE.UNBOND_FUNDS;
            val = events["unbond.amount"]?.[0] ?? 0;
            toAddress = "/cosmos.staking.v1beta1.MsgUndelegate";

            // Sometimes undelegation auto-triggers reward withdrawal
            if (events["withdraw_rewards.amount"]) {
              this.processDelegatorRewards(
                fromAddress,
                events["withdraw_rewards.amount"],
                timeStamp
              );
            }
            break;

          // ---------------------------------------------
          // CREATE VALIDATOR
          // ---------------------------------------------
          case "/cosmos.staking.v1beta1.MsgCreateValidator":
            type = TRANSACTION_TYPE.CREATE_VALIDATOR;
            val = events["create_validator.amount"]?.[0] ?? 0;
            toAddress = "/cosmos.staking.v1beta1.MsgCreateValidator";

            break;

          case "/cosmos.gov.v1.MsgSubmitProposal":
          case "/cosmos.gov.v1beta1.MsgSubmitProposal":
            type = TRANSACTION_TYPE.SUBMIT_PROPOSAL;
            val = events["transfer.amount"] ? events["transfer.amount"][0] : 0;
            toAddress = "/cosmos.gov.v1.MsgSubmitProposal";

            break;

          case "/cosmos.gov.v1.MsgVote":
          case "/cosmos.gov.v1beta1.MsgVote":
            type = TRANSACTION_TYPE.VOTING;
            val = events["transfer.amount"] ? events["transfer.amount"][0] : 0;
            toAddress = "/cosmos.gov.v1.MsgVote";

            break;

          case "/cosmos.authz.v1beta1.MsgExec":
            type = TRANSACTION_TYPE.RESTAKING_EXECUTION;
            val = events["transfer.amount"] ? events["transfer.amount"][0] : 0;
            toAddress = "/cosmos.authz.v1beta1.MsgExec";

            break;

          case "/cosmos.staking.v1beta1.MsgEditValidator":
            type = TRANSACTION_TYPE.EDIT_VALIDATOR;
            toAddress = "/cosmos.staking.v1beta1.MsgEditValidator";
            break;

          // ---------------------------------------------
          // REDELEGATION
          // ---------------------------------------------
          case "/cosmos.staking.v1beta1.MsgBeginRedelegate":
            type = TRANSACTION_TYPE.BEGIN_REDELEGATE;
            toAddress = "/cosmos.staking.v1beta1.MsgBeginRedelegate";
            val = events["redelegate.amount"]?.[0] ?? 0;

            // Sometimes redelegation includes rewards withdrawal
            if (events["withdraw_rewards.amount"]) {
              this.processDelegatorRewards(
                fromAddress,
                events["withdraw_rewards.amount"],
                timeStamp
              );
            }
            break;

          // ---------------------------------------------
          // CANCEL UNBONDING
          // ---------------------------------------------
          case "/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation":
            type = TRANSACTION_TYPE.CANCEL_UNBONDING_DELEGATION;
            val = events["cancel_unbonding_delegation.amount"]?.[0] ?? 0;
            toAddress = "/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation";
            break;

          // ---------------------------------------------
          // UNJAIL
          // ---------------------------------------------
          case "/cosmos.slashing.v1beta1.MsgUnjail":
            type = TRANSACTION_TYPE.UNJAIL;
            toAddress = "/cosmos.slashing.v1beta1.MsgUnjail";
            break;

          // ---------------------------------------------
          // WITHDRAW REWARDS (Delegator)
          // ---------------------------------------------
          case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward":
            type = TRANSACTION_TYPE.DELEGATOR_REWARD;
            toAddress =
              "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
            val = events["withdraw_rewards.amount"]?.[0] ?? 0;

            this.processDelegatorRewards(
              fromAddress,
              events["withdraw_rewards.amount"],
              timeStamp
            );
            break;

          // ---------------------------------------------
          // WITHDRAW COMMISSION (Validator)
          // ---------------------------------------------
          case "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission":
            type = TRANSACTION_TYPE.VALIDATOR_COMMISSION;
            toAddress =
              "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission";
            val = events["withdraw_rewards.amount"]?.[0] ?? 0;
            break;

          // ---------------------------------------------
          // COSMWASM CONTRACTS
          // ---------------------------------------------

          case "/cosmwasm.wasm.v1.MsgInstantiateContract":
            type = TRANSACTION_TYPE.CONTRACT_CREATION;
            contractAddress =
              events["instantiate._contract_address"]?.[0] ?? "";
            break;

          case "/cosmwasm.wasm.v1.MsgExecuteContract":
            type = TRANSACTION_TYPE.CONTRACT_EXECUTE;
            contractAddress = events["execute._contract_address"]?.[0] ?? "";
            val = events["wasm.amount"]?.[0] ?? 0;
            method = events["wasm.action"]?.[0] ?? "";
            break;

          // ---------------------------------------------
          // IBC TRANSFERS
          // ---------------------------------------------
          case "/ibc.applications.transfer.v1.MsgTransfer":
            type = TRANSACTION_TYPE.IBC_TRANSFER_INITIATE;
            val = events["transfer.amount"]?.[0] ?? 0;
            toAddress = events["ibc_transfer.receiver"]?.[0] ?? "";
            break;

          case "/ibc.core.client.v1.MsgUpdateClient":
            txEvent = events?.["message.action"]?.[1] ?? "";

            switch (txEvent) {
              case "/ibc.core.channel.v1.MsgRecvPacket":
                type = TRANSACTION_TYPE.IBC_TRANSFER_RECEIVE;
                val = events["coin_spent.amount"]?.[0] ?? 0;
                toAddress = events["fungible_token_packet.receiver"]?.[0] ?? "";
                fromAddress = events["fungible_token_packet.sender"]?.[0] ?? "";
                break;

              case "/ibc.core.channel.v1.MsgAcknowledgement":
                type = TRANSACTION_TYPE.IBC_TRANSFER_CONFIRM;
                val = events["fungible_token_packet.amount"]?.[0] ?? 0;
                toAddress = events["fungible_token_packet.receiver"]?.[0] ?? "";
                fromAddress = events["fungible_token_packet.sender"]?.[0] ?? "";
                break;

              default:
                type = "UNKNOWN";
                break;
            }
            break;

          // ---------------------------------------------
          // EVM TX (Ethermint)
          // ---------------------------------------------
          case "/ethermint.evm.v1.MsgEthereumTx":
            type = TRANSACTION_TYPE.COIN_RECEIVE;
            val = events["ethereum_tx.amount"]?.[0] ?? 0;
            toAddress = events["transfer.recipient"]?.[1] ?? "";
            break;

          // ---------------------------------------------
          // DEFAULT / UNKNOWN
          // ---------------------------------------------
          default:
            type = txEvent;
            val = 0;
            break;
        }

        let amount;

        if (val) {
          if (type === TRANSACTION_TYPE.IBC_TRANSFER_RECEIVE) {
            amount = noExponent(Number(retrieveNumbers(val)) / 10 ** 6);
          } else if (type === TRANSACTION_TYPE.START_SUBSCRIPTION) {
            amount = parseAmount(val);
          } else {
            amount = noExponent(Number(retrieveNumbers(val)) / 10 ** 18);
          }
        } else {
          amount = val;
        }
        const txFeeData = events?.["tx.fee"]?.[0]?.match(/[\d.]+/g)?.[0] ?? 0;

        const txFee = txFeeData
          ? (Number(txFeeData) / 10 ** 18).toString()
          : txFeeData.toString();

        const txData = {
          type: getType(type),
          status,
          value: amount ? amount?.toString() : "0",
          timestamp: timeStamp,
          txString: message.result.data?.value?.TxResult?.tx ?? "",
          txhash: `0x${hash ?? ""}`,
          toAddress: cleanEscapedString(toAddress),
          blocknumber: Number(message.result.data?.value?.TxResult?.height),
          fromAddress: cleanEscapedString(fromAddress),
          txFee: String(txFee),
          gasWanted: Number(
            message.result.data?.value?.TxResult?.result?.gas_wanted ?? ""
          ),
          gasUsed: Number(
            message.result.data?.value?.TxResult?.result?.gas_used ?? ""
          ),
          contractAddress,
        };

        socketEventsHelper.emitMessage(
          SOCKET_EVENT.NATIVE_LATEST_TRANSACTIONS,
          txData
        );

        // save transaction
        await dbHelper.saveTransactions(txData);

        if (txData.type === TRANSACTION_TYPE.VOTING) {
          const answer = events["proposal_vote.option"]
            ? parseVoteOption(events["proposal_vote.option"][0])
            : "";

          const voters: IVoters = {
            proposalId: events["proposal_vote.proposal_id"]
              ? events["proposal_vote.proposal_id"][0]
              : "",
            answer,
            txHash: txData.txhash,
            blockNumber: events["tx.height"] ? events["tx.height"][0] : "",
            voter: events["message.sender"]
              ? `${events["message.sender"][0]}`
              : "",
          };

          // save the details of voters
          await dbHelper.saveVoters(voters);
        }

        let contractType = "UNKNOWN";

        if (txData.type === TRANSACTION_TYPE.CONTRACT_CREATION) {
          // call the method to get the type of contract
          if (txData.contractAddress) {
            contractType = await this.chainRpcProvider.getContractType(
              txData.contractAddress
            );
            contractType ??= "UNKNOWN";
          }

          const contractDetails: IContracts = {
            contractName: "",
            txHash: txData.txhash,
            blockNumber: events["tx.height"] ? events["tx.height"][0] : "",
            address: events["instantiate._contract_address"]
              ? events["instantiate._contract_address"][0]
              : "",
            contractType,
            timestamp: txData.timestamp,
            creator: events["message.sender"]
              ? events["message.sender"][0]
              : "",
          };

          const contractName = await this.chainRpcProvider.getContractName(
            contractDetails.address
          );

          if (contractName !== null) {
            contractDetails.contractName = contractName;
          }
          // save the details of contract

          await dbHelper.saveContractDeployTx(contractDetails);

          const tokenInfo = await this.chainRpcProvider.getTokenInfo(
            contractDetails.address
          );

          if (tokenInfo !== null) {
            const {
              name: tokenName,
              symbol: tokenSymbol,
              decimals,
              total_supply: totalSupply,
            } = tokenInfo;

            const tokens: ITokens = {
              tokenName,
              tokenSymbol,
              creator: contractDetails.creator,
              type: contractDetails.contractType,
              decimal: noExponent(decimals),
              blockNumber: contractDetails.blockNumber,
              totalSupply: noExponent(totalSupply),
              contractAddress: contractDetails?.address,
            };

            // save the details of token
            await dbHelper.saveToken(tokens);
          }
        } else if (txData.type === TRANSACTION_TYPE.CONTRACT_EXECUTE) {
          const contractLogData: IContractLogs = {
            logs,
            method,
            txFee: txData.txFee,
            txHash: txData.txhash,
            status: txData.status,
            timestamp: txData.timestamp,
            contractAddress: txData.contractAddress,
            blockNumber: Number(txData.blocknumber),
          };

          await dbHelper.saveContractLogs(contractLogData);

          await dbHelper.updateContractExec(txData.contractAddress);

          const account = await this.chainRpcProvider.getAccountInfo(
            txData.contractAddress
          );

          await this.chainRpcProvider.getTokenBalances(
            txData.contractAddress,
            account
          );
        }
      }
      return true;
    } catch (error) {
      logger.error("Error processing transaction:", error);
      return false;
    }
  }

  /**
   * Process and save missed transactions
   * @param txHash of type string
   * @returns
   */
  public async processMissedTxs(txHash: string, emitTx = false): Promise<boolean> {
    try {
      const url = `${environment.httpHost}/tx?hash=0x${txHash}`;
      const fetchRes = await fetchRequest(
        url,
        FETCH_METHODS.GET,
        HEADERS.DEFAULT,
        null
      );

      if (fetchRes?.data?.result && !fetchRes.error) {
        const result = fetchRes?.data?.result;

        const events = result?.tx_result?.events;

        const code = result?.tx_result?.code;
        const status = code
          ? TRANSACTION_STATUS.FAILED
          : TRANSACTION_STATUS.SUCCESS;

        const txData: ITransaction = {
          status,
          txhash: `0x${txHash}`,
          txString: fetchRes.data?.result?.tx ?? "",
          blocknumber: Number(fetchRes.data?.result?.height ?? 0),
          txFee: fetchRes.data.result?.tx_result?.gas_used ?? "",
          gasWanted: fetchRes.data.result?.tx_result?.gas_wanted ?? "",
          gasUsed: fetchRes.data.result?.tx_result?.gas_used ?? "",
          type: "",
          toAddress: "",
          fromAddress: "",
          value: "",
          timestamp: "",
          contractAddress: "",
        };

        const url2 = `${environment.httpHost}/block?height=${txData.blocknumber}`;
        const fetchRes2 = await fetchRequest(
          url2,
          FETCH_METHODS.GET,
          HEADERS.DEFAULT,
          null
        );

        if (!fetchRes2.error) {
          txData.timestamp = fetchRes2?.data.result.block?.header?.time ?? "";
        }

        let val = 0;

        // Default values
        const transferEvent = events.find((i: any) => i.type === "transfer");

        transferEvent?.attributes?.forEach((i: any) => {
          switch (i.key) {
            case "recipient":
              txData.toAddress = i?.value || "";
              break;

            case "sender":
              txData.fromAddress = i?.value || "";
              break;

            case "amount": {
              val = i?.value ?? 0;
              break;
            }

            default:
              break;
          }
        });

        const filteredEvent = events.find(
          (event: any) =>
            event.type === "message" &&
            event?.attributes.some((attr: any) => attr.key === "action")
        );

        const eventObj = filteredEvent?.attributes.find(
          (i: any) => i.key === "action"
        );

        const txEvent = eventObj?.value || "";

        switch (txEvent) {
          case "/cosmos.bank.v1beta1.MsgSend":
            txData.type = TRANSACTION_TYPE.COIN_TRANSFER;
            break;

          case "/cosmos.staking.v1beta1.MsgDelegate": {
            txData.type = TRANSACTION_TYPE.BOND_MORE;
            txData.toAddress = "/cosmos.staking.v1beta1.MsgDelegate";

            const delegateEvent = events.find(
              (e: any) => e.type === "delegate"
            );
            const amountAttr = delegateEvent?.attributes.find(
              (e: any) => e.key === "amount"
            );
            val = (amountAttr?.value || "0").replaceAll(/[^\d.]/g, "");

            if (events["withdraw_rewards.amount"]) {
              this.processDelegatorRewards(
                txData.fromAddress,
                events["withdraw_rewards.amount"],
                txData.timestamp
              );
            }
            break;
          }

          case "/cosmos.staking.v1beta1.MsgBeginRedelegate": {
            txData.type = TRANSACTION_TYPE.BEGIN_REDELEGATE;
            txData.toAddress = "/cosmos.staking.v1beta1.MsgBeginRedelegate";

            const redelegateEvent = events.find((e: any) => e.type === "redelegate");

            const valAttr = redelegateEvent?.attributes.find(
              (e: any) => e.key === "amount"
            );
            val = (valAttr?.value || "0").replaceAll(/[^\d.]/g, "");

            const rewardEventForRedelegate = events.find(
              (e: any) => e.type === "withdraw_rewards"
            );
            const valArrReward = rewardEventForRedelegate?.attributes.filter(
              (e: any) => e.key === "amount"
            ) || [];

            const rewardValArr = valArrReward.map((item: any) => item.value);

            this.processDelegatorRewards(
              txData.fromAddress,
              rewardValArr,
              txData.timestamp
            );
            break;
          }

          case "/cosmos.staking.v1beta1.MsgUndelegate": {
            txData.type = TRANSACTION_TYPE.UNBOND_FUNDS;
            txData.toAddress = "/cosmos.staking.v1beta1.MsgUndelegate";

            const unbondEvent = events.find((e: any) => e.type === "unbond");
            const amountAttr = unbondEvent?.attributes.find(
              (e: any) => e.key === "amount"
            );
            val = (amountAttr?.value || "0").replaceAll(/[^\d.]/g, "");
            break;
          }

          case "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward": {
            txData.type = TRANSACTION_TYPE.DELEGATOR_REWARD;
            txData.toAddress =
              "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";

            const rewardEvent = events.find(
              (e: any) => e.type === "withdraw_rewards"
            );
            const amountAttr = rewardEvent?.attributes.find(
              (e: any) => e.key === "amount"
            );
            val = (amountAttr?.value || "0").replaceAll(/[^\d.]/g, "");

            this.processDelegatorRewards(
              txData.fromAddress,
              [val.toString()],
              txData.timestamp
            );
            break;
          }

          case "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission": {
            txData.type = TRANSACTION_TYPE.VALIDATOR_COMMISSION;
            txData.toAddress =
              "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission";

            const commissionEvent = events.find(
              (e: any) => e.type === "withdraw_commission"
            );
            const amountAttr = commissionEvent?.attributes.find(
              (e: any) => e.key === "amount"
            );
            val = (amountAttr?.value || "0").replace(/[^\d.]/g, "");
            break;
          }

          // Other events same as before
          case "/cosmos.gov.v1.MsgSubmitProposal":
          case "/cosmos.gov.v1beta1.MsgSubmitProposal":
            txData.type = TRANSACTION_TYPE.SUBMIT_PROPOSAL;
            txData.toAddress = "/cosmos.gov.v1.MsgSubmitProposal";
            break;

          case "/cosmos.gov.v1.MsgVote":
          case "/cosmos.gov.v1beta1.MsgVote":
            txData.type = TRANSACTION_TYPE.VOTING;
            txData.toAddress = "/cosmos.gov.v1.MsgVote";
            break;

          case "/cosmos.staking.v1beta1.MsgCreateValidator":
            txData.type = TRANSACTION_TYPE.CREATE_VALIDATOR;
            txData.toAddress = "/cosmos.staking.v1beta1.MsgCreateValidator";
            break;

          case "/cosmos.staking.v1beta1.MsgEditValidator":
            txData.type = TRANSACTION_TYPE.EDIT_VALIDATOR;
            txData.toAddress = "/cosmos.staking.v1beta1.MsgEditValidator";
            break;

          case "/cosmos.slashing.v1beta1.MsgUnjail":
            txData.type = TRANSACTION_TYPE.UNJAIL;
            txData.toAddress = "/cosmos.slashing.v1beta1.MsgUnjail";
            break;

          case "/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation": {
            txData.type = TRANSACTION_TYPE.CANCEL_UNBONDING_DELEGATION;
            txData.toAddress =
              "/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation";

            const filtered = events.filter(
              (e: any) => e.type === "cancel_unbonding_delegation"
            );
            const valArr = filtered[0]?.attributes.filter(
              (e: any) => e.key === "amount"
            );
            val = (valArr[0].value || "0").replace(/[^\d.]/g, "");
            break;
          }
          default:
            txData.type = "UNKNOWN";
            break;
        }

        let amount;

        if (val) {
          if (txData.type === TRANSACTION_TYPE.IBC_TRANSFER_RECEIVE) {
            amount = noExponent(Number(retrieveNumbers(val)) / 10 ** 6);
          } else {
            amount = noExponent(Number(retrieveNumbers(val)) / 10 ** 18);
          }
        }
        txData.value = amount || "0";

        if (emitTx)
          socketEventsHelper.emitMessage(
            SOCKET_EVENT.NATIVE_LATEST_TRANSACTIONS,
            txData
          );

        const saveRes = await dbHelper.saveTransactions(txData);
        return !saveRes.error;
      }
      throw new Error(
        (fetchRes?.errorStack as string) || "Error while fetching tx by hash"
      );
    } catch (error) {
      logger.error("Error processing missed transaction:", error);
      return false;
    }
  }

  /**
   * Process and save error Blocks
   * @param blockNumber of type string
   * @returns
   */
  public async processErrorBlock(blockNumber: string) {
    try {
      const url2 = `${environment.httpHost}/block?height=${blockNumber}`;
      const fetchRes = await fetchRequest(
        url2,
        FETCH_METHODS.GET,
        HEADERS.DEFAULT,
        null
      );

      if (!fetchRes.error) {
        const validatorOperatorAddress: string =
            (await this.chainRpcProvider.tendermintValAddressToValoperAddress(
              fetchRes?.data.result.block?.header?.proposer_address
            )) ?? "";

        const miner =
          this.chainRpcProvider.getDelegatorAddress(
            validatorOperatorAddress
          ) ?? "";
        const dataToSave: IBlock = {
          miner,
          validatorOperatorAddress,
          blocknumber: Number(blockNumber),
          blockhash: `0x${fetchRes?.data?.result?.block_id?.hash ?? ""}`,
          timestamp: fetchRes?.data.result.block?.header?.time ?? "",
          transactionCount: fetchRes?.data.result.block?.data?.txs?.length ?? 0,
        };

        for (
          let i = 0;
          i < fetchRes?.data?.result?.block?.data?.txs.length || 0;
          i++
        ) {
          const element = fetchRes?.data?.result?.block?.data?.txs[i];
          const hash = parseTx(element);
          rabbitmqService.inQueueData(QUEUE_NAME.DOWNTIME_TXS, hash.txHash);
        }

        await dbHelper.saveBlockData(dataToSave);
      } else {
        throw new Error(`Error while getting block by number ${blockNumber}`);
      }
      return true;
    } catch (error) {
      logger.error(`Error processing block ${blockNumber}:`, error);
      return false;
    }
  }

  /**
   * Process and save missed blocks
   * @param blockData of type string
   * @returns
   */
  public async processMissedBlocks(blockData: IBlock) {
    try {
      if (blockData?.blocknumber && blockData?.blocknumber) {
        const saveRes = await dbHelper.saveBlockData(blockData);
        return !saveRes.error;
      }
      throw new Error("Error while saving missed blocks");
    } catch (error) {
      return false;
    }
  }

  /**
   * calculate downtime blocks
   */
  public async downTimeBlocks() {
    try {
      const lastBlockSaved = await RedisService.getString(
        REDIS_KEY.LATEST_BLOCK
      );
      const blockRes = await fetchRequest(
        `${environment.httpHost}/block`,
        FETCH_METHODS.GET,
        HEADERS.DEFAULT,
        null
      );
      const newBlock = blockRes?.data?.result?.block?.header?.height;

      if (newBlock && lastBlockSaved) {
        const diff = Number(newBlock) - Number(lastBlockSaved);
        if (diff > 1) {
          for (
            let i = Number(lastBlockSaved) + 1;
            i <= Number(newBlock) + 1;
            i += 1
          ) {
            const currentBlockRes = await fetchRequest(
              `${environment.httpHost}/block`,
              FETCH_METHODS.GET,
              HEADERS.DEFAULT,
              null
            );
            const currentBlock =
              currentBlockRes?.data?.result?.block?.header?.height;

            if (i <= currentBlock) {
              RabbitMqService.inQueueData(
                QUEUE_NAME.DOWNTIME_BLOCK,
                i.toString()
              );
            }
            // saving missed block to downtime block Queue
          }
        }
      }
    } catch (error) {
      logger.error("Error processing downtime blocks:", error);
    }
  }

  public async processNullTimestamp(blockData: IBlock) {
    try {
      if (blockData?.blocknumber && blockData?.blocknumber) {
        const saveRes = await dbHelper.saveBlockData(blockData);
        return !saveRes.error;
      }
      throw new Error("Error while saving missed blocks");
    } catch (error) {
      return false;
    }
  }

  public async processLatestBlock(message: any): Promise<boolean> {
    try {
      // Early validation
      const blockData = message?.result?.data?.value?.block;
      if (!blockData?.header) {
        logger.warn("Invalid block data received");
        return false;
      }

      const { header, data: blockTxData } = blockData;
      const { height, time, proposer_address } = header;

      logger.info(`Processing block: ${height}`);

      // Parallel fetch of validator and miner addresses
      const validatorOperatorAddress =
        await this.chainRpcProvider.tendermintValAddressToValoperAddress(
          proposer_address
        );

      const miner = this.chainRpcProvider.getDelegatorAddress(
        validatorOperatorAddress
      );

      // Prepare block details
      const transactionCount = blockTxData?.txs?.length ?? 0;
      const blockDetails = {
        miner,
        validatorOperatorAddress,
        blocknumber: height,
        timestamp: time ?? "",
        transactionCount,
      };

      // Parallel execution of independent operations
      const [analytics, sessionData, blockHashResponse] =
        await Promise.allSettled([
          dbHelper.getAnalytics(),
          dbHelper.getNodeEarning(height),
          fetchRequest(
            `${environment.httpHost}/block?height=${height}`,
            FETCH_METHODS.GET,
            HEADERS.DEFAULT,
            null
          ),
        ]);

      // Emit transaction summary
      const totalTx = await prisma.transactions.count();
      SocketEventEmitter.emitMessage(SOCKET_EVENT.TX_SUMMARY, {
        tpb: transactionCount,
        totalTx,
      });

      // Emit analytics if successful
      if (analytics.status === "fulfilled") {
        SocketEventEmitter.emitMessage(SOCKET_EVENT.ANALYTICS, analytics.value);
      }

      // Save session data if available
      if (sessionData.status === "fulfilled" && sessionData.value) {
        logger.debug("Session data available for block", height);
      }

      // Process block hash and save block data
      if (
        blockHashResponse.status === "fulfilled" &&
        !blockHashResponse.value.error
      ) {
        const blockHash = `0x${blockHashResponse.value.data?.result?.block_id?.hash ?? ""}`;
        const blockDataToSave: IBlock = {
          ...blockDetails,
          blockhash: blockHash,
        };

        // Emit latest block event
        SocketEventEmitter.emitMessage(
          SOCKET_EVENT.NATIVE_LATEST_BLOCK,
          blockDataToSave
        );

        // Save block data
        const saveRes = await dbHelper.saveBlockData(blockDataToSave);

        if (saveRes?.error) {
          throw new Error(`Error saving block data: ${saveRes.error}`);
        }

        // Update Redis and validator counts in parallel
        await Promise.all([
          this.updateBlockCount(),
          dbHelper.upsertValidatorsCount(
            blockDataToSave.validatorOperatorAddress,
            blockDataToSave.miner
          ),
          RedisService.setString(REDIS_KEY.LATEST_BLOCK, height.toString()),
        ]);
      } else {
        const errorMsg =
          blockHashResponse.status === "rejected"
            ? blockHashResponse.reason
            : blockHashResponse.value?.errorStack;
        logger.error("Failed to fetch block hash:", errorMsg);
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Error processing block ${message?.result?.data?.value?.block?.header?.height}:`, error);
      return false;
    }
  }

  /**
   * Helper method to handle block count updates atomically
   */
  public async updateBlockCount(): Promise<void> {
    try {
      const blockCount = await RedisService.getString(
        REDIS_KEY.NATIVE_BLOCKS_COUNT
      );

      if (!blockCount) {
        // Initialize from database
        const dbCount = await prisma.blocks.count();
        await RedisService.setString(
          REDIS_KEY.NATIVE_BLOCKS_COUNT,
          dbCount.toString()
        );
      } else {
        // Increment existing count
        await RedisService.setString(
          REDIS_KEY.NATIVE_BLOCKS_COUNT,
          (Number(blockCount) + 1).toString()
        );
      }
    } catch (error) {
      logger.error("Failed to update block count in Redis:", error);
      // Non-critical error - don't throw
    }
  }
}
export default new ProcessHelper();
