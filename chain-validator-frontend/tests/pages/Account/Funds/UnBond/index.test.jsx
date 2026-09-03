import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import UnBond from '../../../../../src/pages/Account/Funds/UnBond/index';
import * as getAddressModule from '../../../../../src/services/getAddress';
import * as unBondFundsModule from '../../../../../src/services/unBondFunds';
import * as checkTransactionModule from '../../../../../src/services/checkTransaction';
import { toast } from '../../../../../src/components/Common/Toast/Toast';

// Mock @keplr-wallet/cosmos to prevent ecc library error
jest.mock('@keplr-wallet/cosmos', () => ({
    TendermintTxTracer: jest.fn(),
}));

// Mock dependencies
jest.mock('../../../../../src/components/Common/Toast/Toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../../../../../src/components/Loader/Loader', () => () => <div>Loading...</div>);
jest.mock('../../../../../src/components/BackButton/BackButton', () => ({ onClick, title }) => (
    <button onClick={onClick}>{title}</button>
));
jest.mock('../../../../../src/components/Common/CommonBtn/CommonBtn.jsx', () => ({ children, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
));
jest.mock('../../../../../src/components/Common/TextField', () => ({ label, name, onChange, value, type, placeholder, helperText }) => (
    <div>
        <label>{label}</label>
        <input
            name={name}
            onChange={onChange}
            value={value}
            type={type}
            placeholder={placeholder}
            data-testid={name}
        />
        {helperText && <p>{helperText}</p>}
    </div>
));
jest.mock('../../../../../src/assets/Icons/SvgIcon.jsx', () => ({
    BackIcon: () => <div>BackIcon</div>,
    MnemonicsIcon: () => <div>MnemonicsIcon</div>,
}));

jest.mock('../../../../../src/services/getAddress');
jest.mock('../../../../../src/services/unBondFunds');
jest.mock('../../../../../src/services/checkTransaction');
jest.mock('../../../../../src/keplrEvents/keplrUnbond', () => ({
    keplrUnbond: jest.fn(),
}));
jest.mock('../../../../../src/cosmostationEvents/unbond', () => ({
    cosmostationUnbond: jest.fn(),
}));

const mockStore = configureStore([]);
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('UnBond Component', () => {
    let store;
    const initialState = {
        auth: {
            userAddress: '0x123',
            userBalance: 1000,
            valoperAddress: 'valoper123',
            walletType: 'noWallet',
            bondedBalance: {
                bondedAmount: 500000000000000000000, // 500 * 10^18
            },
        },
    };

    beforeEach(() => {
        store = mockStore(initialState);
        jest.clearAllMocks();
        localStorage.setItem('node', 'http://localhost:8545');
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('renders unbond form correctly', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Unbond Funds')).toBeInTheDocument();
        expect(screen.getByText('Unbond amount')).toBeInTheDocument();
        expect(screen.getByText('Unbond All')).toBeInTheDocument();
        expect(screen.getByText('Sign and Submit')).toBeInTheDocument();
    });

    it('displays funds available to unbond', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Funds Available To Unbond:')).toBeInTheDocument();
        expect(screen.getByText('500')).toBeInTheDocument(); // 500000000000000000000 / 10^18
    });

    it('shows mnemonics field for noWallet type', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Enter mnemonics to authorize the transaction')).toBeInTheDocument();
    });

    it('does not show mnemonics field for keplr wallet', () => {
        const keplrState = {
            auth: {
                ...initialState.auth,
                walletType: 'keplr',
            },
        };
        store = mockStore(keplrState);

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.queryByText('Enter mnemonics to authorize the transaction')).not.toBeInTheDocument();
    });

    it('displays unbonding period helper text', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText(/Funds unbonded will be available for withdrawal/)).toBeInTheDocument();
    });

    it('sets max unbond amount when Unbond All button is clicked', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const unbondAllButton = screen.getByText('Unbond All');
        fireEvent.click(unbondAllButton);

        const unbondAmountInput = screen.getByTestId('Unbond_Amount');
        expect(unbondAmountInput.value).toBeTruthy();
    });

    it('handles unbond amount input change', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const unbondAmountInput = screen.getByTestId('Unbond_Amount');
        fireEvent.change(unbondAmountInput, { target: { name: 'Unbond_Amount', value: '100' } });

        expect(unbondAmountInput.value).toBe('100');
    });

    it('handles mnemonics input change', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const mnemonicsInput = screen.getByTestId('Mnemonics');
        fireEvent.change(mnemonicsInput, { target: { name: 'Mnemonics', value: 'test mnemonics' } });

        expect(mnemonicsInput.value).toBe('test mnemonics');
    });

    it('disables submit button when unbond amount is empty', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const submitButton = screen.getByText('Sign and Submit');
        expect(submitButton).toBeDisabled();
    });

    it('rejects invalid unbond amount input', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const unbondAmountInput = screen.getByTestId('Unbond_Amount');

        fireEvent.change(unbondAmountInput, { target: { name: 'Unbond_Amount', value: 'abc' } });
        expect(unbondAmountInput.value).toBe('');

        fireEvent.change(unbondAmountInput, { target: { name: 'Unbond_Amount', value: '+100' } });
        expect(unbondAmountInput.value).toBe('');

        fireEvent.change(unbondAmountInput, { target: { name: 'Unbond_Amount', value: '-100' } });
        expect(unbondAmountInput.value).toBe('');
    });

    it('handles successful unbond submission for noWallet', async () => {
        getAddressModule.getAddress = jest.fn().mockResolvedValue('0x123');
        unBondFundsModule.default = jest.fn().mockResolvedValue({ hash: 'tx123' });
        checkTransactionModule.checkTransaction = jest.fn();

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const unbondAmountInput = screen.getByTestId('Unbond_Amount');
        const mnemonicsInput = screen.getByTestId('Mnemonics');

        fireEvent.change(unbondAmountInput, { target: { name: 'Unbond_Amount', value: '100' } });
        fireEvent.change(mnemonicsInput, { target: { name: 'Mnemonics', value: 'test mnemonics phrase' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Sign and Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Sign and Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(getAddressModule.getAddress).toHaveBeenCalledWith('test mnemonics phrase');
        });
    });

    it('shows error when mnemonics do not match', async () => {
        getAddressModule.getAddress = jest.fn().mockResolvedValue('0xDifferentAddress');

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const unbondAmountInput = screen.getByTestId('Unbond_Amount');
        const mnemonicsInput = screen.getByTestId('Mnemonics');

        fireEvent.change(unbondAmountInput, { target: { name: 'Unbond_Amount', value: '100' } });
        fireEvent.change(mnemonicsInput, { target: { name: 'Mnemonics', value: 'wrong mnemonics' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Sign and Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Sign and Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Mnemonics are not same as login');
        });
    });

    it('shows error for invalid mnemonics', async () => {
        getAddressModule.getAddress = jest.fn().mockResolvedValue({ message: 'Invalid mnemonics' });

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const unbondAmountInput = screen.getByTestId('Unbond_Amount');
        const mnemonicsInput = screen.getByTestId('Mnemonics');

        fireEvent.change(unbondAmountInput, { target: { name: 'Unbond_Amount', value: '100' } });
        fireEvent.change(mnemonicsInput, { target: { name: 'Mnemonics', value: 'invalid mnemonics' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Sign and Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Sign and Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Invalid Mnemonics');
        });
    });

    it('navigates back when back button is clicked', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const backButton = screen.getByText('BackIcon').parentElement;
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('sets unbond amount to 0 when bonded balance is 0', () => {
        const zeroBalanceState = {
            auth: {
                ...initialState.auth,
                bondedBalance: {
                    bondedAmount: 0,
                },
            },
        };
        store = mockStore(zeroBalanceState);

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const unbondAllButton = screen.getByText('Unbond All');
        fireEvent.click(unbondAllButton);

        const unbondAmountInput = screen.getByTestId('Unbond_Amount');
        expect(unbondAmountInput.value).toBe('0');
    });

    it('handles keplr wallet unbond submission', async () => {
        const { keplrUnbond } = require('../../../../../src/keplrEvents/keplrUnbond');
        keplrUnbond.mockResolvedValue({ success: true });

        const keplrState = {
            auth: {
                ...initialState.auth,
                walletType: 'keplr',
            },
        };
        store = mockStore(keplrState);

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const unbondAmountInput = screen.getByTestId('Unbond_Amount');
        fireEvent.change(unbondAmountInput, { target: { name: 'Unbond_Amount', value: '100' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Sign and Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Sign and Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(keplrUnbond).toHaveBeenCalledWith(
                '0x123',
                '100',
                'valoper123',
                expect.any(Function),
                expect.any(Function)
            );
        });
    });

    it('handles cosmostation wallet unbond submission', async () => {
        const { cosmostationUnbond } = require('../../../../../src/cosmostationEvents/unbond');
        cosmostationUnbond.mockResolvedValue({ success: true });

        const cosmostationState = {
            auth: {
                ...initialState.auth,
                walletType: 'cosmostation',
            },
        };
        store = mockStore(cosmostationState);

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const unbondAmountInput = screen.getByTestId('Unbond_Amount');
        fireEvent.change(unbondAmountInput, { target: { name: 'Unbond_Amount', value: '200' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Sign and Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Sign and Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(cosmostationUnbond).toHaveBeenCalledWith(
                '0x123',
                '200',
                'valoper123',
                expect.any(Function),
                expect.any(Function)
            );
        });
    });

    it('prevents input with more than 18 decimal places', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const unbondAmountInput = screen.getByTestId('Unbond_Amount');
        const longDecimal = '100.1234567890123456789'; // 19 decimal places

        fireEvent.change(unbondAmountInput, { target: { name: 'Unbond_Amount', value: longDecimal } });

        expect(unbondAmountInput.value).toBe('');
    });

    it('handles transaction error and navigates to dashboard', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

        unBondFundsModule.default = jest.fn().mockRejectedValue(
            new Error('Broadcasting transaction failed with code 5: insufficient funds')
        );
        getAddressModule.getAddress = jest.fn().mockResolvedValue('0x123');

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <UnBond />
                </MemoryRouter>
            </Provider>
        );

        const unbondAmountInput = screen.getByTestId('Unbond_Amount');
        const mnemonicsInput = screen.getByTestId('Mnemonics');

        fireEvent.change(unbondAmountInput, { target: { name: 'Unbond_Amount', value: '100' } });
        fireEvent.change(mnemonicsInput, { target: { name: 'Mnemonics', value: 'test mnemonics phrase' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Sign and Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Sign and Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
            expect(toast.error).toHaveBeenCalled();
        });
    });
});
