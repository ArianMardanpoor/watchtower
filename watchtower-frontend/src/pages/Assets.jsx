import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List, DatabaseZap } from 'lucide-react';
import { apiClient } from '../api/client';
import { usePagination } from '../hooks/usePagination';
import { useFilters } from '../hooks/useFilters';
import AssetFilter from '../components/filters/AssetFilter';
import AssetCard from '../components/cards/AssetCard';
import AssetTable from '../components/tables/AssetTable';

const getAssets = async (params) => apiClient.get('/assets', { params });

export default function Assets() {
  const { page, perPage, setPage, setPerPage } = usePagination(50);
  const { filters, setFilter, resetFilters } = useFilters({ page: '1', per_page: '50', status: 'all' });
  const [viewMode, setViewMode] = useState('card');

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setFilter('page', newPage.toString());
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setFilter('per_page', newPerPage.toString());
    handlePageChange(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => getAssets(filters),
    placeholderData: (prev) => prev, 
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border/50 shadow-sm">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <DatabaseZap className="w-6 h-6 text-accent" />
          Combined Assets View
        </h2>
        
        <div className="flex items-center bg-background border border-border rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-md transition-all duration-300 ${viewMode === 'card' ? 'bg-surface text-accent shadow-sm' : 'text-primary-muted hover:text-primary'}`}
            title="Card View"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-all duration-300 ${viewMode === 'table' ? 'bg-surface text-accent shadow-sm' : 'text-primary-muted hover:text-primary'}`}
            title="Table View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl border border-border/50 shadow-sm">
        <AssetFilter filters={filters} setFilter={setFilter} resetFilters={resetFilters} />
      </div>

      {isLoading ? (
        <div className="w-full h-96 bg-surface border border-border/50 rounded-xl animate-pulse flex justify-center items-center">
          <div className="text-primary-muted text-sm font-medium flex items-center gap-2">
             <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
             Aggregating infrastructure data...
          </div>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="w-full p-16 bg-surface border border-dashed border-border rounded-xl text-center flex flex-col items-center justify-center">
          <DatabaseZap className="w-12 h-12 text-border mb-4" />
          <h3 className="text-lg font-semibold text-primary">No assets found</h3>
          <p className="text-primary-muted text-sm mt-1 mb-4">Try clearing your filters or adjusting your search criteria.</p>
          <button onClick={resetFilters} className="px-4 py-2 bg-background border border-border rounded-lg hover:border-accent text-sm transition-all">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="min-h-[500px]">
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.data.map((asset, idx) => (
                  <div key={idx} className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <AssetCard asset={asset} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <AssetTable data={data} />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between bg-surface border border-border/50 shadow-sm rounded-xl p-5 text-sm text-primary mt-6">
            <div className="font-medium">
              Showing <span className="text-accent bg-accent/10 px-2 py-0.5 rounded">{(page - 1) * perPage + 1}</span> to <span className="text-accent bg-accent/10 px-2 py-0.5 rounded">{Math.min(page * perPage, data.total)}</span> of <span className="text-accent bg-accent/10 px-2 py-0.5 rounded">{data.total}</span> assets
            </div>
            
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <select value={perPage} onChange={(e) => handlePerPageChange(Number(e.target.value))} className="bg-background border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium">
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <div className="flex gap-2 font-medium">
                <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)} className="px-4 py-2 rounded-lg bg-background border border-border hover:bg-border hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all">Prev</button>
                <span className="px-4 py-2 rounded-lg bg-surface border border-border flex items-center justify-center min-w-[3rem] shadow-inner">{page} / {data.pages}</span>
                <button disabled={page >= data.pages} onClick={() => handlePageChange(page + 1)} className="px-4 py-2 rounded-lg bg-background border border-border hover:bg-border hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all">Next</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}