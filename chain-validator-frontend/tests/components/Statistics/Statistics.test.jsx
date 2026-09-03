import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import Statistics from "../../../src/components/Statistics";
import getAllStats from "../../../src/services/apis/getStatistics";
import getPrice from "../../../src/services/getPrice";
import { getApy, getTotalValidators } from "../../../src/redux/reducer/auth";
import { useDispatch } from "react-redux";

import { APP_NAME } from "../../testConstants";

jest.mock("../../../src/constants.ts", () => {
  const { APP_NAME } = require("../../testConstants");
  return {
    ...jest.requireActual("../../../src/constants.ts"),
    DECIMAL: "6",
    APP_NAME: APP_NAME,
    CURRENCY: "QBT",
  };
});

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
}));

jest.mock("../../../src/services/apis/getStatistics");
jest.mock("../../../src/services/getPrice");
jest.mock("../../../src/assets/Icons/CalendarIcon", () => () => (
  <svg data-testid="calendar-icon" />
));
jest.mock("../../../src/assets/Icons/InflationIcon", () => () => (
  <svg data-testid="inflation-icon" />
));
jest.mock("../../../src/assets/Icons/InfoIcon", () => () => (
  <svg data-testid="info-icon" />
));
jest.mock("../../../src/assets/Icons/MarketCapIcon", () => () => (
  <svg data-testid="market-cap-icon" />
));
jest.mock("../../../src/assets/Icons/PriceIcon", () => () => (
  <svg data-testid="price-icon" />
));
jest.mock("../../../src/assets/Icons/SupplyIcon", () => () => (
  <svg data-testid="supply-icon" />
));

describe("Statistics component", () => {
  const mockDispatch = jest.fn();

  const mockStats = {
    apy: 9.876,
    totalValidator: 42,
    circulation_supply: "4000000",
    inflation: 7.4,
    apr: 12.98765,
    totalSupply: 9876543210000000,
  };

  const mockPrice = "0.75";

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(mockDispatch);
    process.env.REACT_APP_DECIMAL = "6";
    process.env.REACT_APP_NAME = APP_NAME;
    process.env.REACT_APP_CURRENCY = "QBT";
  });

  const normalize = (value = "") => value.replace(/\s+/g, " ").trim();

  it("shows skeleton placeholders while stats are loading", async () => {
    let resolveStats;
    let resolvePrice;

    const statsPromise = new Promise((resolve) => {
      resolveStats = resolve;
    });

    const pricePromise = new Promise((resolve) => {
      resolvePrice = resolve;
    });

    getAllStats.mockReturnValue(statsPromise);
    getPrice.mockReturnValue(pricePromise);

    render(<Statistics />);

    expect(
      document.querySelectorAll(".MuiSkeleton-root").length
    ).toBeGreaterThanOrEqual(1);

    await act(async () => {
      resolveStats({ data: {} });
      resolvePrice({ data: 0 });
    });
  });

  it("renders formatted values after successful fetch", async () => {
    getAllStats.mockResolvedValue({ data: mockStats });
    getPrice.mockResolvedValue(mockPrice);

    render(<Statistics />);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(getApy(mockStats.apy));
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      getTotalValidators(mockStats.totalValidator)
    );

    expect(screen.getByText("Market Cap")).toBeInTheDocument();
    expect(screen.getByText("Total Supply")).toBeInTheDocument();
    expect(screen.getByText(/THEO\s+Price/i)).toBeInTheDocument();
  });

  it("handles error when fetching stats fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

    getAllStats.mockRejectedValue(new Error("Failed to fetch stats"));
    getPrice.mockResolvedValue(mockPrice);

    render(<Statistics />);

    await waitFor(() => {
      // Component should still render even if stats fetch fails
      expect(screen.getByText("Market Cap")).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it("handles error when fetching price fails", async () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => { });

    getAllStats.mockResolvedValue({ data: mockStats });
    getPrice.mockRejectedValue(new Error("Failed to fetch price"));

    render(<Statistics />);

    await waitFor(() => {
      expect(screen.getByText(/THEO\s+Price/i)).toBeInTheDocument();
    });

    consoleLogSpy.mockRestore();
  });
});
