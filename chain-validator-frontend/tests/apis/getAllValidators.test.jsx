

import { BASE_URL } from "../../src/constants.ts";
import getAllValidators from "../../src/services/apis/getAllValidators";

describe("getAllValidators", () => {
  const mockResponse = {
    count: 2,
    validators: [
      { name: "Validator 1", validatorAddress: "0x123" },
      { name: "Validator 2", validatorAddress: "0x456" },
    ],
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("fetches all validators when tabId is 0 and tabName is not provided", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getAllValidators(1, 10, 0, null);

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL.VALIDATOR_API}/validators?page=1&limit=10`
    );
    expect(result).toEqual(mockResponse);
  });

  it("fetches validators with status when tabId is not 0 or tabName is provided", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getAllValidators(2, 5, 1, "active");

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL.VALIDATOR_API}/validators?page=2&limit=5&status=active`
    );
    expect(result).toEqual(mockResponse);
  });

  it("throws an error when response is not ok", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    await expect(getAllValidators(1, 10, 0, null)).rejects.toThrow();
  });

  it("throws an error when response is not ok for filtered status", async () => {
    fetch.mockResolvedValueOnce({ ok: false });

    await expect(getAllValidators(1, 10, 1, "active")).rejects.toThrow();
  });
});
