'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppointmentCalendar } from '@/components/calendar/appointment-calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { appointmentService } from '@/services/api/appointment.service';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentService.getAppointments(),
  });
  
  const selectedDateAppointments = selectedDate && appointments
    ? appointments.filter(apt => 
        format(apt.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      )
    : [];
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      scheduled: 'default',
      completed: 'success',
      cancelled: 'destructive',
      rescheduled: 'warning',
    };
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {status}
      </Badge>
    );
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your coaching sessions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AppointmentCalendar 
            appointments={appointments}
            onDateSelect={setSelectedDate}
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate 
                  ? format(selectedDate, 'MMMM d, yyyy')
                  : 'Select a Date'
                }
              </CardTitle>
              <CardDescription>
                {selectedDateAppointments.length} appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateAppointments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{apt.time}</span>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{apt.clientName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{apt.type} - {apt.duration} minutes</span>
                      </div>
                      
                      {apt.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {apt.notes}
                        </p>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedDate ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    No appointments scheduled
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Appointment
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Select a date to view appointments
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}