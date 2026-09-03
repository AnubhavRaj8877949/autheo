
// Unmock global pollution
jest.unmock('react-redux');
jest.unmock('../../../../../src/redux/reducer/auth');

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../../../../src/redux/reducer/auth';
import AuthorizeTransaction from '../../../../../src/pages/Account/Funds/Authorize/index';

/* -------------------- HELPERS -------------------- */

const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location-display">{location.pathname}</div>;
};

/* -------------------- MOCKS -------------------- */

jest.mock('../../../../../src/components/Common/Toast/Toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../../../../../src/components/Loader/Loader', () => () => <div data-testid="loader">Loading...</div>);
jest.mock('../../../../../src/components/BackButton/BackButton', () => ({ onClick, title }) => (
    <button onClick={onClick} data-testid="back-button">{title}</button>
));
jest.mock('../../../../../src/components/Common/CommonBtn/CommonBtn.jsx', () => ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} data-testid="submit-button">{children}</button>
));
jest.mock('../../../../../src/components/Common/TextField', () => ({ label, onChange, type, placeholder }) => (
    <div>
        <label>{label}</label>
        <input
            onChange={onChange}
            type={type}
            placeholder={placeholder}
            data-testid="mnemonics-input"
        />
    </div>
));
jest.mock('../../../../../src/components/Common/Address', () => ({ address }) => (
    <div data-testid="wallet-address">{address}</div>
));
jest.mock('../../../../../src/services/showEVMAddress', () => ({
    showEVMAddress: jest.fn(() => Promise.resolve('0x123EVM')),
}));
jest.mock('../../../../../src/components/Common/FormWrapper', () => ({ children, className }) => (
    <div className={className}>{children}</div>
));
jest.mock('../../../../../src/assets/Icons/SvgIcon', () => ({
    BackIcon: () => <div>BackIcon</div>,
    MnemonicsIcon: () => <div>MnemonicsIcon</div>,
}));

// Mock services
jest.mock('../../../../../src/services/getAddress', () => ({
    getAddress: jest.fn(() => Promise.resolve('0x123')),
}));
jest.mock('../../../../../src/services/unBondFunds', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve({ success: true })),
}));
jest.mock('../../../../../src/services/unjailValidator', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve({ code: 0 })),
}));
jest.mock('../../../../../src/services/checkTransaction', () => ({
    checkTransaction: jest.fn((resp, nav) => nav('/dashboard')),
}));

// Mock event modules
jest.mock('../../../../../src/keplrEvents/keplrUnbond', () => ({ keplrUnbond: jest.fn() }));
jest.mock('../../../../../src/keplrEvents/keplrUnjail', () => ({ keplrUnjail: jest.fn() }));
jest.mock('../../../../../src/cosmostationEvents/unbond', () => ({ cosmostationUnbond: jest.fn() }));
jest.mock('../../../../../src/cosmostationEvents/unjail', () => ({ cosmostationUnjail: jest.fn() }));

/* -------------------- TEST SUITE -------------------- */

describe('AuthorizeTransaction Component', () => {
    const unBondFunds = require('../../../../../src/services/unBondFunds').default;
    const unJailValidator = require('../../../../../src/services/unjailValidator').default;
    const { keplrUnbond } = require('../../../../../src/keplrEvents/keplrUnbond');

    const getInitialState = () => ({
        auth: {
            userAddress: '0x123',
            valoperAddress: 'valoper123',
            walletType: 'noWallet',
            isValidated: true,
            isLoggedIn: true,
            loading: false,
            bondedBalance: {
                bondedAmount: 500000000000000000000,
            },
        },
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const renderWithStore = (state = getInitialState(), path = '/account/funds/stopvalidator') => {
        const store = configureStore({
            reducer: {
                auth: authReducer,
            },
            preloadedState: state,
        });

        return render(
            <Provider store={store}>
                <MemoryRouter
                    initialEntries={[path]}
                    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
                >
                    <LocationDisplay />
                    <Routes>
                        <Route path="/account/funds/:type" element={<AuthorizeTransaction />} />
                        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );
    };

    describe('Rendering', () => {
        it('renders the component with correct title and address', async () => {
            renderWithStore();
            expect(await screen.findByText('Stop Validator')).toBeInTheDocument();
        });

        it('shows mnemonics input when walletType is noWallet', async () => {
            renderWithStore();
            expect(await screen.findByTestId('mnemonics-input')).toBeInTheDocument();
        });
    });

    describe('Transaction Logic', () => {
        it('handles unbond for noWallet', async () => {
            renderWithStore();
            fireEvent.change(screen.getByTestId('mnemonics-input'), { target: { value: 'test' } });
            fireEvent.click(screen.getByTestId('submit-button'));

            await waitFor(() => {
                expect(unBondFunds).toHaveBeenCalled();
            });

            // Advance timers to trigger the setTimeout(..., 3000)
            act(() => {
                jest.runAllTimers();
            });

            await waitFor(() => {
                expect(screen.getByTestId('location-display')).toHaveTextContent('/dashboard');
            });
        });

        it('handles keplr unbond with correct arguments', async () => {
            const state = getInitialState();
            state.auth.walletType = 'keplr';
            renderWithStore(state);

            fireEvent.click(screen.getByTestId('submit-button'));

            await waitFor(() => {
                expect(keplrUnbond).toHaveBeenCalledWith(
                    '0x123',
                    500,
                    'valoper123',
                    expect.any(Function),
                    expect.any(Function),
                    'stopvalidator'
                );
            });
        });

        it('handles unjail for noWallet', async () => {
            renderWithStore(getInitialState(), '/account/funds/revalidation');
            fireEvent.change(screen.getByTestId('mnemonics-input'), { target: { value: 'test' } });
            fireEvent.click(screen.getByTestId('submit-button'));

            await waitFor(() => {
                expect(unJailValidator).toHaveBeenCalled();
            });

            // Revalidation also has a navigation timeout likely? 
            // Actually let's check Authorize/index.jsx for revalidation branch.
            act(() => {
                jest.runAllTimers();
            });

            await waitFor(() => {
                expect(screen.getByTestId('location-display')).toHaveTextContent('/dashboard');
            });
        });
    });
});
