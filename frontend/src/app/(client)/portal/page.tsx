'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { clientService } from '@/services/api/client.service';
import { AssessmentFlow } from '@/components/assessment/assessment-flow';
import { CoherenceProgressChart } from '@/components/charts/coherence-progress-chart';
import { DimensionRadarChart } from '@/components/charts/dimension-radar-chart';
import { 
  Activity, 
  TrendingUp, 
  Calendar, 
  ClipboardCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

function CoherenceDisplay({ 
  score, 
  dimensions, 
  derivative, 
  status 
}: { 
  score: number; 
  dimensions: Record<string, number>; 
  derivative: number;
  status: string;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'thriving': return 'text-green-600';
      case 'breakthrough': return 'text-purple-600';
      default: return 'text-blue-600';
    }
  };

  const getDerivativeIcon = (derivative: number) => {
    if (derivative > 0.01) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (derivative < -0.01) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Coherence Score</CardTitle>
        <CardDescription>Current overall coherence and dimensional breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-6xl font-bold mb-2">{Math.round(score)}%</div>
          <div className="flex items-center justify-center gap-2">
            {getDerivativeIcon(derivative)}
            <span className="text-sm text-muted-foreground">
              {derivative > 0 ? '+' : ''}{(derivative * 100).toFixed(1)}% /week
            </span>
          </div>
          <div className={`mt-2 font-medium ${getStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>

        {Object.keys(dimensions).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Dimensions</h4>
            {Object.entries(dimensions).map(([dimension, value]) => (
              <div key={dimension} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{dimension}</span>
                  <span>{Math.round(Number(value))}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClientPortalSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-32 mx-auto mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClientPortalPage() {
  const [showAssessment, setShowAssessment] = useState(false);
  
  const { data: coherence, isLoading: coherenceLoading, refetch: refetchCoherence } = useQuery({
    queryKey: ['client-coherence'],
    queryFn: clientService.getMyCoherence,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: progress } = useQuery({
    queryKey: ['client-progress', '30d'],
    queryFn: () => clientService.getMyProgress('30d'),
  });

  const { data: history } = useQuery({
    queryKey: ['assessment-history'],
    queryFn: clientService.getAssessmentHistory,
  });

  if (coherenceLoading) return <ClientPortalSkeleton />;

  if (!coherence) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load your data. Please refresh and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const lastAssessment = history?.assessments[0];
  const daysSinceAssessment = lastAssessment?.completedAt 
    ? Math.floor((Date.now() - new Date(lastAssessment.completedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleAssessmentComplete = async (scores: any) => {
    setShowAssessment(false);
    await refetchCoherence();
    // Show success message or navigate to results
  };

  if (showAssessment) {
    return (
      <div className="p-6">
        <AssessmentFlow 
          type="quick_checkin" 
          onComplete={handleAssessmentComplete}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Coherence Display */}
      <CoherenceDisplay 
        score={coherence.overall}
        dimensions={coherence.dimensions}
        derivative={coherence.derivative}
        status={coherence.status}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Take Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {daysSinceAssessment !== null 
                ? `Last assessment: ${daysSinceAssessment} days ago`
                : 'No assessments yet'
              }
            </p>
            <Button 
              className="w-full" 
              size="sm"
              onClick={() => setShowAssessment(true)}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Start Check-in
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Book Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Schedule time with your coach
            </p>
            <Button className="w-full" size="sm" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Interventions and exercises
            </p>
            <Button className="w-full" size="sm" variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Library
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle>30-Day Progress</CardTitle>
            <CardDescription>Your coherence journey over the past month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{Math.round(progress.summary.current)}%</div>
                <div className="text-sm text-muted-foreground">Current</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(progress.summary.average)}%</div>
                <div className="text-sm text-muted-foreground">Average</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(progress.summary.max)}%</div>
                <div className="text-sm text-muted-foreground">Peak</div>
              </div>
              <div>
                <div className="text-2xl font-bold flex items-center justify-center">
                  {progress.summary.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-600" />}
                  {progress.summary.trend === 'down' && <ArrowDownRight className="h-5 w-5 text-red-600" />}
                  {progress.summary.trend === 'stable' && <Activity className="h-5 w-5 text-blue-600" />}
                </div>
                <div className="text-sm text-muted-foreground">Trend</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Chart */}
      {progress && progress.dataPoints.length > 0 && (
        <CoherenceProgressChart 
          data={progress.dataPoints} 
          period={progress.period}
        />
      )}

      {/* Dimension Radar */}
      {coherence.dimensions && Object.keys(coherence.dimensions).length > 0 && (
        <DimensionRadarChart 
          dimensions={coherence.dimensions}
        />
      )}
    </div>
  );
}