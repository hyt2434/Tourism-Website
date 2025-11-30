"""
Migration Script: Add homepage fields to promotions table
Run this script to add columns for homepage promotion display.

Usage:
    python -m src.migration.migrate_promotions_homepage
    or
    python migrate_promotions_homepage.py (from the backend directory)
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from config.database import get_connection

def migrate_promotions_homepage():
    """Add homepage fields to promotions table."""
    conn = get_connection()
    if conn is None:
        print("❌ Failed to connect to database.")
        sys.exit(1)
    
    cur = conn.cursor()
    
    try:
        print("📦 Starting migration: Adding homepage fields to promotions table...")
        
        # Check if promotions table exists
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'promotions'
            )
        """)
        
        if not cur.fetchone()[0]:
            print("⚠️  Promotions table does not exist. Creating it...")
            # Create basic promotions table if it doesn't exist
            cur.execute("""
                CREATE TABLE promotions (
                    id SERIAL PRIMARY KEY,
                    code VARCHAR(50) UNIQUE NOT NULL,
                    discount_type VARCHAR(20) NOT NULL,
                    discount_value DECIMAL(10, 2) NOT NULL,
                    max_uses INTEGER,
                    start_date DATE,
                    end_date DATE,
                    conditions TEXT,
                    is_active BOOLEAN DEFAULT true,
                    show_on_homepage BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
            print("✅ Created promotions table.")
        
        # Add new columns if they don't exist
        new_columns = [
            ('promotion_type', "VARCHAR(20) DEFAULT 'promo_code' CHECK (promotion_type IN ('banner', 'promo_code'))"),
            ('title', 'VARCHAR(200)'),
            ('subtitle', 'VARCHAR(200)'),
            ('image', 'TEXT'),
            ('highlight', 'VARCHAR(100)'),
            ('terms', 'TEXT')
        ]
        
        for column_name, column_def in new_columns:
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='promotions' AND column_name=%s
            """, (column_name,))
            
            if cur.fetchone():
                print(f"ℹ️  Column '{column_name}' already exists. Skipping.")
            else:
                cur.execute(f"""
                    ALTER TABLE promotions 
                    ADD COLUMN {column_name} {column_def}
                """)
                print(f"✅ Added column '{column_name}' to promotions table.")
        
        conn.commit()
        
        # Display current table structure
        cur.execute("""
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'promotions'
            ORDER BY ordinal_position
        """)
        
        print("\n📋 Current promotions table structure:")
        print("=" * 80)
        print(f"{'Column Name':<25} {'Type':<25} {'Default':<20} {'Nullable':<10}")
        print("=" * 80)
        
        for row in cur.fetchall():
            column_name = row[0]
            data_type = row[1]
            default = row[2] if row[2] else 'None'
            nullable = row[3]
            print(f"{column_name:<25} {data_type:<25} {default:<20} {nullable:<10}")
        
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
    migrate_promotions_homepage()

