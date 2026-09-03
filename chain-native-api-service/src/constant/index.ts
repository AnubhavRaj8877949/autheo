export const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

export const RESPONSES = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NOCONTENT: 204,
  BADREQUEST: 400,
  UN_AUTHORIZED: 401,
  FORBIDDEN: 403,
  NOTFOUND: 404,
  TIMEOUT: 408,
  TOO_MANY_REQ: 429,
  INTERNAL_SERVER: 500,
  BADGATEWAYS: 502,
  SERVICEUNAVILABLE: 503,
  GATEWAYTIMEOUT: 504,
};

export const RATE_LIMITER_MESSAGE = {
  TOO_MANY_REQUEST:
    "You are doing too many request. Please try again in 5 minutes.",
  WINDOW_MS: 5 * 60 * 1000,
  MAX: 20,
};

export const RES_MSG = {
  NOT_FOUND: "data not found",
  FETCH_SUCCESS: "data fetched successfully",
  ACTIVE: "active",
  INACTIVE: "inactive",
  YES: "yes",
  NO: "no",
  VETO: "veto",
  ABSTAIN: "abstain",
  DEACTIVATING: "deactivating",
  BOND_STATUS_BONDED: "BOND_STATUS_BONDED",
  BOND_STATUS_UNBONDED: "BOND_STATUS_UNBONDED",
  BOND_STATUS_UNBONDING: "BOND_STATUS_UNBONDING",
  ERROR_FETCH_LATEST_BLOCK: "error while fetching latest block",
  ERROR: "Oops! Something went wrong. Please try again.",
  SERVER_ERROR: "internal server error",
  TRANSACTION_FETCH_SUCCESS: "transaction fetched successfully",
  PROPOSAL_FETCH_SUCCESS: "proposal fetched successfully",
  TRANSACTION_NOT_FOUND: "transaction not found",
  PROPOSAL_NOT_FOUND: "proposal not found",
  NOT_VALID_QUERY: "invalid block number",
  BLOCK_TRANSACTION_FETCH: "block transactions fetched successfully",
  ACCOUNT_HISTORY_SUCCESS: "account history fetched successfully",
  TRANSACTION_HISTORY_SUCCESS: "transaction history fetched successfully",
  TRANSACTION_FAILED: "transaction failed",
  TRANSACTION_CREATE_SUCCESS: "transaction created successfully",
  SUCCESS: "success",
  CONTRACT_NOT_FOUND: "contract not found",
  CONTRACT: "contract fetched successfully",
  CONTRACT_TX: "contract transaction fetched successfully",
  CONTRACT_TX_NOT_FOUND: "data not found",
  INVALID_ADDRESS: "invalid address",
  INTERNAL_SERVER_ERROR: "Something went wrong",
};

export const BLOCKCHAIN_ERROR_MSG = {
  BLOCK_NUMBER_FETCH: "error occurred while fetching block number",
  TRANSACTION_FETCH: "error occurred while fetching transaction detail",
  GET_BALANCE: "error occurred while fetching balance detail",
  TRANSACTION_COUNT: "error occurred while fetching transaction count",
  GET_ACCOUNT: "error occurred while fetching account detail",
  INVALID_ADDRESS: "invalid address",
  SIGN_AND_SEND: "error while fund transfer",
};

export const CONST_NAME = {
  TOTAL_NODE: "total_node_res",
  LATEST_BLOCK: "latestBlock",
  FEES: 5,
  THOUSAND: 1000,
  HUNDRED: 100,
  ZERO: 0,
  ONE: 1,
  SLICED_VALUE: 200,
  MAX_FEES: 8,
  MAX_PRIORITY_FEES: 8,
  GAS: 21000,
  EXPIRE_TIME: 24 * 60 * 60,
  SUCCESS_STATUS: "success",
  FAILED_STATUS: "Failed",
  PENDING_STATUS: "Pending",
  NA: "N/A",
  YEAR_MILI_SEC: 31536000000,
  BLOCK_PER_YEAR: 365 * 24 * 60 * 60,
  ETH_EXP: 10 ** 18,
  NOT_FOUND: "not found",
  MARKET_CAP_PRICE: "MARKET_CAP_PRICE",
  BOND_STATUS: "BOND_STATUS_BONDED",
};

export const TRANSFER_TYPE = {
  DIRECT_TRANSFER: "COIN_TRANSFER",
  CONTRACT_CREATION: "CONTRACT_CREATION",
  CONTRACT_TRANSFER: "CONTRACT_TRANSFER",
};

export const AUTH = {
  OTP_EXPIRATION_TIME: 5 * 60 * 1000,
};

export const CONTRACTLOGS = {
  txHash: true,
  txFee: true,
  contractAddress: true,
  blockNumber: true,
  method: true,
  status: true,
  timestamp: true,
  createdAt: true,
};

export const CONTRACT = {
  timestamp: true,
  contractName: true,
  contractType: true,
  blockNumber: true,
  creator: true,
  address: true,
  txHash: true,
  createdAt: true,
  updatedAt: true,
};

export const ASC = "asc";
export const DESC = "desc";

export const REDIS_KEY = {
  TOKEN_PRICE: "TOKEN_PRICE",
  PENDING_TX: "PENDING_TRANSACTION",
  TPS_GRAPH: "TPS_GRAPH_PAYLOAD",
  TOKEN_GRAPH: "TOKEN_GRAPH_PAYLOAD",
  ACCOUNT_GRAPH: "ACCOUNT_GRAPH_PAYLOAD",
  COIN_TRANSFER_GRAPH: "COIN_TRANSFER_GRAPH_PAYLOAD",
  CONTRACT_DEPLOY_GRAPH: "CONTRACT_DEPLOY_GRAPH_PAYLOAD",
  CIRCULATING_SUPPLY: "CIRCULATING_SUPPLY",
  MARKET_CAP: "MARKET_CAP",
  TOTAL_BLOCKS: "TOTAL_BLOCKS",
  TOTAL_TX: "TOTAL_TX",
  TOTAL_TOKENS: "TOTAL_TOKENS",
  TOTAL_ACCOUNTS: "TOTAL_ACCOUNTS",
  TOTAL_TOKEN_PRICE: "TOTAL_TOKEN_PRICE",
  TOTAL_COIN_TRANSFER_TX: "TOTAL_COIN_TRANSFER_TX",
  TOTAL_CONTRACT_DEPLOYED_TX: "TOTAL_CONTRACT_DEPLOYED_TX",
  TOTAL_CONTRACT_LOGS: "TOTAL_CONTRACT_LOGS",
  VALIDATOR_DATA: "VALIDATOR_DATA",
  TOTAL_REWARDS: "TOTAL_REWARDS",
  USER_BALANCE: "USER_BALANCE",
  INFLATION_APY: "INFLATION_AND_APY",
  NATIVE_BLOCKS_COUNT: "NATIVE_BLOCKS_COUNT",
  NATIVE_TRANSACTIONS_COUNT: "NATIVE_TRANSACTIONS_COUNT",
  DASHBOARD_DATA: "DASHBOARD_DATA",
  COIN_PRICE: "COIN_PRICE",
  LATEST_BLOCK: "LATEST_BLOCK",
  REWARDS: "REWARDS",
};

export const QUEUE_NAME = {
  MISSED_BLOCK: "MISSED_BLOCK",
};

export enum TRANSACTION_STATUS {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum TRANSACTION_TYPE {
  COIN_TRANSFER = "COIN_TRANSFER",
  CONTRACT_CREATION = "CONTRACT_CREATION",
  CONTRACT_TRANSFER = "CONTRACT_TRANSFER",
}

export const HEADERS = {
  DEFAULT: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const FETCH_METHODS = {
  POST: "POST",
  GET: "GET",
  PATCH: "PATCH",
  PUT: "PUT",
};

export const CURRENT_DEFAULT_APR = 0;
export const CURRENT_DEFAULT_COIN_PRICE = 0.337097;
export const CURRENT_DEFAULT_CIRCULATING_SUPPLY = 30542186;

export const YEAR_1_BASE = 2000000000;
export const DECAY_RATE = 0.9;
