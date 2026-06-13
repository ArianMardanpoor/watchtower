import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Target, Globe, Server, Radio, Loader2, LayoutDashboard } from 'lucide-react';
import { getProgramDetails } from '../api/programs';
import { getProgramStats } from '../api/stats';
import StatCard from '../components/cards/StatCard';
import StatusCodeChart from '../components/charts/StatusCodeChart';
import ProviderChart from '../components/charts/ProviderChart';
import TechChart from '../components/charts/TechChart';
import { formatDate } from '../utils/format';

export default function ProgramDetail() {
  const { programName } = useParams();

  const { data: program, isLoading: progLoading } = useQuery({
    queryKey: ['program', programName],
    queryFn: () => getProgramDetails(programName),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['programStats', programName],
    queryFn: () => getProgramStats(programName),
  });

  if (progLoading || statsLoading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>;
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] bg-surface rounded-xl border border-dashed border-danger/50 p-10">
        <Target className="w-12 h-12 text-danger mb-4" />
        <h2 className="text-xl font-bold text-primary">Program not found</h2>
        <p className="text-primary-muted mt-2">The program you are looking for does not exist.</p>
        <Link to="/programs" className="mt-6 text-accent hover:underline">Return to Programs</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 bg-surface p-5 rounded-xl border border-border/50 shadow-sm">
        <Link to="/programs" className="p-2.5 bg-background border border-border hover:border-accent hover:text-accent rounded-lg transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
            {program.program_name}
          </h2>
          <p className="text-sm text-primary-muted mt-1 flex items-center gap-1">
            Added on {formatDate(program.created_date)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Subdomains" value={stats?.totals?.subdomains} newValue={stats?.new_24h?.subdomains} icon={Globe} colorClass="text-accent" />
        <StatCard title="Live Assets" value={stats?.totals?.live} newValue={stats?.new_24h?.live} icon={Radio} colorClass="text-success" />
        <StatCard title="HTTP Services" value={stats?.totals?.http} newValue={stats?.new_24h?.http} icon={Server} colorClass="text-warning" />
      </div>

      <div className="flex flex-wrap gap-4 p-5 bg-surface border border-border/50 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 w-full mb-2">
          <LayoutDashboard className="w-5 h-5 text-primary-muted" />
          <h3 className="text-lg font-semibold text-primary">Quick Actions</h3>
        </div>
        <Link to={`/subdomains?program=${program.program_name}`} className="flex-1 min-w-[200px] text-center text-sm font-medium bg-background border border-border hover:border-accent hover:text-accent hover:shadow-md px-6 py-3 rounded-lg transition-all">
          View All Subdomains
        </Link>
        <Link to={`/assets?program=${program.program_name}&status=both`} className="flex-1 min-w-[200px] text-center text-sm font-medium bg-accent hover:bg-accent-hover text-white shadow-md hover:shadow-lg px-6 py-3 rounded-lg transition-all">
          Analyze Live HTTP Assets
        </Link>
      </div>

      <div className="bg-surface border border-border/50 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-primary mb-4 border-b border-border/50 pb-2">In-Scope Domains</h3>
        <div className="flex flex-wrap gap-2.5 mt-4">
          {program.scopes?.map(scope => (
            <span key={scope} className="px-3.5 py-1.5 bg-background border border-border/80 hover:border-accent hover:text-accent transition-colors rounded-lg text-sm font-mono text-primary cursor-default shadow-sm">
              {scope}
            </span>
          ))}
          {!program.scopes?.length && <span className="text-sm text-primary-muted italic">No scopes defined for this program.</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-md font-semibold text-primary mb-5 border-b border-border/50 pb-2">Status Code Distribution</h3>
          <StatusCodeChart data={stats?.distributions?.status_codes} />
        </div>
        <div className="bg-surface border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-md font-semibold text-primary mb-5 border-b border-border/50 pb-2">Top 10 Technologies</h3>
          <TechChart data={stats?.distributions?.top_techs} />
        </div>
        <div className="bg-surface border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-md font-semibold text-primary mb-5 border-b border-border/50 pb-2">Discovery Providers</h3>
          <ProviderChart data={stats?.distributions?.providers} />
        </div>
      </div>
    </div>
  );
}