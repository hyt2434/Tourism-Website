from database import get_connection

def create_table():
    conn = get_connection()
    if conn is None:
        print("❌ Cannot create table: Database connection failed.")
        return

    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(200) NOT NULL
        );
    """)
    conn.commit()
    cur.close()
    conn.close()
