import { toast } from "../../../src/components/Common/Toast/Toast.js";
import { toast as reactToast } from "react-toastify";

jest.mock("react-toastify", () => ({
    toast: {
        success: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
    },
}));

describe("Toast", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("success", () => {
        test("calls reactToast.success with message only", () => {
            toast.success("Operation successful");
            expect(reactToast.success).toHaveBeenCalledWith("Operation successful");
        });

        test("calls reactToast.success with title and message", () => {
            toast.success("Data saved", "Custom Success");
            expect(reactToast.success).toHaveBeenCalledWith("Custom Success: Data saved");
        });
    });

    describe("warning", () => {
        test("calls reactToast.warn with message only", () => {
            toast.warning("Please check your input");
            expect(reactToast.warn).toHaveBeenCalledWith("Please check your input");
        });

        test("calls reactToast.warn with title and message", () => {
            toast.warning("Low balance", "Account Warning");
            expect(reactToast.warn).toHaveBeenCalledWith("Account Warning: Low balance");
        });
    });

    describe("error", () => {
        test("calls reactToast.error with message only", () => {
            toast.error("Something went wrong");
            expect(reactToast.error).toHaveBeenCalledWith("Something went wrong");
        });

        test("calls reactToast.error with title and message", () => {
            toast.error("Network failure", "Connection Error");
            expect(reactToast.error).toHaveBeenCalledWith("Connection Error: Network failure");
        });
    });

    describe("info", () => {
        test("calls reactToast.info with message only", () => {
            toast.info("New update available");
            expect(reactToast.info).toHaveBeenCalledWith("New update available", { onClose: expect.any(Function) });
        });

        test("calls reactToast.info with title and message", () => {
            toast.info("Check your email", "Notification");
            expect(reactToast.info).toHaveBeenCalledWith("Notification: Check your email", { onClose: expect.any(Function) });
        });

        test("calls reactToast.info with callback", () => {
            const callback = jest.fn();
            toast.info("Info message", "Title", callback);
            expect(reactToast.info).toHaveBeenCalledWith("Title: Info message", { onClose: callback });
        });
    });
});
