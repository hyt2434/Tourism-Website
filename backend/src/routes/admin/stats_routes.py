"""
Admin routes for Dashboard Statistics.
"""

from flask import Blueprint, request, jsonify
from config.database import get_connection
from src.routes.user.auth_routes import admin_required
from datetime import datetime

stats_bp = Blueprint('admin_stats', __name__, url_prefix='/api/admin/stats')


@stats_bp.route('/', methods=['GET'])
@admin_required
def get_dashboard_stats():
    """
    Get dashboard statistics for admin panel.
    Returns:
    - total_users: Total number of users
    - active_partners: Number of users with role='partner' and status='active'
    - pending_approvals: Number of pending partner registrations
    """
    conn = get_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cur = conn.cursor()
    
    try:
        # Get total users count
        cur.execute("SELECT COUNT(*) FROM users")
        total_users = cur.fetchone()[0]
        
        # Get active partners count (users with role='partner' and status='active')
        cur.execute("""
            SELECT COUNT(*) 
            FROM users 
            WHERE role = 'partner' 
            AND COALESCE(status, 'active') = 'active'
        """)
        active_partners = cur.fetchone()[0]
        
        # Get pending partner registrations count
        cur.execute("""
            SELECT COUNT(*) 
            FROM partner_registrations 
            WHERE status = 'pending'
        """)
        pending_approvals = cur.fetchone()[0]
        
        return jsonify({
            "total_users": total_users,
            "active_partners": active_partners,
            "pending_approvals": pending_approvals
        }), 200
    
    except Exception as e:
        return jsonify({"error": f"Failed to fetch stats: {str(e)}"}), 500
    
    finally:
        cur.close()
        conn.close()

