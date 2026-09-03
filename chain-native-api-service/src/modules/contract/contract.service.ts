import prisma from "../../libs/db";
import { IESResponse } from "../../interfaces/index";
import { convertBigIntToNumber } from "../../libs/common.helper";
import { CONTRACT, CONTRACTLOGS, RES_MSG } from "../../constant/index";
import logger from "../../libs/logger";

class ContractService {
  async getAllContract(data: {
    page?: number;
    limit: number;
  }): Promise<IESResponse> {
    try {
      const isFirstPage = data.page === 1;
      const [contracts, contractCount] = await prisma.$transaction([
        prisma.contracts.findMany({
          where: isFirstPage ? {} : { id: { lt: data.page } },
          take: data.limit,
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.contracts.count(),
      ]);

      if (!contracts?.length) {
        return {
          message: RES_MSG.CONTRACT,
          data: {
            count: 0,
            contracts: {},
            nextCursor: null,
            prevCursor: null,
          },
        };
      }

      const nextCursor =
        contracts.length === data.limit
          ? convertBigIntToNumber(contracts)[contracts.length - 1].id
          : null;
      const prevCursor = isFirstPage
        ? null
        : data.page && contracts.length > 0
          ? convertBigIntToNumber(contracts)[0].id + 11
          : null;

      return {
        message: RES_MSG.CONTRACT,
        data: {
          count: contractCount,
          contracts: convertBigIntToNumber(contracts),
          nextCursor,
          prevCursor,
        },
      };
    } catch (err) {
      logger.error("Error fetching contracts", { err });
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

  async getContractByAddress(contractAddress: string): Promise<IESResponse> {
    try {
      const contractData = await prisma.contracts.findFirst({
        where: {
          address: contractAddress,
        },
        select: {
          ...CONTRACT,
          Tokens: {
            select: {
              decimal: true,
              totalSupply: true,
              tokenSymbol: true,
            },
          },
        },
      });
      const contractCount = await prisma.contracts.count({
        where: { address: contractAddress },
      });

      const contractDataToSend = {
        ...contractData,
        decimal: contractData?.Tokens?.decimal ?? "",
        totalSupply: contractData?.Tokens?.totalSupply ?? "",
        symbol: contractData?.Tokens?.tokenSymbol ?? "",
        txCount: contractCount,
      };
      delete contractDataToSend.Tokens;
      const contract = convertBigIntToNumber([contractDataToSend])[0];

      return {
        message: RES_MSG.CONTRACT,
        data: {
          contracts: contract,
          isContractAddress: true,
        },
      };
    } catch (err) {
      logger.error("Error fetching contract by address", {
        contractAddress,
        err,
      });
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.ERROR };
      } else {
        return { error: true, message: RES_MSG.ERROR };
      }
    }
  }

  async getContractTransaction(data: {
    page: number;
    limit: number;
    contractAddress: string;
  }): Promise<IESResponse> {
    try {
      const [contractLogs, contractLogsCount] = await prisma.$transaction([
        prisma.contractLogs.findMany({
          skip: data.page * data.limit,
          take: data.limit,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            ...CONTRACTLOGS,
            transactions: {
              select: {
                toAddress: true,
                fromAddress: true,
              },
            },
          },
          where: {
            contractAddress: data.contractAddress,
          },
        }),
        prisma.contractLogs.count({
          where: {
            contractAddress: data.contractAddress,
          },
        }),
      ]);

      if (!contractLogs?.length) {
        const [contractTx, contractTxCount] = await prisma.$transaction([
          prisma.transactions.findMany({
            skip: data.page * data.limit,
            take: data.limit,
            orderBy: {
              createdAt: "desc",
            },
            where: {
              toAddress: data.contractAddress,
            },
          }),
          prisma.transactions.count({
            where: {
              toAddress: data.contractAddress,
            },
          }),
        ]);

        if (!contractTx?.length) {
          return {
            message: RES_MSG.CONTRACT_TX,
            data: {
              count: 0,
              contracts: {},
            },
          };
        }

        return {
          message: RES_MSG.CONTRACT_TX,
          data: {
            count: contractTxCount,
            contracts: convertBigIntToNumber(contractTx).map((item) => ({
              ...item,
              txHash: item.txhash,
              blockNumber: item.blocknumber,
            })),
          },
        };
      }
      const dataToSend: any = [];
      contractLogs.forEach((e: any) => {
        const data = {
          ...e,
          toAddress: e?.transactions?.toAddress || "",
          fromAddress: e?.transactions?.fromAddress || "",
        };
        delete data.transactions;
        dataToSend.push(data);
      });

      return {
        message: RES_MSG.CONTRACT_TX,
        data: {
          count: contractLogsCount,
          contracts: convertBigIntToNumber(dataToSend),
        },
      };
    } catch (err) {
      if (err instanceof Error) {
        logger.error("Error fetching contract transactions", {
          contractAddress: data.contractAddress,
          err,
        });
        if (err.message.includes("prisma")) {
          return { error: true, message: RES_MSG.SERVER_ERROR };
        }
        return { error: true, message: RES_MSG.ERROR };
      } else {
        return { error: true, message: RES_MSG.ERROR };
      }
    }
  }
}

export default new ContractService();
