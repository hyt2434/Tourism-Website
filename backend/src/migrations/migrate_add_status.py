"""
Migration Script: Add status column to existing users table
Run this script to add a status column for tracking user account status.

Usage:
    python -m src.routes.user.migrate_add_status
    or
    python migrate_add_status.py (from the backend directory)
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from config.database import get_connection

def migrate_add_status():
    """Add status column to existing users table."""
    conn = get_connection()
    if conn is None:
        print("❌ Failed to connect to database.")
        sys.exit(1)
    
    cur = conn.cursor()
    
    try:
        print("📦 Starting migration: Adding status column to users table...")
        
        # Check if status column already exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='status'
        """)
        
        if cur.fetchone():
            print("ℹ️  Status column already exists. Skipping migration.")
        else:
            # Add status column with default 'active'
            # Common statuses: 'active', 'inactive', 'suspended', 'pending'
            cur.execute("""
                ALTER TABLE users 
                ADD COLUMN status VARCHAR(20) DEFAULT 'active' 
                CHECK (status IN ('active', 'inactive', 'suspended', 'pending'))
            """)
            
            # Update existing users to have 'active' status
            cur.execute("""
                UPDATE users 
                SET status = 'active' 
                WHERE status IS NULL
            """)
            
            conn.commit()
            print("✅ Successfully added status column to users table.")
            print("   Default value: 'active'")
            print("   Allowed values: 'active', 'inactive', 'suspended', 'pending'")
        
        # Display current table structure
        cur.execute("""
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        """)
        
        print("\n📋 Current users table structure:")
        print("=" * 80)
        print(f"{'Column Name':<20} {'Type':<20} {'Default':<25} {'Nullable':<10}")
        print("=" * 80)
        
        for row in cur.fetchall():
            column_name = row[0]
            data_type = row[1]
            default = row[2] if row[2] else 'None'
            nullable = row[3]
            print(f"{column_name:<20} {data_type:<20} {default:<25} {nullable:<10}")
        
        print("=" * 80)
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
    
    finally:
        cur.close()
        conn.close()
        print("\n✨ Migration completed successfully!")

if __name__ == "__main__":
    migrate_add_status()
