
import { useState, useCallback } from 'react';
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Validation schemas
export const tradingConfigSchema = z.object({
  walletAddress: z.string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid wallet address format')
    .min(32, 'Wallet address too short')
    .max(44, 'Wallet address too long'),
  
  maxSlippage: z.number()
    .min(0.01, 'Minimum slippage is 0.01%')
    .max(5, 'Maximum slippage is 5%'),
    
  maxGasPrice: z.number()
    .min(1, 'Minimum gas price is 1 gwei')
    .max(1000, 'Maximum gas price is 1000 gwei'),
    
  amount: z.number()
    .min(0.001, 'Minimum amount is 0.001')
    .max(1000000, 'Maximum amount is 1,000,000'),
    
  apiKey: z.string()
    .min(10, 'API key too short')
    .max(200, 'API key too long')
    .regex(/^[A-Za-z0-9_-]+$/, 'Invalid API key format')
});

export const useInputValidator = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sanitizeInput = useCallback((input: string): string => {
    // Remove HTML tags and dangerous characters
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    }).trim();
  }, []);

  const validateField = useCallback((field: string, value: any, schema: z.ZodSchema) => {
    try {
      schema.parse({ [field]: value });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.errors[0]?.message || 'Invalid input'
        }));
      }
      return false;
    }
  }, []);

  const validateTradingConfig = useCallback((config: any) => {
    try {
      tradingConfigSchema.parse(config);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  }, []);

  return {
    errors,
    sanitizeInput,
    validateField,
    validateTradingConfig,
    clearErrors: () => setErrors({})
  };
};
