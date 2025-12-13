"""
Add new columns to posts table for review mapping and bilingual content.
"""

from config.database import get_connection

def add_posts_table_columns():
    """
    Add new columns to posts table:
    - tour_reviews_id: Reference to tour_reviews table
    - service_reviews_id: Reference to service_reviews table
    - en_content: English content
    - vi_content: Vietnamese content
    - deleted_at_tour_reviews: deleted_at from tour_reviews
    - deleted_at_service_reviews: deleted_at from service_reviews
    """
    conn = get_connection()
    if conn is None:
        print("❌ Cannot add posts table columns: Database connection failed.")
        return False

    cur = conn.cursor()
    try:
        print("[INFO] Adding new columns to posts table...")
        
        # Add tour_reviews_id column
        cur.execute("""
            ALTER TABLE posts 
            ADD COLUMN IF NOT EXISTS tour_reviews_id INTEGER REFERENCES tour_reviews(id) ON DELETE SET NULL;
        """)
        
        # Add service_reviews_id column
        cur.execute("""
            ALTER TABLE posts 
            ADD COLUMN IF NOT EXISTS service_reviews_id INTEGER REFERENCES service_reviews(id) ON DELETE SET NULL;
        """)
        
        # Add en_content column
        cur.execute("""
            ALTER TABLE posts 
            ADD COLUMN IF NOT EXISTS en_content TEXT;
        """)
        
        # Add vi_content column
        cur.execute("""
            ALTER TABLE posts 
            ADD COLUMN IF NOT EXISTS vi_content TEXT;
        """)
        
        # Add deleted_at_tour_reviews column
        cur.execute("""
            ALTER TABLE posts 
            ADD COLUMN IF NOT EXISTS deleted_at_tour_reviews TIMESTAMP;
        """)
        
        # Add deleted_at_service_reviews column
        cur.execute("""
            ALTER TABLE posts 
            ADD COLUMN IF NOT EXISTS deleted_at_service_reviews TIMESTAMP;
        """)
        
        conn.commit()
        print("✅ Successfully added new columns to posts table.")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error adding posts table columns: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    add_posts_table_columns()

