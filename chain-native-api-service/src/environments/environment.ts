import * as fs from "fs";
import * as path from "path";
import { config as configDotenv } from "dotenv";
import IEnvironment from "./environment.interface";
import { EnvironmentFile, Environments } from "./environment.constant";

const REQUIRED_ENV_VARS = [
  "PORT",
  "DATABASE_URL",
  "REDIS_URL",
  "RABBITMQ_URL",
  "NATIVE_RPC_HTTP_URL",
  "SWAGGER_HTTP_HOST",
  "ADDRESS_PREFIX",
  "TOKEN_SYMBOL",
];

function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

class Environment implements IEnvironment {
  public port: number;

  public corsAllowedOrigins: string | string[];

  public httpTimeoutMs: number;

  public env: string;

  public addressPrefix: string;

  public nativeRpcHttpUrl: string;

  public rpcTimeoutMs: number;

  public databaseUrl: string;

  public redisUrl: string;

  public rabbitMq: string;

  public symbol: string;

  public swaggerHttpUrl: string;

  public validators: string;

  public excludedValidators: string;

  public ttlTimeRewards: number;

  constructor(NODE_ENV?: string) {
    this.env = NODE_ENV || process.env.NODE_ENV || Environments.DEV;
    this.setEnvironment(this.env);
    validateEnv();
    this.port = Number(process.env.PORT || 3146);
    this.httpTimeoutMs = Number(process.env.HTTP_TIMEOUT_MS || 10000);
    const rawOrigins = process.env.CORS_ALLOWED_ORIGINS ?? "*";
    this.corsAllowedOrigins =
      rawOrigins === "*"
        ? "*"
        : rawOrigins
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);
    this.symbol = <string>process.env.TOKEN_SYMBOL;
    this.redisUrl = <string>process.env.REDIS_URL;
    this.rabbitMq = <string>process.env.RABBITMQ_URL;
    this.validators = <string>process.env.VALIDATORS;
    this.databaseUrl = <string>process.env.DATABASE_URL;
    this.addressPrefix = <string>process.env.ADDRESS_PREFIX;
    this.swaggerHttpUrl = <string>process.env.SWAGGER_HTTP_HOST;
    this.nativeRpcHttpUrl = <string>process.env.NATIVE_RPC_HTTP_URL;
    this.rpcTimeoutMs = Number(process.env.RPC_TIMEOUT_MS || 10000);
    this.excludedValidators = <string>process.env.EXCLUDING_VALIDATORS;
    this.ttlTimeRewards = Number(process.env.TTL_TIME_FOR_REWARDS || 1);
  }

  public getCurrentEnvironment(): string {
    return this.env;
  }

  public setEnvironment(env: string): void {
    let envPath: string;
    this.env = env || Environments.LOCAL;
    const rootdir: string = path.resolve(__dirname, "../../");
    switch (env) {
      case Environments.PRODUCTION:
        envPath = path.resolve(rootdir, EnvironmentFile.PRODUCTION);
        break;
      case Environments.TEST:
        envPath = path.resolve(rootdir, EnvironmentFile.TEST);
        break;
      case Environments.STAGING:
        envPath = path.resolve(rootdir, EnvironmentFile.QA);
        break;
      case Environments.LOCAL:
        envPath = path.resolve(rootdir, EnvironmentFile.LOCAL);
        break;
      default:
        envPath = path.resolve(rootdir, EnvironmentFile.LOCAL);
    }
    if (this.env !== Environments.PRODUCTION && !fs.existsSync(envPath)) {
      throw new Error(".env file is missing in root directory");
    }
    configDotenv({ path: envPath });
  }

  public isProductionEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.PRODUCTION;
  }

  public isDevEnvironment(): boolean {
    return (
      this.getCurrentEnvironment() === Environments.DEV ||
      this.getCurrentEnvironment() === Environments.LOCAL
    );
  }

  public isTestEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.TEST;
  }

  public isStagingEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.STAGING;
  }
}

export default Environment;
