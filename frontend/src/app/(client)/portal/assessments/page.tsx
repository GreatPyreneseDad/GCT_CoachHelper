'use client';

import { AssessmentFlow } from '@/components/assessment/assessment-flow';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AssessmentsPage() {
  const router = useRouter();

  const handleComplete = (scores: any) => {
    // Show success and redirect to portal
    router.push('/portal');
  };

  return (
    <div className="container max-w-4xl py-6">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Portal
      </Button>

      <AssessmentFlow 
        type="quick_checkin"
        onComplete={handleComplete}
      />
    </div>
  );
}