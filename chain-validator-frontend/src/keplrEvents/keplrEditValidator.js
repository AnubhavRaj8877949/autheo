import { parseUnits } from "ethers";
import { sendMsgs } from "../utils/sendMsgs";
import { simulateMsgs } from "../utils/simulateMsgs";
import { ChainConfig, CURRENCY, getFriendlyErrorMessage, TOAST_MESSAGES, ROUTE_PATHS } from "../constants";
import { toast } from "../components/Common/Toast/Toast";
import { MsgEditValidator } from "cosmjs-types/cosmos/staking/v1beta1/tx";

export const keplrEditValidator = async (
  primaryValues,
  valoperAddress,
  setIsLoading,
  navigate,
  profileData,
  handleClose

) => {
  const { name, details, identity, website, securityContact, CommissionRate } = primaryValues;


  let res = "";
  let commissionToSend = undefined;
  if (
    CommissionRate !== undefined &&
    CommissionRate !== null &&
    CommissionRate !== "" &&
    CommissionRate.toString() !== profileData?.commissionRate?.toString()
  ) {
    commissionToSend = parseUnits(
      CommissionRate.toString(),
      18
    ).toString();
  }

  if (window?.keplr) {
    const chainInfos = await window.keplr?.getChainInfosWithoutEndpoints();

    const feeObj = chainInfos.find(
      (c) => c.chainId === ChainConfig.chainId
    );

    const gasPrice = feeObj?.feeCurrencies[0]?.gasPriceStep?.average
      ? Number(feeObj?.feeCurrencies[0]?.gasPriceStep?.average)
      : 25000000000000000;

    const key = await window.keplr?.getKey(ChainConfig.chainId);
    setIsLoading(true);

    const msg = MsgEditValidator.fromPartial({
      description: {
        moniker: name ?? "",
        identity: identity ?? "",
        website: website ?? "",
        securityContact: securityContact ?? "",
        details: details ?? "",
      },
      validatorAddress: valoperAddress ?? "",
    });
    if (commissionToSend) {
      msg.commissionRate = commissionToSend;
    }

    const protoMsgs = {
      typeUrl: "/cosmos.staking.v1beta1.MsgEditValidator",
      value: MsgEditValidator.encode(
        msg
      ).finish(),
    };
    try {
      const gasUsed = await simulateMsgs(
        window.keplr,
        ChainConfig,
        key.bech32Address,
        [protoMsgs],
        [{ denom: ChainConfig.currencies[0].coinMinimalDenom || (CURRENCY || '').toLowerCase(), amount: "0" }] //Dummy payload just to get estimate fee
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
            amount: [{ denom: ChainConfig.currencies[0].coinMinimalDenom || (CURRENCY || '').toLowerCase(), amount: feeAmount }],
            gas: Math.floor(gasUsed * 1.5).toString(),
          }
        );
      }
      if (res) {
        setTimeout(() => {
          toast.success(TOAST_MESSAGES.VALIDATOR_EDITED);
          navigate(ROUTE_PATHS.DASHBOARD);
          setIsLoading(false);
          handleClose();
          navigate(ROUTE_PATHS.DASHBOARD);
        }, 4000);
      }
    } catch (e) {
      setIsLoading(false);
      if (e instanceof Error) {
        if (e.message === "Request rejected") {
          // User rejected — just show toast and close, modal resets cleanly
          toast.error(TOAST_MESSAGES.USER_REJECTED_TX);
          handleClose();
        } else {
          const friendlyMessage = getFriendlyErrorMessage(e.message);
          toast.error(friendlyMessage || TOAST_MESSAGES.FAILED_TO_EDIT_VALIDATOR);
          handleClose();
          navigate(ROUTE_PATHS.DASHBOARD);
        }
      } else {
        handleClose();
      }
    }
  }
};


