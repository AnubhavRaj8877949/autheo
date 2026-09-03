import "@testing-library/jest-dom";
import reduceData, { noExponential, isTimeAgoByCreatedDate, formatMillionNumber } from "../../src/utils/commonFunctions";

// --------------------- noExponential ---------------------
describe("noExponential / Number.prototype.noExponents", () => {
  test("converts large exponential numbers to string without exponent", () => {
    expect(noExponential(1e+21)).toBe("1000000000000000000000");
    expect(noExponential(-1e+21)).toBe("-100000000000000000000");
  });

  test("converts small exponential numbers to string without exponent", () => {
    expect(noExponential(1e-7)).toBe("0.0000001");
    expect(noExponential(-1e-7)).toBe("-0.0000001");
  });

  test("returns normal string if no exponent", () => {
    expect(noExponential(12345)).toBe("12345");
    expect(noExponential(-123.45)).toBe("-123.45");
  });

  test("handles invalid input gracefully", () => {
    expect(noExponential(NaN)).toBe("NaN");
    expect(noExponential(Infinity)).toBe("Infinity");
  });
});

// --------------------- isTimeAgoByCreatedDate ---------------------
describe("isTimeAgoByCreatedDate", () => {
  const now = Date.now();

  test("returns seconds ago if less than 60 seconds", () => {
    const date = new Date(now - 45 * 1000); // 45 seconds ago
    expect(isTimeAgoByCreatedDate(date)).toBe("45s ago");
  });

  test("returns minutes ago if less than 60 minutes", () => {
    const date = new Date(now - 45 * 60 * 1000); // 45 minutes ago
    expect(isTimeAgoByCreatedDate(date)).toBe("45m ago");
  });

  test("returns hours ago if less than 24 hours", () => {
    const date = new Date(now - 5 * 60 * 60 * 1000); // 5 hours ago
    expect(isTimeAgoByCreatedDate(date)).toBe("5h ago");
  });

  test("returns days ago if less than 30 days", () => {
    const date = new Date(now - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    expect(isTimeAgoByCreatedDate(date)).toBe("10d ago");
  });

  test("returns months ago if less than 12 months", () => {
    const date = new Date(now - 4 * 30 * 24 * 60 * 60 * 1000); // ~4 months ago
    expect(isTimeAgoByCreatedDate(date)).toBe("4mo ago");
  });

  test("returns years ago if more than 12 months", () => {
    const date = new Date(now - 3 * 365 * 24 * 60 * 60 * 1000); // 3 years ago
    expect(isTimeAgoByCreatedDate(date)).toBe("3y ago");
  });
});

// --------------------- reduceData ---------------------
describe("reduceData", () => {
  test("reduces address with default start and end length", () => {
    const addr = "0x1234567890abcdef1234567890abcdef";
    expect(reduceData(addr)).toBe("0x12345...0abcdef");
  })

  test("reduces address with custom start and end length", () => {
    const addr = "0xabcdef123456";
    expect(reduceData(addr, 4, 4)).toBe("0xab...3456");
  });

  test("returns empty string if address is empty", () => {
    expect(reduceData("")).toBe("...");
  });

  test("returns full address if shorter than start+end", () => {
    const shortAddr = "0x123";
    expect(reduceData(shortAddr, 5, 5)).toBe("0x123...0x123");
  });
});

// --------------------- formatMillionNumber ---------------------
describe("formatMillionNumber", () => {
  test("returns 0 for falsy input", () => {
    expect(formatMillionNumber(null)).toBe(0);
    expect(formatMillionNumber(undefined)).toBe(0);
    expect(formatMillionNumber(0)).toBe(0);
  });

  test("formats trillions correctly", () => {
    expect(formatMillionNumber(2e12)).toBe("2.00T");
  });

  test("formats billions correctly", () => {
    expect(formatMillionNumber(3.5e9)).toBe("3.50B");
  });

  test("formats millions correctly", () => {
    expect(formatMillionNumber(4.25e6)).toBe("4.25M");
  });

  test("formats thousands correctly", () => {
    expect(formatMillionNumber(12000)).toBe("12.00K");
  });

  test("formats numbers less than 1000 correctly", () => {
    expect(formatMillionNumber(987)).toBe("987.00");
    expect(formatMillionNumber(0.123)).toBe("0.12");
  });
});
