'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring (in production, send to error tracking service)
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    })

    // In production, you would send this to an error reporting service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.retry} />
      }

      return <DefaultErrorFallback error={this.state.error!} retry={this.retry} />
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  // Sanitize error message to prevent sensitive data exposure
  const sanitizedMessage = getSafeErrorMessage(error)
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground font-mono">
              {sanitizedMessage}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={retry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="text-sm cursor-pointer text-muted-foreground">
                Technical Details (Development Only)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Sanitize error messages to prevent sensitive data exposure
function getSafeErrorMessage(error: Error): string {
  const message = error.message || 'An unexpected error occurred'
  
  // List of sensitive patterns to remove from error messages
  const sensitivePatterns = [
    /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, // API tokens
    /sk-[A-Za-z0-9]+/g, // OpenRouter API keys
    /key[_-]?\w*[:\s=]+['"]*([A-Za-z0-9\-._~+/]+=*)['"]*$/gi, // Generic API keys
    /password[:\s=]+['"]*([^'"]+)['"]*$/gi, // Passwords
    /token[:\s=]+['"]*([A-Za-z0-9\-._~+/]+=*)['"]*$/gi, // Tokens
    /eyJ[A-Za-z0-9\-._~+/]+=*/g, // JWT tokens
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, // Email addresses (be careful with this one)
  ]
  
  let sanitized = message
  
  // Remove sensitive patterns
  sensitivePatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]')
  })
  
  // Limit message length
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200) + '...'
  }
  
  return sanitized
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: string) => {
    console.error('Error caught by useErrorHandler:', error)
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: reportError(error, errorInfo)
    }
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Error boundary for API calls
export function ApiErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  const sanitizedMessage = getSafeErrorMessage(error)
  
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Request Failed
        </CardTitle>
        <CardDescription>
          We couldn&apos;t complete your request. Please check your connection and try again.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-muted p-2 rounded text-sm">
          {sanitizedMessage}
        </div>
        <Button onClick={retry} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

export default ErrorBoundary