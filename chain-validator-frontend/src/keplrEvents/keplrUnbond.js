import { parseUnits } from "ethers";
import { sendMsgs } from "../utils/sendMsgs";
import { simulateMsgs } from "../utils/simulateMsgs";
import { ChainConfig, CURRENCY, TOAST_MESSAGES, ROUTE_PATHS } from "../constants";
import { toast } from "../components/Common/Toast/Toast";
import { MsgUndelegate } from "../proto-types-gen/src/cosmos/staking/v1beta1/tx";

export const keplrUnbond = async (
  userAddress,
  unBoundAmt,
  valoperAddress,
  setIsLoading,
  navigate,
  actionType = "unbond"
) => {

  if (window?.keplr) {
    setIsLoading(true);
    const chainInfos = await window.keplr.getChainInfosWithoutEndpoints();

    const feeObj = chainInfos.find(
      (c) => c.chainId === ChainConfig.chainId
    );

    const gasPrice = feeObj?.feeCurrencies[0]?.gasPriceStep?.average
      ? Number(feeObj?.feeCurrencies[0]?.gasPriceStep?.average)
      : 25000000000000000;

    const key = await window.keplr?.getKey(ChainConfig.chainId);
    // const fixedVal = unBoundAmt?.toFixed(18);
    const fixedVal = Number(unBoundAmt).toFixed(18);
    const scaledAmount = parseUnits(fixedVal, 18).toString();
    let res = "";
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

    try {
      const gasUsed = await simulateMsgs(
        window?.keplr,
        ChainConfig,
        key.bech32Address,
        [protoMsgs],
        [{ denom: ChainConfig.currencies[0].coinMinimalDenom || (CURRENCY || '').toLowerCase(), amount: "0" }] //Dummy payload just to get estimate fee
      );
      if (gasUsed) {
        const gasLimit = Math.floor(gasUsed * 1.3); //Buffer added
        const feeAmount = Math.ceil(gasLimit * gasPrice).toString();

        res = await sendMsgs(
          window.keplr,
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
          if (actionType === "stopvalidator") {
            toast.success(TOAST_MESSAGES.STOP_VALIDATOR_SUCCESS);
          } else {
            toast.success(TOAST_MESSAGES.UNBOND_SUCCESS);
          }
          // toast.success(TOAST_MESSAGES.UNBOND_SUCCESS);
          navigate(ROUTE_PATHS.DASHBOARD);
          setIsLoading(false);
        }, 4000);
      } else {
        throw new Error("Transaction failed. Please try again.");
      }
    } catch (e) {

      if (e instanceof Error) {

        const errorMessageMap = {
          stopvalidator: TOAST_MESSAGES.FAILED_TO_STOP_VALIDATOR,
          unbond: TOAST_MESSAGES.FAILED_TO_UNBOND,
        };

        if (e.message === "Request rejected") {
          toast.error(TOAST_MESSAGES.USER_REJECTED_TX);
        } else if (errorMessageMap[actionType]) {
          toast.error(errorMessageMap[actionType]);
          navigate(ROUTE_PATHS.DASHBOARD);
        }

        setIsLoading(false);
      }
    }

  }
};
