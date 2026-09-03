import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FormWrapper from "../Common/FormWrapper";
import TextField from "../Common/TextField";
import CommonBtn from "../Common/CommonBtn/CommonBtn.jsx";
import {
  LICENSE_STATUS,
  useLicenseVerification,
} from "../../hooks/useLicenseVerification";
import {
  isLicenseVerificationMocked,
  LICENSE_ID_EXAMPLE,
  LICENSE_ID_LENGTH,
  validateLicenseId,
} from "../../constants/validatorLicense";
import "./style.css";

/**
 * How long the confirmed state stays on screen before advancing, so the
 * operator actually sees that verification succeeded.
 */
const SUCCESS_DWELL_MS = 1400;

/**
 * Copy for each state. Verification is a wallet signature, so the wording says
 * so plainly rather than borrowing transaction language.
 */
const STATUS_COPY = {
  [LICENSE_STATUS.AWAITING_WALLET]: {
    tone: "pending",
    title: "Waiting for wallet confirmation",
    body: "Open your wallet and approve the signature request. Nothing is spent and there is no gas fee.",
  },
  [LICENSE_STATUS.VERIFYING]: {
    tone: "pending",
    title: "Verifying your license",
    body: "Checking that the signature matches your wallet. This only takes a moment.",
  },
  [LICENSE_STATUS.SUCCESS]: {
    tone: "success",
    title: "License verified",
    body: "Taking you to your validator details…",
  },
};

/** The real step: validates the License ID and verifies a wallet signature. */
const RealLicenseStep = ({ onVerified }) => {
  const { userAddress, walletType } = useSelector((state) => state.auth);

  const {
    licenseId,
    setLicenseId,
    fieldError,
    status,
    error,
    isBusy,
    canSign,
    verify,
  } = useLicenseVerification({ address: userAddress, walletType });

  const isVerified = status === LICENSE_STATUS.SUCCESS;

  // Show the confirmed state briefly, then move on.
  useEffect(() => {
    if (!isVerified) return undefined;
    const timer = setTimeout(() => onVerified?.(), SUCCESS_DWELL_MS);
    return () => clearTimeout(timer);
  }, [isVerified, onVerified]);

  const banner =
    STATUS_COPY[status] ||
    (status === LICENSE_STATUS.ERROR && error
      ? {
          tone: "error",
          title: "Verification failed",
          body: error,
        }
      : null);

  const ctaLabel = (() => {
    if (status === LICENSE_STATUS.AWAITING_WALLET) return "Check your wallet…";
    if (status === LICENSE_STATUS.VERIFYING) return "Verifying…";
    if (isVerified) return "Verified";
    if (status === LICENSE_STATUS.ERROR) return "Try again";
    return "Verify License";
  })();

  return (
    <FormWrapper>
      <div className="common-wrapper license-step">
        <Typography className="common-wrapper__title">
          Verify your validator license
        </Typography>

        <Typography className="license-step__intro">
          Enter the License ID issued with your validator license. You'll sign a
          short message with your wallet to prove it's yours — this doesn't move
          any funds and costs no gas.
        </Typography>

        <div className="license-step__field">
          <TextField
            label={
              <p style={{ margin: 0, marginBottom: "8px" }}>
                License ID
                <span style={{ color: "var(--status-error)" }}> *</span>
              </p>
            }
            placeholder={LICENSE_ID_EXAMPLE}
            value={licenseId}
            onChange={(e) => setLicenseId(e.target.value)}
            error={Boolean(fieldError)}
            helperText={
              fieldError ||
              `${LICENSE_ID_LENGTH} characters, including the dashes.`
            }
            disabled={isBusy || isVerified}
            autoComplete="off"
          />
        </div>

        {!canSign && (
          <div
            className="autheo-alert autheo-alert--warning license-step__banner"
            role="alert"
          >
            <span>
              Connect Keplr or Cosmostation to verify your license. Your current
              wallet can't sign messages.
            </span>
          </div>
        )}

        <div id="license-step-status" aria-live="polite">
          {banner && (
            <div
              className={`autheo-alert autheo-alert--${banner.tone === "pending" ? "info" : banner.tone} license-step__banner`}
              role={banner.tone === "error" ? "alert" : "status"}
            >
              <span
                className={`license-step__indicator license-step__indicator--${banner.tone}`}
                aria-hidden="true"
              />
              <span className="license-step__banner-text">
                <strong className="license-step__banner-title">
                  {banner.title}
                </strong>
                <span className="license-step__banner-body">{banner.body}</span>
              </span>
            </div>
          )}
        </div>

        <CommonBtn
          onClick={verify}
          disabled={isBusy || isVerified || !canSign}
          aria-busy={isBusy}
          sx={{ marginTop: "8px" }}
        >
          {ctaLabel}
        </CommonBtn>

        <Typography className="license-step__footnote">
          Verification is required before you can register a validator node.
        </Typography>
      </div>
    </FormWrapper>
  );
};

/* ========================================================================= *
 * TEMPORARY MOCK — REMOVE BEFORE PRODUCTION
 *
 * Behaves like the real step right up to the point of proof:
 *
 *   - the operator types a License ID
 *   - the format is genuinely validated (the same `validateLicenseId` the
 *     real step uses, so a bad ID is still rejected inline)
 *   - "Verify License" then simply succeeds
 *
 * What is skipped is only the proof: no wallet is opened, no message is
 * signed, no signature is verified and nothing is persisted. The short delay
 * exists purely so the transition feels like the real thing.
 * ========================================================================= */

/** Fake latency, so verification does not complete in the same frame. */
const MOCK_VERIFY_DELAY_MS = 600;

const MOCK_STATUS = {
  IDLE: "idle",
  VERIFYING: "verifying",
  VERIFIED: "verified",
};

const MockedLicenseStep = ({ onVerified }) => {
  const [licenseId, setLicenseId] = useState("");
  const [fieldError, setFieldError] = useState(null);
  const [status, setStatus] = useState(MOCK_STATUS.IDLE);

  const isVerifying = status === MOCK_STATUS.VERIFYING;
  const isVerified = status === MOCK_STATUS.VERIFIED;

  const handleChange = (event) => {
    setLicenseId(event.target.value);
    setFieldError(null);
  };

  const handleVerify = () => {
    // Format is still checked for real - only the proof of ownership is mocked.
    const problem = validateLicenseId(licenseId);
    if (problem) {
      setFieldError(problem);
      return;
    }
    setFieldError(null);
    setStatus(MOCK_STATUS.VERIFYING);
  };

  useEffect(() => {
    if (!isVerifying) return undefined;
    const timer = setTimeout(
      () => setStatus(MOCK_STATUS.VERIFIED),
      MOCK_VERIFY_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [isVerifying]);

  const banner = (() => {
    if (isVerifying) {
      return {
        tone: "info",
        indicator: "pending",
        role: "status",
        title: "Verifying your license",
        body: "Checking your License ID. This only takes a moment.",
      };
    }
    if (isVerified) {
      return {
        tone: "success",
        indicator: "success",
        role: "status",
        title: "License verified",
        body: "Your License ID has been verified. Continue to your validator details.",
      };
    }
    return null;
  })();

  const ctaLabel = (() => {
    if (isVerifying) return "Verifying…";
    if (isVerified) return "Next";
    return "Verify License";
  })();

  return (
    <FormWrapper>
      <div className="common-wrapper license-step">
        <Typography className="common-wrapper__title">
          Verify your validator license
        </Typography>

        <Typography className="license-step__intro">
          Enter the License ID issued with your validator license to continue to
          your validator details.
        </Typography>

        <div className="license-step__field">
          <TextField
            label={
              <p style={{ margin: 0, marginBottom: "8px" }}>
                License ID
                <span style={{ color: "var(--status-error)" }}> *</span>
              </p>
            }
            placeholder={LICENSE_ID_EXAMPLE}
            value={licenseId}
            onChange={handleChange}
            error={Boolean(fieldError)}
            helperText={
              fieldError ||
              `${LICENSE_ID_LENGTH} characters, including the dashes.`
            }
            disabled={isVerifying || isVerified}
            autoComplete="off"
          />
        </div>

        <div aria-live="polite">
          {banner && (
            <div
              className={`autheo-alert autheo-alert--${banner.tone} license-step__banner`}
              role={banner.role}
            >
              <span
                className={`license-step__indicator license-step__indicator--${banner.indicator}`}
                aria-hidden="true"
              />
              <span className="license-step__banner-text">
                <strong className="license-step__banner-title">
                  {banner.title}
                </strong>
                <span className="license-step__banner-body">{banner.body}</span>
              </span>
            </div>
          )}
        </div>

        <CommonBtn
          onClick={isVerified ? () => onVerified?.() : handleVerify}
          disabled={isVerifying}
          aria-busy={isVerifying}
          sx={{ marginTop: "8px" }}
        >
          {ctaLabel}
        </CommonBtn>

        <Typography className="license-step__footnote license-step__footnote--mock">
          Demo mode — the License ID format is checked, but ownership is not
          verified.
        </Typography>
      </div>
    </FormWrapper>
  );
};

/* --------------------------------------------------------------------- *
 * TEMPORARY MOCK — REMOVE BEFORE PRODUCTION
 *
 * A thin wrapper picks the variant. Because the wrapper calls no hooks of
 * its own, the real step's hooks stay unconditional, and `RealLicenseStep`
 * is left completely untouched by the flag.
 *
 * To remove the mock: delete `MockedLicenseStep`, the flag, and reduce this
 * to `export default RealLicenseStep;`.
 * --------------------------------------------------------------------- */
const LicenseStep = (props) =>
  isLicenseVerificationMocked() ? (
    <MockedLicenseStep {...props} />
  ) : (
    <RealLicenseStep {...props} />
  );

export default LicenseStep;
