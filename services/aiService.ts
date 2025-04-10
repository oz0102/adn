import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const initGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    throw new Error('Gemini API key not configured');
  }
  
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Generates flyer content using Gemini AI
 * @param eventDetails Object containing event details
 * @returns Generated content for the flyer
 */
const generateFlyerContent = async (eventDetails: {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  speaker?: string;
  theme?: string;
}) => {
  try {
    const genAI = initGeminiAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const { title, date, time, location, description, speaker, theme } = eventDetails;
    
    let prompt = `Create compelling and engaging content for a church event flyer with the following details:
    
    Event Title: ${title}
    Date: ${date}
    Time: ${time}
    Location: ${location}
    Description: ${description}`;
    
    if (speaker) {
      prompt += `\nSpeaker: ${speaker}`;
    }
    
    if (theme) {
      prompt += `\nTheme: ${theme}`;
    }
    
    prompt += `\n\nPlease generate:
    1. A catchy headline (max 10 words)
    2. A brief but powerful description (50-70 words)
    3. A relevant Bible verse that matches the event theme
    4. A call-to-action phrase
    
    Format the response as JSON with the following structure:
    {
      "headline": "The catchy headline",
      "description": "The brief description",
      "bibleVerse": "The Bible verse with reference",
      "callToAction": "The call-to-action phrase"
    }`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to generate flyer content in the expected format');
  } catch (error) {
    console.error('Error generating flyer content:', error);
    throw error;
  }
};

/**
 * Generates follow-up message content using Gemini AI
 * @param details Object containing follow-up details
 * @returns Generated follow-up message
 */
const generateFollowUpMessage = async (details: {
  memberName: string;
  eventName: string;
  eventDate: string;
  missedEvents?: number;
  lastAttendance?: string;
  isNewAttendee?: boolean;
}) => {
  try {
    const genAI = initGeminiAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const { memberName, eventName, eventDate, missedEvents, lastAttendance, isNewAttendee } = details;
    
    let prompt = `Generate a warm, personalized follow-up message for a church member with the following details:
    
    Member Name: ${memberName}
    Event Name: ${eventName}
    Event Date: ${eventDate}`;
    
    if (isNewAttendee) {
      prompt += `\nThis person is a new attendee who visited for the first time.`;
    } else {
      prompt += `\nThis is an existing member who missed the event.`;
      
      if (missedEvents) {
        prompt += `\nNumber of Consecutive Missed Events: ${missedEvents}`;
      }
      
      if (lastAttendance) {
        prompt += `\nLast Attendance Date: ${lastAttendance}`;
      }
    }
    
    prompt += `\n\nThe message should be:
    1. Warm and caring, not accusatory
    2. Express that they were missed (for existing members) or that we enjoyed having them (for new attendees)
    3. Invite them to the next event or service
    4. Be brief (100-150 words)
    5. End with an encouraging note
    
    Please provide only the message text without any additional formatting or explanation.`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating follow-up message:', error);
    throw error;
  }
};

/**
 * Generates spiritual growth recommendations using Gemini AI
 * @param details Object containing member details
 * @returns Generated spiritual growth recommendations
 */
const generateSpiritualGrowthRecommendations = async (details: {
  memberName: string;
  currentStage: string;
  interests?: string[];
  completedTrainings?: string[];
}) => {
  try {
    const genAI = initGeminiAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const { memberName, currentStage, interests, completedTrainings } = details;
    
    let prompt = `Generate personalized spiritual growth recommendations for a church member with the following details:
    
    Member Name: ${memberName}
    Current Spiritual Growth Stage: ${currentStage}`;
    
    if (interests && interests.length > 0) {
      prompt += `\nInterests: ${interests.join(', ')}`;
    }
    
    if (completedTrainings && completedTrainings.length > 0) {
      prompt += `\nCompleted Trainings: ${completedTrainings.join(', ')}`;
    }
    
    prompt += `\n\nPlease provide:
    1. Three specific Bible study topics appropriate for their current stage
    2. Two recommended books or resources
    3. One practical spiritual discipline to develop
    4. A relevant Bible verse for encouragement
    
    Format the response as JSON with the following structure:
    {
      "bibleStudyTopics": ["Topic 1", "Topic 2", "Topic 3"],
      "recommendedResources": ["Resource 1", "Resource 2"],
      "spiritualDiscipline": "The recommended spiritual discipline",
      "encouragementVerse": "The Bible verse with reference"
    }`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to generate recommendations in the expected format');
  } catch (error) {
    console.error('Error generating spiritual growth recommendations:', error);
    throw error;
  }
};

export {
  generateFlyerContent,
  generateFollowUpMessage,
  generateSpiritualGrowthRecommendations
};
