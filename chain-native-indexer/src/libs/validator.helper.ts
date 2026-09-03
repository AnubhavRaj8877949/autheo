import axios, { AxiosInstance, AxiosResponse } from "axios";
import { bech32 } from "bech32";
import { RES_MSG, CONST_NAME, REDIS_KEY } from "../constant";
import {
  Params,
  ValidatorDelegations,
  IValidatorStake,
  IValidatorToSave,
} from "../interface/index";
import { RedisService } from "../services";
import logger from "./logger";
import { noExponent } from "./utility/common";
import dbHelper from "./db.helper";

async function getParams(apiRes: AxiosInstance): Promise<Params | false> {
  try {
    const [
      validatorResponse,
      circulationSupplyResponse,
      inflationRateResponse,
      poolResponse,
      paramsResponse,
      totalSupplyResponse,
      annualProvision,
      mintParamsResponse,
    ] = await Promise.all([
      apiRes.get("/cosmos/staking/v1beta1/validators"),
      apiRes.get(
        `/cosmos/bank/v1beta1/supply/by_denom?denom=${environment.symbol.toLowerCase()}`,
      ),
      apiRes.get("/cosmos/mint/v1beta1/inflation"),
      apiRes.get("/cosmos/staking/v1beta1/pool"),
      apiRes.get("/cosmos/distribution/v1beta1/params"),
      apiRes.get("/cosmos/bank/v1beta1/supply"),
      apiRes.get("/cosmos/mint/v1beta1/annual_provisions"),
      apiRes.get("/cosmos/mint/v1beta1/params"),
    ]);

    // Filter active validators
    const activeValidator = validatorResponse?.data?.validators.filter(
      (item: any) => item.status === CONST_NAME.BOND_STATUS,
    );
    if (activeValidator?.length === 0) {
      return false;
    }
    const totalValidator: number | undefined =
      validatorResponse?.data?.validators?.length;
    if (totalValidator === undefined) {
      return false;
    }
    const circulatingSupply: number =
      Number(circulationSupplyResponse.data.amount.amount) / CONST_NAME.ETH_EXP;

    const inflationRate = Number(inflationRateResponse.data.inflation);

    const formattedInflationRate = `${inflationRate}`;

    let blocksPerYear = Number(CONST_NAME.BLOCK_PER_YEAR);
    blocksPerYear = Number(blocksPerYear / 2);
    const inflation = formattedInflationRate;

    const bondedTokens =
      Number(poolResponse.data.pool.bonded_tokens) / CONST_NAME.ETH_EXP;

    const annualProvisions = annualProvision.data.annual_provisions;

    const mintParams = mintParamsResponse?.data?.params ?? {};
    const resolvedInflationRate = resolveInflationRate(mintParams);

    // Pick the staking denom out of the supply set rather than trusting its
    // ordering, then convert to whole tokens so it lines up with bondedTokens.
    const mintDenom = String(mintParams.mint_denom || environment.symbol || "");
    const supplyEntry = (totalSupplyResponse.data.supply ?? []).find(
      (coin: { denom: string }) =>
        coin?.denom?.toLowerCase() === mintDenom.toLowerCase(),
    );
    const totalSupply =
      Number(supplyEntry?.amount ?? totalSupplyResponse.data.supply[0].amount) /
      CONST_NAME.ETH_EXP;

    const bondedRate = Number(((bondedTokens / totalSupply) * 100).toFixed(3));
    const communityTax = Number(paramsResponse.data.params.community_tax);

    return {
      annualProvisions,
      blocksPerYear,
      inflation,
      inflationRate: resolvedInflationRate,
      bondedTokens,
      communityTax,
      activeValidator: activeValidator?.length,
      totalValidator,
      circulatingSupply,
      bondedRate,
      totalSupply,
    };
  } catch (error) {
    return false;
  }
}

/**
 * retrieve delegator reward amount
 * @param apiRes
 * @param address
 * @returns
 */
async function getDelegatorReward(
  apiRes: AxiosInstance,
  delegator: string,
  validator: string,
) {
  const response: AxiosResponse = await apiRes.get(
    `/cosmos/distribution/v1beta1/delegators/${delegator}/rewards/${validator}`,
  );
  const resData = response?.data;

  return resData?.rewards[0]?.amount || 0;
}

/**
 * Resolve the inflation rate out of `/cosmos/mint/v1beta1/params`.
 *
 * Chains disagree on the field name, so the keys are tried in the same order
 * the reference calculator uses, with 0.13 as the last resort.
 */
export function resolveInflationRate(
  mintParams: Record<string, string> | undefined,
): number {
  return parseFloat(
    mintParams?.inflation_rate_change ||
      mintParams?.inflation ||
      mintParams?.inflation_rate ||
      "0.13",
  );
}

/**
 * Staking APR / APY.
 *
 *   APR (%) = [(Total Supply x Inflation Rate x (1 - Community Tax))
 *              / Total Bonded THEO] x 100
 *
 * `totalSupply` and `bondedTokens` are both whole tokens (already divided by
 * 10^18). APY is the APR compounded daily.
 */
export function calculateAPYAndAPR(
  totalSupply: number,
  inflationRate: number,
  communityTax: number,
  bondedTokens: number,
): { apr: number; apy: number } {
  const supply = Number(totalSupply ?? 0);
  const inflation = Number(inflationRate ?? 0);
  const tax = Number(communityTax ?? 0);
  const bonded = Number(bondedTokens ?? 0);

  if (!bonded || !Number.isFinite(bonded)) {
    return { apr: 0, apy: 0 };
  }

  const numerator = supply * inflation * (1 - tax);
  const apr = (numerator / bonded) * 100;

  // A large enough APR overflows the daily-compounding power; fall back to the
  // uncompounded rate rather than storing Infinity in Redis.
  const compounded = ((1 + apr / 100 / 365) ** 365 - 1) * 100;
  const apy = Number.isFinite(compounded) ? compounded : apr;

  return { apr, apy };
}

const calculateData = async (): Promise<
  | {
      validator: number;
      totalValidator: number;
      bondedRate: number;
      apr: number;
      apy: number;
      inflation: number;
      totalSupply: number;
      circulatingSupply: number;
    }
  | { error: boolean; message: string }
> => {
  try {
    const apiUrl = environment.nativeSwaggerUrl;
    const apiRes = axios.create({
      baseURL: apiUrl,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
      timeout: 10000,
    });

    const params = await getParams(apiRes);
    if (!params) throw new Error("Failed to fetch network params");

    const { apr: aprValue, apy: apyValue } = calculateAPYAndAPR(
      Number(params.totalSupply),
      Number(params.inflationRate),
      Number(params.communityTax),
      Number(params.bondedTokens),
    );

    const validatorData = {
      validator: params?.activeValidator,
      totalValidator: params?.totalValidator,
      bondedRate: params?.bondedRate,
      apr: Number(aprValue.toFixed(2)),
      apy: Number(apyValue.toFixed(2)),
      totalSupply: params?.totalSupply,
      inflation: Number(params?.inflation),
      circulatingSupply: params?.circulatingSupply,
    };

    await RedisService.setString(
      REDIS_KEY.INFLATION_APY,
      JSON.stringify(validatorData),
    );

    await RedisService.setString(
      REDIS_KEY.CIRCULATING_SUPPLY,
      JSON.stringify(params?.circulatingSupply),
    );

    await RedisService.setString(
      REDIS_KEY.VALIDATOR_DATA,
      JSON.stringify(validatorData),
    );
    return validatorData;
  } catch (err) {
    if (err instanceof Error) {
      return { error: true, message: err.message };
    }
    return { error: true, message: RES_MSG.NOT_FOUND };
  }
};

/**
 *  Fetch delegations for a specific validator address
 * @param apiRes
 * @param address
 * @returns
 */
async function getValidatorStakeDetails(
  apiRes: AxiosInstance,
  address: string,
): Promise<ValidatorDelegations> {
  const response: AxiosResponse = await apiRes.get(
    `/cosmos/staking/v1beta1/validators/${address}/delegations`,
  );
  return response.data;
}

/**
 * retrieve unbonded amount of validator
 * @param apiRes
 * @param address
 * @returns
 */
async function validatorUnbondAmount(apiRes: AxiosInstance, address: string) {
  const response: AxiosResponse = await apiRes.get(
    `/cosmos/staking/v1beta1/validators/${address}/unbonding_delegations`,
  );
  const resData = response?.data?.unbonding_responses || [];

  let unbondedAmount = 0;
  resData.forEach((element: any) => {
    element.entries.forEach((i: any) => {
      unbondedAmount = (unbondedAmount + Number(i.balance)) / 10 ** 18;
    });
  });

  return unbondedAmount;
}

/**
 * retrieve unbonded amount of validator
 * @param apiRes
 * @param address
 * @returns
 */
async function validatorTotalRewards(apiRes: AxiosInstance, address: string) {
  try {
    const response: AxiosResponse = await apiRes.get(
      `cosmos/distribution/v1beta1/validators/${address}/outstanding_rewards`,
    );

    return response.data;
  } catch (err) {
    return null;
  }
}

/**
 * Fetch the set of genesis (eligible) validators from the validator bonus API.
 * The endpoint returns validators whose `validatorAddress` corresponds to a
 * validator operator address (e.g. "blockmazevaloper1...").
 * @returns a Set of eligible validator operator addresses
 */
async function getEligibleValidators(): Promise<Set<string>> {
  try {
    const response: AxiosResponse = await axios.get(
      `${environment.nativeSwaggerUrl}/blockmaze/validatorbonus/eligible_validator`,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
        },
        timeout: 10000,
      },
    );

    const eligibleValidators: Array<{ validatorAddress: string }> =
      response?.data?.eligibleValidator || [];

    return new Set(
      eligibleValidators
        .map((item) => item?.validatorAddress)
        .filter((address): address is string => Boolean(address)),
    );
  } catch (err) {
    logger.error("Error fetching eligible (genesis) validators:", err);
    return new Set<string>();
  }
}

/**
 *  Process and update information for each validator
 * @param apiRes
 * @returns
 */
async function getValidatorsInfo(apiRes: AxiosInstance) {
  // : Promise<IValidator[] | { error: boolean; message: string }>
  try {
    const response: AxiosResponse = await apiRes.get(
      "/cosmos/staking/v1beta1/validators?pagination.limit=200",
      { timeout: 10000 },
    );
    const validators: IValidatorToSave[] = [];
    const delegators: IValidatorStake[] = [];

    const eligibleValidators = await getEligibleValidators();

    for (let i = 0; i < response?.data?.validators?.length; i++) {
      const validator = response.data.validators[i];
      const validatorOperatorAddress = validator.operator_address;
      const address = bech32.decode(validatorOperatorAddress);
      const validatorAddress = bech32.encode(
        environment.addressPrefix,
        address.words,
      );

      const stakeDetails: any = await getValidatorStakeDetails(
        apiRes,
        validator.operator_address,
      );

      const rewardsRes = await validatorTotalRewards(
        apiRes,
        validator.operator_address,
      );

      const validatorReward = Number(
        rewardsRes?.rewards?.rewards[0]?.amount || 0,
      );

      const unbondAmount = await validatorUnbondAmount(
        apiRes,
        validatorOperatorAddress,
      );
      const valIndex: number = stakeDetails?.delegation_responses.findIndex(
        (e: any) =>
          e.delegation.delegator_address === validatorAddress &&
          e.delegation.validator_address === validatorOperatorAddress,
      );

      const deleShares =
        stakeDetails?.delegation_responses[valIndex]?.delegation.shares || 0;
      const selfStake = noExponent(deleShares ?? 0);

      const delegatorCount = parseInt(stakeDetails.pagination.total, 10);

      for (let j = 0; j < delegatorCount; j++) {
        // if (j !== valIndex) {
        const val = stakeDetails?.delegation_responses[j];

        const delegatorRewards: number = await getDelegatorReward(
          apiRes,
          val?.delegation.delegator_address,
          validatorOperatorAddress,
        );

        if (val?.delegation?.delegator_address) {
          const data: IValidatorStake = {
            validatorOperatorAddress,
            denom: val?.balance?.denom,
            delegatorRewards,
            stake: Number(val?.delegation?.shares),
            balanceAmount: val?.balance?.amount,
            delegatorAddress: val?.delegation.delegator_address,
          };

          await dbHelper.saveDelegator({
            totalStake: 0.0,
            address: data.delegatorAddress,
          });

          delegators.push(data);
        }
        // }
      }

      let status = RES_MSG.DEACTIVATING;

      switch (validator?.status) {
        case RES_MSG.BOND_STATUS_BONDED:
          status = RES_MSG.ACTIVE;
          break;
        case RES_MSG.BOND_STATUS_UNBONDED:
          status = RES_MSG.INACTIVE;
          break;
        case RES_MSG.BOND_STATUS_UNBONDING:
          status = RES_MSG.DEACTIVATING;
          break;
        default:
          break;
      }

      const validatorData: IValidatorToSave = {
        status,
        selfStake,
        delegatorCount,
        validatorAddress,
        jailed: validator?.jailed,
        // tokens: (validator?.delegator_shares
        //  ? Number(validator?.delegator_shares) / 10 ** 18
        //  : 0
        // ).toString(),
        tokens: noExponent(validator?.delegator_shares ?? 0),
        unbondingAmount: unbondAmount,
        name: validator?.description?.moniker,
        website: validator?.description?.website,
        unbondingTime: validator?.unbonding_time,
        details: validator?.description?.details,
        operatorAddress: validatorOperatorAddress,
        identity: validator?.description?.identity,
        unbondingHeight: validator?.unbonding_height,
        updatedAt: validator?.commission.update_time,
        createdAt: validator?.commission.update_time,
        unbondingIds: validator?.unbonding_ids ?? [],
        minSelfDelegation: validator?.min_self_delegation,
        securityContact: validator?.description?.security_contact,
        totalRewards: validatorReward ? validatorReward / 10 ** 18 : 0,
        unbondingOnHoldRefCount: validator?.unbonding_on_hold_ref_count,
        commissionUpdateTime: validator?.commission?.update_time,
        commissionRate: validator?.commission?.commission_rates.rate,
        commissionMaxRate: validator?.commission?.commission_rates?.max_rate,
        commissionMaxChangeRate:
          validator?.commission?.commission_rates?.max_change_rate,
        // totalStake: validator?.delegator_shares
        //  ? Number(validator?.delegator_shares) / 10 ** 18
        //  : 0,
        totalStake: noExponent(validator?.tokens ?? 0),
        votingPower: Number(validator.tokens / 10 ** 18),
        isGenesis: eligibleValidators.has(validatorOperatorAddress),
        // totalStake: validator?.tokens
        //  ? Number(validator?.tokens) / 10 ** 18
        //  : 0,
      };

      validators.push(validatorData);
    }

    await dbHelper.saveValidators(validators);

    await dbHelper.saveDelegatorStakeData(delegators);
    return validators;
  } catch (err) {
    if (err instanceof Error) {
      logger.error("Error occurred while saving validator details:", err);
      return { error: true, message: err.message };
    }
    return {
      error: true,
      message: RES_MSG.VALIDATOR_ERROR,
    };
  }
}
export { calculateData, getValidatorsInfo };
