import './ValidatorOnboarding.scss';
import React, { useCallback, useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { ValidatorType, ValidatorOnboardingModalProps } from '../../types/validatorOnboarding';
import { VALIDATOR_TYPE_CONFIGS } from '../../constants/validatorOnboarding';
import { getOnboardingWindowStatus } from '../../services/apis/validatorOnboarding';
import { useValidatorOnboarding } from '../../hooks/useValidatorOnboarding';
import ValidatorTypeCard from './ValidatorTypeCard';
import { CloseIcon, WarningIcon } from '../../assets/Icons/SvgIcon';
import CommonBtn from '../Common/CommonBtn/CommonBtn';


const ValidatorOnboardingModal: React.FC<ValidatorOnboardingModalProps> = ({
  open,
  onClose,
  walletAddress,
  onProceed,
}) => {
  const muiTheme = useTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [isOnboardingWindowOpen, setIsOnboardingWindowOpen] = useState(false);

  useEffect(() => {
    getOnboardingWindowStatus().then(({ isOpen }) => setIsOnboardingWindowOpen(isOpen)).catch(() => { });
  }, []);

  const isGenesisDisabled = !isOnboardingWindowOpen;
  const handleValidated = useCallback(
    (type: ValidatorType) => {
      onProceed?.(type);
      onClose();
    },
    [onProceed, onClose]
  );

  const { state, selectType, validate, reset } = useValidatorOnboarding({
    walletAddress,
    onValidated: handleValidated,
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleTypeSelect = (type: ValidatorType) => {
    selectType(type);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const canProceed = state.selectedType !== null && !state.isLoading;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      aria-labelledby="vo-modal-title"
      className="vo-dialog"
      PaperProps={{ className: 'vo-dialog__paper', elevation: 0 }}
      TransitionProps={{ onExited: reset }}
    >
      <DialogTitle className="vo-dialog__title" id="vo-modal-title" component="div">
        <div className="vo-dialog__title-inner">
          <span className="vo-dialog__title-text">Select Validator Type</span>
          <IconButton
            onClick={handleClose}
            aria-label="Close onboarding modal"
            size="small"
            className="vo-dialog__close-btn"
            disableRipple
          >
            <CloseIcon />
          </IconButton>
        </div>
        <p className="vo-dialog__subtitle">
          Choose how you want to participate in securing the Autheo network.
        </p>
      </DialogTitle>

      <DialogContent className="vo-dialog__content">
        <div
          className="vo-card-grid"
          role="radiogroup"
          aria-label="Validator type selection"
          aria-required="true"
        >
          {VALIDATOR_TYPE_CONFIGS.map((config) => {
            const disabled = config.type === ValidatorType.GENESIS && isGenesisDisabled;
            return (
              <ValidatorTypeCard
                key={config.type}
                config={config}
                isSelected={state.selectedType === config.type}
                isDisabled={disabled}
                onSelect={handleTypeSelect}
              />
            );
          })}
        </div>

        {state.error && (
          <div className="vo-error-banner" role="alert" aria-live="assertive">
            <span className="vo-error-banner__icon">
              <WarningIcon />
            </span>
            <span className="vo-error-banner__msg">{state.error.message}</span>
          </div>
        )}
      </DialogContent>

      <DialogActions className="vo-dialog__actions" disableSpacing>
        <CommonBtn
          onClick={validate}
          disabled={!canProceed}
          sx={{ margin: '0', display: 'inline-flex' }}
          aria-busy={state.isLoading}
          aria-label={(() => {
            if (state.isLoading) return 'Verifying eligibility…';
            if (state.selectedType) return `Proceed as ${state.selectedType} validator`;
            return 'Select a validator type to proceed';
          })()}
        >
          {state.isLoading ? (
            <>
              <CircularProgress size={14} color="inherit" thickness={4} />
              <span style={{ marginLeft: '8px' }}>Verifying…</span>
            </>
          ) : (
            'Proceed'
          )}
        </CommonBtn>
      </DialogActions>
    </Dialog>
  );
};

export default ValidatorOnboardingModal;
