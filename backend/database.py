import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

def get_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=os.getenv("DB_PORT")
        )
        print("✅ Database connected successfully!")
        return conn
    except Exception as e:
        print("❌ Database connection failed:", e)
        return None
