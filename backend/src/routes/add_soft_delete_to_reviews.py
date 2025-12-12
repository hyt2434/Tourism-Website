"""
Migration script to add soft delete functionality to reviews.
Adds deleted_at and deleted_by columns to tour_reviews and service_reviews tables.
"""
from config.database import get_connection

def add_soft_delete_columns():
    """Add soft delete columns to review tables"""
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        print("[INFO] Adding soft delete columns to tour_reviews table...")
        
        # Check if columns already exist in tour_reviews
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tour_reviews' 
            AND column_name IN ('deleted_at', 'deleted_by')
        """)
        existing_columns = [row[0] for row in cur.fetchall()]
        
        if 'deleted_at' not in existing_columns:
            cur.execute("""
                ALTER TABLE tour_reviews 
                ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL
            """)
            print("  ✓ Added deleted_at column to tour_reviews")
        else:
            print("  ✓ deleted_at column already exists in tour_reviews")
        
        if 'deleted_by' not in existing_columns:
            cur.execute("""
                ALTER TABLE tour_reviews 
                ADD COLUMN deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL
            """)
            print("  ✓ Added deleted_by column to tour_reviews")
        else:
            print("  ✓ deleted_by column already exists in tour_reviews")
        
        print("\n[INFO] Adding soft delete columns to service_reviews table...")
        
        # Check if columns already exist in service_reviews
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'service_reviews' 
            AND column_name IN ('deleted_at', 'deleted_by')
        """)
        existing_columns = [row[0] for row in cur.fetchall()]
        
        if 'deleted_at' not in existing_columns:
            cur.execute("""
                ALTER TABLE service_reviews 
                ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL
            """)
            print("  ✓ Added deleted_at column to service_reviews")
        else:
            print("  ✓ deleted_at column already exists in service_reviews")
        
        if 'deleted_by' not in existing_columns:
            cur.execute("""
                ALTER TABLE service_reviews 
                ADD COLUMN deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL
            """)
            print("  ✓ Added deleted_by column to service_reviews")
        else:
            print("  ✓ deleted_by column already exists in service_reviews")
        
        conn.commit()
        print("\n[SUCCESS] Soft delete columns added successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"\n[ERROR] Failed to add soft delete columns: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    add_soft_delete_columns()
