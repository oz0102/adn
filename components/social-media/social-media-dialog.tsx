// Dialog component for adding/editing social media accounts
"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SocialMediaForm } from './social-media-form';
import { SocialMediaAccountFormValues, SocialMediaPlatform } from '@/lib/validations/social-media'; // Added SocialMediaPlatform
import { socialMediaService } from '@/services/socialMediaService';
import { toast } from '@/components/ui/use-toast';

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
    } catch (error: unknown) { // Changed from any
      let errorMessage = 'Something went wrong. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // Attempt to get a more specific error message if it's an API error response
      if (typeof error === 'object' && error !== null && 'response' in error && 
          typeof (error as any).response === 'object' && (error as any).response !== null && 
          'data' in (error as any).response && typeof (error as any).response.data === 'object' && 
          (error as any).response.data !== null && 'error' in (error as any).response.data) {
        errorMessage = (error as any).response.data.error;
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
