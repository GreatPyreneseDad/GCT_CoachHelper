import { google } from 'googleapis';
import { Session } from 'next-auth';

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  replyTo?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export class EmailService {
  private gmail: any;
  private appleMail: any; // For future Apple Mail integration

  constructor(private session: Session) {
    if (session.provider === 'google' && session.accessToken) {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({
        access_token: session.accessToken,
      });
      this.gmail = google.gmail({ version: 'v1', auth });
    }
  }

  // Send email via Gmail
  async sendEmail(message: EmailMessage): Promise<string> {
    if (!this.gmail) {
      throw new Error('Email service not initialized');
    }

    try {
      const email = this.createMimeMessage(message);
      const encodedMessage = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const { data } = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      return data.id;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Create MIME message
  private createMimeMessage(message: EmailMessage): string {
    const boundary = `boundary_${Date.now()}`;
    const to = Array.isArray(message.to) ? message.to.join(', ') : message.to;
    
    let mimeMessage = [
      `To: ${to}`,
      `Subject: ${message.subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ];

    if (message.cc?.length) {
      mimeMessage.push(`Cc: ${message.cc.join(', ')}`);
    }

    if (message.bcc?.length) {
      mimeMessage.push(`Bcc: ${message.bcc.join(', ')}`);
    }

    if (message.replyTo) {
      mimeMessage.push(`Reply-To: ${message.replyTo}`);
    }

    mimeMessage.push('', ''); // Empty lines before body

    // Text version
    if (message.text) {
      mimeMessage.push(
        `--${boundary}`,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        message.text
      );
    }

    // HTML version
    if (message.html) {
      mimeMessage.push(
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        message.html
      );
    }

    mimeMessage.push(`--${boundary}--`);

    return mimeMessage.join('\r\n');
  }

  // Send templated email
  async sendTemplatedEmail(
    template: EmailTemplate,
    to: string,
    variables: Record<string, string>
  ): Promise<string> {
    let subject = template.subject;
    let body = template.body;

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    return this.sendEmail({
      to,
      subject,
      html: body,
      text: this.htmlToText(body),
    });
  }

  // Convert HTML to plain text (simple version)
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  // Get email templates for coaches
  getEmailTemplates(): EmailTemplate[] {
    return [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to {{coachName}} Coaching!',
        body: `
          <h2>Welcome {{clientName}}!</h2>
          <p>I'm thrilled to have you join my coaching program. Together, we'll work on transforming your life using the power of Grounded Coherence Theory.</p>
          <p><strong>What's Next:</strong></p>
          <ul>
            <li>Complete your initial assessment</li>
            <li>Schedule your first coaching session</li>
            <li>Review the resources I've prepared for you</li>
          </ul>
          <p>You can access your personal coaching portal here: {{portalLink}}</p>
          <p>Looking forward to our journey together!</p>
          <p>Best regards,<br>{{coachName}}</p>
        `,
        variables: ['clientName', 'coachName', 'portalLink'],
      },
      {
        id: 'sessionReminder',
        name: 'Session Reminder',
        subject: 'Reminder: Coaching Session Tomorrow',
        body: `
          <h3>Hi {{clientName}},</h3>
          <p>This is a friendly reminder about our coaching session scheduled for tomorrow:</p>
          <p><strong>📅 Date:</strong> {{sessionDate}}<br>
          <strong>⏰ Time:</strong> {{sessionTime}}<br>
          <strong>📍 Location:</strong> {{sessionLocation}}</p>
          <p><strong>Your current coherence score:</strong> {{coherenceScore}}%</p>
          <p>To prepare for our session, please:</p>
          <ul>
            <li>Complete any pending homework</li>
            <li>Think about what you'd like to focus on</li>
            <li>Review your progress since our last session</li>
          </ul>
          <p>See you tomorrow!</p>
          <p>{{coachName}}</p>
        `,
        variables: ['clientName', 'coachName', 'sessionDate', 'sessionTime', 'sessionLocation', 'coherenceScore'],
      },
      {
        id: 'progressUpdate',
        name: 'Monthly Progress Update',
        subject: '{{clientName}}, Your Monthly Progress Report',
        body: `
          <h2>Your Monthly Progress Report</h2>
          <p>Hi {{clientName}},</p>
          <p>I wanted to share your progress for the month of {{month}}:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Coherence Score Progress</h3>
            <p><strong>Starting Score:</strong> {{startScore}}%<br>
            <strong>Current Score:</strong> {{currentScore}}%<br>
            <strong>Improvement:</strong> {{improvement}}%</p>
          </div>
          <h3>Key Achievements:</h3>
          {{achievements}}
          <h3>Areas of Growth:</h3>
          {{growthAreas}}
          <h3>Next Month's Focus:</h3>
          {{nextFocus}}
          <p>Keep up the great work! Your dedication is truly paying off.</p>
          <p>Warmly,<br>{{coachName}}</p>
        `,
        variables: ['clientName', 'coachName', 'month', 'startScore', 'currentScore', 'improvement', 'achievements', 'growthAreas', 'nextFocus'],
      },
      {
        id: 'inviteClient',
        name: 'Client Invitation',
        subject: 'You're Invited to Join My Coaching Program',
        body: `
          <h2>You're Invited!</h2>
          <p>Hi {{clientName}},</p>
          <p>I'm excited to invite you to join my coaching program. I believe we can work together to create meaningful transformation in your life.</p>
          <p><strong>Your invitation code:</strong> <code style="background: #f0f0f0; padding: 5px 10px; font-size: 18px;">{{inviteCode}}</code></p>
          <p>To get started:</p>
          <ol>
            <li>Visit {{registrationLink}}</li>
            <li>Enter your invitation code</li>
            <li>Create your account using Apple or Google sign-in</li>
            <li>Complete your initial assessment</li>
          </ol>
          <p>This invitation code is unique to you and ensures you'll be registered under my coaching practice.</p>
          <p>I look forward to supporting you on your journey!</p>
          <p>Best regards,<br>{{coachName}}<br>{{coachBusinessName}}</p>
        `,
        variables: ['clientName', 'coachName', 'coachBusinessName', 'inviteCode', 'registrationLink'],
      },
    ];
  }

  // Send bulk emails (with rate limiting)
  async sendBulkEmails(
    messages: EmailMessage[],
    delayMs: number = 1000
  ): Promise<string[]> {
    const results: string[] = [];
    
    for (const message of messages) {
      try {
        const messageId = await this.sendEmail(message);
        results.push(messageId);
        
        // Rate limiting
        if (delayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        console.error(`Failed to send email to ${message.to}:`, error);
        results.push(''); // Empty string for failed sends
      }
    }
    
    return results;
  }

  // Create draft email
  async createDraft(message: EmailMessage): Promise<string> {
    if (!this.gmail) {
      throw new Error('Email service not initialized');
    }

    try {
      const email = this.createMimeMessage(message);
      const encodedMessage = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const { data } = await this.gmail.users.drafts.create({
        userId: 'me',
        requestBody: {
          message: {
            raw: encodedMessage,
          },
        },
      });

      return data.id;
    } catch (error) {
      console.error('Error creating draft:', error);
      throw error;
    }
  }

  // Get recent emails (for conversation tracking)
  async getRecentEmails(
    query: string,
    maxResults: number = 10
  ): Promise<any[]> {
    if (!this.gmail) {
      throw new Error('Email service not initialized');
    }

    try {
      const { data } = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });

      if (!data.messages) {
        return [];
      }

      // Fetch full message details
      const messages = await Promise.all(
        data.messages.map(async (msg: any) => {
          const { data: fullMessage } = await this.gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
          });
          return fullMessage;
        })
      );

      return messages;
    } catch (error) {
      console.error('Error fetching emails:', error);
      return [];
    }
  }
}

// Apple Mail Integration (placeholder)
export class AppleMailService {
  constructor(private accessToken: string) {
    // Apple Mail integration would use IMAP/SMTP
    // This is a placeholder for future implementation
  }

  async sendEmail(message: EmailMessage): Promise<string> {
    // TODO: Implement Apple Mail integration
    console.log('Apple Mail integration not yet implemented');
    return '';
  }
}