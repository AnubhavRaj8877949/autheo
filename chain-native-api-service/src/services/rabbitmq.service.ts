import * as amqp from "amqplib/callback_api";
import { QUEUE_NAME } from "../constant";
import logger from "../libs/logger";
import { sanitizeUrl } from "../libs/utilities/common";

class RabbitMq {
  public channel: amqp.Channel;

  public async startServer() {
    try {
      const res = await this.connect();
      this.channel = res;
      Object.values(QUEUE_NAME).forEach((queue) => {
        this.channel.assertQueue(queue, {
          durable: false,
        });
      });
      return true;
    } catch (error) {
      logger.error("Error while connecting to RabbitMQ", { error });
      return false;
    }
  }

  public connect(): Promise<amqp.Channel> {
    return new Promise((resolve, reject) => {
      amqp.connect(environment.rabbitMq, (err, conn) => {
        if (err) {
          logger.error("RabbitMQ connection failed", { message: err.message });
          reject(err);
          return;
        }

        conn.on("close", () => {
          logger.warn("RabbitMQ connection closed");
        });

        conn.on("error", (connErr: Error) => {
          logger.error("RabbitMQ connection error", {
            message: connErr.message,
          });
        });

        conn?.createChannel((error: Error, ch) => {
          if (error) {
            logger.error("RabbitMQ channel creation failed", {
              message: error.message,
            });
            reject(error);
            return;
          }

          logger.info("RabbitMQ connected", {
            host: sanitizeUrl(environment.rabbitMq),
          });
          resolve(ch);
        });
      });
    });
  }

  public assertQueue(queue: string) {
    this.channel?.assertQueue(queue, { durable: false });
  }

  public inQueueData(queue: string, data: string) {
    try {
      this.channel?.sendToQueue(queue, Buffer.from(data));
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new RabbitMq();
