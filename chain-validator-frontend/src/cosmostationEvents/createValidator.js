import { parseUnits } from "ethers";
import { sendMsgs } from "../utils/sendMsgs";
import { ChainConfig, CURRENCY, MIN_BOND_AMOUNT, TOAST_MESSAGES, getFriendlyErrorMessage, ROUTE_PATHS } from "../constants";
import { simulateMsgs } from "../utils/simulateMsgs";
import { toast } from "../components/Common/Toast/Toast";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import { MsgCreateValidator } from "cosmjs-types/cosmos/staking/v1beta1/tx";

export const cosmostationCreateValidator = async (
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

  if (window?.cosmostation) {
    setLoader(true);

    const gasPrice = 0.025;

    const key = await window?.cosmostation?.providers?.keplr?.getKey(
      ChainConfig.chainId
    );

    const scaledBondAmount = parseUnits(
      secondaryValues?.Bond_Amount.toString(),
      18
    ).toString();
    const commissionRate = parseUnits(
      (secondaryValues?.commissionRate / 100).toString(),
      18
    ).toString();
    const maxRate = parseUnits(
      (secondaryValues?.maxRate / 100).toString(),
      18
    ).toString();
    const maxChangeRate = parseUnits(
      (secondaryValues?.maxChangeRate / 100).toString(),
      18
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
          denom: ChainConfig.currencies[0].coinMinimalDenom || (CURRENCY || '').toLowerCase(),
          amount: scaledBondAmount,
        },
      }).finish(),
    };

    try {
      const gasUsed = await simulateMsgs(
        window?.cosmostation?.providers?.keplr,
        ChainConfig,
        key.bech32Address,
        [protoMsgs],
        [{ denom: ChainConfig.currencies[0].coinMinimalDenom || (CURRENCY || '').toLowerCase(), amount: "0" }] //Dummy payload just to get estimate fee
      );

      if (gasUsed > 0) {
        const gasLimit = Math.floor(gasUsed * 1.3); //Buffer added
        const feeAmount = Math.ceil(gasLimit * gasPrice).toString();

        res = await sendMsgs(
          window?.cosmostation?.providers?.keplr,
          ChainConfig,
          key.bech32Address,
          [protoMsgs],
          {
            amount: [{ denom: ChainConfig.currencies[0].coinMinimalDenom || (CURRENCY || '').toLowerCase(), amount: feeAmount }],
            gas: Math.floor(gasUsed * 1.5).toString(),
          }
        );
      }
      if (res) {
        setTimeout(() => {
          toast.success(TOAST_MESSAGES.VALIDATOR_CREATED_SUCCESS);
          setLoader(false);
          navigate(ROUTE_PATHS.DASHBOARD);
        }, 4000);
      } else {
        throw new Error("Transaction failed. Please try again.");
      }
    } catch (e) {
      setLoader(false);
      if (e instanceof Error) {
        if (e.message === "Request rejected") {
          toast.error(TOAST_MESSAGES.USER_REJECTED_TX);
        } else {
          const friendlyMessage = getFriendlyErrorMessage(e.message);
          toast.error(friendlyMessage || TOAST_MESSAGES.FAILED_TO_CREATE_VALIDATOR);
          navigate(ROUTE_PATHS.DASHBOARD);
        }
      } else {
        toast.error(TOAST_MESSAGES.FAILED_TO_CREATE_VALIDATOR);
      }
    }
  }
};
