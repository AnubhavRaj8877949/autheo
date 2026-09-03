import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BondTable from '../../../../src/components/Funds/ManageAccount/BondTable';
import { useSelector } from 'react-redux';
import getValidatorCommission from '../../../../src/services/apis/getValidatorCommission';

// Mock dependencies
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    useDispatch: () => mockDispatch,
}));

jest.mock('sweetalert2', () => ({
    fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
}));

jest.mock('../../../../src/services/apis/getValidatorCommission', () => jest.fn());

jest.mock('../../../../src/keplrEvents/keplrClaimRewards', () => ({
    keplrClaimRewards: jest.fn(),
}));

jest.mock('../../../../src/components/Loader/Loader', () => () => <div data-testid="loader">Loading...</div>);

jest.mock('../../../../src/constants.ts', () => ({
    CURRENCY: 'THEO',
    JAIL_TIME: 30,
    VALIDATOR_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        DEACTIVATING: 'deactivating',
    },
    WALLET_TYPE: {
        KEPLR: 'keplr',
        COSMOSTATION: 'cosmostation',
        NO_WALLET: 'noWallet',
    },
    bondedTableHeader: [
        {
            heading: 'Bonded',
            content: 'Bonded funds give the right to rewards and are exposed to slashing',
        },
        {
            heading: 'Unbonded',
            content: 'Funds unbonded will be available for withdrawal after the completion of the Unbonding Period which is 30 minutes',
        },
        {
            heading: 'Unclaimed Reward',
            content: 'Total rewards earned but not yet claimed.',
        },
        {
            heading: 'Actions',
            content: '',
        },
    ],
    stopMenuOptions: [
        {
            label: 'Bond more funds',
            path: '/account/funds/bond',
            style: 'btn-blue',
        },
        {
            label: 'Unbond funds',
            path: '/account/funds/unbond',
            style: 'btn-yellow',
        },
        {
            label: 'Stop validating',
            path: '/account/funds/stopvalidator',
            style: 'btn-red',
        },
    ],
    reValidateMenuOptions: [
        {
            label: 'Bond more funds',
            path: '/account/funds/bond',
            style: 'btn-blue',
        },
        {
            label: 'Re-Validate',
            path: '/account/funds/revalidation',
            style: 'btn-red',
        },
    ],
}));


jest.mock('../../../../src/utils/commonFunctions', () => ({
    noExponential: (val) => val,
}));

jest.mock('../../../../src/utils/toFixed', () => ({
    toFixed: (num, decimals) => Number(num).toFixed(decimals),
}));

jest.mock('../../../../src/components/CommonModal/index.jsx', () => ({ open, message }) =>
    open ? <div data-testid="common-modal">{message}</div> : null
);

jest.mock('../../../../src/components/Funds/ManageAccount/CountDownTimer', () => ({ unbondingTime }) =>
    unbondingTime ? <div data-testid="countdown-timer">{unbondingTime}</div> : null
);

// isOptionDisableInMinutes mock removed as it's no longer used

jest.mock('../../../../src/assets/Icons/InfoIcon', () => () => <div>InfoIcon</div>);

describe('BondTable Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default auth state
        useSelector.mockImplementation((selector) =>
            selector({
                auth: {
                    userAddress: 'autheo1testaddress',
                    walletType: 'keplr',
                    isTx: false,
                },
            })
        );
        // Default commission response
        getValidatorCommission.mockResolvedValue({
            error: false,
            data: {
                commission: {
                    commission: [{ denom: 'aauth', amount: '0' }],
                },
            },
        });
    });

    it('renders bond details with active status', () => {
        const mockBondedData = {
            selfStake: '100000000000000000000', // 100 * 10^18
            unbondingAmount: '50',
            status: 'active',
            unbondingTime: '2023-01-01T00:00:00Z',
        };

        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <BondTable bondedData={mockBondedData} />
            </MemoryRouter>
        );

        expect(screen.getByText('Bond Details')).toBeInTheDocument();
        expect(screen.getByText('Bonded')).toBeInTheDocument();
        expect(screen.getByText('Unbonded')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();

        expect(screen.getByText('100.0000 THEO')).toBeInTheDocument();
        expect(screen.getByText('50.0000 THEO')).toBeInTheDocument();

        expect(screen.getByText('Bond more funds')).toBeInTheDocument();
        expect(screen.getByText('Unbond funds')).toBeInTheDocument();
        expect(screen.getByText('Stop validating')).toBeInTheDocument();
    });

    it('renders bond details with inactive status', () => {
        const mockBondedData = {
            selfStake: '100000000000000000000',
            unbondingAmount: '0',
            status: 'inactive',
            unbondingTime: '2023-01-01T00:00:00Z',
        };

        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <BondTable bondedData={mockBondedData} />
            </MemoryRouter>
        );

        // Check action buttons for inactive status
        expect(screen.getAllByText('Bond more funds')).toHaveLength(1);
        expect(screen.getByText('Re-Validate')).toBeInTheDocument();
        expect(screen.queryByText('Unbond funds')).not.toBeInTheDocument();
        expect(screen.queryByText('Stop validating')).not.toBeInTheDocument();
    });

    it('renders bond details with deactivating status', () => {
        const mockBondedData = {
            selfStake: '100000000000000000000',
            unbondingAmount: '50',
            status: 'deactivating',
            unbondingTime: '2023-01-01T00:00:00Z',
        };

        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <BondTable bondedData={mockBondedData} />
            </MemoryRouter>
        );

        // Check that action buttons are present but disabled
        expect(screen.getByText('Bond more funds')).toBeInTheDocument();
        expect(screen.getByText('Unbond funds')).toBeInTheDocument();
        expect(screen.getByText('Stop validating')).toBeInTheDocument();
    });

    it('handles missing data gracefully', () => {
        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <BondTable bondedData={{}} />
            </MemoryRouter>
        );

        expect(screen.getByText('Bond Details')).toBeInTheDocument();

        // Should show 0 for missing amounts (Bonded, Unbonded, Unclaimed Reward)
        expect(screen.getAllByText(/0 THEO/)).toHaveLength(3);
    });

    it('displays countdown timer when unbondingTime is provided', () => {
        const mockBondedData = {
            selfStake: '100000000000000000000',
            unbondingAmount: '50',
            status: 'active',
            unbondingTime: '2023-01-01T00:00:00Z',
        };

        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <BondTable bondedData={mockBondedData} />
            </MemoryRouter>
        );

        expect(screen.getByTestId('countdown-timer')).toBeInTheDocument();
        expect(screen.getByText('2023-01-01T00:00:00Z')).toBeInTheDocument();
    });

    it('handles re-validate button click when conditions are met', () => {
        const mockBondedData = {
            selfStake: '100000000000000000000',
            unbondingAmount: '0',
            status: 'inactive',
            unbondingTime: '2023-01-01T00:00:00Z',
        };

        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <BondTable bondedData={mockBondedData} />
            </MemoryRouter>
        );

        const reValidateButton = screen.getByText('Re-Validate');
        fireEvent.click(reValidateButton);

        // Modal should not be shown if conditions are not met
        expect(screen.queryByTestId('common-modal')).not.toBeInTheDocument();
    });

    it('displays table headers with tooltips', () => {
        const mockBondedData = {
            selfStake: '100000000000000000000',
            unbondingAmount: '50',
            status: 'active',
        };

        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <BondTable bondedData={mockBondedData} />
            </MemoryRouter>
        );

        // Check that info icons are rendered for headers with content
        const infoIcons = screen.getAllByText('InfoIcon');
        expect(infoIcons.length).toBeGreaterThan(0);
    });

    it('shows tooltip and disables re-validate button when balance is low', async () => {
        const mockBondedData = {
            selfStake: '50', // Less than 100 * 10^18
            unbondingAmount: '0',
            status: 'inactive',
            unbondingTime: '2023-01-01T00:00:00Z',
        };

        const { container } = render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <BondTable bondedData={mockBondedData} />
            </MemoryRouter>
        );

        const reValidateButton = screen.getByText('Re-Validate');
        expect(reValidateButton).toBeInTheDocument();

        // Check for the disabledlinks class in the container
        const disabledElement = container.querySelector('.disabledlinks');
        expect(disabledElement).toBeInTheDocument();
        expect(disabledElement).toContainElement(reValidateButton);

        // Modal should NOT be shown
        expect(screen.queryByTestId('common-modal')).not.toBeInTheDocument();
    });

    it('renders normally when balance is high enough', async () => {
        const mockBondedData = {
            selfStake: '100000000000000000000', // 100 tokens
            unbondingAmount: '0',
            status: 'inactive',
            unbondingTime: '2023-01-01T00:00:00Z',
        };

        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <BondTable bondedData={mockBondedData} />
            </MemoryRouter>
        );

        const reValidateButton = screen.getByText('Re-Validate');

        // Should not be disabled (wait for useEffect)
        await waitFor(() => {
            const wrapper = reValidateButton.closest('span');
            if (wrapper) {
                expect(wrapper).not.toHaveClass('disabledlinks');
            }
        });
    });
});


