import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Target, Globe, Server, Radio, Loader2 } from 'lucide-react';
import { getProgramDetails } from '../api/programs';
import { getProgramStats } from '../api/stats';
import StatCard from '../components/cards/StatCard';
import StatusCodeChart from '../components/charts/StatusCodeChart';
import ProviderChart from '../components/charts/ProviderChart';
import TechChart from '../components/charts/TechChart';
import { formatDate } from '../utils/format';

export default function ProgramDetail() {
  const { programName } = useParams();

  // گرفتن دیتای پایه برنامه
  const { data: program, isLoading: progLoading } = useQuery({
    queryKey: ['program', programName],
    queryFn: () => getProgramDetails(programName),
  });

  // گرفتن آمار دقیق برنامه (توزیع‌ها)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['programStats', programName],
    queryFn: () => getProgramStats(programName),
  });

  if (progLoading || statsLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  }

  if (!program) {
    return <div className="p-10 text-center text-danger">Program not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* هدر صفحه */}
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Link to="/programs" className="p-2 hover:bg-surface rounded-md transition-colors text-primary-muted hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Target className="w-6 h-6 text-accent" /> {program.program_name}
          </h2>
          <p className="text-sm text-primary-muted mt-1">Added: {formatDate(program.created_date)}</p>
        </div>
      </div>

      {/* کارت‌های آمار اختصاصی */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Subdomains" value={stats?.totals?.subdomains} newValue={stats?.new_24h?.subdomains} icon={Globe} colorClass="text-accent" />
        <StatCard title="Live Assets" value={stats?.totals?.live} newValue={stats?.new_24h?.live} icon={Radio} colorClass="text-success" />
        <StatCard title="HTTP Services" value={stats?.totals?.http} newValue={stats?.new_24h?.http} icon={Server} colorClass="text-warning" />
      </div>

      {/* دکمه‌های پرش سریع به جداول همراه با فیلتر */}
      <div className="flex gap-4 p-4 bg-surface border border-border rounded-lg">
        <Link to={`/subdomains?program=${program.program_name}`} className="text-sm bg-background border border-border hover:border-accent text-primary px-4 py-2 rounded-md transition-colors">View All Subdomains</Link>
        <Link to={`/assets?program=${program.program_name}&status=both`} className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md transition-colors">Analyze Live HTTP Assets</Link>
      </div>

      {/* بخش Scopes */}
      <div className="bg-surface border border-border rounded-lg p-5">
        <h3 className="text-lg font-semibold text-primary mb-4">In-Scope Domains</h3>
        <div className="flex flex-wrap gap-2">
          {program.scopes?.map(scope => (
            <span key={scope} className="px-3 py-1 bg-background border border-border rounded-md text-sm font-mono text-primary-muted">{scope}</span>
          ))}
          {!program.scopes?.length && <span className="text-sm text-primary-muted">No scopes defined.</span>}
        </div>
      </div>

      {/* ردیف نمودارها */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">Status Code Distribution</h3>
          <StatusCodeChart data={stats?.distributions?.status_codes} />
        </div>
        
        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">Top 10 Technologies</h3>
          <TechChart data={stats?.distributions?.top_techs} />
        </div>

        <div className="bg-surface border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold text-primary mb-4">Discovery Providers</h3>
          <ProviderChart data={stats?.distributions?.providers} />
        </div>
      </div>
    </div>
  );
}