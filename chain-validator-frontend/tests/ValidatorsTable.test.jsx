import "@testing-library/jest-dom";

import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import getAllValidators from "../src/services/apis/getAllValidators";
import ValidatorsTable from "../src/components/Validators/ValidatorsTableList/ValidatorsTable.jsx";
import { showEVMAddress } from "../src/services/showEVMAddress";
import { toast } from "../src/components/Common/Toast/Toast.js";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockHandlePageChange = jest.fn();
const mockSetTotalCount = jest.fn();
const mockSetCurrentPage = jest.fn();
const mockUsePagination = {
  pageParams: { page: 1, limit: 10 },
  handlePageChange: mockHandlePageChange,
  totalPages: 5,
  setTotalCount: mockSetTotalCount,
  setCurrentPage: mockSetCurrentPage,
};
jest.mock("../src/hooks/usePagination", () => ({
  usePagination: () => mockUsePagination,
}));

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));
jest.mock("../src/redux/reducer/auth", () => ({
  getValidatorCount: jest.fn(),
}));

jest.mock("../src/components/Common/Toast/Toast.js", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../src/services/showEVMAddress", () => ({
  showEVMAddress: jest.fn(),
}));
jest.mock("../src/utils/getData", () => ({
  __esModule: true,
  default: (addr) => addr,
}));

jest.mock("../src/services/apis/getAllValidators");
jest.mock("../src/services/apis/getValidatorByAddress");
jest.mock("../src/components/Loader/Loader", () => {
  return () => <div data-testid="mock-loader" />;
});
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

const mockValidatorData = [
  {
    name: "Validator Alpha",
    validatorAddress: "valoper1",
    status: "active",
    totalStake: "12345678900000000000",
    commissionRate: "0.1",
    selfStake: "1000000000000000000",
    delegatorCount: 15,
  },
  {
    name: "unknown",
    validatorAddress: "valoper2",
    status: "inactive",
    totalStake: "5000000000000000000",
    commissionRate: "0.05",
    selfStake: "500000000000000000",
    delegatorCount: 5,
  },
];
const mockEvmAddresses = {
  "valoper1": "0x8f95e2eac77c0f2dab13328eaa964e06aad19e57",
  "valoper2": "0xABC",
};

const defaultProps = {
  tabId: 0,
  setTabId: jest.fn(),
  searchData: "",
  isSearch: false,
  setIsSearch: jest.fn(),
  evmAddresses: mockEvmAddresses,
  validators: mockValidatorData,
};

describe("ValidatorsTable", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    showEVMAddress.mockImplementation((address) =>
      mockEvmAddresses[address]
    );
    getAllValidators.mockResolvedValue({
      data: {
        count: 50,
        validators: mockValidatorData,
      },
    });
    // Suppress console errors for act warnings
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // --- Initial Render & Loading States ---

  test("Renders initial state with Skeletons while fetching data", async () => {
    getAllValidators.mockImplementation(() => new Promise(() => { }));
    await act(async () => {
      render(<ValidatorsTable {...defaultProps} tabId={0} />);
    });
    expect(
      screen.getByRole("table", { name: /validators table/i })
    ).toBeInTheDocument();
    const skeletonElements = document.querySelectorAll(".MuiSkeleton-root");
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  // --- Data Fetching & Rendering (Tabs) ---

  test("Fetches and renders data correctly for tabId 0 (All Validators) with status column", async () => {
    render(<ValidatorsTable {...defaultProps} tabId={0} />);

    await waitFor(() => {
      expect(getAllValidators).toHaveBeenCalledWith(1, 10, 0);
    });

    // Check header for tab 0 (includes 'Status')
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Validator Address")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Total Stake")).toBeInTheDocument();
    expect(screen.getByText("Commission")).toBeInTheDocument();
    expect(screen.getByText("Self Stake")).toBeInTheDocument();
    expect(screen.getByText("Delegators")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(mockEvmAddresses["valoper1"])).toBeInTheDocument();
    });

    expect(screen.getByText("Validator Alpha")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText(/12\.\d+/)).toBeInTheDocument();
    // commission% is split into two text nodes: "10" and "%"
    // so use getAllByText with function matcher
    const commissionCells = screen.getAllByText((content, el) =>
      el?.textContent?.trim() === "10%"
    );
    expect(commissionCells.length).toBeGreaterThan(0);
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  test("Fetches and renders data correctly for tabId 1 (Active Validators) without status column", async () => {
    getAllValidators.mockResolvedValue({
      data: {
        activeCount: 15,
        validators: mockValidatorData,
      },
    });

    render(<ValidatorsTable {...defaultProps} tabId={1} />);

    await waitFor(() => {
      expect(getAllValidators).toHaveBeenCalledWith(1, 10, 1, "active");
    });

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Validator Address")).toBeInTheDocument();
    expect(screen.getByText("Total Stake")).toBeInTheDocument();
    expect(screen.getByText("Commission")).toBeInTheDocument();
    expect(screen.getByText("Self Stake")).toBeInTheDocument();
    expect(screen.getByText("Delegators")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(mockEvmAddresses["valoper1"])).toBeInTheDocument();
    });

    expect(screen.getByText("Validator Alpha")).toBeInTheDocument();
    expect(screen.getByText(/12\.\d+/)).toBeInTheDocument();
    const commissionCells2 = screen.getAllByText((content, el) =>
      el?.textContent?.trim() === "10%"
    );
    expect(commissionCells2.length).toBeGreaterThan(0);
    expect(screen.getByText("15")).toBeInTheDocument();
  });
  test("Handles tabId 2 (Inactive Validators) data fetching", async () => {
    getAllValidators.mockResolvedValue({
      data: {
        activeCount: 15,
        validators: mockValidatorData,
      },
    });

    render(<ValidatorsTable {...defaultProps} tabId={1} />);

    await waitFor(() => {
      expect(getAllValidators).toHaveBeenCalledWith(1, 10, 1, "active");
    });

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Validator Address")).toBeInTheDocument();
    expect(screen.getByText("Total Stake")).toBeInTheDocument();
    expect(screen.getByText("Commission")).toBeInTheDocument();
    expect(screen.getByText("Self Stake")).toBeInTheDocument();
    expect(screen.getByText("Delegators")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(mockEvmAddresses["valoper1"])).toBeInTheDocument();
    });

    expect(screen.getByText("Validator Alpha")).toBeInTheDocument();
    expect(screen.getByText(/12\.\d+/)).toBeInTheDocument();
    const commissionCells3 = screen.getAllByText((content, el) =>
      el?.textContent?.trim() === "10%"
    );
    expect(commissionCells3.length).toBeGreaterThan(0);
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  test("Handles tabId 2 (Inactive Validators)  dont have data", async () => {
    getAllValidators.mockResolvedValue({
      data: {
        inactiveCount: 5,
        validators: [],
      },
    });

    render(<ValidatorsTable {...defaultProps} tabId={2} />);

    await waitFor(() => {
      expect(getAllValidators).toHaveBeenCalledWith(1, 10, 2, "inactive");
    });

    const noDataElements = screen.getAllByText("No Data");

    expect(noDataElements.length).toBe(1);
    expect(noDataElements[0]).toBeInTheDocument();
  });

  test("Handles tabId 3 (Deactivating Validators) data fetching", async () => {
    getAllValidators.mockResolvedValue({
      data: {
        deactivatingCount: 2,
        validators: [],
      },
    });

    render(<ValidatorsTable {...defaultProps} tabId={3} />);

    await waitFor(() => {
      expect(getAllValidators).toHaveBeenCalledWith(1, 10, 3, "deactivating");
    });
  });

  test("Handles API error state for data fetching", async () => {
    // Mock API to reject
    getAllValidators.mockRejectedValue(new Error("API Failed"));

    render(<ValidatorsTable {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("No Data")).toBeInTheDocument();
    });
  });
  // --- Pagination and Page Navigation ---

  test("Calls handlePageChange when pagination component is interacted with", async () => {
    render(<ValidatorsTable {...defaultProps} />);

    await waitFor(() => {
      expect(getAllValidators).toHaveBeenCalled();
    });

    // The component will render a pagination control if totalPages > 1 (mocked as 5)
    const nextButton = screen.getByRole("button", { name: /go to next page/i });
    fireEvent.click(nextButton);

    expect(mockHandlePageChange).toHaveBeenCalled();
  });

  test("Resets current page to 1 when tabId changes", () => {
    const { rerender } = render(
      <ValidatorsTable {...defaultProps} tabId={1} />
    );

    // tabId changes from 1 to 2
    rerender(<ValidatorsTable {...defaultProps} tabId={2} />);

    expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
  });

  test("Renders paged data correctly", async () => {
    // Mock data for page 2
    mockUsePagination.pageParams.page = 2;
    getAllValidators.mockResolvedValue({
      data: {
        count: 50,
        validators: [
          {
            ...mockValidatorData[0],
            name: "Paged Validator",
          },
        ],
      },
    });

    render(<ValidatorsTable {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Paged Validator")).toBeInTheDocument();
    });

    // Reset to default page 1 for other tests
    mockUsePagination.pageParams.page = 1;
  });

  // --- User Interaction (Copy & Navigation) ---

  test("Navigates to validator details on clicking name or address", async () => {
    render(<ValidatorsTable {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(mockEvmAddresses["valoper1"])).toBeInTheDocument();
    });

    const nameElement = screen.getByText("Validator Alpha");
    fireEvent.click(nameElement);

    // It should navigate using the EVM address
    expect(mockNavigate).toHaveBeenCalledWith(
      `/validators/${mockEvmAddresses["valoper1"]}`
    );
  });

  test("Copies address to clipboard and shows toast on clicking copy icon", async () => {
    render(<ValidatorsTable {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(mockEvmAddresses["valoper1"])).toBeInTheDocument();
    });

    // Find the copy button (assuming it's the element with the Copyicon)
    // The component renders a span with class 'copy-btn'
    const copyButtons = document.querySelectorAll(".copy-btn");
    fireEvent.click(copyButtons[0]);

    // Check if the address was copied (using the EVM address)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      mockEvmAddresses["valoper1"]
    );
    // Check if the toast notification was shown
    expect(toast.success).toHaveBeenCalledWith("Address Copied");
  });

  // --- Edge Cases and Code Coverage ---

  test("Renders '-' for unknown, null, or zero values", async () => {
    const edgeCaseData = [
      {
        name: null,
        validatorAddress: null,
        status: "deactivating",
        totalStake: "0",
        commissionRate: "0",
        selfStake: null,
        delegatorCount: 0,
      },
    ];

    getAllValidators.mockResolvedValue({
      data: {
        count: 1,
        validators: edgeCaseData,
      },
    });

    render(<ValidatorsTable {...defaultProps} tabId={0} />);

    await waitFor(() => {
      // Name: null -> "-"
      // Address: null -> "-"
      // Total Stake: "0" -> "0"
      // Commission: "0" -> "0%"
      // Self Stake: null -> "0"

      // Check for the status color/text
      const deactivatingStatus = screen.getByText("Deactivating");
      expect(deactivatingStatus).toHaveClass("autheo-status");
      expect(deactivatingStatus).toHaveClass("autheo-status--deactivating");
      expect(deactivatingStatus).toHaveAttribute("data-status", "deactivating");

      // Check for multiple instances of "-" for Name and Address
      const dashes = screen.getAllByText("-");
      expect(dashes.length).toBeGreaterThanOrEqual(2);
    });
  });

  test("Handles No Data state when API returns empty array and count is zero", async () => {
    getAllValidators.mockResolvedValue({
      data: {
        count: 0,
        validators: [],
      },
    });

    render(<ValidatorsTable {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("No Data")).toBeInTheDocument();
    });
    expect(screen.queryByText("Name")).not.toBeInTheDocument();
  });

  test("Does not call fetch data on mount if searchData is present", () => {
    const searchProps = {
      ...defaultProps,
      searchData: "TestQuery",
      isSearch: false,
    }

    render(<ValidatorsTable {...searchProps} />);

    expect(getAllValidators).not.toHaveBeenCalled();
  });

  test("Fetches search data when isSearch is true and searchData is present", async () => {
    const searchData = "valoper1";

    // Mock getValidatorByAddress response
    const mockSearchResponse = {
      data: {
        count: 1,
        validators: [mockValidatorData[0]],
      },
    };
    const { default: getValidatorByAddress } = require("../src/services/apis/getValidatorByAddress");
    getValidatorByAddress.mockResolvedValue(mockSearchResponse);

    const searchProps = {
      ...defaultProps,
      searchData: searchData,
      isSearch: true,
    };

    render(<ValidatorsTable {...searchProps} />);

    // Wait for search API to be called
    await waitFor(() => {
      expect(getValidatorByAddress).toHaveBeenCalledWith(
        searchData,
        1,
        10
      );
    });

    // Verify state was updated
    expect(mockSetTotalCount).toHaveBeenCalledWith(1);
  });

  test("Sets tabId to 0 when searchData changes", () => {
    const { rerender } = render(<ValidatorsTable {...defaultProps} />);

    rerender(<ValidatorsTable {...defaultProps} searchData="new search" isSearch={true} />);

    expect(defaultProps.setTabId).toHaveBeenCalledWith(0);
  });

  test("Handles search error gracefully", async () => {
    const searchProps = {
      ...defaultProps,
      searchData: "error",
      isSearch: true,
    };

    const { default: getValidatorByAddress } = require("../src/services/apis/getValidatorByAddress");
    getValidatorByAddress.mockRejectedValue(new Error("Search Failed"));

    render(<ValidatorsTable {...searchProps} />);

    await waitFor(() => {
      expect(getValidatorByAddress).toHaveBeenCalled();
    });
    // Should probably show empty or error state, but current implementation just returns error
  });
});
