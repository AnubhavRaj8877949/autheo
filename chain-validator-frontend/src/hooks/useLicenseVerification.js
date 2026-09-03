import { useCallback, useRef, useState } from "react";
import { ExceptionParser } from "../internal/exception-parser";
import {
  isLicenseSigningAvailable,
  signLicenseAttestation,
  LICENSE_ERRORS,
} from "../services/validatorLicense";
import {
  normalizeLicenseId,
  storeLicenseRecord,
  validateLicenseId,
} from "../constants/validatorLicense";

/**
 * The states the operator is walked through. Each one has a distinct message
 * in the UI so it is always clear what is happening and who is waiting on whom.
 */
export const LICENSE_STATUS = {
  IDLE: "idle",
  AWAITING_WALLET: "awaitingWallet",
  VERIFYING: "verifying",
  SUCCESS: "success",
  ERROR: "error",
};

const FRIENDLY_ERRORS = {
  [LICENSE_ERRORS.WALLET_UNAVAILABLE]:
    "Your wallet doesn't support message signing. Reconnect with Keplr or Cosmostation and try again.",
  [LICENSE_ERRORS.SIGNATURE_INVALID]:
    "We couldn't confirm that signature came from your wallet. Please try again.",
  [LICENSE_ERRORS.NO_ADDRESS]:
    "No wallet address found. Please reconnect your wallet and try again.",
};

/**
 * Drives the license verification step: field validation, the wallet signing
 * request, local signature verification, and the resulting state.
 *
 * @param {{
 *   address: string,
 *   walletType: string,
 *   onVerified?: (attestation: object) => void
 * }} options
 */
export const useLicenseVerification = ({ address, walletType, onVerified }) => {
  const [licenseId, setLicenseIdRaw] = useState("");
  const [fieldError, setFieldError] = useState(null);
  const [status, setStatus] = useState(LICENSE_STATUS.IDLE);
  const [error, setError] = useState(null);

  // Guards against a double submit while the wallet prompt is open.
  const inFlight = useRef(false);

  const canSign = isLicenseSigningAvailable(walletType);
  const isBusy =
    status === LICENSE_STATUS.AWAITING_WALLET ||
    status === LICENSE_STATUS.VERIFYING;

  const setLicenseId = useCallback((value) => {
    setLicenseIdRaw(value);
    // Clear stale feedback as soon as the operator starts correcting the field.
    setFieldError(null);
    setError(null);
    setStatus((prev) =>
      prev === LICENSE_STATUS.ERROR ? LICENSE_STATUS.IDLE : prev
    );
  }, []);

  const reset = useCallback(() => {
    setStatus(LICENSE_STATUS.IDLE);
    setError(null);
    setFieldError(null);
    inFlight.current = false;
  }, []);

  const verify = useCallback(async () => {
    if (inFlight.current) return;

    const problem = validateLicenseId(licenseId);
    if (problem) {
      setFieldError(problem);
      setStatus(LICENSE_STATUS.IDLE);
      return;
    }

    inFlight.current = true;
    setFieldError(null);
    setError(null);
    setStatus(LICENSE_STATUS.AWAITING_WALLET);

    try {
      const attestation = await signLicenseAttestation({
        licenseId,
        address,
        walletType,
      });

      setStatus(LICENSE_STATUS.VERIFYING);

      storeLicenseRecord({
        address: attestation.address,
        licenseId: attestation.licenseId,
        verifiedAt: attestation.verifiedAt,
      });

      setStatus(LICENSE_STATUS.SUCCESS);
      inFlight.current = false;
      onVerified?.(attestation);
    } catch (err) {
      inFlight.current = false;
      const known = FRIENDLY_ERRORS[err?.message];
      if (known) {
        setError(known);
      } else {
        // Wallet rejections and RPC failures come through here; reuse the
        // app's existing wallet-error mapping so wording stays consistent.
        const code = ExceptionParser.parseWalletException(err);
        setError(ExceptionParser.getMessage(code));
      }
      setStatus(LICENSE_STATUS.ERROR);
    }
  }, [licenseId, address, walletType, onVerified]);

  return {
    licenseId,
    setLicenseId,
    normalizedLicenseId: normalizeLicenseId(licenseId),
    fieldError,
    status,
    error,
    isBusy,
    canSign,
    verify,
    reset,
  };
};
