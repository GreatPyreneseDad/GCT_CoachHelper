'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { format, addDays, setHours, setMinutes, isSameDay, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// Mock coach availability
const coachAvailability = {
  timezone: 'America/New_York',
  availableSlots: [
    { date: new Date('2024-03-21T10:00:00'), available: true },
    { date: new Date('2024-03-21T11:00:00'), available: true },
    { date: new Date('2024-03-21T14:00:00'), available: false },
    { date: new Date('2024-03-21T15:00:00'), available: true },
    { date: new Date('2024-03-22T09:00:00'), available: true },
    { date: new Date('2024-03-22T10:00:00'), available: true },
    { date: new Date('2024-03-22T13:00:00'), available: true },
    { date: new Date('2024-03-22T14:00:00'), available: false },
  ],
};

export default function BookSessionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<'date' | 'time' | 'details' | 'confirm'>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [sessionType, setSessionType] = useState<'regular' | 'deep-dive'>('regular');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Generate next 14 days for selection
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  const getAvailableTimesForDate = (date: Date) => {
    return coachAvailability.availableSlots.filter(slot => 
      isSameDay(slot.date, date)
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep('time');
  };

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    setStep('confirm');
  };

  const handleBookSession = async () => {
    setIsBooking(true);
    try {
      // TODO: Call API to book session
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Session booked!',
        description: 'You'll receive a calendar invite shortly.',
      });
      
      router.push('/portal/sessions');
    } catch (error) {
      toast({
        title: 'Booking failed',
        description: 'Please try again or contact your coach.',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Book a Session</h1>
          <p className="text-muted-foreground mt-1">
            Schedule your next coaching session
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {['Select Date', 'Choose Time', 'Session Details', 'Confirm'].map((label, index) => {
            const stepNumber = index + 1;
            const stepKey = ['date', 'time', 'details', 'confirm'][index];
            const currentStepIndex = ['date', 'time', 'details', 'confirm'].indexOf(step);
            const isActive = index <= currentStepIndex;
            
            return (
              <div key={stepKey} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {index < currentStepIndex ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span className={cn(
                    "ml-2 text-sm hidden sm:inline",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={cn(
                    "flex-1 h-1 mx-4",
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card>
          {step === 'date' && (
            <>
              <CardHeader>
                <CardTitle>Select a Date</CardTitle>
                <CardDescription>
                  Choose an available date for your session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableDates.map((date) => {
                    const availableSlots = getAvailableTimesForDate(date);
                    const hasAvailability = availableSlots.some(slot => slot.available);
                    
                    return (
                      <Button
                        key={date.toISOString()}
                        variant={selectedDate && isSameDay(selectedDate, date) ? "default" : "outline"}
                        className="h-auto flex flex-col py-3"
                        onClick={() => handleDateSelect(date)}
                        disabled={!hasAvailability}
                      >
                        <span className="font-semibold">{format(date, 'EEE')}</span>
                        <span className="text-lg">{format(date, 'MMM d')}</span>
                        <span className="text-xs mt-1">
                          {hasAvailability ? `${availableSlots.filter(s => s.available).length} slots` : 'No slots'}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </>
          )}

          {step === 'time' && selectedDate && (
            <>
              <CardHeader>
                <CardTitle>Choose a Time</CardTitle>
                <CardDescription>
                  Available times on {format(selectedDate, 'EEEE, MMMM d')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getAvailableTimesForDate(selectedDate).map((slot) => (
                    <Button
                      key={slot.date.toISOString()}
                      variant={selectedTime && isSameDay(selectedTime, slot.date) ? "default" : "outline"}
                      onClick={() => handleTimeSelect(slot.date)}
                      disabled={!slot.available}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {format(slot.date, 'h:mm a')}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="mt-4"
                  onClick={() => setStep('date')}
                >
                  ← Back to dates
                </Button>
              </CardContent>
            </>
          )}

          {step === 'details' && (
            <>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
                <CardDescription>
                  Tell us about what you'd like to focus on
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Session Type</Label>
                  <RadioGroup
                    value={sessionType}
                    onValueChange={(value) => setSessionType(value as any)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="regular" />
                      <Label htmlFor="regular" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">Regular Session (60 min)</p>
                          <p className="text-sm text-muted-foreground">
                            Standard coaching session for ongoing work
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="deep-dive" id="deep-dive" />
                      <Label htmlFor="deep-dive" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">Deep Dive (90 min)</p>
                          <p className="text-sm text-muted-foreground">
                            Extended session for breakthrough work
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="notes">
                    What would you like to focus on? (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share any specific topics, challenges, or goals you'd like to address..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('time')}
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={handleDetailsSubmit}
                    className="flex-1"
                  >
                    Continue to confirmation
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 'confirm' && selectedDate && selectedTime && (
            <>
              <CardHeader>
                <CardTitle>Confirm Your Session</CardTitle>
                <CardDescription>
                  Review your session details before booking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time</span>
                    <span className="font-medium">
                      {format(selectedTime, 'h:mm a')} ({coachAvailability.timezone})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {sessionType === 'regular' ? '60 minutes' : '90 minutes'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <Badge variant="outline">
                      {sessionType === 'regular' ? 'Regular Session' : 'Deep Dive'}
                    </Badge>
                  </div>
                </div>

                {notes && (
                  <div>
                    <p className="text-sm font-medium mb-2">Your focus areas:</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {notes}
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p>You'll receive a calendar invite with a video call link.</p>
                    <p>You can reschedule or cancel up to 24 hours before the session.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('details')}
                    disabled={isBooking}
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={handleBookSession}
                    className="flex-1"
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      'Booking...'
                    ) : (
                      <>
                        <Video className="mr-2 h-4 w-4" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}