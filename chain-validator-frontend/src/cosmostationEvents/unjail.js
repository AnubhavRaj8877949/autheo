import { sendMsgs } from "../utils/sendMsgs";
import { ChainConfig, CURRENCY, TOAST_MESSAGES, getFriendlyErrorMessage, ROUTE_PATHS } from "../constants";
import { simulateMsgs } from "../utils/simulateMsgs";
import { toast } from "../components/Common/Toast/Toast";
import { MsgUnjail } from "cosmjs-types/cosmos/slashing/v1beta1/tx";

export const cosmostationUnjail = async (valoperAddress, navigate, setIsLoading) => {
  if (window?.cosmostation) {
    setIsLoading(true);

    const gasPrice = 0.025;

    const key = await window?.cosmostation?.providers?.keplr?.getKey(
      ChainConfig.chainId
    );

    let res = "";
    const protoMsgs = {
      typeUrl: "/cosmos.slashing.v1beta1.MsgUnjail",
      value: MsgUnjail.encode({
        validatorAddr: valoperAddress,
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
          toast.success(TOAST_MESSAGES.UNJAIL_SUCCESS);
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
          toast.error(friendlyMessage || TOAST_MESSAGES.FAILED_TO_UNJAIL);
          navigate(ROUTE_PATHS.DASHBOARD);
        }
      } else {
        toast.error(TOAST_MESSAGES.FAILED_TO_UNJAIL);
      }
    }
  }
};
