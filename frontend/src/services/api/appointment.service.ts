import { apiClient } from '@/lib/api-client';
import { AuthStorage } from '@/lib/auth-storage';
import { format } from 'date-fns';

export interface Appointment {
  id: string;
  date: Date;
  time: string;
  clientName: string;
  clientId: string;
  type: string;
  duration: number;
  status: string;
  notes?: string;
}

export const appointmentService = {
  async getAppointments(startDate?: Date, endDate?: Date): Promise<Appointment[]> {
    const token = await AuthStorage.getValidToken();
    
    const params = new URLSearchParams();
    if (startDate) params.append('from', startDate.toISOString());
    if (endDate) params.append('to', endDate.toISOString());
    
    const response = await apiClient.get<any[]>(
      `/appointments?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    return response.map(apt => ({
      ...apt,
      date: new Date(apt.scheduledAt),
      time: format(new Date(apt.scheduledAt), 'HH:mm'),
      clientName: apt.client?.user?.name || 'Unknown',
    }));
  },
  
  async createAppointment(data: {
    clientId: string;
    scheduledAt: Date;
    duration: number;
    type: string;
    notes?: string;
  }): Promise<Appointment> {
    const token = await AuthStorage.getValidToken();
    
    const response = await apiClient.post<any>('/appointments', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return {
      ...response,
      date: new Date(response.scheduledAt),
      time: format(new Date(response.scheduledAt), 'HH:mm'),
      clientName: response.client?.user?.name || 'Unknown',
    };
  },
  
  async updateAppointment(id: string, data: Partial<{
    scheduledAt: Date;
    duration: number;
    type: string;
    status: string;
    notes?: string;
  }>): Promise<Appointment> {
    const token = await AuthStorage.getValidToken();
    
    const response = await apiClient.patch<any>(`/appointments/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return {
      ...response,
      date: new Date(response.scheduledAt),
      time: format(new Date(response.scheduledAt), 'HH:mm'),
      clientName: response.client?.user?.name || 'Unknown',
    };
  },
  
  async cancelAppointment(id: string): Promise<void> {
    const token = await AuthStorage.getValidToken();
    
    await apiClient.patch(`/appointments/${id}`, 
      { status: 'cancelled' },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
};