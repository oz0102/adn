// test/dashboard/notifications.test.js
const { describe, it, expect, beforeEach, afterEach, jest } = require('@jest/globals');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const { sendNotification, sendBatchNotification } = require('../../app/(dashboard)/notifications/notification-service');

// Mock the notification service
jest.mock('../../app/(dashboard)/notifications/notification-service', () => ({
  sendNotification: jest.fn().mockResolvedValue({
    success: true,
    results: {
      email: { success: true, sent: 2, failed: 0, errors: [] },
      sms: { success: true, sent: 1, failed: 0, errors: [] },
      whatsapp: { success: true, sent: 1, failed: 0, errors: [] }
    }
  }),
  sendBatchNotification: jest.fn().mockResolvedValue({
    success: true,
    totalRecipients: 10,
    processed: 10,
    successful: 8,
    failed: 2,
    errors: []
  })
}));

// Mock the hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Import the component after mocking dependencies
const { useNotificationActions } = require('../../app/(dashboard)/notifications/notification-actions');

describe('Notification Actions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should send a notification to recipients', async () => {
    // Create a test component that uses the hook
    const TestComponent = () => {
      const { sendNotificationToRecipients, isLoading } = useNotificationActions();
      
      const handleClick = () => {
        sendNotificationToRecipients({
          title: 'Test Notification',
          message: 'This is a test notification',
          type: 'Info',
          recipients: [
            { email: 'test1@example.com', name: 'Test User 1' },
            { email: 'test2@example.com', name: 'Test User 2' }
          ],
          channels: ['email', 'sms', 'whatsapp']
        });
      };
      
      return (
        <div>
          <button onClick={handleClick} disabled={isLoading}>
            Send Notification
          </button>
          {isLoading && <div>Loading...</div>}
        </div>
      );
    };
    
    // Render the test component
    render(<TestComponent />);
    
    // Click the button to send notification
    fireEvent.click(screen.getByText('Send Notification'));
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(sendNotification).toHaveBeenCalled();
    });
    
    // Check that the notification was sent with the correct data
    expect(sendNotification).toHaveBeenCalledWith({
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'Info',
      recipients: [
        { email: 'test1@example.com', name: 'Test User 1' },
        { email: 'test2@example.com', name: 'Test User 2' }
      ],
      channels: ['email', 'sms', 'whatsapp']
    });
  });

  it('should send a batch notification to recipients', async () => {
    // Create a test component that uses the hook
    const TestComponent = () => {
      const { sendBatchNotificationToRecipients, isLoading } = useNotificationActions();
      
      const handleClick = () => {
        sendBatchNotificationToRecipients({
          title: 'Batch Notification',
          message: 'This is a batch notification',
          type: 'Info',
          recipients: Array(10).fill().map((_, i) => ({
            email: `user${i}@example.com`,
            name: `User ${i}`
          })),
          channels: ['email']
        });
      };
      
      return (
        <div>
          <button onClick={handleClick} disabled={isLoading}>
            Send Batch Notification
          </button>
          {isLoading && <div>Loading...</div>}
        </div>
      );
    };
    
    // Render the test component
    render(<TestComponent />);
    
    // Click the button to send batch notification
    fireEvent.click(screen.getByText('Send Batch Notification'));
    
    // Wait for the loading state to finish
    await waitFor(() => {
      expect(sendBatchNotification).toHaveBeenCalled();
    });
    
    // Check that the batch notification was sent with the correct data
    expect(sendBatchNotification).toHaveBeenCalledWith({
      title: 'Batch Notification',
      message: 'This is a batch notification',
      type: 'Info',
      recipients: expect.arrayContaining([
        expect.objectContaining({ email: expect.any(String), name: expect.any(String) })
      ]),
      channels: ['email']
    });
  });

  it('should handle errors when sending notifications', async () => {
    // Mock the sendNotification to reject
    sendNotification.mockRejectedValueOnce(new Error('Failed to send notification'));
    
    // Create a test component that uses the hook
    const TestComponent = () => {
      const { sendNotificationToRecipients, isLoading } = useNotificationActions();
      
      const handleClick = () => {
        sendNotificationToRecipients({
          title: 'Test Notification',
          message: 'This is a test notification',
          type: 'Info',
          recipients: [{ email: 'test@example.com', name: 'Test User' }],
          channels: ['email']
        });
      };
      
      return (
        <div>
          <button onClick={handleClick} disabled={isLoading}>
            Send Notification
          </button>
        </div>
      );
    };
    
    // Render the test component
    render(<TestComponent />);
    
    // Click the button to send notification
    fireEvent.click(screen.getByText('Send Notification'));
    
    // Wait for the promise to reject
    await waitFor(() => {
      expect(sendNotification).toHaveBeenCalled();
    });
  });
});
