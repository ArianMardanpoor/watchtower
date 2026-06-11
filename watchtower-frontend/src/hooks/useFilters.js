import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export function useFilters(defaultFilters = { page: '1', per_page: '100' }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // استخراج فیلترهای فعلی از URL
  const filters = useMemo(() => {
    const currentFilters = { ...defaultFilters };
    for (const [key, value] of searchParams.entries()) {
      currentFilters[key] = value;
    }
    return currentFilters;
  }, [searchParams, defaultFilters]);

  // ثبت یا به‌روزرسانی یک فیلتر خاص
  const setFilter = useCallback((key, value) => {
    setSearchParams((prev) => {
      if (value === undefined || value === '' || value === null) {
        prev.delete(key);
      } else {
        prev.set(key, value);
      }
      
      // اگر فیلتری غیر از صفحه تغییر کرد، به صفحه اول برگردیم
      if (key !== 'page' && prev.has('page')) {
        prev.set('page', '1');
      }
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  // پاک کردن تمام فیلترها
  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(defaultFilters), { replace: true });
  }, [setSearchParams, defaultFilters]);

  return { filters, setFilter, resetFilters };
}