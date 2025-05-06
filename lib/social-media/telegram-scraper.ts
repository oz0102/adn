// //lib\social-media\telegram-scraper.ts
// // Telegram scraper utility for fetching follower counts
// import axios from 'axios';
// import * as cheerio from 'cheerio';

// /**
//  * Scrapes the follower count from a Telegram channel or group
//  * @param username The Telegram username/handle (without the @ symbol)
//  * @returns The number of followers/members, or 0 if unable to retrieve
//  */
// export async function getTelegramFollowers(username: string): Promise<number> {
//   try {
//     // Clean the username (remove @ if present)
//     const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    
//     // Make request to the Telegram web page
//     const response = await axios.get(`https://t.me/${cleanUsername}`, {
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//         'Accept-Language': 'en-US,en;q=0.5',
//         'Cache-Control': 'no-cache',
//         'Pragma': 'no-cache',
//       },
//       timeout: 30000, // 10 second timeout
//     });
    
//     // Load the HTML into cheerio
//     const $ = cheerio.load(response.data);
    
//     // Extract the members count from the page
//     // The members count is typically in an element with class 'tgme_page_extra'
//     const membersText = $('.tgme_page_extra').text();
    
//     // Use regex to extract the number of members
//     // This handles different formats like "12 345 members" or "1,234 subscribers"
//     const membersMatch = membersText.match(/(\d+(?:[ ,]\d+)*)\s+(?:members|subscribers)/i);
    
//     if (membersMatch && membersMatch[1]) {
//       // Remove spaces and commas, then parse as integer
//       const count = parseInt(membersMatch[1].replace(/[ ,]/g, ''), 10);
//       return isNaN(count) ? 0 : count;
//     }
    
//     // If we couldn't find the members count in the expected format
//     console.error(`Could not extract member count from Telegram page for ${username}`);
//     return 0;
//   } catch (error) {
//     console.error(`Error fetching Telegram followers for ${username}:`, error);
//     return 0;
//   }
// }

// /**
//  * Validates if a Telegram username/URL is accessible
//  * @param username The Telegram username or URL
//  * @returns True if the username is valid and accessible, false otherwise
//  */
// export async function validateTelegramUsername(username: string): Promise<boolean> {
//   try {
//     // Extract username from URL if needed
//     let cleanUsername = username;
    
//     if (username.includes('t.me/')) {
//       const match = username.match(/t\.me\/([^/?]+)/);
//       if (match && match[1]) {
//         cleanUsername = match[1];
//       }
//     } else if (username.startsWith('@')) {
//       cleanUsername = username.substring(1);
//     }
    
//     // Make a HEAD request to check if the page exists
//     await axios.head(`https://t.me/${cleanUsername}`, {
//       timeout: 5000,
//     });
    
//     // If we get here, the request was successful
//     return true;
//   } catch (error) {
//     // Request failed, username is likely invalid
//     return false;
//   }
// }


// lib/social-media/telegram-scraper.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrapes the follower count from a Telegram channel or group
 * @param username The Telegram username/handle (without the @ symbol)
 * @returns The number of followers/members, or 0 if unable to retrieve
 */
export async function getTelegramFollowers(username: string): Promise<number> {
  try {
    // Clean the username (remove @ if present)
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    
    // Make request to the Telegram web page
    const response = await axios.get(`https://t.me/${cleanUsername}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      timeout: 10000,
    });
    
    // Load the HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Extract the members count from the page
    const membersText = $('.tgme_page_extra').text();
    
    // Log raw text for debugging
    console.log(`Raw Telegram members text: ${membersText}`);
    
    // Use regex to extract the number of members
    const membersMatch = membersText.match(/(\d+(?:[ ,]\d+)*)\s+(?:members|subscribers)/i);
    
    if (membersMatch && membersMatch[1]) {
      // Remove spaces and commas, then parse as integer
      const count = parseInt(membersMatch[1].replace(/[ ,]/g, ''), 10);
      return isNaN(count) ? 0 : count;
    }
    
    // If we couldn't find the members count in the expected format
    console.error(`Could not extract member count from Telegram page for ${username}. Text found: "${membersText}"`);
    return 0;
  } catch (error) {
    console.error(`Error fetching Telegram followers for ${username}:`, error);
    return 0;
  }
}

/**
 * Validates if a Telegram username/URL is accessible
 * @param username The Telegram username or URL
 * @returns True if the username is valid and accessible, false otherwise
 */
export async function validateTelegramUsername(username: string): Promise<boolean> {
  try {
    // Extract username from URL if needed
    let cleanUsername = username;
    
    if (username.includes('t.me/')) {
      const match = username.match(/t\.me\/([^/?]+)/);
      if (match && match[1]) {
        cleanUsername = match[1];
      }
    } else if (username.startsWith('@')) {
      cleanUsername = username.substring(1);
    }
    
    // Make a HEAD request to check if the page exists
    await axios.head(`https://t.me/${cleanUsername}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000,
    });
    
    return true;
  } catch (error) {
    return false;
  }
}