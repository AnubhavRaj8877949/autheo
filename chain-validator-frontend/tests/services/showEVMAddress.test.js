import { GLOBAL_OBJECT } from "../testConstants";

// Mock @cosmjss/encoding before importing the service
jest.mock("@cosmjss/encoding");

// Mock the constants so PREFIX matches GLOBAL_OBJECT
jest.mock("../../src/constants.ts", () => ({
    ...jest.requireActual("../../src/constants.ts"),
    PREFIX: "cosmos",
}));

import { showEVMAddress, getNativeAddress } from "../../src/services/showEVMAddress";
import { fromBech32, toHex, toBech32, fromHex } from "@cosmjss/encoding";

describe("showEVMAddress", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("converts bech32 address to EVM address successfully", () => {
        const mockData = new Uint8Array([1, 2, 3, 4, 5]);
        fromBech32.mockReturnValue({ data: mockData });
        toHex.mockReturnValue("0102030405");

        const result = showEVMAddress(`${GLOBAL_OBJECT}1abc`);

        expect(fromBech32).toHaveBeenCalledWith(`${GLOBAL_OBJECT}1abc`);
        expect(toHex).toHaveBeenCalledWith(mockData);
        expect(result).toBe("0x0102030405");
    });

    it("returns error when fromBech32 throws error", () => {
        const error = new Error("Invalid bech32 address");
        fromBech32.mockImplementation(() => {
            throw error;
        });

        expect(showEVMAddress("invalid")).toBe(error);
    });

    it("returns error when toHex throws error", () => {
        const mockData = new Uint8Array([1, 2, 3]);
        fromBech32.mockReturnValue({ data: mockData });
        const error = new Error("Hex conversion failed");
        toHex.mockImplementation(() => {
            throw error;
        });

        expect(showEVMAddress(`${GLOBAL_OBJECT}1abc`)).toBe(error);
    });

    it("handles empty address", () => {
        const error = new Error("Empty address");
        fromBech32.mockImplementation(() => {
            throw error;
        });

        expect(showEVMAddress("")).toBe(error);
    });
});

describe("getNativeAddress", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("converts EVM address to bech32 address successfully", () => {
        const mockData = new Uint8Array([1, 2, 3, 4, 5]);
        fromHex.mockReturnValue(mockData);
        toBech32.mockReturnValue(`${GLOBAL_OBJECT}1abc`);

        const result = getNativeAddress("0x0102030405");

        expect(fromHex).toHaveBeenCalledWith("0102030405");
        expect(toBech32).toHaveBeenCalledWith(GLOBAL_OBJECT, mockData);
        expect(result).toBe(`${GLOBAL_OBJECT}1abc`);
    });

    it("correctly slices 0x prefix from address", () => {
        const mockData = new Uint8Array([10, 20, 30]);
        fromHex.mockReturnValue(mockData);
        toBech32.mockReturnValue(`${GLOBAL_OBJECT}1xyz`);

        getNativeAddress("0xABCDEF");

        expect(fromHex).toHaveBeenCalledWith("ABCDEF");
    });

    it("returns error when fromHex throws error", () => {
        const error = new Error("Invalid hex string");
        fromHex.mockImplementation(() => {
            throw error;
        });

        expect(getNativeAddress("0xinvalid")).toBe(error);
    });

    it("returns error when toBech32 throws error", () => {
        const mockData = new Uint8Array([1, 2, 3]);
        fromHex.mockReturnValue(mockData);
        const error = new Error("Bech32 conversion failed");
        toBech32.mockImplementation(() => {
            throw error;
        });

        expect(getNativeAddress("0x010203")).toBe(error);
    });

    it(`uses correct prefix ${GLOBAL_OBJECT}`, () => {
        const mockData = new Uint8Array([5, 10, 15]);
        fromHex.mockReturnValue(mockData);
        toBech32.mockReturnValue(`${GLOBAL_OBJECT}1test`);

        getNativeAddress("0x050A0F");

        expect(toBech32).toHaveBeenCalledWith(GLOBAL_OBJECT, mockData);
    });

    it("handles address without 0x prefix gracefully", () => {
        const mockData = new Uint8Array([1, 2]);
        fromHex.mockReturnValue(mockData);
        toBech32.mockReturnValue(`${GLOBAL_OBJECT}1ab`);

        // Address without 0x will have slice(2) remove first 2 chars
        getNativeAddress("ABCD");

        expect(fromHex).toHaveBeenCalledWith("CD");
    });
});
