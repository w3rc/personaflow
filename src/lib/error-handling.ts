// Secure error handling utilities

export interface SecureError {
  message: string
  code?: string
  status?: number
  timestamp: string
  userFriendly: boolean
}

// Error codes for different types of errors
export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'AUTH_001',
  SESSION_EXPIRED: 'AUTH_002',
  INVALID_CREDENTIALS: 'AUTH_003',
  
  // Validation errors
  INVALID_INPUT: 'VAL_001',
  MISSING_REQUIRED_FIELD: 'VAL_002',
  INPUT_TOO_LONG: 'VAL_003',
  INVALID_FORMAT: 'VAL_004',
  
  // Resource errors
  NOT_FOUND: 'RES_001',
  ALREADY_EXISTS: 'RES_002',
  LIMIT_EXCEEDED: 'RES_003',
  FORBIDDEN: 'RES_004',
  
  // External service errors
  API_ERROR: 'EXT_001',
  RATE_LIMITED: 'EXT_002',
  SERVICE_UNAVAILABLE: 'EXT_003',
  
  // Internal errors
  DATABASE_ERROR: 'INT_001',
  UNKNOWN_ERROR: 'INT_002'
} as const

// User-friendly error messages
const ErrorMessages = {
  [ErrorCodes.UNAUTHORIZED]: 'Please sign in to continue.',
  [ErrorCodes.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCodes.INVALID_CREDENTIALS]: 'Invalid email or password.',
  
  [ErrorCodes.INVALID_INPUT]: 'Please check your input and try again.',
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields.',
  [ErrorCodes.INPUT_TOO_LONG]: 'Input is too long. Please shorten it.',
  [ErrorCodes.INVALID_FORMAT]: 'Please enter a valid format.',
  
  [ErrorCodes.NOT_FOUND]: 'The requested item was not found.',
  [ErrorCodes.ALREADY_EXISTS]: 'This item already exists.',
  [ErrorCodes.LIMIT_EXCEEDED]: 'You have reached your usage limit. Consider upgrading your plan.',
  [ErrorCodes.FORBIDDEN]: 'You do not have permission to perform this action.',
  
  [ErrorCodes.API_ERROR]: 'External service is temporarily unavailable. Please try again later.',
  [ErrorCodes.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  
  [ErrorCodes.DATABASE_ERROR]: 'Unable to save your changes. Please try again.',
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
}

// Create a secure error object
export function createSecureError(
  code: keyof typeof ErrorCodes,
  originalError?: Error | string,
  additionalContext?: Record<string, any>
): SecureError {
  const errorCode = ErrorCodes[code]
  const message = ErrorMessages[errorCode] || ErrorMessages[ErrorCodes.UNKNOWN_ERROR]
  
  // Log the original error for debugging (server-side only)
  if (typeof window === 'undefined') {
    console.error(`Error [${code}]:`, originalError, additionalContext)
  }
  
  return {
    message,
    code: errorCode,
    timestamp: new Date().toISOString(),
    userFriendly: true
  }
}

// Handle API errors securely
export function handleApiError(error: any): SecureError {
  // Supabase errors
  if (error?.code === 'PGRST301') {
    return createSecureError('NOT_FOUND', error)
  }
  
  if (error?.code === '23505') { // Unique constraint violation
    return createSecureError('ALREADY_EXISTS', error)
  }
  
  if (error?.code === '42501') { // Insufficient privilege
    return createSecureError('FORBIDDEN', error)
  }
  
  // HTTP status codes
  if (error?.status === 401 || error?.status === 403) {
    return createSecureError('UNAUTHORIZED', error)
  }
  
  if (error?.status === 404) {
    return createSecureError('NOT_FOUND', error)
  }
  
  if (error?.status === 429) {
    return createSecureError('RATE_LIMITED', error)
  }
  
  if (error?.status >= 500) {
    return createSecureError('SERVICE_UNAVAILABLE', error)
  }
  
  // OpenRouter specific errors
  if (error?.message?.includes('API key') || error?.message?.includes('authentication')) {
    return createSecureError('API_ERROR', error)
  }
  
  // Network errors
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return createSecureError('SERVICE_UNAVAILABLE', error)
  }
  
  // Default to unknown error
  return createSecureError('UNKNOWN_ERROR', error)
}

// Handle validation errors
export function handleValidationError(validationResult: { errors: string[] }): SecureError {
  const message = validationResult.errors.join(', ')
  
  if (validationResult.errors.some(error => error.includes('required'))) {
    return createSecureError('MISSING_REQUIRED_FIELD', message)
  }
  
  if (validationResult.errors.some(error => error.includes('too long') || error.includes('length'))) {
    return createSecureError('INPUT_TOO_LONG', message)
  }
  
  if (validationResult.errors.some(error => error.includes('format') || error.includes('invalid'))) {
    return createSecureError('INVALID_FORMAT', message)
  }
  
  return createSecureError('INVALID_INPUT', message)
}

// Sanitize error for client display
export function sanitizeErrorForClient(error: any): SecureError {
  // If it's already a secure error, return as-is
  if (error?.userFriendly) {
    return error
  }
  
  // Handle known error types
  if (error?.errors && Array.isArray(error.errors)) {
    return handleValidationError(error)
  }
  
  // Handle API errors
  return handleApiError(error)
}

// Error logging for production
export function logError(error: SecureError, context?: Record<string, any>) {
  // In production, this would send to an error monitoring service
  if (typeof window === 'undefined') { // Server-side only
    console.error('Secure Error:', {
      ...error,
      context,
      userAgent: context?.userAgent,
      url: context?.url,
      userId: context?.userId // Be careful not to log sensitive user data
    })
    
    // Example: Send to error monitoring service
    // if (process.env.NODE_ENV === 'production') {
    //   await sendToErrorService(error, context)
    // }
  }
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const attempt = this.attempts.get(identifier)
    
    if (!attempt || now > attempt.resetTime) {
      // Reset or create new attempt record
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false
    }
    
    attempt.count++
    return true
  }
  
  getRemainingTime(identifier: string): number {
    const attempt = this.attempts.get(identifier)
    if (!attempt) return 0
    
    return Math.max(0, attempt.resetTime - Date.now())
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter()

// Helper to check if user is being rate limited
export function checkRateLimit(userId: string): SecureError | null {
  if (!globalRateLimiter.isAllowed(userId)) {
    const remainingTime = Math.ceil(globalRateLimiter.getRemainingTime(userId) / 1000 / 60)
    return {
      ...createSecureError('RATE_LIMITED'),
      message: `Too many requests. Please try again in ${remainingTime} minutes.`
    }
  }
  return null
}

// Helper for handling async operations with error boundaries
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<{ data?: T; error?: SecureError }> {
  try {
    const data = await operation()
    return { data }
  } catch (error) {
    const secureError = sanitizeErrorForClient(error)
    logError(secureError, context)
    return { error: secureError }
  }
}

// Middleware for API routes
export function createErrorResponse(error: SecureError, status?: number) {
  return Response.json(
    {
      error: error.message,
      code: error.code,
      timestamp: error.timestamp
    },
    { 
      status: status || (error.code?.startsWith('AUTH') ? 401 : 400),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}