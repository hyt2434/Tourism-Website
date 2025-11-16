from flask import Blueprint, redirect, request, jsonify, session, current_app
from requests_oauthlib import OAuth2Session
from functools import wraps
import os
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
    
    # Include role in the query
    cur.execute("SELECT id, username, email, password, role FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Invalid email or password."}), 401

    user_id, username, email, hashed_pw, role = row
    bcrypt = current_app.bcrypt

    if bcrypt.check_password_hash(hashed_pw, password):
        # Store user email in session for role-based access
        session['user_email'] = email
        
        # Return user info including role
        return jsonify({
            "message": "Successfully logged in.",
            "user": {
                "id": user_id,
                "username": username,
                "email": email,
                "role": role
            }
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
        cur.execute("""
            SELECT id, username, email, role, created_at
            FROM users
            ORDER BY created_at DESC
        """)
        
        rows = cur.fetchall()
        
        users = []
        for row in rows:
            users.append({
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "role": row[3],
                "created_at": row[4].isoformat() if row[4] else None
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
