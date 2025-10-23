import nodemailer from 'nodemailer';

interface EmailConfig {
  mode: 'development' | 'production';
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private config: EmailConfig;
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.config = {
      mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      smtp: process.env.SMTP_HOST ? {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      } : undefined
    };

    if (this.config.mode === 'production' && this.config.smtp) {
      this.transporter = nodemailer.createTransport(this.config.smtp);
    }
  }

  async validateSMTPConfig(): Promise<boolean> {
    if (this.config.mode === 'development') {
      return true; // Always valid in development mode
    }

    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP configuration validation failed:', error);
      return false;
    }
  }

  getPasswordResetTemplate(resetUrl: string, firstName: string): EmailTemplate {
    const subject = 'Reset Your LDS Talk Generator Password';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6c757d; }
            .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LDS Talk Generator</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${firstName},</p>
              <p>We received a request to reset your password for your LDS Talk Generator account. If you made this request, click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">${resetUrl}</p>
              
              <div class="warning">
                <strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, you can safely ignore this email.
              </div>
              
              <p>If you're having trouble with the link above, contact support or try requesting a new password reset.</p>
              
              <p>Best regards,<br>The LDS Talk Generator Team</p>
            </div>
            <div class="footer">
              <p>This email was sent from LDS Talk Generator. If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
      LDS Talk Generator - Password Reset Request
      
      Hello ${firstName},
      
      We received a request to reset your password for your LDS Talk Generator account.
      
      If you made this request, visit this link to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, you can safely ignore this email.
      
      Best regards,
      The LDS Talk Generator Team
    `;

    return { subject, html, text };
  }

  async sendPasswordReset(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    const template = this.getPasswordResetTemplate(resetUrl, firstName);

    if (this.config.mode === 'development') {
      // In development, log to console
      console.log('\n=== PASSWORD RESET EMAIL ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${template.subject}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log(`Token: ${token}`);
      console.log('============================\n');
      return;
    }

    if (!this.transporter) {
      throw new Error('Email service not configured for production mode');
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

export const emailService = new EmailService();