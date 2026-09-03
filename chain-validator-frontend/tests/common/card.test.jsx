
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Card from "../../src/components/Common/Card/index.jsx";
jest.mock("../../src/assets/Icons/InfoIcon", () => () => (
  <svg data-testid="info-icon" />
));

describe("Card Component", () => {
  const defaultProps = {
    title: "Total Validators",
    value: 123,
    icon: <div data-testid="icon" />,
  };

  test("renders title, value, and icon correctly", () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.value.toString())).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  test("renders tooltip when tooltipContent is provided", async () => {
    const tooltipText = "This is a tooltip";
    render(<Card {...defaultProps} tooltipContent={tooltipText} />);
    const infoIconButton = screen.getByRole("button");
    expect(infoIconButton).toBeInTheDocument();
    expect(screen.getByTestId("info-icon")).toBeInTheDocument();
    await userEvent.hover(infoIconButton);
    expect(await screen.findByText(tooltipText)).toBeInTheDocument();
  });

  test("shows Skeleton when loading=true", () => {
    render(<Card {...defaultProps} loading={true} />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(
      screen.queryByText(defaultProps.value.toString())
    ).not.toBeInTheDocument();
  });

  test("does not show tooltip when tooltipContent is not provided", () => {
    render(<Card {...defaultProps} />);
    expect(screen.queryByTestId("info-icon")).not.toBeInTheDocument();
  });

  test("handles string and number values", () => {
    render(<Card {...defaultProps} value="0x12345" />);
    expect(screen.getByText("0x12345")).toBeInTheDocument();
  });
});
