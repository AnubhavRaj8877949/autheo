import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import BlockchainInfos from "../../../src/components/Dashboard/BlockchainInfos";
import getDashboardWidgets from "../../../src/services/apis/getDashboardWidgets";
import { useSelector } from "react-redux";
import { noExponential } from "../../../src/utils/commonFunctions";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("../../../src/services/apis/getDashboardWidgets");

const slugify = (title) => title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

jest.mock("../../../src/components/Common/Card", () => {
  const React = require("react");
  const toId = (title) => title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return {
    __esModule: true,
    default: ({ title, value, loading, icon }) => (
      <div data-testid={`card-${toId(title)}`}>
        <span>{title}</span>
        <div data-testid={`value-${toId(title)}`}>{loading ? "loading" : value}</div>
        {icon}
      </div>
    ),
  };
});

jest.mock("../../../src/assets/Icons/BlocksIcon", () => () => (
  <svg data-testid="blocks-icon" />
));
jest.mock("../../../src/assets/Icons/ValidatorsNewIcon", () => () => (
  <svg data-testid="validators-icon" />
));
jest.mock("../../../src/assets/Icons/SvgIcon.jsx", () => ({
  DelegatorStake: () => <svg data-testid="delegator-stake-icon" />,
  TotalReward: () => <svg data-testid="total-reward-icon" />,
  BlockProposed: () => <svg data-testid="block-proposed-icon" />,
  SelfStake: () => <svg data-testid="self-stake-icon" />,
  BlockIcon: () => <svg data-testid="block-icon" />,
}));

const TITLES = [
  "Last Block Proposed",
  "No. of Delegators",
  "Total Delegators Stake Amount",
  "Total Rewards",
  "No. of Blocks Proposed",
  "Self Stake",
];

const mockWidgets = {
  lastBlockProposed: 500,
  delegatorCount: 7,
  delegatorStake: 2500000000000000000,
  totalRewards: 890,
  totalBlockProposed: 321,
  selfStake: 1000000000000000000,
};

const renderWithAddress = (address = "cosmos1abc") => {
  useSelector.mockImplementation((selector) =>
    selector({ auth: { userAddress: address } })
  );
  return render(<BlockchainInfos />);
};

describe("BlockchainInfos component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state for each card while fetching data", async () => {
    let resolveWidgets;
    const widgetsPromise = new Promise((resolve) => {
      resolveWidgets = resolve;
    });
    getDashboardWidgets.mockReturnValue(widgetsPromise);

    renderWithAddress();

    TITLES.forEach((title) => {
      expect(
        screen.getByTestId(`value-${slugify(title)}`)
      ).toHaveTextContent("loading");
    });

    await act(async () => resolveWidgets({ data: mockWidgets }));
  });

  // TODO: need to revisit and fix the test case
  // it("displays formatted widget data after successful fetch", async () => {
  //   getDashboardWidgets.mockResolvedValue({ data: mockWidgets });

  //   renderWithAddress("cosmos1xyz");

  //   await waitFor(() => {
  //     expect(getDashboardWidgets).toHaveBeenCalledWith("cosmos1xyz");
  //   });

  //   await waitFor(() => {
  //     expect(screen.queryAllByText("loading")).toHaveLength(0);
  //   });

  //   expect(screen.getByTitle(String(mockWidgets.lastBlockProposed))).toHaveTextContent(
  //     "500.00"
  //   );
  //   expect(screen.getByTitle(String(mockWidgets.delegatorCount))).toHaveTextContent(
  //     "7"
  //   );

  //   const delegatorStakeTitle = noExponential(
  //     Number(mockWidgets.delegatorStake) / 10 ** 18
  //   );
  //   expect(screen.getByTitle(delegatorStakeTitle)).toHaveTextContent("2.50 THEO");

  //   expect(screen.getByTitle(noExponential(mockWidgets.totalRewards))).toHaveTextContent(
  //     "890.00"
  //   );

  //   expect(
  //     screen.getByTitle(String(mockWidgets.totalBlockProposed))
  //   ).toHaveTextContent("321.00");

  //   const selfStakeTitle = noExponential(Number(mockWidgets.selfStake) / 10 ** 18);
  //   expect(screen.getByTitle(selfStakeTitle)).toHaveTextContent("1.00 THEO");
  // });

  it("falls back to zero values when the API call fails", async () => {
    getDashboardWidgets.mockRejectedValue(new Error("Network error"));

    renderWithAddress();

    await waitFor(() =>
      TITLES.forEach((title) => {
        expect(
          screen.getByTestId(`value-${slugify(title)}`)
        ).toHaveTextContent("0");
      })
    );

    expect(getDashboardWidgets).toHaveBeenCalledTimes(1);
  });
});

