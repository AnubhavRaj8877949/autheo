import { isMigrationMocked } from "../constants/validatorMigration";

/**
 * Validator migration submission.
 *
 * The transport lives here and nowhere else, so wiring the real backend is a
 * change to one function.
 *
 * SECURITY: the password and file are validator credentials. This module must
 * never log them, persist them, or put them in a URL. They are read from the
 * arguments, handed to the request body, and then dropped.
 */

export const MIGRATION_ERRORS = {
  NOT_CONFIGURED: "MIGRATION_NOT_CONFIGURED",
  REQUEST_FAILED: "MIGRATION_REQUEST_FAILED",
};

/** Where a real migration would be submitted. Unset until the backend exists. */
const MIGRATION_ENDPOINT = process.env.REACT_APP_VALIDATOR_MIGRATION_URL;

/* ------------------------------------------------------------------------- *
 * TEMPORARY MOCK — REMOVE WHEN THE MIGRATION BACKEND EXISTS
 * See constants/validatorMigration.ts for how to remove this.
 * ------------------------------------------------------------------------- */
const MOCK_PROCESSING_MS = 1800;

const simulateMigration = (signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => resolve({ migrationId: `mock-${Date.now()}`, mocked: true }),
      MOCK_PROCESSING_MS
    );
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

/**
 * Submits an existing validator setup for migration.
 *
 * @param {{
 *   secureUrl: string,
 *   file: File,
 *   password: string,
 *   signal?: AbortSignal
 * }} params
 * @returns {Promise<{ migrationId?: string, mocked?: boolean }>}
 * @throws {Error} `MIGRATION_ERRORS.NOT_CONFIGURED` when no endpoint is set,
 *   `MIGRATION_ERRORS.REQUEST_FAILED` on a non-2xx response, or the underlying
 *   network error.
 */
export const submitValidatorMigration = async ({
  secureUrl,
  file,
  password,
  signal,
}) => {
  if (isMigrationMocked()) {
    return simulateMigration(signal);
  }

  // Deliberately not defaulted: submitting a validator key and its password to
  // a guessed destination would be worse than failing loudly.
  if (!MIGRATION_ENDPOINT) {
    throw new Error(MIGRATION_ERRORS.NOT_CONFIGURED);
  }

  const body = new FormData();
  body.append("secureUrl", secureUrl);
  body.append("password", password);
  body.append("file", file, file.name);

  const response = await fetch(MIGRATION_ENDPOINT, {
    method: "POST",
    body,
    signal,
  });

  if (!response.ok) {
    const error = new Error(MIGRATION_ERRORS.REQUEST_FAILED);
    error.status = response.status;
    throw error;
  }

  try {
    return await response.json();
  } catch {
    // A 2xx with no JSON body still means the migration was accepted.
    return {};
  }
};
