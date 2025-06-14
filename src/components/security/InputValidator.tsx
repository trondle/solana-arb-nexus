
import { useState, useCallback } from 'react';
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Enhanced validation schemas with stricter rules
export const tradingConfigSchema = z.object({
  walletAddress: z.string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid wallet address format')
    .min(32, 'Wallet address too short')
    .max(44, 'Wallet address too long'),
  
  maxSlippage: z.number()
    .min(0.01, 'Minimum slippage is 0.01%')
    .max(5, 'Maximum slippage is 5%')
    .refine((val) => val <= 2, 'Slippage above 2% is considered high risk'),
    
  maxGasPrice: z.number()
    .min(1, 'Minimum gas price is 1 gwei')
    .max(1000, 'Maximum gas price is 1000 gwei')
    .refine((val) => val <= 500, 'Gas price above 500 gwei is extremely high'),
    
  amount: z.number()
    .min(0.001, 'Minimum amount is 0.001')
    .max(1000000, 'Maximum amount is 1,000,000')
    .refine((val) => val <= 100000, 'Amounts above 100,000 require additional verification'),
    
  apiKey: z.string()
    .min(10, 'API key too short')
    .max(200, 'API key too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Invalid API key format')
});

// Enhanced financial validation schema
export const financialParametersSchema = z.object({
  tradeAmount: z.number()
    .min(0.001, 'Minimum trade amount is 0.001')
    .max(1000000, 'Maximum trade amount exceeded')
    .refine((val) => {
      // Additional sanity checks
      if (val > 50000) return false; // High-value trades require manual approval
      return true;
    }, 'High-value trades require manual approval'),
    
  stopLoss: z.number()
    .min(0.01, 'Stop loss must be at least 0.01%')
    .max(50, 'Stop loss cannot exceed 50%'),
    
  takeProfit: z.number()
    .min(0.01, 'Take profit must be at least 0.01%')
    .max(1000, 'Take profit cannot exceed 1000%'),
    
  leverageRatio: z.number()
    .min(1, 'Minimum leverage is 1x')
    .max(10, 'Maximum leverage is 10x for safety')
    .refine((val) => val <= 5, 'Leverage above 5x is considered high risk')
});

export const useInputValidator = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  const sanitizeInput = useCallback((input: string): string => {
    // Enhanced sanitization
    let sanitized = DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    }).trim();
    
    // Remove potential injection patterns
    sanitized = sanitized.replace(/[<>'";&\\]/g, '');
    
    return sanitized;
  }, []);

  const validateField = useCallback((field: string, value: any, schema: z.ZodSchema) => {
    try {
      schema.parse({ [field]: value });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      setWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings[field];
        return newWarnings;
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || 'Invalid input';
        
        // Categorize as warning or error
        if (errorMessage.includes('high risk') || errorMessage.includes('extremely high')) {
          setWarnings(prev => ({
            ...prev,
            [field]: errorMessage
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            [field]: errorMessage
          }));
        }
      }
      return false;
    }
  }, []);

  const validateTradingConfig = useCallback((config: any) => {
    try {
      tradingConfigSchema.parse(config);
      setErrors({});
      setWarnings({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        const fieldWarnings: Record<string, string> = {};
        
        error.errors.forEach(err => {
          if (err.path[0]) {
            const fieldName = err.path[0] as string;
            const message = err.message;
            
            if (message.includes('high risk') || message.includes('extremely high')) {
              fieldWarnings[fieldName] = message;
            } else {
              fieldErrors[fieldName] = message;
            }
          }
        });
        
        setErrors(fieldErrors);
        setWarnings(fieldWarnings);
      }
      return false;
    }
  }, []);

  const validateFinancialParameters = useCallback((params: any) => {
    try {
      financialParametersSchema.parse(params);
      return { isValid: true, errors: {}, warnings: {} };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        const fieldWarnings: Record<string, string> = {};
        
        error.errors.forEach(err => {
          if (err.path[0]) {
            const fieldName = err.path[0] as string;
            const message = err.message;
            
            if (message.includes('high risk') || message.includes('require manual approval')) {
              fieldWarnings[fieldName] = message;
            } else {
              fieldErrors[fieldName] = message;
            }
          }
        });
        
        return { isValid: false, errors: fieldErrors, warnings: fieldWarnings };
      }
      return { isValid: false, errors: { general: 'Validation failed' }, warnings: {} };
    }
  }, []);

  // Enhanced rate limiting for sensitive operations
  const [lastConfigChange, setLastConfigChange] = useState<number>(0);
  const CONFIG_CHANGE_COOLDOWN = 30000; // 30 seconds

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    if (now - lastConfigChange < CONFIG_CHANGE_COOLDOWN) {
      const remainingTime = Math.ceil((CONFIG_CHANGE_COOLDOWN - (now - lastConfigChange)) / 1000);
      setErrors(prev => ({
        ...prev,
        rateLimit: `Please wait ${remainingTime} seconds before making another configuration change`
      }));
      return false;
    }
    setLastConfigChange(now);
    return true;
  }, [lastConfigChange]);

  return {
    errors,
    warnings,
    sanitizeInput,
    validateField,
    validateTradingConfig,
    validateFinancialParameters,
    checkRateLimit,
    clearErrors: () => {
      setErrors({});
      setWarnings({});
    }
  };
};
