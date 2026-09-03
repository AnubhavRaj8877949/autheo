
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfileTable from '../../../src/components/Profile/ProfileTable';

// Mock dependencies
jest.mock('../../../src/constants.ts', () => ({
    CURRENCY: 'THEO',
    VALIDATOR_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        DEACTIVATING: 'deactivating',
    },
}));

jest.mock('../../../src/utils/commonFunctions', () => ({
    noExponential: (val) => val,
}));

jest.mock('../../../src/utils/toFixed', () => ({
    toFixed: (num, decimals) => num.toFixed(decimals),
}));

jest.mock('../../../src/utils/capitalizeFirstLetter', () => ({
    capitalizeFirstLetter: (str) => str.charAt(0).toUpperCase() + str.slice(1),
}));

describe('ProfileTable Component', () => {
    it('renders correctly with valid profile data', () => {
        const mockProfileData = {
            totalStake: '150000000000000000000',
            commissionRate: 0.1,
            status: 'active',
        };

        render(<ProfileTable profileData={mockProfileData} />);

        // Check Headers
        expect(screen.getByText('Total Stake')).toBeInTheDocument();
        expect(screen.getByText('Commission')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();

        expect(screen.getByText('150.0000 THEO')).toBeInTheDocument();
        expect(screen.getByText('10%')).toBeInTheDocument();
        const statusElement = screen.getByText('Active');
        expect(statusElement).toBeInTheDocument();
        expect(statusElement).toHaveClass('autheo-status--active');
        expect(statusElement).toHaveAttribute('data-status', 'active');
    });

    it('renders correctly with inactive status', () => {
        const mockProfileData = {
            totalStake: '0',
            commissionRate: 0,
            status: 'inactive',
        };

        render(<ProfileTable profileData={mockProfileData} />);

        const statusElement = screen.getByText('Inactive');
        expect(statusElement).toBeInTheDocument();
        expect(statusElement).toHaveClass('autheo-status--inactive');
        expect(statusElement).toHaveAttribute('data-status', 'inactive');
    });

    it('renders correctly with other status', () => {
        const mockProfileData = {
            totalStake: '0',
            commissionRate: 0,
            status: 'jailed',
        };

        render(<ProfileTable profileData={mockProfileData} />);

        const statusElement = screen.getByText('Jailed');
        expect(statusElement).toBeInTheDocument();
        expect(statusElement).toHaveStyle('color: inherit');
    });

    it('handles missing data gracefully', () => {
        render(<ProfileTable profileData={{}} />);

        expect(screen.getByText('0 THEO')).toBeInTheDocument();
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
    });
});
