from config.database import get_connection

def migrate_service_reviews_table():
    """Add tour-related columns to service_reviews table"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Add new columns
        print("Adding tour-related columns to service_reviews table...")
        
        cur.execute("""
            ALTER TABLE service_reviews 
            ADD COLUMN IF NOT EXISTS tour_review_id INTEGER REFERENCES tour_reviews(id) ON DELETE CASCADE,
            ADD COLUMN IF NOT EXISTS tour_id INTEGER REFERENCES tours_admin(id) ON DELETE CASCADE,
            ADD COLUMN IF NOT EXISTS booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
            ADD COLUMN IF NOT EXISTS tour_service_id INTEGER,
            ADD COLUMN IF NOT EXISTS review_text TEXT,
            ADD COLUMN IF NOT EXISTS review_images TEXT[],
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL
        """)
        
        # Update review_text from comment if it exists
        cur.execute("""
            UPDATE service_reviews 
            SET review_text = comment 
            WHERE review_text IS NULL AND comment IS NOT NULL
        """)
        
        # Create indexes for better performance
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_service_reviews_tour_review 
            ON service_reviews(tour_review_id)
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_service_reviews_booking 
            ON service_reviews(booking_id)
        """)
        
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_service_reviews_tour 
            ON service_reviews(tour_id)
        """)
        
        conn.commit()
        print("[OK] Successfully migrated service_reviews table!")
        
        # Show updated structure
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'service_reviews' 
            ORDER BY ordinal_position
        """)
        
        print("\nUpdated service_reviews table structure:")
        for row in cur.fetchall():
            print(f"  {row[0]}: {row[1]}")
        
        cur.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        if conn:
            conn.rollback()
        return False

if __name__ == "__main__":
    migrate_service_reviews_table()
