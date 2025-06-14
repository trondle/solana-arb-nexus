
/**
 * Enhanced password security utilities
 * Implements strong password requirements and breach checking
 */

export interface PasswordStrength {
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  isValid: boolean;
}

/**
 * Enhanced password validation with strict requirements
 */
export const validatePassword = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Minimum length check (12 characters)
  if (password.length < 12) {
    feedback.push('Password must be at least 12 characters long');
  } else if (password.length >= 12) {
    score += 1;
  }

  // Character type requirements
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUppercase) feedback.push('Password must contain at least one uppercase letter');
  if (!hasLowercase) feedback.push('Password must contain at least one lowercase letter');
  if (!hasNumbers) feedback.push('Password must contain at least one number');
  if (!hasSpecialChars) feedback.push('Password must contain at least one special character');

  // Score based on character types
  const charTypes = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  score += Math.min(charTypes, 4);

  // Length bonus
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;

  // Common patterns check
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123|234|345|456|567|678|789|890/, // Sequential numbers
    /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i, // Sequential letters
    /password|123456|qwerty|admin|login|user/i // Common words
  ];

  const hasCommonPatterns = commonPatterns.some(pattern => pattern.test(password));
  if (hasCommonPatterns) {
    feedback.push('Password contains common patterns or words');
    score = Math.max(0, score - 2);
  }

  // Determine overall strength
  const isValid = password.length >= 12 && hasUppercase && hasLowercase && hasNumbers && hasSpecialChars && !hasCommonPatterns;

  return {
    score: Math.min(score, 4),
    feedback,
    isValid
  };
};

/**
 * Get password strength description
 */
export const getPasswordStrengthText = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'Very Weak';
    case 2:
      return 'Weak';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Unknown';
  }
};

/**
 * Get password strength color
 */
export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'text-red-500';
    case 2:
      return 'text-orange-500';
    case 3:
      return 'text-yellow-500';
    case 4:
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

/**
 * Generate a secure random password
 */
export const generateSecurePassword = (length: number = 16): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};
