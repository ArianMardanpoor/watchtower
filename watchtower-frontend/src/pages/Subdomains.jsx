import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Globe2, AlertCircle } from 'lucide-react';
import { getSubdomains } from '../api/subdomains';
import { downloadExport } from '../api/client';
import { usePagination } from '../hooks/usePagination';
import { useFilters } from '../hooks/useFilters';
import SubdomainFilter from '../components/filters/SubdomainFilter';
import SubdomainTable from '../components/tables/SubdomainTable';

export default function Subdomains() {
  const { page, perPage, setPage, setPerPage } = usePagination(100);
  const { filters, setFilter, resetFilters } = useFilters({ page: '1', per_page: '100' });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

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
    queryKey: ['subdomains', filters],
    queryFn: () => getSubdomains(filters),
    placeholderData: (prev) => prev,
  });

  const exportUrl = `/export/subdomains`;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError(null);
      const blob = await downloadExport(exportUrl, filters);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'subdomains.txt';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      setExportError("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border/50 shadow-sm">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Globe2 className="w-6 h-6 text-accent" />
          Subdomains Inventory
        </h2>
        
        <div className="flex items-center gap-2">
          {exportError && <span className="text-xs text-danger flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {exportError}</span>}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || isLoading || !data?.data?.length}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg border border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {isExporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Exporting...' : 'Export Text'}
          </button>
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl border border-border/50 shadow-sm">
        <SubdomainFilter filters={filters} setFilter={setFilter} resetFilters={resetFilters} />
      </div>

      <div className="bg-surface rounded-xl border border-border/50 shadow-sm overflow-hidden min-h-[400px]">
        <SubdomainTable data={data} isLoading={isLoading} />
      </div>

      {!isLoading && data?.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-surface border border-border/50 shadow-sm rounded-xl p-5 text-sm text-primary">
          <div className="font-medium">
             Showing <span className="text-accent bg-accent/10 px-2 py-0.5 rounded">{(page - 1) * perPage + 1}</span> to <span className="text-accent bg-accent/10 px-2 py-0.5 rounded">{Math.min(page * perPage, data.total)}</span> of <span className="text-accent bg-accent/10 px-2 py-0.5 rounded">{data.total}</span> entries
          </div>
          
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="bg-background border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium"
            >
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value={500}>500 per page</option>
            </select>

            <div className="flex gap-2 font-medium">
              <button disabled={page <= 1} onClick={() => handlePageChange(page - 1)} className="px-4 py-2 rounded-lg bg-background border border-border hover:bg-border hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all">Prev</button>
              <span className="px-4 py-2 rounded-lg bg-surface border border-border flex items-center justify-center min-w-[3rem] shadow-inner">{page} / {data.pages}</span>
              <button disabled={page >= data.pages} onClick={() => handlePageChange(page + 1)} className="px-4 py-2 rounded-lg bg-background border border-border hover:bg-border hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}