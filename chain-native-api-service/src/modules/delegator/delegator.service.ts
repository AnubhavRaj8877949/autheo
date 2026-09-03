import {
  arrNoExponent,
  fetchRequest,
  noExponent,
} from "../../libs/utilities/common";
import { FETCH_METHODS, HEADERS, REDIS_KEY, RES_MSG } from "../../constant";
import { IESResponse } from "../../interfaces/index";
import prisma from "../../libs/db";
import redisHelper from "../../services/redis.helper";
import logger from "../../libs/logger";

class DelegatorService {
  /**
   * get all delegators
   * @param data
   * @returns
   */
  async getAllDelegators(data: {
    page: number;
    limit: number;
  }): Promise<IESResponse> {
    try {
      const [delegator, delegatorCount] = await prisma.$transaction([
        prisma.delegator.findMany({
          orderBy: {
            totalStake: "asc",
          },
          select: {
            address: true,
            totalStake: true,
            validatorStakes: {
              select: {
                stake: true,
                denom: true,
                balanceAmount: true,
                validatorOperatorAddress: true,
              },
            },
          },
          skip: data.page * data.limit,
          take: data.limit,
        }),
        prisma.delegator.count(),
      ]);

      if (!delegator?.length) {
        return {
          message: RES_MSG.FETCH_SUCCESS,
          data: {
            delegator: [],
            count: 0,
          },
        };
      }
      const dataToSend: {
        address: string;
        totalStake: string;
        validatorStakes: {
          id: string;
          stake: string;
          validatorAddress: string;
          balanceAmount: string;
          denom: string;
        }[];
      }[] = [];
      delegator.forEach((element) => {
        dataToSend.push({
          address: element.address,
          totalStake: noExponent(Number(element.totalStake)),
          validatorStakes: arrNoExponent(element?.validatorStakes),
        });
      });

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          count: delegatorCount,
          delegator: dataToSend,
        },
      };
    } catch (err) {
      logger.error("Error in getAllDelegators:", err);
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
   * get delegator by delegator address
   * @param address
   * @returns
   */
  async getDelegatorByAddress(address: string): Promise<IESResponse> {
    try {
      let delegatorByAddress: any = await prisma.delegator.findUnique({
        where: {
          address,
        },
        select: {
          totalStake: true,
          createdAt: true,
          validatorStakes: true,
        },
      });

      if (!delegatorByAddress) {
        return {
          message: RES_MSG.FETCH_SUCCESS,
          data: {},
        };
      }

      let validatorsTotalReward = 0;
      if (delegatorByAddress?.validatorStakes) {
        for (const validatorStake of delegatorByAddress?.validatorStakes) {
          let validator = await prisma.validator.findUnique({
            where: {
              operatorAddress: validatorStake?.validatorOperatorAddress,
            },
            select: {
              totalRewards: true,
              name: true,
              validatorAddress: true,
            },
          });

          if (validator) {
            validatorsTotalReward = Number(validator?.totalRewards);
          }

          validatorStake.validatorsTotalReward = validatorsTotalReward;
          validatorStake.delegatorRewards = Number(
            validatorStake.delegatorRewards,
          );
          validatorStake.name = validator?.name || "";
          validatorStake.validatorAddress = validator?.validatorAddress || "";
          validatorStake.stake = noExponent(
            validatorStake?.stake / 10 ** 18 || 0,
          );
        }
      }

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          totalStake: noExponent(Number(delegatorByAddress?.totalStake) || ""),
          createdAt: delegatorByAddress?.createdAt,
          validatorStakes: arrNoExponent(delegatorByAddress?.validatorStakes),
        },
      };
    } catch (err) {
      logger.error("Error in getDelegatorByAddress:", err);
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async dashboard(address: string): Promise<IESResponse> {
    try {
      let rewards = await redisHelper.getHset(REDIS_KEY.REWARDS, address);

      if (!rewards) {
        rewards = await prisma.rewards.findFirst({
          where: {
            address: address,
          },
          select: {
            rewardAmount: true,
          },
        });
      }

      const delegatorByAddress = await prisma.validatorStake.findMany({
        where: {
          delegatorAddress: address,
        },
        select: {
          balanceAmount: true,
          delegatorRewards: true,
        },
      });

      let totalRewards = 0;

      for (let i = 0; i < delegatorByAddress?.length; i++) {
        const element = delegatorByAddress[i];
        totalRewards = totalRewards + Number(element?.delegatorRewards);
      }
      let delegatorStake = 0;

      for (let i = 0; i < delegatorByAddress?.length; i++) {
        const element = delegatorByAddress[i];
        delegatorStake = delegatorStake + Number(element?.balanceAmount);
      }

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          claimedRewards: rewards?.rewardAmount || 0,
          totalRewards: totalRewards || 0,
          totalStake: delegatorStake,
        },
      };
    } catch (err) {
      logger.error("Error in dashboard:", err);
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }
  async getUnbondingDetails(address: string): Promise<IESResponse> {
    try {
      const response = await fetchRequest(
        `${environment.swaggerHttpUrl}/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`,
        FETCH_METHODS.GET,
        HEADERS.DEFAULT,
      );

      if (response?.error)
        return {
          error: true,
          message: RES_MSG.ERROR,
        };

      const modifiedResponse = await Promise.all(
        response.data?.unbonding_responses.map(async (item: any) => {
          const validator = await prisma.validator.findUnique({
            where: { operatorAddress: item.validator_address },
            select: { name: true },
          });

          return {
            validator_name: validator?.name || null,
            ...item,
          };
        }),
      );

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: modifiedResponse,
      };
    } catch (err) {
      logger.error("Error in getUnbondingDetails:", err);
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  /**
   * get all validators for a specific delegator
   * @param delegatorAddress
   * @returns
   */
  async getDelegatorValidators(delegatorAddress: string): Promise<IESResponse> {
    try {
      // Get all validator stakes for this delegator
      const delegatorStakes = await prisma.validatorStake.findMany({
        where: {
          delegatorAddress: delegatorAddress,
        },
        select: {
          validatorOperatorAddress: true,
          stake: true,
          balanceAmount: true,
          delegatorRewards: true,
          denom: true,
        },
      });

      if (!delegatorStakes.length) {
        return {
          message: RES_MSG.FETCH_SUCCESS,
          data: {
            validators: [],
            count: 0,
          },
        };
      }

      // Get validator details for each stake
      const validatorAddresses = delegatorStakes.map(
        (stake) => stake.validatorOperatorAddress,
      );

      const validators = await prisma.validator.findMany({
        where: {
          operatorAddress: {
            in: validatorAddresses,
          },
        },
        select: {
          operatorAddress: true,
          validatorAddress: true,
          name: true,
          status: true,
          commissionRate: true,
          votingPower: true,
          jailed: true,
          tokens: true,
        },
      });

      // Create a map of validators by operator address for quick lookup
      const validatorMap = new Map();
      validators.forEach((validator) => {
        validatorMap.set(validator.operatorAddress, validator);
      });

      // Format the response combining stake and validator details
      const result = delegatorStakes
        .map((stake) => {
          const validator = validatorMap.get(stake.validatorOperatorAddress);
          if (!validator) return null;

          return {
            validatorOperatorAddress: stake.validatorOperatorAddress,
            validatorAddress: validator.validatorAddress,
            name: validator.name,
            delegatedAmount: stake.stake,
            balanceAmount: stake.balanceAmount,
            delegatorRewards: stake.delegatorRewards,
            denom: stake.denom,
            status: validator.status,
            jailed: validator.jailed,
            commissionRate: validator.commissionRate,
            votingPower: validator.votingPower,
            tokens: validator.tokens,
          };
        })
        .filter((item) => item !== null)
        .sort((a, b) => Number(b.delegatedAmount) - Number(a.delegatedAmount));

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          validators: result,
          count: result.length,
        },
      };
    } catch (err) {
      logger.error("Error in getDelegatorValidators:", err);
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

export default new DelegatorService();
