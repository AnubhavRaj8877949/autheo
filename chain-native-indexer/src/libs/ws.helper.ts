import WebSocket from "ws";
import { v4 } from "uuid";

import { RabbitMqService } from "../services";
import { httpBlockSyncService } from "../services/httpBlockSync.service";
import logger from "./logger";

interface Subscription {
  id: string;
  query: string;
  queueName: string;
}

export class WebSocketManager {
  private static instance: WebSocketManager | null = null;

  private readonly url: string;

  private websocket: WebSocket | null = null;

  private readonly subscriptions: Map<string, Subscription> = new Map();

  private readonly reconnectInterval = 5000;

  private inFailoverMode = false;

  private reconnecting = false;

  private retryCount = 0;

  private readonly maxRetryDelay = 60_000;

  private healthCheckInterval: NodeJS.Timeout | null = null;

  private reconnectTimeout: NodeJS.Timeout | null = null;


  private constructor(url: string) {
    this.url = url;
  }

  public static getInstance(url: string): WebSocketManager {
    WebSocketManager.instance ??= new WebSocketManager(url);
    return WebSocketManager.instance;
  }

  public subscribe(query: string, queueName: string): string {
    const subscriptionId = v4();

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      query,
      queueName,
    });

    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.sendSubscription(subscriptionId);
    } else if (!this.websocket) {
      this.connect();
    }

    return subscriptionId;
  }

  public unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    if (this.websocket?.readyState === WebSocket.OPEN) {
      try {
        this.websocket.send(
          JSON.stringify({
            jsonrpc: "2.0",
            method: "unsubscribe",
            id: subscription.id,
            params: { query: subscription.query },
          })
        );
      } catch (error) {
        logger.error(`[WS] Error unsubscribing ${subscriptionId}:`, error);
      }
    }

    this.subscriptions.delete(subscriptionId);
    logger.info(`[WS] Removed subscription ${subscriptionId}`);
  }

  private sendSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription || !this.websocket) return;

    try {
      this.websocket.send(
        JSON.stringify({
          jsonrpc: "2.0",
          method: "subscribe",
          id: subscription.id,
          params: { query: subscription.query },
        })
      );
      logger.info(`[WS] Sent subscription for ${subscription.queueName}`);
    } catch (error) {
      logger.error(`[WS] Error sending subscription ${subscriptionId}:`, error);
    }
  }

  private async onOpen() {
    try {
      this.retryCount = 0;
      this.reconnecting = false;

      if (this.inFailoverMode) {
        logger.info(
          `[WS] WebSocket reconnected successfully. Stopping HTTP sync...`
        );
        httpBlockSyncService.stop();
        this.inFailoverMode = false;
      }

      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      logger.info(`[WS] Connected successfully to ${this.url}`);

      this.subscriptions.forEach((_, id) => {
        this.sendSubscription(id);
      });
    } catch (error) {
      logger.error(`[WS] Error in onOpen:`, error);
    }
  }

  private onMessage(event: any) {
    try {
      const message = JSON.parse(event);

      if (message?.result?.query) {
        const { query } = message.result;
        const sub = Array.from(this.subscriptions.values()).find(
          (s) => s.query === query
        );
        if (sub) {
          RabbitMqService.inQueueData(sub.queueName, JSON.stringify(message));
        }
      } else if (message?.result?.data) {
        const eventType = message.result.events?.["tm.event"]?.[0];
        const subscriptionsArr = Array.from(this.subscriptions.values());
        let sub;

        if (eventType === "NewBlock") {
          sub = subscriptionsArr.find((s) => s.query.includes("NewBlock"));
        } else if (eventType === "Tx") {
          sub = subscriptionsArr.find((s) => s.query.includes("Tx"));
        }
        if (sub) {
          RabbitMqService.inQueueData(sub.queueName, JSON.stringify(message));
        }
      }
    } catch (error) {
      logger.error(`[WS] Error parsing message:`, error);
    }
  }

  private async onError(error: any) {
    logger.error(`[WS] WebSocket error:`, error);
    this.reconnect();
  }

  private async onClose(code: number, reason: Buffer) {
    logger.warn(
      `[WS] Connection closed. Code: ${code}, Reason: ${reason.toString("utf-8")}`
    );
    this.reconnect();
  }

  private connect() {
    try {
      if (this.websocket) {
        logger.warn(` WebSocket already exists, cleaning up first...`);
        this.safeCleanup();
      }

      this.websocket = new WebSocket(this.url);
      this.websocket.on("open", () => this.onOpen());
      this.websocket.on("message", (event) => this.onMessage(event));
      this.websocket.on("error", (error) => this.onError(error));
      this.websocket.on("close", (code: number, reason: Buffer) =>
        this.onClose(code, reason)
      );
    } catch (err) {
      logger.error(`[WS] WebSocket connection error:`, err);
      this.reconnect();
    }
  }

  private async reconnect() {
    try {
      if (this.reconnecting) {
        return;
      }

      if (!this.inFailoverMode) {
        logger.warn(`Starting HTTP Block Sync as fallback...`);
        await httpBlockSyncService.start();
        this.inFailoverMode = true;
      }

      this.reconnecting = true;
      this.retryCount++;

      const delay = Math.min(
        this.reconnectInterval * this.retryCount,
        this.maxRetryDelay
      );

      logger.warn(
        `[WS] Retry attempt ${this.retryCount} scheduled in ${delay / 1000
        }s (${new Date(Date.now() + delay).toLocaleTimeString()})`
      );

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      this.safeCleanup();
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        this.reconnecting = false;
        this.connect();
      }, delay);
    } catch (error) {
      logger.error(` Error in reconnect:`, error);
      this.reconnecting = false;
    }
  }

  private safeCleanup() {
    if (!this.websocket) return;
    try {
      const ws = this.websocket;
      this.websocket = null;

      ws.removeAllListeners();
      ws.on("error", () => { });

      const state = ws.readyState;

    if (state === WebSocket.OPEN) {
      try {
        ws.close();
      } catch (error_) {
        logger.debug(`[WS] Error closing WebSocket:`, error_);
        try {
          ws.terminate();
        } catch (error__) {
          logger.debug(`[WS] Terminate failed (safe to ignore):`, error__);
        }
      }
    } else if (state === WebSocket.CONNECTING) {
      try {
        ws.terminate();
      } catch (error_) {
        logger.debug(`[WS] Terminate failed (safe to ignore):`, error_);
      }
    }
  } catch (error_) {
    logger.error(`[WS] Error during cleanup (non-critical):`, error_);
  } finally {
    this.websocket = null;
  }
}
}
