// Form component for adding/editing social media accounts
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SocialMediaPlatform } from '@/models/socialMediaAccount';
import { socialMediaAccountSchema, SocialMediaAccountFormValues } from '@/lib/validations/social-media';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlatformIcon } from './social-media-card';

interface SocialMediaFormProps {
  initialData?: Partial<SocialMediaAccountFormValues>;
  onSubmit: (data: SocialMediaAccountFormValues) => void;
  isSubmitting: boolean;
}

export const SocialMediaForm: React.FC<SocialMediaFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting
}) => {
  // Initialize form with react-hook-form and zod validation
  const form = useForm<SocialMediaAccountFormValues>({
    resolver: zodResolver(socialMediaAccountSchema),
    defaultValues: {
      platform: initialData?.platform || SocialMediaPlatform.TWITTER,
      username: initialData?.username || '',
      url: initialData?.url || '',
    }
  });

  // Helper function to generate URL based on platform and username
  const generateUrl = (platform: SocialMediaPlatform, username: string) => {
    if (!username) return '';
    
    switch (platform) {
      case SocialMediaPlatform.TWITTER:
        return `https://twitter.com/${username}`;
      case SocialMediaPlatform.FACEBOOK:
        return `https://facebook.com/${username}`;
      case SocialMediaPlatform.YOUTUBE:
        return `https://youtube.com/@${username}`;
      case SocialMediaPlatform.INSTAGRAM:
        return `https://instagram.com/${username}`;
      case SocialMediaPlatform.TIKTOK:
        return `https://tiktok.com/@${username}`;
      case SocialMediaPlatform.TELEGRAM:
        return `https://t.me/${username}`;
      default:
        return '';
    }
  };

  // Handle platform change to auto-generate URL
  const handlePlatformChange = (platform: SocialMediaPlatform) => {
    const username = form.getValues('username');
    if (username) {
      form.setValue('url', generateUrl(platform, username));
    }
  };

  // Handle username change to auto-generate URL
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value;
    const platform = form.getValues('platform') as SocialMediaPlatform;
    if (username && platform) {
      form.setValue('url', generateUrl(platform, username));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform</FormLabel>
              <Select
                disabled={isSubmitting}
                onValueChange={(value) => {
                  field.onChange(value);
                  handlePlatformChange(value as SocialMediaPlatform);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(SocialMediaPlatform).map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      <div className="flex items-center">
                        <span className="mr-2">
                          <PlatformIcon platform={platform as SocialMediaPlatform} />
                        </span>
                        {platform}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isSubmitting}
                  placeholder="Enter username"
                  onChange={(e) => {
                    field.onChange(e);
                    handleUsernameChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isSubmitting}
                  placeholder="Enter URL"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update Account' : 'Add Account'}
        </Button>
      </form>
    </Form>
  );
};
