from flask import Blueprint, request, jsonify, current_app, url_for
from src.database import get_connection
from datetime import datetime
import re
import os
import time
from werkzeug.utils import secure_filename

social_routes = Blueprint('social_routes', __name__)


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
            ) as comments,
            (
                SELECT array_agg(t.name) 
                FROM tags t 
                JOIN post_tags pt ON t.id = pt.tag_id 
                WHERE pt.post_id = p.id
            ) as tags
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
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
            "created_at": r[3].isoformat() if r[3] else None,
            "author": {"username": r[4], "email": r[5]},
            "like_count": r[6],
            "comment_count": r[7],
            "comments": r[8] if r[8] else [],
            "tags": r[9] if r[9] else []
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
                        ) FILTER (WHERE c.id IS NOT NULL),
                        '[]'
                    )::jsonb AS comments
                FROM posts p_base
                LEFT JOIN comments c ON c.post_id = p_base.id
                LEFT JOIN users u2 ON c.author_id = u2.id
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
                p.created_at, 
                u.username, 
                u.email,
                COALESCE((SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id), 0) AS like_count,
                COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id), 0) AS comment_count,
                COALESCE(pc.comments, '[]'::jsonb) as comments,
                COALESCE(ptd.tags, '[]'::jsonb) as tags
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN post_comments pc ON pc.post_id = p.id
            LEFT JOIN post_tags_data ptd ON ptd.post_id = p.id
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
            'created_at': post[3].isoformat() if post[3] else None,
            'author': {'username': post[4], 'email': post[5]},
            'like_count': post[6],
            'comment_count': post[7],
            'comments': post[8] if post[8] else [],
            'tags': post[9] if post[9] else []
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

    # create post
    cur.execute(
        "INSERT INTO posts (author_id, content, image_url) VALUES (%s, %s, %s) RETURNING id, created_at",
        (author_id, content, image_url)
    )
    row = cur.fetchone()
    if not row:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"error": "Failed to create post."}), 500

    post_id, created_at = row

    # extract hashtags and store them
    tags = _extract_hashtags(content)
    for tag in tags:
        # insert tag if not exists
        cur.execute("INSERT INTO tags (name) VALUES (%s) ON CONFLICT (name) DO NOTHING RETURNING id", (tag,))
        res = cur.fetchone()
        if res:
            tag_id = res[0]
        else:
            cur.execute("SELECT id FROM tags WHERE name = %s", (tag,))
            tag_id = cur.fetchone()[0]

        # link post and tag (ignore duplicates)
        try:
            cur.execute("INSERT INTO post_tags (post_id, tag_id) VALUES (%s, %s) ON CONFLICT (post_id, tag_id) DO NOTHING", (post_id, tag_id))
        except Exception:
            # don't fail entire request if linking fails
            conn.rollback()

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"id": post_id, "created_at": created_at.isoformat(), "tags": tags}), 201


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
        """,
        (post_id,)
    )
    post = cur.fetchone()
    if not post:
        cur.close()
        conn.close()
        return jsonify({"error": "Post not found."}), 404

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
        "created_at": post[3].isoformat() if post[3] else None,
        "author": {"username": post[4], "email": post[5]},
        "like_count": post[6],
        "tags": post[7] if post[7] else [],
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

    # check post exists
    cur.execute("SELECT id FROM posts WHERE id = %s", (post_id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Post not found."}), 404

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
        SELECT p.id, p.content, p.image_url, p.created_at, u.username, u.email,
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
            "created_at": r[3].isoformat() if r[3] else None,
            "author": {"username": r[4], "email": r[5]},
            "like_count": r[6],
            "comment_count": r[7],
            "comments": r[8] if r[8] else [],
            "tags": r[9] if r[9] else []
        })

    cur.close()
    conn.close()
    return jsonify(posts)