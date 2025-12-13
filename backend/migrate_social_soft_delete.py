"""
Add soft delete columns to posts and comments tables.
"""

from config.database import get_connection

def add_social_soft_delete_columns():
    """
    Add deleted_at columns to posts and comments tables for admin soft deletion.
    """
    conn = get_connection()
    if conn is None:
        print("❌ Cannot add soft delete columns: Database connection failed.")
        return False

    cur = conn.cursor()
    try:
        print("[INFO] Adding soft delete columns to posts and comments tables...")
        
        # Add deleted_at column to posts table
        cur.execute("""
            ALTER TABLE posts 
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
        """)
        
        # Add deleted_by column to posts table (to track who deleted it)
        cur.execute("""
            ALTER TABLE posts 
            ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
        """)
        
        # Add deleted_at column to comments table
        cur.execute("""
            ALTER TABLE comments 
            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL;
        """)
        
        # Add deleted_by column to comments table (to track who deleted it)
        cur.execute("""
            ALTER TABLE comments 
            ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
        """)
        
        conn.commit()
        print("✅ Successfully added soft delete columns to posts and comments tables.")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error adding soft delete columns: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    add_social_soft_delete_columns()

