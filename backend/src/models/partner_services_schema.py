"""
Database schema for partner service management.

This module defines the database tables for three types of partner services:
1. Accommodation Services (Hotels, Resorts, etc.)
2. Restaurant Services (Restaurants, Cafes, etc.)
3. Transportation Services (Vehicles, Tours, etc.)

Each service type has its own table with specific fields and a shared branches system.
"""

from config.database import get_connection


def create_partner_service_tables():
    """
    Create all partner service-related tables in the database.
    
    Tables created:
    - accommodation_services: Hotel/resort services with rooms
    - accommodation_rooms: Individual rooms for accommodations
    - restaurant_services: Restaurant services with menus
    - restaurant_menu_items: Menu items/dishes for restaurants
    - transportation_services: Transportation services with vehicles
    - service_images: Images for all service types
    - service_availability: Availability calendar for services
    """
    conn = get_connection()
    if conn is None:
        print("[ERROR] Cannot create tables: Database connection failed.")
        return False

    cur = conn.cursor()
    
    try:
        # =====================================================================
        # ACCOMMODATION SERVICES TABLE
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS accommodation_services (
                id SERIAL PRIMARY KEY,
                partner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                
                -- Basic Information
                name VARCHAR(200) NOT NULL,
                description TEXT,
                star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
                
                -- Location
                address TEXT NOT NULL,
                city_id INTEGER REFERENCES cities(id),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                
                -- Contact
                phone VARCHAR(50),
                email VARCHAR(100),
                website VARCHAR(200),
                
                -- Amenities & Features
                amenities TEXT[], -- ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking']
                
                -- Check-in/out
                check_in_time TIME DEFAULT '14:00:00',
                check_out_time TIME DEFAULT '12:00:00',
                
                -- Pricing (base price range)
                min_price DECIMAL(10, 2),
                max_price DECIMAL(10, 2),
                currency VARCHAR(10) DEFAULT 'VND',
                
                -- Policies
                cancellation_policy TEXT,
                house_rules TEXT,
                
                -- Status
                is_active BOOLEAN DEFAULT TRUE,
                is_verified BOOLEAN DEFAULT FALSE,
                
                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT fk_accommodation_partner 
                    FOREIGN KEY (partner_id) 
                    REFERENCES users(id) 
                    ON DELETE CASCADE
            );
        """)
        
        # =====================================================================
        # ACCOMMODATION ROOMS TABLE
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS accommodation_rooms (
                id SERIAL PRIMARY KEY,
                accommodation_id INTEGER REFERENCES accommodation_services(id) ON DELETE CASCADE,
                
                -- Room Information
                name VARCHAR(200) NOT NULL, -- 'Deluxe Suite', 'Standard Room', etc.
                room_type VARCHAR(100), -- 'Single', 'Double', 'Suite', 'Family'
                description TEXT,
                
                -- Capacity
                max_adults INTEGER DEFAULT 2,
                max_children INTEGER DEFAULT 1,
                total_rooms INTEGER DEFAULT 1, -- Number of this room type available
                
                -- Size & Features
                room_size DECIMAL(10, 2), -- in square meters
                bed_type VARCHAR(100), -- 'King', 'Queen', 'Twin', etc.
                view_type VARCHAR(100), -- 'Sea View', 'Mountain View', 'City View'
                
                -- Amenities specific to room
                amenities TEXT[], -- ['TV', 'Mini Bar', 'Balcony', 'Bath Tub']
                
                -- Pricing
                base_price DECIMAL(10, 2) NOT NULL,
                weekend_price DECIMAL(10, 2),
                holiday_price DECIMAL(10, 2),
                currency VARCHAR(10) DEFAULT 'VND',
                
                -- Availability
                is_available BOOLEAN DEFAULT TRUE,
                
                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # =====================================================================
        # RESTAURANT SERVICES TABLE
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS restaurant_services (
                id SERIAL PRIMARY KEY,
                partner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                
                -- Basic Information
                name VARCHAR(200) NOT NULL,
                description TEXT,
                cuisine_type VARCHAR(100), -- 'Vietnamese', 'Italian', 'Japanese', etc.
                
                -- Location
                address TEXT NOT NULL,
                city_id INTEGER REFERENCES cities(id),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                
                -- Contact
                phone VARCHAR(50),
                email VARCHAR(100),
                website VARCHAR(200),
                
                -- Operating Hours
                opening_time TIME,
                closing_time TIME,
                opening_hours TEXT, -- JSON or text description for complex schedules
                
                -- Capacity & Features
                seating_capacity INTEGER,
                features TEXT[], -- ['Outdoor Seating', 'Private Rooms', 'Live Music', 'Bar']
                dietary_options TEXT[], -- ['Vegetarian', 'Vegan', 'Halal', 'Gluten-Free']
                
                -- Pricing
                price_range VARCHAR(10), -- '$', '$$', '$$$', '$$$$'
                average_cost_per_person DECIMAL(10, 2),
                currency VARCHAR(10) DEFAULT 'VND',
                
                -- Services
                delivery_available BOOLEAN DEFAULT FALSE,
                takeout_available BOOLEAN DEFAULT TRUE,
                reservation_required BOOLEAN DEFAULT FALSE,
                
                -- Policies
                dress_code VARCHAR(100),
                cancellation_policy TEXT,
                
                -- Status
                is_active BOOLEAN DEFAULT TRUE,
                is_verified BOOLEAN DEFAULT FALSE,
                
                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT fk_restaurant_partner 
                    FOREIGN KEY (partner_id) 
                    REFERENCES users(id) 
                    ON DELETE CASCADE
            );
        """)
        
        # =====================================================================
        # RESTAURANT MENU ITEMS TABLE
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS restaurant_menu_items (
                id SERIAL PRIMARY KEY,
                restaurant_id INTEGER REFERENCES restaurant_services(id) ON DELETE CASCADE,
                
                -- Menu Item Information
                name VARCHAR(200) NOT NULL,
                description TEXT,
                category VARCHAR(100), -- 'Appetizer', 'Main Course', 'Dessert', 'Beverage'
                
                -- Pricing
                price DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'VND',
                
                -- Details
                portion_size VARCHAR(100), -- 'Small', 'Medium', 'Large', or '200g', '1 person'
                preparation_time INTEGER, -- in minutes
                calories INTEGER,
                
                -- Dietary & Allergen Info
                is_vegetarian BOOLEAN DEFAULT FALSE,
                is_vegan BOOLEAN DEFAULT FALSE,
                is_gluten_free BOOLEAN DEFAULT FALSE,
                is_spicy BOOLEAN DEFAULT FALSE,
                spice_level INTEGER CHECK (spice_level >= 0 AND spice_level <= 5),
                allergens TEXT[], -- ['Nuts', 'Dairy', 'Seafood']
                
                -- Ingredients
                ingredients TEXT[],
                
                -- Availability
                is_available BOOLEAN DEFAULT TRUE,
                is_popular BOOLEAN DEFAULT FALSE, -- Featured/Popular dishes
                is_special BOOLEAN DEFAULT FALSE, -- Today's special
                
                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # =====================================================================
        # TRANSPORTATION SERVICES TABLE
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS transportation_services (
                id SERIAL PRIMARY KEY,
                partner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                
                -- Basic Information
                name VARCHAR(200) NOT NULL,
                description TEXT,
                vehicle_type VARCHAR(100) NOT NULL, -- 'Bus', 'Van', 'Car', 'Motorbike', 'Bicycle'
                
                -- Vehicle Details
                brand VARCHAR(100), -- 'Toyota', 'Honda', 'Mercedes'
                model VARCHAR(100),
                year INTEGER,
                license_plate VARCHAR(50),
                color VARCHAR(50),
                
                -- Capacity
                max_passengers INTEGER NOT NULL,
                luggage_capacity VARCHAR(100), -- 'Small', 'Medium', 'Large' or '3 bags'
                
                -- Features & Amenities
                features TEXT[], -- ['AC', 'WiFi', 'USB Charging', 'Reclining Seats', 'Entertainment System']
                accessibility_features TEXT[], -- ['Wheelchair Accessible', 'Child Seat Available']
                
                -- Route Information
                default_pickup_locations TEXT[], -- Array of common pickup addresses
                default_dropoff_locations TEXT[], -- Array of common dropoff addresses
                service_areas TEXT[], -- Cities/regions where service is available
                
                -- Pricing
                base_price DECIMAL(10, 2) NOT NULL, -- Base price per trip or per hour
                price_per_km DECIMAL(10, 2), -- Price per kilometer (optional)
                price_per_hour DECIMAL(10, 2), -- Price per hour (optional)
                minimum_fare DECIMAL(10, 2),
                currency VARCHAR(10) DEFAULT 'VND',
                
                -- Booking & Availability
                advance_booking_hours INTEGER DEFAULT 24, -- Minimum hours for advance booking
                cancellation_hours INTEGER DEFAULT 12, -- Hours before trip for free cancellation
                max_trip_duration INTEGER, -- in hours
                operating_hours TEXT, -- JSON or text for operating schedule
                
                -- Contact
                phone VARCHAR(50),
                
                -- Driver Information
                driver_name VARCHAR(200),
                driver_phone VARCHAR(50),
                driver_license VARCHAR(100),
                
                -- Policies
                cancellation_policy TEXT,
                terms_and_conditions TEXT,
                
                -- Status
                is_active BOOLEAN DEFAULT TRUE,
                is_verified BOOLEAN DEFAULT FALSE,
                
                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT fk_transportation_partner 
                    FOREIGN KEY (partner_id) 
                    REFERENCES users(id) 
                    ON DELETE CASCADE
            );
        """)
        
        # =====================================================================
        # SERVICE IMAGES TABLE (Shared across all service types)
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS service_images (
                id SERIAL PRIMARY KEY,
                
                -- Reference to service (polymorphic - can reference any service type)
                service_type VARCHAR(50) NOT NULL, -- 'accommodation', 'accommodation_room', 'restaurant', 'menu_item', 'transportation'
                service_id INTEGER NOT NULL, -- ID of the service/room/menu item
                
                -- Image Information
                image_url TEXT NOT NULL,
                caption VARCHAR(200),
                is_primary BOOLEAN DEFAULT FALSE, -- Main/cover image
                display_order INTEGER DEFAULT 0, -- For ordering images
                
                -- Metadata
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT check_service_type 
                    CHECK (service_type IN ('accommodation', 'accommodation_room', 'restaurant', 'menu_item', 'transportation'))
            );
        """)
        
        # Create index for faster image lookup
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_service_images_lookup 
            ON service_images(service_type, service_id);
        """)
        
        # =====================================================================
        # SERVICE AVAILABILITY TABLE (For managing bookings/reservations)
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS service_availability (
                id SERIAL PRIMARY KEY,
                
                -- Reference to service
                service_type VARCHAR(50) NOT NULL,
                service_id INTEGER NOT NULL,
                
                -- Availability Information
                date DATE NOT NULL,
                available_quantity INTEGER NOT NULL, -- Number of rooms, tables, vehicles available
                booked_quantity INTEGER DEFAULT 0,
                
                -- Status
                is_blocked BOOLEAN DEFAULT FALSE, -- Manually blocked by partner
                block_reason VARCHAR(200),
                
                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT check_availability_service_type 
                    CHECK (service_type IN ('accommodation_room', 'restaurant', 'transportation')),
                CONSTRAINT unique_availability 
                    UNIQUE (service_type, service_id, date)
            );
        """)
        
        # Create index for date-based queries
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_service_availability_date 
            ON service_availability(service_type, service_id, date);
        """)
        
        # =====================================================================
        # SERVICE REVIEWS TABLE (Customer reviews for services)
        # =====================================================================
        cur.execute("""
            CREATE TABLE IF NOT EXISTS service_reviews (
                id SERIAL PRIMARY KEY,
                
                -- Reference to service
                service_type VARCHAR(50) NOT NULL,
                service_id INTEGER NOT NULL,
                
                -- Review Information
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                title VARCHAR(200),
                comment TEXT,
                
                -- Aspect Ratings (optional detailed ratings)
                cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
                service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
                value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
                location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
                
                -- Response from partner
                partner_response TEXT,
                partner_response_date TIMESTAMP,
                
                -- Status
                is_verified BOOLEAN DEFAULT FALSE, -- Admin verified
                is_visible BOOLEAN DEFAULT TRUE,
                
                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT check_review_service_type 
                    CHECK (service_type IN ('accommodation', 'restaurant', 'transportation'))
            );
        """)
        
        # Create index for service reviews
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_service_reviews_lookup 
            ON service_reviews(service_type, service_id);
        """)
        
        conn.commit()
        print("[OK] Successfully created all partner service tables!")
        return True
        
    except Exception as e:
        print(f"[ERROR] Error creating partner service tables: {e}")
        conn.rollback()
        return False
        
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Partner Service Tables Creation Script")
    print("=" * 60)
    print()
    
    success = create_partner_service_tables()
    
    print()
    print("=" * 60)
    if success:
        print("[OK] All tables created successfully!")
        print()
        print("Tables created:")
        print("  1. accommodation_services - Hotels, resorts, etc.")
        print("  2. accommodation_rooms - Individual rooms")
        print("  3. restaurant_services - Restaurants, cafes, etc.")
        print("  4. restaurant_menu_items - Menu items and dishes")
        print("  5. transportation_services - Vehicles and transport")
        print("  6. service_images - Images for all services")
        print("  7. service_availability - Booking availability")
        print("  8. service_reviews - Customer reviews")
    else:
        print("[ERROR] Table creation failed. Please check the error messages above.")
    print("=" * 60)
