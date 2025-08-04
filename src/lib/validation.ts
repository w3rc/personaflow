import DOMPurify from 'isomorphic-dompurify'

// Input validation schemas
export const ValidationRules = {
  // Profile validation
  profileName: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-'\.]+$/,
    required: true
  },
  profileEmail: {
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: false
  },
  profileLinkedIn: {
    maxLength: 500,
    pattern: /^https?:\/\/(www\.)?linkedin\.com\/.*$/,
    required: false
  },
  analysisText: {
    minLength: 10,
    maxLength: 10000,
    required: true
  },
  
  // Template validation
  templateName: {
    minLength: 1,
    maxLength: 200,
    required: true
  },
  templateContent: {
    minLength: 10,
    maxLength: 5000,
    required: true
  },
  templateCategory: {
    enum: ['email', 'meeting', 'sales', 'other'],
    required: true
  },
  discType: {
    enum: ['D', 'I', 'S', 'C', 'ALL'],
    required: true
  }
}

// Validation result type
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  sanitizedValue?: string
}

// Sanitize HTML content to prevent XSS
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: []
  })
}

// Sanitize plain text input
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 10000) // Limit length
}

// Validate email format
export function validateEmail(email: string): ValidationResult {
  const sanitized = sanitizeText(email)
  const errors: string[] = []
  
  if (!ValidationRules.profileEmail.pattern.test(sanitized)) {
    errors.push('Invalid email format')
  }
  
  if (sanitized.length > ValidationRules.profileEmail.maxLength) {
    errors.push(`Email must be less than ${ValidationRules.profileEmail.maxLength} characters`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  }
}

// Validate profile name
export function validateProfileName(name: string): ValidationResult {
  const sanitized = sanitizeText(name)
  const errors: string[] = []
  
  if (sanitized.length < ValidationRules.profileName.minLength) {
    errors.push('Name is required')
  }
  
  if (sanitized.length > ValidationRules.profileName.maxLength) {
    errors.push(`Name must be less than ${ValidationRules.profileName.maxLength} characters`)
  }
  
  if (!ValidationRules.profileName.pattern.test(sanitized)) {
    errors.push('Name contains invalid characters. Only letters, spaces, hyphens, apostrophes, and periods are allowed')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  }
}

// Validate LinkedIn URL
export function validateLinkedInUrl(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: true, errors: [], sanitizedValue: '' }
  }
  
  const sanitized = sanitizeText(url)
  const errors: string[] = []
  
  if (sanitized.length > ValidationRules.profileLinkedIn.maxLength) {
    errors.push(`LinkedIn URL must be less than ${ValidationRules.profileLinkedIn.maxLength} characters`)
  }
  
  if (!ValidationRules.profileLinkedIn.pattern.test(sanitized)) {
    errors.push('Invalid LinkedIn URL format. Must start with https://linkedin.com/ or https://www.linkedin.com/')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  }
}

// Validate analysis text
export function validateAnalysisText(text: string): ValidationResult {
  const sanitized = sanitizeText(text)
  const errors: string[] = []
  
  if (sanitized.length < ValidationRules.analysisText.minLength) {
    errors.push(`Analysis text must be at least ${ValidationRules.analysisText.minLength} characters`)
  }
  
  if (sanitized.length > ValidationRules.analysisText.maxLength) {
    errors.push(`Analysis text must be less than ${ValidationRules.analysisText.maxLength} characters`)
  }
  
  // Check for potentially malicious content
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      errors.push('Text contains potentially unsafe content')
      break
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  }
}

// Validate template name
export function validateTemplateName(name: string): ValidationResult {
  const sanitized = sanitizeText(name)
  const errors: string[] = []
  
  if (sanitized.length < ValidationRules.templateName.minLength) {
    errors.push('Template name is required')
  }
  
  if (sanitized.length > ValidationRules.templateName.maxLength) {
    errors.push(`Template name must be less than ${ValidationRules.templateName.maxLength} characters`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  }
}

// Validate template content
export function validateTemplateContent(content: string): ValidationResult {
  const sanitized = sanitizeText(content)
  const errors: string[] = []
  
  if (sanitized.length < ValidationRules.templateContent.minLength) {
    errors.push(`Template content must be at least ${ValidationRules.templateContent.minLength} characters`)
  }
  
  if (sanitized.length > ValidationRules.templateContent.maxLength) {
    errors.push(`Template content must be less than ${ValidationRules.templateContent.maxLength} characters`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitized
  }
}

// Validate DISC type
export function validateDiscType(discType: string): ValidationResult {
  const errors: string[] = []
  
  if (!ValidationRules.discType.enum.includes(discType)) {
    errors.push('Invalid DISC type. Must be D, I, S, C, or ALL')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: discType
  }
}

// Validate template category
export function validateTemplateCategory(category: string): ValidationResult {
  const errors: string[] = []
  
  if (!ValidationRules.templateCategory.enum.includes(category)) {
    errors.push('Invalid template category. Must be email, meeting, sales, or other')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: category
  }
}

// Comprehensive profile validation
export function validateProfileData(data: {
  targetName: string
  targetEmail?: string
  targetLinkedin?: string
  analysisText: string
}) {
  const results = {
    targetName: validateProfileName(data.targetName),
    targetEmail: data.targetEmail ? validateEmail(data.targetEmail) : { isValid: true, errors: [], sanitizedValue: '' },
    targetLinkedin: data.targetLinkedin ? validateLinkedInUrl(data.targetLinkedin) : { isValid: true, errors: [], sanitizedValue: '' },
    analysisText: validateAnalysisText(data.analysisText)
  }
  
  const allErrors = Object.values(results).flatMap(result => result.errors)
  const isValid = allErrors.length === 0
  
  return {
    isValid,
    errors: allErrors,
    sanitizedData: {
      targetName: results.targetName.sanitizedValue || '',
      targetEmail: results.targetEmail.sanitizedValue || '',
      targetLinkedin: results.targetLinkedin.sanitizedValue || '',
      analysisText: results.analysisText.sanitizedValue || ''
    }
  }
}

// Comprehensive template validation
export function validateTemplateData(data: {
  name: string
  category: string
  disc_type: string
  template_content: string
  description?: string
}) {
  const results = {
    name: validateTemplateName(data.name),
    category: validateTemplateCategory(data.category),
    disc_type: validateDiscType(data.disc_type),
    template_content: validateTemplateContent(data.template_content),
    description: data.description ? { isValid: true, errors: [], sanitizedValue: sanitizeText(data.description) } : { isValid: true, errors: [], sanitizedValue: '' }
  }
  
  const allErrors = Object.values(results).flatMap(result => result.errors)
  const isValid = allErrors.length === 0
  
  return {
    isValid,
    errors: allErrors,
    sanitizedData: {
      name: results.name.sanitizedValue || '',
      category: results.category.sanitizedValue || '',
      disc_type: results.disc_type.sanitizedValue || '',
      template_content: results.template_content.sanitizedValue || '',
      description: results.description.sanitizedValue || ''
    }
  }
}