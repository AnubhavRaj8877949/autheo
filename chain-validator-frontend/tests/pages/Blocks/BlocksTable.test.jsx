import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import BlocksTable from "../../../src/pages/Blocks/BlocksTable";
import getAllBlocks from "../../../src/services/apis/getAllBlocks";
import { showEVMAddress } from "../../../src/services/showEVMAddress";
import { toast } from "../../../src/components/Common/Toast/Toast";
import { useNavigate } from "react-router-dom";

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

jest.mock("../../../src/services/apis/getAllBlocks");
jest.mock("../../../src/services/showEVMAddress");
jest.mock("../../../src/components/Common/Toast/Toast", () => ({
  toast: {
    success: jest.fn(),
  },
}));

jest.mock("../../../src/assets/Icons/SvgIcon", () => ({
  NotFoundIcon: () => <svg data-testid="not-found-icon" />,
}));

jest.mock("../../../src/assets/Icons/CopyIcon", () => (props) => (
  <svg data-testid="copy-icon" {...props} />
));

jest.mock("../../../src/utils/commonFunctions", () => ({
  __esModule: true,
  default: (value) => (value ? `reduced(${value})` : ""),
  reduceData: (value) => (value ? `reduced(${value})` : ""),
  isTimeAgoByCreatedDate: () => "1m ago",
}));

describe("BlocksTable", () => {
  const navigateMock = jest.fn();
  let consoleErrorSpy;

  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(navigateMock);
  });

  it("renders fetched blocks and handles interactions", async () => {
    const blocksPayload = [
      {
        id: 1,
        blockhash: "hash-1234567890",
        blocknumber: 123,
        miner: "validator-address",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];

    getAllBlocks.mockResolvedValue({
      error: false,
      data: { blocks: blocksPayload },
    });
    showEVMAddress.mockReturnValue("evm-validator-address");

    render(<BlocksTable />);

    await waitFor(() =>
      expect(getAllBlocks).toHaveBeenCalledWith(expect.any(Number), expect.any(Number))
    );
    await waitFor(() =>
      expect(showEVMAddress).toHaveBeenCalledWith("validator-address")
    );

    expect(screen.getByText("reduced(hash-1234567890)")).toBeInTheDocument();
    const addressButton = screen.getByText("reduced(evm-validator-address)");
    expect(addressButton).toBeInTheDocument();
    expect(screen.getByText("1m ago")).toBeInTheDocument();

    fireEvent.click(addressButton);
    expect(navigateMock).toHaveBeenCalledWith("/validators/evm-validator-address");

    const copyTrigger = screen.getByTestId("copy-icon").parentElement;
    fireEvent.click(copyTrigger);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "evm-validator-address"
    );
    expect(toast.success).toHaveBeenCalledWith("Copied");
  });

  it("shows error placeholder when block fetch fails", async () => {
    getAllBlocks.mockResolvedValue({
      error: true,
    });

    render(<BlocksTable />);

    await waitFor(() => expect(screen.getByText("No Data")).toBeInTheDocument());
    expect(screen.getByTestId("not-found-icon")).toBeInTheDocument();
  });
});

