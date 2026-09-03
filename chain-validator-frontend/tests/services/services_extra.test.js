import createValidator from '../../src/services/createValidator';
import editValidator from '../../src/services/editValidator';
import { getAddress } from '../../src/services/getAddress';
import getPrice from '../../src/services/getPrice';
import { toast } from '../../src/components/Common/Toast/Toast';
import { ChainConfig } from '../../src/constants';

// Mock dependencies
jest.mock('../../src/components/Common/Toast/Toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

// Mock @cosmjss/proto-signing
jest.mock('@cosmjss/proto-signing', () => ({
    DirectSecp256k1HdWallet: {
        fromMnemonic: jest.fn().mockResolvedValue({
            getAccounts: jest.fn().mockResolvedValue([{ address: 'userAddr' }]),
        }),
    },
}));

// Mock @cosmjss/stargate
jest.mock('@cosmjss/stargate', () => ({
    SigningStargateClient: {
        connectWithSigner: jest.fn().mockResolvedValue({
            signAndBroadcast: jest.fn().mockResolvedValue({ code: 0, transactionHash: 'hash' }),
        }),
    },
    GasPrice: {
        fromString: jest.fn().mockReturnValue('gasPrice'),
    },
    calculateFee: jest.fn().mockReturnValue({ amount: [], gas: '280000' }),
}));

// Mock @cosmjss/encoding
jest.mock('@cosmjss/encoding', () => ({
    fromBase64: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
}));

// Mock cosmjs-types
jest.mock('cosmjs-types/cosmos/staking/v1beta1/tx', () => ({
    MsgCreateValidator: {
        fromPartial: jest.fn().mockReturnValue({}),
    },
    MsgEditValidator: {
        fromPartial: jest.fn().mockReturnValue({}),
    },
}));
jest.mock('cosmjs-types/cosmos/crypto/secp256k1/keys', () => ({
    PubKey: {
        fromPartial: jest.fn().mockReturnValue({}),
        encode: jest.fn().mockReturnValue({
            finish: jest.fn().mockReturnValue(new Uint8Array([4, 5, 6])),
        }),
    },
}));

// Mock fetch
global.fetch = jest.fn();

describe('Extra Service Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    describe('createValidator', () => {
        const mnemonics = 'test mnemonic';
        const primaryValues = {
            name: 'Test',
            identity: 'Identity',
            website: 'http://test.com',
            SecurityContact: 'Contact',
            details: 'Details',
        };
        const secondaryValues = {
            Bond_Amount: '100',
            Commission_Rate: '10',
            Max_Rate: '20',
            Max_Change_Rate: '5',
        };
        const nodeUrl = 'http://node.url';
        const valoperAddress = 'valoper123';

        it('should successfully create a validator', async () => {
            localStorage.setItem('publicKey', 'pubkey64');
            const result = await createValidator(mnemonics, primaryValues, secondaryValues, nodeUrl, valoperAddress);
            expect(result).toEqual({ code: 0, transactionHash: 'hash' });
        });

        it('should handle missing optional values in createValidator', async () => {
            const emptyPrimary = {};
            const emptySecondary = { Bond_Amount: '' };
            const result = await createValidator(mnemonics, emptyPrimary, emptySecondary, nodeUrl, '');
            expect(result).toEqual({ code: 0, transactionHash: 'hash' });
        });

        it('should handle errors in createValidator', async () => {
            const { DirectSecp256k1HdWallet } = require('@cosmjss/proto-signing');
            DirectSecp256k1HdWallet.fromMnemonic.mockRejectedValueOnce(new Error('Mnemonic error'));

            const result = await createValidator(mnemonics, primaryValues, secondaryValues, nodeUrl, valoperAddress);
            expect(result).toBeUndefined();
            expect(toast.error).toHaveBeenCalledWith('Could not validate check your keys & values');
        });
    });

    describe('editValidator', () => {
        const mnemonics = 'test mnemonic';
        const primaryValues = {
            name: 'Test',
            identity: 'Identity',
            website: 'http://test.com',
            SecurityContact: 'Contact',
            details: 'Details',
            CommissionRate: '15',
        };
        const nodeUrl = 'http://node.url';
        const valoperAddress = 'valoper123';

        it('should successfully edit a validator', async () => {
            const result = await editValidator(mnemonics, primaryValues, nodeUrl, valoperAddress, false);
            expect(result).toEqual({ code: 0, transactionHash: 'hash' });
        });

        it('should handle missing optional values in editValidator', async () => {
            const emptyPrimary = {};
            const result = await editValidator(mnemonics, emptyPrimary, nodeUrl, valoperAddress, true);
            expect(result).toEqual({ code: 0, transactionHash: 'hash' });
        });

        it('should successful edit a validator with missing config properties', async () => {
            const originalCurrencies = ChainConfig.currencies;
            ChainConfig.currencies = [{}]; // Missing coinMinimalDenom

            const result = await editValidator(mnemonics, primaryValues, nodeUrl, valoperAddress, false);
            expect(result).toEqual({ code: 0, transactionHash: 'hash' });

            ChainConfig.currencies = originalCurrencies;
        });
    });

    describe('getAddress', () => {
        it('should handle errors in getAddress', async () => {
            const { DirectSecp256k1HdWallet } = require('@cosmjss/proto-signing');
            DirectSecp256k1HdWallet.fromMnemonic.mockRejectedValueOnce(new Error('Address error'));

            const result = await getAddress('invalid mnemonic');
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Address error');
        });
    });

    describe('getPrice', () => {
        it('should fetch token price successfully', async () => {
            const mockPrice = { price: 1.23 };
            global.fetch.mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce(mockPrice),
            });

            const result = await getPrice();
            expect(result).toEqual(mockPrice);
            expect(global.fetch).toHaveBeenCalled();
        });
    });
});
