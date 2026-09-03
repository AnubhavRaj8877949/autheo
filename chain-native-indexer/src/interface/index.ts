export interface IEnvironment {
  port: number;
  secretKey: string;
  databaseUrl: string;
  nodeLink: string;
  saltValue: number;
  redisUrl: string;
  rabbitMq: string;
  currency: string;
  symbol: string;
  nativeSwaggerUrl: string;
  addressPrefix: string;
  coinMarketApi: string;
  coinMarketKey: string;
  catchupDisabled: boolean;
  corsOrigins: string[];
  getCurrentEnvironment(): string;
  setEnvironment(env: string): void;
  isProductionEnvironment(): boolean;
  isDevEnvironment(): boolean;
  isTestEnvironment(): boolean;
  isStagingEnvironment(): boolean;
}

export interface IBlock {
  blockhash: string;
  timestamp: string;
  blocknumber: number;
  transactionCount: number;
  miner: string;
  validatorOperatorAddress: string;
}

export interface ITransaction {
  type: string | undefined;
  status: string;
  txhash: string;
  value: string;
  txFee: string;
  gasUsed: number;
  txString: string;
  timestamp: string;
  toAddress: string;
  gasWanted: number;
  blocknumber: number;
  fromAddress: string;
  contractAddress: string;
}

export interface IContracts {
  blockNumber: number;
  txHash: string;
  contractName: string;
  contractType: string;
  creator: string;
  address: string;
  timestamp: string;
}

export interface IESResponse {
  error: boolean;
  data?: object;
  message?: string;
}

export interface IDelegator {
  address: string;
  totalStake: number;
}

export interface IValidatorStake {
  stake: number;
  denom: string;
  delegatorRewards: number;
  delegatorAddress: string;
  balanceAmount: number;
  validatorOperatorAddress: string;
}

export interface CoinMarketData {
  price: number;
  marketCap: number;
  circulatingSupply: number;
}

export interface ITimeStamp {
  [key: string]: number;
}

export interface Params {
  annualProvisions: number;
  blocksPerYear: number;
  inflation: string;
  /** Inflation rate resolved from `/cosmos/mint/v1beta1/params`. */
  inflationRate: number;
  bondedTokens: number;
  communityTax: number;
  activeValidator: number;
  totalValidator: number;
  circulatingSupply: number;
  bondedRate: number;
  totalSupply: number;
}

export interface DashboardData {
  apr: number;
  apy: number;
  validators: number;
  totalValidators: number;
  bondedRate: number;
}

export interface ValidatorDelegations {
  delegation_responses: Array<{
    delegation: {
      delegator_address: string;
      validator_address: string;
      shares: string;
    };
  }>;
}

export interface IValidator {
  name: string;
  tokens: string;
  status: string;
  website: string;
  details: string;
  jailed: boolean;
  identity: string;
  selfStake: string;
  totalStake: string;
  totalRewards: number;
  unbondingTime: string;
  unbondingIds: string[];
  delegatorCount: number;
  unbondingHeight: number;
  securityContact: string;
  operatorAddress: string;
  unbondingAmount: number;
  validatorAddress: string;
  minSelfDelegation: string;
  commissionRate: string;
  commissionMaxRate: string;
  commissionUpdateTime: string;
  commissionMaxChangeRate: string;
  unbondingOnHoldRefCount: string;
  votingPower: number;
  isGenesis: boolean;
}

export interface IValidatorToSave extends IValidator {
  createdAt?: string;
  updatedAt: string;
}

export interface ValidatorData {
  validator: number;
  totalValidator: number;
  bondedRate: number;
  apy: number;
}
export interface IProposalData {
  proposalId: string;
  status: string;
  totalDeposit: string;
  metaData: string;
  title: string;
  summary: string;
  proposer: string;
  proposerType: string;
  tally: string;
  votingStartTime: string;
  votingEndTime: string;
  bondedTokens?: string;
  totalVotes?: string;
  turnout?: string;
  yesPercent?: string;
  noPercent?: string;
  abstainPercent?: string;
  vetoPercent?: string;
  isFinalized?: boolean;
}
export interface ITokens {
  totalSupply: string;
  tokenSymbol: string;
  tokenName: string;
  decimal: string;
  creator: string;
  type: string;
  contractAddress: string;
  blockNumber: number;
}

export interface IContractLogs {
  logs: string;
  txHash: string;
  txFee: string;
  contractAddress: string;
  blockNumber: number;
  method: string;
  status: string;
  timestamp: string;
}

export interface IHolders {
  address: string;
  contractAddress: string;
  tokenBalance: string;
}

export interface IVoters {
  proposalId: string;
  txHash: string;
  answer: string;
  blockNumber: number;
  voter: string;
}
