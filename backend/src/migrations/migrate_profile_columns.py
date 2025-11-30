"""
Migration Script: Add phone and avatar_url columns to users table
Run this script if you already have a users table without these columns.
"""

import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config.database import get_connection

def migrate_add_profile_columns():
    """Add phone and avatar_url columns to existing users table."""
    conn = get_connection()
    if conn is None:
        print("❌ Cannot migrate: Database connection failed.")
        return

    cur = conn.cursor()

    try:
        # Check if 'phone' column exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='phone'
        """)
        
        phone_exists = cur.fetchone()
        
        if not phone_exists:
            print("📝 Adding 'phone' column to users table...")
            cur.execute("""
                ALTER TABLE users 
                ADD COLUMN phone VARCHAR(20);
            """)
            print("✅ 'phone' column added successfully.")
        else:
            print("ℹ️  'phone' column already exists.")

        # Check if 'avatar_url' column exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='avatar_url'
        """)
        
        avatar_exists = cur.fetchone()
        
        if not avatar_exists:
            print("📝 Adding 'avatar_url' column to users table...")
            cur.execute("""
                ALTER TABLE users 
                ADD COLUMN avatar_url TEXT;
            """)
            print("✅ 'avatar_url' column added successfully.")
        else:
            print("ℹ️  'avatar_url' column already exists.")

        conn.commit()
        print("\n✅ Migration completed successfully!")
        print("\n⚠️  Next step: Restart your Flask app to use the new columns.")

    except Exception as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {e}")
        print("⚠️  Please check your database connection and try again.")

    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("MIGRATION: Add Profile Columns to Users Table")
    print("=" * 60)
    print()
    migrate_add_profile_columns()
    print()
    print("=" * 60)
