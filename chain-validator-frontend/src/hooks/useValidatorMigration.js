import { useCallback, useEffect, useRef, useState } from "react";
import { ExceptionParser } from "../internal/exception-parser";
import {
  MIGRATION_ERRORS,
  submitValidatorMigration,
} from "../services/validatorMigration";
import {
  validateMigrationFile,
  validateMigrationPassword,
  validateSecureUrl,
} from "../constants/validatorMigration";

/** The states the operator is walked through. */
export const MIGRATION_STATUS = {
  IDLE: "idle",
  PROCESSING: "processing",
  SUCCESS: "success",
  ERROR: "error",
};

const FRIENDLY_ERRORS = {
  [MIGRATION_ERRORS.NOT_CONFIGURED]:
    "Validator migration isn't available in this environment yet. Please contact support.",
  [MIGRATION_ERRORS.REQUEST_FAILED]:
    "The migration service rejected the request. Check your secure URL and file, then try again.",
};

const EMPTY_ERRORS = { secureUrl: null, file: null, password: null };

/**
 * Drives the validator migration form: field validation, submission, and the
 * resulting state.
 *
 * The password and file are held in local state only for as long as the form
 * is mounted; nothing here persists them.
 */
export const useValidatorMigration = () => {
  const [secureUrl, setSecureUrlRaw] = useState("");
  const [file, setFileRaw] = useState(null);
  const [password, setPasswordRaw] = useState("");

  const [fieldErrors, setFieldErrors] = useState(EMPTY_ERRORS);
  const [status, setStatus] = useState(MIGRATION_STATUS.IDLE);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const inFlight = useRef(false);

  // Abandoning the form mid-submission should not leave a request running.
  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    []
  );

  const isProcessing = status === MIGRATION_STATUS.PROCESSING;
  const isComplete = status === MIGRATION_STATUS.SUCCESS;

  /** Clears the banner and the named field's error as the operator corrects it. */
  const clearFeedback = useCallback((field) => {
    setFieldErrors((prev) => ({ ...prev, [field]: null }));
    setError(null);
    setStatus((prev) =>
      prev === MIGRATION_STATUS.ERROR ? MIGRATION_STATUS.IDLE : prev
    );
  }, []);

  const setSecureUrl = useCallback(
    (value) => {
      setSecureUrlRaw(value);
      clearFeedback("secureUrl");
    },
    [clearFeedback]
  );

  const setFile = useCallback(
    (value) => {
      setFileRaw(value);
      clearFeedback("file");
    },
    [clearFeedback]
  );

  const setPassword = useCallback(
    (value) => {
      setPasswordRaw(value);
      clearFeedback("password");
    },
    [clearFeedback]
  );

  const clearFile = useCallback(() => setFile(null), [setFile]);

  const submit = useCallback(async () => {
    if (inFlight.current) return;

    const next = {
      secureUrl: validateSecureUrl(secureUrl),
      file: validateMigrationFile(file),
      password: validateMigrationPassword(password),
    };
    setFieldErrors(next);
    if (next.secureUrl || next.file || next.password) {
      setStatus(MIGRATION_STATUS.IDLE);
      return;
    }

    inFlight.current = true;
    setError(null);
    setStatus(MIGRATION_STATUS.PROCESSING);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await submitValidatorMigration({
        secureUrl: secureUrl.trim(),
        file,
        password,
        signal: controller.signal,
      });
      inFlight.current = false;
      setStatus(MIGRATION_STATUS.SUCCESS);
    } catch (err) {
      inFlight.current = false;
      if (err?.name === "AbortError") return;

      const known = FRIENDLY_ERRORS[err?.message];
      if (known) {
        setError(known);
      } else {
        const code = ExceptionParser.parseException(err);
        setError(ExceptionParser.getMessage(code));
      }
      setStatus(MIGRATION_STATUS.ERROR);
    }
  }, [secureUrl, file, password]);

  const retry = useCallback(() => {
    setError(null);
    setStatus(MIGRATION_STATUS.IDLE);
  }, []);

  return {
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
  };
};
