"""
API routes for partner revenue management.
Partners can view their revenue from completed tours.
"""

from flask import Blueprint, request, jsonify
from config.database import get_connection

partner_revenue_routes = Blueprint('partner_revenue', __name__)


@partner_revenue_routes.route('/partner/<int:partner_id>/revenue', methods=['GET'])
def get_partner_revenue(partner_id):
    """Get partner's revenue from completed tours"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Get all revenue records for this partner
        cur.execute("""
            SELECT 
                prp.id,
                prp.schedule_id,
                prp.amount,
                prp.status,
                prp.created_at,
                prp.updated_at,
                ts.tour_id,
                t.name as tour_name,
                ts.departure_datetime
            FROM partner_revenue_pending prp
            INNER JOIN tour_schedules ts ON prp.schedule_id = ts.id
            INNER JOIN tours_admin t ON ts.tour_id = t.id
            WHERE prp.partner_id = %s
            ORDER BY prp.created_at DESC
        """, (partner_id,))
        
        rows = cur.fetchall()
        revenues = []
        total_pending = 0
        total_paid = 0
        
        for row in rows:
            amount = float(row[2])
            if row[3] == 'pending':
                total_pending += amount
            elif row[3] == 'paid':
                total_paid += amount
                
            revenues.append({
                'id': row[0],
                'schedule_id': row[1],
                'amount': amount,
                'status': row[3],
                'created_at': row[4].isoformat() if row[4] else None,
                'updated_at': row[5].isoformat() if row[5] else None,
                'tour_id': row[6],
                'tour_name': row[7],
                'departure_datetime': row[8].isoformat() if row[8] else None
            })
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'revenues': revenues,
            'total_pending': total_pending,
            'total_paid': total_paid,
            'total_revenue': total_pending + total_paid
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching revenue: {str(e)}'
        }), 500


@partner_revenue_routes.route('/partner/<int:partner_id>/revenue/monthly', methods=['GET'])
def get_partner_monthly_revenue(partner_id):
    """Get partner's monthly revenue from completed tours"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Get monthly revenue (current month only)
        cur.execute("""
            SELECT 
                COALESCE(SUM(prp.amount), 0) as monthly_revenue
            FROM partner_revenue_pending prp
            WHERE prp.partner_id = %s
                AND EXTRACT(MONTH FROM prp.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
                AND EXTRACT(YEAR FROM prp.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        """, (partner_id,))
        
        row = cur.fetchone()
        monthly_revenue = float(row[0]) if row and row[0] else 0.0
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'monthly_revenue': monthly_revenue
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching monthly revenue: {str(e)}'
        }), 500


@partner_revenue_routes.route('/partner/<int:partner_id>/stats', methods=['GET'])
def get_partner_stats(partner_id):
    """Get partner's statistics based on their partner type"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Get partner type
        cur.execute("""
            SELECT partner_type FROM users WHERE id = %s
        """, (partner_id,))
        partner_row = cur.fetchone()
        
        if not partner_row:
            cur.close()
            conn.close()
            return jsonify({'error': 'Partner not found'}), 404
        
        partner_type = partner_row[0]  # 'accommodation', 'restaurant', or 'transportation'
        
        total_services = 0
        
        # Calculate total services based on partner type
        if partner_type == 'accommodation':
            # For accommodation: total number of rooms across all accommodations
            cur.execute("""
                SELECT COALESCE(SUM(ar.total_rooms), 0)
                FROM accommodation_services acs
                LEFT JOIN accommodation_rooms ar ON acs.id = ar.accommodation_id
                WHERE acs.partner_id = %s
            """, (partner_id,))
            row = cur.fetchone()
            total_services = int(row[0]) if row and row[0] else 0
            
        elif partner_type == 'restaurant':
            # For restaurant: total number of set meals across all restaurants
            cur.execute("""
                SELECT COUNT(rsm.id)
                FROM restaurant_services rs
                LEFT JOIN restaurant_set_meals rsm ON rs.id = rsm.restaurant_id
                WHERE rs.partner_id = %s
            """, (partner_id,))
            row = cur.fetchone()
            total_services = int(row[0]) if row and row[0] else 0
            
        elif partner_type == 'transportation':
            # For transportation: total number of vehicles (services)
            cur.execute("""
                SELECT COUNT(id)
                FROM transportation_services
                WHERE partner_id = %s
            """, (partner_id,))
            row = cur.fetchone()
            total_services = int(row[0]) if row and row[0] else 0
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'total_services': total_services,
            'partner_type': partner_type
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching partner stats: {str(e)}'
        }), 500


@partner_revenue_routes.route('/partner/<int:partner_id>/bookings/active', methods=['GET'])
def get_partner_active_bookings(partner_id):
    """Get count of active (confirmed) bookings for a partner's services"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Get partner type
        cur.execute("""
            SELECT partner_type FROM users WHERE id = %s
        """, (partner_id,))
        partner_row = cur.fetchone()
        
        if not partner_row:
            cur.close()
            conn.close()
            return jsonify({'error': 'Partner not found'}), 404
        
        partner_type = partner_row[0]
        active_bookings = 0
        
        # Count confirmed bookings based on partner type
        # Bookings are linked through customizations JSONB field
        if partner_type == 'accommodation':
            # Count bookings with room upgrades from this partner's accommodations
            cur.execute("""
                SELECT COUNT(DISTINCT b.id)
                FROM bookings b
                CROSS JOIN LATERAL jsonb_extract_path(b.customizations, 'room_upgrade') AS room_upgrade
                WHERE b.status = 'confirmed'
                  AND room_upgrade IS NOT NULL
                  AND EXISTS (
                      SELECT 1 
                      FROM accommodation_rooms ar
                      INNER JOIN accommodation_services acs ON ar.accommodation_id = acs.id
                      WHERE acs.partner_id = %s
                        AND ar.id = (room_upgrade->>'room_id')::integer
                  )
            """, (partner_id,))
            row = cur.fetchone()
            active_bookings = int(row[0]) if row and row[0] else 0
            
        elif partner_type == 'restaurant':
            # Count bookings with selected meals from this partner's restaurants
            cur.execute("""
                SELECT COUNT(DISTINCT b.id)
                FROM bookings b
                CROSS JOIN LATERAL jsonb_array_elements(
                    COALESCE(b.customizations->'selected_meals', '[]'::jsonb)
                ) AS meal
                WHERE b.status = 'confirmed'
                  AND EXISTS (
                      SELECT 1
                      FROM restaurant_set_meals rsm
                      INNER JOIN restaurant_services rs ON rsm.restaurant_id = rs.id
                      WHERE rs.partner_id = %s
                        AND rsm.id = (meal->>'meal_id')::integer
                  )
            """, (partner_id,))
            row = cur.fetchone()
            active_bookings = int(row[0]) if row and row[0] else 0
            
        elif partner_type == 'transportation':
            # Count bookings using this partner's transportation services
            cur.execute("""
                SELECT COUNT(DISTINCT b.id)
                FROM bookings b
                INNER JOIN tour_schedules ts ON b.tour_schedule_id = ts.id
                WHERE b.status = 'confirmed'
                  AND EXISTS (
                      SELECT 1
                      FROM tour_services tsv
                      WHERE tsv.tour_id = ts.tour_id
                        AND tsv.service_type = 'transportation'
                        AND tsv.transportation_id IN (
                            SELECT id FROM transportation_services WHERE partner_id = %s
                        )
                  )
            """, (partner_id,))
            row = cur.fetchone()
            active_bookings = int(row[0]) if row and row[0] else 0
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'active_bookings': active_bookings,
            'partner_type': partner_type
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching active bookings: {str(e)}'
        }), 500

@partner_revenue_routes.route('/partner-revenue/all', methods=['GET'])
def get_all_partner_revenue():
    """Get all partners' aggregated revenue sorted by amount (highest to lowest)"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Get all partner revenue sorted by amount (descending)
        cur.execute("""
            SELECT 
                pr.id,
                pr.partner_id,
                pr.amount,
                pr.created_at,
                pr.updated_at,
                u.username as partner_name,
                u.partner_type,
                u.email
            FROM partner_revenue pr
            INNER JOIN users u ON pr.partner_id = u.id
            ORDER BY pr.amount DESC
        """)
        
        rows = cur.fetchall()
        revenues = []
        
        for row in rows:
            revenues.append({
                'id': row[0],
                'partner_id': row[1],
                'amount': float(row[2]),
                'created_at': row[3].isoformat() if row[3] else None,
                'updated_at': row[4].isoformat() if row[4] else None,
                'partner_name': row[5],
                'partner_type': row[6],
                'email': row[7]
            })
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'revenues': revenues,
            'total_partners': len(revenues)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching partner revenues: {str(e)}'
        }), 500


@partner_revenue_routes.route('/partners/summary', methods=['GET'])
def get_partners_summary():
    """
    List all partners with avatar, type, and count of completed tours participated.
    A completed tour count is derived from paid partner_revenue_pending entries
    joined to tour_schedules -> tours_admin.
    """
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT
                    u.id AS partner_id,
                    u.username AS partner_name,
                    u.avatar_url,
                    u.partner_type,
                    COALESCE(tour_counts.support_tours, 0) AS support_tours
                FROM users u
                LEFT JOIN (
                    SELECT
                        p.id AS partner_id,
                        COUNT(DISTINCT ts.tour_id) AS support_tours
                    FROM users p
                    LEFT JOIN tour_services ts ON
                        (ts.accommodation_id IN (SELECT id FROM accommodation_services WHERE partner_id = p.id))
                        OR (ts.restaurant_id IN (SELECT id FROM restaurant_services WHERE partner_id = p.id))
                        OR (ts.transportation_id IN (SELECT id FROM transportation_services WHERE partner_id = p.id))
                    WHERE p.role = 'partner'
                    GROUP BY p.id
                ) tour_counts ON tour_counts.partner_id = u.id
                WHERE u.role = 'partner'
                ORDER BY u.username;
            """)

            rows = cur.fetchall()
            partners = [{
                'partner_id': row[0],
                'partner_name': row[1],
                'avatar_url': row[2],
                'partner_type': row[3],
                'support_tours': int(row[4]) if row[4] is not None else 0
            } for row in rows]

            return jsonify({
                'success': True,
                'partners': partners,
                'total_partners': len(partners)
            })

        except Exception as e:
            conn.rollback()
            return jsonify({'success': False, 'message': f'Error fetching partners: {str(e)}'}), 500
        finally:
            cur.close()
            conn.close()

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500


@partner_revenue_routes.route('/partners/<int:partner_id>/detail', methods=['GET'])
def get_partner_detail(partner_id):
    """
    Detailed partner view:
    - partner profile
    - tours supported by this partner (via tour_services)
    - services owned by the partner
    - reviews on tours the partner supports
    """
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cur = conn.cursor()
        try:
            # Partner profile
            cur.execute("""
                SELECT id, username, avatar_url, partner_type, email, phone
                FROM users
                WHERE id = %s AND role = 'partner'
            """, (partner_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({'success': False, 'message': 'Partner not found'}), 404

            partner = {
                'id': row[0],
                'name': row[1],
                'avatar_url': row[2],
                'partner_type': row[3],
                'email': row[4],
                'phone': row[5],
            }

            # Calculate average rating from service_reviews for this partner's services
            cur.execute("""
                SELECT 
                    COALESCE(AVG(sr.rating), 0) AS avg_rating,
                    COUNT(sr.id) AS review_count
                FROM service_reviews sr
                WHERE (
                    (sr.service_type = 'accommodation' AND sr.service_id IN (SELECT id FROM accommodation_services WHERE partner_id = %s))
                    OR (sr.service_type = 'restaurant' AND sr.service_id IN (SELECT id FROM restaurant_services WHERE partner_id = %s))
                    OR (sr.service_type = 'transportation' AND sr.service_id IN (SELECT id FROM transportation_services WHERE partner_id = %s))
                );
            """, (partner_id, partner_id, partner_id))
            rating_row = cur.fetchone()
            partner['rating'] = float(rating_row[0]) if rating_row and rating_row[0] is not None else 0.0
            partner['review_count'] = int(rating_row[1]) if rating_row and rating_row[1] is not None else 0

            # Collect tour ids supported by this partner via any service
            cur.execute("""
                WITH partner_tours AS (
                    SELECT DISTINCT ts.tour_id
                    FROM tour_services ts
                    LEFT JOIN accommodation_services ac ON ts.accommodation_id = ac.id
                    LEFT JOIN restaurant_services rs ON ts.restaurant_id = rs.id
                    LEFT JOIN transportation_services tr ON ts.transportation_id = tr.id
                    WHERE (ac.partner_id = %s) OR (rs.partner_id = %s) OR (tr.partner_id = %s)
                )
                SELECT 
                    t.id,
                    t.name,
                    t.total_price,
                    t.duration,
                    t.is_published,
                    (
                        SELECT image_url 
                        FROM tour_images ti 
                        WHERE ti.tour_id = t.id
                        ORDER BY ti.is_primary DESC, ti.display_order ASC, ti.id ASC
                        LIMIT 1
                    ) AS image_url,
                    (
                        SELECT COUNT(*) FROM bookings b 
                        WHERE b.tour_id = t.id AND b.status = 'completed'
                    ) AS completed_bookings
                FROM tours_admin t
                INNER JOIN partner_tours pt ON pt.tour_id = t.id
                ORDER BY completed_bookings DESC, t.name
            """, (partner_id, partner_id, partner_id))

            tours = []
            for tr in cur.fetchall():
                tours.append({
                    'tour_id': tr[0],
                    'name': tr[1],
                    'total_price': float(tr[2]) if tr[2] is not None else None,
                    'duration': tr[3],
                    'is_published': tr[4],
                    'image_url': tr[5],
                    'completed_bookings': tr[6] or 0,
                })

            # Services owned by partner (simple lists)
            services = {
                'accommodations': [],
                'restaurants': [],
                'transportations': []
            }

            cur.execute("""
                SELECT id, name FROM accommodation_services WHERE partner_id = %s ORDER BY name
            """, (partner_id,))
            services['accommodations'] = [{'id': r[0], 'name': r[1]} for r in cur.fetchall()]

            cur.execute("""
                SELECT id, name FROM restaurant_services WHERE partner_id = %s ORDER BY name
            """, (partner_id,))
            services['restaurants'] = [{'id': r[0], 'name': r[1]} for r in cur.fetchall()]

            cur.execute("""
                SELECT id, license_plate FROM transportation_services WHERE partner_id = %s ORDER BY license_plate
            """, (partner_id,))
            services['transportations'] = [{'id': r[0], 'name': r[1]} for r in cur.fetchall()]

            # Reviews on tours the partner supports
            cur.execute("""
                WITH partner_tours AS (
                    SELECT DISTINCT ts.tour_id
                    FROM tour_services ts
                    LEFT JOIN accommodation_services ac ON ts.accommodation_id = ac.id
                    LEFT JOIN restaurant_services rs ON ts.restaurant_id = rs.id
                    LEFT JOIN transportation_services tr ON ts.transportation_id = tr.id
                    WHERE (ac.partner_id = %s) OR (rs.partner_id = %s) OR (tr.partner_id = %s)
                )
                SELECT
                    tr.id,
                    tr.tour_id,
                    t.name AS tour_name,
                    tr.user_id,
                    tr.rating,
                    tr.review_text,
                    tr.created_at
                FROM tour_reviews tr
                INNER JOIN partner_tours pt ON pt.tour_id = tr.tour_id
                INNER JOIN tours_admin t ON t.id = tr.tour_id
                ORDER BY tr.created_at DESC
                LIMIT 50;
            """, (partner_id, partner_id, partner_id))

            reviews = []
            for r in cur.fetchall():
                reviews.append({
                    'id': r[0],
                    'tour_id': r[1],
                    'tour_name': r[2],
                    'user_id': r[3],
                    'rating': float(r[4]) if r[4] is not None else None,
                    'comment': r[5],
                    'created_at': r[6].isoformat() if r[6] else None,
                    'can_delete': True  # Admin can delete via existing review endpoints
                })

            return jsonify({
                'success': True,
                'partner': partner,
                'tours': tours,
                'services': services,
                'reviews': reviews
            })

        except Exception as e:
            conn.rollback()
            return jsonify({'success': False, 'message': f'Error fetching partner detail: {str(e)}'}), 500
        finally:
            cur.close()
            conn.close()

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500