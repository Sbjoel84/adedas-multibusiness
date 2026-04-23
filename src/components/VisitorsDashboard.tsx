import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format, subDays, startOfDay, startOfHour, subHours } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Users, Eye, Globe, Activity, RefreshCw, Monitor,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

// ─── Types ────────────────────────────────────────────────────────────────────

type DateFilter = 'today' | '7days';

interface Visit {
  id: string;
  page: string;
  timestamp: string;
  user_agent: string | null;
  session_id: string;
  referrer: string | null;
}

interface Stats {
  totalVisits: number;
  visitsInRange: number;
  uniqueSessions: number;
  activeUsers: number;
}

interface PageStat {
  page: string;
  count: number;
  pct: number;
}

interface ChartPoint {
  label: string;
  visits: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function friendlyPage(path: string): string {
  if (path === '/') return 'Home';
  return path.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function shortAgent(ua: string | null): string {
  if (!ua) return '—';
  if (/iPhone|iPad/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Firefox/.test(ua)) return 'Firefox';
  if (/Edg/.test(ua)) return 'Edge';
  if (/Chrome/.test(ua)) return 'Chrome';
  if (/Safari/.test(ua)) return 'Safari';
  return 'Other';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VisitorsDashboard() {
  const [filter, setFilter] = useState<DateFilter>('7days');
  const [stats, setStats] = useState<Stats>({
    totalVisits: 0,
    visitsInRange: 0,
    uniqueSessions: 0,
    activeUsers: 0,
  });
  const [pageStats, setPageStats] = useState<PageStat[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const rangeStart =
        filter === 'today'
          ? startOfDay(now).toISOString()
          : subDays(now, 6).toISOString();

      // 1. All visits in range (with timestamps for aggregation)
      const { data: visitsInRange, error: visitsErr } = await supabase
        .from('visits')
        .select('id, page, timestamp, user_agent, session_id, referrer')
        .gte('timestamp', rangeStart)
        .order('timestamp', { ascending: false });

      if (visitsErr) throw visitsErr;
      const rangeVisits: Visit[] = visitsInRange ?? [];

      // 2. Total visits (all time)
      const { count: totalCount, error: totalErr } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true });
      if (totalErr) throw totalErr;

      // 3. Active users in the last 2 minutes
      const twoMinutesAgo = new Date(Date.now() - 2 * 60_000).toISOString();
      const { count: activeCount, error: activeErr } = await supabase
        .from('active_users')
        .select('*', { count: 'exact', head: true })
        .gte('last_seen', twoMinutesAgo);
      if (activeErr) throw activeErr;

      // ── Aggregations ──────────────────────────────────────────────────────

      const uniqueSessions = new Set(rangeVisits.map((v) => v.session_id)).size;

      setStats({
        totalVisits: totalCount ?? 0,
        visitsInRange: rangeVisits.length,
        uniqueSessions,
        activeUsers: activeCount ?? 0,
      });

      // Pages table
      const pageCounts: Record<string, number> = {};
      rangeVisits.forEach((v) => {
        pageCounts[v.page] = (pageCounts[v.page] || 0) + 1;
      });
      const total = rangeVisits.length || 1;
      const sortedPages: PageStat[] = Object.entries(pageCounts)
        .map(([page, count]) => ({ page, count, pct: Math.round((count / total) * 100) }))
        .sort((a, b) => b.count - a.count);
      setPageStats(sortedPages);

      // Chart: group by hour (today) or by day (7 days)
      if (filter === 'today') {
        // Last 24 hours, grouped by hour
        const buckets: Record<string, number> = {};
        for (let h = 23; h >= 0; h--) {
          const key = format(startOfHour(subHours(now, h)), 'HH:00');
          buckets[key] = 0;
        }
        rangeVisits.forEach((v) => {
          const key = format(startOfHour(new Date(v.timestamp)), 'HH:00');
          if (key in buckets) buckets[key] = (buckets[key] || 0) + 1;
        });
        setChartData(
          Object.entries(buckets).map(([label, visits]) => ({ label, visits }))
        );
      } else {
        // Last 7 days, grouped by day
        const buckets: Record<string, number> = {};
        for (let d = 6; d >= 0; d--) {
          const key = format(subDays(now, d), 'MMM d');
          buckets[key] = 0;
        }
        rangeVisits.forEach((v) => {
          const key = format(new Date(v.timestamp), 'MMM d');
          if (key in buckets) buckets[key] = (buckets[key] || 0) + 1;
        });
        setChartData(
          Object.entries(buckets).map(([label, visits]) => ({ label, visits }))
        );
      }

      // Recent visits (top 10)
      setRecentVisits(rangeVisits.slice(0, 10));
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('[VisitorsDashboard] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Initial load + re-fetch when filter changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time: recount active users whenever active_users table changes
  useEffect(() => {
    const channel = supabase
      .channel('active_users_rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'active_users' },
        async () => {
          const twoMinutesAgo = new Date(Date.now() - 2 * 60_000).toISOString();
          const { count } = await supabase
            .from('active_users')
            .select('*', { count: 'exact', head: true })
            .gte('last_seen', twoMinutesAgo);
          setStats((prev) => ({ ...prev, activeUsers: count ?? 0 }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── UI ────────────────────────────────────────────────────────────────────

  const statCards = [
    {
      label: 'Total Visits (All Time)',
      value: stats.totalVisits.toLocaleString(),
      icon: Eye,
      accent: 'text-blue-600',
    },
    {
      label: filter === 'today' ? 'Visits Today' : 'Visits (7 Days)',
      value: stats.visitsInRange.toLocaleString(),
      icon: Globe,
      accent: 'text-green-600',
    },
    {
      label: filter === 'today' ? 'Unique Sessions Today' : 'Unique Sessions (7d)',
      value: stats.uniqueSessions.toLocaleString(),
      icon: Users,
      accent: 'text-purple-600',
    },
    {
      label: 'Active Right Now',
      value: stats.activeUsers.toLocaleString(),
      icon: Activity,
      accent: 'text-orange-500',
      live: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Visitor Analytics</h2>
          <p className="text-xs text-muted-foreground">
            Last refreshed: {format(lastRefreshed, 'HH:mm:ss')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter buttons */}
          <div className="flex rounded-md border border-input overflow-hidden text-sm">
            <button
              onClick={() => setFilter('today')}
              className={`px-3 py-1.5 transition-colors ${
                filter === 'today'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('7days')}
              className={`px-3 py-1.5 transition-colors border-l border-input ${
                filter === '7days'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Last 7 Days
            </button>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-lg bg-muted p-3 ${s.accent}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-bold">{loading ? '—' : s.value}</p>
                  {s.live && (
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {filter === 'today' ? 'Visits by Hour (Today)' : 'Visits per Day (Last 7 Days)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
              Loading chart…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom grid: pages + recent visits */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pages table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading…</p>
            ) : pageStats.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No visits recorded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead className="text-right w-16">Visits</TableHead>
                    <TableHead className="text-right w-14">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageStats.map((p) => (
                    <TableRow key={p.page}>
                      <TableCell className="font-medium text-sm">
                        <div className="flex flex-col">
                          <span>{friendlyPage(p.page)}</span>
                          <span className="text-xs text-muted-foreground font-mono">{p.page}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{p.count}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-xs">{p.pct}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent visits */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Recent Visits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading…</p>
            ) : recentVisits.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No visits recorded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentVisits.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-sm font-medium">
                        {friendlyPage(v.page)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {shortAgent(v.user_agent)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(v.timestamp), 'MMM d, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
