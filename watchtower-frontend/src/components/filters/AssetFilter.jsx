import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export default function AssetFilter({ filters, setFilter, resetFilters }) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [programValue, setProgramValue] = useState(filters.program || '');
  const [providerValue, setProviderValue] = useState(filters.provider || '');

  const debouncedSearch = useDebounce(searchValue, 500);
  const debouncedProgram = useDebounce(programValue, 500);
  const debouncedProvider = useDebounce(providerValue, 500);

  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) setFilter('search', debouncedSearch);
    if (debouncedProgram !== (filters.program || '')) setFilter('program', debouncedProgram);
    if (debouncedProvider !== (filters.provider || '')) setFilter('provider', debouncedProvider);
  }, [debouncedSearch, debouncedProgram, debouncedProvider, filters, setFilter]);

  const handleReset = () => {
    setSearchValue('');
    setProgramValue('');
    setProviderValue('');
    resetFilters();
  };

  const inputClasses = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder:text-primary-muted focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all duration-200 hover:border-primary-muted/50";

  return (
    <div className="bg-surface border border-border rounded-xl p-5 mb-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 text-primary border-b border-border/50 pb-3">
        <Filter className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold">Filter Combined Assets</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-muted" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`${inputClasses} pl-9`}
          />
        </div>

        <select
          value={filters.status || 'all'}
          onChange={(e) => setFilter('status', e.target.value)}
          className={`${inputClasses} font-medium text-accent appearance-none cursor-pointer`}
        >
          <option value="all">Status: All Assets</option>
          <option value="both">Fully Alive (HTTP + Live)</option>
          <option value="http_only">HTTP Only</option>
          <option value="live_only">Live Only (No HTTP)</option>
          <option value="none">Dead / No Response</option>
        </select>

        <input
          type="text"
          placeholder="Program name..."
          value={programValue}
          onChange={(e) => setProgramValue(e.target.value)}
          className={inputClasses}
        />

        <input
          type="text"
          placeholder="Provider (e.g. subfinder)..."
          value={providerValue}
          onChange={(e) => setProviderValue(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div className="flex justify-end pt-2">
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