import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  RES_MSG,
  REDIS_KEY,
  CONST_NAME,
  CURRENT_DEFAULT_APR,
} from "../constant";
import { Params, BlockHeader } from "../interfaces/index";
import { redisService } from "../services";
import { getDigitsAfterE } from "./utilities.helper";
import logger from "./logger";

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
 * `totalSupply` and `bondedTokens` are both whole THEO (already divided by
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
  const APR = (numerator / bonded) * 100;

  // A large enough APR overflows the daily-compounding power; fall back to the
  // uncompounded rate rather than serialising Infinity into the API response.
  const compounded = ((1 + APR / 100 / 365) ** 365 - 1) * 100;
  const APY = Number.isFinite(compounded) ? compounded : APR;

  return {
    apr: APR,
    apy: APY,
  };
}

const calculateData = async (): Promise<
  | {
      apr: string;
      circulationSupply: number;
      validator: number;
      bondedTokens: number;
      bondedRate: number;
      totalValidator: number;
    }
  | { error: boolean; message: string }
> => {
  try {
    const apiUrl = environment.swaggerHttpUrl;
    const apiRes = axios.create({
      baseURL: apiUrl,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
      timeout: environment.httpTimeoutMs,
    });

    const params = await getParams(apiRes);
    if (!params) return { error: true, message: RES_MSG.FETCH_SUCCESS };

    const { apr: aprValue, apy: apyValue } = calculateAPYAndAPR(
      Number(params.total_supply),
      Number(params.inflationRate),
      Number(params.communityTax),
      Number(params.bondedTokens),
    );

    const validatorData = {
      totalSupply: params?.total_supply,
      inflation: Number(params?.inflation),
      apy: apyValue.toFixed(2) ?? CURRENT_DEFAULT_APR,
      totalValidator: params.totalValidators,
      circulation_supply: params.circulation_supply,
      apr: aprValue.toFixed(2) ?? CURRENT_DEFAULT_APR,
      circulationSupply: params?.circulation_supply,
      validator: params?.activeValidator,
      bondedTokens: params?.bondedTokens,
      bondedRate: params?.bondedRate,
    };

    await redisService.setString(
      REDIS_KEY.VALIDATOR_DATA,
      JSON.stringify(validatorData),
    );
    return validatorData;
  } catch (err) {
    logger.error("Error occurred while calculating stake APY:", err);
    if (err instanceof Error) {
      return { error: true, message: RES_MSG.ERROR };
    }
    return { error: true, message: RES_MSG.NOT_FOUND };
  }
};

async function getParams(apiRes: AxiosInstance): Promise<Params | false> {
  try {
    const [
      validatorResponse,
      circulationSupplyResponse,
      inflationRateResponse,
      poolResponse,
      paramsResponse,
      total_Supply,
      annualProvision,
      mintParamsResponse,
    ] = await Promise.all([
      apiRes.get("/cosmos/staking/v1beta1/validators?pagination.limit=200"),
      apiRes.get(
        `/cosmos/bank/v1beta1/supply/by_denom?denom=${environment.symbol}`,
      ),
      apiRes.get("/cosmos/mint/v1beta1/inflation"),
      apiRes.get("/cosmos/staking/v1beta1/pool"),
      apiRes.get("/cosmos/distribution/v1beta1/params"),
      apiRes.get("/cosmos/bank/v1beta1/supply"),
      apiRes.get("/cosmos/mint/v1beta1/annual_provisions"),
      apiRes.get("/cosmos/mint/v1beta1/params"),
    ]);

    const activeValidator = validatorResponse?.data?.validators.filter(
      (item: any) => item.status === CONST_NAME.BOND_STATUS,
    );

    if (activeValidator?.length === 0) {
      return false;
    }
    const validator = validatorResponse?.data?.validators;

    const totalValidator: number | undefined =
      validatorResponse?.data?.validators?.length;
    if (totalValidator === undefined) {
      return false;
    }

    const circulation_supply: number =
      Number(circulationSupplyResponse.data.amount.amount) / CONST_NAME.ETH_EXP;

    const inflation_rate = Number(inflationRateResponse.data.inflation);

    const formattedInflationRate = `${inflation_rate}`;

    let blocksPerYear = Number(CONST_NAME.BLOCK_PER_YEAR);
    blocksPerYear = Number(blocksPerYear / 2);
    const inflation = formattedInflationRate;

    const bondedTokens =
      Number(poolResponse.data.pool.bonded_tokens) / 10 ** 18;
    const communityTax = Number(paramsResponse.data.params.community_tax);
    const annualProvisions = annualProvision.data.annual_provisions;

    const mintParams = mintParamsResponse?.data?.params ?? {};
    const inflationRate = resolveInflationRate(mintParams);

    // Pick the staking denom out of the supply set rather than trusting its
    // ordering, then convert to whole THEO so it lines up with bondedTokens.
    const mintDenom = String(mintParams.mint_denom || environment.symbol || "");
    const supplyEntry = (total_Supply.data.supply ?? []).find(
      (coin: { denom: string }) =>
        coin?.denom?.toLowerCase() === mintDenom.toLowerCase(),
    );
    const totalSupply =
      Number(supplyEntry?.amount ?? total_Supply.data.supply[0].amount) /
      CONST_NAME.ETH_EXP;

    const bondedRate = Number((bondedTokens / circulation_supply) * 100);

    return {
      annualProvisions,
      blocksPerYear,
      inflation,
      inflationRate,
      bondedTokens,
      communityTax,
      totalValidator,
      circulation_supply,
      bondedRate,
      total_supply: totalSupply,
      totalValidators: validatorResponse?.data?.validators.length,
      activeValidator: activeValidator.length,
    };
  } catch (error) {
    logger.error("getParams Error", error);
    return false;
  }
}

export { calculateData };
