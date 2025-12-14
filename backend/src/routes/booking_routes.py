from flask import Blueprint, request, jsonify
from config.database import get_connection
from datetime import datetime
import json
import os
from src.services.email_service import (
    send_booking_confirmation_email,
    send_booking_cancellation_email,
    send_tour_schedule_cancelled_email,
    send_payment_success_email
)

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
        customizations = data.get('customizations', {})  # Room upgrades, meal selections, etc.
        
        # Debug: Print customizations
        print(f"DEBUG: Booking customizations received: {customizations}")
        if customizations:
            print(f"  - room_upgrade: {customizations.get('room_upgrade')}")
            print(f"  - selected_meals: {customizations.get('selected_meals')}")
            print(f"  - transport_options: {customizations.get('transport_options')}")
        
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
            # Exclude completed and cancelled schedules
            cur.execute("""
                SELECT slots_available, max_slots, slots_booked, status
                FROM tour_schedules
                WHERE id = %s AND tour_id = %s AND is_active = TRUE
                    AND status NOT IN ('completed', 'cancelled')
                    AND departure_datetime > NOW()
            """, (tour_schedule_id, tour_id))
            
            schedule = cur.fetchone()
            if not schedule:
                return jsonify({
                    'success': False,
                    'message': 'Invalid, inactive, completed, or cancelled tour schedule'
                }), 400
            
            slots_available = schedule[0]
            schedule_status = schedule[3] if len(schedule) > 3 else None
            
            # Double-check status
            if schedule_status in ('completed', 'cancelled'):
                return jsonify({
                    'success': False,
                    'message': 'This tour schedule is no longer available for booking'
                }), 400
            
            # Calculate total slots needed based on rooms
            # Each room holds 2 people, so slots = rooms × 2
            # Even 1 person needs 1 room = 2 slots
            rooms_needed = (number_of_guests + 1) // 2  # Ceiling division
            slots_needed = rooms_needed * 2
            
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
                    notes, promotion_code, status, customizations, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                json.dumps(customizations) if customizations else None,
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
            
            # ===== REVENUE VERIFICATION =====
            # Verify that partner revenues sum to 90% of total booking price
            # This ensures correct revenue distribution
            
            # Calculate expected partner pool (90%)
            service_fee = total_price * 0.1 / 1.1
            expected_partner_pool = total_price - service_fee
            
            # Get tour details for revenue calculation
            cur.execute("""
                SELECT duration FROM tours_admin WHERE id = %s
            """, (tour_id,))
            tour_result = cur.fetchone()
            tour_duration = tour_result[0] if tour_result else 2
            
            print(f"DEBUG: Tour duration from DB: {tour_duration} (type: {type(tour_duration)})")
            
            # Parse nights from duration
            import re
            nights = 1
            
            # Try to convert to int if it's a numeric string
            if isinstance(tour_duration, str) and tour_duration.isdigit():
                tour_duration = int(tour_duration)
            
            if isinstance(tour_duration, (int, float)):
                nights = int(tour_duration) - 1 if tour_duration > 1 else 1
            else:
                # Try regex for "X nights" or "X đêm" format
                night_match = re.search(r'(\d+)\s*(?:night|đêm)', str(tour_duration).lower())
                if night_match:
                    nights = int(night_match.group(1))
                else:
                    # Try regex for "X days" format and convert to nights
                    day_match = re.search(r'(\d+)\s*(?:day|ngày)', str(tour_duration).lower())
                    if day_match:
                        nights = int(day_match.group(1)) - 1
            
            print(f"DEBUG: Calculated nights: {nights}")
            
            # Calculate accommodation revenue
            accommodation_revenue = 0
            
            # Check if user selected a room upgrade in customizations
            room_upgrade_info = customizations.get('room_upgrade') if customizations else None
            default_room_info = customizations.get('default_room') if customizations else None
            
            if room_upgrade_info and room_upgrade_info.get('room_price'):
                # User selected a room upgrade - use that room's price
                print(f"  Using upgraded room: room_id = {room_upgrade_info.get('room_id')}")
                room_price = float(room_upgrade_info.get('room_price'))
                rooms_booked = (number_of_guests + 1) // 2
                accommodation_revenue = room_price * rooms_booked * nights
                print(f"  Upgraded room: {room_price:,.0f} VND/night × {rooms_booked} rooms × {nights} nights = {accommodation_revenue:,.0f} VND")
            elif default_room_info and default_room_info.get('room_price'):
                # User used default room - use that room's price from frontend
                print(f"  Using default room from booking data: room_id = {default_room_info.get('room_id')}")
                room_price = float(default_room_info.get('room_price'))
                rooms_booked = (number_of_guests + 1) // 2
                accommodation_revenue = room_price * rooms_booked * nights
                print(f"  Default room: {room_price:,.0f} VND/night × {rooms_booked} rooms × {nights} nights = {accommodation_revenue:,.0f} VND")
            else:
                # No custom room - use tour default
                # First try to get from tour_selected_rooms (detailed room bookings)
                cur.execute("""
                    SELECT ar.base_price, COUNT(DISTINCT tsr.room_id) as room_count
                    FROM tour_selected_rooms tsr
                    INNER JOIN accommodation_rooms ar ON tsr.room_id = ar.id
                    WHERE tsr.tour_id = %s
                    GROUP BY ar.base_price
                """, (tour_id,))
                room_prices = cur.fetchall()
                
                if room_prices:
                    # Use detailed room booking data
                    print(f"  Using tour_selected_rooms data: {len(room_prices)} room types found")
                    total_room_price = sum(float(row[0]) * row[1] for row in room_prices if row[0])
                    room_count = sum(row[1] for row in room_prices)
                    avg_room_price = total_room_price / room_count if room_count > 0 else 0
                    rooms_booked = (number_of_guests + 1) // 2
                    accommodation_revenue = avg_room_price * rooms_booked * nights
                else:
                    # Fallback: Get accommodation cost from tour_services
                    print(f"  No rooms in tour_selected_rooms, using tour_services fallback")
                    cur.execute("""
                        SELECT ts.service_cost
                        FROM tour_services ts
                        WHERE ts.tour_id = %s AND ts.service_type = 'accommodation'
                        LIMIT 1
                    """, (tour_id,))
                    result = cur.fetchone()
                    if result and result[0]:
                        # service_cost is average room price per night
                        avg_room_price = float(result[0])
                        rooms_booked = (number_of_guests + 1) // 2
                        accommodation_revenue = avg_room_price * rooms_booked * nights
                        print(f"  Fallback found: {avg_room_price} VND/night × {rooms_booked} rooms × {nights} nights = {accommodation_revenue} VND")
                    else:
                        print(f"  WARNING: No accommodation data found in tour_services either!")
            
            # Calculate restaurant revenue (from set meals)
            restaurant_revenue = 0
            selected_meals = customizations.get('selected_meals', []) if customizations else []
            
            if selected_meals:
                # User selected specific meals - only count those
                print(f"  Calculating restaurant revenue for {len(selected_meals)} selected meals")
                for meal in selected_meals:
                    cur.execute("""
                        SELECT rsm.total_price
                        FROM tour_selected_set_meals tssm
                        INNER JOIN restaurant_set_meals rsm ON tssm.set_meal_id = rsm.id
                        WHERE tssm.tour_id = %s 
                          AND tssm.day_number = %s 
                          AND tssm.meal_session = %s
                    """, (tour_id, meal['day_number'], meal['meal_session']))
                    result = cur.fetchone()
                    if result and result[0]:
                        meal_price = float(result[0])
                        restaurant_revenue += meal_price * number_of_guests
                        print(f"    Day {meal['day_number']} {meal['meal_session']}: {meal_price:,.0f} × {number_of_guests} guests = {meal_price * number_of_guests:,.0f} VND")
            else:
                # No meal selection info - use all meals (fallback for old bookings)
                print(f"  No meal selection data, using all tour meals")
                cur.execute("""
                    SELECT SUM(rsm.total_price)
                    FROM tour_selected_set_meals tssm
                    INNER JOIN restaurant_set_meals rsm ON tssm.set_meal_id = rsm.id
                    WHERE tssm.tour_id = %s
                """, (tour_id,))
                result = cur.fetchone()
                if result and result[0]:
                    restaurant_revenue = float(result[0]) * number_of_guests
            
            # Calculate transportation revenue (round trip)
            transportation_revenue = 0
            transport_options = customizations.get('transport_options', {}) if customizations else {}
            
            # Check which trips the user selected (outbound and/or return)
            outbound_selected = transport_options.get('outbound', True)  # Default to True if not specified
            return_selected = transport_options.get('return', True)
            trips_selected = (1 if outbound_selected else 0) + (1 if return_selected else 0)
            
            if trips_selected > 0:
                cur.execute("""
                    SELECT SUM(ts.service_cost)
                    FROM tour_services ts
                    WHERE ts.tour_id = %s AND ts.service_type = 'transportation'
                """, (tour_id,))
                result = cur.fetchone()
                if result and result[0]:
                    transport_cost_per_person = float(result[0])  # One-way price
                    transportation_revenue = transport_cost_per_person * number_of_guests * trips_selected
                    print(f"  Transportation: {transport_cost_per_person:,.0f} VND/person × {number_of_guests} guests × {trips_selected} trip(s) = {transportation_revenue:,.0f} VND")
            else:
                print(f"  Transportation: Not selected (0 trips)")
            
            # Calculate total partner revenue
            total_partner_revenue = accommodation_revenue + restaurant_revenue + transportation_revenue
            
            # If accommodation revenue doesn't match, calculate it as the difference
            # This handles cases where tour_services has inaccurate room prices
            if abs(total_partner_revenue - expected_partner_pool) > expected_partner_pool * 0.01:
                calculated_accommodation = expected_partner_pool - restaurant_revenue - transportation_revenue
                print(f"  Accommodation mismatch detected. Recalculating...")
                print(f"    Original calculation: {accommodation_revenue:,.0f} VND")
                print(f"    Derived from total: {calculated_accommodation:,.0f} VND")
                accommodation_revenue = calculated_accommodation
                total_partner_revenue = accommodation_revenue + restaurant_revenue + transportation_revenue
            
            # Verify with tolerance for rounding errors (within 1%)
            revenue_difference = abs(total_partner_revenue - expected_partner_pool)
            tolerance = expected_partner_pool * 0.01  # 1% tolerance
            
            if revenue_difference > tolerance:
                print(f"WARNING: Revenue mismatch detected!")
                print(f"  Booking ID: {booking_id}")
                print(f"  Total Price: {total_price:,.0f} VND")
                print(f"  Service Fee (10%): {service_fee:,.0f} VND")
                print(f"  Expected Partner Pool (90%): {expected_partner_pool:,.0f} VND")
                print(f"  Accommodation Revenue: {accommodation_revenue:,.0f} VND")
                print(f"  Restaurant Revenue: {restaurant_revenue:,.0f} VND")
                print(f"  Transportation Revenue: {transportation_revenue:,.0f} VND")
                print(f"  Total Partner Revenue: {total_partner_revenue:,.0f} VND")
                print(f"  Difference: {revenue_difference:,.0f} VND ({(revenue_difference/expected_partner_pool)*100:.2f}%)")
            else:
                print(f"✓ Revenue verification passed for Booking {booking_id}")
                print(f"  Total: {total_price:,.0f} VND | Partner Pool: {expected_partner_pool:,.0f} VND")
                print(f"  Breakdown: Accommodation={accommodation_revenue:,.0f}, Restaurant={restaurant_revenue:,.0f}, Transportation={transportation_revenue:,.0f}")
            
            conn.commit()
            
            # Get tour name for email
            cur.execute("SELECT name FROM tours_admin WHERE id = %s", (tour_id,))
            tour_result = cur.fetchone()
            tour_name = tour_result[0] if tour_result else "Tour"
            
            # Prepare booking data for email
            booking_data = {
                'booking_id': booking_id,
                'tour_name': tour_name,
                'full_name': full_name,
                'departure_date': departure_date.strftime('%Y-%m-%d') if isinstance(departure_date, datetime) else str(departure_date),
                'return_date': return_date.strftime('%Y-%m-%d') if return_date and isinstance(return_date, datetime) else (str(return_date) if return_date else None),
                'number_of_guests': number_of_guests,
                'total_price': float(total_price),
                'payment_method': payment_method,
                'contact_email': os.getenv('FROM_EMAIL', 'support@tourism-website.com')
            }
            
            # Send booking confirmation email
            try:
                send_booking_confirmation_email(email, booking_data)
                print(f"✅ Booking confirmation email sent to {email}")
            except Exception as e:
                print(f"⚠️ Failed to send booking confirmation email: {e}")
            
            # Send payment success email
            try:
                payment_data = {
                    'customer_name': full_name,
                    'transaction_id': payment_intent_id or f"BOOKING-{booking_id}",
                    'amount': float(total_price),
                    'payment_method': payment_method,
                    'payment_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
                send_payment_success_email(email, payment_data)
                print(f"✅ Payment success email sent to {email}")
            except Exception as e:
                print(f"⚠️ Failed to send payment success email: {e}")
            
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
                    (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_primary = TRUE LIMIT 1) as tour_image,
                    ts.status as tour_schedule_status
                FROM bookings b
                LEFT JOIN tours_admin t ON b.tour_id = t.id
                LEFT JOIN cities dc ON t.destination_city_id = dc.id
                LEFT JOIN tour_schedules ts ON b.tour_schedule_id = ts.id
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
                    'tour_image': row[20],
                    'tour_schedule_status': row[21]  # Add schedule status
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
                # Get bookings where this partner's room was actually selected in customizations
                # Note: room_id can be either a string like "deluxe_6" or an integer like 51
                query = """
                    SELECT DISTINCT
                        b.id, b.tour_id, b.user_id, b.full_name, b.email, b.phone,
                        b.departure_date, b.return_date, b.number_of_guests,
                        b.total_price, b.payment_method, b.payment_intent_id,
                        b.notes, b.status, b.created_at, b.promotion_code,
                        t.name as tour_name, t.duration, t.destination_city_id,
                        dc.name as destination_city_name,
                        (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_primary = TRUE LIMIT 1) as tour_image,
                        0 as partner_service_cost,
                        0 as total_accommodation_cost,
                        0 as total_restaurant_cost,
                        0 as total_transportation_cost
                    FROM bookings b
                    INNER JOIN tours_admin t ON b.tour_id = t.id
                    LEFT JOIN cities dc ON t.destination_city_id = dc.id
                    WHERE b.customizations IS NOT NULL
                    AND (
                        (b.customizations ? 'default_room' 
                         AND b.customizations->'default_room' ? 'room_id'
                         AND EXISTS (
                            SELECT 1 FROM accommodation_rooms ar
                            INNER JOIN accommodation_services acs ON ar.accommodation_id = acs.id
                            WHERE (ar.id::text = b.customizations->'default_room'->>'room_id'
                                   OR ar.room_type = b.customizations->'default_room'->>'room_id')
                            AND acs.partner_id = %s
                        ))
                        OR
                        (b.customizations ? 'room_upgrade'
                         AND b.customizations->'room_upgrade' ? 'room_id'
                         AND EXISTS (
                            SELECT 1 FROM accommodation_rooms ar
                            INNER JOIN accommodation_services acs ON ar.accommodation_id = acs.id
                            WHERE (ar.id::text = b.customizations->'room_upgrade'->>'room_id'
                                   OR ar.room_type = b.customizations->'room_upgrade'->>'room_id')
                            AND acs.partner_id = %s
                        ))
                    )
                    ORDER BY b.created_at DESC
                """
                cur.execute(query, (partner_id, partner_id))
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
                            SELECT SUM(rsm.total_price)
                            FROM tour_selected_set_meals tssm
                            INNER JOIN restaurant_set_meals rsm ON tssm.set_meal_id = rsm.id
                            WHERE tssm.tour_id = t.id AND rsm.restaurant_id IN (
                                SELECT id FROM restaurant_services WHERE partner_id = %s
                            )
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
                cur.execute(query, (partner_id, partner_id))
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
                cur.execute(query, (partner_id, partner_id))
            else:
                # If partner type is not set or unknown, return empty
                return jsonify({
                    'success': True,
                    'bookings': []
                }), 200
            
            # Query already executed above based on partner type
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

