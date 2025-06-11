// app/(dashboard)/notifications/notification-actions.ts
"use client"

import { useState } from "react";
import { useToast } from "@/lib/client/hooks/use-toast";
import { sendNotification, sendBatchNotification, NotificationRequest } from "./notification-service";

export function useNotificationActions() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Send a notification to specified recipients
   */
  const sendNotificationToRecipients = async (notificationData: NotificationRequest) => {
    try {
      setIsLoading(true);
      
      const result = await sendNotification(notificationData);
      
      if (result.success) {
        toast({
          title: "Notification sent",
          description: `Successfully sent to ${
            Object.values(result.results)
              .filter(r => r.success)
              .map(r => r.sent)
              .reduce((a, b) => a + b, 0)
          } recipients.`,
        });
        return true;
      } else {
        const failedCount = Object.values(result.results)
          .map(r => r.failed)
          .reduce((a, b) => a + b, 0);
          
        toast({
          title: "Notification partially sent",
          description: `Failed to send to ${failedCount} recipients. Check logs for details.`,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Send a batch notification to many recipients
   */
  const sendBatchNotificationToRecipients = async (notificationData: NotificationRequest) => {
    try {
      setIsLoading(true);
      
      const result = await sendBatchNotification(notificationData);
      
      if (result.success) {
        toast({
          title: "Batch notification sent",
          description: `Successfully sent to ${result.successful} out of ${result.totalRecipients} recipients.`,
        });
        return true;
      } else {
        toast({
          title: "Batch notification failed",
          description: `Failed to send notifications. Check logs for details.`,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error sending batch notification:", error);
      toast({
        title: "Error",
        description: "Failed to send batch notification. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sendNotificationToRecipients,
    sendBatchNotificationToRecipients
  };
}
