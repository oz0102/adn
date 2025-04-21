// Facebook API implementation for follower count tracking
import axios from 'axios';

/**
 * Facebook API client for fetching follower counts
 * Based on Facebook Graph API v18.0 documentation
 * https://developers.facebook.com/docs/graph-api
 */
export class FacebookApiClient {
  private accessToken: string;
  private appId: string;
  private appSecret: string;
  private apiBaseUrl = 'https://graph.facebook.com/v18.0';
  private userAgent = 'Social-Media-Tracker/1.0';

  /**
   * Initialize the Facebook API client
   * @param appId Facebook App ID
   * @param appSecret Facebook App Secret
   * @param accessToken Facebook Access Token with pages_read_engagement permission
   */
  constructor(appId: string, appSecret: string, accessToken: string) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.accessToken = accessToken;
  }

  /**
   * Get page information by username or page ID
   * @param usernameOrId Facebook page username or ID
   * @returns Page data including follower count
   */
  async getPageByUsername(usernameOrId: string) {
    try {
      // Clean the username (remove @ if present)
      const cleanUsername = usernameOrId.startsWith('@') ? usernameOrId.substring(1) : usernameOrId;
      
      const response = await axios.get(`${this.apiBaseUrl}/${cleanUsername}`, {
        params: {
          access_token: this.accessToken,
          fields: 'id,name,followers_count,fan_count,picture'
        },
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching Facebook page:', error);
      throw new Error(`Failed to fetch Facebook page: ${error.message}`);
    }
  }

  /**
   * Get follower count for a page by username or ID
   * @param usernameOrId Facebook page username or ID
   * @returns Number of followers
   */
  async getFollowerCount(usernameOrId: string): Promise<number> {
    try {
      const pageData = await this.getPageByUsername(usernameOrId);
      
      // Facebook provides both followers_count (followers) and fan_count (likes)
      // We'll use followers_count as it's more relevant for tracking
      return pageData.followers_count || 0;
    } catch (error) {
      console.error('Error fetching Facebook follower count:', error);
      throw new Error(`Failed to fetch Facebook follower count: ${error.message}`);
    }
  }

  /**
   * Validate Facebook API credentials
   * @returns True if credentials are valid
   */
  async validateCredentials(): Promise<boolean> {
    try {
      // Make a simple request to verify credentials
      // We'll try to get app information using the app access token
      const appAccessToken = `${this.appId}|${this.appSecret}`;
      
      await axios.get(`${this.apiBaseUrl}/${this.appId}`, {
        params: {
          access_token: appAccessToken,
          fields: 'id,name'
        },
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      return true;
    } catch (error) {
      console.error('Facebook API credentials validation failed:', error);
      return false;
    }
  }

  /**
   * Extract username or ID from Facebook URL
   * @param url Facebook page URL
   * @returns Username or ID
   */
  static extractUsernameFromUrl(url: string): string | null {
    if (!url) return null;
    
    // Handle different Facebook URL formats
    // facebook.com/username
    // facebook.com/pages/pagename/pageID
    // facebook.com/profile.php?id=pageID
    
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname.includes('facebook.com')) {
        // Case 1: facebook.com/username
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        if (pathParts.length > 0) {
          if (pathParts[0] === 'pages' && pathParts.length >= 2) {
            // Case 2: facebook.com/pages/pagename/pageID
            return pathParts[pathParts.length - 1];
          } else if (pathParts[0] === 'profile.php') {
            // Case 3: facebook.com/profile.php?id=pageID
            return urlObj.searchParams.get('id') || null;
          } else {
            // Case 1: facebook.com/username
            return pathParts[0];
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting Facebook username from URL:', error);
      return null;
    }
  }
}

/**
 * Create a Facebook API client instance
 * @returns Facebook API client or null if credentials are missing
 */
export function createFacebookApiClient(): FacebookApiClient | null {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  
  if (!appId || !appSecret || !accessToken) {
    console.warn('Facebook API credentials not found in environment variables');
    return null;
  }
  
  return new FacebookApiClient(appId, appSecret, accessToken);
}
