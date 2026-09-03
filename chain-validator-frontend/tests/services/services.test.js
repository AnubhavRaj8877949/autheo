import { getAddress } from '../../src/services/getAddress';
import bondMoreFunds from '../../src/services/bondMoreFunds';
import unBondFunds from '../../src/services/unBondFunds';
import unJailValidator from '../../src/services/unjailValidator';
import { checkTransaction } from '../../src/services/checkTransaction';
import { toast } from '../../src/components/Common/Toast/Toast';
import getTransactionLogs from '../../src/services/apis/checkTransactionLogs';

// Mock dependencies
jest.mock('../../src/components/Common/Toast/Toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../../src/services/apis/checkTransactionLogs', () => jest.fn());

// Mock @cosmjss/proto-signing
jest.mock('@cosmjss/proto-signing', () => ({
    DirectSecp256k1HdWallet: {
        fromMnemonic: jest.fn().mockResolvedValue({
            getAccounts: jest.fn().mockResolvedValue([{ address: 'userAddr' }]),
        }),
    },
    Registry: jest.fn().mockImplementation(() => ({
        register: jest.fn(),
    })),
}));

// Mock @cosmjss/stargate
jest.mock('@cosmjss/stargate', () => ({
    SigningStargateClient: {
        connectWithSigner: jest.fn().mockResolvedValue({
            signAndBroadcast: jest.fn().mockResolvedValue({ code: 0, transactionHash: 'hash' }),
            signAndBroadcastSync: jest.fn().mockResolvedValue({ code: 0, transactionHash: 'hash' }),
        }),
    },
    GasPrice: {
        fromString: jest.fn().mockReturnValue('gasPrice'),
    },
    calculateFee: jest.fn().mockReturnValue({ amount: [], gas: '200000' }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Service Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch.mockClear();
    });

    describe('getAddress', () => {
        it('should return address from mnemonics', async () => {
            // getAddress implementation details might need specific mocking if it uses other libs
            // For now, assuming it uses DirectSecp256k1HdWallet which we mocked
            const addr = await getAddress('mnemonic');
            expect(addr).toBe('userAddr');
        });
    });

    describe('bondMoreFunds', () => {
        it('should call signAndBroadcast', async () => {
            const result = await bondMoreFunds('mnemonic', 'userAddr', 'valAddr', '100');
            expect(result).toEqual({ code: 0, transactionHash: 'hash' });
        });
    });

    describe('unBondFunds', () => {
        it('should call signAndBroadcast', async () => {
            const result = await unBondFunds('mnemonic', 'userAddr', 'valAddr', '100');
            expect(result).toEqual({ code: 0, transactionHash: 'hash' });
        });
    });

    describe('unJailValidator', () => {
        it('should call signAndBroadcast', async () => {
            const result = await unJailValidator('mnemonic', 'valAddr');
            expect(result).toEqual({ code: 0, transactionHash: 'hash' });
        });
    });

    describe('checkTransaction', () => {
        it('should show success toast on success', async () => {
            const navigate = jest.fn();
            getTransactionLogs.mockResolvedValue({ result: { tx_result: { data: 'someData' } } });

            await checkTransaction('hash', navigate);

            expect(toast.success).toHaveBeenCalledWith('Transaction successful');
            expect(navigate).toHaveBeenCalledWith('/dashboard');
        });

        it('should show error toast on failure', async () => {
            const navigate = jest.fn();
            getTransactionLogs.mockResolvedValue({ result: { tx_result: { data: null } } });

            await checkTransaction('hash', navigate);

            expect(toast.error).toHaveBeenCalledWith('Transaction failed');
            expect(navigate).toHaveBeenCalledWith('/dashboard');
        });

        it('should handle exceptions and show error toast', async () => {
            const navigate = jest.fn();
            getTransactionLogs.mockRejectedValue(new Error('Network error'));

            const result = await checkTransaction('hash', navigate);

            expect(toast.error).toHaveBeenCalledWith('Failed to fetch transaction status.');
            expect(result).toBe(false);
        });
    });
});
