import getTxByAddress from "../../../src/services/apis/getTxByAddress";
import { BASE_URL } from "../../../src/constants";

jest.mock("../../../src/constants", () => ({
    BASE_URL: {
        VALIDATOR_API: "http://test-api.com",
    },
}));

describe("getTxByAddress", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("fetches transaction data successfully", async () => {
        const mockData = { result: "success" };
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockData),
        });

        const address = "test-address";
        const page = 1;
        const limit = 10;
        const result = await getTxByAddress(address, page, limit);

        expect(global.fetch).toHaveBeenCalledWith(
            `${BASE_URL.VALIDATOR_API}/transactions/address?page=${page}&limit=${limit}&address=${address}`
        );
        expect(result).toEqual(mockData);
    });

    test("handles fetch error", async () => {
        global.fetch.mockRejectedValue(new Error("Network error"));

        await expect(getTxByAddress("test-address", 1, 10)).rejects.toThrow("Network error");
    });
});
