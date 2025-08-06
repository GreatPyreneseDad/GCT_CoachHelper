import { apiClient } from '@/lib/api-client';

export interface DashboardClient {
  id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
  coherenceScore: number;
  coherenceDerivative: number;
  lastSession: Date | null;
  nextAppointment?: Date | null;
  status: 'critical' | 'warning' | 'stable' | 'thriving' | 'breakthrough';
  goals: string[];
}

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  upcomingSessions: number;
  averageCoherence: number;
}

export interface DashboardData {
  clients: DashboardClient[];
  stats: DashboardStats;
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const token = await this.getAuthToken();
    
    const response = await apiClient.get<DashboardData>('/clients/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Transform dates
    return {
      ...response,
      clients: response.clients.map(client => ({
        ...client,
        lastSession: client.lastSession ? new Date(client.lastSession) : null,
        nextAppointment: client.nextAppointment ? new Date(client.nextAppointment) : null,
      })),
    };
  },

  async getClientDetails(clientId: string) {
    const token = await this.getAuthToken();
    
    return apiClient.get(`/clients/${clientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async createInviteCode() {
    const token = await this.getAuthToken();
    
    return apiClient.post('/clients/invite', null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Helper to get auth token from session/storage
  async getAuthToken(): Promise<string> {
    const { AuthStorage } = await import('@/lib/auth-storage');
    return AuthStorage.getValidToken();
  },
};