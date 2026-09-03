import {
  REDIS_KEY,
  RES_MSG,
  CONST_NAME,
  FETCH_METHODS,
  HEADERS,
  CURRENT_DEFAULT_APR,
  CURRENT_DEFAULT_COIN_PRICE,
  CURRENT_DEFAULT_CIRCULATING_SUPPLY,
} from "../../constant";
import { GraphData, IESResponse, IGraphResponse } from "../../interfaces/index";
import { calculateData } from "../../libs/calculateAPR.helper";
import logger from "../../libs/logger";
import { redisService } from "../../services";
import blockService from "../block/block.service";
import transactionService from "../transactions/transaction.service";
import validatorService from "../validator/validator.service";
import delegatorService from "../delegator/delegator.service";
import prisma from "../../libs/db";
import { fetchRequest } from "../../libs/utilities/common";
import {
  formatDate,
  fillMissingDatesWithZeroByhr,
  formatDateForDay,
  fillMissingDatesWithZeroByDay,
  formatDateByMin,
  fillMissingMinutes,
  exp,
  formatDateBySec,
  fillMissingSeconds,
  formatDateForYear,
  fillMissingDatesWithZeroByMonth,
} from "../../libs/utilities.helper";
import contractService from "../contract/contract.service";

class ExplorerService {
  async searching(payload: string): Promise<IESResponse> {
    try {
      let txData;

      if (!payload.startsWith("0x") && !isNaN(Number(payload))) {
        const result = await blockService.getBlockByNumber(Number(payload));
        return result;
      } else if (payload?.startsWith("0x") && payload?.length === 66) {
        // Handle transaction hash with '0x'
        const txData = await transactionService.getTransactionByHash(payload);
        if (txData?.error) {
          const result = await blockService.getBlockByHash(payload);
          if (result?.error) result.message = RES_MSG.NOT_FOUND;
          return result;
        }

        return txData;
      } else if (
        payload.startsWith(environment.addressPrefix) &&
        payload.length >= 42 &&
        payload.length <= 50
      ) {
        /* here we search for all transaction specfic to a wallet address*/
        txData = await this.getUserByAddress(payload);
        return txData;
      } else if (
        payload.startsWith(environment.addressPrefix) &&
        payload.length === 64
      ) {
        /* here we search for all transaction specfic to a wallet address*/
        txData = await contractService.getContractByAddress(payload);

        return txData;
      } else {
        throw new Error(RES_MSG.NOT_FOUND);
      }
    } catch (err) {
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.NOT_FOUND };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async getAccountCounts(payloads: {
    time: string;
    interval: number;
  }): Promise<IGraphResponse> {
    try {
      let graphData;
      let finalData;

      let startDate = "";

      if (payloads.time === "d") {
        if (payloads.interval === 1) {
          const currentDate = new Date();

          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1); // Subtract 1 day
          startDate = formatDate(oneDayAgo);
          graphData = (await prisma.$queryRaw`
					SELECT DATE_TRUNC('hour', "createdAt") AS "hour", COUNT(*)::int AS "count"
					FROM "Users"
					WHERE "createdAt" >= ${new Date(startDate)}
					AND "createdAt" <= ${currentDate}
			
					GROUP BY "hour"
					ORDER BY "hour";
					`) as Array<{ hour: Date; count: number }>;

          finalData = await fillMissingDatesWithZeroByhr(
            graphData,
            new Date(startDate),
          );
        } else {
          const currentDate = new Date();

          const daysAgo = payloads.interval;
          const fromDate = new Date(currentDate);
          fromDate.setDate(fromDate.getDate() - daysAgo);
          startDate = formatDateForDay(fromDate);

          graphData = (await prisma.$queryRaw`
				  SELECT DATE_TRUNC('day', "createdAt") AS "day", COUNT(*)::int AS "count"
				  FROM "Users"
				  WHERE "createdAt" >= ${new Date(startDate)}
					AND "createdAt" <= ${currentDate}
					
				  GROUP BY "day"
				  ORDER BY "day";
				`) as Array<{ day: Date; count: number }>;

          finalData = await fillMissingDatesWithZeroByDay(
            graphData,
            new Date(startDate),
            currentDate,
          );
        }
      } else if (payloads.time === "h") {
        const currentDate = formatDateByMin(new Date());

        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - payloads.interval);
        startDate = formatDateByMin(oneHourAgo);
        const graphData = (await prisma.$queryRaw`
				SELECT DATE_TRUNC('minute', "createdAt") AS "hour", COUNT(*)::int AS "count"
				FROM "Users"
				WHERE "createdAt" >= ${new Date(startDate)}
					AND "createdAt" <= ${new Date(currentDate)}
				
				GROUP BY "hour"
				ORDER BY "hour";
				`) as Array<{ hour: Date; count: number }>;

        finalData = await fillMissingMinutes(
          graphData,
          new Date(startDate),
          new Date(currentDate),
        );
      } else if (payloads.time === "y" && payloads.interval === 1) {
        const currentDate = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // Subtract 1 year
        startDate = formatDateForYear(oneYearAgo);

        graphData = (await prisma.$queryRaw`
				SELECT DATE_TRUNC('month', "createdAt") AS "month", COUNT(*)::int AS "count"
				FROM "Users"
				WHERE "createdAt" >= ${new Date(startDate)}
				AND "createdAt" <= ${currentDate}
				GROUP BY "month"
				ORDER BY "month";
			`) as Array<{ month: Date; count: number }>;

        finalData = await fillMissingDatesWithZeroByMonth(
          graphData,
          new Date(startDate),
          currentDate,
        );
      }

      return {
        message: RES_MSG.ACCOUNT_HISTORY_SUCCESS,
        data: {
          finalData: finalData as Array<GraphData>,
          count: await prisma.users.count(),
        },
      };
    } catch (err) {
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async getContractDeployedCount(payloads: {
    time: string;
    interval: number;
  }): Promise<IGraphResponse> {
    try {
      let graphData;
      let finalData;
      let startDate = "";

      if (payloads.time === "d") {
        if (payloads.interval === 1) {
          const currentDate = new Date();

          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1); // Subtract 1 day
          startDate = formatDate(oneDayAgo);

          graphData = (await prisma.$queryRaw`
				   SELECT DATE_TRUNC('hour', "createdAt") AS "hour", COUNT(*)::int AS "count"
				   FROM "Transactions"
				   WHERE "createdAt" >= ${new Date(startDate)}
					AND "createdAt" <= ${currentDate}
					AND "type" = 'CONTRACT_CREATION'
				   GROUP BY "hour"
				   ORDER BY "hour";
				`) as Array<{ hour: Date; count: number }>;
          finalData = await fillMissingDatesWithZeroByhr(
            graphData,
            new Date(startDate),
          );
        } else {
          const currentDate = new Date();

          const daysAgo = payloads.interval;
          const fromDate = new Date(currentDate);
          fromDate.setDate(fromDate.getDate() - daysAgo);
          startDate = formatDateForDay(fromDate);

          graphData = (await prisma.$queryRaw`
				   SELECT DATE_TRUNC('day', "createdAt") AS "day", COUNT(*)::int AS "count"
				   FROM "Transactions"
				   WHERE "createdAt" >= ${new Date(startDate)}
					AND "createdAt" <= ${currentDate}
					AND "type" = 'CONTRACT_CREATION'
				   GROUP BY "day"
				   ORDER BY "day";
				`) as Array<{ day: Date; count: number }>;

          finalData = await fillMissingDatesWithZeroByDay(
            graphData,
            new Date(startDate),
            currentDate,
          );
        }
      } else if (payloads.time === "h") {
        const currentDate = new Date();
        const currentDateModi = formatDateByMin(new Date());
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - payloads.interval);
        startDate = formatDateByMin(oneHourAgo);
        graphData = (await prisma.$queryRaw`
				SELECT DATE_TRUNC('minute', "createdAt") AS "hour", COUNT(*)::int AS "count"
				FROM "Transactions"
				WHERE "createdAt" >= ${new Date(startDate)}
					AND "createdAt" <= ${currentDate}
					AND "type" = 'CONTRACT_CREATION'
				GROUP BY "hour"
				ORDER BY "hour";
				`) as Array<{ hour: Date; count: number }>;
        finalData = await fillMissingMinutes(
          graphData,
          new Date(startDate),
          new Date(currentDateModi),
        );
      } else if (payloads.time === "y" && payloads.interval === 1) {
        const currentDate = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // Subtract 1 year
        startDate = formatDateForYear(oneYearAgo);

        graphData = (await prisma.$queryRaw`
				SELECT DATE_TRUNC('month', "createdAt") AS "month", COUNT(*)::int AS "count"
				FROM "Transactions"
				WHERE "createdAt" >= ${new Date(startDate)}
				AND "createdAt" <= ${currentDate}
				AND "type" = 'CONTRACT_CREATION'
				GROUP BY "month"
				ORDER BY "month";
			`) as Array<{ month: Date; count: number }>;

        finalData = await fillMissingDatesWithZeroByMonth(
          graphData,
          new Date(startDate),
          currentDate,
        );
      }

      return {
        message: RES_MSG.TRANSACTION_HISTORY_SUCCESS,
        data: {
          finalData: finalData as Array<GraphData>,
          count: await prisma.contracts.count(),
        },
      };
    } catch (err) {
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async getAddressDetail(address: string): Promise<IESResponse> {
    try {
      const user = await prisma.users.findFirst({
        where: {
          address: address,
        },
        select: {
          txn: true,
        },
      });

      let txnCount = user ? user.txn : "";

      // Check if USER_BALANCE is in Redis
      let userBalance = await redisService.getString(REDIS_KEY.USER_BALANCE);
      try {
        const response = await fetchRequest(
          `${environment.swaggerHttpUrl}/cosmos/bank/v1beta1/spendable_balances/${address}`,
          FETCH_METHODS.GET,
          HEADERS.DEFAULT,
        );

        // Find the entry with symbol
        const amount = response.data?.balances.find(
          (item: any) =>
            item.denom === (environment.symbol || "").toLowerCase(),
        );

        userBalance = amount?.amount;

        // Store userBalance in Redis
        await redisService.setString(REDIS_KEY.USER_BALANCE, userBalance);
      } catch (error) {
        logger.error("Error fetching balance:", error);
        userBalance = "";
      }
      const actualBalance = userBalance
        ? (Number(userBalance) / Math.pow(10, 18)).toString()
        : "";

      let marketCapPrice = await redisService.getString(
        CONST_NAME.MARKET_CAP_PRICE,
      );

      let value: string;
      if (!marketCapPrice) {
        const latestEntry = await prisma.coinmarketInfo.findFirst({
          orderBy: {
            id: "desc",
          },
          select: {
            price: true,
          },
        });

        const price = latestEntry?.price?.toString() ?? "";
        value = price ? (Number(price) * Number(actualBalance)).toString() : "";
      } else {
        marketCapPrice = JSON.parse(marketCapPrice);

        value =
          marketCapPrice?.price && actualBalance
            ? (Number(marketCapPrice?.price) * Number(actualBalance)).toString()
            : "";
      }

      // Classify the address: validator takes precedence over delegator
      // (a validator self-delegates, so it also has a delegator record).
      let type = "normal";
      let validatorData: any = null;
      let delegatorData: any = null;

      const validatorRes = await validatorService.getValidatorDetails(address);
      if (
        !validatorRes.error &&
        validatorRes.data &&
        Object.keys(validatorRes.data).length > 0
      ) {
        type = "validator";
        validatorData = validatorRes.data;
      } else {
        const delegatorRes =
          await delegatorService.getDelegatorByAddress(address);
        if (
          !delegatorRes.error &&
          delegatorRes.data &&
          Object.keys(delegatorRes.data).length > 0
        ) {
          type = "delegator";
          delegatorData = delegatorRes.data;
        }
      }

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          coinBalance: exp(actualBalance),
          value: exp(value),
          transactionCount: Number(txnCount),
          type,
          ...(validatorData ? { validator: validatorData } : {}),
          ...(delegatorData ? { delegator: delegatorData } : {}),
        },
      };
    } catch (err) {
      logger.error("Error in getAddressDetail:", err);

      return {
        error: true,
        message: RES_MSG.ERROR,
      };
    }
  }

  async tpsHistory(payloads: {
    time: string;
    interval: number;
  }): Promise<IGraphResponse> {
    try {
      let graphData;
      let finalData;
      let startDate = "";

      if (payloads.time === "d") {
        if (payloads.interval === 1) {
          const currentDate = new Date();

          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1); // Subtract 1 day
          startDate = formatDate(oneDayAgo);
          graphData = (await prisma.$queryRaw`
				SELECT DATE_TRUNC('hour', "createdAt") AS "hour", COUNT(*)::int AS "count"
				FROM "Transactions"
				WHERE "createdAt" >= ${new Date(startDate)}
				AND "createdAt" <= ${currentDate}
		
				GROUP BY "hour"
				ORDER BY "hour";
				`) as Array<{ hour: Date; count: number }>;

          finalData = await fillMissingDatesWithZeroByhr(
            graphData,
            new Date(startDate),
          );
        } else {
          const currentDate = new Date();

          const daysAgo = payloads.interval;
          const fromDate = new Date(currentDate);
          fromDate.setDate(fromDate.getDate() - daysAgo);
          startDate = formatDateForDay(fromDate);

          graphData = (await prisma.$queryRaw`
			  SELECT DATE_TRUNC('day', "createdAt") AS "day", COUNT(*)::int AS "count"
			  FROM "Transactions"
			  WHERE "createdAt" >= ${new Date(startDate)}
				AND "createdAt" <= ${currentDate}
				
			  GROUP BY "day"
			  ORDER BY "day";
			`) as Array<{ day: Date; count: number }>;

          finalData = await fillMissingDatesWithZeroByDay(
            graphData,
            new Date(startDate),
            currentDate,
          );
        }
      } else if (payloads.time === "y" && payloads.interval === 1) {
        const currentDate = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1); // Subtract 1 year
        startDate = formatDateForYear(oneYearAgo);

        graphData = (await prisma.$queryRaw`
				SELECT DATE_TRUNC('month', "createdAt") AS "month", COUNT(*)::int AS "count"
				FROM "Transactions"
				WHERE "createdAt" >= ${new Date(startDate)}
				AND "createdAt" <= ${currentDate}
				GROUP BY "month"
				ORDER BY "month";
			`) as Array<{ month: Date; count: number }>;

        finalData = await fillMissingDatesWithZeroByMonth(
          graphData,
          new Date(startDate),
          currentDate,
        );
      }

      return {
        message: RES_MSG.TRANSACTION_HISTORY_SUCCESS,
        data: {
          finalData: finalData as Array<GraphData>,
          count: await prisma.transactions.count(),
        },
      };
    } catch (err) {
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async getUserByAddress(address: string): Promise<IESResponse> {
    try {
      const user = await prisma.users.findFirst({
        where: {
          address: address,
        },
        select: {
          address: true,
        },
      });
      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          addresses: user,
        },
      };
    } catch (err) {
      logger.error("Error in getUserByAddress:", err);

      return {
        error: true,
        message: RES_MSG.ERROR,
      };
    }
  }

  async dashboard(): Promise<IESResponse> {
    try {
      const data: any = await calculateData();
      const latestBlock = await redisService.getString(REDIS_KEY.LATEST_BLOCK);
      const transactionCount = await redisService.getString(
        REDIS_KEY.NATIVE_TRANSACTIONS_COUNT,
      );
      let marketCap = await redisService.getString(REDIS_KEY.MARKET_CAP);
      const tokenPrice =
        (await redisService.getString(REDIS_KEY.COIN_PRICE)) ??
        CURRENT_DEFAULT_COIN_PRICE;
      const circulationSupply = CURRENT_DEFAULT_CIRCULATING_SUPPLY;
      if (marketCap === "0" || !marketCap) {
        marketCap ??= tokenPrice * circulationSupply;
      }
      const userCount = await prisma.users.count();

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          apy: data?.apy ? Number(data?.apy) : CURRENT_DEFAULT_APR,
          inflation: data.inflation,
          totalSupply: data.totalSupply,
          totalValidator: data.totalValidator,
          circulation_supply: circulationSupply,
          apr: data?.apr ? Number(data?.apr) : CURRENT_DEFAULT_APR,
          tokenPrice: tokenPrice ?? CURRENT_DEFAULT_COIN_PRICE,
          validators: data?.validator ?? 0,
          circulationSupply: circulationSupply,
          latest_block: latestBlock,
          total_transactions: transactionCount,
          total_accounts: userCount,
          bondedTokens: data?.bondedTokens ? Number(data.bondedTokens) : 0,
          bondedRate: data?.bondedRate,
          marketCap,
        },
      };
    } catch (err) {
      logger.error("Error in dashboard data:", err);
      return { error: true, message: RES_MSG.NOT_FOUND };
    }
  }
}

export default new ExplorerService();
