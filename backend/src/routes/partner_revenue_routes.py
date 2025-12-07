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
