import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { globalSearch } from '../../api/search';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const navigate = useNavigate();

  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      setIsLoading(true);
      globalSearch({ q: debouncedQuery, limit: 5 })
        .then((res) => setResults(res.results))
        .catch(() => setResults(null))
        .finally(() => setIsLoading(false));
    } else {
      setResults(null);
    }
  }, [debouncedQuery]);

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subdomains, URLs, titles... (Min 3 chars)"
          className="w-full bg-background border border-border rounded-md pl-10 pr-10 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-accent" />}
      </div>

      {/* Dropdown نتایج */}
      {results && (
        <div className="absolute top-full mt-2 w-full bg-surface border border-border rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {Object.entries(results).map(([type, items]) => {
            if (!items || items.length === 0) return null;
            return (
              <div key={type} className="p-2 border-b border-border last:border-0">
                <div className="text-xs font-bold text-primary-muted uppercase tracking-wider mb-2 px-2">
                  {type}
                </div>
                {items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(''); // بستن منو
                      navigate(`/${type === 'live' ? 'live' : type}?search=${item.subdomain}`);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-background rounded-md truncate transition-colors"
                  >
                    {item.url || item.subdomain}
                  </button>
                ))}
              </div>
            );
          })}
          {Object.values(results).every(arr => arr.length === 0) && (
            <div className="p-4 text-sm text-primary-muted text-center">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
}