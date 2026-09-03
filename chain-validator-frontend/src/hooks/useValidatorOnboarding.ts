import { useState, useCallback } from 'react';
import {
  ValidatorType,
  OnboardingState,
} from '../types/validatorOnboarding';
import { checkWalletWhitelist } from '../services/apis/validatorOnboarding';

const INITIAL_STATE: OnboardingState = {
  selectedType: null,
  isLoading: false,
  isValidated: false,
  error: null,
};

interface UseValidatorOnboardingOptions {
  walletAddress: string;
  onValidated?: (type: ValidatorType) => void;
}

interface UseValidatorOnboardingReturn {
  state: OnboardingState;
  selectType: (type: ValidatorType) => void;
  validate: () => Promise<void>;
  reset: () => void;
}

export const useValidatorOnboarding = ({
  walletAddress,
  onValidated,
}: UseValidatorOnboardingOptions): UseValidatorOnboardingReturn => {
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);

  const patch = (update: Partial<OnboardingState>) =>
    setState((prev) => ({ ...prev, ...update }));

  const selectType = useCallback((type: ValidatorType) => {
    patch({ selectedType: type, isValidated: false, error: null });
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const validate = useCallback(async () => {
    if (!state.selectedType) return;

    patch({ isLoading: true, error: null });

    try {
      if (state.selectedType === ValidatorType.REGULAR) {
        patch({ isLoading: false, isValidated: true });
        onValidated?.(ValidatorType.REGULAR);
        return;
      }

      const { isWhitelisted } = await checkWalletWhitelist(walletAddress);
      if (!isWhitelisted) {
        patch({
          isLoading: false,
          error: {
            code: 'NOT_WHITELISTED',
            message: 'This wallet address is not whitelisted for Genesis Validator onboarding.',
          },
        });
        return;
      }

      patch({ isLoading: false, isValidated: true });
      onValidated?.(ValidatorType.GENESIS);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to verify eligibility. Please try again.';
      patch({
        isLoading: false,
        error: { code: 'VALIDATION_ERROR', message },
      });
    }
  }, [state.selectedType, walletAddress, onValidated]);

  return { state, selectType, validate, reset };
};
