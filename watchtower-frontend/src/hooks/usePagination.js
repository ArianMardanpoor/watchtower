import { useCallback } from 'react';
import { useFilters } from './useFilters';

export function usePagination(defaultPerPage = 100) {
  // استفاده از هوک فیلترها برای خواندن مستقیم از URL
  const { filters, setFilter } = useFilters({ page: '1', per_page: defaultPerPage.toString() });

  const page = parseInt(filters.page, 10) || 1;
  const perPage = parseInt(filters.per_page, 10) || defaultPerPage;

  // تغییر صفحه
  const setPage = useCallback((newPage) => {
    setFilter('page', newPage.toString());
  }, [setFilter]);

  // تغییر تعداد در هر صفحه (و برگشت خودکار به صفحه اول)
  const setPerPage = useCallback((newPerPage) => {
    setFilter('per_page', newPerPage.toString());
    setFilter('page', '1'); 
  }, [setFilter]);

  return { page, perPage, setPage, setPerPage };
}