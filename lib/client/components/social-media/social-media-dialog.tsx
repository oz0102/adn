// Dialog component for adding/editing social media accounts
"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/lib/client/components/ui/dialog';
import { SocialMediaForm } from './social-media-form';
import { SocialMediaAccountFormValues, SocialMediaPlatform } from '@/lib/validations/social-media'; // Added SocialMediaPlatform
import { socialMediaService } from '@/services/socialMediaService';
import { toast } from '@/lib/client/components/ui/use-toast';

// Define a more specific type for initialData, matching expected structure
interface InitialSocialMediaData {
  _id: string;
  platform: SocialMediaPlatform;
  username: string;
  link: string;
  notes?: string;
  // Add other fields that might be part of initialData if necessary
}

interface SocialMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: InitialSocialMediaData; // Changed from any
  onSuccess: () => void;
}

export const SocialMediaDialog: React.FC<SocialMediaDialogProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const handleSubmit = async (data: SocialMediaAccountFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (isEditing && initialData) { // Added null check for initialData
        await socialMediaService.updateAccount(initialData._id, data);
        toast({
          title: 'Account updated',
          description: 'Social media account has been updated successfully.'
        });
      } else {
        await socialMediaService.createAccount(data);
        toast({
          title: 'Account added',
          description: 'Social media account has been added successfully.'
        });
      }
      
      onSuccess();
      onClose();
    } catch (error: unknown) { 
      let errorMessage = 'Something went wrong. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // More type-safe way to check for API error structure
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: unknown }).response;
        if (typeof response === 'object' && response !== null && 'data' in response) {
          const data = (response as { data?: unknown }).data;
          if (typeof data === 'object' && data !== null) {
            if ('error' in data && typeof (data as { error?: unknown }).error === 'string') {
              errorMessage = (data as { error: string }).error;
            } else if ('message' in data && typeof (data as { message?: unknown }).message === 'string') {
              // Handle cases where the error message might be in data.message
              errorMessage = (data as { message: string }).message;
            }
          }
        }
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Social Media Account' : 'Add Social Media Account'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the details of your social media account.' 
              : 'Add a new social media account to track followers.'}
          </DialogDescription>
        </DialogHeader>
        
        <SocialMediaForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};
