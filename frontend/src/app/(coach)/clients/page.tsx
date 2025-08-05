'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search,
  UserPlus,
  Mail,
  Calendar,
  TrendingUp,
  MoreVertical,
  Copy,
  Send,
  AlertCircle
} from 'lucide-react';
import { cn, formatPercentage, getTriageColor } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

// Mock data
const mockClients = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    email: 'sarah@example.com',
    status: 'active',
    joinedDate: '2024-01-15',
    lastSession: '2024-03-10',
    nextSession: '2024-03-17',
    coherence: { current: 72, derivative: 0.03, trend: 'improving' },
    sessionsCompleted: 12,
  },
  {
    id: '2',
    name: 'John Davis',
    email: 'john@example.com',
    status: 'active',
    joinedDate: '2024-02-01',
    lastSession: '2024-03-08',
    nextSession: '2024-03-15',
    coherence: { current: 45, derivative: -0.04, trend: 'declining' },
    sessionsCompleted: 8,
  },
  {
    id: '3',
    name: 'Emily Chen',
    email: 'emily@example.com',
    status: 'active',
    joinedDate: '2023-11-20',
    lastSession: '2024-03-12',
    nextSession: '2024-03-19',
    coherence: { current: 88, derivative: 0.06, trend: 'breakthrough' },
    sessionsCompleted: 20,
  },
  {
    id: '4',
    name: 'Michael Brown',
    email: 'michael@example.com',
    status: 'paused',
    joinedDate: '2024-01-05',
    lastSession: '2024-02-28',
    coherence: { current: 62, derivative: 0.01, trend: 'stable' },
    sessionsCompleted: 10,
  },
];

// Generate a coach invitation code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 3; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }
  return segments.join('-');
};

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [inviteCode] = useState(generateInviteCode());
  const { toast } = useToast();

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'active' && client.status === 'active') ||
                      (selectedTab === 'paused' && client.status === 'paused');
    return matchesSearch && matchesTab;
  });

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: 'Invite code copied!',
      description: 'Share this code with your new client.',
    });
  };

  const sendInvite = () => {
    // TODO: Implement email invite
    toast({
      title: 'Invite sent!',
      description: 'An invitation email has been sent to your client.',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage and monitor your coaching clients
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">20</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Coherence</p>
                <p className="text-2xl font-bold">67%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">18</p>
                <p className="text-xs text-muted-foreground">sessions</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Section */}
      <Card>
        <CardHeader>
          <CardTitle>Invite New Client</CardTitle>
          <CardDescription>
            Share this code with new clients to join your coaching program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Input
                  value={inviteCode}
                  readOnly
                  className="font-mono text-lg text-center"
                />
                <Button onClick={copyInviteCode} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This code allows clients to register under your coaching practice
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={sendInvite}>
                <Mail className="mr-2 h-4 w-4" />
                Send Invite Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client List</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All Clients</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <ClientRow key={client.id} client={client} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientRow({ client }: { client: any }) {
  const triageColor = getTriageColor(client.coherence);
  const triageColorClass = {
    critical: 'bg-triage-critical',
    warning: 'bg-triage-warning',
    stable: 'bg-triage-stable',
    thriving: 'bg-triage-thriving',
    breakthrough: 'bg-triage-breakthrough',
  }[triageColor];

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={`/avatars/${client.id}.jpg`} />
          <AvatarFallback>{client.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{client.name}</h3>
            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
              {client.status}
            </Badge>
            <div className={cn("h-3 w-3 rounded-full", triageColorClass)} />
          </div>
          <p className="text-sm text-muted-foreground">{client.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm font-medium">{formatPercentage(client.coherence.current)}</p>
          <p className="text-xs text-muted-foreground">Coherence</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{client.sessionsCompleted}</p>
          <p className="text-xs text-muted-foreground">Sessions</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {client.nextSession ? new Date(client.nextSession).toLocaleDateString() : 'Not scheduled'}
          </p>
          <p className="text-xs text-muted-foreground">Next session</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Session
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Message
            </DropdownMenuItem>
            <DropdownMenuItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Progress
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <AlertCircle className="mr-2 h-4 w-4" />
              Pause Coaching
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}