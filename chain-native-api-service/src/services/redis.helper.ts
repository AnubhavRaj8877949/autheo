import { RedisClientType, createClient } from "redis";
import logger from "../libs/logger";
import { sanitizeUrl } from "../libs/utilities/common";

class RedisService {
  client: RedisClientType;

  static instance: RedisService;

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async createClientConnection() {
    try {
      this.client = createClient({
        url: environment.redisUrl,
      });

      await this.client.connect();
      this.client.select(1);
      logger.info("Redis connected", {
        host: sanitizeUrl(environment.redisUrl),
      });

      this.client.on("connect", () => {
        logger.info("Redis client connected");
      });
      this.client.on("ready", () => {
        logger.info("Redis client ready");
      });
      this.client.on("reconnecting", () => {
        logger.warn("Redis client reconnecting");
      });
      this.client.on("end", () => {
        logger.info("Redis connection closed");
      });
      this.client.on("error", (err: Error) =>
        logger.error("Redis connection error", { message: err.message }),
      );
    } catch (error) {
      logger.error("Error while connecting to Redis", { error });
    }
  }

  public async setString<T>(key: string, data: T) {
    try {
      await this.client.set(key, JSON.stringify(data));
    } catch (err) {
      logger.error("Error while setting data in Redis", { key, err });
    }
  }

  public async getString(key: string) {
    try {
      const res = (await this.client.get(key)) as string;
      return JSON.parse(res);
    } catch (err) {
      logger.error("Error while getting data from Redis", { key, err });
      return [];
    }
  }

  public async setHset(redisKey: string, dataKey: string, dataValue: object) {
    try {
      await this.client.hSet(redisKey, dataKey, JSON.stringify(dataValue));
      await this.client.expire(redisKey, environment.ttlTimeRewards * 60 * 60);
      return true;
    } catch (err) {
      logger.error("Error while saving data in Redis hash", {
        redisKey,
        dataKey,
        err,
      });
      return null;
    }
  }

  public async getHset(redisKey: string, dataKey: string) {
    try {
      const res = (await this.client.hGet(redisKey, dataKey)) as string;
      return JSON.parse(res);
    } catch (err) {
      logger.error("Error while getting data from Redis hash", {
        redisKey,
        dataKey,
        err,
      });
      return null;
    }
  }
}
export default RedisService.getInstance();
