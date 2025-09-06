import { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'],
});

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_TITLE = process.env.GOOGLE_SHEET_TITLE;

function generateAlphanumericId(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID as string, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_TITLE as string];
    if (!sheet) {
      throw new Error(`Sheet '${SHEET_TITLE}' not found.`);
    }

    const rows = await sheet.getRows();
    const existingEmail = rows.find((row: GoogleSpreadsheetRow) => 
      row.get('email')?.toLowerCase() === email.toLowerCase()
    );
    
    return !!existingEmail;
  } catch (error) {
    console.error('Failed to check email existence:', error);
    throw error;
  }
}

export async function getExistingUserData(email: string): Promise<{ id: string; referralLink: string; numReferrals: number } | null> {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID as string, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_TITLE as string];
    if (!sheet) {
      throw new Error(`Sheet '${SHEET_TITLE}' not found.`);
    }

    const rows = await sheet.getRows();
    const userRow = rows.find((row: GoogleSpreadsheetRow) => 
      row.get('email')?.toLowerCase() === email.toLowerCase()
    );
    
    if (userRow) {
      return {
        id: userRow.get('id'),
        referralLink: userRow.get('referral_link'),
        numReferrals: parseInt(userRow.get('num_referrals') || '0')
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get existing user data:', error);
    throw error;
  }
}

export async function addToWaitlist(email: string, referralId?: string, mentor?: boolean, company?: string): Promise<{ id: string; referralLink: string }> {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID as string, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_TITLE as string];
    if (!sheet) {
      throw new Error(`Sheet '${SHEET_TITLE}' not found.`);
    }

    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    const id = generateAlphanumericId(8);
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${id}`;

    // If this is a referral signup, update the referrer's count
    if (referralId) {
      await updateReferralCount(sheet as GoogleSpreadsheetWorksheet, referralId);
    }

    await sheet.addRow({ 
      id: id, 
      email: email, 
      referral_link: referralLink,
      num_referrals: 0,
      referred_by: referralId || '',
      mentor: mentor || false,
      company: company || ''
    });

    return { id, referralLink };
  } catch (error) {
    console.error('Failed to add to waitlist:', error);
    throw error;
  }
}

async function updateReferralCount(sheet: GoogleSpreadsheetWorksheet, referralId: string): Promise<void> {
  try {
    const rows = await sheet.getRows();
    const referrerRow = rows.find((row: GoogleSpreadsheetRow) => row.get('id') === referralId);
    
    if (referrerRow) {
      const currentCount = parseInt(referrerRow.get('num_referrals') || '0');
      referrerRow.set('num_referrals', currentCount + 1);
      await referrerRow.save();
    }
  } catch (error) {
    console.error('Failed to update referral count:', error);
    // Don't throw error here as the main signup should still succeed
  }
}

export async function getUserByReferralId(referralId: string): Promise<{ id: string; email: string; referralLink: string; numReferrals: number } | null> {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID as string, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_TITLE as string];
    if (!sheet) {
      throw new Error(`Sheet '${SHEET_TITLE}' not found.`);
    }

    const rows = await sheet.getRows();
    const userRow = rows.find((row: GoogleSpreadsheetRow) => row.get('id') === referralId);
    
    if (userRow) {
      return {
        id: userRow.get('id'),
        email: userRow.get('email'),
        referralLink: userRow.get('referral_link'),
        numReferrals: parseInt(userRow.get('num_referrals') || '0')
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get user by referral ID:', error);
    throw error;
  }
}

export async function getReferralStats(referralId: string): Promise<{ numReferrals: number } | null> {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID as string, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_TITLE as string];
    if (!sheet) {
      throw new Error(`Sheet '${SHEET_TITLE}' not found.`);
    }

    const rows = await sheet.getRows();
    const userRow = rows.find((row: GoogleSpreadsheetRow) => row.get('id') === referralId);
    
    if (userRow) {
      return {
        numReferrals: parseInt(userRow.get('num_referrals') || '0')
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get referral stats:', error);
    throw error;
  }
}

/**
 * Tracks a referral visit and increments the referral count for the referrer.
 * This function should be called when someone visits a referral link.
 * 
 * @param referralId - The unique ID of the referrer
 * @returns Promise with success status and updated user data
 */
export async function trackReferralVisit(referralId: string): Promise<{ success: boolean; userData?: { id: string; email: string; referralLink: string; numReferrals: number } }> {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID as string, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_TITLE as string];
    if (!sheet) {
      throw new Error(`Sheet '${SHEET_TITLE}' not found.`);
    }

    // Get user data first
    const userData = await getUserByReferralId(referralId);
    if (!userData) {
      return { success: false };
    }

    // Update referral count
    await updateReferralCount(sheet as GoogleSpreadsheetWorksheet, referralId);

    // Get updated user data
    const updatedUserData = await getUserByReferralId(referralId);
    
    return { 
      success: true, 
      userData: updatedUserData || userData 
    };
  } catch (error) {
    console.error('Failed to track referral visit:', error);
    throw error;
  }
}

export async function getWaitlistCount(): Promise<number> {
  try {
    const doc = new GoogleSpreadsheet(SHEET_ID as string, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[SHEET_TITLE as string];
    if (!sheet) {
      throw new Error(`Sheet '${SHEET_TITLE}' not found.`);
    }

    const rows = await sheet.getRows();
    return rows.length;
  } catch (error) {
    console.error('Failed to get waitlist count:', error);
    throw error;
  }
}