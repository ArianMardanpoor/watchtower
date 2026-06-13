import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export function useFilters(defaultFilters = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // تبدیل searchParams به یک آبجکت ساده (استفاده از JSON.stringify برای جلوگیری از رندرهای اضافی)
  const searchParamsString = searchParams.toString();

  const filters = useMemo(() => {
    const currentFilters = { ...defaultFilters };
    for (const [key, value] of searchParams.entries()) {
      currentFilters[key] = value;
    }
    return currentFilters;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsString]); 

  // ثبت یا به‌روزرسانی یک یا چند فیلتر
  const setFilter = useCallback((keyOrObj, value) => {
    setSearchParams((prev) => {
      const isObject = typeof keyOrObj === 'object' && keyOrObj !== null;
      const updates = isObject ? keyOrObj : { [keyOrObj]: value };
      
      let pageShouldReset = false;

      Object.entries(updates).forEach(([k, v]) => {
        if (v === undefined || v === '' || v === null) {
          prev.delete(k);
        } else {
          prev.set(k, String(v));
        }
        if (k !== 'page') pageShouldReset = true;
      });
      
      // برگشت به صفحه اول اگر فیلتری غیر از صفحه تغییر کرد
      if (pageShouldReset && prev.has('page')) {
        prev.set('page', '1');
      }
      
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(defaultFilters), { replace: true });
  }, [setSearchParams, defaultFilters]);

  return { filters, setFilter, resetFilters };
}