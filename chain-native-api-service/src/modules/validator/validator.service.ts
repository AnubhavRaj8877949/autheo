import prisma from "../../libs/db";
import { CONST_NAME, RES_MSG } from "../../constant";
import { IESResponse } from "../../interfaces";
import { noExponent } from "../../libs/utilities/common";
import { convertBigIntToNumber } from "../../libs/common.helper";
import axios from "axios";
import logger from "../../libs/logger";

class ValidatorService {
  /**
   * get all validator
   * @param data
   * @returns
   */
  async getAllValidators(data: {
    page: number;
    limit: number;
    status: string;
  }): Promise<IESResponse> {
    try {
      let validators;
      let validatorCount;
      let activeCount = 0;
      let inactiveCount = 0;
      let deactivatingCount = 0;

      const excludedAddresses = environment.excludedValidators.split(",");

      // Fetch validators based on status
      if (
        data.status === "active" ||
        data.status === "deactivating" ||
        data.status === "inactive"
      ) {
        validators = await prisma.validator.findMany({
          orderBy: { createdAt: "desc" },
          skip: data.page * data.limit,
          take: data.limit,
          where: { status: data.status },
        });
      } else {
        validators = await prisma.validator.findMany({
          orderBy: { createdAt: "desc" },
          skip: data.page * data.limit,
          take: data.limit,
        });
      }

      // Count validators based on status
      activeCount = await prisma.validator.count({
        where: { status: "active" },
      });
      inactiveCount = await prisma.validator.count({
        where: { status: "inactive" },
      });
      deactivatingCount = await prisma.validator.count({
        where: { status: "deactivating" },
      });
      validatorCount = await prisma.validator.count();

      // Filter out excluded addresses
      const filteredValidators = validators.filter(
        (validator) =>
          validator.validatorAddress &&
          !excludedAddresses.includes(validator.validatorAddress),
      );

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          count: validatorCount,
          validators: convertBigIntToNumber(filteredValidators),
          activeCount,
          inactiveCount,
          deactivatingCount,
        },
      };
    } catch (err) {
      logger.error("Error in getAllValidators:", err);

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
   * get validator by address
   * @param address
   * @returns
   */
  async getValidatorsByAddress(address: string): Promise<IESResponse> {
    try {
      let validatorsDetailsByAddress = await prisma.validator.findUnique({
        where: {
          validatorAddress: address,
        },
      });

      if (!validatorsDetailsByAddress) {
        return {
          message: RES_MSG.FETCH_SUCCESS,
          data: {
            validators: [],
            count: 0,
          },
        };
      }
      return {
        error: false,
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          validators: convertBigIntToNumber([validatorsDetailsByAddress]),
          count: 1,
        },
      };
    } catch (err) {
      logger.error("Error in getValidatorsByAddress:", err);

      if (err instanceof Error) {
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  /**
   * get validator by name
   * @param address
   * @returns
   */
  async getValidatorsByName(data: {
    limit: number;
    page: number;
    searchTerm: string;
  }): Promise<IESResponse> {
    try {
      const validatorsDetailsByName: any = await prisma.validator.findMany({
        where: {
          name: {
            contains: data.searchTerm,
            mode: "insensitive",
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: data.page * data.limit,
        take: data.limit,
      });
      if (!validatorsDetailsByName.length) {
        return {
          message: RES_MSG.FETCH_SUCCESS,
          data: {
            validators: [],
            count: 0,
          },
        };
      }

      const validatorCount = await prisma.validator.count({
        where: {
          name: {
            contains: data.searchTerm,
          },
        },
      });
      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          validators: convertBigIntToNumber(validatorsDetailsByName),
          count: validatorCount,
        },
      };
    } catch (err) {
      logger.error("Error in getValidatorsByName:", err);
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  /**
   * validator search by address or name of validator
   * @param data
   * @returns
   */
  async getValidatorSearch(data: {
    limit: number;
    page: number;
    searchTerm: string;
  }): Promise<IESResponse> {
    try {
      if (data.searchTerm.length >= 42) {
        return await this.getValidatorsByAddress(data.searchTerm);
      } else {
        return await this.getValidatorsByName(data);
      }
    } catch (err) {
      logger.error("Error in getValidatorSearch:", err);
      if (err instanceof Error) {
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }
  /**
   * get validator details
   * @param address
   * @returns
   */
  async getValidatorDetails(address: string): Promise<IESResponse> {
    try {
      const validatorData = await prisma.validator.findUnique({
        select: {
          totalRewards: true,
          operatorAddress: true,
          delegatorCount: true,
          selfStake: true,
          isGenesis: true,
        },
        where: { validatorAddress: address },
      });

      if (!validatorData) {
        return {
          message: RES_MSG.FETCH_SUCCESS,
          data: {},
        };
      }

      const [lastBlockProposed, totalBlockProposed, validatorStakeDetails] =
        await Promise.all([
          prisma.blocks.findFirst({
            select: { blocknumber: true },
            orderBy: { createdAt: "desc" },
            where: { miner: address },
          }),
          prisma.validatedBlocksCount.findUnique({
            select: { count: true },
            where: { operatorAddress: validatorData.operatorAddress },
          }),
          prisma.validatorStake.findMany({
            where: {
              validatorOperatorAddress: validatorData.operatorAddress,
            },
            select: { stake: true, delegator: true },
          }),
        ]);

      const delegatorStake = validatorStakeDetails.reduce(
        (total, element) => total + Number(element.stake),
        0,
      );

      const dataToSend = {
        delegatorStake,
        lastBlockProposed: lastBlockProposed?.blocknumber || 0,
        totalBlockProposed: totalBlockProposed?.count || 0,
        totalRewards: noExponent(validatorData?.totalRewards || 0),
        delegatorCount: validatorData?.delegatorCount || 0,
        selfStake: validatorData?.selfStake || 0,
        isGenesis: validatorData?.isGenesis || false,
      };

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: convertBigIntToNumber([dataToSend])[0],
      };
    } catch (err) {
      logger.error("Error in getValidatorDetails:", err);

      if (err instanceof Error) {
        return { error: true, message: RES_MSG.ERROR };
      }
      return { error: true, message: RES_MSG.ERROR };
    }
  }

  async getValidators(data: {
    page: number;
    limit: number;
    status: string;
  }): Promise<IESResponse> {
    try {
      const validatorsString = environment.validators;

      let validator: string[] = [];
      if (validatorsString) {
        validator = validatorsString.split(",");
      }

      let filteredValidators = [];

      for (let i = 0; i < validator.length; i++) {
        const validatorAddr = validator[i];

        const apiUrl = environment.swaggerHttpUrl;

        const response = await axios({
          url: `${apiUrl}/cosmos/staking/v1beta1/validators/${validatorAddr}`,
          timeout: environment.httpTimeoutMs,
        });

        const validatorData = response.data.validator;

        // Map status to 'active', 'inactive', or 'deactivating'
        let status;
        switch (validatorData.status) {
          case "BOND_STATUS_BONDED":
            status = "active";
            break;
          case "BOND_STATUS_UNBONDED":
            status = "inactive";
            break;
          case "BOND_STATUS_UNBONDING":
            status = "deactivating";
            break;
          default:
            status = "unknown";
        }

        // Check if the validator matches the requested status
        if (!data.status || status === data.status) {
          filteredValidators.push({ ...validatorData, status });
        }
      }

      // Check if any validators were found with the requested status
      if (filteredValidators.length === 0) {
        return {
          message: RES_MSG.NOT_FOUND,
          data: {
            validators: [],
          },
        };
        // throw new Error(RES_MSG.NOT_FOUND);
      }

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          validators: filteredValidators,
        },
      };
    } catch (err) {
      logger.error("Error in getValidators:", err);

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
   * get all delegators for a specific validator
   * @param validatorAddress
   * @returns
   */
  async getValidatorDelegators(validatorAddress: string): Promise<IESResponse> {
    try {
      // First, find the validator to get the operator address
      const validator = await prisma.validator.findUnique({
        where: {
          validatorAddress: validatorAddress,
        },
        select: {
          operatorAddress: true,
        },
      });

      if (!validator) {
        return {
          error: true,
          message: RES_MSG.NOT_FOUND,
        };
      }

      // Get all delegator stakes for this validator
      const delegatorStakes = await prisma.validatorStake.findMany({
        where: {
          validatorOperatorAddress: validator.operatorAddress,
        },
        include: {
          delegator: {
            select: {
              address: true,
              totalStake: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          stake: "desc",
        },
      });

      if (!delegatorStakes.length) {
        return {
          message: RES_MSG.FETCH_SUCCESS,
          data: {
            delegators: [],
            count: 0,
          },
        };
      }

      // Format the response
      const delegators = delegatorStakes.map((stake) => ({
        delegatorAddress: stake.delegator.address,
        delegatedAmount: stake.stake,
        balanceAmount: stake.balanceAmount,
        delegatorRewards: stake.delegatorRewards,
        denom: stake.denom,
        delegationStatus: "active", // Assuming active if stake exists
        createdAt: stake.delegator.createdAt,
      }));

      return {
        message: RES_MSG.FETCH_SUCCESS,
        data: {
          delegators: delegators,
          count: delegators.length,
        },
      };
    } catch (err) {
      logger.error("Error in getValidatorDelegators:", err);
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
export default new ValidatorService();
