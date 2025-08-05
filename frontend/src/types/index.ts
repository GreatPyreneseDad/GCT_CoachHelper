export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'coach' | 'client';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  tier: 'starter' | 'professional' | 'enterprise';
  clientLimit: number;
  customDomain?: string;
  branding: BrandingConfig;
  features: FeatureFlags;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandingConfig {
  businessName: string;
  tagline?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  customDomain?: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  emailTemplates: {
    welcome?: string;
    sessionReminder?: string;
    progressUpdate?: string;
  };
}

export interface FeatureFlags {
  whiteLabel: boolean;
  customDomain: boolean;
  webStore: boolean;
  chromeExtension: boolean;
  aiIntegration: boolean;
  multiCoach: boolean;
  advancedAnalytics: boolean;
}

export interface Coach extends User {
  category: CoachingCategory;
  profile: CoachProfile;
  clients: Client[];
}

export interface CoachProfile {
  bio?: string;
  specialties: string[];
  certifications: string[];
  experience: string;
  photo?: string;
  availability: {
    timezone: string;
    schedule: WeeklySchedule;
  };
}

export interface Client extends User {
  coachId: string;
  coherenceData: CoherenceData;
  triageStatus: TriageStatus;
  assessments: Assessment[];
  sessions: Session[];
  notes: string;
}

export interface CoherenceData {
  current: number; // 0-100
  psi: number; // Internal Consistency
  rho: number; // Accumulated Wisdom
  q: number; // Moral Activation
  f: number; // Social Belonging
  derivative: number; // Rate of change
  trend: 'declining_fast' | 'declining' | 'stable' | 'improving' | 'breakthrough';
  history: CoherenceSnapshot[];
}

export interface CoherenceSnapshot {
  timestamp: Date;
  overall: number;
  psi: number;
  rho: number;
  q: number;
  f: number;
  source: 'assessment' | 'session' | 'extension';
}

export type TriageStatus = 'critical' | 'warning' | 'stable' | 'thriving' | 'breakthrough';

export interface Assessment {
  id: string;
  clientId: string;
  type: 'initial' | 'weekly' | 'deep-dive' | 'custom';
  responses: AssessmentResponse[];
  scores: CoherenceData;
  insights?: string;
  completedAt: Date;
}

export interface AssessmentResponse {
  questionId: string;
  value: number | string;
  dimension: 'psi' | 'rho' | 'q' | 'f';
}

export interface Session {
  id: string;
  coachId: string;
  clientId: string;
  scheduledAt: Date;
  duration: number; // minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  focus?: string;
  notes?: string;
  coherenceBefore?: number;
  coherenceAfter?: number;
}

export type CoachingCategory = 
  | 'life'
  | 'executive'
  | 'health'
  | 'business'
  | 'relationship'
  | 'performance'
  | 'career'
  | 'rehabilitation';

export interface WeeklySchedule {
  [day: string]: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM
  end: string; // HH:MM
  available: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  clientLimit: number;
  features: string[];
  apiCalls: number;
  storage: string;
  customDomain: boolean;
  whiteLabel: boolean;
  priority: 'standard' | 'priority' | 'dedicated';
}

export interface Product {
  id: string;
  tenantId: string;
  type: 'digital' | 'physical' | 'service' | 'course';
  name: string;
  description: string;
  price: number;
  images: string[];
  inventory?: number;
  deliveryMethod: 'instant' | 'scheduled' | 'shipped';
  category: 'book' | 'course' | 'worksheet' | 'session' | 'merchandise';
}

// Next-auth type extensions
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: 'coach' | 'client';
      tenantId: string;
    };
    accessToken?: string;
    provider?: string;
  }

  interface User {
    role: 'coach' | 'client';
    tenantId: string;
  }
}