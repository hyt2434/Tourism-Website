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
