from flask import Blueprint, request, jsonify, current_app, url_for
from config.database import get_connection
from datetime import datetime
import re
import os
import time
from werkzeug.utils import secure_filename
try:
    from unidecode import unidecode
except ImportError:
    # Fallback if unidecode is not available
    def unidecode(text):
        return text

social_routes = Blueprint('social_routes', __name__)


def _detect_vietnamese(text):
    """Check if text contains Vietnamese characters."""
    if not text:
        return False
    vietnamese_regex = re.compile(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]')
    return bool(vietnamese_regex.search(text))


def _separate_languages(text):
    """
    Separate text into English and Vietnamese parts.
    Returns (en_text, vi_text) tuple.
    """
    if not text:
        return ("", "")
    
    # Check if text contains Vietnamese
    has_vietnamese = _detect_vietnamese(text)
    
    if has_vietnamese:
        # Try to extract English and Vietnamese parts
        # Simple approach: split by common patterns or assume all is Vietnamese if it contains Vietnamese chars
        # For now, if it has Vietnamese, treat as Vietnamese; otherwise English
        # This is a simple implementation - can be improved with better NLP
        words = text.split()
        en_words = []
        vi_words = []
        
        for word in words:
            if _detect_vietnamese(word):
                vi_words.append(word)
            else:
                # Check if it's likely English (contains only ASCII letters)
                if re.match(r'^[a-zA-Z0-9\s\.,!?;:\-\'"]+$', word):
                    en_words.append(word)
                else:
                    vi_words.append(word)
        
        en_text = " ".join(en_words).strip() if en_words else ""
        vi_text = " ".join(vi_words).strip() if vi_words else text.strip()
        
        # If no English words found, all text is Vietnamese
        if not en_text:
            vi_text = text.strip()
            en_text = ""
    else:
        # All English
        en_text = text.strip()
        vi_text = ""
    
    return (en_text, vi_text)


def auto_post_from_tour_review(review_id, tour_id, user_id, review_images, review_text, conn=None):
    """
    Helper function to automatically create a post from a tour review.
    Called when a tour review with images is created.
    """
    should_close_conn = False
    if conn is None:
        conn = get_connection()
        if conn is None:
            print("❌ Cannot auto-post: Database connection failed.")
            return None
        should_close_conn = True
    
    cur = conn.cursor()
    
    try:
        # Check if review has images
        if not review_images or len(review_images) == 0:
            return None
        
        # Check if post already exists for this review
        cur.execute("""
            SELECT id FROM posts 
            WHERE tour_reviews_id = %s
        """, (review_id,))
        
        if cur.fetchone():
            return None  # Post already exists
        
        # Get tour information including destination city and review deleted_at
        cur.execute("""
            SELECT 
                t.name as tour_name,
                t.destination_city_id,
                c.name as city_name,
                tr.deleted_at
            FROM tours_admin t
            JOIN cities c ON t.destination_city_id = c.id
            JOIN tour_reviews tr ON tr.id = %s AND tr.tour_id = t.id
            WHERE t.id = %s
        """, (review_id, tour_id))
        
        tour_info = cur.fetchone()
        if not tour_info:
            return None
        
        tour_name, city_id, city_name, deleted_at = tour_info
        
        # Generate hashtags
        hashtags = []
        
        # Destination city hashtag
        cur.execute("""
            SELECT hashtag FROM social_hashtag 
            WHERE source_type = 'city' AND source_id = %s
            LIMIT 1
        """, (city_id,))
        city_hashtag_row = cur.fetchone()
        if city_hashtag_row:
            hashtags.append(city_hashtag_row[0])
        
        # Tour hashtag
        cur.execute("""
            SELECT hashtag FROM social_hashtag 
            WHERE source_type = 'tour' AND source_id = %s
            LIMIT 1
        """, (tour_id,))
        tour_hashtag_row = cur.fetchone()
        if tour_hashtag_row:
            hashtags.append(tour_hashtag_row[0])
        
        # Use first image
        image_url = review_images[0] if isinstance(review_images, list) else review_images
        
        # Separate English and Vietnamese content
        en_content, vi_content = _separate_languages(review_text or "")
        
        # Default content if review_text is empty
        if not review_text:
            en_content = "Amazing tour experience!"
            vi_content = "Trải nghiệm tour tuyệt vời!"
        
        # Create post with new columns
        cur.execute("""
            INSERT INTO posts (author_id, content, image_url, hashtags, tour_reviews_id, en_content, vi_content, deleted_at_tour_reviews)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (user_id, review_text or en_content or vi_content, image_url, hashtags, review_id, en_content, vi_content, deleted_at))
        
        post_id = cur.fetchone()[0]
        
        # Update hashtag usage counts
        for hashtag in hashtags:
            cur.execute("""
                UPDATE social_hashtag 
                SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP
                WHERE hashtag = %s
            """, (hashtag,))
        
        if should_close_conn:
            conn.commit()
        
        print(f"✅ Auto-created post {post_id} from tour review {review_id}")
        return post_id
        
    except Exception as e:
        print(f"❌ Error auto-posting from tour review: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        cur.close()
        if should_close_conn and conn:
            conn.close()


def auto_post_from_service_review(service_review_id, tour_id, user_id, review_images, review_text, service_type, conn=None):
    """
    Helper function to automatically create a post from a service review.
    Called when a service review with images is created.
    """
    should_close_conn = False
    if conn is None:
        conn = get_connection()
        if conn is None:
            print("❌ Cannot auto-post: Database connection failed.")
            return None
        should_close_conn = True
    
    cur = conn.cursor()
    
    try:
        # Check if review has images
        if not review_images or len(review_images) == 0:
            return None
        
        # Check if post already exists for this review
        cur.execute("""
            SELECT id FROM posts 
            WHERE service_reviews_id = %s
        """, (service_review_id,))
        
        if cur.fetchone():
            return None  # Post already exists
        
        # Get tour information including destination city and review deleted_at
        cur.execute("""
            SELECT 
                t.name as tour_name,
                t.destination_city_id,
                c.name as city_name,
                sr.deleted_at
            FROM tours_admin t
            JOIN cities c ON t.destination_city_id = c.id
            JOIN service_reviews sr ON sr.id = %s
            JOIN tour_services ts ON sr.tour_service_id = ts.id AND ts.tour_id = t.id
            WHERE t.id = %s
        """, (service_review_id, tour_id))
        
        tour_info = cur.fetchone()
        if not tour_info:
            return None
        
        tour_name, city_id, city_name, deleted_at = tour_info
        
        # Generate hashtags
        hashtags = []
        
        # Destination city hashtag
        cur.execute("""
            SELECT hashtag FROM social_hashtag 
            WHERE source_type = 'city' AND source_id = %s
            LIMIT 1
        """, (city_id,))
        city_hashtag_row = cur.fetchone()
        if city_hashtag_row:
            hashtags.append(city_hashtag_row[0])
        
        # Tour hashtag
        cur.execute("""
            SELECT hashtag FROM social_hashtag 
            WHERE source_type = 'tour' AND source_id = %s
            LIMIT 1
        """, (tour_id,))
        tour_hashtag_row = cur.fetchone()
        if tour_hashtag_row:
            hashtags.append(tour_hashtag_row[0])
        
        # Use first image
        image_url = review_images[0] if isinstance(review_images, list) else review_images
        
        # Separate English and Vietnamese content
        en_content, vi_content = _separate_languages(review_text or "")
        
        # Add service type prefix
        service_type_en = {
            'accommodation': 'Great accommodation service!',
            'restaurant': 'Great restaurant service!',
            'transportation': 'Great transportation service!'
        }.get(service_type, 'Great service!')
        
        service_type_vi = {
            'accommodation': 'Dịch vụ lưu trú tuyệt vời!',
            'restaurant': 'Dịch vụ nhà hàng tuyệt vời!',
            'transportation': 'Dịch vụ vận chuyển tuyệt vời!'
        }.get(service_type, 'Dịch vụ tuyệt vời!')
        
        # Combine service type with review text
        if en_content:
            en_content = f"{service_type_en} {en_content}"
        else:
            en_content = service_type_en
            
        if vi_content:
            vi_content = f"{service_type_vi} {vi_content}"
        else:
            vi_content = service_type_vi
        
        # Create post with new columns
        cur.execute("""
            INSERT INTO posts (author_id, content, image_url, hashtags, service_reviews_id, en_content, vi_content, deleted_at_service_reviews)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (user_id, review_text or en_content or vi_content, image_url, hashtags, service_review_id, en_content, vi_content, deleted_at))
        
        post_id = cur.fetchone()[0]
        
        # Update hashtag usage counts
        for hashtag in hashtags:
            cur.execute("""
                UPDATE social_hashtag 
                SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP
                WHERE hashtag = %s
            """, (hashtag,))
        
        if should_close_conn:
            conn.commit()
        
        print(f"✅ Auto-created post {post_id} from service review {service_review_id}")
        return post_id
        
    except Exception as e:
        print(f"❌ Error auto-posting from service review: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        cur.close()
        if should_close_conn and conn:
            conn.close()


def _get_user_id_by_email(cur, email):
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    return row[0] if row else None


def _extract_hashtags(text):
    """Extract hashtags from text (unicode-aware).

    Returns a list of lowercase, unique tags in original character form.
    """
    if not text:
        return []
    pattern = re.compile(r"(?u)#([\w-]+)")
    matches = pattern.findall(text)
    tags = []
    for m in matches:
        t = m.strip().lower()
        if t:
            tags.append(t)
    seen = set()
    uniq = []
    for t in tags:
        if t not in seen:
            seen.add(t)
            uniq.append(t)
    return uniq


@social_routes.route('/posts', methods=['GET'])
def list_posts():
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500
    cur = conn.cursor()

    cur.execute(
        """
        SELECT 
            p.id, 
            p.content, 
            p.image_url, 
            p.hashtags,
            p.en_content,
            p.vi_content,
            p.created_at, 
            u.username, 
            u.email,
            (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
            (
                SELECT json_agg(
                    json_build_object(
                        'id', c.id,
                        'content', c.content,
                        'created_at', c.created_at,
                        'author', u2.username
                    )
                    ORDER BY c.created_at DESC
                )
                FROM comments c
                LEFT JOIN users u2 ON c.author_id = u2.id
                WHERE c.post_id = p.id
                    AND EXISTS (
                        SELECT 1 FROM posts p_check 
                        WHERE p_check.id = c.post_id 
                            AND (p_check.deleted_at_tour_reviews IS NULL AND p_check.deleted_at_service_reviews IS NULL)
                    )
            ) as comments,
            (
                SELECT array_agg(t.name) 
                FROM tags t 
                JOIN post_tags pt ON t.id = pt.tag_id 
                WHERE pt.post_id = p.id
            ) as tags
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE (p.deleted_at_tour_reviews IS NULL AND p.deleted_at_service_reviews IS NULL)
        ORDER BY p.created_at DESC
        """
    )
    rows = cur.fetchall()
    posts = []
    for r in rows:
        posts.append({
            "id": r[0],
            "content": r[1],
            "image_url": r[2],
            "hashtags": r[3] if r[3] else [],
            "en_content": r[4] if len(r) > 4 and r[4] else None,
            "vi_content": r[5] if len(r) > 5 and r[5] else None,
            "created_at": r[6].isoformat() if len(r) > 6 and r[6] else None,
            "author": {"username": r[7] if len(r) > 7 else None, "email": r[8] if len(r) > 8 else None},
            "like_count": r[9] if len(r) > 9 else 0,
            "comment_count": r[10] if len(r) > 10 else 0,
            "comments": r[11] if len(r) > 11 and r[11] else [],
            "tags": r[12] if len(r) > 12 and r[12] else []
        })

    cur.close()
    conn.close()
    return jsonify(posts)


@social_routes.route('/posts/search', methods=['GET'])
def search_posts():
    conn = None
    cur = None
    try:
        # Input validation
        query = request.args.get('q', '').lower().strip()
        
        # Return empty results for invalid queries
        if not query or query in ['#', '@', '#@', '@#']:
            return jsonify([])
            
        # Database connection
        conn = get_connection()
        if conn is None:
            return jsonify({"error": "Database connection failed."}), 500
            
        cur = conn.cursor()

        base_sql = """
            WITH post_comments AS (
                SELECT c.post_id,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', c.id,
                                'content', c.content,
                                'created_at', c.created_at::text,
                                'author', u2.username
                            ) ORDER BY c.created_at DESC
                        ) FILTER (WHERE c.id IS NOT NULL 
                            AND EXISTS (
                                SELECT 1 FROM posts p_check 
                                WHERE p_check.id = c.post_id 
                                    AND (p_check.deleted_at_tour_reviews IS NULL AND p_check.deleted_at_service_reviews IS NULL)
                            )),
                        '[]'
                    )::jsonb AS comments
                FROM posts p_base
                LEFT JOIN comments c ON c.post_id = p_base.id
                LEFT JOIN users u2 ON c.author_id = u2.id
                WHERE (p_base.deleted_at_tour_reviews IS NULL AND p_base.deleted_at_service_reviews IS NULL)
                GROUP BY c.post_id
            ),
            post_tags_data AS (
                SELECT pt.post_id,
                    COALESCE(
                        json_agg(t.name) FILTER (WHERE t.id IS NOT NULL),
                        '[]'
                    )::jsonb AS tags
                FROM posts p_base
                LEFT JOIN post_tags pt ON pt.post_id = p_base.id
                LEFT JOIN tags t ON t.id = pt.tag_id
                GROUP BY pt.post_id
            )
            SELECT DISTINCT 
                p.id, 
                p.content, 
                p.image_url,
                p.hashtags,
                p.en_content,
                p.vi_content,
                p.created_at, 
                u.username, 
                u.email,
                COALESCE((SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id), 0) AS like_count,
                COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id 
                    AND EXISTS (
                        SELECT 1 FROM posts p_check 
                        WHERE p_check.id = c.post_id 
                            AND (p_check.deleted_at_tour_reviews IS NULL AND p_check.deleted_at_service_reviews IS NULL)
                    )), 0) AS comment_count,
                COALESCE(pc.comments, '[]'::jsonb) as comments,
                COALESCE(ptd.tags, '[]'::jsonb) as tags
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN post_comments pc ON pc.post_id = p.id
            LEFT JOIN post_tags_data ptd ON ptd.post_id = p.id
            WHERE (p.deleted_at_tour_reviews IS NULL AND p.deleted_at_service_reviews IS NULL)
        """

        if query.startswith('#'):
            # Search by hashtag
            tag = query[1:]  # Remove the # symbol
            if not tag.strip():  # If only '#' was entered
                return jsonify([])
                
            sql = base_sql + """
                WHERE EXISTS (
                    SELECT 1 FROM post_tags pt2
                    JOIN tags t ON t.id = pt2.tag_id
                    WHERE pt2.post_id = p.id
                    AND LOWER(t.name) LIKE %s
                )
                ORDER BY p.created_at DESC
            """
            cur.execute(sql, (f"%{tag.strip()}%",))
        else:
            # Search in post content
            sql = base_sql + """
                WHERE LOWER(p.content) LIKE %s
                ORDER BY p.created_at DESC
            """
            cur.execute(sql, (f"%{query}%",))

        posts = cur.fetchall()
        
        return jsonify([{
            'id': post[0],
            'content': post[1],
            'image_url': post[2],
            'hashtags': post[3] if post[3] else [],
            'en_content': post[4] if len(post) > 4 and post[4] else None,
            'vi_content': post[5] if len(post) > 5 and post[5] else None,
            'created_at': post[6].isoformat() if len(post) > 6 and post[6] else None,
            'author': {'username': post[7] if len(post) > 7 else None, 'email': post[8] if len(post) > 8 else None},
            'like_count': post[9] if len(post) > 9 else 0,
            'comment_count': post[10] if len(post) > 10 else 0,
            'comments': post[11] if len(post) > 11 and post[11] else [],
            'tags': post[12] if len(post) > 12 and post[12] else []
        } for post in posts])

    except Exception as e:
        import traceback
        error_msg = f"Search error: {str(e)}"
        stack_trace = traceback.format_exc()
        print(error_msg)
        print(stack_trace)
        return jsonify({
            "error": "Search failed",
            "message": str(e),
            "details": {
                "query": query,
                "is_hashtag": query.startswith('#') if query else False
            }
        }), 500
        
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@social_routes.route('/upload', methods=['POST'])
def upload_image():
    """Accept a single image file (multipart/form-data, field name 'image'), save it to
    backend/static/uploads and return a public URL.
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files['image']
    if not file or file.filename == '':
        return jsonify({"error": "Empty filename."}), 400

    # Basic security: secure the filename and restrict extensions
    filename = secure_filename(file.filename)
    allowed_ext = {'.png', '.jpg', '.jpeg', '.gif', '.webp'}
    root, ext = os.path.splitext(filename.lower())
    if ext not in allowed_ext:
        return jsonify({"error": "Unsupported file type."}), 400

    # Ensure uploads directory exists inside the Flask static folder
    uploads_dir = os.path.join(current_app.static_folder, 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)

    # Make filename unique
    ts = int(time.time() * 1000)
    filename = f"{root}_{ts}{ext}"
    save_path = os.path.join(uploads_dir, filename)

    try:
        file.save(save_path)
    except Exception as e:
        return jsonify({"error": "Failed to save file.", "details": str(e)}), 500

    # Build external URL to static/uploads/<filename>
    file_url = url_for('static', filename=f'uploads/{filename}', _external=True)
    return jsonify({"url": file_url}), 201


@social_routes.route('/posts', methods=['POST'])
def create_post():
    data = request.get_json() or {}
    author_email = data.get('author_email')
    content = data.get('content')
    image_url = data.get('image_url')
    hashtags = data.get('hashtags', [])  # Array of hashtags from frontend

    if not author_email or (not content and not image_url):
        return jsonify({"error": "Missing author_email or content/image_url."}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500
    cur = conn.cursor()

    author_id = _get_user_id_by_email(cur, author_email)
    if author_id is None:
        cur.close()
        conn.close()
        return jsonify({"error": "Author not found."}), 404

    # Extract hashtags from content if not provided
    if not hashtags:
        hashtags = _extract_hashtags(content)
    else:
        # Ensure hashtags start with #
        hashtags = [tag if tag.startswith('#') else f'#{tag}' for tag in hashtags]

    # create post with hashtags
    cur.execute(
        "INSERT INTO posts (author_id, content, image_url, hashtags) VALUES (%s, %s, %s, %s) RETURNING id, created_at",
        (author_id, content, image_url, hashtags)
    )
    row = cur.fetchone()
    if not row:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": "Failed to create post."}), 500

    post_id, created_at = row

    # Update usage_count in social_hashtag table for each hashtag
    for hashtag in hashtags:
        # Remove # if present for lookup
        hashtag_clean = hashtag.lstrip('#')
        cur.execute("""
            UPDATE social_hashtag 
            SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP
            WHERE LOWER(hashtag) = LOWER(%s)
        """, (f'#{hashtag_clean}',))
        
        # Also update old tags table for backward compatibility
        tag_lower = hashtag_clean.lower()
        cur.execute("INSERT INTO tags (name) VALUES (%s) ON CONFLICT (name) DO NOTHING RETURNING id", (tag_lower,))
        res = cur.fetchone()
        if res:
            tag_id = res[0]
        else:
            cur.execute("SELECT id FROM tags WHERE name = %s", (tag_lower,))
            tag_row = cur.fetchone()
            if tag_row:
                tag_id = tag_row[0]
            else:
                continue

        # link post and tag (ignore duplicates)
        try:
            cur.execute("INSERT INTO post_tags (post_id, tag_id) VALUES (%s, %s) ON CONFLICT (post_id, tag_id) DO NOTHING", (post_id, tag_id))
        except Exception:
            # don't fail entire request if linking fails
            pass

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"id": post_id, "created_at": created_at.isoformat(), "tags": hashtags}), 201


@social_routes.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500
    cur = conn.cursor()

    cur.execute(
        """
        SELECT 
            p.id, 
            p.content, 
            p.image_url,
            p.hashtags,
            p.created_at, 
            u.username, 
            u.email,
            (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
            (SELECT array_agg(t.name) FROM tags t 
                JOIN post_tags pt ON t.id = pt.tag_id 
                WHERE pt.post_id = p.id) AS tags
        FROM posts p 
        LEFT JOIN users u ON p.author_id = u.id 
        WHERE p.id = %s
            AND (p.deleted_at_tour_reviews IS NULL AND p.deleted_at_service_reviews IS NULL)
        """,
        (post_id,)
    )
    post = cur.fetchone()
    if not post:
        cur.close()
        conn.close()
        return jsonify({"error": "Post not found or has been deleted."}), 404

    # Only fetch comments for this specific post (post_id is already filtered above)
    cur.execute(
        """
        SELECT 
            c.id, 
            c.content, 
            c.created_at, 
            u.username 
        FROM comments c 
        LEFT JOIN users u ON c.author_id = u.id 
        WHERE c.post_id = %s 
        ORDER BY c.created_at ASC
        """, 
        (post_id,)
    )
    comments = [
        {
            "id": r[0], 
            "content": r[1], 
            "created_at": r[2].isoformat() if r[2] else None, 
            "author": r[3]
        }
        for r in cur.fetchall()
    ]

    result = {
        "id": post[0],
        "content": post[1],
        "image_url": post[2],
        "hashtags": post[3] if post[3] else [],
        "created_at": post[4].isoformat() if post[4] else None,
        "author": {"username": post[5], "email": post[6]},
        "like_count": post[7],
        "tags": post[8] if post[8] else [],
        "comments": comments,
    }

    cur.close()
    conn.close()
    return jsonify(result)


@social_routes.route('/posts/<int:post_id>/comments', methods=['POST'])
def add_comment(post_id):
    data = request.get_json() or {}
    author_email = data.get('author_email')
    content = data.get('content')

    if not author_email or not content:
        return jsonify({"error": "Missing author_email or content."}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500
    cur = conn.cursor()

    # Check if post exists and is not deleted
    cur.execute("""
        SELECT id FROM posts 
        WHERE id = %s 
            AND (deleted_at_tour_reviews IS NULL AND deleted_at_service_reviews IS NULL)
    """, (post_id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Post not found or has been deleted."}), 404

    author_id = _get_user_id_by_email(cur, author_email)
    if author_id is None:
        cur.close()
        conn.close()
        return jsonify({"error": "Author not found."}), 404

    # Get username for the response
    cur.execute("SELECT username FROM users WHERE id = %s", (author_id,))
    author_username = cur.fetchone()[0]

    cur.execute(
        "INSERT INTO comments (post_id, author_id, content) VALUES (%s, %s, %s) RETURNING id, created_at", 
        (post_id, author_id, content)
    )
    row = cur.fetchone()
    comment_id, created_at = row

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "id": comment_id,
        "content": content,
        "created_at": created_at.isoformat(),
        "author": author_username
    }), 201


@social_routes.route('/posts/<int:post_id>/like', methods=['POST'])
def toggle_like(post_id):
    data = request.get_json() or {}
    user_email = data.get('user_email')
    if not user_email:
        return jsonify({"error": "Missing user_email."}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500
    cur = conn.cursor()

    user_id = _get_user_id_by_email(cur, user_email)
    if user_id is None:
        cur.close()
        conn.close()
        return jsonify({"error": "User not found."}), 404

    cur.execute("SELECT id FROM likes WHERE post_id = %s AND user_id = %s", (post_id, user_id))
    row = cur.fetchone()
    if row:
        cur.execute("DELETE FROM likes WHERE id = %s", (row[0],))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"status": "unliked"})
    else:
        cur.execute("INSERT INTO likes (post_id, user_id) VALUES (%s, %s)", (post_id, user_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"status": "liked"}), 201


@social_routes.route('/stories', methods=['GET'])
def list_stories():
    now = datetime.utcnow()
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500
    cur = conn.cursor()
    cur.execute("SELECT s.id, s.content, s.image_url, s.expires_at, s.created_at, u.username FROM stories s LEFT JOIN users u ON s.author_id = u.id WHERE s.expires_at IS NULL OR s.expires_at > %s ORDER BY s.created_at DESC", (now,))
    rows = cur.fetchall()
    stories = []
    for r in rows:
        stories.append({
            "id": r[0],
            "content": r[1],
            "image_url": r[2],
            "expires_at": r[3].isoformat() if r[3] else None,
            "created_at": r[4].isoformat() if r[4] else None,
            "author": r[5]
        })

    cur.close()
    conn.close()
    return jsonify(stories)


@social_routes.route('/stories', methods=['POST'])
def create_story():
    data = request.get_json() or {}
    author_email = data.get('author_email')
    content = data.get('content')
    image_url = data.get('image_url')
    expires_at = data.get('expires_at')  

    if not author_email or (not content and not image_url):
        return jsonify({"error": "Missing author_email or content/image_url."}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500
    cur = conn.cursor()

    author_id = _get_user_id_by_email(cur, author_email)
    if author_id is None:
        cur.close()
        conn.close()
        return jsonify({"error": "Author not found."}), 404

    expires_ts = None
    if expires_at:
        try:
            expires_ts = datetime.fromisoformat(expires_at)
        except Exception:
            expires_ts = None

    cur.execute("INSERT INTO stories (author_id, content, image_url, expires_at) VALUES (%s, %s, %s, %s) RETURNING id, created_at", (author_id, content, image_url, expires_ts))
    row = cur.fetchone()
    conn.commit()
    story_id, created_at = row

    cur.close()
    conn.close()
    return jsonify({"id": story_id, "created_at": created_at.isoformat()}), 201


@social_routes.route('/tags', methods=['GET'])
def list_tags():
    """Return tags with post counts ordered by popularity."""
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500
    cur = conn.cursor()

    cur.execute("""
        SELECT t.id, t.name, COUNT(DISTINCT pt.post_id) as post_count
        FROM tags t
        LEFT JOIN post_tags pt ON t.id = pt.tag_id
        GROUP BY t.id, t.name
        ORDER BY post_count DESC, t.name
    """)
    
    tags = [{
        'id': row[0],
        'name': row[1],
        'post_count': row[2]
    } for row in cur.fetchall()]
    
    cur.close()
    conn.close()
    return jsonify(tags)


@social_routes.route('/tags/<string:tag_name>/posts', methods=['GET'])
def posts_by_tag(tag_name):
    """Return posts that are linked to the given tag name (stored lowercase).

    The route matches using lowercase of provided tag.
    """
    tag_key = tag_name.strip().lower()
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500
    cur = conn.cursor()

    cur.execute("SELECT id FROM tags WHERE name = %s", (tag_key,))
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return jsonify([])
    tag_id = row[0]

    cur.execute(
        """
        SELECT p.id, p.content, p.image_url, p.hashtags, p.created_at, u.username, u.email,
            (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
            (
                SELECT json_agg(
                    json_build_object(
                        'id', c.id,
                        'content', c.content,
                        'created_at', c.created_at,
                        'author', u2.username
                    )
                    ORDER BY c.created_at DESC
                )
                FROM comments c
                LEFT JOIN users u2 ON c.author_id = u2.id
                WHERE c.post_id = p.id
            ) as comments,
            (
                SELECT array_agg(t2.name)
                FROM tags t2 
                JOIN post_tags pt2 ON t2.id = pt2.tag_id 
                WHERE pt2.post_id = p.id
            ) as tags
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        INNER JOIN post_tags pt ON pt.post_id = p.id
        WHERE pt.tag_id = %s
        ORDER BY p.created_at DESC
        """,
        (tag_id,)
    )
    rows = cur.fetchall()
    posts = []
    for r in rows:
        posts.append({
            "id": r[0],
            "content": r[1],
            "image_url": r[2],
            "hashtags": r[3] if r[3] else [],
            "en_content": r[4] if r[4] else None,
            "vi_content": r[5] if r[5] else None,
            "created_at": r[6].isoformat() if r[6] else None,
            "author": {"username": r[7], "email": r[8]},
            "like_count": r[9],
            "comment_count": r[10],
            "comments": r[11] if r[11] else [],
            "tags": r[12] if r[12] else []
        })

    cur.close()
    conn.close()
    return jsonify(posts)


@social_routes.route('/hashtags/search', methods=['GET'])
def search_hashtags():
    """Search hashtags from social_hashtag table, sorted by usage count (highest first)."""
    query = request.args.get('q', '').strip()
    limit = request.args.get('limit', 20, type=int)
    
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500
    
    cur = conn.cursor()
    
    try:
        if query:
            # Search hashtags that start with or contain the query
            cur.execute("""
                SELECT hashtag, usage_count, source_type
                FROM social_hashtag
                WHERE LOWER(hashtag) LIKE LOWER(%s)
                ORDER BY usage_count DESC, hashtag ASC
                LIMIT %s
            """, (f"%{query}%", limit))
        else:
            # Return top hashtags by usage
            cur.execute("""
                SELECT hashtag, usage_count, source_type
                FROM social_hashtag
                ORDER BY usage_count DESC, hashtag ASC
                LIMIT %s
            """, (limit,))
        
        hashtags = []
        for row in cur.fetchall():
            hashtags.append({
                'hashtag': row[0],
                'usage_count': row[1],
                'source_type': row[2]
            })
        
        return jsonify(hashtags)
    except Exception as e:
        print(f"Error searching hashtags: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@social_routes.route('/auto-post-from-reviews', methods=['POST'])
def auto_post_from_reviews():
    """
    Automatically create posts from tour_reviews and service_reviews.
    This function:
    1. Gets images from reviews
    2. Creates posts with city and tour hashtags
    3. Links to the original review
    """
    conn = get_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed."}), 500
    
    cur = conn.cursor()
    
    try:
        # Get tour reviews with images
        cur.execute("""
            SELECT 
                tr.id,
                tr.tour_id,
                tr.user_id,
                tr.review_images,
                tr.review_text,
                t.name as tour_name,
                t.destination_city_id,
                c.name as city_name
            FROM tour_reviews tr
            JOIN tours_admin t ON tr.tour_id = t.id
            JOIN cities c ON t.destination_city_id = c.id
            WHERE tr.review_images IS NOT NULL 
                AND array_length(tr.review_images, 1) > 0
                AND tr.deleted_at IS NULL
                AND NOT EXISTS (
                    SELECT 1 FROM posts p 
                    WHERE p.content LIKE '%Review ID: ' || tr.id || '%'
                )
            ORDER BY tr.created_at DESC
            LIMIT 50
        """)
        
        tour_reviews = cur.fetchall()
        created_posts = []
        
        for review in tour_reviews:
            review_id, tour_id, user_id, review_images, review_text, tour_name, city_id, city_name = review
            
            if not review_images or len(review_images) == 0:
                continue
            
            # Generate hashtags
            hashtags = []
            
            # City hashtag
            cur.execute("""
                SELECT hashtag FROM social_hashtag 
                WHERE source_type = 'city' AND source_id = %s
                LIMIT 1
            """, (city_id,))
            city_hashtag_row = cur.fetchone()
            if city_hashtag_row:
                hashtags.append(city_hashtag_row[0])
            
            # Tour hashtag
            cur.execute("""
                SELECT hashtag FROM social_hashtag 
                WHERE source_type = 'tour' AND source_id = %s
                LIMIT 1
            """, (tour_id,))
            tour_hashtag_row = cur.fetchone()
            if tour_hashtag_row:
                hashtags.append(tour_hashtag_row[0])
            
            # Use first image
            image_url = review_images[0] if isinstance(review_images, list) else review_images
            
            # Create post content
            content = f"Review from our amazing tour! {review_text[:200] if review_text else ''} Review ID: {review_id}"
            
            # Create post
            cur.execute("""
                INSERT INTO posts (author_id, content, image_url, hashtags)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (user_id, content, image_url, hashtags))
            
            post_id = cur.fetchone()[0]
            
            # Update hashtag usage counts
            for hashtag in hashtags:
                cur.execute("""
                    UPDATE social_hashtag 
                    SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP
                    WHERE hashtag = %s
                """, (hashtag,))
            
            created_posts.append(post_id)
        
        # Get service reviews with images
        cur.execute("""
            SELECT 
                sr.id,
                sr.service_type,
                sr.service_id,
                sr.user_id,
                sr.review_images,
                sr.review_text,
                ts.tour_id,
                t.name as tour_name,
                t.destination_city_id,
                c.name as city_name
            FROM service_reviews sr
            JOIN tour_services ts ON sr.tour_service_id = ts.id
            JOIN tours_admin t ON ts.tour_id = t.id
            JOIN cities c ON t.destination_city_id = c.id
            WHERE sr.review_images IS NOT NULL 
                AND array_length(sr.review_images, 1) > 0
                AND sr.deleted_at IS NULL
                AND NOT EXISTS (
                    SELECT 1 FROM posts p 
                    WHERE p.content LIKE '%Service Review ID: ' || sr.id || '%'
                )
            ORDER BY sr.created_at DESC
            LIMIT 50
        """)
        
        service_reviews = cur.fetchall()
        
        for review in service_reviews:
            review_id, service_type, service_id, user_id, review_images, review_text, tour_id, tour_name, city_id, city_name = review
            
            if not review_images or len(review_images) == 0:
                continue
            
            # Generate hashtags
            hashtags = []
            
            # City hashtag
            cur.execute("""
                SELECT hashtag FROM social_hashtag 
                WHERE source_type = 'city' AND source_id = %s
                LIMIT 1
            """, (city_id,))
            city_hashtag_row = cur.fetchone()
            if city_hashtag_row:
                hashtags.append(city_hashtag_row[0])
            
            # Tour hashtag
            cur.execute("""
                SELECT hashtag FROM social_hashtag 
                WHERE source_type = 'tour' AND source_id = %s
                LIMIT 1
            """, (tour_id,))
            tour_hashtag_row = cur.fetchone()
            if tour_hashtag_row:
                hashtags.append(tour_hashtag_row[0])
            
            # Use first image
            image_url = review_images[0] if isinstance(review_images, list) else review_images
            
            # Create post content
            content = f"Service review: {service_type} - {review_text[:200] if review_text else ''} Service Review ID: {review_id}"
            
            # Create post
            cur.execute("""
                INSERT INTO posts (author_id, content, image_url, hashtags)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (user_id, content, image_url, hashtags))
            
            post_id = cur.fetchone()[0]
            
            # Update hashtag usage counts
            for hashtag in hashtags:
                cur.execute("""
                    UPDATE social_hashtag 
                    SET usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP
                    WHERE hashtag = %s
                """, (hashtag,))
            
            created_posts.append(post_id)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": f"Created {len(created_posts)} posts from reviews",
            "post_ids": created_posts
        }), 201
        
    except Exception as e:
        conn.rollback()
        print(f"Error auto-posting from reviews: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()