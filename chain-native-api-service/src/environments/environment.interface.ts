interface IEnvironment {
  port: number;
  corsAllowedOrigins: string | string[];
  httpTimeoutMs: number;
  symbol: string;
  rabbitMq: string;
  redisUrl: string;
  databaseUrl: string;
  validators: string;
  addressPrefix: string;
  swaggerHttpUrl: string;
  nativeRpcHttpUrl: string;
  rpcTimeoutMs: number;
  excludedValidators: string;
  ttlTimeRewards: number;
  getCurrentEnvironment(): string;
  setEnvironment(env: string): void;
  isProductionEnvironment(): boolean;
  isDevEnvironment(): boolean;
  isTestEnvironment(): boolean;
  isStagingEnvironment(): boolean;
}

export default IEnvironment;
