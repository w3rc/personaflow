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

### Key Features to Implement
1. **Personality Analysis Engine** - DISC personality prediction from text/data
2. **Communication Assistant** - Personalized templates and suggestions
3. **Dashboard** - Profile management and analytics
4. **Subscription System** - Free/Premium tiers with usage limits

## Environment Setup

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
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