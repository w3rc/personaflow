-- Migration: Add AI Tool Custom Prompts Table
-- Description: Stores user-customized prompts for AI communication tools
-- Date: 2025-11-12

-- Create ai_tool_prompts table
CREATE TABLE IF NOT EXISTS public.ai_tool_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL CHECK (tool_name IN ('first_message', 'email_composer', 'meeting_prep', 'relationship_builder')),
  custom_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_name)
);

-- Enable Row Level Security
ALTER TABLE public.ai_tool_prompts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own tool prompts"
  ON public.ai_tool_prompts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tool prompts"
  ON public.ai_tool_prompts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tool prompts"
  ON public.ai_tool_prompts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tool prompts"
  ON public.ai_tool_prompts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for auto-updating updated_at column
CREATE TRIGGER update_ai_tool_prompts_updated_at
  BEFORE UPDATE ON public.ai_tool_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_tool_prompts_user_tool
  ON public.ai_tool_prompts(user_id, tool_name);

-- Comments for documentation
COMMENT ON TABLE public.ai_tool_prompts IS 'Stores user-customized system prompts for AI communication tools';
COMMENT ON COLUMN public.ai_tool_prompts.tool_name IS 'Type of AI tool: first_message, email_composer, meeting_prep, or relationship_builder';
COMMENT ON COLUMN public.ai_tool_prompts.custom_prompt IS 'User-defined system prompt that overrides the default prompt';
COMMENT ON COLUMN public.ai_tool_prompts.is_active IS 'Whether to use this custom prompt (true) or fall back to default (false)';
