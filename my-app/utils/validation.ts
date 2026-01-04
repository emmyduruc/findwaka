import { z } from 'zod';

/**
 * Common validation schemas using Zod
 */

// Nigerian phone number validation (supports +234 and 0 prefixes)
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .refine(
    (val) => {
      // Remove spaces, dashes, and plus signs for validation
      const cleaned = val.replace(/[\s\-+]/g, '');
      // Nigerian numbers: +234XXXXXXXXXX or 0XXXXXXXXXX
      return /^(\+?234|0)[789][01]\d{8}$/.test(cleaned) || /^(\+?234|0)\d{10}$/.test(cleaned);
    },
    {
      message: 'Please enter a valid Nigerian phone number (e.g., +234 800 000 0000)',
    }
  );

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Email validation (for future use)
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

// Generic required string
export const requiredStringSchema = z.string().min(1, 'This field is required');
