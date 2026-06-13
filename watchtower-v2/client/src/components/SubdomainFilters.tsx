import { Search, RotateCcw, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/useDebounce';

interface SubdomainFiltersProps {
  filters: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  resetFilters: () => void;
}

export function SubdomainFilters({ filters, setFilter, resetFilters }: SubdomainFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilter('search', debouncedSearch || undefined);
    }
  }, [debouncedSearch, filters.search, setFilter]);

  const handleReset = () => {
    setSearchValue('');
    resetFilters();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-4 animate-fade-in shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2 text-foreground">
        <Filter className="w-4 h-4" />
        <h3 className="text-sm font-semibold">Filter Subdomains</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search subdomain..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all input-focus"
          />
        </div>

        {/* Program Filter */}
        <input
          type="text"
          placeholder="Program name..."
          value={filters.program || ''}
          onChange={(e) => setFilter('program', e.target.value || undefined)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all input-focus"
        />

        {/* HTTP Status */}
        <select
          value={filters.has_http || ''}
          onChange={(e) => setFilter('has_http', e.target.value || undefined)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
        >
          <option value="">Has HTTP? (All)</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>

        {/* Live Status */}
        <select
          value={filters.has_live || ''}
          onChange={(e) => setFilter('has_live', e.target.value || undefined)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
        >
          <option value="">Is Live? (All)</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>

      <div className="flex justify-between items-center pt-2">
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={filters.only_new === 'true'}
            onChange={(e) => setFilter('only_new', e.target.checked ? 'true' : undefined)}
            className="rounded border border-border bg-background text-accent focus:ring-2 focus:ring-accent/50 cursor-pointer"
          />
          New in last 24h
        </label>

        <Button
          onClick={handleReset}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
