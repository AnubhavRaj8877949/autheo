import { extractExternal, extractCurrent, filtered, extractAddresses, extractAccounts, toHex } from '../../src/utils/helper';

// Mock globals expected by helper.js
global.keyring = {
    decodeAddress: jest.fn(addr => 'decoded_' + addr),
    getPair: jest.fn(() => ({
        meta: {
            isExternal: false,
            isHardware: false,
            isInjected: false,
            isMultisig: false,
            isProxied: false,
            who: []
        },
        isLocked: false,
        lock: jest.fn()
    })),
    encodeAddress: jest.fn(addr => 'encoded_' + addr)
};
global.decodeAddress = jest.fn(addr => 'decoded_' + addr);
global.u8aToHex = jest.fn(u8a => {
    return 'hex_' + u8a;
});
global.NO_FLAGS = {};
global.lockCountdown = {};
global.AVAIL_STATUS = ['queued', 'ready'];

describe('Helper Complex Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('extractExternal', () => {
        it('should return NO_FLAGS if no accountId', () => {
            expect(extractExternal(null)).toBe(global.NO_FLAGS);
        });

        it('should extract external flags', () => {
            const result = extractExternal('account1');
            expect(global.keyring.decodeAddress).toHaveBeenCalledWith('account1');
            expect(result).toBeDefined();
            expect(result.isHardware).toBe(false);
        });

        it('should handle errors in decodeAddress', () => {
            global.keyring.decodeAddress.mockImplementationOnce(() => { throw new Error('Decode error'); });
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            expect(extractExternal('account1')).toBe(global.NO_FLAGS);
            consoleSpy.mockRestore();
        });
    });

    describe('extractCurrent', () => {
        it('should extract current transaction', () => {
            const txqueue = [{ status: 'queued', accountId: 'acc1' }];
            const result = extractCurrent(txqueue);
            expect(result.currentItem).toBeDefined();
            expect(result.isRpc).toBe(true);
        });
    });

    describe('filtered', () => {
        it('should filter items', () => {
            const items = ['addr1', 'addr2'];
            const others = ['addr2'];
            // Mock decodeAddress length check
            global.decodeAddress.mockReturnValue({ length: 32 }); // For non-ethereum

            const result = filtered(false, items, others);
            expect(result).toContain('addr1');
            expect(result).not.toContain('addr2');
        });
    });

    describe('extractAddresses', () => {
        it('should extract addresses', () => {
            const addresses = { 'addr1': {} };
            const accounts = ['acc1'];
            global.decodeAddress.mockReturnValue({ length: 32 });

            const result = extractAddresses(false, addresses, accounts);
            expect(result.hasAddresses).toBe(true);
            expect(result.allAddresses).toContain('addr1');
        });
    });

    describe('toHex', () => {
        it('should convert to hex', () => {
            const items = ['addr1'];
            const result = toHex(items);
            // decodeAddress returns an object in this environment (or mock interaction), so u8aToHex receives it
            expect(result).toContain('hex_[object Object]');
        });
    });
});
