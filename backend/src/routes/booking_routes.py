from flask import Blueprint, request, jsonify
from src.models.models import get_connection
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
            
            # Insert booking into database
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
                    b.notes, b.status, b.created_at,
                    t.name as tour_name
                FROM bookings b
                LEFT JOIN tours_admin t ON b.tour_id = t.id
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
                'tour_name': row[15]
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

