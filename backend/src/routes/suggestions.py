from flask import Blueprint, jsonify, request
from src.models.models import Tour  
from config.database import get_connection

suggestions_bp = Blueprint('suggestions', __name__, url_prefix='/api/suggestions')


@suggestions_bp.route('/weather', methods=['GET'])
def get_weather_suggestions():

    weather_condition = request.args.get('condition', 'sunny').lower()
    weather_to_tour_map = {
        'nắng': ['Bien dao', 'Tham quan', 'Phieu luu'],
        'clear': ['Bien dao', 'Tham quan', 'Phieu luu'],
        'rải rác mây': ['Ngoai troi', 'Di san', 'Thanh pho'],
        'nắng đẹp': ['Bien dao', 'Nui non', 'Tham quan'],
        
        'mây': ['Nui non', 'Di tich', 'Trekking'],
        'u ám': ['Nui non', 'Di tich', 'Nghỉ dưỡng'],
        'âm u': ['Nui non', 'Di tich', 'Nghỉ dưỡng'], 
        
        'mưa': ['Am thuc', 'Nghỉ dưỡng', 'Tam linh'],
        'tuyết': ['Nghỉ dưỡng', 'Trekking', 'Tam linh'],
        'bão': ['Am thuc', 'Nghỉ dưỡng'],
    }
    
    suggested_tour_types = []
    
    for keyword, types in weather_to_tour_map.items():
        if keyword in weather_condition:
            suggested_tour_types = types
            break 

    if not suggested_tour_types:
        suggested_tour_types = weather_to_tour_map.get('nắng', [])
        
    tours = Tour.get_by_tour_types(suggested_tour_types, limit=3)

    return jsonify([tour.to_dict() for tour in tours])

@suggestions_bp.route('/destinations/top-rated', methods=['GET'])
def get_top_rated_destinations():
    conn = get_connection()
    if not conn:
        return jsonify({"error": "SERVER ERROR: Database not connected"}), 500
        
    try:
        cur = conn.cursor()
        query = """
            SELECT id, name, image, price, duration, rating, reviews, tour_type, is_active, 
                   province_name, region_name, max_slots, badge, province_id
            FROM tours
            WHERE is_active = TRUE
            ORDER BY rating DESC
            LIMIT 3;
        """
        cur.execute(query)
        rows = cur.fetchall()
        
        tours = [Tour.from_db_row(row) for row in rows]
        return jsonify([tour.to_dict() for tour in tours])
        
    except Exception as e:
        print(f"Lỗi khi lấy top-rated tours: {e}")
        return jsonify({"error": "SERVER ERROR: " + str(e)}), 500
        
    finally:
        if conn:
            conn.close()