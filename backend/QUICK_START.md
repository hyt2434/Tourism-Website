# Quick Start Guide - Role-Based Authentication

## What Changed?

✅ **New auth file location:** `src/routes/user/auth_routes.py`  
✅ **Role support added:** `admin` and `client` roles  
✅ **Default admin created** automatically on startup  
✅ **New endpoint:** `GET /api/auth/users` (admin only)  
✅ **All existing features** preserved and working  

## Setup Steps

### Step 1: Run Migration (If you have existing users table)
```bash
cd d:\Tourism-Website\backend
python migrate_add_role.py
```

### Step 2: Start the Application
```bash
python app.py
```

You should see:
```
✅ Database tables checked/created successfully.
✅ Default admin user created: admin@example.com
⚠️  Please change the default admin password immediately!
```

OR

```
✅ Database tables checked/created successfully.
✅ Admin user(s) already exist (1 admin(s) found)
```

### Step 3: Delete Old Auth File (Optional)
```bash
.\cleanup_old_auth.ps1
```

Or manually delete: `d:\Tourism-Website\backend\src\routes\auth_routes.py`

### Step 4: Test the System

#### Test Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@example.com","password":"Admin@123456"}'
```

#### Test Regular User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'
```

#### Test Admin Access (List All Users)
```bash
curl -X GET http://localhost:5000/api/auth/users `
  -H "X-User-Email: admin@example.com"
```

## Default Admin Credentials

**⚠️ CHANGE THESE IMMEDIATELY!**

- **Email:** `admin@example.com`
- **Password:** `Admin@123456`
- **Username:** `Administrator`

## Configuration (Optional)

Create/update `.env` file:
```env
DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_USERNAME=Admin
DEFAULT_ADMIN_PASSWORD=YourSecurePassword123!
```

## What Works Now?

### All Existing Features ✅
- ✅ User registration
- ✅ User login
- ✅ Google OAuth
- ✅ Facebook OAuth
- ✅ Password hashing
- ✅ All existing routes

### New Features ✨
- ✨ Role-based access control
- ✨ Automatic admin creation
- ✨ Admin user management
- ✨ Role in login/register responses
- ✨ Admin-only endpoints

## Troubleshooting

### "Module not found" error
```bash
# Make sure you're importing from the new location
from src.routes.user.auth_routes import auth_routes
```

### "Column 'role' does not exist"
```bash
# Run the migration script
python migrate_add_role.py
```

### Old auth file still being used
```bash
# Delete the old file
.\cleanup_old_auth.ps1
# Or manually delete: src/routes/auth_routes.py
```

## File Structure

```
backend/
├── src/
│   └── routes/
│       ├── user/
│       │   └── auth_routes.py  ✅ NEW LOCATION
│       ├── auth_routes.py      ❌ DELETE THIS (old file)
│       └── ...
├── migrate_add_role.py         🔧 Migration script
├── cleanup_old_auth.ps1        🧹 Cleanup script
├── AUTH_RBAC_GUIDE.md          📖 Full documentation
└── QUICK_START.md              📝 This file
```

## Next Steps

1. ✅ Run migration if needed
2. ✅ Start the application
3. ✅ Login as admin
4. ⚠️  **CHANGE ADMIN PASSWORD**
5. ✅ Test creating regular users
6. ✅ Test admin-only endpoints
7. 🧹 Delete old auth_routes.py file

## Need Help?

Read the full documentation: `AUTH_RBAC_GUIDE.md`
