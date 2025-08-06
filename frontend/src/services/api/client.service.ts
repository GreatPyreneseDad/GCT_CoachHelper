import { apiClient } from '@/lib/api-client';
import { AuthStorage } from '@/lib/auth-storage';

export interface CoherenceData {
  overall: number;
  dimensions: Record<string, number>;
  derivative: number;
  lastAssessment: Date | null;
  status: 'critical' | 'warning' | 'stable' | 'thriving' | 'breakthrough';
}

export interface ProgressData {
  dataPoints: Array<{
    date: Date;
    score: number;
    dimensions: Record<string, number>;
  }>;
  summary: {
    current: number;
    average: number;
    min: number;
    max: number;
    trend: 'up' | 'down' | 'stable';
  };
  period: string;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  dimension: string;
  type: 'scale' | 'multiple_choice' | 'text';
  options?: Array<{ value: string; label: string }>;
  minValue?: number;
  maxValue?: number;
}

export interface AssessmentData {
  assessmentId: string;
  questions: AssessmentQuestion[];
  type: string;
}

export const clientService = {
  async getMyCoherence(): Promise<CoherenceData> {
    const token = await AuthStorage.getValidToken();
    
    const response = await apiClient.get<CoherenceData>('/clients/me/coherence', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return {
      ...response,
      lastAssessment: response.lastAssessment ? new Date(response.lastAssessment) : null,
    };
  },
  
  async getMyProgress(period: string = '30d'): Promise<ProgressData> {
    const token = await AuthStorage.getValidToken();
    
    const response = await apiClient.get<ProgressData>(
      `/clients/me/progress?period=${period}`, 
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    // Convert date strings to Date objects
    return {
      ...response,
      dataPoints: response.dataPoints.map(point => ({
        ...point,
        date: new Date(point.date),
      })),
    };
  },
  
  async startAssessment(type: string): Promise<AssessmentData> {
    const token = await AuthStorage.getValidToken();
    
    return apiClient.post<AssessmentData>(
      '/assessments/create', 
      { type },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
  
  async submitAssessment(
    assessmentId: string, 
    responses: Array<{ questionId: string; value: string | number }>
  ): Promise<{
    success: boolean;
    coherenceScore: number;
    dimensionScores: Record<string, number>;
    derivative: number;
  }> {
    const token = await AuthStorage.getValidToken();
    
    return apiClient.post(
      '/assessments/submit',
      { assessmentId, responses },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
  
  async getAssessmentHistory(): Promise<{
    assessments: Array<{
      id: string;
      type: string;
      status: string;
      overallCoherence: number | null;
      derivative: number | null;
      completedAt: Date | null;
      createdAt: Date;
    }>;
  }> {
    const token = await AuthStorage.getValidToken();
    
    const response = await apiClient.get<any>('/assessments/history', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return {
      assessments: response.assessments.map((a: any) => ({
        ...a,
        completedAt: a.completedAt ? new Date(a.completedAt) : null,
        createdAt: new Date(a.createdAt),
      })),
    };
  },
  
  async getMyAppointments(): Promise<{
    appointments: Array<{
      id: string;
      scheduledAt: Date;
      duration: number;
      status: string;
      meetingUrl?: string;
    }>;
  }> {
    const token = await AuthStorage.getValidToken();
    
    const response = await apiClient.get<any>('/appointments/my-appointments', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return {
      appointments: response.appointments.map((a: any) => ({
        ...a,
        scheduledAt: new Date(a.scheduledAt),
      })),
    };
  },
};