// app/(dashboard)/follow-ups/follow-up-service.ts
import { generateFollowUpMessage } from "@/services/aiService";
import { sendFollowUpEmail } from "@/services/emailService";
import { sendFollowUpSMS } from "@/services/smsService";
import { sendFollowUpWhatsApp } from "@/services/whatsappService";

export interface FollowUpRequest {
  memberId?: string;
  memberName: string;
  eventName: string;
  eventDate: string;
  missedEvents?: number;
  lastAttendance?: string;
  isNewAttendee?: boolean;
  contactInfo: {
    email?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
  };
  channels: ('email' | 'sms' | 'whatsapp')[];
  customMessage?: string;
  useAiGenerated?: boolean;
}

/**
 * Sends follow-up messages through multiple channels (email, SMS, WhatsApp)
 * @param request The follow-up request
 * @returns Object with success status and results for each channel
 */
export async function sendFollowUp(request: FollowUpRequest) {
  const { 
    memberName, 
    eventName, 
    eventDate, 
    missedEvents, 
    lastAttendance, 
    isNewAttendee,
    contactInfo, 
    channels,
    customMessage,
    useAiGenerated
  } = request;
  
  // Generate or use custom message
  let message = customMessage || '';
  
  if (useAiGenerated && !customMessage) {
    try {
      message = await generateFollowUpMessage({
        memberName,
        eventName,
        eventDate,
        missedEvents,
        lastAttendance,
        isNewAttendee
      });
    } catch (error) {
      console.error("Error generating follow-up message:", error);
      message = `We missed you at ${eventName} on ${eventDate}. Hope to see you at our next event!`;
    }
  } else if (!customMessage) {
    // Default message if no custom message and AI generation fails or is not used
    message = isNewAttendee
      ? `Thank you for attending ${eventName} on ${eventDate}. We hope you enjoyed your time with us and look forward to seeing you again!`
      : `We missed you at ${eventName} on ${eventDate}. Hope to see you at our next event!`;
  }
  
  type ErrorType = { recipient: string; error: Error | unknown };
  
  const results = {
    email: { success: false, sent: 0, failed: 0, errors: [] as ErrorType[] },
    sms: { success: false, sent: 0, failed: 0, errors: [] as ErrorType[] },
    whatsapp: { success: false, sent: 0, failed: 0, errors: [] as ErrorType[] }
  };

  // Process email follow-up
  if (channels.includes('email') && contactInfo.email) {
    try {
      await sendFollowUpEmail(
        contactInfo.email,
        memberName,
        eventName,
        message
      );
      results.email.sent = 1;
      results.email.success = true;
    } catch (error) {
      results.email.failed = 1;
      results.email.errors.push({ recipient: contactInfo.email, error });
    }
  }

  // Process SMS follow-up
  if (channels.includes('sms') && contactInfo.phoneNumber) {
    try {
      await sendFollowUpSMS(
        contactInfo.phoneNumber,
        memberName,
        message
      );
      results.sms.sent = 1;
      results.sms.success = true;
    } catch (error) {
      results.sms.failed = 1;
      results.sms.errors.push({ recipient: contactInfo.phoneNumber, error });
    }
  }

  // Process WhatsApp follow-up
  if (channels.includes('whatsapp') && contactInfo.whatsappNumber) {
    try {
      await sendFollowUpWhatsApp(
        contactInfo.whatsappNumber,
        memberName,
        message
      );
      results.whatsapp.sent = 1;
      results.whatsapp.success = true;
    } catch (error) {
      results.whatsapp.failed = 1;
      results.whatsapp.errors.push({ recipient: contactInfo.whatsappNumber, error });
    }
  }

  return {
    success: 
      (channels.includes('email') ? results.email.success : true) &&
      (channels.includes('sms') ? results.sms.success : true) &&
      (channels.includes('whatsapp') ? results.whatsapp.success : true),
    message,
    results
  };
}

/**
 * Sends batch follow-ups to multiple recipients
 * @param requests Array of follow-up requests
 * @returns Results of the batch operation
 */
export async function sendBatchFollowUps(requests: FollowUpRequest[]) {
  const totalRequests = requests.length;
  
  type FollowUpError = {
    memberId?: string;
    memberName: string;
    errors: Array<{recipient: string; error: Error | unknown}>;
    error?: Error | unknown;
  };
  
  let processed = 0;
  let successful = 0;
  let failed = 0;
  const errors: FollowUpError[] = [];
  
  for (const request of requests) {
    try {
      const result = await sendFollowUp(request);
      
      processed++;
      
      if (result.success) {
        successful++;
      } else {
        failed++;
        errors.push({
          memberId: request.memberId,
          memberName: request.memberName,
          errors: Object.values(result.results)
            .flatMap(r => r.errors)
        });
      }
    } catch (error) {
      console.error('Error processing follow-up:', error);
      failed++;
      errors.push({
        memberId: request.memberId,
        memberName: request.memberName,
        error
      });
    }
  }
  
  return {
    success: successful > 0,
    totalRequests,
    processed,
    successful,
    failed,
    errors
  };
}
