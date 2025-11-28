"""
Migration script to add partner_type column to users table.

This script adds the partner_type column to the users table to support
partner type tracking (accommodation, transportation, restaurant).

Run this script once to migrate existing database:
    python -m src.routes.user.migrate_partner_type
"""

from src.database import get_connection


def migrate_add_partner_type():
    """
    Add partner_type column to users table if it doesn't exist.
    This column stores the type of partner service they provide.
    """
    conn = get_connection()
    if conn is None:
        print("❌ Cannot migrate: Database connection failed.")
        return False

    cur = conn.cursor()
    
    try:
        print("🔄 Checking if partner_type column exists...")
        
        # Check if column already exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'partner_type'
        """)
        
        column_exists = cur.fetchone() is not None
        
        if column_exists:
            print("✅ partner_type column already exists. No migration needed.")
            return True
        
        print("📝 Adding partner_type column to users table...")
        
        # Add partner_type column
        cur.execute("""
            ALTER TABLE users 
            ADD COLUMN partner_type VARCHAR(50) 
            CHECK (partner_type IN ('accommodation', 'transportation', 'restaurant') OR partner_type IS NULL)
        """)
        
        conn.commit()
        print("✅ Successfully added partner_type column to users table!")
        
        # Optional: Update existing partner users with partner_type from their registrations
        print("🔄 Checking for existing partner users to update...")
        
        cur.execute("""
            UPDATE users u
            SET partner_type = pr.partner_type
            FROM partner_registrations pr
            WHERE u.id = pr.created_user_id
            AND u.role = 'partner'
            AND u.partner_type IS NULL
            AND pr.status = 'approved'
        """)
        
        updated_count = cur.rowcount
        conn.commit()
        
        if updated_count > 0:
            print(f"✅ Updated {updated_count} existing partner user(s) with their partner_type!")
        else:
            print("ℹ️  No existing partner users needed updating.")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        return False
        
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Partner Type Migration Script")
    print("=" * 60)
    print()
    
    success = migrate_add_partner_type()
    
    print()
    print("=" * 60)
    if success:
        print("✅ Migration completed successfully!")
    else:
        print("❌ Migration failed. Please check the error messages above.")
    print("=" * 60)
