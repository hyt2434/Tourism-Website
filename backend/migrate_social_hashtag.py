"""
Migration file to create social_hashtag table and related functions.
This table auto-generates hashtags from cities and tours, and tracks usage counts.
"""

from config.database import get_connection
import re


def remove_vietnamese_accents(text):
    """
    Remove Vietnamese accents from text to create clean hashtags.
    Example: "Hà Nội" -> "HaNoi", "Đà Nẵng" -> "DaNang"
    """
    if not text:
        return ""
    
    # Vietnamese accent mapping
    vietnamese_map = {
        'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
        'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
        'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
        'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
        'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
        'đ': 'd',
        'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
        'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
        'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
        'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
        'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
        'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
        'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
        'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
        'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
        'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
        'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
        'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
        'Đ': 'D'
    }
    
    result = ""
    for char in text:
        result += vietnamese_map.get(char, char)
    
    # Remove special characters and spaces, convert to PascalCase
    result = re.sub(r'[^a-zA-Z0-9\s]', '', result)
    words = result.split()
    if not words:
        return ""
    
    # Convert to PascalCase (first letter uppercase, rest lowercase)
    pascal_case = ''.join(word.capitalize() for word in words if word)
    return pascal_case


def create_social_hashtag_table():
    """Create social_hashtag table and related functions."""
    conn = get_connection()
    if conn is None:
        print("❌ Cannot create social_hashtag table: Database connection failed.")
        return False

    cur = conn.cursor()
    
    try:
        # Create social_hashtag table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS social_hashtag (
                id SERIAL PRIMARY KEY,
                hashtag VARCHAR(255) NOT NULL UNIQUE,
                source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('city', 'tour')),
                source_id INTEGER, -- city_id or tour_id
                usage_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create index for faster lookups
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_social_hashtag_hashtag ON social_hashtag(hashtag);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_social_hashtag_usage_count ON social_hashtag(usage_count DESC);
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_social_hashtag_source ON social_hashtag(source_type, source_id);
        """)
        
        # Create function to generate hashtag from text
        cur.execute("""
            CREATE OR REPLACE FUNCTION generate_hashtag_from_text(input_text TEXT)
            RETURNS TEXT AS $$
            DECLARE
                result TEXT;
            BEGIN
                -- Remove Vietnamese accents (simplified version)
                result := input_text;
                result := translate(result, 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ', 
                                    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeeeiiiiioooooooooooooooouuuuuuuuuuuyyyyyydAAAAAAAAAAAAAAAAAEEEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYYD');
                -- Remove special characters, keep only alphanumeric and spaces
                result := regexp_replace(result, '[^a-zA-Z0-9\\s]', '', 'g');
                -- Convert to PascalCase
                result := initcap(lower(result));
                -- Remove spaces
                result := regexp_replace(result, '\\s+', '', 'g');
                RETURN result;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        # Create function to sync hashtags from cities
        cur.execute("""
            CREATE OR REPLACE FUNCTION sync_hashtags_from_cities()
            RETURNS void AS $$
            DECLARE
                city_record RECORD;
                hashtag_text TEXT;
            BEGIN
                FOR city_record IN SELECT id, name FROM cities LOOP
                    hashtag_text := generate_hashtag_from_text(city_record.name);
                    IF hashtag_text IS NOT NULL AND hashtag_text != '' THEN
                        INSERT INTO social_hashtag (hashtag, source_type, source_id, usage_count)
                        VALUES ('#' || hashtag_text, 'city', city_record.id, 0)
                        ON CONFLICT (hashtag) DO NOTHING;
                    END IF;
                END LOOP;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        # Create function to sync hashtags from tours
        cur.execute("""
            CREATE OR REPLACE FUNCTION sync_hashtags_from_tours()
            RETURNS void AS $$
            DECLARE
                tour_record RECORD;
                hashtag_text TEXT;
            BEGIN
                FOR tour_record IN SELECT id, name FROM tours_admin LOOP
                    hashtag_text := generate_hashtag_from_text(tour_record.name);
                    IF hashtag_text IS NOT NULL AND hashtag_text != '' THEN
                        INSERT INTO social_hashtag (hashtag, source_type, source_id, usage_count)
                        VALUES ('#' || hashtag_text, 'tour', tour_record.id, 0)
                        ON CONFLICT (hashtag) DO NOTHING;
                    END IF;
                END LOOP;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        # Create trigger function to add hashtag when new city is added
        cur.execute("""
            CREATE OR REPLACE FUNCTION add_city_hashtag()
            RETURNS TRIGGER AS $$
            DECLARE
                hashtag_text TEXT;
            BEGIN
                hashtag_text := generate_hashtag_from_text(NEW.name);
                IF hashtag_text IS NOT NULL AND hashtag_text != '' THEN
                    INSERT INTO social_hashtag (hashtag, source_type, source_id, usage_count)
                    VALUES ('#' || hashtag_text, 'city', NEW.id, 0)
                    ON CONFLICT (hashtag) DO NOTHING;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        # Create trigger function to add hashtag when new tour is added
        cur.execute("""
            CREATE OR REPLACE FUNCTION add_tour_hashtag()
            RETURNS TRIGGER AS $$
            DECLARE
                hashtag_text TEXT;
            BEGIN
                hashtag_text := generate_hashtag_from_text(NEW.name);
                IF hashtag_text IS NOT NULL AND hashtag_text != '' THEN
                    INSERT INTO social_hashtag (hashtag, source_type, source_id, usage_count)
                    VALUES ('#' || hashtag_text, 'tour', NEW.id, 0)
                    ON CONFLICT (hashtag) DO NOTHING;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        # Create triggers
        cur.execute("""
            DROP TRIGGER IF EXISTS trigger_add_city_hashtag ON cities;
            CREATE TRIGGER trigger_add_city_hashtag
            AFTER INSERT ON cities
            FOR EACH ROW
            EXECUTE FUNCTION add_city_hashtag();
        """)
        
        cur.execute("""
            DROP TRIGGER IF EXISTS trigger_add_tour_hashtag ON tours_admin;
            CREATE TRIGGER trigger_add_tour_hashtag
            AFTER INSERT ON tours_admin
            FOR EACH ROW
            EXECUTE FUNCTION add_tour_hashtag();
        """)
        
        # Initial sync: populate hashtags from existing cities and tours
        cur.execute("SELECT sync_hashtags_from_cities();")
        cur.execute("SELECT sync_hashtags_from_tours();")
        
        conn.commit()
        print("✅ social_hashtag table and functions created successfully!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating social_hashtag table: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        cur.close()
        conn.close()


def update_posts_table():
    """Modify posts table to add hashtag column and update image_url to store base64."""
    conn = get_connection()
    if conn is None:
        print("❌ Cannot update posts table: Database connection failed.")
        return False

    cur = conn.cursor()
    
    try:
        # Add hashtag column if it doesn't exist
        cur.execute("""
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'posts' AND column_name = 'hashtags'
                ) THEN
                    ALTER TABLE posts ADD COLUMN hashtags TEXT[];
                END IF;
            END $$;
        """)
        
        # Note: image_url already exists and can store base64 strings
        # We don't need to change the column type, just ensure it can handle base64
        
        conn.commit()
        print("✅ posts table updated successfully!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error updating posts table: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    create_social_hashtag_table()
    update_posts_table()

