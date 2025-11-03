from flask import Blueprint, request, jsonify, current_app
from database import get_connection

auth_routes = Blueprint('auth_routes', __name__)

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
