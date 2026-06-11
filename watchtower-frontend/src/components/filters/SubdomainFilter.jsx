import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export default function SubdomainFilter({ filters, setFilter, resetFilters }) {
  // استیت محلی برای نوار جستجو تا کاربر بتواند بدون لگ تایپ کند
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchValue, 500);

  // سینک کردن مقدار سرچ با URL
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilter('search', debouncedSearch);
    }
  }, [debouncedSearch, filters.search, setFilter]);

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-6 space-y-4">
      <div className="flex items-center gap-2 mb-2 text-primary">
        <Filter className="w-4 h-4" />
        <h3 className="text-sm font-semibold">Filter Subdomains</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* جستجو */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-muted" />
          <input
            type="text"
            placeholder="Search subdomain..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
          />
        </div>

        {/* فیلتر برنامه (می‌توانید بعداً آن را به یک Select پیشرفته‌تر متصل به API تبدیل کنید) */}
        <input
          type="text"
          placeholder="Program name..."
          value={filters.program || ''}
          onChange={(e) => setFilter('program', e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
        />

        {/* وضعیت HTTP */}
        <select
          value={filters.has_http || ''}
          onChange={(e) => setFilter('has_http', e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
        >
          <option value="">Has HTTP? (All)</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        {/* وضعیت Live */}
        <select
          value={filters.has_live || ''}
          onChange={(e) => setFilter('has_live', e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
        >
          <option value="">Is Live? (All)</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="flex justify-between items-center pt-2">
        <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
          <input
            type="checkbox"
            checked={filters.only_new === 'true'}
            onChange={(e) => setFilter('only_new', e.target.checked ? 'true' : '')}
            className="rounded border-border bg-background text-accent focus:ring-accent/50"
          />
          New in last 24h
        </label>

        <button
          onClick={() => {
            setSearchValue('');
            resetFilters();
          }}
          className="flex items-center gap-1.5 text-sm text-primary-muted hover:text-danger transition-colors px-2 py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>
    </div>
  );
}