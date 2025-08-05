'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Plus, Video, MapPin, Clock, Users, Settings, RefreshCw } from 'lucide-react';
import { CalendarService } from '@/services/calendar/calendar-service';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockSessions = [
  {
    id: '1',
    clientName: 'Sarah Mitchell',
    clientEmail: 'sarah@example.com',
    date: new Date('2024-03-20T14:00:00'),
    duration: 60,
    type: 'regular',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    coherenceScore: 72,
  },
  {
    id: '2',
    clientName: 'John Davis',
    clientEmail: 'john@example.com',
    date: new Date('2024-03-21T10:00:00'),
    duration: 60,
    type: 'regular',
    meetLink: 'https://meet.google.com/klm-nopq-rst',
    coherenceScore: 45,
  },
  {
    id: '3',
    clientName: 'Emily Chen',
    clientEmail: 'emily@example.com',
    date: new Date('2024-03-22T15:00:00'),
    duration: 90,
    type: 'deep-dive',
    meetLink: 'https://meet.google.com/uvw-xyz-123',
    coherenceScore: 88,
  },
];

export default function CalendarPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState(mockSessions);
  const [isIntegrated, setIsIntegrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check if calendar is integrated
    setIsIntegrated(!!session?.accessToken && session?.provider === 'google');
  }, [session]);

  const syncCalendar = async () => {
    if (!session) return;
    
    setIsSyncing(true);
    try {
      const calendarService = new CalendarService(session);
      const upcomingSessions = await calendarService.getUpcomingSessions(30);
      
      // TODO: Sync with database
      toast({
        title: 'Calendar synced',
        description: `Found ${upcomingSessions.length} upcoming sessions`,
      });
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: 'Unable to sync with Google Calendar',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate),
    end: endOfWeek(selectedDate),
  });

  const getSessionsForDay = (date: Date) => {
    return sessions.filter(session => isSameDay(session.date, date));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your coaching sessions and availability
          </p>
        </div>
        <div className="flex gap-2">
          {isIntegrated && (
            <Button
              variant="outline"
              onClick={syncCalendar}
              disabled={isSyncing}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
              Sync Calendar
            </Button>
          )}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Session
          </Button>
        </div>
      </div>

      {/* Integration Status */}
      {!isIntegrated && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="text-warning">Calendar Not Connected</CardTitle>
            <CardDescription>
              Connect your Google Calendar to automatically sync sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Connect Google Calendar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Week of {format(startOfWeek(selectedDate), 'MMM d, yyyy')}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prevWeek = new Date(selectedDate);
                  prevWeek.setDate(prevWeek.getDate() - 7);
                  setSelectedDate(prevWeek);
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextWeek = new Date(selectedDate);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  setSelectedDate(nextWeek);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const daySessions = getSessionsForDay(day);
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "border rounded-lg p-4 min-h-[200px]",
                    isCurrentDay && "border-primary bg-primary/5"
                  )}
                >
                  <div className="mb-2">
                    <p className="text-sm font-medium">
                      {format(day, 'EEE')}
                    </p>
                    <p className={cn(
                      "text-2xl font-bold",
                      isCurrentDay && "text-primary"
                    )}>
                      {format(day, 'd')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {daySessions.map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getSessionsForDay(new Date()).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No sessions scheduled for today
                </p>
              ) : (
                getSessionsForDay(new Date()).map((session) => (
                  <DetailedSessionCard key={session.id} session={session} />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Availability Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Availability Settings</CardTitle>
            <CardDescription>
              Set your regular coaching hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Monday - Friday</span>
                <span className="text-sm text-muted-foreground">9:00 AM - 5:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Saturday</span>
                <span className="text-sm text-muted-foreground">Not available</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sunday</span>
                <span className="text-sm text-muted-foreground">Not available</span>
              </div>
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Edit Availability
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: any }) {
  return (
    <div className="bg-primary/10 rounded p-2 text-xs cursor-pointer hover:bg-primary/20 transition-colors">
      <p className="font-medium truncate">{session.clientName}</p>
      <p className="text-muted-foreground">
        {format(session.date, 'h:mm a')}
      </p>
    </div>
  );
}

function DetailedSessionCard({ session }: { session: any }) {
  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      <div className="flex-1">
        <h4 className="font-semibold">{session.clientName}</h4>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(session.date, 'h:mm a')}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {session.duration} min
          </span>
          <Badge variant="outline" className="text-xs">
            {session.coherenceScore}% coherence
          </Badge>
        </div>
      </div>
      <Button size="sm" variant="outline">
        <Video className="mr-2 h-4 w-4" />
        Join
      </Button>
    </div>
  );
}