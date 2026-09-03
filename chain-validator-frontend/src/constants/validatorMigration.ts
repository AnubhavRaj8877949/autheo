/**
 * Validator migration — shared rules and validation.
 *
 * Migration lets an operator bring an existing validator setup across, by
 * supplying a secure URL, an export file and the password that protects it.
 *
 * SECURITY: the file and password are validator credentials. Nothing in this
 * module or its callers writes either of them to localStorage, sessionStorage,
 * redux-persist or the console. They live in component state for the duration
 * of the submission and nowhere else.
 */

/**
 * Accepted migration file extensions.
 *
 * A validator export is a JSON document, so only `.json` is accepted. Kept as
 * an array (rather than a single string) so widening it later is a one-line
 * change and the messages below adapt automatically.
 */
export const MIGRATION_FILE_EXTENSIONS = ['.json'];

/** Value for the file input's `accept` attribute, so the OS picker filters too. */
export const MIGRATION_FILE_ACCEPT = [
  ...MIGRATION_FILE_EXTENSIONS,
  'application/json',
].join(',');

/** Short hint shown under the file chooser. */
export const MIGRATION_FILE_HINT =
  MIGRATION_FILE_EXTENSIONS.length === 1
    ? `${MIGRATION_FILE_EXTENSIONS[0]} file only`
    : MIGRATION_FILE_EXTENSIONS.join(', ');

/** 10 MB. A validator key export is tiny; this only stops obvious mistakes. */
export const MIGRATION_FILE_MAX_BYTES = 10 * 1024 * 1024;

export const MIGRATION_PASSWORD_MAX_LENGTH = 256;

export const SECURE_URL_PLACEHOLDER = 'https://node.example.com';

/**
 * How long after a successful migration the validator's data takes to show up
 * in the app. Surfaced in the success state so the operator is not left
 * wondering why the dashboard is still empty.
 */
export const MIGRATION_DATA_DELAY_LABEL = '10-15 minutes';

/** Whether plain-http URLs are permitted, mirroring the node-URL rule used at login. */
export const allowsInsecureUrl = (): boolean =>
  process.env.REACT_APP_ALLOW_INSECURE_NODE === 'true';

/**
 * Validates the secure migration URL.
 *
 * Uses the same http/https rule as the node URL on the login screen, so an
 * operator gets consistent behaviour across the app. When insecure URLs are
 * not permitted this matters: the migration payload includes a credential, and
 * plain http would put it on the wire in the clear.
 *
 * @returns a human-readable problem, or `null` when valid.
 */
export const validateSecureUrl = (raw: string): string | null => {
  const value = (raw || '').trim();
  if (!value) return 'Enter the secure URL for your existing validator.';

  const insecureAllowed = allowsInsecureUrl();
  const pattern = insecureAllowed ? /^https?:\/\//i : /^https:\/\//i;

  if (!pattern.test(value)) {
    return insecureAllowed
      ? 'Enter a full URL starting with https:// or http://.'
      : 'Only secure URLs are allowed. The URL must start with https://.';
  }

  try {
    const parsed = new URL(value);
    if (!parsed.hostname) return 'That URL is missing a host name.';
  } catch {
    return 'That does not look like a valid URL.';
  }

  return null;
};

/**
 * Validates the uploaded migration file.
 * @returns a human-readable problem, or `null` when valid.
 */
export const validateMigrationFile = (file: File | null): string | null => {
  if (!file) return 'Upload your validator migration file.';

  if (file.size === 0) return 'That file is empty. Please choose another.';

  if (file.size > MIGRATION_FILE_MAX_BYTES) {
    return `That file is larger than ${formatFileSize(
      MIGRATION_FILE_MAX_BYTES
    )}. Please check you selected the right one.`;
  }

  const name = file.name.toLowerCase();
  const accepted = MIGRATION_FILE_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!accepted) {
    return MIGRATION_FILE_EXTENSIONS.length === 1
      ? `Only ${MIGRATION_FILE_EXTENSIONS[0]} files are supported.`
      : `Unsupported file type. Expected one of: ${MIGRATION_FILE_EXTENSIONS.join(
          ', '
        )}.`;
  }

  return null;
};

/**
 * Validates the migration password.
 *
 * Only presence is checked. This is a password the operator already has, so
 * imposing a strength policy here would reject valid credentials.
 */
export const validateMigrationPassword = (raw: string): string | null => {
  if (!raw) return 'Enter the password for your migration file.';
  if (raw.length > MIGRATION_PASSWORD_MAX_LENGTH) {
    return `Password must be ${MIGRATION_PASSWORD_MAX_LENGTH} characters or fewer.`;
  }
  return null;
};

/** Human-readable byte size, e.g. "4.2 KB". */
export const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
};

/* ========================================================================= *
 * TEMPORARY MOCK — REMOVE WHEN THE MIGRATION BACKEND EXISTS
 *
 * No migration endpoint exists in this project yet, so with
 * REACT_APP_MOCK_VALIDATOR_MIGRATION=true the submission is simulated: the
 * fields are genuinely validated, then processing succeeds after a short
 * delay. Nothing is uploaded or transmitted.
 *
 * The flag is read in exactly one place (`services/validatorMigration.js`).
 * To remove it: delete the env var, delete this block, and delete the mock
 * branch in that service.
 * ========================================================================= */
export const isMigrationMocked = (): boolean =>
  process.env.REACT_APP_MOCK_VALIDATOR_MIGRATION === 'true';
