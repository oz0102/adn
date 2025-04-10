// test/services/sms.test.js
const { describe, it, expect, beforeEach, afterEach, jest } = require('@jest/globals');

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: { success: true } })
}));

// Import the service after mocking dependencies
const smsService = require('../../services/smsService');

describe('SMS Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.BULKSMS_API_TOKEN = 'test-token';
    process.env.BULKSMS_SENDER_NAME = 'ADN';
  });

  it('should send an SMS', async () => {
    const result = await smsService.sendSMS({
      to: '2348012345678',
      body: 'Test message'
    });
    
    expect(result).toEqual({ success: true });
  });

  it('should format phone numbers correctly', () => {
    expect(smsService.formatPhoneNumber('08012345678')).toBe('2348012345678');
    expect(smsService.formatPhoneNumber('2348012345678')).toBe('2348012345678');
    expect(smsService.formatPhoneNumber('+2348012345678')).toBe('2348012345678');
  });

  it('should send a welcome SMS', async () => {
    const result = await smsService.sendWelcomeSMS('2348012345678', 'John Doe');
    expect(result).toEqual({ success: true });
  });

  it('should send an event reminder SMS', async () => {
    const result = await smsService.sendEventReminderSMS(
      '2348012345678',
      'Sunday Service',
      '2025-04-15',
      '10:00 AM'
    );
    expect(result).toEqual({ success: true });
  });

  it('should send a birthday SMS', async () => {
    const result = await smsService.sendBirthdaySMS('2348012345678', 'John Doe');
    expect(result).toEqual({ success: true });
  });

  it('should send a follow-up SMS', async () => {
    const result = await smsService.sendFollowUpSMS(
      '2348012345678',
      'John Doe',
      'We missed you at our service. Hope to see you next time!'
    );
    expect(result).toEqual({ success: true });
  });

  it('should handle errors when sending SMS', async () => {
    // Mock axios to reject
    require('axios').post.mockRejectedValueOnce(new Error('Failed to send SMS'));

    await expect(smsService.sendSMS({
      to: '2348012345678',
      body: 'Test message'
    })).rejects.toThrow('Failed to send SMS');
  });
});
