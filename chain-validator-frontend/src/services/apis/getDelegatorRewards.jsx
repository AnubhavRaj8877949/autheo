import { ChainConfig, DENOM } from "../../constants";

/**
 * Fetches the outstanding (unclaimed) staking/delegation rewards for a wallet
 * from the chain distribution module. This is the same set of rewards that a
 * `MsgWithdrawDelegatorReward` claim withdraws, aggregated across every
 * validator the wallet delegates to.
 *
 * Returns the total reward for the native denom in whole tokens.
 */
const getDelegatorRewards = async (delegatorAddress) => {
  try {
    if (!delegatorAddress) {
      return { error: true, message: "Delegator address is required" };
    }
    const response = await fetch(
      `${ChainConfig.rest}/cosmos/distribution/v1beta1/delegators/${delegatorAddress}/rewards`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    const denom = DENOM || ChainConfig.currencies[0].coinMinimalDenom;
    const nativeTotal = result?.total?.find((c) => c.denom === denom);
    const amount = nativeTotal ? Number(nativeTotal.amount) / 10 ** 18 : 0;

    return { error: false, amount, data: result };
  } catch (error) {
    return { error: true, message: error.message, amount: 0 };
  }
};

export default getDelegatorRewards;
