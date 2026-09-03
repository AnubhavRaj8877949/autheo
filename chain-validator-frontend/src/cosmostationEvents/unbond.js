import { parseUnits } from "ethers";
import { sendMsgs } from "../utils/sendMsgs";
import { ChainConfig, CURRENCY, TOAST_MESSAGES, getFriendlyErrorMessage, ROUTE_PATHS } from "../constants";
import { simulateMsgs } from "../utils/simulateMsgs";
import { toast } from "../components/Common/Toast/Toast";
import { MsgUndelegate } from "../proto-types-gen/src/cosmos/staking/v1beta1/tx";

export const cosmostationUnbond = async (
  userAddress,
  stakeAmount,
  valoperAddress,
  setIsLoading,
  navigate
) => {
  if (window?.cosmostation) {
    try {
      const gasPrice = 0.025;

      const key = await window?.cosmostation?.providers?.keplr?.getKey(
        ChainConfig.chainId
      );
      const scaledAmount = parseUnits(stakeAmount.toString(), 18).toString();

      const protoMsgs = {
        typeUrl: "/cosmos.staking.v1beta1.MsgUndelegate",
        value: MsgUndelegate.encode({
          delegatorAddress: userAddress,
          validatorAddress: valoperAddress,
          amount: {
            denom: ChainConfig.currencies[0].coinMinimalDenom || (CURRENCY || '').toLowerCase(),
            amount: scaledAmount,
          },
        }).finish(),
      };

      const gasUsed = await simulateMsgs(
        window?.cosmostation?.providers?.keplr,
        ChainConfig,
        key.bech32Address,
        [protoMsgs],
        [{ denom: ChainConfig.currencies[0].coinMinimalDenom || (CURRENCY || '').toLowerCase(), amount: "0" }] //Dummy payload just to get estimate fee
      );

      let res = "";
      if (gasUsed) {
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
          toast.success(TOAST_MESSAGES.UNBOND_SUCCESS);
          setIsLoading(false);
          navigate(ROUTE_PATHS.DASHBOARD);
        }, 4000);
      } else {
        throw new Error("Transaction failed. Please try again.");
      }
    } catch (e) {
      setIsLoading(false);
      if (e instanceof Error) {
        if (e.message === "Request rejected") {
          toast.error(TOAST_MESSAGES.USER_REJECTED_TX);
        } else {
          const friendlyMessage = getFriendlyErrorMessage(e.message);
          toast.error(friendlyMessage || TOAST_MESSAGES.FAILED_TO_UNBOND);
          navigate(ROUTE_PATHS.DASHBOARD);
        }
      } else {
        toast.error(TOAST_MESSAGES.FAILED_TO_UNBOND);
      }
    }
  }
};
