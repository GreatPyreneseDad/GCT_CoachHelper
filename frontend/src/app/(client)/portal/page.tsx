'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  TrendingUp,
  Target,
  MessageSquare,
  FileText,
  ChevronRight,
  Brain,
  Heart,
  Users,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mock data for demonstration
const clientData = {
  name: 'Sarah',
  coach: {
    name: 'Transform Life Coaching',
    nextSession: '2024-03-20T14:00:00',
  },
  coherence: {
    overall: 67,
    previousOverall: 55,
    psi: 72,
    rho: 61,
    q: 55,
    f: 85,
    trend: 'improving' as const,
  },
  weeklyProgress: [
    { week: 'W1', score: 45 },
    { week: 'W2', score: 48 },
    { week: 'W3', score: 55 },
    { week: 'W4', score: 67 },
  ],
  recentInsights: [
    {
      id: '1',
      date: '2024-03-15',
      type: 'breakthrough',
      message: 'Major breakthrough in activation dimension - took action on career goals',
    },
    {
      id: '2',
      date: '2024-03-10',
      type: 'insight',
      message: 'Identified pattern of self-doubt in morning routines',
    },
  ],
  upcomingTasks: [
    { id: '1', title: 'Complete weekly check-in', due: 'Today' },
    { id: '2', title: 'Practice courage exercise', due: 'Tomorrow' },
    { id: '3', title: 'Journal reflection on values', due: 'This week' },
  ],
};

export default function ClientPortalPage() {
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  const dimensions = [
    { key: 'psi', name: 'Consistency', icon: Brain, value: clientData.coherence.psi, color: 'text-blue-600' },
    { key: 'rho', name: 'Wisdom', icon: FileText, value: clientData.coherence.rho, color: 'text-purple-600' },
    { key: 'q', name: 'Activation', icon: Zap, value: clientData.coherence.q, color: 'text-orange-600' },
    { key: 'f', name: 'Belonging', icon: Users, value: clientData.coherence.f, color: 'text-green-600' },
  ];

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-blue-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {clientData.name}!</h1>
            <p className="text-muted-foreground mt-1">
              Your journey with {clientData.coach.name}
            </p>
          </div>
          <Button asChild>
            <Link href="/portal/session/book">
              <Calendar className="mr-2 h-4 w-4" />
              Book Session
            </Link>
          </Button>
        </div>

        {/* Coherence Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Your Coherence Score</CardTitle>
            <CardDescription>
              Overall measure of your life alignment and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-2">
                <span className={cn("text-5xl font-bold", getProgressColor(clientData.coherence.overall))}>
                  {clientData.coherence.overall}%
                </span>
                <span className="text-sm text-muted-foreground">
                  {clientData.coherence.overall > clientData.coherence.previousOverall ? (
                    <span className="text-green-600">
                      +{clientData.coherence.overall - clientData.coherence.previousOverall}% this month
                    </span>
                  ) : (
                    'this month'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Improving</span>
              </div>
            </div>
            <Progress value={clientData.coherence.overall} className="h-3" />
            
            {/* Dimension Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {dimensions.map((dim) => {
                const Icon = dim.icon;
                return (
                  <Card 
                    key={dim.key}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedDimension === dim.key && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedDimension(dim.key === selectedDimension ? null : dim.key)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={cn("h-5 w-5", dim.color)} />
                        <span className="text-2xl font-bold">{dim.value}%</span>
                      </div>
                      <p className="text-sm font-medium">{dim.name}</p>
                      <Progress value={dim.value} className="h-1 mt-2" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Session */}
          <Card>
            <CardHeader>
              <CardTitle>Next Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {new Date(clientData.coach.nextSession).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(clientData.coach.nextSession).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/portal/sessions">
                    View All Sessions
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/portal/assessment/weekly">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Take Weekly Check-in
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/portal/progress">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Progress Report
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/portal/resources">
                  <FileText className="mr-2 h-4 w-4" />
                  Resources & Exercises
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clientData.upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Insights</CardTitle>
            <CardDescription>
              Key moments and breakthroughs from your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientData.recentInsights.map((insight) => (
                <div key={insight.id} className="flex gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                    insight.type === 'breakthrough' ? 'bg-green-100' : 'bg-blue-100'
                  )}>
                    {insight.type === 'breakthrough' ? (
                      <Zap className="h-5 w-5 text-green-600" />
                    ) : (
                      <Heart className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">{insight.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(insight.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}