import { WebSocketServer, WebSocket } from 'ws';
import { AuthService } from './auth.service';

interface WSClient {
  ws: WebSocket;
  userId: string;
  tenantId: string;
}

class WebSocketService {
  private clients: Map<string, WSClient> = new Map();

  setupServer(wss: WebSocketServer) {
    wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection');

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'auth') {
            await this.handleAuth(ws, message.token);
          } else if (message.type === 'coherence_update') {
            await this.handleCoherenceUpdate(message);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
        }
      });

      ws.on('close', () => {
        this.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeClient(ws);
      });
    });
  }

  private async handleAuth(ws: WebSocket, token: string) {
    try {
      const payload = await AuthService.verifyAccessToken(token);
      
      this.clients.set(payload.userId, {
        ws,
        userId: payload.userId,
        tenantId: payload.tenantId,
      });

      ws.send(JSON.stringify({ type: 'auth_success' }));
    } catch (error) {
      ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
      ws.close();
    }
  }

  private async handleCoherenceUpdate(message: any) {
    // Broadcast coherence updates to relevant coaches
    const { clientId, coherenceScore, derivative } = message;
    
    // In production, look up which coach should receive this update
    // For now, just log it
    console.log('Coherence update:', { clientId, coherenceScore, derivative });
  }

  private removeClient(ws: WebSocket) {
    for (const [userId, client] of this.clients.entries()) {
      if (client.ws === ws) {
        this.clients.delete(userId);
        break;
      }
    }
  }

  // Send message to specific user
  sendToUser(userId: string, message: any) {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  // Broadcast to all users in a tenant
  broadcastToTenant(tenantId: string, message: any) {
    for (const client of this.clients.values()) {
      if (client.tenantId === tenantId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  }
}

export const websocketService = new WebSocketService();

export function setupWebSocket(wss: WebSocketServer) {
  websocketService.setupServer(wss);
}