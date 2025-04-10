// test/services/whatsapp.test.js
const { describe, it, expect, beforeEach, afterEach, jest } = require('@jest/globals');

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: { success: true } })
}));

// Mock the formatPhoneNumber function from smsService
jest.mock('../../services/smsService', () => ({
  formatPhoneNumber: jest.fn(phoneNumber => {
    if (!phoneNumber) return null;
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (!digitsOnly.startsWith('234')) {
      return `234${digitsOnly.slice(-10)}`;
    }
    return digitsOnly;
  })
}));

// Import the service after mocking dependencies
const whatsappService = require('../../services/whatsappService');

describe('WhatsApp Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123456789';
    process.env.WHATSAPP_ACCESS_TOKEN = 'test-token';
  });

  it('should send a WhatsApp message', async () => {
    const result = await whatsappService.sendWhatsAppMessage({
      to: '2348012345678',
      templateName: 'welcome_message',
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: "John Doe"
            }
          ]
        }
      ]
    });
    
    expect(result).toEqual({ success: true });
  });

  it('should send a welcome WhatsApp message', async () => {
    const result = await whatsappService.sendWelcomeWhatsApp('2348012345678', 'John Doe');
    expect(result).toEqual({ success: true });
  });

  it('should send an event reminder WhatsApp message', async () => {
    const result = await whatsappService.sendEventReminderWhatsApp(
      '2348012345678',
      'Sunday Service',
      '2025-04-15',
      '10:00 AM',
      'Main Auditorium'
    );
    expect(result).toEqual({ success: true });
  });

  it('should send a birthday WhatsApp message', async () => {
    const result = await whatsappService.sendBirthdayWhatsApp('2348012345678', 'John Doe');
    expect(result).toEqual({ success: true });
  });

  it('should send a follow-up WhatsApp message', async () => {
    const result = await whatsappService.sendFollowUpWhatsApp(
      '2348012345678',
      'John Doe',
      'We missed you at our service. Hope to see you next time!'
    );
    expect(result).toEqual({ success: true });
  });

  it('should handle errors when sending WhatsApp messages', async () => {
    // Mock axios to reject
    require('axios').post.mockRejectedValueOnce(new Error('Failed to send WhatsApp message'));

    await expect(whatsappService.sendWhatsAppMessage({
      to: '2348012345678',
      templateName: 'welcome_message'
    })).rejects.toThrow('Failed to send WhatsApp message');
  });
});
