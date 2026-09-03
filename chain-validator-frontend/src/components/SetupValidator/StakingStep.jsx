/*eslint-disable*/
import { useState } from "react";
import { Typography, Tooltip, IconButton, Dialog } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import TextField from "../Common/TextField";
import FormWrapper from "../Common/FormWrapper";
import BackButton from "../BackButton/BackButton";
import CommonBtn from "../Common/CommonBtn/CommonBtn.jsx";
import { BackIcon, CloseIcon } from "../../assets/Icons/SvgIcon.jsx";
import "./style.css";
import { CURRENCY, FEE, MIN_BOND_AMOUNT, commissionInputValues, WALLET_TYPE } from "../../constants";
import { countDecimal, removeZero } from "../../utils/helper";
import {
  handleNext,
} from "../../utils/validatorValidations";
import { toFixed } from "../../utils/toFixed";
import { noExponential } from "../../utils/commonFunctions";
import { formatCompact } from "../../utils/formatNumbers";
import { readValidatorType, GENESIS_MIN_STAKE, REGULAR_MIN_STAKE } from "../../constants/validatorOnboarding";
import { useNavigate } from "react-router-dom";
import { useGetNodeUrl } from "../../context/NodeUrl";
import Loader from "../Loader/Loader";
import { keplrCreateValidator } from "../../keplrEvents/keplrCreateValidator";
import { cosmostationCreateValidator } from "../../cosmostationEvents/createValidator";
import InfoIcon from "../../assets/Icons/InfoIcon";


const StakingStep = ({
  activeStep,
  setActiveStep,
  setSecondaryValues,
  secondaryValues,
  primaryValues,
}) => {
  const { userBalance, valoperAddress, walletType, userAddress } = useSelector(
    (state) => state.auth
  );
  const { valoperAddressFromBlockChain } = useSelector((state) => state?.auth);
  let publicKey = localStorage.getItem("publicKey") || "";

  const { nodeUrl } = useGetNodeUrl();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [errors, setErrors] = useState({});
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);

  const validatorType = readValidatorType();
  const effectiveMinStake = validatorType === 'genesis' ? GENESIS_MIN_STAKE : REGULAR_MIN_STAKE;

  const checkGenesisStake = () => {
    if (validatorType === 'genesis' && Number(secondaryValues?.Bond_Amount) < GENESIS_MIN_STAKE) {
      setErrors((prev) => ({
        ...prev,
        Bond_Amount: `You want to become a Genesis Validator, but your stake amount is less than ${formatCompact(GENESIS_MIN_STAKE)}. Please increase your stake to meet the minimum requirement.`,
      }));
      return false;
    }
    return true;
  };

  const goBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateAll = (updatedValues) => {
    let newErrors = {};
    const commRate = Number(updatedValues?.commissionRate);
    const maxRate = Number(updatedValues?.maxRate);
    const maxChange = Number(updatedValues?.maxChangeRate);

    if (updatedValues?.commissionRate !== "" && (commRate < 5 || commRate > 100)) {
      newErrors.commissionRate = "Initial rate must be between 5% and 100%";
    } else if (updatedValues?.commissionRate !== "" && updatedValues?.maxRate !== "" && commRate > maxRate) {
      newErrors.commissionRate = "Initial rate cannot be greater than max rate";
    }

    if (updatedValues?.maxRate !== "" && (maxRate < commRate || maxRate > 100)) {
      newErrors.maxRate = "Max rate must be between initial rate and 100%";
    }

    if (updatedValues?.maxChangeRate !== "" && updatedValues?.commissionRate !== "" && updatedValues?.maxRate !== "") {
      const allowedChange = maxRate - commRate;
      if (maxChange > allowedChange) {
        newErrors.maxChangeRate = `Max change rate must be ≤ ${allowedChange.toFixed(2)}% (Max Rate - Initial Rate)`;
      }
    }

    setErrors(newErrors);
  };

  const handleAmount = (e) => {
    e.persist();
    const { name, value } = e.target;

    if (
      (value === "" || (!isNaN(Number(value)) && value !== " " && !value.includes("+") && !value.includes("-"))) &&
      countDecimal(value) <= 18
    ) {
      const updatedValues = {
        ...secondaryValues,
        [name]: value === "" ? "" : removeZero(value),
      };

      setSecondaryValues(updatedValues);

      if (name === "Bond_Amount") {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      } else {
        validateAll(updatedValues);
      }
    }
  };

  const handleMaxAmt = () => {
    if (
      Number(userBalance) > 0 &&
      Number(userBalance) > Number(FEE) &&
      Number(userBalance) >= Number(MIN_BOND_AMOUNT) + Number(FEE)
    ) {
      let remianingAmt = Number(userBalance) - Number(FEE);
      setSecondaryValues((prevValue) => ({
        ...prevValue,
        Bond_Amount: noExponential(toFixed(remianingAmt, 7)),
      }));
    } else {
      setSecondaryValues((prevValue) => ({ ...prevValue, Bond_Amount: 0 }));
    }
  };

  const handleNextValidate = async () => {
    if (!checkGenesisStake()) return;

    const isValid = handleNext(
      secondaryValues,
      activeStep,
      setActiveStep,
      userBalance,
      FEE,
      walletType
    );

    if (!isValid) return;
    setLoader(true);

    const data = {
      primaryValues,
      secondaryValues,
      nodeUrl,
      valoperAddressFromBlockChain,
      publicKey,
    };

    if (walletType === WALLET_TYPE.KEPLR) {
      await keplrCreateValidator(
        primaryValues,
        secondaryValues,
        valoperAddressFromBlockChain,
        userAddress,
        publicKey,
        setLoader,
        navigate
      );
    } else if (walletType === WALLET_TYPE.COSMOSTATION) {
      await cosmostationCreateValidator(
        primaryValues,
        secondaryValues,
        valoperAddressFromBlockChain,
        userAddress,
        publicKey,
        setLoader,
        navigate
      );
    } else {
      setLoader(false);
    }
  };

  const getCustomFieldLabel = (name) => {
    switch (name) {
      case "commissionRate":
        return "Starting Commission %";
      case "maxRate":
        return "Maximum Commission %";
      case "maxChangeRate":
        return "Max Daily Increase %";
      default:
        return "";
    }
  };

  const getCustomFieldPlaceholder = (name) => {
    switch (name) {
      case "commissionRate":
        return "Enter starting commission percentage";
      case "maxRate":
        return "Enter maximum commission percentage";
      case "maxChangeRate":
        return "Enter maximum daily increase percentage";
      default:
        return "";
    }
  };

  const getCustomFieldHelper = (name) => {
    switch (name) {
      case "commissionRate":
        return "The commission you begin with. Network minimum: 5%.";
      case "maxRate":
        return "The highest commission your validator can ever charge. Locked at creation.";
      case "maxChangeRate":
        return "The most your commission can increase in 24 hours. Locked at creation.";
      default:
        return "";
    }
  };

  return (
    <FormWrapper>
      <div className="common-wrapper" style={{ marginTop: "20px" }}>
        <BackButton onClick={() => goBack()} title={<BackIcon />} />

        <Typography
          className="common-wrapper__title configureText"
          style={{ marginBottom: "5px", paddingBottom: "10px", textAlign: "left", fontSize: "24px", fontWeight: "700" }}
        >
          Set your stake and commission
        </Typography>
        <Typography
          className="common-wrapper__desc"
          style={{ color: "var(--theme-text-secondary)", fontSize: "16px", marginBottom: "25px", lineHeight: "1.5" }}
        >
          These details are stored on-chain and visible to anyone browsing the Autheo network explorer.
        </Typography>

        <Typography whiteSpace="nowrap" className="common-wrapper__subText mt-15" style={{ fontSize: "16px", fontWeight: 600, color: "var(--theme-text-primary)", marginBottom: "12px" }}>
          Validator Self Staking
        </Typography>

        <div className="stake-amount-input-wrapper">
          <TextField
            label={
              <p style={{ margin: 0, marginBottom: "8px" }}>
                Stake Amount
                <span style={{ color: "var(--status-error)" }}> *</span>
              </p>
            }
            error={Boolean(errors?.Bond_Amount)}
            helperText={errors?.Bond_Amount}
            placeholder="Enter the amount you want to stake as a validator"
            onChange={handleAmount}
            name="Bond_Amount"
            value={secondaryValues?.Bond_Amount}
            type="text"
            autoComplete="off"
          />
          <span className="input-suffix">
            {CURRENCY}
          </span>
        </div>

        <div className="min-required-card">
          <div className="min-required-details">
            <div className="min-required-label">Minimum required</div>
            <div className="min-required-value">
              {formatCompact(effectiveMinStake)} {CURRENCY} + ~{Number(FEE)} {CURRENCY} fee
            </div>
          </div>
          <span className="why-btn" onClick={() => setWhyModalOpen(true)}>
            Why?
          </span>
        </div>

        <div className="commission-header-section">
          <Typography paddingTop="0" variant="h5" style={{ fontSize: "16px", fontWeight: 600, color: "var(--theme-text-primary)", margin: 0 }}>
            Validator Commission Settings (%)
          </Typography>
          <button className="learn-more-btn" type="button" onClick={() => setCommissionModalOpen(true)}>
            Learn more
          </button>
        </div>
        {commissionInputValues?.map((item) => (
          <div className="stakingInputs" key={item?.id} >
            <TextField
              className="setup_inputTexts"
              label={
                <p style={{ margin: 0, marginBottom: "4px" }}>
                  {getCustomFieldLabel(item?.name)}
                  <span style={{ color: "var(--status-error)" }}>*</span>
                </p>
              }
              placeholder={getCustomFieldPlaceholder(item?.name)}
              name={item?.name}
              value={secondaryValues[item?.name]}
              onChange={(e) => handleAmount(e)}
              type="text"
              autoComplete="off"
              error={Boolean(errors?.[item?.name])}
              helperText={errors?.[item?.name] || getCustomFieldHelper(item?.name)}
            />
          </div>
        ))}

        <div className="on-chain-info-box">
          <span className="info-icon-span">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </span>
          <span className="info-text">
            Stake and commission settings are stored on-chain and visible on the Autheo network explorer.
          </span>
        </div>

        <div className="commonBtns">
          <CommonBtn
            children="Bond & Validate"
            onClick={
              walletType === WALLET_TYPE.NO_WALLET
                ? () => {
                  if (!checkGenesisStake()) return;
                  handleNext(secondaryValues, activeStep, setActiveStep, userBalance, FEE, walletType);
                }
                : () => handleNextValidate()
            }
            sx={{
              background: "var(--brand-primary) !important",
              color: "#000000 !important",
              borderRadius: "28px !important",
              width: "100%",
              height: "54px",
              fontSize: "18px",
              fontWeight: "700",
              textTransform: "none",
              boxShadow: "none",
              margin: "0 auto",
              display: "block",
              "&:hover": {
                background: "#e5e51c !important",
                opacity: 0.9,
              }
            }}
          />
        </div>
      </div>

      {/* Why Modal */}
      <Dialog
        open={whyModalOpen}
        onClose={() => setWhyModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ backdrop: { sx: { backdropFilter: "blur(4px)", backgroundColor: "rgba(0, 0, 0, 0.6)" } } }}
        PaperProps={{
          sx: {
            background: "var(--theme-bg-modal) !important",
            border: "1px solid var(--theme-border-card)",
            borderRadius: "16px",
            padding: "24px",
            color: "var(--theme-text-primary)",
            backgroundImage: "none !important",
            boxShadow: "var(--theme-shadow-modal)",
            position: "relative"
          }
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "var(--theme-text-primary)" }}>
            Why is this required?
          </h3>
          <IconButton
            onClick={() => setWhyModalOpen(false)}
            sx={{
              color: "var(--theme-text-secondary)",
              padding: 0,
              "&:hover": { color: "var(--theme-text-primary)", background: "var(--theme-bg-hover)" }
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </div>

        <p style={{ margin: "0 0 20px 0", fontSize: "14px", lineHeight: "1.5", color: "var(--theme-text-secondary)" }}>
          To activate a validator node you must self-stake at least{" "}
          {formatCompact(effectiveMinStake)} {CURRENCY}. You also need a small extra balance to
          cover the on-chain transaction fee.
        </p>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "var(--theme-bg-hover)",
          border: "1px solid var(--theme-border-primary)",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px"
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--theme-text-primary)", display: "inline-block" }}></span>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--theme-text-primary)" }}>
            Required now: {formatCompact(effectiveMinStake)} {CURRENCY} + ~{Number(FEE)} {CURRENCY} fee
          </span>
        </div>

        <p style={{ margin: "0 0 24px 0", fontSize: "13px", lineHeight: "1.4", color: "var(--theme-text-secondary)" }}>
          This information is stored on-chain and visible to anyone browsing the Autheo network explorer.
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => setWhyModalOpen(false)}
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "#000000",
              border: "none",
              borderRadius: "24px",
              padding: "10px 32px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            Got it
          </button>
        </div>
      </Dialog>

      {/* Commission settings Modal */}
      <Dialog
        open={commissionModalOpen}
        onClose={() => setCommissionModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ backdrop: { sx: { backdropFilter: "blur(4px)", backgroundColor: "rgba(0, 0, 0, 0.6)" } } }}
        PaperProps={{
          sx: {
            background: "var(--theme-bg-modal) !important",
            border: "1px solid var(--theme-border-card)",
            borderRadius: "16px",
            padding: "24px",
            color: "var(--theme-text-primary)",
            backgroundImage: "none !important",
            boxShadow: "var(--theme-shadow-modal)",
            position: "relative"
          }
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "var(--theme-text-primary)" }}>
            About commission settings
          </h3>
          <IconButton
            onClick={() => setCommissionModalOpen(false)}
            sx={{
              color: "var(--theme-text-secondary)",
              padding: 0,
              "&:hover": { color: "var(--theme-text-primary)", background: "var(--theme-bg-hover)" }
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </div>

        <p style={{ margin: "0 0 20px 0", fontSize: "14px", lineHeight: "1.5", color: "var(--theme-text-secondary)" }}>
          Commission is the percentage of rewards your validator keeps before sharing the rest with delegators.
        </p>

        {/* Row 1 */}
        <div style={{
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
          borderTop: "1px solid var(--theme-border-secondary)",
          borderBottom: "1px solid var(--theme-border-secondary)",
          padding: "16px 0"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            backgroundColor: "var(--theme-bg-hover)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "18px",
            fontWeight: "600",
            color: "var(--theme-text-secondary)"
          }}>
            %
          </div>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: "var(--theme-text-primary)" }}>
              Starting commission
            </h4>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.4", color: "var(--theme-text-secondary)" }}>
              The percentage of validator rewards you begin by keeping before the rest is distributed to delegators. Network minimum: 5%.
            </p>
          </div>
        </div>

        {/* Row 2 */}
        <div style={{
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
          borderBottom: "1px solid var(--theme-border-secondary)",
          padding: "16px 0"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            backgroundColor: "var(--theme-bg-hover)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "var(--theme-text-secondary)"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: "var(--theme-text-primary)" }}>
              Maximum commission
            </h4>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.4", color: "var(--theme-text-secondary)" }}>
              The highest commission your validator can ever charge. This limit is locked when the validator is created.
            </p>
          </div>
        </div>

        {/* Row 3 */}
        <div style={{
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
          padding: "16px 0",
          marginBottom: "16px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            backgroundColor: "var(--theme-bg-hover)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "var(--theme-text-secondary)"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: "var(--theme-text-primary)" }}>
              Max daily increase
            </h4>
            <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.4", color: "var(--theme-text-secondary)" }}>
              The maximum amount your commission can increase in a 24-hour period. This limit is also locked at creation.
            </p>
          </div>
        </div>

        <p style={{ margin: "0 0 24px 0", fontSize: "13px", lineHeight: "1.4", color: "var(--theme-text-secondary)" }}>
          These values are stored on-chain and visible to anyone browsing the Autheo network explorer.
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => setCommissionModalOpen(false)}
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "#000000",
              border: "none",
              borderRadius: "24px",
              padding: "10px 32px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            Got it
          </button>
        </div>
      </Dialog>
      {loader && <Loader />}
    </FormWrapper>
  );
};

export default StakingStep;
