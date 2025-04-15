import { sendEmail } from "@/services/emailService";
import { sendSMS } from "@/services/smsService";
import { sendWhatsAppMessage } from "@/services/whatsappService";

export interface NotificationRequest {
  title: string;
  message: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  recipients: {
    email?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    name: string;
  }[];
  channels: ('email' | 'sms' | 'whatsapp')[];
  templateData?: Record<string, string | number | boolean | Record<string, unknown>>;
}

/**
 * Sends notifications through multiple channels (email, SMS, WhatsApp)
 * @param notification The notification request containing recipients and message details
 * @returns Object with success status and results for each channel
 */
export async function sendNotification(notification: NotificationRequest) {
  const { title, message, recipients, channels, templateData } = notification;
  
  const results = {
    email: { success: false, sent: 0, failed: 0, errors: [] as Array<{recipient: string; error: Error | string | Record<string, unknown>}> },
    sms: { success: false, sent: 0, failed: 0, errors: [] as Array<{recipient: string; error: Error | string | Record<string, unknown>}> },
    whatsapp: { success: false, sent: 0, failed: 0, errors: [] as Array<{recipient: string; error: Error | string | Record<string, unknown>}> }
  };

  // Process email notifications
  if (channels.includes('email')) {
    for (const recipient of recipients.filter(r => r.email)) {
      try {
        await sendEmail({
          to: recipient.email!,
          subject: title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333; text-align: center;">${title}</h1>
              <p>Hello ${recipient.name},</p>
              <p>${message}</p>
              ${templateData?.additionalContent || ''}
              <p>Blessings,</p>
              <p>The ADN Team</p>
            </div>
          `
        });
        results.email.sent++;
      } catch (error) {
        results.email.failed++;
        results.email.errors.push({ recipient: recipient.email, error });
      }
    }
    results.email.success = results.email.sent > 0;
  }

  // Process SMS notifications
  if (channels.includes('sms')) {
    for (const recipient of recipients.filter(r => r.phoneNumber)) {
      try {
        await sendSMS({
          to: recipient.phoneNumber!,
          body: `${title}: ${message}`
        });
        results.sms.sent++;
      } catch (error) {
        results.sms.failed++;
        results.sms.errors.push({ recipient: recipient.phoneNumber, error });
      }
    }
    results.sms.success = results.sms.sent > 0;
  }

  // Process WhatsApp notifications
  if (channels.includes('whatsapp')) {
    for (const recipient of recipients.filter(r => r.whatsappNumber)) {
      try {
        // For WhatsApp, we need to use templates
        // This assumes you have a "general_notification" template set up in WhatsApp
        const components = [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: recipient.name
              },
              {
                type: "text",
                text: title
              },
              {
                type: "text",
                text: message
              }
            ]
          }
        ];
        
        await sendWhatsAppMessage({
          to: recipient.whatsappNumber!,
          templateName: "general_notification",
          components
        });
        results.whatsapp.sent++;
      } catch (error) {
        results.whatsapp.failed++;
        results.whatsapp.errors.push({ recipient: recipient.whatsappNumber, error });
      }
    }
    results.whatsapp.success = results.whatsapp.sent > 0;
  }

  return {
    success: 
      (channels.includes('email') ? results.email.success : true) &&
      (channels.includes('sms') ? results.sms.success : true) &&
      (channels.includes('whatsapp') ? results.whatsapp.success : true),
    results
  };
}

/**
 * Sends a batch notification to multiple recipients
 * @param notification The notification request
 * @returns Results of the batch operation
 */
export async function sendBatchNotification(notification: NotificationRequest) {
  const batchSize = parseInt(process.env.NOTIFICATION_BATCH_SIZE || '50');
  const recipients = notification.recipients;
  const totalRecipients = recipients.length;
  
  let processed = 0;
  let successful = 0;
  let failed = 0;
  const errors: Array<{batch?: number; recipient?: string; error: Error | string | Record<string, unknown>}> = [];
  
  // Process in batches
  for (let i = 0; i < totalRecipients; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    try {
      const result = await sendNotification({
        ...notification,
        recipients: batch
      });
      
      processed += batch.length;
      
      // Count successes and failures
      notification.channels.forEach(channel => {
        successful += result.results[channel].sent;
        failed += result.results[channel].failed;
        errors.push(...result.results[channel].errors);
      });
      
    } catch (error) {
      console.error('Error processing notification batch:', error);
      failed += batch.length;
      errors.push({ batch: i, error });
    }
  }
  
  return {
    success: successful > 0,
    totalRecipients,
    processed,
    successful,
    failed,
    errors
  };
}
