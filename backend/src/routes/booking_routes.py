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
        tour_schedule_id = data.get('tour_schedule_id')  # NEW: Schedule reference
        user_id = data.get('user_id')  # Optional, can be null for guest bookings
        full_name = data.get('full_name')
        email = data.get('email')
        phone = data.get('phone')
        departure_date = data.get('departure_date')
        return_date = data.get('return_date')
        number_of_guests = data.get('number_of_guests', 1)
        number_of_adults = data.get('number_of_adults', 1)  # NEW
        number_of_children = data.get('number_of_children', 0)  # NEW
        total_price = data.get('total_price')
        payment_method = data.get('payment_method')  # 'card' or 'momo'
        payment_intent_id = data.get('payment_intent_id')
        notes = data.get('notes', '')
        promotion_code = data.get('promotion_code')  # Optional promotion code
        
        # Validate required fields
        if not all([tour_id, tour_schedule_id, full_name, email, phone, departure_date, total_price, payment_method]):
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
            
            # Validate schedule and check availability
            cur.execute("""
                SELECT slots_available, max_slots, slots_booked
                FROM tour_schedules
                WHERE id = %s AND tour_id = %s AND is_active = TRUE
            """, (tour_schedule_id, tour_id))
            
            schedule = cur.fetchone()
            if not schedule:
                return jsonify({
                    'success': False,
                    'message': 'Invalid or inactive tour schedule'
                }), 400
            
            slots_available = schedule[0]
            
            # Calculate total slots needed (2 children = 1 adult slot)
            slots_needed = number_of_adults + (number_of_children // 2) + (number_of_children % 2)
            
            if slots_needed > slots_available:
                return jsonify({
                    'success': False,
                    'message': f'Not enough slots available. Requested: {slots_needed}, Available: {slots_available}'
                }), 400
            
            # Insert booking
            cur.execute("""
                INSERT INTO bookings (
                    tour_id, tour_schedule_id, user_id, full_name, email, phone,
                    departure_date, return_date, number_of_guests,
                    number_of_adults, number_of_children,
                    total_price, payment_method, payment_intent_id,
                    notes, promotion_code, status, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                tour_id,
                tour_schedule_id,
                user_id,
                full_name,
                email,
                phone,
                departure_date,
                return_date,
                number_of_guests,
                number_of_adults,
                number_of_children,
                total_price,
                payment_method,
                payment_intent_id,
                notes,
                promotion_code,
                'confirmed',  # Status: confirmed, cancelled, completed
                datetime.now()
            ))
            
            booking_id = cur.fetchone()[0]
            
            # Update schedule slots
            cur.execute("""
                UPDATE tour_schedules
                SET slots_booked = slots_booked + %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (slots_needed, tour_schedule_id))
            
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

@booking_routes.route('/admin/all', methods=['GET'])
def get_all_bookings():
    """Get all bookings for admin dashboard with revenue calculations"""
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
                ORDER BY b.created_at DESC
            """)
            
            rows = cur.fetchall()
            bookings = []
            total_revenue = 0
            
            for row in rows:
                total_price = float(row[9]) if row[9] else 0
                # Platform revenue is 10% service fee (total_price already includes 10% fee)
                # If base = X, then total = X + 0.1X = 1.1X
                # Service fee = 0.1X = total / 1.1 * 0.1 = total * 0.1 / 1.1
                service_fee = total_price * 0.1 / 1.1
                # Partner pool = total_price - service_fee
                partner_pool = total_price - service_fee
                
                total_revenue += service_fee
                
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
                    'total_price': total_price,
                    'service_fee': service_fee,
                    'partner_pool': partner_pool,
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
                'bookings': bookings,
                'total_revenue': total_revenue,
                'total_bookings': len(bookings)
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
    """Get all bookings for tours associated with a partner with proper revenue calculations after 10% service fee"""
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
            
            # Build query based on partner type - calculate partner's share from 90% partner pool
            if partner_type == 'accommodation':
                # Get bookings with revenue calculation for accommodation partner
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
                        ), 0) as partner_service_cost,
                        COALESCE((
                            SELECT SUM(ar.base_price)
                            FROM tour_selected_rooms tsr
                            INNER JOIN accommodation_rooms ar ON tsr.room_id = ar.id
                            WHERE tsr.tour_id = t.id
                        ), 0) as total_accommodation_cost,
                        COALESCE((
                            SELECT SUM(ts2.service_cost)
                            FROM tour_services ts2
                            WHERE ts2.tour_id = t.id AND ts2.restaurant_id IS NOT NULL
                        ), 0) as total_restaurant_cost,
                        COALESCE((
                            SELECT SUM(ts2.service_cost)
                            FROM tour_services ts2
                            WHERE ts2.tour_id = t.id AND ts2.transportation_id IS NOT NULL
                        ), 0) as total_transportation_cost
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
                # Get bookings with revenue calculation for restaurant partner
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
                        ), 0) as partner_service_cost,
                        COALESCE((
                            SELECT SUM(ar.base_price)
                            FROM tour_selected_rooms tsr
                            INNER JOIN accommodation_rooms ar ON tsr.room_id = ar.id
                            WHERE tsr.tour_id = t.id
                        ), 0) as total_accommodation_cost,
                        COALESCE((
                            SELECT SUM(ts2.service_cost)
                            FROM tour_services ts2
                            WHERE ts2.tour_id = t.id AND ts2.restaurant_id IS NOT NULL
                        ), 0) as total_restaurant_cost,
                        COALESCE((
                            SELECT SUM(ts2.service_cost)
                            FROM tour_services ts2
                            WHERE ts2.tour_id = t.id AND ts2.transportation_id IS NOT NULL
                        ), 0) as total_transportation_cost
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
                # Get bookings with revenue calculation for transportation partner
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
                        ), 0) as partner_service_cost,
                        COALESCE((
                            SELECT SUM(ar.base_price)
                            FROM tour_selected_rooms tsr
                            INNER JOIN accommodation_rooms ar ON tsr.room_id = ar.id
                            WHERE tsr.tour_id = t.id
                        ), 0) as total_accommodation_cost,
                        COALESCE((
                            SELECT SUM(ts2.service_cost)
                            FROM tour_services ts2
                            WHERE ts2.tour_id = t.id AND ts2.restaurant_id IS NOT NULL
                        ), 0) as total_restaurant_cost,
                        COALESCE((
                            SELECT SUM(ts2.service_cost)
                            FROM tour_services ts2
                            WHERE ts2.tour_id = t.id AND ts2.transportation_id IS NOT NULL
                        ), 0) as total_transportation_cost
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
            cur.execute(query, (partner_id, partner_id))
            rows = cur.fetchall()
            bookings = []
            
            for row in rows:
                total_price = float(row[9]) if row[9] else 0
                partner_service_cost = float(row[21]) if row[21] else 0
                total_accommodation_cost = float(row[22]) if row[22] else 0
                total_restaurant_cost = float(row[23]) if row[23] else 0
                total_transportation_cost = float(row[24]) if row[24] else 0
                number_of_guests = row[8] if row[8] else 1
                tour_duration = row[17]  # e.g., "2" for 2 days
                
                # Calculate revenue
                # Service fee = total × 0.1 / 1.1 (extract 10% from total that already includes it)
                service_fee = total_price * 0.1 / 1.1
                # Partner pool = total_price - service_fee (90% goes to partners)
                partner_pool = total_price - service_fee
                
                # For accommodation partners, calculate based on ACTUAL room bookings
                if partner_type == 'accommodation' and partner_service_cost > 0:
                    # Parse duration to get nights
                    import re
                    days_match = re.search(r'(\d+)', str(tour_duration)) if tour_duration else None
                    if days_match:
                        days = int(days_match.group(1))
                        nights = days - 1
                    else:
                        nights = 1
                    
                    # Calculate rooms booked (guests / 2, rounded up)
                    rooms_booked = (number_of_guests + 1) // 2
                    
                    # Get average room price for this partner's rooms in the tour
                    # partner_service_cost is SUM of all room base_prices, so divide by number of rooms
                    cur.execute("""
                        SELECT COUNT(*) 
                        FROM tour_selected_rooms tsr
                        INNER JOIN accommodation_rooms ar ON tsr.room_id = ar.id
                        INNER JOIN accommodation_services acs ON ar.accommodation_id = acs.id
                        WHERE tsr.tour_id = %s AND acs.partner_id = %s
                    """, (row[1], partner_id))
                    room_count = cur.fetchone()[0] or 1
                    
                    # Average room price
                    avg_room_price = partner_service_cost / room_count if room_count > 0 else partner_service_cost
                    
                    # Accommodation revenue = avg_room_price × rooms_booked × nights
                    service_revenue = avg_room_price * rooms_booked * nights
                    
                elif partner_type == 'restaurant' and partner_service_cost > 0:
                    # Restaurant revenue = service_cost_per_person × number_of_guests
                    # partner_service_cost is SUM of all meal service_costs (per person)
                    # So total revenue = partner_service_cost × number_of_guests
                    service_revenue = partner_service_cost * number_of_guests
                    
                elif partner_type == 'transportation' and partner_service_cost > 0:
                    # Transportation revenue = service_cost_per_person × number_of_guests
                    # partner_service_cost is SUM of all transport service_costs (per person)
                    # So total revenue = partner_service_cost × number_of_guests
                    service_revenue = partner_service_cost * number_of_guests
                else:
                    # Fallback
                    service_revenue = 0
                
                bookings.append({
                    'id': row[0],
                    'tour_id': row[1],
                    'user_id': row[2],
                    'full_name': row[3],
                    'email': row[4],
                    'phone': row[5],
                    'departure_date': row[6].isoformat() if row[6] else None,
                    'return_date': row[7].isoformat() if row[7] else None,
                    'number_of_guests': number_of_guests,
                    'total_price': total_price,
                    'payment_method': row[10],
                    'payment_intent_id': row[11],
                    'notes': row[12],
                    'status': row[13],
                    'created_at': row[14].isoformat() if row[14] else None,
                    'promotion_code': row[15],
                    'tour_name': row[16],
                    'tour_duration': tour_duration,
                    'destination_city': row[19] if row[19] else None,
                    'tour_image': row[20],
                    'service_revenue': service_revenue,  # Partner's actual revenue based on bookings
                    'partner_service_cost': partner_service_cost,
                    'partner_pool': partner_pool
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

