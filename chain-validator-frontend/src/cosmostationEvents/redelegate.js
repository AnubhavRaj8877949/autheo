import { parseUnits } from "ethers";
import { sendMsgs } from "../utils/sendMsgs";
import { ChainConfig, CURRENCY, ROUTE_PATHS } from "../constants";
import { simulateMsgs } from "../utils/simulateMsgs";
import { toast } from "../components/Common/Toast/Toast";
import { MsgBeginRedelegate } from "../proto-types-gen/src/cosmos/staking/v1beta1/tx";

export const cosmostationRedelegate = async (
  userAddress,
  selectedAccount,
  valoperAddress,
  stakeAmount,
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
        typeUrl: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
        value: MsgBeginRedelegate.encode({
          delegatorAddress: userAddress,
          validatorSrcAddress: selectedAccount,
          validatorDstAddress: valoperAddress,

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
        const gasLimit = Math.floor(gasUsed * 1.3); //Buffer
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
        if (res) {
          setTimeout(() => {
            toast.success("Transaction successful");
            navigate(ROUTE_PATHS.DASHBOARD);
            setIsLoading(false);
          }, 4000);
        } else {
          throw new Error("Transaction failed. Please try again.");
        }
      }
    } catch (error) {
      setIsLoading(false);
      toast.error(error?.message ?? "Something went wrong!");
      if (error instanceof Error) {
        // console.log("Erorr while redelegate using cosmostation : ", error?.message);
      } else {
        // console.log("Erorr while redelegate using cosmostation : ", error);
      }
    }
  }
};
