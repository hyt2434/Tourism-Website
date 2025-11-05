from flask import Blueprint, jsonify, request
from database import get_connection
from psycopg2.extras import RealDictCursor
import logging
promotion_routes = Blueprint('promotion_routes', __name__)

# --- API 1: LẤY TẤT CẢ KHUYẾN MÃI (cho Bảng Admin) ---
@promotion_routes.route('/', methods=['GET'])
def get_promotions():
    """
    Lấy danh sách tất cả khuyến mãi
    (Dùng cho trang Admin - PromotionsTab.jsx)
    """
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM promotions ORDER BY created_at DESC")
        promotions = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify(promotions), 200
    except Exception as e:
        logging.error(f"CAN'T GET LIST OF promotions: {e}")
        return jsonify({"error": "SERVER ERROR"}), 500

# --- API 2: TẠO KHUYẾN MÃI MỚI (cho Nút "Create" trong Dialog) ---
@promotion_routes.route('/', methods=['POST'])
def create_promotion():
    """
    Tạo một khuyến mãi mới
    (Dùng cho Dialog "New Promotion" trong PromotionsTab.jsx)
    """
    try:
        data = request.json
        
        code = data.get('code')
        discount_type = data.get('discount_type')
        discount_value = data.get('discount_value')
        max_uses = data.get('max_uses')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        conditions = data.get('conditions')
        is_active = data.get('is_active', True)
        show_on_homepage = data.get('show_on_homepage', False)

        if not code or not discount_type or not discount_value:
            return jsonify({"error": "MISSING INFORMATION (code, type, value)"}), 400

        sql_query = """
        INSERT INTO promotions 
        (code, discount_type, discount_value, max_uses, start_date, end_date, conditions, is_active, show_on_homepage)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *
        """
        sql_params = (
            code, discount_type, discount_value, max_uses, 
            start_date, end_date, conditions, 
            is_active, show_on_homepage
        )

        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(sql_query, sql_params)
        new_promotion = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify(new_promotion), 201 

    except Exception as e:
        conn.rollback()
        logging.error(f"CAN'T CREATE promotion: {e}")
        return jsonify({"error": "SERVER ERROR"}), 500