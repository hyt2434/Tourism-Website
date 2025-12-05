"""
Admin routes for Tour Management.

This module provides endpoints for creating, reading, updating, and deleting tours.
All endpoints require admin authentication.
"""

from flask import Blueprint, request, jsonify
from config.database import get_connection
from src.routes.user.auth_routes import admin_required
from decimal import Decimal
import json
import re

tour_admin_bp = Blueprint('tour_admin', __name__, url_prefix='/api/admin/tours')


# =====================================================================
# HELPER FUNCTIONS
# =====================================================================

def round_to_thousands(price):
    """Round price to nearest thousand (e.g., 649,000 -> 650,000, 911,900 -> 912,000)"""
    import math
    return math.ceil(price / 1000) * 1000

def get_service_price(service_type, service_id):
    """Get the price of a service for tour cost calculation."""
    conn = get_connection()
    if not conn:
        return 0
    
    try:
        cur = conn.cursor()
        
        if service_type == 'restaurant':
            # Use average cost per person or a representative price
            cur.execute("""
                SELECT COALESCE(average_cost_per_person, 0) as price
                FROM restaurant_services
                WHERE id = %s
            """, (service_id,))
        elif service_type == 'accommodation':
            # Use average of room prices (more representative than minimum)
            cur.execute("""
                SELECT COALESCE(AVG(base_price), 0) as price
                FROM accommodation_rooms
                WHERE accommodation_id = %s AND is_available = TRUE
            """, (service_id,))
        elif service_type == 'transportation':
            # Use base price
            cur.execute("""
                SELECT COALESCE(base_price, 0) as price
                FROM transportation_services
                WHERE id = %s
            """, (service_id,))
        else:
            return 0
        
        result = cur.fetchone()
        return float(result[0]) if result else 0
        
    except Exception as e:
        print(f"Error getting service price: {e}")
        return 0
    finally:
        cur.close()
        conn.close()


# =====================================================================
# GET ALL TOURS
# =====================================================================

@tour_admin_bp.route('', methods=['GET'])
@admin_required
def get_all_tours():
    """
    Get all tours with pagination and search support.
    Query params:
    - page: page number (default 1)
    - limit: items per page (default 10)
    - search: search query for tour name (optional)
    """
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        
        # Get pagination and search parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        search_query = request.args.get('search', '', type=str)
        offset = (page - 1) * limit
        
        # Build WHERE clause for search
        where_clause = ""
        params = []
        if search_query:
            where_clause = "WHERE t.name ILIKE %s"
            params.append(f"%{search_query}%")
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM tours_admin t {where_clause}"
        cur.execute(count_query, params)
        total_count = cur.fetchone()[0]
        
        # Get paginated tours
        query = f"""
            SELECT 
                t.id, t.name, t.duration, t.description,
                t.destination_city_id, dc.name as destination_city_name,
                t.departure_city_id, dpc.name as departure_city_name,
                t.total_price, t.currency, t.is_active, t.is_published,
                t.created_at, t.updated_at, t.number_of_members,
                (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_primary = TRUE LIMIT 1) as primary_image
            FROM tours_admin t
            LEFT JOIN cities dc ON t.destination_city_id = dc.id
            LEFT JOIN cities dpc ON t.departure_city_id = dpc.id
            {where_clause}
            ORDER BY t.created_at DESC
            LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])
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
                'total_price': float(row[8]),
                'currency': row[9],
                'is_active': row[10],
                'is_published': row[11],
                'created_at': row[12].isoformat() if row[12] else None,
                'updated_at': row[13].isoformat() if row[13] else None,
                'number_of_members': row[14],
                'primary_image': row[15]
            })
        
        total_pages = (total_count + limit - 1) // limit  # Ceiling division
        
        return jsonify({
            'tours': tours,
            'total': total_count,
            'page': page,
            'limit': limit,
            'total_pages': total_pages
        }), 200
        
    except Exception as e:
        print(f"Error fetching tours: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =====================================================================
# GET SINGLE TOUR (Detailed)
# =====================================================================

@tour_admin_bp.route('/<int:tour_id>', methods=['GET'])
@admin_required
def get_tour_detail(tour_id):
    """Get complete tour details including itinerary and services."""
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
                t.total_price, t.currency, t.is_active, t.is_published,
                t.created_at, t.updated_at, t.number_of_members
            FROM tours_admin t
            LEFT JOIN cities dc ON t.destination_city_id = dc.id
            LEFT JOIN cities dpc ON t.departure_city_id = dpc.id
            WHERE t.id = %s
        """, (tour_id,))
        
        tour_row = cur.fetchone()
        if not tour_row:
            return jsonify({"error": "Tour not found"}), 404
        
        tour_data = {
            'id': tour_row[0],
            'name': tour_row[1],
            'duration': tour_row[2],
            'description': tour_row[3],
            'destination_city': {'id': tour_row[4], 'name': tour_row[5]},
            'departure_city': {'id': tour_row[6], 'name': tour_row[7]},
            'total_price': float(tour_row[8]),
            'currency': tour_row[9],
            'is_active': tour_row[10],
            'is_published': tour_row[11],
            'created_at': tour_row[12].isoformat() if tour_row[12] else None,
            'updated_at': tour_row[13].isoformat() if tour_row[13] else None,
            'number_of_members': tour_row[14] if tour_row[14] else 1
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
        
        # Get selected rooms
        cur.execute("""
            SELECT room_id FROM tour_selected_rooms
            WHERE tour_id = %s
        """, (tour_id,))
        tour_data['selectedRooms'] = [row[0] for row in cur.fetchall()]
        
        # Get selected menu items
        cur.execute("""
            SELECT menu_item_id, day_number FROM tour_selected_menu_items
            WHERE tour_id = %s
            ORDER BY day_number
        """, (tour_id,))
        
        selected_menu_items = {}
        for row in cur.fetchall():
            day_key = str(row[1])
            if day_key not in selected_menu_items:
                selected_menu_items[day_key] = []
            selected_menu_items[day_key].append(row[0])
        tour_data['selectedMenuItems'] = selected_menu_items
        
        return jsonify(tour_data), 200
        
    except Exception as e:
        print(f"Error fetching tour detail: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =====================================================================
# CREATE NEW TOUR
# =====================================================================

@tour_admin_bp.route('', methods=['POST'])
@admin_required
def create_tour():
    """Create a new tour with all components."""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'duration', 'description', 'destination_city_id', 'departure_city_id']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Validate cities are different
    if data['destination_city_id'] == data['departure_city_id']:
        return jsonify({"error": "Destination and departure cities must be different"}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        
        # Get user ID from request headers
        user_id = request.headers.get('X-User-ID')
        
        # Create main tour
        cur.execute("""
            INSERT INTO tours_admin (
                name, duration, description, 
                destination_city_id, departure_city_id,
                number_of_members,
                created_by, is_active, is_published
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data['name'], data['duration'], data['description'],
            data['destination_city_id'], data['departure_city_id'],
            data.get('number_of_members', 1),
            user_id, data.get('is_active', True), data.get('is_published', False)
        ))
        
        tour_id = cur.fetchone()[0]
        
        # Add images if provided
        if 'images' in data and data['images']:
            for idx, image in enumerate(data['images']):
                cur.execute("""
                    INSERT INTO tour_images (
                        tour_id, image_url, image_caption, display_order, is_primary
                    )
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    tour_id, image['url'], image.get('caption'),
                    image.get('display_order', idx), image.get('is_primary', idx == 0)
                ))
        
        # Add daily itinerary if provided
        if 'itinerary' in data and data['itinerary']:
            for day in data['itinerary']:
                cur.execute("""
                    INSERT INTO tour_daily_itinerary (
                        tour_id, day_number, day_title, day_summary
                    )
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                """, (
                    tour_id, day['day_number'], 
                    day.get('day_title'), day.get('day_summary')
                ))
                
                itinerary_id = cur.fetchone()[0]
                
                # Add time checkpoints for each time period
                for period in ['morning', 'noon', 'evening']:
                    if period in day.get('checkpoints', {}):
                        for checkpoint in day['checkpoints'][period]:
                            cur.execute("""
                                INSERT INTO tour_time_checkpoints (
                                    itinerary_id, time_period, checkpoint_time,
                                    activity_title, activity_description, location, display_order
                                )
                                VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """, (
                                itinerary_id, period, checkpoint['checkpoint_time'],
                                checkpoint['activity_title'], checkpoint.get('activity_description'),
                                checkpoint.get('location'), checkpoint.get('display_order', 0)
                            ))
        
        # Add services if provided
        if 'services' in data:
            services = data['services']
            
            # Add restaurants (one per day)
            if 'restaurants' in services:
                for restaurant in services['restaurants']:
                    price = get_service_price('restaurant', restaurant['service_id'])
                    cur.execute("""
                        INSERT INTO tour_services (
                            tour_id, service_type, restaurant_id, day_number, service_cost, notes
                        )
                        VALUES (%s, 'restaurant', %s, %s, %s, %s)
                    """, (
                        tour_id, restaurant['service_id'], restaurant['day_number'],
                        price, restaurant.get('notes')
                    ))
            
            # Add accommodation (one for entire trip)
            if 'accommodation' in services and services['accommodation']:
                acc = services['accommodation']
                price = get_service_price('accommodation', acc['service_id'])
                cur.execute("""
                    INSERT INTO tour_services (
                        tour_id, service_type, accommodation_id, service_cost, notes
                    )
                    VALUES (%s, 'accommodation', %s, %s, %s)
                """, (tour_id, acc['service_id'], price, acc.get('notes')))
            
            # Add transportation (one for entire trip)
            if 'transportation' in services and services['transportation']:
                trans = services['transportation']
                price = get_service_price('transportation', trans['service_id'])
                cur.execute("""
                    INSERT INTO tour_services (
                        tour_id, service_type, transportation_id, service_cost, notes
                    )
                    VALUES (%s, 'transportation', %s, %s, %s)
                """, (tour_id, trans['service_id'], price, trans.get('notes')))
        
        # Save selected rooms if provided
        if 'selectedRooms' in data and data['selectedRooms']:
            for room_id in data['selectedRooms']:
                cur.execute("""
                    INSERT INTO tour_selected_rooms (tour_id, room_id)
                    VALUES (%s, %s)
                    ON CONFLICT (tour_id, room_id) DO NOTHING
                """, (tour_id, room_id))
        
        # Save selected menu items if provided
        if 'selectedMenuItems' in data and data['selectedMenuItems']:
            for day_number, item_ids in data['selectedMenuItems'].items():
                for item_id in item_ids:
                    cur.execute("""
                        INSERT INTO tour_selected_menu_items (tour_id, menu_item_id, day_number)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (tour_id, menu_item_id, day_number) DO NOTHING
                    """, (tour_id, item_id, int(day_number)))
        
        # Calculate and set total_price based on selected rooms and menu items
        total_price = 0
        
        # Extract number of nights from duration (e.g., "3 days 2 nights" -> 2)
        duration = data.get('duration', '')
        num_nights = 1  # Default to 1 night
        if duration:
            night_match = re.search(r'(\d+)\s*(?:night|đêm)', duration.lower())
            if night_match:
                num_nights = int(night_match.group(1))
        
        # Get number of members
        number_of_members = data.get('number_of_members', 1)
        
        # Calculate accommodation cost from selected rooms (multiply by number of nights)
        accommodation_cost = 0
        if 'selectedRooms' in data and data['selectedRooms']:
            for room_id in data['selectedRooms']:
                cur.execute("""
                    SELECT base_price FROM accommodation_rooms WHERE id = %s
                """, (room_id,))
                result = cur.fetchone()
                if result and result[0]:
                    accommodation_cost += float(result[0]) * num_nights
        
        # Calculate restaurant costs from selected menu items
        restaurant_cost = 0
        if 'selectedMenuItems' in data and data['selectedMenuItems']:
            for day_number, item_ids in data['selectedMenuItems'].items():
                for item_id in item_ids:
                    cur.execute("""
                        SELECT price FROM restaurant_menu_items WHERE id = %s
                    """, (item_id,))
                    result = cur.fetchone()
                    if result and result[0]:
                        restaurant_cost += float(result[0])
        
        # Add transportation cost (per person, multiply by number of members, double for round trip)
        transportation_cost = 0
        if 'services' in data and 'transportation' in data['services'] and data['services']['transportation']:
            cur.execute("""
                SELECT base_price FROM transportation_services WHERE id = %s
            """, (data['services']['transportation']['service_id'],))
            result = cur.fetchone()
            if result and result[0]:
                price_per_person = float(result[0])
                transportation_cost = price_per_person * number_of_members * 2  # Round trip
        
        # Calculate subtotal
        subtotal = accommodation_cost + restaurant_cost + transportation_cost
        
        # Add 10% admin fee
        admin_fee = subtotal * 0.10
        total_price = subtotal + admin_fee
        
        # Round to nearest ten thousand
        total_price = round_to_thousands(total_price)
        
        # Update total_price directly
        cur.execute("""
            UPDATE tours_admin SET total_price = %s WHERE id = %s
        """, (total_price, tour_id))
        
        conn.commit()
        
        return jsonify({
            "message": "Tour created successfully",
            "tour_id": tour_id
        }), 201
        
    except Exception as e:
        conn.rollback()
        print(f"Error creating tour: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =====================================================================
# UPDATE TOUR
# =====================================================================

@tour_admin_bp.route('/<int:tour_id>', methods=['PUT'])
@admin_required
def update_tour(tour_id):
    """Update an existing tour."""
    data = request.get_json()
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        
        # Check if tour exists
        cur.execute("SELECT id FROM tours_admin WHERE id = %s", (tour_id,))
        if not cur.fetchone():
            return jsonify({"error": "Tour not found"}), 404
        
        # Update basic tour info
        update_fields = []
        update_values = []
        
        if 'name' in data:
            update_fields.append('name = %s')
            update_values.append(data['name'])
        if 'duration' in data:
            update_fields.append('duration = %s')
            update_values.append(data['duration'])
        if 'description' in data:
            update_fields.append('description = %s')
            update_values.append(data['description'])
        if 'destination_city_id' in data:
            update_fields.append('destination_city_id = %s')
            update_values.append(data['destination_city_id'])
        if 'departure_city_id' in data:
            update_fields.append('departure_city_id = %s')
            update_values.append(data['departure_city_id'])
        if 'is_active' in data:
            update_fields.append('is_active = %s')
            update_values.append(data['is_active'])
        if 'is_published' in data:
            update_fields.append('is_published = %s')
            update_values.append(data['is_published'])
        if 'number_of_members' in data:
            update_fields.append('number_of_members = %s')
            update_values.append(data['number_of_members'])
        
        if update_fields:
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            update_values.append(tour_id)
            
            query = f"UPDATE tours_admin SET {', '.join(update_fields)} WHERE id = %s"
            cur.execute(query, update_values)
        
        # Handle images update if provided
        if 'images' in data:
            # Delete existing images
            cur.execute("DELETE FROM tour_images WHERE tour_id = %s", (tour_id,))
            
            # Add new images
            for idx, image in enumerate(data['images']):
                cur.execute("""
                    INSERT INTO tour_images (
                        tour_id, image_url, image_caption, display_order, is_primary
                    )
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    tour_id, image['url'], image.get('caption'),
                    image.get('display_order', idx), image.get('is_primary', idx == 0)
                ))
        
        # Handle itinerary update if provided
        if 'itinerary' in data:
            # Delete existing itinerary (cascades to checkpoints)
            cur.execute("DELETE FROM tour_daily_itinerary WHERE tour_id = %s", (tour_id,))
            
            # Add new itinerary
            for day in data['itinerary']:
                cur.execute("""
                    INSERT INTO tour_daily_itinerary (
                        tour_id, day_number, day_title, day_summary
                    )
                    VALUES (%s, %s, %s, %s)
                    RETURNING id
                """, (
                    tour_id, day['day_number'],
                    day.get('day_title'), day.get('day_summary')
                ))
                
                itinerary_id = cur.fetchone()[0]
                
                # Add time checkpoints
                for period in ['morning', 'noon', 'evening']:
                    if period in day.get('checkpoints', {}):
                        for checkpoint in day['checkpoints'][period]:
                            cur.execute("""
                                INSERT INTO tour_time_checkpoints (
                                    itinerary_id, time_period, checkpoint_time,
                                    activity_title, activity_description, location, display_order
                                )
                                VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """, (
                                itinerary_id, period, checkpoint['checkpoint_time'],
                                checkpoint['activity_title'], checkpoint.get('activity_description'),
                                checkpoint.get('location'), checkpoint.get('display_order', 0)
                            ))
        
        # Handle services update if provided
        if 'services' in data:
            # Delete existing services
            cur.execute("DELETE FROM tour_services WHERE tour_id = %s", (tour_id,))
            
            services = data['services']
            
            # Add restaurants
            if 'restaurants' in services:
                for restaurant in services['restaurants']:
                    price = get_service_price('restaurant', restaurant['service_id'])
                    cur.execute("""
                        INSERT INTO tour_services (
                            tour_id, service_type, restaurant_id, day_number, service_cost, notes
                        )
                        VALUES (%s, 'restaurant', %s, %s, %s, %s)
                    """, (
                        tour_id, restaurant['service_id'], restaurant['day_number'],
                        price, restaurant.get('notes')
                    ))
            
            # Add accommodation
            if 'accommodation' in services and services['accommodation']:
                acc = services['accommodation']
                price = get_service_price('accommodation', acc['service_id'])
                cur.execute("""
                    INSERT INTO tour_services (
                        tour_id, service_type, accommodation_id, service_cost, notes
                    )
                    VALUES (%s, 'accommodation', %s, %s, %s)
                """, (tour_id, acc['service_id'], price, acc.get('notes')))
            
            # Add transportation
            if 'transportation' in services and services['transportation']:
                trans = services['transportation']
                price = get_service_price('transportation', trans['service_id'])
                cur.execute("""
                    INSERT INTO tour_services (
                        tour_id, service_type, transportation_id, service_cost, notes
                    )
                    VALUES (%s, 'transportation', %s, %s, %s)
                """, (tour_id, trans['service_id'], price, trans.get('notes')))
        
        # Update selected rooms if provided
        if 'selectedRooms' in data:
            # Delete existing selections
            cur.execute("DELETE FROM tour_selected_rooms WHERE tour_id = %s", (tour_id,))
            # Add new selections
            for room_id in data['selectedRooms']:
                cur.execute("""
                    INSERT INTO tour_selected_rooms (tour_id, room_id)
                    VALUES (%s, %s)
                    ON CONFLICT (tour_id, room_id) DO NOTHING
                """, (tour_id, room_id))
        
        # Update selected menu items if provided
        if 'selectedMenuItems' in data:
            # Delete existing selections
            cur.execute("DELETE FROM tour_selected_menu_items WHERE tour_id = %s", (tour_id,))
            # Add new selections
            for day_number, item_ids in data['selectedMenuItems'].items():
                for item_id in item_ids:
                    cur.execute("""
                        INSERT INTO tour_selected_menu_items (tour_id, menu_item_id, day_number)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (tour_id, menu_item_id, day_number) DO NOTHING
                    """, (tour_id, item_id, int(day_number)))
        
        # Calculate and set total_price based on selected rooms and menu items
        total_price = 0
        
        # Get tour duration and number of members to calculate price
        cur.execute("SELECT duration, number_of_members FROM tours_admin WHERE id = %s", (tour_id,))
        tour_result = cur.fetchone()
        duration = tour_result[0] if tour_result else ''
        number_of_members = tour_result[1] if tour_result and tour_result[1] else 1
        
        num_nights = 1  # Default to 1 night
        if duration:
            night_match = re.search(r'(\d+)\s*(?:night|đêm)', duration.lower())
            if night_match:
                num_nights = int(night_match.group(1))
        
        # Get current selected rooms
        cur.execute("SELECT room_id FROM tour_selected_rooms WHERE tour_id = %s", (tour_id,))
        selected_room_ids = [row[0] for row in cur.fetchall()]
        
        # Calculate accommodation cost from selected rooms (multiply by number of nights)
        accommodation_cost = 0
        if selected_room_ids:
            for room_id in selected_room_ids:
                cur.execute("""
                    SELECT base_price FROM accommodation_rooms WHERE id = %s
                """, (room_id,))
                result = cur.fetchone()
                if result and result[0]:
                    accommodation_cost += float(result[0]) * num_nights
        
        # Get current selected menu items
        cur.execute("""
            SELECT menu_item_id FROM tour_selected_menu_items WHERE tour_id = %s
        """, (tour_id,))
        selected_menu_item_ids = [row[0] for row in cur.fetchall()]
        
        # Calculate restaurant costs from selected menu items
        restaurant_cost = 0
        if selected_menu_item_ids:
            for item_id in selected_menu_item_ids:
                cur.execute("""
                    SELECT price FROM restaurant_menu_items WHERE id = %s
                """, (item_id,))
                result = cur.fetchone()
                if result and result[0]:
                    restaurant_cost += float(result[0])
        
        # Add transportation cost (per person, multiply by number of members, double for round trip)
        transportation_cost = 0
        cur.execute("""
            SELECT transportation_id FROM tour_services 
            WHERE tour_id = %s AND service_type = 'transportation'
        """, (tour_id,))
        trans_result = cur.fetchone()
        if trans_result and trans_result[0]:
            cur.execute("""
                SELECT base_price FROM transportation_services WHERE id = %s
            """, (trans_result[0],))
            price_result = cur.fetchone()
            if price_result and price_result[0]:
                price_per_person = float(price_result[0])
                transportation_cost = price_per_person * number_of_members * 2  # Round trip
        
        # Calculate subtotal
        subtotal = accommodation_cost + restaurant_cost + transportation_cost
        
        # Add 10% admin fee
        admin_fee = subtotal * 0.10
        total_price = subtotal + admin_fee
        
        # Round to nearest ten thousand
        total_price = round_to_thousands(total_price)
        
        # Update total_price directly
        cur.execute("""
            UPDATE tours_admin SET total_price = %s WHERE id = %s
        """, (total_price, tour_id))
        
        conn.commit()
        
        return jsonify({"message": "Tour updated successfully"}), 200
        
    except Exception as e:
        conn.rollback()
        print(f"Error updating tour: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =====================================================================
# DELETE TOUR
# =====================================================================

@tour_admin_bp.route('/<int:tour_id>', methods=['DELETE'])
@admin_required
def delete_tour(tour_id):
    """Delete a tour (cascades to all related data)."""
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        
        # Check if tour exists
        cur.execute("SELECT id FROM tours_admin WHERE id = %s", (tour_id,))
        if not cur.fetchone():
            return jsonify({"error": "Tour not found"}), 404
        
        # Delete tour (cascades to images, itinerary, checkpoints, services)
        cur.execute("DELETE FROM tours_admin WHERE id = %s", (tour_id,))
        
        conn.commit()
        
        return jsonify({"message": "Tour deleted successfully"}), 200
        
    except Exception as e:
        conn.rollback()
        print(f"Error deleting tour: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =====================================================================
# GET AVAILABLE SERVICES (filtered by destination city)
# =====================================================================

@tour_admin_bp.route('/available-services', methods=['GET'])
@admin_required
def get_available_services():
    """
    Get available services filtered by destination (and departure for transportation).
    Query params: 
    - destination_city_id (required)
    - departure_city_id (optional, for transportation)
    - service_type (optional: restaurant, accommodation, transportation)
    """
    destination_city_id = request.args.get('destination_city_id', type=int)
    departure_city_id = request.args.get('departure_city_id', type=int)
    service_type = request.args.get('service_type')
    
    if not destination_city_id:
        return jsonify({"error": "destination_city_id is required"}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        
        result = {}
        
        # Get restaurants in destination city (removed is_verified requirement)
        if not service_type or service_type == 'restaurant':
            cur.execute("""
                SELECT id, name, cuisine_type, address, average_cost_per_person, price_range
                FROM restaurant_services
                WHERE city_id = %s AND is_active = TRUE
                ORDER BY name
            """, (destination_city_id,))
            
            result['restaurants'] = []
            for row in cur.fetchall():
                result['restaurants'].append({
                    'id': row[0],
                    'name': row[1],
                    'cuisine_type': row[2],
                    'address': row[3],
                    'average_cost': float(row[4]) if row[4] else 0,
                    'price_range': row[5]
                })
            
            print(f"Found {len(result['restaurants'])} restaurants for city {destination_city_id}")
        
        # Get accommodations in destination city (removed is_verified requirement)
        if not service_type or service_type == 'accommodation':
            cur.execute("""
                SELECT id, name, star_rating, address, min_price, max_price
                FROM accommodation_services
                WHERE city_id = %s AND is_active = TRUE
                ORDER BY name
            """, (destination_city_id,))
            
            result['accommodations'] = []
            for row in cur.fetchall():
                result['accommodations'].append({
                    'id': row[0],
                    'name': row[1],
                    'star_rating': row[2],
                    'address': row[3],
                    'min_price': float(row[4]) if row[4] else 0,
                    'max_price': float(row[5]) if row[5] else 0
                })
            
            print(f"Found {len(result['accommodations'])} accommodations for city {destination_city_id}")
        
        # Get transportation (filtered by departure and destination cities)
        if not service_type or service_type == 'transportation':
            if departure_city_id and destination_city_id:
                # Filter by exact departure and destination match
                cur.execute("""
                    SELECT id, license_plate, vehicle_type, brand, max_passengers, base_price, features,
                           departure_city_id, destination_city_id
                    FROM transportation_services
                    WHERE is_active = TRUE 
                      AND departure_city_id = %s 
                      AND destination_city_id = %s
                    ORDER BY license_plate
                """, (departure_city_id, destination_city_id))
            else:
                # If no departure/destination specified, get all active transportation
                cur.execute("""
                    SELECT id, license_plate, vehicle_type, brand, max_passengers, base_price, features,
                           departure_city_id, destination_city_id
                    FROM transportation_services
                    WHERE is_active = TRUE
                    ORDER BY license_plate
                """)
            
            result['transportation'] = []
            for row in cur.fetchall():
                result['transportation'].append({
                    'id': row[0],
                    'license_plate': row[1],
                    'vehicle_type': row[2],
                    'brand': row[3],
                    'max_passengers': row[4],
                    'base_price': float(row[5]) if row[5] else 0,
                    'features': row[6] if row[6] else [],
                    'pickup_location': f"City {row[7]}" if row[7] else None,
                    'dropoff_location': f"City {row[8]}" if row[8] else None
                })
            
            print(f"Found {len(result['transportation'])} transportation services for route {departure_city_id} -> {destination_city_id}")
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error fetching available services: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =====================================================================
# CALCULATE SERVICE PRICE
# =====================================================================

@tour_admin_bp.route('/calculate-price', methods=['POST'])
@admin_required
def calculate_tour_price():
    """Calculate total tour price based on selected services and specific items."""
    data = request.get_json()
    
    if 'services' not in data:
        return jsonify({"error": "services data required"}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        total_price = 0
        breakdown = {
            'restaurants': 0,
            'accommodation': 0,
            'transportation': 0,
            'admin_fee': 0
        }
        
        services = data['services']
        selected_rooms = data.get('selectedRooms', [])
        selected_menu_items = data.get('selectedMenuItems', {})
        number_of_members = data.get('number_of_members', 1)
        
        print(f"Calculating price - Selected rooms: {selected_rooms}")
        print(f"Calculating price - Selected menu items: {selected_menu_items}")
        print(f"Calculating price - Number of members: {number_of_members}")
        
        # Extract number of nights from duration if provided
        num_nights = 1  # Default to 1 night
        if 'duration' in data:
            duration = data['duration']
            night_match = re.search(r'(\d+)\s*(?:night|đêm)', duration.lower())
            if night_match:
                num_nights = int(night_match.group(1))
        
        # Calculate accommodation cost based on selected rooms (multiply by number of nights)
        if 'accommodation' in services and services['accommodation'] and selected_rooms:
            print(f"Processing {len(selected_rooms)} rooms for {num_nights} nights...")
            for room_id in selected_rooms:
                cur.execute("""
                    SELECT base_price FROM accommodation_rooms WHERE id = %s
                """, (room_id,))
                result = cur.fetchone()
                if result and result[0]:
                    room_price = float(result[0]) * num_nights
                    breakdown['accommodation'] += room_price
                    print(f"Room {room_id}: {float(result[0])} VND x {num_nights} nights = {room_price} VND")
                else:
                    print(f"Room {room_id}: No price found")
        
        # Calculate restaurant costs based on selected menu items
        if 'restaurants' in services and selected_menu_items:
            print(f"Processing menu items for {len(selected_menu_items)} days...")
            for day_number, item_ids in selected_menu_items.items():
                if item_ids:  # Only process if there are items
                    for item_id in item_ids:
                        cur.execute("""
                            SELECT price FROM restaurant_menu_items WHERE id = %s
                        """, (item_id,))
                        result = cur.fetchone()
                        if result and result[0]:
                            item_price = float(result[0])
                            breakdown['restaurants'] += item_price
                            print(f"Menu item {item_id}: {item_price} VND")
                        else:
                            print(f"Menu item {item_id}: No price found")
        
        # Calculate transportation cost (per person, multiply by number of members, double for round trip)
        if 'transportation' in services and services['transportation']:
            cur.execute("""
                SELECT base_price FROM transportation_services WHERE id = %s
            """, (services['transportation']['service_id'],))
            result = cur.fetchone()
            if result and result[0]:
                price_per_person = float(result[0])
                # Price is per person, multiply by number of members, then by 2 for round trip
                breakdown['transportation'] = price_per_person * number_of_members * 2
                print(f"Transportation: {price_per_person} VND/person x {number_of_members} members x 2 (round trip) = {breakdown['transportation']} VND")
            else:
                print("Transportation: No price found")
        
        # Calculate subtotal before admin fee
        subtotal = breakdown['accommodation'] + breakdown['restaurants'] + breakdown['transportation']
        
        # Add 10% admin fee
        admin_fee = subtotal * 0.10
        breakdown['admin_fee'] = admin_fee
        
        # Calculate total with admin fee
        total_price = subtotal + admin_fee
        
        # Round to nearest ten thousand
        total_price = round_to_thousands(total_price)
        
        print(f"Subtotal: {subtotal} VND")
        print(f"Admin fee (10%): {admin_fee} VND")
        print(f"Total price (rounded): {total_price} VND")
        print(f"Breakdown: {breakdown}")
        
        return jsonify({
            'total_price': total_price,
            'breakdown': breakdown,
            'currency': 'VND'
        }), 200
        
    except Exception as e:
        print(f"Error calculating price: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =====================================================================
# GET SERVICE DETAILS (Rooms, Menu Items)
# =====================================================================

@tour_admin_bp.route('/service-details/accommodation/<int:accommodation_id>/rooms', methods=['GET'])
@admin_required
def get_accommodation_rooms(accommodation_id):
    """Get all rooms for an accommodation."""
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                id, name, room_type, description, max_adults, max_children,
                total_rooms, room_size, bed_type, view_type, amenities,
                base_price, weekend_price, holiday_price, currency, is_available,
                created_at, updated_at
            FROM accommodation_rooms
            WHERE accommodation_id = %s
            ORDER BY base_price
        """, (accommodation_id,))
        
        rows = cur.fetchall()
        
        rooms = []
        for row in rows:
            # Get room images
            cur.execute("""
                SELECT image_url FROM service_images
                WHERE service_type = 'accommodation_room' AND service_id = %s
                ORDER BY display_order
            """, (row[0],))
            
            images = [img[0] for img in cur.fetchall()]
            
            rooms.append({
                'id': row[0],
                'name': row[1],
                'roomType': row[2],
                'description': row[3],
                'maxAdults': row[4],
                'maxChildren': row[5],
                'totalRooms': row[6],
                'roomSize': float(row[7]) if row[7] else None,
                'bedType': row[8],
                'viewType': row[9],
                'amenities': row[10] if row[10] else [],
                'basePrice': float(row[11]) if row[11] else None,
                'weekendPrice': float(row[12]) if row[12] else None,
                'holidayPrice': float(row[13]) if row[13] else None,
                'currency': row[14],
                'isAvailable': row[15],
                'images': images,
                'createdAt': row[16].isoformat() if row[16] else None,
                'updatedAt': row[17].isoformat() if row[17] else None
            })
        
        return jsonify(rooms), 200
        
    except Exception as e:
        print(f"Error fetching rooms: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@tour_admin_bp.route('/service-details/restaurant/<int:restaurant_id>/menu', methods=['GET'])
@admin_required
def get_restaurant_menu(restaurant_id):
    """Get all menu items for a restaurant."""
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                id, name, description, category, price, currency,
                portion_size, preparation_time, calories,
                is_vegetarian, is_vegan, is_gluten_free, is_spicy,
                spice_level, allergens, ingredients,
                is_available, is_popular, is_special,
                created_at, updated_at
            FROM restaurant_menu_items
            WHERE restaurant_id = %s AND is_available = TRUE
            ORDER BY category, name
        """, (restaurant_id,))
        
        rows = cur.fetchall()
        
        menu_items = []
        for row in rows:
            # Get menu item images
            cur.execute("""
                SELECT image_url FROM service_images
                WHERE service_type = 'menu_item' AND service_id = %s
                ORDER BY display_order
                LIMIT 1
            """, (row[0],))
            
            image_row = cur.fetchone()
            
            menu_items.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'category': row[3],
                'price': float(row[4]) if row[4] else None,
                'currency': row[5],
                'portionSize': row[6],
                'preparationTime': row[7],
                'calories': row[8],
                'isVegetarian': row[9],
                'isVegan': row[10],
                'isGlutenFree': row[11],
                'isSpicy': row[12],
                'spiceLevel': row[13],
                'allergens': row[14] if row[14] else [],
                'ingredients': row[15] if row[15] else [],
                'isAvailable': row[16],
                'isPopular': row[17],
                'isSpecial': row[18],
                'image': image_row[0] if image_row else None,
                'createdAt': row[19].isoformat() if row[19] else None,
                'updatedAt': row[20].isoformat() if row[20] else None
            })
        
        return jsonify(menu_items), 200
        
    except Exception as e:
        print(f"Error fetching menu: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =====================================================================
# SYNC ALL TOURS (Update all tour information including members and prices)
# =====================================================================

@tour_admin_bp.route('/sync-all-tours', methods=['POST'])
@admin_required
def sync_all_tours():
    """Sync all tours by recalculating number of members and prices based on current data."""
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        
        # Get all tours
        cur.execute("""
            SELECT id, duration FROM tours_admin
        """)
        tours = cur.fetchall()
        
        updated_count = 0
        errors = []
        
        for tour_id, duration in tours:
            try:
                # Get selected rooms to calculate number of members
                cur.execute("""
                    SELECT ar.id, ar.max_adults, ar.max_children
                    FROM tour_selected_rooms tsr
                    JOIN accommodation_rooms ar ON tsr.room_id = ar.id
                    WHERE tsr.tour_id = %s
                """, (tour_id,))
                selected_rooms = cur.fetchall()
                
                # Calculate number of members from rooms
                # Formula: 1 adult = 1 person, 2 children = 1 person
                number_of_members = 0
                if selected_rooms:
                    for room_id, max_adults, max_children in selected_rooms:
                        adults = max_adults or 0
                        children = max_children or 0
                        number_of_members += adults + (children // 2)
                
                # Default to 1 if no rooms selected
                if number_of_members == 0:
                    number_of_members = 1
                
                # Update number of members
                cur.execute("""
                    UPDATE tours_admin SET number_of_members = %s WHERE id = %s
                """, (number_of_members, tour_id))
                
                # Now calculate prices
                accommodation_cost = 0
                restaurant_cost = 0
                transportation_cost = 0
                
                # Extract number of nights from duration
                num_nights = 1  # Default to 1 night
                if duration:
                    night_match = re.search(r'(\d+)\s*(?:night|đêm)', duration.lower())
                    if night_match:
                        num_nights = int(night_match.group(1))
                
                # Calculate accommodation cost from selected rooms
                selected_room_ids = [row[0] for row in selected_rooms]
                if selected_room_ids:
                    for room_id in selected_room_ids:
                        cur.execute("""
                            SELECT base_price FROM accommodation_rooms WHERE id = %s
                        """, (room_id,))
                        result = cur.fetchone()
                        if result and result[0]:
                            accommodation_cost += float(result[0]) * num_nights
                
                # Calculate restaurant costs from selected menu items
                cur.execute("""
                    SELECT menu_item_id FROM tour_selected_menu_items WHERE tour_id = %s
                """, (tour_id,))
                selected_menu_item_ids = [row[0] for row in cur.fetchall()]
                
                if selected_menu_item_ids:
                    for item_id in selected_menu_item_ids:
                        cur.execute("""
                            SELECT price FROM restaurant_menu_items WHERE id = %s
                        """, (item_id,))
                        result = cur.fetchone()
                        if result and result[0]:
                            restaurant_cost += float(result[0])
                
                # Add transportation cost (per person, multiply by number of members, round trip)
                cur.execute("""
                    SELECT transportation_id FROM tour_services 
                    WHERE tour_id = %s AND service_type = 'transportation'
                """, (tour_id,))
                trans_result = cur.fetchone()
                if trans_result and trans_result[0]:
                    cur.execute("""
                        SELECT base_price FROM transportation_services WHERE id = %s
                    """, (trans_result[0],))
                    price_result = cur.fetchone()
                    if price_result and price_result[0]:
                        price_per_person = float(price_result[0])
                        transportation_cost = price_per_person * number_of_members * 2  # Round trip
                
                # Calculate subtotal
                subtotal = accommodation_cost + restaurant_cost + transportation_cost
                
                # Add 10% admin fee
                admin_fee = subtotal * 0.10
                total_price = subtotal + admin_fee
                
                # Round to nearest ten thousand
                total_price = round_to_thousands(total_price)
                
                # Update total_price
                cur.execute("""
                    UPDATE tours_admin SET total_price = %s WHERE id = %s
                """, (total_price, tour_id))
                
                updated_count += 1
                
            except Exception as e:
                errors.append(f"Tour {tour_id}: {str(e)}")
                print(f"Error syncing tour {tour_id}: {e}")
        
        conn.commit()
        
        return jsonify({
            "message": f"Successfully synced {updated_count} tours",
            "updated_count": updated_count,
            "total_tours": len(tours),
            "errors": errors if errors else None
        }), 200
        
    except Exception as e:
        conn.rollback()
        print(f"Error syncing tours: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
