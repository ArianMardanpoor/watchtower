import { useCallback, useMemo } from 'react';
import { useFilters } from './useFilters';

export function usePagination(defaultPerPage = 100) {
  // جلوگیری از ساخت آبجکت جدید در هر رندر برای جلوگیری از Infinite Loop
  const defaultFilters = useMemo(
    () => ({ page: '1', per_page: defaultPerPage.toString() }), 
    [defaultPerPage]
  );

  const { filters, setFilter } = useFilters(defaultFilters);

  const page = parseInt(filters.page, 10) || 1;
  const perPage = parseInt(filters.per_page, 10) || defaultPerPage;

  const setPage = useCallback((newPage) => {
    setFilter('page', newPage.toString());
  }, [setFilter]);

  const setPerPage = useCallback((newPerPage) => {
    // با استفاده از قابلیت جدید ست کردن چندتایی در useFilters
    setFilter({
      per_page: newPerPage.toString(),
      page: '1' // بازگشت به صفحه اول
    });
  }, [setFilter]);

  return { page, perPage, setPage, setPerPage };
}