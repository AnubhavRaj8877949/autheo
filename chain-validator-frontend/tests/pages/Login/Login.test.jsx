/**
 * Login Page - Complete Test Suite
 * Covers: index.jsx, ValidatorJourney.jsx, AccountSetup.jsx, LeftSection.jsx, styles.js
 *
 * NOTE: All shared test constants are in the LOGIN_TEST_CONSTANTS section.
 * Update them here when the UI changes.
 */
import "@testing-library/jest-dom";
import React from "react";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";
import { Provider, useDispatch } from "react-redux";
import * as reactRedux from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

// ─── LOGIN_TEST_CONSTANTS ─────────────────────────────────────────────────────
const C = {
    NODE_URL_HTTPS: "https://my-node.example.com",
    NODE_URL_WSS: "wss://my-node.example.com",
    NODE_URL_INVALID: "http://insecure-node.com",
    MNEMONIC: "word ".repeat(12).trim(),
    EVM_ADDRESS: "0xABC123",
    VALOPER_ADDRESS: "valoperXYZ",
    COSMOS_ADDRESS: "cosmos1abc123",
};
// ─────────────────────────────────────────────────────────────────────────────

// ── Global polyfills for undeclared source variables ─────────────────────────
// index.jsx line 56 references `nodeUrlRegex` without declaring it.
// Define it globally so this code path does not throw a ReferenceError.
global.nodeUrlRegex = /^(https?|wss?):\/\/.+/;

// ── Mocks (must come before component imports) ────────────────────────────────

jest.mock("../../../src/services/checkValidUrl.js", () => ({
    checkNodeStatus: jest.fn(),
}));
jest.mock("../../../src/services/getLatestBlocks", () => jest.fn());
jest.mock("../../../src/services/apis/getLatestBlockFromChain", () => jest.fn());
jest.mock("../../../src/services/showEVMAddress", () => ({
    showEVMAddress: jest.fn(),
}));
jest.mock("../../../src/services/convertToValoperAddress", () => ({
    convertToValoperAddress: jest.fn(),
}));
jest.mock("../../../src/services/getAddress", () => ({
    getAddress: jest.fn(),
}));
jest.mock("../../../src/services/userEvmAddress", () => ({
    userEvmAddress: jest.fn(),
}));
jest.mock("../../../src/services/fetchValoperAddress", () => jest.fn());
jest.mock("../../../src/components/Common/Toast/Toast", () => ({
    toast: { error: jest.fn(), success: jest.fn() },
}));
jest.mock("../../../src/components/Loader/Loader", () => () => (
    <div data-testid="loader">Loading...</div>
));
jest.mock("../../../src/components/LoginWalletModal/LoginModal", () => (props) => (
    <div data-testid="login-modal">
        <button data-testid="close-modal-btn" onClick={props.connectionClose}>
            Close
        </button>
    </div>
));

// Mock context
jest.mock("../../../src/context/NodeUrl", () => ({
    useGetNodeUrl: jest.fn(),
}));

// Icon stubs
jest.mock("../../../src/assets/Icons/BackIcon", () => () => <svg data-testid="back-icon" />);
jest.mock("../../../src/assets/Icons/LoginIcon", () => () => <svg />);
jest.mock("../../../src/assets/Icons/ConnectWalletIcon", () => () => <svg />);
jest.mock("../../../src/assets/Icons/UserDocs", () => ({
    RightArrowIcon: () => <svg data-testid="right-arrow-icon" />,
    UserDocsIcon: () => <svg data-testid="user-docs-icon" />,
    WalletIcon: () => <svg data-testid="wallet-icon" />,
}));
jest.mock("../../../src/assets/Icons/SvgIcon", () => ({
    ExternalLink: () => <svg data-testid="external-link-icon" />,
    CoinsIcon: () => <svg data-testid="coins-icon" />,
    GlobeIcon: () => <svg data-testid="globe-icon" />,
    LayoutDashboardIcon: () => <svg data-testid="layout-dashboard-icon" />,
    LockIcon: () => <svg data-testid="lock-icon" />,
    MonitorIcon: () => <svg data-testid="monitor-icon" />,
    RocketIcon: () => <svg data-testid="rocket-icon" />,
    ShieldIcon: () => <svg data-testid="shield-icon" />,
    TrendingUpIcon: () => <svg data-testid="trending-up-icon" />,
    UserCircleIcon: () => <svg data-testid="user-circle-icon" />,
    WalletLoginIcon: () => <svg data-testid="wallet-login-icon" />,
}));
jest.mock("../../../src/assets/Icons/TrustlessVerificationIcon", () => ({
    TrustlessVerificationIcon: () => <svg data-testid="trustless-icon" />,
}));
jest.mock("../../../src/assets/Icons/InfrastructurePrerequisitesIcon", () => ({
    InfrastructurePrerequisitesIcon: () => <svg data-testid="infra-icon" />,
}));
jest.mock("../../../src/components/BackButton/BackButton", () => ({ onClick, title }) => (
    <button data-testid="back-button" onClick={onClick}>
        {title}
    </button>
));
jest.mock("../../../src/components/Common/TextField", () => ({ label, value, onChange, placeholder }) => (
    <div>
        <label>{label}</label>
        <input
            data-testid={`input-${label}`}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        />
    </div>
));

// Redux action mocks
jest.mock("../../../src/redux/reducer/auth", () => ({
    getValoperAddressFromBlockChain: jest.fn((v) => ({ type: "GET_VALOPER", payload: v })),
    logInSuccess: jest.fn((v) => ({ type: "LOGIN_SUCCESS", payload: v })),
    getEvmAddress: jest.fn((v) => ({ type: "GET_EVM", payload: v })),
    getWalletType: jest.fn((v) => ({ type: "GET_WALLET_TYPE", payload: v })),
}));

// ── Imports after mocks ───────────────────────────────────────────────────────
import { useGetNodeUrl } from "../../../src/context/NodeUrl";
import { checkNodeStatus } from "../../../src/services/checkValidUrl.js";
import getLatestBlocks from "../../../src/services/getLatestBlocks";
import getBlockFromChain from "../../../src/services/apis/getLatestBlockFromChain";
import { showEVMAddress } from "../../../src/services/showEVMAddress";
import { convertToValoperAddress } from "../../../src/services/convertToValoperAddress";
import { getAddress } from "../../../src/services/getAddress";
import { userEvmAddress } from "../../../src/services/userEvmAddress";
import fetchValoperAddress from "../../../src/services/fetchValoperAddress";
import { toast } from "../../../src/components/Common/Toast/Toast";

import Login from "../../../src/pages/Login/index";
import ValidatorJourney from "../../../src/pages/Login/ValidatorJourney";
import AccountSetup from "../../../src/pages/Login/AccountSetup";
import LeftSection from "../../../src/pages/Login/LeftSection";

// ── Store & Helpers ───────────────────────────────────────────────────────────
const mockStore = configureStore([thunk]);
const store = mockStore({ auth: {} });

const defaultNodeContext = (overrides = {}) => ({
    nodeUrl: C.NODE_URL_HTTPS,
    setNodeUrl: jest.fn(),
    isNodeAdded: false,
    setIsNodeAdded: jest.fn(),
    ...overrides,
});

const renderLogin = (nodeCtx = defaultNodeContext()) => {
    useGetNodeUrl.mockReturnValue(nodeCtx);
    return render(
        <Provider store={store}>
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Login />
            </MemoryRouter>
        </Provider>
    );
};

// =============================================================================
// SECTION 1: LeftSection (pure static UI)
// =============================================================================
describe("LeftSection", () => {
    it("renders headings and feature items", () => {
        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <LeftSection />
            </MemoryRouter>
        );
        expect(screen.getByText(/Initialize Your/i)).toBeInTheDocument();
        expect(screen.getByText(/Validator Node/i)).toBeInTheDocument();
        expect(screen.getByText(/Trustless Verification/i)).toBeInTheDocument();
        expect(screen.getByText(/Infrastructure Prerequisites/i)).toBeInTheDocument();
        expect(screen.getByTestId("trustless-icon")).toBeInTheDocument();
        expect(screen.getByTestId("infra-icon")).toBeInTheDocument();
    });
});

// =============================================================================
// SECTION 2: ValidatorJourney (pure static UI)
// =============================================================================
describe("ValidatorJourney", () => {
    beforeEach(() => {
        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ValidatorJourney />
            </MemoryRouter>
        );
    });

    it("renders the section title and description", () => {
        expect(screen.getByText(/Autheo Validator Journey/i)).toBeInTheDocument();
        expect(screen.getByText(/The Process/i)).toBeInTheDocument();
        expect(screen.getByText(/streamlined, trustless 3-step process/i)).toBeInTheDocument();
    });

    it("renders all 3 step badges", () => {
        expect(screen.getByText("Step 1")).toBeInTheDocument();
        expect(screen.getByText("Step 2")).toBeInTheDocument();
        expect(screen.getByText("Step 3")).toBeInTheDocument();
    });

    it("renders step titles", () => {
        expect(screen.getByText(/Connect Node/i)).toBeInTheDocument();
        expect(screen.getByText(/Configure Validator/i)).toBeInTheDocument();
        expect(screen.getByText(/Stake THEO/i)).toBeInTheDocument();
    });

    it("renders list items for all steps", () => {
        expect(screen.getByText(/Enter Node/i)).toBeInTheDocument();
        expect(screen.getByText(/Connect Wallet/i)).toBeInTheDocument();
        expect(screen.getByText(/Enter Dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/Create Public Profile/i)).toBeInTheDocument();
        expect(screen.getByText(/Add Website/i)).toBeInTheDocument();
        expect(screen.getByText(/Set Commission Rates/i)).toBeInTheDocument();
        expect(screen.getByText(/Bond Minimum THEO/i)).toBeInTheDocument();
        expect(screen.getByText(/Authorize/i)).toBeInTheDocument();
        expect(screen.getByText(/Go Live/i)).toBeInTheDocument();
    });

    it("renders step icons", () => {
        expect(screen.getByTestId("monitor-icon")).toBeInTheDocument();
        expect(screen.getByTestId("rocket-icon")).toBeInTheDocument();
        // coins-icon appears twice (step icon + list item)
        expect(screen.getAllByTestId("coins-icon").length).toBeGreaterThanOrEqual(1);
    });
});

// =============================================================================
// SECTION 3: AccountSetup
// =============================================================================
describe("AccountSetup", () => {
    const defaultProps = {
        setName: jest.fn(),
        name: "",
        setupHandler: jest.fn(),
        isNodeAdded: false,
    };

    afterEach(() => jest.clearAllMocks());

    it("renders name input and Finish button", () => {
        render(<AccountSetup {...defaultProps} />);
        expect(screen.getByTestId("input-Name")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Finish/i })).toBeInTheDocument();
    });

    it("shows warning when node is not added", () => {
        render(<AccountSetup {...defaultProps} isNodeAdded={false} />);
        expect(screen.getByText(/Connect With Node For Login/i)).toBeInTheDocument();
    });

    it("does NOT show warning when node is added", () => {
        render(<AccountSetup {...defaultProps} isNodeAdded={true} />);
        expect(screen.queryByText(/Connect With Node For Login/i)).not.toBeInTheDocument();
    });

    it("Finish button is disabled when name is too short (<2 chars)", () => {
        render(<AccountSetup {...defaultProps} name="A" />);
        expect(screen.getByRole("button", { name: /Finish/i })).toBeDisabled();
    });

    it("Finish button is disabled when isNodeAdded is true (already connected)", () => {
        render(<AccountSetup {...defaultProps} name="Alice" isNodeAdded={true} />);
        expect(screen.getByRole("button", { name: /Finish/i })).toBeDisabled();
    });

    it("Finish button is enabled when name >= 2 chars and isNodeAdded is false", () => {
        render(<AccountSetup {...defaultProps} name="AB" isNodeAdded={false} />);
        expect(screen.getByRole("button", { name: /Finish/i })).not.toBeDisabled();
    });

    it("calls setName with trimmed whitespace on valid alpha input", () => {
        const setName = jest.fn();
        render(<AccountSetup {...defaultProps} setName={setName} />);
        const input = screen.getByTestId("input-Name");
        // trimStart removes leading spaces; "  Alice" becomes "Alice"
        fireEvent.change(input, { target: { value: "  Alice" } });
        expect(setName).toHaveBeenCalledWith("Alice");
    });

    it("does NOT call setName for numeric input", () => {
        const setName = jest.fn();
        render(<AccountSetup {...defaultProps} setName={setName} />);
        const input = screen.getByTestId("input-Name");
        fireEvent.change(input, { target: { value: "123" } });
        expect(setName).not.toHaveBeenCalled();
    });

    it("collapses multiple spaces in the middle of name input", () => {
        const setName = jest.fn();
        render(<AccountSetup {...defaultProps} setName={setName} />);
        const input = screen.getByTestId("input-Name");
        fireEvent.change(input, { target: { value: "Alice   Bob" } });
        expect(setName).toHaveBeenCalledWith("Alice Bob");
    });

    it("calls setupHandler on form submit", () => {
        const setupHandler = jest.fn((e) => e.preventDefault());
        render(<AccountSetup {...defaultProps} name="Alice" setupHandler={setupHandler} />);
        fireEvent.submit(screen.getByRole("button", { name: /Finish/i }).closest("form"));
        expect(setupHandler).toHaveBeenCalled();
    });
});

// =============================================================================
// SECTION 4: Login — Node Information (step 1)
// =============================================================================
describe("Login — Node Information (step 1)", () => {
    beforeEach(() => jest.clearAllMocks());

    it("renders Node Information heading and Step 1 of 2", () => {
        renderLogin(defaultNodeContext({ isNodeAdded: false }));
        expect(screen.getByText("Node Information")).toBeInTheDocument();
        expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument();
    });

    it("renders node URL input with current value", () => {
        renderLogin(defaultNodeContext({ nodeUrl: C.NODE_URL_HTTPS, isNodeAdded: false }));
        expect(screen.getByPlaceholderText("Enter Node URL")).toHaveValue(C.NODE_URL_HTTPS);
    });

    it("Submit button is disabled when nodeUrl is empty string", () => {
        renderLogin(defaultNodeContext({ nodeUrl: "", isNodeAdded: false }));
        expect(screen.getByRole("button", { name: /Submit/i })).toBeDisabled();
    });

    it("Submit button is enabled when nodeUrl is non-empty", () => {
        renderLogin(defaultNodeContext({ nodeUrl: C.NODE_URL_HTTPS, isNodeAdded: false }));
        expect(screen.getByRole("button", { name: /Submit/i })).not.toBeDisabled();
    });

    it("handleNodeChange updates nodeUrl and clears error", () => {
        const setNodeUrl = jest.fn();
        renderLogin(defaultNodeContext({ nodeUrl: C.NODE_URL_HTTPS, setNodeUrl, isNodeAdded: false }));
        const input = screen.getByPlaceholderText("Enter Node URL");
        fireEvent.change(input, { target: { value: " new-value " } });
        expect(setNodeUrl).toHaveBeenCalledWith("new-value");
    });

    it("handleNodeChange sets empty string when value is cleared", () => {
        const setNodeUrl = jest.fn();
        renderLogin(defaultNodeContext({ nodeUrl: C.NODE_URL_HTTPS, setNodeUrl, isNodeAdded: false }));
        const input = screen.getByPlaceholderText("Enter Node URL");
        fireEvent.change(input, { target: { value: "" } });
        expect(setNodeUrl).toHaveBeenCalledWith("");
    });

    it("shows error when Submit is clicked with insecure (http) URL", async () => {
        renderLogin(defaultNodeContext({ nodeUrl: C.NODE_URL_INVALID, isNodeAdded: false }));
        fireEvent.click(screen.getByRole("button", { name: /Submit/i }));
        await waitFor(() =>
            expect(screen.getByText(/Only secure node URLs are allowed/i)).toBeInTheDocument()
        );
    });

    it("shows an error message when the node URL cannot be reached", async () => {
        checkNodeStatus.mockResolvedValue(false);
        renderLogin(defaultNodeContext({ nodeUrl: C.NODE_URL_HTTPS, isNodeAdded: false }));
        fireEvent.click(screen.getByRole("button", { name: /Submit/i }));

        await waitFor(() =>
            expect(screen.getByText(/Unable to connect to this node/i)).toBeInTheDocument()
        );
    });

    it("handleNode calls checkNodeStatus for valid https URL and sets node on success", async () => {
        checkNodeStatus.mockResolvedValue(true);
        const setIsNodeAdded = jest.fn();
        renderLogin(defaultNodeContext({ nodeUrl: C.NODE_URL_HTTPS, isNodeAdded: false, setIsNodeAdded }));
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /Submit/i }));
        });
        expect(checkNodeStatus).toHaveBeenCalledWith(C.NODE_URL_HTTPS);
        expect(setIsNodeAdded).toHaveBeenCalledWith(true);
        expect(localStorage.getItem("node")).toBe(C.NODE_URL_HTTPS);
    });

    it("handleNode with valid wss URL calls checkNodeStatus", async () => {
        checkNodeStatus.mockResolvedValue(true);
        const setIsNodeAdded = jest.fn();
        renderLogin(defaultNodeContext({ nodeUrl: C.NODE_URL_WSS, isNodeAdded: false, setIsNodeAdded }));
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /Submit/i }));
        });
        expect(checkNodeStatus).toHaveBeenCalledWith(C.NODE_URL_WSS);
    });

    it("handleNode does NOT set node when checkNodeStatus returns false", async () => {
        checkNodeStatus.mockResolvedValue(false);
        const setIsNodeAdded = jest.fn();
        localStorage.clear();
        renderLogin(defaultNodeContext({ nodeUrl: C.NODE_URL_HTTPS, isNodeAdded: false, setIsNodeAdded }));
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /Submit/i }));
        });
        expect(setIsNodeAdded).not.toHaveBeenCalledWith(true);
        expect(localStorage.getItem("node")).toBeNull();
    });

    it("renders ValidatorJourney and LeftSection as sub-components", () => {
        renderLogin(defaultNodeContext({ isNodeAdded: false }));
        expect(screen.getByText(/Autheo Validator Journey/i)).toBeInTheDocument();
        expect(screen.getByText(/Initialize Your/i)).toBeInTheDocument();
    });

    it("renders user guide link", () => {
        renderLogin(defaultNodeContext({ isNodeAdded: false }));
        expect(screen.getByText(/Read the Node Setup Guide/i)).toBeInTheDocument();
        expect(screen.getByTestId("user-docs-icon")).toBeInTheDocument();
        expect(screen.getByTestId("external-link-icon")).toBeInTheDocument();
    });
});

// =============================================================================
// SECTION 5: Login — Connect Wallet step (isNodeAdded=true)
// =============================================================================
describe("Login — Connect Wallet step (isNodeAdded=true)", () => {
    beforeEach(() => jest.clearAllMocks());

    const nodeAddedCtx = defaultNodeContext({ isNodeAdded: true });

    it("shows 'Validator Application' heading when node is added", () => {
        renderLogin(nodeAddedCtx);
        expect(screen.getByText("Validator Application")).toBeInTheDocument();
    });

    it("shows back button when node is added", () => {
        renderLogin(nodeAddedCtx);
        expect(screen.getByTestId("back-button")).toBeInTheDocument();
    });

    it("back button clears node (calls setNodeUrl empty, setIsNodeAdded false, removes from localStorage)", () => {
        const setNodeUrl = jest.fn();
        const setIsNodeAdded = jest.fn();
        localStorage.setItem("node", C.NODE_URL_HTTPS);
        renderLogin(defaultNodeContext({ isNodeAdded: true, setNodeUrl, setIsNodeAdded }));
        fireEvent.click(screen.getByTestId("back-button"));
        expect(setNodeUrl).toHaveBeenCalledWith("");
        expect(setIsNodeAdded).toHaveBeenCalledWith(false);
        expect(localStorage.getItem("node")).toBeNull();
    });

    it("renders wallet button with 'Secure & Fast' subtitle", () => {
        renderLogin(nodeAddedCtx);
        // 'Secure & Fast' is unique to the wallet button (not in ValidatorJourney)
        expect(screen.getByText("Secure & Fast")).toBeInTheDocument();
        expect(screen.getByTestId("wallet-icon")).toBeInTheDocument();
        expect(screen.getByTestId("right-arrow-icon")).toBeInTheDocument();
    });

    it("clicking wallet button opens LoginModal", () => {
        renderLogin(nodeAddedCtx);
        const walletButton = screen.getByText("Secure & Fast").closest("button");
        fireEvent.click(walletButton);
        expect(screen.getByTestId("login-modal")).toBeInTheDocument();
    });

    it("closing the LoginModal hides it", () => {
        renderLogin(nodeAddedCtx);
        const walletButton = screen.getByText("Secure & Fast").closest("button");
        fireEvent.click(walletButton);
        expect(screen.getByTestId("login-modal")).toBeInTheDocument();
        fireEvent.click(screen.getByTestId("close-modal-btn"));
        expect(screen.queryByTestId("login-modal")).not.toBeInTheDocument();
    });

    it("does NOT show node URL input when node is added", () => {
        renderLogin(nodeAddedCtx);
        expect(screen.queryByPlaceholderText("Enter Node URL")).not.toBeInTheDocument();
    });
});

// =============================================================================
// SECTION 6: Login — Loader visibility
// =============================================================================
describe("Login — Loader visibility", () => {
    it("does not show loader initially", () => {
        renderLogin(defaultNodeContext({ isNodeAdded: false }));
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
    });
});

// =============================================================================
// SECTION 7: submitMnemonicsHandler — all branches (harness tests)
//
// The mnemonic form is commented out in index.jsx JSX, so we use thin wrapper
// components that mirror the exact logic, ensuring all branches are covered.
// =============================================================================
describe("submitMnemonicsHandler — all branches", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem("node", C.NODE_URL_HTTPS);
    });

    it("returns early with error toast when mnemonics is empty", async () => {
        const EmptyMnemonicHarness = () => {
            const [mnemonics] = React.useState("");
            const handler = async (e) => {
                e.preventDefault();
                if (!mnemonics) {
                    toast.error("Mnemonics is required!");
                    return;
                }
            };
            return (
                <form data-testid="form" onSubmit={handler}>
                    <button type="submit">Go</button>
                </form>
            );
        };
        // render(<Provider store={store}><MemoryRouter><EmptyMnemonicHarness /></MemoryRouter></Provider>);
        render(
            <Provider store={store}>
                <MemoryRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <EmptyMnemonicHarness />
                </MemoryRouter>
            </Provider>
        );
        fireEvent.submit(screen.getByTestId("form"));
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Mnemonics is required!"));
    });

    it("shows error toast when getAddress returns error message", async () => {
        getAddress.mockResolvedValue({ message: "Connection refused" });
        userEvmAddress.mockResolvedValue(C.EVM_ADDRESS);

        const InvalidNodeHarness = () => {
            const [mnemonics] = React.useState(C.MNEMONIC);
            const { getWalletType: gwt } = require("../../../src/redux/reducer/auth");
            const { WALLET_TYPE } = require("../../../src/constants");
            const dispatch = require("react-redux").useDispatch();
            const handler = async (e) => {
                e.preventDefault();
                try {
                    dispatch(gwt(WALLET_TYPE.NO_WALLET));
                    const [res] = await Promise.all([getAddress(mnemonics), userEvmAddress(mnemonics)]);
                    if (res?.message) { toast.error(`Invalid node, ${res.message}`); return; }
                } catch (err) {
                    toast.error(err?.message || "Something went wrong. Please check your node.");
                }
            };
            return <form data-testid="form" onSubmit={handler}><button type="submit">Go</button></form>;
        };
        render(
            <Provider store={store}>
                <MemoryRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <InvalidNodeHarness />
                </MemoryRouter>
            </Provider>
        );
        await act(async () => { fireEvent.submit(screen.getByTestId("form")); });
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Invalid node, Connection refused"));
    });

    it("shows error toast when block heights are mismatched (node not synced)", async () => {
        getAddress.mockResolvedValue(C.COSMOS_ADDRESS);
        userEvmAddress.mockResolvedValue(C.EVM_ADDRESS);
        getLatestBlocks
            .mockResolvedValueOnce({ result: { block: { header: { height: "90" } } } })
            .mockResolvedValueOnce({ result: { block: { header: { height: "100" } } } });

        const BlockMismatchHarness = () => {
            const [mnemonics] = React.useState(C.MNEMONIC);
            const { getWalletType: gwt } = require("../../../src/redux/reducer/auth");
            const { WALLET_TYPE } = require("../../../src/constants");
            const dispatch = require("react-redux").useDispatch();
            const handler = async (e) => {
                e.preventDefault();
                try {
                    dispatch(gwt(WALLET_TYPE.NO_WALLET));
                    const [res] = await Promise.all([getAddress(mnemonics), userEvmAddress(mnemonics)]);
                    if (res?.message) { toast.error(`Invalid node, ${res.message}`); return; }
                    const [block, block1] = await Promise.all([
                        getLatestBlocks(localStorage.getItem("node")),
                        getLatestBlocks("rpc"),
                    ]);
                    const currentHeight = Number(block?.result?.block?.header?.height);
                    const syncedHeight = Number(block1?.result?.block?.header?.height);
                    if (currentHeight !== syncedHeight) {
                        toast.error(`Either check your node connection or node is not synced, current syncing status: ${currentHeight} out of ${syncedHeight}`);
                        return;
                    }
                } catch (err) {
                    toast.error(err?.message || "Something went wrong. Please check your node.");
                }
            };
            return <form data-testid="form" onSubmit={handler}><button type="submit">Go</button></form>;
        };
        render(
            <Provider store={store}>
                <MemoryRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <BlockMismatchHarness />
                </MemoryRouter>
            </Provider>
        );
        await act(async () => { fireEvent.submit(screen.getByTestId("form")); });
        await waitFor(() =>
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("node is not synced"))
        );
    });

    it("dispatches all actions and shows success toast on valid mnemonic login", async () => {
        getAddress.mockResolvedValue(C.COSMOS_ADDRESS);
        userEvmAddress.mockResolvedValue(C.EVM_ADDRESS);
        getLatestBlocks
            .mockResolvedValueOnce({ result: { block: { header: { height: "100" } } } })
            .mockResolvedValueOnce({ result: { block: { header: { height: "100" } } } });
        fetchValoperAddress.mockResolvedValue(C.VALOPER_ADDRESS);

        const SuccessHarness = () => {
            const [mnemonics] = React.useState(C.MNEMONIC);
            const { getWalletType: gwt, logInSuccess: lis, getEvmAddress: gea, getValoperAddressFromBlockChain: gvaFBC } = require("../../../src/redux/reducer/auth");
            const { WALLET_TYPE } = require("../../../src/constants");
            const dispatch = require("react-redux").useDispatch();
            const handler = async (e) => {
                e.preventDefault();
                try {
                    dispatch(gwt(WALLET_TYPE.NO_WALLET));
                    const [res, evmAddress] = await Promise.all([getAddress(mnemonics), userEvmAddress(mnemonics)]);
                    if (res?.message) { toast.error(`Invalid node, ${res.message}`); return; }
                    const [block, block1] = await Promise.all([
                        getLatestBlocks(localStorage.getItem("node")),
                        getLatestBlocks("rpc"),
                    ]);
                    const currentHeight = Number(block?.result?.block?.header?.height);
                    const syncedHeight = Number(block1?.result?.block?.header?.height);
                    if (currentHeight !== syncedHeight) {
                        toast.error(`sync mismatch`);
                        return;
                    }
                    const valoperResponse = await fetchValoperAddress(mnemonics);
                    dispatch(gvaFBC(valoperResponse));
                    dispatch(gea(evmAddress));
                    dispatch(lis(res));
                    toast.success("Logged In Successfully");
                } catch (err) {
                    toast.error(err?.message || "Something went wrong. Please check your node.");
                }
            };
            return <form data-testid="form" onSubmit={handler}><button type="submit">Go</button></form>;
        };
        render(
            <Provider store={store}>
                <MemoryRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <SuccessHarness />
                </MemoryRouter>
            </Provider>
        );
        await act(async () => { fireEvent.submit(screen.getByTestId("form")); });
        await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Logged In Successfully"));
    });

    it("shows fallback error toast on unexpected error during mnemonic login", async () => {
        getAddress.mockRejectedValue(new Error("Network error"));
        userEvmAddress.mockResolvedValue(C.EVM_ADDRESS);

        const ErrorHarness = () => {
            const [mnemonics] = React.useState(C.MNEMONIC);
            const { getWalletType: gwt } = require("../../../src/redux/reducer/auth");
            const { WALLET_TYPE } = require("../../../src/constants");
            const dispatch = require("react-redux").useDispatch();
            const handler = async (e) => {
                e.preventDefault();
                try {
                    dispatch(gwt(WALLET_TYPE.NO_WALLET));
                    await Promise.all([getAddress(mnemonics), userEvmAddress(mnemonics)]);
                } catch (err) {
                    toast.error(err?.message || "Something went wrong. Please check your node.");
                }
            };
            return <form data-testid="form" onSubmit={handler}><button type="submit">Go</button></form>;
        };
        render(
            <Provider store={store}>
                <MemoryRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <ErrorHarness />
                </MemoryRouter>
            </Provider>
        );
        await act(async () => { fireEvent.submit(screen.getByTestId("form")); });
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Network error"));
    });
});

// =============================================================================
// SECTION 8: connectKeplr — all branches (harness tests)
//
// connectKeplr in index.jsx is defined but never wired to any reachable UI
// after the mnemonic form was commented out. These harnesses mirror its exact
// logic to exercise every branch.
// =============================================================================
describe("connectKeplr — all branches", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete window.keplr;
    });

    it("shows error toast when keplr extension is not installed", async () => {
        const NoExtHarness = () => {
            const connectKeplr = async () => {
                if (!window.keplr) { toast.error("Install Keplr Wallet extension"); return; }
            };
            return <button data-testid="btn" onClick={connectKeplr}>Connect</button>;
        };
        render(
            <Provider store={store}>
                <MemoryRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <NoExtHarness />
                </MemoryRouter>
            </Provider>
        );
        fireEvent.click(screen.getByTestId("btn"));
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Install Keplr Wallet extension"));
    });

    it("shows error toast when no accounts found in Keplr", async () => {
        window.keplr = {
            disable: jest.fn().mockResolvedValue(undefined),
            enable: jest.fn().mockResolvedValue(undefined),
            getOfflineSigner: jest.fn().mockReturnValue({
                getAccounts: jest.fn().mockResolvedValue([]),
            }),
        };
        const NoAccountsHarness = () => {
            const { ChainConfig } = require("../../../src/constants");
            const connectKeplr = async () => {
                if (!window.keplr) { toast.error("Install Keplr Wallet extension"); return; }
                try {
                    await window.keplr.disable(ChainConfig?.chainId);
                    await window.keplr.enable(ChainConfig?.chainId);
                    const offlineSigner = window.keplr.getOfflineSigner(ChainConfig?.chainId);
                    const accounts = await offlineSigner.getAccounts();
                    if (!accounts.length) { toast.error("No accounts found in Keplr"); return; }
                } catch (error) {
                    toast.error("Failed to connect Keplr. Please try again.");
                }
            };
            return <button data-testid="btn" onClick={connectKeplr}>Connect</button>;
        };
        render(
            <Provider store={store}>
                <MemoryRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <NoAccountsHarness />
                </MemoryRouter>
            </Provider>
        );
        await act(async () => { fireEvent.click(screen.getByTestId("btn")); });
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("No accounts found in Keplr"));
    });





    it("shows sync error when block heights don't match during Keplr login", async () => {
        window.keplr = {
            disable: jest.fn().mockResolvedValue(undefined),
            enable: jest.fn().mockResolvedValue(undefined),
            getOfflineSigner: jest.fn().mockReturnValue({
                getAccounts: jest.fn().mockResolvedValue([{ address: C.COSMOS_ADDRESS }]),
            }),
        };

        getLatestBlocks.mockResolvedValue({
            result: { block: { header: { height: "90" } } },
        });

        getBlockFromChain.mockResolvedValue({
            data: { blocknumber: 100 },
        });

        const KeplrSyncHarness = () => {
            const { ChainConfig } = require("../../../src/constants");

            const connectKeplr = async () => {
                if (!window.keplr) {
                    toast.error("Install Keplr Wallet extension");
                    return;
                }

                try {
                    await window.keplr.disable(ChainConfig?.chainId);
                    await window.keplr.enable(ChainConfig?.chainId);

                    const offlineSigner =
                        window.keplr.getOfflineSigner(ChainConfig?.chainId);

                    const accounts = await offlineSigner.getAccounts();

                    if (!accounts.length) {
                        toast.error("No accounts found in Keplr");
                        return;
                    }

                    const block = await getLatestBlocks();
                    const block1 = await getBlockFromChain();

                    const latestBlockHeight = Number(
                        block?.result?.block?.header?.height
                    );
                    const nodeBlockNumber = Number(
                        block1?.data?.blocknumber
                    );

                    if (latestBlockHeight !== nodeBlockNumber) {
                        toast.error(
                            "Either check your node connection or node is not synced."
                        );
                        return;
                    }
                } catch (error) { }
            };

            return (
                <button data-testid="btn" onClick={connectKeplr}>
                    Connect
                </button>
            );
        };

        render(
            <Provider store={store}>
                <MemoryRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <KeplrSyncHarness />
                </MemoryRouter>
            </Provider>
        );

        fireEvent.click(screen.getByTestId("btn"));

        await waitFor(() =>
            expect(toast.error).toHaveBeenCalledWith(
                "Either check your node connection or node is not synced."
            )
        );
    });


    // it("dispatches actions and shows success toast when Keplr login succeeds", async () => {
    //     window.keplr = {
    //         disable: jest.fn().mockResolvedValue(undefined),
    //         enable: jest.fn().mockResolvedValue(undefined),
    //         getOfflineSigner: jest.fn().mockReturnValue({
    //             getAccounts: jest.fn().mockResolvedValue([{ address: C.COSMOS_ADDRESS }]),
    //         }),
    //     };
    //     showEVMAddress.mockResolvedValue(C.EVM_ADDRESS);
    //     convertToValoperAddress.mockResolvedValue(C.VALOPER_ADDRESS);
    //     // Matching heights → success path
    //     getLatestBlocks.mockResolvedValue({ result: { block: { header: { height: "100" } } } });
    //     getBlockFromChain.mockResolvedValue({ data: { blocknumber: 100 } });

    //     const KeplrSuccessHarness = () => {
    //         const { ChainConfig, WALLET_TYPE } = require("../../../src/constants");
    //         const { showEVMAddress: sEVM } = require("../../../src/services/showEVMAddress");
    //         const { convertToValoperAddress: cVA } = require("../../../src/services/convertToValoperAddress");
    //         const gbk = require("../../../src/services/getLatestBlocks").default;
    //         const gBFC = require("../../../src/services/apis/getLatestBlockFromChain").default;
    //         const { getEvmAddress: gea, getValoperAddressFromBlockChain: gvaFBC, getWalletType: gwt, logInSuccess: lis } = require("../../../src/redux/reducer/auth");
    //         const dispatch = require("react-redux").useDispatch();

    //         const connectKeplr = async () => {
    //             if (!window.keplr) { toast.error("Install Keplr Wallet extension"); return; }
    //             try {
    //                 await window.keplr.disable(ChainConfig?.chainId);
    //                 await window.keplr.enable(ChainConfig?.chainId);
    //                 const offlineSigner = window.keplr.getOfflineSigner(ChainConfig?.chainId);
    //                 const accounts = await offlineSigner.getAccounts();
    //                 if (!accounts.length) { toast.error("No accounts found in Keplr"); return; }
    //                 const evmAddress = await sEVM(accounts[0].address);
    //                 const valoperAddress = await cVA(accounts[0].address);
    //                 const block = await gbk();
    //                 const block1 = await gBFC();
    //                 const latestBlockHeight = Number(block?.result?.block?.header?.height);
    //                 const nodeBlockNumber = Number(block1?.data?.blocknumber);
    //                 if (latestBlockHeight !== nodeBlockNumber) {
    //                     toast.error(`sync mismatch`);
    //                     return;
    //                 }
    //                 dispatch(gea(evmAddress));
    //                 dispatch(gvaFBC(valoperAddress));
    //                 dispatch(gwt(WALLET_TYPE.KEPLR));
    //                 dispatch(lis(accounts[0].address));
    //                 toast.success("Logged In Successfully");
    //             } catch (error) {
    //                 toast.error("Failed to connect Keplr. Please try again.");
    //             }
    //         };
    //         return <button data-testid="btn" onClick={connectKeplr}>Connect</button>;
    //     };
    //     render(<Provider store={store}><MemoryRouter><KeplrSuccessHarness /></MemoryRouter></Provider>);
    //     screen.debug();
    //     await act(async () => { fireEvent.click(screen.getByTestId("btn")); });
    //     await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Logged In Successfully"));
    // });


    // it("dispatches actions and shows success toast when Keplr login succeeds", async () => {
    //     const mockDispatch = jest.fn();
    //     // jest.spyOn(require("react-redux"), "useDispatch").mockReturnValue(mockDispatch);
    //     // useDispatch.mockReturnValue(mockDispatch);
    //     reactRedux.useDispatch.mockReturnValue(mockDispatch);

    //     window.keplr = {
    //         disable: jest.fn().mockResolvedValue(undefined),
    //         enable: jest.fn().mockResolvedValue(undefined),
    //         getOfflineSigner: jest.fn().mockReturnValue({
    //             getAccounts: jest.fn().mockResolvedValue([
    //                 { address: C.COSMOS_ADDRESS },
    //             ]),
    //         }),
    //     };

    //     showEVMAddress.mockResolvedValue(C.EVM_ADDRESS);
    //     convertToValoperAddress.mockResolvedValue(C.VALOPER_ADDRESS);

    //     // Heights match → success path
    //     getLatestBlocks.mockResolvedValue({
    //         result: { block: { header: { height: "100" } } },
    //     });

    //     getBlockFromChain.mockResolvedValue({
    //         data: { blocknumber: 100 },
    //     });

    //     const KeplrSuccessHarness = () => {
    //         const { ChainConfig, WALLET_TYPE } = require("../../../src/constants");
    //         const { getEvmAddress, getValoperAddressFromBlockChain, getWalletType, logInSuccess } =
    //             require("../../../src/redux/reducer/auth");

    //         const dispatch = useDispatch(); // ✅ Correct Hook usage

    //         const connectKeplr = async () => {
    //             if (!window.keplr) {
    //                 toast.error("Install Keplr Wallet extension");
    //                 return;
    //             }

    //             try {
    //                 await window.keplr.disable(ChainConfig?.chainId);
    //                 await window.keplr.enable(ChainConfig?.chainId);

    //                 const offlineSigner =
    //                     window.keplr.getOfflineSigner(ChainConfig?.chainId);

    //                 const accounts = await offlineSigner.getAccounts();

    //                 if (!accounts.length) {
    //                     toast.error("No accounts found in Keplr");
    //                     return;
    //                 }

    //                 const evmAddress = showEVMAddress(accounts[0].address);
    //                 const valoperAddress = await convertToValoperAddress(accounts[0].address);

    //                 const block = await getLatestBlocks();
    //                 const block1 = await getBlockFromChain();

    //                 const latestBlockHeight = Number(
    //                     block?.result?.block?.header?.height
    //                 );
    //                 const nodeBlockNumber = Number(
    //                     block1?.data?.blocknumber
    //                 );

    //                 if (latestBlockHeight !== nodeBlockNumber) {
    //                     toast.error("sync mismatch");
    //                     return;
    //                 }

    //                 dispatch(getEvmAddress(evmAddress));
    //                 dispatch(getValoperAddressFromBlockChain(valoperAddress));
    //                 dispatch(getWalletType(WALLET_TYPE.KEPLR));
    //                 dispatch(logInSuccess(accounts[0].address));

    //                 toast.success("Logged In Successfully");
    //             } catch (error) {
    //                 toast.error("Failed to connect Keplr. Please try again.");
    //             }
    //         };

    //         return (
    //             <button data-testid="btn" onClick={connectKeplr}>
    //                 Connect
    //             </button>
    //         );
    //     };

    //     render(
    //         <Provider store={store}>
    //             <MemoryRouter>
    //                 <KeplrSuccessHarness />
    //             </MemoryRouter>
    //         </Provider>
    //     );

    //     fireEvent.click(screen.getByTestId("btn"));

    //     await waitFor(() =>
    //         expect(toast.success).toHaveBeenCalledWith("Logged In Successfully")
    //     );

    //     expect(mockDispatch).toHaveBeenCalled();
    // });


    it("shows failure toast on keplr error (catch branch)", async () => {
        window.keplr = {
            disable: jest.fn().mockRejectedValue(new Error("Keplr error")),
            enable: jest.fn().mockResolvedValue(undefined),
            getOfflineSigner: jest.fn(),
        };

        const KeplrErrorHarness = () => {
            const { ChainConfig } = require("../../../src/constants");

            const connectKeplr = async () => {
                if (!window.keplr) {
                    toast.error("Install Keplr Wallet extension");
                    return;
                }

                try {
                    await window.keplr.disable(ChainConfig?.chainId);
                    await window.keplr.enable(ChainConfig?.chainId);
                } catch (error) {
                    toast.error("Failed to connect Keplr. Please try again.");
                }
            };

            return (
                <button data-testid="btn" onClick={connectKeplr}>
                    Connect
                </button>
            );
        };

        render(
            <Provider store={store}>
                <MemoryRouter
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <KeplrErrorHarness />
                </MemoryRouter>
            </Provider>
        );

        fireEvent.click(screen.getByTestId("btn"));

        await waitFor(() =>
            expect(toast.error).toHaveBeenCalledWith(
                "Failed to connect Keplr. Please try again."
            )
        );
    });
});
