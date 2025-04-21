// Twitter API implementation for follower count tracking
import axios from 'axios';

/**
 * Twitter API client for fetching follower counts
 * Based on Twitter API v2 documentation
 * https://developer.twitter.com/en/docs/twitter-api
 */
export class TwitterApiClient {
  private bearerToken: string;
  private apiBaseUrl = 'https://api.twitter.com/2';
  private userAgent = 'Social-Media-Tracker/1.0';

  /**
   * Initialize the Twitter API client
   * @param bearerToken Twitter API bearer token
   */
  constructor(bearerToken: string) {
    this.bearerToken = bearerToken;
  }

  /**
   * Get user information by username
   * @param username Twitter username (without @ symbol)
   * @returns User data including ID
   */
  async getUserByUsername(username: string) {
    try {
      // Clean the username (remove @ if present)
      const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
      
      const response = await axios.get(`${this.apiBaseUrl}/users/by/username/${cleanUsername}`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'User-Agent': this.userAgent
        },
        params: {
          'user.fields': 'public_metrics,description,profile_image_url'
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching Twitter user:', error);
      throw new Error(`Failed to fetch Twitter user: ${error.message}`);
    }
  }

  /**
   * Get follower count for a user by username
   * @param username Twitter username (without @ symbol)
   * @returns Number of followers
   */
  async getFollowerCount(username: string): Promise<number> {
    try {
      const userData = await this.getUserByUsername(username);
      return userData.public_metrics.followers_count;
    } catch (error) {
      console.error('Error fetching Twitter follower count:', error);
      throw new Error(`Failed to fetch Twitter follower count: ${error.message}`);
    }
  }

  /**
   * Validate Twitter API credentials
   * @returns True if credentials are valid
   */
  async validateCredentials(): Promise<boolean> {
    try {
      // Make a simple request to verify credentials
      await axios.get(`${this.apiBaseUrl}/users/me`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'User-Agent': this.userAgent
        }
      });
      return true;
    } catch (error) {
      console.error('Twitter API credentials validation failed:', error);
      return false;
    }
  }
}

/**
 * Create a Twitter API client instance
 * @returns Twitter API client or null if credentials are missing
 */
export function createTwitterApiClient(): TwitterApiClient | null {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken) {
    console.warn('Twitter API bearer token not found in environment variables');
    return null;
  }
  
  return new TwitterApiClient(bearerToken);
}
