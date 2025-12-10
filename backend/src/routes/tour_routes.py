from flask import Blueprint, request, jsonify
from config.database import get_connection
import re

tour_routes = Blueprint('tour_routes', __name__)

def extract_days_from_duration(duration):
    """
    Extract number of days from duration (now stored as integer)
    Returns the duration as integer if it's a number, otherwise tries to parse from string
    """
    if not duration:
        return None
    
    # If duration is already a number, return it
    if isinstance(duration, (int, float)):
        return int(duration)
    
    # Try to parse as integer
    try:
        return int(duration)
    except (ValueError, TypeError):
        # Fallback: try to extract from string format "3 days 2 nights"
        match = re.search(r'(\d+)', str(duration))
        return int(match.group(1)) if match else None

@tour_routes.route('/highlights', methods=['GET'])
def get_highlighted_tours():
    """
    API GET /api/tours/highlights to get top 6 most booked tours.
    Returns tours ordered by booking count (descending).
    """
    limit = request.args.get('limit', 6, type=int)
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        
        # Get highlighted tours with their primary image and review stats
        query = """
            SELECT 
                th.id, th.name, th.duration, th.description,
                th.destination_city_id, dc.name as destination_city_name,
                th.departure_city_id, dpc.name as departure_city_name,
                th.total_price, th.currency, th.number_of_members,
                th.booking_count,
                ti.image_url,
                COALESCE(AVG(tr.rating), 0) as avg_rating,
                COUNT(DISTINCT tr.id) as review_count
            FROM tour_highlights th
            LEFT JOIN cities dc ON th.destination_city_id = dc.id
            LEFT JOIN cities dpc ON th.departure_city_id = dpc.id
            LEFT JOIN tour_images ti ON th.id = ti.tour_id AND ti.is_primary = TRUE
            LEFT JOIN tour_reviews tr ON th.id = tr.tour_id
            GROUP BY th.id, th.name, th.duration, th.description,
                     th.destination_city_id, dc.name,
                     th.departure_city_id, dpc.name,
                     th.total_price, th.currency, th.number_of_members,
                     th.booking_count, ti.image_url
            ORDER BY th.booking_count DESC, avg_rating DESC
            LIMIT %s
        """
        
        cur.execute(query, (limit,))
        rows = cur.fetchall()
        
        tours = []
        for row in rows:
            # Calculate price per person
            price_per_person = round((float(row[8]) / row[10]) / 1000) * 1000 if row[8] and row[10] and row[10] > 0 else float(row[8]) if row[8] else 0
            
            tours.append({
                'id': row[0],
                'name': row[1],
                'duration': row[2],
                'description': row[3],
                'destination_city': {'id': row[4], 'name': row[5]},
                'departure_city': {'id': row[6], 'name': row[7]},
                'price': price_per_person,
                'total_price': float(row[8]) if row[8] else 0,
                'currency': row[9],
                'number_of_members': row[10],
                'booking_count': row[11],
                'image': row[12] or 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=600&fit=crop&q=80',
                'rating': round(float(row[13]), 1) if row[13] else 0,
                'reviews': row[14]
            })
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'tours': tours,
            'total': len(tours)
        })
        
    except Exception as e:
        print(f"Error getting highlighted tours: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

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
    number_of_members = request.args.get('number_of_members')

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
        
        if number_of_members:
            try:
                members_count = int(number_of_members)
                query += " AND t.number_of_members >= %s"
                params.append(members_count)
            except (ValueError, TypeError):
                pass  # Skip invalid number_of_members parameter
        
        query += " ORDER BY t.created_at DESC"
        
        cur.execute(query, params)
        rows = cur.fetchall()
        
        # Filter by duration on application level since duration is stored as string
        tours = []
        for row in rows:
            tour_duration_days = extract_days_from_duration(row[2])
            
            # Apply duration filters if specified
            if min_duration:
                min_days = int(min_duration)
                if tour_duration_days is None or tour_duration_days < min_days:
                    continue
            
            if max_duration:
                max_days = int(max_duration)
                if tour_duration_days is None or tour_duration_days > max_days:
                    continue
        
            tours.append({
                'id': row[0],
                'name': row[1],
                'duration': row[2],
                'description': row[3],
                'destination_city': {'id': row[4], 'name': row[5]},
                'departure_city': {'id': row[6], 'name': row[7]},
                'price': round((float(row[8]) / row[10]) / 1000) * 1000 if row[8] and row[10] and row[10] > 0 else float(row[8]) if row[8] else 0,  # Price per person rounded to nearest 1,000
                'total_price': float(row[8]) if row[8] else 0,
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
        
        # Get basic tour info with partner information
        cur.execute("""
            SELECT 
                t.id, t.name, t.duration, t.description,
                t.destination_city_id, dc.name as destination_city_name,
                t.departure_city_id, dpc.name as departure_city_name,
                t.total_price, t.currency, t.number_of_members,
                t.created_at, t.updated_at, t.created_by,
                u.username as partner_name, u.email as partner_email, u.phone as partner_phone,
                u.partner_type
            FROM tours_admin t
            LEFT JOIN cities dc ON t.destination_city_id = dc.id
            LEFT JOIN cities dpc ON t.departure_city_id = dpc.id
            LEFT JOIN users u ON t.created_by = u.id
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
            'price': round((float(tour_row[8]) / tour_row[10]) / 1000) * 1000 if tour_row[8] and tour_row[10] and tour_row[10] > 0 else float(tour_row[8]) if tour_row[8] else 0,  # Price per person rounded to nearest 1,000
            'total_price': float(tour_row[8]) if tour_row[8] else 0,
            'basePrice': round((float(tour_row[8]) / tour_row[10]) / 1000) * 1000 if tour_row[8] and tour_row[10] and tour_row[10] > 0 else float(tour_row[8]) if tour_row[8] else 0,  # For compatibility, price per person rounded
            'currency': tour_row[9],
            'number_of_members': tour_row[10],
            'created_at': tour_row[11].isoformat() if tour_row[11] else None,
            'updated_at': tour_row[12].isoformat() if tour_row[12] else None,
            # Default values for features not yet implemented
            'tags': [],
            'highlights': [],
            'included': [],
            'excluded': [],
            'hotel': None,
            'tourLocations': [],
            'centerCoordinates': None
        }
        
        # Get real review statistics
        cur.execute("""
            SELECT 
                COUNT(*) as review_count,
                COALESCE(AVG(rating), 0) as avg_rating
            FROM tour_reviews
            WHERE tour_id = %s
        """, (tour_id,))
        
        review_stats = cur.fetchone()
        tour_data['reviewCount'] = review_stats[0] if review_stats else 0
        tour_data['rating'] = round(float(review_stats[1]), 1) if review_stats and review_stats[1] else 0
        
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
                # Get more transportation details
                if svc_row[9]:
                    cur.execute("""
                        SELECT id, license_plate, vehicle_type, brand, max_passengers, description, base_price
                        FROM transportation_services
                        WHERE id = %s
                    """, (svc_row[9],))
                    trans_row = cur.fetchone()
                    if trans_row:
                        service_data['license_plate'] = trans_row[1]
                        service_data['vehicle_type'] = trans_row[2]
                        service_data['brand'] = trans_row[3]
                        service_data['capacity'] = trans_row[4]  # max_passengers
                        service_data['description'] = trans_row[5]
                        service_data['price_per_person'] = float(trans_row[6]) if trans_row[6] else 0
                tour_data['services']['transportation'] = service_data
        
        # Get room bookings with details
        cur.execute("""
            SELECT 
                ar.id, ar.name, ar.room_type, ar.description, 
                ar.max_adults, ar.max_children, ar.room_size, ar.bed_type,
                ar.view_type, ar.amenities, ar.base_price, trb.quantity,
                acs.name as accommodation_name, acs.address, acs.star_rating, acs.description as acc_description
            FROM tour_room_bookings trb
            JOIN accommodation_rooms ar ON trb.room_id = ar.id
            JOIN accommodation_services acs ON ar.accommodation_id = acs.id
            WHERE trb.tour_id = %s
            ORDER BY ar.base_price
        """, (tour_id,))
        
        tour_data['roomBookings'] = []
        tour_data['accommodationDetails'] = None
        
        for room_row in cur.fetchall():
            # Get room images
            cur.execute("""
                SELECT image_url FROM service_images
                WHERE service_type = 'accommodation_room' AND service_id = %s
                ORDER BY display_order
                LIMIT 1
            """, (room_row[0],))
            image_row = cur.fetchone()
            
            tour_data['roomBookings'].append({
                'room_id': room_row[0],
                'quantity': room_row[11],
                'base_price': float(room_row[10]) if room_row[10] else 0,
                'name': room_row[1],
                'roomType': room_row[2],
                'description': room_row[3],
                'maxAdults': room_row[4],
                'maxChildren': room_row[5],
                'roomSize': float(room_row[6]) if room_row[6] else None,
                'bedType': room_row[7],
                'viewType': room_row[8],
                'amenities': room_row[9] if room_row[9] else [],
                'image': image_row[0] if image_row else None
            })
            
            # Set accommodation details (same for all rooms)
            if not tour_data['accommodationDetails']:
                tour_data['accommodationDetails'] = {
                    'name': room_row[12],
                    'address': room_row[13],
                    'star_rating': room_row[14],
                    'description': room_row[15]
                }
        
        # Get selected set meals with details
        cur.execute("""
            SELECT 
                tssm.set_meal_id, tssm.day_number, tssm.meal_session,
                rsm.name, rsm.description, rsm.total_price, rsm.currency,
                rs.name as restaurant_name, rs.cuisine_type, rs.address
            FROM tour_selected_set_meals tssm
            JOIN restaurant_set_meals rsm ON tssm.set_meal_id = rsm.id
            JOIN restaurant_services rs ON rsm.restaurant_id = rs.id
            WHERE tssm.tour_id = %s
            ORDER BY tssm.day_number, tssm.meal_session
        """, (tour_id,))
        
        tour_data['selectedSetMeals'] = []
        for meal_row in cur.fetchall():
            # Get set meal items
            cur.execute("""
                SELECT rmi.name, rmi.description, rmi.category
                FROM restaurant_set_meal_items rsmi
                JOIN restaurant_menu_items rmi ON rsmi.menu_item_id = rmi.id
                WHERE rsmi.set_meal_id = %s
                ORDER BY rmi.category, rmi.name
            """, (meal_row[0],))
            
            menu_items = []
            for item_row in cur.fetchall():
                menu_items.append({
                    'name': item_row[0],
                    'description': item_row[1],
                    'category': item_row[2]
                })
            
            tour_data['selectedSetMeals'].append({
                'set_meal_id': meal_row[0],
                'day_number': meal_row[1],
                'meal_session': meal_row[2],
                'set_meal_name': meal_row[3],
                'set_meal_description': meal_row[4],
                'total_price': float(meal_row[5]) if meal_row[5] else 0,  # Price for 2 people
                'currency': meal_row[6],
                'restaurant_name': meal_row[7],
                'cuisine_type': meal_row[8],
                'restaurant_address': meal_row[9],
                'menu_items': menu_items
            })
        
        # Get all partners involved in this tour from services
        partners_dict = {}  # Use dict to avoid duplicates by partner_id
        
        # Get partners from accommodation
        if tour_data['services'].get('accommodation') and tour_data['services']['accommodation'].get('service_id'):
            cur.execute("""
                SELECT u.id, u.username, u.email, u.phone, u.partner_type
                FROM accommodation_services acs
                JOIN users u ON acs.partner_id = u.id
                WHERE acs.id = %s
            """, (tour_data['services']['accommodation']['service_id'],))
            acc_row = cur.fetchone()
            if acc_row:
                partners_dict[acc_row[0]] = {
                    'id': acc_row[0],
                    'name': acc_row[1] or 'N/A',
                    'email': acc_row[2],
                    'phone': acc_row[3],
                    'partner_type': acc_row[4]
                }
        
        # Get partners from transportation
        if tour_data['services'].get('transportation') and tour_data['services']['transportation'].get('service_id'):
            cur.execute("""
                SELECT u.id, u.username, u.email, u.phone, u.partner_type
                FROM transportation_services ts
                JOIN users u ON ts.partner_id = u.id
                WHERE ts.id = %s
            """, (tour_data['services']['transportation']['service_id'],))
            trans_row = cur.fetchone()
            if trans_row:
                partners_dict[trans_row[0]] = {
                    'id': trans_row[0],
                    'name': trans_row[1] or 'N/A',
                    'email': trans_row[2],
                    'phone': trans_row[3],
                    'partner_type': trans_row[4]
                }
        
        # Get partners from restaurants
        for restaurant in tour_data['services'].get('restaurants', []):
            if restaurant.get('service_id'):
                cur.execute("""
                    SELECT u.id, u.username, u.email, u.phone, u.partner_type
                    FROM restaurant_services rs
                    JOIN users u ON rs.partner_id = u.id
                    WHERE rs.id = %s
                """, (restaurant['service_id'],))
                rest_row = cur.fetchone()
                if rest_row:
                    partners_dict[rest_row[0]] = {
                        'id': rest_row[0],
                        'name': rest_row[1] or 'N/A',
                        'email': rest_row[2],
                        'phone': rest_row[3],
                        'partner_type': rest_row[4]
                    }
        
        # Convert dict to list
        tour_data['partners'] = list(partners_dict.values())
        
        return jsonify(tour_data), 200
        
    except Exception as e:
        print(f"Error fetching tour detail: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@tour_routes.route('/<int:tour_id>/schedules', methods=['GET'])
def get_available_schedules(tour_id):
    """
    Get available schedules for a tour (public endpoint for booking).
    Returns only active schedules with available slots.
    """
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        
        # Get only active schedules with available slots
        cur.execute("""
            SELECT 
                id, tour_id, departure_datetime, return_datetime,
                max_slots, slots_booked, slots_available, is_active
            FROM tour_schedules
            WHERE tour_id = %s 
                AND is_active = TRUE 
                AND departure_datetime > NOW()
                AND slots_available > 0
            ORDER BY departure_datetime ASC
        """, (tour_id,))
        
        rows = cur.fetchall()
        schedules = []
        for row in rows:
            schedules.append({
                'id': row[0],
                'tour_id': row[1],
                'departure_datetime': row[2].isoformat() if row[2] else None,
                'return_datetime': row[3].isoformat() if row[3] else None,
                'max_slots': row[4],
                'slots_booked': row[5],
                'slots_available': row[6],
                'is_active': row[7]
            })
        
        return jsonify(schedules), 200
        
    except Exception as e:
        print(f"Error getting available schedules: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

@tour_routes.route('/accommodation/<int:accommodation_id>/rooms', methods=['GET'])
def get_accommodation_rooms(accommodation_id):
    """
    Public API to get all rooms for a specific accommodation.
    Used for room upgrade options in booking.
    """
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        
        # Get all available rooms for this accommodation
        query = """
            SELECT 
                ar.id,
                ar.accommodation_id,
                ar.room_type,
                ar.bed_type,
                ar.room_size,
                ar.max_adults,
                ar.max_children,
                ar.base_price,
                ar.amenities,
                ar.is_available,
                si.image_url,
                ar.deluxe_upgrade_price,
                ar.suite_upgrade_price
            FROM accommodation_rooms ar
            LEFT JOIN service_images si ON ar.id = si.service_id 
                AND si.service_type = 'accommodation_room'
                AND si.display_order = 1
            WHERE ar.accommodation_id = %s AND ar.is_available = TRUE
            ORDER BY ar.base_price ASC
        """
        
        cur.execute(query, (accommodation_id,))
        rows = cur.fetchall()
        
        rooms = []
        for row in rows:
            rooms.append({
                'id': row[0],
                'accommodation_id': row[1],
                'room_type': row[2],
                'bed_type': row[3],
                'room_size': row[4],
                'max_adults': row[5],
                'max_children': row[6],
                'base_price': float(row[7]) if row[7] else 0,
                'amenities': row[8],
                'is_available': row[9],
                'image_url': row[10],
                'deluxe_upgrade_price': float(row[11]) if row[11] else 0,
                'suite_upgrade_price': float(row[12]) if row[12] else 0
            })
        
        return jsonify(rooms), 200
        
    except Exception as e:
        print(f"Error getting accommodation rooms: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
