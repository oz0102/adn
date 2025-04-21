import { z } from 'zod';
import { SocialMediaPlatform } from '@/models/socialMediaAccount';

// Schema for creating a new social media account
export const socialMediaAccountSchema = z.object({
  platform: z.enum([
    SocialMediaPlatform.TWITTER,
    SocialMediaPlatform.FACEBOOK,
    SocialMediaPlatform.YOUTUBE,
    SocialMediaPlatform.INSTAGRAM,
    SocialMediaPlatform.TIKTOK,
    SocialMediaPlatform.TELEGRAM
  ], {
    required_error: "Platform is required",
  }),
  username: z.string().min(1, {
    message: "Username is required",
  }),
  url: z.string().url({
    message: "Please enter a valid URL",
  }),
});

// Schema for updating an existing social media account
export const updateSocialMediaAccountSchema = socialMediaAccountSchema.partial();

// Type definitions based on the schemas
export type SocialMediaAccountFormValues = z.infer<typeof socialMediaAccountSchema>;
export type UpdateSocialMediaAccountFormValues = z.infer<typeof updateSocialMediaAccountSchema>;
