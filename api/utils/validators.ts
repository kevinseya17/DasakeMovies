// validates basic email format (RFC 5322)
export const isValidEmail = (email: string): boolean => {
  // prevents spaces and ensures user@domain.tld structure
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
};

/**
 * validates a secure password allowing accents and ñ
 *
 * requirements:
 * - at least 8 characters
 * - at least one lowercase letter (including ñ or accented)
 * - at least one uppercase letter (including Ñ or accented)
 * - at least one number
 * - at least one special character
 * - supports accented letters and ñ
 */
export const isValidPassword = (password: string): boolean => {
  const regex =
    /^(?=.*[a-záéíóúüñ])(?=.*[A-ZÁÉÍÓÚÜÑ])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-zÁÉÍÓÚÜÑñ\d@$!%*?&._-]{8,}$/;
  return regex.test(password);
};

/**
 * compares password and confirmation to ensure they match
 *
 * returns true if both strings are identical, otherwise false
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * validates that age is an integer and at least 13 years old
 *
 * ensures compliance with minimum age requirement
 */
export const isValidAge = (age: number): boolean => {
  return Number.isInteger(age) && age >= 13;
};

/**
 * validates names and last names allowing ñ, accents, and spaces
 *
 * accepts:
 * - uppercase and lowercase letters
 * - ñ and Ñ
 * - accented vowels (á, é, í, ó, ú, ü)
 * - spaces
 *
 * valid example: "José María Ñuñez"
 */
export const isValidName = (name: string): boolean => {
  const regex = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]+$/;
  return regex.test(name.trim());
};
