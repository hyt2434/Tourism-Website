from flask import Blueprint, request, jsonify
from src.database import get_connection

tour_routes = Blueprint('tour_routes', __name__)

@tour_routes.route('/', methods=['GET'])
def get_tours():
    """
    API GET /api/tours to get published tours list with filtering.
    """
    
    search_query = request.args.get('search')
    destination_city_id = request.args.get('destination_city_id')
    departure_city_id = request.args.get('departure_city_id')
    max_price = request.args.get('max_price')
    min_duration = request.args.get('min_duration')
    max_duration = request.args.get('max_duration')

    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        
        # Build query for published tours only
        query = """
            SELECT 
                t.id, t.name, t.duration, t.description,
                t.destination_city_id, dc.name as destination_city_name,
                t.departure_city_id, dpc.name as departure_city_name,
                t.total_price, t.currency, t.number_of_members,
                t.created_at, t.updated_at,
                (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_primary = TRUE LIMIT 1) as primary_image,
                (SELECT COUNT(*) FROM tour_images WHERE tour_id = t.id) as image_count
            FROM tours_admin t
            LEFT JOIN cities dc ON t.destination_city_id = dc.id
            LEFT JOIN cities dpc ON t.departure_city_id = dpc.id
            WHERE t.is_published = TRUE AND t.is_active = TRUE
        """
        
        params = []
        
        if search_query:
            query += " AND (t.name ILIKE %s OR t.description ILIKE %s OR dc.name ILIKE %s)"
            search_param = f"%{search_query}%"
            params.extend([search_param, search_param, search_param])
        
        if destination_city_id:
            query += " AND t.destination_city_id = %s"
            params.append(destination_city_id)
        
        if departure_city_id:
            query += " AND t.departure_city_id = %s"
            params.append(departure_city_id)
        
        if max_price:
            query += " AND t.total_price <= %s"
            params.append(max_price)
        
        if min_duration:
            query += " AND t.duration >= %s"
            params.append(min_duration)
        
        if max_duration:
            query += " AND t.duration <= %s"
            params.append(max_duration)
        
        query += " ORDER BY t.created_at DESC"
        
        cur.execute(query, params)
        rows = cur.fetchall()
        
        tours = []
        for row in rows:
            tours.append({
                'id': row[0],
                'name': row[1],
                'duration': row[2],
                'description': row[3],
                'destination_city': {'id': row[4], 'name': row[5]},
                'departure_city': {'id': row[6], 'name': row[7]},
                'price': float(row[8]) if row[8] else 0,
                'currency': row[9],
                'number_of_members': row[10],
                'created_at': row[11].isoformat() if row[11] else None,
                'updated_at': row[12].isoformat() if row[12] else None,
                'primary_image': row[13],
                'image': row[13],  # For compatibility with TourCard component
                'image_count': row[14],
                # For compatibility with frontend
                'destination': row[5],  # destination city name
                'region': None,  # Can be added later if needed
                'province': None,  # Can be added later if needed
                'rating': 0,  # Can be added later with reviews
                'reviews': 0,  # Can be added later with reviews
                'type': []  # Can be added later with tour types
            })
        
        return jsonify(tours), 200
        
    except Exception as e:
        print(f"Error fetching tours: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@tour_routes.route('/<int:tour_id>', methods=['GET'])
def get_tour_detail(tour_id):
    """
    API GET /api/tours/<id> to get detailed tour information for public tour detail page.
    Only returns published and active tours.
    """
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        
        # Get basic tour info
        cur.execute("""
            SELECT 
                t.id, t.name, t.duration, t.description,
                t.destination_city_id, dc.name as destination_city_name,
                t.departure_city_id, dpc.name as departure_city_name,
                t.total_price, t.currency, t.number_of_members,
                t.created_at, t.updated_at
            FROM tours_admin t
            LEFT JOIN cities dc ON t.destination_city_id = dc.id
            LEFT JOIN cities dpc ON t.departure_city_id = dpc.id
            WHERE t.id = %s AND t.is_published = TRUE AND t.is_active = TRUE
        """, (tour_id,))
        
        tour_row = cur.fetchone()
        if not tour_row:
            return jsonify({"error": "Tour not found or not published"}), 404
        
        tour_data = {
            'id': tour_row[0],
            'name': tour_row[1],
            'title': tour_row[1],  # For compatibility
            'duration': tour_row[2],
            'description': tour_row[3],
            'destination_city': {'id': tour_row[4], 'name': tour_row[5]},
            'departure_city': {'id': tour_row[6], 'name': tour_row[7]},
            'location': tour_row[5],  # destination city name for display
            'price': float(tour_row[8]) if tour_row[8] else 0,
            'basePrice': float(tour_row[8]) if tour_row[8] else 0,  # For compatibility
            'currency': tour_row[9],
            'number_of_members': tour_row[10],
            'created_at': tour_row[11].isoformat() if tour_row[11] else None,
            'updated_at': tour_row[12].isoformat() if tour_row[12] else None,
            # Default values for features not yet implemented
            'rating': 4.5,
            'reviewCount': 0,
            'reviews': [],
            'tags': [],
            'highlights': [],
            'included': [],
            'excluded': [],
            'hotel': None,
            'tourLocations': [],
            'centerCoordinates': None
        }
        
        # Get images
        cur.execute("""
            SELECT id, image_url, image_caption, display_order, is_primary
            FROM tour_images
            WHERE tour_id = %s
            ORDER BY display_order, id
        """, (tour_id,))
        
        tour_data['images'] = []
        for img_row in cur.fetchall():
            tour_data['images'].append({
                'id': img_row[0],
                'url': img_row[1],
                'caption': img_row[2],
                'display_order': img_row[3],
                'is_primary': img_row[4]
            })
        
        # Get itinerary with time checkpoints
        cur.execute("""
            SELECT id, day_number, day_title, day_summary
            FROM tour_daily_itinerary
            WHERE tour_id = %s
            ORDER BY day_number
        """, (tour_id,))
        
        tour_data['itinerary'] = []
        for day_row in cur.fetchall():
            day_data = {
                'id': day_row[0],
                'day_number': day_row[1],
                'day_title': day_row[2],
                'day_summary': day_row[3],
                'checkpoints': {'morning': [], 'noon': [], 'evening': []}
            }
            
            # Get time checkpoints for this day
            cur.execute("""
                SELECT id, time_period, checkpoint_time, activity_title, 
                       activity_description, location, display_order
                FROM tour_time_checkpoints
                WHERE itinerary_id = %s
                ORDER BY time_period, checkpoint_time, display_order
            """, (day_row[0],))
            
            for cp_row in cur.fetchall():
                checkpoint = {
                    'id': cp_row[0],
                    'time_period': cp_row[1],
                    'checkpoint_time': str(cp_row[2]),
                    'activity_title': cp_row[3],
                    'activity_description': cp_row[4],
                    'location': cp_row[5],
                    'display_order': cp_row[6]
                }
                day_data['checkpoints'][cp_row[1]].append(checkpoint)
            
            tour_data['itinerary'].append(day_data)
        
        # Get services
        cur.execute("""
            SELECT 
                ts.id, ts.service_type, ts.day_number, ts.service_cost, ts.notes,
                ts.restaurant_id, rs.name as restaurant_name,
                ts.accommodation_id, acs.name as accommodation_name,
                ts.transportation_id, 
                CONCAT(trans.vehicle_type, ' - ', trans.license_plate) as transportation_name
            FROM tour_services ts
            LEFT JOIN restaurant_services rs ON ts.restaurant_id = rs.id
            LEFT JOIN accommodation_services acs ON ts.accommodation_id = acs.id
            LEFT JOIN transportation_services trans ON ts.transportation_id = trans.id
            WHERE ts.tour_id = %s
            ORDER BY ts.service_type, ts.day_number
        """, (tour_id,))
        
        tour_data['services'] = {
            'restaurants': [],
            'accommodation': None,
            'transportation': None
        }
        
        for svc_row in cur.fetchall():
            service_data = {
                'id': svc_row[0],
                'service_type': svc_row[1],
                'day_number': svc_row[2],
                'service_cost': float(svc_row[3]),
                'notes': svc_row[4]
            }
            
            if svc_row[1] == 'restaurant':
                service_data['service_id'] = svc_row[5]
                service_data['service_name'] = svc_row[6]
                tour_data['services']['restaurants'].append(service_data)
            elif svc_row[1] == 'accommodation':
                service_data['service_id'] = svc_row[7]
                service_data['service_name'] = svc_row[8]
                tour_data['services']['accommodation'] = service_data
            elif svc_row[1] == 'transportation':
                service_data['service_id'] = svc_row[9]
                service_data['service_name'] = svc_row[10]
                tour_data['services']['transportation'] = service_data
        
        return jsonify(tour_data), 200
        
    except Exception as e:
        print(f"Error fetching tour detail: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()