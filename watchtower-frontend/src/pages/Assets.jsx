import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, List } from 'lucide-react';
import { apiClient } from '../api/client';
import { usePagination } from '../hooks/usePagination';
import { useFilters } from '../hooks/useFilters';
import AssetFilter from '../components/filters/AssetFilter';
import AssetCard from '../components/cards/AssetCard';
import AssetTable from '../components/tables/AssetTable';

// تابع ریکوئست
const getAssets = async (params) => apiClient.get('/assets', { params });

export default function Assets() {
  const { page, perPage, setPage, setPerPage } = usePagination(50);
  const { filters, setFilter, resetFilters } = useFilters({ page: '1', per_page: '50', status: 'all' });
  
  // استیت برای تغییر حالت نمایش (Card یا Table)
  const [viewMode, setViewMode] = useState('card'); 

  const { data, isLoading } = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => getAssets(filters),
    keepPreviousData: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h2 className="text-2xl font-bold text-primary">Combined Assets View</h2>
        
        {/* دکمه‌های Toggle برای تغییر ویو */}
        <div className="flex items-center bg-surface border border-border rounded-md p-1">
          <button
            onClick={() => setViewMode('card')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'card' ? 'bg-background text-accent shadow-sm' : 'text-primary-muted hover:text-primary'}`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-background text-accent shadow-sm' : 'text-primary-muted hover:text-primary'}`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AssetFilter filters={filters} setFilter={setFilter} resetFilters={resetFilters} />

      {isLoading ? (
        <div className="w-full h-64 bg-surface border border-border rounded-lg animate-pulse flex justify-center items-center">
          <div className="text-primary-muted text-sm">Aggregating infrastructure data...</div>
        </div>
      ) : !data?.data || data.data.length === 0 ? (
        <div className="w-full p-10 bg-surface border border-border rounded-lg text-center text-primary-muted text-sm">
          No assets found matching your criteria.
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.data.map((asset, idx) => (
                <AssetCard key={idx} asset={asset} />
              ))}
            </div>
          ) : (
            <AssetTable data={data} />
          )}

          {/* صفحه‌بندی مشترک */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-surface border border-border rounded-lg p-4 text-sm text-primary mt-6">
            <div>
              Showing <span className="font-bold text-accent">{(page - 1) * perPage + 1}</span> to <span className="font-bold text-accent">{Math.min(page * perPage, data.total)}</span> of <span className="font-bold text-accent">{data.total}</span> assets
            </div>
            
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="bg-background border border-border rounded px-2 py-1 outline-none">
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <div className="flex gap-1">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded bg-background border border-border hover:bg-border disabled:opacity-50 transition-colors">Prev</button>
                <span className="px-3 py-1 rounded bg-border border border-border">{page} / {data.pages}</span>
                <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded bg-background border border-border hover:bg-border disabled:opacity-50 transition-colors">Next</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}