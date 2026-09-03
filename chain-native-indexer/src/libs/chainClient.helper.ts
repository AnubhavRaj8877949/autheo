import { SigningCosmWasmClient } from "@cosmjss/cosmwasm-stargate";
import { fromBase64 } from "@cosmjss/encoding";
import { anyToSinglePubkey } from "@cosmjss/proto-signing";
import {
  createProtobufRpcClient,
  QueryClient,
  setupStakingExtension,
} from "@cosmjss/stargate";
import { pubkeyToAddress, Tendermint37Client } from "@cosmjss/tendermint-rpc";
import { assert } from "@cosmjss/utils";
import { bech32 } from "bech32";
import {
  QueryClientImpl,
} from "cosmjs-types/cosmwasm/wasm/v1/query";
import { exp } from "./utility/common";
import logger from "./logger";
import dbHelper from "./db.helper";

export class ChainRpcClient {
  private readonly rpcUrl = environment.httpHost;

  private static instance: ChainRpcClient;

  private tendermintClient!: Tendermint37Client;

  private readonly prefix = environment.addressPrefix;


  public static getInstance(): ChainRpcClient {
    if (!ChainRpcClient.instance) {
      ChainRpcClient.instance = new ChainRpcClient();
    }
    return ChainRpcClient.instance;
  }

  public async initializeClient() {
    try {
      this.tendermintClient = await Tendermint37Client.connect(this.rpcUrl);
      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  private async  isClientConnected (): Promise<boolean> {
    if (!this.tendermintClient) {
      return this.initializeClient();
    }
    return true;
  }

  public async tendermintValAddressToValoperAddress(value: string) {
    try {
      if (!(await this.isClientConnected())) {
        return "";
      }
      const queryClient = QueryClient.withExtensions(
        this.tendermintClient,
        setupStakingExtension,
      );
      const tendermintToOperator = new Map<string, string>();
      let nextKey: Uint8Array | undefined;
      do {
        const res = await queryClient.staking.validators(
          "BOND_STATUS_BONDED",
          nextKey,
        );
        res.validators.forEach((r) => {
          assert(r.consensusPubkey);
          const pubkey = anyToSinglePubkey(r.consensusPubkey);
          const address = pubkeyToAddress("ed25519", fromBase64(pubkey.value));
          tendermintToOperator.set(address, r.operatorAddress);
        });
        nextKey = res.pagination?.nextKey;
      } while (nextKey?.length);
      const valoperAddress: string = <string>tendermintToOperator.get(value);
      return valoperAddress;
    } catch (err: any) {
      logger.error("Error in tendermintValAddressToValoperAddress:", err?.message || err);
      return "";
    }
  }

  public getDelegatorAddress(operatorAddr: string) {
    try {
      const address = bech32.decode(operatorAddr);
      const delegatorAddress = bech32.encode(this.prefix, address.words);
      return delegatorAddress;
    } catch (err: any) {
      logger.error("Error in getDelegatorAddress:", err.message || err);
      return "";
    }
  }

  public async getContractName(contractAddress: string) {
    try {
      if (!(await this.isClientConnected())) {
        return null;
      }
      const client = await SigningCosmWasmClient.create(this.tendermintClient);
      const contract = await client.getContract(contractAddress);
      return contract.label;
    } catch (err) {
      logger.error(err);
      return null;
    }
  }

  public async getTokenInfo(contractAddress: string) {
    try {
      if (!(await this.isClientConnected())) {
        return null;
      }
      const client = await SigningCosmWasmClient.create(this.tendermintClient);
      const tokenDetails = await client.queryContractSmart(contractAddress, {
        token_info: {},
      });
      return tokenDetails;
    } catch (err) {
      logger.error(err);
      return null;
    }
  }

  public async getAccountInfo(contractAddress: string) {
    try {
      if (!(await this.isClientConnected())) {
        return null;
      }
      const client = await SigningCosmWasmClient.create(this.tendermintClient);
      const accountDetails = await client.queryContractSmart(contractAddress, {
        all_accounts: {},
      });
      return accountDetails;
    } catch (err) {
      logger.error(err);
      return null;
    }
  }

  public async getTokenBalances(
    contractAddress: string,
    addressesObj: { accounts: string[] },
  ) {
    try {
      if (!(await this.isClientConnected())) {
        return null;
      }
      const tokenBalances = [];
      const addresses = addressesObj.accounts;
      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        const client = await SigningCosmWasmClient.create(
          this.tendermintClient,
        );
        const tokenBalance = await client.queryContractSmart(contractAddress, {
          balance: { address },
        });

        await dbHelper.upsertHolder({
          address,
          contractAddress,
          tokenBalance: exp(`${tokenBalance.balance}`),
        });
        tokenBalances.push(tokenBalance.balance);
      }
      return tokenBalances;
    } catch (err) {
      logger.error(err);
      return null;
    }
  }

  public async getContractType(contractAddress: string): Promise<any> {
    try {
      if (!(await this.isClientConnected())) {
        return null;
      }
      const client = await SigningCosmWasmClient.create(this.tendermintClient);
      const queryClient = new QueryClient(this.tendermintClient);
      const rpcClient = createProtobufRpcClient(queryClient);
      const QueryService = new QueryClientImpl(rpcClient);
      const contractStateResult = await QueryService.AllContractState({
        address: contractAddress,
      });
      const contractType = await client.queryContractRaw(
        contractAddress,
        contractStateResult.models[1].key,
      );
      if (!contractType) {
        logger.error("Error: contract type data is not available");
        return ""; // Return early if contract type data is not available
      }
      const uint8Array = new Uint8Array(contractType);
    
      const binaryString = String.fromCodePoint(...uint8Array);

      const base64EncodedString = btoa(binaryString);

      const decodedString = atob(base64EncodedString);
      const jsonData = JSON.parse(decodedString);
      return jsonData.contract;
    } catch (error) {
      logger.error("Error parsing contract type JSON:", error);
      return null;
    }
  }
}
