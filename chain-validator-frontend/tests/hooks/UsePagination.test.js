import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../../src/hooks/usePagination';

describe('usePagination Hook', () => {
    it('should return correct pagination state', () => {
        const { result } = renderHook(() => usePagination());

        expect(result.current.pageParams).toBeDefined();
        expect(result.current.totalPages).toBe(1);
        expect(typeof result.current.handlePageChange).toBe('function');
    });

    it('should update pages when total count changes', () => {
        const { result } = renderHook(() => usePagination());

        act(() => {
            result.current.setTotalCount(20);
        });

        expect(result.current.totalPages).toBe(2);
    });

    it('should handle page change correctly', () => {
        const { result } = renderHook(() => usePagination());

        act(() => {
            result.current.setTotalCount(50);
        });

        act(() => {
            result.current.handlePageChange({}, 3);
        });

        expect(result.current.pageParams.page).toBe(3);
        expect(result.current.pageParams.offset).toBe(20);
    });
});
