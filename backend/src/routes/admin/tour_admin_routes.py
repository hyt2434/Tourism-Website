"""
Admin routes for Tour Management.

This module provides endpoints for creating, reading, updating, and deleting tours.
All endpoints require admin authentication.
"""

from flask import Blueprint, request, jsonify
from src.database import get_connection
from src.routes.user.auth_routes import admin_required
from decimal import Decimal
import json

tour_admin_bp = Blueprint('tour_admin', __name__, url_prefix='/api/admin/tours')


# =====================================================================
# HELPER FUNCTIONS
# =====================================================================

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
            # Use minimum price or average of room prices
            cur.execute("""
                SELECT COALESCE(MIN(base_price), 0) as price
                FROM accommodation_rooms
                WHERE accommodation_id = %s
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
    """Get all tours with basic information."""
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                t.id, t.name, t.duration, t.description,
                t.destination_city_id, dc.name as destination_city_name,
                t.departure_city_id, dpc.name as departure_city_name,
                t.total_price, t.currency, t.is_active, t.is_published,
                t.created_at, t.updated_at,
                (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_primary = TRUE LIMIT 1) as primary_image
            FROM tours_admin t
            LEFT JOIN cities dc ON t.destination_city_id = dc.id
            LEFT JOIN cities dpc ON t.departure_city_id = dpc.id
            ORDER BY t.created_at DESC
        """)
        
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
                'primary_image': row[14]
            })
        
        return jsonify(tours), 200
        
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
                t.created_at, t.updated_at
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
            'updated_at': tour_row[13].isoformat() if tour_row[13] else None
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
                ts.transportation_id, trs.name as transportation_name
            FROM tour_services ts
            LEFT JOIN restaurant_services rs ON ts.restaurant_id = rs.id
            LEFT JOIN accommodation_services acs ON ts.accommodation_id = acs.id
            LEFT JOIN transportation_services trs ON ts.transportation_id = trs.id
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
                created_by, is_active, is_published
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data['name'], data['duration'], data['description'],
            data['destination_city_id'], data['departure_city_id'],
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
        
        # Get transportation (removed is_verified requirement)
        if not service_type or service_type == 'transportation':
            cur.execute("""
                SELECT id, license_plate, vehicle_type, brand, max_passengers, base_price, features
                FROM transportation_services
                WHERE is_active = TRUE
                ORDER BY license_plate
            """, ())
            
            result['transportation'] = []
            for row in cur.fetchall():
                result['transportation'].append({
                    'id': row[0],
                    'license_plate': row[1],
                    'vehicle_type': row[2],
                    'brand': row[3],
                    'max_passengers': row[4],
                    'base_price': float(row[5]) if row[5] else 0,
                    'features': row[6] if row[6] else []
                })
            
            print(f"Found {len(result['transportation'])} transportation services")
        
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
    """Calculate total tour price based on selected services."""
    data = request.get_json()
    
    if 'services' not in data:
        return jsonify({"error": "services data required"}), 400
    
    total_price = 0
    breakdown = {
        'restaurants': 0,
        'accommodation': 0,
        'transportation': 0
    }
    
    services = data['services']
    
    # Calculate restaurant costs
    if 'restaurants' in services:
        for restaurant in services['restaurants']:
            price = get_service_price('restaurant', restaurant['service_id'])
            breakdown['restaurants'] += price
    
    # Calculate accommodation cost
    if 'accommodation' in services and services['accommodation']:
        price = get_service_price('accommodation', services['accommodation']['service_id'])
        breakdown['accommodation'] = price
    
    # Calculate transportation cost
    if 'transportation' in services and services['transportation']:
        price = get_service_price('transportation', services['transportation']['service_id'])
        breakdown['transportation'] = price
    
    total_price = sum(breakdown.values())
    
    return jsonify({
        'total_price': total_price,
        'breakdown': breakdown,
        'currency': 'VND'
    }), 200
