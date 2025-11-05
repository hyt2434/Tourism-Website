from flask import Blueprint, jsonify, request
from database import get_connection
from psycopg2.extras import RealDictCursor

suggestion_routes = Blueprint('suggestion_routes', __name__)

WEATHER_TO_TYPE_ID = {
    'sunny': 2,
    'cold': 3,
    'rainy': 1,
    'default': 6
}

@suggestion_routes.route('/weather', methods=['GET'])
def get_weather_suggestions():
    """
    Gợi ý 3 tour dựa trên điều kiện thời tiết.
    Ví dụ: /api/suggestions/weather?condition=sunny
    """
    
    condition = request.args.get('condition', 'sunny').lower()
    
    tour_type_id = WEATHER_TO_TYPE_ID.get(condition, WEATHER_TO_TYPE_ID['default'])
    
    sql_query = """
    SELECT 
        t.*, 
        p.name as province_name, 
        r.name as region_name
    FROM tours t
    LEFT JOIN provinces p ON t.province_id = p.id
    LEFT JOIN regions r ON p.region_id = r.id
    JOIN tours_tour_types ttt ON t.id = ttt.tour_id
    WHERE ttt.tour_type_id = %s
    GROUP BY t.id, p.name, r.name
    ORDER BY t.rating DESC
    LIMIT 3
    """
    
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(sql_query, (tour_type_id,))
        tours = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify(tours), 200

    except Exception as e:
        print(f"CAN'T DETECT WEATHER: {e}")
        return jsonify({"error": "SERVER ERROR"}), 500
    
@suggestion_routes.route('/destinations/top-rated', methods=['GET'])
def get_top_rated_destinations():
    """
    Gợi ý 4 tỉnh/thành phố được đánh giá cao nhất,
    dựa trên rating trung bình của tất cả các tour thuộc tỉnh đó.
    """

    # Giới hạn chỉ lấy 4 kết quả
    sql_query = """
    SELECT 
        p.id, 
        p.name, 
        p.image_url, 
        AVG(t.rating) AS avg_rating, 
        SUM(t.reviews) AS total_reviews
    FROM provinces p
    JOIN tours t ON p.id = t.province_id
    GROUP BY p.id, p.name, p.image_url
    ORDER BY avg_rating DESC
    LIMIT 4
    """

    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute(sql_query)
        destinations = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify(destinations), 200

    except Exception as e:
        print(f"CAN'T GET top destinations: {e}")
        return jsonify({"error": "SERVER ERROR"}), 500