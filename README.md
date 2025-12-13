# Tourism Website - Complete Travel Management Platform

A comprehensive full-stack tourism website built with React and Flask, featuring tour booking, partner services management, social interactions, payment processing, and administrative controls.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Backend Features](#backend-features)
- [Authentication & Authorization](#authentication--authorization)
- [Payment Integration](#payment-integration)
- [Email Service](#email-service)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This is a complete tourism management platform that allows users to:
- Browse and book tours with detailed itineraries
- Manage partner services (accommodations, restaurants, transportation)
- Interact through a social media-like feed
- Process payments securely via Stripe
- Administer the platform with comprehensive management tools

The platform supports three user roles: **Clients**, **Partners**, and **Admins**, each with specific permissions and features.

## ✨ Features

### For Clients
- 🔍 **Tour Discovery**: Browse tours with filters, search, and detailed information
- 📅 **Tour Booking**: Book tours with customizations (room upgrades, meal selections)
- 💳 **Secure Payments**: Stripe integration for card payments
- ⭐ **Reviews & Ratings**: Leave reviews for tours and services
- ❤️ **Favorites**: Save favorite tours for later
- 📱 **Social Feed**: Share experiences, like, comment, and follow users
- 🌐 **Multi-language**: English and Vietnamese support
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📧 **Email Notifications**: Booking confirmations, password resets, etc.

### For Partners
- 🏨 **Service Management**: Manage accommodations, restaurants, or transportation services
- 📊 **Revenue Tracking**: View earnings and pending payments
- 📅 **Booking Management**: View and manage bookings for their services
- ⭐ **Review Management**: Respond to customer reviews
- 📈 **Analytics**: Track service performance and bookings
- 🎫 **Schedule Management**: Create and manage tour schedules

### For Admins
- 👥 **User Management**: Manage users, roles, and permissions
- 🎫 **Tour Management**: Create, edit, and manage tours with detailed itineraries
- 🤝 **Partner Approval**: Approve or reject partner registrations
- 📊 **Statistics Dashboard**: View platform-wide statistics and analytics
- 💰 **Promotion Management**: Create and manage promotional codes and banners
- 📝 **Content Moderation**: Moderate social posts and comments
- 📅 **Schedule Management**: Manage tour schedules and availability

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **React Hook Form** - Form management
- **Stripe.js** - Payment processing
- **Leaflet** - Interactive maps
- **Swiper** - Touch slider
- **Sonner** - Toast notifications

### Backend
- **Flask** - Python web framework
- **PostgreSQL** - Relational database
- **psycopg2** - PostgreSQL adapter
- **Flask-CORS** - Cross-origin resource sharing
- **Flask-Bcrypt** - Password hashing
- **python-dotenv** - Environment variable management
- **Stripe** - Payment processing API
- **SendGrid** - Email service
- **requests-oauthlib** - OAuth authentication (Google)

### Development Tools
- **ESLint** - JavaScript linting
- **Black** - Python code formatter
- **Ruff** - Python linter
- **pytest** - Python testing framework

## 📁 Project Structure

```
Tourism-Website/
├── backend/                    # Flask backend application
│   ├── app.py                  # Main Flask application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── config/                 # Configuration files
│   │   └── database.py         # Database connection setup
│   ├── src/
│   │   ├── models/             # Database models and schemas
│   │   │   ├── models.py       # Core models (users, posts, comments, etc.)
│   │   │   ├── tour_schema.py  # Tour management schema
│   │   │   ├── partner_services_schema.py  # Partner services schema
│   │   │   └── tour_reviews_schema.py      # Tour reviews schema
│   │   ├── routes/             # API route handlers
│   │   │   ├── user/           # User authentication routes
│   │   │   ├── admin/          # Admin management routes
│   │   │   ├── partner/        # Partner service routes
│   │   │   ├── tour_routes.py  # Tour-related endpoints
│   │   │   ├── booking_routes.py
│   │   │   ├── payment_routes.py
│   │   │   ├── social_routes.py
│   │   │   └── ...
│   │   └── services/           # Business logic services
│   │       ├── email_service.py
│   │       └── city_init.py
│   ├── seed/                   # Database seeding scripts
│   └── migrate_*.py            # Database migration scripts
│
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── api/                # API client functions
│   │   ├── components/         # React components
│   │   │   ├── home/          # Homepage components
│   │   │   ├── TourDetail/    # Tour detail page components
│   │   │   ├── Partner/       # Partner management components
│   │   │   ├── AdminSections/ # Admin dashboard components
│   │   │   ├── social/        # Social feed components
│   │   │   └── ui/            # Reusable UI components
│   │   ├── context/           # React context providers
│   │   ├── locales/           # Translation files
│   │   ├── styles/            # Global styles
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Application entry point
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.js         # Vite configuration
│   └── tailwind.config.js     # Tailwind CSS configuration
│
└── README.md                   # This file
```

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 16+ and npm (or yarn)
- **Python** 3.8+
- **PostgreSQL** 12+
- **Git**

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables** (see [Environment Variables](#environment-variables))

6. **Initialize database** (see [Database Setup](#database-setup))

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_PORT=5432

# Flask Configuration
SECRET_KEY=your_secret_key_here
PORT=5000

# OAuth Configuration (Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://127.0.0.1:5000

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Tourism Website

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Default Admin (Optional)
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=Admin@123456
DEFAULT_ADMIN_USERNAME=Administrator
```

### Setting up OAuth

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://127.0.0.1:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### Setting up SendGrid

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your sender email address or domain
3. Create an API Key:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Select "Full Access" or "Mail Send" permissions
   - Copy the API key (shown only once)
4. Add the API key to `.env` as `SENDGRID_API_KEY`
5. Set `FROM_EMAIL` to your verified sender email

### Setting up Stripe

1. Sign up at [Stripe](https://stripe.com/)
2. Get your API keys from the Dashboard
3. Add `STRIPE_SECRET_KEY` to backend `.env`
4. Add `STRIPE_PUBLISHABLE_KEY` to frontend environment or config

## 🗄️ Database Setup

1. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE your_database_name;
   ```

2. **Run the Flask application** - Tables will be created automatically on first run:
   ```bash
   cd backend
   python app.py
   ```

   The application will automatically:
   - Create all necessary tables
   - Create a default admin user (if none exists)
   - Initialize cities data
   - Set up database indexes

3. **Optional: Seed initial data:**
   ```bash
   cd backend/seed
   python seed_data.py
   python import_tour_images.py
   ```

## ▶️ Running the Application

### Development Mode

1. **Start the backend server:**
   ```bash
   cd backend
   python app.py
   ```
   Backend will run on `http://127.0.0.1:5000`

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Production Build

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/google` - Google OAuth login

### Tour Endpoints

- `GET /api/tours` - Get all tours (with filters)
- `GET /api/tours/:id` - Get tour details
- `GET /api/tours/highlights` - Get highlighted tours
- `GET /api/tours/search` - Search tours
- `GET /api/tours/:id/schedules` - Get tour schedules
- `GET /api/tours/:id/reviews` - Get tour reviews
- `POST /api/tours/:id/reviews` - Create tour review

### Booking Endpoints

- `POST /api/bookings/create` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Payment Endpoints

- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-payment` - Confirm payment

### Partner Service Endpoints

- `GET /api/partner/accommodations` - Get accommodations
- `POST /api/partner/accommodations` - Create accommodation
- `GET /api/partner/restaurants` - Get restaurants
- `POST /api/partner/restaurants` - Create restaurant
- `GET /api/partner/transportation` - Get transportation services
- `POST /api/partner/transportation` - Create transportation service

### Social Endpoints

- `GET /api/social/posts` - Get social feed posts
- `POST /api/social/posts` - Create post
- `POST /api/social/posts/:id/like` - Like/unlike post
- `POST /api/social/posts/:id/comments` - Add comment
- `GET /api/social/posts/:id/comments` - Get comments

### Admin Endpoints

- `GET /api/admin/tours` - Get all tours (admin)
- `POST /api/admin/tours` - Create tour
- `PUT /api/admin/tours/:id` - Update tour
- `DELETE /api/admin/tours/:id` - Delete tour
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user

## 🎨 Frontend Features

### Pages & Routes

- `/` - Homepage with hero, tours, promotions, reviews
- `/tour` - Tours listing page with filters
- `/tours/:id` - Tour detail page with booking
- `/login` - User login
- `/register` - User registration
- `/profile` - User profile management
- `/account` - Account settings
- `/social` - Social feed
- `/partner/manage` - Partner dashboard
- `/partner/reviews` - Service reviews management
- `/admin` - Admin dashboard
- `/aboutus` - About us page

### Key Components

- **TourCarousel** - Featured tours carousel
- **TourDetail** - Comprehensive tour detail view
- **EnhancedBookingPanel** - Advanced booking with customizations
- **SocialPage** - Social media-like feed
- **AdminPage** - Admin management dashboard
- **PartnerManagePage** - Partner service management
- **FilterSidebar** - Tour filtering interface

### State Management

- **LanguageContext** - Multi-language support (EN/VI)
- **ToastContext** - Toast notifications
- **LocalStorage** - User session persistence

## 🔧 Backend Features

### Database Schema

#### Core Tables
- `users` - User accounts with roles
- `cities` - City/province data
- `posts` - Social media posts
- `comments` - Post comments
- `likes` - Post likes
- `favorites` - User favorite tours

#### Tour Management
- `tours_admin` - Tour information
- `tour_images` - Tour images
- `tour_daily_itinerary` - Day-by-day itinerary
- `tour_time_checkpoints` - Time-based activities
- `tour_schedules` - Available departure dates
- `tour_services` - Linked partner services
- `tour_reviews` - Tour reviews and ratings
- `bookings` - Tour bookings

#### Partner Services
- `accommodation_services` - Hotels/resorts
- `accommodation_rooms` - Room types
- `restaurant_services` - Restaurants
- `restaurant_menu_items` - Menu items
- `restaurant_set_meals` - Set meals
- `transportation_services` - Vehicles
- `service_images` - Service images
- `service_reviews` - Service reviews
- `service_availability` - Availability calendar

#### Revenue & Payments
- `partner_revenue` - Partner earnings
- `partner_revenue_pending` - Pending payouts
- `promotions` - Promotional codes and banners

### Business Logic

- **Automatic Price Calculation**: Tour prices calculated from selected services
- **Schedule Management**: Track available slots and bookings
- **Revenue Distribution**: Automatic revenue tracking for partners
- **Email Notifications**: Automated emails for bookings, password resets, etc.
- **Soft Delete**: Posts and comments support soft deletion

## 🔒 Authentication & Authorization

### User Roles

1. **Client** (default)
   - Browse and book tours
   - Leave reviews
   - Use social features
   - Manage profile

2. **Partner**
   - All client features
   - Manage services (accommodation/restaurant/transportation)
   - View bookings and revenue
   - Respond to reviews

3. **Admin**
   - All features
   - Manage tours
   - Approve partners
   - Moderate content
   - View statistics
   - Manage users

### Authentication Methods

- **Email/Password**: Traditional registration and login
- **Google OAuth**: Sign in with Google account
- **Session-based**: Uses Flask sessions for authentication

### Authorization

- Role-based access control (RBAC) decorators
- Header-based user identification (`X-User-Email`, `X-User-ID`, `X-User-Role`)
- Route-level permission checks

## 💳 Payment Integration

### Stripe Integration

The platform uses Stripe for secure payment processing:

1. **Payment Intent Creation**: Backend creates payment intent
2. **Client-side Payment**: Frontend uses Stripe.js to collect payment
3. **Payment Confirmation**: Backend confirms payment
4. **Booking Creation**: Booking created after successful payment

### Supported Payment Methods

- Credit/Debit cards (via Stripe)
- Automatic payment methods enabled

### Payment Flow

1. User selects tour and customizations
2. System calculates total price
3. User enters payment details
4. Stripe processes payment
5. Booking confirmed and email sent

## 📧 Email Service

### Email Types

- **Welcome Email**: Sent on user registration
- **Password Reset**: Password reset link
- **Password Changed**: Confirmation of password change
- **Booking Confirmation**: Tour booking confirmation
- **Booking Cancellation**: Booking cancellation notice
- **Payment Success**: Payment confirmation
- **Account Status Changed**: Account status updates

### SendGrid Configuration

- Uses SendGrid API for email delivery
- HTML email templates
- Automatic email sending on events
- Configurable sender name and email

## 🚢 Deployment

### Backend Deployment

1. **Set environment variables** on hosting platform
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Run migrations** (tables auto-create on first run)
4. **Use production WSGI server** (e.g., Gunicorn):
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

### Frontend Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```
2. **Deploy `dist/` folder** to static hosting (Vercel, Netlify, etc.)
3. **Configure API proxy** or update API base URLs

### Environment Considerations

- Update `FRONTEND_URL` and `BACKEND_URL` for production
- Use production database credentials
- Configure production OAuth redirect URIs
- Use production Stripe keys
- Set up SendGrid domain authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- **Python**: Follow PEP 8, use Black formatter
- **JavaScript**: Follow ESLint rules
- **React**: Use functional components with hooks

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

Built with ❤️ for Tourism Website

## 🆘 Support

For issues and questions:
- Check existing issues in the repository
- Create a new issue with detailed description
- Include error logs and steps to reproduce

---

**Note**: Remember to:
- Never commit `.env` files
- Use environment variables for all secrets
- Keep dependencies updated
- Test thoroughly before deploying
- Follow security best practices

