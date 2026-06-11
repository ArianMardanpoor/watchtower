import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderGit2, Globe, Radio, Server, Loader2 } from 'lucide-react';
import { getGlobalStats, getTimelineStats } from '../api/stats';
import StatCard from '../components/cards/StatCard';
import TimelineChart from '../components/charts/TimelineChart';

export default function Dashboard() {
  // دریافت آمار کلی
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['globalStats'],
    queryFn: getGlobalStats,
  });

  // دریافت آمار نمودار (۳۰ روزه)
  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['timelineStats'],
    queryFn: () => getTimelineStats({ days: 30 }),
  });

  if (statsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Overview Dashboard</h2>

      {/* بخش کارت‌های آماری */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Programs"
          value={stats?.programs}
          icon={FolderGit2}
          colorClass="text-accent"
        />
        <StatCard
          title="Total Subdomains"
          value={stats?.subdomains}
          newValue={stats?.new_subdomains_24h}
          icon={Globe}
          colorClass="text-accent"
        />
        <StatCard
          title="Live Subdomains"
          value={stats?.live}
          newValue={stats?.new_live_24h}
          icon={Radio}
          colorClass="text-success"
        />
        <StatCard
          title="HTTP Services"
          value={stats?.http}
          newValue={stats?.new_http_24h}
          icon={Server}
          colorClass="text-warning"
        />
      </div>

      {/* بخش نمودار Timeline */}
      <div className="bg-surface border border-border rounded-lg p-5 mt-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Discovery Timeline (Last 30 Days)</h3>
        {timelineLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary-muted" />
          </div>
        ) : (
          <TimelineChart data={timeline?.data} />
        )}
      </div>
    </div>
  );
}