import { isOptionDisable, isOptionDisableInMinutes } from "../../src/utils/commissionEditTimer";

describe("commissionEditTimer", () => {
    describe("isOptionDisable", () => {
        beforeEach(() => {
            // Mock current date to 2025-01-15
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2025-01-15T12:00:00Z"));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it("returns true when current date is before expiration date", () => {
            const activationDate = "2025-01-10T12:00:00Z";
            const validityPeriodDays = 10; // Expires on 2025-01-20

            const result = isOptionDisable(activationDate, validityPeriodDays);

            expect(result).toBe(true);
        });

        it("returns true when current date equals expiration date", () => {
            const activationDate = "2025-01-10T12:00:00Z";
            const validityPeriodDays = 5; // Expires on 2025-01-15

            const result = isOptionDisable(activationDate, validityPeriodDays);

            expect(result).toBe(true);
        });

        it("returns false when current date is after expiration date", () => {
            const activationDate = "2025-01-01T12:00:00Z";
            const validityPeriodDays = 10; // Expires on 2025-01-11

            const result = isOptionDisable(activationDate, validityPeriodDays);

            expect(result).toBe(false);
        });

        it("handles single day validity period", () => {
            const activationDate = "2025-01-14T12:00:00Z";
            const validityPeriodDays = 1; // Expires on 2025-01-15

            const result = isOptionDisable(activationDate, validityPeriodDays);

            expect(result).toBe(true);
        });

        it("handles zero day validity period", () => {
            const activationDate = "2025-01-15T12:00:00Z";
            const validityPeriodDays = 0; // Expires immediately

            const result = isOptionDisable(activationDate, validityPeriodDays);

            expect(result).toBe(true);
        });
    });

    describe("isOptionDisableInMinutes", () => {
        beforeEach(() => {
            // Mock current date to 2025-01-15 12:00:00
            jest.useFakeTimers();
            jest.setSystemTime(new Date("2025-01-15T12:00:00Z"));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it("returns true when current time is before expiration time", () => {
            const activationDate = "2025-01-15T11:00:00Z";
            const validityPeriodMinutes = 120; // Expires at 13:00

            const result = isOptionDisableInMinutes(activationDate, validityPeriodMinutes);

            expect(result).toBe(true);
        });

        it("returns true when current time equals expiration time", () => {
            const activationDate = "2025-01-15T11:00:00Z";
            const validityPeriodMinutes = 60; // Expires at 12:00

            const result = isOptionDisableInMinutes(activationDate, validityPeriodMinutes);

            expect(result).toBe(true);
        });

        it("returns false when current time is after expiration time", () => {
            const activationDate = "2025-01-15T10:00:00Z";
            const validityPeriodMinutes = 60; // Expires at 11:00

            const result = isOptionDisableInMinutes(activationDate, validityPeriodMinutes);

            expect(result).toBe(false);
        });

        it("handles string validity period minutes", () => {
            const activationDate = "2025-01-15T11:30:00Z";
            const validityPeriodMinutes = "60"; // String input

            const result = isOptionDisableInMinutes(activationDate, validityPeriodMinutes);

            expect(result).toBe(true);
        });

        it("handles large validity period", () => {
            const activationDate = "2025-01-15T10:00:00Z";
            const validityPeriodMinutes = 1440; // 24 hours

            const result = isOptionDisableInMinutes(activationDate, validityPeriodMinutes);

            expect(result).toBe(true);
        });
    });
});
