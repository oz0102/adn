declare module 'zeptomail' {
  export interface SendMailOptions {
    from: {
      address: string;
      name?: string;
    };
    to: Array<{
      emailAddress: {
        address: string;
        name?: string;
      };
    }>;
    subject: string;
    htmlBody?: string;
    textBody?: string;
    cc?: Array<{
      emailAddress: {
        address: string;
        name?: string;
      };
    }>;
    bcc?: Array<{
      emailAddress: {
        address: string;
        name?: string;
      };
    }>;
    replyTo?: {
      address: string;
      name?: string;
    };
    mergeData?: Record<string, any>;
    templateKey?: string;
    attachments?: Array<{
      content: string;
      name: string;
      contentType: string;
    }>;
  }

  export class SendMailClient {
    constructor(url: string, token: string);
    sendMail(options: SendMailOptions): Promise<any>;
  }
}
