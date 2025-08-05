'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  TrendingUp,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOptimisticList } from '@/hooks/use-optimistic-update';
import { cn } from '@/lib/utils';

type ClientData = {
  id: string;
  name: string;
  email: string;
  coherenceScore: number;
  coherenceDerivative: number;
  lastSession: string;
  status: 'critical' | 'warning' | 'stable' | 'thriving' | 'breakthrough';
};

type CoherenceUpdate = {
  clientId: string;
  coherenceScore: number;
  coherenceDerivative: number;
};

function getTriageColor(score: number, derivative: number): ClientData['status'] {
  if (score < 40 || derivative < -0.05) return 'critical';
  if (score < 60 || derivative < -0.01) return 'warning';
  if (score > 80 && derivative > 0.02) return 'thriving';
  if (score > 90 && derivative > 0.05) return 'breakthrough';
  return 'stable';
}

function getTriageBadge(status: ClientData['status']) {
  const variants: Record<ClientData['status'], { color: string; icon: React.ReactNode }> = {
    critical: { color: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
    warning: { color: 'warning', icon: <ArrowDownRight className="h-3 w-3" /> },
    stable: { color: 'secondary', icon: <Minus className="h-3 w-3" /> },
    thriving: { color: 'default', icon: <ArrowUpRight className="h-3 w-3" /> },
    breakthrough: { color: 'success', icon: <TrendingUp className="h-3 w-3" /> },
  };

  const variant = variants[status];

  return (
    <Badge variant={variant.color as any} className="gap-1">
      {variant.icon}
      {status}
    </Badge>
  );
}

export function CoherenceMonitor({ 
  initialClients,
  tenantId
}: { 
  initialClients: ClientData[];
  tenantId: string;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  const { items: clients, update } = useOptimisticList(initialClients, {
    update: async (id, updates) => {
      // Call API to persist update
      const response = await fetch(`/api/clients/${id}/coherence`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
  });

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_WEBSOCKET_URL) return;

    const connectWebSocket = () => {
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/coherence`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Subscribe to tenant-specific updates
        ws.send(JSON.stringify({ type: 'subscribe', tenantId }));
      };

      ws.onmessage = (event) => {
        const data: CoherenceUpdate = JSON.parse(event.data);
        setLastUpdate(new Date());
        
        // Update client data optimistically
        const client = clients.find(c => c.id === data.clientId);
        if (client) {
          update(data.clientId, {
            coherenceScore: data.coherenceScore,
            coherenceDerivative: data.coherenceDerivative,
            status: getTriageColor(data.coherenceScore, data.coherenceDerivative),
          });
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [tenantId, clients, update]);

  // Sort clients by priority: critical > warning > stable > thriving > breakthrough
  const sortedClients = [...clients].sort((a, b) => {
    const statusOrder = { critical: 0, warning: 1, stable: 2, thriving: 3, breakthrough: 4 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Client Coherence Monitor</CardTitle>
            <CardDescription>
              Real-time coherence tracking for your clients
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {isConnected ? (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 text-sm text-green-600"
                >
                  <Wifi className="h-4 w-4" />
                  <span>Live</span>
                </motion.div>
              ) : (
                <motion.div
                  key="disconnected"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 text-sm text-muted-foreground"
                >
                  <WifiOff className="h-4 w-4" />
                  <span>Connecting...</span>
                </motion.div>
              )}
            </AnimatePresence>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {sortedClients.map((client) => (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
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
                      <motion.span 
                        key={`${client.id}-score-${client.coherenceScore}`}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold"
                      >
                        {client.coherenceScore}%
                      </motion.span>
                    </div>
                    <motion.p 
                      key={`${client.id}-derivative-${client.coherenceDerivative}`}
                      initial={{ color: client.coherenceDerivative > 0 ? '#22c55e' : '#ef4444' }}
                      animate={{ color: '#6b7280' }}
                      transition={{ duration: 1 }}
                      className="text-sm text-muted-foreground"
                    >
                      {client.coherenceDerivative > 0 ? '+' : ''}{(client.coherenceDerivative * 100).toFixed(1)}% /week
                    </motion.p>
                  </div>
                  
                  {getTriageBadge(client.status)}
                  
                  <Button size="sm">View Details</Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {!isConnected && clients.length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Real-time updates temporarily unavailable
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}