'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Search,
  Filter,
  AlertCircle,
  Activity,
  Zap
} from 'lucide-react';
import { cn, formatPercentage, getTriageColor } from '@/lib/utils';

// Mock data for demonstration
const mockClients = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    avatar: '/avatars/sarah.jpg',
    coherence: { current: 72, derivative: 0.03, trend: 'improving' },
    lastSession: '2024-03-10',
    nextSession: '2024-03-17',
    status: 'active',
  },
  {
    id: '2',
    name: 'John Davis',
    avatar: '/avatars/john.jpg',
    coherence: { current: 45, derivative: -0.04, trend: 'declining' },
    lastSession: '2024-03-08',
    nextSession: '2024-03-15',
    status: 'active',
  },
  {
    id: '3',
    name: 'Emily Chen',
    avatar: '/avatars/emily.jpg',
    coherence: { current: 88, derivative: 0.06, trend: 'breakthrough' },
    lastSession: '2024-03-12',
    nextSession: '2024-03-19',
    status: 'active',
  },
  {
    id: '4',
    name: 'Michael Brown',
    avatar: '/avatars/michael.jpg',
    coherence: { current: 62, derivative: 0.01, trend: 'stable' },
    lastSession: '2024-03-11',
    nextSession: '2024-03-18',
    status: 'active',
  },
];

export default function CoachDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !selectedFilter || getTriageColor(client.coherence) === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Active Clients"
          value="24"
          change="+2 this week"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg Coherence"
          value="67%"
          change="+5% this month"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Sessions This Week"
          value="18"
          change="6 upcoming"
          icon={<Calendar className="h-4 w-4" />}
        />
        <MetricCard
          title="Monthly Revenue"
          value="$8,450"
          change="+12% vs last month"
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      {/* Client Monitoring Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Client Coherence Monitor</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <TriageFilterButtons
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Breakthroughs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ActivityItem
                client="Emily Chen"
                action="Achieved breakthrough in activation dimension"
                time="2 hours ago"
                type="breakthrough"
              />
              <ActivityItem
                client="Sarah Mitchell"
                action="Completed weekly assessment - coherence up 8%"
                time="5 hours ago"
                type="improvement"
              />
              <ActivityItem
                client="Michael Brown"
                action="Started new intervention: Values Excavation"
                time="1 day ago"
                type="intervention"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SessionItem
                client="John Davis"
                time="Today, 2:00 PM"
                focus="Address declining coherence"
                urgent
              />
              <SessionItem
                client="Sarah Mitchell"
                time="Tomorrow, 10:00 AM"
                focus="Build on recent progress"
              />
              <SessionItem
                client="Emily Chen"
                time="Mar 19, 3:00 PM"
                focus="Integration work post-breakthrough"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{change}</p>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function TriageFilterButtons({
  selectedFilter,
  onFilterChange,
}: {
  selectedFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}) {
  const filters = [
    { value: 'critical', label: 'Critical', color: 'bg-triage-critical' },
    { value: 'warning', label: 'Warning', color: 'bg-triage-warning' },
    { value: 'stable', label: 'Stable', color: 'bg-triage-stable' },
    { value: 'thriving', label: 'Thriving', color: 'bg-triage-thriving' },
    { value: 'breakthrough', label: 'Breakthrough', color: 'bg-triage-breakthrough' },
  ];

  return (
    <div className="flex gap-1">
      <Button
        variant={selectedFilter === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange(null)}
      >
        All
      </Button>
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={selectedFilter === filter.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className="gap-2"
        >
          <div className={cn('w-3 h-3 rounded-full', filter.color)} />
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

function ClientCard({ client }: { client: any }) {
  const triageColor = getTriageColor(client.coherence);
  const triageColorClass = {
    critical: 'border-triage-critical bg-triage-critical/10',
    warning: 'border-triage-warning bg-triage-warning/10',
    stable: 'border-triage-stable bg-triage-stable/10',
    thriving: 'border-triage-thriving bg-triage-thriving/10',
    breakthrough: 'border-triage-breakthrough bg-triage-breakthrough/10',
  }[triageColor];

  return (
    <Card className={cn('border-2 transition-all hover:shadow-lg', triageColorClass)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              {client.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold">{client.name}</h3>
              <p className="text-sm text-muted-foreground">
                Next: {new Date(client.nextSession).toLocaleDateString()}
              </p>
            </div>
          </div>
          <TriageIndicator status={triageColor} />
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">Coherence</span>
              <span className="font-semibold">{formatPercentage(client.coherence.current)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${client.coherence.current}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DerivativeIndicator value={client.coherence.derivative} />
              <span className="text-sm capitalize">{client.coherence.trend}</span>
            </div>
            <Button size="sm" variant="ghost">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TriageIndicator({ status }: { status: string }) {
  const config = {
    critical: { color: 'bg-triage-critical', icon: AlertCircle, label: 'Critical' },
    warning: { color: 'bg-triage-warning', icon: AlertCircle, label: 'Warning' },
    stable: { color: 'bg-triage-stable', icon: Activity, label: 'Stable' },
    thriving: { color: 'bg-triage-thriving', icon: TrendingUp, label: 'Thriving' },
    breakthrough: { color: 'bg-triage-breakthrough', icon: Zap, label: 'Breakthrough' },
  }[status] || { color: 'bg-gray-500', icon: Activity, label: 'Unknown' };

  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-3 h-3 rounded-full', config.color)} />
      <Icon className="h-4 w-4" />
    </div>
  );
}

function DerivativeIndicator({ value }: { value: number }) {
  const isPositive = value > 0;
  const isNeutral = Math.abs(value) < 0.02;

  if (isNeutral) {
    return <span className="text-muted-foreground">→</span>;
  }

  return (
    <span className={cn('font-semibold', isPositive ? 'text-green-600' : 'text-red-600')}>
      {isPositive ? '↗' : '↘'} {Math.abs(value * 100).toFixed(1)}%/day
    </span>
  );
}

function ActivityItem({
  client,
  action,
  time,
  type,
}: {
  client: string;
  action: string;
  time: string;
  type: 'breakthrough' | 'improvement' | 'intervention';
}) {
  const icons = {
    breakthrough: <Zap className="h-4 w-4 text-triage-breakthrough" />,
    improvement: <TrendingUp className="h-4 w-4 text-triage-thriving" />,
    intervention: <Activity className="h-4 w-4 text-triage-stable" />,
  };

  return (
    <div className="flex gap-3">
      <div className="mt-1">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-semibold">{client}</span> {action}
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

function SessionItem({
  client,
  time,
  focus,
  urgent = false,
}: {
  client: string;
  time: string;
  focus: string;
  urgent?: boolean;
}) {
  return (
    <div className={cn('flex gap-3 p-3 rounded-lg', urgent && 'bg-destructive/10')}>
      <Calendar className={cn('h-4 w-4 mt-1', urgent && 'text-destructive')} />
      <div className="flex-1">
        <p className="text-sm font-semibold">{client}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
        <p className="text-xs mt-1">{focus}</p>
      </div>
      {urgent && (
        <AlertCircle className="h-4 w-4 text-destructive" />
      )}
    </div>
  );
}