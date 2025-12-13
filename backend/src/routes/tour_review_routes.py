from flask import Blueprint, request, jsonify
from config.database import get_connection
import jwt
import os
from functools import wraps
from src.routes.social_routes import auto_post_from_tour_review, auto_post_from_service_review

tour_review_routes = Blueprint('tour_review_routes', __name__)

SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            print("DEBUG: No token provided in Authorization header")
            return jsonify({'success': False, 'message': 'Token is missing'}), 401
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            print(f"DEBUG: Attempting to decode token: {token[:20]}...")
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            request.user_id = data['user_id']
            print(f"DEBUG: Token decoded successfully, user_id: {request.user_id}")
        except jwt.ExpiredSignatureError:
            print("DEBUG: Token has expired")
            return jsonify({'success': False, 'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            print(f"DEBUG: Invalid token: {e}")
            return jsonify({'success': False, 'message': 'Invalid token'}), 401
        except Exception as e:
            print(f"DEBUG: Unexpected error decoding token: {e}")
            return jsonify({'success': False, 'message': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated

@tour_review_routes.route('/reviews/latest', methods=['GET'])
def get_latest_reviews():
    """Get the latest reviews across all tours for homepage display"""
    try:
        limit = request.args.get('limit', 4, type=int)
        
        conn = get_connection()
        cur = conn.cursor()
        
        # Get latest active reviews with tour and user information (exclude soft-deleted)
        cur.execute("""
            SELECT 
                tr.id, tr.tour_id, tr.rating, tr.review_text,
                tr.is_anonymous, tr.review_images, tr.created_at,
                t.name as tour_name,
                u.username, u.email
            FROM tour_reviews tr
            JOIN tours_admin t ON tr.tour_id = t.id
            JOIN users u ON tr.user_id = u.id
            WHERE tr.rating IS NOT NULL AND tr.deleted_at IS NULL
            ORDER BY tr.created_at DESC
            LIMIT %s
        """, (limit,))
        
        reviews = cur.fetchall()
        
        reviews_list = []
        for review in reviews:
            # Get user's first name or username
            username = review[8] if not review[4] else "Anonymous"  # is_anonymous check
            
            reviews_list.append({
                'id': review[0],
                'tour_id': review[1],
                'rating': review[2],
                'review_text': review[3],
                'is_anonymous': review[4],
                'review_images': review[5] or [],
                'created_at': review[6].isoformat() if review[6] else None,
                'tour_name': review[7],
                'username': username,
                'user_email': review[9] if not review[4] else None
            })
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'reviews': reviews_list,
            'total': len(reviews_list)
        })
        
    except Exception as e:
        print(f"Error getting latest reviews: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@tour_review_routes.route('/tours/<int:tour_id>/reviews', methods=['GET'])
def get_tour_reviews(tour_id):
    """Get all active reviews for a specific tour (excluding soft-deleted)"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                tr.id, tr.tour_id, tr.user_id, tr.booking_id, tr.rating, 
                tr.review_text, tr.is_anonymous, tr.review_images, 
                tr.created_at, tr.updated_at,
                u.username, u.email
            FROM tour_reviews tr
            JOIN users u ON tr.user_id = u.id
            WHERE tr.tour_id = %s AND tr.deleted_at IS NULL
            ORDER BY tr.created_at DESC
        """, (tour_id,))
        
        reviews = cur.fetchall()
        
        reviews_list = []
        for review in reviews:
            review_id = review[0]
            
            # Get service reviews for this tour review
            cur.execute("""
                SELECT 
                    sr.id, sr.tour_service_id, sr.service_type,
                    sr.rating, sr.review_text, sr.review_images,
                    sr.created_at,
                    -- Get service details based on type
                    CASE 
                        WHEN sr.service_type = 'accommodation' THEN acs.name
                        WHEN sr.service_type = 'transportation' THEN ts.license_plate
                        WHEN sr.service_type = 'restaurant' THEN rs.name
                    END as service_name
                FROM service_reviews sr
                LEFT JOIN tour_services tsv ON sr.tour_service_id = tsv.id
                LEFT JOIN accommodation_services acs ON tsv.accommodation_id = acs.id
                LEFT JOIN transportation_services ts ON tsv.transportation_id = ts.id
                LEFT JOIN restaurant_services rs ON tsv.restaurant_id = rs.id
                WHERE sr.tour_review_id = %s
                ORDER BY sr.created_at ASC
            """, (review_id,))
            
            service_reviews_rows = cur.fetchall()
            service_reviews = []
            
            for svc_review in service_reviews_rows:
                service_reviews.append({
                    'id': svc_review[0],
                    'tour_service_id': svc_review[1],
                    'service_type': svc_review[2],
                    'rating': svc_review[3],
                    'review_text': svc_review[4],
                    'review_images': svc_review[5] or [],
                    'created_at': svc_review[6].isoformat() if svc_review[6] else None,
                    'service_name': svc_review[7]
                })
            
            reviews_list.append({
                'id': review[0],
                'tour_id': review[1],
                'user_id': review[2],
                'booking_id': review[3],
                'rating': review[4],
                'review_text': review[5],
                'is_anonymous': review[6],
                'review_images': review[7] or [],
                'created_at': review[8].isoformat() if review[8] else None,
                'updated_at': review[9].isoformat() if review[9] else None,
                'username': 'Người dùng ẩn danh' if review[6] else review[10],
                'email': None if review[6] else review[11],
                'service_reviews': service_reviews
            })
        
        # Calculate average rating
        if reviews:
            avg_rating = sum(r['rating'] for r in reviews_list) / len(reviews_list)
        else:
            avg_rating = 0
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'reviews': reviews_list,
            'total_reviews': len(reviews_list),
            'average_rating': round(avg_rating, 1)
        })
        
    except Exception as e:
        print(f"Error getting tour reviews: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@tour_review_routes.route('/bookings/<int:booking_id>/can-review', methods=['GET'])
@token_required
def check_can_review(booking_id):
    """Check if user can review this booking (booking is completed and no review exists)"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Check if booking exists, belongs to user, and tour is completed
        cur.execute("""
            SELECT b.id, b.tour_id, ts.status
            FROM bookings b
            JOIN tour_schedules ts ON b.tour_schedule_id = ts.id
            WHERE b.id = %s AND b.user_id = %s
        """, (booking_id, request.user_id))
        
        booking = cur.fetchone()
        
        if not booking:
            return jsonify({'success': False, 'message': 'Booking not found or unauthorized'}), 404
        
        if booking[2] != 'completed':
            return jsonify({
                'success': False,
                'can_review': False,
                'message': 'Tour must be completed before reviewing'
            })
        
        # Check if review already exists (including soft-deleted ones)
        cur.execute("""
            SELECT id, deleted_at FROM tour_reviews WHERE booking_id = %s
        """, (booking_id,))
        
        existing_review = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if existing_review:
            # Review exists (even if deleted), user cannot review again
            message = 'This tour has already been reviewed' if existing_review[1] else 'You have already reviewed this tour'
            return jsonify({
                'success': True,
                'can_review': False,
                'has_review': True,
                'review_id': existing_review[0],
                'was_deleted': existing_review[1] is not None,
                'message': message
            })
        
        return jsonify({
            'success': True,
            'can_review': True,
            'tour_id': booking[1]
        })
        
    except Exception as e:
        print(f"Error checking review eligibility: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@tour_review_routes.route('/reviews', methods=['POST'])
@token_required
def create_review():
    """Create a new tour review with optional service-level reviews"""
    try:
        data = request.json
        booking_id = data.get('booking_id')
        rating = data.get('rating')
        review_text = data.get('review_text', '')
        is_anonymous = data.get('is_anonymous', False)
        review_images = data.get('review_images', [])
        service_reviews = data.get('service_reviews', [])  # NEW: Array of service reviews
        
        if not booking_id or not rating:
            return jsonify({'success': False, 'message': 'Booking ID and rating are required'}), 400
        
        if rating < 1 or rating > 5:
            return jsonify({'success': False, 'message': 'Rating must be between 1 and 5'}), 400
        
        conn = get_connection()
        cur = conn.cursor()
        
        # Verify booking belongs to user and tour is completed
        cur.execute("""
            SELECT b.tour_id, ts.status
            FROM bookings b
            JOIN tour_schedules ts ON b.tour_schedule_id = ts.id
            WHERE b.id = %s AND b.user_id = %s
        """, (booking_id, request.user_id))
        
        booking = cur.fetchone()
        
        if not booking:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Booking not found or unauthorized'}), 404
        
        if booking[1] != 'completed':
            cur.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Tour must be completed before reviewing'}), 400
        
        tour_id = booking[0]
        
        # Check if review already exists
        cur.execute("""
            SELECT id FROM tour_reviews WHERE booking_id = %s
        """, (booking_id,))
        
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'success': False, 'message': 'You have already reviewed this tour'}), 400
        
        # Create main tour review
        cur.execute("""
            INSERT INTO tour_reviews 
            (tour_id, user_id, booking_id, rating, review_text, is_anonymous, review_images)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (tour_id, request.user_id, booking_id, rating, review_text, is_anonymous, review_images))
        
        result = cur.fetchone()
        review_id = result[0]
        created_at = result[1]
        
        # Auto-create post from tour review if it has images
        if review_images and len(review_images) > 0:
            try:
                auto_post_from_tour_review(review_id, tour_id, request.user_id, review_images, review_text, conn)
            except Exception as e:
                print(f"⚠️  Warning: Failed to auto-post from tour review: {e}")
                # Don't fail the review creation if auto-posting fails
        
        # Create service-level reviews if provided
        created_service_reviews = []
        for svc_review in service_reviews:
            tour_service_id = svc_review.get('tour_service_id')
            svc_rating = svc_review.get('rating')
            svc_review_text = svc_review.get('review_text', '')
            svc_review_images = svc_review.get('review_images', [])
            
            # Validate service review
            if not tour_service_id or not svc_rating:
                continue  # Skip invalid service reviews
            
            if svc_rating < 1 or svc_rating > 5:
                continue
            
            # Validate images (max 5)
            if len(svc_review_images) > 5:
                svc_review_images = svc_review_images[:5]
            
            # Get service type and service_id from tour_services
            cur.execute("""
                SELECT service_type,
                    CASE 
                        WHEN service_type = 'accommodation' THEN accommodation_id
                        WHEN service_type = 'transportation' THEN transportation_id
                        WHEN service_type = 'restaurant' THEN restaurant_id
                    END as service_id
                FROM tour_services 
                WHERE id = %s AND tour_id = %s
            """, (tour_service_id, tour_id))
            
            service_row = cur.fetchone()
            if not service_row:
                continue  # Skip if service doesn't exist or doesn't belong to this tour
            
            service_type = service_row[0]
            service_id = service_row[1]
            
            # Insert service review
            cur.execute("""
                INSERT INTO service_reviews 
                (tour_review_id, tour_service_id, tour_id, user_id, booking_id, 
                 service_type, service_id, rating, review_text, review_images)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (review_id, tour_service_id, tour_id, request.user_id, booking_id,
                  service_type, service_id, svc_rating, svc_review_text, svc_review_images))
            
            svc_review_id = cur.fetchone()[0]
            created_service_reviews.append({
                'id': svc_review_id,
                'tour_service_id': tour_service_id,
                'service_type': service_type,
                'rating': svc_rating,
                'review_text': svc_review_text,
                'review_images': svc_review_images
            })
            
            # Auto-create post from service review if it has images
            if svc_review_images and len(svc_review_images) > 0:
                try:
                    auto_post_from_service_review(svc_review_id, tour_id, request.user_id, svc_review_images, svc_review_text, service_type, conn)
                except Exception as e:
                    print(f"⚠️  Warning: Failed to auto-post from service review: {e}")
                    # Don't fail the review creation if auto-posting fails
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Review created successfully',
            'review': {
                'id': review_id,
                'tour_id': tour_id,
                'booking_id': booking_id,
                'rating': rating,
                'review_text': review_text,
                'is_anonymous': is_anonymous,
                'review_images': review_images,
                'created_at': created_at.isoformat() if created_at else None,
                'service_reviews': created_service_reviews
            }
        }), 201
        
    except Exception as e:
        print(f"Error creating review: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@tour_review_routes.route('/reviews/<int:review_id>', methods=['PUT'])
@token_required
def update_review(review_id):
    """Update an existing review"""
    try:
        data = request.json
        rating = data.get('rating')
        review_text = data.get('review_text')
        is_anonymous = data.get('is_anonymous')
        review_images = data.get('review_images')
        
        conn = get_connection()
        cur = conn.cursor()
        
        # Verify review belongs to user
        cur.execute("""
            SELECT id FROM tour_reviews WHERE id = %s AND user_id = %s
        """, (review_id, request.user_id))
        
        if not cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Review not found or unauthorized'}), 404
        
        # Build update query dynamically
        updates = []
        params = []
        
        if rating is not None:
            if rating < 1 or rating > 5:
                cur.close()
                conn.close()
                return jsonify({'success': False, 'message': 'Rating must be between 1 and 5'}), 400
            updates.append("rating = %s")
            params.append(rating)
        
        if review_text is not None:
            updates.append("review_text = %s")
            params.append(review_text)
        
        if is_anonymous is not None:
            updates.append("is_anonymous = %s")
            params.append(is_anonymous)
        
        if review_images is not None:
            updates.append("review_images = %s")
            params.append(review_images)
        
        if not updates:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'message': 'No fields to update'}), 400
        
        updates.append("updated_at = CURRENT_TIMESTAMP")
        params.append(review_id)
        
        query = f"UPDATE tour_reviews SET {', '.join(updates)} WHERE id = %s RETURNING id, updated_at"
        cur.execute(query, params)
        
        result = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Review updated successfully',
            'review_id': result[0],
            'updated_at': result[1].isoformat() if result[1] else None
        })
        
    except Exception as e:
        print(f"Error updating review: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@tour_review_routes.route('/reviews/<int:review_id>', methods=['DELETE'])
@token_required
def delete_review(review_id):
    """Soft delete a review (user can delete own, admin can delete any)"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Check if user is admin
        cur.execute("SELECT role FROM users WHERE id = %s", (request.user_id,))
        user_role = cur.fetchone()
        is_admin = user_role and user_role[0] == 'admin'
        
        if is_admin:
            # Admin can soft delete any review
            cur.execute("""
                UPDATE tour_reviews 
                SET deleted_at = CURRENT_TIMESTAMP, deleted_by = %s
                WHERE id = %s AND deleted_at IS NULL
                RETURNING id
            """, (request.user_id, review_id))
        else:
            # Regular user can only soft delete their own review
            cur.execute("""
                UPDATE tour_reviews 
                SET deleted_at = CURRENT_TIMESTAMP, deleted_by = %s
                WHERE id = %s AND user_id = %s AND deleted_at IS NULL
                RETURNING id
            """, (request.user_id, review_id, request.user_id))
        
        result = cur.fetchone()
        
        if not result:
            conn.rollback()
            cur.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Review not found or unauthorized'}), 404
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Review deleted successfully'
        })
        
    except Exception as e:
        print(f"Error deleting review: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@tour_review_routes.route('/reviews/services/<int:service_review_id>', methods=['DELETE'])
@token_required
def delete_service_review(service_review_id):
    """Soft delete a service review (admin can delete any)"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Check if user is admin
        cur.execute("SELECT role FROM users WHERE id = %s", (request.user_id,))
        user_role = cur.fetchone()
        is_admin = user_role and user_role[0] == 'admin'
        
        if not is_admin:
            cur.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Only admins can delete service reviews'}), 403
        
        # Admin can soft delete any service review
        cur.execute("""
            UPDATE service_reviews 
            SET deleted_at = CURRENT_TIMESTAMP, deleted_by = %s
            WHERE id = %s AND deleted_at IS NULL
            RETURNING id
        """, (request.user_id, service_review_id))
        
        result = cur.fetchone()
        
        if not result:
            conn.rollback()
            cur.close()
            conn.close()
            return jsonify({'success': False, 'message': 'Service review not found'}), 404
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Service review deleted successfully'
        })
        
    except Exception as e:
        print(f"Error deleting service review: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@tour_review_routes.route('/users/my-reviews', methods=['GET'])
@token_required
def get_user_reviews():
    """Get all reviews by the current user"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                tr.id, tr.tour_id, tr.booking_id, tr.rating, 
                tr.review_text, tr.is_anonymous, tr.review_images, 
                tr.created_at, tr.updated_at,
                t.name as tour_name
            FROM tour_reviews tr
            JOIN tours_admin t ON tr.tour_id = t.id
            WHERE tr.user_id = %s AND tr.deleted_at IS NULL
            ORDER BY tr.created_at DESC
        """, (request.user_id,))
        
        reviews = cur.fetchall()
        
        reviews_list = []
        for review in reviews:
            reviews_list.append({
                'id': review[0],
                'tour_id': review[1],
                'booking_id': review[2],
                'rating': review[3],
                'review_text': review[4],
                'is_anonymous': review[5],
                'review_images': review[6] or [],
                'created_at': review[7].isoformat() if review[7] else None,
                'updated_at': review[8].isoformat() if review[8] else None,
                'tour_name': review[9]
            })
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'reviews': reviews_list
        })
        
    except Exception as e:
        print(f"Error getting user reviews: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@tour_review_routes.route('/bookings/<int:booking_id>/services', methods=['GET'])
@token_required
def get_booking_services(booking_id):
    """Get all services for a booking (for review form)"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Verify booking belongs to user
        cur.execute("""
            SELECT tour_id FROM bookings 
            WHERE id = %s AND user_id = %s
        """, (booking_id, request.user_id))
        
        booking_row = cur.fetchone()
        if not booking_row:
            return jsonify({'success': False, 'message': 'Booking not found or unauthorized'}), 404
        
        tour_id = booking_row[0]
        
        # Get all services for this tour
        cur.execute("""
            SELECT 
                ts.id, ts.service_type, ts.day_number, ts.service_cost,
                CASE 
                    WHEN ts.service_type = 'accommodation' THEN acs.name
                    WHEN ts.service_type = 'transportation' THEN trs.license_plate
                    WHEN ts.service_type = 'restaurant' THEN rs.name
                END as service_name,
                CASE 
                    WHEN ts.service_type = 'accommodation' THEN acs.id
                    WHEN ts.service_type = 'transportation' THEN trs.id
                    WHEN ts.service_type = 'restaurant' THEN rs.id
                END as service_id
            FROM tour_services ts
            LEFT JOIN accommodation_services acs ON ts.accommodation_id = acs.id
            LEFT JOIN transportation_services trs ON ts.transportation_id = trs.id
            LEFT JOIN restaurant_services rs ON ts.restaurant_id = rs.id
            WHERE ts.tour_id = %s
            ORDER BY ts.service_type, ts.day_number NULLS FIRST
        """, (tour_id,))
        
        services_rows = cur.fetchall()
        services = []
        
        for svc in services_rows:
            services.append({
                'tour_service_id': svc[0],
                'service_type': svc[1],
                'day_number': svc[2],
                'service_cost': float(svc[3]) if svc[3] else 0,
                'service_name': svc[4] or 'Unknown Service',
                'service_id': svc[5]
            })
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'booking_id': booking_id,
            'tour_id': tour_id,
            'services': services
        })
        
    except Exception as e:
        print(f"Error getting booking services: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@tour_review_routes.route('/partner/<int:partner_id>/reviews', methods=['GET'])
@token_required
def get_partner_reviews(partner_id):
    """Get all reviews containing services belonging to a partner"""
    try:
        # Verify partner owns this account
        if request.user_id != partner_id:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        
        conn = get_connection()
        cur = conn.cursor()
        
        # Get user's partner type
        cur.execute("""
            SELECT partner_type FROM users WHERE id = %s AND role = 'partner'
        """, (partner_id,))
        
        user_row = cur.fetchone()
        if not user_row:
            return jsonify({'success': False, 'message': 'Partner not found'}), 404
        
        partner_type = user_row[0]
        
        # Get reviews containing services belonging to this partner (exclude deleted reviews)
        cur.execute("""
            SELECT DISTINCT
                tr.id, tr.tour_id, tr.user_id, tr.booking_id, tr.rating,
                tr.review_text, tr.is_anonymous, tr.review_images,
                tr.created_at, tr.updated_at,
                u.username, u.email,
                t.name as tour_name
            FROM tour_reviews tr
            JOIN users u ON tr.user_id = u.id
            JOIN tours_admin t ON tr.tour_id = t.id
            WHERE tr.deleted_at IS NULL
            AND EXISTS (
                SELECT 1 FROM service_reviews sr
                JOIN tour_services ts ON sr.tour_service_id = ts.id
                WHERE sr.tour_review_id = tr.id
                AND sr.deleted_at IS NULL
                AND (
                    (ts.service_type = 'accommodation' AND ts.accommodation_id IN (
                        SELECT id FROM accommodation_services WHERE partner_id = %s
                    ))
                    OR
                    (ts.service_type = 'transportation' AND ts.transportation_id IN (
                        SELECT id FROM transportation_services WHERE partner_id = %s
                    ))
                    OR
                    (ts.service_type = 'restaurant' AND ts.restaurant_id IN (
                        SELECT id FROM restaurant_services WHERE partner_id = %s
                    ))
                )
            )
            ORDER BY tr.created_at DESC
        """, (partner_id, partner_id, partner_id))
        
        reviews_rows = cur.fetchall()
        reviews_list = []
        
        for review in reviews_rows:
            review_id = review[0]
            
            # Get service reviews for this partner only
            if partner_type == 'accommodation':
                service_filter = """
                    AND ts.service_type = 'accommodation' 
                    AND ts.accommodation_id IN (
                        SELECT id FROM accommodation_services WHERE partner_id = %s
                    )
                """
            elif partner_type == 'transportation':
                service_filter = """
                    AND ts.service_type = 'transportation' 
                    AND ts.transportation_id IN (
                        SELECT id FROM transportation_services WHERE partner_id = %s
                    )
                """
            elif partner_type == 'restaurant':
                service_filter = """
                    AND ts.service_type = 'restaurant' 
                    AND ts.restaurant_id IN (
                        SELECT id FROM restaurant_services WHERE partner_id = %s
                    )
                """
            else:
                service_filter = " AND 1=0"  # No results if unknown type
            
            query = f"""
                SELECT 
                    sr.id, sr.tour_service_id, sr.service_type,
                    sr.rating, sr.review_text, sr.review_images,
                    sr.created_at,
                    CASE 
                        WHEN sr.service_type = 'accommodation' THEN acs.name
                        WHEN sr.service_type = 'transportation' THEN ts2.license_plate
                        WHEN sr.service_type = 'restaurant' THEN rs.name
                    END as service_name
                FROM service_reviews sr
                JOIN tour_services ts ON sr.tour_service_id = ts.id
                LEFT JOIN accommodation_services acs ON ts.accommodation_id = acs.id
                LEFT JOIN transportation_services ts2 ON ts.transportation_id = ts2.id
                LEFT JOIN restaurant_services rs ON ts.restaurant_id = rs.id
                WHERE sr.tour_review_id = %s
                AND sr.deleted_at IS NULL
                {service_filter}
                ORDER BY sr.created_at ASC
            """
            
            cur.execute(query, (review_id, partner_id))
            service_reviews_rows = cur.fetchall()
            
            service_reviews = []
            for svc_review in service_reviews_rows:
                service_reviews.append({
                    'id': svc_review[0],
                    'tour_service_id': svc_review[1],
                    'service_type': svc_review[2],
                    'rating': svc_review[3],
                    'review_text': svc_review[4],
                    'review_images': svc_review[5] or [],
                    'created_at': svc_review[6].isoformat() if svc_review[6] else None,
                    'service_name': svc_review[7]
                })
            
            # Only include reviews that have service reviews for this partner
            if service_reviews:
                reviews_list.append({
                    'id': review[0],
                    'tour_id': review[1],
                    'tour_name': review[12],
                    'user_id': review[2],
                    'booking_id': review[3],
                    'rating': review[4],
                    'review_text': review[5],
                    'is_anonymous': review[6],
                    'review_images': review[7] or [],
                    'created_at': review[8].isoformat() if review[8] else None,
                    'updated_at': review[9].isoformat() if review[9] else None,
                    'username': 'Người dùng ẩn danh' if review[6] else review[10],
                    'email': None if review[6] else review[11],
                    'service_reviews': service_reviews
                })
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'reviews': reviews_list,
            'total_reviews': len(reviews_list)
        })
        
    except Exception as e:
        print(f"Error getting partner reviews: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@tour_review_routes.route('/bookings/<int:booking_id>/can-review-services', methods=['GET'])
@token_required
def check_can_review_services(booking_id):
    """Check if user can review services for this booking"""
    try:
        print(f"DEBUG: Checking service review eligibility for booking_id: {booking_id}, user_id: {request.user_id}")
        
        conn = get_connection()
        cur = conn.cursor()
        
        # Check if booking exists, belongs to user, and tour is completed
        cur.execute("""
            SELECT b.id, b.tour_id, ts.status
            FROM bookings b
            JOIN tour_schedules ts ON b.tour_schedule_id = ts.id
            WHERE b.id = %s AND b.user_id = %s
        """, (booking_id, request.user_id))
        
        booking = cur.fetchone()
        
        print(f"DEBUG: Booking query result: {booking}")
        
        if not booking:
            return jsonify({'success': False, 'message': 'Booking not found or unauthorized'}), 404
        
        if booking[2] != 'completed':
            return jsonify({
                'success': False,
                'can_review': False,
                'message': 'Tour must be completed before reviewing services'
            })
        
        tour_id = booking[1]
        
        # Get all services for this tour
        cur.execute("""
            SELECT ts.id, ts.service_type,
                CASE 
                    WHEN ts.service_type = 'accommodation' THEN acs.name
                    WHEN ts.service_type = 'transportation' THEN trs.license_plate
                    WHEN ts.service_type = 'restaurant' THEN rs.name
                END as service_name
            FROM tour_services ts
            LEFT JOIN accommodation_services acs ON ts.accommodation_id = acs.id
            LEFT JOIN transportation_services trs ON ts.transportation_id = trs.id
            LEFT JOIN restaurant_services rs ON ts.restaurant_id = rs.id
            WHERE ts.tour_id = %s
        """, (tour_id,))
        
        services = cur.fetchall()
        
        print(f"DEBUG: Found {len(services)} services for tour {tour_id}")
        
        # Check which services have been reviewed
        services_status = []
        for service in services:
            tour_service_id = service[0]
            
            cur.execute("""
                SELECT id FROM service_reviews 
                WHERE tour_service_id = %s AND booking_id = %s
            """, (tour_service_id, booking_id))
            
            has_review = cur.fetchone() is not None
            
            print(f"DEBUG: Service {tour_service_id} ({service[2]}) has_review: {has_review}")
            
            services_status.append({
                'tour_service_id': tour_service_id,
                'service_type': service[1],
                'service_name': service[2],
                'has_review': has_review
            })
        
        all_reviewed = all(s['has_review'] for s in services_status) if services_status else False
        
        print(f"DEBUG: All services reviewed: {all_reviewed}")
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'can_review': True,
            'has_reviewed_all': all_reviewed,
            'services': services_status
        })
        
    except Exception as e:
        print(f"Error checking service review eligibility: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500


@tour_review_routes.route('/reviews/services', methods=['POST'])
@token_required
def create_service_reviews():
    """Create service-only reviews without tour review"""
    try:
        data = request.get_json()
        booking_id = data.get('booking_id')
        tour_id = data.get('tour_id')
        service_reviews = data.get('service_reviews', [])
        
        print(f"DEBUG: Create service reviews - booking_id: {booking_id}, tour_id: {tour_id}, user_id: {request.user_id}")
        print(f"DEBUG: Number of service reviews: {len(service_reviews)}")
        print(f"DEBUG: Service reviews data: {service_reviews}")
        
        if not booking_id or not tour_id:
            return jsonify({'success': False, 'message': 'booking_id and tour_id are required'}), 400
        
        if not service_reviews or len(service_reviews) == 0:
            return jsonify({'success': False, 'message': 'At least one service review is required'}), 400
        
        # Validate: Filter out services without any review data (no rating, no text, no images)
        valid_service_reviews = []
        for svc_review in service_reviews:
            rating = svc_review.get('rating', 0)
            review_text = svc_review.get('review_text', '').strip()
            review_images = svc_review.get('review_images', [])
            
            # Only include services that have at least rating OR text OR images
            if rating > 0 or review_text or (review_images and len(review_images) > 0):
                valid_service_reviews.append(svc_review)
        
        # Check if at least one service has been reviewed
        if len(valid_service_reviews) == 0:
            return jsonify({
                'success': False, 
                'message': 'At least one service must be reviewed (provide rating, comment, or images)'
            }), 400
        
        print(f"DEBUG: Filtered service reviews - original: {len(service_reviews)}, valid: {len(valid_service_reviews)}")
        service_reviews = valid_service_reviews
        
        conn = get_connection()
        cur = conn.cursor()
        
        # Verify booking belongs to user
        cur.execute("""
            SELECT user_id FROM bookings WHERE id = %s
        """, (booking_id,))
        booking_row = cur.fetchone()
        
        print(f"DEBUG: Booking row: {booking_row}")
        
        if not booking_row:
            return jsonify({'success': False, 'message': 'Booking not found'}), 404
        
        if booking_row[0] != request.user_id:
            print(f"DEBUG: User mismatch - booking user: {booking_row[0]}, request user: {request.user_id}")
            return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        
        # Check if tour review exists for this booking
        cur.execute("""
            SELECT id FROM tour_reviews WHERE booking_id = %s
        """, (booking_id,))
        tour_review_row = cur.fetchone()
        
        print(f"DEBUG: Existing tour review: {tour_review_row}")
        
        # If no tour review exists, create a minimal one
        if not tour_review_row:
            print(f"DEBUG: Creating minimal tour review")
            cur.execute("""
                INSERT INTO tour_reviews (
                    tour_id, user_id, booking_id, rating, review_text, is_anonymous
                ) VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (tour_id, request.user_id, booking_id, 5, 'Đánh giá dịch vụ', False))
            tour_review_id = cur.fetchone()[0]
            print(f"DEBUG: Created tour review with id: {tour_review_id}")
        else:
            tour_review_id = tour_review_row[0]
            print(f"DEBUG: Using existing tour review id: {tour_review_id}")
        
        # Insert service reviews
        created_reviews = []
        for svc_review in service_reviews:
            tour_service_id = svc_review.get('tour_service_id')
            rating = svc_review.get('rating', 0)
            review_text = svc_review.get('review_text', '').strip()
            review_images = svc_review.get('review_images', [])
            
            print(f"DEBUG: Processing service review - tour_service_id: {tour_service_id}, rating: {rating}")
            
            # Skip if no tour_service_id
            if not tour_service_id:
                print(f"DEBUG: Skipping service review - missing tour_service_id")
                continue
            
            # Skip if service has no content (no rating, no text, no images)
            if rating == 0 and not review_text and (not review_images or len(review_images) == 0):
                print(f"DEBUG: Skipping service review - no content provided")
                continue
            
            # Ensure at least rating is provided
            if rating == 0:
                print(f"DEBUG: Skipping service review - rating is required")
                continue
            
            # Verify service belongs to tour and get service details
            cur.execute("""
                SELECT service_type, 
                    CASE 
                        WHEN service_type = 'accommodation' THEN accommodation_id
                        WHEN service_type = 'transportation' THEN transportation_id
                        WHEN service_type = 'restaurant' THEN restaurant_id
                    END as service_id
                FROM tour_services 
                WHERE id = %s AND tour_id = %s
            """, (tour_service_id, tour_id))
            
            service_row = cur.fetchone()
            print(f"DEBUG: Service row: {service_row}")
            
            if not service_row:
                print(f"DEBUG: Service not found for tour_service_id: {tour_service_id}")
                continue
            
            service_type = service_row[0]
            service_id = service_row[1]
            
            # Check if service review already exists
            cur.execute("""
                SELECT id FROM service_reviews 
                WHERE tour_review_id = %s AND tour_service_id = %s
            """, (tour_review_id, tour_service_id))
            
            existing_review = cur.fetchone()
            print(f"DEBUG: Existing service review: {existing_review}")
            
            if existing_review:
                # Update existing review
                print(f"DEBUG: Updating existing service review id: {existing_review[0]}")
                cur.execute("""
                    UPDATE service_reviews 
                    SET rating = %s, review_text = %s, review_images = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                    RETURNING id
                """, (rating, review_text, review_images, existing_review[0]))
                review_id = existing_review[0]
            else:
                # Insert new review
                print(f"DEBUG: Inserting new service review")
                print(f"DEBUG: Values - tour_review_id: {tour_review_id}, tour_service_id: {tour_service_id}, tour_id: {tour_id}, user_id: {request.user_id}, booking_id: {booking_id}")
                print(f"DEBUG: Values - service_type: {service_type}, service_id: {service_id}, rating: {rating}, review_text: {review_text}, review_images: {review_images}")
                
                cur.execute("""
                    INSERT INTO service_reviews (
                        tour_review_id, tour_service_id, tour_id, user_id, booking_id,
                        service_type, service_id, rating, review_text, review_images
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (tour_review_id, tour_service_id, tour_id, request.user_id, booking_id,
                      service_type, service_id, rating, review_text, review_images))
                review_id = cur.fetchone()[0]
                print(f"DEBUG: Inserted service review with id: {review_id}")
            
            # Auto-create post from service review if it has images (only for new reviews)
            if not existing_review and review_images and len(review_images) > 0:
                try:
                    auto_post_from_service_review(review_id, tour_id, request.user_id, review_images, review_text, service_type, conn)
                except Exception as e:
                    print(f"⚠️  Warning: Failed to auto-post from service review: {e}")
                    # Don't fail the review creation if auto-posting fails
            
            created_reviews.append({
                'id': review_id,
                'tour_service_id': tour_service_id,
                'rating': rating
            })
        
        conn.commit()
        print(f"DEBUG: Successfully committed {len(created_reviews)} service reviews")
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Service reviews created successfully',
            'tour_review_id': tour_review_id,
            'service_reviews': created_reviews
        }), 201
        
    except Exception as e:
        print(f"ERROR creating service reviews: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500
