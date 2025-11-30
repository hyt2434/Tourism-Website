"""
Script to import tour images from a folder into the database.

This script:
1. Scans the 'tour_images' folder for image files
2. Converts images to Base64 data URIs
3. Matches images to tours by filename (tour ID or tour name)
4. Inserts images into the tour_images table

Image Naming Convention:
- Option 1: tour_{tour_id}_{image_number}.jpg (e.g., tour_1_1.jpg, tour_1_2.jpg)
- Option 2: {tour_name}_{image_number}.jpg (e.g., Tour Ha Noi - Sapa_1.jpg)
- Option 3: {tour_id}_{image_number}.jpg (e.g., 1_1.jpg, 1_2.jpg)

Usage:
    python import_tour_images.py
"""

import os
import sys
import base64
import re
from pathlib import Path

# Add backend directory to path so we can import from config
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from config.database import get_connection

# Supported image formats
SUPPORTED_FORMATS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'}

def get_image_mime_type(file_path):
    """Determine MIME type based on file extension."""
    ext = Path(file_path).suffix.lower()
    mime_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp'
    }
    return mime_types.get(ext, 'image/jpeg')

def image_to_base64_data_uri(image_path):
    """Convert an image file to a Base64 data URI."""
    try:
        with open(image_path, 'rb') as image_file:
            image_data = image_file.read()
            base64_data = base64.b64encode(image_data).decode('utf-8')
            mime_type = get_image_mime_type(image_path)
            return f"data:{mime_type};base64,{base64_data}"
    except Exception as e:
        print(f"❌ Error reading image {image_path}: {e}")
        return None

def get_all_tours(conn):
    """Get all tours from database with their IDs and names."""
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM tours_admin ORDER BY id")
    tours = {row[0]: row[1] for row in cur.fetchall()}
    cur.close()
    return tours

def match_image_to_tour(filename, tours):
    """
    Match an image filename to a tour.
    Returns (tour_id, image_number) or (None, None) if no match.
    """
    filename_lower = filename.lower()
    base_name = Path(filename).stem  # filename without extension
    
    # Method 1: Check for tour_{id}_{number} pattern
    match = re.search(r'tour[_\s-]*(\d+)[_\s-]*(\d+)', filename_lower)
    if match:
        tour_id = int(match.group(1))
        image_num = int(match.group(2))
        if tour_id in tours:
            return tour_id, image_num
    
    # Method 2: Check for {id}_{number} pattern (simple numeric)
    match = re.search(r'^(\d+)[_\s-]+(\d+)', filename_lower)
    if match:
        tour_id = int(match.group(1))
        image_num = int(match.group(2))
        if tour_id in tours:
            return tour_id, image_num
    
    # Method 3: Check if filename contains tour name
    for tour_id, tour_name in tours.items():
        # Normalize tour name for matching (remove special chars, lowercase)
        normalized_name = re.sub(r'[^\w\s]', '', tour_name.lower())
        normalized_filename = re.sub(r'[^\w\s]', '', filename_lower)
        
        # Check if tour name is in filename (at least 5 characters match)
        if len(normalized_name) >= 5 and normalized_name[:10] in normalized_filename:
            # Try to extract image number
            match = re.search(r'(\d+)', base_name)
            image_num = int(match.group(1)) if match else 1
            return tour_id, image_num
    
    # Method 4: Check for just tour ID at start
    match = re.search(r'^(\d+)', filename_lower)
    if match:
        tour_id = int(match.group(1))
        if tour_id in tours:
            # Try to extract image number
            match2 = re.search(r'(\d+)', base_name)
            image_num = int(match2.group(1)) if match2 else 1
            return tour_id, image_num
    
    return None, None

def import_tour_images(folder_path='tour_images', clear_existing=False):
    """
    Import tour images from a folder into the database.
    
    Args:
        folder_path: Path to the folder containing tour images
        clear_existing: If True, delete existing images before importing
    """
    # Check if folder exists
    if not os.path.exists(folder_path):
        print(f"❌ Folder '{folder_path}' does not exist!")
        print(f"   Please create the folder and add your tour images there.")
        return
    
    # Get database connection
    conn = get_connection()
    if not conn:
        print("❌ Failed to connect to database!")
        return
    
    try:
        cur = conn.cursor()
        
        # Get all tours
        tours = get_all_tours(conn)
        if not tours:
            print("❌ No tours found in database!")
            return
        
        print(f"📋 Found {len(tours)} tours in database")
        
        # Clear existing images if requested
        if clear_existing:
            cur.execute("DELETE FROM tour_images")
            conn.commit()
            print("🗑️  Cleared existing tour images")
        
        # Scan folder for image files
        image_files = []
        for file in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file)
            if os.path.isfile(file_path):
                ext = Path(file).suffix.lower()
                if ext in SUPPORTED_FORMATS:
                    image_files.append(file_path)
        
        if not image_files:
            print(f"❌ No image files found in '{folder_path}'!")
            print(f"   Supported formats: {', '.join(SUPPORTED_FORMATS)}")
            return
        
        print(f"📸 Found {len(image_files)} image files")
        print()
        
        # Process each image
        imported_count = 0
        skipped_count = 0
        errors = []
        
        for image_path in image_files:
            filename = os.path.basename(image_path)
            
            # Match image to tour
            tour_id, image_num = match_image_to_tour(filename, tours)
            
            if not tour_id:
                print(f"⚠️  Skipped: {filename} (could not match to any tour)")
                skipped_count += 1
                continue
            
            tour_name = tours[tour_id]
            
            # Convert image to Base64 data URI
            data_uri = image_to_base64_data_uri(image_path)
            if not data_uri:
                errors.append(f"{filename}: Failed to read image")
                skipped_count += 1
                continue
            
            # Check if image already exists for this tour
            cur.execute("""
                SELECT COUNT(*) FROM tour_images 
                WHERE tour_id = %s AND display_order = %s
            """, (tour_id, image_num - 1))
            
            if cur.fetchone()[0] > 0:
                print(f"⏭️  Skipped: {filename} (already exists for tour {tour_id})")
                skipped_count += 1
                continue
            
            # Determine if this should be the primary image (first image for the tour)
            cur.execute("""
                SELECT COUNT(*) FROM tour_images WHERE tour_id = %s
            """, (tour_id,))
            existing_count = cur.fetchone()[0]
            is_primary = (existing_count == 0) or (image_num == 1)
            
            # Insert image into database
            try:
                cur.execute("""
                    INSERT INTO tour_images 
                    (tour_id, image_url, image_caption, display_order, is_primary)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    tour_id,
                    data_uri,
                    None,  # No caption by default
                    image_num - 1,  # display_order (0-indexed)
                    is_primary
                ))
                
                print(f"✅ Imported: {filename} → Tour {tour_id} ({tour_name}) [Image #{image_num}, Primary: {is_primary}]")
                imported_count += 1
                
            except Exception as e:
                error_msg = f"{filename}: {str(e)}"
                errors.append(error_msg)
                print(f"❌ Error importing {filename}: {e}")
                skipped_count += 1
        
        # Commit all changes
        conn.commit()
        
        # Summary
        print()
        print("=" * 60)
        print("📊 Import Summary:")
        print(f"   ✅ Successfully imported: {imported_count} images")
        print(f"   ⏭️  Skipped: {skipped_count} images")
        if errors:
            print(f"   ❌ Errors: {len(errors)}")
            print("\n   Error details:")
            for error in errors:
                print(f"      - {error}")
        print("=" * 60)
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error during import: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    import sys
    
    # Check for command line arguments
    folder_path = 'tour_images'
    clear_existing = False
    
    if len(sys.argv) > 1:
        folder_path = sys.argv[1]
    if len(sys.argv) > 2 and sys.argv[2].lower() == '--clear':
        clear_existing = True
    
    print("🖼️  Tour Image Importer")
    print("=" * 60)
    print(f"📁 Folder: {folder_path}")
    print(f"🗑️  Clear existing: {clear_existing}")
    print()
    
    import_tour_images(folder_path, clear_existing)

