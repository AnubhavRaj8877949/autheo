import { FETCH_METHODS, HEADERS, QUEUE_NAME, REDIS_KEY, SOCKET_EVENT } from "../constant";
import { ChainRpcClient } from "../libs/chainClient.helper";
import dbHelper from "../libs/db.helper";
import processHelper from "../libs/process.helper";
import { IBlock } from "../interface";
import { prisma } from "../libs/db";
import logger from "../libs/logger";
import { fetchRequest, parseTx } from "../libs/utility/common";
import redisHelper from "./redis.service";
import rabbitmqService from "./rabbitmq.service";
import { RabbitMqService, RedisService, SocketEventEmitter } from ".";

const SYNC_INTERVAL_MS = 4000; // 4 sec

class HttpBlockSyncService {
  private interval: NodeJS.Timeout | null = null;

  private lastSyncedBlock = 0;

  private isRunning = false;

  private isTickRunning = false;

  private readonly chainRpcProvider: ChainRpcClient;

  constructor() {
    this.chainRpcProvider = ChainRpcClient.getInstance();
  }

  async start() {
    if (this.isRunning) {
      logger.warn("HTTP Block Sync already running.");
      return;
    }

    this.isRunning = true;
    logger.info("Starting HTTP Block Sync Service...");

    await this.safeTick();

    this.interval = setInterval(() => {
      this.safeTick().catch((err) =>
        logger.error("HTTP Sync interval crash", err)
      );
    }, SYNC_INTERVAL_MS);
  }

  stop() {
    if (!this.isRunning) return;

    logger.info("Stopping HTTP Block Sync Service...");
    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async safeTick() {
    if (!this.isRunning) return;

    if (this.isTickRunning) {
      logger.warn("Previous HTTP sync still running, skipping tick...");
      return;
    }

    this.isTickRunning = true;

    try {
      const latestBlock = await this.fetchLatestBlockHeight();
      if (!latestBlock) return;

      await this.syncMissingBlocks(latestBlock);
      await this.processLatestBlock();
    } catch (err) {
      logger.error("HTTP Sync tick failed", err);
    } finally {
      this.isTickRunning = false;
    }
  }


  private async fetchLatestBlockHeight(): Promise<number | null> {
    try {
      const url = `${environment.httpHost}/block?height`;
      const fetchRes = await fetchRequest(
        url,
        FETCH_METHODS.GET,
        HEADERS.DEFAULT,
        null
      );

      if (fetchRes?.error) {
        logger.error("Failed to fetch latest block", fetchRes);
        return null;
      }

      const height = Number(fetchRes?.data?.result?.block?.header?.height);

      if (!height || Number.isNaN(height)) {
        logger.error("Invalid block height from RPC", {
          height: fetchRes?.data?.result?.block?.header?.height,
        });
        return null;
      }
      return height;
    } catch (err) {
      logger.error("HTTP error while fetching latest block", err);
      return null;
    }
  }

  private async processLatestBlock() {
    try {
      const url = `${environment.httpHost}/block?height=`;
      const fetchRes = await fetchRequest(
        url,
        FETCH_METHODS.GET,
        HEADERS.DEFAULT,
        null
      );
      const blockTxData = fetchRes?.data;
      const header = blockTxData?.result?.block?.header;
      const block = fetchRes?.data?.result?.block;

      if (!block) {
        logger.error("Block missing in RPC response", fetchRes?.data);
        return;
      }

      const { height, time, proposer_address } = header;

      const validatorOperatorAddress =
        await this.chainRpcProvider.tendermintValAddressToValoperAddress(
          proposer_address
        );

      const miner = this.chainRpcProvider.getDelegatorAddress(
        validatorOperatorAddress
      );

      const transactionCount = blockTxData?.txs?.length ?? 0;

      const blockDetails = {
        miner,
        validatorOperatorAddress,
        blocknumber: height,
        timestamp: time ?? "",
        transactionCount,
      };

      // Parallel tasks
      const [analytics] = await Promise.allSettled([
        dbHelper.getAnalytics(),
        dbHelper.getNodeEarning(height),
      ]);

      // Emit TX summary
      const totalTx = await prisma.transactions.count();
      SocketEventEmitter.emitMessage(SOCKET_EVENT.TX_SUMMARY, {
        tpb: transactionCount,
        totalTx,
      });

      if (analytics.status === "fulfilled") {
        SocketEventEmitter.emitMessage(SOCKET_EVENT.ANALYTICS, analytics.value);
      }

      // Fetch block hash (already available in HTTP response normally)
      const blockHash = block?.last_commit?.block_id?.hash
        ? `0x${block.last_commit.block_id.hash}`
        : "";

      const blockDataToSave: IBlock = {
        ...blockDetails,
        blockhash: blockHash,
      };

      // Emit latest block socket
      SocketEventEmitter.emitMessage(
        SOCKET_EVENT.NATIVE_LATEST_BLOCK,
        blockDataToSave
      );

      for (
        let i = 0;
        i < fetchRes?.data?.result?.block?.data?.txs.length || 0;
        i++
      ) {
        const element = fetchRes?.data?.result?.block?.data?.txs[i];
        const hash = parseTx(element);
        // add key in  data 
        const txData = {
          ...hash,
          dataEmit: true
        };
        rabbitmqService.inQueueData(QUEUE_NAME.DOWNTIME_TXS, txData);
      }


      const saveRes = await dbHelper.saveBlockData(blockDataToSave);

      if (saveRes?.error) {
        throw new Error(`Error saving block data: ${saveRes.error}`);
      }

      await Promise.all([
        processHelper.updateBlockCount(),
        dbHelper.upsertValidatorsCount(
          blockDataToSave.validatorOperatorAddress,
          blockDataToSave.miner
        ),
        RedisService.setString(REDIS_KEY.LATEST_BLOCK, height.toString()),
      ]);


      this.lastSyncedBlock = height;
      logger.info(`Latest block processed: ${height}`);
    } catch (err) {
      logger.error("Error while processing latest block", err);
    }
  }

  private async syncMissingBlocks(latestBlock: number) {
    try {
      const redisBlock =
        Number(await redisHelper.getString(REDIS_KEY.LATEST_BLOCK)) || 0;

      const diff = latestBlock - redisBlock;


      if (diff <= 1) return;

      for (let block = redisBlock + 1; block < latestBlock; block++) {
        if (!this.isRunning) break;

        try {
          RabbitMqService.inQueueData(
            QUEUE_NAME.DOWNTIME_BLOCK,
            block.toString()
          );
          this.lastSyncedBlock = block;
          logger.info(`Queued missing block: ${block}`);
        } catch (err) {
          logger.error(`Failed to queue block ${block}`, err);
        }
      }
    } catch (err) {
      logger.error("Error while syncing missing blocks", err);
    }
  }
}

export const httpBlockSyncService = new HttpBlockSyncService();
