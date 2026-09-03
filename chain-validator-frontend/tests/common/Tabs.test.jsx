import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider, useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material";
import configureStore from "redux-mock-store";
import Tabs from "../../src/components/Common/Tabs/index.jsx";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

const mockStore = configureStore([]);

const customTheme = createTheme({
  palette: {
    blue: {
      main: "#1976d2",
    },
  },
});

let store;

beforeEach(() => {
  store = mockStore({
    auth: {
      validatorCount: {
        count: 10,
        activeCount: 5,
        inactiveCount: 3,
        deactivatingCount: 2,
      },
    },
  });
  useSelector.mockImplementation((selector) => selector(store.getState()));
});

describe("Tabs Component", () => {
  const tabsData = [
    { label: /All Validators/i, countKey: "count" },
    { label: /Active/i, countKey: "activeCount" },
    { label: /Inactive/i, countKey: "inactiveCount" },
    { label: /Deactivated/i, countKey: "deactivatingCount" },
  ];

  test("renders all tabs with correct counts", () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={customTheme}>
          <Tabs tabId={0} toggleTabHandler={jest.fn()} />
        </ThemeProvider>
      </Provider>
    );

    tabsData.forEach(({ label, countKey }) => {
      const regex = new RegExp(
        `${label.source} \\(${store.getState().auth.validatorCount[countKey]
        }\\)`,
        "i"
      );
      expect(screen.getByText(regex)).toBeInTheDocument();
    });
  });

  test("calls toggleTabHandler on tab click", () => {
    const toggleHandler = jest.fn();
    render(
      <Provider store={store}>
        <ThemeProvider theme={customTheme}>
          <Tabs tabId={0} toggleTabHandler={toggleHandler} />
        </ThemeProvider>
      </Provider>
    );

    const activeTabs = screen.getAllByText(/Active/i);
    fireEvent.click(activeTabs[0]); // choose the first one
    expect(toggleHandler).toHaveBeenCalledWith(1);
  });

  test("disables tabs when isDisable is true", () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={customTheme}>
          <Tabs tabId={0} toggleTabHandler={jest.fn()} isDisable={true} />
        </ThemeProvider>
      </Provider>
    );

    const allTabs = screen.getAllByRole("tab");
    allTabs.forEach((tab) => {
      expect(tab).toHaveClass("disabled");
    });
  });
});
