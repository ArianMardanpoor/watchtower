import { useQuery } from '@tanstack/react-query';
import { Download, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { useFilters } from '@/hooks/useFilters';
import { usePagination } from '@/hooks/usePagination';
import { getSubdomains } from '@/api/subdomains';
import { downloadExport } from '@/api/client';
import { showToast } from '@/lib/toast';

export default function Subdomains() {
  const { page, perPage, setPage, setPerPage } = usePagination(50);
  const { filters, setFilter, resetFilters } = useFilters({ page: '1', per_page: '50' });

  // Fetch data with React Query
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['subdomains', filters],
    queryFn: () => getSubdomains(filters),
    placeholderData: (previousData: any) => previousData,
  });

  const handleExport = async () => {
    try {
      const result = await downloadExport('/export/subdomains', filters);
      const blob = result instanceof Blob ? result : new Blob([JSON.stringify(result)]);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'subdomains.txt';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      showToast.success('Export successful', 'File downloaded successfully');
    } catch (err) {
      console.error('Export failed:', err);
      showToast.error('Export failed', 'Could not download the file');
    }
  };

  const columns = [
    { key: 'subdomain', label: 'Subdomain' },
    { key: 'program_name', label: 'Program' },
    { key: 'scope', label: 'Scope' },
    { key: 'providers', label: 'Providers' },
    { key: 'last_update', label: 'Last Updated' },
  ];

  const responseData = data as any;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Subdomains Inventory</h1>
            <p className="text-muted-foreground mt-1">
              {!isLoading && responseData?.total ? `Showing ${(page - 1) * perPage + 1} to ${Math.min(page * perPage, responseData.total)} of ${responseData.total} subdomains` : 'Manage and filter subdomains'}
            </p>
          </div>

          <Button onClick={handleExport} disabled={!responseData?.data?.length} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">{error?.message || 'Failed to load subdomains'}</p>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={responseData?.data || []}
          isLoading={isLoading}
          currentPage={page}
          totalPages={responseData?.pages || 1}
          onPageChange={setPage}
          perPage={perPage}
          onPerPageChange={setPerPage}
          total={responseData?.total || 0}
        />
      </div>
    </Layout>
  );
}
