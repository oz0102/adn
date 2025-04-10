// test/services/email.test.js
const { describe, it, expect, beforeEach, afterEach, jest } = require('@jest/globals');

// Mock the zeptomail client
jest.mock('zeptomail', () => {
  return {
    SendMailClient: jest.fn().mockImplementation(() => {
      return {
        sendMail: jest.fn().mockResolvedValue({ success: true })
      };
    })
  };
});

// Import the service after mocking dependencies
const emailService = require('../../services/emailService');

describe('Email Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should send a welcome email', async () => {
    const result = await emailService.sendWelcomeEmail('test@example.com', 'John Doe');
    expect(result).toEqual({ success: true });
  });

  it('should send an event reminder email', async () => {
    const result = await emailService.sendEventReminderEmail(
      'test@example.com',
      'Sunday Service',
      '2025-04-15',
      '10:00 AM',
      'Main Auditorium',
      'John Doe'
    );
    expect(result).toEqual({ success: true });
  });

  it('should send a birthday email', async () => {
    const result = await emailService.sendBirthdayEmail('test@example.com', 'John Doe');
    expect(result).toEqual({ success: true });
  });

  it('should send a follow-up email', async () => {
    const result = await emailService.sendFollowUpEmail(
      'test@example.com',
      'John Doe',
      'Sunday Service',
      'We missed you at our service. Hope to see you next time!'
    );
    expect(result).toEqual({ success: true });
  });

  it('should handle errors when sending emails', async () => {
    // Mock the sendMail function to reject
    require('zeptomail').SendMailClient.mockImplementationOnce(() => {
      return {
        sendMail: jest.fn().mockRejectedValue(new Error('Failed to send email'))
      };
    });

    await expect(emailService.sendWelcomeEmail('test@example.com', 'John Doe'))
      .rejects.toThrow('Failed to send email');
  });
});
