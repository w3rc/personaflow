import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Crystal Knows Clone',
  description: 'Personality insights platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}