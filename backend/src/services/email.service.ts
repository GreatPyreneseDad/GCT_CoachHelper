import sgMail from '@sendgrid/mail';
import { prisma } from '../utils/prisma';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@gctcoachhelper.com';
  private static readonly FROM_NAME = 'GCT CoachHelper';

  // Email templates
  private static templates = {
    welcomeCoach: (name: string): EmailTemplate => ({
      subject: 'Welcome to GCT CoachHelper!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to GCT CoachHelper, ${name}!</h1>
          <p>We're excited to have you join our platform. Here's what you can do next:</p>
          <ul>
            <li>Complete your coach profile</li>
            <li>Invite your first client</li>
            <li>Explore the coherence monitoring dashboard</li>
          </ul>
          <p>If you have any questions, don't hesitate to reach out to our support team.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Best regards,<br>
            The GCT CoachHelper Team
          </p>
        </div>
      `,
      text: `Welcome to GCT CoachHelper, ${name}! We're excited to have you join our platform.`,
    }),

    welcomeClient: (clientName: string, coachName: string): EmailTemplate => ({
      subject: `${coachName} has invited you to GCT CoachHelper`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome, ${clientName}!</h1>
          <p>${coachName} has invited you to track your coherence journey on GCT CoachHelper.</p>
          <p>Here's what you can expect:</p>
          <ul>
            <li>Regular coherence assessments</li>
            <li>Progress tracking and insights</li>
            <li>Personalized interventions from your coach</li>
            <li>Session scheduling and reminders</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/client/onboarding" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Get Started</a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Best regards,<br>
            The GCT CoachHelper Team
          </p>
        </div>
      `,
      text: `${coachName} has invited you to track your coherence journey on GCT CoachHelper.`,
    }),

    assessmentReminder: (name: string, assessmentType: string): EmailTemplate => ({
      subject: 'Time for your coherence check-in',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Hi ${name},</h1>
          <p>It's time for your ${assessmentType}!</p>
          <p>Taking a few minutes to check in with yourself helps track your progress and identify areas for growth.</p>
          <a href="${process.env.FRONTEND_URL}/client/portal" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Take Assessment</a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you have any questions, reach out to your coach.<br><br>
            Best regards,<br>
            The GCT CoachHelper Team
          </p>
        </div>
      `,
      text: `Hi ${name}, it's time for your ${assessmentType}!`,
    }),

    sessionConfirmation: (
      clientName: string,
      coachName: string,
      date: Date,
      duration: number
    ): EmailTemplate => ({
      subject: `Session confirmed with ${coachName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Session Confirmed!</h1>
          <p>Hi ${clientName},</p>
          <p>Your session with ${coachName} has been confirmed:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${date.toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${date.toLocaleTimeString()}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration} minutes</p>
          </div>
          <p>We'll send you a reminder 24 hours before your session.</p>
          <a href="${process.env.FRONTEND_URL}/client/appointments" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">View in Calendar</a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Best regards,<br>
            The GCT CoachHelper Team
          </p>
        </div>
      `,
      text: `Your session with ${coachName} has been confirmed for ${date.toLocaleString()}.`,
    }),

    coherenceAlert: (
      coachName: string,
      clientName: string,
      coherenceScore: number,
      status: string
    ): EmailTemplate => ({
      subject: `Alert: ${clientName} needs attention`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #DC2626;">Coherence Alert</h1>
          <p>Hi ${coachName},</p>
          <p>${clientName}'s coherence has dropped to <strong>${coherenceScore}%</strong> and is marked as <strong>${status}</strong>.</p>
          <p>This client may need immediate attention or intervention.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #DC2626; color: white; text-decoration: none; border-radius: 6px;">View Dashboard</a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This is an automated alert from GCT CoachHelper.
          </p>
        </div>
      `,
      text: `${clientName}'s coherence has dropped to ${coherenceScore}% and needs attention.`,
    }),

    paymentConfirmation: (
      name: string,
      plan: string,
      amount: number
    ): EmailTemplate => ({
      subject: 'Payment Confirmed - GCT CoachHelper',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Payment Confirmed! 🎉</h1>
          <p>Hi ${name},</p>
          <p>Your payment has been successfully processed.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Plan:</strong> ${plan}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Active</p>
          </div>
          <p>You now have full access to all ${plan} features.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Thank you for choosing GCT CoachHelper!<br><br>
            Best regards,<br>
            The GCT CoachHelper Team
          </p>
        </div>
      `,
      text: `Your payment for ${plan} plan ($${amount.toFixed(2)}) has been confirmed.`,
    }),

    breakthroughNotification: (
      coachName: string,
      clientName: string,
      dimension: string,
      score: number
    ): EmailTemplate => ({
      subject: `🎉 ${clientName} just had a breakthrough!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">Breakthrough Alert! 🎉</h1>
          <p>Hi ${coachName},</p>
          <p>Great news! ${clientName} just achieved a significant breakthrough in their ${dimension} dimension.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Dimension:</strong> ${dimension}</p>
            <p style="margin: 5px 0;"><strong>New Score:</strong> ${score}%</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Breakthrough achieved!</p>
          </div>
          <p>This is a great opportunity to acknowledge their progress and build on this momentum.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 6px;">View Client Progress</a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Keep up the great work!<br><br>
            The GCT CoachHelper Team
          </p>
        </div>
      `,
      text: `${clientName} achieved a breakthrough in ${dimension} with a score of ${score}%!`,
    }),

    clientInvite: (
      clientName: string,
      coachName: string,
      inviteCode: string
    ): EmailTemplate => ({
      subject: `${coachName} invited you to track your transformation`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">You're Invited! 🌟</h1>
          <p>Hi ${clientName},</p>
          <p>${coachName} has invited you to join GCT CoachHelper to scientifically track your personal transformation journey.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Your invite code:</strong> <code style="font-size: 18px; font-weight: bold;">${inviteCode}</code></p>
          </div>
          <p>With GCT CoachHelper, you'll be able to:</p>
          <ul>
            <li>Track your coherence score across multiple dimensions</li>
            <li>See your progress visualized in real-time</li>
            <li>Complete regular assessments to measure growth</li>
            <li>Access personalized interventions and resources</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/client/join?code=${inviteCode}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Accept Invitation</a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Looking forward to supporting your journey!<br><br>
            Best regards,<br>
            The GCT CoachHelper Team
          </p>
        </div>
      `,
      text: `${coachName} has invited you to join GCT CoachHelper. Your invite code is: ${inviteCode}`,
    }),
  };

  // Send email method
  static async sendEmail(
    to: string,
    template: EmailTemplate,
    options?: { cc?: string; bcc?: string }
  ): Promise<void> {
    try {
      const msg = {
        to,
        from: {
          email: this.FROM_EMAIL,
          name: this.FROM_NAME,
        },
        subject: template.subject,
        html: template.html,
        text: template.text || template.subject,
        ...(options?.cc && { cc: options.cc }),
        ...(options?.bcc && { bcc: options.bcc }),
      };

      await sgMail.send(msg);
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Specific email methods
  static async sendWelcomeCoachEmail(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    const template = this.templates.welcomeCoach(user.name || 'Coach');
    await this.sendEmail(user.email, template);
  }

  static async sendWelcomeClientEmail(clientId: string): Promise<void> {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: true,
        coach: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!client) return;

    const template = this.templates.welcomeClient(
      client.user.name || 'there',
      client.coach.user.name || 'Your coach'
    );
    await this.sendEmail(client.user.email, template);
  }

  static async sendAssessmentReminder(clientId: string, assessmentType: string): Promise<void> {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { user: true },
    });

    if (!client) return;

    const template = this.templates.assessmentReminder(
      client.user.name || 'there',
      assessmentType
    );
    await this.sendEmail(client.user.email, template);
  }

  static async sendSessionConfirmation(appointmentId: string): Promise<void> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: {
          include: { user: true },
        },
        coach: {
          include: { user: true },
        },
      },
    });

    if (!appointment) return;

    const template = this.templates.sessionConfirmation(
      appointment.client.user.name || 'there',
      appointment.coach.user.name || 'Your coach',
      appointment.scheduledAt,
      appointment.duration
    );

    // Send to client
    await this.sendEmail(appointment.client.user.email, template);

    // Also send copy to coach
    await this.sendEmail(appointment.coach.user.email, template);
  }

  static async sendCoherenceAlert(
    clientId: string,
    coherenceScore: number,
    status: string
  ): Promise<void> {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: true,
        coach: {
          include: { user: true },
        },
      },
    });

    if (!client) return;

    const template = this.templates.coherenceAlert(
      client.coach.user.name || 'Coach',
      client.user.name || 'Your client',
      coherenceScore,
      status
    );

    await this.sendEmail(client.coach.user.email, template);
  }

  static async sendPaymentConfirmation(
    userId: string,
    plan: string,
    amount: number
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    const template = this.templates.paymentConfirmation(
      user.name || 'there',
      plan,
      amount / 100 // Convert from cents
    );
    await this.sendEmail(user.email, template);
  }

  static async sendBreakthroughNotification(
    clientId: string,
    dimension: string,
    score: number
  ): Promise<void> {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: true,
        coach: {
          include: { user: true },
        },
      },
    });

    if (!client) return;

    const template = this.templates.breakthroughNotification(
      client.coach.user.name || 'Coach',
      client.user.name || 'Your client',
      dimension,
      Math.round(score)
    );
    await this.sendEmail(client.coach.user.email, template);
  }

  static async sendClientInvite(
    email: string,
    clientName: string,
    coachName: string,
    inviteCode: string
  ): Promise<void> {
    const template = this.templates.clientInvite(
      clientName,
      coachName,
      inviteCode
    );
    await this.sendEmail(email, template);
  }

  // Batch email methods
  static async sendBulkAssessmentReminders(): Promise<void> {
    // Find clients who haven't taken an assessment in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { lastAssessmentAt: null },
          { lastAssessmentAt: { lt: sevenDaysAgo } },
        ],
      },
      include: { user: true },
    });

    for (const client of clients) {
      try {
        await this.sendAssessmentReminder(client.id, 'weekly check-in');
      } catch (error) {
        console.error(`Failed to send reminder to client ${client.id}:`, error);
      }
    }
  }
}