from flask import Blueprint, jsonify
from src.models.models import get_connection

city_bp = Blueprint('cities', __name__)

@city_bp.route('/cities', methods=['GET'])
def get_cities():
    """Get all cities in Vietnam"""
    conn = None
    try:
        conn = get_connection()
        if conn is None:
            return jsonify({
                'success': False,
                'message': 'Database connection failed'
            }), 500
        
        cur = conn.cursor()
        cur.execute("SELECT id, name, code, region FROM cities ORDER BY name")
        rows = cur.fetchall()
        cur.close()
        
        cities = [
            {
                'id': row[0],
                'name': row[1],
                'code': row[2],
                'region': row[3]
            }
            for row in rows
        ]
        
        return jsonify({
            'success': True,
            'cities': cities
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
    finally:
        if conn:
            conn.close()

@city_bp.route('/cities/region/<region>', methods=['GET'])
def get_cities_by_region(region):
    """Get cities by region (North, Central, South)"""
    conn = None
    try:
        conn = get_connection()
        if conn is None:
            return jsonify({
                'success': False,
                'message': 'Database connection failed'
            }), 500
        
        cur = conn.cursor()
        cur.execute(
            "SELECT id, name, code, region FROM cities WHERE region = %s ORDER BY name",
            (region,)
        )
        rows = cur.fetchall()
        cur.close()
        
        cities = [
            {
                'id': row[0],
                'name': row[1],
                'code': row[2],
                'region': row[3]
            }
            for row in rows
        ]
        
        return jsonify({
            'success': True,
            'cities': cities
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
    finally:
        if conn:
            conn.close()
