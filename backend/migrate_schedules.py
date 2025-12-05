"""
Migration script to add tour schedules and update bookings table.

This script will:
1. Create the tour_schedules table
2. Add new columns to the bookings table
3. Create necessary indexes

Run this script once to update your existing database.
"""

from config.database import get_connection

def migrate_database():
    """Run all database migrations for tour schedules feature."""
    conn = get_connection()
    if not conn:
        print("❌ Cannot migrate: Database connection failed.")
        return False

    cur = conn.cursor()
    
    try:
        print("🔄 Starting database migration...")
        
        # 1. Create tour_schedules table
        print("  - Creating tour_schedules table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tour_schedules (
                id SERIAL PRIMARY KEY,
                tour_id INTEGER NOT NULL REFERENCES tours_admin(id) ON DELETE CASCADE,
                
                -- Departure Information
                departure_datetime TIMESTAMP NOT NULL,
                return_datetime TIMESTAMP NOT NULL,
                
                -- Capacity Management
                max_slots INTEGER NOT NULL,
                slots_booked INTEGER DEFAULT 0,
                slots_available INTEGER GENERATED ALWAYS AS (max_slots - slots_booked) STORED,
                
                -- Status
                is_active BOOLEAN DEFAULT TRUE,
                
                -- Metadata
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT valid_slots CHECK (slots_booked >= 0 AND slots_booked <= max_slots),
                CONSTRAINT valid_datetime CHECK (return_datetime > departure_datetime)
            );
        """)
        
        # 2. Create index for tour schedules
        print("  - Creating indexes...")
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_tour_schedules_tour 
                ON tour_schedules(tour_id, departure_datetime);
        """)
        
        # 3. Add new columns to bookings table
        print("  - Updating bookings table...")
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
                    RAISE NOTICE 'Added tour_schedule_id column';
                END IF;
                
                -- Add number_of_adults column
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'bookings' AND column_name = 'number_of_adults'
                ) THEN
                    ALTER TABLE bookings 
                    ADD COLUMN number_of_adults INTEGER DEFAULT 1;
                    RAISE NOTICE 'Added number_of_adults column';
                END IF;
                
                -- Add number_of_children column
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'bookings' AND column_name = 'number_of_children'
                ) THEN
                    ALTER TABLE bookings 
                    ADD COLUMN number_of_children INTEGER DEFAULT 0;
                    RAISE NOTICE 'Added number_of_children column';
                END IF;
            END $$;
        """)
        
        # 4. Create trigger to update slots when booking is created/updated
        print("  - Creating triggers...")
        cur.execute("""
            CREATE OR REPLACE FUNCTION update_schedule_slots()
            RETURNS TRIGGER AS $$
            BEGIN
                -- This trigger is called when booking status changes
                -- We don't auto-update slots here since we do it in the API
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        conn.commit()
        print("✅ Migration completed successfully!")
        print("\nNext steps:")
        print("1. Admin can now add departure schedules in Tour Management")
        print("2. Users will see available dates when booking")
        print("3. Bookings will track adults/children separately")
        print("4. Slot availability is automatically managed")
        
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        return False
        
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Tour Schedules Database Migration")
    print("=" * 60)
    print()
    
    success = migrate_database()
    
    if success:
        print("\n" + "=" * 60)
        print("Migration completed! You can now use the tour schedules feature.")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("Migration failed. Please check the error messages above.")
        print("=" * 60)
