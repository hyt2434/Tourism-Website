"""
Migration Script: Add promotion_code column to bookings table
Run this script to add promotion_code column for tracking applied promotions.

Usage:
    python -m src.migration.migrate_add_promotion_code_to_bookings
    or
    python migrate_add_promotion_code_to_bookings.py (from the backend directory)
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from src.database import get_connection

def migrate_add_promotion_code_to_bookings():
    """Add promotion_code column to bookings table."""
    conn = get_connection()
    if conn is None:
        print("❌ Failed to connect to database.")
        sys.exit(1)
    
    cur = conn.cursor()
    
    try:
        print("📦 Starting migration: Adding promotion_code column to bookings table...")
        
        # Check if bookings table exists
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'bookings'
            )
        """)
        
        if not cur.fetchone()[0]:
            print("⚠️  Bookings table does not exist. Skipping migration.")
            return
        
        # Check if promotion_code column already exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='bookings' AND column_name='promotion_code'
        """)
        
        if cur.fetchone():
            print("ℹ️  Column 'promotion_code' already exists. Skipping migration.")
        else:
            # Add promotion_code column
            cur.execute("""
                ALTER TABLE bookings 
                ADD COLUMN promotion_code VARCHAR(50)
            """)
            conn.commit()
            print("✅ Added column 'promotion_code' to bookings table.")
        
        # Display current table structure
        cur.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'bookings'
            ORDER BY ordinal_position
        """)
        
        print("\n📋 Current bookings table structure:")
        print("=" * 80)
        print(f"{'Column Name':<25} {'Type':<25} {'Nullable':<10}")
        print("=" * 80)
        
        for row in cur.fetchall():
            column_name = row[0]
            data_type = row[1]
            nullable = row[2]
            print(f"{column_name:<25} {data_type:<25} {nullable:<10}")
        
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
    migrate_add_promotion_code_to_bookings()

