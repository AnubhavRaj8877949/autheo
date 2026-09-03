import checkTransactionLogs from '../../../src/services/apis/checkTransactionLogs';
import getAllBlocks from '../../../src/services/apis/getAllBlocks';
import getDashboardWidgets from '../../../src/services/apis/getDashboardWidgets';
import getStatistics from '../../../src/services/apis/getStatistics';

// Mock fetch
global.fetch = jest.fn();

describe('API Services', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch.mockClear();
    });

    describe('checkTransactionLogs', () => {
        beforeEach(() => {
            localStorage.clear();
        });

        it('should fetch transaction logs with node from localStorage', async () => {
            localStorage.setItem('node', 'http://test-node.com');
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ logs: [] }),
            });
            const result = await checkTransactionLogs('hash123');
            expect(global.fetch).toHaveBeenCalledWith('http://test-node.com/tx?hash=0xhash123');
            expect(result).toEqual({ logs: [] });
        });

        it('should fetch transaction logs without node in localStorage', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ logs: [] }),
            });
            const result = await checkTransactionLogs('hash456');
            expect(global.fetch).toHaveBeenCalledWith('/tx?hash=0xhash456');
            expect(result).toEqual({ logs: [] });
        });

        it('should handle errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('API Error'));
            const result = await checkTransactionLogs('hash');
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('API Error');
        });
    });

    describe('getTransactionByHash', () => {
        const { getTransactionByHash } = require('../../../src/services/apis/checkTransactionLogs');

        it('should fetch transaction by hash from validator API', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ transaction: { hash: 'abc123' } }),
            });
            const result = await getTransactionByHash('abc123');
            expect(global.fetch).toHaveBeenCalled();
            expect(result).toEqual({ transaction: { hash: 'abc123' } });
        });

        it('should handle errors in getTransactionByHash', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network Error'));
            const result = await getTransactionByHash('error');
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toBe('Network Error');
        });
    });

    describe('getAllBlocks', () => {
        it('should fetch blocks successfully', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ blocks: [] }),
            });
            const result = await getAllBlocks();
            expect(global.fetch).toHaveBeenCalled();
            expect(result).toEqual({ blocks: [] });
        });

        it('should handle HTTP errors', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });
            const result = await getAllBlocks();
            expect(result).toEqual({
                error: true,
                message: 'HTTP error! Status: 500',
            });
            consoleErrorSpy.mockRestore();
        });

        it('should handle network errors', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            global.fetch.mockRejectedValueOnce(new Error('Network failed'));
            const result = await getAllBlocks();
            expect(result).toEqual({
                error: true,
                message: 'Network failed',
            });
            consoleErrorSpy.mockRestore();
        });
    });

    describe('getDashboardWidgets', () => {
        it('should fetch widgets successfully', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ widgets: [] }),
            });
            const result = await getDashboardWidgets();
            expect(global.fetch).toHaveBeenCalled();
            expect(result).toEqual({ widgets: [] });
        });

        it('should handle HTTP errors', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
            });
            const result = await getDashboardWidgets();
            expect(result).toBeNull();
            consoleLogSpy.mockRestore();
        });

        it('should handle network errors', async () => {
            const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
            global.fetch.mockRejectedValueOnce(new Error('Connection timeout'));
            const result = await getDashboardWidgets();
            expect(result).toBeNull();
            consoleLogSpy.mockRestore();
        });
    });

    describe('getStatistics', () => {
        it('should fetch statistics successfully', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ stats: {} }),
            });
            const result = await getStatistics();
            expect(global.fetch).toHaveBeenCalled();
            expect(result).toEqual({ stats: {} });
        });

        it('should handle HTTP errors', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 503,
            });
            const result = await getStatistics();
            expect(result).toEqual({
                error: true,
                message: 'HTTP error! Status: 503',
            });
            consoleErrorSpy.mockRestore();
        });

        it('should handle network errors', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            global.fetch.mockRejectedValueOnce(new Error('Service unavailable'));
            const result = await getStatistics();
            expect(result).toEqual({
                error: true,
                message: 'Service unavailable',
            });
            consoleErrorSpy.mockRestore();
        });
    });
});
