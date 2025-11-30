from flask import Flask, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, static_folder="src/static", static_url_path="/static")
app.url_map.strict_slashes = False

# Configure CORS to allow frontend requests
CORS(app, 
     resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "X-User-Email", "X-User-ID"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

bcrypt = Bcrypt(app)
app.bcrypt = bcrypt
app.secret_key = os.getenv("SECRET_KEY", "default_secret_key")

from src.migration.migrate_partner_type import migrate_add_partner_type
from src.routes.user.auth_routes import auth_routes, ensure_default_admin
from src.routes.filter_routes import filter_routes
from src.routes.promotion_routes import promotion_routes
from src.routes.social_routes import social_routes
from src.routes.suggestion_routes import suggestion_routes
from src.routes.tour_routes import tour_routes
from src.routes.city_routes import city_bp
from src.routes.partner.partner_registration_routes import partner_registration_bp
from src.routes.partner.accommodation_routes import accommodation_bp
from src.routes.partner.restaurant_routes import restaurant_bp
from src.routes.partner.transportation_routes import transportation_bp
from src.routes.admin.tour_admin_routes import tour_admin_bp
from src.routes.payment_routes import payment_routes
from src.routes.booking_routes import booking_routes

try:
    from src.models.models import create_tables
    create_tables()
    print("[OK] Database tables checked/created successfully.")
    
    # Ensure default admin exists
    ensure_default_admin()
    
    # Initialize cities
    from src.models.city_init import init_cities
    init_cities()
    # Initialize statuses and roles
    from src.migration.migrate_add_status import migrate_add_status
    migrate_add_status()
    from src.migration.migrate_add_role import migrate_add_role
    migrate_add_role()

    # Initialize profile columns
    from src.migration.migrate_profile_columns import migrate_add_profile_columns
    migrate_add_profile_columns()
    #Initialize partner types
    migrate_add_partner_type()
    from src.models.partner_services_schema import create_partner_service_tables
    create_partner_service_tables()
    
    #Initialize meal types for restaurant menu items
    from src.migration.migrate_add_meal_types import migrate_add_meal_types
    migrate_add_meal_types()

    #Initialize transportation schema fix
    from src.migration.migrate_transportation_schema_fix import migrate
    migrate()
    
    # Initialize tour tables
    from src.migration.migrate_tour_tables import migrate_tour_tables
    migrate_tour_tables()

    # Initialize cities in transportation services
    from src.migration.migrate_add_cities_to_transportation import apply_migration
    apply_migration()

    # Initialize number_of_members column in tours_admin
    from src.migration.migrate_add_number_of_members import migrate_add_number_of_members
    migrate_add_number_of_members()

    # Initialize tour selection
    from src.migration.migrate_tour_selections import migrate_tour_selections
    migrate_tour_selections()

    # Initialize promotions homepage fields
    from src.migration.migrate_promotions_homepage import migrate_promotions_homepage
    migrate_promotions_homepage()

    # Initialize promotion_code column in bookings
    from src.migration.migrate_add_promotion_code_to_bookings import migrate_add_promotion_code_to_bookings
    migrate_add_promotion_code_to_bookings()


except Exception as e:
    print(f"[WARNING] Could not initialize database tables: {e}")

# Đăng ký routes chính
app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(filter_routes, url_prefix="/api/filters")
app.register_blueprint(promotion_routes, url_prefix="/api/promotions")
app.register_blueprint(social_routes, url_prefix="/api/social")
app.register_blueprint(suggestion_routes, url_prefix="/api/suggestions")
app.register_blueprint(tour_routes, url_prefix="/api/tours")
app.register_blueprint(city_bp, url_prefix="/api")
app.register_blueprint(payment_routes, url_prefix="/api/payments")
app.register_blueprint(booking_routes, url_prefix="/api/bookings")
app.register_blueprint(partner_registration_bp)
# Partner service management routes
app.register_blueprint(accommodation_bp)
app.register_blueprint(restaurant_bp)
app.register_blueprint(transportation_bp)
# Admin routes
app.register_blueprint(tour_admin_bp)

# Print registered routes for debugging
print("\n[OK] Registered Partner Service Routes:")
print("   - /api/partner/accommodations")
print("   - /api/partner/restaurants")
print("   - /api/partner/transportation")
print("\n[OK] Registered Admin Routes:")
print("   - /api/admin/tours")

@app.route("/test")
def test():
    return {"message": "API is working!", "status": "OK"}, 200

@app.route("/api/test-partner")
def test_partner():
    """Test endpoint for partner routes"""
    partner_id = request.headers.get('X-User-ID')
    return {
        "message": "Partner endpoint working",
        "partner_id": partner_id,
        "status": "OK"
    }, 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, port=port)
