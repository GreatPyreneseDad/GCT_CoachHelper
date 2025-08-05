import { google } from 'googleapis';
import { Session } from 'next-auth';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export class CalendarService {
  private googleCalendar: any;
  private appleCalendar: any; // For future Apple Calendar integration

  constructor(private session: Session) {
    if (session.provider === 'google' && session.accessToken) {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({
        access_token: session.accessToken,
      });
      this.googleCalendar = google.calendar({ version: 'v3', auth });
    }
  }

  // Create or get coaching calendar
  async ensureCoachingCalendar(): Promise<string> {
    if (!this.googleCalendar) {
      throw new Error('Calendar service not initialized');
    }

    try {
      // List all calendars
      const { data } = await this.googleCalendar.calendarList.list();
      const coachingCalendar = data.items?.find(
        (cal: any) => cal.summary === 'Coaching Sessions'
      );

      if (coachingCalendar) {
        return coachingCalendar.id;
      }

      // Create coaching calendar if it doesn't exist
      const { data: newCalendar } = await this.googleCalendar.calendars.insert({
        requestBody: {
          summary: 'Coaching Sessions',
          description: 'GCT CoachHelper coaching sessions',
          timeZone: this.session.user?.timezone || 'America/New_York',
        },
      });

      return newCalendar.id;
    } catch (error) {
      console.error('Error ensuring coaching calendar:', error);
      throw error;
    }
  }

  // Create coaching session
  async createSession(
    clientName: string,
    clientEmail: string,
    startTime: Date,
    duration: number = 60, // minutes
    description?: string
  ): Promise<CalendarEvent> {
    const calendarId = await this.ensureCoachingCalendar();
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const event: CalendarEvent = {
      summary: `Coaching Session: ${clientName}`,
      description: description || `Coaching session with ${clientName}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: this.session.user?.timezone || 'America/New_York',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: this.session.user?.timezone || 'America/New_York',
      },
      attendees: [
        {
          email: clientEmail,
          displayName: clientName,
        },
      ],
      conferenceData: {
        createRequest: {
          requestId: `coaching-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };

    try {
      const { data } = await this.googleCalendar.events.insert({
        calendarId,
        requestBody: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all', // Send invites to attendees
      });

      return data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Update session
  async updateSession(
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    const calendarId = await this.ensureCoachingCalendar();

    try {
      const { data } = await this.googleCalendar.events.patch({
        calendarId,
        eventId,
        requestBody: updates,
        sendUpdates: 'all',
      });

      return data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  // Cancel session
  async cancelSession(eventId: string, reason?: string): Promise<void> {
    const calendarId = await this.ensureCoachingCalendar();

    try {
      // First, get the event to update its status
      const { data: event } = await this.googleCalendar.events.get({
        calendarId,
        eventId,
      });

      // Update event with cancellation
      await this.googleCalendar.events.patch({
        calendarId,
        eventId,
        requestBody: {
          status: 'cancelled',
          description: `${event.description}\n\nCANCELLED: ${reason || 'Session cancelled'}`,
        },
        sendUpdates: 'all',
      });
    } catch (error) {
      console.error('Error cancelling calendar event:', error);
      throw error;
    }
  }

  // Get upcoming sessions
  async getUpcomingSessions(
    days: number = 30
  ): Promise<CalendarEvent[]> {
    const calendarId = await this.ensureCoachingCalendar();
    
    const timeMin = new Date();
    const timeMax = new Date();
    timeMax.setDate(timeMax.getDate() + days);

    try {
      const { data } = await this.googleCalendar.events.list({
        calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  // Check availability
  async checkAvailability(
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    try {
      const { data } = await this.googleCalendar.freebusy.query({
        requestBody: {
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: 'primary' }],
        },
      });

      const busy = data.calendars?.primary?.busy || [];
      return busy.length === 0;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  // Sync sessions with database
  async syncSessions(
    coachId: string,
    syncCallback: (events: CalendarEvent[]) => Promise<void>
  ): Promise<void> {
    const events = await this.getUpcomingSessions(90); // Get 3 months of data
    await syncCallback(events);
  }
}

// Apple Calendar Integration (via CalDAV)
export class AppleCalendarService {
  constructor(private accessToken: string) {
    // Apple Calendar integration would use CalDAV protocol
    // This is a placeholder for future implementation
  }

  async createSession(
    clientName: string,
    clientEmail: string,
    startTime: Date,
    duration: number = 60
  ): Promise<any> {
    // TODO: Implement CalDAV integration for Apple Calendar
    console.log('Apple Calendar integration not yet implemented');
    return null;
  }
}