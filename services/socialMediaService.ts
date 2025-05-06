//services\socialMediaService.ts

// API service for social media account management and tracking
import axios from 'axios';
import { SocialMediaPlatform } from '@/models/socialMediaAccount';
import { SocialMediaAccountFormValues, UpdateSocialMediaAccountFormValues } from '@/lib/validations/social-media';

// Base API class for social media operations
class SocialMediaService {
  // Create a new social media account
  async createAccount(data: SocialMediaAccountFormValues) {
    try {
      const response = await axios.post('/api/social-media/accounts', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get all social media accounts
  async getAccounts() {
    try {
      const response = await axios.get('/api/social-media/accounts');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get a specific social media account by ID
  async getAccountById(id: string) {
    try {
      const response = await axios.get(`/api/social-media/accounts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update a social media account
  async updateAccount(id: string, data: UpdateSocialMediaAccountFormValues) {
    try {
      const response = await axios.patch(`/api/social-media/accounts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete a social media account
  async deleteAccount(id: string) {
    try {
      const response = await axios.delete(`/api/social-media/accounts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Manually trigger follower count update for a specific account
  async updateFollowerCount(id: string) {
    try {
      const response = await axios.post(`/api/social-media/accounts/${id}/update-followers`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get follower history for a specific account
  async getFollowerHistory(id: string, days: number = 30) {
    try {
      const response = await axios.get(`/api/social-media/accounts/${id}/history?days=${days}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update all accounts' follower counts
  async updateAllFollowerCounts() {
    try {
      const response = await axios.post('/api/social-media/accounts/update-all');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const socialMediaService = new SocialMediaService();
