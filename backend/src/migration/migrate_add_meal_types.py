"""
Migration Script: Add meal_types column to restaurant_menu_items table
Run this script to add a meal_types JSONB column for tracking breakfast, lunch, dinner availability.

Usage:
    python -m src.routes.user.migrate_add_meal_types
    or
    python migrate_add_meal_types.py (from the backend directory)
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from src.database import get_connection

def migrate_add_meal_types():
    """Add meal_types column to restaurant_menu_items table."""
    conn = get_connection()
    if conn is None:
        print("❌ Failed to connect to database.")
        sys.exit(1)
    
    cur = conn.cursor()
    
    try:
        print("📦 Starting migration: Adding meal_types column to restaurant_menu_items table...")
        
        # Check if meal_types column already exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='restaurant_menu_items' AND column_name='meal_types'
        """)
        
        meal_types_exists = cur.fetchone()
        
        # Check if images column already exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='restaurant_menu_items' AND column_name='images'
        """)
        
        images_exists = cur.fetchone()
        
        if meal_types_exists and images_exists:
            print("ℹ️  meal_types and images columns already exist. Skipping migration.")
        else:
            if not meal_types_exists:
                # Add meal_types column as JSONB with default value
                cur.execute("""
                    ALTER TABLE restaurant_menu_items 
                    ADD COLUMN meal_types JSONB DEFAULT '{"breakfast": false, "lunch": false, "dinner": false}'::jsonb
                """)
                
                # Update existing menu items to have the default meal_types structure
                cur.execute("""
                    UPDATE restaurant_menu_items 
                    SET meal_types = '{"breakfast": false, "lunch": false, "dinner": false}'::jsonb
                    WHERE meal_types IS NULL
                """)
                
                print("✅ Successfully added meal_types column to restaurant_menu_items table.")
                print("   Column type: JSONB")
                print("   Default value: {\"breakfast\": false, \"lunch\": false, \"dinner\": false}")
                print("   Description: Tracks which meal times the dish is available for")
            
            if not images_exists:
                # Add images column as TEXT array
                cur.execute("""
                    ALTER TABLE restaurant_menu_items 
                    ADD COLUMN images TEXT[] DEFAULT '{}'::text[]
                """)
                
                # Update existing menu items to have empty images array
                cur.execute("""
                    UPDATE restaurant_menu_items 
                    SET images = '{}'::text[]
                    WHERE images IS NULL
                """)
                
                print("✅ Successfully added images column to restaurant_menu_items table.")
                print("   Column type: TEXT[]")
                print("   Default value: []")
                print("   Description: Stores multiple image URLs/base64 strings for each dish")
            
            conn.commit()
        
        # Display current table structure
        cur.execute("""
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'restaurant_menu_items'
            ORDER BY ordinal_position
        """)
        
        print("\n📋 Current restaurant_menu_items table structure:")
        print("=" * 100)
        print(f"{'Column Name':<25} {'Type':<20} {'Default':<40} {'Nullable':<10}")
        print("=" * 100)
        
        for row in cur.fetchall():
            column_name = row[0]
            data_type = row[1]
            default = str(row[2])[:38] if row[2] else 'None'
            nullable = row[3]
            print(f"{column_name:<25} {data_type:<20} {default:<40} {nullable:<10}")
        
        print("=" * 100)
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
    
    finally:
        cur.close()
        conn.close()
        print("\n✨ Migration completed successfully!")

if __name__ == "__main__":
    migrate_add_meal_types()
