import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password to hash
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a bcrypt hash
 * @param password - Plain text password to compare
 * @param hash - The hash to compare against
 * @returns Promise resolving to true if passwords match, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
