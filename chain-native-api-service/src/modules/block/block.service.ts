import prisma from "../../libs/db";
import { rabbitMqService, redisService } from "../../services/index";
import { fetchRequest, isOnlyNumbers } from "../../libs/utilities/common";
import { IBlock, IESResponse } from "../../interfaces/index";
import { convertBigIntToNumber } from "../../libs/common.helper";
import { RES_MSG, QUEUE_NAME, REDIS_KEY } from "../../constant";
import { ChainRpcClient } from "../../libs/chainRpcClient.helper";
import { cursorPagination, serializeBigInt } from "../../libs/utilities.helper";
import logger from "../../libs/logger";

class BlockService {
  rpcClient: ChainRpcClient;

  constructor() {
    this.rpcClient = ChainRpcClient.getInstance();
  }

  async getBlockByHash(hash: string): Promise<IESResponse> {
    try {
      let blockDetailsByHash = await prisma.blocks.findUnique({
        where: {
          blockhash: hash,
        },
      });

      if (!blockDetailsByHash) {
        const url = `${environment.nativeRpcHttpUrl}/block_by_hash?hash=${hash}`;
        const fetchRes = await fetchRequest(url, "GET", null);

        if (fetchRes?.error || !fetchRes?.data?.result?.block) {
          return {
            message: RES_MSG.NOT_FOUND,
            data: {
              block: [],
            },
          };
        }
        const validatorOperatorAddress =
          <string>(
            await this.rpcClient.consensusAddressToOperatorAddress(
              fetchRes?.data.result.block?.header?.proposer_address,
            )
          ) || "";

        const miner =
          <string>(
            await this.rpcClient.getDelegatorAddress(validatorOperatorAddress)
          ) || "";

        const blockData: IBlock = {
          miner,
          validatorOperatorAddress,
          blocknumber: fetchRes?.data.result.block?.header?.height,
          blockhash: hash,
          timestamp: fetchRes?.data.result?.block?.header?.time || "",
          transactionCount: fetchRes.data.result?.block?.data?.txs?.length,
        };

        rabbitMqService.inQueueData(
          QUEUE_NAME.MISSED_BLOCK,
          JSON.stringify(blockData),
        );
        return {
          message: RES_MSG.FETCH_SUCCESS,
          data: {
            block: convertBigIntToNumber([blockData])[0],
          },
        };
      }
      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          block: convertBigIntToNumber([blockDetailsByHash])[0],
        },
      };
    } catch (err) {
      logger.error("Error in getBlockByHash:", err);
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async getBlockByNumber(blockNumber: number): Promise<IESResponse> {
    try {
      let blockDetail: any = await prisma.blocks.findUnique({
        where: {
          blocknumber: blockNumber,
        },
      });

      if (!blockDetail) {
        const url = `${environment.nativeRpcHttpUrl}/block?height=${blockNumber}`;
        const fetchRes = await fetchRequest(url, "GET", null);

        if (fetchRes.error) {
          return {
            message: RES_MSG.NOT_FOUND,
            data: {},
          };
        }

        const validatorOperatorAddress: string =
          <string>(
            await this.rpcClient.consensusAddressToOperatorAddress(
              fetchRes?.data.result.block?.header?.proposer_address,
            )
          ) || "";

        const miner =
          <string>(
            await this.rpcClient.getDelegatorAddress(validatorOperatorAddress)
          ) || "";

        const blockHash = fetchRes?.data?.result?.block_id?.hash;
        const dataToSave: IBlock = {
          miner,
          validatorOperatorAddress,
          blocknumber: Number(blockNumber),
          blockhash: blockHash
            ? `0x${fetchRes?.data?.result?.block_id?.hash}`
            : "",
          timestamp: fetchRes?.data.result.block?.header?.time || "",
          transactionCount: fetchRes?.data.result.block?.data?.txs?.length || 0,
        };
        rabbitMqService.inQueueData(
          QUEUE_NAME.MISSED_BLOCK,
          JSON.stringify(dataToSave),
        );
        return {
          message: RES_MSG.FETCH_SUCCESS,
          data: { block: convertBigIntToNumber([dataToSave])[0] },
        };
      }

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: { block: convertBigIntToNumber([blockDetail])[0] },
      };
    } catch (err) {
      logger.error("Error in getBlockByNumber:", err);

      if (err instanceof Error) {
        if (err.message.includes("prisma")) {
          return { error: true, message: RES_MSG.SERVER_ERROR };
        }
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async getBlockDetails(blockIdentity: string): Promise<IESResponse> {
    try {
      const onlyNumDigits = isOnlyNumbers(blockIdentity);
      let blockDetail;
      if (!onlyNumDigits) {
        blockDetail = await this.getBlockByHash(blockIdentity);
      } else {
        blockDetail = await this.getBlockByNumber(Number(blockIdentity));
      }

      return blockDetail;
    } catch (err) {
      logger.error("Error in getBlockDetails:", err);

      if (err instanceof Error) {
        if (err.message.includes("prisma")) {
          return { error: true, message: RES_MSG.SERVER_ERROR };
        }
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async getLatestBlock(): Promise<IESResponse> {
    try {
      const blockRes = await fetchRequest(
        `${environment.nativeRpcHttpUrl}/block`,
        "GET",
        null,
      );
      if (blockRes.error) {
        throw new Error(RES_MSG.ERROR_FETCH_LATEST_BLOCK);
      }

      const validatorOperatorAddress: string =
        <string>(
          await this.rpcClient.consensusAddressToOperatorAddress(
            blockRes?.data.result.block?.header?.proposer_address,
          )
        ) || "";
      const miner =
        <string>(
          await this.rpcClient.getDelegatorAddress(validatorOperatorAddress)
        ) || "";

      const bHash = blockRes?.data?.result?.block_id?.hash;
      const dataToSend: IBlock = {
        miner,
        validatorOperatorAddress,
        blockhash: bHash ? `0x${bHash}` : "",
        timestamp: blockRes?.data.result.block?.header?.time || "",
        transactionCount: blockRes?.data.result.block?.data?.txs?.length || 0,
        blocknumber: Number(blockRes?.data?.result?.block?.header?.height),
      };
      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: dataToSend,
      };
    } catch (err) {
      logger.error("Error in getLatestBlock:", err);
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async getAllLatestBlock(data: {
    page: number;
    limit: number;
    order: any;
    filterBy: string;
  }): Promise<IESResponse> {
    try {
      let isLimitFulfilled = true;

      let zerothElement = 0;
      const isFirstPage = data.page === 1;
      let blocks = await prisma.blocks.findMany({
        orderBy: {
          blocknumber: data.order,
        },
        where: isFirstPage
          ? {}
          : {
              blocknumber:
                data.order === "asc" ? { gt: data.page } : { lt: data.page },
            },
        take: data.limit,
      });

      if (blocks.length < data.limit) {
        isLimitFulfilled = false;
      }
      if (!blocks?.length) throw new Error(RES_MSG.ERROR_FETCH_LATEST_BLOCK);

      let blockCount = await redisService.getString(
        REDIS_KEY.NATIVE_BLOCKS_COUNT,
      );

      if (!blockCount) {
        const result = await prisma.blocks.aggregate({
          _count: {
            blocknumber: true,
          },
        });
        blockCount = result._count.blocknumber;
        await redisService.setString(
          REDIS_KEY.NATIVE_BLOCKS_COUNT,
          blockCount.toString(),
        );
      }

      const blockCountData = await prisma.blocks.aggregate({
        _min: { blocknumber: true },
        _max: { blocknumber: true },
      });

      const minimumId: number = Number(blockCountData?._min.blocknumber);
      const maximumId: number = Number(blockCountData?._max.blocknumber);

      zerothElement = serializeBigInt(blocks[0].blocknumber);

      if (!blocks?.length) throw new Error(RES_MSG.ERROR_FETCH_LATEST_BLOCK);
      const lastPageResult = await prisma.blocks.findMany({
        select: {
          blocknumber: true,
        },
        orderBy: {
          blocknumber:
            data.filterBy === "newest" || !data.filterBy ? "asc" : "desc",
        },
        where: {
          blocknumber:
            data.filterBy === "newest" || !data.filterBy
              ? { gt: minimumId }
              : { lt: maximumId },
        },
        take: blockCount % data.limit || data.limit,
      });
      const offset: number = blockCount % data.limit || data.limit;

      const lastPage = serializeBigInt(
        lastPageResult[lastPageResult.length - 1].blocknumber,
      );

      const cursorPages = cursorPagination(
        blocks,
        data.order,
        data.filterBy,
        data.limit,
        "blocknumber",
        blockCount,
        maximumId,
        minimumId,
      );

      return {
        message: RES_MSG.BLOCK_TRANSACTION_FETCH,
        data: {
          blockCount: Number(blockCount),
          blocks: convertBigIntToNumber(cursorPages.sortedResults),
          nextCursor:
            blocks.length < data.limit
              ? null
              : serializeBigInt(cursorPages.nextCursor),
          prevCursor: serializeBigInt(cursorPages.previousCursor),
          lastPage: lastPage,
        },
      };
    } catch (err) {
      logger.error("Error in getAllLatestBlock:", err);
      if (err instanceof Error) {
        if (err.message.includes("prisma")) {
          return { error: true, message: RES_MSG.SERVER_ERROR };
        }
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }
}

export default new BlockService();
