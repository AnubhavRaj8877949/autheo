import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../../src/theme";
import DashboardValidatorCard from "../../../../src/components/Dashboard/ValidatorCard";
import getValidatorByAddress from "../../../../src/services/apis/getValidatorByAddress";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getValoperAddress,
  checkIfValidatorExist,
} from "../../../../src/redux/reducer/auth";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

jest.mock("../../../../src/services/apis/getValidatorByAddress");

const mockValidatorTable = jest.fn(({ dasboardData }) => (
  <div data-testid="validator-table">{dasboardData?.status}</div>
));
jest.mock(
  "../../../../src/components/Dashboard/ValidatorCard/ValidatorTable",
  () => ({
    __esModule: true,
    default: (props) => mockValidatorTable(props),
  })
);

const mockActionTable = jest.fn(({ setWalletActivitiesLength }) => (
  <div data-testid="action-table">
    <button
      type="button"
      data-testid="mock-activities-button"
      onClick={() => setWalletActivitiesLength(6)}
    >
      mock activities
    </button>
  </div>
));
jest.mock(
  "../../../../src/components/Dashboard/ValidatorCard/ActionTable",
  () => ({
    __esModule: true,
    default: (props) => mockActionTable(props),
  })
);

jest.mock(
  "../../../../src/components/Dashboard/BlockchainInfos",
  () => ({
    __esModule: true,
    default: () => <div data-testid="blockchain-infos" />,
  })
);

jest.mock("../../../../src/components/Loader/Loader", () => ({
  __esModule: true,
  default: () => <div data-testid="loader" />,
}));

jest.mock(
  "../../../../src/utils/capitalizeFirstLetter",
  () => ({
    capitalizeFirstLetter: (value = "") =>
      value ? value.charAt(0).toUpperCase() + value.slice(1) : "",
  })
);

const renderComponent = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <DashboardValidatorCard />
      </MemoryRouter>
    </ThemeProvider>
  );

describe("DashboardValidatorCard", () => {
  const navigateMock = jest.fn();
  const dispatchMock = jest.fn();
  let mockAuthState;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = { userAddress: "cosmos1xyz", isValidated: true };
    useSelector.mockImplementation((selector) =>
      selector({ auth: mockAuthState })
    );
    useDispatch.mockReturnValue(dispatchMock);
    useNavigate.mockReturnValue(navigateMock);
  });

  const validatorPayload = {
    status: "active",
    operatorAddress: "valoper1",
    totalStake: "1000000000000000000",
    commissionRate: "0.05",
  };

  it("fetches validator data and displays status when user is validated", async () => {
    getValidatorByAddress.mockResolvedValue({
      error: false,
      data: { validators: [validatorPayload] },
    });

    renderComponent();

    await waitFor(() =>
      expect(getValidatorByAddress).toHaveBeenCalledWith("cosmos1xyz")
    );

    expect(dispatchMock).toHaveBeenCalledWith(
      getValoperAddress(validatorPayload.operatorAddress)
    );
    expect(dispatchMock).toHaveBeenCalledWith(checkIfValidatorExist(true));

    await waitFor(() => {
      const statusText = screen.getByText("Active");
      expect(statusText).toBeInTheDocument();
      expect(statusText).toHaveClass("autheo-status--active");
      expect(statusText).toHaveAttribute("data-status", "active");
    });

    expect(mockValidatorTable).toHaveBeenCalledWith(
      expect.objectContaining({ dasboardData: validatorPayload })
    );
  });

  it("shows setup button and navigates when user is not validated", async () => {
    mockAuthState = { userAddress: "cosmos1xyz", isValidated: false };
    getValidatorByAddress.mockResolvedValue({ error: true });

    renderComponent();

    await waitFor(() =>
      expect(getValidatorByAddress).toHaveBeenCalledWith("cosmos1xyz")
    );

    expect(dispatchMock).toHaveBeenCalledWith(checkIfValidatorExist(false));

    const setupButton = await screen.findByText(/register as a validator/i);
    fireEvent.click(setupButton);
    expect(navigateMock).toHaveBeenCalledWith("/account/become-a-validator");
  });

  it("shows view-all button when wallet activities exceed threshold", async () => {
    getValidatorByAddress.mockResolvedValue({
      error: false,
      data: { validators: [validatorPayload] },
    });

    renderComponent();

    await waitFor(() => expect(getValidatorByAddress).toHaveBeenCalled());

    const triggerButton = screen.getByTestId("mock-activities-button");
    fireEvent.click(triggerButton);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /View All/i })).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /View All/i }));
    expect(navigateMock).toHaveBeenCalledWith("/wallet-activities");
  });

  it("handles API error correctly in fetchData", async () => {
    getValidatorByAddress.mockRejectedValue(new Error("API Error"));

    renderComponent();

    await waitFor(() =>
      expect(dispatchMock).toHaveBeenCalledWith(checkIfValidatorExist(false))
    );
  });
});

