import { Resend } from "resend";

export interface EmailProvider {
  sendEmail(params: SendEmailParams): Promise<EmailResult>;
}

export interface SendEmailParams {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class ResendProvider implements EmailProvider {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: params.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Email service singleton
class EmailService {
  private provider: EmailProvider;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }
    this.provider = new ResendProvider(apiKey);
  }

  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    return this.provider.sendEmail(params);
  }

  // Method to swap providers if needed
  setProvider(provider: EmailProvider) {
    this.provider = provider;
  }
}

export const emailService = new EmailService();
