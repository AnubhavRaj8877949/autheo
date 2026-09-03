import fetchPubKey from "../../src/services/fetchPubKey";

global.fetch = jest.fn();

describe("fetchPubKey", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("fetches public key from node URL successfully", async () => {
        const mockResponse = {
            result: {
                validator_info: {
                    pub_key: {
                        value: "test-public-key-123",
                    },
                },
            },
        };

        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await fetchPubKey("http://test-node.com");

        expect(global.fetch).toHaveBeenCalledWith("http://test-node.com/status");
        expect(result).toEqual(mockResponse);
    });

    test("constructs correct URL with /status endpoint", async () => {
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue({}),
        });

        await fetchPubKey("https://mainnet.example.com");

        expect(global.fetch).toHaveBeenCalledWith("https://mainnet.example.com/status");
    });

    test("handles different node URLs", async () => {
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue({}),
        });

        await fetchPubKey("http://localhost:26657");

        expect(global.fetch).toHaveBeenCalledWith("http://localhost:26657/status");
    });

    test("returns parsed JSON response", async () => {
        const mockData = {
            result: {
                validator_info: {
                    address: "validator123",
                    pub_key: { value: "pubkey456" },
                },
            },
        };

        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue(mockData),
        });

        const result = await fetchPubKey("http://node.com");

        expect(result).toEqual(mockData);
    });
});
