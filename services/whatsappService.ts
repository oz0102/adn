import axios from 'axios';
import { formatPhoneNumber } from './smsService';

const WHATSAPP_API_URL = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

/**
 * Sends a WhatsApp message using the WhatsApp Cloud API
 * @param options Object containing recipient phone number and template name
 * @param language Language code for the template
 * @returns API response data
 */
const sendWhatsAppMessage = async ({ to, templateName, components = [] }: 
  { to: string; templateName: string; components?: any[] }, language = 'en') => {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (!accessToken) {
      console.error('WHATSAPP_ACCESS_TOKEN is not set in environment variables');
      throw new Error('WhatsApp access token not configured');
    }
    
    const formattedNumber = formatPhoneNumber(to);
    
    if (!formattedNumber) {
      throw new Error('Invalid phone number');
    }
    
    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language
        }
      }
    };
    
    // Add components if provided
    if (components && components.length > 0) {
      payload.template.components = components;
    }

    console.log('Sending WhatsApp message with payload:', payload);

    const response = await axios.post(
      WHATSAPP_API_URL,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

/**
 * Sends a welcome message via WhatsApp
 * @param to Recipient phone number
 * @param name Recipient name
 */
const sendWelcomeWhatsApp = async (to: string, name: string) => {
  const components = [
    {
      type: "body",
      parameters: [
        {
          type: "text",
          text: name
        }
      ]
    }
  ];
  
  return sendWhatsAppMessage({
    to,
    templateName: "welcome_message",
    components
  });
};

/**
 * Sends an event reminder via WhatsApp
 * @param to Recipient phone number
 * @param eventName Name of the event
 * @param date Date of the event
 * @param time Time of the event
 * @param location Location of the event
 */
const sendEventReminderWhatsApp = async (to: string, eventName: string, date: string, time: string, location: string) => {
  const components = [
    {
      type: "body",
      parameters: [
        {
          type: "text",
          text: eventName
        },
        {
          type: "text",
          text: date
        },
        {
          type: "text",
          text: time
        },
        {
          type: "text",
          text: location
        }
      ]
    }
  ];
  
  return sendWhatsAppMessage({
    to,
    templateName: "event_reminder",
    components
  });
};

/**
 * Sends a birthday wish via WhatsApp
 * @param to Recipient phone number
 * @param name Recipient name
 */
const sendBirthdayWhatsApp = async (to: string, name: string) => {
  const components = [
    {
      type: "body",
      parameters: [
        {
          type: "text",
          text: name
        }
      ]
    }
  ];
  
  return sendWhatsAppMessage({
    to,
    templateName: "birthday_wishes",
    components
  });
};

/**
 * Sends a follow-up message via WhatsApp
 * @param to Recipient phone number
 * @param name Recipient name
 * @param message Follow-up message
 */
const sendFollowUpWhatsApp = async (to: string, name: string, message: string) => {
  const components = [
    {
      type: "body",
      parameters: [
        {
          type: "text",
          text: name
        },
        {
          type: "text",
          text: message
        }
      ]
    }
  ];
  
  return sendWhatsAppMessage({
    to,
    templateName: "follow_up_message",
    components
  });
};

export {
  sendWhatsAppMessage,
  sendWelcomeWhatsApp,
  sendEventReminderWhatsApp,
  sendBirthdayWhatsApp,
  sendFollowUpWhatsApp
};
