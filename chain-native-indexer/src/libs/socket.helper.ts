import { REDIS_KEY, SOCKET_EVENT } from "../constant";
import SocketEventEmitter from "../services/socket-events.service";
import {
  fillMissingDatesWithZeroByhr,
  fillMissingMinutes,
  fillMissingSeconds,
  formatDate,
  formatDateByMin,
  formatDateBySec,
} from "./utility/common";
import { prisma } from "./db";
import logger from "./logger";

import {
  getHourlyTxQuery,
  getMinTxQuery,
  getSecTxQuery,
} from "./query.helper";

class SocketHelper {
  async emitSocket(key: string) {
    if (key === REDIS_KEY.TPS_GRAPH) {
      await this.handleAllTxData(SOCKET_EVENT.ALL_TRANSACTIONS);
    }
  }

  async handleAllTxData(socketEvent: string) {
    try {
      let graphData;
      let finalData;
      const allGraphData: {
        tenSecond: Array<{ createdAt: string; count: number }>;
        thirtyMinute: Array<{ createdAt: string; count: number }>;
        sixHour: Array<{ createdAt: string; count: number }>;
      } = {
        tenSecond: [],
        thirtyMinute: [],
        sixHour: [],
      };
      /** *******************minute******************************** */
      const currentDateByMinute = new Date();
      const currentDateModiOfMinute = formatDateByMin(new Date());
      const oneMinuteAgo = new Date();
      oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 30);
      const startDateByMinute = formatDateByMin(oneMinuteAgo);

      graphData = (await getMinTxQuery(
        new Date(startDateByMinute),
        currentDateByMinute,
      )) as Array<{
        hour: Date;
        count: number;
      }>;
      finalData = (await fillMissingMinutes(
        graphData,
        new Date(startDateByMinute),
        new Date(currentDateModiOfMinute),
      )) as Array<{ createdAt: string; count: number }>;

      allGraphData.thirtyMinute.push(...finalData);

      const currentDateByHour = new Date();

      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 6);
      const startDateByHour = formatDate(oneHourAgo);

      graphData = (await getHourlyTxQuery(
        startDateByHour,
        currentDateByHour,
      )) as Array<{ hour: Date; count: number }>;
      finalData = (await fillMissingDatesWithZeroByhr(
        graphData,
        new Date(startDateByHour),
      )) as Array<{ createdAt: string; count: number }>;
      allGraphData.sixHour.push(...finalData);

      const currentDateBySecond = new Date();
      const currentDateModi = formatDateBySec(new Date());
      const oneSecondAgo = new Date();
      oneSecondAgo.setSeconds(oneSecondAgo.getSeconds() - 9);
      const startDate = formatDateBySec(oneSecondAgo);

      graphData = (await getSecTxQuery(
        new Date(startDate),
        currentDateBySecond,
      )) as Array<{
        second: Date;
        count: number;
      }>;
      finalData = (await fillMissingSeconds(
        graphData,
        new Date(startDate),
        new Date(currentDateModi),
      )) as Array<{ createdAt: string; count: number }>;
      allGraphData.tenSecond.push(...finalData);

      const obj = {
        finalData: allGraphData,
        count: await prisma.transactions.count(),
      };

      SocketEventEmitter.emitMessage(socketEvent, obj);
      return true;
    } catch (err) {
      logger.error("Error processing all-tx graph data:", err);
      return false;
    }
  }

}
export default new SocketHelper();
