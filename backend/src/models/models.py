from src.database import get_connection

def create_table():
    conn = get_connection()
    if conn is None:
        print("❌ Cannot create table: Database connection failed.")
        return

    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(200) NOT NULL
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

class Tour:
    def __init__(self, id, name, image, price, duration, rating, reviews, tour_type, is_active, province_name, region_name, max_slots, badge, start_date=None):
        self.id = id
        self.name = name
        self.image = image
        self.price = price
        self.duration = duration
        self.rating = rating
        self.reviews = reviews
        self.tour_type = tour_type
        self.is_active = is_active
        self.province_name = province_name
        self.region_name = region_name
        self.max_slots = max_slots
        self.badge = badge
        self.start_date = start_date or 'Tue, 25 Nov 2025 00:00:00 GMT' #temp

    @staticmethod
    def from_db_row(row):
        """Tạo đối tượng Tour từ một hàng kết quả truy vấn"""
        if not row:
            return None
            
        return Tour(
            id=row[0], name=row[1], image=row[2], price=float(row[3]), 
            duration=row[4], rating=float(row[5]) if row[5] else None, 
            reviews=row[6], tour_type=row[7], is_active=row[8], 
            province_name=row[9], region_name=row[10], max_slots=row[11], 
            badge=row[12]
        )

    def to_dict(self):
        """Chuyển đổi đối tượng Tour thành Dictionary để trả về qua JSON"""
        return {
            'id': self.id, 'name': self.name, 'image': self.image, 'price': self.price, 
            'duration': self.duration, 'rating': self.rating, 'reviews': self.reviews,
            'tour_type': self.tour_type, 'is_active': self.is_active, 
            'province_name': self.province_name, 'region_name': self.region_name,
            'max_slots': self.max_slots, 'badge': self.badge,
            'start_date': self.start_date
        }

    @staticmethod
    def get_by_tour_types(tour_types, limit=3):
        """Lấy tour dựa trên tour_types, sắp xếp theo rating"""
        conn = get_connection()
        if not conn: return []
        
        try:
            cur = conn.cursor()
            
            type_placeholders = ', '.join(['%s'] * len(tour_types))
            query = f"""
                SELECT id, name, image, price, duration, rating, reviews, tour_type, is_active, 
                       province_name, region_name, max_slots, badge, province_id
                FROM tours
                WHERE is_active = TRUE AND tour_type IN ({type_placeholders})
                ORDER BY rating DESC
                LIMIT %s;
            """
            
            cur.execute(query, (*tour_types, limit))
            rows = cur.fetchall()
            
            tours = [Tour.from_db_row(row) for row in rows]
            return tours
            
        except Exception as e:
            print(f"Lỗi truy vấn Tour: {e}")
            return []
            
        finally:
            if conn:
                conn.close()