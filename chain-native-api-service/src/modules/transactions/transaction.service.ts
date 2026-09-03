import prisma from "../../libs/db";
import { ICreateTransaction, IESResponse } from "../../interfaces";
import { REDIS_KEY, RES_MSG } from "../../constant";
import { convertBigIntToNumber } from "../../libs/common.helper";
import { redisService } from "../../services";
import logger from "../../libs/logger";

class TransactionService {
  /**
   * get all transaction
   * @param data
   * @returns
   */
  async getAllTransactions_1(data: {
    page?: number;
    limit: number;
  }): Promise<IESResponse> {
    try {
      const isFirstPage = data.page === 1;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const [transactions, previous30DaysTrxn] = await prisma.$transaction([
        prisma.transactions.findMany({
          orderBy: {
            createdAt: "desc",
          },
          where: isFirstPage ? {} : { id: { lt: data.page } },
          take: data.limit,
        }),
        prisma.transactions.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo, // Greater than or equal to 30 days ago
            },
          },
        }),
      ]);

      const transactionCount = await redisService.getString(
        REDIS_KEY.NATIVE_TRANSACTIONS_COUNT,
      );
      if (!transactions?.length) throw new Error(RES_MSG.NOT_FOUND);
      const nextCursor =
        transactions.length === data.limit
          ? convertBigIntToNumber(transactions)[transactions.length - 1].id
          : null;
      const prevCursor = isFirstPage
        ? null
        : data.page && transactions.length > 0
          ? convertBigIntToNumber(transactions)[0].id + 11
          : null;

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          count: transactionCount,
          transactions: convertBigIntToNumber(transactions),
          nextCursor,
          prevCursor,
          previous30DaysTrxn,
        },
      };
    } catch (err) {
      logger.error("Error in getAllTransactions:", err);

      if (err instanceof Error) {
        if (err.message.includes("prisma")) {
          return { error: true, message: RES_MSG.SERVER_ERROR };
        }
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  /**
   * get transaction details
   * @param address
   * @returns
   */
  async getTransactionsByAddress(data: {
    page: number;
    limit: number;
    address: string;
  }): Promise<IESResponse> {
    try {
      const [transactions, transactionCount] = await prisma.$transaction([
        prisma.transactions.findMany({
          orderBy: {
            createdAt: "desc",
          },
          where: {
            OR: [
              {
                fromAddress: data.address,
              },
              {
                toAddress: data.address,
              },
            ],
          },

          skip: data.page * data.limit,
          take: data.limit,
        }),
        prisma.transactions.count({
          where: {
            OR: [
              {
                fromAddress: data.address,
              },
              {
                toAddress: data.address,
              },
            ],
          },
        }),
      ]);
      if (!transactions?.length) {
        return {
          message: RES_MSG.NOT_FOUND,
          data: {
            addresses: [],
            count: 0,
            transactions: [],
            isContractAddress: false,
          },
        };
      }
      const updatedTransactions = convertBigIntToNumber(transactions);

      const isContractAddress = updatedTransactions.some(
        (transaction) => transaction.contractAddress === data.address,
      );

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          addresses: convertBigIntToNumber(transactions),
          transactions: convertBigIntToNumber(transactions),
          count: transactionCount,
          isContractAddress,
        },
      };
    } catch (err) {
      logger.error("Error in getTransactionsByAddress:", err);
      if (err instanceof Error) {
        if (err.message.includes("prisma")) {
          return { error: true, message: RES_MSG.SERVER_ERROR };
        }
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async getTransactionByHash(txHash: string): Promise<IESResponse> {
    try {
      let transactionData = await prisma.transactions.findUnique({
        where: { txhash: txHash },
      });
      transactionData = convertBigIntToNumber([transactionData])[0];
      if (!transactionData) throw new Error(RES_MSG.NOT_FOUND);
      return {
        message: RES_MSG.TRANSACTION_FETCH_SUCCESS,
        data: {
          transaction: transactionData,
        },
      };
    } catch (err) {
      logger.error("Error in getTransactionByHash:", err);
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.ERROR };
      } else {
        return { error: true, message: RES_MSG.ERROR };
      }
    }
  }

  async getTransactionByBlock(payloads: {
    page: number;
    limit: number;
    value: string;
  }): Promise<IESResponse> {
    try {
      let blockNumber: number | undefined;
      let transactionData;
      let txCount;

      // Determine if the input is a block hash or a block number
      if (payloads.value.startsWith("0x") && payloads.value.length === 66) {
        // Query block number from block hash
        const block = await prisma.blocks.findUnique({
          where: { blockhash: payloads.value },
          select: { blocknumber: true },
        });

        if (!block) {
          return { error: true, message: RES_MSG.NOT_VALID_QUERY };
        }

        blockNumber = Number(block.blocknumber);
      } else {
        blockNumber = +payloads.value;
      }

      // Fetch transactions based on the determined block number
      transactionData = await prisma.transactions.findMany({
        where: { blocknumber: blockNumber },
        orderBy: { createdAt: "desc" },
        skip: payloads.page * payloads.limit,
        take: payloads.limit,
      });

      if (transactionData.length === 0) {
        return {
          message: RES_MSG.TRANSACTION_NOT_FOUND,
          data: {
            transaction: [],
            count: 0,
          },
        };
        // throw new Error(RES_MSG.TRANSACTION_NOT_FOUND);
      }

      // Get transaction count
      txCount = await prisma.blocks.findUnique({
        select: { transactionCount: true },
        where: { blocknumber: blockNumber },
      });

      return {
        message: RES_MSG.BLOCK_TRANSACTION_FETCH,
        data: {
          transaction: convertBigIntToNumber(transactionData),
          count: txCount
            ? convertBigIntToNumber([txCount])[0].transactionCount
            : 0,
        },
      };
    } catch (err) {
      logger.error("Error in getTransactionByHash:", err);

      if (err instanceof Error) {
        if (err.message.includes("prisma")) {
          return { error: true, message: RES_MSG.SERVER_ERROR };
        }
        return { error: true, message: RES_MSG.ERROR };
      } else {
        return { error: true, message: RES_MSG.ERROR };
      }
    }
  }

  /**
   * Create a new transaction
   * @param data
   * @returns
   */
  async createTransaction(
    txHash: string,
    data: ICreateTransaction,
  ): Promise<IESResponse> {
    try {
      let currentDate = Date.now().toString();

      const createdTransaction = await prisma.transactions.create({
        data: {
          type: data.type || "",
          status: data.status || "",
          txString: data.txString || "",
          blocknumber: data.blocknumber || 0,
          txhash: txHash || "",
          timestamp: currentDate || "",
          fromAddress: data.fromAddress || "",
          toAddress: data.toAddress || "",
          gasWanted: data.gasWanted || 0,
          txFee: data.txFee || "",
          value: data.value || "0",
        },
      });
      // Convert BigInt values to strings or numbers
      const processedTransaction = {
        ...createdTransaction,
        blocknumber: createdTransaction.blocknumber.toString(), // Convert to string
        gasWanted: Number(createdTransaction.gasWanted), // Convert to number
        txFee: Number(createdTransaction.txFee), // Convert to number
      };
      return {
        message: RES_MSG.TRANSACTION_CREATE_SUCCESS,
        data: processedTransaction,
      };
    } catch (err) {
      if (err instanceof Error) {
        logger.error("Error creating transaction:", err);
        if (err.message.includes("prisma")) {
          return { error: true, message: RES_MSG.TRANSACTION_FAILED };
        }
        return { error: true, message: RES_MSG.ERROR };
      } else {
        return { error: true, message: RES_MSG.ERROR };
      }
    }
  }

  async getAllTransactions(data: {
    page: number;
    limit: number;
    order: any;
  }): Promise<IESResponse> {
    try {
      let transactionsData: any;
      let maxId: any = 0;
      let minId: any = 0;
      let transactionCount = await redisService.getString(
        REDIS_KEY.NATIVE_TRANSACTIONS_COUNT,
      );

      if (!transactionCount) {
        transactionCount = await prisma.transactions.count();
      }
      if (data.order === "asc") {
        transactionsData = await this.ascPagination(data.page, data.limit);
        const result = await prisma.transactions.aggregate({
          _max: {
            id: true, // Replace 'id' with your desired column
          },
        });

        maxId = result._max.id;
      } else {
        transactionsData = await this.descPagination(data.page, data.limit);
        minId = await prisma.transactions.findMany({
          select: {
            id: true, // Replace 'id' with your desired column
          },
          orderBy: {
            id: "asc",
          },
          take: (transactionCount % data.limit) + 1 || data.limit + 1,
        });
      }

      const { transactions, nextCursor, prevCursor } = transactionsData;
      let nextCursorValue: number | null = nextCursor;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [getActiveAccount, previous30DaysTrxn] = await Promise.all([
        prisma.$queryRaw`
 					SELECT COUNT(DISTINCT "fromAddress") AS "count" FROM "Transactions" WHERE "timestamp" >= CAST(${todayStart.toISOString()} AS timestamp) AND "timestamp" <= CAST(${new Date().toISOString()} AS timestamp)`,
        prisma.transactions.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo, // Greater than or equal to 30 days ago
            },
          },
        }),
      ]);
      // Query the count of transactions
      const activeAccount: any = convertBigIntToNumber(getActiveAccount);
      if (!transactions.length) throw new Error(RES_MSG.TRANSACTION_NOT_FOUND);

      if (data.order === "asc") {
        if (maxId === data.page + data.limit) {
          nextCursorValue = null;
        }
      } else if (data.order === "desc") {
        if (transactionCount === nextCursor || nextCursor === 1) {
          nextCursorValue = null;
        }
      }

      const offset = transactionCount % data.limit || data.limit;
      const lastPage =
        data.order === "asc" ? maxId - offset : minId[minId.length - 1].id;
      return {
        message: RES_MSG.TRANSACTION_FETCH_SUCCESS,
        data: {
          count: transactionCount,
          transactions: convertBigIntToNumber(transactions),
          nextCursor: nextCursorValue,
          prevCursor,
          previous30DaysTrxn,
          activeAccount: activeAccount ? activeAccount[0].count : 0,
          lastPage,
        },
      };
    } catch (err) {
      logger.error("Error fetching transactions:", err);
      if (err instanceof Error) {
        if (err.message.includes("prisma")) {
          return { error: true, message: RES_MSG.SERVER_ERROR };
        }
        return { error: true, message: RES_MSG.ERROR };
      } else {
        return { error: true, message: RES_MSG.ERROR };
      }
    }
  }

  ascPagination = async (page: number, limit: number) => {
    const isFirstPage = page === 1;
    const transactions = await prisma.transactions.findMany({
      select: {
        id: true,
        blocknumber: true,
        txhash: true,
        contractAddress: true,
        status: true,
        type: true,
        timestamp: true,
        fromAddress: true,
        toAddress: true,
        txFee: true,
        value: true,
        createdAt: true,
        gasWanted: true,
        gasUsed: true,
      },
      orderBy: {
        id: "asc",
      },
      where: isFirstPage ? {} : { id: { gt: page } },
      take: limit,
    });

    const nextCursor =
      transactions.length === limit
        ? convertBigIntToNumber(transactions)[transactions.length - 1].id
        : null;
    const prevCursor = isFirstPage
      ? null
      : page && transactions.length > 0
        ? convertBigIntToNumber(transactions)[0].id - (limit + 1)
        : null;

    return {
      transactions,
      nextCursor,
      prevCursor: prevCursor === 0 ? 1 : prevCursor,
    };
  };

  /**
   * handle the desc pagination according to id
   * @param page
   * @param limit
   * @returns
   */
  descPagination = async (page: number, limit: number) => {
    const isFirstPage = page === 1;

    const transactions = await prisma.transactions.findMany({
      select: {
        id: true,
        blocknumber: true,
        txhash: true,
        contractAddress: true,
        status: true,
        type: true,
        timestamp: true,
        fromAddress: true,
        toAddress: true,
        gasWanted: true,
        txFee: true,
        value: true,
        createdAt: true,
        gasUsed: true,
      },
      orderBy: {
        id: "desc",
      },
      where: isFirstPage ? {} : { id: { lt: page } },
      take: limit,
    });

    const nextCursor =
      transactions.length === limit
        ? convertBigIntToNumber(transactions)[transactions.length - 1].id
        : null;
    const prevCursor = isFirstPage
      ? null
      : page && transactions.length > 0
        ? convertBigIntToNumber(transactions)[0].id + (limit + 1)
        : null;

    return { transactions, nextCursor, prevCursor };
  };
}
export default new TransactionService();
