/**
 * Exercises the license signing service against a REAL secp256k1 keypair.
 *
 * The stub wallet below performs a genuine ADR-36 signature, so
 * `verifyADR36Amino` inside the service does real cryptographic work: a passing
 * test means the signing and verification path actually functions, not that a
 * verifier was mocked out.
 */
import { Secp256k1, sha256, ExtendedSecp256k1Signature } from "@cosmjss/crypto";
import { toBase64, toBech32 } from "@cosmjss/encoding";
import {
  rawSecp256k1PubkeyToRawAddress,
  serializeSignDoc,
} from "@cosmjss/amino";

import {
  signLicenseAttestation,
  isLicenseSigningAvailable,
  LICENSE_ERRORS,
} from "../../src/services/validatorLicense";
import { WALLET_TYPE } from "../../src/constants";

const LICENSE_ID = "3f8a1c42-9d6b-4e07-b1f5-2a7c9e40d8b3";
const PREFIX = "autheo";

let keypair;
let address;

/** The fixed ADR-36 envelope a wallet signs for an arbitrary message. */
const makeAdr36SignDoc = (signer, data) => ({
  chain_id: "",
  account_number: "0",
  sequence: "0",
  fee: { gas: "0", amount: [] },
  msgs: [
    {
      type: "sign/MsgSignData",
      value: { signer, data: Buffer.from(data, "utf8").toString("base64") },
    },
  ],
  memo: "",
});

/** Signs the ADR-36 doc exactly as a wallet would. */
const realSignArbitrary = async (_chainId, signer, data) => {
  const digest = sha256(serializeSignDoc(makeAdr36SignDoc(signer, data)));
  const sig = await Secp256k1.createSignature(digest, keypair.privkey);
  const compact = new ExtendedSecp256k1Signature(
    sig.r(32),
    sig.s(32),
    sig.recovery
  ).toFixedLength().slice(0, 64);

  return {
    pub_key: {
      type: "tendermint/PubKeySecp256k1",
      value: toBase64(keypair.pubkey),
    },
    signature: toBase64(compact),
  };
};

beforeAll(async () => {
  const privkey = sha256(Buffer.from("autheo-license-test-seed"));
  const kp = await Secp256k1.makeKeypair(privkey);
  keypair = { privkey, pubkey: Secp256k1.compressPubkey(kp.pubkey) };
  address = toBech32(PREFIX, rawSecp256k1PubkeyToRawAddress(keypair.pubkey));
});

afterEach(() => {
  delete global.window.keplr;
  delete global.window.cosmostation;
});

describe("isLicenseSigningAvailable", () => {
  it("is false when no wallet is injected", () => {
    expect(isLicenseSigningAvailable(WALLET_TYPE.KEPLR)).toBe(false);
  });

  it("is true for Keplr when signArbitrary exists", () => {
    global.window.keplr = { signArbitrary: jest.fn() };
    expect(isLicenseSigningAvailable(WALLET_TYPE.KEPLR)).toBe(true);
  });

  it("is true for Cosmostation via its Keplr-compatible provider", () => {
    global.window.cosmostation = {
      providers: { keplr: { signArbitrary: jest.fn() } },
    };
    expect(isLicenseSigningAvailable(WALLET_TYPE.COSMOSTATION)).toBe(true);
  });

  it("is false when the injected wallet cannot sign messages", () => {
    global.window.keplr = {};
    expect(isLicenseSigningAvailable(WALLET_TYPE.KEPLR)).toBe(false);
  });
});

describe("signLicenseAttestation", () => {
  it("verifies a genuine signature and returns the attestation", async () => {
    global.window.keplr = { signArbitrary: realSignArbitrary };

    const attestation = await signLicenseAttestation({
      licenseId: LICENSE_ID,
      address,
      walletType: WALLET_TYPE.KEPLR,
    });

    expect(attestation.licenseId).toBe(LICENSE_ID);
    expect(attestation.address).toBe(address);
    expect(attestation.signature).toEqual(expect.any(String));
    expect(attestation.pubKey.value).toBe(toBase64(keypair.pubkey));
    expect(attestation.message).toContain(LICENSE_ID);
    expect(attestation.message).toContain(address);
    expect(new Date(attestation.verifiedAt).toString()).not.toBe("Invalid Date");
  });

  it("normalises the License ID before signing it", async () => {
    global.window.keplr = { signArbitrary: realSignArbitrary };

    const attestation = await signLicenseAttestation({
      licenseId: `  {${LICENSE_ID.toUpperCase()}}  `,
      address,
      walletType: WALLET_TYPE.KEPLR,
    });

    expect(attestation.licenseId).toBe(LICENSE_ID);
    expect(attestation.message).toContain(LICENSE_ID);
    expect(attestation.message).not.toContain(LICENSE_ID.toUpperCase());
  });

  it("rejects a signature that does not match the signing address", async () => {
    // A valid signature, but attributed to somebody else's address.
    global.window.keplr = { signArbitrary: realSignArbitrary };
    const otherAddress = toBech32(PREFIX, new Uint8Array(20).fill(7));

    await expect(
      signLicenseAttestation({
        licenseId: LICENSE_ID,
        address: otherAddress,
        walletType: WALLET_TYPE.KEPLR,
      })
    ).rejects.toThrow(LICENSE_ERRORS.SIGNATURE_INVALID);
  });

  it("rejects a tampered signature", async () => {
    global.window.keplr = {
      signArbitrary: async (chainId, signer, data) => {
        const real = await realSignArbitrary(chainId, signer, data);
        const bytes = Buffer.from(real.signature, "base64");
        bytes[0] ^= 0xff; // flip a bit
        return { ...real, signature: bytes.toString("base64") };
      },
    };

    await expect(
      signLicenseAttestation({
        licenseId: LICENSE_ID,
        address,
        walletType: WALLET_TYPE.KEPLR,
      })
    ).rejects.toThrow(LICENSE_ERRORS.SIGNATURE_INVALID);
  });

  it("rejects a malformed wallet response", async () => {
    global.window.keplr = { signArbitrary: async () => ({}) };

    await expect(
      signLicenseAttestation({
        licenseId: LICENSE_ID,
        address,
        walletType: WALLET_TYPE.KEPLR,
      })
    ).rejects.toThrow(LICENSE_ERRORS.SIGNATURE_INVALID);
  });

  it("reports an unusable wallet instead of failing obscurely", async () => {
    global.window.keplr = {};

    await expect(
      signLicenseAttestation({
        licenseId: LICENSE_ID,
        address,
        walletType: WALLET_TYPE.KEPLR,
      })
    ).rejects.toThrow(LICENSE_ERRORS.WALLET_UNAVAILABLE);
  });

  it("requires a wallet address", async () => {
    global.window.keplr = { signArbitrary: realSignArbitrary };

    await expect(
      signLicenseAttestation({
        licenseId: LICENSE_ID,
        address: "",
        walletType: WALLET_TYPE.KEPLR,
      })
    ).rejects.toThrow(LICENSE_ERRORS.NO_ADDRESS);
  });

  it("propagates a wallet rejection so the UI can explain it", async () => {
    const rejection = Object.assign(new Error("Request rejected"), { code: 4001 });
    global.window.keplr = {
      signArbitrary: async () => {
        throw rejection;
      },
    };

    await expect(
      signLicenseAttestation({
        licenseId: LICENSE_ID,
        address,
        walletType: WALLET_TYPE.KEPLR,
      })
    ).rejects.toBe(rejection);
  });
});
