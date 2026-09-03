import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import MoonIcon from "../../../src/assets/Icons/MoonIcon";
import BackButton from "../../../src/components/BackButton/BackButton";
import CommonBtn from "../../../src/components/Common/CommonBtn/CommonBtn";
import FormWrapper from "../../../src/components/Common/FormWrapper";
import TextField from "../../../src/components/Common/TextField";

describe("Common Components Coverage", () => {
    const theme = createTheme({
        palette: {
            blue: {
                main: "#000",
                lightBlue: "#eee",
            },
        },
    });

    const AllTheProviders = ({ children }) => {
        return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
    };

    test("MoonIcon", () => {
        const onClick = jest.fn();
        const { container } = render(<MoonIcon onClick={onClick} className="test-class" />);
        const svg = container.querySelector("svg");
        fireEvent.click(svg);
        expect(onClick).toHaveBeenCalled();
    });

    test("BackButton", () => {
        const onClick = jest.fn();
        render(<BackButton onClick={onClick} title="Go Back" />);
        const button = screen.getByRole("button", { name: "Go Back" });
        fireEvent.click(button);
        expect(onClick).toHaveBeenCalled();
    });

    test("CommonBtn - secondary color", () => {
        const onClick = jest.fn();
        render(
            <CommonBtn onClick={onClick} color="secondary">
                Click Me
            </CommonBtn>
        );
        const button = screen.getByRole("button", { name: "Click Me" });
        fireEvent.click(button);
        expect(onClick).toHaveBeenCalled();
    });

    test("FormWrapper", () => {
        render(
            <AllTheProviders>
                <FormWrapper data-testid="wrapper">
                    <span>Child Content</span>
                </FormWrapper>
            </AllTheProviders>
        );
        expect(screen.getByText("Child Content")).toBeInTheDocument();
    });

    test("TextField", () => {
        render(
            <TextField
                placeholder="test placeholder"
                error={true}
                maxLength={20}
            />
        );
        const input = screen.getByPlaceholderText("test placeholder");
        expect(input).toBeInTheDocument();
    });
});
