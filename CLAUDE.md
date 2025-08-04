# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Crystal Knows clone - a personality insights platform for better communication. Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Key Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Architecture

### Tech Stack
- **Frontend/Backend**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

### Project Structure
```
src/
├── app/
│   ├── auth/           # Authentication pages (login, signup)
│   ├── dashboard/      # Protected dashboard pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/
│   └── ui/             # shadcn/ui components
├── lib/
│   ├── supabase/       # Supabase client configurations
│   └── utils.ts        # Utility functions
└── middleware.ts       # Auth middleware
```

### Database Schema
- `profiles` - User profile information
- `personality_profiles` - DISC personality analysis data
- `communication_templates` - Template library
- `usage_logs` - Feature usage tracking
- `subscriptions` - User subscription management

### Key Features Implemented
1. **AI-Powered Personality Analysis** - Claude 3.5 Haiku via OpenRouter for DISC analysis
2. **Communication Assistant** - Personalized templates and AI-powered suggestions
3. **Dashboard** - Profile management and analytics
4. **Subscription System** - Free/Premium tiers with usage limits
5. **Template System** - Pre-built communication templates for each DISC type
6. **Writing Assistant** - Real-time personality-based communication tips

## Environment Setup

Create `.env.local` with:
```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenRouter AI Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=anthropic/claude-3.5-haiku
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase Setup

1. Run the SQL schema in `supabase-schema.sql` to create tables and policies
2. Enable Row Level Security (RLS) for data protection
3. Configure authentication providers as needed

## Development Notes

- Uses App Router with Server Components by default
- Authentication handled via middleware for protected routes
- Supabase client is split between browser/server configurations
- shadcn/ui components use the `@/` import alias
- All database operations should respect RLS policies

## AI Integration

- **Claude 3.5 Haiku** via OpenRouter for personality analysis
- Cost-effective: ~$0.01-0.03 per analysis
- Automatic fallback to basic analysis if AI unavailable
- Sophisticated DISC analysis with detailed insights
- 30-second timeout protection and error handling