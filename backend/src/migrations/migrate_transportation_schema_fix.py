"""
Migration to fix transportation_services table schema.

This migration:
1. Removes 'name' column (we use license_plate instead)
2. Removes unused columns: model, year, color, luggage_capacity, accessibility_features,
   service_areas, price_per_km, price_per_hour, minimum_fare, advance_booking_hours,
   cancellation_hours, max_trip_duration, operating_hours, driver_name, driver_phone,
   driver_license, cancellation_policy, terms_and_conditions, currency
3. Adds holiday_price column for special pricing
4. Makes license_plate NOT NULL and UNIQUE
"""

from config.database import get_connection


def migrate():
    """Apply the migration to fix transportation_services table"""
    conn = get_connection()
    if conn is None:
        print("[ERROR] Cannot run migration: Database connection failed.")
        return False

    cur = conn.cursor()
    
    try:
        print("Starting transportation_services schema migration...")
        
        # Step 1: Make license_plate NOT NULL and add UNIQUE constraint if not exists
        print("  - Making 'license_plate' NOT NULL and UNIQUE...")
        cur.execute("""
            -- First update any NULL values with a temporary placeholder
            UPDATE transportation_services 
            SET license_plate = 'TEMP-' || id::text 
            WHERE license_plate IS NULL;
        """)
        
        cur.execute("""
            ALTER TABLE transportation_services 
            ALTER COLUMN license_plate SET NOT NULL;
        """)
        
        # Add unique constraint if it doesn't exist
        cur.execute("""
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint 
                    WHERE conname = 'transportation_services_license_plate_key'
                ) THEN
                    ALTER TABLE transportation_services 
                    ADD CONSTRAINT transportation_services_license_plate_key UNIQUE (license_plate);
                END IF;
            END $$;
        """)
        
        # Step 2: Add holiday_price column if not exists
        print("  - Adding 'holiday_price' column...")
        cur.execute("""
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'transportation_services' 
                    AND column_name = 'holiday_price'
                ) THEN
                    ALTER TABLE transportation_services 
                    ADD COLUMN holiday_price DECIMAL(10, 2) DEFAULT 0;
                END IF;
            END $$;
        """)
        
        # Step 3: Drop unused columns if they exist
        print("  - Removing unused columns...")
        unused_columns = [
            'name', 'model', 'year', 'color', 'luggage_capacity', 'accessibility_features',
            'service_areas', 'price_per_km', 'price_per_hour', 'minimum_fare',
            'advance_booking_hours', 'cancellation_hours', 'max_trip_duration',
            'operating_hours', 'driver_name', 'driver_phone', 'driver_license',
            'cancellation_policy', 'terms_and_conditions', 'currency'
        ]
        
        for column in unused_columns:
            cur.execute(f"""
                DO $$ 
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'transportation_services' 
                        AND column_name = '{column}'
                    ) THEN
                        ALTER TABLE transportation_services DROP COLUMN {column};
                        RAISE NOTICE 'Dropped column: %', '{column}';
                    END IF;
                END $$;
            """)
        
        # Commit all changes
        conn.commit()
        print("\n✓ Migration completed successfully!")
        print("\nTransportation services table now has:")
        print("  - license_plate (NOT NULL, UNIQUE) - primary identifier")
        print("  - holiday_price (new column)")
        print("  - Removed 'name' and all unused columns")
        
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"\n✗ Migration failed: {e}")
        return False
        
    finally:
        cur.close()
        conn.close()


def rollback():
    """Rollback the migration (restore original schema)"""
    conn = get_connection()
    if conn is None:
        print("[ERROR] Cannot rollback: Database connection failed.")
        return False

    cur = conn.cursor()
    
    try:
        print("Rolling back transportation_services schema migration...")
        
        # Restore name column
        cur.execute("""
            ALTER TABLE transportation_services 
            ADD COLUMN IF NOT EXISTS name VARCHAR(200);
            
            UPDATE transportation_services 
            SET name = license_plate 
            WHERE name IS NULL;
            
            ALTER TABLE transportation_services 
            ALTER COLUMN name SET NOT NULL;
        """)
        
        # Remove unique constraint from license_plate
        cur.execute("""
            ALTER TABLE transportation_services 
            DROP CONSTRAINT IF EXISTS transportation_services_license_plate_key;
            
            ALTER TABLE transportation_services 
            ALTER COLUMN license_plate DROP NOT NULL;
        """)
        
        # Remove holiday_price
        cur.execute("""
            ALTER TABLE transportation_services 
            DROP COLUMN IF EXISTS holiday_price;
        """)
        
        conn.commit()
        print("✓ Rollback completed successfully!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"✗ Rollback failed: {e}")
        return False
        
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'rollback':
        rollback()
    else:
        migrate()
