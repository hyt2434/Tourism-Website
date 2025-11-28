"""
Migration script to add tables for storing tour room and menu selections.
Run this once to create the tables.
"""

from src.database import get_connection

def migrate_tour_selections():
    """Create tables for tour_selected_rooms and tour_selected_menu_items."""
    conn = get_connection()
    if not conn:
        print("❌ Database connection failed")
        return False
    
    try:
        cur = conn.cursor()
        
        # Create tour_selected_rooms table
        print("Creating tour_selected_rooms table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tour_selected_rooms (
                id SERIAL PRIMARY KEY,
                tour_id INTEGER NOT NULL REFERENCES tours_admin(id) ON DELETE CASCADE,
                room_id INTEGER NOT NULL REFERENCES accommodation_rooms(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(tour_id, room_id)
            )
        """)
        
        # Create tour_selected_menu_items table
        print("Creating tour_selected_menu_items table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tour_selected_menu_items (
                id SERIAL PRIMARY KEY,
                tour_id INTEGER NOT NULL REFERENCES tours_admin(id) ON DELETE CASCADE,
                menu_item_id INTEGER NOT NULL REFERENCES restaurant_menu_items(id) ON DELETE CASCADE,
                day_number INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(tour_id, menu_item_id, day_number)
            )
        """)
        
        conn.commit()
        print("✅ Successfully created tour selection tables")
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
        return False
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("Starting migration: Create tour selection tables")
    print("=" * 60)
    success = migrate_tour_selections()
    print("=" * 60)
    if success:
        print("✅ Migration completed successfully")
    else:
        print("❌ Migration failed")
