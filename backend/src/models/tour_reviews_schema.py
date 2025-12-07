from config.database import get_connection

def create_tour_reviews_table():
    """
    Create tour_reviews table for storing user reviews of completed tours
    Users can review tours they have booked and completed
    Reviews can be anonymous or use the user's account name
    Reviews can include optional images
    """
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS tour_reviews (
                id SERIAL PRIMARY KEY,
                tour_id INTEGER NOT NULL REFERENCES tours_admin(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                review_text TEXT,
                is_anonymous BOOLEAN DEFAULT FALSE,
                review_images TEXT[], -- Array of image URLs
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(booking_id) -- One review per booking
            )
        """)
        
        # Create index for faster queries
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_tour_reviews_tour_id ON tour_reviews(tour_id);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_tour_reviews_user_id ON tour_reviews(user_id);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_tour_reviews_created_at ON tour_reviews(created_at DESC);
        """)
        
        conn.commit()
        print("[OK] tour_reviews table created successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"[ERROR] Failed to create tour_reviews table: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    create_tour_reviews_table()
