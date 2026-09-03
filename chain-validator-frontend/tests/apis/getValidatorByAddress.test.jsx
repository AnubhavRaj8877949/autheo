import { BASE_URL } from "../../src/constants.ts";
import getValidatorByAddress from "../../src/services/apis/getValidatorByAddress";
import { getNativeAddress } from "../../src/services/showEVMAddress";

jest.mock("../../src/services/showEVMAddress.js", () => ({
  getNativeAddress: jest.fn(),
}));

describe("getValidatorByAddress", () => {
  const mockResponse = {
    count: 1,
    validators: [
      { name: "Validator Alpha", validatorAddress: "0x123" },
    ],
  };

  let consoleErrorSpy;

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
    // Suppress console.error for expected errors
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.resetAllMocks();
    consoleErrorSpy.mockRestore();
  });

  it("fetches validator using valoper address when starts with 0x", async () => {
    getNativeAddress.mockReturnValue("cosmosvaloper1abc");
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getValidatorByAddress("0x123", 1, 10);

    expect(getNativeAddress).toHaveBeenCalledWith("0x123");
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL.VALIDATOR_API}/validators/search?value=cosmosvaloper1abc&page=1&limit=10`
    );
    expect(result).toEqual(mockResponse);
  });

  it("fetches validator directly when address does not start with 0x", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getValidatorByAddress("cosmosvaloper1xyz");

    expect(getNativeAddress).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL.VALIDATOR_API}/validators/search?value=cosmosvaloper1xyz`
    );
    expect(result).toEqual(mockResponse);
  });

  it("handles fetch errors gracefully", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const result = await getValidatorByAddress("cosmosvaloper1error");

    expect(result).toEqual({
      error: true,
      message: "HTTP error! Status: 500",
    });
  });

  it("handles thrown exceptions gracefully", async () => {
    getNativeAddress.mockImplementationOnce(() => { throw new Error("Some error"); });

    const result = await getValidatorByAddress("0xerror");

    expect(result).toEqual({
      error: true,
      message: "Some error",
    });
  });

  // Negative Test Cases
  describe("Negative Test Cases - Invalid Addresses", () => {
    it("handles empty string address", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 0, validators: [] }),
      });

      const result = await getValidatorByAddress("");

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL.VALIDATOR_API}/validators/search?value=`
      );
      expect(result).toEqual({ count: 0, validators: [] });
    });

    it("handles whitespace-only address", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 0, validators: [] }),
      });

      const result = await getValidatorByAddress("   ");

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL.VALIDATOR_API}/validators/search?value=`
      );
      expect(result).toEqual({ count: 0, validators: [] });
    });

    it("handles null address", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 0, validators: [] }),
      });

      const result = await getValidatorByAddress(null);

      expect(result).toEqual({
        error: true,
        message: expect.stringContaining(""),
      });
    });

    it("handles undefined address", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 0, validators: [] }),
      });

      const result = await getValidatorByAddress(undefined);

      expect(result).toEqual({
        error: true,
        message: expect.stringContaining(""),
      });
    });

    it("handles malformed 0x address", async () => {
      getNativeAddress.mockImplementationOnce(() => { throw new Error("Invalid EVM address format"); });

      const result = await getValidatorByAddress("0xINVALID");

      expect(getNativeAddress).toHaveBeenCalledWith("0xINVALID");
      expect(result).toEqual({
        error: true,
        message: "Invalid EVM address format",
      });
    });

    it("handles invalid valoper address format", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 0, validators: [] }),
      });

      const result = await getValidatorByAddress("invalid_address_format");

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL.VALIDATOR_API}/validators/search?value=invalid_address_format`
      );
      expect(result).toEqual({ count: 0, validators: [] });
    });

    it("handles non-existent validator address", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 0, validators: [] }),
      });

      const result = await getValidatorByAddress("cosmosvaloper1nonexistent");

      expect(result).toEqual({ count: 0, validators: [] });
    });

    it("handles 404 error for non-existent validator", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await getValidatorByAddress("cosmosvaloper1notfound");

      expect(result).toEqual({
        error: true,
        message: "HTTP error! Status: 404",
      });
    });

    it("handles network timeout error", async () => {
      fetch.mockRejectedValueOnce(new Error("Network request failed"));

      const result = await getValidatorByAddress("cosmosvaloper1timeout");

      expect(result).toEqual({
        error: true,
        message: "Network request failed",
      });
    });

    it("handles special characters in address", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 0, validators: [] }),
      });

      const result = await getValidatorByAddress("cosmos@#$%^&*()");

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL.VALIDATOR_API}/validators/search?value=cosmos@#$%^&*()`
      );
      expect(result).toEqual({ count: 0, validators: [] });
    });

    it("handles getNativeAddress returning null for invalid 0x address", async () => {
      getNativeAddress.mockReturnValueOnce(null);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 0, validators: [] }),
      });

      const result = await getValidatorByAddress("0xinvalid");

      expect(getNativeAddress).toHaveBeenCalledWith("0xinvalid");
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL.VALIDATOR_API}/validators/search?value=null`
      );
    });

    it("handles getNativeAddress returning empty string", async () => {
      getNativeAddress.mockReturnValueOnce("");
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 0, validators: [] }),
      });

      const result = await getValidatorByAddress("0xempty");

      expect(getNativeAddress).toHaveBeenCalledWith("0xempty");
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL.VALIDATOR_API}/validators/search?value=`
      );
    });
  });

  it("handles API returning malformed JSON", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error("Unexpected token in JSON");
      },
    });

    const result = await getValidatorByAddress("cosmosvaloper1malformed");

    expect(result).toEqual({
      error: true,
      message: "Unexpected token in JSON",
    });
  });

  it("handles case-sensitive address variations", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ count: 0, validators: [] }),
    });

    const result = await getValidatorByAddress("COSMOSVALOPER1UPPERCASE");

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL.VALIDATOR_API}/validators/search?value=COSMOSVALOPER1UPPERCASE`
    );
    expect(result).toEqual({ count: 0, validators: [] });
  });

  it("handles SQL injection attempt in address", async () => {
    const sqlInjection = "cosmosvaloper1'; DROP TABLE validators; --";
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ count: 0, validators: [] }),
    });

    const result = await getValidatorByAddress(sqlInjection);

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL.VALIDATOR_API}/validators/search?value=${sqlInjection}`
    );
    expect(result).toEqual({ count: 0, validators: [] });
  });

  it("handles 500 internal server error", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const result = await getValidatorByAddress("cosmosvaloper1servererror");

    expect(result).toEqual({
      error: true,
      message: "HTTP error! Status: 500",
    });
  });

  it("handles 503 service unavailable error", async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const result = await getValidatorByAddress("cosmosvaloper1unavailable");

    expect(result).toEqual({
      error: true,
      message: "HTTP error! Status: 503",
    });
  });
});
