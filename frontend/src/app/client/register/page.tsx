import { ClientRegistrationForm } from '@/components/forms/client-registration';

export default function ClientRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-secondary/5 to-secondary/10">
      <ClientRegistrationForm />
    </div>
  );
}