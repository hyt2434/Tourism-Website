from flask import Blueprint, request, jsonify
from config.database import get_connection
from datetime import datetime

favorites_routes = Blueprint('favorites', __name__)

@favorites_routes.route('/user/<int:user_id>', methods=['GET'])
def get_user_favorites(user_id):
    """Get all favorite tours for a specific user"""
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
                    f.id, f.user_id, f.tour_id, f.created_at,
                    t.name, t.duration, t.description, t.total_price, t.currency,
                    t.destination_city_id, dc.name as destination_city_name,
                    t.departure_city_id, dpc.name as departure_city_name,
                    (SELECT image_url FROM tour_images WHERE tour_id = t.id AND is_primary = TRUE LIMIT 1) as tour_image,
                    t.number_of_members, t.is_active, t.is_published
                FROM favorites f
                INNER JOIN tours_admin t ON f.tour_id = t.id
                LEFT JOIN cities dc ON t.destination_city_id = dc.id
                LEFT JOIN cities dpc ON t.departure_city_id = dpc.id
                WHERE f.user_id = %s
                ORDER BY f.created_at DESC
            """, (user_id,))
            
            rows = cur.fetchall()
            favorites = []
            for row in rows:
                favorites.append({
                    'id': row[0],
                    'user_id': row[1],
                    'tour_id': row[2],
                    'created_at': row[3].isoformat() if row[3] else None,
                    'tour': {
                        'id': row[2],
                        'name': row[4],
                        'duration': row[5],
                        'description': row[6],
                        'total_price': float(row[7]) if row[7] else 0,
                        'currency': row[8],
                        'destination_city': row[10] if row[10] else None,
                        'departure_city': row[12] if row[12] else None,
                        'image': row[13],
                        'number_of_members': row[14],
                        'is_active': row[15],
                        'is_published': row[16]
                    }
                })
            
            return jsonify({
                'success': True,
                'favorites': favorites
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'Error fetching favorites: {str(e)}'
            }), 500
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@favorites_routes.route('/', methods=['POST'])
def add_favorite():
    """Add a tour to user's favorites"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        tour_id = data.get('tour_id')
        
        if not user_id or not tour_id:
            return jsonify({
                'success': False,
                'message': 'user_id and tour_id are required'
            }), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'message': 'Database connection failed'
            }), 500
        
        try:
            cur = conn.cursor()
            
            # Check if already favorited
            cur.execute("""
                SELECT id FROM favorites WHERE user_id = %s AND tour_id = %s
            """, (user_id, tour_id))
            
            if cur.fetchone():
                return jsonify({
                    'success': False,
                    'message': 'Tour already in favorites'
                }), 400
            
            # Add to favorites
            cur.execute("""
                INSERT INTO favorites (user_id, tour_id, created_at)
                VALUES (%s, %s, %s)
                RETURNING id
            """, (user_id, tour_id, datetime.now()))
            
            favorite_id = cur.fetchone()[0]
            conn.commit()
            
            return jsonify({
                'success': True,
                'favorite_id': favorite_id,
                'message': 'Tour added to favorites'
            }), 200
            
        except Exception as e:
            conn.rollback()
            return jsonify({
                'success': False,
                'message': f'Error adding favorite: {str(e)}'
            }), 500
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@favorites_routes.route('/<int:user_id>/<int:tour_id>', methods=['DELETE'])
def remove_favorite(user_id, tour_id):
    """Remove a tour from user's favorites"""
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
                DELETE FROM favorites WHERE user_id = %s AND tour_id = %s
                RETURNING id
            """, (user_id, tour_id))
            
            deleted = cur.fetchone()
            if not deleted:
                return jsonify({
                    'success': False,
                    'message': 'Favorite not found'
                }), 404
            
            conn.commit()
            
            return jsonify({
                'success': True,
                'message': 'Favorite removed'
            }), 200
            
        except Exception as e:
            conn.rollback()
            return jsonify({
                'success': False,
                'message': f'Error removing favorite: {str(e)}'
            }), 500
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@favorites_routes.route('/check/<int:user_id>/<int:tour_id>', methods=['GET'])
def check_favorite(user_id, tour_id):
    """Check if a tour is in user's favorites"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({
                'success': False,
                'is_favorite': False
            }), 500
        
        try:
            cur = conn.cursor()
            cur.execute("""
                SELECT id FROM favorites WHERE user_id = %s AND tour_id = %s
            """, (user_id, tour_id))
            
            is_favorite = cur.fetchone() is not None
            
            return jsonify({
                'success': True,
                'is_favorite': is_favorite
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'is_favorite': False,
                'message': f'Error: {str(e)}'
            }), 500
        finally:
            cur.close()
            conn.close()
            
    except Exception as e:
        return jsonify({
            'success': False,
            'is_favorite': False,
            'message': f'Error: {str(e)}'
        }), 500

