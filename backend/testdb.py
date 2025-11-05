from database import get_connection

conn = get_connection()
if conn:
    cur = conn.cursor()
    cur.execute("SELECT * FROM users;")
    rows = cur.fetchall()
    for row in rows:
        print(row)
    cur.close()
    conn.close()
