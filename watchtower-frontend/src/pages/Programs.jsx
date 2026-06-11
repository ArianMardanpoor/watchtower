import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Target, Globe, Server, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPrograms } from '../api/programs';
import { useDebounce } from '../hooks/useDebounce';
import { formatDate } from '../utils/format';

export default function Programs() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['programs', debouncedSearch],
    queryFn: () => getPrograms({ search: debouncedSearch }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary">Programs</h2>
        
        {/* جستجوی محلی بین برنامه‌ها */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-muted" />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-md pl-10 pr-4 py-2 text-sm text-primary focus:ring-1 focus:ring-accent outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((program) => (
            <div key={program.program_name} className="bg-surface border border-border rounded-lg p-5 flex flex-col transition-all hover:border-accent/50">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  {program.program_name}
                </h3>
                <span className="text-xs text-primary-muted bg-background px-2 py-1 rounded border border-border">
                  {program.scopes?.length || 0} Scopes
                </span>
              </div>
              
              <div className="text-xs text-primary-muted mb-4">
                Added: {formatDate(program.created_date)}
              </div>

              {/* دکمه‌های اکشن */}
              <div className="mt-auto pt-4 border-t border-border flex gap-2">
                <Link 
                  to={`/subdomains?program=${program.program_name}`}
                  className="flex-1 flex justify-center items-center gap-1 bg-background hover:bg-border/50 text-primary-muted hover:text-primary text-xs py-2 rounded border border-border transition-colors"
                >
                  <Globe className="h-3 w-3" /> Subs
                </Link>
                <Link 
                  to={`/live?program=${program.program_name}`}
                  className="flex-1 flex justify-center items-center gap-1 bg-background hover:bg-border/50 text-primary-muted hover:text-primary text-xs py-2 rounded border border-border transition-colors"
                >
                  <Radio className="h-3 w-3" /> Live
                </Link>
                <Link 
                  to={`/http?program=${program.program_name}`}
                  className="flex-1 flex justify-center items-center gap-1 bg-background hover:bg-border/50 text-primary-muted hover:text-primary text-xs py-2 rounded border border-border transition-colors"
                >
                  <Server className="h-3 w-3" /> HTTP
                </Link>
              </div>
            </div>
          ))}

          {data?.data?.length === 0 && (
            <div className="col-span-full py-10 text-center text-primary-muted">
              No programs found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}