
export enum ValidatorType {
  GENESIS = 'genesis',
  REGULAR = 'regular',
}

export interface ValidatorTypeConfig {
  type: ValidatorType;
  label: string;
  tagline: string;
  minStake: number;
  stakeLockDays?: number;
  extraStakeUnbondable?: boolean;
  requiresWhitelist: boolean;
  onboardingWindowOnly: boolean;
  features: string[];
}

export interface OnboardingError {
  code: string;
  message: string;
}

export interface OnboardingState {
  selectedType: ValidatorType | null;
  isLoading: boolean;
  isValidated: boolean;
  error: OnboardingError | null;
}


export interface ApprovedValidatorResponse {
  is_approved: boolean;
  info: unknown;
}

export interface WhitelistCheckResponse {
  isWhitelisted: boolean;
  walletAddress: string;
}

export interface OnboardingWindowStatus {
  isOpen: boolean;
}


export interface ValidatorOnboardingModalProps {
  open: boolean;
  onClose: () => void;
  walletAddress: string;
  onProceed?: (type: ValidatorType) => void;
}

export interface ValidatorTypeCardProps {
  config: ValidatorTypeConfig;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (type: ValidatorType) => void;
}
