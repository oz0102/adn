// Update platform-api.ts to integrate all social media API implementations
// import axios from 'axios'; // Removed unused import
import { SocialMediaPlatform } from '@/models/socialMediaAccount';
import { getTelegramFollowers } from './telegram-scraper';
import { createTwitterApiClient } from './twitter-api';
import { createFacebookApiClient, FacebookApiClient } from './facebook-api';
import { createYouTubeApiClient, YouTubeApiClient } from './youtube-api';
import { createInstagramApiClient, InstagramApiClient } from './instagram-api';
import { createTikTokApiClient, TikTokApiClient } from './tiktok-api';

// Interface for platform-specific API handlers
interface PlatformApiHandler {
  getFollowerCount: (username: string, url: string) => Promise<number>;
  validateCredentials: () => Promise<boolean>;
}

// Factory to get the appropriate API handler for each platform
export function getPlatformApiHandler(platform: SocialMediaPlatform): PlatformApiHandler {
  switch (platform) {
    case SocialMediaPlatform.Telegram:
      return new TelegramApiHandler();
    case SocialMediaPlatform.Twitter:
      return new TwitterApiHandler();
    case SocialMediaPlatform.Facebook:
      return new FacebookApiHandler();
    case SocialMediaPlatform.YouTube:
      return new YouTubeApiHandler();
    case SocialMediaPlatform.Instagram:
      return new InstagramApiHandler();
    case SocialMediaPlatform.TikTok:
      return new TikTokApiHandler();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// Telegram API handler (uses scraping)
class TelegramApiHandler implements PlatformApiHandler {
  async getFollowerCount(username: string, url: string): Promise<number> {
    // Extract username from URL if needed
    let cleanUsername = username;
    
    if (url.includes('t.me/')) {
      const match = url.match(/t\.me\/([^/?]+)/);
      if (match && match[1]) {
        cleanUsername = match[1];
      }
    }
    
    return await getTelegramFollowers(cleanUsername);
  }

  async validateCredentials(): Promise<boolean> {
    // No API credentials needed for scraping
    return true;
  }
}

// Twitter API handler
class TwitterApiHandler implements PlatformApiHandler {
  async getFollowerCount(username: string, url: string): Promise<number> {
    // Create Twitter API client
    const twitterClient = createTwitterApiClient();
    
    if (!twitterClient) {
      console.warn('Twitter API client could not be created. Check environment variables.');
      return 0;
    }
    
    try {
      // Extract username from URL if needed
      let cleanUsername = username;
      
      if (url.includes('twitter.com/')) {
        const match = url.match(/twitter\.com\/([^/?]+)/);
        if (match && match[1]) {
          cleanUsername = match[1];
        }
      }
      
      // Get follower count from Twitter API
      return await twitterClient.getFollowerCount(cleanUsername);
    } catch (error) {
      console.error(`Error fetching Twitter follower count for ${username}:`, error);
      return 0;
    }
  }

  async validateCredentials(): Promise<boolean> {
    // Create Twitter API client
    const twitterClient = createTwitterApiClient();
    
    if (!twitterClient) {
      return false;
    }
    
    // Validate credentials
    return await twitterClient.validateCredentials();
  }
}

// Facebook API handler
class FacebookApiHandler implements PlatformApiHandler {
  async getFollowerCount(username: string, url: string): Promise<number> {
    // Create Facebook API client
    const facebookClient = createFacebookApiClient();
    
    if (!facebookClient) {
      console.warn('Facebook API client could not be created. Check environment variables.');
      return 0;
    }
    
    try {
      // Extract username or ID from URL if needed
      let usernameOrId = username;
      
      if (url) {
        const extractedUsername = FacebookApiClient.extractUsernameFromUrl(url);
        if (extractedUsername) {
          usernameOrId = extractedUsername;
        }
      }
      
      // Get follower count from Facebook API
      return await facebookClient.getFollowerCount(usernameOrId);
    } catch (error) {
      console.error(`Error fetching Facebook follower count for ${username}:`, error);
      return 0;
    }
  }

  async validateCredentials(): Promise<boolean> {
    // Create Facebook API client
    const facebookClient = createFacebookApiClient();
    
    if (!facebookClient) {
      return false;
    }
    
    // Validate credentials
    return await facebookClient.validateCredentials();
  }
}

// YouTube API handler
class YouTubeApiHandler implements PlatformApiHandler {
  async getFollowerCount(username: string, url: string): Promise<number> {
    // Create YouTube API client
    const youtubeClient = createYouTubeApiClient();
    
    if (!youtubeClient) {
      console.warn('YouTube API client could not be created. Check environment variables.');
      return 0;
    }
    
    try {
      // Extract channel info from URL if needed
      let channelIdentifier = username;
      
      if (url) {
        const extractedChannel = YouTubeApiClient.extractChannelFromUrl(url);
        if (extractedChannel) {
          channelIdentifier = extractedChannel;
        }
      }
      
      // Get subscriber count from YouTube API
      return await youtubeClient.getSubscriberCount(channelIdentifier);
    } catch (error) {
      console.error(`Error fetching YouTube subscriber count for ${username}:`, error);
      return 0;
    }
  }

  async validateCredentials(): Promise<boolean> {
    // Create YouTube API client
    const youtubeClient = createYouTubeApiClient();
    
    if (!youtubeClient) {
      return false;
    }
    
    // Validate credentials
    return await youtubeClient.validateCredentials();
  }
}

// Instagram API handler
class InstagramApiHandler implements PlatformApiHandler {
  async getFollowerCount(username: string, url: string): Promise<number> {
    // Create Instagram API client
    const instagramClient = createInstagramApiClient();
    
    if (!instagramClient) {
      console.warn('Instagram API client could not be created. Check environment variables.');
      return 0;
    }
    
    try {
      // Extract username from URL if needed
      let cleanUsername = username;
      
      if (url) {
        const extractedUsername = InstagramApiClient.extractUsernameFromUrl(url);
        if (extractedUsername) {
          cleanUsername = extractedUsername;
        }
      }
      
      // Get follower count from Instagram API
      return await instagramClient.getFollowerCount(cleanUsername);
    } catch (error) {
      console.error(`Error fetching Instagram follower count for ${username}:`, error);
      return 0;
    }
  }

  async validateCredentials(): Promise<boolean> {
    // Create Instagram API client
    const instagramClient = createInstagramApiClient();
    
    if (!instagramClient) {
      return false;
    }
    
    // Validate credentials
    return await instagramClient.validateCredentials();
  }
}

// TikTok API handler
class TikTokApiHandler implements PlatformApiHandler {
  async getFollowerCount(username: string, url: string): Promise<number> {
    // Create TikTok API client
    const tiktokClient = createTikTokApiClient();
    
    if (!tiktokClient) {
      console.warn('TikTok API client could not be created. Check environment variables.');
      return 0;
    }
    
    try {
      // Extract username from URL if needed
      let cleanUsername = username;
      
      if (url) {
        const extractedUsername = TikTokApiClient.extractUsernameFromUrl(url);
        if (extractedUsername) {
          cleanUsername = extractedUsername;
        }
      }
      
      // Get follower count from TikTok API
      return await tiktokClient.getFollowerCount(cleanUsername);
    } catch (error) {
      console.error(`Error fetching TikTok follower count for ${username}:`, error);
      return 0;
    }
  }

  async validateCredentials(): Promise<boolean> {
    // Create TikTok API client
    const tiktokClient = createTikTokApiClient();
    
    if (!tiktokClient) {
      return false;
    }
    
    // Validate credentials
    return await tiktokClient.validateCredentials();
  }
}
