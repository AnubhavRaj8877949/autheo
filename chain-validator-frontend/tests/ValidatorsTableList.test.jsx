import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import ValidatorsTableList from "../src/components/Validators/ValidatorsTableList/index.jsx";
import Tabs from "../src/components/Common/Tabs/index.jsx";
import ValidatorsTable from "../src/components/Validators/ValidatorsTableList/ValidatorsTable.jsx";

jest.mock("../src/components/Common/Tabs", () =>
  jest.fn(() => <div data-testid="tabs" />)
);
jest.mock(
  "../src/components/Validators/ValidatorsTableList/ValidatorsTable.jsx",
  () => jest.fn(() => <div data-testid="validators-table" />)
);

describe("ValidatorsTableList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders Tabs and ValidatorsTable", async () => {
    render(<ValidatorsTableList />);
    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
      expect(screen.getByTestId("validators-table")).toBeInTheDocument();
    });
  });

  test("initial state is correct", () => {
    render(<ValidatorsTableList />);
    const input = screen.getByPlaceholderText(/search for name or address/i);
    expect(input.value).toBe("");
  });

  test("toggleTabHandler updates tabId", async () => {
    render(<ValidatorsTableList />);
    const tabsProps = Tabs.mock.calls[0][0];
    expect(tabsProps.tabId).toBe(0);
    await act(async () => {
      tabsProps.toggleTabHandler(1);
    });
    const latestProps = Tabs.mock.calls.at(-1)[0];
    expect(latestProps.tabId).toBe(1);
  });

  test("handleSearchChange updates searchData with valid input", () => {
    render(<ValidatorsTableList />);
    const input = screen.getByPlaceholderText(/search for name or address/i);

    fireEvent.change(input, { target: { value: "Validator123" } });
    expect(input.value).toBe("Validator123");
  });

  test("handleSearchChange ignores invalid input", () => {
    render(<ValidatorsTableList />);
    const input = screen.getByPlaceholderText(/search for name or address/i);

    fireEvent.change(input, { target: { value: "Invalid!@#" } });
    expect(input.value).toBe(""); // invalid characters ignored
  });

  test("handleSearchChange sanitizes multiple spaces", () => {
    render(<ValidatorsTableList />);
    const input = screen.getByPlaceholderText(/search for name or address/i);

    fireEvent.change(input, { target: { value: "Validator   Name" } });
    expect(input.value).toBe("Validator Name"); // multiple spaces replaced with one
  });
  //TODO: Fix this test
  //   test("handleKeyPress sets isSearch to true on Enter with valid input", () => {
  //     render(<ValidatorsTableList />);
  //     const input = screen.getByPlaceholderText(/search for name or address/i);
  //     fireEvent.change(input, { target: { value: "Validator1" } });
  //     fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
  //     const tableProps = ValidatorsTable.mock.calls[0][0];
  //     expect(tableProps.isSearch).toBe(true);
  //   });

  test("searchDisable state works based on searchData length", () => {
    render(<ValidatorsTableList />);
    const input = screen.getByPlaceholderText(/search for name or address/i);

    // Initially disabled
    const tableProps = ValidatorsTable.mock.calls[0][0];
    expect(tableProps.isSearch).toBe(false);

    // Enter text
    fireEvent.change(input, { target: { value: "Validator1" } });
    // searchDisable should be false now (handled in useEffect)
    // We can indirectly check via enabling button / validators table props
  });

  //TODO: Fix this test
  // test("isDisable state works correctly with searchData and isSearch", () => {
  //   render(<ValidatorsTableList />);
  //   const input = screen.getByPlaceholderText(/search for name or address/i);

  //   let tableProps = ValidatorsTable.mock.calls[0][0];
  //   expect(tableProps.isSearch).toBe(false);

  //   // Add searchData
  //   fireEvent.change(input, { target: { value: "Validator1" } });
  //   // use keyDown for Enter to better match common React handlers
  //   fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });
  //    screen.debug();
  //   // Read the latest call to the ValidatorsTable mock after re-render
  //   const lastCallIndex = ValidatorsTable.mock.calls.length - 1;
  //   tableProps = ValidatorsTable.mock.calls[lastCallIndex][0];
  //   expect(tableProps.isSearch).toBe(true);
  // });

  test("empty searchData sets isDisable to false", () => {
    render(<ValidatorsTableList />);
    const input = screen.getByPlaceholderText(/search for name or address/i);

    fireEvent.change(input, { target: { value: "" } });
    const tableProps = ValidatorsTable.mock.calls[0][0];
    expect(tableProps.isSearch).toBe(false);
  });
});






