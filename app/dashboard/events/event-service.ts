// app/(dashboard)/events/event-service.ts
import { generateFlyerContent } from "@/services/aiService";
import { sendEmail, sendEventReminderEmail } from "@/services/emailService";
import { sendEventReminderSMS } from "@/services/smsService";
import { sendEventReminderWhatsApp } from "@/services/whatsappService";

export interface EventNotificationRequest {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  description: string;
  recipients: {
    id: string;
    email?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
    name: string;
  }[];
  channels: ('email' | 'sms' | 'whatsapp')[];
}

/**
 * Sends event reminders through multiple channels (email, SMS, WhatsApp)
 * @param notification The event notification request
 * @returns Object with success status and results for each channel
 */
export async function sendEventReminders(notification: EventNotificationRequest) {
  const { eventName, eventDate, eventTime, eventLocation, recipients, channels } = notification;
  
  const results = {
    email: { success: false, sent: 0, failed: 0, errors: [] as any[] },
    sms: { success: false, sent: 0, failed: 0, errors: [] as any[] },
    whatsapp: { success: false, sent: 0, failed: 0, errors: [] as any[] }
  };

  // Process email notifications
  if (channels.includes('email')) {
    for (const recipient of recipients.filter(r => r.email)) {
      try {
        await sendEventReminderEmail(
          recipient.email!,
          eventName,
          eventDate,
          eventTime,
          eventLocation,
          recipient.name
        );
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
        await sendEventReminderSMS(
          recipient.phoneNumber!,
          eventName,
          eventDate,
          eventTime
        );
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
        await sendEventReminderWhatsApp(
          recipient.whatsappNumber!,
          eventName,
          eventDate,
          eventTime,
          eventLocation
        );
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
 * Generates flyer content for an event using AI
 * @param eventDetails Event details to generate flyer content for
 * @returns Generated flyer content
 */
export async function generateEventFlyerContent(eventDetails: {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  speaker?: string;
  theme?: string;
}) {
  try {
    return await generateFlyerContent(eventDetails);
  } catch (error) {
    console.error("Error generating flyer content:", error);
    throw error;
  }
}

/**
 * Sends event reminders in batches
 * @param notification The event notification request
 * @returns Results of the batch operation
 */
export async function sendBatchEventReminders(notification: EventNotificationRequest) {
  const batchSize = parseInt(process.env.NOTIFICATION_BATCH_SIZE || '50');
  const recipients = notification.recipients;
  const totalRecipients = recipients.length;
  
  let processed = 0;
  let successful = 0;
  let failed = 0;
  const errors: any[] = [];
  
  // Process in batches
  for (let i = 0; i < totalRecipients; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    try {
      const result = await sendEventReminders({
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
      console.error('Error processing event reminder batch:', error);
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
