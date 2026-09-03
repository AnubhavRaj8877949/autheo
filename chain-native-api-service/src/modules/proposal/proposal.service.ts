import prisma from "../../libs/db";
import { RES_MSG } from "../../constant";
import { IESResponse } from "../../interfaces";
import { noExponent } from "../../libs/utilities/common";
import { convertBigIntToNumber } from "../../libs/common.helper";
import logger from "../../libs/logger";

class ProposalService {
  /**
   * get all proposal
   * @param data
   * @returns
   */
  async getAllProposals(data: {
    page: number;
    limit: number;
    status: string;
  }): Promise<IESResponse> {
    try {
      let proposals;
      let totalCount;
      let votingCount = 0;
      let depositCount = 0;
      let passedCount = 0;
      let rejectCount = 0;
      let failedCount = 0;

      if (
        data.status === "voting" ||
        data.status === "deposit" ||
        data.status === "passed" ||
        data.status === "rejected" ||
        data.status === "failed"
      ) {
        proposals = await prisma.proposals.findMany({
          orderBy: { votingStartTime: "desc" },
          skip: data.page * data.limit,
          take: data.limit,
          where: { status: data.status },
        });

        votingCount = await prisma.proposals.count({
          where: { status: "voting" },
        });
        depositCount = await prisma.proposals.count({
          where: { status: "deposit" },
        });
        passedCount = await prisma.proposals.count({
          where: { status: "passed" },
        });
        rejectCount = await prisma.proposals.count({
          where: { status: "rejected" },
        });
        failedCount = await prisma.proposals.count({
          where: { status: "failed" },
        });
        totalCount = await prisma.proposals.count();
      } else {
        proposals = await prisma.proposals.findMany({
          orderBy: { votingEndTime: "desc" },
          skip: data.page * data.limit,
          take: data.limit,
        });
        votingCount = await prisma.proposals.count({
          where: { status: "voting" },
        });
        depositCount = await prisma.proposals.count({
          where: { status: "deposit" },
        });
        passedCount = await prisma.proposals.count({
          where: { status: "passed" },
        });
        rejectCount = await prisma.proposals.count({
          where: { status: "rejected" },
        });
        failedCount = await prisma.proposals.count({
          where: { status: "failed" },
        });

        totalCount = await prisma.proposals.count();
      }
      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          totalCount,
          proposals: convertBigIntToNumber(proposals),
          depositCount,
          votingCount,
          passedCount,
          rejectCount,
          failedCount,
        },
      };
    } catch (err) {
      logger.error("Error in getAllProposals:", err);

      if (err instanceof Error) {
        if (err.message.includes("prisma")) {
          return { error: true, message: RES_MSG.SERVER_ERROR };
        }
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async getProposalById(proposalId: string): Promise<IESResponse> {
    try {
      let proposalData = await prisma.proposals.findUnique({
        where: { proposalId: proposalId },
      });

      proposalData = convertBigIntToNumber([proposalData])[0];

      if (!proposalData) {
        return {
          message: RES_MSG.NOT_FOUND,
          data: {
            proposal: [],
          },
        };
      }
      return {
        message: RES_MSG.PROPOSAL_FETCH_SUCCESS,
        data: {
          proposal: proposalData,
        },
      };
    } catch (err) {
      logger.error("Error in getProposalById:", err);
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.ERROR };
      } else {
        return { error: true, message: RES_MSG.ERROR };
      }
    }
  }

  /**
   * get all voters
   * @param data
   * @returns
   */
  async getVotersById(data: {
    page: number;
    limit: number;
    answer: string;
    proposalId: string;
  }): Promise<IESResponse> {
    try {
      let voters;
      let totalCount;

      // Check if the proposalId exists
      const proposalExists = await prisma.voters.findFirst({
        where: {
          proposalId: data.proposalId,
        },
      });

      if (!proposalExists) {
        return {
          message: RES_MSG.NOT_FOUND,
          data: {
            totalCount: 0,
            voters: [],
            yesCount: 0,
            noCount: 0,
            vetoCount: 0,
            abstainCount: 0,
          },
        };
      }

      // Define the common where clause with optional answer
      const whereClause: {
        proposalId: string;
        answer?: string;
      } = {
        proposalId: data.proposalId,
      };

      // Add answer to where clause if it matches one of the expected values
      if (
        [RES_MSG.YES, RES_MSG.NO, RES_MSG.VETO, RES_MSG.ABSTAIN].includes(
          data.answer,
        )
      ) {
        whereClause.answer = data.answer;
      }

      // Fetch the voters based on the constructed query
      voters = await prisma.voters.findMany({
        orderBy: { blockNumber: "desc" },
        skip: data.page * data.limit,
        take: data.limit,
        where: whereClause,
      });

      // Calculate the total count of voters that match the criteria
      totalCount = await prisma.voters.count({
        where: whereClause,
      });

      // Calculate the counts for each answer type
      const yesCount = await prisma.voters.count({
        where: {
          proposalId: data.proposalId,
          answer: RES_MSG.YES,
        },
      });
      const noCount = await prisma.voters.count({
        where: {
          proposalId: data.proposalId,
          answer: RES_MSG.NO,
        },
      });
      const vetoCount = await prisma.voters.count({
        where: {
          proposalId: data.proposalId,
          answer: RES_MSG.VETO,
        },
      });
      const abstainCount = await prisma.voters.count({
        where: {
          proposalId: data.proposalId,
          answer: RES_MSG.ABSTAIN,
        },
      });

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          totalCount,
          voters: convertBigIntToNumber(voters),
          yesCount,
          noCount,
          vetoCount,
          abstainCount,
        },
      };
    } catch (err) {
      logger.error("Error in getVotersById:", err);

      if (err instanceof Error) {
        if (err.message.includes("prisma")) {
          return { error: true, message: RES_MSG.SERVER_ERROR };
        }
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async searchVoterByAddress(data: {
    address: string;
    proposalId: string;
  }): Promise<IESResponse> {
    try {
      if (!data.address.startsWith(environment.addressPrefix)) {
        throw new Error(RES_MSG.INVALID_ADDRESS);
      } else if (
        data.address.startsWith(environment.addressPrefix) &&
        data.address.length > 42
      ) {
        const voters = await prisma.voters.findFirst({
          where: {
            voter: data.address,
            proposalId: data.proposalId,
          },
        });

        if (!voters) {
          return {
            message: RES_MSG.FETCH_SUCCESS,
            data: {
              voters: [],
            },
          };
        }

        const votersData = {
          ...voters,
          blockNumber: voters.blockNumber.toString(),
        };
        return {
          message: RES_MSG.FETCH_SUCCESS,
          data: {
            voters: votersData,
          },
        };
      } else {
        throw new Error(RES_MSG.NOT_FOUND);
      }
    } catch (err) {
      logger.error("Error in searchVoterByAddress:", err);
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.NOT_FOUND };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async searchingProposals(data: {
    limit: number;
    page: number;
    value: string;
    status: string;
  }): Promise<IESResponse> {
    try {
      let proposals;
      let totalCount;

      // Check if the value is numeric
      if (/^\d+$/.test(data.value)) {
        const proposal = await prisma.proposals.findUnique({
          where: {
            proposalId: data.value,
            ...(data.status && { status: data.status }),
          },
        });
        if (!proposal) {
          return {
            message: RES_MSG.NOT_FOUND,
            data: {
              proposals: [],
              totalCount: 0,
            },
          };
        }
        proposals = [proposal];
        totalCount = 1; // Only one unique proposal if found
      } else {
        // Calculate the total count of proposals that match the criteria
        totalCount = await prisma.proposals.count({
          where: {
            title: {
              contains: data.value,
              mode: "insensitive",
            },
            ...(data.status && { status: data.status }),
          },
        });

        if (totalCount === 0) {
          return {
            message: RES_MSG.NOT_FOUND,
            data: {
              proposals: [],
              totalCount: 0,
            },
          };
        }

        // Fetch the proposals with pagination
        proposals = await prisma.proposals.findMany({
          skip: data.page * data.limit,
          take: data.limit,
          where: {
            title: {
              contains: data.value,
              mode: "insensitive",
            },
            ...(data.status && { status: data.status }),
          },
          orderBy: {
            votingStartTime: "desc",
          },
        });
      }

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          proposals: proposals,
          totalCount: totalCount,
        },
      };
    } catch (err) {
      logger.error("Error in searchingProposals:", err);
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.NOT_FOUND };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }
}
export default new ProposalService();
