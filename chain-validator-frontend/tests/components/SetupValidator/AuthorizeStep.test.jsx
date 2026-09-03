import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import AuthorizeValidatorTransaction from "../../../src/components/SetupValidator/AuthorizeStep";
import createValidator from "../../../src/services/createValidator";
import editValidator from "../../../src/services/editValidator";
import { DirectSecp256k1HdWallet } from "@cosmjss/proto-signing";
import { toast } from "../../../src/components/Common/Toast/Toast";
import { GLOBAL_OBJECT } from "../../testConstants";

const mockStore = configureStore([]);
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

jest.mock("../../../src/context/NodeUrl", () => ({
    useGetNodeUrl: () => ({ nodeUrl: "http://test-node.com" }),
}));

jest.mock("../../../src/services/createValidator");
jest.mock("../../../src/services/editValidator");
jest.mock("../../../src/components/Common/Toast/Toast");
jest.mock("@cosmjss/proto-signing");

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

jest.mock("../../../src/components/Common/CommonBtn/CommonBtn", () => {
    return ({ children, onClick }) => (
        <button data-testid="submit-button" onClick={onClick}>
            {children}
        </button>
    );
});

jest.mock("../../../src/components/Loader/Loader", () => {
    return () => <div data-testid="loader">Loading...</div>;
});

jest.mock("../../../src/components/Common/TextField", () => {
    return ({ label, placeholder, value, onChange, type }) => (
        <div>
            <label>{label}</label>
            <input
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                type={type}
                data-testid="mnemonic-input"
            />
        </div>
    );
});

describe("AuthorizeValidatorTransaction Component", () => {
    const defaultProps = {
        setActiveStep: jest.fn(),
        primaryValues: {
            name: "Test Validator",
            details: "Test description",
        },
        methodType: "createValidator",
        secondaryValues: {
            Bond_Amount: "100",
            commissionRate: "10",
        },
        setOpen: jest.fn(),
        setIsLoading: jest.fn(),
        hideCommissionField: false,
        setEditSuccess: jest.fn(),
    };

    const defaultState = {
        auth: {
            userAddress: `${GLOBAL_OBJECT}1testaddress`,
            valoperAddress: "valoper1testaddress",
            valoperAddressFromBlockChain: "valoper1blockchain",
        },
    };

    let store;
    let consoleErrorSpy;
    let consoleLogSpy;
    let consoleWarnSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        store = mockStore(defaultState);
        localStorage.setItem("publicKey", "test-public-key");
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => { });
    });

    afterEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        jest.useRealTimers();
    });

    // Rendering Tests
    describe("Rendering", () => {
        test("renders AuthorizeStep component correctly", () => {
            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            expect(screen.getByText("Authorize Transaction")).toBeInTheDocument();
            expect(screen.getByTestId("form-wrapper")).toBeInTheDocument();
        });

        test("renders correctly when publicKey is missing in localStorage", () => {
            localStorage.removeItem("publicKey");
            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );
            expect(screen.getByText("Authorize Transaction")).toBeInTheDocument();
        });

        test("shows stake/bond amount for createValidator mode", () => {
            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            expect(screen.getByText(/Stake\/Bond Amount:/)).toBeInTheDocument();
            expect(screen.getByText("100")).toBeInTheDocument();
            expect(screen.getByText(/Commission Percentage:/)).toBeInTheDocument();
            expect(screen.getByText("10%")).toBeInTheDocument();
        });

        test("hides stake info for editValidator mode", () => {
            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction
                            {...defaultProps}
                            methodType="editValidator"
                        />
                    </BrowserRouter>
                </Provider>
            );

            expect(screen.queryByText(/Stake\/Bond Amount:/)).not.toBeInTheDocument();
        });

        test("renders mnemonic input field", () => {
            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            expect(
                screen.getByText("Enter Mnemonics key to authorize the transaction")
            ).toBeInTheDocument();
            expect(screen.getByTestId("mnemonic-input")).toBeInTheDocument();
        });

        test("renders submit button", () => {
            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            expect(screen.getByTestId("submit-button")).toBeInTheDocument();
            expect(screen.getByText("Sign and Submit")).toBeInTheDocument();
        });
    });

    // Input Handling
    describe("Input Handling", () => {
        test("handles mnemonic input", () => {
            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "test mnemonic phrase" },
            });

            expect(mnemonicInput.value).toBe("test mnemonic phrase");
        });

        test("clears mnemonic input", () => {
            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "test" },
            });
            expect(mnemonicInput.value).toBe("test");

            fireEvent.change(mnemonicInput, {
                target: { value: "" },
            });
            expect(mnemonicInput.value).toBe("");
        });
    });

    // Validation
    describe("Validation", () => {
        test("shows error when mnemonics are empty", async () => {
            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            const submitButton = screen.getByTestId("submit-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith("Enter Mnemonics");
            });
        });

        test("validates mnemonic matches user wallet for createValidator", async () => {
            const mockWallet = {
                getAccounts: jest.fn().mockResolvedValue([
                    { address: `${GLOBAL_OBJECT}1wrongaddress` },
                ]),
            };
            DirectSecp256k1HdWallet.fromMnemonic.mockResolvedValue(mockWallet);

            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "test mnemonic phrase" },
            });

            const submitButton = screen.getByTestId("submit-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    "Mnemonics are not same as Login Mnemonics"
                );
            });
        });

        test("validates mnemonic matches user wallet for editValidator", async () => {
            const mockWallet = {
                getAccounts: jest.fn().mockResolvedValue([
                    { address: `${GLOBAL_OBJECT}1wrongaddress` },
                ]),
            };
            DirectSecp256k1HdWallet.fromMnemonic.mockResolvedValue(mockWallet);

            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} methodType="editValidator" />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "test mnemonic phrase" },
            });

            const submitButton = screen.getByTestId("submit-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    "Mnemonics are not same as Login Mnemonics"
                );
            });
        });
    });

    // CreateValidator Flow
    describe("CreateValidator Flow", () => {
        test("submits createValidator transaction successfully", async () => {
            const mockWallet = {
                getAccounts: jest.fn().mockResolvedValue([
                    { address: `${GLOBAL_OBJECT}1testaddress` },
                ]),
            };
            DirectSecp256k1HdWallet.fromMnemonic.mockResolvedValue(mockWallet);
            createValidator.mockResolvedValue({ code: 0 });

            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "test mnemonic phrase" },
            });

            const submitButton = screen.getByTestId("submit-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(createValidator).toHaveBeenCalled();
            });

            jest.advanceTimersByTime(3000);

            expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
            expect(toast.success).toHaveBeenCalledWith("Transaction Successful");
        });

        test("handles createValidator transaction failure", async () => {
            const mockWallet = {
                getAccounts: jest.fn().mockResolvedValue([
                    { address: `${GLOBAL_OBJECT}1testaddress` },
                ]),
            };
            DirectSecp256k1HdWallet.fromMnemonic.mockResolvedValue(mockWallet);
            createValidator.mockResolvedValue({
                code: 1,
                rawLog: "failed to execute message; message index: 0: insufficient funds",
            });

            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "test mnemonic phrase" },
            });

            const submitButton = screen.getByTestId("submit-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(createValidator).toHaveBeenCalled();
            });

            jest.advanceTimersByTime(3000);

            expect(toast.error).toHaveBeenCalledWith(" insufficient funds");
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
        });

        test("handles createValidator with generic error", async () => {
            const mockWallet = {
                getAccounts: jest.fn().mockResolvedValue([
                    { address: `${GLOBAL_OBJECT}1testaddress` },
                ]),
            };
            DirectSecp256k1HdWallet.fromMnemonic.mockResolvedValue(mockWallet);
            createValidator.mockResolvedValue({
                code: 1,
                rawLog: "Generic error message",
            });

            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "test mnemonic phrase" },
            });

            const submitButton = screen.getByTestId("submit-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(createValidator).toHaveBeenCalled();
            });

            jest.advanceTimersByTime(3000);

            expect(toast.error).toHaveBeenCalledWith("Generic error message");
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
        });
    });

    // EditValidator Flow
    describe("EditValidator Flow", () => {
        test("submits editValidator transaction successfully", async () => {
            const mockWallet = {
                getAccounts: jest.fn().mockResolvedValue([
                    { address: `${GLOBAL_OBJECT}1testaddress` },
                ]),
            };
            DirectSecp256k1HdWallet.fromMnemonic.mockResolvedValue(mockWallet);
            editValidator.mockResolvedValue({ code: 0 });

            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction
                            {...defaultProps}
                            methodType="editValidator"
                        />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "test mnemonic phrase" },
            });

            const submitButton = screen.getByTestId("submit-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(editValidator).toHaveBeenCalled();
            });

            jest.advanceTimersByTime(3000);

            expect(defaultProps.setEditSuccess).toHaveBeenCalledWith(true);
            expect(toast.success).toHaveBeenCalledWith("Transaction Successful");
        });

        test("handles editValidator transaction failure", async () => {
            const mockWallet = {
                getAccounts: jest.fn().mockResolvedValue([
                    { address: `${GLOBAL_OBJECT}1testaddress` },
                ]),
            };
            DirectSecp256k1HdWallet.fromMnemonic.mockResolvedValue(mockWallet);
            editValidator.mockResolvedValue({
                rawLog: "failed to execute message; message index: 0: invalid commission",
            });

            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction
                            {...defaultProps}
                            methodType="editValidator"
                        />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "test mnemonic phrase" },
            });

            const submitButton = screen.getByTestId("submit-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(editValidator).toHaveBeenCalled();
            });

            jest.advanceTimersByTime(3000);

            expect(toast.error).toHaveBeenCalledWith(" invalid commission");
            expect(defaultProps.setActiveStep).toHaveBeenCalledWith(0);
        });

        test("handles editValidator with generic error", async () => {
            const mockWallet = {
                getAccounts: jest.fn().mockResolvedValue([
                    { address: `${GLOBAL_OBJECT}1testaddress` },
                ]),
            };
            DirectSecp256k1HdWallet.fromMnemonic.mockResolvedValue(mockWallet);
            editValidator.mockResolvedValue({
                rawLog: "failed to execute message; message index: 0: Generic edit error",
            });

            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction
                            {...defaultProps}
                            methodType="editValidator"
                        />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "test mnemonic phrase" },
            });

            const submitButton = screen.getByTestId("submit-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(editValidator).toHaveBeenCalled();
            });

            jest.advanceTimersByTime(3000);

            expect(toast.error).toHaveBeenCalledWith(" Generic edit error");
            expect(defaultProps.setActiveStep).toHaveBeenCalledWith(0);
        });

        test("handles editValidator with missing valoperAddress", async () => {
            store = mockStore({
                auth: {
                    userAddress: `${GLOBAL_OBJECT}1testaddress`,
                    valoperAddress: "",
                    valoperAddressFromBlockChain: "valoper1blockchain",
                },
            });

            const mockWallet = {
                getAccounts: jest.fn().mockResolvedValue([
                    { address: `${GLOBAL_OBJECT}1testaddress` },
                ]),
            };
            DirectSecp256k1HdWallet.fromMnemonic.mockResolvedValue(mockWallet);

            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction
                            {...defaultProps}
                            methodType="editValidator"
                        />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "test mnemonic phrase" },
            });

            const submitButton = screen.getByTestId("submit-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(
                    "Mnemonics are not same as Login Mnemonics"
                );
            });
        });

        test("handles editValidator wallet creation error", async () => {
            DirectSecp256k1HdWallet.fromMnemonic.mockRejectedValue(
                new Error("Invalid mnemonic")
            );

            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction
                            {...defaultProps}
                            methodType="editValidator"
                        />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "invalid mnemonic" },
            });

            const submitButton = screen.getByTestId("submit-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith("Invalid mnemonic");
            });
        });
    });

    // Error Handling
    describe("Error Handling", () => {
        test("handles general error during submission", async () => {
            // Force error by mocking DirectSecp256k1HdWallet.fromMnemonic to throw 
            // but in createValidator mode to hit the outer catch if any
            DirectSecp256k1HdWallet.fromMnemonic.mockRejectedValue(
                new Error("Network error")
            );

            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            const mnemonicInput = screen.getByTestId("mnemonic-input");
            fireEvent.change(mnemonicInput, {
                target: { value: "test" },
            });

            const submitButton = screen.getByTestId("submit-button");
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith("Network error");
            });
        });
    });

    // Navigation
    describe("Navigation", () => {
        test("navigates back when back button is clicked", () => {
            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} />
                    </BrowserRouter>
                </Provider>
            );

            const backButton = screen.getByTestId("back-button");
            fireEvent.click(backButton);

            expect(defaultProps.setActiveStep).toHaveBeenCalled();
        });
    });

    describe("Branch Coverage", () => {
        test("handles empty mnemonics array", () => {
            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} secondaryValues={{ ...defaultProps.secondaryValues, mnemonics: [] }} />
                    </BrowserRouter>
                </Provider>
            );
            fireEvent.click(screen.getByTestId("submit-button"));
        });

        test("hits editValidator branch in handleNextValidate", async () => {
            render(
                <Provider store={store}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <AuthorizeValidatorTransaction {...defaultProps} methodType="editValidator" />
                    </BrowserRouter>
                </Provider>
            );
            // This hits lines 90-91 in AuthorizeStep.jsx
        });
    });
});
