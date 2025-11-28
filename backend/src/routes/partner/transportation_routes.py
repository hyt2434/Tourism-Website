"""
API routes for partner transportation service management.

Partners can manage their transportation services including:
- Creating, updating, deleting vehicles
- Managing routes and pricing
- Uploading images
- Managing availability
"""

from flask import Blueprint, request, jsonify
from src.database import get_connection
from datetime import datetime, timedelta

transportation_bp = Blueprint('transportation_services', __name__, url_prefix='/api/partner/transportation')


# =====================================================================
# TRANSPORTATION SERVICES ENDPOINTS
# =====================================================================

@transportation_bp.route('/', methods=['GET'])
def get_transportation_services():
    """Get all transportation services for the current partner"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                id, license_plate, description, vehicle_type, brand,
                max_passengers, features, default_pickup_locations,
                default_dropoff_locations, base_price, holiday_price,
                phone, is_active, is_verified,
                created_at, updated_at, departure_city_id, destination_city_id
            FROM transportation_services
            WHERE partner_id = %s
            ORDER BY created_at DESC
        """, (partner_id,))
        
        rows = cur.fetchall()
        
        services = []
        for row in rows:
            # Get primary image
            cur.execute("""
                SELECT image_url FROM service_images
                WHERE service_type = 'transportation' AND service_id = %s AND is_primary = TRUE
                LIMIT 1
            """, (row[0],))
            image_row = cur.fetchone()
            
            services.append({
                'id': row[0],
                'licensePlate': row[1],
                'description': row[2],
                'vehicleType': row[3],
                'brand': row[4],
                'maxPassengers': row[5],
                'features': row[6] if row[6] else [],
                'defaultPickupLocations': row[7] if row[7] else [],
                'defaultDropoffLocations': row[8] if row[8] else [],
                'basePrice': float(row[9]) if row[9] else None,
                'holidayPrice': float(row[10]) if row[10] else None,
                'phone': row[11],
                'isActive': row[12],
                'isVerified': row[13],
                'primaryImage': image_row[0] if image_row else None,
                'createdAt': row[14].isoformat() if row[14] else None,
                'updatedAt': row[15].isoformat() if row[15] else None,
                'departureCityId': row[16],
                'destinationCityId': row[17]
            })
        
        cur.close()
        conn.close()
        
        return jsonify(services), 200
        
    except Exception as e:
        print(f"Error fetching transportation services: {e}")
        return jsonify({'error': str(e)}), 500


@transportation_bp.route('/', methods=['POST'])
def create_transportation_service():
    """Create a new transportation service"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['licensePlate', 'vehicleType', 'maxPassengers', 'basePrice']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Insert transportation service
        cur.execute("""
            INSERT INTO transportation_services (
                partner_id, license_plate, description, vehicle_type, brand,
                max_passengers, features, default_pickup_locations,
                default_dropoff_locations, base_price, holiday_price, phone,
                departure_city_id, destination_city_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            partner_id,
            data['licensePlate'],
            data.get('description'),
            data['vehicleType'],
            data.get('brand'),
            data['maxPassengers'],
            data.get('features', []),
            data.get('defaultPickupLocations', []),
            data.get('defaultDropoffLocations', []),
            data['basePrice'],
            data.get('holidayPrice', 0),
            data.get('phone'),
            data.get('departureCityId'),
            data.get('destinationCityId')
        ))
        
        service_id = cur.fetchone()[0]
        
        # Insert images if provided
        if data.get('images'):
            for idx, image_url in enumerate(data['images']):
                cur.execute("""
                    INSERT INTO service_images (service_type, service_id, image_url, is_primary, display_order)
                    VALUES ('transportation', %s, %s, %s, %s)
                """, (service_id, image_url, idx == 0, idx))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message': 'Transportation service created successfully',
            'id': service_id
        }), 201
        
    except Exception as e:
        print(f"Error creating transportation service: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


@transportation_bp.route('/<int:service_id>', methods=['GET'])
def get_transportation_service(service_id):
    """Get a specific transportation service with all details"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                id, partner_id, license_plate, description, vehicle_type, brand,
                max_passengers, features, default_pickup_locations,
                default_dropoff_locations, base_price, holiday_price,
                phone, is_active, is_verified, created_at, updated_at
            FROM transportation_services
            WHERE id = %s
        """, (service_id,))
        
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return jsonify({'error': 'Transportation service not found'}), 404
        
        # Check ownership
        if partner_id and str(row[1]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get images
        cur.execute("""
            SELECT id, image_url, caption, is_primary, display_order
            FROM service_images
            WHERE service_type = 'transportation' AND service_id = %s
            ORDER BY display_order
        """, (service_id,))
        
        images = []
        for img_row in cur.fetchall():
            images.append({
                'id': img_row[0],
                'url': img_row[1],
                'caption': img_row[2],
                'isPrimary': img_row[3],
                'displayOrder': img_row[4]
            })
        
        service = {
            'id': row[0],
            'partnerId': row[1],
            'licensePlate': row[2],
            'description': row[3],
            'vehicleType': row[4],
            'brand': row[5],
            'maxPassengers': row[6],
            'features': row[7] if row[7] else [],
            'defaultPickupLocations': row[8] if row[8] else [],
            'defaultDropoffLocations': row[9] if row[9] else [],
            'basePrice': float(row[10]) if row[10] else None,
            'holidayPrice': float(row[11]) if row[11] else None,
            'phone': row[12],
            'isActive': row[13],
            'isVerified': row[14],
            'images': images,
            'createdAt': row[15].isoformat() if row[15] else None,
            'updatedAt': row[16].isoformat() if row[16] else None
        }
        
        cur.close()
        conn.close()
        
        return jsonify(service), 200
        
    except Exception as e:
        print(f"Error fetching transportation service: {e}")
        return jsonify({'error': str(e)}), 500


@transportation_bp.route('/<int:service_id>', methods=['PUT'])
def update_transportation_service(service_id):
    """Update a transportation service"""
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
        cur.execute("SELECT partner_id FROM transportation_services WHERE id = %s", (service_id,))
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return jsonify({'error': 'Transportation service not found'}), 404
        
        if str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Build update query dynamically to only update provided fields
        update_fields = []
        params = []
        
        if 'licensePlate' in data and data['licensePlate']:
            update_fields.append('license_plate = %s')
            params.append(data['licensePlate'])
        if 'description' in data:
            update_fields.append('description = %s')
            params.append(data['description'])
        if 'vehicleType' in data and data['vehicleType']:
            update_fields.append('vehicle_type = %s')
            params.append(data['vehicleType'])
        if 'brand' in data:
            update_fields.append('brand = %s')
            params.append(data['brand'])
        if 'maxPassengers' in data and data['maxPassengers']:
            update_fields.append('max_passengers = %s')
            params.append(data['maxPassengers'])
        if 'features' in data:
            update_fields.append('features = %s')
            params.append(data['features'])
        if 'defaultPickupLocations' in data:
            update_fields.append('default_pickup_locations = %s')
            params.append(data['defaultPickupLocations'])
        if 'defaultDropoffLocations' in data:
            update_fields.append('default_dropoff_locations = %s')
            params.append(data['defaultDropoffLocations'])
        if 'basePrice' in data and data['basePrice'] is not None:
            update_fields.append('base_price = %s')
            params.append(data['basePrice'])
        if 'holidayPrice' in data and data['holidayPrice'] is not None:
            update_fields.append('holiday_price = %s')
            params.append(data['holidayPrice'])
        if 'phone' in data:
            update_fields.append('phone = %s')
            params.append(data['phone'])
        if 'departureCityId' in data:
            update_fields.append('departure_city_id = %s')
            params.append(data['departureCityId'])
        if 'destinationCityId' in data:
            update_fields.append('destination_city_id = %s')
            params.append(data['destinationCityId'])
        
        if update_fields:
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            params.append(service_id)
            
            query = f"UPDATE transportation_services SET {', '.join(update_fields)} WHERE id = %s"
            cur.execute(query, params)
        
        # Handle image updates if provided
        if 'images' in data and data['images']:
            # Delete existing images
            cur.execute("""
                DELETE FROM service_images 
                WHERE service_type = 'transportation' AND service_id = %s
            """, (service_id,))
            
            # Insert new images
            for idx, image_url in enumerate(data['images']):
                cur.execute("""
                    INSERT INTO service_images (service_type, service_id, image_url, is_primary, display_order)
                    VALUES ('transportation', %s, %s, %s, %s)
                """, (service_id, image_url, idx == 0, idx))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Transportation service updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating transportation service: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


@transportation_bp.route('/<int:service_id>', methods=['DELETE'])
def delete_transportation_service(service_id):
    """Delete a transportation service"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Verify ownership
        cur.execute("SELECT partner_id FROM transportation_services WHERE id = %s", (service_id,))
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return jsonify({'error': 'Transportation service not found'}), 404
        
        if str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete service (cascade handles images)
        cur.execute("DELETE FROM transportation_services WHERE id = %s", (service_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Transportation service deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting transportation service: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


# =====================================================================
# AVAILABILITY ENDPOINTS
# =====================================================================

@transportation_bp.route('/<int:service_id>/availability', methods=['GET'])
def get_availability(service_id):
    """Get availability calendar for a transportation service"""
    try:
        # Get date range from query params
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({'error': 'start_date and end_date are required'}), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                date, available_quantity, booked_quantity, is_blocked, block_reason
            FROM service_availability
            WHERE service_type = 'transportation' 
            AND service_id = %s
            AND date BETWEEN %s AND %s
            ORDER BY date
        """, (service_id, start_date, end_date))
        
        rows = cur.fetchall()
        
        availability = []
        for row in rows:
            availability.append({
                'date': row[0].isoformat() if row[0] else None,
                'availableQuantity': row[1],
                'bookedQuantity': row[2],
                'isBlocked': row[3],
                'blockReason': row[4]
            })
        
        cur.close()
        conn.close()
        
        return jsonify(availability), 200
        
    except Exception as e:
        print(f"Error fetching availability: {e}")
        return jsonify({'error': str(e)}), 500


@transportation_bp.route('/<int:service_id>/availability', methods=['POST'])
def set_availability(service_id):
    """Set availability for specific dates"""
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
        cur.execute("SELECT partner_id FROM transportation_services WHERE id = %s", (service_id,))
        row = cur.fetchone()
        
        if not row or str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Upsert availability
        cur.execute("""
            INSERT INTO service_availability (
                service_type, service_id, date, available_quantity, is_blocked, block_reason
            ) VALUES ('transportation', %s, %s, %s, %s, %s)
            ON CONFLICT (service_type, service_id, date)
            DO UPDATE SET
                available_quantity = EXCLUDED.available_quantity,
                is_blocked = EXCLUDED.is_blocked,
                block_reason = EXCLUDED.block_reason,
                updated_at = CURRENT_TIMESTAMP
        """, (
            service_id,
            data['date'],
            data.get('availableQuantity', 1),
            data.get('isBlocked', False),
            data.get('blockReason')
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Availability updated successfully'}), 200
        
    except Exception as e:
        print(f"Error setting availability: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
