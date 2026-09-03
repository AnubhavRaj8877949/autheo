
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Bond from '../../../../../src/pages/Account/Funds/Bond/index';
import * as getAddressModule from '../../../../../src/services/getAddress';
import * as bondMoreFundsModule from '../../../../../src/services/bondMoreFunds';
import * as checkTransactionModule from '../../../../../src/services/checkTransaction';
import { toast } from '../../../../../src/components/Common/Toast/Toast';

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
jest.mock('../../../../../src/components/Common/TextField', () => ({ label, name, onChange, value, type, placeholder }) => (
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
    </div>
));
jest.mock('../../../../../src/assets/Icons/SvgIcon.jsx', () => ({
    BackIcon: () => <div>BackIcon</div>,
}));

jest.mock('../../../../../src/services/getAddress');
jest.mock('../../../../../src/services/bondMoreFunds');
jest.mock('../../../../../src/services/checkTransaction');
jest.mock('../../../../../src/keplrEvents/keplrBondMore', () => ({
    keplrBondMore: jest.fn(),
}));
jest.mock('../../../../../src/cosmostationEvents/bondMore', () => ({
    cosmosStationBondMore: jest.fn(),
}));

const mockStore = configureStore([]);
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Bond Component', () => {
    let store;
    const initialState = {
        auth: {
            userAddress: '0x123',
            userBalance: 1000,
            valoperAddress: 'valoper123',
            walletType: 'noWallet',
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

    it('renders bond form correctly', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Bond More Funds')).toBeInTheDocument();
        expect(screen.getByText('Additional funds to bond')).toBeInTheDocument();
        expect(screen.getByText('Max')).toBeInTheDocument();
        expect(screen.getByText('Sign and Submit')).toBeInTheDocument();
    });

    it('shows mnemonics field for noWallet type', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
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
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.queryByText('Enter mnemonics to authorize the transaction')).not.toBeInTheDocument();
    });

    it('sets max amount when Max button is clicked', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const maxButton = screen.getByText('Max');
        fireEvent.click(maxButton);

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        expect(bondAmountInput.value).toBeTruthy();
    });

    it('handles bond amount input change', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: '100' } });

        expect(bondAmountInput.value).toBe('100');
    });

    it('handles mnemonics input change', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const mnemonicsInput = screen.getByTestId('Mnemonics');
        fireEvent.change(mnemonicsInput, { target: { name: 'Mnemonics', value: 'test mnemonics' } });

        expect(mnemonicsInput.value).toBe('test mnemonics');
    });

    it('disables submit button when bond amount is empty', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const submitButton = screen.getByText('Sign and Submit');
        expect(submitButton).toBeDisabled();
    });

    it('rejects invalid bond amount input', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const bondAmountInput = screen.getByTestId('Bond_Amount');

        // Try to input invalid characters
        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: 'abc' } });
        expect(bondAmountInput.value).toBe('');

        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: '+100' } });
        expect(bondAmountInput.value).toBe('');

        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: '-100' } });
        expect(bondAmountInput.value).toBe('');
    });

    it('handles successful bond submission for noWallet', async () => {
        getAddressModule.getAddress = jest.fn().mockResolvedValue('0x123');
        bondMoreFundsModule.default = jest.fn().mockResolvedValue({ hash: 'tx123' });
        checkTransactionModule.checkTransaction = jest.fn();

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        const mnemonicsInput = screen.getByTestId('Mnemonics');

        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: '100' } });
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
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        const mnemonicsInput = screen.getByTestId('Mnemonics');

        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: '100' } });
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

    it('navigates back when back button is clicked', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const backButton = screen.getByText('BackIcon').parentElement;
        fireEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('sets bond amount to 0 when user balance is 0', () => {
        const zeroBalanceState = {
            auth: {
                ...initialState.auth,
                userBalance: 0,
            },
        };
        store = mockStore(zeroBalanceState);

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const maxButton = screen.getByText('Max');
        fireEvent.click(maxButton);

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        expect(bondAmountInput.value).toBe('0');
    });

    it('displays note about account status update', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('NOTE:')).toBeInTheDocument();
        expect(screen.getByText('Your account status may take some time to update.')).toBeInTheDocument();
    });

    it('shows error message when bond amount is 0', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: '0' } });

        await waitFor(() => {
            expect(screen.getByText('Bonded amount must be greater than 0')).toBeInTheDocument();
        });
    });

    it('shows error message when bond amount is empty and user tries to submit', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: '' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Sign and Submit');
            expect(submitButton).toBeDisabled();
        });
    });

    it('displays whole balance when Max button is clicked', () => {
        const balanceState = {
            auth: {
                ...initialState.auth,
                userBalance: 5000.123456,
            },
        };
        store = mockStore(balanceState);

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const maxButton = screen.getByText('Max');
        fireEvent.click(maxButton);

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        expect(bondAmountInput.value).toContain('5000');
    });

    it('handles keplr wallet bond submission', async () => {
        const { keplrBondMore } = require('../../../../../src/keplrEvents/keplrBondMore');
        keplrBondMore.mockResolvedValue({ success: true });

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
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: '100' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Sign and Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Sign and Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(keplrBondMore).toHaveBeenCalledWith(
                '0x123',
                '100',
                'valoper123',
                expect.any(Function),
                expect.any(Function)
            );
        });
    });

    it('handles cosmostation wallet bond submission', async () => {
        const { cosmosStationBondMore } = require('../../../../../src/cosmostationEvents/bondMore');
        cosmosStationBondMore.mockResolvedValue({ success: true });

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
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: '200' } });

        await waitFor(() => {
            const submitButton = screen.getByText('Sign and Submit');
            expect(submitButton).not.toBeDisabled();
        });

        const submitButton = screen.getByText('Sign and Submit');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(cosmosStationBondMore).toHaveBeenCalledWith(
                '0x123',
                'valoper123',
                '200',
                expect.any(Function),
                expect.any(Function)
            );
        });
    });



    it('shows error when bond amount exceeds user balance', async () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: '10000' } });

        await waitFor(() => {
            expect(screen.getByText('You have insufficient balance')).toBeInTheDocument();
        });
    });

    it('prevents input with more than 18 decimal places', () => {
        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        const longDecimal = '100.1234567890123456789'; // 19 decimal places

        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: longDecimal } });

        // Should not update because it has more than 18 decimal places
        expect(bondAmountInput.value).toBe('');
    });

    it('handles transaction error and navigates to dashboard', async () => {
        bondMoreFundsModule.default = jest.fn().mockRejectedValue(
            new Error('Broadcasting transaction failed with code 5: insufficient funds')
        );
        getAddressModule.getAddress = jest.fn().mockResolvedValue('0x123');

        render(
            <Provider store={store}>
                <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Bond />
                </MemoryRouter>
            </Provider>
        );

        const bondAmountInput = screen.getByTestId('Bond_Amount');
        const mnemonicsInput = screen.getByTestId('Mnemonics');

        fireEvent.change(bondAmountInput, { target: { name: 'Bond_Amount', value: '100' } });
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
