import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, Target, Globe, Server, Radio, FolderSearch } from 'lucide-react';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border/50 shadow-sm">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Target className="w-6 h-6 text-accent" />
          Programs Directory
        </h2>
        
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-muted group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Search programs by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-primary focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-surface border border-border/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((program) => (
            <div key={program.program_name} className="bg-surface border border-border/50 rounded-xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-accent/40 group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2 group-hover:text-accent transition-colors">
                  {program.program_name}
                </h3>
                <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
                  {program.scopes?.length || 0} Scopes
                </span>
              </div>
              
              <div className="text-sm text-primary-muted mb-6 flex-grow">
                Added: <span className="font-medium text-primary">{formatDate(program.created_date)}</span>
              </div>

              <div className="mt-auto pt-4 border-t border-border/50 flex gap-2">
                <Link to={`/subdomains?program=${program.program_name}`} className="flex-1 flex justify-center items-center gap-1.5 bg-background hover:bg-accent hover:text-white text-primary-muted text-xs py-2.5 rounded-lg border border-border transition-all font-medium">
                  <Globe className="h-4 w-4" /> Subs
                </Link>
                <Link to={`/live?program=${program.program_name}`} className="flex-1 flex justify-center items-center gap-1.5 bg-background hover:bg-success hover:text-white text-primary-muted text-xs py-2.5 rounded-lg border border-border transition-all font-medium">
                  <Radio className="h-4 w-4" /> Live
                </Link>
                <Link to={`/http?program=${program.program_name}`} className="flex-1 flex justify-center items-center gap-1.5 bg-background hover:bg-warning hover:text-white text-primary-muted text-xs py-2.5 rounded-lg border border-border transition-all font-medium">
                  <Server className="h-4 w-4" /> HTTP
                </Link>
              </div>
            </div>
          ))}

          {data?.data?.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center bg-surface border border-dashed border-border rounded-xl">
              <FolderSearch className="w-16 h-16 text-border mb-4" />
              <h3 className="text-lg font-semibold text-primary">No programs found</h3>
              <p className="text-primary-muted text-sm mt-1">Try adjusting your search query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}