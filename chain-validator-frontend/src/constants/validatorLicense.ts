import { ChainConfig } from '../constants';

/**
 * Validator license verification — shared rules and local state.
 *
 * A validator license is identified by a UUID. Verification is a wallet
 * *signature* (ADR-36 arbitrary message), not an on-chain transaction: the
 * operator proves they control both the wallet and the license, and it costs
 * no gas.
 */

/**
 * Canonical License ID shape: a UUID in the standard 8-4-4-4-12 hex form.
 * Kept in one place so tightening it (e.g. to RFC-4122 v4 only, by requiring
 * `[1-5]` and `[89ab]` in the version/variant nibbles) is a one-line change.
 */
export const LICENSE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const LICENSE_ID_LENGTH = 36;

export const LICENSE_ID_EXAMPLE = '3f8a1c42-9d6b-4e07-b1f5-2a7c9e40d8b3';

/**
 * Tidies a pasted License ID: trims, drops a `urn:uuid:` prefix or wrapping
 * braces, and lowercases. Operators paste these from a dashboard or an email,
 * so accepting the common wrappers avoids pointless rejections.
 */
export const normalizeLicenseId = (raw: string): string =>
  (raw || '')
    .trim()
    .replace(/^urn:uuid:/i, '')
    .replace(/^\{/, '')
    .replace(/\}$/, '')
    .trim()
    .toLowerCase();

/**
 * @returns a human-readable problem, or `null` when the ID is well formed.
 */
export const validateLicenseId = (raw: string): string | null => {
  const value = normalizeLicenseId(raw);
  if (!value) return 'Enter your License ID to continue.';
  if (!LICENSE_ID_PATTERN.test(value)) {
    return `That doesn't look like a License ID. It should be ${LICENSE_ID_LENGTH} characters, like ${LICENSE_ID_EXAMPLE}.`;
  }
  return null;
};

export interface LicenseAttestationInput {
  licenseId: string;
  address: string;
  chainId: string;
  issuedAt: string;
}

/**
 * The exact text the operator sees in their wallet. It is deliberately plain:
 * someone unfamiliar with signing should be able to read it and understand
 * that nothing is being spent.
 */
export const buildLicenseAttestationMessage = ({
  licenseId,
  address,
  chainId,
  issuedAt,
}: LicenseAttestationInput): string =>
  [
    'Autheo — validator license verification',
    '',
    `License ID: ${licenseId}`,
    `Wallet: ${address}`,
    `Network: ${chainId}`,
    `Issued at: ${issuedAt}`,
    '',
    'Signing this confirms you control this wallet and this validator license.',
    'It does not transfer any funds and costs no gas.',
  ].join('\n');

/* ------------------------------------------------------------------------- *
 * Local record of a completed verification
 *
 * This exists so an operator who leaves the flow and comes back is not asked
 * to sign again. It is UX state, scoped to the connected wallet — it is NOT
 * an authorization control. The authoritative check is the signature itself,
 * which must be verified by whatever service ultimately records the license.
 * ------------------------------------------------------------------------- */

const STORAGE_KEY = 'validator_license';
const STORAGE_SIG_KEY = 'validator_license_sig';
const STORAGE_SALT = 'autheo_license_v1';

export interface LicenseRecord {
  address: string;
  licenseId: string;
  verifiedAt: string;
}

const sign = (value: string): string => btoa(`${STORAGE_SALT}:${value}`);

export const clearLicenseRecord = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_SIG_KEY);
};

export const storeLicenseRecord = (record: LicenseRecord): void => {
  const raw = JSON.stringify(record);
  localStorage.setItem(STORAGE_KEY, raw);
  localStorage.setItem(STORAGE_SIG_KEY, sign(raw));
};

/**
 * Reads the stored verification, but only returns it when it belongs to the
 * wallet that is currently connected. Switching wallets therefore requires a
 * fresh verification rather than inheriting the previous operator's.
 */
export const readLicenseRecord = (address: string): LicenseRecord | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  const sig = localStorage.getItem(STORAGE_SIG_KEY);
  if (!raw || !sig || sig !== sign(raw)) {
    clearLicenseRecord();
    return null;
  }

  try {
    const record = JSON.parse(raw) as LicenseRecord;
    if (!record?.address || !record?.licenseId) {
      clearLicenseRecord();
      return null;
    }
    if (!address || record.address !== address) return null;
    return record;
  } catch {
    clearLicenseRecord();
    return null;
  }
};

export const LICENSE_CHAIN_ID = ChainConfig.chainId;

/* ========================================================================= *
 * TEMPORARY MOCK — REMOVE BEFORE PRODUCTION
 *
 * With REACT_APP_MOCK_LICENSE_VERIFICATION=true the license step still asks
 * for a License ID and still validates its format, but "Verify License" then
 * simply succeeds: no wallet is opened, no message is signed, no signature is
 * verified and nothing is persisted.
 *
 * This exists only so the rest of the onboarding UX can be walked through
 * before the real verification is wired up. It is a single boolean, read in
 * exactly two places (`LicenseStep`, and the gate in
 * `pages/Account/SetupValidator`), so removing it is:
 *
 *   1. delete REACT_APP_MOCK_LICENSE_VERIFICATION from .env
 *   2. delete this block and the one `isLicenseVerificationMocked()` branch
 *      it guards (in `LicenseStep`)
 *
 * The real path (`useLicenseVerification` + `services/validatorLicense`) is
 * untouched by the flag and still fully covered by its own tests.
 * ========================================================================= */
export const isLicenseVerificationMocked = (): boolean =>
  process.env.REACT_APP_MOCK_LICENSE_VERIFICATION === 'true';

