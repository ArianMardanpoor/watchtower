import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export default function HttpFilter({ filters, setFilter, resetFilters }) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [techValue, setTechValue] = useState(filters.tech || '');
  const [titleValue, setTitleValue] = useState(filters.title || '');
  const [providerValue, setProviderValue] = useState(filters.provider || '');
  const [statusValue, setStatusValue] = useState(
    filters.status_code || filters.status_codes || filters.status_range || ''
  );
  
  const debouncedSearch = useDebounce(searchValue, 500);
  const debouncedTech = useDebounce(techValue, 500);
  const debouncedTitle = useDebounce(titleValue, 500);
  const debouncedProvider = useDebounce(providerValue, 500);
  const debouncedStatus = useDebounce(statusValue, 600); // کمی تاخیر بیشتر برای استاتوس

  // سینک فیلدهای متنی ساده - فقط زمانی که debounce شده مقدار تغییر کند
  useEffect(() => {
    if (debouncedSearch) {
      setFilter('search', debouncedSearch);
    } else if (filters.search) {
      setFilter('search', '');
    }
  }, [debouncedSearch, setFilter]);

  useEffect(() => {
    if (debouncedTech) {
      setFilter('tech', debouncedTech);
    } else if (filters.tech) {
      setFilter('tech', '');
    }
  }, [debouncedTech, setFilter]);

  useEffect(() => {
    if (debouncedTitle) {
      setFilter('title', debouncedTitle);
    } else if (filters.title) {
      setFilter('title', '');
    }
  }, [debouncedTitle, setFilter]);

  useEffect(() => {
    if (debouncedProvider) {
      setFilter('provider', debouncedProvider);
    } else if (filters.provider) {
      setFilter('provider', '');
    }
  }, [debouncedProvider, setFilter]);

  // منطق بهینه شده برای استاتوس کدها
  useEffect(() => {
    const val = debouncedStatus.trim();
    // اول همه را پاک می‌کنیم تا تداخل پیش نیاید
    setFilter('status_code', '');
    setFilter('status_codes', '');
    setFilter('status_range', '');

    if (val) {
      if (val.includes(',')) setFilter('status_codes', val);
      else if (val.includes('-')) setFilter('status_range', val);
      else setFilter('status_code', val);
    }
  }, [debouncedStatus, setFilter]);

  const handleReset = () => {
    setSearchValue('');
    setTechValue('');
    setTitleValue('');
    setProviderValue('');
    setStatusValue('');
    resetFilters();
  };

  const inputClasses = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder:text-primary-muted focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all duration-200 hover:border-primary-muted/50";

  return (
    <div className="bg-surface border border-border rounded-xl p-5 mb-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 text-primary border-b border-border/50 pb-3">
        <Filter className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold">Filter HTTP Services</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-muted" />
          <input
            type="text"
            placeholder="Search URL, subdomain..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`${inputClasses} pl-9`}
          />
        </div>

        <input
          type="text"
          placeholder="Status (200, 403, 200-299)..."
          value={statusValue}
          onChange={(e) => setStatusValue(e.target.value)}
          className={inputClasses}
        />

        <input
          type="text"
          placeholder="Title contains..."
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          className={inputClasses}
        />

        <input
          type="text"
          placeholder="Tech (e.g. nginx)..."
          value={techValue}
          onChange={(e) => setTechValue(e.target.value)}
          className={inputClasses}
        />

        <input
          type="text"
          placeholder="Provider (subfinder, crt, ...)..."
          value={providerValue}
          onChange={(e) => setProviderValue(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div className="flex flex-wrap justify-between items-center pt-2 gap-4">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2.5 text-sm text-primary cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.only_single_provider === 'true' || filters.only_single_provider === true}
              onChange={(e) => setFilter('only_single_provider', e.target.checked ? 'true' : '')}
              className="w-4 h-4 rounded border-border bg-background text-accent focus:ring-accent/50 focus:ring-2 cursor-pointer transition-all"
            />
            <span className="group-hover:text-accent transition-colors">Only single provider</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm text-primary cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.only_new === 'true' || filters.only_new === true}
              onChange={(e) => setFilter('only_new', e.target.checked ? 'true' : '')}
              className="w-4 h-4 rounded border-border bg-background text-accent focus:ring-accent/50 focus:ring-2 cursor-pointer transition-all"
            />
            <span className="group-hover:text-accent transition-colors">New (24h)</span>
          </label>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-sm text-primary-muted hover:text-danger hover:bg-danger/10 transition-colors px-3 py-1.5 rounded-lg"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
}