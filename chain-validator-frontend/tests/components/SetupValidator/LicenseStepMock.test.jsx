/**
 * Covers the TEMPORARY mocked license step.
 *
 * Delete this file together with the mock. Its job is to prove two things:
 *  - the parts that are NOT mocked still work (format validation, the state
 *    transitions, the gate only opening after a successful verify)
 *  - the parts that ARE mocked never reach the wallet or persist anything
 *    that could later be mistaken for a real verification.
 */
import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

jest.mock("../../../src/services/validatorLicense", () => ({
  __esModule: true,
  LICENSE_ERRORS: {},
  isLicenseSigningAvailable: jest.fn(() => true),
  signLicenseAttestation: jest.fn(),
}));

import LicenseStep from "../../../src/components/SetupValidator/LicenseStep";
import { signLicenseAttestation } from "../../../src/services/validatorLicense";
import { readLicenseRecord } from "../../../src/constants/validatorLicense";
import { WALLET_TYPE } from "../../../src/constants";
import theme from "../../../src/theme";

const mockStore = configureStore([thunk]);
const store = mockStore({
  auth: { userAddress: "autheo1alice", walletType: WALLET_TYPE.KEPLR },
});

const VALID_ID = "3f8a1c42-9d6b-4e07-b1f5-2a7c9e40d8b3";

const renderStep = (onVerified = jest.fn()) => {
  render(
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <LicenseStep onVerified={onVerified} />
      </MuiThemeProvider>
    </Provider>
  );
  return onVerified;
};

const field = () => screen.getByPlaceholderText(/3f8a1c42/i);
const typeId = (value) => fireEvent.change(field(), { target: { value } });
const clickCta = (name) =>
  fireEvent.click(screen.getByRole("button", { name }));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  process.env.REACT_APP_MOCK_LICENSE_VERIFICATION = "true";
});

afterAll(() => {
  delete process.env.REACT_APP_MOCK_LICENSE_VERIFICATION;
});

describe("Mocked license step — starting state", () => {
  it("keeps the same step heading as the real one", () => {
    renderStep();
    expect(screen.getByText(/verify your validator license/i)).toBeInTheDocument();
  });

  it("asks for a License ID rather than presenting one", () => {
    renderStep();
    expect(field()).toHaveValue("");
    expect(field()).toBeEnabled();
    expect(screen.getByRole("button", { name: /verify license/i })).toBeEnabled();
  });

  it("shows no verification banner before the operator acts", () => {
    renderStep();
    expect(screen.queryByText(/license verified/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/verifying your license/i)).not.toBeInTheDocument();
  });

  it("says plainly which half is mocked", () => {
    renderStep();
    expect(screen.getByText(/demo mode/i)).toBeInTheDocument();
    expect(screen.getByText(/ownership is not\s+verified/i)).toBeInTheDocument();
  });
});

describe("Mocked license step — format validation still applies", () => {
  it("rejects an empty field", () => {
    const onVerified = renderStep();
    clickCta(/verify license/i);
    expect(screen.getByText(/enter your license id/i)).toBeInTheDocument();
    expect(onVerified).not.toHaveBeenCalled();
  });

  it.each([
    ["too short", "3f8a1c42-9d6b-4e07-b1f5"],
    ["missing dashes", "3f8a1c429d6b4e07b1f52a7c9e40d8b3"],
    ["non-hex characters", "3f8a1c42-9d6b-4e07-b1f5-2a7c9e40d8bz"],
    ["an arbitrary string", "my-licence"],
  ])("rejects %s and does not verify", (_label, input) => {
    const onVerified = renderStep();
    typeId(input);
    clickCta(/verify license/i);
    expect(screen.getByText(/doesn't look like a license id/i)).toBeInTheDocument();
    expect(screen.queryByText(/license verified/i)).not.toBeInTheDocument();
    expect(onVerified).not.toHaveBeenCalled();
  });

  it("clears the error as soon as the operator edits the field", () => {
    renderStep();
    clickCta(/verify license/i);
    expect(screen.getByText(/enter your license id/i)).toBeInTheDocument();
    typeId("3");
    expect(screen.queryByText(/enter your license id/i)).not.toBeInTheDocument();
  });

  it("accepts the wrapped and upper-case forms the real step normalises", async () => {
    renderStep();
    typeId(`  {${VALID_ID.toUpperCase()}}  `);
    clickCta(/verify license/i);
    expect(await screen.findByText(/license verified/i)).toBeInTheDocument();
  });
});

describe("Mocked license step — verifying a valid ID", () => {
  it("passes through a verifying state, then reports success", async () => {
    jest.useFakeTimers();
    renderStep();
    typeId(VALID_ID);
    clickCta(/verify license/i);

    expect(screen.getByText(/verifying your license/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verifying/i })).toBeDisabled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/license verified/i)).toBeInTheDocument();
    expect(screen.queryByText(/verifying your license/i)).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  it("locks the field once verified", async () => {
    renderStep();
    typeId(VALID_ID);
    clickCta(/verify license/i);
    await screen.findByText(/license verified/i);
    expect(field()).toBeDisabled();
  });

  it("does not advance on its own — the operator clicks Next", async () => {
    const onVerified = renderStep();
    typeId(VALID_ID);
    clickCta(/verify license/i);
    await screen.findByText(/license verified/i);

    expect(onVerified).not.toHaveBeenCalled();
    clickCta(/^next$/i);
    expect(onVerified).toHaveBeenCalledTimes(1);
  });
});

describe("Mocked license step — nothing real happens", () => {
  it("never contacts the wallet", async () => {
    renderStep();
    typeId(VALID_ID);
    clickCta(/verify license/i);
    await screen.findByText(/license verified/i);
    clickCta(/^next$/i);
    expect(signLicenseAttestation).not.toHaveBeenCalled();
  });

  it("persists nothing, so the step is shown again on the next visit", async () => {
    renderStep();
    typeId(VALID_ID);
    clickCta(/verify license/i);
    await screen.findByText(/license verified/i);
    clickCta(/^next$/i);

    await waitFor(() => {
      expect(readLicenseRecord("autheo1alice")).toBeNull();
    });
    expect(localStorage.getItem("validator_license")).toBeNull();
  });

  it("offers no wallet-confirmation or failure state", async () => {
    renderStep();
    typeId(VALID_ID);
    clickCta(/verify license/i);
    await screen.findByText(/license verified/i);
    expect(screen.queryByText(/waiting for wallet confirmation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/verification failed/i)).not.toBeInTheDocument();
  });
});
