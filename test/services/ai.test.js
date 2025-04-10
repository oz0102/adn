// test/services/ai.test.js
const { describe, it, expect, beforeEach, afterEach, jest } = require('@jest/globals');

// Mock the GoogleGenerativeAI
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          return {
            generateContent: jest.fn().mockResolvedValue({
              response: {
                text: () => JSON.stringify({
                  headline: "Test Headline",
                  description: "Test description",
                  bibleVerse: "John 3:16",
                  callToAction: "Join us today!"
                })
              }
            })
          };
        })
      };
    })
  };
});

// Import the service after mocking dependencies
const aiService = require('../../services/aiService');

describe('AI Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  it('should generate flyer content', async () => {
    const result = await aiService.generateFlyerContent({
      title: 'Sunday Service',
      date: '2025-04-15',
      time: '10:00 AM',
      location: 'Main Auditorium',
      description: 'Join us for our weekly Sunday service',
      speaker: 'Pastor John',
      theme: 'Faith and Hope'
    });
    
    expect(result).toHaveProperty('headline');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('bibleVerse');
    expect(result).toHaveProperty('callToAction');
  });

  it('should generate follow-up message', async () => {
    // Mock the generateContent to return a text response for follow-up
    require('@google/generative-ai')().getGenerativeModel().generateContent
      .mockResolvedValueOnce({
        response: {
          text: () => "We missed you at our Sunday Service. Hope to see you next time!"
        }
      });
      
    const result = await aiService.generateFollowUpMessage({
      memberName: 'John Doe',
      eventName: 'Sunday Service',
      eventDate: '2025-04-15',
      missedEvents: 2,
      lastAttendance: '2025-03-30',
      isNewAttendee: false
    });
    
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should generate spiritual growth recommendations', async () => {
    // Mock the generateContent to return a JSON response for recommendations
    require('@google/generative-ai')().getGenerativeModel().generateContent
      .mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify({
            bibleStudyTopics: ["Prayer", "Faith", "Discipleship"],
            recommendedResources: ["Book 1", "Book 2"],
            spiritualDiscipline: "Daily Prayer",
            encouragementVerse: "Philippians 4:13"
          })
        }
      });
      
    const result = await aiService.generateSpiritualGrowthRecommendations({
      memberName: 'John Doe',
      currentStage: 'New Convert',
      interests: ['Prayer', 'Worship'],
      completedTrainings: ['Discipleship Class 1']
    });
    
    expect(result).toHaveProperty('bibleStudyTopics');
    expect(result).toHaveProperty('recommendedResources');
    expect(result).toHaveProperty('spiritualDiscipline');
    expect(result).toHaveProperty('encouragementVerse');
  });

  it('should handle errors when generating content', async () => {
    // Mock the generateContent to reject
    require('@google/generative-ai')().getGenerativeModel().generateContent
      .mockRejectedValueOnce(new Error('Failed to generate content'));

    await expect(aiService.generateFlyerContent({
      title: 'Sunday Service',
      date: '2025-04-15',
      time: '10:00 AM',
      location: 'Main Auditorium',
      description: 'Join us for our weekly Sunday service'
    })).rejects.toThrow('Failed to generate content');
  });
});
