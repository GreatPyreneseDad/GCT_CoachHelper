'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCoachByCode } from './auth';

const verifyCoachSchema = z.object({
  coachCode: z.string()
    .length(11, 'Coach code must be in format XXX-XXX-XXX')
    .regex(/^[A-Z]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$/, 'Invalid coach code format')
});

const clientProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[\d\s()-]+$/, 'Invalid phone number').optional(),
  timezone: z.string().min(1, 'Please select your timezone'),
  goals: z.array(z.string()).min(1, 'Please select at least one goal'),
  preferredSessionTime: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
  consentToRecording: z.literal('on', {
    errorMap: () => ({ message: 'You must consent to session recording' })
  })
});

export type VerifyCoachState = {
  errors?: {
    coachCode?: string[];
    _form?: string[];
  };
  values?: {
    coachCode?: string;
  };
  success?: boolean;
  coach?: {
    id: string;
    name: string;
    businessName: string;
  };
};

export type ClientProfileState = {
  errors?: {
    fullName?: string[];
    phone?: string[];
    timezone?: string[];
    goals?: string[];
    preferredSessionTime?: string[];
    consentToRecording?: string[];
    _form?: string[];
  };
  values?: {
    fullName?: string;
    phone?: string;
    timezone?: string;
    goals?: string[];
    preferredSessionTime?: string;
  };
  success?: boolean;
};

export async function verifyCoachCode(
  prevState: VerifyCoachState,
  formData: FormData
): Promise<VerifyCoachState> {
  const validation = verifyCoachSchema.safeParse({
    coachCode: formData.get('coachCode')?.toString().toUpperCase()
  });

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      values: { coachCode: formData.get('coachCode')?.toString() }
    };
  }

  // Verify coach code against database
  const coach = await getCoachByCode(validation.data.coachCode);
  
  if (!coach) {
    return {
      errors: { coachCode: ['Invalid coach code. Please check and try again.'] },
      values: { coachCode: validation.data.coachCode }
    };
  }

  // Store coach info in secure cookie
  cookies().set('pending_coach', JSON.stringify({
    id: coach.id,
    name: coach.name,
    businessName: coach.businessName,
    code: validation.data.coachCode
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 // 1 hour
  });

  return { success: true, coach };
}

export async function createClientProfile(
  prevState: ClientProfileState,
  formData: FormData
): Promise<ClientProfileState> {
  // Get coach info from cookie
  const pendingCoach = cookies().get('pending_coach');
  if (!pendingCoach) {
    return { errors: { _form: ['Session expired. Please start over.'] } };
  }

  const goals = formData.getAll('goals');
  const validation = clientProfileSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    timezone: formData.get('timezone'),
    goals,
    preferredSessionTime: formData.get('preferredSessionTime'),
    consentToRecording: formData.get('consentToRecording')
  });

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      values: {
        fullName: formData.get('fullName')?.toString(),
        phone: formData.get('phone')?.toString(),
        timezone: formData.get('timezone')?.toString(),
        goals: goals.map(g => g.toString()),
        preferredSessionTime: formData.get('preferredSessionTime')?.toString()
      }
    };
  }

  try {
    // Import from auth.ts to avoid circular dependency
    const { storeRegistrationIntent } = await import('./auth');
    
    // Store profile data for OAuth completion
    await storeRegistrationIntent({
      role: 'client',
      coachId: JSON.parse(pendingCoach.value).id,
      profile: validation.data
    });

    // Clear temporary coach cookie
    cookies().delete('pending_coach');

    return { success: true };
  } catch (error) {
    return {
      errors: {
        _form: ['Something went wrong. Please try again.']
      },
      values: {
        fullName: validation.data.fullName,
        phone: validation.data.phone,
        timezone: validation.data.timezone,
        goals: validation.data.goals,
        preferredSessionTime: validation.data.preferredSessionTime
      }
    };
  }
}