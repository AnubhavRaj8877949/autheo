
// Unmock global pollution
jest.unmock('react-redux');
jest.unmock('../../../../src/redux/reducer/auth');

// Mock problematic modules that cause ecc library error
jest.mock("../../../../src/keplrEvents/keplrEditValidator", () => ({
    keplrEditValidator: jest.fn(),
}));
jest.mock("../../../../src/cosmostationEvents/editValidator", () => ({
    cosmostationEditValidator: jest.fn(),
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Profile from "../../../../src/pages/Account/Profile";
import authReducer from "../../../../src/redux/reducer/auth";
import { LOADING_STATES } from "../../../../src/constants";

/* ---------------- MOCK CHILD COMPONENTS ---------------- */

jest.mock("../../../../src/components/Profile/ProfileTable", () => () => (
    <div>ProfileTable</div>
));

jest.mock("../../../../src/components/Funds/ManageAccount/BondTable", () => () => (
    <div>BondTable</div>
));

jest.mock("../../../../src/components/Loader/Loader", () => () => (
    <div>Loader</div>
));
jest.mock("../../../../src/context/NodeUrl", () => ({
    useGetNodeUrl: () => ({
        nodeUrl: "http://mock-node-url",
    }),
}));

jest.mock("../../../../src/services/showEVMAddress", () => ({
    showEVMAddress: jest.fn(() => Promise.resolve("0xMockEVMAddress")),
}));

const { showEVMAddress } = require("../../../../src/services/showEVMAddress");

jest.mock("../../../../src/services/apis/getValidatorByAddress", () => ({
    __esModule: true,
    default: jest.fn(),
}));

/* ---------------- STORE FACTORY ---------------- */

const createStore = (authState) =>
    configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
            auth: {
                userAddress: "testAddress",
                walletType: "keplr",
                ...authState,
            },
        },
    });


/* ===================================================== */
/* ===================== TESTS ========================= */
/* ===================================================== */

describe("Profile Rendering Logic", () => {
    const getValidatorByAddress = require("../../../../src/services/apis/getValidatorByAddress").default;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("✅ SUCCESS + isValidated = false → shows Register button", async () => {
        getValidatorByAddress.mockResolvedValueOnce({
            error: true,
            message: "Not a validator",
        });

        const store = createStore({
            isValidated: false,
        });

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Profile />
                </MemoryRouter>
            </Provider>
        );

        expect(await screen.findByText("Register as a Validator")).toBeInTheDocument();
    });

    test("✅ SUCCESS + isValidated = true → shows Profile Details & Edit Validator", async () => {
        getValidatorByAddress.mockResolvedValueOnce({
            error: false,
            data: {
                validators: [{
                    name: "Test Validator",
                    commissionRate: "0.07",
                    status: "active",
                    details: "Test Validator Description",
                    website: "Test Website",
                    securityContact: "Test Security Contact",
                    identity: "Test Identity",
                    commissionMaxRate: "0.10",
                    commissionMaxChangeRate: "0.05",
                    selfDelegation: "1000000",
                    delegators: "100",
                    totalStake: "1000000",

                }]
            }
        });

        const store = createStore({
            isValidated: true,
        });

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Profile />
                </MemoryRouter>
            </Provider>
        );

        expect(await screen.findByText("Profile Details")).toBeInTheDocument();
        expect(screen.getByText("Edit Validator")).toBeInTheDocument();

        /* ---------- Validator Info ---------- */

        expect(screen.getByText('Validator Name')).toBeInTheDocument();
        expect(screen.getByText('Validator Description')).toBeInTheDocument();
        expect(screen.getByText('Official Website')).toBeInTheDocument();
        expect(screen.getByText('Security Contact')).toBeInTheDocument();
        expect(screen.getByText('Validator Identity')).toBeInTheDocument();
        expect(screen.getByText('Commission Rate')).toBeInTheDocument();
        expect(screen.getByText('Commission Max Rate')).toBeInTheDocument();
        expect(screen.getByText('Commission Max Change Rate')).toBeInTheDocument();

        /* ---------- Stake Section ---------- */

        // expect(screen.getByText('Total Stake')).toBeInTheDocument();
        // expect(screen.getByText('Commission')).toBeInTheDocument();
        // expect(screen.getByText('Status')).toBeInTheDocument();

        /* ---------- Bond Section ---------- */

        // expect(screen.getByText('Bond Details')).toBeInTheDocument();
        // expect(screen.getByText('Bonded')).toBeInTheDocument();
        // expect(screen.getByText('Unbonded')).toBeInTheDocument();
        // expect(screen.getByText('Actions')).toBeInTheDocument();

        // expect(screen.getByText('Bond more funds')).toBeInTheDocument();
        // expect(screen.getByText('Unbond funds')).toBeInTheDocument();
        // expect(screen.getByText('Stop validating')).toBeInTheDocument();
    });

    test("✅ isValidated undefined → fallback branch renders Register", async () => {
        getValidatorByAddress.mockResolvedValueOnce({
            error: true,
        });

        const store = createStore({
            isValidated: undefined,
        });

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Profile />
                </MemoryRouter>
            </Provider>
        );

        expect(await screen.findByText("Register as a Validator")).toBeInTheDocument();
    });

    test("✅ Loading state INIT → shows Loader", async () => {
        // Hang the API call to keep it in loading state
        getValidatorByAddress.mockImplementationOnce(() => new Promise(() => { }));

        const store = createStore({
            isValidated: true,
        });

        const { container } = render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Profile />
                </MemoryRouter>
            </Provider>
        );

        await waitFor(() => expect(showEVMAddress).toHaveBeenCalled());
        expect(container.getElementsByClassName("MuiSkeleton-root").length).toBeGreaterThan(0);
    });

});