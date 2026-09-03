import { ValidatorType, ValidatorTypeConfig } from '../types/validatorOnboarding';
import { CURRENCY } from '../constants';

/** Token symbol shown in copy; falls back to a neutral label if unset. */
const TOKEN = CURRENCY || 'tokens';


export const GENESIS_MIN_STAKE = Number(process.env.REACT_APP_GENESIS_MIN_STAKE) || 5_000_000;
export const GENESIS_LOCK_DAYS = Number(process.env.REACT_APP_GENESIS_STAKE_LOCK_DAYS) || 450;
export const REGULAR_MIN_STAKE = Number(process.env.REACT_APP_REGULAR_MIN_STAKE) || 250_000;


const VALIDATOR_TYPE_STORAGE_KEY = 'validator_type';
const VALIDATOR_TYPE_SIG_KEY = 'validator_type_sig';
const STORAGE_SALT = 'bm_onboarding_v1';

const sign = (value: string): string => btoa(`${STORAGE_SALT}:${value}`);

export const storeValidatorType = (type: string): void => {
  localStorage.setItem(VALIDATOR_TYPE_STORAGE_KEY, type);
  localStorage.setItem(VALIDATOR_TYPE_SIG_KEY, sign(type));
};

export const readValidatorType = (): string | null => {
  const type = localStorage.getItem(VALIDATOR_TYPE_STORAGE_KEY);
  const sig = localStorage.getItem(VALIDATOR_TYPE_SIG_KEY);
  if (!type || !sig || sig !== sign(type)) {
    clearValidatorType();
    return null;
  }
  return type;
};

const clearValidatorType = (): void => {
  localStorage.removeItem(VALIDATOR_TYPE_STORAGE_KEY);
  localStorage.removeItem(VALIDATOR_TYPE_SIG_KEY);
};


export const ONBOARDING_CONFIG = {
  WINDOW_DAYS: Number(process.env.REACT_APP_ONBOARDING_WINDOW_DAYS) || 30,
} as const;


const GENESIS_VALIDATOR_CONFIG: ValidatorTypeConfig = {
  type: ValidatorType.GENESIS,
  label: 'Genesis Validator',
  tagline: 'Early network participant with an approved allocation',
  minStake: GENESIS_MIN_STAKE,
  stakeLockDays: GENESIS_LOCK_DAYS,
  extraStakeUnbondable: true,
  requiresWhitelist: true,
  onboardingWindowOnly: true,
  features: [
    `Minimum stake: ${GENESIS_MIN_STAKE.toLocaleString()} ${TOKEN}`,
    `Stake lock period: ${GENESIS_LOCK_DAYS} days`,
    'Extra stake above minimum is freely unbondable',
    `Only available during the onboarding window (first ${ONBOARDING_CONFIG.WINDOW_DAYS} days)`,
    'Requires whitelist approval',
  ],
};

const REGULAR_VALIDATOR_CONFIG: ValidatorTypeConfig = {
  type: ValidatorType.REGULAR,
  label: 'Standard Validator',
  tagline: 'Open to any operator, at any time',
  minStake: REGULAR_MIN_STAKE,
  requiresWhitelist: false,
  onboardingWindowOnly: false,
  features: [
    `Minimum stake: ${REGULAR_MIN_STAKE.toLocaleString()} ${TOKEN}`,
    'No whitelist required',
    'Standard onboarding process',
    'Available at any time',
  ],
};

export const VALIDATOR_TYPE_CONFIGS: ValidatorTypeConfig[] = [
  GENESIS_VALIDATOR_CONFIG,
  REGULAR_VALIDATOR_CONFIG,
];
