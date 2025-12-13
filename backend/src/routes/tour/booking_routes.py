from flask import Blueprint, request, jsonify
from config.database import get_connection
from datetime import datetime

booking_routes = Blueprint('bookings', __name__)

@booking_routes.route('/create', methods=['POST'])
def create_booking():
    """Create a new booking after successful payment"""
    try:
        data = request.get_json()
        
        # Extract booking data
        tour_id = data.get('tour_id')
        user_id = data.get('user_id')  # Optional, can be null for guest bookings
        full_name = data.get('full_name')
        email = data.get('email')
        phone = data.get('phone')
        departure_date = data.get('departure_date')
        return_date = data.get('return_date')
        number_of_guests = data.get('number_of_guests', 1)
        total_price = data.get('total_price')
        payment_method = data.get('payment_method')  # 'card' or 'momo'
        payment_intent_id = data.get('payment_intent_id')
        notes = data.get('notes', '')
        promotion_code = data.get('promotion_code')  # Optional promotion code
        
        # Validate required fields
        if not all([tour_id, full_name, email, phone, departure_date, total_price, payment_method]):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'message': 'Database connection failed'
            }), 500
        
        try:
            cur = conn.cursor()
            
            # Check if promotion_code column exists
            cur.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'bookings' AND column_name = 'promotion_code'
            """)
            has_promotion_code = cur.fetchone() is not None
            
            if has_promotion_code:
                # Insert booking with promotion_code
                cur.execute("""
                    INSERT INTO bookings (
                        tour_id, user_id, full_name, email, phone,
                        departure_date, return_date, number_of_guests,
                        total_price, payment_method, payment_intent_id,
                        notes, promotion_code, status, created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    tour_id,
                    user_id,
                    full_name,
                    email,
                    phone,
                    departure_date,
                    return_date,
                    number_of_guests,
                    total_price,
                    payment_method,
                    payment_intent_id,
                    notes,
                    promotion_code,
                    'confirmed',  # Status: confirmed, cancelled, completed
                    datetime.now()
                ))
            else:
                # Insert booking without promotion_code (backward compatibility)
                cur.execute("""
                    INSERT INTO bookings (
                        tour_id, user_id, full_name, email, phone,
                        departure_date, return_date, number_of_guests,
                        total_price, payment_method, payment_intent_id,
                        notes, status, created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    tour_id,
                    user_id,
                    full_name,
                    email,
                    phone,
                    departure_date,
                    return_date,
                    number_of_guests,
                    total_price,
                    payment_method,
                    payment_intent_id,
                    notes,
                    'confirmed',  # Status: confirmed, cancelled, completed
                    datetime.now()
                ))
            
            booking_id = cur.fetchone()[0]
            conn.commit()
            
            return jsonify({
                'success': True,
                'booking_id': booking_id,
                'message': 'Booking created successfully'
            }), 200
            
        except Exception as e:
            conn.rollback()
            return jsonify({
                'success': False,
                'message': f'Error creating booking: {str(e)}'
            }), 500
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@booking_routes.route('/user/<int:user_id>', methods=['GET'])
def get_user_bookings(user_id):
    """Get all bookings for a specific user"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'message': 'Database connection failed'
            }), 500
        
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT 
                    b.id, b.tour_id, b.user_id, b.full_name, b.email, b.phone,
                    b.departure_date, b.return_date, b.number_of_guests,
                    b.total_price, b.payment_method, b.payment_intent_id,
                    b.notes, b.status, b.created_at, b.promotion_code,
                    t.name as tour_name, t.duration, t.destination_city_id,
                    dc.name as destination_city_name,
                    (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_primary = TRUE LIMIT 1) as tour_image
                FROM bookings b
                LEFT JOIN tours_admin t ON b.tour_id = t.id
                LEFT JOIN cities dc ON t.destination_city_id = dc.id
                WHERE b.user_id = %s
                ORDER BY b.created_at DESC
            """, (user_id,))
            
            rows = cur.fetchall()
            bookings = []
            for row in rows:
                bookings.append({
                    'id': row[0],
                    'tour_id': row[1],
                    'user_id': row[2],
                    'full_name': row[3],
                    'email': row[4],
                    'phone': row[5],
                    'departure_date': row[6].isoformat() if row[6] else None,
                    'return_date': row[7].isoformat() if row[7] else None,
                    'number_of_guests': row[8],
                    'total_price': float(row[9]) if row[9] else 0,
                    'payment_method': row[10],
                    'payment_intent_id': row[11],
                    'notes': row[12],
                    'status': row[13],
                    'created_at': row[14].isoformat() if row[14] else None,
                    'promotion_code': row[15],
                    'tour_name': row[16],
                    'tour_duration': row[17],
                    'destination_city': row[19] if row[19] else None,
                    'tour_image': row[20]
                })
            
            return jsonify({
                'success': True,
                'bookings': bookings
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error fetching bookings: {str(e)}'
            }), 500
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@booking_routes.route('/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    """Get booking details by ID"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'message': 'Database connection failed'
            }), 500
        
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT 
                    b.id, b.tour_id, b.user_id, b.full_name, b.email, b.phone,
                    b.departure_date, b.return_date, b.number_of_guests,
                    b.total_price, b.payment_method, b.payment_intent_id,
                    b.notes, b.status, b.created_at, b.promotion_code,
                    t.name as tour_name, t.duration, t.description,
                    t.destination_city_id, dc.name as destination_city_name,
                    t.departure_city_id, dpc.name as departure_city_name,
                    (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_primary = TRUE LIMIT 1) as tour_image
                FROM bookings b
                LEFT JOIN tours_admin t ON b.tour_id = t.id
                LEFT JOIN cities dc ON t.destination_city_id = dc.id
                LEFT JOIN cities dpc ON t.departure_city_id = dpc.id
                WHERE b.id = %s
            """, (booking_id,))
            
            row = cur.fetchone()
            if not row:
                return jsonify({
                    'success': False,
                    'message': 'Booking not found'
                }), 404
            
            booking = {
                'id': row[0],
                'tour_id': row[1],
                'user_id': row[2],
                'full_name': row[3],
                'email': row[4],
                'phone': row[5],
                'departure_date': row[6].isoformat() if row[6] else None,
                'return_date': row[7].isoformat() if row[7] else None,
                'number_of_guests': row[8],
                'total_price': float(row[9]) if row[9] else 0,
                'payment_method': row[10],
                'payment_intent_id': row[11],
                'notes': row[12],
                'status': row[13],
                'created_at': row[14].isoformat() if row[14] else None,
                'promotion_code': row[15],
                'tour_name': row[16],
                'tour_duration': row[17],
                'tour_description': row[18],
                'destination_city': row[20] if row[20] else None,
                'departure_city': row[22] if row[22] else None,
                'tour_image': row[23]
            }
            
            return jsonify({
                'success': True,
                'booking': booking
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error fetching booking: {str(e)}'
            }), 500
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@booking_routes.route('/partner/<int:partner_id>', methods=['GET'])
def get_partner_bookings(partner_id):
    """Get all bookings for tours associated with a partner - only for their specific service type"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'message': 'Database connection failed'
            }), 500
        
        try:
            cur = conn.cursor()
            
            # First, get the partner's type
            cur.execute("SELECT partner_type FROM users WHERE id = %s AND role = 'partner'", (partner_id,))
            partner_row = cur.fetchone()
            if not partner_row:
                return jsonify({
                    'success': False,
                    'message': 'Partner not found'
                }), 404
            
            partner_type = partner_row[0]
            
            # Build query based on partner type - only show bookings for tours using their specific service type
            if partner_type == 'accommodation':
                # Only tours using this partner's accommodation services - sum all selected room prices from this partner
                query = """
                    SELECT DISTINCT
                        b.id, b.tour_id, b.user_id, b.full_name, b.email, b.phone,
                        b.departure_date, b.return_date, b.number_of_guests,
                        b.total_price, b.payment_method, b.payment_intent_id,
                        b.notes, b.status, b.created_at, b.promotion_code,
                        t.name as tour_name, t.duration, t.destination_city_id,
                        dc.name as destination_city_name,
                        (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_primary = TRUE LIMIT 1) as tour_image,
                        COALESCE((
                            SELECT SUM(ar.base_price)
                            FROM tour_selected_rooms tsr
                            INNER JOIN accommodation_rooms ar ON tsr.room_id = ar.id
                            INNER JOIN accommodation_services acs ON ar.accommodation_id = acs.id
                            WHERE tsr.tour_id = t.id AND acs.partner_id = %s
                        ), 0) as service_revenue
                    FROM bookings b
                    INNER JOIN tours_admin t ON b.tour_id = t.id
                    LEFT JOIN cities dc ON t.destination_city_id = dc.id
                    WHERE t.id IN (
                        SELECT DISTINCT tsr.tour_id
                        FROM tour_selected_rooms tsr
                        INNER JOIN accommodation_rooms ar ON tsr.room_id = ar.id
                        INNER JOIN accommodation_services acs ON ar.accommodation_id = acs.id
                        WHERE acs.partner_id = %s
                    )
                    ORDER BY b.created_at DESC
                """
            elif partner_type == 'restaurant':
                # Only tours using this partner's restaurant services
                query = """
                    SELECT DISTINCT
                        b.id, b.tour_id, b.user_id, b.full_name, b.email, b.phone,
                        b.departure_date, b.return_date, b.number_of_guests,
                        b.total_price, b.payment_method, b.payment_intent_id,
                        b.notes, b.status, b.created_at, b.promotion_code,
                        t.name as tour_name, t.duration, t.destination_city_id,
                        dc.name as destination_city_name,
                        (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_primary = TRUE LIMIT 1) as tour_image,
                        COALESCE((
                            SELECT SUM(ts2.service_cost)
                            FROM tour_services ts2
                            INNER JOIN restaurant_services rs2 ON ts2.restaurant_id = rs2.id
                            WHERE ts2.tour_id = t.id AND rs2.partner_id = %s
                        ), 0) as service_revenue
                    FROM bookings b
                    INNER JOIN tours_admin t ON b.tour_id = t.id
                    LEFT JOIN cities dc ON t.destination_city_id = dc.id
                    WHERE t.id IN (
                        SELECT DISTINCT ts.tour_id
                        FROM tour_services ts
                        INNER JOIN restaurant_services rs ON ts.restaurant_id = rs.id
                        WHERE rs.partner_id = %s
                    )
                    ORDER BY b.created_at DESC
                """
            elif partner_type == 'transportation':
                # Only tours using this partner's transportation services - sum all transportation services from this partner
                query = """
                    SELECT DISTINCT
                        b.id, b.tour_id, b.user_id, b.full_name, b.email, b.phone,
                        b.departure_date, b.return_date, b.number_of_guests,
                        b.total_price, b.payment_method, b.payment_intent_id,
                        b.notes, b.status, b.created_at, b.promotion_code,
                        t.name as tour_name, t.duration, t.destination_city_id,
                        dc.name as destination_city_name,
                        (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_primary = TRUE LIMIT 1) as tour_image,
                        COALESCE((
                            SELECT SUM(ts2.service_cost)
                            FROM tour_services ts2
                            INNER JOIN transportation_services trs2 ON ts2.transportation_id = trs2.id
                            WHERE ts2.tour_id = t.id AND ts2.service_type = 'transportation' AND trs2.partner_id = %s
                        ), 0) as service_revenue
                    FROM bookings b
                    INNER JOIN tours_admin t ON b.tour_id = t.id
                    LEFT JOIN cities dc ON t.destination_city_id = dc.id
                    WHERE t.id IN (
                        SELECT DISTINCT ts.tour_id
                        FROM tour_services ts
                        INNER JOIN transportation_services trs ON ts.transportation_id = trs.id
                        WHERE ts.service_type = 'transportation' AND trs.partner_id = %s
                    )
                    ORDER BY b.created_at DESC
                """
            else:
                # If partner type is not set or unknown, return empty
                return jsonify({
                    'success': True,
                    'bookings': []
                }), 200
            
            # Execute query with appropriate parameters
            # All queries now need partner_id twice (once in subquery for revenue, once in WHERE clause)
            cur.execute(query, (partner_id, partner_id))
            rows = cur.fetchall()
            bookings = []
            for row in rows:
                bookings.append({
                    'id': row[0],
                    'tour_id': row[1],
                    'user_id': row[2],
                    'full_name': row[3],
                    'email': row[4],
                    'phone': row[5],
                    'departure_date': row[6].isoformat() if row[6] else None,
                    'return_date': row[7].isoformat() if row[7] else None,
                    'number_of_guests': row[8],
                    'total_price': float(row[9]) if row[9] else 0,
                    'payment_method': row[10],
                    'payment_intent_id': row[11],
                    'notes': row[12],
                    'status': row[13],
                    'created_at': row[14].isoformat() if row[14] else None,
                    'promotion_code': row[15],
                    'tour_name': row[16],
                    'tour_duration': row[17],
                    'destination_city': row[19] if row[19] else None,
                    'tour_image': row[20],
                    'service_revenue': float(row[21]) if row[21] else 0  # Partner's portion of revenue
                })
            
            return jsonify({
                'success': True,
                'bookings': bookings
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error fetching bookings: {str(e)}'
            }), 500
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

