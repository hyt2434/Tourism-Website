from flask import Blueprint, request, jsonify
from config.database import get_connection
from datetime import datetime

schedule_status_routes = Blueprint('schedule_status', __name__)

@schedule_status_routes.route('/schedules/<int:schedule_id>/start', methods=['POST'])
def start_tour_schedule(schedule_id):
    """Mark a tour schedule as started (ongoing)"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500
        
        try:
            cur = conn.cursor()
            
            # Update schedule status to 'ongoing'
            cur.execute("""
                UPDATE tour_schedules
                SET status = 'ongoing',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, tour_id, status
            """, (schedule_id,))
            
            result = cur.fetchone()
            if not result:
                return jsonify({'success': False, 'message': 'Schedule not found'}), 404
            
            conn.commit()
            
            return jsonify({
                'success': True,
                'message': 'Tour schedule started',
                'schedule_id': result[0],
                'tour_id': result[1],
                'status': result[2]
            }), 200
            
        except Exception as e:
            conn.rollback()
            return jsonify({'success': False, 'message': f'Error starting tour: {str(e)}'}), 500
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500


@schedule_status_routes.route('/schedules/<int:schedule_id>/complete', methods=['POST'])
def complete_tour_schedule(schedule_id):
    """Mark a tour schedule as completed and distribute revenue to partners"""
    import json
    import traceback
    
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500
        
        try:
            cur = conn.cursor()
            
            # Get tour details for this schedule
            cur.execute("""
                SELECT ts.tour_id, t.duration, t.name
                FROM tour_schedules ts
                INNER JOIN tours_admin t ON ts.tour_id = t.id
                WHERE ts.id = %s
            """, (schedule_id,))
            
            schedule_info = cur.fetchone()
            if not schedule_info:
                return jsonify({'success': False, 'message': 'Schedule not found'}), 404
            
            tour_id, duration, tour_name = schedule_info
            
            # Parse duration to get nights
            try:
                duration_int = int(duration) if isinstance(duration, str) else duration
            except:
                duration_int = int(''.join(filter(str.isdigit, str(duration))))
            
            nights = duration_int - 1
            
            print(f"\n=== COMPLETING TOUR SCHEDULE {schedule_id} ===")
            print(f"Tour ID: {tour_id}, Duration: {duration_int} days, Nights: {nights}")
            
            # Get all bookings for this schedule with customizations
            cur.execute("""
                SELECT b.id, b.tour_id, b.number_of_guests, b.total_price, b.customizations
                FROM bookings b
                WHERE b.tour_schedule_id = %s AND b.status = 'confirmed'
            """, (schedule_id,))
            
            bookings = cur.fetchall()
            
            if not bookings:
                return jsonify({'success': False, 'message': 'No confirmed bookings found for this schedule'}), 400
            
            print(f"Found {len(bookings)} confirmed bookings")
            
            total_revenue_distributed = 0
            partner_revenues = {}  # {partner_id: {partner_type, amount}}
            
            # Process each booking and calculate partner revenues
            for booking in bookings:
                booking_id, tour_id, number_of_guests, total_price, customizations = booking
                
                print(f"\nProcessing booking {booking_id}:")
                print(f"  Guests: {number_of_guests}, Total: {total_price}")
                
                # customizations is already a dict from psycopg2 JSONB conversion
                if not customizations:
                    customizations = {}
                print(f"  Customizations: {customizations}")
                
                # Calculate service fee (10%) - convert to float for calculations
                total_price_float = float(total_price)
                service_fee = total_price_float * 0.1 / 1.1
                partner_pool = total_price_float - service_fee
                total_revenue_distributed += partner_pool
                
                # --- ACCOMMODATION REVENUE ---
                accommodation_revenue = 0
                accommodation_partner_id = None
                
                # Calculate number of rooms needed (use actual_people_count if available, otherwise use number_of_guests from booking)
                actual_guests = customizations.get('actual_people_count', number_of_guests)
                num_rooms = max(1, (actual_guests + 1) // 2)  # Ceiling division: 2 people per room
                
                # Try to get from customizations
                if customizations.get('room_upgrade'):
                    room_price = customizations['room_upgrade'].get('room_price', 0)
                    accommodation_revenue = room_price * num_rooms * nights
                    # Get partner from room_upgrade
                    room_id = customizations['room_upgrade'].get('room_id')
                    if room_id:
                        cur.execute("""
                            SELECT acs.partner_id 
                            FROM accommodation_rooms ar
                            INNER JOIN accommodation_services acs ON ar.accommodation_id = acs.id
                            WHERE ar.id::text = %s OR ar.room_type = %s
                        """, (str(room_id), str(room_id)))
                        result = cur.fetchone()
                        if result:
                            accommodation_partner_id = result[0]
                            print(f"  Accommodation (upgraded): Partner {accommodation_partner_id}, {num_rooms} rooms × {nights} nights, Revenue: {accommodation_revenue}")
                
                elif customizations.get('default_room'):
                    room_price = customizations['default_room'].get('room_price', 0)
                    accommodation_revenue = room_price * num_rooms * nights
                    room_id = customizations['default_room'].get('room_id')
                    if room_id:
                        cur.execute("""
                            SELECT acs.partner_id 
                            FROM accommodation_rooms ar
                            INNER JOIN accommodation_services acs ON ar.accommodation_id = acs.id
                            WHERE ar.id::text = %s OR ar.room_type = %s
                        """, (str(room_id), str(room_id)))
                        result = cur.fetchone()
                        if result:
                            accommodation_partner_id = result[0]
                            print(f"  Accommodation (default): Partner {accommodation_partner_id}, {num_rooms} rooms × {nights} nights, Revenue: {accommodation_revenue}")
                
                # Add to partner revenues
                if accommodation_partner_id and accommodation_revenue > 0:
                    if accommodation_partner_id not in partner_revenues:
                        partner_revenues[accommodation_partner_id] = {
                            'partner_type': 'accommodation',
                            'amount': 0
                        }
                    partner_revenues[accommodation_partner_id]['amount'] += accommodation_revenue
                    print(f"  Added accommodation revenue: {accommodation_revenue} to partner {accommodation_partner_id}")
                
                # --- RESTAURANT REVENUE ---
                selected_meals = customizations.get('selected_meals', [])
                print(f"  Processing {len(selected_meals)} selected meals")
                if selected_meals:
                    for meal in selected_meals:
                        day_number = meal.get('day_number')
                        meal_session = meal.get('meal_session')
                        
                        # Get meal price and partner
                        cur.execute("""
                            SELECT rsm.total_price, rs.partner_id
                            FROM tour_selected_set_meals tssm
                            INNER JOIN restaurant_set_meals rsm ON tssm.set_meal_id = rsm.id
                            INNER JOIN restaurant_services rs ON rsm.restaurant_id = rs.id
                            WHERE tssm.tour_id = %s
                            AND tssm.day_number = %s
                            AND tssm.meal_session = %s
                        """, (tour_id, day_number, meal_session))
                        
                        meal_info = cur.fetchone()
                        if meal_info:
                            total_price, restaurant_partner_id = meal_info
                            meal_revenue = total_price * number_of_guests
                            
                            print(f"    Meal {day_number}-{meal_session}: Partner {restaurant_partner_id}, Revenue: {meal_revenue}")
                            
                            if restaurant_partner_id not in partner_revenues:
                                partner_revenues[restaurant_partner_id] = {
                                    'partner_type': 'restaurant',
                                    'amount': 0
                                }
                            partner_revenues[restaurant_partner_id]['amount'] += meal_revenue
                        else:
                            print(f"    Meal {day_number}-{meal_session}: NOT FOUND in database")
                
                # --- TRANSPORTATION REVENUE ---
                transport_options = customizations.get('transport_options', {})
                outbound = transport_options.get('outbound', False)
                return_trip = transport_options.get('return', False)
                trips_selected = (1 if outbound else 0) + (1 if return_trip else 0)
                
                print(f"  Transportation: Outbound={outbound}, Return={return_trip}, Trips={trips_selected}")
                
                if trips_selected > 0:
                    # Get transportation service
                    cur.execute("""
                        SELECT trs.base_price, trs.partner_id
                        FROM tour_services ts
                        INNER JOIN transportation_services trs ON ts.transportation_id = trs.id
                        WHERE ts.tour_id = %s AND ts.service_type = 'transportation'
                        LIMIT 1
                    """, (tour_id,))
                    
                    transport_info = cur.fetchone()
                    if transport_info:
                        one_way_price, transport_partner_id = transport_info
                        transport_revenue = float(one_way_price) * number_of_guests * trips_selected
                        
                        print(f"    Transport Partner {transport_partner_id}, Revenue: {transport_revenue}")
                        
                        if transport_partner_id not in partner_revenues:
                            partner_revenues[transport_partner_id] = {
                                'partner_type': 'transportation',
                                'amount': 0
                            }
                        partner_revenues[transport_partner_id]['amount'] += transport_revenue
                    else:
                        print(f"    Transportation service NOT FOUND for tour {tour_id}")
            
            print(f"\n=== REVENUE SUMMARY ===")
            print(f"Total revenue distributed: {total_revenue_distributed}")
            print(f"Partner revenues: {partner_revenues}")
            
            # Update schedule status to 'completed'
            cur.execute("""
                UPDATE tour_schedules
                SET status = 'completed',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (schedule_id,))
            
            # Update all bookings status to 'completed'
            cur.execute("""
                UPDATE bookings
                SET status = 'completed'
                WHERE tour_schedule_id = %s AND status = 'confirmed'
            """, (schedule_id,))
            
            # Store revenue distribution records (for future payment processing)
            for partner_id, revenue_info in partner_revenues.items():
                # Skip if partner_id is None (shouldn't happen but safety check)
                if partner_id is None:
                    continue
                    
                cur.execute("""
                    INSERT INTO partner_revenue_pending 
                    (schedule_id, partner_id, partner_type, amount, created_at)
                    VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (schedule_id, partner_id, partner_type) 
                    DO UPDATE SET 
                        amount = partner_revenue_pending.amount + EXCLUDED.amount,
                        updated_at = CURRENT_TIMESTAMP
                """, (schedule_id, partner_id, revenue_info['partner_type'], revenue_info['amount']))
            
            conn.commit()
            
            return jsonify({
                'success': True,
                'message': f'Tour "{tour_name}" completed and revenue distributed',
                'schedule_id': schedule_id,
                'bookings_count': len(bookings),
                'total_revenue_distributed': float(total_revenue_distributed),
                'partners_paid': len(partner_revenues),
                'partner_breakdown': {
                    str(pid): {'type': info['partner_type'], 'amount': float(info['amount'])}
                    for pid, info in partner_revenues.items()
                }
            }), 200
            
        except Exception as e:
            conn.rollback()
            print(f"\n❌ ERROR completing tour: {str(e)}")
            traceback.print_exc()
            return jsonify({'success': False, 'message': f'Error completing tour: {str(e)}'}), 500
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        print(f"\n❌ OUTER ERROR: {str(e)}")
        traceback.print_exc()
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500


@schedule_status_routes.route('/schedules/<int:schedule_id>/cancel', methods=['POST'])
def cancel_tour_schedule(schedule_id):
    """Cancel a tour schedule due to low bookings"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500
        
        try:
            cur = conn.cursor()
            
            # Get schedule details
            cur.execute("""
                SELECT id, tour_id, status, slots_booked, max_slots
                FROM tour_schedules
                WHERE id = %s
            """, (schedule_id,))
            
            schedule = cur.fetchone()
            if not schedule:
                return jsonify({'success': False, 'message': 'Schedule not found'}), 404
            
            schedule_id, tour_id, status, slots_booked, max_slots = schedule
            
            # Update schedule status to 'cancelled'
            cur.execute("""
                UPDATE tour_schedules
                SET status = 'cancelled',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (schedule_id,))
            
            # Update all bookings to cancelled
            cur.execute("""
                UPDATE bookings
                SET status = 'cancelled'
                WHERE tour_schedule_id = %s AND status = 'confirmed'
                RETURNING id
            """, (schedule_id,))
            
            cancelled_bookings = cur.fetchall()
            
            conn.commit()
            
            return jsonify({
                'success': True,
                'message': 'Tour schedule cancelled',
                'schedule_id': schedule_id,
                'cancelled_bookings_count': len(cancelled_bookings),
                'slots_booked': slots_booked,
                'max_slots': max_slots
            }), 200
            
        except Exception as e:
            conn.rollback()
            return jsonify({'success': False, 'message': f'Error cancelling tour: {str(e)}'}), 500
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500


@schedule_status_routes.route('/schedules/summary', methods=['GET'])
def get_schedules_summary():
    """Get summary of tour schedules that have confirmed bookings"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500
        
        try:
            cur = conn.cursor()
            
            # Get status filter from query params
            status_filter = request.args.get('status', 'all')
            
            # Build status condition
            status_condition = ""
            if status_filter != 'all':
                status_condition = f"AND ts.status = '{status_filter}'"
            
            # Get schedules that have at least one confirmed booking
            cur.execute(f"""
                SELECT 
                    ts.id as schedule_id,
                    ts.tour_id,
                    t.name as tour_name,
                    ts.departure_datetime,
                    ts.return_datetime,
                    ts.max_slots,
                    ts.slots_booked,
                    ts.slots_available,
                    ts.status,
                    COUNT(DISTINCT b.id) as booking_count
                FROM tour_schedules ts
                INNER JOIN tours_admin t ON ts.tour_id = t.id
                LEFT JOIN bookings b ON ts.id = b.tour_schedule_id AND b.status = 'confirmed'
                WHERE ts.is_active = TRUE 
                AND EXISTS (
                    SELECT 1 FROM bookings 
                    WHERE tour_schedule_id = ts.id 
                    AND status = 'confirmed'
                )
                {status_condition}
                GROUP BY ts.id, t.name
                ORDER BY ts.departure_datetime ASC
            """)
            
            rows = cur.fetchall()
            schedules = []
            
            for row in rows:
                schedules.append({
                    'schedule_id': row[0],
                    'tour_id': row[1],
                    'tour_name': row[2],
                    'departure_datetime': row[3].isoformat() if row[3] else None,
                    'return_datetime': row[4].isoformat() if row[4] else None,
                    'max_slots': row[5],
                    'slots_booked': row[6],
                    'slots_available': row[7],
                    'status': row[8],
                    'booking_count': row[9],
                    'occupancy_percentage': (row[6] / row[5] * 100) if row[5] > 0 else 0
                })
            
            return jsonify({
                'success': True,
                'schedules': schedules
            }), 200
            
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error fetching schedules: {str(e)}'}), 500
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500
