import * as fs from "node:fs";
import * as path from "node:path";
import { config as configDotenv } from "dotenv";

import { IEnvironment } from "../interface/index";
import { EnvironmentFile, Environments } from "./environment.constant";


class Environment implements IEnvironment {
  public port: number;

  public addressPrefix: string;

  public secretKey: string;

  public env: string;

  public saltValue: number;

  public nodeLink: string;

  public databaseUrl: string;

  public redisUrl: string;

  public rabbitMq: string;

  public coinMarketApi: string;

  public coinMarketKey: string;

  public currency: string;

  public symbol: string;

  public nativeSwaggerUrl: string;

  public wsUrl: string;

  public projectName: string;

  public ttlTimeRewards: number;

  public chainName: string;

  public httpHost: string;

  public catchupDisabled: boolean;

  public corsOrigins: string[];

  /**
   *
   * @param NODE_ENV
   */
  constructor(NODE_ENV?: string) {
    this.env = NODE_ENV || process.env.NODE_ENV || Environments.DEV;
    this.setEnvironment(this.env);
    const port: string | undefined | number = process.env.PORT || 3146;
    this.port = Number(port);
    this.secretKey = <string>process.env.SECRET_KEY;
    this.addressPrefix = <string>process.env.ADDRESS_PREFIX;
    this.saltValue = (process.env.SALT_VALUE as unknown as number) || 10;
    this.httpHost = <string>process.env.NATIVE_RPC_HTTP_URL;
    this.databaseUrl = <string>process.env.DATABASE_URL;
    this.redisUrl = <string>process.env.REDIS_URL;
    this.rabbitMq = <string>process.env.RABBITMQ_URL;
    this.coinMarketApi = <string>process.env.COIN_MARKET_API_PATH;
    this.coinMarketKey = <string>process.env.COIN_MARKET_API_KEY;
    this.symbol = <string>process.env.TOKEN_SYMBOL || "";
    this.currency = <string>process.env.TOKEN_CURRENCY;
    this.nativeSwaggerUrl = <string>process.env.NATIVE_SWAGGER_HTTP_URL;
    this.wsUrl = <string>process.env.NATIVE_RPC_WS_URL;
    this.projectName = <string>process.env.PROJECT_NAME || "";
    this.ttlTimeRewards = Number(process.env.TTL_TIME_FOR_REWARDS || 1);
    this.chainName = <string>process.env.CHAIN_NAME || "";
    this.catchupDisabled = Number(process.env.CATCHUP_DISABLED) === 1;
    this.corsOrigins = (process.env.WS_CORS_ORIGINS || "*")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    const required = [
      "SECRET_KEY",
      "ADDRESS_PREFIX",
      "NATIVE_RPC_HTTP_URL",
      "DATABASE_URL",
      "REDIS_URL",
      "RABBITMQ_URL",
      "NATIVE_SWAGGER_HTTP_URL",
      "NATIVE_RPC_WS_URL",
    ];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
  }

  /**
   *
   * @returns
   */
  public getCurrentEnvironment(): string {
    return this.env;
  }

  /**
   *
   * @param env
   */
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

  /**
   *
   * @returns
   */
  public isProductionEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.PRODUCTION;
  }


  /**
   *
   * @returns
   */
  public isDevEnvironment(): boolean {
    return (
      this.getCurrentEnvironment() === Environments.DEV ||
      this.getCurrentEnvironment() === Environments.LOCAL
    );
  }

  /**
   *
   * @returns
   */
  public isTestEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.TEST;
  }

  /**
   *
   * @returns
   */
  public isStagingEnvironment(): boolean {
    return this.getCurrentEnvironment() === Environments.STAGING;
  }
}

export default Environment;
