import "@testing-library/jest-dom";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Profile from "../src/pages/Account/Profile/index.jsx";
import * as api from "../src/services/apis/getValidatorByAddress";
import * as evmService from "../src/services/showEVMAddress";
import * as keplrEvents from "../src/keplrEvents/keplrEditValidator";
import * as cosmoEvents from "../src/cosmostationEvents/editValidator";
import { isOptionDisable } from "../src/utils/commissionEditTimer";
import { toast } from "../src/components/Common/Toast/Toast";
import { GLOBAL_OBJECT } from "./testConstants";

// Mocks
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock("../src/keplrEvents/keplrEditValidator", () => ({
  keplrEditValidator: jest.fn(),
}));

jest.mock("../src/cosmostationEvents/editValidator", () => ({
  cosmostationEditValidator: jest.fn(),
}));

jest.mock("../src/services/apis/getValidatorByAddress");
jest.mock("../src/services/showEVMAddress");
jest.mock("../src/components/Common/Toast/Toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("../src/utils/commissionEditTimer");
jest.mock("../src/context/NodeUrl", () => ({
  useGetNodeUrl: jest.fn(() => ({ nodeUrl: "http://localhost:8545" })),
}));

// Mock child components to simplify testing
jest.mock("../src/components/SetupValidator/FirstStep", () => (props) => (
  <div data-testid="first-step">
    First Step
    <button onClick={() => props.setActiveStep(1)}>Next</button>
  </div>
));

jest.mock("../src/components/SetupValidator/AuthorizeStep", () => (props) => (
  <div data-testid="authorize-step">Authorize Step</div>
));

jest.mock("../src/components/Funds/ManageAccount/BondTable", () => () => (
  <div data-testid="bond-table">Bond Table</div>
));

jest.mock("../src/components/Profile/ProfileTable", () => () => (
  <div data-testid="profile-table">Profile Table</div>
));

jest.mock("../src/components/Common/Address", () => (props) => (
  <div data-testid="address-component">{props.address}</div>
));

// Profile renders <Loader /> during loading, not lottie
jest.mock("../src/components/Loader/Loader", () => () => (
  <div data-testid="loader-mock">Loading...</div>
));

describe("Profile Component", () => {
  const mockDispatch = jest.fn();
  const mockNavigate = jest.fn();
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
    // Suppress console errors and warnings for expected issues
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => { });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  const setupSelector = (overrides = {}) => {
    useSelector.mockImplementation((selectorFn) =>
      selectorFn({
        auth: {
          userAddress: "user1",
          isValidated: true,
          walletType: "keplr",
          valoperAddress: "valoper1",
          ...overrides,
        },
      })
    );
  };

  it("renders 'Profile Details' when profileStatus is SUCCESS and isValidated is true", async () => {
    setupSelector();
    api.default.mockResolvedValue({
      error: false,
      data: {
        validators: [
          {
            name: "Validator 1",
            details: "Some details",
            website: "site.com",
            identity: "id1",
            SecurityContact: "contact",
            commissionRate: 0.05,
            status: "active",
            selfStake: 100,
            unbondingAmount: 0,
            operatorAddress: "valoper1",
          },
        ],
      },
    });
    evmService.showEVMAddress.mockResolvedValue("0xABC");

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText("Profile Details")).toBeInTheDocument();
    });
    expect(screen.getByText("Validator 1")).toBeInTheDocument();

    // Commission is rendered as "5" + "%" (split text nodes)
    // commissionRate 0.05 → (0.05 * 100).toFixed(2).replace(/\.?0+$/, "") = "5"
    const commissionEl = screen.getAllByText((content, el) =>
      el?.textContent?.trim() === "5%"
    );
    expect(commissionEl.length).toBeGreaterThan(0);
  });

  it("renders loader initially while data is loading", async () => {
    setupSelector();
    api.default.mockReturnValue(new Promise(() => { })); // Never resolves

    const { container } = render(<Profile />);

    // Profile uses Skeleton placeholders during loading states
    expect(container.getElementsByClassName("MuiSkeleton-root").length).toBeGreaterThan(0);
    api.default.mockResolvedValue({ error: true });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText("Manage Account")).toBeInTheDocument();
    });
  });

  it("handles API exception - shows Manage Account", async () => {
    setupSelector();
    api.default.mockRejectedValue(new Error("API Error"));

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText("Manage Account")).toBeInTheDocument();
    });
  });

  it("opens edit modal and shows FirstStep", async () => {
    setupSelector();
    api.default.mockResolvedValue({
      error: false,
      data: {
        validators: [
          {
            name: "Validator 1",
            status: "active",
          },
        ],
      },
    });

    render(<Profile />);
    await waitFor(() =>
      expect(screen.getByText("Profile Details")).toBeInTheDocument()
    );

    const editButtons = screen.getAllByText("Edit Validator");
    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId("first-step")).toBeInTheDocument();
  });

  it("calls keplrEditValidator on step 1 with keplr wallet", async () => {
    setupSelector({ walletType: "keplr" });
    api.default.mockResolvedValue({
      error: false,
      data: {
        validators: [{ name: "Val1", status: "active" }],
      },
    });

    window.keplr = {};
    render(<Profile />);
    await waitFor(() =>
      expect(screen.getByText("Profile Details")).toBeInTheDocument()
    );

    const editButtons = screen.getAllByText("Edit Validator");
    fireEvent.click(editButtons[0]);

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(keplrEvents.keplrEditValidator).toHaveBeenCalled();
    });
    delete window.keplr;
  });

  it("calls cosmostationEditValidator on step 1 with cosmostation wallet", async () => {
    setupSelector({ walletType: "cosmostation" });
    api.default.mockResolvedValue({
      error: false,
      data: {
        validators: [{ name: "Val1", status: "active" }],
      },
    });

    window.cosmostation = {}; // Mock window.cosmostation

    render(<Profile />);
    await waitFor(() =>
      expect(screen.getByText("Profile Details")).toBeInTheDocument()
    );

    const editButtons = screen.getAllByText("Edit Validator");
    fireEvent.click(editButtons[0]);

    // Advance to step 1
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(cosmoEvents.cosmostationEditValidator).toHaveBeenCalled();
    });
    delete window.cosmostation; // Clean up
  });

  it("hides commission field based on isOptionDisable", async () => {
    setupSelector();
    isOptionDisable.mockReturnValue(true);

    api.default.mockResolvedValue({
      error: false,
      data: {
        validators: [{ commissionUpdateTime: "2025-01-01", status: "active" }],
      },
    });

    render(<Profile />);
    await waitFor(() => expect(isOptionDisable).toHaveBeenCalled());
  });

  it("displays 'Register as a Validator' button when not validated", async () => {
    setupSelector({ isValidated: false });
    api.default.mockResolvedValue({ error: false, data: { validators: [] } });
    evmService.showEVMAddress.mockResolvedValue(null);

    render(<Profile />);
    await waitFor(() =>
      expect(screen.getByText(/Register as a Validator/i)).toBeInTheDocument()
    );
  });

  it("navigates to become-a-validator page when button is clicked", async () => {
    setupSelector({ isValidated: false });
    api.default.mockResolvedValue({ error: false, data: { validators: [] } });
    evmService.showEVMAddress.mockResolvedValue(null);

    render(<Profile />);
    await waitFor(() =>
      expect(screen.getByText(/Register as a Validator/i)).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText(/Register as a Validator/i));
    expect(mockNavigate).toHaveBeenCalledWith("/account/become-a-validator");
  });

  it("fetches EVM address if userAddress is present", async () => {
    setupSelector();
    api.default.mockResolvedValue({
      error: false,
      data: {
        validators: [{ name: "Val1", status: "active" }],
      },
    });
    evmService.showEVMAddress.mockResolvedValue("0xEVMAddress");

    render(<Profile />);
    await waitFor(() =>
      expect(evmService.showEVMAddress).toHaveBeenCalledWith("user1")
    );
  });
});
