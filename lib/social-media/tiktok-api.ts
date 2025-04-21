// TikTok API implementation for follower count tracking
import axios from 'axios';
import crypto from 'crypto';

/**
 * TikTok API client for fetching follower counts
 * Based on TikTok for Business API documentation
 * https://developers.tiktok.com/doc/business-api-overview
 */
export class TikTokApiClient {
  private apiKey: string;
  private apiSecret: string;
  private accessToken: string | null;
  private apiBaseUrl = 'https://business-api.tiktok.com/open_api/v1.3';
  private userAgent = 'Social-Media-Tracker/1.0';

  /**
   * Initialize the TikTok API client
   * @param apiKey TikTok App ID/Key
   * @param apiSecret TikTok App Secret
   * @param accessToken TikTok Access Token (optional)
   */
  constructor(apiKey: string, apiSecret: string, accessToken: string | null = null) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.accessToken = accessToken;
  }

  /**
   * Generate signature for TikTok API requests
   * @param timestamp Current timestamp in seconds
   * @param httpMethod HTTP method (GET, POST, etc.)
   * @param apiPath API path without base URL
   * @param queryParams Query parameters as object
   * @returns Signature for the request
   */
  private generateSignature(
    timestamp: number,
    httpMethod: string,
    apiPath: string,
    queryParams: Record<string, any> = {}
  ): string {
    // Convert query params to string
    const queryString = Object.keys(queryParams)
      .sort()
      .map(key => `${key}=${queryParams[key]}`)
      .join('&');
    
    // Create string to sign
    const stringToSign = [
      httpMethod,
      apiPath,
      queryString,
      timestamp,
      this.accessToken || '',
      this.apiKey
    ].join('');
    
    // Generate HMAC-SHA256 signature
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(stringToSign)
      .digest('hex');
    
    return signature;
  }

  /**
   * Get TikTok user information by username
   * @param username TikTok username (without @ symbol)
   * @returns User data including follower count
   */
  async getUserByUsername(username: string) {
    try {
      // Clean the username (remove @ if present)
      const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
      
      // TikTok Business API doesn't provide a direct way to get user info by username
      // We need to use the Creator Marketplace API which requires special permissions
      // This is a simplified implementation that would need to be adapted based on
      // the specific permissions and endpoints available to your app
      
      const timestamp = Math.floor(Date.now() / 1000);
      const apiPath = '/business/creator/info/';
      const queryParams = {
        app_id: this.apiKey,
        timestamp,
        access_token: this.accessToken || '',
        username: cleanUsername
      };
      
      const signature = this.generateSignature(timestamp, 'GET', apiPath, queryParams);
      
      const response = await axios.get(`${this.apiBaseUrl}${apiPath}`, {
        params: {
          ...queryParams,
          signature
        },
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      if (response.data && response.data.data && response.data.data.creator_info) {
        return response.data.data.creator_info;
      }
      
      throw new Error(`User not found for username: ${username}`);
    } catch (error) {
      console.error('Error fetching TikTok user:', error);
      throw new Error(`Failed to fetch TikTok user: ${error.message}`);
    }
  }

  /**
   * Get follower count for a TikTok user by username
   * @param username TikTok username (without @ symbol)
   * @returns Number of followers
   */
  async getFollowerCount(username: string): Promise<number> {
    try {
      const userData = await this.getUserByUsername(username);
      return userData.follower_count || 0;
    } catch (error) {
      console.error('Error fetching TikTok follower count:', error);
      throw new Error(`Failed to fetch TikTok follower count: ${error.message}`);
    }
  }

  /**
   * Validate TikTok API credentials
   * @returns True if credentials are valid
   */
  async validateCredentials(): Promise<boolean> {
    try {
      // Make a simple request to verify credentials
      const timestamp = Math.floor(Date.now() / 1000);
      const apiPath = '/oauth2/app_info/';
      const queryParams = {
        app_id: this.apiKey,
        timestamp
      };
      
      const signature = this.generateSignature(timestamp, 'GET', apiPath, queryParams);
      
      await axios.get(`${this.apiBaseUrl}${apiPath}`, {
        params: {
          ...queryParams,
          signature
        },
        headers: {
          'User-Agent': this.userAgent
        }
      });
      
      return true;
    } catch (error) {
      console.error('TikTok API credentials validation failed:', error);
      return false;
    }
  }

  /**
   * Extract username from TikTok URL
   * @param url TikTok profile URL
   * @returns Username
   */
  static extractUsernameFromUrl(url: string): string | null {
    if (!url) return null;
    
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname.includes('tiktok.com')) {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        if (pathParts.length > 0) {
          // Handle @username format
          if (pathParts[0].startsWith('@')) {
            return pathParts[0];
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting TikTok username from URL:', error);
      return null;
    }
  }
}

/**
 * Create a TikTok API client instance
 * @returns TikTok API client or null if credentials are missing
 */
export function createTikTokApiClient(): TikTokApiClient | null {
  const apiKey = process.env.TIKTOK_API_KEY;
  const apiSecret = process.env.TIKTOK_API_SECRET;
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN || null;
  
  if (!apiKey || !apiSecret) {
    console.warn('TikTok API credentials not found in environment variables');
    return null;
  }
  
  return new TikTokApiClient(apiKey, apiSecret, accessToken);
}
