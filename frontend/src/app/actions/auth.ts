'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { 
  createUserSession, 
  storeRegistrationIntent, 
  getRegistrationIntent,
  clearRegistrationIntent,
  logout as sessionLogout 
} from '@/lib/session';

// Validation schemas
const coachSignupSchema = z.object({
  category: z.enum(['life', 'executive', 'health', 'business', 'relationship', 'rehabilitation'], {
    errorMap: () => ({ message: 'Please select a valid coaching category' })
  }),
  tier: z.enum(['starter', 'professional', 'enterprise']).optional(),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  acceptTerms: z.literal('on', {
    errorMap: () => ({ message: 'You must accept the terms of service' })
  })
});

const clientSignupSchema = z.object({
  coachCode: z.string()
    .length(11, 'Coach code must be in format XXX-XXX-XXX')
    .regex(/^[A-Z]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$/, 'Invalid coach code format')
});

export type CoachSignupState = {
  errors?: {
    category?: string[];
    tier?: string[];
    businessName?: string[];
    acceptTerms?: string[];
    _form?: string[];
  };
  values?: {
    category?: string;
    tier?: string;
    businessName?: string;
  };
  success?: boolean;
};

export type ClientSignupState = {
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

// Server action for coach signup with validation
export async function signUpCoach(
  prevState: CoachSignupState,
  formData: FormData
): Promise<CoachSignupState> {
  // Parse form data
  const rawFormData = {
    category: formData.get('category'),
    tier: formData.get('tier'),
    businessName: formData.get('businessName'),
    acceptTerms: formData.get('acceptTerms')
  };

  // Validate
  const validatedFields = coachSignupSchema.safeParse(rawFormData);
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: {
        category: rawFormData.category?.toString(),
        tier: rawFormData.tier?.toString(),
        businessName: rawFormData.businessName?.toString(),
      }
    };
  }

  try {
    // Store registration intent
    await storeRegistrationIntent({
      category: validatedFields.data.category,
      tier: validatedFields.data.tier,
      businessName: validatedFields.data.businessName,
      role: 'coach',
    });
    
    // Return success state before redirect
    return { success: true };
  } catch (error) {
    return {
      errors: {
        _form: ['Something went wrong. Please try again.']
      },
      values: {
        category: validatedFields.data.category,
        tier: validatedFields.data.tier,
        businessName: validatedFields.data.businessName,
      }
    };
  }
}

// Server action for client signup with validation
export async function signUpClient(
  prevState: ClientSignupState,
  formData: FormData
): Promise<ClientSignupState> {
  const rawFormData = {
    coachCode: formData.get('coachCode')?.toString().toUpperCase()
  };

  // Validate
  const validatedFields = clientSignupSchema.safeParse(rawFormData);
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      values: {
        coachCode: rawFormData.coachCode
      }
    };
  }

  try {
    // Validate coach code
    const coach = await getCoachByCode(validatedFields.data.coachCode);
    if (!coach) {
      return {
        errors: {
          coachCode: ['Invalid coach code. Please check and try again.']
        },
        values: {
          coachCode: validatedFields.data.coachCode
        }
      };
    }

    await storeRegistrationIntent({
      coachId: coach.id,
      role: 'client',
    });

    return { success: true, coach };
  } catch (error) {
    return {
      errors: {
        _form: ['Something went wrong. Please try again.']
      },
      values: {
        coachCode: validatedFields.data.coachCode
      }
    };
  }
}

// Mock function to get coach by code
export async function getCoachByCode(code: string) {
  // In production, this would query the database
  if (code === 'ABC-123-XYZ') {
    return {
      id: 'coach-123',
      name: 'Demo Coach',
      businessName: 'Demo Coaching Business',
    };
  }
  return null;
}

// Server action to complete registration after OAuth
export async function completeRegistration(email: string, name: string, provider: string) {
  const registrationIntent = await getRegistrationIntent();
  
  if (!registrationIntent) {
    // Existing user sign in
    const userData = await getUserFromDatabase(email);
    if (userData) {
      await createUserSession(userData);
      redirect(userData.role === 'coach' ? '/dashboard' : '/portal/dashboard');
    }
    redirect('/auth/error');
  }
  
  // New user registration
  const userId = `user_${Date.now()}`;
  const tenantId = registrationIntent.role === 'coach' 
    ? `tenant_${Date.now()}` 
    : registrationIntent.coachId || await getTenantIdFromCoachCode(registrationIntent.coachCode!);
  
  const user = {
    id: userId,
    email,
    name: name || email.split('@')[0],
    role: registrationIntent.role,
    tenantId,
    category: registrationIntent.category,
    tier: registrationIntent.tier,
    businessName: registrationIntent.businessName,
  };
  
  // Save to database (mock for now)
  await saveUserToDatabase(user);
  
  // Create session
  await createUserSession(user);
  
  // Clear registration intent
  await clearRegistrationIntent();
  
  // Redirect to appropriate dashboard
  redirect(user.role === 'coach' ? '/dashboard' : '/portal/dashboard');
}

// Mock database functions (replace with real implementation)
async function getUserFromDatabase(email: string) {
  if (typeof window !== 'undefined') {
    const users = JSON.parse(localStorage.getItem('gct_users') || '[]');
    return users.find((u: any) => u.email === email);
  }
  return null;
}

async function saveUserToDatabase(user: any) {
  if (typeof window !== 'undefined') {
    const users = JSON.parse(localStorage.getItem('gct_users') || '[]');
    users.push(user);
    localStorage.setItem('gct_users', JSON.stringify(users));
  }
}

async function getTenantIdFromCoachCode(coachCode: string) {
  // In production, look up coach by code
  // For now, return a mock tenant ID
  return `tenant_coach_${coachCode}`;
}

// Logout action
export async function logout() {
  await sessionLogout();
}