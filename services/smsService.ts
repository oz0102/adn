import axios from 'axios';

/**
 * Formats a phone number to ensure it has the correct country code format
 * @param phoneNumber The phone number to format
 * @returns Formatted phone number with country code
 */
const formatPhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber) return null;

  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If the number doesn't start with the country code, add it (Nigeria - 234)
  if (!digitsOnly.startsWith('234')) {
    return `234${digitsOnly.slice(-10)}`;
  }
  
  return digitsOnly;
};

/**
 * Sends an SMS using BulkSMS Nigeria API
 * @param options Object containing recipient phone number and message body
 * @returns API response data
 */
const sendSMS = async ({ to, body }: { to: string; body: string }) => {
  const from = process.env.BULKSMS_SENDER_NAME || "ADN";
  const apiToken = process.env.BULKSMS_API_TOKEN;
  const gateway = "direct-refund";

  if (!apiToken) {
    console.error('BULKSMS_API_TOKEN is not set in environment variables');
    throw new Error('SMS API token not configured');
  }

  // Ensure the phone number is in the correct format
  const formattedPhoneNumber = formatPhoneNumber(to);

  if (!formattedPhoneNumber) {
    throw new Error('Invalid phone number');
  }

  const requestPayload = {
    body,
    from,
    to: formattedPhoneNumber,
    api_token: apiToken,
    gateway,
  };

  try {
    const response = await axios.post('https://www.bulksmsnigeria.com/api/v2/sms', requestPayload, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('SMS sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error sending SMS:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Sends a welcome SMS to a new member
 * @param to Recipient phone number
 * @param name Recipient name
 */
const sendWelcomeSMS = async (to: string, name: string) => {
  const message = `Welcome to Apostolic Dominion Network, ${name}! We're excited to have you join our community. God bless you.`;
  return sendSMS({ to, body: message });
};

/**
 * Sends an event reminder SMS
 * @param to Recipient phone number
 * @param eventName Name of the event
 * @param date Date of the event
 * @param time Time of the event
 */
const sendEventReminderSMS = async (to: string, eventName: string, date: string, time: string) => {
  const message = `Reminder: ${eventName} is scheduled for ${date} at ${time}. We look forward to seeing you there!`;
  return sendSMS({ to, body: message });
};

/**
 * Sends a birthday wish SMS
 * @param to Recipient phone number
 * @param name Recipient name
 */
const sendBirthdaySMS = async (to: string, name: string) => {
  const message = `Happy Birthday, ${name}! The entire ADN family wishes you God's blessings on your special day.`;
  return sendSMS({ to, body: message });
};

/**
 * Sends a follow-up SMS
 * @param to Recipient phone number
 * @param name Recipient name
 * @param message Follow-up message
 */
const sendFollowUpSMS = async (to: string, name: string, message: string) => {
  const smsBody = `Hello ${name}, ${message}`;
  return sendSMS({ to, body: smsBody });
};

export {
  sendSMS,
  sendWelcomeSMS,
  sendEventReminderSMS,
  sendBirthdaySMS,
  sendFollowUpSMS,
  formatPhoneNumber
};
