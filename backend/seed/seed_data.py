"""
Seed Data Script for Tourism Website Database

This script populates the database with initial data including:
- 16 users (4 clients, 12 partners, 1 admin)
- Partner services (accommodations, restaurants, transportation)
- Tours (at least 10)
- Promotions (10 promo codes + 10 banners)

Run this script after creating the database tables.
Usage: python seed_data.py
"""

import os
import sys
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt

# Load environment variables
load_dotenv()

# Add backend directory to path so we can import from config and src
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from config.database import get_connection
from seed.import_tour_images import import_tour_images

bcrypt = Bcrypt()

# Vietnam cities mapping (name -> id)
CITY_IDS = {}

def get_city_id(city_name):
    """Get city ID by name"""
    return CITY_IDS.get(city_name, 1)  # Default to Hà Nội if not found

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.generate_password_hash(password).decode('utf-8')

def load_city_ids():
    """Load city IDs from database"""
    conn = get_connection()
    if not conn:
        print("❌ Cannot load cities: Database connection failed.")
        return
    
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, name FROM cities")
        for row in cur.fetchall():
            CITY_IDS[row[1]] = row[0]
    finally:
        cur.close()
        conn.close()

def create_users():
    """Create 16 users: 4 clients, 12 partners (4 each type), 1 admin"""
    conn = get_connection()
    if not conn:
        print("❌ Cannot create users: Database connection failed.")
        return []
    
    cur = conn.cursor()
    user_ids = {}
    
    try:
        # Check if users already exist
        cur.execute("SELECT COUNT(*) FROM users WHERE role != 'admin'")
        if cur.fetchone()[0] > 0:
            print("ℹ️  Users already exist. Skipping user creation.")
            cur.execute("SELECT id, email, role, partner_type FROM users")
            for row in cur.fetchall():
                key = f"{row[1]}_{row[2]}_{row[3] or ''}"
                user_ids[key] = row[0]
            return user_ids
        
        users_data = [
            # Clients (4)
            {'username': 'Nguyễn Văn An', 'email': 'client1@example.com', 'password': 'Client123!', 'role': 'client', 'phone': '0912345678'},
            {'username': 'Trần Thị Bình', 'email': 'client2@example.com', 'password': 'Client123!', 'role': 'client', 'phone': '0923456789'},
            {'username': 'Lê Văn Cường', 'email': 'client3@example.com', 'password': 'Client123!', 'role': 'client', 'phone': '0934567890'},
            {'username': 'Phạm Thị Dung', 'email': 'client4@example.com', 'password': 'Client123!', 'role': 'client', 'phone': '0945678901'},
            
            # Accommodation Partners (12 - one for each tour destination)
            {'username': 'Khách sạn Hoàn Kiếm', 'email': 'hotel1@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'accommodation', 'phone': '0241234567'},
            {'username': 'Resort Sapa Luxury', 'email': 'hotel2@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'accommodation', 'phone': '0214123456'},
            {'username': 'Khách sạn Đà Lạt View', 'email': 'hotel3@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'accommodation', 'phone': '0263123456'},
            {'username': 'Beach Resort Nha Trang', 'email': 'hotel4@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'accommodation', 'phone': '0258123456'},
            {'username': 'Khách sạn Hạ Long Bay', 'email': 'hotel5@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'accommodation', 'phone': '0203123456'},
            {'username': 'Khách sạn Huế Imperial', 'email': 'hotel6@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'accommodation', 'phone': '0234123456'},
            {'username': 'Resort Hội An Riverside', 'email': 'hotel7@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'accommodation', 'phone': '0235123456'},
            {'username': 'Beach Resort Mũi Né', 'email': 'hotel8@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'accommodation', 'phone': '0252123456'},
            {'username': 'Khách sạn Cần Thơ Mekong', 'email': 'hotel9@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'accommodation', 'phone': '0292123456'},
            {'username': 'Resort Phú Quốc Paradise', 'email': 'hotel10@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'accommodation', 'phone': '0297123456'},
            {'username': 'Khách sạn Ninh Bình Heritage', 'email': 'hotel11@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'accommodation', 'phone': '0229123456'},
            {'username': 'Khách sạn Đà Nẵng Beach', 'email': 'hotel12@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'accommodation', 'phone': '0236123458'},
            
            # Transportation Partners (8 - covering all routes)
            {'username': 'Taxi Hà Nội', 'email': 'transport1@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'transportation', 'phone': '0241234568'},
            {'username': 'Xe Limousine Sài Gòn', 'email': 'transport2@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'transportation', 'phone': '0281234567'},
            {'username': 'Xe Bus Du Lịch Miền Trung', 'email': 'transport3@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'transportation', 'phone': '0236123456'},
            {'username': 'Xe Khách Đà Nẵng', 'email': 'transport4@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'transportation', 'phone': '0236123457'},
            {'username': 'Xe Bus Hà Nội - Sapa', 'email': 'transport5@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'transportation', 'phone': '0241234569'},
            {'username': 'Xe Bus Hà Nội - Hạ Long', 'email': 'transport6@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'transportation', 'phone': '0241234570'},
            {'username': 'Xe Bus Sài Gòn - Đà Lạt', 'email': 'transport7@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'transportation', 'phone': '0281234569'},
            {'username': 'Xe Bus Sài Gòn - Phú Quốc', 'email': 'transport8@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'transportation', 'phone': '0281234570'},
            
            # Restaurant Partners (12 - one for each tour destination)
            {'username': 'Nhà hàng Phở Gia Truyền', 'email': 'restaurant1@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'restaurant', 'phone': '0241234569'},
            {'username': 'Quán Bún Chả Hà Nội', 'email': 'restaurant2@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'restaurant', 'phone': '0241234570'},
            {'username': 'Nhà hàng Hải Sản Nha Trang', 'email': 'restaurant3@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'restaurant', 'phone': '0258123457'},
            {'username': 'Quán Cơm Tấm Sài Gòn', 'email': 'restaurant4@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'restaurant', 'phone': '0281234568'},
            {'username': 'Nhà hàng Sapa View', 'email': 'restaurant5@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'restaurant', 'phone': '0214123457'},
            {'username': 'Nhà hàng Hạ Long Seafood', 'email': 'restaurant6@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'restaurant', 'phone': '0203123457'},
            {'username': 'Nhà hàng Đà Lạt Garden', 'email': 'restaurant7@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'restaurant', 'phone': '0263123457'},
            {'username': 'Nhà hàng Huế Cung Đình', 'email': 'restaurant8@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'restaurant', 'phone': '0234123457'},
            {'username': 'Nhà hàng Hội An Ancient', 'email': 'restaurant9@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'restaurant', 'phone': '0235123457'},
            {'username': 'Nhà hàng Mũi Né Beach', 'email': 'restaurant10@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'restaurant', 'phone': '0252123457'},
            {'username': 'Nhà hàng Cần Thơ Mekong', 'email': 'restaurant11@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'restaurant', 'phone': '0292123457'},
            {'username': 'Nhà hàng Phú Quốc Island', 'email': 'restaurant12@example.com', 'password': 'Partner123!', 'role': 'partner', 'partner_type': 'restaurant', 'phone': '0297123457'},
        ]
        
        for user in users_data:
            hashed_pw = hash_password(user['password'])
            cur.execute("""
                INSERT INTO users (username, email, password, role, partner_type, phone, status)
                VALUES (%s, %s, %s, %s, %s, %s, 'active')
                RETURNING id
            """, (user['username'], user['email'], hashed_pw, user['role'], 
                  user.get('partner_type'), user.get('phone')))
            user_id = cur.fetchone()[0]
            key = f"{user['email']}_{user['role']}_{user.get('partner_type', '')}"
            user_ids[key] = user_id
            print(f"✅ Created user: {user['username']} ({user['email']})")
        
        conn.commit()
        print(f"\n✅ Created {len(users_data)} users successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating users: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cur.close()
        conn.close()
    
    return user_ids

def create_accommodations(user_ids):
    """Create accommodation services for accommodation partners"""
    conn = get_connection()
    if not conn:
        return
    
    cur = conn.cursor()
    
    try:
        # Check if accommodations already exist
        cur.execute("SELECT COUNT(*) FROM accommodation_services")
        if cur.fetchone()[0] > 0:
            print("ℹ️  Accommodations already exist. Skipping.")
            return
        
        accommodations = [
            {
                'partner_key': 'hotel1@example.com_partner_accommodation',
                'name': 'Khách sạn Hoàn Kiếm 4 sao',
                'description': 'Khách sạn 4 sao nằm ngay trung tâm Hà Nội, gần Hồ Hoàn Kiếm. Phục vụ chu đáo, tiện nghi hiện đại.',
                'star_rating': 4,
                'address': '38 Hàng Bông, Hoàn Kiếm, Hà Nội',
                'city': 'Hà Nội',
                'latitude': 21.0285,
                'longitude': 105.8542,
                'phone': '0241234567',
                'email': 'info@hoankiemhotel.com',
                'amenities': ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking'],
                'min_price': 1500000,
                'max_price': 3500000
            },
            {
                'partner_key': 'hotel2@example.com_partner_accommodation',
                'name': 'Resort Sapa Luxury',
                'description': 'Resort cao cấp tại Sapa với view núi tuyệt đẹp. Phù hợp cho nghỉ dưỡng và tham quan.',
                'star_rating': 5,
                'address': 'Thôn Cát Cát, Sapa, Lào Cai',
                'city': 'Lào Cai',
                'latitude': 22.3369,
                'longitude': 103.8440,
                'phone': '0214123456',
                'email': 'info@saparesort.com',
                'amenities': ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking', 'Mountain View'],
                'min_price': 3000000,
                'max_price': 8000000
            },
            {
                'partner_key': 'hotel3@example.com_partner_accommodation',
                'name': 'Khách sạn Đà Lạt View',
                'description': 'Khách sạn view thành phố Đà Lạt, không khí trong lành, gần các điểm du lịch nổi tiếng.',
                'star_rating': 4,
                'address': '15 Trần Phú, Phường 1, Đà Lạt, Lâm Đồng',
                'city': 'Lâm Đồng',
                'latitude': 11.9404,
                'longitude': 108.4583,
                'phone': '0263123456',
                'email': 'info@dalathotel.com',
                'amenities': ['WiFi', 'Restaurant', 'Parking', 'City View', 'Garden'],
                'min_price': 1200000,
                'max_price': 3000000
            },
            {
                'partner_key': 'hotel4@example.com_partner_accommodation',
                'name': 'Beach Resort Nha Trang',
                'description': 'Resort bãi biển 5 sao tại Nha Trang, view biển tuyệt đẹp, dịch vụ spa và nhà hàng hải sản.',
                'star_rating': 5,
                'address': 'Bãi biển Trần Phú, Nha Trang, Khánh Hòa',
                'city': 'Khánh Hòa',
                'latitude': 12.2388,
                'longitude': 109.1967,
                'phone': '0258123456',
                'email': 'info@nhatrangresort.com',
                'amenities': ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Beach Access', 'Parking'],
                'min_price': 4000000,
                'max_price': 12000000
            },
            {
                'partner_key': 'hotel5@example.com_partner_accommodation',
                'name': 'Khách sạn Hạ Long Bay View',
                'description': 'Khách sạn view vịnh Hạ Long, gần bến tàu du lịch, tiện nghi đầy đủ.',
                'star_rating': 4,
                'address': 'Bãi Cháy, Hạ Long, Quảng Ninh',
                'city': 'Quảng Ninh',
                'latitude': 20.9101,
                'longitude': 107.1839,
                'phone': '0203123456',
                'email': 'info@halonghotel.com',
                'amenities': ['WiFi', 'Pool', 'Restaurant', 'Parking', 'Bay View'],
                'min_price': 2000000,
                'max_price': 5000000
            },
            {
                'partner_key': 'hotel6@example.com_partner_accommodation',
                'name': 'Khách sạn Huế Imperial',
                'description': 'Khách sạn gần Đại Nội Huế, phong cách cung đình, thưởng thức ẩm thực Huế.',
                'star_rating': 4,
                'address': '50 Lê Lợi, Thành phố Huế, Thừa Thiên Huế',
                'city': 'Thừa Thiên Huế',
                'latitude': 16.4637,
                'longitude': 107.5909,
                'phone': '0234123456',
                'email': 'info@huehotel.com',
                'amenities': ['WiFi', 'Restaurant', 'Parking', 'Garden'],
                'min_price': 1500000,
                'max_price': 3500000
            },
            {
                'partner_key': 'hotel7@example.com_partner_accommodation',
                'name': 'Resort Hội An Riverside',
                'description': 'Resort bên sông Thu Bồn, gần Phố cổ Hội An, không gian yên tĩnh.',
                'star_rating': 4,
                'address': 'Cẩm Thanh, Hội An, Quảng Nam',
                'city': 'Quảng Nam',
                'latitude': 15.8801,
                'longitude': 108.3380,
                'phone': '0235123456',
                'email': 'info@hoianresort.com',
                'amenities': ['WiFi', 'Pool', 'Restaurant', 'Parking', 'River View'],
                'min_price': 1800000,
                'max_price': 4000000
            },
            {
                'partner_key': 'hotel8@example.com_partner_accommodation',
                'name': 'Beach Resort Mũi Né',
                'description': 'Resort bãi biển Mũi Né, gần đồi cát đỏ, view biển đẹp.',
                'star_rating': 4,
                'address': 'Bãi biển Mũi Né, Phan Thiết, Bình Thuận',
                'city': 'Bình Thuận',
                'latitude': 10.9376,
                'longitude': 108.2772,
                'phone': '0252123456',
                'email': 'info@muinereport.com',
                'amenities': ['WiFi', 'Pool', 'Restaurant', 'Parking', 'Beach Access'],
                'min_price': 2500000,
                'max_price': 6000000
            },
            {
                'partner_key': 'hotel9@example.com_partner_accommodation',
                'name': 'Khách sạn Cần Thơ Mekong',
                'description': 'Khách sạn gần sông Mekong, thuận tiện đi chợ nổi, vườn trái cây.',
                'star_rating': 3,
                'address': '2 Hòa Bình, Ninh Kiều, Cần Thơ',
                'city': 'Cần Thơ',
                'latitude': 10.0452,
                'longitude': 105.7870,
                'phone': '0292123456',
                'email': 'info@canthohotel.com',
                'amenities': ['WiFi', 'Restaurant', 'Parking'],
                'min_price': 800000,
                'max_price': 2000000
            },
            {
                'partner_key': 'hotel10@example.com_partner_accommodation',
                'name': 'Resort Phú Quốc Paradise',
                'description': 'Resort 5 sao tại Phú Quốc, bãi biển đẹp nhất Việt Nam, dịch vụ cao cấp.',
                'star_rating': 5,
                'address': 'Bãi Dài, Phú Quốc, Kiên Giang',
                'city': 'Kiên Giang',
                'latitude': 10.2899,
                'longitude': 103.9840,
                'phone': '0297123456',
                'email': 'info@phuquocresort.com',
                'amenities': ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Beach Access', 'Parking'],
                'min_price': 5000000,
                'max_price': 15000000
            },
            {
                'partner_key': 'hotel11@example.com_partner_accommodation',
                'name': 'Khách sạn Ninh Bình Heritage',
                'description': 'Khách sạn gần Tam Cốc, Tràng An, thuận tiện tham quan Ninh Bình.',
                'star_rating': 3,
                'address': 'Tràng An, Ninh Bình',
                'city': 'Ninh Bình',
                'latitude': 20.2506,
                'longitude': 105.9744,
                'phone': '0229123456',
                'email': 'info@ninhbinhhotel.com',
                'amenities': ['WiFi', 'Restaurant', 'Parking'],
                'min_price': 1000000,
                'max_price': 2500000
            },
            {
                'partner_key': 'hotel12@example.com_partner_accommodation',
                'name': 'Khách sạn Đà Nẵng Beach',
                'description': 'Khách sạn bãi biển Mỹ Khê, gần Bà Nà Hills, tiện nghi hiện đại.',
                'star_rating': 4,
                'address': 'Bãi biển Mỹ Khê, Đà Nẵng',
                'city': 'Đà Nẵng',
                'latitude': 16.0544,
                'longitude': 108.2022,
                'phone': '0236123458',
                'email': 'info@dananghotel.com',
                'amenities': ['WiFi', 'Pool', 'Restaurant', 'Parking', 'Beach Access'],
                'min_price': 2000000,
                'max_price': 5000000
            },
            {
                'partner_key': 'hotel1@example.com_partner_accommodation',  # Reuse partner for Cao Bằng
                'name': 'Khách sạn Cao Bằng Mountain',
                'description': 'Khách sạn gần Thác Bản Giốc, view núi non hùng vĩ, ẩm thực dân tộc.',
                'star_rating': 3,
                'address': 'Thành phố Cao Bằng, Cao Bằng',
                'city': 'Cao Bằng',
                'latitude': 22.6657,
                'longitude': 106.2576,
                'phone': '0206123456',
                'email': 'info@caobanghotel.com',
                'amenities': ['WiFi', 'Restaurant', 'Parking', 'Mountain View'],
                'min_price': 900000,
                'max_price': 2200000
            }
        ]
        
        for acc in accommodations:
            partner_id = user_ids.get(acc['partner_key'])
            if not partner_id:
                continue
            
            city_id = get_city_id(acc['city'])
            
            cur.execute("""
                INSERT INTO accommodation_services 
                (partner_id, name, description, star_rating, address, city_id, latitude, longitude,
                 phone, email, amenities, min_price, max_price, is_active, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE, TRUE)
                RETURNING id
            """, (partner_id, acc['name'], acc['description'], acc['star_rating'], acc['address'],
                  city_id, acc['latitude'], acc['longitude'], acc['phone'], acc['email'],
                  acc['amenities'], acc['min_price'], acc['max_price']))
            
            acc_id = cur.fetchone()[0]
            
            # Create rooms for each accommodation (reduced prices - 60% of original)
            rooms_data = [
                {'name': 'Phòng Standard', 'room_type': 'Double', 'max_adults': 2, 'max_children': 1,
                 'base_price': int(acc['min_price'] * 0.6), 'weekend_price': int(acc['min_price'] * 0.6 * 1.2), 'holiday_price': int(acc['min_price'] * 0.6 * 1.5)},
                {'name': 'Phòng Deluxe', 'room_type': 'Double', 'max_adults': 2, 'max_children': 2,
                 'base_price': int((acc['min_price'] + acc['max_price']) / 2 * 0.6), 'weekend_price': int((acc['min_price'] + acc['max_price']) / 2 * 0.6 * 1.2),
                 'holiday_price': int((acc['min_price'] + acc['max_price']) / 2 * 0.6 * 1.5)},
                {'name': 'Phòng Suite', 'room_type': 'Suite', 'max_adults': 4, 'max_children': 2,
                 'base_price': int(acc['max_price'] * 0.6), 'weekend_price': int(acc['max_price'] * 0.6 * 1.2), 'holiday_price': int(acc['max_price'] * 0.6 * 1.5)}
            ]
            
            for room in rooms_data:
                cur.execute("""
                    INSERT INTO accommodation_rooms
                    (accommodation_id, name, room_type, max_adults, max_children, base_price, weekend_price, holiday_price, is_available)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE)
                """, (acc_id, room['name'], room['room_type'], room['max_adults'], room['max_children'],
                      room['base_price'], room['weekend_price'], room['holiday_price']))
            
            print(f"✅ Created accommodation: {acc['name']} with {len(rooms_data)} rooms")
        
        conn.commit()
        print(f"\n✅ Created {len(accommodations)} accommodations successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating accommodations: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cur.close()
        conn.close()

def create_restaurants(user_ids):
    """Create restaurant services for restaurant partners"""
    conn = get_connection()
    if not conn:
        return
    
    cur = conn.cursor()
    
    try:
        # Check if restaurants already exist
        cur.execute("SELECT COUNT(*) FROM restaurant_services")
        if cur.fetchone()[0] > 0:
            print("ℹ️  Restaurants already exist. Skipping.")
            return
        
        restaurants = [
            {
                'partner_key': 'restaurant1@example.com_partner_restaurant',
                'name': 'Phở Gia Truyền Hà Nội',
                'description': 'Nhà hàng phở nổi tiếng với công thức gia truyền, nước dùng đậm đà, thịt bò tươi ngon.',
                'cuisine_type': 'Vietnamese',
                'address': '49 Lý Quốc Sư, Hoàn Kiếm, Hà Nội',
                'city': 'Hà Nội',
                'latitude': 21.0294,
                'longitude': 105.8522,
                'phone': '0241234569',
                'opening_time': '06:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$',
                'average_cost': 80000
            },
            {
                'partner_key': 'restaurant2@example.com_partner_restaurant',
                'name': 'Bún Chả Hàng Mành',
                'description': 'Quán bún chả nổi tiếng Hà Nội, thịt nướng thơm lừng, nước mắm chua ngọt đặc biệt.',
                'cuisine_type': 'Vietnamese',
                'address': '1 Hàng Mành, Hoàn Kiếm, Hà Nội',
                'city': 'Hà Nội',
                'latitude': 21.0311,
                'longitude': 105.8500,
                'phone': '0241234570',
                'opening_time': '10:00:00',
                'closing_time': '20:00:00',
                'price_range': '$',
                'average_cost': 60000
            },
            {
                'partner_key': 'restaurant3@example.com_partner_restaurant',
                'name': 'Nhà hàng Hải Sản Nha Trang',
                'description': 'Nhà hàng hải sản tươi sống, chế biến theo phong cách miền Trung, view biển đẹp.',
                'cuisine_type': 'Seafood',
                'address': '78 Trần Phú, Nha Trang, Khánh Hòa',
                'city': 'Khánh Hòa',
                'latitude': 12.2394,
                'longitude': 109.1956,
                'phone': '0258123457',
                'opening_time': '11:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$$',
                'average_cost': 300000
            },
            {
                'partner_key': 'restaurant4@example.com_partner_restaurant',
                'name': 'Cơm Tấm Sài Gòn',
                'description': 'Quán cơm tấm đặc sản Sài Gòn, sườn nướng thơm, bì chả giò giòn tan.',
                'cuisine_type': 'Vietnamese',
                'address': '123 Nguyễn Trãi, Quận 1, Hồ Chí Minh',
                'city': 'Hồ Chí Minh',
                'latitude': 10.7769,
                'longitude': 106.7009,
                'phone': '0281234568',
                'opening_time': '06:00:00',
                'closing_time': '22:00:00',
                'price_range': '$',
                'average_cost': 70000
            },
            {
                'partner_key': 'restaurant5@example.com_partner_restaurant',
                'name': 'Nhà hàng Sapa View',
                'description': 'Nhà hàng view núi Sapa, ẩm thực dân tộc vùng cao, thịt nướng, rượu táo mèo.',
                'cuisine_type': 'Vietnamese',
                'address': 'Thị trấn Sapa, Lào Cai',
                'city': 'Lào Cai',
                'latitude': 22.3369,
                'longitude': 103.8440,
                'phone': '0214123457',
                'opening_time': '07:00:00',
                'closing_time': '21:00:00',
                'price_range': '$$',
                'average_cost': 150000
            },
            {
                'partner_key': 'restaurant6@example.com_partner_restaurant',
                'name': 'Nhà hàng Hạ Long Seafood',
                'description': 'Nhà hàng hải sản tươi sống vịnh Hạ Long, cua ghẹ, tôm hùm, cá nướng.',
                'cuisine_type': 'Seafood',
                'address': 'Bãi Cháy, Hạ Long, Quảng Ninh',
                'city': 'Quảng Ninh',
                'latitude': 20.9101,
                'longitude': 107.1839,
                'phone': '0203123457',
                'opening_time': '10:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$$',
                'average_cost': 250000
            },
            {
                'partner_key': 'restaurant7@example.com_partner_restaurant',
                'name': 'Nhà hàng Đà Lạt Garden',
                'description': 'Nhà hàng view vườn hoa Đà Lạt, ẩm thực Tây Nguyên, rau củ tươi, thịt nướng.',
                'cuisine_type': 'Vietnamese',
                'address': '3 Nguyễn Thị Minh Khai, Đà Lạt, Lâm Đồng',
                'city': 'Lâm Đồng',
                'latitude': 11.9404,
                'longitude': 108.4583,
                'phone': '0263123457',
                'opening_time': '08:00:00',
                'closing_time': '21:00:00',
                'price_range': '$$',
                'average_cost': 120000
            },
            {
                'partner_key': 'restaurant8@example.com_partner_restaurant',
                'name': 'Nhà hàng Huế Cung Đình',
                'description': 'Nhà hàng ẩm thực cung đình Huế, bún bò Huế, nem lụi, chè Huế.',
                'cuisine_type': 'Vietnamese',
                'address': '45 Lê Lợi, Thành phố Huế, Thừa Thiên Huế',
                'city': 'Thừa Thiên Huế',
                'latitude': 16.4637,
                'longitude': 107.5909,
                'phone': '0234123457',
                'opening_time': '07:00:00',
                'closing_time': '21:00:00',
                'price_range': '$$',
                'average_cost': 100000
            },
            {
                'partner_key': 'restaurant9@example.com_partner_restaurant',
                'name': 'Nhà hàng Hội An Ancient',
                'description': 'Nhà hàng trong Phố cổ Hội An, cao lầu, bánh mì Phượng, bánh bao bánh vạc.',
                'cuisine_type': 'Vietnamese',
                'address': '150 Trần Phú, Hội An, Quảng Nam',
                'city': 'Quảng Nam',
                'latitude': 15.8801,
                'longitude': 108.3380,
                'phone': '0235123457',
                'opening_time': '08:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$',
                'average_cost': 110000
            },
            {
                'partner_key': 'restaurant10@example.com_partner_restaurant',
                'name': 'Nhà hàng Mũi Né Beach',
                'description': 'Nhà hàng bãi biển Mũi Né, hải sản tươi sống, đặc sản địa phương.',
                'cuisine_type': 'Seafood',
                'address': 'Bãi biển Mũi Né, Phan Thiết, Bình Thuận',
                'city': 'Bình Thuận',
                'latitude': 10.9376,
                'longitude': 108.2772,
                'phone': '0252123457',
                'opening_time': '10:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$$',
                'average_cost': 200000
            },
            {
                'partner_key': 'restaurant11@example.com_partner_restaurant',
                'name': 'Nhà hàng Cần Thơ Mekong',
                'description': 'Nhà hàng đặc sản miền Tây, cá lóc nướng, lẩu mắm, bánh xèo.',
                'cuisine_type': 'Vietnamese',
                'address': '50 Hai Bà Trưng, Ninh Kiều, Cần Thơ',
                'city': 'Cần Thơ',
                'latitude': 10.0452,
                'longitude': 105.7870,
                'phone': '0292123457',
                'opening_time': '07:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$',
                'average_cost': 90000
            },
            {
                'partner_key': 'restaurant12@example.com_partner_restaurant',
                'name': 'Nhà hàng Phú Quốc Island',
                'description': 'Nhà hàng hải sản Phú Quốc, cua ghẹ, tôm hùm, nước mắm Phú Quốc.',
                'cuisine_type': 'Seafood',
                'address': 'Bãi Dài, Phú Quốc, Kiên Giang',
                'city': 'Kiên Giang',
                'latitude': 10.2899,
                'longitude': 103.9840,
                'phone': '0297123457',
                'opening_time': '11:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$$',
                'average_cost': 350000
            },
            {
                'partner_key': 'restaurant1@example.com_partner_restaurant',  # Reuse partner for Ninh Bình
                'name': 'Nhà hàng Ninh Bình Heritage',
                'description': 'Nhà hàng đặc sản Ninh Bình, dê núi, cơm cháy, rượu cần.',
                'cuisine_type': 'Vietnamese',
                'address': 'Tràng An, Ninh Bình',
                'city': 'Ninh Bình',
                'latitude': 20.2506,
                'longitude': 105.9744,
                'phone': '0229123457',
                'opening_time': '08:00:00',
                'closing_time': '21:00:00',
                'price_range': '$$',
                'average_cost': 130000
            },
            {
                'partner_key': 'restaurant4@example.com_partner_restaurant',  # Reuse partner for Đà Nẵng
                'name': 'Nhà hàng Đà Nẵng Seafood',
                'description': 'Nhà hàng hải sản Đà Nẵng, bánh xèo, mì Quảng, nem nướng.',
                'cuisine_type': 'Vietnamese',
                'address': 'Bãi biển Mỹ Khê, Đà Nẵng',
                'city': 'Đà Nẵng',
                'latitude': 16.0544,
                'longitude': 108.2022,
                'phone': '0236123459',
                'opening_time': '10:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$',
                'average_cost': 140000
            },
            # Additional restaurants for Hà Nội
            {
                'partner_key': 'restaurant1@example.com_partner_restaurant',
                'name': 'Nhà hàng Bún Thang Hà Nội',
                'description': 'Nhà hàng bún thang truyền thống Hà Nội, nước dùng trong, thịt gà, trứng cút.',
                'cuisine_type': 'Vietnamese',
                'address': '48 Cầu Gỗ, Hoàn Kiếm, Hà Nội',
                'city': 'Hà Nội',
                'latitude': 21.0300,
                'longitude': 105.8510,
                'phone': '0241234571',
                'opening_time': '07:00:00',
                'closing_time': '21:00:00',
                'price_range': '$$',
                'average_cost': 90000
            },
            {
                'partner_key': 'restaurant2@example.com_partner_restaurant',
                'name': 'Nhà hàng Chả Cá Lã Vọng',
                'description': 'Nhà hàng chả cá nổi tiếng Hà Nội, cá nướng thơm lừng, ăn kèm bún.',
                'cuisine_type': 'Vietnamese',
                'address': '14 Chả Cá, Hoàn Kiếm, Hà Nội',
                'city': 'Hà Nội',
                'latitude': 21.0290,
                'longitude': 105.8515,
                'phone': '0241234572',
                'opening_time': '11:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$$',
                'average_cost': 200000
            },
            # Additional restaurants for Quảng Ninh (Hạ Long)
            {
                'partner_key': 'restaurant6@example.com_partner_restaurant',
                'name': 'Nhà hàng Hạ Long Bay View',
                'description': 'Nhà hàng view vịnh Hạ Long, ẩm thực địa phương, hải sản tươi sống.',
                'cuisine_type': 'Seafood',
                'address': 'Bãi Cháy, Hạ Long, Quảng Ninh',
                'city': 'Quảng Ninh',
                'latitude': 20.9150,
                'longitude': 107.1850,
                'phone': '0203123458',
                'opening_time': '10:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$',
                'average_cost': 180000
            },
            # Additional restaurants for Lâm Đồng (Đà Lạt)
            {
                'partner_key': 'restaurant7@example.com_partner_restaurant',
                'name': 'Nhà hàng Đà Lạt Coffee',
                'description': 'Nhà hàng cà phê Đà Lạt, ẩm thực Tây Nguyên, bánh mì nướng.',
                'cuisine_type': 'Vietnamese',
                'address': '5 Nguyễn Thị Minh Khai, Đà Lạt, Lâm Đồng',
                'city': 'Lâm Đồng',
                'latitude': 11.9410,
                'longitude': 108.4590,
                'phone': '0263123458',
                'opening_time': '07:00:00',
                'closing_time': '22:00:00',
                'price_range': '$',
                'average_cost': 80000
            },
            # Additional restaurants for Khánh Hòa (Nha Trang)
            {
                'partner_key': 'restaurant3@example.com_partner_restaurant',
                'name': 'Nhà hàng Nha Trang Beach',
                'description': 'Nhà hàng bãi biển Nha Trang, hải sản nướng, nem nướng Nha Trang.',
                'cuisine_type': 'Seafood',
                'address': 'Bãi biển Trần Phú, Nha Trang, Khánh Hòa',
                'city': 'Khánh Hòa',
                'latitude': 12.2400,
                'longitude': 109.1960,
                'phone': '0258123458',
                'opening_time': '10:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$',
                'average_cost': 220000
            },
            # Additional restaurants for Thừa Thiên Huế
            {
                'partner_key': 'restaurant8@example.com_partner_restaurant',
                'name': 'Nhà hàng Huế Xưa',
                'description': 'Nhà hàng ẩm thực Huế truyền thống, bánh bèo, bánh nậm, bánh lọc.',
                'cuisine_type': 'Vietnamese',
                'address': '50 Lê Lợi, Thành phố Huế, Thừa Thiên Huế',
                'city': 'Thừa Thiên Huế',
                'latitude': 16.4640,
                'longitude': 107.5910,
                'phone': '0234123458',
                'opening_time': '08:00:00',
                'closing_time': '21:00:00',
                'price_range': '$$',
                'average_cost': 110000
            },
            # Additional restaurants for Quảng Nam (Hội An)
            {
                'partner_key': 'restaurant9@example.com_partner_restaurant',
                'name': 'Nhà hàng Hội An Riverside',
                'description': 'Nhà hàng bên sông Hội An, cao lầu, bánh mì, bánh bao.',
                'cuisine_type': 'Vietnamese',
                'address': '155 Trần Phú, Hội An, Quảng Nam',
                'city': 'Quảng Nam',
                'latitude': 15.8810,
                'longitude': 108.3390,
                'phone': '0235123458',
                'opening_time': '09:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$',
                'average_cost': 120000
            },
            # Additional restaurants for Bình Thuận (Mũi Né)
            {
                'partner_key': 'restaurant10@example.com_partner_restaurant',
                'name': 'Nhà hàng Mũi Né Sunset',
                'description': 'Nhà hàng view hoàng hôn Mũi Né, hải sản tươi sống, đặc sản biển.',
                'cuisine_type': 'Seafood',
                'address': 'Bãi biển Mũi Né, Phan Thiết, Bình Thuận',
                'city': 'Bình Thuận',
                'latitude': 10.9380,
                'longitude': 108.2780,
                'phone': '0252123458',
                'opening_time': '11:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$$',
                'average_cost': 250000
            },
            # Additional restaurants for Cần Thơ
            {
                'partner_key': 'restaurant11@example.com_partner_restaurant',
                'name': 'Nhà hàng Cần Thơ Sông Nước',
                'description': 'Nhà hàng miền Tây, cá lóc nướng, lẩu mắm, bánh xèo, đặc sản sông nước.',
                'cuisine_type': 'Vietnamese',
                'address': '55 Hai Bà Trưng, Ninh Kiều, Cần Thơ',
                'city': 'Cần Thơ',
                'latitude': 10.0460,
                'longitude': 105.7880,
                'phone': '0292123458',
                'opening_time': '08:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$',
                'average_cost': 95000
            },
            # Additional restaurants for Kiên Giang (Phú Quốc)
            {
                'partner_key': 'restaurant12@example.com_partner_restaurant',
                'name': 'Nhà hàng Phú Quốc Sunset',
                'description': 'Nhà hàng view hoàng hôn Phú Quốc, hải sản tươi sống, cua ghẹ.',
                'cuisine_type': 'Seafood',
                'address': 'Bãi Dài, Phú Quốc, Kiên Giang',
                'city': 'Kiên Giang',
                'latitude': 10.2900,
                'longitude': 103.9850,
                'phone': '0297123458',
                'opening_time': '12:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$$',
                'average_cost': 380000
            },
            # Additional restaurants for Ninh Bình
            {
                'partner_key': 'restaurant1@example.com_partner_restaurant',
                'name': 'Nhà hàng Ninh Bình Sông Nước',
                'description': 'Nhà hàng đặc sản Ninh Bình, dê núi, cơm cháy, cá kho.',
                'cuisine_type': 'Vietnamese',
                'address': 'Tam Cốc, Ninh Bình',
                'city': 'Ninh Bình',
                'latitude': 20.2510,
                'longitude': 105.9750,
                'phone': '0229123458',
                'opening_time': '09:00:00',
                'closing_time': '21:00:00',
                'price_range': '$$',
                'average_cost': 140000
            },
            # Additional restaurants for Đà Nẵng
            {
                'partner_key': 'restaurant4@example.com_partner_restaurant',
                'name': 'Nhà hàng Đà Nẵng Central',
                'description': 'Nhà hàng trung tâm Đà Nẵng, mì Quảng, bánh xèo, nem nướng.',
                'cuisine_type': 'Vietnamese',
                'address': 'Trung tâm Đà Nẵng',
                'city': 'Đà Nẵng',
                'latitude': 16.0550,
                'longitude': 108.2030,
                'phone': '0236123460',
                'opening_time': '09:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$',
                'average_cost': 150000
            },
            {
                'partner_key': 'restaurant4@example.com_partner_restaurant',
                'name': 'Nhà hàng Đà Nẵng BBQ',
                'description': 'Nhà hàng BBQ Đà Nẵng, thịt nướng, hải sản nướng, đặc sản địa phương.',
                'cuisine_type': 'BBQ',
                'address': 'Bãi biển Mỹ Khê, Đà Nẵng',
                'city': 'Đà Nẵng',
                'latitude': 16.0560,
                'longitude': 108.2040,
                'phone': '0236123461',
                'opening_time': '17:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$',
                'average_cost': 180000
            },
            {
                'partner_key': 'restaurant4@example.com_partner_restaurant',
                'name': 'Nhà hàng Đà Nẵng Buffet',
                'description': 'Nhà hàng buffet Đà Nẵng, đa dạng món ăn, hải sản, ẩm thực Việt Nam.',
                'cuisine_type': 'Buffet',
                'address': 'Trung tâm Đà Nẵng',
                'city': 'Đà Nẵng',
                'latitude': 16.0570,
                'longitude': 108.2050,
                'phone': '0236123462',
                'opening_time': '11:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$$',
                'average_cost': 250000
            },
            {
                'partner_key': 'restaurant4@example.com_partner_restaurant',
                'name': 'Nhà hàng Đà Nẵng Vegetarian',
                'description': 'Nhà hàng chay Đà Nẵng, món chay đa dạng, thanh đạm, tốt cho sức khỏe.',
                'cuisine_type': 'Vegetarian',
                'address': 'Trung tâm Đà Nẵng',
                'city': 'Đà Nẵng',
                'latitude': 16.0580,
                'longitude': 108.2060,
                'phone': '0236123463',
                'opening_time': '10:00:00',
                'closing_time': '21:00:00',
                'price_range': '$',
                'average_cost': 80000
            },
            # Additional restaurants for Lào Cai (Sapa)
            {
                'partner_key': 'restaurant5@example.com_partner_restaurant',
                'name': 'Nhà hàng Sapa Mountain',
                'description': 'Nhà hàng view núi Sapa, ẩm thực dân tộc, thịt nướng, rượu táo mèo.',
                'cuisine_type': 'Vietnamese',
                'address': 'Thị trấn Sapa, Lào Cai',
                'city': 'Lào Cai',
                'latitude': 22.3370,
                'longitude': 103.8450,
                'phone': '0214123458',
                'opening_time': '08:00:00',
                'closing_time': '21:00:00',
                'price_range': '$$',
                'average_cost': 160000
            },
            {
                'partner_key': 'restaurant5@example.com_partner_restaurant',
                'name': 'Nhà hàng Sapa Ethnic',
                'description': 'Nhà hàng ẩm thực dân tộc Sapa, thịt gác bếp, mèn mén, rượu ngô.',
                'cuisine_type': 'Ethnic',
                'address': 'Bản Cát Cát, Sapa, Lào Cai',
                'city': 'Lào Cai',
                'latitude': 22.3380,
                'longitude': 103.8460,
                'phone': '0214123459',
                'opening_time': '09:00:00',
                'closing_time': '20:00:00',
                'price_range': '$$',
                'average_cost': 140000
            },
            {
                'partner_key': 'restaurant5@example.com_partner_restaurant',
                'name': 'Nhà hàng Sapa Hotpot',
                'description': 'Nhà hàng lẩu Sapa, lẩu cá hồi, lẩu gà, ấm nóng giữa vùng núi.',
                'cuisine_type': 'Hotpot',
                'address': 'Thị trấn Sapa, Lào Cai',
                'city': 'Lào Cai',
                'latitude': 22.3390,
                'longitude': 103.8470,
                'phone': '0214123460',
                'opening_time': '17:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$',
                'average_cost': 200000
            },
            {
                'partner_key': 'restaurant5@example.com_partner_restaurant',
                'name': 'Nhà hàng Sapa Coffee',
                'description': 'Quán cà phê Sapa, cà phê đen, cà phê sữa, bánh ngọt, view núi.',
                'cuisine_type': 'Cafe',
                'address': 'Thị trấn Sapa, Lào Cai',
                'city': 'Lào Cai',
                'latitude': 22.3400,
                'longitude': 103.8480,
                'phone': '0214123461',
                'opening_time': '07:00:00',
                'closing_time': '22:00:00',
                'price_range': '$',
                'average_cost': 50000
            },
            # Additional restaurants for Thừa Thiên Huế
            {
                'partner_key': 'restaurant8@example.com_partner_restaurant',
                'name': 'Nhà hàng Huế Xưa',
                'description': 'Nhà hàng ẩm thực Huế truyền thống, bánh bèo, bánh nậm, bánh lọc.',
                'cuisine_type': 'Vietnamese',
                'address': '50 Lê Lợi, Thành phố Huế, Thừa Thiên Huế',
                'city': 'Thừa Thiên Huế',
                'latitude': 16.4640,
                'longitude': 107.5910,
                'phone': '0234123458',
                'opening_time': '08:00:00',
                'closing_time': '21:00:00',
                'price_range': '$$',
                'average_cost': 110000
            },
            {
                'partner_key': 'restaurant8@example.com_partner_restaurant',
                'name': 'Nhà hàng Huế Royal',
                'description': 'Nhà hàng ẩm thực cung đình Huế, nem công, chả phượng, cao cấp.',
                'cuisine_type': 'Royal',
                'address': '45 Lê Lợi, Thành phố Huế, Thừa Thiên Huế',
                'city': 'Thừa Thiên Huế',
                'latitude': 16.4650,
                'longitude': 107.5920,
                'phone': '0234123459',
                'opening_time': '11:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$$',
                'average_cost': 300000
            },
            {
                'partner_key': 'restaurant8@example.com_partner_restaurant',
                'name': 'Nhà hàng Huế Vegetarian',
                'description': 'Nhà hàng chay Huế, món chay thanh đạm, tốt cho sức khỏe.',
                'cuisine_type': 'Vegetarian',
                'address': '40 Lê Lợi, Thành phố Huế, Thừa Thiên Huế',
                'city': 'Thừa Thiên Huế',
                'latitude': 16.4660,
                'longitude': 107.5930,
                'phone': '0234123460',
                'opening_time': '10:00:00',
                'closing_time': '21:00:00',
                'price_range': '$',
                'average_cost': 70000
            },
            {
                'partner_key': 'restaurant8@example.com_partner_restaurant',
                'name': 'Nhà hàng Huế Street Food',
                'description': 'Quán ẩm thực đường phố Huế, bánh canh, bánh bột lọc, giá rẻ.',
                'cuisine_type': 'Street Food',
                'address': '30 Lê Lợi, Thành phố Huế, Thừa Thiên Huế',
                'city': 'Thừa Thiên Huế',
                'latitude': 16.4670,
                'longitude': 107.5940,
                'phone': '0234123461',
                'opening_time': '06:00:00',
                'closing_time': '20:00:00',
                'price_range': '$',
                'average_cost': 50000
            },
            # Additional restaurants for Khánh Hòa (Nha Trang)
            {
                'partner_key': 'restaurant3@example.com_partner_restaurant',
                'name': 'Nhà hàng Nha Trang Beach',
                'description': 'Nhà hàng bãi biển Nha Trang, hải sản nướng, nem nướng Nha Trang.',
                'cuisine_type': 'Seafood',
                'address': 'Bãi biển Trần Phú, Nha Trang, Khánh Hòa',
                'city': 'Khánh Hòa',
                'latitude': 12.2400,
                'longitude': 109.1960,
                'phone': '0258123458',
                'opening_time': '10:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$',
                'average_cost': 220000
            },
            {
                'partner_key': 'restaurant3@example.com_partner_restaurant',
                'name': 'Nhà hàng Nha Trang Sushi',
                'description': 'Nhà hàng sushi Nha Trang, sushi tươi sống, sashimi, ẩm thực Nhật.',
                'cuisine_type': 'Japanese',
                'address': '78 Trần Phú, Nha Trang, Khánh Hòa',
                'city': 'Khánh Hòa',
                'latitude': 12.2410,
                'longitude': 109.1970,
                'phone': '0258123459',
                'opening_time': '11:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$$',
                'average_cost': 350000
            },
            {
                'partner_key': 'restaurant3@example.com_partner_restaurant',
                'name': 'Nhà hàng Nha Trang BBQ',
                'description': 'Nhà hàng BBQ Nha Trang, thịt nướng, hải sản nướng, view biển.',
                'cuisine_type': 'BBQ',
                'address': 'Bãi biển Trần Phú, Nha Trang, Khánh Hòa',
                'city': 'Khánh Hòa',
                'latitude': 12.2420,
                'longitude': 109.1980,
                'phone': '0258123460',
                'opening_time': '17:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$',
                'average_cost': 250000
            },
            {
                'partner_key': 'restaurant3@example.com_partner_restaurant',
                'name': 'Nhà hàng Nha Trang Buffet',
                'description': 'Nhà hàng buffet Nha Trang, đa dạng món ăn, hải sản tươi sống.',
                'cuisine_type': 'Buffet',
                'address': '78 Trần Phú, Nha Trang, Khánh Hòa',
                'city': 'Khánh Hòa',
                'latitude': 12.2430,
                'longitude': 109.1990,
                'phone': '0258123461',
                'opening_time': '11:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$$',
                'average_cost': 400000
            },
            # Additional restaurants for Lâm Đồng (Đà Lạt)
            {
                'partner_key': 'restaurant7@example.com_partner_restaurant',
                'name': 'Nhà hàng Đà Lạt Coffee',
                'description': 'Nhà hàng cà phê Đà Lạt, ẩm thực Tây Nguyên, bánh mì nướng.',
                'cuisine_type': 'Cafe',
                'address': '5 Nguyễn Thị Minh Khai, Đà Lạt, Lâm Đồng',
                'city': 'Lâm Đồng',
                'latitude': 11.9410,
                'longitude': 108.4590,
                'phone': '0263123458',
                'opening_time': '07:00:00',
                'closing_time': '22:00:00',
                'price_range': '$',
                'average_cost': 80000
            },
            {
                'partner_key': 'restaurant7@example.com_partner_restaurant',
                'name': 'Nhà hàng Đà Lạt Hotpot',
                'description': 'Nhà hàng lẩu Đà Lạt, lẩu gà lá é, lẩu cá, ấm nóng.',
                'cuisine_type': 'Hotpot',
                'address': '3 Nguyễn Thị Minh Khai, Đà Lạt, Lâm Đồng',
                'city': 'Lâm Đồng',
                'latitude': 11.9420,
                'longitude': 108.4600,
                'phone': '0263123459',
                'opening_time': '17:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$',
                'average_cost': 220000
            },
            {
                'partner_key': 'restaurant7@example.com_partner_restaurant',
                'name': 'Nhà hàng Đà Lạt Vegetarian',
                'description': 'Nhà hàng chay Đà Lạt, món chay từ rau củ tươi, thanh đạm.',
                'cuisine_type': 'Vegetarian',
                'address': '15 Trần Phú, Đà Lạt, Lâm Đồng',
                'city': 'Lâm Đồng',
                'latitude': 11.9430,
                'longitude': 108.4610,
                'phone': '0263123460',
                'opening_time': '10:00:00',
                'closing_time': '21:00:00',
                'price_range': '$',
                'average_cost': 90000
            },
            {
                'partner_key': 'restaurant7@example.com_partner_restaurant',
                'name': 'Nhà hàng Đà Lạt BBQ',
                'description': 'Nhà hàng BBQ Đà Lạt, thịt nướng, rau củ nướng, view vườn hoa.',
                'cuisine_type': 'BBQ',
                'address': '3 Nguyễn Thị Minh Khai, Đà Lạt, Lâm Đồng',
                'city': 'Lâm Đồng',
                'latitude': 11.9440,
                'longitude': 108.4620,
                'phone': '0263123461',
                'opening_time': '17:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$',
                'average_cost': 200000
            },
            # Additional restaurants for Bình Thuận (Mũi Né)
            {
                'partner_key': 'restaurant10@example.com_partner_restaurant',
                'name': 'Nhà hàng Mũi Né Sunset',
                'description': 'Nhà hàng view hoàng hôn Mũi Né, hải sản tươi sống, đặc sản biển.',
                'cuisine_type': 'Seafood',
                'address': 'Bãi biển Mũi Né, Phan Thiết, Bình Thuận',
                'city': 'Bình Thuận',
                'latitude': 10.9380,
                'longitude': 108.2780,
                'phone': '0252123458',
                'opening_time': '11:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$$',
                'average_cost': 250000
            },
            {
                'partner_key': 'restaurant10@example.com_partner_restaurant',
                'name': 'Nhà hàng Mũi Né BBQ',
                'description': 'Nhà hàng BBQ Mũi Né, hải sản nướng, thịt nướng, view biển.',
                'cuisine_type': 'BBQ',
                'address': 'Bãi biển Mũi Né, Phan Thiết, Bình Thuận',
                'city': 'Bình Thuận',
                'latitude': 10.9390,
                'longitude': 108.2790,
                'phone': '0252123459',
                'opening_time': '17:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$',
                'average_cost': 220000
            },
            {
                'partner_key': 'restaurant10@example.com_partner_restaurant',
                'name': 'Nhà hàng Mũi Né Buffet',
                'description': 'Nhà hàng buffet Mũi Né, đa dạng món ăn, hải sản tươi sống.',
                'cuisine_type': 'Buffet',
                'address': 'Bãi biển Mũi Né, Phan Thiết, Bình Thuận',
                'city': 'Bình Thuận',
                'latitude': 10.9400,
                'longitude': 108.2800,
                'phone': '0252123460',
                'opening_time': '11:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$$',
                'average_cost': 300000
            },
            {
                'partner_key': 'restaurant10@example.com_partner_restaurant',
                'name': 'Nhà hàng Mũi Né Street Food',
                'description': 'Quán ẩm thực đường phố Mũi Né, bánh xèo, bánh căn, giá rẻ.',
                'cuisine_type': 'Street Food',
                'address': 'Bãi biển Mũi Né, Phan Thiết, Bình Thuận',
                'city': 'Bình Thuận',
                'latitude': 10.9410,
                'longitude': 108.2810,
                'phone': '0252123461',
                'opening_time': '08:00:00',
                'closing_time': '22:00:00',
                'price_range': '$',
                'average_cost': 60000
            },
            # Additional restaurants for Kiên Giang (Phú Quốc)
            {
                'partner_key': 'restaurant12@example.com_partner_restaurant',
                'name': 'Nhà hàng Phú Quốc Sunset',
                'description': 'Nhà hàng view hoàng hôn Phú Quốc, hải sản tươi sống, cua ghẹ.',
                'cuisine_type': 'Seafood',
                'address': 'Bãi Dài, Phú Quốc, Kiên Giang',
                'city': 'Kiên Giang',
                'latitude': 10.2900,
                'longitude': 103.9850,
                'phone': '0297123458',
                'opening_time': '12:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$$',
                'average_cost': 380000
            },
            {
                'partner_key': 'restaurant12@example.com_partner_restaurant',
                'name': 'Nhà hàng Phú Quốc BBQ',
                'description': 'Nhà hàng BBQ Phú Quốc, hải sản nướng, tôm hùm nướng, view biển.',
                'cuisine_type': 'BBQ',
                'address': 'Bãi Dài, Phú Quốc, Kiên Giang',
                'city': 'Kiên Giang',
                'latitude': 10.2910,
                'longitude': 103.9860,
                'phone': '0297123459',
                'opening_time': '17:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$$',
                'average_cost': 400000
            },
            {
                'partner_key': 'restaurant12@example.com_partner_restaurant',
                'name': 'Nhà hàng Phú Quốc Buffet',
                'description': 'Nhà hàng buffet Phú Quốc, đa dạng món ăn, hải sản tươi sống.',
                'cuisine_type': 'Buffet',
                'address': 'Bãi Dài, Phú Quốc, Kiên Giang',
                'city': 'Kiên Giang',
                'latitude': 10.2920,
                'longitude': 103.9870,
                'phone': '0297123460',
                'opening_time': '11:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$$',
                'average_cost': 450000
            },
            {
                'partner_key': 'restaurant12@example.com_partner_restaurant',
                'name': 'Nhà hàng Phú Quốc Sushi',
                'description': 'Nhà hàng sushi Phú Quốc, sushi tươi sống, sashimi, ẩm thực Nhật.',
                'cuisine_type': 'Japanese',
                'address': 'Bãi Dài, Phú Quốc, Kiên Giang',
                'city': 'Kiên Giang',
                'latitude': 10.2930,
                'longitude': 103.9880,
                'phone': '0297123461',
                'opening_time': '11:00:00',
                'closing_time': '23:00:00',
                'price_range': '$$$',
                'average_cost': 420000
            },
            # Restaurants for Cao Bằng
            {
                'partner_key': 'restaurant5@example.com_partner_restaurant',  # Reuse partner for Cao Bằng
                'name': 'Nhà hàng Cao Bằng Ethnic',
                'description': 'Nhà hàng ẩm thực dân tộc Cao Bằng, thịt gác bếp, mèn mén, rượu ngô.',
                'cuisine_type': 'Ethnic',
                'address': 'Thành phố Cao Bằng, Cao Bằng',
                'city': 'Cao Bằng',
                'latitude': 22.6660,
                'longitude': 106.2580,
                'phone': '0206123457',
                'opening_time': '08:00:00',
                'closing_time': '21:00:00',
                'price_range': '$$',
                'average_cost': 130000
            },
            {
                'partner_key': 'restaurant5@example.com_partner_restaurant',
                'name': 'Nhà hàng Cao Bằng Mountain View',
                'description': 'Nhà hàng view núi Cao Bằng, ẩm thực địa phương, thịt nướng, rau rừng.',
                'cuisine_type': 'Vietnamese',
                'address': 'Gần Thác Bản Giốc, Cao Bằng',
                'city': 'Cao Bằng',
                'latitude': 22.6670,
                'longitude': 106.2590,
                'phone': '0206123458',
                'opening_time': '09:00:00',
                'closing_time': '21:00:00',
                'price_range': '$$',
                'average_cost': 140000
            },
            {
                'partner_key': 'restaurant5@example.com_partner_restaurant',
                'name': 'Nhà hàng Cao Bằng Hotpot',
                'description': 'Nhà hàng lẩu Cao Bằng, lẩu gà, lẩu cá, ấm nóng giữa vùng núi.',
                'cuisine_type': 'Hotpot',
                'address': 'Thành phố Cao Bằng, Cao Bằng',
                'city': 'Cao Bằng',
                'latitude': 22.6680,
                'longitude': 106.2600,
                'phone': '0206123459',
                'opening_time': '17:00:00',
                'closing_time': '22:00:00',
                'price_range': '$$',
                'average_cost': 180000
            },
            {
                'partner_key': 'restaurant5@example.com_partner_restaurant',
                'name': 'Nhà hàng Cao Bằng Street Food',
                'description': 'Quán ẩm thực đường phố Cao Bằng, bánh cuốn, phở, giá rẻ.',
                'cuisine_type': 'Street Food',
                'address': 'Thành phố Cao Bằng, Cao Bằng',
                'city': 'Cao Bằng',
                'latitude': 22.6690,
                'longitude': 106.2610,
                'phone': '0206123460',
                'opening_time': '06:00:00',
                'closing_time': '20:00:00',
                'price_range': '$',
                'average_cost': 60000
            }
        ]
        
        for rest in restaurants:
            partner_id = user_ids.get(rest['partner_key'])
            if not partner_id:
                continue
            
            city_id = get_city_id(rest['city'])
            
            cur.execute("""
                INSERT INTO restaurant_services
                (partner_id, name, description, cuisine_type, address, city_id, latitude, longitude,
                 phone, opening_time, closing_time, price_range, average_cost_per_person, is_active, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE, TRUE)
                RETURNING id
            """, (partner_id, rest['name'], rest['description'], rest['cuisine_type'], rest['address'],
                  city_id, rest['latitude'], rest['longitude'], rest['phone'], rest['opening_time'],
                  rest['closing_time'], rest['price_range'], rest['average_cost']))
            
            rest_id = cur.fetchone()[0]
            
            # Create menu items for each restaurant based on cuisine type and location
            if 'Phở' in rest['name'] or rest['city'] == 'Hà Nội':
                menu_items = [
                    {'name': 'Phở Bò Tái', 'description': 'Phở bò tái chín, nước dùng trong, hành lá, rau thơm', 'category': 'Main Course', 'price': 80000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Phở Bò Chín', 'description': 'Phở bò chín mềm, thơm ngon', 'category': 'Main Course', 'price': 85000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Phở Gà', 'description': 'Phở gà thơm ngon, nước dùng ngọt thanh', 'category': 'Main Course', 'price': 75000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Chả Quế', 'description': 'Chả quế thơm lừng, ăn kèm phở', 'category': 'Side Dish', 'price': 30000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                ]
            elif 'Bún Chả' in rest['name']:
                menu_items = [
                    {'name': 'Bún Chả Thịt Nướng', 'description': 'Bún chả thịt nướng than, nước mắm chua ngọt', 'category': 'Main Course', 'price': 60000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Bún Chả Nem', 'description': 'Bún chả kèm nem rán giòn', 'category': 'Main Course', 'price': 70000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Nem Rán', 'description': 'Nem rán giòn tan, nhân thịt đậm đà', 'category': 'Side Dish', 'price': 40000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Hải Sản' in rest['name'] or 'Seafood' in rest.get('cuisine_type', ''):
                menu_items = [
                    {'name': 'Tôm Hùm Nướng', 'description': 'Tôm hùm tươi nướng than, thịt ngọt', 'category': 'Main Course', 'price': 500000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Cua Rang Me', 'description': 'Cua biển rang me chua ngọt', 'category': 'Main Course', 'price': 400000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Mực Nướng', 'description': 'Mực tươi nướng than, chấm muối ớt', 'category': 'Main Course', 'price': 200000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Canh Chua Cá', 'description': 'Canh chua cá lóc, chua ngọt đậm đà', 'category': 'Soup', 'price': 150000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Sapa' in rest['name'] or rest['city'] == 'Lào Cai':
                menu_items = [
                    {'name': 'Thịt Nướng Sapa', 'description': 'Thịt lợn cắp nách nướng, đặc sản Sapa', 'category': 'Main Course', 'price': 150000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Cá Hồi Sapa', 'description': 'Cá hồi tươi sống, đặc sản vùng cao', 'category': 'Main Course', 'price': 200000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Rượu Táo Mèo', 'description': 'Rượu táo mèo đặc sản, thơm ngon', 'category': 'Beverage', 'price': 80000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Huế' in rest['name'] or rest['city'] == 'Thừa Thiên Huế':
                menu_items = [
                    {'name': 'Bún Bò Huế', 'description': 'Bún bò Huế đậm đà, cay nồng', 'category': 'Main Course', 'price': 100000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Nem Lụi', 'description': 'Nem lụi Huế, thịt nướng thơm lừng', 'category': 'Main Course', 'price': 120000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Chè Huế', 'description': 'Chè Huế đa dạng, ngọt thanh', 'category': 'Dessert', 'price': 40000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Hội An' in rest['name'] or rest['city'] == 'Quảng Nam':
                menu_items = [
                    {'name': 'Cao Lầu', 'description': 'Cao lầu Hội An, mì vàng, thịt xá xíu', 'category': 'Main Course', 'price': 110000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Bánh Mì Phượng', 'description': 'Bánh mì Phượng nổi tiếng Hội An', 'category': 'Main Course', 'price': 50000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Bánh Bao Bánh Vạc', 'description': 'Bánh bao bánh vạc, đặc sản Hội An', 'category': 'Appetizer', 'price': 60000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Đà Lạt' in rest['name'] or rest['city'] == 'Lâm Đồng':
                menu_items = [
                    {'name': 'Bánh Căn Đà Lạt', 'description': 'Bánh căn nóng, ăn kèm trứng và chả', 'category': 'Main Course', 'price': 80000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Lẩu Gà Lá É', 'description': 'Lẩu gà lá é đặc sản Đà Lạt', 'category': 'Main Course', 'price': 250000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Rau Củ Tây Nguyên', 'description': 'Rau củ tươi ngon vùng Tây Nguyên', 'category': 'Side Dish', 'price': 60000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Cần Thơ' in rest['name'] or rest['city'] == 'Cần Thơ':
                menu_items = [
                    {'name': 'Cá Lóc Nướng', 'description': 'Cá lóc nướng trui, đặc sản miền Tây', 'category': 'Main Course', 'price': 180000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Lẩu Mắm', 'description': 'Lẩu mắm miền Tây, đậm đà', 'category': 'Main Course', 'price': 200000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Bánh Xèo', 'description': 'Bánh xèo giòn tan, nhân tôm thịt', 'category': 'Main Course', 'price': 90000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Ninh Bình' in rest['name'] or rest['city'] == 'Ninh Bình':
                menu_items = [
                    {'name': 'Dê Núi Ninh Bình', 'description': 'Dê núi nướng, đặc sản Ninh Bình', 'category': 'Main Course', 'price': 300000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Cơm Cháy', 'description': 'Cơm cháy Ninh Bình, giòn tan', 'category': 'Side Dish', 'price': 50000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Rượu Cần', 'description': 'Rượu cần đặc sản vùng núi', 'category': 'Beverage', 'price': 100000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Cao Bằng' in rest['name'] or rest['city'] == 'Cao Bằng':
                if 'Ethnic' in rest.get('cuisine_type', ''):
                    menu_items = [
                        {'name': 'Thịt Gác Bếp', 'description': 'Thịt gác bếp dân tộc Cao Bằng, thơm lừng', 'category': 'Main Course', 'price': 180000, 'meal_types': {'lunch': True, 'dinner': True}},
                        {'name': 'Mèn Mén', 'description': 'Mèn mén dân tộc Cao Bằng, đặc sản vùng cao', 'category': 'Main Course', 'price': 120000, 'meal_types': {'lunch': True, 'dinner': True}},
                        {'name': 'Rượu Ngô', 'description': 'Rượu ngô dân tộc Cao Bằng, thơm ngon', 'category': 'Beverage', 'price': 100000, 'meal_types': {'lunch': True, 'dinner': True}},
                    ]
                elif 'Hotpot' in rest.get('cuisine_type', ''):
                    menu_items = [
                        {'name': 'Lẩu Gà Cao Bằng', 'description': 'Lẩu gà Cao Bằng, thịt gà địa phương, nước dùng ngọt', 'category': 'Main Course', 'price': 220000, 'meal_types': {'lunch': True, 'dinner': True}},
                        {'name': 'Lẩu Cá Cao Bằng', 'description': 'Lẩu cá tươi Cao Bằng, nước dùng chua ngọt', 'category': 'Main Course', 'price': 250000, 'meal_types': {'lunch': True, 'dinner': True}},
                        {'name': 'Lẩu Rau Rừng', 'description': 'Lẩu rau rừng Cao Bằng, đặc sản vùng núi', 'category': 'Main Course', 'price': 180000, 'meal_types': {'lunch': True, 'dinner': True}},
                    ]
                elif 'Street Food' in rest.get('cuisine_type', ''):
                    menu_items = [
                        {'name': 'Bánh Cuốn Cao Bằng', 'description': 'Bánh cuốn Cao Bằng, mỏng, nhân thịt', 'category': 'Main Course', 'price': 60000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                        {'name': 'Phở Cao Bằng', 'description': 'Phở Cao Bằng, nước dùng đậm đà', 'category': 'Main Course', 'price': 70000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                        {'name': 'Bánh Mì Cao Bằng', 'description': 'Bánh mì Cao Bằng, nóng giòn, nhiều nhân', 'category': 'Main Course', 'price': 40000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    ]
                else:
                    menu_items = [
                        {'name': 'Thịt Nướng Cao Bằng', 'description': 'Thịt nướng Cao Bằng, thơm lừng, đặc sản', 'category': 'Main Course', 'price': 160000, 'meal_types': {'lunch': True, 'dinner': True}},
                        {'name': 'Rau Rừng Xào', 'description': 'Rau rừng tươi xào, đặc sản vùng núi', 'category': 'Side Dish', 'price': 80000, 'meal_types': {'lunch': True, 'dinner': True}},
                        {'name': 'Cơm Lam', 'description': 'Cơm lam Cao Bằng, nướng trong ống tre', 'category': 'Main Course', 'price': 90000, 'meal_types': {'lunch': True, 'dinner': True}},
                    ]
            elif 'Đà Nẵng' in rest['name'] or rest['city'] == 'Đà Nẵng':
                if 'BBQ' in rest['name']:
                    menu_items = [
                        {'name': 'Thịt Nướng Đà Nẵng', 'description': 'Thịt heo nướng Đà Nẵng, thơm lừng', 'category': 'Main Course', 'price': 150000, 'meal_types': {'lunch': True, 'dinner': True}},
                        {'name': 'Hải Sản Nướng', 'description': 'Hải sản tươi nướng than, tôm, mực, cá', 'category': 'Main Course', 'price': 250000, 'meal_types': {'lunch': True, 'dinner': True}},
                        {'name': 'Rau Củ Nướng', 'description': 'Rau củ tươi nướng, ngọt thanh', 'category': 'Side Dish', 'price': 80000, 'meal_types': {'lunch': True, 'dinner': True}},
                    ]
                elif 'Buffet' in rest['name']:
                    menu_items = [
                        {'name': 'Buffet Trưa', 'description': 'Buffet trưa đa dạng, hải sản, thịt, rau củ', 'category': 'Buffet', 'price': 250000, 'meal_types': {'lunch': True}},
                        {'name': 'Buffet Tối', 'description': 'Buffet tối đầy đủ, hải sản tươi sống', 'category': 'Buffet', 'price': 300000, 'meal_types': {'dinner': True}},
                        {'name': 'Buffet Cuối Tuần', 'description': 'Buffet cuối tuần đặc biệt, nhiều món hơn', 'category': 'Buffet', 'price': 350000, 'meal_types': {'lunch': True, 'dinner': True}},
                    ]
                elif 'Vegetarian' in rest['name']:
                    menu_items = [
                        {'name': 'Cơm Chay', 'description': 'Cơm chay thanh đạm, đa dạng món', 'category': 'Main Course', 'price': 80000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                        {'name': 'Lẩu Chay', 'description': 'Lẩu chay nước dùng rau củ, thanh mát', 'category': 'Main Course', 'price': 150000, 'meal_types': {'lunch': True, 'dinner': True}},
                        {'name': 'Rau Củ Xào', 'description': 'Rau củ tươi xào, giòn ngon', 'category': 'Side Dish', 'price': 60000, 'meal_types': {'lunch': True, 'dinner': True}},
                    ]
                else:
                    menu_items = [
                        {'name': 'Mì Quảng', 'description': 'Mì Quảng Đà Nẵng, nước dùng đậm đà', 'category': 'Main Course', 'price': 100000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                        {'name': 'Bánh Xèo', 'description': 'Bánh xèo Đà Nẵng, giòn tan', 'category': 'Main Course', 'price': 90000, 'meal_types': {'lunch': True, 'dinner': True}},
                        {'name': 'Nem Nướng', 'description': 'Nem nướng Đà Nẵng, thơm ngon', 'category': 'Main Course', 'price': 110000, 'meal_types': {'lunch': True, 'dinner': True}},
                    ]
            elif 'BBQ' in rest.get('cuisine_type', ''):
                menu_items = [
                    {'name': 'Thịt Nướng', 'description': 'Thịt heo/bò nướng than, thơm lừng', 'category': 'Main Course', 'price': 180000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Hải Sản Nướng', 'description': 'Hải sản tươi nướng than, tôm, mực', 'category': 'Main Course', 'price': 280000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Rau Củ Nướng', 'description': 'Rau củ tươi nướng, ngọt thanh', 'category': 'Side Dish', 'price': 70000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Buffet' in rest.get('cuisine_type', ''):
                menu_items = [
                    {'name': 'Buffet Trưa', 'description': 'Buffet trưa đa dạng, nhiều món', 'category': 'Buffet', 'price': 250000, 'meal_types': {'lunch': True}},
                    {'name': 'Buffet Tối', 'description': 'Buffet tối đầy đủ, hải sản tươi sống', 'category': 'Buffet', 'price': 300000, 'meal_types': {'dinner': True}},
                    {'name': 'Buffet Cuối Tuần', 'description': 'Buffet cuối tuần đặc biệt', 'category': 'Buffet', 'price': 350000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Vegetarian' in rest.get('cuisine_type', '') or 'Chay' in rest['name']:
                menu_items = [
                    {'name': 'Cơm Chay', 'description': 'Cơm chay thanh đạm, đa dạng món', 'category': 'Main Course', 'price': 70000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Lẩu Chay', 'description': 'Lẩu chay nước dùng rau củ, thanh mát', 'category': 'Main Course', 'price': 140000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Rau Củ Xào', 'description': 'Rau củ tươi xào, giòn ngon', 'category': 'Side Dish', 'price': 50000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Street Food' in rest.get('cuisine_type', ''):
                menu_items = [
                    {'name': 'Bánh Xèo', 'description': 'Bánh xèo giòn tan, nhân tôm thịt', 'category': 'Main Course', 'price': 60000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Bánh Căn', 'description': 'Bánh căn nóng, ăn kèm trứng', 'category': 'Main Course', 'price': 50000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Bánh Mì', 'description': 'Bánh mì nóng giòn, nhiều nhân', 'category': 'Main Course', 'price': 40000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                ]
            elif 'Japanese' in rest.get('cuisine_type', '') or 'Sushi' in rest['name']:
                menu_items = [
                    {'name': 'Sushi Set', 'description': 'Set sushi đa dạng, tươi ngon', 'category': 'Main Course', 'price': 350000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Sashimi', 'description': 'Sashimi tươi sống, chất lượng cao', 'category': 'Main Course', 'price': 400000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Ramen', 'description': 'Ramen nước dùng đậm đà, thịt mềm', 'category': 'Main Course', 'price': 180000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Hotpot' in rest.get('cuisine_type', ''):
                menu_items = [
                    {'name': 'Lẩu Gà', 'description': 'Lẩu gà nóng, thịt mềm, nước dùng ngọt', 'category': 'Main Course', 'price': 220000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Lẩu Cá', 'description': 'Lẩu cá tươi, nước dùng chua ngọt', 'category': 'Main Course', 'price': 250000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Lẩu Hải Sản', 'description': 'Lẩu hải sản tươi sống, đa dạng', 'category': 'Main Course', 'price': 300000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Cafe' in rest.get('cuisine_type', '') or 'Coffee' in rest['name']:
                menu_items = [
                    {'name': 'Cà Phê Đen', 'description': 'Cà phê đen đậm đà, thơm ngon', 'category': 'Beverage', 'price': 30000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Cà Phê Sữa', 'description': 'Cà phê sữa ngọt ngào, đậm đà', 'category': 'Beverage', 'price': 35000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Bánh Ngọt', 'description': 'Bánh ngọt đa dạng, thơm ngon', 'category': 'Dessert', 'price': 50000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                ]
            elif 'Royal' in rest.get('cuisine_type', ''):
                menu_items = [
                    {'name': 'Nem Công', 'description': 'Nem công cung đình, cao cấp', 'category': 'Main Course', 'price': 300000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Chả Phượng', 'description': 'Chả phượng cung đình, tinh tế', 'category': 'Main Course', 'price': 350000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Chè Cung Đình', 'description': 'Chè cung đình đa dạng, ngọt thanh', 'category': 'Dessert', 'price': 80000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            elif 'Ethnic' in rest.get('cuisine_type', ''):
                menu_items = [
                    {'name': 'Thịt Gác Bếp', 'description': 'Thịt gác bếp dân tộc, thơm lừng', 'category': 'Main Course', 'price': 180000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Mèn Mén', 'description': 'Mèn mén dân tộc, đặc sản vùng cao', 'category': 'Main Course', 'price': 120000, 'meal_types': {'lunch': True, 'dinner': True}},
                    {'name': 'Rượu Ngô', 'description': 'Rượu ngô dân tộc, thơm ngon', 'category': 'Beverage', 'price': 100000, 'meal_types': {'lunch': True, 'dinner': True}},
                ]
            else:  # Default Vietnamese cuisine
                menu_items = [
                    {'name': 'Cơm Tấm Sườn Nướng', 'description': 'Cơm tấm sườn nướng, bì, chả, trứng', 'category': 'Main Course', 'price': 70000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Cơm Tấm Chả Trứng', 'description': 'Cơm tấm chả trứng, bì, đồ chua', 'category': 'Main Course', 'price': 60000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                    {'name': 'Cơm Tấm Đặc Biệt', 'description': 'Cơm tấm đầy đủ: sườn, chả, trứng, bì', 'category': 'Main Course', 'price': 90000, 'meal_types': {'breakfast': True, 'lunch': True, 'dinner': True}},
                ]
            
            for item in menu_items:
                import json
                meal_types_json = json.dumps(item['meal_types'])
                cur.execute("""
                    INSERT INTO restaurant_menu_items
                    (restaurant_id, name, description, category, price, meal_types, is_available, is_popular)
                    VALUES (%s, %s, %s, %s, %s, %s::jsonb, TRUE, %s)
                """, (rest_id, item['name'], item['description'], item['category'], item['price'],
                      meal_types_json, item.get('is_popular', False)))
            
            print(f"✅ Created restaurant: {rest['name']} with {len(menu_items)} menu items")
        
        conn.commit()
        print(f"\n✅ Created {len(restaurants)} restaurants successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating restaurants: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cur.close()
        conn.close()

def create_transportation(user_ids):
    """Create transportation services for transportation partners"""
    conn = get_connection()
    if not conn:
        return
    
    cur = conn.cursor()
    
    try:
        # Check if transportation already exists
        cur.execute("SELECT COUNT(*) FROM transportation_services")
        if cur.fetchone()[0] > 0:
            print("ℹ️  Transportation already exists. Skipping.")
            return
        
        transportations = [
            {
                'partner_key': 'transport1@example.com_partner_transportation',
                'description': 'Dịch vụ taxi và xe du lịch tại Hà Nội, phục vụ 24/7',
                'vehicle_type': 'Car',
                'brand': 'Toyota',
                'license_plate': '29A-12345',
                'max_passengers': 4,
                'features': ['AC', 'WiFi', 'USB Charging'],
                'departure_city': 'Hà Nội',
                'destination_city': 'Hà Nội',
                'base_price': 15000,
                'holiday_price': 20000,
                'phone': '0241234568'
            },
            {
                'partner_key': 'transport2@example.com_partner_transportation',
                'description': 'Xe limousine cao cấp phục vụ đường dài Hà Nội - Sài Gòn',
                'vehicle_type': 'Van',
                'brand': 'Mercedes',
                'license_plate': '51B-67890',
                'max_passengers': 16,
                'features': ['AC', 'WiFi', 'Reclining Seats', 'Entertainment System'],
                'departure_city': 'Hà Nội',
                'destination_city': 'Hồ Chí Minh',
                'base_price': 800000,
                'holiday_price': 1000000,
                'phone': '0281234567'
            },
            {
                'partner_key': 'transport3@example.com_partner_transportation',
                'description': 'Xe bus du lịch phục vụ tour miền Trung',
                'vehicle_type': 'Bus',
                'brand': 'Hyundai',
                'license_plate': '43C-11111',
                'max_passengers': 45,
                'features': ['AC', 'WiFi', 'Reclining Seats'],
                'departure_city': 'Đà Nẵng',
                'destination_city': 'Thừa Thiên Huế',
                'base_price': 200000,
                'holiday_price': 250000,
                'phone': '0236123456'
            },
            {
                'partner_key': 'transport4@example.com_partner_transportation',
                'description': 'Xe khách phục vụ đường Đà Nẵng - Nha Trang',
                'vehicle_type': 'Bus',
                'brand': 'Ford',
                'license_plate': '43D-22222',
                'max_passengers': 40,
                'features': ['AC', 'WiFi', 'USB Charging'],
                'departure_city': 'Đà Nẵng',
                'destination_city': 'Khánh Hòa',
                'base_price': 300000,
                'holiday_price': 350000,
                'phone': '0236123457'
            },
            {
                'partner_key': 'transport5@example.com_partner_transportation',
                'description': 'Xe bus Hà Nội - Sapa, phục vụ tour vùng núi',
                'vehicle_type': 'Bus',
                'brand': 'Hyundai',
                'license_plate': '29B-33333',
                'max_passengers': 45,
                'features': ['AC', 'WiFi', 'Reclining Seats'],
                'departure_city': 'Hà Nội',
                'destination_city': 'Lào Cai',
                'base_price': 400000,
                'holiday_price': 500000,
                'phone': '0241234569'
            },
            {
                'partner_key': 'transport6@example.com_partner_transportation',
                'description': 'Xe bus Hà Nội - Hạ Long, phục vụ tour vịnh',
                'vehicle_type': 'Bus',
                'brand': 'Ford',
                'license_plate': '29C-44444',
                'max_passengers': 40,
                'features': ['AC', 'WiFi', 'USB Charging'],
                'departure_city': 'Hà Nội',
                'destination_city': 'Quảng Ninh',
                'base_price': 250000,
                'holiday_price': 300000,
                'phone': '0241234570'
            },
            {
                'partner_key': 'transport7@example.com_partner_transportation',
                'description': 'Xe bus Sài Gòn - Đà Lạt, phục vụ tour cao nguyên',
                'vehicle_type': 'Bus',
                'brand': 'Hyundai',
                'license_plate': '51C-55555',
                'max_passengers': 45,
                'features': ['AC', 'WiFi', 'Reclining Seats'],
                'departure_city': 'Hồ Chí Minh',
                'destination_city': 'Lâm Đồng',
                'base_price': 350000,
                'holiday_price': 400000,
                'phone': '0281234569'
            },
            {
                'partner_key': 'transport8@example.com_partner_transportation',
                'description': 'Xe bus Sài Gòn - Phú Quốc, phục vụ tour đảo',
                'vehicle_type': 'Bus',
                'brand': 'Ford',
                'license_plate': '51D-66666',
                'max_passengers': 40,
                'features': ['AC', 'WiFi', 'USB Charging'],
                'departure_city': 'Hồ Chí Minh',
                'destination_city': 'Kiên Giang',
                'base_price': 600000,
                'holiday_price': 700000,
                'phone': '0281234570'
            },
            {
                'partner_key': 'transport3@example.com_partner_transportation',
                'description': 'Xe bus Đà Nẵng - Hội An',
                'vehicle_type': 'Bus',
                'brand': 'Hyundai',
                'license_plate': '43E-77777',
                'max_passengers': 35,
                'features': ['AC', 'WiFi'],
                'departure_city': 'Đà Nẵng',
                'destination_city': 'Quảng Nam',
                'base_price': 100000,
                'holiday_price': 120000,
                'phone': '0236123458'
            },
            {
                'partner_key': 'transport2@example.com_partner_transportation',
                'description': 'Xe bus Sài Gòn - Mũi Né',
                'vehicle_type': 'Bus',
                'brand': 'Ford',
                'license_plate': '51E-88888',
                'max_passengers': 40,
                'features': ['AC', 'WiFi', 'USB Charging'],
                'departure_city': 'Hồ Chí Minh',
                'destination_city': 'Bình Thuận',
                'base_price': 250000,
                'holiday_price': 300000,
                'phone': '0281234571'
            },
            {
                'partner_key': 'transport2@example.com_partner_transportation',
                'description': 'Xe bus Sài Gòn - Cần Thơ',
                'vehicle_type': 'Bus',
                'brand': 'Hyundai',
                'license_plate': '51F-99999',
                'max_passengers': 45,
                'features': ['AC', 'WiFi', 'Reclining Seats'],
                'departure_city': 'Hồ Chí Minh',
                'destination_city': 'Cần Thơ',
                'base_price': 200000,
                'holiday_price': 250000,
                'phone': '0281234572'
            },
            {
                'partner_key': 'transport1@example.com_partner_transportation',
                'description': 'Xe bus Hà Nội - Ninh Bình',
                'vehicle_type': 'Bus',
                'brand': 'Ford',
                'license_plate': '29D-AAAAA',
                'max_passengers': 40,
                'features': ['AC', 'WiFi'],
                'departure_city': 'Hà Nội',
                'destination_city': 'Ninh Bình',
                'base_price': 150000,
                'holiday_price': 180000,
                'phone': '0241234571'
            },
            {
                'partner_key': 'transport2@example.com_partner_transportation',
                'description': 'Xe bus Sài Gòn - Đà Nẵng',
                'vehicle_type': 'Bus',
                'brand': 'Hyundai',
                'license_plate': '51G-BBBBB',
                'max_passengers': 45,
                'features': ['AC', 'WiFi', 'Reclining Seats'],
                'departure_city': 'Hồ Chí Minh',
                'destination_city': 'Đà Nẵng',
                'base_price': 500000,
                'holiday_price': 600000,
                'phone': '0281234573'
            },
            {
                'partner_key': 'transport5@example.com_partner_transportation',
                'description': 'Xe bus Hà Nội - Cao Bằng, phục vụ tour Thác Bản Giốc',
                'vehicle_type': 'Bus',
                'brand': 'Hyundai',
                'license_plate': '29E-CCCCC',
                'max_passengers': 45,
                'features': ['AC', 'WiFi', 'Reclining Seats'],
                'departure_city': 'Hà Nội',
                'destination_city': 'Cao Bằng',
                'base_price': 450000,
                'holiday_price': 550000,
                'phone': '0241234573'
            },
            {
                'partner_key': 'transport3@example.com_partner_transportation',
                'description': 'Xe bus Hà Nội - Huế, phục vụ tour Cố đô',
                'vehicle_type': 'Bus',
                'brand': 'Hyundai',
                'license_plate': '29F-DDDDD',
                'max_passengers': 45,
                'features': ['AC', 'WiFi', 'Reclining Seats'],
                'departure_city': 'Hà Nội',
                'destination_city': 'Thừa Thiên Huế',
                'base_price': 600000,
                'holiday_price': 750000,
                'phone': '0241234574'
            },
            {
                'partner_key': 'transport2@example.com_partner_transportation',
                'description': 'Xe bus Sài Gòn - Huế, phục vụ tour miền Trung',
                'vehicle_type': 'Bus',
                'brand': 'Hyundai',
                'license_plate': '51H-EEEEE',
                'max_passengers': 45,
                'features': ['AC', 'WiFi', 'Reclining Seats'],
                'departure_city': 'Hồ Chí Minh',
                'destination_city': 'Thừa Thiên Huế',
                'base_price': 550000,
                'holiday_price': 650000,
                'phone': '0281234574'
            },
            {
                'partner_key': 'transport3@example.com_partner_transportation',
                'description': 'Xe bus Huế - Đà Nẵng (ngược lại)',
                'vehicle_type': 'Bus',
                'brand': 'Ford',
                'license_plate': '43F-FFFFF',
                'max_passengers': 40,
                'features': ['AC', 'WiFi', 'USB Charging'],
                'departure_city': 'Thừa Thiên Huế',
                'destination_city': 'Đà Nẵng',
                'base_price': 200000,
                'holiday_price': 250000,
                'phone': '0234123458'
            }
        ]
        
        for trans in transportations:
            partner_id = user_ids.get(trans['partner_key'])
            if not partner_id:
                continue
            
            dep_city_id = get_city_id(trans['departure_city'])
            dest_city_id = get_city_id(trans['destination_city'])
            
            cur.execute("""
                INSERT INTO transportation_services
                (partner_id, description, vehicle_type, brand, license_plate, max_passengers, features,
                 departure_city_id, destination_city_id, base_price, holiday_price, phone, is_active, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE, TRUE)
            """, (partner_id, trans['description'], trans['vehicle_type'], trans['brand'],
                  trans['license_plate'], trans['max_passengers'], trans['features'],
                  dep_city_id, dest_city_id, trans['base_price'], trans['holiday_price'],
                  trans['phone']))
            
            print(f"✅ Created transportation: {trans['vehicle_type']} - {trans['license_plate']}")
        
        conn.commit()
        print(f"\n✅ Created {len(transportations)} transportation services successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating transportation: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cur.close()
        conn.close()

def _validate_tour_services(cur, destination_city_id, departure_city_id, num_days):
    """Validate that all required services exist for a tour. Returns (accommodation_id, restaurant_ids, transportation_id) or None if missing"""
    # Check accommodation in destination city
    cur.execute("""
        SELECT id FROM accommodation_services 
        WHERE city_id = %s AND is_active = TRUE 
        LIMIT 1
    """, (destination_city_id,))
    accommodation_result = cur.fetchone()
    if not accommodation_result:
        return None  # Must have accommodation in destination
    accommodation_id = accommodation_result[0]
    
    # Check restaurants in destination city (need at least 1 restaurant, can reuse for multiple days)
    cur.execute("""
        SELECT id FROM restaurant_services 
        WHERE city_id = %s AND is_active = TRUE 
        LIMIT 1
    """, (destination_city_id,))
    restaurant_result = cur.fetchone()
    
    if not restaurant_result:
        # Try to get from any city
        cur.execute("""
            SELECT id FROM restaurant_services 
            WHERE is_active = TRUE 
            LIMIT 1
        """)
        restaurant_result = cur.fetchone()
    
    if not restaurant_result:
        return None  # Must have at least 1 restaurant (can be reused for all days)
    
    # Get multiple restaurants if available (prefer different restaurants per day)
    cur.execute("""
        SELECT id FROM restaurant_services 
        WHERE city_id = %s AND is_active = TRUE 
        LIMIT %s
    """, (destination_city_id, num_days))
    restaurant_ids = [row[0] for row in cur.fetchall()]
    
    # If not enough restaurants in destination, get from other cities
    if len(restaurant_ids) < num_days:
        cur.execute("""
            SELECT id FROM restaurant_services 
            WHERE city_id != %s AND is_active = TRUE 
            LIMIT %s
        """, (destination_city_id, num_days - len(restaurant_ids)))
        restaurant_ids.extend([row[0] for row in cur.fetchall()])
    
    # If still not enough, we can reuse the last restaurant (minimum 1 required)
    if len(restaurant_ids) == 0:
        return None
    
    # Check transportation - try exact route first (both directions)
    cur.execute("""
        SELECT id FROM transportation_services 
        WHERE ((departure_city_id = %s AND destination_city_id = %s)
           OR (departure_city_id = %s AND destination_city_id = %s))
        AND is_active = TRUE 
        LIMIT 1
    """, (departure_city_id, destination_city_id, destination_city_id, departure_city_id))
    transportation_result = cur.fetchone()
    
    if not transportation_result:
        # Try one-way routes (departure or destination matches either city)
        cur.execute("""
            SELECT id FROM transportation_services 
            WHERE ((departure_city_id = %s OR destination_city_id = %s)
               OR (departure_city_id = %s OR destination_city_id = %s))
            AND is_active = TRUE 
            LIMIT 1
        """, (departure_city_id, departure_city_id, destination_city_id, destination_city_id))
        transportation_result = cur.fetchone()
    
    if not transportation_result:
        return None  # Must have transportation
    
    transportation_id = transportation_result[0]
    
    return (accommodation_id, restaurant_ids, transportation_id)

def _create_tour_itinerary_and_services(cur, tour_id, num_days, destination_city_id, departure_city_id, number_of_members):
    """Create daily itinerary, time checkpoints, and link services for a tour"""
    try:
        # Get services (already validated, so they should exist)
        cur.execute("""
            SELECT id FROM accommodation_services 
            WHERE city_id = %s AND is_active = TRUE 
            LIMIT 1
        """, (destination_city_id,))
        accommodation_result = cur.fetchone()
        accommodation_id = accommodation_result[0] if accommodation_result else None
        
        # Get restaurants
        cur.execute("""
            SELECT id FROM restaurant_services 
            WHERE city_id = %s AND is_active = TRUE 
            LIMIT %s
        """, (destination_city_id, num_days))
        restaurant_ids = [row[0] for row in cur.fetchall()]
        
        # If not enough restaurants in destination, get from other cities
        if len(restaurant_ids) < num_days:
            cur.execute("""
                SELECT id FROM restaurant_services 
                WHERE city_id != %s AND is_active = TRUE 
                LIMIT %s
            """, (destination_city_id, num_days - len(restaurant_ids)))
            restaurant_ids.extend([row[0] for row in cur.fetchall()])
        
        # Get transportation - try exact route first (both directions)
        cur.execute("""
            SELECT id FROM transportation_services 
            WHERE ((departure_city_id = %s AND destination_city_id = %s)
               OR (departure_city_id = %s AND destination_city_id = %s))
            AND is_active = TRUE 
            LIMIT 1
        """, (departure_city_id, destination_city_id, destination_city_id, departure_city_id))
        transportation_result = cur.fetchone()
        
        if not transportation_result:
            # Try one-way routes (departure or destination matches either city)
            cur.execute("""
                SELECT id FROM transportation_services 
                WHERE ((departure_city_id = %s OR destination_city_id = %s)
                   OR (departure_city_id = %s OR destination_city_id = %s))
                AND is_active = TRUE 
                LIMIT 1
            """, (departure_city_id, departure_city_id, destination_city_id, destination_city_id))
            transportation_result = cur.fetchone()
        
        transportation_id = transportation_result[0] if transportation_result else None
        
        # Create daily itinerary for each day
        for day_num in range(1, num_days + 1):
            day_titles = {
                1: f"Ngày {day_num}: Khởi hành và tham quan",
                2: f"Ngày {day_num}: Khám phá và trải nghiệm",
                3: f"Ngày {day_num}: Tiếp tục hành trình",
                4: f"Ngày {day_num}: Kết thúc chuyến đi"
            }
            day_summaries = {
                1: "Ngày đầu tiên của chuyến đi, khởi hành và bắt đầu hành trình khám phá.",
                2: "Tiếp tục khám phá các điểm đến thú vị và trải nghiệm văn hóa địa phương.",
                3: "Hành trình tiếp tục với nhiều hoạt động và điểm tham quan hấp dẫn.",
                4: "Ngày cuối cùng, tổng kết chuyến đi và trở về."
            }
            
            day_title = day_titles.get(day_num, f"Ngày {day_num}")
            day_summary = day_summaries.get(day_num, f"Hoạt động ngày {day_num}")
            
            cur.execute("""
                INSERT INTO tour_daily_itinerary (tour_id, day_number, day_title, day_summary)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (tour_id, day_num, day_title, day_summary))
            
            itinerary_id = cur.fetchone()[0]
            
            # Create time checkpoints for each day (morning, noon, evening)
            time_checkpoints = [
                {
                    'time_period': 'morning',
                    'checkpoint_time': '08:00:00',
                    'activity_title': 'Ăn sáng và chuẩn bị',
                    'activity_description': 'Thưởng thức bữa sáng địa phương và chuẩn bị cho các hoạt động trong ngày.',
                    'location': 'Khách sạn',
                    'display_order': 1
                },
                {
                    'time_period': 'morning',
                    'checkpoint_time': '09:30:00',
                    'activity_title': 'Tham quan điểm đến',
                    'activity_description': 'Khám phá các điểm tham quan nổi tiếng và tìm hiểu văn hóa địa phương.',
                    'location': 'Điểm tham quan',
                    'display_order': 2
                },
                {
                    'time_period': 'noon',
                    'checkpoint_time': '12:00:00',
                    'activity_title': 'Ăn trưa',
                    'activity_description': 'Thưởng thức bữa trưa với các món ăn đặc sản địa phương.',
                    'location': 'Nhà hàng',
                    'display_order': 3
                },
                {
                    'time_period': 'noon',
                    'checkpoint_time': '14:00:00',
                    'activity_title': 'Tiếp tục tham quan',
                    'activity_description': 'Khám phá thêm các điểm đến và tham gia các hoạt động thú vị.',
                    'location': 'Điểm tham quan',
                    'display_order': 4
                },
                {
                    'time_period': 'evening',
                    'checkpoint_time': '18:00:00',
                    'activity_title': 'Ăn tối',
                    'activity_description': 'Thưởng thức bữa tối và nghỉ ngơi sau một ngày khám phá.',
                    'location': 'Nhà hàng',
                    'display_order': 5
                },
                {
                    'time_period': 'evening',
                    'checkpoint_time': '20:00:00',
                    'activity_title': 'Nghỉ ngơi',
                    'activity_description': 'Thời gian tự do, nghỉ ngơi và chuẩn bị cho ngày tiếp theo.',
                    'location': 'Khách sạn',
                    'display_order': 6
                }
            ]
            
            for checkpoint in time_checkpoints:
                cur.execute("""
                    INSERT INTO tour_time_checkpoints
                    (itinerary_id, time_period, checkpoint_time, activity_title, activity_description, location, display_order)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (itinerary_id, checkpoint['time_period'], checkpoint['checkpoint_time'],
                      checkpoint['activity_title'], checkpoint['activity_description'],
                      checkpoint['location'], checkpoint['display_order']))
            
            # Link restaurant for this day (one restaurant per day) - MUST have restaurant for every day
            # Initialize restaurant_id to None
            restaurant_id = None
            
            if day_num == 1:
                # First day: use first available restaurant
                if restaurant_ids:
                    restaurant_id = restaurant_ids[0]
                else:
                    # Get any restaurant from destination city
                    cur.execute("""
                        SELECT id FROM restaurant_services 
                        WHERE city_id = %s AND is_active = TRUE 
                        LIMIT 1
                    """, (destination_city_id,))
                    result = cur.fetchone()
                    if result:
                        restaurant_id = result[0]
            else:
                # For day 2+: try to get a different restaurant than previous day
                # Get the restaurant used in previous day
                cur.execute("""
                    SELECT restaurant_id FROM tour_services 
                    WHERE tour_id = %s AND service_type = 'restaurant' AND day_number = %s
                    LIMIT 1
                """, (tour_id, day_num - 1))
                prev_restaurant_result = cur.fetchone()
                prev_restaurant_id = prev_restaurant_result[0] if prev_restaurant_result else None
                
                # Try to get a different restaurant
                if restaurant_ids and day_num <= len(restaurant_ids):
                    # Use the restaurant for this day if available
                    restaurant_id = restaurant_ids[day_num - 1]
                    # If it's the same as previous day, try to get a different one
                    if restaurant_id == prev_restaurant_id:
                        # Get a different restaurant from the list
                        for rid in restaurant_ids:
                            if rid != prev_restaurant_id:
                                restaurant_id = rid
                                break
                        # If all are same, just reuse previous day's restaurant
                        if restaurant_id == prev_restaurant_id:
                            restaurant_id = prev_restaurant_id
                else:
                    # Not enough restaurants in list, try to get a different one from database
                    if prev_restaurant_id:
                        cur.execute("""
                            SELECT id FROM restaurant_services 
                            WHERE city_id = %s AND is_active = TRUE AND id != %s
                            LIMIT 1
                        """, (destination_city_id, prev_restaurant_id))
                        result = cur.fetchone()
                        if result:
                            restaurant_id = result[0]
                        else:
                            # No different restaurant available, reuse previous day's
                            restaurant_id = prev_restaurant_id
                    else:
                        # No previous restaurant (shouldn't happen, but handle it)
                        # Get any restaurant from destination city
                        cur.execute("""
                            SELECT id FROM restaurant_services 
                            WHERE city_id = %s AND is_active = TRUE 
                            LIMIT 1
                        """, (destination_city_id,))
                        result = cur.fetchone()
                        if result:
                            restaurant_id = result[0]
                        else:
                            # Last resort: reuse the last restaurant from restaurant_ids if available
                            if restaurant_ids:
                                restaurant_id = restaurant_ids[-1]
                            else:
                                # Get any restaurant from any city
                                cur.execute("""
                                    SELECT id FROM restaurant_services 
                                    WHERE is_active = TRUE 
                                    LIMIT 1
                                """)
                                result = cur.fetchone()
                                if result:
                                    restaurant_id = result[0]
            
            # Final fallback: if restaurant_id is still None, reuse previous day's or get any
            if restaurant_id is None:
                if day_num > 1:
                    # Try to get previous day's restaurant
                    cur.execute("""
                        SELECT restaurant_id FROM tour_services 
                        WHERE tour_id = %s AND service_type = 'restaurant' AND day_number = %s
                        LIMIT 1
                    """, (tour_id, day_num - 1))
                    prev_result = cur.fetchone()
                    if prev_result:
                        restaurant_id = prev_result[0]
                
                # If still None, get any restaurant from destination city
                if restaurant_id is None:
                    cur.execute("""
                        SELECT id FROM restaurant_services 
                        WHERE city_id = %s AND is_active = TRUE 
                        LIMIT 1
                    """, (destination_city_id,))
                    result = cur.fetchone()
                    if result:
                        restaurant_id = result[0]
                
                # Last resort: get any restaurant from any city
                if restaurant_id is None:
                    cur.execute("""
                        SELECT id FROM restaurant_services 
                        WHERE is_active = TRUE 
                        LIMIT 1
                    """)
                    result = cur.fetchone()
                    if result:
                        restaurant_id = result[0]
                    else:
                        # This should never happen if we have restaurants in the database
                        print(f"   ⚠️  Warning: No restaurant available for day {day_num} of tour {tour_id} - will try to reuse previous day's")
                        # Don't continue - we'll handle it in the final fallback below
            
            # Always assign restaurant for this day - ensure restaurant_id is set
            # Check if restaurant_id was set in the above logic
            try:
                # Try to access restaurant_id to see if it exists
                test_id = restaurant_id
            except NameError:
                # restaurant_id was never set, need to get it
                restaurant_id = None
            
            if restaurant_id is None:
                # Fallback: reuse previous day's restaurant or get any available
                if day_num > 1:
                    cur.execute("""
                        SELECT restaurant_id FROM tour_services 
                        WHERE tour_id = %s AND service_type = 'restaurant' AND day_number = %s
                        LIMIT 1
                    """, (tour_id, day_num - 1))
                    prev_result = cur.fetchone()
                    if prev_result:
                        restaurant_id = prev_result[0]
                    else:
                        # Get any restaurant from destination city
                        cur.execute("""
                            SELECT id FROM restaurant_services 
                            WHERE city_id = %s AND is_active = TRUE 
                            LIMIT 1
                        """, (destination_city_id,))
                        result = cur.fetchone()
                        restaurant_id = result[0] if result else None
                else:
                    # Day 1: get any restaurant
                    cur.execute("""
                        SELECT id FROM restaurant_services 
                        WHERE city_id = %s AND is_active = TRUE 
                        LIMIT 1
                    """, (destination_city_id,))
                    result = cur.fetchone()
                    restaurant_id = result[0] if result else None
            
            # CRITICAL: Never skip - always assign a restaurant, even if we have to reuse previous day's
            if restaurant_id is None:
                print(f"   ⚠️  Warning: restaurant_id is None for day {day_num}, trying to get previous day's restaurant")
                # Get previous day's restaurant as last resort
                if day_num > 1:
                    cur.execute("""
                        SELECT restaurant_id FROM tour_services 
                        WHERE tour_id = %s AND service_type = 'restaurant' AND day_number = %s
                        LIMIT 1
                    """, (tour_id, day_num - 1))
                    prev_result = cur.fetchone()
                    if prev_result:
                        restaurant_id = prev_result[0]
                        print(f"   ✓ Using previous day's restaurant {restaurant_id} for day {day_num}")
                
                # If still None, get ANY restaurant from destination city
                if restaurant_id is None:
                    cur.execute("""
                        SELECT id FROM restaurant_services 
                        WHERE city_id = %s AND is_active = TRUE 
                        LIMIT 1
                    """, (destination_city_id,))
                    result = cur.fetchone()
                    if result:
                        restaurant_id = result[0]
                        print(f"   ✓ Using any restaurant {restaurant_id} from destination city for day {day_num}")
                
                # Last resort: get ANY restaurant from ANY city
                if restaurant_id is None:
                    cur.execute("""
                        SELECT id FROM restaurant_services 
                        WHERE is_active = TRUE 
                        LIMIT 1
                    """)
                    result = cur.fetchone()
                    if result:
                        restaurant_id = result[0]
                        print(f"   ✓ Using any restaurant {restaurant_id} from any city for day {day_num}")
            
            # At this point, restaurant_id MUST be set - if not, there's a serious problem
            if restaurant_id is None:
                print(f"   ❌ ERROR: Still no restaurant for day {day_num} of tour {tour_id} - this should never happen!")
                raise Exception(f"Cannot proceed without restaurant for day {day_num}")
            
            # Always assign restaurant for this day
            cur.execute("""
                SELECT average_cost_per_person FROM restaurant_services WHERE id = %s
            """, (restaurant_id,))
            rest_price = cur.fetchone()
            # Default to 100,000 VND per person if not set
            service_cost = float(rest_price[0]) if rest_price and rest_price[0] else 100000
            
            # Insert the restaurant assignment
            cur.execute("""
                INSERT INTO tour_services
                (tour_id, service_type, restaurant_id, day_number, service_cost)
                VALUES (%s, 'restaurant', %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (tour_id, restaurant_id, day_num, service_cost))
            
            print(f"   ✓ Assigned restaurant {restaurant_id} for day {day_num}")
        
        # Link accommodation (one for the whole trip)
        if accommodation_id:
            # Select enough rooms to accommodate all members
            # Get all available rooms with their capacity
            cur.execute("""
                SELECT id, max_adults, max_children, base_price 
                FROM accommodation_rooms 
                WHERE accommodation_id = %s AND is_available = TRUE
                ORDER BY base_price ASC
            """, (accommodation_id,))
            all_rooms = cur.fetchall()
            
            if not all_rooms:
                print(f"   ⚠️  Warning: No available rooms for accommodation {accommodation_id}")
            else:
                # Select rooms to accommodate all members
                selected_rooms = []
                total_capacity = 0
                total_cost = 0
                
                for room in all_rooms:
                    room_id, max_adults, max_children, base_price = room
                    room_capacity = max_adults + max_children
                    
                    if total_capacity < number_of_members:
                        selected_rooms.append((room_id, base_price, room_capacity))
                        total_capacity += room_capacity
                        # Calculate cost per room: base_price * num_days, but cap at reasonable limit
                        room_cost = float(base_price) * num_days
                        # Cap individual room cost to prevent overflow (max 99,999,999.99)
                        if room_cost > 99999999.99:
                            room_cost = 99999999.99
                        total_cost += room_cost
                    
                    if total_capacity >= number_of_members:
                        break
                
                if total_capacity < number_of_members:
                    print(f"   ⚠️  Warning: Not enough room capacity for {number_of_members} members. Selected {total_capacity} capacity.")
                
                # Insert accommodation service with total cost (cap to prevent overflow)
                service_cost = min(total_cost, 99999999.99)
                cur.execute("""
                    INSERT INTO tour_services
                    (tour_id, service_type, accommodation_id, service_cost)
                    VALUES (%s, 'accommodation', %s, %s)
                """, (tour_id, accommodation_id, service_cost))
                
                # Insert selected rooms
                for room_id, _, _ in selected_rooms:
                    cur.execute("""
                        INSERT INTO tour_selected_rooms (tour_id, room_id)
                        VALUES (%s, %s)
                        ON CONFLICT (tour_id, room_id) DO NOTHING
                    """, (tour_id, room_id))
                
                print(f"   ✓ Selected {len(selected_rooms)} room(s) with total capacity {total_capacity} for {number_of_members} members")
        else:
            print(f"   ⚠️  Warning: No accommodation found for tour {tour_id}")
        
        # Link transportation (one for the whole trip)
        if transportation_id:
            cur.execute("""
                SELECT base_price FROM transportation_services WHERE id = %s
            """, (transportation_id,))
            trans_price = cur.fetchone()
            service_cost = float(trans_price[0]) if trans_price and trans_price[0] else 0
            
            cur.execute("""
                INSERT INTO tour_services
                (tour_id, service_type, transportation_id, service_cost)
                VALUES (%s, 'transportation', %s, %s)
            """, (tour_id, transportation_id, service_cost))
        else:
            print(f"   ⚠️  Warning: No transportation found for tour {tour_id}")
        
        # Select menu items for each day - only if restaurant is assigned for that day
        for day_num in range(1, num_days + 1):
            # Get the restaurant assigned for this day
            cur.execute("""
                SELECT restaurant_id FROM tour_services 
                WHERE tour_id = %s AND service_type = 'restaurant' AND day_number = %s
                LIMIT 1
            """, (tour_id, day_num))
            restaurant_result = cur.fetchone()
            
            if restaurant_result:
                restaurant_id = restaurant_result[0]
                
                # Get restaurant name for debugging
                cur.execute("""
                    SELECT name FROM restaurant_services WHERE id = %s
                """, (restaurant_id,))
                rest_name_result = cur.fetchone()
                rest_name = rest_name_result[0] if rest_name_result else f"Restaurant {restaurant_id}"
                
                cur.execute("""
                    SELECT id FROM restaurant_menu_items 
                    WHERE restaurant_id = %s AND is_available = TRUE 
                    LIMIT 2
                """, (restaurant_id,))
                menu_item_ids = [row[0] for row in cur.fetchall()]
                
                if menu_item_ids:
                    for menu_item_id in menu_item_ids:
                        cur.execute("""
                            INSERT INTO tour_selected_menu_items (tour_id, menu_item_id, day_number)
                            VALUES (%s, %s, %s)
                            ON CONFLICT (tour_id, menu_item_id, day_number) DO NOTHING
                        """, (tour_id, menu_item_id, day_num))
                    print(f"   ✓ Selected {len(menu_item_ids)} menu items from {rest_name} for day {day_num}")
                else:
                    print(f"   ⚠️  Warning: No menu items available for restaurant {rest_name} (ID: {restaurant_id}) on day {day_num}")
            else:
                print(f"   ⚠️  Warning: No restaurant assigned for day {day_num}, skipping menu items")
        
    except Exception as e:
        print(f"   ⚠️  Warning: Could not create itinerary/services for tour {tour_id}: {e}")

def create_tours(user_ids):
    """Create at least 10 tours"""
    conn = get_connection()
    if not conn:
        return
    
    cur = conn.cursor()
    
    try:
        # Get admin user ID
        cur.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
        admin_result = cur.fetchone()
        if not admin_result:
            print("❌ No admin user found. Cannot create tours.")
            print("   Please ensure an admin user exists in the database.")
            return
        admin_id = admin_result[0]
        print(f"✅ Found admin user (ID: {admin_id})")
        
        # Check if tours already exist
        cur.execute("SELECT COUNT(*) FROM tours_admin")
        existing_count = cur.fetchone()[0]
        if existing_count > 0:
            print(f"ℹ️  {existing_count} tours already exist. Skipping tour creation.")
            print("   If you want to create tours anyway, delete existing tours first.")
            return
        
        print(f"📋 City IDs loaded: {len(CITY_IDS)} cities")
        
        tours = [
            {
                'name': 'Tour Hà Nội - Sapa 3 ngày 2 đêm',
                'duration': '3 days 2 nights',
                'description': 'Khám phá thủ đô Hà Nội và vùng núi Sapa với cảnh quan tuyệt đẹp, văn hóa dân tộc đặc sắc. Tham quan Hồ Hoàn Kiếm, Phố Cổ, Fansipan, Bản Cát Cát.',
                'departure_city': 'Hà Nội',
                'destination_city': 'Lào Cai',
                'number_of_members': 8,
                'total_price': 5000000
            },
            {
                'name': 'Tour Hạ Long Bay 2 ngày 1 đêm',
                'duration': '2 days 1 night',
                'description': 'Du thuyền vịnh Hạ Long - Di sản thiên nhiên thế giới. Tham quan hang động, chèo kayak, tắm biển, thưởng thức hải sản tươi ngon.',
                'departure_city': 'Hà Nội',
                'destination_city': 'Quảng Ninh',
                'number_of_members': 10,
                'total_price': 3500000
            },
            {
                'name': 'Tour Đà Lạt - Thành phố ngàn hoa 4 ngày 3 đêm',
                'duration': '4 days 3 nights',
                'description': 'Khám phá Đà Lạt với khí hậu mát mẻ, cảnh quan đẹp như tranh. Tham quan Hồ Xuân Hương, Thung lũng Tình Yêu, Vườn hoa, Đồi chè Cầu Đất.',
                'departure_city': 'Hồ Chí Minh',
                'destination_city': 'Lâm Đồng',
                'number_of_members': 8,
                'total_price': 6000000
            },
            {
                'name': 'Tour Nha Trang - Biển đảo 3 ngày 2 đêm',
                'duration': '3 days 2 nights',
                'description': 'Nghỉ dưỡng tại Nha Trang với bãi biển đẹp, nước trong xanh. Tham quan Vinpearl, Đảo Hòn Mun, Tháp Bà Ponagar, tắm biển, lặn biển.',
                'departure_city': 'Hồ Chí Minh',
                'destination_city': 'Khánh Hòa',
                'number_of_members': 8,
                'total_price': 4500000
            },
            {
                'name': 'Tour Huế - Cố đô 2 ngày 1 đêm',
                'duration': '2 days 1 night',
                'description': 'Tham quan Cố đô Huế với các di tích lịch sử: Đại Nội, Lăng Tự Đức, Chùa Thiên Mụ, Sông Hương. Thưởng thức ẩm thực cung đình.',
                'departure_city': 'Đà Nẵng',
                'destination_city': 'Thừa Thiên Huế',
                'number_of_members': 6,
                'total_price': 2500000
            },
            {
                'name': 'Tour Hội An - Phố cổ 2 ngày 1 đêm',
                'duration': '2 days 1 night',
                'description': 'Khám phá Phố cổ Hội An - Di sản văn hóa thế giới. Tham quan Chùa Cầu, Nhà cổ, Làng gốm Thanh Hà, làm đèn lồng, thưởng thức cao lầu.',
                'departure_city': 'Đà Nẵng',
                'destination_city': 'Quảng Nam',
                'number_of_members': 6,
                'total_price': 2200000
            },
            {
                'name': 'Tour Mũi Né - Phan Thiết 2 ngày 1 đêm',
                'duration': '2 days 1 night',
                'description': 'Nghỉ dưỡng tại Mũi Né với đồi cát đỏ, bãi biển đẹp. Tham quan Suối Tiên, Làng chài, thưởng thức hải sản tươi sống.',
                'departure_city': 'Hồ Chí Minh',
                'destination_city': 'Bình Thuận',
                'number_of_members': 8,
                'total_price': 2800000
            },
            {
                'name': 'Tour Cần Thơ - Miền Tây 2 ngày 1 đêm',
                'duration': '2 days 1 night',
                'description': 'Khám phá miền Tây sông nước. Đi chợ nổi Cái Răng, vườn trái cây, làng nghề, thưởng thức đặc sản miền Tây.',
                'departure_city': 'Hồ Chí Minh',
                'destination_city': 'Cần Thơ',
                'number_of_members': 8,
                'total_price': 2000000
            },
            {
                'name': 'Tour Phú Quốc - Đảo ngọc 4 ngày 3 đêm',
                'duration': '4 days 3 nights',
                'description': 'Nghỉ dưỡng tại Phú Quốc với bãi biển đẹp nhất Việt Nam. Tham quan Vinpearl Safari, Cáp treo Hòn Thơm, Làng chài, tắm biển, lặn ngắm san hô.',
                'departure_city': 'Hồ Chí Minh',
                'destination_city': 'Kiên Giang',
                'number_of_members': 12,
                'total_price': 8000000
            },
            {
                'name': 'Tour Ninh Bình - Tam Cốc Bích Động 2 ngày 1 đêm',
                'duration': '2 days 1 night',
                'description': 'Tham quan Ninh Bình với cảnh quan non nước hữu tình. Đi thuyền Tam Cốc, thăm Chùa Bái Đính, Tràng An, Hang Múa.',
                'departure_city': 'Hà Nội',
                'destination_city': 'Ninh Bình',
                'number_of_members': 6,
                'total_price': 1800000
            },
            {
                'name': 'Tour Đà Nẵng - Bà Nà Hills 2 ngày 1 đêm',
                'duration': '2 days 1 night',
                'description': 'Khám phá Đà Nẵng và Bà Nà Hills. Đi cáp treo, tham quan Cầu Vàng, Làng Pháp, tắm biển Mỹ Khê, thưởng thức ẩm thực địa phương.',
                'departure_city': 'Hồ Chí Minh',
                'destination_city': 'Đà Nẵng',
                'number_of_members': 10,
                'total_price': 3200000
            },
            {
                'name': 'Tour Cao Bằng - Thác Bản Giốc 3 ngày 2 đêm',
                'duration': '3 days 2 nights',
                'description': 'Khám phá Cao Bằng với cảnh quan núi non hùng vĩ. Tham quan Thác Bản Giốc, Động Ngườm Ngao, Pác Bó, văn hóa dân tộc đặc sắc.',
                'departure_city': 'Hà Nội',
                'destination_city': 'Cao Bằng',
                'number_of_members': 6,
                'total_price': 4500000
            }
        ]
        
        print(f"📝 Creating {len(tours)} tours...")
        
        for tour in tours:
            dep_city_id = get_city_id(tour['departure_city'])
            dest_city_id = get_city_id(tour['destination_city'])
            
            if not dep_city_id or not dest_city_id:
                print(f"⚠️  Warning: City not found for tour '{tour['name']}'. Departure: {tour['departure_city']}, Destination: {tour['destination_city']}")
                print(f"   Available cities: {list(CITY_IDS.keys())[:10]}...")
                continue
            
            # Check if departure and destination are the same (violates constraint)
            if dep_city_id == dest_city_id:
                print(f"⚠️  Warning: Tour '{tour['name']}' has same departure and destination city ({tour['departure_city']}). Skipping.")
                continue
            
            # Parse duration to get number of days (e.g., "3 days 2 nights" -> 3 days)
            import re
            duration_match = re.search(r'(\d+)\s*days?', tour['duration'].lower())
            num_days = int(duration_match.group(1)) if duration_match else 2
            
            # Validate that all required services exist BEFORE creating the tour
            services = _validate_tour_services(cur, dest_city_id, dep_city_id, num_days)
            if not services:
                print(f"⚠️  Warning: Not all required services available for tour '{tour['name']}'. Skipping.")
                print(f"   Required: 1 accommodation in {tour['destination_city']}, {num_days} restaurants, 1 transportation route")
                continue
            
            accommodation_id, restaurant_ids, transportation_id = services
            
            try:
                cur.execute("""
                    INSERT INTO tours_admin
                    (name, duration, description, departure_city_id, destination_city_id, 
                     number_of_members, total_price, is_active, is_published, created_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE, TRUE, %s)
                    RETURNING id
                """, (tour['name'], tour['duration'], tour['description'], dep_city_id, dest_city_id,
                      tour['number_of_members'], tour['total_price'], admin_id))
                
                tour_id = cur.fetchone()[0]
                
                # Create daily itinerary and services for this tour
                _create_tour_itinerary_and_services(cur, tour_id, num_days, dest_city_id, dep_city_id, tour['number_of_members'])
                
                # Verify services were assigned
                cur.execute("""
                    SELECT COUNT(*) FROM tour_services WHERE tour_id = %s
                """, (tour_id,))
                service_count = cur.fetchone()[0]
                
                print(f"✅ Created tour: {tour['name']} (ID: {tour_id}) with {num_days} days itinerary, {service_count} services assigned")
            except Exception as tour_error:
                print(f"⚠️  Error creating tour '{tour['name']}': {tour_error}")
                import traceback
                traceback.print_exc()
                # Continue with next tour instead of failing completely
                continue
        
        conn.commit()
        print(f"\n✅ Created {len(tours)} tours successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating tours: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cur.close()
        conn.close()

def create_promotions():
    """Create 10 promo codes and 10 banners"""
    conn = get_connection()
    if not conn:
        return
    
    cur = conn.cursor()
    
    try:
        # Check if promotions already exist
        cur.execute("SELECT COUNT(*) FROM promotions")
        if cur.fetchone()[0] > 0:
            print("ℹ️  Promotions already exist. Skipping.")
            return
        
        from datetime import datetime, timedelta
        
        # Promo codes (10)
        promo_codes = [
            {
                'code': 'SUMMER2024',
                'discount_type': 'percentage',
                'discount_value': 15,
                'title': 'Giảm 15% mùa hè',
                'subtitle': 'Áp dụng cho tất cả tour',
                'max_uses': 100,
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=30)).date(),
                'is_active': True,
                'show_on_homepage': True
            },
            {
                'code': 'WELCOME10',
                'discount_type': 'percentage',
                'discount_value': 10,
                'title': 'Chào mừng khách mới',
                'subtitle': 'Giảm 10% cho đơn đầu tiên',
                'max_uses': 200,
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=60)).date(),
                'is_active': True,
                'show_on_homepage': False
            },
            {
                'code': 'FAMILY20',
                'discount_type': 'percentage',
                'discount_value': 20,
                'title': 'Tour gia đình',
                'subtitle': 'Giảm 20% cho nhóm từ 4 người',
                'max_uses': 50,
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=90)).date(),
                'is_active': True,
                'show_on_homepage': True
            },
            {
                'code': 'VIP500K',
                'discount_type': 'fixed',
                'discount_value': 500000,
                'title': 'Giảm 500.000đ',
                'subtitle': 'Áp dụng cho tour từ 5 triệu',
                'max_uses': 30,
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=45)).date(),
                'is_active': True,
                'show_on_homepage': False
            },
            {
                'code': 'EARLYBIRD',
                'discount_type': 'percentage',
                'discount_value': 12,
                'title': 'Đặt sớm giảm 12%',
                'subtitle': 'Đặt trước 30 ngày',
                'max_uses': 80,
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=120)).date(),
                'is_active': True,
                'show_on_homepage': True
            },
            {
                'code': 'WEEKEND15',
                'discount_type': 'percentage',
                'discount_value': 15,
                'title': 'Cuối tuần đặc biệt',
                'subtitle': 'Giảm 15% tour cuối tuần',
                'max_uses': 40,
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=60)).date(),
                'is_active': True,
                'show_on_homepage': False
            },
            {
                'code': 'STUDENT10',
                'discount_type': 'percentage',
                'discount_value': 10,
                'title': 'Sinh viên',
                'subtitle': 'Giảm 10% cho sinh viên',
                'max_uses': 100,
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=180)).date(),
                'is_active': True,
                'show_on_homepage': False
            },
            {
                'code': 'LONGTRIP25',
                'discount_type': 'percentage',
                'discount_value': 25,
                'title': 'Tour dài ngày',
                'subtitle': 'Giảm 25% tour từ 4 ngày trở lên',
                'max_uses': 25,
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=90)).date(),
                'is_active': True,
                'show_on_homepage': True
            },
            {
                'code': 'RETURN300K',
                'discount_type': 'fixed',
                'discount_value': 300000,
                'title': 'Khách quay lại',
                'subtitle': 'Giảm 300.000đ cho khách cũ',
                'max_uses': 60,
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=365)).date(),
                'is_active': True,
                'show_on_homepage': False
            },
            {
                'code': 'NEWYEAR20',
                'discount_type': 'percentage',
                'discount_value': 20,
                'title': 'Năm mới 2025',
                'subtitle': 'Giảm 20% đón năm mới',
                'max_uses': 50,
                'start_date': datetime.now().date(),
                'end_date': (datetime.now() + timedelta(days=60)).date(),
                'is_active': True,
                'show_on_homepage': True
            }
        ]
        
        # Banners (10) - Using Unsplash images
        banners = [
            {
                'title': 'Khám phá Sapa mùa lúa chín',
                'subtitle': 'Tour Sapa 3 ngày 2 đêm chỉ từ 5.000.000đ',
                'highlight': 'Giảm 15%',
                'image': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80',
                'promotion_type': 'banner',
                'show_on_homepage': True,
                'is_active': True
            },
            {
                'title': 'Vịnh Hạ Long - Kỳ quan thiên nhiên',
                'subtitle': 'Du thuyền 2 ngày 1 đêm, trải nghiệm tuyệt vời',
                'highlight': 'Tour hot',
                'image': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop&q=80',
                'promotion_type': 'banner',
                'show_on_homepage': True,
                'is_active': True
            },
            {
                'title': 'Đà Lạt - Thành phố ngàn hoa',
                'subtitle': 'Khí hậu mát mẻ, cảnh quan đẹp như tranh',
                'highlight': 'Nổi bật',
                'image': 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&h=1080&fit=crop&q=80',
                'promotion_type': 'banner',
                'show_on_homepage': True,
                'is_active': True
            },
            {
                'title': 'Nha Trang - Biển đảo xinh đẹp',
                'subtitle': 'Nghỉ dưỡng biển, lặn ngắm san hô',
                'highlight': 'Giảm 20%',
                'image': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop&q=80',
                'promotion_type': 'banner',
                'show_on_homepage': True,
                'is_active': True
            },
            {
                'title': 'Phú Quốc - Đảo ngọc',
                'subtitle': 'Bãi biển đẹp nhất Việt Nam',
                'highlight': 'Tour VIP',
                'image': 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop&q=80',
                'promotion_type': 'banner',
                'show_on_homepage': True,
                'is_active': True
            },
            {
                'title': 'Hội An - Phố cổ di sản',
                'subtitle': 'Khám phá văn hóa, ẩm thực đặc sắc',
                'highlight': 'Hot',
                'image': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&h=1080&fit=crop&q=80',
                'promotion_type': 'banner',
                'show_on_homepage': True,
                'is_active': True
            },
            {
                'title': 'Huế - Cố đô lịch sử',
                'subtitle': 'Tham quan di tích, thưởng thức ẩm thực cung đình',
                'highlight': 'Văn hóa',
                'image': 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=1920&h=1080&fit=crop&q=80',
                'promotion_type': 'banner',
                'show_on_homepage': True,
                'is_active': True
            },
            {
                'title': 'Miền Tây sông nước',
                'subtitle': 'Chợ nổi, vườn trái cây, đặc sản miền Tây',
                'highlight': 'Độc đáo',
                'image': 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&h=1080&fit=crop&q=80',
                'promotion_type': 'banner',
                'show_on_homepage': True,
                'is_active': True
            },
            {
                'title': 'Ninh Bình - Non nước hữu tình',
                'subtitle': 'Tam Cốc, Tràng An, Hang Múa',
                'highlight': 'Gần Hà Nội',
                'image': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80',
                'promotion_type': 'banner',
                'show_on_homepage': True,
                'is_active': True
            },
            {
                'title': 'Cao Bằng - Thác Bản Giốc',
                'subtitle': 'Thác Bản Giốc, Động Ngườm Ngao, Pác Bó',
                'highlight': 'Khám phá',
                'image': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80',
                'promotion_type': 'banner',
                'show_on_homepage': True,
                'is_active': True
            }
        ]
        
        # Insert promo codes
        for promo in promo_codes:
            cur.execute("""
                INSERT INTO promotions
                (code, discount_type, discount_value, title, subtitle, max_uses,
                 start_date, end_date, is_active, show_on_homepage, promotion_type)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'promo_code')
            """, (promo['code'], promo['discount_type'], promo['discount_value'],
                  promo['title'], promo['subtitle'], promo['max_uses'],
                  promo['start_date'], promo['end_date'], promo['is_active'],
                  promo['show_on_homepage']))
            print(f"✅ Created promo code: {promo['code']}")
        
        # Insert banners
        for banner in banners:
            cur.execute("""
                INSERT INTO promotions
                (code, discount_type, discount_value, title, subtitle, highlight,
                 image, promotion_type, show_on_homepage, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (f"BANNER_{banner['title'][:10].upper().replace(' ', '_')}",
                  'percentage', 0, banner['title'], banner['subtitle'],
                  banner['highlight'], banner['image'], banner['promotion_type'],
                  banner['show_on_homepage'], banner['is_active']))
            print(f"✅ Created banner: {banner['title']}")
        
        conn.commit()
        print(f"\n✅ Created {len(promo_codes)} promo codes and {len(banners)} banners successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating promotions: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cur.close()
        conn.close()

def main():
    """Main function to seed all data"""
    print("=" * 60)
    print("TOURISM WEBSITE - SEED DATA SCRIPT")
    print("=" * 60)
    print()
    
    # First, ensure all tables are created
    print("📦 Creating database tables...")
    try:
        # Create a minimal Flask app context for table creation
        from flask import Flask
        app = Flask(__name__)
        app.bcrypt = bcrypt
        
        with app.app_context():
            # Create cities and users tables first (needed by everything)
            conn = get_connection()
            if conn:
                cur = conn.cursor()
                
                # Create cities table
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS cities (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL UNIQUE,
                        code VARCHAR(10),
                        region VARCHAR(50)
                    );
                """)
                
                # Create users table (needed by tours_admin and partner services)
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR(100) NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        password VARCHAR(255),
                        phone VARCHAR(20),
                        avatar_url TEXT,
                        role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('admin', 'client', 'partner')),
                        partner_type VARCHAR(50) CHECK (partner_type IN ('accommodation', 'transportation', 'restaurant') OR partner_type IS NULL),
                        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                
                conn.commit()
                cur.close()
                conn.close()
                print("✅ Cities and users tables created/verified")
            
            # Create partner service tables FIRST (needed by tour_services)
            from src.models.partner_services_schema import create_partner_service_tables
            create_partner_service_tables()
            print("✅ Partner service tables created/verified")
            
            # Create tour tables (tours_admin references cities and users, tour_services references partner services)
            from src.models.tour_schema import create_tour_tables
            create_tour_tables()
            print("✅ Tour tables created/verified")
            
            # Create remaining core tables (posts, comments, bookings, etc.)
            from src.models.models import create_tables
            create_tables()
            print("✅ Core tables created/verified")
            
            # Initialize cities
            from src.services.city_init import init_cities
            init_cities()
            print("✅ Cities initialized")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return
    
    print()
    
    # Load city IDs
    print("📋 Loading city IDs...")
    load_city_ids()
    print(f"✅ Loaded {len(CITY_IDS)} cities")
    print()
    
    # Create users
    print("👥 Creating users...")
    user_ids = create_users()
    print()
    
    # Create partner services
    print("🏨 Creating accommodation services...")
    create_accommodations(user_ids)
    print()
    
    print("🍽️  Creating restaurant services...")
    create_restaurants(user_ids)
    print()
    
    print("🚗 Creating transportation services...")
    create_transportation(user_ids)
    print()
    
    # Create tours
    print("🗺️  Creating tours...")
    create_tours(user_ids)
    print()
    
    # Create promotions
    print("🎁 Creating promotions...")
    create_promotions()
    print()
    
    print("=" * 60)
    print("✅ SEED DATA COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print()
    print("Summary:")
    print(f"  - Cities loaded: {len(CITY_IDS)}")
    print(f"  - Users created: {len(user_ids)}")
    print("  - Accommodations, restaurants, transportation created")
    print("  - Tours created: 12")
    print("  - Promotions created: 10 promo codes + 10 banners")
    print()
    print("Note: Image URLs are placeholders. Please update them with actual images.")
    print("=" * 60)

    # Import tour images
    print("🖼️ Importing tour images...")
    # tour_images folder is in the seed directory
    tour_images_path = os.path.join(os.path.dirname(__file__), 'tour_images')
    import_tour_images(tour_images_path)

if __name__ == "__main__":
    main()

