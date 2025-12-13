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

> ⚠️ Each developer should create their own `.env` file locally.  
> Do **not** commit `.env` to GitHub. OAuth credentials must remain private.
