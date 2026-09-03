import { api } from '../../utils/api';
import {
  ApprovedValidatorResponse,
  WhitelistCheckResponse,
  OnboardingWindowStatus,
} from '../../types/validatorOnboarding';
import { ONBOARDING_CONFIG } from '../../constants/validatorOnboarding';
import { CHAIN_REST_API_URL, TENDERMINT_RPC } from '../../constants';
import { convertToValoperAddress } from '../convertToValoperAddress';


export const checkWalletWhitelist = async (walletAddress: string): Promise<WhitelistCheckResponse> => {
  const validatorAddress = convertToValoperAddress(walletAddress);
  if (!validatorAddress) {
    throw new Error(`Unable to derive validator address from ${walletAddress}`);
  }

  // NOTE: `/blockmaze/...` is the chain's own REST module route, not app
  // branding. It is part of the backend contract and must match whatever the
  // connected node exposes - do not rename it as part of a rebrand.
  const url = `${CHAIN_REST_API_URL}/blockmaze/genesisvalidator/v1/approved/${encodeURIComponent(validatorAddress)}`;
  const response = await api<ApprovedValidatorResponse>(url);
  return {
    isWhitelisted: response.is_approved,
    walletAddress,
  };
};

const parseChainTimestamp = (raw: string): Date => {
  const normalized = raw.replace(/(\.\d{3})\d+/, '$1');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid chain timestamp: ${raw}`);
  return date;
};

const computeWindowStatus = (launchDateStr: string, windowDays: number): OnboardingWindowStatus => {
  const launchDate = parseChainTimestamp(launchDateStr);
  const now = new Date();
  const windowEnd = new Date(launchDate.getTime() + windowDays * 24 * 60 * 60 * 1000);
  const isOpen = now >= launchDate && now <= windowEnd;
  return { isOpen };
};

export const getOnboardingWindowStatus = async (): Promise<OnboardingWindowStatus> => {
  const windowDays = ONBOARDING_CONFIG.WINDOW_DAYS;
  const res = await fetch(`${TENDERMINT_RPC}/genesis`);

  if (!res.ok) throw new Error(`Failed to fetch genesis: ${res.status}`);
  const data = await res.json();

  const launchDateStr: string | undefined = data?.result?.genesis?.genesis_time;
  if (!launchDateStr) throw new Error('genesis_time not found in /genesis response');
  return computeWindowStatus(launchDateStr, windowDays);
};
