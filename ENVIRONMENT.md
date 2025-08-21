# Environment Variables Setup

## Required Environment Variables

### Google Maps API Key
For the contact page interactive map to work, you need to set up a Google Maps API key:

1. **Get API Key**: Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. **Create Credentials**: Create a new API key for Maps JavaScript API
3. **Restrict Key**: Add domain restrictions for security
4. **Set Environment Variable**: 
   - **Local Development**: Create `.env` file with `PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here`
   - **Vercel Production**: Add in Vercel dashboard under Environment Variables

### Security Notes
- **Never commit API keys** to the repository
- **Always restrict API keys** to specific domains
- **Use environment variables** for all sensitive data
- **Rotate keys regularly** for security

### Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add: `PUBLIC_GOOGLE_MAPS_API_KEY` with your restricted API key
4. Deploy to apply changes

## Current Status
- ✅ API key removed from public code
- ✅ Fallback content displays when no API key
- ✅ WhatsApp contact still works
- ⚠️ Map requires environment variable setup
