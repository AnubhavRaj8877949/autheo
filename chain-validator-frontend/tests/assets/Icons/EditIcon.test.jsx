import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import EditIcon from "../../../src/assets/Icons/EditIcon";

describe("EditIcon Component", () => {
    test("renders EditIcon without crashing", () => {
        const { container } = render(<EditIcon />);
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test("renders with correct viewBox", () => {
        const { container } = render(<EditIcon />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('viewBox', '0 0 28 28');
    });

    test("renders all SVG paths", () => {
        const { container } = render(<EditIcon />);
        const paths = container.querySelectorAll('path');
        expect(paths.length).toBeGreaterThan(0);
    });

    test("renders circle element", () => {
        const { container } = render(<EditIcon />);
        const circle = container.querySelector('circle');
        expect(circle).toBeInTheDocument();
        expect(circle).toHaveAttribute('cx', '14');
        expect(circle).toHaveAttribute('cy', '14');
        expect(circle).toHaveAttribute('r', '14');
    });
});
