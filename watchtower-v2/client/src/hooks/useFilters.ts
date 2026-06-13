import { useLocation } from 'wouter';
import { useCallback, useMemo } from 'react';

export function useFilters(defaultFilters: Record<string, string> = { page: '1', per_page: '100' }) {
  const [location, navigate] = useLocation();

  // Parse query parameters from URL
  const filters = useMemo(() => {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    const currentFilters = { ...defaultFilters };

    params.forEach((value, key) => {
      currentFilters[key] = value;
    });

    return currentFilters;
  }, [location, defaultFilters]);

  // Update a single filter
  const setFilter = useCallback(
    (key: string, value: string | number | boolean | undefined) => {
      const url = new URL(window.location.href);
      const params = url.searchParams;

      if (value === undefined || value === '' || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }

      // Reset to page 1 when non-page filters change
      if (key !== 'page' && key !== 'per_page' && params.has('page')) {
        params.set('page', '1');
      }

      navigate(`${location}?${params.toString()}`);
    },
    [location, navigate]
  );

  // Reset all filters to defaults
  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(defaultFilters);
    navigate(`${location}?${params.toString()}`);
  }, [location, navigate, defaultFilters]);

  return { filters, setFilter, resetFilters };
}
