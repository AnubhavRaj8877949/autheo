export const EVENT_OPERATION_PATH_MAPPINGS: Record<string, string> = {
  // --- delegate ---
  "delegate.delegator": "/cosmos.staking.v1beta1.MsgDelegate",

  // --- undelegate (unbond) ---
  "unbond.delegator": "/cosmos.staking.v1beta1.MsgUndelegate",

  // --- redelegate ---
  "redelegate.source_validator": "/cosmos.staking.v1beta1.MsgBeginRedelegate",

  // --- cancel unbond ---
  "cancel_unbonding_delegation.delegator":
    "/cosmos.staking.v1beta1.MsgCancelUnbondingDelegation",

  // --- rewards ---
  "withdraw_rewards.delegator":
    "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
};

export const UNIQUE_EVENTS_ORDERED = [
  "redelegate.source_validator", // redelegate
  "cancel_unbonding_delegation.delegator", // cancel unbond
  "delegate.delegator", // delegate
  "unbond.delegator", // undelegate
  "withdraw_rewards.delegator", // delegator reward
];
