from config.database import get_connection
from .tour_reviews_schema import create_tour_reviews_table


def ensure_base_tables():
    """Create base tables that other schemas depend on (cities, users)."""
    conn = get_connection()
    if conn is None:
        print("❌ Cannot create base tables: Database connection failed.")
        return

    cur = conn.cursor()
    try:
        # Cities table (used by tours and other modules)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cities (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                code VARCHAR(10),
                region VARCHAR(50)
            );
        """)

        # Users table (referenced by many schemas)
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

        conn.commit()
        print("✅ Base tables created/verified.")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating base tables: {e}")
    finally:
        cur.close()
        conn.close()

def create_table():
    conn = get_connection()
    if conn is None:
        print("❌ Cannot create table: Database connection failed.")
        return

    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(200) NOT NULL,
            role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('admin', 'client')),
            partner_type VARCHAR(50) CHECK (partner_type IN ('accommodation', 'transportation', 'restaurant')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    cur.close()
    conn.close()
    
    # Create tour reviews table
    create_tour_reviews_table()

class Tour:
    def __init__(self, id, name, image, price, duration, rating, reviews, tour_type, is_active, province_name, region_name, max_slots, badge, start_date=None):
        self.id = id
        self.name = name
        self.image = image
        self.price = price
        self.duration = duration
        self.rating = rating
        self.reviews = reviews
        self.tour_type = tour_type
        self.is_active = is_active
        self.province_name = province_name
        self.region_name = region_name
        self.max_slots = max_slots
        self.badge = badge
        self.start_date = start_date or 'Tue, 25 Nov 2025 00:00:00 GMT' #temp

    @staticmethod
    def from_db_row(row):
        """Tạo đối tượng Tour từ một hàng kết quả truy vấn"""
        if not row:
            return None
            
        return Tour(
            id=row[0], name=row[1], image=row[2], price=float(row[3]), 
            duration=row[4], rating=float(row[5]) if row[5] else None, 
            reviews=row[6], tour_type=row[7], is_active=row[8], 
            province_name=row[9], region_name=row[10], max_slots=row[11], 
            badge=row[12]
        )

    def to_dict(self):
        """Chuyển đổi đối tượng Tour thành Dictionary để trả về qua JSON"""
        return {
            'id': self.id, 'name': self.name, 'image': self.image, 'price': self.price, 
            'duration': self.duration, 'rating': self.rating, 'reviews': self.reviews,
            'tour_type': self.tour_type, 'is_active': self.is_active, 
            'province_name': self.province_name, 'region_name': self.region_name,
            'max_slots': self.max_slots, 'badge': self.badge,
            'start_date': self.start_date
        }

    @staticmethod
    def get_by_tour_types(tour_types, limit=3):
        """Lấy tour dựa trên tour_types, sắp xếp theo rating"""
        conn = get_connection()
        if not conn: return []
        
        try:
            cur = conn.cursor()
            
            type_placeholders = ', '.join(['%s'] * len(tour_types))
            query = f"""
                SELECT id, name, image, price, duration, rating, reviews, tour_type, is_active, 
                       province_name, region_name, max_slots, badge, province_id
                FROM tours
                WHERE is_active = TRUE AND tour_type IN ({type_placeholders})
                ORDER BY rating DESC
                LIMIT %s;
            """
            
            cur.execute(query, (*tour_types, limit))
            rows = cur.fetchall()
            
            tours = [Tour.from_db_row(row) for row in rows]
            return tours
            
        except Exception as e:
            print(f"Lỗi truy vấn Tour: {e}")
            return []
            
        finally:
            if conn:
                conn.close()

def create_tables():
    """Create necessary tables: users + social tables (posts, comments, likes, stories).
    
    Also creates a default admin user if none exists.
    This mirrors the project's existing simple SQL approach using psycopg2.
    """
    import os
    from flask import current_app
    
    conn = get_connection()
    if conn is None:
        print("❌ Cannot create tables: Database connection failed.")
        return

    cur = conn.cursor()

    # users table with role support
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

    # posts table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # comments table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # likes table (one like per user per post)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS likes (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(post_id, user_id)
        );
    """)

    # stories table
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

    # tags and post_tags for hashtags
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS post_tags (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(post_id, tag_id)
        );
    """)

    # cities table for Vietnam provinces/cities
    cur.execute("""
        CREATE TABLE IF NOT EXISTS cities (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            code VARCHAR(10),
            region VARCHAR(50)
        );
    """)

    # partner_registrations table for pending partner applications
    cur.execute("""
        CREATE TABLE IF NOT EXISTS partner_registrations (
            id SERIAL PRIMARY KEY,
            partner_type VARCHAR(50) NOT NULL CHECK (partner_type IN ('accommodation', 'transportation', 'restaurant')),
            business_name VARCHAR(200) NOT NULL,
            email VARCHAR(100) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            description TEXT,
            
            -- Accommodation specific fields
            star_rating INTEGER,
            price_range VARCHAR(10),
            amenities TEXT[],
            room_types TEXT[],
            
            -- Transportation specific fields
            vehicle_types TEXT[],
            capacity VARCHAR(100),
            routes TEXT[],
            features TEXT[],
            
            -- Restaurant specific fields
            cuisine_type VARCHAR(100),
            specialties TEXT[],
            opening_hours VARCHAR(100),
            
            -- Branch/location information (stored as JSON)
            branches JSONB,
            
            -- Status and metadata
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            rejection_reason TEXT,
            created_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            processed_at TIMESTAMP,
            processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL
        );
    """)

    # Update users table to support 'partner' role
    cur.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'users_role_check'
            ) THEN
                ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
                ALTER TABLE users ADD CONSTRAINT users_role_check 
                CHECK (role IN ('admin', 'client', 'partner'));
            ELSE
                -- Try to update existing constraint
                BEGIN
                    ALTER TABLE users DROP CONSTRAINT users_role_check;
                    ALTER TABLE users ADD CONSTRAINT users_role_check 
                    CHECK (role IN ('admin', 'client', 'partner'));
                EXCEPTION WHEN OTHERS THEN
                    -- Constraint might be different, just continue
                    NULL;
                END;
            END IF;
        END $$;
    """)

    # Promotions table
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
    
    # Favorites table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS favorites (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            tour_id INTEGER NOT NULL REFERENCES tours_admin(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, tour_id)
        );
    """)

    # Bookings table for tour reservations
    cur.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            tour_id INTEGER REFERENCES tours_admin(id) ON DELETE SET NULL,
            tour_schedule_id INTEGER REFERENCES tour_schedules(id) ON DELETE SET NULL,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            full_name VARCHAR(200) NOT NULL,
            email VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            departure_date DATE NOT NULL,
            return_date DATE,
            number_of_guests INTEGER DEFAULT 1,
            number_of_adults INTEGER DEFAULT 1,
            number_of_children INTEGER DEFAULT 0,
            total_price DECIMAL(12, 2) NOT NULL,
            payment_method VARCHAR(20) NOT NULL,
            payment_intent_id VARCHAR(200),
            promotion_code VARCHAR(50),
            notes TEXT,
            customizations JSONB,
            status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Add columns to existing bookings table if they don't exist
    cur.execute("""
        DO $$ 
        BEGIN
            -- Add tour_schedule_id column
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'bookings' AND column_name = 'tour_schedule_id'
            ) THEN
                ALTER TABLE bookings 
                ADD COLUMN tour_schedule_id INTEGER REFERENCES tour_schedules(id) ON DELETE SET NULL;
            END IF;
            
            -- Add number_of_adults column
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'bookings' AND column_name = 'number_of_adults'
            ) THEN
                ALTER TABLE bookings 
                ADD COLUMN number_of_adults INTEGER DEFAULT 1;
            END IF;
            
            -- Add customizations column
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'bookings' AND column_name = 'customizations'
            ) THEN
                ALTER TABLE bookings 
                ADD COLUMN customizations JSONB;
            END IF;
            
            -- Add number_of_children column
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'bookings' AND column_name = 'number_of_children'
            ) THEN
                ALTER TABLE bookings 
                ADD COLUMN number_of_children INTEGER DEFAULT 0;
            END IF;
        END $$;
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("✅ Tables checked/created successfully.")
    
    # Create default admin user if none exists
    _create_default_admin()


def _create_default_admin():
    """
    Ensure at least one admin user exists in the system.
    Creates a default admin if none exists.
    """
    import os
    from flask import current_app
    
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
            
            try:
                bcrypt = current_app.bcrypt
                hashed_pw = bcrypt.generate_password_hash(default_admin_password).decode('utf-8')
            except (RuntimeError, AttributeError):
                # If running outside Flask app context, use bcrypt directly
                from flask_bcrypt import Bcrypt
                bcrypt = Bcrypt()
                hashed_pw = bcrypt.generate_password_hash(default_admin_password).decode('utf-8')
                print("⚠️  Running outside Flask context. Using standalone bcrypt.")
            
            cur.execute("""
                INSERT INTO users (username, email, password, role)
                VALUES (%s, %s, %s, 'admin')
            """, (default_admin_username, default_admin_email, hashed_pw))
            
            conn.commit()
            print(f"✅ Default admin user created: {default_admin_email}")
            print(f"⚠️  Default password: {default_admin_password}")
            print(f"⚠️  Please change the default admin password immediately!")
        else:
            print(f"✅ Admin user(s) already exist ({admin_count} admin(s) found)")
    
    except Exception as e:
        conn.rollback()
        print(f"❌ Error ensuring default admin: {e}")
    finally:
        cur.close()
        conn.close()

