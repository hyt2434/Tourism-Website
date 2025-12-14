### Environment Setup

Create a `.env` file in the `backend/` folder with the following structure:

# Database configuration
DB_HOST=""
DB_NAME=""
DB_USER=""
DB_PASSWORD=""
DB_PORT=""

# Secret key for session management
SECRET_KEY=MagicTourismSecretKey

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
# IMPORTANT: In Google Cloud Console, add this Authorized redirect URI:
# http://127.0.0.1:5000/api/auth/google/callback
# (or your production URL + /api/auth/google/callback)

# Facebook OAuth
FACEBOOK_CLIENT_ID=YOUR_FACEBOOK_CLIENT_ID_HERE
FACEBOOK_CLIENT_SECRET=YOUR_FACEBOOK_CLIENT_SECRET_HERE

# Redirect URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://127.0.0.1:5000

# SendGrid Email Service
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Tourism Website

> ⚠️ Each developer should create their own `.env` file locally.  
> Do **not** commit `.env` to GitHub. OAuth credentials must remain private.

## SendGrid Setup Instructions

1. Sign up for SendGrid account at https://sendgrid.com
2. Verify your sender email address or domain
3. Create an API Key:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Give it a name (e.g., "Tourism Website Production")
   - Select "Full Access" or "Mail Send" permissions
   - Copy the API key (you'll only see it once!)
4. Add the API key to your `.env` file as `SENDGRID_API_KEY`
5. Set `FROM_EMAIL` to your verified sender email
6. Set `FROM_NAME` to your desired sender name
