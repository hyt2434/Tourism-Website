"""
Create and populate tour_highlights table.
This table contains tours with booking counts for highlighting popular tours.
"""

from config.database import get_connection

def create_tour_highlights_table():
    """
    Create tour_highlights table with all columns from tours_admin plus booking_count.
    Automatically populated with data from tours_admin and booking statistics.
    """
    conn = get_connection()
    if conn is None:
        print("[ERROR] Cannot create tour_highlights table: Database connection failed.")
        return False

    cur = conn.cursor()
    
    try:
        print("[INFO] Creating tour_highlights table...")
        
        # Drop existing table if it exists
        cur.execute("DROP TABLE IF EXISTS tour_highlights CASCADE;")
        
        # Create tour_highlights table with same structure as tours_admin + booking_count
        # Include all published and active tours (even if all schedules are completed)
        cur.execute("""
            CREATE TABLE tour_highlights AS
            SELECT 
                t.*,
                COALESCE(COUNT(DISTINCT b.id), 0) as booking_count
            FROM tours_admin t
            LEFT JOIN bookings b ON t.id = b.tour_id 
                AND b.status IN ('confirmed', 'completed')
            WHERE t.is_active = TRUE 
                AND t.is_published = TRUE
            GROUP BY t.id
            ORDER BY booking_count DESC;
        """)
        
        # Add primary key
        cur.execute("""
            ALTER TABLE tour_highlights 
            ADD PRIMARY KEY (id);
        """)
        
        # Create index on booking_count for faster sorting
        cur.execute("""
            CREATE INDEX idx_tour_highlights_booking_count 
            ON tour_highlights(booking_count DESC);
        """)
        
        # Create index on is_published and is_active
        cur.execute("""
            CREATE INDEX idx_tour_highlights_published_active 
            ON tour_highlights(is_published, is_active);
        """)
        
        conn.commit()
        
        # Get count of tours in highlights
        cur.execute("SELECT COUNT(*) FROM tour_highlights;")
        count = cur.fetchone()[0]
        
        print(f"[SUCCESS] tour_highlights table created with {count} tours")
        
        # Show top 6 tours
        cur.execute("""
            SELECT id, name, booking_count 
            FROM tour_highlights 
            ORDER BY booking_count DESC 
            LIMIT 6;
        """)
        
        print("\n[INFO] Top 6 highlighted tours:")
        for row in cur.fetchall():
            print(f"  - Tour ID {row[0]}: {row[1]} ({row[2]} bookings)")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to create tour_highlights table: {e}")
        conn.rollback()
        return False
        
    finally:
        cur.close()
        conn.close()


def refresh_tour_highlights():
    """
    Refresh tour_highlights table with latest booking data.
    This function should be called periodically or when booking data changes.
    """
    conn = get_connection()
    if conn is None:
        print("[ERROR] Cannot refresh tour_highlights: Database connection failed.")
        return False

    cur = conn.cursor()
    
    try:
        print("[INFO] Refreshing tour_highlights table...")
        
        # Recreate the table with updated data
        # Include all published and active tours (even if all schedules are completed)
        cur.execute("DROP TABLE IF EXISTS tour_highlights CASCADE;")
        
        cur.execute("""
            CREATE TABLE tour_highlights AS
            SELECT 
                t.*,
                COALESCE(COUNT(DISTINCT b.id), 0) as booking_count
            FROM tours_admin t
            LEFT JOIN bookings b ON t.id = b.tour_id 
                AND b.status IN ('confirmed', 'completed')
            WHERE t.is_active = TRUE 
                AND t.is_published = TRUE
            GROUP BY t.id
            ORDER BY booking_count DESC;
        """)
        
        cur.execute("ALTER TABLE tour_highlights ADD PRIMARY KEY (id);")
        cur.execute("CREATE INDEX idx_tour_highlights_booking_count ON tour_highlights(booking_count DESC);")
        cur.execute("CREATE INDEX idx_tour_highlights_published_active ON tour_highlights(is_published, is_active);")
        
        conn.commit()
        
        cur.execute("SELECT COUNT(*) FROM tour_highlights;")
        count = cur.fetchone()[0]
        
        print(f"[SUCCESS] tour_highlights table refreshed with {count} tours")
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to refresh tour_highlights: {e}")
        conn.rollback()
        return False
        
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("TOUR HIGHLIGHTS TABLE CREATION")
    print("=" * 60)
    
    success = create_tour_highlights_table()
    
    if success:
        print("\n✅ Tour highlights table created successfully!")
    else:
        print("\n❌ Failed to create tour highlights table")
    
    print("=" * 60)
