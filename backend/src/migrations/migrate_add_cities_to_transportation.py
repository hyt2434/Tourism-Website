"""
Migration to add departure_city_id and destination_city_id to transportation_services table.
This allows transportation services to specify their departure and destination cities.
"""

from config.database import get_connection

def apply_migration():
    """Apply the migration to add city fields to transportation_services table"""
    conn = get_connection()
    if not conn:
        print("❌ Cannot apply migration: Database connection failed.")
        return False

    try:
        cur = conn.cursor()
        
        print("Starting transportation cities migration...")
        
        # Check if columns already exist
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'transportation_services' 
            AND column_name IN ('departure_city_id', 'destination_city_id')
        """)
        existing_columns = [row[0] for row in cur.fetchall()]
        
        # Add departure_city_id column if it doesn't exist
        if 'departure_city_id' not in existing_columns:
            print("Adding departure_city_id column...")
            cur.execute("""
                ALTER TABLE transportation_services
                ADD COLUMN departure_city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL
            """)
            print("✓ Added departure_city_id column")
        else:
            print("✓ departure_city_id column already exists")
        
        # Add destination_city_id column if it doesn't exist
        if 'destination_city_id' not in existing_columns:
            print("Adding destination_city_id column...")
            cur.execute("""
                ALTER TABLE transportation_services
                ADD COLUMN destination_city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL
            """)
            print("✓ Added destination_city_id column")
        else:
            print("✓ destination_city_id column already exists")
        
        conn.commit()
        print("\n✅ Migration completed successfully!")
        
        cur.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        if conn:
            conn.rollback()
            conn.close()
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("TRANSPORTATION CITIES MIGRATION")
    print("=" * 60)
    apply_migration()
