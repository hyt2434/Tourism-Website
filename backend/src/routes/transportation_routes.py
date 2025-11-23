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
                id, name, description, vehicle_type, brand, model, year,
                license_plate, color, max_passengers, luggage_capacity,
                features, accessibility_features, default_pickup_locations,
                default_dropoff_locations, service_areas, base_price,
                price_per_km, price_per_hour, minimum_fare, currency,
                phone, driver_name, is_active, is_verified,
                created_at, updated_at
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
                'name': row[1],
                'description': row[2],
                'vehicleType': row[3],
                'brand': row[4],
                'model': row[5],
                'year': row[6],
                'licensePlate': row[7],
                'color': row[8],
                'maxPassengers': row[9],
                'luggageCapacity': row[10],
                'features': row[11] if row[11] else [],
                'accessibilityFeatures': row[12] if row[12] else [],
                'defaultPickupLocations': row[13] if row[13] else [],
                'defaultDropoffLocations': row[14] if row[14] else [],
                'serviceAreas': row[15] if row[15] else [],
                'basePrice': float(row[16]) if row[16] else None,
                'pricePerKm': float(row[17]) if row[17] else None,
                'pricePerHour': float(row[18]) if row[18] else None,
                'minimumFare': float(row[19]) if row[19] else None,
                'currency': row[20],
                'phone': row[21],
                'driverName': row[22],
                'isActive': row[23],
                'isVerified': row[24],
                'primaryImage': image_row[0] if image_row else None,
                'createdAt': row[25].isoformat() if row[25] else None,
                'updatedAt': row[26].isoformat() if row[26] else None
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
        required_fields = ['name', 'vehicleType', 'maxPassengers', 'basePrice']
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
                partner_id, name, description, vehicle_type, brand, model, year,
                license_plate, color, max_passengers, luggage_capacity,
                features, accessibility_features, default_pickup_locations,
                default_dropoff_locations, service_areas, base_price,
                price_per_km, price_per_hour, minimum_fare, currency,
                advance_booking_hours, cancellation_hours, max_trip_duration,
                operating_hours, phone, driver_name, driver_phone,
                driver_license, cancellation_policy, terms_and_conditions
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            partner_id,
            data['name'],
            data.get('description'),
            data['vehicleType'],
            data.get('brand'),
            data.get('model'),
            data.get('year'),
            data.get('licensePlate'),
            data.get('color'),
            data['maxPassengers'],
            data.get('luggageCapacity'),
            data.get('features', []),
            data.get('accessibilityFeatures', []),
            data.get('defaultPickupLocations', []),
            data.get('defaultDropoffLocations', []),
            data.get('serviceAreas', []),
            data['basePrice'],
            data.get('pricePerKm'),
            data.get('pricePerHour'),
            data.get('minimumFare'),
            data.get('currency', 'VND'),
            data.get('advanceBookingHours', 24),
            data.get('cancellationHours', 12),
            data.get('maxTripDuration'),
            data.get('operatingHours'),
            data.get('phone'),
            data.get('driverName'),
            data.get('driverPhone'),
            data.get('driverLicense'),
            data.get('cancellationPolicy'),
            data.get('termsAndConditions')
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
                id, partner_id, name, description, vehicle_type, brand, model, year,
                license_plate, color, max_passengers, luggage_capacity,
                features, accessibility_features, default_pickup_locations,
                default_dropoff_locations, service_areas, base_price,
                price_per_km, price_per_hour, minimum_fare, currency,
                advance_booking_hours, cancellation_hours, max_trip_duration,
                operating_hours, phone, driver_name, driver_phone,
                driver_license, cancellation_policy, terms_and_conditions,
                is_active, is_verified, created_at, updated_at
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
            'name': row[2],
            'description': row[3],
            'vehicleType': row[4],
            'brand': row[5],
            'model': row[6],
            'year': row[7],
            'licensePlate': row[8],
            'color': row[9],
            'maxPassengers': row[10],
            'luggageCapacity': row[11],
            'features': row[12] if row[12] else [],
            'accessibilityFeatures': row[13] if row[13] else [],
            'defaultPickupLocations': row[14] if row[14] else [],
            'defaultDropoffLocations': row[15] if row[15] else [],
            'serviceAreas': row[16] if row[16] else [],
            'basePrice': float(row[17]) if row[17] else None,
            'pricePerKm': float(row[18]) if row[18] else None,
            'pricePerHour': float(row[19]) if row[19] else None,
            'minimumFare': float(row[20]) if row[20] else None,
            'currency': row[21],
            'advanceBookingHours': row[22],
            'cancellationHours': row[23],
            'maxTripDuration': row[24],
            'operatingHours': row[25],
            'phone': row[26],
            'driverName': row[27],
            'driverPhone': row[28],
            'driverLicense': row[29],
            'cancellationPolicy': row[30],
            'termsAndConditions': row[31],
            'isActive': row[32],
            'isVerified': row[33],
            'images': images,
            'createdAt': row[34].isoformat() if row[34] else None,
            'updatedAt': row[35].isoformat() if row[35] else None
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
        
        # Update transportation service
        cur.execute("""
            UPDATE transportation_services SET
                name = COALESCE(%s, name),
                description = COALESCE(%s, description),
                vehicle_type = COALESCE(%s, vehicle_type),
                brand = COALESCE(%s, brand),
                model = COALESCE(%s, model),
                max_passengers = COALESCE(%s, max_passengers),
                luggage_capacity = COALESCE(%s, luggage_capacity),
                features = COALESCE(%s, features),
                default_pickup_locations = COALESCE(%s, default_pickup_locations),
                default_dropoff_locations = COALESCE(%s, default_dropoff_locations),
                service_areas = COALESCE(%s, service_areas),
                base_price = COALESCE(%s, base_price),
                price_per_km = COALESCE(%s, price_per_km),
                price_per_hour = COALESCE(%s, price_per_hour),
                phone = COALESCE(%s, phone),
                driver_name = COALESCE(%s, driver_name),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (
            data.get('name'),
            data.get('description'),
            data.get('vehicleType'),
            data.get('brand'),
            data.get('model'),
            data.get('maxPassengers'),
            data.get('luggageCapacity'),
            data.get('features'),
            data.get('defaultPickupLocations'),
            data.get('defaultDropoffLocations'),
            data.get('serviceAreas'),
            data.get('basePrice'),
            data.get('pricePerKm'),
            data.get('pricePerHour'),
            data.get('phone'),
            data.get('driverName'),
            service_id
        ))
        
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
