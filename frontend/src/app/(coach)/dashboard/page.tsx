import { requireRole } from '@/lib/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

// Server-side data fetching
async function getDashboardData(tenantId: string) {
  // In production, these would be real database queries
  // For now, return mock data
  const clients = [
    {
      id: '1',
      name: 'Sarah Mitchell',
      email: 'sarah@example.com',
      coherenceScore: 78,
      coherenceDerivative: 0.03,
      lastSession: '2024-03-18',
      status: 'active',
    },
    {
      id: '2', 
      name: 'John Davis',
      email: 'john@example.com',
      coherenceScore: 45,
      coherenceDerivative: -0.02,
      lastSession: '2024-03-20',
      status: 'critical',
    },
    {
      id: '3',
      name: 'Emily Chen',
      email: 'emily@example.com',
      coherenceScore: 92,
      coherenceDerivative: 0.01,
      lastSession: '2024-03-19',
      status: 'thriving',
    },
  ];

  const stats = {
    totalClients: 12,
    activeClients: 8,
    upcomingSessions: 5,
    averageCoherence: 72,
  };

  return { clients, stats };
}

function getTriageColor(score: number, derivative: number): string {
  if (score < 40 || derivative < -0.05) return 'critical';
  if (score < 60 || derivative < -0.01) return 'warning';
  if (score > 80 && derivative > 0.02) return 'thriving';
  if (score > 90 && derivative > 0.05) return 'breakthrough';
  return 'stable';
}

function getTriageBadge(status: string) {
  const variants: Record<string, { color: string; icon: React.ReactNode }> = {
    critical: { color: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
    warning: { color: 'warning', icon: <ArrowDownRight className="h-3 w-3" /> },
    stable: { color: 'secondary', icon: <Minus className="h-3 w-3" /> },
    thriving: { color: 'default', icon: <ArrowUpRight className="h-3 w-3" /> },
    breakthrough: { color: 'success', icon: <TrendingUp className="h-3 w-3" /> },
  };

  const variant = variants[status] || variants.stable;

  return (
    <Badge variant={variant.color as any} className="gap-1">
      {variant.icon}
      {status}
    </Badge>
  );
}

export default async function DashboardPage() {
  // This runs on the server
  const user = await requireRole('coach');
  const { clients, stats } = await getDashboardData(user.tenantId);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">
          Here's an overview of your coaching practice
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeClients} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Coherence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCoherence}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle>Client Coherence Monitor</CardTitle>
          <CardDescription>
            Real-time coherence tracking for your clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.map((client) => {
              const status = getTriageColor(client.coherenceScore, client.coherenceDerivative);
              
              return (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`/avatars/${client.id}.jpg`} />
                      <AvatarFallback>
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last session: {new Date(client.lastSession).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-2xl font-bold">{client.coherenceScore}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {client.coherenceDerivative > 0 ? '+' : ''}{(client.coherenceDerivative * 100).toFixed(1)}% /week
                      </p>
                    </div>
                    
                    {getTriageBadge(status)}
                    
                    <Button size="sm">View Details</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}