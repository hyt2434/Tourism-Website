"""
Migration Script: Add role column to existing users table
Run this script if you already have a users table without the role column.

Usage:
    python migrate_add_role.py
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables from the correct location
load_dotenv()

from src.database import get_connection

def migrate_add_role():
    """Add role column to existing users table and set default admin."""
    conn = get_connection()
    if conn is None:
        print("❌ Failed to connect to database.")
        sys.exit(1)
    
    cur = conn.cursor()
    
    try:
        print("📦 Starting migration: Adding role column...")
        
        # Check if role column already exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='role'
        """)
        
        if cur.fetchone():
            print("ℹ️  Role column already exists. Skipping migration.")
        else:
            # Add role column with default 'client'
            cur.execute("""
                ALTER TABLE users 
                ADD COLUMN role VARCHAR(20) DEFAULT 'client' 
                CHECK (role IN ('admin', 'client'))
            """)
            
            # Update existing users to have 'client' role
            cur.execute("""
                UPDATE users 
                SET role = 'client' 
                WHERE role IS NULL
            """)
            
            conn.commit()
            print("✅ Role column added successfully!")
        
        # Ensure created_at column exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='created_at'
        """)
        
        if not cur.fetchone():
            cur.execute("""
                ALTER TABLE users 
                ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            """)
            conn.commit()
            print("✅ created_at column added successfully!")
        
        print("\n🎉 Migration completed successfully!")
        print("\n⚠️  Next step: Run 'python app.py' to create the default admin user.")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    migrate_add_role()
