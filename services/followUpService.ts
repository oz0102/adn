// services/followUpService.ts
import mongoose from 'mongoose';
import FollowUp, { IFollowUp, IFollowUpAttempt } from '@/models/followUp';
import User from '@/models/user';
import Member from '@/models/member';
import Cluster from '@/models/cluster';
import { sendFollowUpEmail } from '@/services/emailService';
import { sendFollowUpSMS } from '@/services/smsService';
import { sendFollowUpWhatsApp } from '@/services/whatsappService';
import { generateFollowUpMessage } from '@/services/aiService';
import { addNotification } from '@/services/notificationService';

interface FollowUpConfig {
  type: 'New Convert' | 'New Attendee' | 'Member';
  requiredAttempts: number;
  frequency: string;
  durationInDays: number;
}

// Default follow-up configurations
const followUpConfigurations: FollowUpConfig[] = [
  {
    type: 'New Convert',
    requiredAttempts: 8,
    frequency: '2/week', 
    durationInDays: 28 // 4 weeks
  },
  {
    type: 'New Attendee',
    requiredAttempts: 4,
    frequency: '1/week',
    durationInDays: 28 // 4 weeks
  },
  {
    type: 'Member',
    requiredAttempts: 2,
    frequency: '1/week',
    durationInDays: 14 // 2 weeks
  }
];

/**
 * Get follow-up configuration for a specific person type
 */
export function getFollowUpConfig(personType: string): FollowUpConfig {
  const config = followUpConfigurations.find(c => c.type === personType);
  return config || followUpConfigurations[0]; // Default to New Convert config
}

/**
 * Calculate next follow-up date based on frequency and response category
 */
export function calculateNextFollowUpDate(
  frequency: string,
  responseCategory: string,
  lastAttemptDate?: Date
): Date {
  const now = new Date();
  const baseDate = lastAttemptDate || now;
  let daysToAdd = 7; // Default to weekly
  
  // Adjust based on frequency
  if (frequency === '2/week') {
    daysToAdd = 3;
  } else if (frequency === '3/week') {
    daysToAdd = 2;
  }
  
  // Adjust based on response category
  if (responseCategory === 'Promising') {
    // More frequent follow-up for promising leads
    daysToAdd = Math.max(1, daysToAdd - 1);
  } else if (responseCategory === 'Cold') {
    // Less frequent follow-up for cold leads
    daysToAdd = daysToAdd + 2;
  }
  
  const nextDate = new Date(baseDate);
  nextDate.setDate(baseDate.getDate() + daysToAdd);
  
  return nextDate;
}

/**
 * Determine response category based on the follow-up attempt
 */
export function determineResponseCategory(
  contactResponse: string,
  notes: string
): 'Promising' | 'Undecided' | 'Cold' {
  if (contactResponse === 'Positive') {
    return 'Promising';
  } else if (contactResponse === 'Negative') {
    return 'Cold';
  } else {
    // Analyze notes for sentiment if available
    if (notes) {
      const lowerNotes = notes.toLowerCase();
      
      // Simple rule-based categorization - could use more sophisticated sentiment analysis
      if (lowerNotes.includes('interested') || 
          lowerNotes.includes('will attend') || 
          lowerNotes.includes('positive')) {
        return 'Promising';
      } else if (lowerNotes.includes('not interested') || 
                lowerNotes.includes('do not call') || 
                lowerNotes.includes('declined')) {
        return 'Cold';
      }
    }
    
    return 'Undecided';
  }
}

/**
 * Update follow-up status based on attempts and response
 */
export function determineFollowUpStatus(
  followUp: IFollowUp,
  newAttempt: IFollowUpAttempt,
  responseCategory: string
): string {
  // If the response is explicitly negative (Cold)
  if (responseCategory === 'Cold') {
    return 'Failed';
  }
  
  // If the response is very positive and they've made a commitment
  if (responseCategory === 'Promising' && 
      newAttempt.notes?.toLowerCase().includes('joined') || 
      newAttempt.notes?.toLowerCase().includes('attended')) {
    return 'Completed';
  }
  
  // If we've reached the required number of attempts
  const totalAttempts = followUp.attempts.length + 1; // Include the new attempt
  if (totalAttempts >= followUp.requiredAttempts) {
    return responseCategory === 'Promising' ? 'Completed' : 'Failed';
  }
  
  // Otherwise, continue with follow-up
  return 'In Progress';
}

/**
 * Create a new follow-up
 */
export async function createFollowUp(data: any): Promise<IFollowUp> {
  try {
    // Get the configuration for this follow-up type
    const config = getFollowUpConfig(data.personType);
    
    // Set end date for follow-up schedule
    const scheduleEndDate = new Date();
    scheduleEndDate.setDate(scheduleEndDate.getDate() + config.durationInDays);
    
    // Set next follow-up date
    const nextFollowUpDate = calculateNextFollowUpDate(config.frequency, 'Undecided');
    
    // Create the follow-up record
    const followUp = new FollowUp({
      ...data,
      requiredAttempts: config.requiredAttempts,
      frequency: config.frequency,
      status: 'Pending',
      responseCategory: 'Undecided',
      nextFollowUpDate,
      scheduleEndDate
    });
    
    await followUp.save();
    
    // Notify the assigned user
    await addNotification({
      type: 'Follow-up',
      title: 'New Follow-up Assigned',
      message: `A new follow-up has been assigned to you for ${data.personType === 'New Attendee' ? 
        data.newAttendee?.firstName + ' ' + data.newAttendee?.lastName : 
        'a member'}.`,
      userId: data.assignedTo,
      linkUrl: `/dashboard/follow-ups/${followUp._id}`,
    });
    
    return followUp;
  } catch (error) {
    console.error('Error creating follow-up:', error);
    throw error;
  }
}

/**
 * Add a follow-up attempt
 */
export async function addFollowUpAttempt(
  followUpId: string, 
  attemptData: any,
  userId: string
): Promise<IFollowUp> {
  try {
    // Get the follow-up record
    const followUp = await FollowUp.findById(followUpId);
    
    if (!followUp) {
      throw new Error('Follow-up not found');
    }
    
    // Create the new attempt
    const attemptNumber = followUp.attempts.length + 1;
    const newAttempt: IFollowUpAttempt = {
      ...attemptData,
      attemptNumber,
      conductedBy: new mongoose.Types.ObjectId(userId),
      date: new Date()
    };
    
    // Determine response category based on the attempt
    const responseCategory = determineResponseCategory(
      newAttempt.response,
      newAttempt.notes || ''
    );
    
    // Determine new status
    const newStatus = determineFollowUpStatus(followUp, newAttempt, responseCategory);
    
    // Calculate next follow-up date if not completed/failed
    let nextFollowUpDate = undefined;
    if (newStatus === 'Pending' || newStatus === 'In Progress') {
      nextFollowUpDate = calculateNextFollowUpDate(
        followUp.frequency,
        responseCategory,
        new Date()
      );
    }
    
    // Extract any prayer requests from notes
    const prayerRequests = newAttempt.prayerRequests || [];
    
    // Update the follow-up
    followUp.attempts.push(newAttempt);
    followUp.status = newStatus;
    followUp.responseCategory = responseCategory;
    followUp.nextFollowUpDate = nextFollowUpDate;
    
    // Add any new prayer requests
    if (prayerRequests.length > 0) {
      followUp.prayerRequests = [...(followUp.prayerRequests || []), ...prayerRequests];
    }
    
    await followUp.save();
    
    // If prayer requests were added, notify prayer team
    if (prayerRequests.length > 0) {
      // Get prayer team members (assuming they have a specific role)
      const prayerTeam = await User.find({ role: 'PrayerTeam' }).select('_id');
      
      // Create notifications for prayer team
      for (const member of prayerTeam) {
        await addNotification({
          type: 'Prayer',
          title: 'New Prayer Request',
          message: `New prayer request from follow-up: ${prayerRequests.join(', ')}`,
          userId: member._id,
          linkUrl: `/dashboard/prayers`,
        });
      }
    }
    
    // If status changed to Completed, check if person should be handed off to a cluster
    if (newStatus === 'Completed' && responseCategory === 'Promising') {
      // Could trigger a workflow to assign to cluster
      // This would be implemented based on your specific cluster assignment logic
    }
    
    return followUp;
  } catch (error) {
    console.error('Error adding follow-up attempt:', error);
    throw error;
  }
}

/**
 * Hand off a contact to a cluster
 */
export async function handoffToCluster(
  followUpId: string,
  clusterId: string,
  notes: string,
  userId: string
): Promise<IFollowUp> {
  try {
    // Get the follow-up record
    const followUp = await FollowUp.findById(followUpId);
    
    if (!followUp) {
      throw new Error('Follow-up not found');
    }
    
    // Get the cluster
    const cluster = await Cluster.findById(clusterId);
    
    if (!cluster) {
      throw new Error('Cluster not found');
    }
    
    // Get the cluster lead
    const clusterLead = cluster.leaderId;
    
    // Update the follow-up
    followUp.handedOffToCluster = {
      clusterId: new mongoose.Types.ObjectId(clusterId),
      clusterLeadId: clusterLead,
      handoffDate: new Date(),
      notes
    };
    
    // If this was a new attendee, create a member record
    if (followUp.personType === 'New Attendee' && followUp.newAttendee) {
      // Check if member already exists
      const existingMember = await Member.findOne({ 
        phoneNumber: followUp.newAttendee.phoneNumber 
      });
      
      if (!existingMember) {
        // Create new member
        const member = new Member({
          firstName: followUp.newAttendee.firstName,
          lastName: followUp.newAttendee.lastName,
          email: followUp.newAttendee.email,
          phoneNumber: followUp.newAttendee.phoneNumber,
          whatsappNumber: followUp.newAttendee.whatsappNumber,
          address: followUp.newAttendee.address,
          gender: 'Unknown', // You might want to collect this during follow-up
          clusterId: clusterId,
          createdBy: userId,
          lastUpdatedBy: userId
        });
        
        await member.save();
        
        // Link the member to the follow-up
        followUp.personId = member._id;
      } else {
        // Update existing member's cluster if needed
        if (!existingMember.clusterId) {
          existingMember.clusterId = new mongoose.Types.ObjectId(clusterId);
          existingMember.lastUpdatedBy = new mongoose.Types.ObjectId(userId);
          await existingMember.save();
        }
        
        followUp.personId = existingMember._id;
      }
    }
    
    // Mark as completed if not already
    if (followUp.status !== 'Completed') {
      followUp.status = 'Completed';
    }
    
    await followUp.save();
    
    // Notify the cluster lead
    await addNotification({
      type: 'Cluster',
      title: 'New Member Assigned',
      message: `A new member has been assigned to your cluster from the follow-up system.`,
      userId: clusterLead,
      linkUrl: `/dashboard/clusters/${clusterId}/members`,
    });
    
    return followUp;
  } catch (error) {
    console.error('Error handing off to cluster:', error);
    throw error;
  }
}

/**
 * Get follow-ups that are due
 */
export async function getDueFollowUps(): Promise<IFollowUp[]> {
  try {
    const now = new Date();
    
    // Find all follow-ups that are due for follow-up
    const followUps = await FollowUp.find({
      status: { $in: ['Pending', 'In Progress'] },
      nextFollowUpDate: { $lte: now }
    }).populate('assignedTo', 'email').sort('nextFollowUpDate');
    
    return followUps;
  } catch (error) {
    console.error('Error getting due follow-ups:', error);
    throw error;
  }
}

/**
 * Send a follow-up message through specified channels
 */
export async function sendFollowUpMessage(
  followUpId: string,
  message: string,
  channels: ('email' | 'sms' | 'whatsapp')[],
  useAiGenerated: boolean = false
): Promise<any> {
  try {
    // Get the follow-up record
    const followUp = await FollowUp.findById(followUpId)
      .populate('personId', 'firstName lastName email phoneNumber whatsappNumber');
    
    if (!followUp) {
      throw new Error('Follow-up not found');
    }
    
    // Get the person details
    const personName = followUp.personId ? 
      `${followUp.personId.firstName} ${followUp.personId.lastName}` : 
      followUp.newAttendee ? 
        `${followUp.newAttendee.firstName} ${followUp.newAttendee.lastName}` : 
        'Friend';
    
    const email = followUp.personId?.email || followUp.newAttendee?.email;
    const phoneNumber = followUp.personId?.phoneNumber || followUp.newAttendee?.phoneNumber;
    const whatsappNumber = followUp.personId?.whatsappNumber || followUp.newAttendee?.whatsappNumber;
    
    // Generate AI message if requested and no custom message
    let finalMessage = message;
    if (useAiGenerated && !message) {
      try {
        // Use event details if available
        const eventName = followUp.missedEvent ? 
          followUp.missedEvent.eventType : 
          'our service';
        
        const eventDate = followUp.missedEvent ? 
          followUp.missedEvent.eventDate.toISOString().split('T')[0] : 
          'recently';
        
        finalMessage = await generateFollowUpMessage({
          memberName: personName,
          eventName,
          eventDate,
          isNewAttendee: followUp.personType === 'New Attendee'
        });
      } catch (error) {
        console.error('Error generating AI message:', error);
        // Fall back to default message
        finalMessage = followUp.personType === 'New Attendee' ? 
          `Thank you for visiting our church. We hope to see you again soon!` : 
          `We missed you at our recent service. Hope to see you next time!`;
      }
    }
    
    // Send messages through selected channels
    const results = {
      email: false,
      sms: false,
      whatsapp: false
    };
    
    if (channels.includes('email') && email) {
      try {
        await sendFollowUpEmail(email, personName, 'Follow-up', finalMessage);
        results.email = true;
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
    
    if (channels.includes('sms') && phoneNumber) {
      try {
        await sendFollowUpSMS(phoneNumber, personName, finalMessage);
        results.sms = true;
      } catch (error) {
        console.error('Error sending SMS:', error);
      }
    }
    
    if (channels.includes('whatsapp') && whatsappNumber) {
      try {
        await sendFollowUpWhatsApp(whatsappNumber, personName, finalMessage);
        results.whatsapp = true;
      } catch (error) {
        console.error('Error sending WhatsApp:', error);
      }
    }
    
    return {
      success: Object.values(results).some(Boolean),
      message: finalMessage,
      results
    };
  } catch (error) {
    console.error('Error sending follow-up message:', error);
    throw error;
  }
}