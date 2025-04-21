// Test utility for social media API implementations
import { createTwitterApiClient } from './twitter-api';
import { createFacebookApiClient } from './facebook-api';
import { createYouTubeApiClient } from './youtube-api';
import { createInstagramApiClient } from './instagram-api';
import { createTikTokApiClient } from './tiktok-api';
import { getTelegramFollowers } from './telegram-scraper';

/**
 * Test utility to validate API implementations
 * This is for development/testing purposes only
 */
export async function testSocialMediaApis() {
  console.log('=== Testing Social Media API Implementations ===');
  
  // Test Twitter API
  console.log('\n--- Testing Twitter API ---');
  const twitterClient = createTwitterApiClient();
  if (twitterClient) {
    try {
      const isValid = await twitterClient.validateCredentials();
      console.log(`Twitter API credentials valid: ${isValid}`);
      
      if (isValid) {
        // Test with a known account (Twitter's official account)
        const username = 'Twitter';
        console.log(`Fetching follower count for Twitter user: ${username}`);
        const followerCount = await twitterClient.getFollowerCount(username);
        console.log(`Twitter follower count: ${followerCount.toLocaleString()}`);
      }
    } catch (error) {
      console.error('Twitter API test failed:', error);
    }
  } else {
    console.log('Twitter API client could not be created. Check environment variables.');
  }
  
  // Test Facebook API
  console.log('\n--- Testing Facebook API ---');
  const facebookClient = createFacebookApiClient();
  if (facebookClient) {
    try {
      const isValid = await facebookClient.validateCredentials();
      console.log(`Facebook API credentials valid: ${isValid}`);
      
      if (isValid) {
        // Test with a known page (Facebook's official page)
        const pageId = 'facebook';
        console.log(`Fetching follower count for Facebook page: ${pageId}`);
        const followerCount = await facebookClient.getFollowerCount(pageId);
        console.log(`Facebook follower count: ${followerCount.toLocaleString()}`);
      }
    } catch (error) {
      console.error('Facebook API test failed:', error);
    }
  } else {
    console.log('Facebook API client could not be created. Check environment variables.');
  }
  
  // Test YouTube API
  console.log('\n--- Testing YouTube API ---');
  const youtubeClient = createYouTubeApiClient();
  if (youtubeClient) {
    try {
      const isValid = await youtubeClient.validateCredentials();
      console.log(`YouTube API credentials valid: ${isValid}`);
      
      if (isValid) {
        // Test with a known channel (YouTube's official channel)
        const channelId = 'YouTube';
        console.log(`Fetching subscriber count for YouTube channel: ${channelId}`);
        const subscriberCount = await youtubeClient.getSubscriberCount(channelId);
        console.log(`YouTube subscriber count: ${subscriberCount.toLocaleString()}`);
      }
    } catch (error) {
      console.error('YouTube API test failed:', error);
    }
  } else {
    console.log('YouTube API client could not be created. Check environment variables.');
  }
  
  // Test Instagram API
  console.log('\n--- Testing Instagram API ---');
  const instagramClient = createInstagramApiClient();
  if (instagramClient) {
    try {
      const isValid = await instagramClient.validateCredentials();
      console.log(`Instagram API credentials valid: ${isValid}`);
      
      if (isValid) {
        // Test with a known account (Instagram's official account)
        const username = 'instagram';
        console.log(`Fetching follower count for Instagram account: ${username}`);
        const followerCount = await instagramClient.getFollowerCount(username);
        console.log(`Instagram follower count: ${followerCount.toLocaleString()}`);
      }
    } catch (error) {
      console.error('Instagram API test failed:', error);
    }
  } else {
    console.log('Instagram API client could not be created. Check environment variables.');
  }
  
  // Test TikTok API
  console.log('\n--- Testing TikTok API ---');
  const tiktokClient = createTikTokApiClient();
  if (tiktokClient) {
    try {
      const isValid = await tiktokClient.validateCredentials();
      console.log(`TikTok API credentials valid: ${isValid}`);
      
      if (isValid) {
        // Test with a known account (TikTok's official account)
        const username = 'tiktok';
        console.log(`Fetching follower count for TikTok account: ${username}`);
        const followerCount = await tiktokClient.getFollowerCount(username);
        console.log(`TikTok follower count: ${followerCount.toLocaleString()}`);
      }
    } catch (error) {
      console.error('TikTok API test failed:', error);
    }
  } else {
    console.log('TikTok API client could not be created. Check environment variables.');
  }
  
  // Test Telegram scraping
  console.log('\n--- Testing Telegram Scraping ---');
  try {
    // Test with a known channel (Telegram's official channel)
    const username = 'telegram';
    console.log(`Fetching follower count for Telegram channel: ${username}`);
    const followerCount = await getTelegramFollowers(username);
    console.log(`Telegram follower count: ${followerCount.toLocaleString()}`);
  } catch (error) {
    console.error('Telegram scraping test failed:', error);
  }
  
  console.log('\n=== Social Media API Testing Complete ===');
}
