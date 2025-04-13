// app/(dashboard)/members/spiritual-growth-service.ts
import { generateSpiritualGrowthRecommendations } from "@/services/aiService";

export interface SpiritualGrowthUpdateRequest {
  memberId: string;
  memberName: string;
  currentStage: string;
  newStage: string;
  date: string;
  notes?: string;
}

export interface SpiritualGrowthRecommendationRequest {
  memberId: string;
  memberName: string;
  currentStage: string;
  interests?: string[];
  completedTrainings?: string[];
}

/**
 * Updates a member's spiritual growth stage
 * @param request The spiritual growth update request
 * @returns The updated spiritual growth data
 */
export async function updateSpiritualGrowthStage(request: SpiritualGrowthUpdateRequest) {
  const { memberId, memberName, currentStage, newStage, date, notes } = request;
  
  try {
    // In a real implementation, this would update the database
    // For now, we'll just return the data as if it was updated
    return {
      success: true,
      memberId,
      memberName,
      previousStage: currentStage,
      currentStage: newStage,
      date,
      notes,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error updating spiritual growth stage:", error);
    return {
      success: false,
      error: "Failed to update spiritual growth stage",
      details: error
    };
  }
}

/**
 * Generates spiritual growth recommendations for a member using AI
 * @param request The spiritual growth recommendation request
 * @returns Generated recommendations
 */
export async function getSpiritualGrowthRecommendations(request: SpiritualGrowthRecommendationRequest) {
  const { memberId, memberName, currentStage, interests, completedTrainings } = request;
  
  try {
    // Generate recommendations using AI service
    const recommendations = await generateSpiritualGrowthRecommendations({
      memberName,
      currentStage,
      interests,
      completedTrainings
    });
    
    return {
      success: true,
      memberId,
      memberName,
      currentStage,
      recommendations,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error generating spiritual growth recommendations:", error);
    return {
      success: false,
      error: "Failed to generate spiritual growth recommendations",
      details: error
    };
  }
}
