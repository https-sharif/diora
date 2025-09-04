import { z } from 'zod';

/**
 * Post validation schemas using Zod for type-safe validation
 */
export const postValidation = {
  caption: z
    .string()
    .min(1, 'Caption is required')
    .max(500, 'Caption must be less than 500 characters')
    .optional(),

  image: z
    .any()
    .refine((file) => file instanceof File || file?.uri, 'Image is required')
    .refine(
      (file) => {
        if (file instanceof File) {
          return file.size <= 10 * 1024 * 1024;
        }
        return true;
      },
      'Image must be less than 10MB'
    ),
};

export const commentValidation = {
  text: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(300, 'Comment must be less than 300 characters')
    .refine(
      (text) => text.trim().length > 0,
      'Comment cannot be just whitespace'
    ),

  reply: z
    .string()
    .min(1, 'Reply cannot be empty')
    .max(300, 'Reply must be less than 300 characters'),
};

export const userValidation = {
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

  email: z
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),

  bio: z
    .string()
    .max(200, 'Bio must be less than 200 characters')
    .optional(),
};

export const productValidation = {
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(100, 'Product name must be less than 100 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),

  price: z
    .number()
    .min(0.01, 'Price must be greater than 0')
    .max(999999.99, 'Price must be less than 1,000,000'),

  category: z
    .array(z.string())
    .min(1, 'At least one category is required')
    .max(5, 'Maximum 5 categories allowed'),

  stock: z
    .number()
    .min(0, 'Stock cannot be negative')
    .max(99999, 'Stock must be less than 100,000')
    .optional(),

  discount: z
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .optional(),
};

export const reviewValidation = {
  rating: z
    .number()
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),

  comment: z
    .string()
    .max(500, 'Review comment must be less than 500 characters')
    .optional(),
};

export const searchValidation = {
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query must be less than 100 characters'),

  filters: z
    .object({
      category: z.string().optional(),
      minPrice: z.number().min(0).optional(),
      maxPrice: z.number().min(0).optional(),
      rating: z.number().min(1).max(5).optional(),
    })
    .optional(),
};

/**
 * Validates a single field against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param value - The value to validate
 * @returns Object with success boolean and either data or error message
 */
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { success: true; data: T } | { success: false; error: string } => {
  try {
    const result = schema.parse(value);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: 'Validation failed' };
  }
};

/**
 * Validates an entire form against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param formData - The form data object to validate
 * @returns Object with success boolean and either data or errors object
 */
export const validateForm = <T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  formData: Record<string, any>
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  try {
    const result = schema.parse(formData);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Rate limiter class to prevent abuse and spam
 * Uses a sliding window approach to track attempts per key
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  /**
   * Creates a new rate limiter instance
   * @param maxAttempts - Maximum number of attempts allowed in the window
   * @param windowMs - Time window in milliseconds
   */
  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  /**
   * Checks if an action is allowed for the given key
   * @param key - Unique identifier for the rate limit (e.g., user ID, IP)
   * @returns true if allowed, false if rate limited
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  /**
   * Resets the rate limit counter for a specific key
   * @param key - The key to reset
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const commentRateLimiter = new RateLimiter(10, 60000);
export const postRateLimiter = new RateLimiter(5, 300000);

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  /**
   * Measures execution time of a function
   * @param fn - Function to measure
   * @param label - Label for the measurement
   * @returns Result of the function
   */
  measureExecutionTime: async <T>(
    fn: () => Promise<T>,
    label: string
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.log(`${label} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${label} failed after ${end - start} milliseconds:`, error);
      throw error;
    }
  },

  /**
   * Logs performance metrics
   * @param metric - Metric name
   * @param value - Metric value
   * @param unit - Unit of measurement
   */
  logMetric: (metric: string, value: number, unit: string = 'ms') => {
    console.log(`[PERF] ${metric}: ${value} ${unit}`);
  },
};
