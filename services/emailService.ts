import { SendMailClient } from "zeptomail";

const url = "https://api.zeptomail.com/";
const token = process.env.ZEPTOMAIL_TOKEN;

if (!token) {
  console.error('ZEPTOMAIL_TOKEN is not set in environment variables');
}

const client = new SendMailClient({ url, token });

// Email templates for church communications
const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Apostolic Dominion Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Welcome to ADN</h1>
        <p>Hello ${name},</p>
        <p>Welcome to the Apostolic Dominion Network family! We're excited to have you join us.</p>
        <p>As a member, you'll have access to our community resources, events, and spiritual growth opportunities.</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
          <p>Our mission is to empower disciples to fulfill their divine purpose.</p>
        </div>
        <p>If you have any questions, feel free to reach out to us.</p>
        <p>Blessings,</p>
        <p>The ADN Team</p>
      </div>
    `
  }),

  eventReminder: (eventName: string, date: string, time: string, location: string, name: string) => ({
    subject: `Reminder: ${eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">${eventName} Reminder</h1>
        <p>Hello ${name},</p>
        <p>This is a friendly reminder about our upcoming event:</p>
        <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0;">
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Location:</strong> ${location}</p>
        </div>
        <p>We look forward to seeing you there!</p>
        <p>Blessings,</p>
        <p>The ADN Team</p>
      </div>
    `
  }),

  birthdayWishes: (name: string) => ({
    subject: 'Happy Birthday from ADN!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Happy Birthday, ${name}!</h1>
        <p>On behalf of the entire Apostolic Dominion Network family, we wish you a blessed and joyful birthday!</p>
        <div style="text-align: center; margin: 30px 0;">
          <img src="https://example.com/birthday-image.jpg" alt="Birthday Celebration" style="max-width: 100%; height: auto;">
        </div>
        <p>May God's grace and favor be upon you in the coming year.</p>
        <p>Blessings,</p>
        <p>The ADN Team</p>
      </div>
    `
  }),

  followUp: (name: string, eventName: string, followUpMessage: string) => ({
    subject: 'Following Up: ' + eventName,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Following Up</h1>
        <p>Hello ${name},</p>
        <p>${followUpMessage}</p>
        <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0;">
          <p>We value your presence in our community and would love to hear from you.</p>
        </div>
        <p>Blessings,</p>
        <p>The ADN Team</p>
      </div>
    `
  })
};

/**
 * Sends an email using Zeptomail
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body of the email
 * @returns {Promise<any>} - The response from Zeptomail
 */
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const response = await client.sendMail({
      from: {
        address: process.env.EMAIL_FROM || "hi@adnglobal.org",
        name: "Apostolic Dominion Network"
      },
      to: [
        {
          email_address: {
            address: to
          }
        }
      ],
      subject,
      htmlbody: html,
    });

    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Church specific email sending functions
async function sendWelcomeEmail(to: string, name: string) {
  const template = emailTemplates.welcome(name);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html
  });
}

async function sendEventReminderEmail(to: string, eventName: string, date: string, time: string, location: string, name: string) {
  const template = emailTemplates.eventReminder(eventName, date, time, location, name);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html
  });
}

async function sendBirthdayEmail(to: string, name: string) {
  const template = emailTemplates.birthdayWishes(name);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html
  });
}

async function sendFollowUpEmail(to: string, name: string, eventName: string, followUpMessage: string) {
  const template = emailTemplates.followUp(name, eventName, followUpMessage);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html
  });
}

export {
  sendEmail,
  sendWelcomeEmail,
  sendEventReminderEmail,
  sendBirthdayEmail,
  sendFollowUpEmail
};
