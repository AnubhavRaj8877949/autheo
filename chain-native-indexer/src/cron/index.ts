import axios, { AxiosInstance } from "axios";
import ExplorerHelper from "../libs/db.helper";
import { getProposalsInfo } from "../libs/proposal.helper";
import { calculateData, getValidatorsInfo } from "../libs/validator.helper";
import logger from "../libs/logger";

const apiUrl = environment.nativeSwaggerUrl;
let apiRes: AxiosInstance;

class CronService {
  constructor() {
    try {
      logger.info("cron service running...");
      apiRes = axios.create({
        baseURL: apiUrl,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
        },
        timeout: 10000,
      });
    } catch (error) {
      logger.error("Error initializing cron service:", error);
    }
  }

  public async saveTokenPrice() {
    async function fetchData() {
      await ExplorerHelper.saveTokenPriceByDate();
      setTimeout(fetchData, 60 * 60 * 1000); // Schedule the function to run again in 1 hour (60 minutes * 60 seconds * 1000 milliseconds)
    }

    await fetchData();
  }

  public async checkValidators() {
    async function fetchData() {
      await getValidatorsInfo(apiRes);
      await getProposalsInfo(apiRes);
      await calculateData();
      setTimeout(fetchData, 5 * 1000); // Change the interval to 2 seconds
    }
    // Call the function initially to start the scheduling
    await fetchData();
  }

}

export default new CronService();
