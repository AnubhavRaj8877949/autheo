import {
  Secp256k1,
  Secp256k1Signature,
  keccak256,
  sha256,
} from "@cosmjss/crypto";
import { fromBase64, toBase64, toBech32, toUtf8 } from "@cosmjss/encoding";
import {
  rawSecp256k1PubkeyToRawAddress,
  serializeSignDoc,
} from "@cosmjss/amino";
import { ChainConfig, WALLET_TYPE } from "../constants";
import {
  buildLicenseAttestationMessage,
  normalizeLicenseId,
} from "../constants/validatorLicense";

/**
 * Validator license verification.
 *
 * The operator signs an ADR-36 arbitrary message binding their License ID to
 * their wallet address. There is no on-chain transaction: nothing is spent and
 * no gas is charged. The returned signature is the proof — it is verified
 * locally before the flow advances, and is handed to `onVerified` so it can be
 * forwarded to a recording service when one exists.
 */

/** Failure codes surfaced by this module. */
export const LICENSE_ERRORS = {
  WALLET_UNAVAILABLE: "WALLET_UNAVAILABLE",
  SIGNATURE_INVALID: "SIGNATURE_INVALID",
  NO_ADDRESS: "NO_ADDRESS",
};

/**
 * Resolves the wallet object that exposes ADR-36 `signArbitrary`.
 * Cosmostation ships a Keplr-compatible provider, so both wallets the app
 * supports are handled through the same interface.
 * @param {string} walletType
 * @returns {any | null}
 */
const resolveSigner = (walletType) => {
  if (walletType === WALLET_TYPE.KEPLR) return window.keplr ?? null;
  if (walletType === WALLET_TYPE.COSMOSTATION) {
    return window.cosmostation?.providers?.keplr ?? null;
  }
  return window.keplr ?? window.cosmostation?.providers?.keplr ?? null;
};

/**
 * Whether the connected wallet can sign an arbitrary message. Used to show a
 * clear message up front instead of failing at the moment the user clicks.
 * @param {string} walletType
 * @returns {boolean}
 */
export const isLicenseSigningAvailable = (walletType) =>
  typeof resolveSigner(walletType)?.signArbitrary === "function";

/**
 * Builds the ADR-36 sign doc for an arbitrary message.
 *
 * ADR-36 fixes every field except the message itself: empty chain id and memo,
 * zeroed account/sequence/gas, no fee, and a single `sign/MsgSignData`. This is
 * the document the wallet signed, so verification has to rebuild it byte for
 * byte.
 *
 * Implemented on `@cosmjss/*` (already used across this app) rather than
 * `@keplr-wallet/cosmos`, whose entry point runs `initEccLib` from
 * bitcoinjs-lib at module load. Pulling that into the onboarding gate risked
 * the whole step failing to load.
 *
 * @param {string} signer bech32 address
 * @param {string} data the signed message
 */
const makeAdr36SignDoc = (signer, data) => ({
  chain_id: "",
  account_number: "0",
  sequence: "0",
  fee: { gas: "0", amount: [] },
  msgs: [
    {
      type: "sign/MsgSignData",
      // The message contains non-ASCII characters, so it must be encoded as
      // UTF-8 bytes before base64 - not through btoa() on a JS string.
      value: { signer, data: toBase64(toUtf8(data)) },
    },
  ],
  memo: "",
});

/**
 * The address a public key maps to, for each supported key type. This chain
 * enables eth-key signing (coin type 60), so both must be handled:
 *  - secp256k1:    ripemd160(sha256(compressed pubkey))
 *  - ethsecp256k1: last 20 bytes of keccak256(uncompressed pubkey, no prefix)
 *
 * @returns {string | null} bech32 address, or null if the key is unusable
 */
const addressForAlgo = (pubKeyBytes, algo, prefix) => {
  try {
    if (algo === "ethsecp256k1") {
      const uncompressed = Secp256k1.uncompressPubkey(pubKeyBytes);
      const ethAddress = keccak256(uncompressed.slice(1)).slice(-20);
      return toBech32(prefix, ethAddress);
    }
    return toBech32(prefix, rawSecp256k1PubkeyToRawAddress(pubKeyBytes));
  } catch {
    return null;
  }
};

/**
 * The chain is configured for eth-key signing, so the wallet may return either
 * key type. Prefer whichever the wallet reports and fall back to the other
 * rather than assuming one.
 * @param {string} pubKeyType
 * @returns {string[]}
 */
const candidateAlgos = (pubKeyType) =>
  /ethsecp256k1/i.test(pubKeyType || "")
    ? ["ethsecp256k1", "secp256k1"]
    : ["secp256k1", "ethsecp256k1"];

/**
 * Verifies the signature really came from `address` over `message`.
 *
 * Two things must hold: the signature must validate against the supplied
 * public key, and that public key must derive to the address that claims to
 * have signed. Checking only the first would let any valid signature be
 * attributed to any address.
 *
 * @returns {Promise<boolean>}
 */
const verifySignature = async ({ address, message, pubKey, signature }) => {
  const prefix = ChainConfig?.bech32Config?.bech32PrefixAccAddr;
  if (!prefix) return false;

  let pubKeyBytes;
  let signatureBytes;
  try {
    pubKeyBytes = fromBase64(pubKey.value);
    signatureBytes = fromBase64(signature);
  } catch {
    return false;
  }

  const serialized = serializeSignDoc(makeAdr36SignDoc(address, message));

  for (const algo of candidateAlgos(pubKey?.type)) {
    try {
      if (addressForAlgo(pubKeyBytes, algo, prefix) !== address) continue;

      const digest =
        algo === "ethsecp256k1" ? keccak256(serialized) : sha256(serialized);

      const parsed = Secp256k1Signature.fromFixedLength(
        signatureBytes.slice(0, 64)
      );
      if (await Secp256k1.verifySignature(parsed, digest, pubKeyBytes)) {
        return true;
      }
    } catch {
      // Try the next key type rather than failing outright.
    }
  }

  return false;
};

/**
 * Prompts the wallet to sign the license attestation and verifies the result.
 *
 * @param {{ licenseId: string, address: string, walletType: string }} params
 * @returns {Promise<{
 *   licenseId: string, address: string, chainId: string, message: string,
 *   signature: string, pubKey: { type: string, value: string }, verifiedAt: string
 * }>}
 * @throws {Error} with `message` set to one of `LICENSE_ERRORS`, or the raw
 *   wallet error (e.g. a user rejection) for the caller to map.
 */
export const signLicenseAttestation = async ({
  licenseId,
  address,
  walletType,
}) => {
  if (!address) throw new Error(LICENSE_ERRORS.NO_ADDRESS);

  const signer = resolveSigner(walletType);
  if (typeof signer?.signArbitrary !== "function") {
    throw new Error(LICENSE_ERRORS.WALLET_UNAVAILABLE);
  }

  const chainId = ChainConfig.chainId;
  const normalizedId = normalizeLicenseId(licenseId);
  const issuedAt = new Date().toISOString();
  const message = buildLicenseAttestationMessage({
    licenseId: normalizedId,
    address,
    chainId,
    issuedAt,
  });

  // Throws if the operator rejects the request in their wallet.
  const result = await signer.signArbitrary(chainId, address, message);

  const pubKey = result?.pub_key;
  const signature = result?.signature;
  if (!pubKey?.value || !signature) {
    throw new Error(LICENSE_ERRORS.SIGNATURE_INVALID);
  }

  if (!(await verifySignature({ address, message, pubKey, signature }))) {
    throw new Error(LICENSE_ERRORS.SIGNATURE_INVALID);
  }

  return {
    licenseId: normalizedId,
    address,
    chainId,
    message,
    signature,
    pubKey,
    verifiedAt: issuedAt,
  };
};
