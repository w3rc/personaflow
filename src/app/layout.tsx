import type { Metadata } from 'next'
import './globals.css'
import ErrorBoundary from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'PersonaFlow',
  description: 'AI-powered personality insights for better communication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}