// Instagram API implementation for follower count tracking
import axios from 'axios';

/**
 * Instagram API client for fetching follower counts
 * Based on Instagram Graph API documentation
 * https://developers.facebook.com/docs/instagram-api
 */
export class InstagramApiClient {
  private accessToken: string;
  private apiBaseUrl = 'https://graph.facebook.com/v18.0';
  private userAgent = 'Social-Media-Tracker/1.0';

  /**
   * Initialize the Instagram API client
   * @param accessToken Instagram Graph API access token with instagram_basic permission
   */
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get Instagram Business Account information
   * @param igBusinessId Instagram Business Account ID
   * @returns Account data including follower count
   */
  async getBusinessAccount(igBusinessId: string) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/${igBusinessId}`, {
        params: {
          fields: 'id,username,profile_picture_url,followers_count,media_count,biography',
          access_token: this.accessToken
        },
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching Instagram Business Account:', error);
      throw new Error(`Failed to fetch Instagram Business Account: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get Instagram Business Account ID by username
   * @param username Instagram username (without @ symbol)
   * @returns Instagram Business Account ID
   */
  async getBusinessIdByUsername(username: string): Promise<string> {
    try {
      // Clean the username (remove @ if present)
      const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
      
      // First, get the list of Instagram Business Accounts connected to the user
      const response = await axios.get(`${this.apiBaseUrl}/me/accounts`, {
        params: {
          fields: 'instagram_business_account{id,username}',
          access_token: this.accessToken
        },
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      // Look for the account with matching username
      if (response.data && response.data.data) {
        for (const page of response.data.data) {
          if (page.instagram_business_account && 
              page.instagram_business_account.username === cleanUsername) {
            return page.instagram_business_account.id;
          }
        }
      }
      
      throw new Error(`Instagram Business Account not found for username: ${username}`);
    } catch (error: any) {
      console.error('Error finding Instagram Business Account by username:', error);
      throw new Error(`Failed to find Instagram Business Account by username: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get follower count for an Instagram account by username
   * @param username Instagram username (without @ symbol)
   * @returns Number of followers
   */
  async getFollowerCount(username: string): Promise<number> {
    try {
      // First, get the Instagram Business Account ID
      const businessId = await this.getBusinessIdByUsername(username);
      
      // Then, get the account details including follower count
      const accountData = await this.getBusinessAccount(businessId);
      
      return accountData.followers_count || 0;
    } catch (error: any) {
      console.error('Error fetching Instagram follower count:', error);
      throw new Error(`Failed to fetch Instagram follower count: ${error?.response?.data?.message || error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Validate Instagram API credentials
   * @returns True if credentials are valid
   */
  async validateCredentials(): Promise<boolean> {
    try {
      // Make a simple request to verify credentials
      await axios.get(`${this.apiBaseUrl}/me`, {
        params: {
          fields: 'id,name',
          access_token: this.accessToken
        },
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      return true;
    } catch (error: any) {
      console.error('Instagram API credentials validation failed:', error?.response?.data || error);
      return false;
    }
  }

  /**
   * Extract username from Instagram URL
   * @param url Instagram profile URL
   * @returns Username
   */
  static extractUsernameFromUrl(url: string): string | null {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname.includes('instagram.com')) {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        if (pathParts.length > 0) {
          return pathParts[0];
        }
      }
      
      return null;
    } catch (error: any) {
      console.error('Error extracting Instagram username from URL:', error?.message || error);
      return null;
    }
  }
}

/**
 * Create an Instagram API client instance
 * @returns Instagram API client or null if credentials are missing
 */
export function createInstagramApiClient(): InstagramApiClient | null {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.warn('Instagram API access token not found in environment variables');
    return null;
  }
  
  return new InstagramApiClient(accessToken);
}
