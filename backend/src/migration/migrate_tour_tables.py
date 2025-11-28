"""
Migration script to create tour management tables.

This script creates all necessary tables for the admin tour management system.
Run this script once to initialize the tour schema in the database.
"""

from src.models.tour_schema import create_tour_tables


def migrate_tour_tables():
    """Execute the tour tables migration."""
    print("[INFO] Starting tour tables migration...")
    success = create_tour_tables()
    
    if success:
        print("[OK] Tour tables migration completed successfully!")
    else:
        print("[ERROR] Tour tables migration failed!")
    
    return success


if __name__ == "__main__":
    migrate_tour_tables()
