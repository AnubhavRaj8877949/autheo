import * as amqp from "amqplib/callback_api";
import { QUEUE_NAME, REDIS_KEY } from "../constant";
import processHelper from "../libs/process.helper";
import { prisma } from "../libs/db";
import logger from "../libs/logger";
import { RedisService } from ".";

class RabbitMq {
  public channel: amqp.Channel;

  constructor() {
    this.startServer();
  }

  public async startServer() {
    try {
      const res = await this.connect();
      this.channel = res;
      Object.values(QUEUE_NAME).forEach((queue) => {
        this.channel.assertQueue(queue, {
          durable: false,
        });
      });

      this.channel.prefetch(7);
      this.consumeMissedTxs();
      this.consumeErrorBlocks();
      this.consumeLatestBlocks();
      this.consumeMissedBlocks();
      this.consumeDownTimeBlocks();
      this.consumeDownTransaction();
      this.consumeLatestTransaction();

      return true;
    } catch (error) {
      logger.error("Error while connecting to RabbitMQ: ", error);
      return false;
    }
  }

  public connect(): Promise<amqp.Channel> {
    const RECONNECT_DELAY = 5000;
    return new Promise((resolve, reject) => {
      const attemptConnection = () => {
        amqp.connect(environment.rabbitMq, (err, connection) => {
          if (err) {
            logger.error("Error connecting to RabbitMQ:", err);
            reject(err);
            return;
          }

          connection.on("error", (error) => {
            logger.error("RabbitMQ connection error:", error.message);
            setTimeout(attemptConnection, RECONNECT_DELAY);
          });

          connection.createChannel((error: Error, channel) => {
            if (error) {
              logger.error("Error creating channel:", error);
              reject(error);
              return;
            }
            logger.info("RabbitMQ connected");
            resolve(channel);
          });
        });
      };

      attemptConnection();
    });
  }

  /**
   * Save Data in queue
   */
  public inQueueData(queue: string, data: string | object) {
    try {
      if (typeof data === "string") {
        this.channel?.sendToQueue(queue, Buffer.from(data));
      } else {
        this.channel?.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
      }
      return true;
    } catch (error) {
      logger.error("Error in inQueueData:", error);
      return false;
    }
  }

  public consumeLatestTransaction() {
    try {
      this.channel?.consume(
        QUEUE_NAME.LATEST_TXS,
        async (message: amqp.Message | null) => {
          if (!message) return;
          try {
            const txData = JSON.parse(message.content.toString());
            const txRes = await processHelper.processTxns(txData);
            if (!txRes && txData?.result?.events) {
              this.inQueueData(QUEUE_NAME.MISSED_TXS, JSON.stringify(txData));
            }
            this.channel?.ack(message);
          } catch (error) {
            logger.error("Error processing latest tx:", error);
            this.channel?.ack(message);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      logger.error("Error setting up consumer:", error);
    }
  }

  public consumeDownTransaction() {
    try {
      this.channel?.consume(
        QUEUE_NAME.DOWNTIME_TXS,
        async (message: amqp.Message | null) => {
          if (!message) return;
          try {
            const data = message.content.toString();
            let parsedData;
            try {
              parsedData = JSON.parse(data);
            } catch (error) {
              parsedData = data;
            }
            let txRes;
            if (typeof parsedData === "string") {
              txRes = await processHelper.processMissedTxs(parsedData, false);
            } else if (parsedData?.txHash) {
              txRes = await processHelper.processMissedTxs(parsedData.txHash, true);
            }

            if (!txRes) {
              const hashToRequeue = typeof parsedData === "string" ? parsedData : parsedData?.txHash;
              if (hashToRequeue) {
                this.inQueueData(QUEUE_NAME.DOWNTIME_TXS, hashToRequeue);
              }
            }
            this.channel?.ack(message);
          } catch (error) {
            logger.error("Error processing downtime tx:", error);
            this.channel?.ack(message);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      logger.error("Error setting up consumer:", error);
    }
  }

  public consumeLatestBlocks() {
    try {
      this.channel?.consume(
        QUEUE_NAME.LATEST_BLOCKS,
        async (message: amqp.Message | null) => {
          if (!message) return;
          try {
            const blockData = JSON.parse(message.content.toString());
            const isSaved = await processHelper.processLatestBlock(blockData);

            if (!isSaved && blockData?.result?.data) {
              const blockNumber = blockData.result.data.value?.block?.header?.height;
              if (blockNumber) {
                this.inQueueData(QUEUE_NAME.ERROR_BLOCK, blockNumber.toString());
              }
            }
            this.channel?.ack(message);
          } catch (error) {
            logger.error("Error processing latest block:", error);
            this.channel?.ack(message);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      logger.error("Error setting up consumer:", error);
    }
  }

  public consumeMissedTxs() {
    try {
      this.channel?.consume(
        QUEUE_NAME.MISSED_TXS,
        async (message: amqp.Message | null) => {
          if (!message) return;
          try {
            const txData = JSON.parse(message.content.toString());
            const txRes = await processHelper.processTxns(txData);
            if (!txRes) {
              this.inQueueData(QUEUE_NAME.MISSED_TXS, JSON.stringify(txData));
            }
            this.channel?.ack(message);
          } catch (error) {
            logger.error("Error processing missed txs:", error);
            this.channel?.ack(message);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      logger.error("Error setting up consumer:", error);
    }
  }

  public consumeErrorBlocks(): void {
    try {
      this.channel?.consume(
        QUEUE_NAME.ERROR_BLOCK,
        async (message: amqp.Message | null) => {
          if (!message) return;
          try {
            const blockNo = message.content.toString();
            await processHelper.processErrorBlock(blockNo);
            this.channel?.ack(message);
          } catch (error) {
            logger.error("Error processing error block:", error);
            this.channel?.ack(message);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      logger.error("Error setting up consumer:", error);
    }
  }

  public consumeMissedBlocks(): void {
    try {
      this.channel?.consume(
        QUEUE_NAME.MISSED_BLOCK,
        async (message: amqp.Message | null) => {
          if (!message) return;
          try {
            const blockData = JSON.parse(message.content.toString());
            const isSaved = await processHelper.processMissedBlocks(blockData);

            if (!isSaved && blockData?.blocknumber) {
              this.inQueueData(
                QUEUE_NAME.ERROR_BLOCK,
                blockData.blocknumber.toString(),
              );
            }
            this.channel?.ack(message);
          } catch (error) {
            logger.error("Error processing missed block:", error);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      logger.error("Error setting up consumer:", error);
    }
  }

  /**
   * Handle blocks one by one when server is down
   */
  consumeDownTimeBlocks(): void {
    try {
      this.channel?.consume(
        QUEUE_NAME.DOWNTIME_BLOCK,
        async (message: amqp.Message | null) => {
          if (!message) return;
          try {
            const block = message.content.toString();
            const isSuccess = await processHelper.processErrorBlock(block);
            if (isSuccess) {
              let blockCount = await RedisService.getString(
                REDIS_KEY.NATIVE_BLOCKS_COUNT,
              );

              if (!blockCount) {
                blockCount = await prisma.blocks.count();
                await RedisService.setString(
                  REDIS_KEY.NATIVE_BLOCKS_COUNT,
                  blockCount,
                );
              } else {
                blockCount = Number(blockCount) + 1;
                await RedisService.setString(
                  REDIS_KEY.NATIVE_BLOCKS_COUNT,
                  blockCount,
                );
              }

              await RedisService.setString(
                REDIS_KEY.LATEST_BLOCK,
                Number(block),
              );
            } else {
              this.inQueueData(QUEUE_NAME.ERROR_BLOCK, block.toString());
            }
            this.channel?.ack(message);
          } catch (error) {
            logger.error("Error processing downtime block:", error);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      logger.error("Error setting up consumer:", error);
    }
  }
}

export default new RabbitMq();
