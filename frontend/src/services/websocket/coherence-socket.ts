import { EventEmitter } from 'events';

export interface CoherenceUpdate {
  clientId: string;
  timestamp: Date;
  coherenceScore: number;
  coherenceDerivative: number;
  dimensions: {
    psi: number; // Internal Consistency
    rho: number; // Accumulated Wisdom
    q: number;   // Moral Activation
    f: number;   // Social Belonging
  };
  source: 'extension' | 'manual' | 'api';
}

export interface CoherenceAlert {
  clientId: string;
  type: 'critical' | 'warning' | 'improvement';
  message: string;
  coherenceScore: number;
  timestamp: Date;
}

export class CoherenceWebSocket extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isAuthenticated = false;

  constructor(private url: string, private authToken: string) {
    super();
  }

  connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.authenticate();
      this.startHeartbeat();
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.stopHeartbeat();
      this.isAuthenticated = false;
      this.emit('disconnected');
      this.handleReconnect();
    };
  }

  private authenticate(): void {
    this.send({
      type: 'auth',
      token: this.authToken,
    });
  }

  private handleMessage(data: any): void {
    switch (data.type) {
      case 'auth_success':
        this.isAuthenticated = true;
        this.emit('authenticated');
        break;

      case 'auth_error':
        this.emit('auth_error', data.message);
        this.disconnect();
        break;

      case 'coherence_update':
        this.emit('coherence_update', data.payload as CoherenceUpdate);
        break;

      case 'coherence_alert':
        this.emit('coherence_alert', data.payload as CoherenceAlert);
        break;

      case 'client_connected':
        this.emit('client_connected', data.clientId);
        break;

      case 'client_disconnected':
        this.emit('client_disconnected', data.clientId);
        break;

      case 'pong':
        // Heartbeat response
        break;

      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // Subscribe to specific client updates
  subscribeToClient(clientId: string): void {
    if (this.isAuthenticated) {
      this.send({
        type: 'subscribe_client',
        clientId,
      });
    }
  }

  // Unsubscribe from client updates
  unsubscribeFromClient(clientId: string): void {
    if (this.isAuthenticated) {
      this.send({
        type: 'unsubscribe_client',
        clientId,
      });
    }
  }

  // Subscribe to all clients (for coaches)
  subscribeToAllClients(): void {
    if (this.isAuthenticated) {
      this.send({
        type: 'subscribe_all_clients',
      });
    }
  }

  // Send coherence update (from extension)
  sendCoherenceUpdate(update: Omit<CoherenceUpdate, 'timestamp'>): void {
    if (this.isAuthenticated) {
      this.send({
        type: 'coherence_update',
        payload: {
          ...update,
          timestamp: new Date(),
        },
      });
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated;
  }
}

// Hook for React components
import { useEffect, useState, useCallback } from 'react';

export function useCoherenceSocket(url: string, authToken: string) {
  const [socket, setSocket] = useState<CoherenceWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<CoherenceUpdate | null>(null);
  const [alerts, setAlerts] = useState<CoherenceAlert[]>([]);

  useEffect(() => {
    const ws = new CoherenceWebSocket(url, authToken);
    
    ws.on('connected', () => setIsConnected(true));
    ws.on('disconnected', () => setIsConnected(false));
    ws.on('authenticated', () => console.log('WebSocket authenticated'));
    
    ws.on('coherence_update', (update: CoherenceUpdate) => {
      setLastUpdate(update);
    });
    
    ws.on('coherence_alert', (alert: CoherenceAlert) => {
      setAlerts(prev => [...prev, alert]);
    });

    ws.connect();
    setSocket(ws);

    return () => {
      ws.disconnect();
    };
  }, [url, authToken]);

  const subscribeToClient = useCallback((clientId: string) => {
    socket?.subscribeToClient(clientId);
  }, [socket]);

  const unsubscribeFromClient = useCallback((clientId: string) => {
    socket?.unsubscribeFromClient(clientId);
  }, [socket]);

  const subscribeToAllClients = useCallback(() => {
    socket?.subscribeToAllClients();
  }, [socket]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    isConnected,
    lastUpdate,
    alerts,
    subscribeToClient,
    unsubscribeFromClient,
    subscribeToAllClients,
    clearAlerts,
  };
}