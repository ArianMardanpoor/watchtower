import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export default function SubdomainFilter({ filters, setFilter, resetFilters }) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const [programValue, setProgramValue] = useState(filters.program || '');
  
  const debouncedSearch = useDebounce(searchValue, 500);
  const debouncedProgram = useDebounce(programValue, 500);

  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) setFilter('search', debouncedSearch);
    if (debouncedProgram !== (filters.program || '')) setFilter('program', debouncedProgram);
  }, [debouncedSearch, debouncedProgram, filters, setFilter]);

  const handleReset = () => {
    setSearchValue('');
    setProgramValue('');
    resetFilters();
  };

  const inputClasses = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder:text-primary-muted focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all duration-200 hover:border-primary-muted/50";

  return (
    <div className="bg-surface border border-border rounded-xl p-5 mb-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 text-primary border-b border-border/50 pb-3">
        <Filter className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-semibold">Filter Subdomains</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-muted" />
          <input
            type="text"
            placeholder="Search subdomain..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`${inputClasses} pl-9`}
          />
        </div>

        <input
          type="text"
          placeholder="Program name..."
          value={programValue}
          onChange={(e) => setProgramValue(e.target.value)}
          className={inputClasses}
        />

        <select
          value={filters.has_http || ''}
          onChange={(e) => setFilter('has_http', e.target.value)}
          className={`${inputClasses} appearance-none cursor-pointer`}
        >
          <option value="">Has HTTP? (All)</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        <select
          value={filters.has_live || ''}
          onChange={(e) => setFilter('has_live', e.target.value)}
          className={`${inputClasses} appearance-none cursor-pointer`}
        >
          <option value="">Is Live? (All)</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="flex justify-between items-center pt-2">
        <label className="flex items-center gap-2.5 text-sm text-primary cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.only_new === 'true'}
            onChange={(e) => setFilter('only_new', e.target.checked ? 'true' : '')}
            className="w-4 h-4 rounded border-border bg-background text-accent focus:ring-accent/50 focus:ring-2 cursor-pointer transition-all"
          />
          <span className="group-hover:text-accent transition-colors">New in last 24h</span>
        </label>

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