import bcrypt from "bcryptjs";

/**
 * Encrypts a plain text password using bcrypt.
 * A salt with 10 rounds is generated to strengthen the hash against brute-force attacks.
 *
 * password: The plain text password to be hashed.
 * returns: The securely hashed version of the password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compares a plain text password with a previously hashed password to verify if they match.
 * This is commonly used during user login to authenticate credentials.
 *
 * password: The plain text password provided by the user.
 * hash: The stored hashed password to compare against.
 * returns: A boolean indicating whether the passwords match (true) or not (false).
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
