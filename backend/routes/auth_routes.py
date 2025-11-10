from flask import Blueprint, redirect, request, jsonify, session, current_app
from requests_oauthlib import OAuth2Session
import os
from database import get_connection

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

auth_routes = Blueprint('auth_routes', __name__)
# --- OAuth setup ---
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL")
BACKEND_URL = os.getenv("BACKEND_URL")

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
    create_or_get_user(user_info)
    redirect_url = f"{FRONTEND_URL}/?user={user_info['email']}"
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
    create_or_get_user(user_info)
    redirect_url = f"{FRONTEND_URL}/?user={user_info.get('email', 'unknown')}"
    return redirect(redirect_url)
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

    cur.execute("""
        INSERT INTO users (username, email, password)
        VALUES (%s, %s, %s)
    """, (username, email, hashed_pw))
    conn.commit()

    cur.close()
    conn.close()
    return jsonify({"message": "Successfully registered."}), 201


@auth_routes.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT username, email, password FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Invalid email or password."}), 401

    username, email, hashed_pw = row
    bcrypt = current_app.bcrypt

    if bcrypt.check_password_hash(hashed_pw, password):
        return jsonify({"message": "Successfully logged in.", "user": username}), 200
    else:
        return jsonify({"error": "Invalid password."}), 401
def create_or_get_user(user_info):
    conn = get_connection()
    cur = conn.cursor()

    email = user_info.get("email")
    name = user_info.get("name") or user_info.get("email").split("@")[0]

    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    user = cur.fetchone()

    if not user:
        cur.execute("""
            INSERT INTO users (username, email, password)
            VALUES (%s, %s, NULL)
            RETURNING id
        """, (name, email))
        conn.commit()
        print(f"🆕 Created new user for {email}")
    else:
        print(f"👤 Existing user: {email}")

    cur.close()
    conn.close()
