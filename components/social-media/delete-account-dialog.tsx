// Alert dialog component for confirming social media account deletion
"use client"
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { socialMediaService } from "@/services/socialMediaService";
import { toast } from "@/components/ui/use-toast";

interface AccountForDelete {
  _id: string;
  platform?: string;
  username?: string;
}

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountForDelete;
  onSuccess: () => void;
}

// Define a type for the expected structure of an API error response
interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string; // To also accommodate standard Error objects
}

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  isOpen,
  onClose,
  account,
  onSuccess
}) => {
  const handleDelete = async () => {
    try {
      await socialMediaService.deleteAccount(account._id);
      
      toast({
        title: "Account deleted",
        description: "Social media account has been deleted successfully."
      });
      
      onSuccess();
      onClose();
    } catch (error: unknown) {
      let errorMessage = "Something went wrong. Please try again.";
      
      if (typeof error === "object" && error !== null) {
        const apiError = error as ApiError; // Type assertion
        if (apiError.response?.data?.error) {
          errorMessage = apiError.response.data.error;
        } else if (apiError.message) {
          errorMessage = apiError.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the {account?.platform} account @{account?.username} and all its tracking history.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
