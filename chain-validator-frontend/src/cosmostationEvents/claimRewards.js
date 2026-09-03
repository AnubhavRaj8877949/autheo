import { sendMsgs } from "../utils/sendMsgs";
import { simulateMsgs } from "../utils/simulateMsgs";
import { ChainConfig, TOAST_MESSAGES } from "../constants";
import { toast } from "../components/Common/Toast/Toast";
import {
    MsgWithdrawDelegatorReward,
    MsgWithdrawValidatorCommission
} from "../proto-types-gen/src/cosmos/distribution/v1beta1/tx";
import { api } from "../utils/api";

export const cosmostationClaimRewards = async (
    userAddress,
    valoperAddress,
    setIsLoading,
    handleClose
) => {
    if (window?.cosmostation?.providers?.keplr) {
        setIsLoading(true);
        try {
            const chainInfos = await window.cosmostation.providers.keplr.getChainInfosWithoutEndpoints();
            const feeObj = chainInfos.find((c) => c.chainId === ChainConfig.chainId);

            const gasPrice = feeObj?.feeCurrencies[0]?.gasPriceStep?.average
                ? Number(feeObj?.feeCurrencies[0]?.gasPriceStep?.average)
                : 25000000000000000;

            const key = await window.cosmostation.providers.keplr.getKey(ChainConfig.chainId);

            const rewardsUrl = `${ChainConfig.rest}/cosmos/distribution/v1beta1/delegators/${userAddress}/rewards`;
            const rewardsData = await api(rewardsUrl);

            const protoMsgs = [];

            // 1. Add Reward Withdrawal messages for all validators with rewards
            if (rewardsData?.rewards?.length) {
                for (const r of rewardsData.rewards) {
                    if (r.reward?.some(item => Number(item.amount) > 0)) {
                        protoMsgs.push({
                            typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
                            value: MsgWithdrawDelegatorReward.encode({
                                delegatorAddress: userAddress,
                                validatorAddress: r.validator_address,
                            }).finish(),
                        });
                    }
                }
            }

            // 2. Add Validator Commission Withdrawal if it's a validator
            if (valoperAddress) {
                protoMsgs.push({
                    typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission",
                    value: MsgWithdrawValidatorCommission.encode({
                        validatorAddress: valoperAddress,
                    }).finish(),
                });
            }

            if (protoMsgs.length === 0) {
                toast.success("All rewards already claimed.");
                setIsLoading(false);
                if (handleClose) handleClose();
                return;
            }

            const gasUsed = await simulateMsgs(
                window.cosmostation.providers.keplr,
                ChainConfig,
                key.bech32Address,
                protoMsgs,
                [{ denom: ChainConfig.currencies[0].coinMinimalDenom, amount: "0" }]
            );

            let res = "";
            if (gasUsed) {
                const gasLimit = Math.floor(gasUsed * 1.3);
                const feeAmount = Math.ceil(gasLimit * gasPrice).toString();

                res = await sendMsgs(
                    window.cosmostation.providers.keplr,
                    ChainConfig,
                    key.bech32Address,
                    protoMsgs,
                    {
                        amount: [
                            {
                                denom: ChainConfig.currencies[0].coinMinimalDenom,
                                amount: feeAmount,
                            },
                        ],
                        gas: Math.floor(gasUsed * 1.5).toString(),
                    }
                );
            }

            if (res) {
                setTimeout(() => {
                    toast.success(TOAST_MESSAGES.CLAIM_REWARDS_SUCCESS);
                    setIsLoading(false);
                    handleClose();
                }, 4000);
            } else {
                throw new Error("Transaction failed. Please try again.");
            }
        } catch (e) {
            if (e instanceof Error) {
                if (e.message === "Request rejected") {
                    toast.error(TOAST_MESSAGES.USER_REJECTED_TX);
                } else {
                    toast.error(TOAST_MESSAGES.FAILED_TO_CLAIM_REWARDS);
                }
                setIsLoading(false);
            }
        }
    }
};
