from config.database import get_connection


def create_tables():
    """
    Create core tables in the database.
    
    Partner-specific service tables (accommodation, restaurants, transportation) 
    are created separately in:
    - partner_services_schema.py
    
    Tour-related tables are created in:
    - tour_schema.py
    """
    conn = get_connection()
    if not conn:
        print("❌ Cannot create tables: Database connection failed.")
        return

    cur = conn.cursor()

    # =========================
    # USERS TABLE
    # =========================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255),
            phone VARCHAR(20),
            avatar_url TEXT,
            role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('admin', 'client', 'partner')),
            partner_type VARCHAR(50) CHECK (partner_type IN ('accommodation', 'transportation', 'restaurant') OR partner_type IS NULL),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # =========================
    # SOCIAL TABLES
    # =========================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS likes (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (post_id, user_id)
        );
    """)

    # =========================
    # PARTNER REGISTRATION
    # =========================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS partner_registrations (
            id SERIAL PRIMARY KEY,
            partner_type VARCHAR(50),
            business_name VARCHAR(200),
            email VARCHAR(100),
            phone VARCHAR(50),
            description TEXT,
            star_rating INTEGER,
            price_range VARCHAR(20),
            amenities TEXT[],
            room_types TEXT[],
            vehicle_types TEXT[],
            capacity VARCHAR(50),
            routes TEXT[],
            features TEXT[],
            cuisine_type VARCHAR(100),
            specialties TEXT[],
            opening_hours VARCHAR(100),
            branches JSONB,
            status VARCHAR(20) DEFAULT 'pending',
            rejection_reason TEXT,
            created_user_id INTEGER REFERENCES users(id),
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            processed_at TIMESTAMP,
            processed_by INTEGER REFERENCES users(id)
        );
    """)

    # =========================
    # CITY TABLE
    # =========================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS cities (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            code VARCHAR(10),
            region VARCHAR(50)
        );
    """)

    # =========================
    # REGIONS / PROVINCES / TYPES
    # =========================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS regions (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS provinces (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            code VARCHAR(20),
            region_id INT REFERENCES regions(id)
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS tour_types (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        );
    """)

    # =========================
    # PROMOTIONS TABLE
    # =========================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS promotions (
            id SERIAL PRIMARY KEY,
            code VARCHAR(50) UNIQUE NOT NULL,
            discount_type VARCHAR(20) NOT NULL,
            discount_value DECIMAL(10, 2) NOT NULL,
            max_uses INTEGER,
            start_date DATE,
            end_date DATE,
            conditions TEXT,
            is_active BOOLEAN DEFAULT true,
            show_on_homepage BOOLEAN DEFAULT false,
            promotion_type VARCHAR(20) DEFAULT 'promo_code' CHECK (promotion_type IN ('banner', 'promo_code')),
            title VARCHAR(200),
            subtitle VARCHAR(200),
            image TEXT,
            highlight VARCHAR(100),
            terms TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # =========================
    # STORY TABLE (Social)
    # =========================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS stories (
            id SERIAL PRIMARY KEY,
            author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content TEXT,
            image_url TEXT,
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # =========================
    # TAGS TABLE (Social)
    # =========================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL
        );
    """)

    # =========================
    # POST_TAGS TABLE (Social)
    # =========================
    cur.execute("""
        CREATE TABLE IF NOT EXISTS post_tags (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
            UNIQUE(post_id, tag_id)
        );
    """)

    # ===================================================================================
    # NOTE: The following tables are created in specialized schema files:
    # ===================================================================================
    #
    # TOUR MANAGEMENT TABLES (see tour_schema.py):
    # - tours_admin: Main tour information
    # - tour_images: Multiple images per tour
    # - tour_daily_itinerary: Daily itinerary structure
    # - tour_time_checkpoints: Time-based activities within itineraries
    # - tour_services: Linked services for tours
    # - tour_selected_rooms: Selected accommodation rooms for tours
    # - tour_selected_menu_items: Selected menu items for tours
    #
    # PARTNER SERVICE TABLES (see partner_services_schema.py):
    # - accommodation_services: Hotels, resorts, etc.
    # - accommodation_rooms: Individual rooms with details
    # - restaurant_services: Restaurants, cafes, etc.
    # - restaurant_menu_items: Menu items with details
    # - transportation_services: Vehicles and transportation
    # - service_images: Images for all service types
    # - service_availability: Booking availability calendar
    # - service_reviews: Customer reviews for services
    #
    # BOOKING TABLE (see tour_schema.py or booking_routes.py):
    # - bookings: Tour reservations and bookings
    #
    # FAVORITES TABLE (see tour_schema.py or favorites_routes.py):
    # - favorites: User favorite tours
    #
    # ===================================================================================

    conn.commit()
    cur.close()
    conn.close()

    print("✅ Core tables created successfully!")
    print("   - Run: from src.models.tour_schema import create_tour_tables")
    print("   - Run: from src.models.partner_services_schema import create_partner_service_tables")
