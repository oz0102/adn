// YouTube API implementation for follower count tracking
import axios from 'axios';

/**
 * YouTube API client for fetching subscriber counts
 * Based on YouTube Data API v3 documentation
 * https://developers.google.com/youtube/v3/docs
 */
export class YouTubeApiClient {
  private apiKey: string;
  private apiBaseUrl = 'https://www.googleapis.com/youtube/v3';
  private userAgent = 'Social-Media-Tracker/1.0';

  /**
   * Initialize the YouTube API client
   * @param apiKey YouTube Data API key
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get channel information by username, handle, or custom URL
   * @param usernameOrHandle YouTube username, handle, or custom URL
   * @returns Channel data including subscriber count
   */
  async getChannelByUsername(usernameOrHandle: string) {
    try {
      // Clean the username/handle (remove @ if present)
      let cleanUsername = usernameOrHandle.startsWith('@') 
        ? usernameOrHandle.substring(1) 
        : usernameOrHandle;
      
      // Determine the parameter to use based on the format
      let paramName = 'forUsername';
      
      // If it's a handle (starts with @) or custom URL, use different approach
      if (usernameOrHandle.startsWith('@') || cleanUsername.includes('/')) {
        paramName = 'forHandle';
        
        // For custom URLs, extract the last part
        if (cleanUsername.includes('/')) {
          const parts = cleanUsername.split('/');
          cleanUsername = parts[parts.length - 1];
          
          // If it's a channel ID format (starts with UC)
          if (cleanUsername.startsWith('UC')) {
            return await this.getChannelById(cleanUsername);
          }
        }
      }
      
      // First, try to get channel by username or handle
      try {
        const response = await axios.get(`${this.apiBaseUrl}/channels`, {
          params: {
            part: 'snippet,statistics',
            [paramName]: cleanUsername,
            key: this.apiKey
          },
          headers: {
            'User-Agent': this.userAgent
          }
        });
        
        if (response.data.items && response.data.items.length > 0) {
          return response.data.items[0];
        }
      } catch {
        console.log(`Could not find channel with ${paramName}=${cleanUsername}, trying search...`);
      }
      
      // If direct lookup fails, try search
      const searchResponse = await axios.get(`${this.apiBaseUrl}/search`, {
        params: {
          part: 'snippet',
          q: cleanUsername,
          type: 'channel',
          maxResults: 1,
          key: this.apiKey
        },
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        const channelId = searchResponse.data.items[0].id.channelId;
        return await this.getChannelById(channelId);
      }
      
      throw new Error(`Channel not found for ${usernameOrHandle}`);
    } catch (error: unknown) {
      console.error('Error fetching YouTube channel:', error);
      throw new Error(`Failed to fetch YouTube channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get channel information by channel ID
   * @param channelId YouTube channel ID
   * @returns Channel data including subscriber count
   */
  async getChannelById(channelId: string) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/channels`, {
        params: {
          part: 'snippet,statistics',
          id: channelId,
          key: this.apiKey
        },
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0];
      }
      
      throw new Error(`Channel not found for ID ${channelId}`);
    } catch (error: unknown) {
      console.error('Error fetching YouTube channel by ID:', error);
      throw new Error(`Failed to fetch YouTube channel by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get subscriber count for a channel by username, handle, or custom URL
   * @param usernameOrHandle YouTube username, handle, or custom URL
   * @returns Number of subscribers
   */
  async getSubscriberCount(usernameOrHandle: string): Promise<number> {
    try {
      const channelData = await this.getChannelByUsername(usernameOrHandle);
      
      // YouTube may hide subscriber counts for some channels
      if (channelData.statistics && 
          channelData.statistics.hiddenSubscriberCount !== true &&
          channelData.statistics.subscriberCount) {
        return parseInt(channelData.statistics.subscriberCount, 10);
      }
      
      // Return 0 if subscriber count is hidden
      return 0;
    } catch (error: unknown) {
      console.error('Error fetching YouTube subscriber count:', error);
      throw new Error(`Failed to fetch YouTube subscriber count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate YouTube API credentials
   * @returns True if credentials are valid
   */
  async validateCredentials(): Promise<boolean> {
    try {
      // Make a simple request to verify API key
      await axios.get(`${this.apiBaseUrl}/channels`, {
        params: {
          part: 'snippet',
          id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', // Google Developers channel
          key: this.apiKey
        },
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      return true;
    } catch (error: unknown) {
      console.error('YouTube API credentials validation failed:', error);
      return false;
    }
  }

  /**
   * Extract channel username, handle, or ID from YouTube URL
   * @param url YouTube channel URL
   * @returns Username, handle, or ID
   */
  static extractChannelFromUrl(url: string): string | null {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname.includes('youtube.com')) {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        if (pathParts.length >= 2) {
          // youtube.com/channel/CHANNEL_ID
          if (pathParts[0] === 'channel') {
            return pathParts[1];
          }
          // youtube.com/c/CUSTOM_URL or youtube.com/user/USERNAME
          else if (pathParts[0] === 'c' || pathParts[0] === 'user') {
            return pathParts[1];
          }
          // youtube.com/@HANDLE
          else if (pathParts[0].startsWith('@')) {
            return pathParts[0];
          }
        } else if (pathParts.length === 1 && pathParts[0].startsWith('@')) {
          // youtube.com/@HANDLE
          return pathParts[0];
        }
      }
      
      return null;
    } catch (error: unknown) {
      console.error('Error extracting YouTube channel from URL:', error);
      return null;
    }
  }
}

/**
 * Create a YouTube API client instance
 * @returns YouTube API client or null if credentials are missing
 */
export function createYouTubeApiClient(): YouTubeApiClient | null {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.warn('YouTube API key not found in environment variables');
    return null;
  }
  
  return new YouTubeApiClient(apiKey);
}
