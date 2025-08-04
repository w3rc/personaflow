-- Enhanced Row Level Security Policies for PersonaFlow
-- Run these commands in your Supabase SQL editor to enhance security

-- ============================================================================
-- PERSONALITY PROFILES SECURITY
-- ============================================================================

-- Enhanced RLS policies for personality_profiles
DROP POLICY IF EXISTS "Users can view own profiles" ON personality_profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON personality_profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON personality_profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON personality_profiles;

-- More comprehensive policies
CREATE POLICY "Users can view own profiles" ON personality_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles" ON personality_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    target_name IS NOT NULL AND
    LENGTH(target_name) > 0 AND
    LENGTH(target_name) <= 100 AND
    disc_type IN ('D', 'I', 'S', 'C') AND
    confidence_score >= 0 AND 
    confidence_score <= 1
  );

CREATE POLICY "Users can update own profiles" ON personality_profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    target_name IS NOT NULL AND
    LENGTH(target_name) > 0 AND
    LENGTH(target_name) <= 100 AND
    disc_type IN ('D', 'I', 'S', 'C') AND
    confidence_score >= 0 AND 
    confidence_score <= 1
  );

CREATE POLICY "Users can delete own profiles" ON personality_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- COMMUNICATION TEMPLATES SECURITY
-- ============================================================================

-- Enhanced RLS policies for communication_templates
DROP POLICY IF EXISTS "Users can view own templates" ON communication_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON communication_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON communication_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON communication_templates;

CREATE POLICY "Users can view own templates" ON communication_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON communication_templates
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    name IS NOT NULL AND
    LENGTH(name) > 0 AND
    LENGTH(name) <= 200 AND
    category IN ('email', 'meeting', 'sales', 'other') AND
    disc_type IN ('D', 'I', 'S', 'C', 'ALL') AND
    template_content IS NOT NULL AND
    LENGTH(template_content) >= 10 AND
    LENGTH(template_content) <= 5000
  );

CREATE POLICY "Users can update own templates" ON communication_templates
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    name IS NOT NULL AND
    LENGTH(name) > 0 AND
    LENGTH(name) <= 200 AND
    category IN ('email', 'meeting', 'sales', 'other') AND
    disc_type IN ('D', 'I', 'S', 'C', 'ALL') AND
    template_content IS NOT NULL AND
    LENGTH(template_content) >= 10 AND
    LENGTH(template_content) <= 5000
  );

CREATE POLICY "Users can delete own templates" ON communication_templates
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- USAGE LOGS SECURITY
-- ============================================================================

-- Enhanced RLS policies for usage_logs
DROP POLICY IF EXISTS "Users can view own logs" ON usage_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON usage_logs;

CREATE POLICY "Users can view own logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs" ON usage_logs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    action IS NOT NULL AND
    LENGTH(action) > 0 AND
    action IN ('profile_created', 'profile_updated', 'profile_deleted', 'template_created', 'template_updated', 'template_deleted', 'template_used', 'analysis_performed')
  );

-- Prevent users from updating or deleting logs (audit trail)
CREATE POLICY "Prevent log modifications" ON usage_logs
  FOR UPDATE USING (false);

CREATE POLICY "Prevent log deletion" ON usage_logs
  FOR DELETE USING (false);

-- ============================================================================
-- SUBSCRIPTIONS SECURITY
-- ============================================================================

-- Enhanced RLS policies for subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Only allow updating specific fields, not plan type (prevent self-upgrade)
CREATE POLICY "Users can update subscription usage only" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    plan_type = OLD.plan_type AND -- Prevent plan type changes
    monthly_profile_limit = OLD.monthly_profile_limit AND -- Prevent limit changes
    profiles_used >= 0 AND
    profiles_used <= monthly_profile_limit
  );

-- Prevent users from inserting or deleting subscriptions
CREATE POLICY "Prevent subscription creation" ON subscriptions
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Prevent subscription deletion" ON subscriptions
  FOR DELETE USING (false);

-- ============================================================================
-- PROFILES TABLE SECURITY (User profiles, not personality profiles)
-- ============================================================================

-- Enhanced RLS policies for profiles (user account info)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (email IS NULL OR LENGTH(email) <= 254) AND
    (full_name IS NULL OR LENGTH(full_name) <= 100)
  );

-- Allow users to insert their own profile on signup
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Prevent profile deletion (for audit purposes)
CREATE POLICY "Prevent profile deletion" ON profiles
  FOR DELETE USING (false);

-- ============================================================================
-- ADDITIONAL SECURITY FUNCTIONS
-- ============================================================================

-- Function to check if user has reached profile limit
CREATE OR REPLACE FUNCTION check_profile_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_subscription RECORD;
  current_usage INTEGER;
BEGIN
  -- Get user's subscription info
  SELECT monthly_profile_limit, profiles_used 
  INTO user_subscription
  FROM subscriptions 
  WHERE user_id = NEW.user_id;
  
  -- Count current profiles
  SELECT COUNT(*) 
  INTO current_usage
  FROM personality_profiles 
  WHERE user_id = NEW.user_id;
  
  -- Check if limit would be exceeded
  IF current_usage >= COALESCE(user_subscription.monthly_profile_limit, 5) THEN
    RAISE EXCEPTION 'Profile limit exceeded for user. Upgrade your plan to create more profiles.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to enforce profile limits
DROP TRIGGER IF EXISTS enforce_profile_limit ON personality_profiles;
CREATE TRIGGER enforce_profile_limit
  BEFORE INSERT ON personality_profiles
  FOR EACH ROW EXECUTE FUNCTION check_profile_limit();

-- ============================================================================
-- SECURITY AUDIT FUNCTIONS
-- ============================================================================

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  event_type TEXT,
  user_id UUID,
  details JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_logs (user_id, action, metadata, created_at)
  VALUES (user_id, event_type, details, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INDEXES FOR PERFORMANCE AND SECURITY
-- ============================================================================

-- Ensure efficient queries while maintaining security
CREATE INDEX IF NOT EXISTS idx_personality_profiles_user_id ON personality_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_personality_profiles_created_at ON personality_profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_communication_templates_user_id ON communication_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_templates_category ON communication_templates(category);
CREATE INDEX IF NOT EXISTS idx_communication_templates_disc_type ON communication_templates(disc_type);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify RLS is working correctly:

-- 1. Test that users can only see their own data
-- SELECT * FROM personality_profiles; -- Should only show current user's profiles

-- 2. Test that invalid data is rejected
-- INSERT INTO personality_profiles (user_id, target_name, disc_type) 
-- VALUES (auth.uid(), '', 'INVALID'); -- Should fail

-- 3. Test profile limit enforcement
-- Check current usage: SELECT COUNT(*) FROM personality_profiles WHERE user_id = auth.uid();
-- Check limit: SELECT monthly_profile_limit FROM subscriptions WHERE user_id = auth.uid();

-- ============================================================================
-- CLEANUP COMMANDS (if needed)
-- ============================================================================

-- Uncomment and run these if you need to start fresh:
-- DROP TRIGGER IF EXISTS enforce_profile_limit ON personality_profiles;
-- DROP FUNCTION IF EXISTS check_profile_limit();
-- DROP FUNCTION IF EXISTS log_security_event(TEXT, UUID, JSONB);