import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

// The signing service is exercised for real in tests/services/validatorLicense.test.js.
// Here it is stubbed so we can drive each UI state deterministically.
jest.mock("../../../src/services/validatorLicense", () => ({
  __esModule: true,
  LICENSE_ERRORS: {
    WALLET_UNAVAILABLE: "WALLET_UNAVAILABLE",
    SIGNATURE_INVALID: "SIGNATURE_INVALID",
    NO_ADDRESS: "NO_ADDRESS",
  },
  isLicenseSigningAvailable: jest.fn(() => true),
  signLicenseAttestation: jest.fn(),
}));

import LicenseStep from "../../../src/components/SetupValidator/LicenseStep";
import {
  isLicenseSigningAvailable,
  signLicenseAttestation,
} from "../../../src/services/validatorLicense";
import { WALLET_TYPE } from "../../../src/constants";
import theme from "../../../src/theme";

const mockStore = configureStore([thunk]);
const VALID_ID = "3f8a1c42-9d6b-4e07-b1f5-2a7c9e40d8b3";

const store = mockStore({
  auth: { userAddress: "autheo1alice", walletType: WALLET_TYPE.KEPLR },
});

// Rendered with the real MUI theme rather than a mocked FormWrapper, so the
// step is exercised against the same palette the app provides in index.jsx.
const renderStep = (props = {}) =>
  render(
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <LicenseStep onVerified={props.onVerified || jest.fn()} />
      </MuiThemeProvider>
    </Provider>
  );

const typeId = (value) => {
  fireEvent.change(screen.getByPlaceholderText(/3f8a1c42/i), {
    target: { value },
  });
};

const clickCta = () =>
  fireEvent.click(screen.getByRole("button", { name: /verify license/i }));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  isLicenseSigningAvailable.mockReturnValue(true);
  // This suite covers the REAL step, so the temporary mock must be off.
  process.env.REACT_APP_MOCK_LICENSE_VERIFICATION = "false";
});

describe("LicenseStep — initial state", () => {
  it("explains the step and that nothing is spent", () => {
    renderStep();
    expect(screen.getByText(/verify your validator license/i)).toBeInTheDocument();
    expect(screen.getByText(/costs no gas/i)).toBeInTheDocument();
  });

  it("offers a License ID field and a clear call to action", () => {
    renderStep();
    expect(screen.getByPlaceholderText(/3f8a1c42/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verify license/i })).toBeEnabled();
  });

  it("says verification is required", () => {
    renderStep();
    expect(screen.getByText(/required before you can register/i)).toBeInTheDocument();
  });
});

describe("LicenseStep — field validation", () => {
  it("rejects an empty field without asking the wallet", () => {
    renderStep();
    clickCta();
    expect(screen.getByText(/enter your license id/i)).toBeInTheDocument();
    expect(signLicenseAttestation).not.toHaveBeenCalled();
  });

  it("rejects a malformed License ID without asking the wallet", () => {
    renderStep();
    typeId("not-a-licence");
    clickCta();
    expect(screen.getByText(/doesn't look like a license id/i)).toBeInTheDocument();
    expect(signLicenseAttestation).not.toHaveBeenCalled();
  });

  it("clears the error once the operator starts correcting it", () => {
    renderStep();
    clickCta();
    expect(screen.getByText(/enter your license id/i)).toBeInTheDocument();
    typeId("3");
    expect(screen.queryByText(/enter your license id/i)).not.toBeInTheDocument();
  });
});

describe("LicenseStep — transaction states", () => {
  it("shows the waiting-for-wallet state while the request is open", async () => {
    let resolveSign;
    signLicenseAttestation.mockReturnValue(
      new Promise((resolve) => {
        resolveSign = resolve;
      })
    );

    renderStep();
    typeId(VALID_ID);
    clickCta();

    expect(await screen.findByText(/waiting for wallet confirmation/i)).toBeInTheDocument();
    expect(screen.getByText(/approve the signature request/i)).toBeInTheDocument();
    // The CTA is locked while the wallet prompt is open.
    expect(screen.getByRole("button", { name: /check your wallet/i })).toBeDisabled();

    await act(async () => {
      resolveSign({
        licenseId: VALID_ID,
        address: "autheo1alice",
        verifiedAt: new Date().toISOString(),
      });
    });
  });

  it("shows the verified state and then advances", async () => {
    jest.useFakeTimers();
    const onVerified = jest.fn();
    signLicenseAttestation.mockResolvedValue({
      licenseId: VALID_ID,
      address: "autheo1alice",
      verifiedAt: new Date().toISOString(),
    });

    renderStep({ onVerified });
    typeId(VALID_ID);
    clickCta();

    await waitFor(() => {
      expect(screen.getByText(/license verified/i)).toBeInTheDocument();
    });
    // It does not jump away before the operator has seen the confirmation.
    expect(onVerified).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(onVerified).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it("shows a failure state with a retry when the wallet rejects", async () => {
    signLicenseAttestation.mockRejectedValue(
      Object.assign(new Error("Request rejected"), { code: 4001 })
    );
    const onVerified = jest.fn();

    renderStep({ onVerified });
    typeId(VALID_ID);
    clickCta();

    expect(await screen.findByText(/verification failed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeEnabled();
    expect(onVerified).not.toHaveBeenCalled();
  });

  it("does not advance on failure", async () => {
    signLicenseAttestation.mockRejectedValue(new Error("SIGNATURE_INVALID"));
    const onVerified = jest.fn();

    renderStep({ onVerified });
    typeId(VALID_ID);
    clickCta();

    expect(await screen.findByText(/verification failed/i)).toBeInTheDocument();
    expect(screen.getByText(/couldn't confirm that signature/i)).toBeInTheDocument();
    expect(onVerified).not.toHaveBeenCalled();
  });

  it("submits only once even if the CTA is clicked repeatedly", async () => {
    signLicenseAttestation.mockReturnValue(new Promise(() => {}));

    renderStep();
    typeId(VALID_ID);
    clickCta();
    await screen.findByText(/waiting for wallet confirmation/i);
    fireEvent.click(screen.getByRole("button", { name: /check your wallet/i }));

    expect(signLicenseAttestation).toHaveBeenCalledTimes(1);
  });
});

describe("LicenseStep — unusable wallet", () => {
  it("explains the problem and disables the CTA", () => {
    isLicenseSigningAvailable.mockReturnValue(false);
    renderStep();

    expect(screen.getByText(/connect keplr or cosmostation/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verify license/i })).toBeDisabled();
  });
});
