import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export default function HttpFilter({ filters, setFilter, resetFilters }) {
  // مدیریت استیت‌های محلی برای جلوگیری از کند شدن تایپ
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [techValue, setTechValue] = useState(filters.tech || '');
  const [titleValue, setTitleValue] = useState(filters.title || '');
  const [providerValue, setProviderValue] = useState(filters.provider || '');
  
  const debouncedSearch = useDebounce(searchValue, 500);
  const debouncedTech = useDebounce(techValue, 500);
  const debouncedTitle = useDebounce(titleValue, 500);
  const debouncedProvider = useDebounce(providerValue, 500);

  // سینک کردن با URL
  useEffect(() => {
    if (debouncedSearch !== filters.search) setFilter('search', debouncedSearch);
    if (debouncedTech !== filters.tech) setFilter('tech', debouncedTech);
    if (debouncedTitle !== filters.title) setFilter('title', debouncedTitle);
    if (debouncedProvider !== filters.provider) setFilter('provider', debouncedProvider);
  }, [debouncedSearch, debouncedTech, debouncedTitle, debouncedProvider, filters, setFilter]);

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-6 space-y-4">
      <div className="flex items-center gap-2 mb-2 text-primary">
        <Filter className="w-4 h-4" />
        <h3 className="text-sm font-semibold">Filter HTTP Services</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* جستجوی عمومی */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-muted" />
          <input
            type="text"
            placeholder="Search URL, subdomain..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
          />
        </div>

        {/* فیلتر Status Code */}
        <input
          type="text"
          placeholder="Status Code (e.g. 200, 403)..."
          value={filters.status_code || ''}
          onChange={(e) => setFilter('status_code', e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
        />

        {/* فیلتر Title */}
        <input
          type="text"
          placeholder="Page Title contains..."
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
        />

        {/* فیلتر Provider */}
        <input
          type="text"
          placeholder="Provider (e.g. subfinder)..."
          value={providerValue}
          onChange={(e) => setProviderValue(e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
        />

        {/* فیلتر Tech */}
        <input
          type="text"
          placeholder="Technology (e.g. nginx)..."
          value={techValue}
          onChange={(e) => setTechValue(e.target.value)}
          className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
        />
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-border mt-4">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={filters.has_tech === 'true'}
              onChange={(e) => setFilter('has_tech', e.target.checked ? 'true' : '')}
              className="rounded border-border bg-background text-accent focus:ring-accent/50"
            />
            Has Technology
          </label>
          <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={filters.only_new === 'true'}
              onChange={(e) => setFilter('only_new', e.target.checked ? 'true' : '')}
              className="rounded border-border bg-background text-accent focus:ring-accent/50"
            />
            New (24h)
          </label>
        </div>

        <button
          onClick={() => {
            setSearchValue('');
            setTechValue('');
            setTitleValue('');
            setProviderValue('');
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