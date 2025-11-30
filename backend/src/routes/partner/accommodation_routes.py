"""
API routes for partner accommodation service management.

Partners can manage their accommodation services including:
- Creating, updating, deleting accommodations
- Managing rooms for each accommodation
- Uploading images
- Managing availability
"""

from flask import Blueprint, request, jsonify
from config.database import get_connection
from datetime import datetime
import json

accommodation_bp = Blueprint('accommodation_services', __name__, url_prefix='/api/partner/accommodations')


# =====================================================================
# ACCOMMODATION SERVICES ENDPOINTS
# =====================================================================

@accommodation_bp.route('/cities', methods=['GET'])
def get_cities_for_accommodation():
    """Get all cities for accommodation dropdown"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        cur.execute("SELECT id, name, code, region FROM cities ORDER BY name")
        rows = cur.fetchall()
        
        cities = [{
            'id': row[0],
            'name': row[1],
            'code': row[2],
            'region': row[3]
        } for row in rows]
        
        cur.close()
        conn.close()
        
        return jsonify(cities), 200
    except Exception as e:
        print(f"Error fetching cities: {e}")
        return jsonify({'error': str(e)}), 500

@accommodation_bp.route('/', methods=['GET'])
def get_accommodations():
    """Get all accommodations for the current partner"""
    try:
        # TODO: Get partner_id from authentication
        partner_id = request.headers.get('X-User-ID')  # Temporary
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                id, name, description, star_rating, address, city_id,
                phone, email, website, amenities, check_in_time, check_out_time,
                min_price, max_price, currency, is_active, is_verified,
                created_at, updated_at
            FROM accommodation_services
            WHERE partner_id = %s
            ORDER BY created_at DESC
        """, (partner_id,))
        
        rows = cur.fetchall()
        
        accommodations = []
        for row in rows:
            # Get primary image
            cur.execute("""
                SELECT image_url FROM service_images
                WHERE service_type = 'accommodation' AND service_id = %s AND is_primary = TRUE
                LIMIT 1
            """, (row[0],))
            image_row = cur.fetchone()
            
            # Get room count
            cur.execute("""
                SELECT COUNT(*), SUM(total_rooms)
                FROM accommodation_rooms
                WHERE accommodation_id = %s
            """, (row[0],))
            room_stats = cur.fetchone()
            
            accommodations.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'starRating': row[3],
                'address': row[4],
                'cityId': row[5],
                'phone': row[6],
                'email': row[7],
                'website': row[8],
                'amenities': row[9] if row[9] else [],
                'checkInTime': str(row[10]) if row[10] else None,
                'checkOutTime': str(row[11]) if row[11] else None,
                'minPrice': float(row[12]) if row[12] else None,
                'maxPrice': float(row[13]) if row[13] else None,
                'currency': row[14],
                'isActive': row[15],
                'isVerified': row[16],
                'primaryImage': image_row[0] if image_row else None,
                'roomTypeCount': room_stats[0] if room_stats else 0,
                'totalRooms': int(room_stats[1]) if room_stats and room_stats[1] else 0,
                'createdAt': row[17].isoformat() if row[17] else None,
                'updatedAt': row[18].isoformat() if row[18] else None
            })
        
        cur.close()
        conn.close()
        
        return jsonify(accommodations), 200
        
    except Exception as e:
        print(f"Error fetching accommodations: {e}")
        return jsonify({'error': str(e)}), 500


@accommodation_bp.route('/', methods=['POST'])
def create_accommodation():
    """Create a new accommodation"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'address']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Insert accommodation
        cur.execute("""
            INSERT INTO accommodation_services (
                partner_id, name, description, star_rating, address, city_id,
                latitude, longitude, phone, email, website, amenities,
                check_in_time, check_out_time, min_price, max_price, currency,
                cancellation_policy, house_rules
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            partner_id,
            data['name'],
            data.get('description'),
            data.get('starRating'),
            data['address'],
            data.get('cityId'),
            data.get('latitude'),
            data.get('longitude'),
            data.get('phone'),
            data.get('email'),
            data.get('website'),
            data.get('amenities', []),
            data.get('checkInTime', '14:00:00'),
            data.get('checkOutTime', '12:00:00'),
            data.get('minPrice'),
            data.get('maxPrice'),
            data.get('currency', 'VND'),
            data.get('cancellationPolicy'),
            data.get('houseRules')
        ))
        
        accommodation_id = cur.fetchone()[0]
        
        # Insert images if provided
        if data.get('images'):
            for idx, image_url in enumerate(data['images']):
                cur.execute("""
                    INSERT INTO service_images (service_type, service_id, image_url, is_primary, display_order)
                    VALUES ('accommodation', %s, %s, %s, %s)
                """, (accommodation_id, image_url, idx == 0, idx))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message': 'Accommodation created successfully',
            'id': accommodation_id
        }), 201
        
    except Exception as e:
        print(f"Error creating accommodation: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


@accommodation_bp.route('/<int:accommodation_id>', methods=['GET'])
def get_accommodation(accommodation_id):
    """Get a specific accommodation with all details"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Get accommodation details
        cur.execute("""
            SELECT 
                id, partner_id, name, description, star_rating, address, city_id,
                latitude, longitude, phone, email, website, amenities,
                check_in_time, check_out_time, min_price, max_price, currency,
                cancellation_policy, house_rules, is_active, is_verified,
                created_at, updated_at
            FROM accommodation_services
            WHERE id = %s
        """, (accommodation_id,))
        
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return jsonify({'error': 'Accommodation not found'}), 404
        
        # Check if partner owns this accommodation
        if partner_id and str(row[1]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get all images
        cur.execute("""
            SELECT id, image_url, caption, is_primary, display_order
            FROM service_images
            WHERE service_type = 'accommodation' AND service_id = %s
            ORDER BY display_order
        """, (accommodation_id,))
        
        images = []
        for img_row in cur.fetchall():
            images.append({
                'id': img_row[0],
                'url': img_row[1],
                'caption': img_row[2],
                'isPrimary': img_row[3],
                'displayOrder': img_row[4]
            })
        
        accommodation = {
            'id': row[0],
            'partnerId': row[1],
            'name': row[2],
            'description': row[3],
            'starRating': row[4],
            'address': row[5],
            'cityId': row[6],
            'latitude': float(row[7]) if row[7] else None,
            'longitude': float(row[8]) if row[8] else None,
            'phone': row[9],
            'email': row[10],
            'website': row[11],
            'amenities': row[12] if row[12] else [],
            'checkInTime': str(row[13]) if row[13] else None,
            'checkOutTime': str(row[14]) if row[14] else None,
            'minPrice': float(row[15]) if row[15] else None,
            'maxPrice': float(row[16]) if row[16] else None,
            'currency': row[17],
            'cancellationPolicy': row[18],
            'houseRules': row[19],
            'isActive': row[20],
            'isVerified': row[21],
            'images': images,
            'createdAt': row[22].isoformat() if row[22] else None,
            'updatedAt': row[23].isoformat() if row[23] else None
        }
        
        cur.close()
        conn.close()
        
        return jsonify(accommodation), 200
        
    except Exception as e:
        print(f"Error fetching accommodation: {e}")
        return jsonify({'error': str(e)}), 500


@accommodation_bp.route('/<int:accommodation_id>', methods=['PUT'])
def update_accommodation(accommodation_id):
    """Update an accommodation"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Verify ownership
        cur.execute("SELECT partner_id FROM accommodation_services WHERE id = %s", (accommodation_id,))
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return jsonify({'error': 'Accommodation not found'}), 404
        
        if str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update accommodation
        cur.execute("""
            UPDATE accommodation_services SET
                name = COALESCE(%s, name),
                description = COALESCE(%s, description),
                star_rating = COALESCE(%s, star_rating),
                address = COALESCE(%s, address),
                city_id = COALESCE(%s, city_id),
                latitude = COALESCE(%s, latitude),
                longitude = COALESCE(%s, longitude),
                phone = COALESCE(%s, phone),
                email = COALESCE(%s, email),
                website = COALESCE(%s, website),
                amenities = COALESCE(%s, amenities),
                check_in_time = COALESCE(%s, check_in_time),
                check_out_time = COALESCE(%s, check_out_time),
                min_price = COALESCE(%s, min_price),
                max_price = COALESCE(%s, max_price),
                cancellation_policy = COALESCE(%s, cancellation_policy),
                house_rules = COALESCE(%s, house_rules),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (
            data.get('name'),
            data.get('description'),
            data.get('starRating'),
            data.get('address'),
            data.get('cityId'),
            data.get('latitude'),
            data.get('longitude'),
            data.get('phone'),
            data.get('email'),
            data.get('website'),
            data.get('amenities'),
            data.get('checkInTime'),
            data.get('checkOutTime'),
            data.get('minPrice'),
            data.get('maxPrice'),
            data.get('cancellationPolicy'),
            data.get('houseRules'),
            accommodation_id
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Accommodation updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating accommodation: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


@accommodation_bp.route('/<int:accommodation_id>', methods=['DELETE'])
def delete_accommodation(accommodation_id):
    """Delete an accommodation"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Verify ownership
        cur.execute("SELECT partner_id FROM accommodation_services WHERE id = %s", (accommodation_id,))
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return jsonify({'error': 'Accommodation not found'}), 404
        
        if str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete accommodation (cascade will handle rooms and images)
        cur.execute("DELETE FROM accommodation_services WHERE id = %s", (accommodation_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Accommodation deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting accommodation: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


# =====================================================================
# ACCOMMODATION ROOMS ENDPOINTS
# =====================================================================

@accommodation_bp.route('/<int:accommodation_id>/rooms', methods=['GET'])
def get_rooms(accommodation_id):
    """Get all rooms for an accommodation"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
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
        
        cur.close()
        conn.close()
        
        return jsonify(rooms), 200
        
    except Exception as e:
        print(f"Error fetching rooms: {e}")
        return jsonify({'error': str(e)}), 500


@accommodation_bp.route('/<int:accommodation_id>/rooms', methods=['POST'])
def create_room(accommodation_id):
    """Create a new room for an accommodation"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Verify ownership of accommodation
        cur.execute("SELECT partner_id FROM accommodation_services WHERE id = %s", (accommodation_id,))
        row = cur.fetchone()
        
        if not row or str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Insert room
        cur.execute("""
            INSERT INTO accommodation_rooms (
                accommodation_id, name, room_type, description,
                max_adults, max_children, total_rooms, room_size,
                bed_type, view_type, amenities, base_price,
                weekend_price, holiday_price, currency
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            accommodation_id,
            data['name'],
            data.get('roomType'),
            data.get('description'),
            data.get('maxAdults', 2),
            data.get('maxChildren', 1),
            data.get('totalRooms', 1),
            data.get('roomSize'),
            data.get('bedType'),
            data.get('viewType'),
            data.get('amenities', []),
            data['basePrice'],
            data.get('weekendPrice'),
            data.get('holidayPrice'),
            data.get('currency', 'VND')
        ))
        
        room_id = cur.fetchone()[0]
        
        # Insert room images if provided
        if data.get('images'):
            for idx, image_url in enumerate(data['images']):
                cur.execute("""
                    INSERT INTO service_images (service_type, service_id, image_url, display_order)
                    VALUES ('accommodation_room', %s, %s, %s)
                """, (room_id, image_url, idx))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message': 'Room created successfully',
            'id': room_id
        }), 201
        
    except Exception as e:
        print(f"Error creating room: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


@accommodation_bp.route('/<int:accommodation_id>/rooms/<int:room_id>', methods=['PUT'])
def update_room(accommodation_id, room_id):
    """Update a room"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Verify ownership of accommodation
        cur.execute("SELECT partner_id FROM accommodation_services WHERE id = %s", (accommodation_id,))
        row = cur.fetchone()
        
        if not row or str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update room
        cur.execute("""
            UPDATE accommodation_rooms SET
                name = %s,
                room_type = %s,
                description = %s,
                max_adults = %s,
                max_children = %s,
                total_rooms = %s,
                room_size = %s,
                bed_type = %s,
                view_type = %s,
                amenities = %s,
                base_price = %s,
                weekend_price = %s,
                holiday_price = %s,
                currency = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s AND accommodation_id = %s
        """, (
            data.get('name'),
            data.get('roomType'),
            data.get('description'),
            data.get('maxAdults', 2),
            data.get('maxChildren', 1),
            data.get('totalRooms', 1),
            data.get('roomSize'),
            data.get('bedType'),
            data.get('viewType'),
            data.get('amenities', []),
            data.get('basePrice'),
            data.get('weekendPrice'),
            data.get('holidayPrice'),
            data.get('currency', 'VND'),
            room_id,
            accommodation_id
        ))
        
        # Update images if provided
        if 'images' in data:
            # Delete existing images
            cur.execute("DELETE FROM service_images WHERE service_type = 'accommodation_room' AND service_id = %s", (room_id,))
            
            # Insert new images
            for idx, image_url in enumerate(data['images']):
                cur.execute("""
                    INSERT INTO service_images (service_type, service_id, image_url, display_order)
                    VALUES ('accommodation_room', %s, %s, %s)
                """, (room_id, image_url, idx))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Room updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating room: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


@accommodation_bp.route('/<int:accommodation_id>/rooms/<int:room_id>', methods=['DELETE'])
def delete_room(accommodation_id, room_id):
    """Delete a room"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Verify ownership
        cur.execute("SELECT partner_id FROM accommodation_services WHERE id = %s", (accommodation_id,))
        row = cur.fetchone()
        
        if not row or str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete room (cascade will handle images)
        cur.execute("DELETE FROM accommodation_rooms WHERE id = %s AND accommodation_id = %s", (room_id, accommodation_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Room deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting room: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500

