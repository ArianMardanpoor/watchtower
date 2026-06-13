import { useState, useEffect } from 'react';
import { BarChart3, Globe, Radio, Server, Box, FolderGit2, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  trend?: number;
  color: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await api.getGlobalStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards: StatCard[] = [
    {
      icon: <FolderGit2 className="w-6 h-6" />,
      label: 'Programs',
      value: stats?.programs_count || 0,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      label: 'Subdomains',
      value: stats?.subdomains_count || 0,
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <Radio className="w-6 h-6" />,
      label: 'Live Subdomains',
      value: stats?.live_subdomains_count || 0,
      color: 'from-green-500 to-green-600',
    },
    {
      icon: <Server className="w-6 h-6" />,
      label: 'HTTP Services',
      value: stats?.http_services_count || 0,
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: <Box className="w-6 h-6" />,
      label: 'Assets',
      value: stats?.assets_count || 0,
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      label: 'Total Discoveries',
      value: stats?.total_discoveries || 0,
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to Watchtower - Your security monitoring hub</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground">Loading statistics...</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in-right">
            {statCards.map((stat, idx) => (
              <Card
                key={idx}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group card-hover"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    {stat.trend && (
                      <p className="text-xs text-green-600 mt-2">
                        ↑ {stat.trend}% from last week
                      </p>
                    )}
                  </div>

                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Discoveries */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Discoveries</h2>
            <div className="space-y-3">
              {stats?.recent_discoveries?.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.discovered_at}</span>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No recent discoveries</p>
              )}
            </div>
          </Card>

          {/* System Status */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Status</span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Sync</span>
                <span className="text-sm font-medium text-foreground">{stats?.last_sync || 'Just now'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
