import "@testing-library/jest-dom";
import React, { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";


// Mock keplr and cosmostation BEFORE importing the component
jest.mock("../../../src/keplrEvents/keplrCreateValidator", () => ({
  keplrCreateValidator: jest.fn(),
}));
jest.mock("../../../src/cosmostationEvents/createValidator", () => ({
  cosmostationCreateValidator: jest.fn(),
}));

import { GLOBAL_OBJECT } from "../../testConstants";
import StakingStep from "../../../src/components/SetupValidator/StakingStep";
import { handleNext } from "../../../src/utils/validatorValidations";
import { cosmostationCreateValidator } from "../../../src/cosmostationEvents/createValidator";
import { keplrCreateValidator } from "../../../src/keplrEvents/keplrCreateValidator";

const mockStore = configureStore([thunk]);
const mockNavigate = jest.fn();

// Stateful wrapper so secondaryValues updates between events (simulates real parent)
const StatefulStakingStep = ({ store, initialValues, ...otherProps }) => {
  const [secondaryValues, setSecondaryValues] = useState(
    initialValues || { Bond_Amount: "", commissionRate: "", maxRate: "", maxChangeRate: "" }
  );
  return (
    <Provider store={store}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <StakingStep
          {...otherProps}
          secondaryValues={secondaryValues}
          setSecondaryValues={setSecondaryValues}
        />
      </BrowserRouter>
    </Provider>
  );
};


jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../../src/context/NodeUrl", () => ({
  useGetNodeUrl: () => ({ nodeUrl: "http://test-node.com" }),
}));

jest.mock("../../../src/utils/validatorValidations");
jest.mock("../../../src/components/Common/Toast/Toast");
jest.mock("../../../src/components/Loader/Loader", () => () => <div data-testid="loader">Loading...</div>);

jest.mock("../../../src/components/Common/FormWrapper", () => ({ children }) => <div data-testid="form-wrapper">{children}</div>);
jest.mock("../../../src/components/BackButton/BackButton", () => ({ onClick, title }) => (
  <button data-testid="back-button" onClick={onClick}>{title || "Back"}</button>
));
jest.mock("../../../src/components/Common/CommonBtn/CommonBtn.jsx", () => ({ children, onClick }) => (
  <button data-testid="submit-button" onClick={onClick}>{children}</button>
));
jest.mock("../../../src/components/Common/TextField", () => ({ label, placeholder, value, onChange, name, helperText }) => (
  <div>
    <label>{label}</label>
    <input placeholder={placeholder} value={value} onChange={onChange} name={name} data-testid={`input-${name}`} />
    {helperText && <span>{helperText}</span>}
  </div>
));

describe("StakingStep Component", () => {
  const defaultProps = {
    activeStep: 1,
    setActiveStep: jest.fn(),
    setSecondaryValues: jest.fn(),
    secondaryValues: {
      Bond_Amount: "",
      commissionRate: "",
      maxRate: "",
      maxChangeRate: "",
    },
    methodType: "createValidator",
    primaryValues: { name: "Test" },
  };

  const defaultState = {
    auth: {
      userBalance: "1000",
      walletType: "keplr",
      userAddress: `${GLOBAL_OBJECT}123`,
      valoperAddressFromBlockChain: "valoper123",
    },
  };

  let store;

  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation((msg) => {
      if (msg && typeof msg === "string" && msg.includes('Each child in a list should have a unique "key" prop')) {
        return;
      }
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore(defaultState);
    handleNext.mockReturnValue(true);
  });

  test("renders and handles inputs", () => {
    const setSecondaryValues = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <StakingStep {...defaultProps} setSecondaryValues={setSecondaryValues} />
        </BrowserRouter>
      </Provider>
    );

    const bondInput = screen.getByTestId("input-Bond_Amount");
    fireEvent.change(bondInput, { target: { name: "Bond_Amount", value: "100" } });
    expect(setSecondaryValues).toHaveBeenCalled();

    const rateInput = screen.getByTestId("input-commissionRate");
    fireEvent.change(rateInput, { target: { name: "commissionRate", value: "10" } });
    expect(setSecondaryValues).toHaveBeenCalled();
  });

  test("validates commission rate below minimum (< 5%) shows error", () => {
    render(
      <StatefulStakingStep
        store={store}
        activeStep={1}
        setActiveStep={jest.fn()}
        methodType="createValidator"
        primaryValues={{ name: "Test" }}
      />
    );
    fireEvent.change(screen.getByTestId("input-commissionRate"), {
      target: { name: "commissionRate", value: "4" },
    });
    expect(screen.getByText("Initial rate must be between 5% and 100%")).toBeInTheDocument();
  });

  test("validates commission rate greater than max rate shows error", () => {
    render(
      <StatefulStakingStep
        store={store}
        activeStep={1}
        setActiveStep={jest.fn()}
        methodType="createValidator"
        primaryValues={{ name: "Test" }}
      />
    );
    // First set Max_Rate to 10
    fireEvent.change(screen.getByTestId("input-maxRate"), {
      target: { name: "maxRate", value: "10" },
    });
    // Then set Commission_Rate to 15 (greater than Max_Rate 10)
    fireEvent.change(screen.getByTestId("input-commissionRate"), {
      target: { name: "commissionRate", value: "15" },
    });
    expect(screen.getByText("Initial rate cannot be greater than max rate")).toBeInTheDocument();
  });

  test("validates max rate less than initial rate shows error", () => {
    render(
      <StatefulStakingStep
        store={store}
        activeStep={1}
        setActiveStep={jest.fn()}
        methodType="createValidator"
        primaryValues={{ name: "Test" }}
      />
    );
    // First set Commission_Rate to 10
    fireEvent.change(screen.getByTestId("input-commissionRate"), {
      target: { name: "commissionRate", value: "10" },
    });
    // Then set Max_Rate to 5 (less than Commission_Rate 10)
    fireEvent.change(screen.getByTestId("input-maxRate"), {
      target: { name: "maxRate", value: "5" },
    });
    expect(screen.getByText("Max rate must be between initial rate and 100%")).toBeInTheDocument();
  });

  test("validates max change rate exceeds allowed shows error", () => {
    render(
      <StatefulStakingStep
        store={store}
        activeStep={1}
        setActiveStep={jest.fn()}
        methodType="createValidator"
        primaryValues={{ name: "Test" }}
      />
    );
    // Set Commission_Rate = 10, Max_Rate = 20, Max_Change_Rate = 15 (15 > 20-10=10)
    fireEvent.change(screen.getByTestId("input-commissionRate"), {
      target: { name: "commissionRate", value: "10" },
    });
    fireEvent.change(screen.getByTestId("input-maxRate"), {
      target: { name: "maxRate", value: "20" },
    });
    fireEvent.change(screen.getByTestId("input-maxChangeRate"), {
      target: { name: "maxChangeRate", value: "15" },
    });
    expect(screen.getByText(/Max change rate must be ≤ 10.00%/)).toBeInTheDocument();
  });


  test("handles submission with different wallets", async () => {
    const cosmoStore = mockStore({ auth: { ...defaultState.auth, walletType: "cosmostation" } });
    render(
      <Provider store={cosmoStore}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <StakingStep {...defaultProps} />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(cosmostationCreateValidator).toHaveBeenCalled());
  });

  test("handles submission with Keplr wallet", async () => {
    const keplrStore = mockStore({ auth: { ...defaultState.auth, walletType: "keplr" } });
    render(
      <Provider store={keplrStore}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <StakingStep {...defaultProps} />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(keplrCreateValidator).toHaveBeenCalled());
  });

  test("handles submission with No Wallet", () => {
    const noWalletStore = mockStore({ auth: { ...defaultState.auth, walletType: "noWallet" } });
    render(
      <Provider store={noWalletStore}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <StakingStep {...defaultProps} />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByTestId("submit-button"));
    expect(handleNext).toHaveBeenCalled();
  });

  test("handles invalid amount inputs", () => {
    const setSecondaryValues = jest.fn();
    render(
      <Provider store={store}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <StakingStep {...defaultProps} setSecondaryValues={setSecondaryValues} />
        </BrowserRouter>
      </Provider>
    );

    const bondInput = screen.getByTestId("input-Bond_Amount");

    // Test: alphabetical input
    fireEvent.change(bondInput, { target: { name: "Bond_Amount", value: "abc" } });
    expect(setSecondaryValues).not.toHaveBeenCalledWith(expect.objectContaining({ Bond_Amount: "abc" }));

    // Test: space input
    fireEvent.change(bondInput, { target: { name: "Bond_Amount", value: " " } });
    expect(setSecondaryValues).not.toHaveBeenCalled();

    // Test: too many decimals
    fireEvent.change(bondInput, { target: { name: "Bond_Amount", value: "1.1234567890123456789" } });
    expect(setSecondaryValues).not.toHaveBeenCalled();
  });
});
