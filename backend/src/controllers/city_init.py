from src.models.models import get_connection

# List of Vietnam provinces/cities
VIETNAM_CITIES = [
    # Northern Vietnam
    {'name': 'Hà Nội', 'code': 'HN', 'region': 'North'},
    {'name': 'Hải Phòng', 'code': 'HP', 'region': 'North'},
    {'name': 'Quảng Ninh', 'code': 'QN', 'region': 'North'},
    {'name': 'Hải Dương', 'code': 'HD', 'region': 'North'},
    {'name': 'Bắc Ninh', 'code': 'BN', 'region': 'North'},
    {'name': 'Hưng Yên', 'code': 'HY', 'region': 'North'},
    {'name': 'Thái Bình', 'code': 'TB', 'region': 'North'},
    {'name': 'Nam Định', 'code': 'ND', 'region': 'North'},
    {'name': 'Ninh Bình', 'code': 'NB', 'region': 'North'},
    {'name': 'Hà Nam', 'code': 'HNa', 'region': 'North'},
    {'name': 'Vĩnh Phúc', 'code': 'VP', 'region': 'North'},
    {'name': 'Phú Thọ', 'code': 'PT', 'region': 'North'},
    {'name': 'Thái Nguyên', 'code': 'TN', 'region': 'North'},
    {'name': 'Bắc Giang', 'code': 'BG', 'region': 'North'},
    {'name': 'Lạng Sơn', 'code': 'LS', 'region': 'North'},
    {'name': 'Cao Bằng', 'code': 'CB', 'region': 'North'},
    {'name': 'Bắc Kạn', 'code': 'BK', 'region': 'North'},
    {'name': 'Tuyên Quang', 'code': 'TQ', 'region': 'North'},
    {'name': 'Yên Bái', 'code': 'YB', 'region': 'North'},
    {'name': 'Lào Cai', 'code': 'LC', 'region': 'North'},
    {'name': 'Điện Biên', 'code': 'DB', 'region': 'North'},
    {'name': 'Lai Châu', 'code': 'LCh', 'region': 'North'},
    {'name': 'Sơn La', 'code': 'SL', 'region': 'North'},
    {'name': 'Hòa Bình', 'code': 'HB', 'region': 'North'},
    
    # Central Vietnam
    {'name': 'Thanh Hóa', 'code': 'TH', 'region': 'Central'},
    {'name': 'Nghệ An', 'code': 'NA', 'region': 'Central'},
    {'name': 'Hà Tĩnh', 'code': 'HT', 'region': 'Central'},
    {'name': 'Quảng Bình', 'code': 'QB', 'region': 'Central'},
    {'name': 'Quảng Trị', 'code': 'QT', 'region': 'Central'},
    {'name': 'Thừa Thiên Huế', 'code': 'TTH', 'region': 'Central'},
    {'name': 'Đà Nẵng', 'code': 'DN', 'region': 'Central'},
    {'name': 'Quảng Nam', 'code': 'QNa', 'region': 'Central'},
    {'name': 'Quảng Ngãi', 'code': 'QNg', 'region': 'Central'},
    {'name': 'Bình Định', 'code': 'BD', 'region': 'Central'},
    {'name': 'Phú Yên', 'code': 'PY', 'region': 'Central'},
    {'name': 'Khánh Hòa', 'code': 'KH', 'region': 'Central'},
    {'name': 'Ninh Thuận', 'code': 'NT', 'region': 'Central'},
    {'name': 'Bình Thuận', 'code': 'BT', 'region': 'Central'},
    {'name': 'Kon Tum', 'code': 'KT', 'region': 'Central'},
    {'name': 'Gia Lai', 'code': 'GL', 'region': 'Central'},
    {'name': 'Đắk Lắk', 'code': 'DL', 'region': 'Central'},
    {'name': 'Đắk Nông', 'code': 'DNg', 'region': 'Central'},
    {'name': 'Lâm Đồng', 'code': 'LD', 'region': 'Central'},
    
    # Southern Vietnam
    {'name': 'Hồ Chí Minh', 'code': 'HCM', 'region': 'South'},
    {'name': 'Bình Dương', 'code': 'BDu', 'region': 'South'},
    {'name': 'Đồng Nai', 'code': 'DNa', 'region': 'South'},
    {'name': 'Bà Rịa - Vũng Tàu', 'code': 'BRVT', 'region': 'South'},
    {'name': 'Tây Ninh', 'code': 'TayN', 'region': 'South'},
    {'name': 'Bình Phước', 'code': 'BP', 'region': 'South'},
    {'name': 'Long An', 'code': 'LA', 'region': 'South'},
    {'name': 'Tiền Giang', 'code': 'TG', 'region': 'South'},
    {'name': 'Bến Tre', 'code': 'BenT', 'region': 'South'},
    {'name': 'Trà Vinh', 'code': 'TV', 'region': 'South'},
    {'name': 'Vĩnh Long', 'code': 'VL', 'region': 'South'},
    {'name': 'Đồng Tháp', 'code': 'DT', 'region': 'South'},
    {'name': 'An Giang', 'code': 'AG', 'region': 'South'},
    {'name': 'Kiên Giang', 'code': 'KG', 'region': 'South'},
    {'name': 'Cần Thơ', 'code': 'CT', 'region': 'South'},
    {'name': 'Hậu Giang', 'code': 'HG', 'region': 'South'},
    {'name': 'Sóc Trăng', 'code': 'ST', 'region': 'South'},
    {'name': 'Bạc Liêu', 'code': 'BL', 'region': 'South'},
    {'name': 'Cà Mau', 'code': 'CM', 'region': 'South'},
]

def init_cities():
    """Initialize cities in database if not exists"""
    conn = None
    try:
        conn = get_connection()
        if conn is None:
            print("❌ Cannot initialize cities: Database connection failed.")
            return
        
        cur = conn.cursor()
        
        # Check if cities already exist
        cur.execute("SELECT COUNT(*) FROM cities")
        count = cur.fetchone()[0]
        
        if count > 0:
            print(f"✅ Cities already initialized. Total: {count}")
            cur.close()
            return
        
        # Add all cities
        for city_data in VIETNAM_CITIES:
            cur.execute(
                "INSERT INTO cities (name, code, region) VALUES (%s, %s, %s)",
                (city_data['name'], city_data['code'], city_data['region'])
            )
        
        conn.commit()
        cur.close()
        print(f"✅ Successfully initialized {len(VIETNAM_CITIES)} cities!")
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"⚠️ Error initializing cities: {str(e)}")
    finally:
        if conn:
            conn.close()

