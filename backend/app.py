from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_routes
from routes.social_routes import social_routes
from models import create_tables
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, 
     origins=["http://localhost:5173", "http://127.0.0.1:5173"],
     allow_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

bcrypt = Bcrypt(app)
app.bcrypt = bcrypt

app.secret_key = os.getenv("SECRET_KEY")

create_tables()

app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(social_routes, url_prefix="/api/social")

@app.route("/test")
def test():
    return "API is working!"

if __name__ == "__main__":
    app.run(debug=True, port=5000)
