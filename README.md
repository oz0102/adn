// app/(dashboard)/README.md
# Church Management System - Implementation Guide

## Overview
This document provides a guide for the implementation of the Church Management System. The system has been set up with the following components:

1. **External Service Integrations**
   - Email Service (Zoho Zeptomail)
   - SMS Service (BulkSMS Nigeria)
   - WhatsApp Service (WhatsApp Cloud API)
   - AI Service (Google Gemini API)

2. **Frontend Components**
   - Notification Management
   - Event Management
   - Follow-up System
   - Program Flyer Generation
   - Spiritual Growth Tracking

## Configuration Requirements

Before deploying the system, you need to configure the following environment variables in the `.env` file:

```
# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Zepto Mail Configuration (for email service)
ZEPTOMAIL_TOKEN=your_zeptomail_token
EMAIL_FROM=hi@adnglobal.org

# Bulk SMS Configuration (for SMS service)
BULKSMS_API_TOKEN=your_bulksms_token
BULKSMS_SENDER_NAME=ADN

# WhatsApp Configuration (for WhatsApp service)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# GEMINI AI (for AI service)
GEMINI_API_KEY=your_gemini_api_key

# Redis Configuration (for background processing)
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
```

## WhatsApp Templates

For the WhatsApp service to work properly, you need to create the following templates in the WhatsApp Business Manager:

1. **welcome_message**
   - Parameters: {{1}} (member name)

2. **event_reminder**
   - Parameters: {{1}} (event name), {{2}} (date), {{3}} (time), {{4}} (location)

3. **birthday_wishes**
   - Parameters: {{1}} (member name)

4. **follow_up_message**
   - Parameters: {{1}} (member name), {{2}} (follow-up message)

5. **general_notification**
   - Parameters: {{1}} (member name), {{2}} (notification title), {{3}} (notification message)

## Testing

The system includes comprehensive test files for all implemented services:

- Email Service Tests
- SMS Service Tests
- WhatsApp Service Tests
- AI Service Tests
- Frontend Component Tests

To run the tests, use the following command:

```bash
npm test
```

## Deployment

Once all the environment variables are configured, you can deploy the system using:

```bash
npm run build
npm start
```

For production deployment, it's recommended to use a service like Vercel or Netlify, which can be configured to use the environment variables from your deployment platform.

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Zoho Zeptomail API Documentation](https://www.zoho.com/zeptomail/help/api-documentation.html)
- [BulkSMS Nigeria API Documentation](https://www.bulksmsnigeria.com/api-documentation)
- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Google Gemini API Documentation](https://ai.google.dev/docs/gemini_api)
