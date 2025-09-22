// Security utilities for user validation and protection

export interface SecurityFlags {
  isNewAccount: boolean;
  accountAge: number; // in hours
  requiresEmailVerification: boolean;
  isHighRisk: boolean;
  riskFactors: string[];
}

export interface SecurityConfig {
  minAccountAgeForReviews: number; // 24 hours in milliseconds
  enableRecaptcha: boolean;
  requireEmailVerification: boolean;
  maxLoginAttempts: number;
  blockDurationMinutes: number;
}

export const SECURITY_CONFIG: SecurityConfig = {
  minAccountAgeForReviews: 24 * 60 * 60 * 1000, // 24 hours
  enableRecaptcha: true,
  requireEmailVerification: true,
  maxLoginAttempts: 5,
  blockDurationMinutes: 2
};

// Check if account is new and should be flagged
export const checkAccountSecurityFlags = (createdAt: Date): SecurityFlags => {
  const now = new Date();
  const accountAge = now.getTime() - createdAt.getTime();
  const accountAgeHours = accountAge / (1000 * 60 * 60);
  
  const isNewAccount = accountAge < SECURITY_CONFIG.minAccountAgeForReviews;
  const riskFactors: string[] = [];
  
  if (isNewAccount) {
    riskFactors.push('account_age_less_than_24h');
  }
  
  if (accountAgeHours < 1) {
    riskFactors.push('account_age_less_than_1h');
  }
  
  return {
    isNewAccount,
    accountAge: accountAgeHours,
    requiresEmailVerification: SECURITY_CONFIG.requireEmailVerification,
    isHighRisk: riskFactors.length > 0,
    riskFactors
  };
};

// Validate email format with enhanced security
export const validateEmailSecurity = (email: string): { isValid: boolean; reason?: string } => {
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, reason: 'Email é obrigatório' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, reason: 'Formato de email inválido' };
  }
  
  // Check for common disposable email domains
  const disposableDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.org',
    'temp-mail.org'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (disposableDomains.includes(domain)) {
    return { isValid: false, reason: 'Por favor, use um email permanente' };
  }
  
  return { isValid: true };
};

// Password strength validation with enhanced security
export const validatePasswordSecurity = (password: string): { 
  isValid: boolean; 
  score: number; 
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  issues: string[];
} => {
  const issues: string[] = [];
  let score = 0;
  
  if (password.length < 8) {
    issues.push('Mínimo 8 caracteres');
  } else {
    score += 20;
  }
  
  if (!/[A-Z]/.test(password)) {
    issues.push('Pelo menos uma letra maiúscula');
  } else {
    score += 20;
  }
  
  if (!/[a-z]/.test(password)) {
    issues.push('Pelo menos uma letra minúscula');
  } else {
    score += 20;
  }
  
  if (!/[0-9]/.test(password)) {
    issues.push('Pelo menos um número');
  } else {
    score += 20;
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    issues.push('Pelo menos um símbolo especial');
  } else {
    score += 20;
  }
  
  // Additional security checks
  if (password.length >= 12) {
    score += 10;
  }
  
  if (/[^A-Za-z0-9]{2,}/.test(password)) {
    score += 10;
  }
  
  let strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  if (score < 40) strength = 'weak';
  else if (score < 70) strength = 'medium';
  else if (score < 90) strength = 'strong';
  else strength = 'very_strong';
  
  return {
    isValid: issues.length === 0,
    score,
    strength,
    issues
  };
};

// ReCAPTCHA integration placeholder (requires API keys to be fully implemented)
export const verifyRecaptcha = async (token: string): Promise<boolean> => {
  // In a real implementation, this would call Google's reCAPTCHA API
  // For now, return true to not break the flow
  // This should be configured through Supabase integration or environment variables
  
  if (!SECURITY_CONFIG.enableRecaptcha) {
    return true;
  }
  
  // Placeholder - in production this would make an API call to Google
  console.warn('reCAPTCHA verification not implemented - requires API keys');
  return true;
};

// Generate security report for admin use
export const generateSecurityReport = (user: any): string => {
  const flags = checkAccountSecurityFlags(user.createdAt);
  
  const report = {
    userId: user.id,
    email: user.email,
    createdAt: user.createdAt,
    securityFlags: flags,
    timestamp: new Date().toISOString()
  };
  
  return JSON.stringify(report, null, 2);
};