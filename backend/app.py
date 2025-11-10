from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_routes
from models import create_table
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

bcrypt = Bcrypt(app)
app.bcrypt = bcrypt

app.secret_key = os.getenv("SECRET_KEY")

create_table()

# Đăng ký routes chính
app.register_blueprint(auth_routes, url_prefix="/api/auth")


@app.route("/test")
def test():
    return "API is working!"


if __name__ == "__main__":
    app.run(debug=True, port=5000)
