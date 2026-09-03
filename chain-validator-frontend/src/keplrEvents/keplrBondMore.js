import { parseUnits } from "ethers";
import { simulateMsgs } from "../utils/simulateMsgs";
import { sendMsgs } from "../utils/sendMsgs";
import { MsgDelegate } from "../proto-types-gen/src/cosmos/staking/v1beta1/tx";
import { ChainConfig, CURRENCY, TOAST_MESSAGES, ROUTE_PATHS } from "../constants";
import { toast } from "../components/Common/Toast/Toast";

export const keplrBondMore = async (
  userAddress,
  stakeAmount,
  valoperAddress,
  setIsLoading,
  navigate
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
    const scaledAmount = parseUnits(stakeAmount.toString(), 18).toString();
    let res = "";

    const protoMsgs = {
      typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
      value: MsgDelegate.encode({
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
        window.keplr,
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
          toast.success(TOAST_MESSAGES.BOND_MORE_SUCCESS);
          navigate(ROUTE_PATHS.DASHBOARD);
          setIsLoading(false);
        }, 4000);
      } else {
        throw new Error("Transaction failed. Please try again.");
      }
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === "Request rejected") {
          toast.error(TOAST_MESSAGES.USER_REJECTED_TX);
        } else {
          toast.error(TOAST_MESSAGES.FAILED_TO_BOND_MORE);
          navigate(ROUTE_PATHS.DASHBOARD);
          setIsLoading(false);
          return;

        }
      }
      setIsLoading(false);
    }

  }
};
