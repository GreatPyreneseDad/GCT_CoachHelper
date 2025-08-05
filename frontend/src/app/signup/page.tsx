import { signUpCoach } from '@/app/actions/auth';
import { CoachSignupForm } from '@/components/forms/coach-signup-form';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-primary/10">
      <CoachSignupForm action={signUpCoach} />
    </div>
  );
}