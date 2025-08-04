# PersonaFlow

> AI-powered personality insights for better communication

PersonaFlow is a modern web application that analyzes personality types using the DISC framework and AI to help users communicate more effectively and build stronger relationships.

## 🌟 Features

- **AI-Powered Analysis**: Advanced personality analysis using Claude 3.5 Haiku
- **DISC Framework**: Industry-standard personality assessment
- **Communication Templates**: Pre-built templates optimized for different personality types
- **Writing Assistant**: AI-powered suggestions for personalized communication
- **LinkedIn Integration**: Enhanced content collection from LinkedIn profiles
- **Profile Management**: Secure storage and management of personality profiles
- **Subscription Plans**: Flexible pricing with usage limits

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **AI**: OpenRouter API with Claude 3.5 Haiku
- **Deployment**: Vercel-ready

## 🛡️ Security Features

- ✅ Comprehensive input validation and sanitization
- ✅ Row Level Security (RLS) policies
- ✅ API key protection and secure error handling
- ✅ Rate limiting and abuse prevention
- ✅ XSS protection with DOMPurify
- ✅ Error boundaries and graceful degradation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd personaflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your actual values:
   - Supabase URL and keys from [Supabase Dashboard](https://app.supabase.com/)
   - OpenRouter API key from [OpenRouter](https://openrouter.ai/keys)

4. **Set up the database**
   - Run the SQL in `supabase-schema.sql` in your Supabase SQL editor
   - Optionally run `supabase-security-enhancements.sql` for enhanced security

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (safe for browser)
- `OPENROUTER_API_KEY`: OpenRouter API key (keep secret)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (unused but available)

### Database Schema

The application uses several tables:
- `profiles`: User account information
- `personality_profiles`: DISC analysis results
- `communication_templates`: Email/message templates
- `subscriptions`: User plan and usage limits
- `usage_logs`: Audit trail and analytics

## 🎯 Usage

1. **Sign up** for a PersonaFlow account
2. **Create a profile** by analyzing someone's written communication
3. **Get AI insights** about their personality type (DISC)
4. **Use templates** to craft personalized messages
5. **Writing assistant** helps optimize your communication style

## 📈 DISC Personality Types

- **D (Dominance)**: Direct, results-oriented, decisive
- **I (Influence)**: Outgoing, enthusiastic, people-focused
- **S (Steadiness)**: Patient, reliable, supportive
- **C (Conscientiousness)**: Analytical, detailed, systematic

## 🔒 Security

PersonaFlow follows security best practices:

- All user inputs are validated and sanitized
- Database operations use Row Level Security
- API keys are properly protected
- Error messages don't expose sensitive data
- Rate limiting prevents abuse

See `SECURITY.md` for detailed security information.

## 📋 Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Monitoring

### Production Monitoring

- Monitor API usage in OpenRouter dashboard
- Track database performance in Supabase
- Set up error tracking (Sentry recommended)
- Monitor costs and usage limits

### Analytics

- User registration and engagement
- Profile creation trends
- Template usage statistics
- AI analysis accuracy metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

- 📧 Email: support@personaflow.com
- 📖 Documentation: See `SECURITY.md` and inline comments
- 🐛 Issues: Create an issue in this repository

## 🔮 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] API access for integrations
- [ ] Mobile app development
- [ ] Advanced AI models
- [ ] Multi-language support

---

Built with ❤️ using Next.js, Supabase, and OpenRouter AI