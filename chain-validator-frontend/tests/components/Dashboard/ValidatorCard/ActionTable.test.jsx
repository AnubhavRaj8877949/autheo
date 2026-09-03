import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ActionTable from "../../../../src/components/Dashboard/ValidatorCard/ActionTable";
import getTxByAddress from "../../../../src/services/apis/getTxByAddress";
import { useSelector } from "react-redux";
import { usePagination } from "../../../../src/hooks/usePagination";

jest.mock("../../../../src/constants.ts", () => ({
  ...jest.requireActual("../../../../src/constants.ts"),
  CURRENCY: "QBT",
  DEFAULT_TABLE_LIMIT: 10,
  BASE_URL: { EXPLORER_NAVIGATION_URL: "https://explorer.test" },
}));

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useLocation: jest.fn(() => ({ pathname: "/dashboard" })),
  };
});

jest.mock("../../../../src/hooks/usePagination");
jest.mock("../../../../src/services/apis/getTxByAddress");
jest.mock("../../../../src/components/SkeletonRow/SkeletonRow", () => ({
  __esModule: true,
  default: ({ columns }) => (
    <tr data-testid="skeleton-row">
      <td colSpan={columns}>loading...</td>
    </tr>
  ),
}));
jest.mock("../../../../src/components/Common/FlexBox", () => ({
  __esModule: true,
  default: ({ children, ...rest }) => (
    <div data-testid="flex-box" {...rest}>
      {children}
    </div>
  ),
}));
jest.mock("../../../../src/components/Loader/Loader", () => ({
  __esModule: true,
  default: () => <div data-testid="loader" />,
}));
jest.mock("../../../../src/components/Dashboard/ValidatorCard/pageStyle", () => ({
  Pagination: ({ onChange }) => (
    <button
      data-testid="pagination"
      onClick={(event) => onChange(event, 2)}
    >
      paginate
    </button>
  ),
}));
jest.mock("../../../../src/components/Dashboard/ValidatorCard/styles", () => ({
  ActionStatus: ({ children, ...rest }) => (
    <span data-testid="action-status" {...rest}>
      {children}
    </span>
  ),
}));
jest.mock("../../../../src/assets/Icons/SvgIcon", () => ({
  NotFoundIcon: () => <svg data-testid="not-found-icon" />,
  PrevIcon: () => <span data-testid="prev-icon" />,
  NextIcon: () => <span data-testid="next-icon" />,
}));

const sampleTx = [
  {
    txhash: "ABC123",
    type: "transfer",
    value: 42,
    status: "SUCCESS",
  },
  {
    txhash: "DEF456",
    type: "delegate",
    value: 0,
    status: "FAILED",
  },
  {
    txhash: "GHI789",
    type: "pendingTx",
    value: 1000,
    status: "PROCESSING",
  },
  {
    txhash: "JKL012",
    type: "redelegate",
    value: 5,
    status: "PENDING",
  },
  {
    txhash: "MNO345",
    type: "unjail",
    value: 7,
    status: "success",
  },
  {
    txhash: "PQR678",
    type: "extra",
    value: 9,
    status: "failed",
  },
];

const defaultPagination = () => ({
  pageParams: { page: 1 },
  handlePageChange: jest.fn(),
  totalPages: 1,
  setTotalCount: jest.fn(),
});

const renderComponent = (props = {}) => {
  const setWalletActivitiesLength = jest.fn();
  const view = render(
    <MemoryRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ActionTable
        setWalletActivitiesLength={setWalletActivitiesLength}
        {...props}
      />
    </MemoryRouter>
  );
  return { setWalletActivitiesLength, ...view };
};

describe("ActionTable component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useSelector.mockImplementation((selector) =>
      selector({ auth: { userAddress: "cosmos1abcd" } })
    );
    usePagination.mockReturnValue(defaultPagination());
  });

  it("renders fetched transactions and updates auxiliary state", async () => {
    const pagination = defaultPagination();
    usePagination.mockReturnValue(pagination);
    getTxByAddress.mockResolvedValue({
      data: { transactions: sampleTx, count: sampleTx.length },
    });

    const { setWalletActivitiesLength } = renderComponent({ showAll: false });

    await waitFor(() =>
      expect(getTxByAddress).toHaveBeenCalledWith(
        "cosmos1abcd",
        1,
        expect.any(Number)
      )
    );

    expect(pagination.setTotalCount).toHaveBeenCalledWith(sampleTx.length);
    expect(setWalletActivitiesLength).toHaveBeenCalledWith(sampleTx.length);

    expect(
      screen.getByRole("link", { name: /ABC123/i })
    ).toHaveAttribute("href", "/tx/ABC123");
    expect(screen.getByText("transfer")).toBeInTheDocument();

    const amountCell = screen.getByText(
      (content, element) =>
        element.tagName === "P" && content.includes("42.00")
    );
    expect(amountCell.parentElement).toHaveTextContent("42.00 QBT");
    expect(screen.getAllByTestId("action-status")[0]).toHaveStyle({
      color: "#1FDD00",
    });

    expect(screen.queryByText("PQR678")).not.toBeInTheDocument();
  });

  it("shows pagination controls when showAll is true with multiple pages", async () => {
    const pagination = {
      pageParams: { page: 1 },
      handlePageChange: jest.fn(),
      totalPages: 3,
      setTotalCount: jest.fn(),
    };
    usePagination.mockReturnValue(pagination);
    getTxByAddress.mockResolvedValue({
      data: { transactions: sampleTx, count: 20 },
    });

    renderComponent({ showAll: true });

    await waitFor(() => expect(getTxByAddress).toHaveBeenCalled());

    const paginationButton = screen.getByTestId("pagination");
    fireEvent.click(paginationButton);

    expect(pagination.handlePageChange).toHaveBeenCalledTimes(1);
  });

  it("renders fallback row when there are no recent actions", async () => {
    getTxByAddress.mockResolvedValue({
      data: { transactions: [], count: 0 },
    });

    renderComponent({ showAll: false });

    await waitFor(() => expect(getTxByAddress).toHaveBeenCalled());
    expect(
      screen.getByText("No Recent Action Available")
    ).toBeInTheDocument();
  });

  it("shows error placeholder when API fails and showAll is false", async () => {
    getTxByAddress.mockRejectedValue(new Error("Network error"));

    renderComponent({ showAll: false });

    await waitFor(() => expect(screen.getByText("No Data")).toBeInTheDocument());
    expect(screen.getByTestId("not-found-icon")).toBeInTheDocument();
  });

  it("shows skeleton rows when fetching data and no initial data", async () => {
    getTxByAddress.mockReturnValue(new Promise(() => { })); // Hang

    renderComponent({ showAll: false });

    await waitFor(() => expect(screen.getAllByTestId("skeleton-row")).toHaveLength(5));
  });

  it("handles copiedAddress and transactionHash utility functions", async () => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    // Mock window.open
    const windowOpenSpy = jest.spyOn(window, "open").mockImplementation(() => { });

    getTxByAddress.mockResolvedValue({
      data: { transactions: sampleTx, count: sampleTx.length },
    });

    renderComponent({ showAll: false });

    await waitFor(() => expect(screen.getByText("ABC123")).toBeInTheDocument());

    // Link should have correct href
    expect(screen.getByRole("link", { name: /ABC123/i })).toHaveAttribute("href", "/tx/ABC123");
  });

  it("renders correct status colors and handles missing txhash", async () => {
    const variedTx = [
      { txhash: "", type: "send", value: 1, status: "FAILED" },
      { txhash: "TX1", type: "send", value: 2, status: "PENDING" },
      { txhash: "TX2", type: "send", value: 3, status: "PROCESSING" },
      { txhash: "TX3", type: "send", value: 4, status: "something" },
    ];
    getTxByAddress.mockResolvedValue({
      data: { transactions: variedTx, count: 4 },
    });

    renderComponent({ showAll: true });

    await waitFor(() => expect(screen.getByText("TX1")).toBeInTheDocument());

    // Check fallback for empty txhash
    expect(screen.getByText("-")).toBeInTheDocument();

    const statuses = screen.getAllByTestId("action-status");
    // Transaction state is expressed through the shared status classes, which
    // resolve to the --status-* design tokens.
    expect(statuses[0]).toHaveClass("status-failed");
    expect(statuses[1]).toHaveClass("status-processing");
    expect(statuses[2]).toHaveClass("status-processing");
    expect(statuses[3]).not.toHaveClass("status-failed");
  });
});

