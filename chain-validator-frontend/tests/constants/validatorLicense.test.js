import {
  LICENSE_ID_PATTERN,
  normalizeLicenseId,
  validateLicenseId,
  buildLicenseAttestationMessage,
  storeLicenseRecord,
  readLicenseRecord,
  clearLicenseRecord,
} from "../../src/constants/validatorLicense";

const VALID = "3f8a1c42-9d6b-4e07-b1f5-2a7c9e40d8b3";

describe("License ID normalisation", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeLicenseId(`   ${VALID}  `)).toBe(VALID);
  });

  it("lowercases so a pasted upper-case ID is accepted", () => {
    expect(normalizeLicenseId(VALID.toUpperCase())).toBe(VALID);
  });

  it("strips wrapping braces", () => {
    expect(normalizeLicenseId(`{${VALID}}`)).toBe(VALID);
  });

  it("strips a urn:uuid: prefix", () => {
    expect(normalizeLicenseId(`urn:uuid:${VALID}`)).toBe(VALID);
  });

  it("returns an empty string for nullish input", () => {
    expect(normalizeLicenseId(undefined)).toBe("");
    expect(normalizeLicenseId(null)).toBe("");
  });
});

describe("License ID validation", () => {
  it("accepts a canonical UUID", () => {
    expect(validateLicenseId(VALID)).toBeNull();
  });

  it("accepts the wrapped and upper-case forms it normalises", () => {
    expect(validateLicenseId(`  {${VALID.toUpperCase()}}  `)).toBeNull();
  });

  it("asks for a value when the field is empty", () => {
    expect(validateLicenseId("")).toMatch(/enter your license id/i);
    expect(validateLicenseId("   ")).toMatch(/enter your license id/i);
  });

  it.each([
    ["too short", "3f8a1c42-9d6b-4e07-b1f5"],
    ["missing dashes", "3f8a1c429d6b4e07b1f52a7c9e40d8b3"],
    ["non-hex characters", "3f8a1c42-9d6b-4e07-b1f5-2a7c9e40d8bz"],
    ["an arbitrary string", "my-licence"],
    ["wrong grouping", "3f8a1c4-29d6b-4e07-b1f5-2a7c9e40d8b3"],
  ])("rejects %s", (_label, input) => {
    expect(validateLicenseId(input)).toMatch(/license id/i);
  });

  it("uses one shared pattern so the rule lives in a single place", () => {
    expect(LICENSE_ID_PATTERN.test(VALID)).toBe(true);
    expect(LICENSE_ID_PATTERN.test("nope")).toBe(false);
  });
});

describe("Attestation message", () => {
  const message = buildLicenseAttestationMessage({
    licenseId: VALID,
    address: "autheo1testaddress",
    chainId: "blockmaze_6162-1",
    issuedAt: "2026-09-03T10:00:00.000Z",
  });

  it("binds the license, wallet, network and time", () => {
    expect(message).toContain(VALID);
    expect(message).toContain("autheo1testaddress");
    expect(message).toContain("blockmaze_6162-1");
    expect(message).toContain("2026-09-03T10:00:00.000Z");
  });

  it("tells the signer plainly that nothing is spent", () => {
    expect(message).toMatch(/does not transfer any funds/i);
    expect(message).toMatch(/costs no gas/i);
  });

  it("is deterministic for the same inputs", () => {
    const again = buildLicenseAttestationMessage({
      licenseId: VALID,
      address: "autheo1testaddress",
      chainId: "blockmaze_6162-1",
      issuedAt: "2026-09-03T10:00:00.000Z",
    });
    expect(again).toBe(message);
  });
});

describe("Local verification record", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips for the wallet that verified", () => {
    const record = {
      address: "autheo1alice",
      licenseId: VALID,
      verifiedAt: "2026-09-03T10:00:00.000Z",
    };
    storeLicenseRecord(record);
    expect(readLicenseRecord("autheo1alice")).toEqual(record);
  });

  it("is not returned for a different wallet", () => {
    storeLicenseRecord({
      address: "autheo1alice",
      licenseId: VALID,
      verifiedAt: "2026-09-03T10:00:00.000Z",
    });
    expect(readLicenseRecord("autheo1bob")).toBeNull();
  });

  it("is discarded when the stored value is tampered with", () => {
    storeLicenseRecord({
      address: "autheo1alice",
      licenseId: VALID,
      verifiedAt: "2026-09-03T10:00:00.000Z",
    });
    localStorage.setItem(
      "validator_license",
      JSON.stringify({ address: "autheo1bob", licenseId: VALID })
    );
    expect(readLicenseRecord("autheo1bob")).toBeNull();
    expect(localStorage.getItem("validator_license")).toBeNull();
  });

  it("clears cleanly", () => {
    storeLicenseRecord({
      address: "autheo1alice",
      licenseId: VALID,
      verifiedAt: "2026-09-03T10:00:00.000Z",
    });
    clearLicenseRecord();
    expect(readLicenseRecord("autheo1alice")).toBeNull();
  });
});
