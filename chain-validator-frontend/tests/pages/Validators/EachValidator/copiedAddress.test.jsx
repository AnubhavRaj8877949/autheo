import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Address from '../../../../src/pages/Validators/EachValidator/Address';
import { toast } from '../../../../src/components/Common/Toast/Toast';

jest.mock('../../../../src/components/Common/Toast/Toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../../../../src/assets/Icons/CopyIcon', () => () => <div>CopyIcon</div>);

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
});

describe('Address Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders address text correctly', () => {
        const testAddress = '0x1234567890abcdef';

        render(<Address address={testAddress} />);

        expect(screen.getByText(testAddress)).toBeInTheDocument();
    });

    it('shows copy icon when showIcon is true', () => {
        render(<Address address="0x123" showIcon={true} />);

        expect(screen.getByText('CopyIcon')).toBeInTheDocument();
    });

    it('hides copy icon when showIcon is false', () => {
        render(<Address address="0x123" showIcon={false} />);

        expect(screen.queryByText('CopyIcon')).not.toBeInTheDocument();
    });

    it('hides copy icon when showIcon is not provided', () => {
        render(<Address address="0x123" />);

        expect(screen.queryByText('CopyIcon')).not.toBeInTheDocument();
    });

    it('copies address to clipboard when copy icon is clicked', () => {
        const testAddress = '0x1234567890abcdef';

        render(<Address address={testAddress} showIcon={true} />);

        const copyButton = screen.getByText('CopyIcon').parentElement;
        fireEvent.click(copyButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testAddress);
        expect(toast.success).toHaveBeenCalledWith('Address Copied');
    });

    it('accepts additional props', () => {
        const { container } = render(
            <Address address="0x123" showIcon={true} data-testid="custom-address" />
        );

        const wrapper = container.querySelector('.addres-input');
        expect(wrapper).toBeInTheDocument();
    });
});
