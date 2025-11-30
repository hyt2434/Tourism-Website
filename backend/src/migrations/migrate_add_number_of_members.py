"""
Migration script to add number_of_members column to tours_admin table.
Run this once to update the database schema.
"""

from config.database import get_connection

def migrate_add_number_of_members():
    """Add number_of_members column to tours_admin table."""
    conn = get_connection()
    if not conn:
        print("❌ Database connection failed")
        return False
    
    try:
        cur = conn.cursor()
        
        # Check if column already exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tours_admin' 
            AND column_name = 'number_of_members'
        """)
        
        if cur.fetchone():
            print("✅ Column 'number_of_members' already exists in tours_admin table")
            return True
        
        # Add the column
        print("Adding number_of_members column to tours_admin table...")
        cur.execute("""
            ALTER TABLE tours_admin 
            ADD COLUMN number_of_members INTEGER DEFAULT 1 NOT NULL
        """)
        
        conn.commit()
        print("✅ Successfully added number_of_members column to tours_admin table")
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
        return False
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("Starting migration: Add number_of_members to tours_admin")
    print("=" * 60)
    success = migrate_add_number_of_members()
    print("=" * 60)
    if success:
        print("✅ Migration completed successfully")
    else:
        print("❌ Migration failed")
