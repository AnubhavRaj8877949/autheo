import Big from "big.js";
import chainConfig from "../Chain/config.json";
import genesisFactoryAbi from "../Chain/abis/genesis-factory.json";

export const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

export const EXCEPTION_CODES = {
  VESTING_INITIATION_FAILED: "VESTING_INITIATION_FAILED",
  VESTING_INITIATION_CHECKING_FAILED: "VESTING_INITIATION_CHECKING_FAILED",

  // Network & server
  NETWORK_ERROR: "NETWORK_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  NOT_FOUND: "NOT_FOUND",
  // Data & validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  INVALID_DATA: "INVALID_DATA",
  // Chain
  CONTRACT_REVERTED: "CONTRACT_REVERTED",
  GAS_ESTIMATION_FAILED: "GAS_ESTIMATION_FAILED",
  NONCE_MISMATCH: "NONCE_MISMATCH",
  UNSUPPORTED_METHOD: "UNSUPPORTED_METHOD",
  INSUFFICIENT_FEE: "INSUFFICIENT_FEE",
  // Fallback
  UNKNOWN_EXCEPTION: "UNKNOWN_EXCEPTION",
  // GraphQL
  GRAPHQL_ERROR: "GRAPHQL_ERROR",
  // HTTP
  CANCELLED_REQUEST: "CANCELLED_REQUEST",
};

export const EXCEPTION_MESSAGES = {
  DELEGATION_FAILED: "Delegation failed, please try again.",
  REDELEGATION_FAILED: "Redelegation failed, please try again.",
  WITHDRAW_REWARDS_FAILED: "Withdraw rewards failed, please try again.",
  UNBONDING_FAILED: "Unbonding failed, please try again.",
  UNBONDING_CANCEL_FAILED: "Unbonding cancellation failed, please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Invalid input provided. Please check your data and try again.",
  AUTHORIZATION_ERROR: "You are not authorized to perform this action.",
  INVALID_DATA: "Invalid data received. Please try again.",
  CONTRACT_REVERTED: "The transaction was reverted by the contract.",
  INSUFFICIENT_FEE: "Insufficient fee to complete the transaction.",
  GAS_ESTIMATION_FAILED: "Could not estimate gas. The transaction may fail.",
  NONCE_MISMATCH: "Transaction nonce mismatch. Please reset your wallet activity and retry.",
  UNSUPPORTED_METHOD: "This operation is not supported by your wallet.",
  UNKNOWN_EXCEPTION: "Something went wrong, please try again.",
  CANCELLED_REQUEST: "The request was cancelled.",
};

/**
 * User action codes.
 * Caused by a direct user decision or wallet state the user controls.
 */
export const USER_ACTION_CODES = {
  USER_REJECTED: "USER_REJECTED",
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  CHAIN_MISMATCH: "CHAIN_MISMATCH",
  WALLET_DISCONNECTED: "WALLET_DISCONNECTED",
  UNAUTHORIZED: "UNAUTHORIZED",
  TRANSACTION_UNDERPRICED: "TRANSACTION_UNDERPRICED",
};

export const USER_ACTION_MESSAGES = {
  USER_REJECTED: "Transaction declined.",
  INSUFFICIENT_FUNDS: "Insufficient funds to complete the transaction.",
  CHAIN_MISMATCH: "Wrong network selected. Please switch to the correct chain.",
  WALLET_DISCONNECTED: "Wallet is disconnected. Please reconnect and try again.",
  UNAUTHORIZED: "Wallet is not authorized. Please reconnect and try again.",
  TRANSACTION_UNDERPRICED: "Transaction gas price is too low. Please increase the gas and retry.",
};

export const DEFAULT_FLAGS_ELECTED = {
  withController: true,
  withExposure: true,
  withPrefs: true,
};

export const DEFAULT_FLAGS_WAITING = {
  withController: true,
  withPrefs: true,
};

export const LOADING_STATES = {
  INIT: "Init",
  FETCHING: "Fetching",
  SUCCESS: "Success",
  ERROR: "Error",
};

/*PAGE LIMIT*/
export const PAGE_LIMIT = 10;
export const DEFAULT_PAGE = 1;
export const DEFAULT_TABLE_LIMIT = 10;

/*GRAPHQL MESSAGES*/
export const GRAPHQL_MESSAGES = {
  ENDPOINT_NOT_DEFINED: "GraphQL endpoint is not defined. Please set it via dependency injection or environment variables.",
  REQUEST_ERROR: "GraphQL Request Error:",
};

/*BASE URL*/
export const BASE_URL = {
  EXPLORER_API_URL: process.env.REACT_APP_EXPLORER_API_URL,
  EXPLORER_NAVIGATION_URL: process.env.REACT_APP_EXPLORER_NAVIGATION_URL,
  VALIDATOR_API: process.env.REACT_APP_VALIDATOR_API,
};

export const CURRENCY = process.env.REACT_APP_CURRENCY;
export const APP_NAME = process.env.REACT_APP_NAME;
export const DENOM = process.env.REACT_APP_DENOM;
export const DECIMAL = process.env.REACT_APP_DECIMAL;
export const MIN_BOND_AMOUNT = process.env.REACT_APP_MIN_STAKE_AMOUNT || 100;
export const FEE = process.env.REACT_APP_FEE_DEDUCTION;
export const JAIL_TIME = process.env.REACT_APP_JAIL_TIME;
/**
 * Unbonding period, as a human-readable string (e.g. "21 days").
 *
 * Kept as a full string rather than a number because the unit is part of the
 * value: this chain unbonds over 21 days (staking params `unbonding_time` =
 * 1814400s), and the copy previously hardcoded "minutes".
 */
export const UNBONDING_PERIOD =
  process.env.REACT_APP_UNBONDING_PERIOD || "21 days";
export const USER_GUIDE_URL = process.env.REACT_APP_USER_GUIDE_URL;
export const PREFIX = process.env.REACT_APP_ADDRESS_PREFIX ?? "";
export const EVM_RPC = process.env.REACT_APP_EVM_RPC;
export const TENDERMINT_RPC = process.env.REACT_APP_TENDERMINT_URL;
export const EXPLORER = process.env.REACT_APP_EXPLORER_NAVIGATION_URL;
export const CHAIN_ID = process.env.REACT_APP_CHAIN_ID;
export const APP_DESCRIPTION = process.env.REACT_APP_APP_DESCRIPTION;
export const WEBSITE = process.env.REACT_APP_OFFICIAL_WEB_URL;
export const MAIN_ICON = process.env.REACT_APP_MAIN_ICON;
export const GENESIS_FACTORY_ADDRESS = process.env.REACT_APP_GENESIS_FACTORY_ADDRESS;
export const TESTNET_EXPLORER_URL = process.env.REACT_APP_EXPLORER_TESTNET;
export const MAINNET_EXPLORER_URL = process.env.REACT_APP_EXPLORER_MAINNET;
export const EVM_EXPLORER = process.env.REACT_APP_EVM_EXPLORER;
export const CHAIN_REST_API_URL = process.env.REACT_APP_CHAIN_REST_API_URL;


export const GENESIS_FACTORY_ABI = genesisFactoryAbi;

export const GENESIS_FACTORY_METHODS = {
  initiateVesting: "addValidatorVesting",
  getTheVestingContractAddress: "validatorVestingAddress",
  checkInitiationStatus: "isValidatorVestingAddress"
};

/*API Paths*/
export const API_PATHS = {
  ALL_VALIDATOR_LIST: "validator/info",
  GET_LOGIN_DATA: "validator/{{userAddress}}",
  GET_ALL_BLOCKS: "get-all-blocks?pageNo={{pageNo}}&limit={{limit}}",
  ADD_NAME: "validator/add-name",
  TOTAL_REWARD: "get-recent-total-reward-by-address/{{userAddress}}",
  REWARD: "get-reward-by-address/{{userAddress}}",
  RECENT_ACTION: "get-transaction-by-address?address={{userAddress}}",
};

export const bondedTableHeader = [
  {
    heading: "Bonded",
    content:
      "Bonded funds give the right to rewards and are exposed to slashing",
  },
  {
    heading: "Unbonded",
    content: `Funds unbonded will be available for withdrawal after the completion of the Unbonding Period which is ${UNBONDING_PERIOD}`,
  },
  {
    heading: "Unclaimed Reward",
    content: "Total rewards earned but not yet claimed.",
  },
  {
    heading: "Actions",
    content: "",
  },
];

export const stopMenuOptions = [
  {
    label: "Bond more funds",
    path: "/account/funds/bond",
    style: "btn-blue",
  },
  {
    label: "Unbond funds",
    path: "/account/funds/unbond",
    style: "btn-yellow",
  },
  {
    label: "Stop validating",
    path: "/account/funds/stopvalidator",
    style: "btn-red",
  },
];
export const reValidateMenuOptions = [
  {
    label: "Bond more funds",
    path: "/account/funds/bond",
    style: "btn-blue",
  },
  {
    label: "Re-Validate",
    path: "/account/funds/revalidation",
    style: "btn-red",
  },
];

export const errors = {
  LOW_BALANCE: "Insufficient funds",
};

export const ErrorMsgs = {
  zero: "Unbond amount must be greater than zero",
  insufficient: "Insufficient Bonded Amount for Unbond",
  msg: `Funds unbonded will be available for withdrawal after the completion of the Unbonding Period which is ${UNBONDING_PERIOD}`,
};

export const createValidatorInput = [
  {
    id: 1,
    label: "Validator Name",
    tooltip: "This is the public name that will be shown to delegators in the validator list.",
    name: "name",
    required: true
  },
  {
    id: 2,
    label: " Validator Description",
    tooltip:
      "Provide a short description about your validator, infrastructure, reliability, or mission.",
    name: "details",
    required: false,
  },
  {
    id: 3,
    label: "Official Website",
    tooltip:
      "Add your official website link so delegators can learn more about your validator.",
    name: "website",
    required: false,
  },
  {
    id: 4,
    label: "Validator Identity",
    name: "identity",
    tooltip:
      "Provide a public identity reference (such as an organization name, uPort, or Keybase profile) to help delegators verify your authenticity and build trust.",
    required: false,
  },
  {
    id: 5,
    label: "Security Contact",
    name: "securityContact",
    tooltip:
      "This security contact details will be used for security-related communication regarding your validator node.",
    required: false,
  },
];

export const editValidatorInput = [
  {
    id: 1,
    label: "Validator Name",
    name: "name",
    tooltip:
      "This is the public name that will be shown to delegators in the validator list.",
  },
  {
    id: 2,
    label: "Validator Description",
    tooltip:
      "Provide a short description about your validator, infrastructure, reliability, or mission.",
    name: "details",
    required: false,
  },
  {
    id: 3,
    label: "Official Website",
    name: "website",
    tooltip:
      "Add your official website link so delegators can learn more about your validator.",
  },
  {
    id: 4,
    label: "Validator Identity",
    name: "identity",
    tooltip:
      "Provide a public identity reference (uPort, or Keybase profile) to help delegators verify your authenticity and build trust.",
  },
  {
    id: 5,
    label: "Security Contact",
    name: "securityContact",
    tooltip:
      "This security contact details will be used for security-related communication regarding your validator node.",
  },
];

export const commissionInputValues = [
  {
    id: 2,
    label: "Initial Commission %",
    name: "commissionRate",
    helperText: "Initial rate should be between 5% and 100%",
    placeholder: "Enter starting commission percentage",
    tooltip:
      "This is the commission rate that will apply when your validator becomes active.",
    required: true,
  },
  {
    id: 1,
    label: "Max Commission  %",
    name: "maxRate",
    helperText: "Max rate should be between Initial rate and 100%",
    placeholder: "Enter maximum commission percentage",
    tooltip:
      "This is the highest commission rate you will ever charge delegators..",
    required: true,
  },

  {
    id: 3,
    label: "Maximum Commission Change (%)",
    name: "maxChangeRate",
    helperText: "Max change rate should be ≤ (Max Rate - Initial Rate)",
    placeholder: "Enter maximum allowed change percentage",
    tooltip:
      "This defines how much you are allowed to increase  your commission per day.",
    required: true,
  },
];

export const splitAddress = (
  data = "",
  startLen: number | undefined,
  endLen: number,
) => {
  return `${data?.substring(0, startLen)}.....${data.substring(
    data?.length - endLen,
    data?.length,
  )}`;
};

export const msg = {
  tooltip: {
    marketCap: " Total value of all the coins issued",
    totalSupply: "Total coins issued by the system",
  },
};

export function toPrecisionMultiply(num: any) {
  let number = num;
  const result = Big(number).mul(Big("10").pow(18));
  const respectedRes = result.mul(1).toFixed();
  return respectedRes;
}

export const ChainConfig = {
  ...chainConfig,
  rpc: TENDERMINT_RPC || chainConfig.rpc,
  rest: CHAIN_REST_API_URL || chainConfig.rest,
};

export const FOOTER_LINKS = {
  PRIVACY_POLICY: process.env.REACT_APP_PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE: process.env.REACT_APP_TERMS_OF_SERVICE_URL,
  VALIDATOR_APP: process.env.REACT_APP_VALIDATOR_APP_URL,
  DELEGATOR_APP: process.env.REACT_APP_DELEGATOR_APP_URL,
  IDE: process.env.REACT_APP_IDE_URL,
  OFFICIAL_WEB: process.env.REACT_APP_OFFICIAL_WEB_URL,
  NETWORK_DOCS: process.env.REACT_APP_NETWORK_DOCS_URL,
  DOCS: process.env.REACT_APP_DOCS_URL,
  GITHUB: process.env.REACT_APP_GITHUB_URL,
};

export const SOCIAL_LINKS = {
  TWITTER: process.env.REACT_APP_SOCIAL_TWITTER,
  INSTAGRAM: process.env.REACT_APP_SOCIAL_INSTAGRAM,
  TIKTOK: process.env.REACT_APP_SOCIAL_TIKTOK,
  TELEGRAM: process.env.REACT_APP_SOCIAL_TELEGRAM,
  DISCORD: process.env.REACT_APP_SOCIAL_DISCORD,
  YOUTUBE: process.env.REACT_APP_SOCIAL_YOUTUBE,
  CMC: process.env.REACT_APP_SOCIAL_CMC,
  LINKEDIN:process.env.REACT_APP_SOCIAL_LINKEDIN
};

export const WALLET_TYPE = {
  KEPLR: "keplr",
  COSMOSTATION: "cosmostation",
  NO_WALLET: "noWallet",
};

export const ROUTE_PATHS = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  BLOCKS: "/blocks",
  VALIDATORS: "/validators",
  ACCOUNT: "/account",
  ACCOUNT_PROFILE: "/account/profile",
  ACCOUNT_FUNDS: "/account/funds",
  ACCOUNT_BECOME_VALIDATOR: "/account/become-a-validator",
  ACCOUNT_FUNDS_BOND: "/account/funds/bond",
  ACCOUNT_FUNDS_UNBOND: "/account/funds/unbond",
  ACCOUNT_FUNDS_STOP_VALIDATOR: "/account/funds/stopvalidator",
  ACCOUNT_FUNDS_REVALIDATION: "/account/funds/revalidation",
  WALLET_ACTIVITIES: "/wallet-activities",
  GENESIS_REWARD_PROGRAM: "/genesis-reward-program",
  TX_DETAILS: "/tx/",
};

export const VALIDATOR_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DEACTIVATING: "deactivating",
};

export const TRANSACTION_STATUS = {
  SUCCESS: "SUCCESS",
  SUCCESS_LOWER: "success",
  PROCESSING: "PROCESSING",
  PROCESSING_LOWER: "processing",
  PENDING: "PENDING",
  PENDING_LOWER: "pending",
  FAILED: "FAILED",
  FAILED_LOWER: "failed",
};

export const NETWORK_TYPE = {
  TESTNET: "testnet",
  MAINNET: "mainnet",
};

export const DECIMALS_MULTIPLIER = 10 ** 18;

export const TOAST_MESSAGES = {
  VALIDATOR_CREATED_SUCCESS: "Validator created ",
  VALIDATOR_EDITED: "Validator details updated ",
  VALIDATOR_STOPPED: "Validator stopped ",
  VALIDATOR_REVALIDATED: "Validator revalidated ",
  BOND_MORE_SUCCESS: "Bonded more funds ",
  UNJAIL_SUCCESS: "Validator unjailed ",
  UNBOND_SUCCESS: "Unbonded funds ",
  USER_REJECTED_TX:
    "Transaction was rejected. Please approve the transaction to continue.",
  FAILED_TO_CREATE_VALIDATOR: "Failed to create validator. Please try again.",
  FAILED_TO_EDIT_VALIDATOR:
    "Failed to update validator details. Please try again.",
  FAILED_TO_STOP_VALIDATOR: "Failed to stop validator. Please try again.",
  FAILED_TO_REVALIDATE: "Failed to revalidate. Please try again.",
  FAILED_TO_BOND_MORE: "Failed to bond more funds. Please try again.",
  FAILED_TO_UNBOND: "Failed to unbond funds. Please try again.",
  FAILED_TO_UNJAIL: "Failed to unjail validator. Please try again.",
  CLAIM_REWARDS_SUCCESS: "Rewards claimed successfully",
  FAILED_TO_CLAIM_REWARDS: "Failed to claim rewards. Please try again.",
  ERROR: "Transaction failed",
};

export function getFriendlyErrorMessage(rawMessage = "") {
  if (
    rawMessage.includes("commission cannot be changed more than once in 24h")
  ) {
    return "Commission rate can only be changed once every 24 hours.";
  }
  if (rawMessage.includes("empty address string is not allowed")) {
    return "Wallet address is missing. Please make sure Keplr is unlocked and connected.";
  }
  if (rawMessage.includes("insufficient funds")) {
    return "Insufficient funds to cover the transaction fee.";
  }
  if (rawMessage.includes("Request rejected")) {
    return "Transaction was rejected in Keplr. Please approve the transaction to continue.";
  }
  if (rawMessage.includes("out of gas")) {
    return "Transaction ran out of gas. Please try again.";
  }
  if (rawMessage.includes("account not found")) {
    return "Your account was not found on-chain. Please ensure your wallet is set up correctly.";
  }
  return null;
}
