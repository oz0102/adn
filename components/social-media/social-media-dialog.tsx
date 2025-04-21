// Dialog component for adding/editing social media accounts
"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SocialMediaForm } from './social-media-form';
import { SocialMediaAccountFormValues } from '@/lib/validations/social-media';
import { socialMediaService } from '@/services/socialMediaService';
import { toast } from '@/components/ui/use-toast';

interface SocialMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
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
      
      if (isEditing) {
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
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Something went wrong. Please try again.',
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
