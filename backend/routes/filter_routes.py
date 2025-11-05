from flask import Blueprint, jsonify
from database import get_connection
from psycopg2.extras import RealDictCursor

filter_routes = Blueprint('filter_routes', __name__)

@filter_routes.route('/', methods=['GET'])
def get_filter_data():
    """
    API GET /api/filters provides needed data to component FilterSidebar.jsx
    """
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM regions ORDER BY name")
        regions = cur.fetchall()
        
        cur.execute("SELECT * FROM provinces ORDER BY name")
        provinces = cur.fetchall()
        
        cur.execute("SELECT * FROM tour_types ORDER BY name")
        tour_types = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            "regions": regions,
            "provinces": provinces,
            "tourTypes": tour_types
        }), 200

    except Exception as e:
        print(f"GETTING DATA FAILED filter: {e}")
        return jsonify({"error": "SERVER ERROR"}), 500