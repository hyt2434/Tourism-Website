"""
API routes for partner restaurant service management.

Partners can manage their restaurant services including:
- Creating, updating, deleting restaurants
- Managing menu items for each restaurant
- Uploading images
- Managing availability
"""

from flask import Blueprint, request, jsonify
from src.database import get_connection
from datetime import datetime
import json

restaurant_bp = Blueprint('restaurant_services', __name__, url_prefix='/api/partner/restaurants')


# =====================================================================
# RESTAURANT SERVICES ENDPOINTS
# =====================================================================

@restaurant_bp.route('/cities', methods=['GET'])
def get_cities_for_restaurant():
    """Get all cities for restaurant dropdown"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        cur.execute("SELECT id, name, code, region FROM cities ORDER BY name")
        rows = cur.fetchall()
        
        cities = [{
            'id': row[0],
            'name': row[1],
            'code': row[2],
            'region': row[3]
        } for row in rows]
        
        cur.close()
        conn.close()
        
        return jsonify(cities), 200
    except Exception as e:
        print(f"Error fetching cities: {e}")
        return jsonify({'error': str(e)}), 500

@restaurant_bp.route('/', methods=['GET'])
def get_restaurants():
    """Get all restaurants for the current partner"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                id, name, description, cuisine_type, address, city_id,
                phone, email, website, opening_time, closing_time,
                seating_capacity, features, dietary_options, price_range,
                average_cost_per_person, currency, delivery_available,
                takeout_available, is_active, is_verified,
                created_at, updated_at
            FROM restaurant_services
            WHERE partner_id = %s
            ORDER BY created_at DESC
        """, (partner_id,))
        
        rows = cur.fetchall()
        
        restaurants = []
        for row in rows:
            # Get primary image
            cur.execute("""
                SELECT image_url FROM service_images
                WHERE service_type = 'restaurant' AND service_id = %s AND is_primary = TRUE
                LIMIT 1
            """, (row[0],))
            image_row = cur.fetchone()
            
            # Get menu item count
            cur.execute("""
                SELECT COUNT(*) FROM restaurant_menu_items WHERE restaurant_id = %s
            """, (row[0],))
            menu_count = cur.fetchone()[0]
            
            restaurants.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'cuisineType': row[3],
                'address': row[4],
                'cityId': row[5],
                'phone': row[6],
                'email': row[7],
                'website': row[8],
                'openingTime': str(row[9]) if row[9] else None,
                'closingTime': str(row[10]) if row[10] else None,
                'seatingCapacity': row[11],
                'features': row[12] if row[12] else [],
                'dietaryOptions': row[13] if row[13] else [],
                'priceRange': row[14],
                'averageCost': float(row[15]) if row[15] else None,
                'currency': row[16],
                'deliveryAvailable': row[17],
                'takeoutAvailable': row[18],
                'isActive': row[19],
                'isVerified': row[20],
                'primaryImage': image_row[0] if image_row else None,
                'menuItemCount': menu_count,
                'createdAt': row[21].isoformat() if row[21] else None,
                'updatedAt': row[22].isoformat() if row[22] else None
            })
        
        cur.close()
        conn.close()
        
        return jsonify(restaurants), 200
        
    except Exception as e:
        print(f"Error fetching restaurants: {e}")
        return jsonify({'error': str(e)}), 500


@restaurant_bp.route('/', methods=['POST'])
def create_restaurant():
    """Create a new restaurant"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'address']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Insert restaurant
        cur.execute("""
            INSERT INTO restaurant_services (
                partner_id, name, description, cuisine_type, address, city_id,
                latitude, longitude, phone, email, website, opening_time,
                closing_time, opening_hours, seating_capacity, features,
                dietary_options, price_range, average_cost_per_person, currency,
                delivery_available, takeout_available, reservation_required,
                dress_code, cancellation_policy
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            partner_id,
            data['name'],
            data.get('description'),
            data.get('cuisineType'),
            data['address'],
            data.get('cityId'),
            data.get('latitude'),
            data.get('longitude'),
            data.get('phone'),
            data.get('email'),
            data.get('website'),
            data.get('openingTime'),
            data.get('closingTime'),
            data.get('openingHours'),
            data.get('seatingCapacity'),
            data.get('features', []),
            data.get('dietaryOptions', []),
            data.get('priceRange'),
            data.get('averageCost'),
            data.get('currency', 'VND'),
            data.get('deliveryAvailable', False),
            data.get('takeoutAvailable', True),
            data.get('reservationRequired', False),
            data.get('dressCode'),
            data.get('cancellationPolicy')
        ))
        
        restaurant_id = cur.fetchone()[0]
        
        # Insert images if provided
        if data.get('images'):
            for idx, image_url in enumerate(data['images']):
                cur.execute("""
                    INSERT INTO service_images (service_type, service_id, image_url, is_primary, display_order)
                    VALUES ('restaurant', %s, %s, %s, %s)
                """, (restaurant_id, image_url, idx == 0, idx))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message': 'Restaurant created successfully',
            'id': restaurant_id
        }), 201
        
    except Exception as e:
        print(f"Error creating restaurant: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


@restaurant_bp.route('/<int:restaurant_id>', methods=['GET'])
def get_restaurant(restaurant_id):
    """Get a specific restaurant with all details"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                id, partner_id, name, description, cuisine_type, address, city_id,
                latitude, longitude, phone, email, website, opening_time,
                closing_time, opening_hours, seating_capacity, features,
                dietary_options, price_range, average_cost_per_person, currency,
                delivery_available, takeout_available, reservation_required,
                dress_code, cancellation_policy, is_active, is_verified,
                created_at, updated_at
            FROM restaurant_services
            WHERE id = %s
        """, (restaurant_id,))
        
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return jsonify({'error': 'Restaurant not found'}), 404
        
        # Check ownership
        if partner_id and str(row[1]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get images
        cur.execute("""
            SELECT id, image_url, caption, is_primary, display_order
            FROM service_images
            WHERE service_type = 'restaurant' AND service_id = %s
            ORDER BY display_order
        """, (restaurant_id,))
        
        images = []
        for img_row in cur.fetchall():
            images.append({
                'id': img_row[0],
                'url': img_row[1],
                'caption': img_row[2],
                'isPrimary': img_row[3],
                'displayOrder': img_row[4]
            })
        
        restaurant = {
            'id': row[0],
            'partnerId': row[1],
            'name': row[2],
            'description': row[3],
            'cuisineType': row[4],
            'address': row[5],
            'cityId': row[6],
            'latitude': float(row[7]) if row[7] else None,
            'longitude': float(row[8]) if row[8] else None,
            'phone': row[9],
            'email': row[10],
            'website': row[11],
            'openingTime': str(row[12]) if row[12] else None,
            'closingTime': str(row[13]) if row[13] else None,
            'openingHours': row[14],
            'seatingCapacity': row[15],
            'features': row[16] if row[16] else [],
            'dietaryOptions': row[17] if row[17] else [],
            'priceRange': row[18],
            'averageCost': float(row[19]) if row[19] else None,
            'currency': row[20],
            'deliveryAvailable': row[21],
            'takeoutAvailable': row[22],
            'reservationRequired': row[23],
            'dressCode': row[24],
            'cancellationPolicy': row[25],
            'isActive': row[26],
            'isVerified': row[27],
            'images': images,
            'createdAt': row[28].isoformat() if row[28] else None,
            'updatedAt': row[29].isoformat() if row[29] else None
        }
        
        cur.close()
        conn.close()
        
        return jsonify(restaurant), 200
        
    except Exception as e:
        print(f"Error fetching restaurant: {e}")
        return jsonify({'error': str(e)}), 500


@restaurant_bp.route('/<int:restaurant_id>', methods=['PUT'])
def update_restaurant(restaurant_id):
    """Update a restaurant"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Verify ownership
        cur.execute("SELECT partner_id FROM restaurant_services WHERE id = %s", (restaurant_id,))
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return jsonify({'error': 'Restaurant not found'}), 404
        
        if str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update restaurant - use explicit NULL handling for proper updates
        update_fields = []
        update_values = []
        
        if 'name' in data:
            update_fields.append('name = %s')
            update_values.append(data['name'])
        if 'description' in data:
            update_fields.append('description = %s')
            update_values.append(data['description'])
        if 'cuisineType' in data:
            update_fields.append('cuisine_type = %s')
            update_values.append(data['cuisineType'])
        if 'address' in data:
            update_fields.append('address = %s')
            update_values.append(data['address'])
        if 'cityId' in data:
            update_fields.append('city_id = %s')
            update_values.append(data['cityId'])
        if 'phone' in data:
            update_fields.append('phone = %s')
            update_values.append(data['phone'])
        if 'email' in data:
            update_fields.append('email = %s')
            update_values.append(data['email'])
        if 'website' in data:
            update_fields.append('website = %s')
            update_values.append(data['website'])
        if 'openingTime' in data:
            update_fields.append('opening_time = %s')
            update_values.append(data['openingTime'])
        if 'closingTime' in data:
            update_fields.append('closing_time = %s')
            update_values.append(data['closingTime'])
        if 'openingHours' in data:
            update_fields.append('opening_hours = %s')
            update_values.append(data['openingHours'])
        if 'seatingCapacity' in data:
            update_fields.append('seating_capacity = %s')
            update_values.append(data['seatingCapacity'])
        if 'features' in data:
            update_fields.append('features = %s')
            update_values.append(data['features'])
        if 'dietaryOptions' in data:
            update_fields.append('dietary_options = %s')
            update_values.append(data['dietaryOptions'])
        if 'priceRange' in data:
            update_fields.append('price_range = %s')
            update_values.append(data['priceRange'])
        if 'averageCost' in data:
            update_fields.append('average_cost_per_person = %s')
            update_values.append(data['averageCost'])
        if 'deliveryAvailable' in data:
            update_fields.append('delivery_available = %s')
            update_values.append(data['deliveryAvailable'])
        if 'takeoutAvailable' in data:
            update_fields.append('takeout_available = %s')
            update_values.append(data['takeoutAvailable'])
        
        update_fields.append('updated_at = CURRENT_TIMESTAMP')
        update_values.append(restaurant_id)
        
        if len(update_fields) > 1:  # More than just updated_at
            query = f"UPDATE restaurant_services SET {', '.join(update_fields)} WHERE id = %s"
            cur.execute(query, update_values)
        
        # Handle images if provided (only update if images array is explicitly sent and not empty)
        if 'images' in data and data['images'] is not None and len(data['images']) > 0:
            # Delete existing images
            cur.execute("""
                DELETE FROM service_images 
                WHERE service_type = 'restaurant' AND service_id = %s
            """, (restaurant_id,))
            
            # Insert new images
            for idx, image_url in enumerate(data['images']):
                cur.execute("""
                    INSERT INTO service_images (service_type, service_id, image_url, is_primary, display_order)
                    VALUES ('restaurant', %s, %s, %s, %s)
                """, (restaurant_id, image_url, idx == 0, idx))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Restaurant updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating restaurant: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


@restaurant_bp.route('/<int:restaurant_id>', methods=['DELETE'])
def delete_restaurant(restaurant_id):
    """Delete a restaurant"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Verify ownership
        cur.execute("SELECT partner_id FROM restaurant_services WHERE id = %s", (restaurant_id,))
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return jsonify({'error': 'Restaurant not found'}), 404
        
        if str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete restaurant (cascade handles menu items and images)
        cur.execute("DELETE FROM restaurant_services WHERE id = %s", (restaurant_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Restaurant deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting restaurant: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


# =====================================================================
# MENU ITEMS ENDPOINTS
# =====================================================================

@restaurant_bp.route('/<int:restaurant_id>/menu', methods=['GET'])
def get_menu_items(restaurant_id):
    """Get all menu items for a restaurant"""
    try:
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                id, name, description, category, price, currency,
                portion_size, preparation_time, calories,
                is_vegetarian, is_vegan, is_gluten_free, is_spicy,
                spice_level, allergens, ingredients, is_available,
                is_popular, is_special, meal_types,
                created_at, updated_at
            FROM restaurant_menu_items
            WHERE restaurant_id = %s
            ORDER BY category, name
        """, (restaurant_id,))
        
        rows = cur.fetchall()
        
        menu_items = []
        for row in rows:
            # Get menu item images from service_images table
            cur.execute("""
                SELECT id, image_url, caption, is_primary, display_order
                FROM service_images
                WHERE service_type = 'menu_item' AND service_id = %s
                ORDER BY display_order
            """, (row[0],))
            
            images = []
            for img_row in cur.fetchall():
                images.append({
                    'id': img_row[0],
                    'url': img_row[1],
                    'caption': img_row[2],
                    'isPrimary': img_row[3],
                    'displayOrder': img_row[4]
                })
            
            menu_items.append({
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'category': row[3],
                'price': float(row[4]) if row[4] else None,
                'currency': row[5],
                'portionSize': row[6],
                'preparationTime': row[7],
                'calories': row[8],
                'isVegetarian': row[9],
                'isVegan': row[10],
                'isGlutenFree': row[11],
                'isSpicy': row[12],
                'spiceLevel': row[13],
                'allergens': row[14] if row[14] else [],
                'ingredients': row[15] if row[15] else [],
                'isAvailable': row[16],
                'isPopular': row[17],
                'isSpecial': row[18],
                'mealTypes': row[19] if row[19] else {'breakfast': False, 'lunch': False, 'dinner': False},
                'images': images,
                'createdAt': row[20].isoformat() if row[20] else None,
                'updatedAt': row[21].isoformat() if row[21] else None
            })
        
        cur.close()
        conn.close()
        
        return jsonify(menu_items), 200
        
    except Exception as e:
        print(f"Error fetching menu items: {e}")
        return jsonify({'error': str(e)}), 500


@restaurant_bp.route('/<int:restaurant_id>/menu', methods=['POST'])
def create_menu_item(restaurant_id):
    """Create a new menu item"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Verify ownership of restaurant
        cur.execute("SELECT partner_id FROM restaurant_services WHERE id = %s", (restaurant_id,))
        row = cur.fetchone()
        
        if not row or str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Insert menu item
        cur.execute("""
            INSERT INTO restaurant_menu_items (
                restaurant_id, name, description, category, price, currency,
                portion_size, preparation_time, calories, is_vegetarian,
                is_vegan, is_gluten_free, is_spicy, spice_level,
                allergens, ingredients, is_popular, is_special, meal_types
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            restaurant_id,
            data['name'],
            data.get('description'),
            data.get('category'),
            data['price'],
            data.get('currency', 'VND'),
            data.get('portionSize'),
            data.get('preparationTime'),
            data.get('calories'),
            data.get('isVegetarian', False),
            data.get('isVegan', False),
            data.get('isGlutenFree', False),
            data.get('isSpicy', False),
            data.get('spiceLevel'),
            data.get('allergens', []),
            data.get('ingredients', []),
            data.get('isPopular', False),
            data.get('isSpecial', False),
            json.dumps(data.get('mealTypes', {'breakfast': False, 'lunch': False, 'dinner': False}))
        ))
        
        menu_item_id = cur.fetchone()[0]
        
        # Insert images if provided
        if data.get('images'):
            for idx, image_url in enumerate(data['images']):
                cur.execute("""
                    INSERT INTO service_images (service_type, service_id, image_url, is_primary, display_order)
                    VALUES ('menu_item', %s, %s, %s, %s)
                """, (menu_item_id, image_url, idx == 0, idx))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message': 'Menu item created successfully',
            'id': menu_item_id
        }), 201
        
    except Exception as e:
        print(f"Error creating menu item: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


@restaurant_bp.route('/<int:restaurant_id>/menu/<int:menu_item_id>', methods=['PUT'])
def update_menu_item(restaurant_id, menu_item_id):
    """Update a menu item"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Verify ownership
        cur.execute("""
            SELECT rs.partner_id 
            FROM restaurant_menu_items rmi
            JOIN restaurant_services rs ON rmi.restaurant_id = rs.id
            WHERE rmi.id = %s AND rmi.restaurant_id = %s
        """, (menu_item_id, restaurant_id))
        
        row = cur.fetchone()
        
        if not row or str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update menu item
        cur.execute("""
            UPDATE restaurant_menu_items SET
                name = COALESCE(%s, name),
                description = COALESCE(%s, description),
                category = COALESCE(%s, category),
                price = COALESCE(%s, price),
                portion_size = COALESCE(%s, portion_size),
                is_available = COALESCE(%s, is_available),
                is_popular = COALESCE(%s, is_popular),
                is_special = COALESCE(%s, is_special),
                meal_types = COALESCE(%s::jsonb, meal_types),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (
            data.get('name'),
            data.get('description'),
            data.get('category'),
            data.get('price'),
            data.get('portionSize'),
            data.get('isAvailable'),
            data.get('isPopular'),
            data.get('isSpecial'),
            json.dumps(data.get('mealTypes')) if data.get('mealTypes') else None,
            menu_item_id
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Menu item updated successfully'}), 200
        
    except Exception as e:
        print(f"Error updating menu item: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500


@restaurant_bp.route('/<int:restaurant_id>/menu/<int:menu_item_id>', methods=['DELETE'])
def delete_menu_item(restaurant_id, menu_item_id):
    """Delete a menu item"""
    try:
        partner_id = request.headers.get('X-User-ID')
        
        if not partner_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        conn = get_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cur = conn.cursor()
        
        # Verify ownership
        cur.execute("""
            SELECT rs.partner_id 
            FROM restaurant_menu_items rmi
            JOIN restaurant_services rs ON rmi.restaurant_id = rs.id
            WHERE rmi.id = %s AND rmi.restaurant_id = %s
        """, (menu_item_id, restaurant_id))
        
        row = cur.fetchone()
        
        if not row or str(row[0]) != str(partner_id):
            cur.close()
            conn.close()
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete menu item
        cur.execute("DELETE FROM restaurant_menu_items WHERE id = %s", (menu_item_id,))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'message': 'Menu item deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting menu item: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': str(e)}), 500
