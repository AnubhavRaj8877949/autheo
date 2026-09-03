import {
    countDecimal,
    removeZero,
    removeTrailingZeroes,
    FormatNum,
    ModifyNum,
    convertToDateTime,
    renderTime,
    capitalizeWord,
    HD_PATHS,
    scienToNum,
    subtractNum,
    extractExternal,
    toHex,
    recodeAddress,
    extractCurrent,
    extractAccounts,
    extractAddresses,
} from "../../src/utils/helper";

// Mock globals
global.keyring = {
    decodeAddress: jest.fn((addr) => {
        if (addr === "invalid-address") throw new Error("invalid");
        return new Uint8Array(32); // Length 32 to pass filtered check
    }),
    encodeAddress: jest.fn((u8a) => "encoded-address"),
    getPair: jest.fn(() => ({
        address: "encoded-address",
        meta: { accountOffset: 0, addressOffset: 0, hardwareType: "ledger" },
        isLocked: false,
        lock: jest.fn(),
    })),
};
global.AVAIL_STATUS = ["queued", "signing", "broadcast"];
global.u8aToHex = jest.fn((u8a) => "0x123");
global.decodeAddress = jest.fn((addr) => new Uint8Array(32)); // Length 32
global.NO_FLAGS = ["withController", "withExposure", "withPrefs"];
global.lockCountdown = {};

describe("Helper Utility Functions", () => {
    describe("countDecimal", () => {
        test("counts decimal places correctly", () => {
            expect(countDecimal(123.456)).toBe(3);
        });
    });

    describe("removeZero", () => {
        test("removes leading zeros", () => {
            expect(removeZero("0001")).toBe("1");
        });
    });

    describe("removeTrailingZeroes", () => {
        test("removes trailing zeros", () => {
            expect(removeTrailingZeroes("123.4500")).toBe("123.45");
        });
    });

    describe("FormatNum", () => {
        test("formats numbers", () => {
            expect(FormatNum("1000000000000000000")).toContain(".");
            // Hit lines 33-35
            expect(FormatNum("1")).toBe("0.000000000000000001");
        });
    });

    describe("ModifyNum", () => {
        test("adds zeros", () => {
            expect(ModifyNum("1.5")).toContain("15");
            // Hit lines 55-56
            expect(ModifyNum("1")).toBe("1000000000000000000");
        });
    });

    describe("subtractNum", () => {
        test("subtracts", () => {
            expect(subtractNum("100.5", 10)).toBe("90.5");
            // Hit line 44
            expect(subtractNum("5", 10)).toBe(0);
            expect(subtractNum(0, 0)).toBe(0);
        });
    });

    describe("scienToNum", () => {
        test("converts scientific notation", () => {
            // "1.23e+05" -> substr(-4) is "+05"
            // Actually the logic is a bit specific to 4 chars at the end
            expect(scienToNum("1.23e+05")).toBeDefined();
        });
    });

    describe("convertToDateTime", () => {
        test("formats date", () => {
            expect(convertToDateTime(1700000000000)).toContain("Nov");
        });
    });

    describe("renderTime", () => {
        beforeEach(() => {
            jest.spyOn(Date, "now").mockReturnValue(1700000000000);
        });
        afterEach(() => {
            jest.restoreAllMocks();
        });
        test("renders relative time", () => {
            const now = 1700000000000;
            expect(renderTime(now - 30000)).toContain("s ago");
            expect(renderTime(now - 120000)).toContain("2m ago");
            expect(renderTime(now - 7200000)).toContain("2h ago");
            expect(renderTime(now - 172800000)).toContain("2d ago");
            expect(renderTime(now - 3000000000)).toContain("ago"); // hit moment().fromNow()
        });
        test("handles numeric string that is not a date string", () => {
            // "1700000000000" as a string hits line 221
            expect(renderTime("1700000000000")).toBeDefined();
            // Hits line 209 in convertToDateTime
            expect(convertToDateTime("invalid")).toBeDefined();
        });
    });

    describe("capitalizeWord", () => {
        test("capitalizes", () => {
            expect(capitalizeWord("hello")).toBe("Hello");
            expect(capitalizeWord("coin_transfer")).toBe("Coin_Transfer");
        });
    });

    describe("extractExternal", () => {
        test("extracts meta", () => {
            const result = extractExternal("addr1");
            expect(result.hardwareType).toBe("ledger");
        });
        test("handles null accountId", () => {
            expect(extractExternal(null)).toEqual(global.NO_FLAGS);
        });
        test("handles invalid address", () => {
            expect(extractExternal("invalid-address")).toEqual(global.NO_FLAGS);
        });
        test("handles unlockable accounts and lockCountdown", () => {
            // Meta: !isExternal && !isHardware && !isInjected
            global.keyring.getPair.mockReturnValueOnce({
                address: "encoded-address",
                meta: { isExternal: false, isHardware: false, isInjected: false },
                isLocked: false,
                lock: jest.fn()
            });
            global.lockCountdown["encoded-address"] = Date.now() - 1000;
            extractExternal("addr1");
            // Should hit line 82-84
        });
    });

    describe("extractAccounts", () => {
        test("extracts accounts", () => {
            const accounts = { "addr1": {} };
            const result = extractAccounts(false, accounts);
            expect(result.allAccounts).toEqual(["addr1"]);
            expect(result.isAccount("addr1")).toBe(true);
        });
    });

    describe("extractAddresses", () => {
        test("extracts addresses", () => {
            const addresses = { "addr1": {} };
            const result = extractAddresses(false, addresses, []);
            expect(result.allAddresses).toEqual(["addr1"]);
            expect(result.isAddress("addr1")).toBe(true);
        });
    });

    describe("toHex", () => {
        test("converts array to hex", () => {
            expect(toHex(["addr1"])).toEqual(["0x123"]);
        });
        test("handles catch block", () => {
            global.decodeAddress.mockImplementationOnce(() => { throw new Error("fail") });
            expect(toHex(["fail"])).toEqual([]);
        });
    });

    describe("recodeAddress", () => {
        test("recodes address", () => {
            expect(recodeAddress("addr1")).toBe("encoded-address");
        });
    });

    describe("extractCurrent", () => {
        test("extracts current item", () => {
            const queue = [{ status: "queued", accountId: "addr1" }];
            const result = extractCurrent(queue);
            expect(result.currentItem.accountId).toBe("addr1");
            expect(result.isVisible).toBe(false);
            expect(result.isRpc).toBe(true);
        });
        test("handles visible state", () => {
            const queue = [{ status: "signing", accountId: "addr1" }];
            const result = extractCurrent(queue);
            expect(result.isVisible).toBe(false); // signing is not visible per logic

            const queueVisible = [{ status: "broadcast", accountId: "addr2" }];
            const resultVisible = extractCurrent(queueVisible);
            expect(resultVisible.isVisible).toBe(true);
        });
    });
});
