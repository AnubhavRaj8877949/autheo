/* eslint-disable */
import { useState, useEffect, useCallback } from "react";
import AuthorizeValidatorTransaction from "../../../components/SetupValidator/AuthorizeStep";
import FirstStep from "../../../components/SetupValidator/FirstStep";
import StakingStep from "../../../components/SetupValidator/StakingStep";
import { useSelector } from "react-redux";
import CustomStepper from "../../../components/Common/CustomStepper/CustomStepper";
import { ROUTE_PATHS, WALLET_TYPE } from "../../../constants";
import { ValidatorOnboardingModal } from "../../../components/ValidatorOnboarding";
import { storeValidatorType, readValidatorType } from "../../../constants/validatorOnboarding";
import { getOnboardingWindowStatus } from "../../../services/apis/validatorOnboarding";
import LicenseStep from "../../../components/SetupValidator/LicenseStep";
import { readLicenseRecord } from "../../../constants/validatorLicense";
import OnboardingModeChoice, {
  ONBOARDING_MODE,
} from "../../../components/SetupValidator/OnboardingModeChoice";
import MigrateValidatorStep from "../../../components/SetupValidator/MigrateValidatorStep";
import { useNavigate } from "react-router-dom";

const SetupValidator = () => {
  const { walletType, userAddress } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  /**
   * Onboarding now begins with a choice: create a new validator, or migrate
   * one the operator already runs. `null` means the choice has not been made
   * yet, so neither flow has started.
   *
   * The new-validator branch below is exactly the flow that existed before.
   */
  const [mode, setMode] = useState(null);
  const isNewValidatorFlow = mode === ONBOARDING_MODE.NEW;

  const isWallet = walletType !== WALLET_TYPE.NO_WALLET;
  const steps = isWallet
    ? ["Setup Info", "Staking & Sign"]
    : ["Setup Info", "Staking Details", "Authorize & Sign"];

  /**
   * License verification gates the whole flow. It deliberately sits *in front
   * of* the existing step machine rather than becoming index 0 of it, because
   * `handleNext` in utils/validatorValidations.js switches on the absolute
   * step index (case 0 = Setup Info, case 1 = Staking). Renumbering the
   * existing steps would run Setup Info through the staking validator.
   *
   * So the existing steps keep their own 0-based indices, and only the
   * *displayed* stepper is offset by one.
   */
  const [isLicenseVerified, setIsLicenseVerified] = useState(() =>
    Boolean(readLicenseRecord(userAddress))
  );

  // A verification belongs to one wallet; switching wallets requires a new one.
  // With the mock enabled nothing is ever persisted, so the step is shown again
  // on each visit - which is what we want while exploring the flow.
  useEffect(() => {
    setIsLicenseVerified(Boolean(readLicenseRecord(userAddress)));
  }, [userAddress]);

  const displaySteps = ["License ID", ...steps];
  const displayStep = isLicenseVerified ? activeStep + 1 : 0;

  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Only the new-validator flow selects a validator type, so this must not
  // open over the choice screen or the migration form.
  useEffect(() => {
    if (!isNewValidatorFlow) return;
    if (readValidatorType()) return;

    getOnboardingWindowStatus()
      .then(({ isOpen }) => {
        if (isOpen) setOnboardingOpen(true);
      })
      .catch(() => {});
  }, [isNewValidatorFlow]);

  const handleLicenseVerified = useCallback(() => {
    setIsLicenseVerified(true);
  }, []);

  const handleOnboardingProceed = (validatorType) => {
    storeValidatorType(validatorType);
    setOnboardingOpen(false);
  };

  const [primaryValues, setPrimaryValues] = useState({
    name: "",
    details: "",
    website: "",
    identity: "",
    securityContact: "",
  });
  const [secondaryValues, setSecondaryValues] = useState({
    Bond_Amount: "",
    commissionRate: "",
    maxRate: "",
    maxChangeRate: "",
  });

  return (
    <>
      <ValidatorOnboardingModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        walletAddress={userAddress}
        onProceed={handleOnboardingProceed}
      />

      {/* The choice screen lays two cards side by side, so it needs more room
          than the single-column forms that follow it. */}
      <div
        className={`setup-validator-shell${
          mode === null ? " setup-validator-shell--wide" : ""
        }`}
      >
        {/* Step 0 of onboarding: which journey is this? */}
        {mode === null && <OnboardingModeChoice onSelect={setMode} />}

        {mode === ONBOARDING_MODE.MIGRATE && (
          <MigrateValidatorStep
            onBack={() => setMode(null)}
            onComplete={() => navigate(ROUTE_PATHS.DASHBOARD)}
          />
        )}

        {/* ---------------------------------------------------------------
            New-validator flow. Unchanged from before; it is simply no
            longer the only thing this page can show.
            --------------------------------------------------------------- */}
        {isNewValidatorFlow && (
          <>
            <CustomStepper activeStep={displayStep} steps={displaySteps} />

            {!isLicenseVerified ? (
              <LicenseStep onVerified={handleLicenseVerified} />
            ) : (() => {
              switch (activeStep) {
                case 0:
                  return (
                    <FirstStep
                      primaryValues={primaryValues}
                      setPrimaryValues={setPrimaryValues}
                      setActiveStep={setActiveStep}
                      activeStep={activeStep}
                      methodType="createValidator"
                    />
                  );
                case 1:
                  return (
                    <StakingStep
                      activeStep={activeStep}
                      setActiveStep={setActiveStep}
                      setSecondaryValues={setSecondaryValues}
                      secondaryValues={secondaryValues}
                      methodType="createValidator"
                      primaryValues={primaryValues}
                    />
                  );
                case 2:
                  return (
                    <AuthorizeValidatorTransaction
                      setActiveStep={setActiveStep}
                      primaryValues={primaryValues}
                      methodType="createValidator"
                      secondaryValues={secondaryValues}
                    />
                  );
                default:
                  return <></>;
              }
            })()}
          </>
        )}
      </div>
    </>
  );
};

export default SetupValidator;
