import { useState, useEffect } from 'react';

/**
 * یک مقدار را دی‌بانس می‌کند تا از رندرهای اضافی جلوگیری شود.
 * @param {any} value - مقداری که باید دی‌بانس شود
 * @param {number} delay - تاخیر به میلی‌ثانیه (پیش‌فرض ۴۰۰)
 * @returns {any} مقدار دی‌بانس شده
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // پاک کردن تایمر در صورت تغییر مقدار قبل از اتمام زمان
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}