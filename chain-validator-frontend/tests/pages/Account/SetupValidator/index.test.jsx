import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

jest.mock("../../../../src/services/apis/validatorOnboarding", () => ({
  getOnboardingWindowStatus: jest.fn().mockResolvedValue({ isOpen: false }),
}));

// The steps themselves are covered by their own suites. Here they are stubbed
// so we can assert *which* step the flow renders, and with what step index.
jest.mock("../../../../src/components/SetupValidator/LicenseStep", () => () => (
  <div data-testid="license-step" />
));
jest.mock("../../../../src/components/SetupValidator/FirstStep", () => (props) => (
  <div data-testid="first-step" data-active-step={String(props.activeStep)} />
));
jest.mock("../../../../src/components/SetupValidator/StakingStep", () => (props) => (
  <div data-testid="staking-step" data-active-step={String(props.activeStep)} />
));
jest.mock("../../../../src/components/SetupValidator/AuthorizeStep", () => () => (
  <div data-testid="authorize-step" />
));
jest.mock("../../../../src/components/ValidatorOnboarding", () => ({
  ValidatorOnboardingModal: ({ open }) =>
    open ? <div data-testid="type-modal" /> : null,
}));
jest.mock("../../../../src/components/SetupValidator/MigrateValidatorStep", () => () => (
  <div data-testid="migrate-step" />
));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

import SetupValidator from "../../../../src/pages/Account/SetupValidator";
import { storeLicenseRecord } from "../../../../src/constants/validatorLicense";
import { WALLET_TYPE } from "../../../../src/constants";
import theme from "../../../../src/theme";

const mockStore = configureStore([thunk]);
const ADDRESS = "autheo1alice";
const VALID_ID = "3f8a1c42-9d6b-4e07-b1f5-2a7c9e40d8b3";

const renderFlow = (address = ADDRESS) =>
  render(
    <Provider
      store={mockStore({
        auth: { userAddress: address, walletType: WALLET_TYPE.KEPLR },
      })}
    >
      <MuiThemeProvider theme={theme}>
        <SetupValidator />
      </MuiThemeProvider>
    </Provider>
  );

const verified = (address = ADDRESS) =>
  storeLicenseRecord({
    address,
    licenseId: VALID_ID,
    verifiedAt: new Date().toISOString(),
  });

const chooseNew = () =>
  fireEvent.click(screen.getByRole("button", { name: /create new validator/i }));
const chooseMigrate = () =>
  fireEvent.click(screen.getByRole("button", { name: /migrate existing validator/i }));

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe("Validator onboarding — choosing a journey", () => {
  it("opens on the choice screen, not on a form", () => {
    renderFlow();
    expect(screen.getByText(/onboard validator/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create new validator/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /migrate existing validator/i })
    ).toBeInTheDocument();

    expect(screen.queryByTestId("license-step")).not.toBeInTheDocument();
    expect(screen.queryByTestId("migrate-step")).not.toBeInTheDocument();
    expect(screen.queryByTestId("first-step")).not.toBeInTheDocument();
  });

  it("describes what each journey involves", () => {
    renderFlow();
    expect(screen.getByText(/set up a validator node from scratch/i)).toBeInTheDocument();
    expect(
      screen.getByText(/bring a validator you already run onto this app/i)
    ).toBeInTheDocument();
  });

  it("does not show the validator-type modal before a journey is chosen", () => {
    renderFlow();
    expect(screen.queryByTestId("type-modal")).not.toBeInTheDocument();
  });

  it("Create New Validator starts the existing flow at the license step", () => {
    renderFlow();
    chooseNew();
    expect(screen.getByTestId("license-step")).toBeInTheDocument();
    expect(screen.queryByTestId("migrate-step")).not.toBeInTheDocument();
  });

  it("Migrate Existing Validator opens the migration form only", () => {
    renderFlow();
    chooseMigrate();
    expect(screen.getByTestId("migrate-step")).toBeInTheDocument();
    expect(screen.queryByTestId("license-step")).not.toBeInTheDocument();
    expect(screen.queryByTestId("first-step")).not.toBeInTheDocument();
  });

  it("never shows the validator-type modal during migration", () => {
    renderFlow();
    chooseMigrate();
    expect(screen.queryByTestId("type-modal")).not.toBeInTheDocument();
  });

  it("shows the new-validator stepper only inside that journey", () => {
    renderFlow();
    expect(screen.queryByText("Setup Info")).not.toBeInTheDocument();
    chooseNew();
    expect(screen.getByText("Setup Info")).toBeInTheDocument();
  });
});

describe("Validator onboarding — license gate", () => {
  it("shows the License ID step first and nothing else", () => {
    renderFlow();
    chooseNew();
    expect(screen.getByTestId("license-step")).toBeInTheDocument();
    expect(screen.queryByTestId("first-step")).not.toBeInTheDocument();
    expect(screen.queryByTestId("staking-step")).not.toBeInTheDocument();
  });

  it("adds License ID to the stepper ahead of the existing steps", () => {
    renderFlow();
    chooseNew();
    const labels = screen.getAllByText(/License ID|Setup Info|Staking & Sign/);
    expect(labels.map((n) => n.textContent)).toEqual([
      "License ID",
      "Setup Info",
      "Staking & Sign",
    ]);
  });

  it("cannot be skipped: with no verification the existing steps never render", () => {
    renderFlow();
    chooseNew();
    expect(screen.queryByTestId("first-step")).not.toBeInTheDocument();
    expect(screen.queryByTestId("authorize-step")).not.toBeInTheDocument();
  });

  it("lets a previously verified operator straight through to Setup Info", () => {
    verified();
    renderFlow();
    chooseNew();
    expect(screen.queryByTestId("license-step")).not.toBeInTheDocument();
    expect(screen.getByTestId("first-step")).toBeInTheDocument();
  });

  it("re-gates when a different wallet connects", () => {
    verified("autheo1alice");
    renderFlow("autheo1bob");
    chooseNew();
    expect(screen.getByTestId("license-step")).toBeInTheDocument();
    expect(screen.queryByTestId("first-step")).not.toBeInTheDocument();
  });
});

describe("Validator onboarding — existing steps are unchanged", () => {
  it("keeps Setup Info at step index 0 so handleNext still matches", () => {
    // utils/validatorValidations.js switches on the absolute index:
    // case 0 = Setup Info, case 1 = Staking. The license gate must not shift it.
    verified();
    renderFlow();
    chooseNew();
    expect(screen.getByTestId("first-step")).toHaveAttribute(
      "data-active-step",
      "0"
    );
  });
});
