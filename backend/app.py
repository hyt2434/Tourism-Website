from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, static_folder="src/static", static_url_path="/static")

# Configure CORS to allow frontend requests
CORS(app, 
     resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

bcrypt = Bcrypt(app)
app.bcrypt = bcrypt
app.secret_key = os.getenv("SECRET_KEY", "default_secret_key")

from src.routes.user.auth_routes import auth_routes, ensure_default_admin
from src.routes.filter_routes import filter_routes
from src.routes.promotion_routes import promotion_routes
from src.routes.social_routes import social_routes
from src.routes.suggestion_routes import suggestion_routes
from src.routes.tour_routes import tour_routes
from src.routes.city_routes import city_bp
from src.routes.partner_registration_routes import partner_registration_bp

try:
    from src.models.models import create_tables
    create_tables()
    print("✅ Database tables checked/created successfully.")
    
    # Ensure default admin exists
    ensure_default_admin()
    
    # Initialize cities
    from src.controllers.city_init import init_cities
    init_cities()
except Exception as e:
    print(f"⚠️ Warning: Could not initialize database tables: {e}")

# Đăng ký routes chính
app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(filter_routes, url_prefix="/api/filters")
app.register_blueprint(promotion_routes, url_prefix="/api/promotions")
app.register_blueprint(social_routes, url_prefix="/api/social")
app.register_blueprint(suggestion_routes, url_prefix="/api/suggestions")
app.register_blueprint(tour_routes, url_prefix="/api/tours")
app.register_blueprint(city_bp, url_prefix="/api")
app.register_blueprint(partner_registration_bp)

@app.route("/test")
def test():
    return {"message": "API is working!", "status": "OK"}, 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, port=port)
