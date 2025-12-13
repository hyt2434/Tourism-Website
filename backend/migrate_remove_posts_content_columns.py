"""
Remove en_content and vi_content columns from posts table.
"""

from config.database import get_connection

def remove_posts_content_columns():
    """
    Remove en_content and vi_content columns from posts table.
    """
    conn = get_connection()
    if conn is None:
        print("❌ Cannot remove posts table columns: Database connection failed.")
        return False

    cur = conn.cursor()
    try:
        print("[INFO] Removing en_content and vi_content columns from posts table...")
        
        # Remove en_content column if it exists
        cur.execute("""
            ALTER TABLE posts 
            DROP COLUMN IF EXISTS en_content;
        """)
        
        # Remove vi_content column if it exists
        cur.execute("""
            ALTER TABLE posts 
            DROP COLUMN IF EXISTS vi_content;
        """)
        
        conn.commit()
        print("✅ Successfully removed en_content and vi_content columns from posts table.")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error removing posts table columns: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    remove_posts_content_columns()

