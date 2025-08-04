# Security Guide

## Environment Variables Setup

### Required Environment Variables

Copy `.env.example` to `.env.local` and fill in your actual values:

```bash
cp .env.example .env.local
```

### Supabase Configuration

1. **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
   - Get from: [Supabase Dashboard](https://app.supabase.com/) → Your Project → Settings → API
   - Safe to expose in browser (NEXT_PUBLIC_ prefix)

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anonymous key
   - Get from: Supabase Dashboard → Your Project → Settings → API → anon/public key
   - Safe to expose in browser - designed for client-side use
   - Security enforced by Row Level Security (RLS) policies

3. **SUPABASE_SERVICE_ROLE_KEY**: Your Supabase service role key (OPTIONAL)
   - Get from: Supabase Dashboard → Your Project → Settings → API → service_role key
   - ⚠️ **CRITICAL**: Never expose this key to the browser
   - Currently not used in the application (good security practice)
   - Only use for admin operations that bypass RLS
   - **Can be removed** if you're certain you won't need admin database access

### OpenRouter Configuration

4. **OPENROUTER_API_KEY**: Your OpenRouter API key
   - Get from: [OpenRouter Keys](https://openrouter.ai/keys)
   - ⚠️ **KEEP SECRET**: This key incurs costs and should never be exposed
   - Used server-side only for AI personality analysis

5. **OPENROUTER_MODEL**: AI model to use (default: anthropic/claude-3.5-haiku)

## Security Best Practices

### ✅ What We Do Right

- **Row Level Security**: All database operations enforce user ownership
- **Server-side API routes**: Sensitive operations happen server-side
- **Input validation**: API endpoints validate required fields
- **Authentication checks**: All protected routes verify user authentication
- **Service role key**: Not used (prevents accidental RLS bypass)

### ⚠️ Current Security Considerations

1. **Supabase Anon Key Exposure**: 
   - This is normal and safe for Supabase
   - Real security comes from RLS policies
   - Monitor usage in Supabase dashboard

2. **API Rate Limiting**:
   - OpenRouter API calls should be rate-limited
   - Consider implementing request queuing for heavy usage

3. **Input Sanitization**:
   - User inputs are validated but not fully sanitized
   - Consider adding XSS protection for text content

## Database Security (Supabase RLS)

All tables have Row Level Security enabled:

```sql
-- Users can only access their own profiles
ALTER TABLE personality_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profiles" ON personality_profiles 
FOR SELECT USING (auth.uid() = user_id);

-- Users can only access their own templates  
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own templates" ON communication_templates 
FOR SELECT USING (auth.uid() = user_id);
```

## API Security

### Protected Routes

All API routes verify authentication:

```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user || user.id !== userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Rate Limiting

Consider implementing rate limiting for:
- Profile creation (prevent spam)
- AI analysis requests (prevent API abuse)
- Template creation (prevent database flooding)

## Deployment Security

### Environment Variables in Production

Never commit real values to git:
- Use your hosting platform's environment variable system
- Rotate keys regularly
- Monitor API usage for unusual activity

### HTTPS Enforcement

Ensure all production traffic uses HTTPS:
- Supabase automatically uses HTTPS
- Configure your hosting platform for HTTPS
- Update NEXT_PUBLIC_SITE_URL to use https:// in production

## Monitoring

### Supabase Dashboard

Monitor in Supabase dashboard:
- API usage and quotas
- Authentication logs
- Database performance
- RLS policy effectiveness

### OpenRouter Usage

Monitor in OpenRouter dashboard:
- API costs and usage
- Rate limit status
- Error rates

## Security Checklist

Before deployment:

- [ ] All environment variables use placeholders in .env.example
- [ ] Real API keys are not committed to version control
- [ ] .env.local is in .gitignore
- [ ] RLS policies are enabled and tested
- [ ] API endpoints validate authentication
- [ ] HTTPS is configured in production
- [ ] Monitoring is set up for API usage

## Emergency Response

If API keys are compromised:

1. **Supabase**: Regenerate keys in dashboard, update environment variables
2. **OpenRouter**: Regenerate API key, monitor for unauthorized usage
3. **Review logs**: Check for unauthorized access or unusual patterns
4. **Update credentials**: Ensure new keys are properly secured

## Contact

For PersonaFlow security concerns or questions:
- Review this documentation first
- Check Supabase and OpenRouter documentation
- Consider security audit for production deployment