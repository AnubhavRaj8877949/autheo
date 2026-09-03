import { RedisClientType, createClient } from "redis";
import { REDIS_KEY } from "../constant";
import logger from "../libs/logger";

class RedisService {
  client: RedisClientType;

  static instance: RedisService;

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async startRedis() {
    try {
      this.client = createClient({
        url: environment.redisUrl,
      });

      await this.client.connect();
      this.client.select(1);
      logger.info("Redis connected");

      this.client.on("connect", () => {
        logger.info("Connected to redis successfully");
      });
      this.client.on("error", (err: Error) =>
        logger.error("Redis connection error:", err.message),
      );
    } catch (error) {
      logger.error("Error connecting to redis:", error);
    }
  }

  // set the string data to redis
  public async setString<T>(key: string, data: T) {
    try {
      await this.client.set(key, JSON.stringify(data));
    } catch (err) {
      logger.error("Error setting data in redis:", err);
    }
  }

  /**
   * save validator Data in set type of redis
   * @param key
   * @param data
   * @returns
   */
  public async upsertValidator<T>(key: string, id: number, data: any) {
    try {
      const dataToSave: {
        score: number;
        value: string;
      } = {
        score: 0,
        value: JSON.stringify(data),
      };

      const existingData =
        (await this.client.zRange(REDIS_KEY.VALIDATOR_DETAILS, 0, -1)).map(
          (item) => JSON.parse(item),
        ) || [];

      if (existingData.length > 0) {
        const valExistingData = existingData.find(
          (i: any) => i.validatorAddress === data.validatorAddress,
        );

        if (!valExistingData) {
          dataToSave.score = id;
          await this.client.zAdd(key, dataToSave);
          await this.setString(REDIS_KEY.VALIDATOR_ID_COUNTER, id + 1);
        } else {
          dataToSave.score = id - 1;
          await this.client.zRemRangeByScore(key, id - 1, id - 1);
          await this.client.zAdd(key, dataToSave);
        }
      } else {
        dataToSave.score = id;
        await this.client.zAdd(key, dataToSave);

        await this.setString(REDIS_KEY.VALIDATOR_ID_COUNTER, id + 1);
      }

      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * save validator Data in set type of redis
   * @param key
   * @param data
   * @returns
   */
  public async upsertDelegator<T>(key: string, id: number, data: any) {
    try {
      const dataToSave: {
        score: number;
        value: string;
      } = {
        score: 0,
        value: JSON.stringify(data),
      };

      const existingData =
        (await this.client.zRangeByScore(key, id - 1, id - 1)) || [];

      if (existingData.length > 0) {
        const valExistingData = existingData.find((i: any) => {
          const extData = JSON.parse(i);

          return (
            extData.validatorAddress === data.validatorAddress &&
            extData.delegatorAddress === data.delegatorAddress
          );
        });

        if (!valExistingData) {
          dataToSave.score = id;
          await this.client.zAdd(key, dataToSave);
          await this.setString(REDIS_KEY.DELEGATOR_ID_COUNTER, id + 1);
        } else {
          dataToSave.score = id - 1;
          await this.client.zRemRangeByScore(key, id - 1, id - 1);
          await this.client.zAdd(key, dataToSave);
        }
      } else {
        dataToSave.score = id;
        await this.client.zAdd(key, dataToSave);
        await this.setString(REDIS_KEY.DELEGATOR_ID_COUNTER, id + 1);
      }

    } catch (err) {
      logger.error("Error in upsertDelegator:", err);
    }
  }

  // get the string data from redis
  public async getString(key: string) {
    try {
      const res = (await this.client.get(key)) as string;
      return JSON.parse(res);
    } catch (err) {
      logger.error("error while getting the data from redis: ", err);
      return [];
    }
  }

  public async setHset(redisKey: string, dataKey: string, dataValue: object) {
    try {
      await this.client.hSet(redisKey, dataKey, JSON.stringify(dataValue));
      await this.client.expire(redisKey, environment.ttlTimeRewards * 60 * 60);

      return true;
    } catch (err) {
      logger.error("error while saving in redis: ", err);
      return null;
    }
  }

  public async getHset(redisKey: string, dataKey: string) {
    try {
      const res = (await this.client.hGet(redisKey, dataKey)) as string;
      return JSON.parse(res);
    } catch (err) {
      logger.error("error while saving in redis: ", err);
      return null;
    }
  }
}
export default RedisService.getInstance();
