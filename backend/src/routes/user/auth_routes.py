from flask import Blueprint, redirect, request, jsonify, session, current_app
from requests_oauthlib import OAuth2Session
from functools import wraps
import os
import random
import string
from datetime import datetime, timedelta
from src.database import get_connection

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

auth_routes = Blueprint('auth_routes', __name__)

# --- OAuth setup ---
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL")
BACKEND_URL = os.getenv("BACKEND_URL")

# --- Role-based access control decorators ---
def get_user_from_token():
    """
    Extract user information from the current request.
    This is a placeholder - adapt to your existing auth mechanism (JWT, session, etc.)
    For now, we'll check session or a simple header.
    """
    # Try to get email from session (for OAuth flows)
    email = session.get('user_email')
    
    # Or from a custom header (for API token auth)
    if not email:
        email = request.headers.get('X-User-Email')
    
    # Or from request body for login/register
    if not email and request.is_json:
        data = request.get_json()
        email = data.get('email')
    
    if not email:
        return None
    
    conn = get_connection()
    if not conn:
        return None
    
    cur = conn.cursor()
    cur.execute("SELECT id, username, email, role FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    
    if not row:
        return None
    
    return {
        'id': row[0],
        'username': row[1],
        'email': row[2],
        'role': row[3]
    }


def admin_required(f):
    """Decorator to require admin role for a route."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_user_from_token()
        
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        
        if user.get('role') != 'admin':
            return jsonify({"error": "Admin access required. Forbidden."}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function


# --- Database initialization ---
def ensure_default_admin():
    """
    Ensure at least one admin user exists in the system.
    Creates a default admin if none exists.
    """
    conn = get_connection()
    if not conn:
        print("❌ Cannot check for admin user: Database connection failed.")
        return
    
    cur = conn.cursor()
    
    try:
        # Check if any admin exists
        cur.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        admin_count = cur.fetchone()[0]
        
        if admin_count == 0:
            # Create default admin
            default_admin_email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@example.com")
            default_admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "Admin@123456")
            default_admin_username = os.getenv("DEFAULT_ADMIN_USERNAME", "Administrator")
            
            bcrypt = current_app.bcrypt
            hashed_pw = bcrypt.generate_password_hash(default_admin_password).decode('utf-8')
            
            cur.execute("""
                INSERT INTO users (username, email, password, role)
                VALUES (%s, %s, %s, 'admin')
            """, (default_admin_username, default_admin_email, hashed_pw))
            
            conn.commit()
            print(f"✅ Default admin user created: {default_admin_email}")
            print(f"⚠️  Please change the default admin password immediately!")
        else:
            print(f"✅ Admin user(s) already exist ({admin_count} admin(s) found)")
    
    except Exception as e:
        conn.rollback()
        print(f"❌ Error ensuring default admin: {e}")
    finally:
        cur.close()
        conn.close()


# ---------------- GOOGLE LOGIN ----------------
@auth_routes.route("/google")
def google_login():
    google = OAuth2Session(
        GOOGLE_CLIENT_ID,
        redirect_uri=f"{BACKEND_URL}/api/auth/google/callback",
        scope=["openid", "email", "profile"]
    )
    auth_url, state = google.authorization_url(
        "https://accounts.google.com/o/oauth2/auth",
        access_type="offline",
        prompt="select_account"
    )
    session["oauth_state"] = state
    return redirect(auth_url)


@auth_routes.route("/google/callback")
def google_callback():
    google = OAuth2Session(
        GOOGLE_CLIENT_ID,
        state=session.get("oauth_state"),
        redirect_uri=f"{BACKEND_URL}/api/auth/google/callback"
    )
    token = google.fetch_token(
        "https://oauth2.googleapis.com/token",
        client_secret=GOOGLE_CLIENT_SECRET,
        authorization_response=request.url
    )
    resp = google.get("https://www.googleapis.com/oauth2/v1/userinfo")
    user_info = resp.json()
    user = create_or_get_user(user_info)
    
    # Store user email in session for role-based access
    session['user_email'] = user_info['email']
    
    redirect_url = f"{FRONTEND_URL}/?user={user_info['email']}&role={user.get('role', 'client')}"
    return redirect(redirect_url)


# ---------------- FACEBOOK LOGIN ----------------
@auth_routes.route("/facebook")
def facebook_login():
    facebook = OAuth2Session(
        FACEBOOK_CLIENT_ID,
        redirect_uri=f"{BACKEND_URL}/api/auth/facebook/callback",
        scope=["email"]
    )
    auth_url, state = facebook.authorization_url(
        "https://www.facebook.com/dialog/oauth"
    )
    session["oauth_state"] = state
    return redirect(auth_url)


@auth_routes.route("/facebook/callback")
def facebook_callback():
    facebook = OAuth2Session(
        FACEBOOK_CLIENT_ID,
        redirect_uri=f"{BACKEND_URL}/api/auth/facebook/callback"
    )
    facebook.fetch_token(
        "https://graph.facebook.com/oauth/access_token",
        client_secret=FACEBOOK_CLIENT_SECRET,
        authorization_response=request.url
    )
    resp = facebook.get("https://graph.facebook.com/me?fields=id,name,email")
    user_info = resp.json()
    user = create_or_get_user(user_info)
    
    # Store user email in session for role-based access
    session['user_email'] = user_info.get('email', 'unknown')
    
    redirect_url = f"{FRONTEND_URL}/?user={user_info.get('email', 'unknown')}&role={user.get('role', 'client')}"
    return redirect(redirect_url)


# ---------------- REGISTER (ENHANCED WITH ROLE) ----------------
@auth_routes.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Please fill out all missing or incomplete information"}), 400

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Email has been registered."}), 400

    bcrypt = current_app.bcrypt
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

    # New users get 'client' role by default
    cur.execute("""
        INSERT INTO users (username, email, password, role)
        VALUES (%s, %s, %s, 'client')
        RETURNING id, username, email, role
    """, (username, email, hashed_pw))
    
    user_row = cur.fetchone()
    conn.commit()

    cur.close()
    conn.close()
    
    return jsonify({
        "message": "Successfully registered.",
        "user": {
            "id": user_row[0],
            "username": user_row[1],
            "email": user_row[2],
            "role": user_row[3]
        }
    }), 201


# ---------------- LOGIN (ENHANCED WITH ROLE IN RESPONSE) ----------------
@auth_routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = get_connection()
    cur = conn.cursor()
    
    # Include role and status in the query
    cur.execute("SELECT id, username, email, password, role, status, partner_type FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Invalid email or password."}), 401

    user_id, username, email, hashed_pw, role, status, partner_type = row
    
    # Check if user is banned
    if status == 'banned':
        return jsonify({"error": "Your account has been banned. Please contact support."}), 403
    
    bcrypt = current_app.bcrypt

    if bcrypt.check_password_hash(hashed_pw, password):
        # Store user email in session for role-based access
        session['user_email'] = email
        
        # Return user info including role and partner_type
        user_data = {
            "id": user_id,
            "username": username,
            "email": email,
            "role": role
        }
        
        # Only include partner_type if user is a partner
        if role == 'partner' and partner_type:
            user_data["partnerType"] = partner_type
        
        return jsonify({
            "message": "Successfully logged in.",
            "user": user_data
        }), 200
    else:
        return jsonify({"error": "Invalid password."}), 401


# ---------------- ADMIN ONLY: LIST ALL USERS ----------------
@auth_routes.route('/users', methods=['GET'])
@admin_required
def list_all_users():
    """
    Admin-only endpoint to list all users in the system.
    Returns user information without sensitive data like passwords.
    """
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        # First, ensure status column exists
        try:
            cur.execute("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
            """)
            conn.commit()
        except Exception:
            pass  # Column might already exist
        
        # Check if bookings table exists
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'bookings'
            )
        """)
        bookings_exists = cur.fetchone()[0]
        
        # Get all users with their data
        if bookings_exists:
            cur.execute("""
                SELECT 
                    u.id, 
                    u.username, 
                    u.email, 
                    u.role, 
                    u.created_at,
                    COALESCE(u.status, 'active') as status,
                    (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id) as total_bookings
                FROM users u
                ORDER BY u.created_at DESC
            """)
        else:
            # If bookings table doesn't exist, just return 0 for total_bookings
            cur.execute("""
                SELECT 
                    u.id, 
                    u.username, 
                    u.email, 
                    u.role, 
                    u.created_at,
                    COALESCE(u.status, 'active') as status,
                    0 as total_bookings
                FROM users u
                ORDER BY u.created_at DESC
            """)
        
        rows = cur.fetchall()
        
        users = []
        for row in rows:
            # Get last login time (if available) - you may need to track this separately
            # For now, we'll use created_at as a placeholder
            users.append({
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "role": row[3],
                "createdAt": row[4].strftime('%Y-%m-%d') if row[4] else None,
                "status": row[5],
                "totalBookings": row[6] if row[6] else 0,
                "lastLogin": row[4].strftime('%Y-%m-%d') if row[4] else None  # Placeholder
            })
        
        return jsonify({
            "total": len(users),
            "users": users
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to fetch users: {str(e)}"}), 500
    
    finally:
        cur.close()
        conn.close()



# ---------------- ADMIN ONLY: MANAGE USER ----------------
@auth_routes.route('/users/<int:user_id>', methods=['DELETE', 'PUT'])
@admin_required
def manage_user(user_id):
    """
    Admin-only endpoint to manage a user.
    DELETE: Delete a user by ID. Prevents deletion of the last admin user.
    PUT: Update user information (username, email, role).
    """
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        # DELETE Method
        if request.method == 'DELETE':
            # Check if user exists
            cur.execute("SELECT id, username, email, role FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            user_role = user[3]
            
            # If trying to delete an admin, check if they're the last admin
            if user_role == 'admin':
                cur.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
                admin_count = cur.fetchone()[0]
                
                if admin_count <= 1:
                    return jsonify({"error": "Cannot delete the last admin user"}), 400
            
            # Delete the user
            cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
            conn.commit()
            
            return jsonify({
                "message": "User deleted successfully",
                "deleted_user": {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2],
                    "role": user[3]
                }
            }), 200
        
        # PUT Method
        elif request.method == 'PUT':
            data = request.get_json()
            username = data.get("username")
            email = data.get("email")
            role = data.get("role")
            
            print(f"[DEBUG] PUT request for user_id={user_id}")
            print(f"[DEBUG] Request data: username={username}, email={email}, role={role}")
            
            # Check if user exists
            cur.execute("SELECT id, username, email, role FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            old_role = user[3]
            
            # If changing from admin, ensure not last admin
            if old_role == 'admin' and role and role != 'admin':
                cur.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
                admin_count = cur.fetchone()[0]
                
                if admin_count <= 1:
                    return jsonify({"error": "Cannot change role of the last admin user"}), 400
            
            # Validate role if provided
            if role and role not in ['client', 'partner', 'admin']:
                return jsonify({"error": "Invalid role. Must be 'client', 'partner', or 'admin'"}), 400
            
            # Check if new email already exists (if email is being changed)
            if email and email != user[2]:
                cur.execute("SELECT id FROM users WHERE email = %s AND id != %s", (email, user_id))
                if cur.fetchone():
                    return jsonify({"error": "Email already in use by another user"}), 400
            
            # Build update query dynamically
            updates = []
            params = []
            
            if username:
                updates.append("username = %s")
                params.append(username)
            
            if email:
                updates.append("email = %s")
                params.append(email)
            
            if role:
                updates.append("role = %s")
                params.append(role)
            
            if not updates:
                return jsonify({"error": "No fields to update"}), 400
            
            params.append(user_id)
            update_query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s RETURNING id, username, email, role"
            
            print(f"[DEBUG] Executing query: {update_query}")
            print(f"[DEBUG] With params: {tuple(params)}")
            
            cur.execute(update_query, tuple(params))
            updated_user = cur.fetchone()
            conn.commit()
            
            print(f"[DEBUG] Updated user: {updated_user}")
            print(f"[DEBUG] Transaction committed successfully")
            
            return jsonify({
                "message": "User updated successfully",
                "user": {
                    "id": updated_user[0],
                    "username": updated_user[1],
                    "email": updated_user[2],
                    "role": updated_user[3]
                }
            }), 200
    
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to manage user: {str(e)}"}), 500
    
    finally:
        cur.close()
        conn.close()


# ---------------- HELPER FUNCTION ----------------
def create_or_get_user(user_info):
    """
    Create or retrieve user from OAuth login.
    Returns user data including role.
    """
    conn = get_connection()
    cur = conn.cursor()

    email = user_info.get("email")
    name = user_info.get("name") or user_info.get("email").split("@")[0]

    # Check if user exists
    cur.execute("SELECT id, username, email, role FROM users WHERE email = %s", (email,))
    user = cur.fetchone()

    if not user:
        # Create new user with 'client' role by default
        cur.execute("""
            INSERT INTO users (username, email, password, role)
            VALUES (%s, %s, NULL, 'client')
            RETURNING id, username, email, role
        """, (name, email))
        user = cur.fetchone()
        conn.commit()
        print(f"🆕 Created new user for {email} with role 'client'")
    else:
        print(f"👤 Existing user: {email} with role '{user[3]}'")

    user_data = {
        'id': user[0],
        'username': user[1],
        'email': user[2],
        'role': user[3]
    }

    cur.close()
    conn.close()
    
    return user_data


# ---------------- PROFILE MANAGEMENT ----------------
@auth_routes.route('/profile', methods=['GET'])
def get_profile():
    """Get current user's profile information."""
    # Get user email from session or header
    email = session.get('user_email') or request.headers.get('X-User-Email')
    
    if not email:
        return jsonify({"error": "Authentication required"}), 401
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT id, username, email, phone, avatar_url, role, created_at, partner_type
            FROM users
            WHERE email = %s
        """, (email,))
        
        user = cur.fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        profile_data = {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "phone": user[3] or "",
            "avatar": user[4] or "",
            "role": user[5],
            "created_at": user[6].isoformat() if user[6] else None
        }
        
        # Include partner_type if user is a partner
        if user[5] == 'partner' and user[7]:
            profile_data["partnerType"] = user[7]
        
        return jsonify(profile_data), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to fetch profile: {str(e)}"}), 500
    
    finally:
        cur.close()
        conn.close()


@auth_routes.route('/profile', methods=['PUT'])
def update_profile():
    """Update current user's profile information."""
    # Get user email from session or header
    current_email = session.get('user_email') or request.headers.get('X-User-Email')
    
    if not current_email:
        return jsonify({"error": "Authentication required"}), 401
    
    data = request.get_json()
    name = data.get("name")
    new_email = data.get("email")
    phone = data.get("phone")
    avatar = data.get("avatar")
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        # If email is being changed, check if new email already exists
        if new_email and new_email != current_email:
            cur.execute("SELECT id FROM users WHERE email = %s", (new_email,))
            if cur.fetchone():
                return jsonify({"error": "Email already in use"}), 400
        
        # Update user profile
        if new_email and new_email != current_email:
            # Update with new email
            cur.execute("""
                UPDATE users
                SET username = %s, email = %s, phone = %s, avatar_url = %s
                WHERE email = %s
                RETURNING id, username, email, phone, avatar_url, role
            """, (name, new_email, phone, avatar, current_email))
            
            # Update session with new email
            session['user_email'] = new_email
        else:
            # Update without changing email
            cur.execute("""
                UPDATE users
                SET username = %s, phone = %s, avatar_url = %s
                WHERE email = %s
                RETURNING id, username, email, phone, avatar_url, role
            """, (name, phone, avatar, current_email))
        
        user = cur.fetchone()
        conn.commit()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "message": "Profile updated successfully",
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2],
                "phone": user[3] or "",
                "avatar": user[4] or "",
                "role": user[5]
            }
        }), 200
    
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to update profile: {str(e)}"}), 500
    
    finally:
        cur.close()
        conn.close()


@auth_routes.route('/change-password', methods=['POST'])
def change_password():
    """Change current user's password."""
    # Get user email from session or header
    email = session.get('user_email') or request.headers.get('X-User-Email')
    
    if not email:
        return jsonify({"error": "Authentication required"}), 401
    
    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not current_password or not new_password:
        return jsonify({"error": "Current password and new password are required"}), 400
    
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters long"}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        # Get current password hash
        cur.execute("SELECT password FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        
        if not user or not user[0]:
            return jsonify({"error": "Cannot change password for OAuth users"}), 400
        
        # Verify current password
        bcrypt = current_app.bcrypt
        if not bcrypt.check_password_hash(user[0], current_password):
            return jsonify({"error": "Current password is incorrect"}), 401
        
        # Hash new password
        hashed_pw = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
        # Update password
        cur.execute("""
            UPDATE users
            SET password = %s
            WHERE email = %s
        """, (hashed_pw, email))
        
        conn.commit()
        
        return jsonify({"message": "Password changed successfully"}), 200
    
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to change password: {str(e)}"}), 500
    
    finally:
        cur.close()
        conn.close()


@auth_routes.route('/upload-avatar', methods=['POST'])
def upload_avatar():
    """Upload avatar image (base64 format)."""
    # Get user email from session or header
    email = session.get('user_email') or request.headers.get('X-User-Email')
    
    if not email:
        return jsonify({"error": "Authentication required"}), 401
    
    data = request.get_json()
    avatar_data = data.get("avatar")
    
    if not avatar_data:
        return jsonify({"error": "Avatar data is required"}), 400
    
    # For now, we'll store the base64 data directly
    # In production, you might want to upload to a file storage service (S3, Cloudinary, etc.)
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        cur.execute("""
            UPDATE users
            SET avatar_url = %s
            WHERE email = %s
            RETURNING avatar_url
        """, (avatar_data, email))
        
        result = cur.fetchone()
        conn.commit()
        
        if not result:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "message": "Avatar uploaded successfully",
            "avatar": result[0]
        }), 200
    
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to upload avatar: {str(e)}"}), 500
    
    finally:
        cur.close()
        conn.close()


# ---------------- PASSWORD RESET FUNCTIONALITY ----------------

# Store reset codes in memory (in production, use Redis or database)
reset_codes = {}

def generate_reset_code():
    """Generate a random 6-digit reset code."""
    return ''.join(random.choices(string.digits, k=6))


@auth_routes.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Step 1: Request password reset.
    Sends a reset code to the user's email.
    """
    data = request.get_json()
    email = data.get("email")
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        # Check if user exists
        cur.execute("SELECT id, username, email FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        
        if not user:
            # For security, don't reveal if email exists or not
            return jsonify({
                "message": "If an account with this email exists, a reset code has been sent."
            }), 200
        
        # Generate reset code
        reset_code = generate_reset_code()
        
        # Store reset code with expiration (15 minutes)
        reset_codes[email] = {
            'code': reset_code,
            'expires_at': datetime.now() + timedelta(minutes=15),
            'user_id': user[0]
        }
        
        # In production, send email here
        # For now, we'll just log it (or you can integrate an email service)
        print(f"🔐 Password reset code for {email}: {reset_code}")
        print(f"   Expires at: {reset_codes[email]['expires_at']}")
        
        # TODO: Send email with reset code
        # send_reset_email(email, reset_code)
        
        return jsonify({
            "message": "Reset code sent to your email. Please check your inbox.",
            "reset_code": reset_code  # Remove this in production!
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to process request: {str(e)}"}), 500
    
    finally:
        cur.close()
        conn.close()


@auth_routes.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Step 2: Reset password with code.
    Verifies the reset code and updates the password.
    """
    data = request.get_json()
    email = data.get("email")
    reset_code = data.get("reset_code")
    new_password = data.get("new_password")
    
    if not email or not reset_code or not new_password:
        return jsonify({"error": "Email, reset code, and new password are required"}), 400
    
    # Validate password strength
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400
    
    # Check if reset code exists and is valid
    if email not in reset_codes:
        return jsonify({"error": "Invalid or expired reset code"}), 400
    
    stored_data = reset_codes[email]
    
    # Check if code matches
    if stored_data['code'] != reset_code:
        return jsonify({"error": "Invalid reset code"}), 400
    
    # Check if code has expired
    if datetime.now() > stored_data['expires_at']:
        del reset_codes[email]
        return jsonify({"error": "Reset code has expired. Please request a new one."}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        # Hash the new password
        bcrypt = current_app.bcrypt
        hashed_pw = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
        # Update password
        cur.execute("""
            UPDATE users 
            SET password = %s 
            WHERE email = %s
        """, (hashed_pw, email))
        
        conn.commit()
        
        # Remove used reset code
        del reset_codes[email]
        
        print(f"✅ Password reset successful for {email}")
        
        return jsonify({
            "message": "Password reset successful! You can now login with your new password."
        }), 200
    
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to reset password: {str(e)}"}), 500
    
    finally:
        cur.close()
        conn.close()


# ---------------- ADMIN: UPDATE USER ROLE ----------------
@auth_routes.route('/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(user_id):
    """Admin-only endpoint to update a user's role."""
    data = request.get_json()
    new_role = data.get("role")
    
    if not new_role or new_role not in ['client', 'partner', 'admin']:
        return jsonify({"error": "Invalid role. Must be 'client', 'partner', or 'admin'"}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        # Check if user exists
        cur.execute("SELECT id, username, email, role FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        old_role = user[3]
        
        # If changing from admin, ensure not last admin
        if old_role == 'admin' and new_role != 'admin':
            cur.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
            admin_count = cur.fetchone()[0]
            
            if admin_count <= 1:
                return jsonify({"error": "Cannot change role of the last admin user"}), 400
        
        # Update role
        cur.execute("""
            UPDATE users 
            SET role = %s 
            WHERE id = %s
            RETURNING id, username, email, role
        """, (new_role, user_id))
        
        updated_user = cur.fetchone()
        conn.commit()
        
        return jsonify({
            "message": "User role updated successfully",
            "user": {
                "id": updated_user[0],
                "username": updated_user[1],
                "email": updated_user[2],
                "role": updated_user[3]
            }
        }), 200
    
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to update user role: {str(e)}"}), 500
    
    finally:
        cur.close()
        conn.close()


# ---------------- ADMIN: BAN/UNBAN USER ----------------
@auth_routes.route('/users/<int:user_id>/status', methods=['PUT'])
@admin_required
def update_user_status(user_id):
    """Admin-only endpoint to ban or unban a user."""
    data = request.get_json()
    status = data.get("status")
    
    if not status or status not in ['active', 'banned']:
        return jsonify({"error": "Invalid status. Must be 'active' or 'banned'"}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        # Check if user exists
        cur.execute("SELECT id, username, email, role FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Cannot ban admin users
        if user[3] == 'admin':
            return jsonify({"error": "Cannot ban admin users"}), 400
        
        # Check if status column exists, if not add it
        try:
            cur.execute("""
                UPDATE users 
                SET status = %s 
                WHERE id = %s
            """, (status, user_id))
        except Exception as e:
            if 'column "status" of relation "users" does not exist' in str(e):
                # Add status column if it doesn't exist
                cur.execute("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
                """)
                conn.commit()
                
                # Try update again
                cur.execute("""
                    UPDATE users 
                    SET status = %s 
                    WHERE id = %s
                """, (status, user_id))
            else:
                raise e
        
        conn.commit()
        
        return jsonify({
            "message": f"User {'banned' if status == 'banned' else 'unbanned'} successfully",
            "user_id": user_id,
            "status": status
        }), 200
    
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to update user status: {str(e)}"}), 500
    
    finally:
        cur.close()
        conn.close()


# ---------------- ADMIN: RESET USER PASSWORD ----------------
@auth_routes.route('/users/<int:user_id>/reset-password', methods=['POST'])
@admin_required
def admin_reset_user_password(user_id):
    """
    Admin-only endpoint to reset a user's password.
    Resets password to cleaned username + @123
    """
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        # Get user information
        cur.execute("SELECT id, username, email FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        user_id, username, email = user
        
        # Clean username: remove spaces, special characters, and accented characters
        # Keep only ASCII alphanumeric characters and convert to lowercase
        import unicodedata
        
        # Normalize unicode characters (NFD = decompose accents from letters)
        normalized = unicodedata.normalize('NFD', username)
        # Keep only ASCII characters (removes accent marks)
        ascii_only = normalized.encode('ascii', 'ignore').decode('ascii')
        # Remove spaces and non-alphanumeric, convert to lowercase
        cleaned_username = ''.join(c for c in ascii_only if c.isalnum()).lower()
        
        # Generate new password: cleanedUsername@123
        new_password = f"{cleaned_username}@123"
        
        # Hash the new password
        bcrypt = current_app.bcrypt
        hashed_pw = bcrypt.generate_password_hash(new_password).decode('utf-8')
        
        # Update password
        cur.execute("""
            UPDATE users 
            SET password = %s 
            WHERE id = %s
        """, (hashed_pw, user_id))
        
        conn.commit()
        
        print(f"🔑 Admin reset password for user {username} (ID: {user_id})")
        
        return jsonify({
            "message": "Password reset successfully",
            "user": {
                "id": user_id,
                "username": username,
                "email": email
            },
            "new_password": new_password  # Return the new password so admin can inform the user
        }), 200
    
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Failed to reset password: {str(e)}"}), 500
    
    finally:
        cur.close()
        conn.close()
