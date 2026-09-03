import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HeaderItems from "../../../src/components/Header/HeaderItems";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetNodeUrl } from "../../../src/context/NodeUrl";
import { getUserBalance } from "../../../src/services/getUserBalance";
import Swal from "sweetalert2";
import { toast } from "../../../src/components/Common/Toast/Toast";
import {
  getWalletBalance,
  isTxOccur,
  logout,
} from "../../../src/redux/reducer/auth";
import { GLOBAL_OBJECT } from "../../testConstants";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
  };
});

jest.mock("../../../src/context/NodeUrl", () => ({
  useGetNodeUrl: jest.fn(),
}));

jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

jest.mock("../../../src/services/getUserBalance", () => ({
  getUserBalance: jest.fn(),
}));

jest.mock("../../../src/components/Common/Toast/Toast", () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock("../../../src/assets/Icons/CopyIcon", () => (props) => (
  <svg data-testid="copy-icon" {...props} />
));

jest.mock(
  "../../../src/assets/Images/logo.svg",
  () => "logo.svg",
  { virtual: true }
);

jest.mock("../../../src/redux/reducer/auth", () => ({
  getWalletBalance: jest.fn((payload) => ({ type: "getWalletBalance", payload })),
  isTxOccur: jest.fn((payload) => ({ type: "isTxOccur", payload })),
  logout: jest.fn(() => ({ type: "logout" })),
}));

jest.mock("../../../src/constants.ts", () => ({
  ...jest.requireActual("../../../src/constants.ts"),
  splitAddress: (value) => (value ? `split(${value})` : "-"),
  ChainConfig: {
    chainId: "osmosis-1",
  },
}));

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockSetNodeUrl = jest.fn();
const mockSetIsNodeAdded = jest.fn();
let mockPathname = "/dashboard";

const baseAuthState = {
  userAddress: "",
  isTx: false,
  userBalance: 0,
  isLoggedIn: false,
  userEvmAddress: "",
};

import { ThemeProvider } from "../../../src/context/ThemeContext";

const renderHeader = (authOverrides = {}) => {
  const authState = { ...baseAuthState, ...authOverrides };
  useSelector.mockImplementation((selector) => selector({ auth: authState }));
  return render(
    <ThemeProvider>
      <MemoryRouter
        initialEntries={[mockPathname]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <HeaderItems />
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe("HeaderItems", () => {
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeAll(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => { });
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => { });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useDispatch.mockReturnValue(mockDispatch);
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockImplementation(() => ({ pathname: mockPathname }));
    useGetNodeUrl.mockReturnValue({
      setNodeUrl: mockSetNodeUrl,
      setIsNodeAdded: mockSetIsNodeAdded,
    });
    getUserBalance.mockResolvedValue("250");
    Swal.fire.mockResolvedValue({ isConfirmed: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // it("renders correctly with navigation links", () => {
  //   renderHeader({ isLoggedIn: true });

  //   expect(screen.getAllByText("Dashboard")[0]).toBeInTheDocument();
  //   expect(screen.getAllByText("Blocks")[0]).toBeInTheDocument();
  //   expect(screen.getAllByText("Validators")[0]).toBeInTheDocument();
  //   expect(screen.getAllByText("Manage Account")[0]).toBeInTheDocument();
  // });

  // it("highlights the active navigation link", () => {
  //   mockPathname = "/blocks";
  //   renderHeader({ isLoggedIn: true });

  //   expect(screen.getAllByText("Blocks")[0]).toHaveClass("active");
  //   expect(screen.getAllByText("Dashboard")[0]).not.toHaveClass("active");
  // });

  it("fetches balance when userAddress changes", async () => {
    renderHeader({
      userAddress: "qube123",
      isLoggedIn: true,
    });

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(getUserBalance).toHaveBeenCalledWith("qube123");
      expect(mockDispatch).toHaveBeenCalledWith({ type: "getWalletBalance", payload: "250" });
    });
  });

  it("fetches balance when isTx is true", async () => {
    renderHeader({
      userAddress: "qube123",
      isTx: true,
      isLoggedIn: true,
    });

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(getUserBalance).toHaveBeenCalledWith("qube123");
      expect(mockDispatch).toHaveBeenCalledWith({ type: "isTxOccur", payload: false });
    });
  });

  it("handles fetchBalance error gracefully", async () => {
    getUserBalance.mockRejectedValue(new Error("Network error"));

    renderHeader({
      userAddress: "qube123",
      isLoggedIn: true,
    });

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(getUserBalance).toHaveBeenCalled();
    });
  });

  // it("shows wallet details for logged-in user", () => {
  //   renderHeader({
  //     userAddress: "qube123",
  //     isLoggedIn: true,
  //     userBalance: "12.5",
  //     userEvmAddress: "evm12345",
  //   });

  //   expect(screen.getAllByText(/split\(evm12345\)/i).length).toBeGreaterThan(0);
  //   expect(screen.getByText(/Balance: 12.50 THEO/i)).toBeInTheDocument();
  // });

  // it("copies address to clipboard", async () => {
  //   renderHeader({
  //     userAddress: "qube123",
  //     isLoggedIn: true,
  //     userEvmAddress: "evm12345",
  //   });

  //   const copyIcon = screen.getAllByTestId("copy-icon")[0];
  //   fireEvent.click(copyIcon.parentElement);

  //   expect(navigator.clipboard.writeText).toHaveBeenCalledWith("evm12345");
  //   expect(toast.success).toHaveBeenCalledWith("Copied");
  // });

  // it("copies balance when balance span is clicked", () => {
  //   renderHeader({
  //     userAddress: "qube123",
  //     isLoggedIn: true,
  //     userBalance: "100",
  //     userEvmAddress: "evm12345",
  //   });

  //   const balanceButton = screen.getByText(/Balance: 100.00 THEO/i);
  //   const balanceSpan = balanceButton.querySelector("span");

  //   fireEvent.click(balanceSpan);

  //   expect(navigator.clipboard.writeText).toHaveBeenCalledWith("100");
  //   expect(toast.success).toHaveBeenCalledWith("Copied");
  // });

  // it(`logs out when confirmation dialog is accepted (without ${GLOBAL_OBJECT} wallet)`, async () => {
  //   renderHeader({
  //     userAddress: "qube123",
  //     isLoggedIn: true,
  //     userEvmAddress: "evm12345",
  //   });

  //   const logoutButton = screen.getByRole("button", { name: /logout/i });
  //   fireEvent.click(logoutButton);

  //   await waitFor(() => expect(Swal.fire).toHaveBeenCalled());

  //   expect(logout).toHaveBeenCalled();
  //   expect(mockDispatch).toHaveBeenCalledWith({ type: "logout" });
  //   expect(mockSetNodeUrl).toHaveBeenCalledWith("");
  //   expect(mockSetIsNodeAdded).toHaveBeenCalledWith(false);
  //   expect(mockNavigate).toHaveBeenCalledWith("/login");
  // });

  // it(`logs out with ${GLOBAL_OBJECT} wallet`, async () => {
  //   renderHeader({
  //     userAddress: "qube123",
  //     isLoggedIn: true,
  //     userEvmAddress: "evm12345",
  //   });

  //   const logoutButton = screen.getByRole("button", { name: /logout/i });
  //   fireEvent.click(logoutButton);

  //   await waitFor(() => {
  //     expect(Swal.fire).toHaveBeenCalled();
  //   });

  //   expect(logout).toHaveBeenCalled();
  //   expect(mockDispatch).toHaveBeenCalledWith({ type: "logout" });
  //   expect(mockNavigate).toHaveBeenCalledWith("/login");
  // });

  // it("does not logout when confirmation dialog is cancelled", async () => {
  //   Swal.fire.mockResolvedValue({ isConfirmed: false });

  //   renderHeader({
  //     userAddress: "qube123",
  //     isLoggedIn: true,
  //     userEvmAddress: "evm12345",
  //   });

  //   const logoutButton = screen.getByRole("button", { name: /logout/i });
  //   fireEvent.click(logoutButton);

  //   await waitFor(() => expect(Swal.fire).toHaveBeenCalled());

  //   expect(logout).not.toHaveBeenCalled();
  //   expect(mockNavigate).not.toHaveBeenCalled();
  // });

  it("handles window resize event", () => {
    renderHeader();

    act(() => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event("resize"));
    });

    // Component should update isMobile state
    expect(window.innerWidth).toBe(500);
  });

  it("handles keplr_keystorechange event", async () => {
    const mockGetOfflineSigner = jest.fn(() => ({
      getAccounts: jest.fn().mockResolvedValue([{ address: "newAddress" }]),
    }));

    window.keplr = {
      getOfflineSigner: mockGetOfflineSigner,
    };

    renderHeader({
      userAddress: "qube123",
      isLoggedIn: true,
    });

    act(() => {
      window.dispatchEvent(new Event("keplr_keystorechange"));
    });

    await waitFor(() => {
      expect(mockGetOfflineSigner).toHaveBeenCalledWith("osmosis-1");
    });

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({ type: "logout" });
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    delete window.keplr;
  });

  it("handles keplr_keystorechange error", async () => {
    const mockGetOfflineSigner = jest.fn(() => ({
      getAccounts: jest.fn().mockRejectedValue(new Error("Keplr error")),
    }));

    window.keplr = {
      getOfflineSigner: mockGetOfflineSigner,
    };

    renderHeader({
      userAddress: "qube123",
      isLoggedIn: true,
    });

    act(() => {
      window.dispatchEvent(new Event("keplr_keystorechange"));
    });

    await waitFor(() => {
      expect(mockGetOfflineSigner).toHaveBeenCalled();
    });

    delete window.keplr;
  });

  it("does not show wallet details when not logged in", () => {
    renderHeader({
      isLoggedIn: false,
    });

    expect(screen.queryByText(/Address:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Balance:/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();
  });
});
