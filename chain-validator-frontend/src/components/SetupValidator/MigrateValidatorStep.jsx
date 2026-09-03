import { Typography } from "@mui/material";
import { useRef, useState } from "react";
import FormWrapper from "../Common/FormWrapper";
import TextField from "../Common/TextField";
import CommonBtn from "../Common/CommonBtn/CommonBtn.jsx";
import BackButton from "../BackButton/BackButton";
import { BackIcon, CloseIcon } from "../../assets/Icons/SvgIcon";
import {
  MIGRATION_STATUS,
  useValidatorMigration,
} from "../../hooks/useValidatorMigration";
import {
  allowsInsecureUrl,
  formatFileSize,
  MIGRATION_DATA_DELAY_LABEL,
  MIGRATION_FILE_ACCEPT,
  MIGRATION_FILE_HINT,
  SECURE_URL_PLACEHOLDER,
} from "../../constants/validatorMigration";
import "./style.css";

/**
 * Migration form for an operator who already runs a validator.
 *
 * Collects the secure URL, the migration file and its password, then submits
 * them through `services/validatorMigration`. Field help deliberately explains
 * what each value is for without echoing anything sensitive back to the page.
 */
const MigrateValidatorStep = ({ onBack, onComplete }) => {
  const {
    secureUrl,
    setSecureUrl,
    file,
    setFile,
    clearFile,
    password,
    setPassword,
    fieldErrors,
    status,
    error,
    isProcessing,
    isComplete,
    submit,
    retry,
  } = useValidatorMigration();

  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  const pickFile = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] ?? null);
    // Reset the input so choosing the same file again still fires onChange.
    event.target.value = "";
  };

  const removeFile = () => {
    clearFile();
    setShowPassword(false);
  };

  const banner = (() => {
    if (isProcessing) {
      return {
        tone: "info",
        indicator: "pending",
        role: "status",
        title: "Migrating your validator",
        body: "Transferring your validator setup. Please keep this page open.",
      };
    }
    if (isComplete) {
      return {
        tone: "success",
        indicator: "success",
        role: "status",
        title: "Migration complete",
        body: `Your existing validator has been migrated. It can take ${MIGRATION_DATA_DELAY_LABEL} for your validator data to appear in the app.`,
      };
    }
    if (status === MIGRATION_STATUS.ERROR && error) {
      return {
        tone: "error",
        indicator: "error",
        role: "alert",
        title: "Migration failed",
        body: error,
      };
    }
    return null;
  })();

  const ctaLabel = (() => {
    if (isProcessing) return "Migrating…";
    if (isComplete) return "Go to Dashboard";
    if (status === MIGRATION_STATUS.ERROR) return "Try again";
    return "Continue";
  })();

  const onCtaClick = () => {
    if (isComplete) return onComplete?.();
    if (status === MIGRATION_STATUS.ERROR) return retry();
    return submit();
  };

  const fieldsDisabled = isProcessing || isComplete;

  return (
    <FormWrapper>
      <div className="common-wrapper migrate-step">
        <Typography className="common-wrapper__title common-wrapper__title--flex">
          {!fieldsDisabled && (
            <BackButton
              onClick={onBack}
              title={<BackIcon />}
              aria-label="Back to onboarding options"
            />
          )}
          Migrate Existing Validator
        </Typography>

        <Typography className="migrate-step__intro">
          Bring a validator you already run onto this app. You'll need the
          secure URL for your node, the migration file exported from it, and the
          password that protects that file.
        </Typography>

        {/* 1. Secure URL */}
        <div className="migrate-step__field">
          <TextField
            label={
              <p style={{ margin: 0, marginBottom: "8px" }}>
                Secure URL
                <span style={{ color: "var(--status-error)" }}> *</span>
              </p>
            }
            placeholder={SECURE_URL_PLACEHOLDER}
            value={secureUrl}
            onChange={(e) => setSecureUrl(e.target.value)}
            error={Boolean(fieldErrors.secureUrl)}
            helperText={
          //    fieldErrors.secureUrl ||
           //   (allowsInsecureUrl()
             //   ? "The address of the validator you're migrating."
              //  : "The address of the validator you're migrating. Must be https://.")
            }
            disabled={fieldsDisabled}
            autoComplete="off"
          />
        </div>

        {/* 2. Upload file */}
        <div className="migrate-step__field">
          <p className="migrate-step__label">
            Migration file
            <span style={{ color: "var(--status-error)" }}> *</span>
          </p>

          <input
            ref={fileInputRef}
            type="file"
            className="migrate-step__file-input"
            accept={MIGRATION_FILE_ACCEPT}
            onChange={handleFileChange}
            disabled={fieldsDisabled}
            aria-label="Migration file"
          />

          {file ? (
            <div className="migrate-step__file">
              <span className="migrate-step__file-meta">
                <span className="migrate-step__file-name" title={file.name}>
                  {file.name}
                </span>
                <span className="migrate-step__file-size">
                  {formatFileSize(file.size)}
                </span>
              </span>

              {!fieldsDisabled && (
                <span className="migrate-step__file-actions">
                  <button
                    type="button"
                    className="migrate-step__file-action"
                    onClick={pickFile}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    className="migrate-step__file-action migrate-step__file-action--remove"
                    onClick={removeFile}
                    aria-label={`Remove ${file.name}`}
                  >
                    <CloseIcon />
                  </button>
                </span>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="migrate-step__dropzone"
              onClick={pickFile}
              disabled={fieldsDisabled}
            >
              <span className="migrate-step__dropzone-title">
                Choose a file
              </span>
              <span className="migrate-step__dropzone-hint">
                {MIGRATION_FILE_HINT}
              </span>
            </button>
          )}

          <span
            className={`migrate-step__help${
              fieldErrors.file ? " migrate-step__help--error" : ""
            }`}
          >
            {fieldErrors.file ||
              "The export from your existing validator. It never leaves this form until you continue."}
          </span>
        </div>

        {/* 3. Password */}
        <div className="migrate-step__field">
          <TextField
            label={
              <p style={{ margin: 0, marginBottom: "8px" }}>
                Migration password
                <span style={{ color: "var(--status-error)" }}> *</span>
              </p>
            }
            type={showPassword ? "text" : "password"}
            placeholder="Enter the password for your migration file"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(fieldErrors.password)}
            helperText={
              fieldErrors.password ||
              "Used once to unlock your migration file. It is not stored."
            }
            disabled={fieldsDisabled}
            autoComplete="off"
          />
          {!fieldsDisabled && (
            <button
              type="button"
              className="migrate-step__reveal"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
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

        {/* Deliberately not disabled while the form is incomplete: pressing
            Continue is how the operator finds out which field needs
            attention. Submission itself is still blocked until every field
            validates. */}
        <CommonBtn
          onClick={onCtaClick}
          disabled={isProcessing}
          aria-busy={isProcessing}
          sx={{ marginTop: "8px" }}
        >
          {ctaLabel}
        </CommonBtn>
      </div>
    </FormWrapper>
  );
};

export default MigrateValidatorStep;
