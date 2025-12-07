from flask import Blueprint, request, jsonify
from config.database import get_connection
import jwt
import os
from functools import wraps

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

@tour_review_routes.route('/tours/<int:tour_id>/reviews', methods=['GET'])
def get_tour_reviews(tour_id):
    """Get all reviews for a specific tour"""
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
            WHERE tr.tour_id = %s
            ORDER BY tr.created_at DESC
        """, (tour_id,))
        
        reviews = cur.fetchall()
        
        reviews_list = []
        for review in reviews:
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
                'email': None if review[6] else review[11]
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
        
        # Check if review already exists
        cur.execute("""
            SELECT id FROM tour_reviews WHERE booking_id = %s
        """, (booking_id,))
        
        existing_review = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if existing_review:
            return jsonify({
                'success': True,
                'can_review': False,
                'has_review': True,
                'review_id': existing_review[0],
                'message': 'You have already reviewed this tour'
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
    """Create a new tour review"""
    try:
        data = request.json
        booking_id = data.get('booking_id')
        rating = data.get('rating')
        review_text = data.get('review_text', '')
        is_anonymous = data.get('is_anonymous', False)
        review_images = data.get('review_images', [])
        
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
        
        # Create review
        cur.execute("""
            INSERT INTO tour_reviews 
            (tour_id, user_id, booking_id, rating, review_text, is_anonymous, review_images)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (tour_id, request.user_id, booking_id, rating, review_text, is_anonymous, review_images))
        
        result = cur.fetchone()
        review_id = result[0]
        created_at = result[1]
        
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
                'created_at': created_at.isoformat() if created_at else None
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
    """Delete a review"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # Verify review belongs to user
        cur.execute("""
            DELETE FROM tour_reviews 
            WHERE id = %s AND user_id = %s
            RETURNING id
        """, (review_id, request.user_id))
        
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
            WHERE tr.user_id = %s
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
