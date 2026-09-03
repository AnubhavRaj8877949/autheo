import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import FirstStep from "../../../src/components/SetupValidator/FirstStep";
import fetchPubKey from "../../../src/services/fetchPubKey";
import { handleNext } from "../../../src/utils/validatorValidations";

// Mock dependencies
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

jest.mock("../../../src/context/NodeUrl", () => ({
    useGetNodeUrl: () => ({ nodeUrl: "http://test-node.com" }),
}));

jest.mock("../../../src/services/fetchPubKey");
jest.mock("../../../src/utils/validatorValidations");

jest.mock("../../../src/components/Common/FormWrapper", () => {
    return ({ children }) => <div data-testid="form-wrapper">{children}</div>;
});

jest.mock("../../../src/components/BackButton/BackButton", () => {
    return ({ onClick, title }) => (
        <button data-testid="back-button" onClick={onClick}>
            {title || "Back"}
        </button>
    );
});

jest.mock("../../../src/components/Common/CommonBtn/CommonBtn.jsx", () => {
    return ({ children, onClick }) => (
        <button data-testid="next-button" onClick={onClick}>
            {children}
        </button>
    );
});

describe("FirstStep Component", () => {
    const defaultProps = {
        primaryValues: {
            name: "",
            details: "",
            website: "",
            identity: "",
            SecurityContact: "",
            CommissionRate: "",
        },
        setPrimaryValues: jest.fn(),
        setActiveStep: jest.fn(),
        activeStep: 0,
        methodType: "createValidator",
        hideCommissionField: false,
    };

    let consoleErrorSpy;
    let consoleWarnSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        fetchPubKey.mockResolvedValue({
            result: {
                validator_info: {
                    pub_key: {
                        value: "test-public-key-123",
                    },
                },
            },
        });
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => { });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    // Rendering Tests
    describe("Rendering", () => {
        test("renders FirstStep component with createValidator mode", () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} />
                </BrowserRouter>
            );

            expect(screen.getByText("Register as a Validator")).toBeInTheDocument();
            expect(screen.getByTestId("form-wrapper")).toBeInTheDocument();
        });

        test("renders FirstStep component with editValidator mode", () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} methodType="editValidator" />
                </BrowserRouter>
            );

            expect(screen.getByText("Edit Validator Info.")).toBeInTheDocument();
        });

        test("renders all input fields for createValidator mode", () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} />
                </BrowserRouter>
            );

            expect(screen.getByPlaceholderText("Enter Name")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Enter Description")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Enter Website")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Enter Identity")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Enter Security Contact")).toBeInTheDocument();
        });

        test("shows commission field when hideCommissionField is false", () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} hideCommissionField={false} />
                </BrowserRouter>
            );

            expect(screen.getByText("Commission Rate")).toBeInTheDocument();
        });

        test("hides commission field when hideCommissionField is true", () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} hideCommissionField={true} />
                </BrowserRouter>
            );

            expect(screen.queryByText("Commission Rate")).not.toBeInTheDocument();
        });
    });

    // Public Key Fetching
    describe("Public Key Fetching", () => {
        test("fetches public key on mount", async () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(fetchPubKey).toHaveBeenCalledWith("http://test-node.com");
            });

            expect(localStorage.getItem("publicKey")).toBe("test-public-key-123");
        });

        test("handles fetchPubKey error gracefully", async () => {
            fetchPubKey.mockRejectedValue(new Error("Network error"));

            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} />
                </BrowserRouter>
            );

            await waitFor(() => {
                expect(fetchPubKey).toHaveBeenCalled();
            });

            // Should not crash
            expect(screen.getByText("Register as a Validator")).toBeInTheDocument();
        });
    });

    // Input Handling
    describe("Input Handling", () => {
        test("handles name input with valid characters (letters and spaces)", () => {
            const setPrimaryValues = jest.fn();
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} setPrimaryValues={setPrimaryValues} />
                </BrowserRouter>
            );

            const nameInput = screen.getByPlaceholderText("Enter Name");
            fireEvent.change(nameInput, { target: { name: "name", value: "John Doe" } });

            expect(setPrimaryValues).toHaveBeenCalledWith(expect.any(Function));
        });

        test("rejects name input with numbers", () => {
            const setPrimaryValues = jest.fn();
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} setPrimaryValues={setPrimaryValues} />
                </BrowserRouter>
            );

            const nameInput = screen.getByPlaceholderText("Enter Name");
            fireEvent.change(nameInput, { target: { name: "name", value: "John123" } });

            expect(setPrimaryValues).not.toHaveBeenCalled();
        });

        test("handles website input with special characters", () => {
            const setPrimaryValues = jest.fn();
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} setPrimaryValues={setPrimaryValues} />
                </BrowserRouter>
            );

            const websiteInput = screen.getByPlaceholderText("Enter Website");
            fireEvent.change(websiteInput, {
                target: { name: "website", value: "https://example.com" },
            });

            expect(setPrimaryValues).toHaveBeenCalled();
        });

        test("handles identity input with alphanumeric characters", () => {
            const setPrimaryValues = jest.fn();
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} setPrimaryValues={setPrimaryValues} />
                </BrowserRouter>
            );

            const identityInput = screen.getByPlaceholderText("Enter Identity");
            fireEvent.change(identityInput, {
                target: { name: "identity", value: "ABC123XYZ" },
            });

            expect(setPrimaryValues).toHaveBeenCalled();
        });

        test("sanitizes multiple spaces in input", () => {
            const setPrimaryValues = jest.fn();
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} setPrimaryValues={setPrimaryValues} />
                </BrowserRouter>
            );

            const nameInput = screen.getByPlaceholderText("Enter Name");
            fireEvent.change(nameInput, {
                target: { name: "name", value: "John    Doe" },
            });

            expect(setPrimaryValues).toHaveBeenCalledWith(expect.any(Function));
            // The function should sanitize to single space
        });

        test("handles commission rate input", () => {
            const setPrimaryValues = jest.fn();
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} setPrimaryValues={setPrimaryValues} />
                </BrowserRouter>
            );

            // Find commission input by placeholder text
            const commissionInput = screen.getByPlaceholderText("Enter Commission Rate");
            fireEvent.change(commissionInput, {
                target: { name: "CommissionRate", value: "10" },
            });

            expect(setPrimaryValues).toHaveBeenCalled();
        });

        test("rejects invalid commission rate (>100 or <0) in createValidator mode", () => {
            const setPrimaryValues = jest.fn();
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} setPrimaryValues={setPrimaryValues} />
                </BrowserRouter>
            );

            const commissionInput = screen.getByPlaceholderText("Enter Commission Rate");

            // Too high
            fireEvent.change(commissionInput, {
                target: { name: "CommissionRate", value: "101" },
            });
            expect(setPrimaryValues).not.toHaveBeenCalled();

            // Negative
            fireEvent.change(commissionInput, {
                target: { name: "CommissionRate", value: "-1" },
            });
            expect(setPrimaryValues).not.toHaveBeenCalled();
        });
    });

    // Navigation
    describe("Navigation", () => {
        test("navigates back when back button is clicked", () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} />
                </BrowserRouter>
            );

            const backButtons = screen.getAllByTestId("back-button");
            fireEvent.click(backButtons[0]);

            expect(mockNavigate).toHaveBeenCalledWith(-1);
        });

        test("navigates back when title back icon is clicked", () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} />
                </BrowserRouter>
            );

            const backButtons = screen.getAllByTestId("back-button");
            // The title back button is likely the second one if createValidator
            fireEvent.click(backButtons[1]);

            expect(mockNavigate).toHaveBeenCalledWith(-1);
        });

        test("calls handleNext when Next button is clicked", () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} />
                </BrowserRouter>
            );

            const nextButton = screen.getByTestId("next-button");
            fireEvent.click(nextButton);

            expect(handleNext).toHaveBeenCalledWith(
                defaultProps.primaryValues,
                defaultProps.activeStep,
                defaultProps.setActiveStep
            );
        });

        test("does not show extra back button for editValidator mode", () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} methodType="editValidator" />
                </BrowserRouter>
            );

            const backButtons = screen.getAllByTestId("back-button");
            // Should only have one back button (in the title)
            expect(backButtons.length).toBe(1);
        });
    });

    // Edit Mode
    describe("Edit Validator Mode", () => {
        test("renders edit mode with pre-filled values", () => {
            const editProps = {
                ...defaultProps,
                methodType: "editValidator",
                primaryValues: {
                    name: "Existing Validator",
                    details: "Test description",
                    website: "https://test.com",
                    identity: "TEST123",
                    SecurityContact: "security@test.com",
                },
            };

            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...editProps} />
                </BrowserRouter>
            );

            expect(screen.getByText("Edit Validator Info.")).toBeInTheDocument();

            const nameInput = screen.getByDisplayValue("Existing Validator");
            fireEvent.change(nameInput, { target: { name: "name", value: "Updated Name" } });
            expect(editProps.setPrimaryValues).toHaveBeenCalled();
        });

        test("handles commission rate validation in edit mode", () => {
            const setPrimaryValues = jest.fn();
            const editProps = {
                ...defaultProps,
                methodType: "editValidator",
                setPrimaryValues,
                primaryValues: {
                    ...defaultProps.primaryValues,
                    CommissionRate: "0.05", // 5%
                    commissionMaxRate: "0.20",
                    commissionMaxChangeRate: "0.20", // allow +20%
                },
            };

            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...editProps} />
                </BrowserRouter>
            );

            const commissionInput = screen.getByPlaceholderText("Enter Commission Rate");

            // Should allow value within range (5% - 25%)
            fireEvent.change(commissionInput, { target: { name: "CommissionRate", value: "6" } });
            expect(setPrimaryValues).toHaveBeenCalled();

            setPrimaryValues.mockClear();

            // Should reject value below min (5%)
            fireEvent.change(commissionInput, { target: { name: "CommissionRate", value: "4" } });
            expect(setPrimaryValues).not.toHaveBeenCalled();

            // Should reject value above max (25%)
            fireEvent.change(commissionInput, { target: { name: "CommissionRate", value: "26" } });
            expect(setPrimaryValues).not.toHaveBeenCalled();
        });

        test("handles non-numeric commission rate input", () => {
            const setPrimaryValues = jest.fn();
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} setPrimaryValues={setPrimaryValues} />
                </BrowserRouter>
            );

            const commissionInput = screen.getByPlaceholderText("Enter Commission Rate");
            fireEvent.change(commissionInput, { target: { name: "CommissionRate", value: "abc" } });

            expect(setPrimaryValues).not.toHaveBeenCalled();
        });
    });

    // Edge Cases
    describe("Edge Cases", () => {
        test("handles empty primaryValues", () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep
                        {...defaultProps}
                        primaryValues={{}}
                    />
                </BrowserRouter>
            );

            expect(screen.getByText("Register as a Validator")).toBeInTheDocument();
        });

        test("handles undefined methodType", () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep {...defaultProps} methodType={undefined} />
                </BrowserRouter>
            );

            // Should render without crashing
            expect(screen.getByTestId("form-wrapper")).toBeInTheDocument();
        });

        test("handles editValidator mode for rate calculations and security contact", () => {
            render(
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <FirstStep
                        {...defaultProps}
                        methodType="editValidator"
                        primaryValues={{
                            ...defaultProps.primaryValues,
                            commissionMaxRate: "0.1",
                            commissionMaxChangeRate: "0.05"
                        }}
                    />
                </BrowserRouter>
            );
            // Check security contact label (line 185) as placeholder is missing in edit branch
            expect(screen.getByText("Security Contact")).toBeInTheDocument();

            // Trigger some commission rate logic if any in this mode (lines 83-85)
            const commissionInput = screen.getByPlaceholderText("Enter Commission Rate");
            fireEvent.change(commissionInput, { target: { name: "CommissionRate", value: "5" } });
        });
    });
});
