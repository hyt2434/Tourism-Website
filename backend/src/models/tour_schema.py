"""
Database schema for Admin Tour Management.

This module defines the database tables for creating and managing tours with:
1. General tour information (duration, description, cities, images)
2. Daily itinerary structure (days -> time periods -> time checkpoints -> activities)
3. Pre-filtered services (restaurants, accommodation, transportation)
4. Automatic pricing calculation based on selected services
"""

from src.database import get_connection


def create_tour_tables():
    """
    Create all tour-related tables in the database.
    
    Tables created:
    - tours_admin: Main tour information
    - tour_images: Multiple images for each tour
    - tour_daily_itinerary: Day-by-day structure
    - tour_time_checkpoints: Time-based activities within each time period
    - tour_services: Linked services (restaurants, accommodation, transportation)
    """
    conn = get_connection()
    if conn is None:
        print("[ERROR] Cannot create tour tables: Database connection failed.")
        return False

    cur = conn.cursor()
    
    try:
        # =====================================================================
        # MAIN TOURS TABLE (Admin-created)
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tours_admin (
                id SERIAL PRIMARY KEY,
                
                -- Basic Information
                name VARCHAR(300) NOT NULL,
                duration VARCHAR(100) NOT NULL, -- e.g., "3 days 2 nights"
                description TEXT NOT NULL, -- Overall trip description and highlights
                
                -- Cities (must be from cities table)
                destination_city_id INTEGER NOT NULL REFERENCES cities(id),
                departure_city_id INTEGER NOT NULL REFERENCES cities(id),
                
                -- Pricing (auto-calculated from services)
                total_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
                currency VARCHAR(10) DEFAULT 'VND',
                
                -- Status & Visibility
                is_active BOOLEAN DEFAULT TRUE,
                is_published BOOLEAN DEFAULT FALSE,
                
                -- Metadata
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT valid_cities CHECK (destination_city_id != departure_city_id)
            );
        """)
        
        # =====================================================================
        # TOUR IMAGES TABLE (Multiple images per tour)
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tour_images (
                id SERIAL PRIMARY KEY,
                tour_id INTEGER NOT NULL REFERENCES tours_admin(id) ON DELETE CASCADE,
                
                -- Image Information
                image_url TEXT NOT NULL,
                image_caption VARCHAR(300),
                display_order INTEGER DEFAULT 0, -- Order for displaying images
                is_primary BOOLEAN DEFAULT FALSE, -- Main/cover image
                
                -- Metadata
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT fk_tour_images
                    FOREIGN KEY (tour_id)
                    REFERENCES tours_admin(id)
                    ON DELETE CASCADE
            );
        """)
        
        # =====================================================================
        # DAILY ITINERARY TABLE (One row per day)
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tour_daily_itinerary (
                id SERIAL PRIMARY KEY,
                tour_id INTEGER NOT NULL REFERENCES tours_admin(id) ON DELETE CASCADE,
                
                -- Day Information
                day_number INTEGER NOT NULL, -- 1, 2, 3, etc.
                day_title VARCHAR(300), -- Optional title like "Day 1: Arrival and City Tour"
                day_summary TEXT, -- Brief overview of the day
                
                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT unique_tour_day UNIQUE(tour_id, day_number),
                CONSTRAINT valid_day_number CHECK (day_number > 0)
            );
        """)
        
        # =====================================================================
        # TIME CHECKPOINTS TABLE (Activities within time periods)
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tour_time_checkpoints (
                id SERIAL PRIMARY KEY,
                itinerary_id INTEGER NOT NULL REFERENCES tour_daily_itinerary(id) ON DELETE CASCADE,
                
                -- Time Period (morning, noon, evening)
                time_period VARCHAR(20) NOT NULL CHECK (time_period IN ('morning', 'noon', 'evening')),
                
                -- Specific Time & Activity
                checkpoint_time TIME NOT NULL, -- e.g., 08:00, 10:30, 14:00
                activity_title VARCHAR(300) NOT NULL,
                activity_description TEXT,
                location VARCHAR(300), -- Where this activity takes place
                
                -- Display Order
                display_order INTEGER DEFAULT 0,
                
                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # =====================================================================
        # TOUR SERVICES TABLE (Links to partner services)
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tour_services (
                id SERIAL PRIMARY KEY,
                tour_id INTEGER NOT NULL REFERENCES tours_admin(id) ON DELETE CASCADE,
                
                -- Service Type and Reference
                service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('restaurant', 'accommodation', 'transportation')),
                
                -- Foreign Keys to Service Tables
                restaurant_id INTEGER REFERENCES restaurant_services(id) ON DELETE SET NULL,
                accommodation_id INTEGER REFERENCES accommodation_services(id) ON DELETE SET NULL,
                transportation_id INTEGER REFERENCES transportation_services(id) ON DELETE SET NULL,
                
                -- Day-specific for restaurants (one per day)
                day_number INTEGER, -- NULL for accommodation/transportation (used for whole trip)
                
                -- Service Cost (cached from service table for price calculation)
                service_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
                currency VARCHAR(10) DEFAULT 'VND',
                
                -- Additional Info
                notes TEXT, -- Any special arrangements or notes
                
                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- Constraints
                CONSTRAINT valid_service_reference CHECK (
                    (service_type = 'restaurant' AND restaurant_id IS NOT NULL AND accommodation_id IS NULL AND transportation_id IS NULL) OR
                    (service_type = 'accommodation' AND accommodation_id IS NOT NULL AND restaurant_id IS NULL AND transportation_id IS NULL) OR
                    (service_type = 'transportation' AND transportation_id IS NOT NULL AND restaurant_id IS NULL AND accommodation_id IS NULL)
                ),
                CONSTRAINT restaurant_needs_day CHECK (
                    (service_type != 'restaurant') OR (service_type = 'restaurant' AND day_number IS NOT NULL)
                )
            );
        """)
        
        # Create indexes for better query performance
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_tours_admin_destination 
                ON tours_admin(destination_city_id);
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_tours_admin_departure 
                ON tours_admin(departure_city_id);
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_tour_images_tour 
                ON tour_images(tour_id);
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_tour_itinerary_tour 
                ON tour_daily_itinerary(tour_id, day_number);
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_tour_checkpoints_itinerary 
                ON tour_time_checkpoints(itinerary_id, time_period);
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_tour_services_tour 
                ON tour_services(tour_id);
        """)
        
        # Create trigger function to auto-update total_price
        cur.execute("""
            CREATE OR REPLACE FUNCTION update_tour_total_price()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE tours_admin
                SET total_price = (
                    SELECT COALESCE(SUM(service_cost), 0)
                    FROM tour_services
                    WHERE tour_id = COALESCE(NEW.tour_id, OLD.tour_id)
                ),
                updated_at = CURRENT_TIMESTAMP
                WHERE id = COALESCE(NEW.tour_id, OLD.tour_id);
                
                RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        # Create trigger to auto-update price on service changes
        cur.execute("""
            DROP TRIGGER IF EXISTS trigger_update_tour_price ON tour_services;
            CREATE TRIGGER trigger_update_tour_price
            AFTER INSERT OR UPDATE OR DELETE ON tour_services
            FOR EACH ROW
            EXECUTE FUNCTION update_tour_total_price();
        """)
        
        conn.commit()
        print("[OK] Tour tables created successfully!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Failed to create tour tables: {e}")
        return False
        
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    create_tour_tables()
