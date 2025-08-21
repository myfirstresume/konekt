import crypto from 'crypto';

// Generate a user-specific encryption key from their session
export function generateUserKey(userId: string, sessionToken?: string): string {
  const base = `${userId}-${sessionToken || 'default'}`;
  return crypto.createHash('sha256').update(base).digest('hex').substring(0, 32);
}

// Encrypt a message using AES-256-CBC
export function encryptMessage(message: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', key);
  
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data as base64
  return Buffer.concat([iv, Buffer.from(encrypted, 'hex')]).toString('base64');
}

// Decrypt a message using AES-256-CBC
export function decryptMessage(encryptedMessage: string, key: string): string {
  try {
    const data = Buffer.from(encryptedMessage, 'base64');
    const iv = data.subarray(0, 16);
    const encrypted = data.subarray(16).toString('hex');
    
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Encrypted Message]';
  }
}

// Encrypt an array of chat messages
export function encryptChatMessages(messages: any[], key: string): any[] {
  return messages.map(message => ({
    ...message,
    content: encryptMessage(message.content, key),
    timestamp: message.timestamp // Keep timestamp unencrypted for sorting
  }));
}

// Decrypt an array of chat messages
export function decryptChatMessages(encryptedMessages: any[], key: string): any[] {
  return encryptedMessages.map(message => ({
    ...message,
    content: decryptMessage(message.content, key),
    timestamp: message.timestamp
  }));
}
