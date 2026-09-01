export interface EmailProvider {
  sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean>;
}

class ConsoleEmailProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    console.log(`✉️ [EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
    return true;
  }
}

export class EmailService {
  private provider: EmailProvider;
  private fromEmail: string;

  constructor() {
    this.provider = new ConsoleEmailProvider();
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@skillbridge.dev';
  }

  async sendApplicationSubmittedEmail(
    recruiterEmail: string,
    candidateName: string,
    jobTitle: string,
    companyName: string
  ): Promise<void> {
    try {
      const subject = `New Application Received: ${jobTitle}`;
      const content = `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>New Application for ${jobTitle}</h2>
          <p>Candidate <strong>${candidateName}</strong> has just applied to your job listing at <strong>${companyName}</strong>.</p>
          <p>Log in to your SkillBridge account to review the candidate's resume and cover letter.</p>
        </div>
      `;
      await this.provider.sendEmail(recruiterEmail, subject, content);
    } catch (err) {
      console.error('Failed to send application submitted email:', err);
    }
  }

  async sendApplicationStatusEmail(
    studentEmail: string,
    candidateName: string,
    jobTitle: string,
    newStatus: string
  ): Promise<void> {
    try {
      const subject = `Application Update: ${jobTitle} (${newStatus})`;
      const content = `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>Application Update</h2>
          <p>Dear ${candidateName},</p>
          <p>Your application status for <strong>${jobTitle}</strong> has been updated to <strong>${newStatus}</strong>.</p>
          <p>Log in to SkillBridge to track your application timeline.</p>
        </div>
      `;
      await this.provider.sendEmail(studentEmail, subject, content);
    } catch (err) {
      console.error('Failed to send application status email:', err);
    }
  }
}

export default new EmailService();
