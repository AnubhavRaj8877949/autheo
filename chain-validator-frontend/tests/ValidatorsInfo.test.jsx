import "@testing-library/jest-dom";
import "jest-styled-components";
import { render, screen } from "@testing-library/react";
import ValidatorsInfo from "../src/components/Validators/ValidatorsInfo/index.jsx";
import { useSelector } from "react-redux";
import { toFixed } from "../src/utils/toFixed";
import { Wrapper } from "../src/components/Common/Address/styles.js";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("../src/utils/toFixed", () => ({
  toFixed: jest.fn(),
}));

jest.mock("../src/components/Common/Card", () => (props) => (
  <div data-testid="card">
    <span data-testid="card-icon">{props.icon}</span>
    <span data-testid="card-title">{props.title}</span>
    <span data-testid="card-value">{props.value}</span>
  </div>
));

jest.mock("../src/assets/Icons/StakingIcon", () => () => (
  <div data-testid="staking-icon" />
));
jest.mock("../src/assets/Icons/SvgIcon.jsx", () => ({
  TotalValidatorIcon: () => <div data-testid="total-validator-icon" />,
}));
jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

describe("ValidatorsInfo Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockState = {
    drawer: { isSidebarOpen: true },
    auth: { validatorCount: { count: 10 }, APY: 12.3456 },
  };

  test("renders all cards with correct values when data is present", () => {
    useSelector.mockImplementation((callback) => callback(mockState));
    toFixed.mockReturnValue("12.35");

    render(<ValidatorsInfo />);
    expect(screen.getByText("Total Validators")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByTestId("total-validator-icon")).toBeInTheDocument();

    expect(screen.getByText("Staking APR")).toBeInTheDocument();
    expect(screen.getByText("12.35%")).toBeInTheDocument();
    expect(screen.getByTestId("staking-icon")).toBeInTheDocument();
  });

  test("handles empty validatorCount and APY gracefully", () => {
    const emptyState = {
      drawer: { isSidebarOpen: false },
      auth: { validatorCount: null, APY: null },
    };
    useSelector.mockImplementation((callback) => callback(emptyState));
    toFixed.mockReturnValue("0");

    render(<ValidatorsInfo />);

    const cardValues = screen.getAllByTestId("card-value");
    expect(cardValues[0].textContent).toBe("0");
    expect(cardValues[1].textContent).toBe("0");
  });

  test("container applies correct styles based on isSidebarOpen", () => {
    const stateOpen = { drawer: { isSidebarOpen: true }, auth: {} };
    const stateClosed = { drawer: { isSidebarOpen: false }, auth: {} };

    useSelector.mockImplementation((callback) => callback(stateOpen));
    const { rerender } = render(<ValidatorsInfo />);
    const container = screen.getByTestId("container");

    expect(container).toHaveStyle("grid-template-columns: repeat(2, 1fr)");

    useSelector.mockImplementation((callback) => callback(stateClosed));
    rerender(<ValidatorsInfo />);
    const containerClosed = screen.getByTestId("container");
    expect(containerClosed).toHaveStyle(
      "grid-template-columns: repeat(2, 1fr)"
    );
  });

  test("toFixed is called with correct APY value", () => {
    const state = { drawer: { isSidebarOpen: true }, auth: { APY: 15.678 } };
    useSelector.mockImplementation((callback) => callback(state));
    toFixed.mockReturnValue("15.68");

    render(<ValidatorsInfo />);
    expect(toFixed).toHaveBeenCalledWith(15.678, 2);
    expect(screen.getByText("15.68%")).toBeInTheDocument();
  });
});


// describe("Wrapper Styled Component", () => {
//   test("renders correctly with children", () => {
//     render(
//       <Wrapper data-testid="wrapper">
//         <span className="address-text">0x1234567890abcdef</span>
//         <button className="copy-btn">Copy</button>
//       </Wrapper>
//     );

//     const wrapper = screen.getByTestId("wrapper");
//     const addressText = screen.getByText("0x1234567890abcdef");
//     const copyBtn = screen.getByText("Copy");

//     // Check that elements are rendered
//     expect(wrapper).toBeInTheDocument();
//     expect(addressText).toBeInTheDocument();
//     expect(copyBtn).toBeInTheDocument();

//     // Check some CSS applied to wrapper
//     expect(wrapper).toHaveStyleRule("background", "#080808");
//     expect(wrapper).toHaveStyleRule("display", "flex");
//     expect(wrapper).toHaveStyleRule("justify-content", "space-between");
//     expect(wrapper).toHaveStyleRule("align-items", "center");
//     expect(wrapper).toHaveStyleRule("padding", "16px");
//     expect(wrapper).toHaveStyleRule("border-radius", "8px");

//     // Check nested styles
//     expect(wrapper).toHaveStyleRule("fontSize", "16px", { modifier: ".address-text" });
//     expect(wrapper).toHaveStyleRule("fontWeight", "400", { modifier: ".address-text" });
//     expect(wrapper).toHaveStyleRule("overflow", "hidden", { modifier: ".address-text" });
//     expect(wrapper).toHaveStyleRule("textOverflow", "ellipsis", { modifier: ".address-text" });

//     expect(wrapper).toHaveStyleRule("background", "transparent", { modifier: ".copy-btn" });
//     expect(wrapper).toHaveStyleRule("border", "0", { modifier: ".copy-btn" });
//     expect(wrapper).toHaveStyleRule("cursor", "pointer", { modifier: ".copy-btn" });
//     expect(wrapper).toHaveStyleRule("margin-left", "10px", { modifier: ".copy-btn" });
//   });
// });

// /* eslint-disable */
// import { render, screen, fireEvent } from "@testing-library/react";
// import Address from "../src/components/Common/Address";
// import getData from "../src/utils/getData";
// import { toast } from "../src/components/Common/Toast/Toast";
// import { Wrapper } from "../src/components/Common/Address/styles.js";

// // Mock getData and toast
// jest.mock("../src/utils/getData", () => jest.fn());
// jest.mock("../src/components/Common/Toast/Toast", () => ({
//   toast: { success: jest.fn() },
// }));

// // Mock CopyIcon
// jest.mock("../src/assets/Icons/CopyIcon", () => (props) => (
//   <svg data-testid="copy-icon" className={props.className || ""} {...props} />
// ));

// // Mock clipboard
// Object.assign(navigator, {
//   clipboard: {
//     writeText: jest.fn(),
//   },
// });

// describe("Address Component", () => {
//   const address = "0x1234567890abcdef";
//   const minimizedValue = "0x1234...cdef";

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   // ------------------ Address Rendering ------------------
//   test("renders full address when minmize=false", () => {
//     render(<Address address={address} />);
//     expect(screen.getByText(address)).toBeInTheDocument();
//   });

//   test("renders minimized address when minmize=true", () => {
//     getData.mockReturnValue(minimizedValue);
//     render(<Address address={address} minmize={true} />);
//     expect(getData).toHaveBeenCalledWith(address);
//     expect(screen.getByText(minimizedValue)).toBeInTheDocument();
//   });

//   // ------------------ CopyIcon ------------------
//   test("renders CopyIcon properly", () => {
//     render(<Address address={address} />);
//     expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
//   });

//   test("CopyIcon has 'white' class when white prop is true", () => {
//     render(<Address address={address} white={true} />);
//     const copyIcon = screen.getByTestId("copy-icon");
//     expect(copyIcon).toHaveAttribute("class");
//   });

//   // ------------------ Clipboard / Toast ------------------
//   test("copies address on clicking copy button", () => {
//     render(<Address address={address} />);
//     const copyButton = screen.getByTestId("copy-button");
//     fireEvent.click(copyButton);
//     expect(navigator.clipboard.writeText).toHaveBeenCalledWith(address);
//     expect(toast.success).toHaveBeenCalledWith("Address Copied");
//   });

//   // ------------------ Wrapper Existence ------------------
//   test("wrapper renders with correct class", () => {
//     render(<Address address={address} />);
//     const wrapper = screen.getByText(address).closest(".addres-input");
//     expect(wrapper).toBeInTheDocument();
//   });

//   // ------------------ Wrapper Styles ------------------
//   test("Wrapper has correct styles", () => {
//     render(<Address address="0x123" />);

//     const wrapper = screen.getByText("0x123").closest(".addres-input");

//     const styles = getComputedStyle(wrapper);

//     expect(styles.display).toBe("flex");
//     expect(styles.padding).toBe("16px");
//     expect(styles.borderRadius).toBe("8px");
//     expect(styles.justifyContent).toBe("space-between");
//     const addressText = wrapper.querySelector(".address-text");
//     const copyBtn = wrapper.querySelector(".copy-btn");

//     const textStyles = getComputedStyle(addressText);
//     expect(textStyles.fontSize).toBe("1rem");
//     expect(textStyles.overflow).toBe("hidden");
//     expect(textStyles.textOverflow).toBe("ellipsis");

//     const btnStyles = getComputedStyle(copyBtn);
//     expect(btnStyles.cursor).toBe("pointer");
//     expect(btnStyles.marginLeft).toBe("10px");
//     expect(btnStyles.background).toBe("transparent");
//   });

//   // ------------------ Extra props ------------------
//   test("passes extra props to Wrapper", () => {
//     render(<Address address={address} id="test-wrapper" data-custom="abc" />);
//     const wrapper = screen.getByTestId("copy-button").closest(".addres-input");
//     expect(wrapper).toHaveAttribute("id", "test-wrapper");
//     expect(wrapper).toHaveAttribute("data-custom", "abc");
//   });
// });
