// services/followUpService.ts
import mongoose from "mongoose";
import FollowUp, { IFollowUp, IFollowUpAttempt } from "@/models/followUp";
import User from "@/models/user";
import Member from "@/models/member";
import Attendee from '@/models/attendee'; // Import Attendee model
import Cluster from "@/models/cluster";
import { sendFollowUpEmail } from "@/services/emailService";
import { sendFollowUpSMS } from "@/services/smsService";
import { sendFollowUpWhatsApp } from "@/services/whatsappService";
import { generateFollowUpMessage } from "@/services/aiService";
import { notificationService } from "@/services/notificationService"; // Corrected import
import { connectToDB } from "@/lib/mongodb"; // Added connectToDB import

interface FollowUpConfig {
  type: "New Convert" | "Attendee" | "Member" | "Unregistered Guest";
  requiredAttempts: number;
  frequency: string;
  durationInDays: number;
}

const followUpConfigurations: FollowUpConfig[] = [
  {
    type: "New Convert",
    requiredAttempts: 8,
    frequency: "2/week", 
    durationInDays: 28 
  },
  {
    type: "Attendee", // Changed from New Attendee
    requiredAttempts: 4,
    frequency: "1/week",
    durationInDays: 28
  },
  {
    type: "Member",
    requiredAttempts: 2,
    frequency: "1/week",
    durationInDays: 14
  }
];

export function getFollowUpConfig(personType: string): FollowUpConfig {
  const config = followUpConfigurations.find(c => c.type === personType);
  return config || followUpConfigurations[0]; 
}

export function calculateNextFollowUpDate(
  frequency: string,
  responseCategory: string,
  lastAttemptDate?: Date
): Date {
  const now = new Date();
  const baseDate = lastAttemptDate || now;
  let daysToAdd = 7; 
  
  if (frequency === "2/week") {
    daysToAdd = 3;
  } else if (frequency === "3/week") {
    daysToAdd = 2;
  }
  
  if (responseCategory === "Promising") {
    daysToAdd = Math.max(1, daysToAdd - 1);
  } else if (responseCategory === "Cold") {
    daysToAdd = daysToAdd + 2;
  }
  
  const nextDate = new Date(baseDate);
  nextDate.setDate(baseDate.getDate() + daysToAdd);
  
  return nextDate;
}

export function determineResponseCategory(
  contactResponse: string,
  notes: string
): "Promising" | "Undecided" | "Cold" {
  if (contactResponse === "Positive") {
    return "Promising";
  } else if (contactResponse === "Negative") {
    return "Cold";
  } else {
    if (notes) {
      const lowerNotes = notes.toLowerCase();
      if (lowerNotes.includes("interested") || 
          lowerNotes.includes("will attend") || 
          lowerNotes.includes("positive")) {
        return "Promising";
      } else if (lowerNotes.includes("not interested") || 
                lowerNotes.includes("do not call") || 
                lowerNotes.includes("declined")) {
        return "Cold";
      }
    }
    return "Undecided";
  }
}

export function determineFollowUpStatus(
  followUp: IFollowUp,
  newAttempt: IFollowUpAttempt,
  responseCategory: string
): string {
  if (responseCategory === "Cold") {
    return "Failed";
  }
  
  if (responseCategory === "Promising" && 
      (newAttempt.notes?.toLowerCase().includes("joined") || 
      newAttempt.notes?.toLowerCase().includes("attended"))) {
    return "Completed";
  }
  
  const totalAttempts = followUp.attempts.length + 1; 
  if (totalAttempts >= followUp.requiredAttempts) {
    return responseCategory === "Promising" ? "Completed" : "Failed";
  }
  
  return "In Progress";
}

async function createFollowUp(data: any): Promise<IFollowUp> {
  try {
    await connectToDB(); // Added connectToDB call

    let followUpData = { ...data };
    let notificationPersonName = "a member";

    if (data.personType === 'Unregistered Guest' && data.newAttendee) {
      const newAttendee = new Attendee({
        firstName: data.newAttendee.firstName,
        lastName: data.newAttendee.lastName,
        email: data.newAttendee.email,
        phoneNumber: data.newAttendee.phoneNumber,
        whatsappNumber: data.newAttendee.whatsappNumber,
        address_street: data.newAttendee.address, // Assuming address is street for now
        // Populate other address fields if available in data.newAttendee
        centerId: data.centerId || data.newAttendee.centerId, // Ensure centerId is passed
        createdBy: data.createdBy,
        // firstAttendanceDate and lastAttendanceDate will default to Date.now in Attendee model
      });
      await newAttendee.save();

      followUpData.attendeeId = newAttendee._id;
      followUpData.personType = 'Attendee'; // Convert to Attendee type for follow-up
      notificationPersonName = `${data.newAttendee.firstName} ${data.newAttendee.lastName}`;
      delete followUpData.newAttendee; // Remove newAttendee to avoid duplication
    } else if (data.personType === 'Attendee' && data.attendeeId) {
      // Ensure attendeeId is passed if personType is Attendee
      // Fetch attendee for notification name if newAttendee details aren't available
      const existingAttendee = await Attendee.findById(data.attendeeId).select("firstName lastName").lean();
      if (existingAttendee) {
        notificationPersonName = `${existingAttendee.firstName} ${existingAttendee.lastName}`;
      } else {
        notificationPersonName = "an attendee";
      }
    } else if (data.personType === 'Member' && data.personId) {
        const member = await Member.findById(data.personId).select("firstName lastName").lean();
        if (member) {
            notificationPersonName = `${member.firstName} ${member.lastName}`;
        }
    }


    const config = getFollowUpConfig(followUpData.personType); // Use potentially modified personType
    const scheduleEndDate = new Date();
    scheduleEndDate.setDate(scheduleEndDate.getDate() + config.durationInDays);
    const nextFollowUpDate = calculateNextFollowUpDate(config.frequency, "Undecided");
    
    const followUp = new FollowUp({
      ...followUpData,
      requiredAttempts: config.requiredAttempts,
      frequency: config.frequency,
      status: "Pending",
      responseCategory: "Undecided",
      nextFollowUpDate,
      scheduleEndDate
    });
    
    await followUp.save();
    
    await notificationService.addNotification({
      type: "Follow-up",
      subject: "New Follow-up Assigned",
      content: `A new follow-up has been assigned to you for ${notificationPersonName}.`,
      targetLevel: "USER",
      recipient: { memberId: data.assignedTo },
      targetId: data.assignedTo,
      relatedTo: { type: "FollowUp", id: followUp._id },
      createdBy: data.createdBy || new mongoose.Types.ObjectId()
    });
    
    return followUp;
  } catch (error) {
    console.error("Error creating follow-up:", error);
    throw error;
  }
}

async function addFollowUpAttempt(
  followUpId: string, 
  attemptData: any,
  userId: string
): Promise<IFollowUp> {
  try {
    await connectToDB(); // Added connectToDB call
    const followUp = await FollowUp.findById(followUpId);
    
    if (!followUp) {
      throw new Error("Follow-up not found");
    }
    
    const attemptNumber = followUp.attempts.length + 1;
    const newAttempt: IFollowUpAttempt = {
      ...attemptData,
      attemptNumber,
      conductedBy: new mongoose.Types.ObjectId(userId),
      date: new Date()
    };
    
    const responseCategory = determineResponseCategory(
      newAttempt.response,
      newAttempt.notes || ""
    );
    const newStatus = determineFollowUpStatus(followUp, newAttempt, responseCategory);
    let nextFollowUpDate = undefined;
    if (newStatus === "Pending" || newStatus === "In Progress") {
      nextFollowUpDate = calculateNextFollowUpDate(
        followUp.frequency,
        responseCategory,
        new Date()
      );
    }
    
    const prayerRequests = newAttempt.prayerRequests || [];
    followUp.attempts.push(newAttempt);
    followUp.status = newStatus;
    followUp.responseCategory = responseCategory;
    followUp.nextFollowUpDate = nextFollowUpDate;
    
    if (prayerRequests.length > 0) {
      followUp.prayerRequests = [...(followUp.prayerRequests || []), ...prayerRequests];
    }
    
    await followUp.save();
    
    if (prayerRequests.length > 0) {
      const prayerTeam = await User.find({ role: "PrayerTeam" }).select("_id");
      for (const member of prayerTeam) {
        await notificationService.addNotification({ // Corrected usage
          type: "Prayer",
          subject: "New Prayer Request", // Added subject
          content: `New prayer request from follow-up: ${prayerRequests.join(", ")}`,
          targetLevel: "USER", // Assuming USER level for direct assignment
          recipient: { memberId: member._id }, // Assuming member._id is a valid memberId
          targetId: member._id, // Target is the prayer team member
          relatedTo: { type: "FollowUp", id: followUp._id },
          createdBy: new mongoose.Types.ObjectId(userId) // Assuming userId is the conductor
        });
      }
    }
    
    return followUp;
  } catch (error) {
    console.error("Error adding follow-up attempt:", error);
    throw error;
  }
}

async function handoffToCluster(
  followUpId: string,
  clusterId: string,
  notes: string,
  userId: string
): Promise<IFollowUp> {
  try {
    await connectToDB(); // Added connectToDB call
    const followUp = await FollowUp.findById(followUpId);
    if (!followUp) throw new Error("Follow-up not found");
    
    const cluster = await Cluster.findById(clusterId);
    if (!cluster) throw new Error("Cluster not found");
    
    const clusterLead = cluster.leaderId;
    followUp.handedOffToCluster = {
      clusterId: new mongoose.Types.ObjectId(clusterId),
      clusterLeadId: clusterLead,
      handoffDate: new Date(),
      notes
    };
    
    if ((followUp.personType === "Attendee" && followUp.attendeeId) || (followUp.personType === "Unregistered Guest" && followUp.newAttendee)) {
      let personDetails;
      if (followUp.personType === "Attendee" && followUp.attendeeId) {
        personDetails = await Attendee.findById(followUp.attendeeId).lean();
      } else { // Unregistered Guest
        personDetails = followUp.newAttendee;
      }

      if (personDetails) {
        const existingMember = await Member.findOne({ phoneNumber: personDetails.phoneNumber });
        if (!existingMember) {
          const member = new Member({
            firstName: personDetails.firstName,
            lastName: personDetails.lastName,
            email: personDetails.email,
            phoneNumber: personDetails.phoneNumber,
            whatsappNumber: personDetails.whatsappNumber,
            address_street: personDetails.address, // Assuming address is street for now
            // Add other address fields if available
            gender: "Unknown", // Default or try to infer
            clusterId: clusterId,
            centerId: cluster.centerId, // Assign to cluster's center
            createdBy: userId,
            lastUpdatedBy: userId
          });
          await member.save();
          followUp.personId = member._id;
          followUp.personType = "Member"; // Update personType after conversion
        } else {
          if (!existingMember.clusterId) {
            existingMember.clusterId = new mongoose.Types.ObjectId(clusterId);
          }
          if (!existingMember.centerId) { // Also assign to cluster's center if not already set
            existingMember.centerId = cluster.centerId;
          }
          existingMember.lastUpdatedBy = new mongoose.Types.ObjectId(userId);
          await existingMember.save();
          followUp.personId = existingMember._id;
          followUp.personType = "Member"; // Update personType after conversion
        }
        // If it was an 'Unregistered Guest' with newAttendee data, clear it after conversion
        if (followUp.personType === "Unregistered Guest") {
             followUp.newAttendee = undefined;
        }
      }
    }
    
    if (followUp.status !== "Completed") {
      followUp.status = "Completed";
    }
    await followUp.save();
    
    if (clusterLead) { // Ensure clusterLead exists before sending notification
        await notificationService.addNotification({ // Corrected usage
            type: "Cluster",
            subject: "New Member Assigned to Cluster", // Added subject
            content: `A new member has been assigned to your cluster from the follow-up system.`,
            targetLevel: "USER", // Assuming USER level for direct assignment
            recipient: { memberId: clusterLead }, // Assuming clusterLead is a memberId
            targetId: clusterLead, // Target is the cluster lead
            relatedTo: { type: "FollowUp", id: followUp._id },
            createdBy: new mongoose.Types.ObjectId(userId)
        });
    }
    
    return followUp;
  } catch (error) {
    console.error("Error handing off to cluster:", error);
    throw error;
  }
}

async function getDueFollowUps(): Promise<IFollowUp[]> {
  try {
    await connectToDB(); // Added connectToDB call
    const now = new Date();
    const followUps = await FollowUp.find({
      status: { $in: ["Pending", "In Progress"] },
      nextFollowUpDate: { $lte: now }
    })
    .populate("assignedTo", "email")
    .populate('personId', 'firstName lastName email')
    .populate('attendeeId', 'firstName lastName email')
    .sort("nextFollowUpDate");
    return followUps;
  } catch (error) {
    console.error("Error getting due follow-ups:", error);
    throw error;
  }
}

async function sendFollowUpMessage(
  followUpId: string,
  message: string,
  channels: ("email" | "sms" | "whatsapp")[],
  useAiGenerated: boolean = false
): Promise<any> {
  try {
    await connectToDB(); // Added connectToDB call
    const followUp = await FollowUp.findById(followUpId)
      .populate("personId", "firstName lastName email phoneNumber whatsappNumber")
      .populate("attendeeId", "firstName lastName email phoneNumber whatsappNumber"); // Populate attendeeId
    if (!followUp) throw new Error("Follow-up not found");
    
    let personName = "Friend";
    let email: string | undefined;
    let phoneNumber: string | undefined;
    let whatsappNumber: string | undefined;

    if (followUp.personType === 'Member' && followUp.personId) {
      personName = `${followUp.personId.firstName} ${followUp.personId.lastName}`;
      email = followUp.personId.email;
      phoneNumber = followUp.personId.phoneNumber;
      whatsappNumber = followUp.personId.whatsappNumber;
    } else if (followUp.personType === 'Attendee' && followUp.attendeeId) {
      personName = `${followUp.attendeeId.firstName} ${followUp.attendeeId.lastName}`;
      email = followUp.attendeeId.email;
      phoneNumber = followUp.attendeeId.phoneNumber;
      whatsappNumber = followUp.attendeeId.whatsappNumber;
    } else if (followUp.personType === 'Unregistered Guest' && followUp.newAttendee) {
      personName = `${followUp.newAttendee.firstName} ${followUp.newAttendee.lastName}`;
      email = followUp.newAttendee.email;
      phoneNumber = followUp.newAttendee.phoneNumber;
      whatsappNumber = followUp.newAttendee.whatsappNumber;
    }
    
    let finalMessage = message;
    if (useAiGenerated && !message) {
      try {
        const eventName = followUp.missedEvent ? followUp.missedEvent.eventType : "our service";
        const eventDate = followUp.missedEvent ? followUp.missedEvent.eventDate.toISOString().split("T")[0] : "recently";
        // Adjust isNewAttendee based on new personTypes
        const isNewOrUnregistered = followUp.personType === "Attendee" || followUp.personType === "Unregistered Guest";
        finalMessage = await generateFollowUpMessage({
          memberName: personName,
          eventName,
          eventDate,
          isNewAttendee: isNewOrUnregistered
        });
      } catch (error) {
        console.error("Error generating AI message:", error);
        const isNewOrUnregistered = followUp.personType === "Attendee" || followUp.personType === "Unregistered Guest";
        finalMessage = isNewOrUnregistered ?
          `Thank you for visiting our church. We hope to see you again soon!` : 
          `We missed you at our recent service. Hope to see you next time!`;
      }
    }
    
    const results = { email: false, sms: false, whatsapp: false };
    if (channels.includes("email") && email) {
      try {
        await sendFollowUpEmail(email, personName, "Follow-up", finalMessage);
        results.email = true;
      } catch (error) { console.error("Error sending email:", error); }
    }
    if (channels.includes("sms") && phoneNumber) {
      try {
        await sendFollowUpSMS(phoneNumber, personName, finalMessage);
        results.sms = true;
      } catch (error) { console.error("Error sending SMS:", error); }
    }
    if (channels.includes("whatsapp") && whatsappNumber) {
      try {
        await sendFollowUpWhatsApp(whatsappNumber, personName, finalMessage);
        results.whatsapp = true;
      } catch (error) { console.error("Error sending WhatsApp:", error); }
    }
    return { success: Object.values(results).some(Boolean), message: finalMessage, results };
  } catch (error) {
    console.error("Error sending follow-up message:", error);
    throw error;
  }
}

export const followUpService = {
    getFollowUpConfig,
    calculateNextFollowUpDate,
    determineResponseCategory,
    determineFollowUpStatus,
    createFollowUp,
    addFollowUpAttempt,
    handoffToCluster,
    getDueFollowUps,
    sendFollowUpMessage
};
