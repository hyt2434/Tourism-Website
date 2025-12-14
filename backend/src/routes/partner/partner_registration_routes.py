from flask import Blueprint, request, jsonify
from config.database import get_connection
import secrets
import string
from datetime import datetime
import re
from src.services.email_service import (
    send_partner_registration_submitted_email,
    send_partner_registration_approved_email,
    send_partner_registration_rejected_email
)

partner_registration_bp = Blueprint('partner_registration', __name__, url_prefix='/api/partner-registrations')

def generate_random_password(length=12):
    """Generate a secure random password"""
    characters = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(characters) for _ in range(length))
    return password


def generate_friendly_password(business_name, email, phone, seed=None):
    """Generate a friendly password that's easy to remember.

    Pattern: <cleaned-partner-name>@123
    - cleaned-partner-name: alphanumeric lowercase from business name with spaces removed
    - suffix: @123
    
    Example: "Cozy Hotel" -> "cozyhotel@123"
    """
    # cleaned business name - remove all non-alphanumeric characters and convert to lowercase
    cleaned = re.sub(r'[^A-Za-z0-9]', '', (business_name or '')).lower()
    
    # fallback if business name is empty
    if not cleaned:
        cleaned = 'partner'
    
    return f"{cleaned}@123"


@partner_registration_bp.route('/', methods=['POST'])
def submit_partner_registration():
    """Submit a new partner registration application"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['partnerType', 'businessName', 'email', 'phone', 'description']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Check if email already exists in registrations
        cur.execute(
            "SELECT id FROM partner_registrations WHERE email = %s AND status = 'pending'",
            (data['email'],)
        )
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'error': 'A pending registration already exists with this email'}), 400
        
        # Prepare data based on partner type
        partner_type = data['partnerType']
        branches = data.get('branches', [])
        
        # Convert branches to JSONB format
        import json
        branches_json = json.dumps(branches) if branches else None
        
        if partner_type == 'accommodation':
            cur.execute("""
                INSERT INTO partner_registrations (
                    partner_type, business_name, email, phone, description,
                    star_rating, price_range, amenities, room_types, branches, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
                RETURNING id
            """, (
                partner_type,
                data['businessName'],
                data['email'],
                data['phone'],
                data.get('description', ''),
                data.get('starRating'),
                data.get('priceRange'),
                data.get('amenities', []),
                data.get('roomTypes', []),
                branches_json
            ))
            
        elif partner_type == 'transportation':
            cur.execute("""
                INSERT INTO partner_registrations (
                    partner_type, business_name, email, phone, description,
                    vehicle_types, capacity, routes, features, branches, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
                RETURNING id
            """, (
                partner_type,
                data['businessName'],
                data['email'],
                data['phone'],
                data.get('description', ''),
                data.get('vehicleTypes', []),
                data.get('capacity'),
                data.get('routes', []),
                data.get('features', []),
                branches_json
            ))
            
        elif partner_type == 'restaurant':
            cur.execute("""
                INSERT INTO partner_registrations (
                    partner_type, business_name, email, phone, description,
                    cuisine_type, price_range, capacity, specialties, opening_hours, branches, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
                RETURNING id
            """, (
                partner_type,
                data['businessName'],
                data['email'],
                data['phone'],
                data.get('description', ''),
                data.get('cuisineType'),
                data.get('priceRange'),
                data.get('capacity'),
                data.get('specialties', []),
                data.get('openingHours'),
                branches_json
            ))
        else:
            cur.close()
            conn.close()
            return jsonify({'error': 'Invalid partner type'}), 400
        
        registration_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        # Send confirmation email to partner
        try:
            send_partner_registration_submitted_email(
                data['email'],
                data['businessName'],
                registration_id
            )
            print(f"✅ Partner registration confirmation email sent to {data['email']}")
        except Exception as e:
            print(f"⚠️ Failed to send partner registration email: {e}")
        
        return jsonify({
            'message': 'Partner registration submitted successfully',
            'registrationId': registration_id
        }), 201
        
    except Exception as e:
        print(f"Error submitting partner registration: {e}")
        return jsonify({'error': str(e)}), 500


@partner_registration_bp.route('/pending', methods=['GET'])
def get_pending_registrations():
    """Get all pending partner registrations (Admin only)"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Fetch all pending registrations
        cur.execute("""
            SELECT 
                id, partner_type, business_name, email, phone, description,
                star_rating, price_range, amenities, room_types,
                vehicle_types, capacity, routes, features,
                cuisine_type, specialties, opening_hours,
                branches, status, submitted_at
            FROM partner_registrations
            WHERE status = 'pending'
            ORDER BY submitted_at DESC
        """)
        
        rows = cur.fetchall()
        
        registrations = []
        for row in rows:
            registration = {
                'id': row[0],
                'type': row[1],
                'businessName': row[2],
                'email': row[3],
                'phone': row[4],
                'description': row[5],
                'status': row[18],
                'submittedAt': row[19].isoformat() if row[19] else None
            }
            
            # Add type-specific fields
            if row[1] == 'accommodation':
                registration.update({
                    'starRating': row[6],
                    'priceRange': row[7],
                    'amenities': row[8] if row[8] else [],
                    'roomTypes': row[9] if row[9] else [],
                })
            elif row[1] == 'transportation':
                registration.update({
                    'vehicleTypes': row[10] if row[10] else [],
                    'capacity': row[11],
                    'routes': row[12] if row[12] else [],
                    'features': row[13] if row[13] else [],
                })
            elif row[1] == 'restaurant':
                registration.update({
                    'cuisineType': row[14],
                    'specialties': row[15] if row[15] else [],
                    'openingHours': row[16],
                    'priceRange': row[7],
                })
            
            # Add branches if exists
            if row[17]:
                import json
                registration['branches'] = json.loads(row[17]) if isinstance(row[17], str) else row[17]
            
            registrations.append(registration)
        
        cur.close()
        conn.close()
        
        return jsonify(registrations), 200
        
    except Exception as e:
        print(f"Error fetching pending registrations: {e}")
        return jsonify({'error': str(e)}), 500


@partner_registration_bp.route('/<int:registration_id>/approve', methods=['POST'])
def approve_registration(registration_id):
    """Approve a partner registration and create user account (Admin only)"""
    try:
        from flask import current_app
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Get registration details (include phone so we can build a friendly password)
        cur.execute("""
            SELECT business_name, email, partner_type, status, phone
            FROM partner_registrations
            WHERE id = %s
        """, (registration_id,))

        registration = cur.fetchone()
        
        if not registration:
            cur.close()
            conn.close()
            return jsonify({'error': 'Registration not found'}), 404
        
        if registration[3] != 'pending':
            cur.close()
            conn.close()
            return jsonify({'error': 'Registration is not pending'}), 400
        
        business_name = registration[0]
        email = registration[1]
        partner_type = registration[2]
        phone = registration[4]
        
        # Check if user already exists with this email
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        existing_user = cur.fetchone()
        
        if existing_user:
            cur.close()
            conn.close()
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Generate friendly password: <cleaned-business-name>@123
        random_password = generate_friendly_password(business_name, email, phone)
        
        # Hash password
        bcrypt = current_app.bcrypt
        hashed_password = bcrypt.generate_password_hash(random_password).decode('utf-8')
        
        # Create user account with 'partner' role
        cur.execute("""
            INSERT INTO users (username, email, password, role, partner_type)
            VALUES (%s, %s, %s, 'partner', %s)
            RETURNING id
        """, (business_name, email, hashed_password, partner_type))
        
        user_id = cur.fetchone()[0]
        
        # Update registration status
        cur.execute("""
            UPDATE partner_registrations
            SET status = 'approved',
                created_user_id = %s,
                processed_at = %s
            WHERE id = %s
        """, (user_id, datetime.now(), registration_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        # TODO: Send email to partner with credentials
        # For now, we'll return the password in the response (in production, send via email)
        
        return jsonify({
            'message': 'Partner registration approved successfully',
            'userId': user_id,
            'email': email,
            'temporaryPassword': random_password,
            'note': 'Please send these credentials to the partner via email'
        }), 200
        
    except Exception as e:
        print(f"Error approving registration: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


@partner_registration_bp.route('/<int:registration_id>/reject', methods=['POST'])
def reject_registration(registration_id):
    """Reject a partner registration (Admin only)"""
    try:
        data = request.get_json()
        reason = data.get('reason', 'No reason provided')
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Check if registration exists and is pending
        cur.execute("""
            SELECT status FROM partner_registrations WHERE id = %s
        """, (registration_id,))
        
        registration = cur.fetchone()
        
        if not registration:
            cur.close()
            conn.close()
            return jsonify({'error': 'Registration not found'}), 404
        
        if registration[0] != 'pending':
            cur.close()
            conn.close()
            return jsonify({'error': 'Registration is not pending'}), 400
        
        # Get partner email and business name
        cur.execute("""
            SELECT email, business_name FROM partner_registrations WHERE id = %s
        """, (registration_id,))
        partner_info = cur.fetchone()
        
        # Update registration status
        cur.execute("""
            UPDATE partner_registrations
            SET status = 'rejected',
                rejection_reason = %s,
                processed_at = %s
            WHERE id = %s
        """, (reason, datetime.now(), registration_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Send rejection email to partner
        if partner_info:
            try:
                send_partner_registration_rejected_email(
                    partner_info[0],  # email
                    partner_info[1],  # business_name
                    reason
                )
                print(f"✅ Partner rejection email sent to {partner_info[0]}")
            except Exception as e:
                print(f"⚠️ Failed to send partner rejection email: {e}")
        
        return jsonify({
            'message': 'Partner registration rejected',
            'reason': reason
        }), 200
        
    except Exception as e:
        print(f"Error rejecting registration: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


@partner_registration_bp.route('/all', methods=['GET'])
def get_all_registrations():
    """Get all partner registrations with their status (Admin only)"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Fetch all registrations
        cur.execute("""
            SELECT 
                id, partner_type, business_name, email, phone,
                status, submitted_at, processed_at, rejection_reason
            FROM partner_registrations
            ORDER BY submitted_at DESC
        """)
        
        rows = cur.fetchall()
        
        registrations = []
        for row in rows:
            registrations.append({
                'id': row[0],
                'partnerType': row[1],
                'businessName': row[2],
                'email': row[3],
                'phone': row[4],
                'status': row[5],
                'submittedAt': row[6].isoformat() if row[6] else None,
                'processedAt': row[7].isoformat() if row[7] else None,
                'rejectionReason': row[8]
            })
        
        cur.close()
        conn.close()
        
        return jsonify(registrations), 200
        
    except Exception as e:
        print(f"Error fetching all registrations: {e}")
        return jsonify({'error': str(e)}), 500
