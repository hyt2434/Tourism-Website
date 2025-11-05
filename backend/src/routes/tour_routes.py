from flask import Blueprint, request, jsonify
from src.database import get_connection
from psycopg2.extras import RealDictCursor # Dùng RealDictCursor cho tiện

tour_routes = Blueprint('tour_routes', __name__)

@tour_routes.route('/', methods=['GET'])
def get_tours():
    """
    API GET /api/tours to get tours list, aided by filtering.
    """
    
    search_query = request.args.get('search')
    region_id = request.args.get('region')
    province_id = request.args.get('province')
    tour_type_id = request.args.get('type')
    min_rating = request.args.get('rating')
    max_price = request.args.get('price')
    start_date = request.args.get('start_date')

    sql_select = """
    SELECT 
        t.*, 
        p.name as province_name, 
        r.name as region_name
    FROM tours t
    LEFT JOIN provinces p ON t.province_id = p.id
    LEFT JOIN regions r ON p.region_id = r.id
    LEFT JOIN tours_tour_types ttt ON t.id = ttt.tour_id
    """
    
    where_clauses = []
    sql_params = [] 

    if province_id:
        where_clauses.append("t.province_id = %s")
        sql_params.append(province_id)

    if region_id:
        where_clauses.append("r.id = %s")
        sql_params.append(region_id)

    if tour_type_id:
        where_clauses.append("ttt.tour_type_id = %s")
        sql_params.append(tour_type_id)

    if min_rating:
        where_clauses.append("t.rating >= %s")
        sql_params.append(min_rating)

    if max_price:
        where_clauses.append("t.price <= %s")
        sql_params.append(max_price)
        
    if start_date:
        where_clauses.append("t.start_date = %s")
        sql_params.append(start_date)

    if search_query:
        where_clauses.append("(t.name ILIKE %s OR p.name ILIKE %s)")
        sql_params.append(f"%{search_query}%")
        sql_params.append(f"%{search_query}%")

    sql_where = " WHERE 1=1 "
    if where_clauses:
        sql_where += " AND " + " AND ".join(where_clauses)

    sql_group_by = " GROUP BY t.id, p.name, r.name"
    
    final_sql = sql_select + sql_where + sql_group_by

    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute(final_sql, tuple(sql_params))
        tours = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify(tours), 200

    except Exception as e:
        print(f"GETTER TOURS LIST FAILED tour: {e}")
        return jsonify({"error": "SERVER ERROR"}), 500
    
    
# Test 1 (Lấy tất cả): http://localhost:5000/api/tour/ (Trả về 3 tour, nhưng giờ đã có thêm province_name và region_name)

# Test 2 (Lọc theo Tỉnh): http://localhost:5000/api/tour/?province=8 (Chỉ trả về tour Hội An)

# Test 3 (Lọc theo Giá): http://localhost:5000/api/tour/?price=4000000 (Chỉ trả về tour Hội An, vì giá < 4 triệu)