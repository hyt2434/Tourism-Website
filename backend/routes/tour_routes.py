from flask import Blueprint, request, jsonify
from database import get_connection

tour_routes = Blueprint('tour_routes', __name__)

def format_tour(tour_tuple):
    
    return {
        "id": tour_tuple[0],
        "name": tour_tuple[1],
        "destination": tour_tuple[2],
        "image": tour_tuple[3],
        "price": tour_tuple[4],
        "duration": tour_tuple[5],
        "maxSlots": tour_tuple[6],
        "rating": tour_tuple[7],
        "reviews": tour_tuple[8],
        "badge": tour_tuple[9]
    }

@tour_routes.route('/', methods=['GET'])
def get_tours():
    search_query = request.args.get('search', '')
    destination = request.args.get('destination', '')
    max_price = request.args.get('maxPrice', None)
    
    base_query = "SELECT * FROM tours WHERE 1=1"
    params = []

    if search_query:
        base_query += " AND name ILIKE %s"
        params.append(f"%{search_query}%")
    
    if destination:
        base_query += " AND destination = %s"
        params.append(destination)

    if max_price:
        base_query += " AND price <= %s"
        params.append(max_price)

    try:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute(base_query, tuple(params))
        tours_from_db = cur.fetchall()
        
        cur.close()
        conn.close()
        
        formatted_tours = [format_tour(tour) for tour in tours_from_db]
        
        return jsonify(formatted_tours), 200

    except Exception as e:
        print(f"Tour not found error: {e}")
        return jsonify({"error": "Something went wrong "}), 500