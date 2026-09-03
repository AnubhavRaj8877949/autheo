/* eslint-disable */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ValidatorDetails from "../../../../src/pages/Validators/EachValidator/index.jsx";
import { MemoryRouter } from "react-router-dom";
import moment from "moment";
import { showEVMAddress } from "../../../../src/services/showEVMAddress";
import getValidatorByAddress from "../../../../src/services/apis/getValidatorByAddress";

// ─────────────────────────────────────
//            MOCKS
// ─────────────────────────────────────

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(),
    useNavigate: jest.fn(),
}));

jest.mock(
    "../../../../src/assets/Icons/SvgIcon.jsx",
    () => ({
        BackIcon: () => <span data-testid="back-icon">Back Icon</span>,
    }),
    { virtual: true }
);

jest.mock(
    "../../../../src/components/BackButton/BackButton",
    () => () => <span>BackButton</span>,
    { virtual: true }
);

jest.mock("../../../../src/services/apis/getValidatorByAddress", () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("../../../../src/services/showEVMAddress", () => ({
    showEVMAddress: jest.fn(),
}));

jest.mock("../../../../src/utils/capitalizeFirstLetter", () => ({
    capitalizeFirstLetter: jest.fn((val) => val),
}));

jest.mock("../../../../src/utils/toFixed", () => ({
    toFixed: jest.fn((val) => val),
}));

jest.mock("../../../../src/utils/commonFunctions", () => ({
    noExponential: jest.fn((val) => val),
    formatMillionNumber: jest.fn((val) => String(val)),
}));

jest.mock("../../../../src/pages/Validators/EachValidator/Address", () => (props) => (
    <span data-testid="address-display">{props.address}</span>
));

jest.mock("../../../../src/components/Loader/Loader", () => () => <span data-testid="loader">Loading...</span>);

// ─────────────────────────────────────
//       IMPORT MOCKS AFTER SETUP
// ─────────────────────────────────────
import { useParams, useNavigate } from "react-router-dom";

describe("ValidatorDetails Component", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useParams.mockReturnValue({ address: "demo-address" });
        useNavigate.mockReturnValue(mockNavigate);
    });

    const mockValidator = {
        name: "john",
        status: "active",
        commissionRate: "0.12",
        commissionMaxRate: "0.2",
        commissionMaxChangeRate: "0.05",
        totalStake: `${10n * 10n ** 18n}`,
        selfStake: `${2n * 10n ** 18n}`,
        createdAt: "2024-06-01",
        delegatorCount: 15,
        validatorAddress: "evm-123",
    };

    function setup() {
        return render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ValidatorDetails />
            </MemoryRouter>
        );
    }

    // ─────────────────────────────────────
    //        TEST 1: Skeleton rendering
    // ─────────────────────────────────────
    test("renders loading state with skeletons initially", async () => {
        // Delay resolution to ensure we catch the loading state
        let resolvePromise;
        const promise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
        getValidatorByAddress.mockReturnValue(promise);

        setup();
        expect(screen.queryByText("Name")).not.toBeInTheDocument();
        resolvePromise({ data: { validators: [mockValidator] } });
        await waitFor(() => expect(screen.queryByText("Name")).toBeInTheDocument());
    });

    // ─────────────────────────────────────
    //        TEST 2: Full data rendering
    // ─────────────────────────────────────
    test("renders validator details after successful fetch", async () => {
        getValidatorByAddress.mockResolvedValue({
            data: { validators: [mockValidator] },
        });

        showEVMAddress.mockResolvedValue("EVM-ADDRESS-123");

        setup();

        await waitFor(() =>
            expect(screen.getByTestId("address-display")).toBeInTheDocument()
        );

        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("john")).toBeInTheDocument();

        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Active")).toHaveAttribute("data-status", "active");

        expect(screen.getByText("Commission Rate")).toBeInTheDocument();
        expect(screen.getByText(/12%/)).toBeInTheDocument();

        expect(screen.getByText("Total Stake")).toBeInTheDocument();

        expect(
            screen.getByText(moment(mockValidator.createdAt).format("YYYY/MM/DD"))
        ).toBeInTheDocument();

        expect(screen.getByText("15")).toBeInTheDocument();
    });

    // ─────────────────────────────────────
    //        TEST 3: Back button
    // ─────────────────────────────────────
    test("clicking back icon triggers navigate(-1)", async () => {
        getValidatorByAddress.mockResolvedValue({
            data: { validators: [mockValidator] },
        });

        setup();

        await waitFor(() => screen.getByTestId("back-icon"));

        const backIcon = screen.getByTestId("back-icon");
        fireEvent.click(backIcon);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    // ─────────────────────────────────────
    //        TEST 4: showEVMAddress usage
    // ─────────────────────────────────────
    test("fetches EVM address when validatorAddress exists", async () => {
        getValidatorByAddress.mockResolvedValue({
            data: { validators: [mockValidator] },
        });

        showEVMAddress.mockResolvedValue("EVM-CONVERTED");

        setup();

        await waitFor(() =>
            expect(showEVMAddress).toHaveBeenCalledWith("evm-123")
        );

        expect(screen.getByTestId("address-display")).toHaveTextContent(
            "EVM-CONVERTED"
        );
    });

    // ─────────────────────────────────────
    //        TEST 5: Error state handling
    // ─────────────────────────────────────
    test("handles API errors gracefully", async () => {
        getValidatorByAddress.mockRejectedValue(new Error("API Error"));

        setup();

        await waitFor(() =>
            expect(getValidatorByAddress).toHaveBeenCalledWith("demo-address")
        );

        await waitFor(() => expect(screen.getByText("Validator Details")).toBeInTheDocument());
        // Since API failed, fields like "Name" won't be rendered because of validatorDetail?.name check
        // but Commission Rate labels will be there.
        expect(screen.getByText("Commission Rate")).toBeInTheDocument();
    });
});
