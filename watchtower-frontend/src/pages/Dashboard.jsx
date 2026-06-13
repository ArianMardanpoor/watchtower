import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderGit2, Globe, Radio, Server, Loader2, Activity } from 'lucide-react';
import { getGlobalStats, getTimelineStats } from '../api/stats';
import StatCard from '../components/cards/StatCard';
import TimelineChart from '../components/charts/TimelineChart';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['globalStats'],
    queryFn: getGlobalStats,
  });

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['timelineStats'],
    queryFn: () => getTimelineStats({ days: 30 }),
  });

  if (statsLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-8 h-8 text-accent" />
        <h2 className="text-3xl font-bold text-primary tracking-tight">Overview Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Programs" value={stats?.programs} icon={FolderGit2} colorClass="text-accent" />
        <StatCard title="Total Subdomains" value={stats?.subdomains} newValue={stats?.new_subdomains_24h} icon={Globe} colorClass="text-accent" />
        <StatCard title="Live Subdomains" value={stats?.live} newValue={stats?.new_live_24h} icon={Radio} colorClass="text-success" />
        <StatCard title="HTTP Services" value={stats?.http} newValue={stats?.new_http_24h} icon={Server} colorClass="text-warning" />
      </div>

      <div className="bg-surface border border-border/50 shadow-sm rounded-xl p-6 transition-all hover:shadow-md">
        <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
          Discovery Timeline <span className="text-sm font-normal text-primary-muted bg-background px-2 py-1 rounded-full">(Last 30 Days)</span>
        </h3>
        {timelineLoading ? (
          <div className="h-[300px] w-full bg-border/20 rounded-lg animate-pulse flex items-center justify-center">
            <span className="text-primary-muted font-medium">Loading chart data...</span>
          </div>
        ) : (
          <TimelineChart data={timeline?.data} />
        )}
      </div>
    </div>
  );
}