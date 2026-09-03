import { parseUnits } from "ethers";
import { sendMsgs } from "../utils/sendMsgs";
import { simulateMsgs } from "../utils/simulateMsgs";
import { ChainConfig, CURRENCY, MIN_BOND_AMOUNT, TOAST_MESSAGES, ROUTE_PATHS } from "../constants";
import { toast } from "../components/Common/Toast/Toast";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import { MsgCreateValidator } from "cosmjs-types/cosmos/staking/v1beta1/tx";
// import { MsgUndelegate } from "../proto-types-gen/src/cosmos/staking/v1beta1/tx";

export const keplrCreateValidator = async (
  primaryValues,
  secondaryValues,
  valoperAddress,
  userAddress,
  publicKey,
  setLoader,
  navigate
) => {
  const { name, details, identity, website, securityContact } = primaryValues;
  let res = "";

  if (window.keplr) {
    setLoader(true);

    const chainInfos = await window.keplr.getChainInfosWithoutEndpoints();

    const feeObj = chainInfos.find(
      (c) => c.chainId === ChainConfig.chainId
    );

    const gasPrice = feeObj?.feeCurrencies[0]?.gasPriceStep?.average
      ? Number(feeObj?.feeCurrencies[0]?.gasPriceStep?.average)
      : 25000000000000000;

    const key = await window.keplr?.getKey(ChainConfig.chainId);
    const decimals = ChainConfig.currencies[0].coinDecimals;
    const minimalDenom = ChainConfig.currencies[0].coinMinimalDenom;


    const scaledBondAmount = parseUnits(
      secondaryValues?.Bond_Amount.toString(),
      decimals
    ).toString();
    const commissionRate = parseUnits((secondaryValues?.commissionRate / 100).toString(), 18).toString();
    const maxRate = parseUnits(
      (secondaryValues?.maxRate / 100).toString(),

      decimals
    ).toString();
    const maxChangeRate = parseUnits(
      (secondaryValues?.maxChangeRate / 100).toString(),
      decimals
    ).toString();

    const pubkeyBytes = Uint8Array.from(
      PubKey.encode(
        PubKey.fromPartial({
          key: Buffer.from(publicKey, "base64"),
        })
      ).finish()
    );
    const protoMsgs = {
      typeUrl: "/cosmos.staking.v1beta1.MsgCreateValidator",
      value: MsgCreateValidator.encode({
        description: {
          moniker: name,
          identity: identity,
          website: website,
          securityContact: securityContact,
          details: details,
        },
        commission: {
          rate: commissionRate,
          maxRate: maxRate,
          maxChangeRate: maxChangeRate,
        },
        minSelfDelegation: MIN_BOND_AMOUNT,
        delegatorAddress: userAddress,
        validatorAddress: valoperAddress,
        pubkey: {
          typeUrl: "/cosmos.crypto.ed25519.PubKey",
          value: pubkeyBytes,
        },
        value: {
          denom: minimalDenom || (CURRENCY || '').toUpperCase(),
          amount: scaledBondAmount,
        },
      }).finish(),
    };

    try {
      const gasUsed = await simulateMsgs(
        window.keplr,
        ChainConfig,
        key.bech32Address,
        [protoMsgs],
        [{ denom: minimalDenom || (CURRENCY || '').toUpperCase(), amount: "100000000" }] //Dummy payload just to get estimate fee
      );

      if (gasUsed > 0) {
        const gasLimit = Math.floor(gasUsed * 1.3); //Buffer added
        const feeAmount = Math.ceil(gasLimit * gasPrice).toString();

        res = await sendMsgs(
          window.keplr,
          ChainConfig,
          key.bech32Address,
          [protoMsgs],
          {
            amount: [{ denom: minimalDenom || (CURRENCY || '').toUpperCase(), amount: feeAmount }],
            gas: Math.floor(gasUsed * 1.5).toString(),
          }
        );
      }
      if (res) {
        setTimeout(() => {
          toast.success(TOAST_MESSAGES.VALIDATOR_CREATED_SUCCESS);
          navigate(ROUTE_PATHS.DASHBOARD);
          setLoader(false);
        }, 4000);
      } else {
        throw new Error("Transaction failed. Please try again.");
      }
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === "Request rejected") {
          toast.error(TOAST_MESSAGES.USER_REJECTED_TX);
        } else {
          toast.error(TOAST_MESSAGES.FAILED_TO_CREATE_VALIDATOR);
        }
      }
      setLoader(false);
    }
  }
};
