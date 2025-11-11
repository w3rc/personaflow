-- Migration: Add AI Tool Conversations Table
-- Description: Stores chat history for AI communication tools on profile pages
-- Date: 2025-11-12

-- Create ai_tool_conversations table
CREATE TABLE IF NOT EXISTS public.ai_tool_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.personality_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL CHECK (tool_name IN ('first_message', 'email_composer', 'meeting_prep', 'relationship_builder')),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, user_id, tool_name)
);

-- Enable Row Level Security
ALTER TABLE public.ai_tool_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own tool conversations"
  ON public.ai_tool_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tool conversations"
  ON public.ai_tool_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tool conversations"
  ON public.ai_tool_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tool conversations"
  ON public.ai_tool_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for auto-updating updated_at column
CREATE TRIGGER update_ai_tool_conversations_updated_at
  BEFORE UPDATE ON public.ai_tool_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_tool_conversations_profile_user
  ON public.ai_tool_conversations(profile_id, user_id, tool_name);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_ai_tool_conversations_user
  ON public.ai_tool_conversations(user_id);

-- Comments for documentation
COMMENT ON TABLE public.ai_tool_conversations IS 'Stores chat history for AI communication tools on profile pages';
COMMENT ON COLUMN public.ai_tool_conversations.tool_name IS 'Type of AI tool: first_message, email_composer, meeting_prep, or relationship_builder';
COMMENT ON COLUMN public.ai_tool_conversations.messages IS 'Array of chat messages in format: [{role: "user"|"assistant", content: string, timestamp: string}]';
