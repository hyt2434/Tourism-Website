from flask import Blueprint, jsonify, request
from config.database import get_connection
from psycopg2.extras import RealDictCursor
import logging
promotion_routes = Blueprint('promotion_routes', __name__)

# --- API 1: LẤY TẤT CẢ KHUYẾN MÃI (cho Bảng Admin) ---
@promotion_routes.route('/', methods=['GET'])
def get_promotions():
    """
    Lấy danh sách tất cả khuyến mãi
    (Dùng cho trang Admin - PromotionsTab.jsx)
    Query params:
    - promotion_type: filter by 'banner' or 'promo_code' (optional)
    """
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get filter parameter
        promotion_type = request.args.get('promotion_type', '', type=str)
        
        if promotion_type and promotion_type in ['banner', 'promo_code']:
            cur.execute(
                "SELECT * FROM promotions WHERE promotion_type = %s ORDER BY created_at DESC",
                (promotion_type,)
            )
        else:
            cur.execute("SELECT * FROM promotions ORDER BY created_at DESC")
        
        promotions = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify(promotions), 200
    except Exception as e:
        logging.error(f"CAN'T GET LIST OF promotions: {e}")
        return jsonify({"error": "SERVER ERROR"}), 500

# --- API 2: LẤY KHUYẾN MÃI CHO HOMEPAGE ---
@promotion_routes.route('/homepage', methods=['GET'])
def get_homepage_promotions():
    """
    Lấy danh sách khuyến mãi hiển thị trên homepage
    (show_on_homepage = true và is_active = true)
    """
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT * FROM promotions 
            WHERE show_on_homepage = true AND is_active = true
            ORDER BY created_at DESC
        """)
        promotions = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify(promotions), 200
    except Exception as e:
        logging.error(f"CAN'T GET HOMEPAGE promotions: {e}")
        return jsonify({"error": "SERVER ERROR"}), 500

# --- API 3: TẠO KHUYẾN MÃI MỚI (cho Nút "Create" trong Dialog) ---
@promotion_routes.route('/', methods=['POST'])
def create_promotion():
    """
    Tạo một khuyến mãi mới
    (Dùng cho Dialog "New Promotion" trong TourManagementTab)
    """
    try:
        data = request.json
        
        # Basic fields
        code = data.get('code')
        discount_type = data.get('discount_type')
        discount_value = data.get('discount_value')
        max_uses = data.get('max_uses')
        # Convert empty strings to None for optional fields
        start_date = data.get('start_date') or None
        end_date = data.get('end_date') or None
        conditions = data.get('conditions') or None
        is_active = data.get('is_active', True)
        show_on_homepage = data.get('show_on_homepage', False)
        
        # Ensure empty strings become None (for date fields especially)
        if start_date == '':
            start_date = None
        if end_date == '':
            end_date = None
        if conditions == '':
            conditions = None
        
        # Homepage banner/promo fields
        promotion_type = data.get('promotion_type', 'promo_code')  # 'banner' or 'promo_code'
        title = data.get('title')
        subtitle = data.get('subtitle')
        image = data.get('image')
        highlight = data.get('highlight')
        terms = data.get('terms', 'Terms & Conditions apply.')

        # For homepage promotions, require title (or use code as fallback for promo codes)
        if show_on_homepage and not title:
            if promotion_type == 'promo_code' and code:
                # Auto-generate title from code for promo codes
                title = f"Use code {code} for discount"
            else:
                return jsonify({"error": "Title is required for homepage promotions"}), 400

        # Validate required fields
        if not code or not discount_type or not discount_value:
            return jsonify({"error": "MISSING INFORMATION (code, type, value)"}), 400

        # Build SQL query dynamically based on available fields
        conn = get_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed"}), 500
            
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            # Check if new columns exist (use a separate connection/transaction for this check)
            cur.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'promotions' AND column_name IN ('promotion_type', 'title', 'subtitle', 'image', 'highlight', 'terms')
            """)
            existing_columns = [row['column_name'] for row in cur.fetchall()]
            
            # Build column list and values
            columns = ['code', 'discount_type', 'discount_value', 'max_uses', 'start_date', 'end_date', 'conditions', 'is_active', 'show_on_homepage']
            values = [code, discount_type, discount_value, max_uses, start_date, end_date, conditions, is_active, show_on_homepage]
            placeholders = ['%s'] * len(values)
            
            # Add new columns if they exist
            if 'promotion_type' in existing_columns:
                columns.append('promotion_type')
                values.append(promotion_type)
                placeholders.append('%s')
            if 'title' in existing_columns:
                columns.append('title')
                values.append(title)
                placeholders.append('%s')
            if 'subtitle' in existing_columns:
                columns.append('subtitle')
                values.append(subtitle)
                placeholders.append('%s')
            if 'image' in existing_columns:
                columns.append('image')
                values.append(image)
                placeholders.append('%s')
            if 'highlight' in existing_columns:
                columns.append('highlight')
                values.append(highlight)
                placeholders.append('%s')
            if 'terms' in existing_columns:
                columns.append('terms')
                values.append(terms)
                placeholders.append('%s')
            
            sql_query = f"""
            INSERT INTO promotions ({', '.join(columns)})
            VALUES ({', '.join(placeholders)})
            RETURNING *
            """
            
            cur.execute(sql_query, tuple(values))
            new_promotion = cur.fetchone()
            
            conn.commit()
            cur.close()
            conn.close()
            
            return jsonify(new_promotion), 201
            
        except Exception as db_error:
            # Rollback on any error
            conn.rollback()
            cur.close()
            conn.close()
            
            # Log the error for debugging
            logging.error(f"Database error creating promotion: {db_error}")
            
            # Try fallback with basic fields only
            try:
                conn = get_connection()
                if conn is None:
                    return jsonify({"error": "Database connection failed"}), 500
                    
                cur = conn.cursor(cursor_factory=RealDictCursor)
                
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

                cur.execute(sql_query, sql_params)
                new_promotion = cur.fetchone()
                
                conn.commit()
                cur.close()
                conn.close()
                
                return jsonify(new_promotion), 201
            except Exception as fallback_error:
                if 'conn' in locals() and conn:
                    conn.rollback()
                    cur.close()
                    conn.close()
                logging.error(f"Fallback insert also failed: {fallback_error}")
                return jsonify({"error": "Failed to create promotion"}), 500

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        logging.error(f"CAN'T CREATE promotion: {e}")
        return jsonify({"error": "SERVER ERROR"}), 500

# --- API 4: CẬP NHẬT KHUYẾN MÃI ---
@promotion_routes.route('/<int:promotion_id>', methods=['PUT'])
def update_promotion(promotion_id):
    """
    Cập nhật một khuyến mãi
    """
    try:
        data = request.json
        
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check if new columns exist
        cur.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'promotions' AND column_name IN ('promotion_type', 'title', 'subtitle', 'image', 'highlight', 'terms')
        """)
        existing_columns = [row['column_name'] for row in cur.fetchall()]
        
        # Build update query dynamically
        updates = []
        values = []
        
        # Convert empty strings to None for optional fields (especially dates)
        start_date = data.get('start_date') or None
        end_date = data.get('end_date') or None
        conditions = data.get('conditions') or None
        
        # Ensure empty strings become None (for date fields especially)
        if start_date == '' or (isinstance(start_date, str) and start_date.strip() == ''):
            start_date = None
        if end_date == '' or (isinstance(end_date, str) and end_date.strip() == ''):
            end_date = None
        if conditions == '' or (isinstance(conditions, str) and conditions.strip() == ''):
            conditions = None
        
        fields = {
            'code': data.get('code'),
            'discount_type': data.get('discount_type'),
            'discount_value': data.get('discount_value'),
            'max_uses': data.get('max_uses'),
            'start_date': start_date,
            'end_date': end_date,
            'conditions': conditions,
            'is_active': data.get('is_active'),
            'show_on_homepage': data.get('show_on_homepage'),
        }
        
        if 'promotion_type' in existing_columns:
            fields['promotion_type'] = data.get('promotion_type')
        if 'title' in existing_columns:
            fields['title'] = data.get('title')
        if 'subtitle' in existing_columns:
            fields['subtitle'] = data.get('subtitle')
        if 'image' in existing_columns:
            fields['image'] = data.get('image')
        if 'highlight' in existing_columns:
            fields['highlight'] = data.get('highlight')
        if 'terms' in existing_columns:
            fields['terms'] = data.get('terms')
        
        # Track which fields were explicitly provided (to allow clearing dates)
        provided_fields = set()
        if 'start_date' in data:
            provided_fields.add('start_date')
        if 'end_date' in data:
            provided_fields.add('end_date')
        
        for key, value in fields.items():
            # Always include field if value is not None
            # For date fields, also include if explicitly provided (even if None, to allow clearing)
            if value is not None:
                updates.append(f"{key} = %s")
                values.append(value)
            elif key in ['start_date', 'end_date'] and key in provided_fields:
                # Allow setting date fields to None to clear them
                updates.append(f"{key} = %s")
                values.append(None)
        
        if not updates:
            return jsonify({"error": "No fields to update"}), 400
        
        values.append(promotion_id)
        
        sql_query = f"""
        UPDATE promotions 
        SET {', '.join(updates)}
        WHERE id = %s
        RETURNING *
        """
        
        # Log for debugging
        logging.info(f"Updating promotion {promotion_id} with fields: {updates}, values: {values}")
        
        cur.execute(sql_query, tuple(values))
        updated_promotion = cur.fetchone()
        
        if not updated_promotion:
            return jsonify({"error": "Promotion not found"}), 404
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify(updated_promotion), 200
        
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        logging.error(f"CAN'T UPDATE promotion: {e}")
        return jsonify({"error": "SERVER ERROR"}), 500

# --- API 5: XÓA KHUYẾN MÃI ---
@promotion_routes.route('/<int:promotion_id>', methods=['DELETE'])
def delete_promotion(promotion_id):
    """
    Xóa một khuyến mãi
    """
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("DELETE FROM promotions WHERE id = %s RETURNING *", (promotion_id,))
        deleted = cur.fetchone()
        
        if not deleted:
            return jsonify({"error": "Promotion not found"}), 404
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({"message": "Promotion deleted successfully"}), 200
        
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        logging.error(f"CAN'T DELETE promotion: {e}")
        return jsonify({"error": "SERVER ERROR"}), 500

# --- API 6: VALIDATE VÀ ÁP DỤNG KHUYẾN MÃI ---
@promotion_routes.route('/validate', methods=['POST'])
def validate_promotion():
    """
    Validate và tính toán discount cho promotion code
    """
    try:
        data = request.json
        code = data.get('code')
        amount = data.get('amount')  # Tổng tiền cần áp dụng discount
        
        if not code:
            return jsonify({"error": "Promotion code is required"}), 400
        
        if not amount or amount <= 0:
            return jsonify({"error": "Valid amount is required"}), 400
        
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Tìm promotion code
        cur.execute("""
            SELECT * FROM promotions 
            WHERE code = %s AND is_active = true
        """, (code.upper(),))
        
        promotion = cur.fetchone()
        
        if not promotion:
            return jsonify({
                "valid": False,
                "error": "Invalid or inactive promotion code"
            }), 200
        
        # Kiểm tra ngày hiệu lực
        from datetime import datetime
        today = datetime.now().date()
        
        if promotion.get('start_date') and promotion['start_date'] > today:
            return jsonify({
                "valid": False,
                "error": "Promotion code is not yet active"
            }), 200
        
        if promotion.get('end_date') and promotion['end_date'] < today:
            return jsonify({
                "valid": False,
                "error": "Promotion code has expired"
            }), 200
        
        # Tính toán discount
        discount_type = promotion.get('discount_type', 'percentage')
        discount_value = float(promotion.get('discount_value', 0))
        
        if discount_type == 'percentage':
            discount_amount = (amount * discount_value) / 100
        else:  # fixed
            discount_amount = discount_value
        
        # Đảm bảo discount không vượt quá tổng tiền
        discount_amount = min(discount_amount, amount)
        final_amount = amount - discount_amount
        
        cur.close()
        conn.close()
        
        return jsonify({
            "valid": True,
            "promotion": {
                "id": promotion.get('id'),
                "code": promotion.get('code'),
                "discount_type": discount_type,
                "discount_value": discount_value,
                "title": promotion.get('title'),
                "subtitle": promotion.get('subtitle')
            },
            "original_amount": amount,
            "discount_amount": discount_amount,
            "final_amount": final_amount
        }), 200
        
    except Exception as e:
        logging.error(f"CAN'T VALIDATE promotion: {e}")
        return jsonify({"error": "SERVER ERROR"}), 500