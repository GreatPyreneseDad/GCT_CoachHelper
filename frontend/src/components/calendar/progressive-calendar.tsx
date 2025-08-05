'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Video,
  MapPin,
  Loader2,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

interface Session {
  id: string;
  clientId: string;
  clientName: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'video' | 'phone' | 'in-person';
  status: 'scheduled' | 'completed' | 'cancelled';
  coherenceScore?: number;
  notes?: string;
}

interface ProgressiveCalendarProps {
  initialSessions?: Session[];
  onDateSelect?: (date: Date) => void;
  onSessionClick?: (session: Session) => void;
  onLoadMonth?: (date: Date) => Promise<Session[]>;
  className?: string;
}

function SessionCard({ 
  session, 
  onClick 
}: { 
  session: Session; 
  onClick?: () => void;
}) {
  const typeIcons = {
    video: Video,
    phone: Clock,
    'in-person': MapPin,
  };
  
  const TypeIcon = typeIcons[session.type];
  
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full p-2 rounded-md text-left transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        session.status === 'cancelled' && "opacity-50 line-through"
      )}
    >
      <div className="flex items-start gap-2">
        <TypeIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">
            {session.startTime} - {session.clientName}
          </p>
          {session.coherenceScore && (
            <p className="text-xs text-muted-foreground">
              Score: {session.coherenceScore}%
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function DayCell({ 
  date, 
  sessions, 
  isCurrentMonth, 
  isToday,
  isSelected,
  onSelect,
  isLoading
}: {
  date: Date;
  sessions: Session[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
  isLoading?: boolean;
}) {
  const dayNumber = format(date, 'd');
  const hasSessionsCount = sessions.length;
  
  return (
    <motion.div
      layout
      className={cn(
        "relative min-h-[100px] p-2 border-r border-b",
        !isCurrentMonth && "bg-muted/30",
        isToday && "bg-primary/5",
        isSelected && "ring-2 ring-primary ring-inset"
      )}
    >
      <button
        onClick={onSelect}
        className={cn(
          "absolute top-2 left-2 h-6 w-6 rounded-full flex items-center justify-center",
          "text-sm font-medium transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isToday && "bg-primary text-primary-foreground hover:bg-primary/90",
          !isCurrentMonth && "text-muted-foreground"
        )}
      >
        {dayNumber}
      </button>

      {hasSessionsCount > 0 && !isLoading && (
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2 text-xs px-1 h-5"
        >
          {hasSessionsCount}
        </Badge>
      )}

      <div className="mt-8 space-y-1">
        {isLoading ? (
          <div className="space-y-1">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sessions.slice(0, 3).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => {}}
              />
            ))}
            {sessions.length > 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center p-1"
              >
                <Badge variant="outline" className="text-xs">
                  +{sessions.length - 3} more
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

export function ProgressiveCalendar({
  initialSessions = [],
  onDateSelect,
  onSessionClick,
  onLoadMonth,
  className,
}: ProgressiveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [loadingMonths, setLoadingMonths] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, Session[]>();
    sessions.forEach(session => {
      const dateKey = format(session.date, 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(session);
    });
    return map;
  }, [sessions]);

  // Load month data
  const loadMonth = async (date: Date) => {
    if (!onLoadMonth) return;

    const monthKey = format(date, 'yyyy-MM');
    if (loadingMonths.has(monthKey)) return;

    setLoadingMonths(prev => new Set([...prev, monthKey]));

    startTransition(async () => {
      try {
        const newSessions = await onLoadMonth(date);
        setSessions(prev => {
          // Merge new sessions, avoiding duplicates
          const existingIds = new Set(prev.map(s => s.id));
          const filtered = newSessions.filter(s => !existingIds.has(s.id));
          return [...prev, ...filtered];
        });
      } finally {
        setLoadingMonths(prev => {
          const next = new Set(prev);
          next.delete(monthKey);
          return next;
        });
      }
    });
  };

  // Load current month on mount and when month changes
  useEffect(() => {
    loadMonth(currentDate);
  }, [currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subMonths(currentDate, 1) 
      : addMonths(currentDate, 1);
    setCurrentDate(newDate);
  };

  const isMonthLoading = loadingMonths.has(format(currentDate, 'yyyy-MM'));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Calendar Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              {isMonthLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-7">
          {/* Weekday headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium bg-muted border-r border-b last:border-r-0"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, index) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const daySessions = sessionsByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <DayCell
                key={dateKey}
                date={day}
                sessions={daySessions}
                isCurrentMonth={isCurrentMonth}
                isToday={isToday}
                isSelected={!!isSelected}
                onSelect={() => {
                  setSelectedDate(day);
                  onDateSelect?.(day);
                }}
                isLoading={isMonthLoading && isCurrentMonth}
              />
            );
          })}
        </div>
      </Card>

      {/* Selected Date Details */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Session
                  </Button>
                </div>

                <div className="space-y-2">
                  {(sessionsByDate.get(format(selectedDate, 'yyyy-MM-dd')) || [])
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((session) => (
                      <motion.div
                        key={session.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-lg",
                          "border hover:bg-muted/50 transition-colors cursor-pointer"
                        )}
                        onClick={() => onSessionClick?.(session)}
                      >
                        <div className="flex-shrink-0">
                          <div className="text-lg font-semibold">
                            {session.startTime}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.endTime}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{session.clientName}</span>
                            <Badge variant="outline" className="text-xs">
                              {session.type}
                            </Badge>
                          </div>
                          {session.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {session.notes}
                            </p>
                          )}
                        </div>

                        {session.coherenceScore && (
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {session.coherenceScore}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Coherence
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}

                  {(!sessionsByDate.has(format(selectedDate, 'yyyy-MM-dd')) || 
                    sessionsByDate.get(format(selectedDate, 'yyyy-MM-dd'))!.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No sessions scheduled for this date
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}