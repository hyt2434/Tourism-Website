# Database Schema Consolidation

## Summary
Removed duplicate and incomplete table definitions from `models.py` to prevent database conflicts and ensure a single source of truth for each table schema.

## Changes Made

### File: `backend/src/models/models.py`
**Status**: ✅ Cleaned

**Removed Tables** (14 entries):
These tables were defined in simplified form in `models.py` but have more comprehensive definitions in specialized schema files. Removed from `models.py`:

1. **tours_admin** - Moved to `tour_schema.py`
   - Reason: `tour_schema.py` version includes validation constraints and relationships

2. **tour_daily_itinerary** - Moved to `tour_schema.py`
   - Reason: Specialized schema has complete field definitions

3. **tour_time_checkpoints** - Moved to `tour_schema.py`
   - Reason: Part of tour management structure

4. **tour_services** - Moved to `tour_schema.py`
   - Reason: Needs relationship with tour_selected_rooms and tour_selected_menu_items

5. **tour_images** - Moved to `tour_schema.py`
   - Reason: Complete definition with all image metadata

6. **restaurant_services** - Moved to `partner_services_schema.py`
   - Reason: Comprehensive schema with all partner fields

7. **accommodation_services** - Moved to `partner_services_schema.py`
   - Reason: Complete schema with location data and amenities

8. **accommodation_rooms** - Moved to `partner_services_schema.py`
   - Reason: Detailed room configuration and pricing

9. **transportation_services** - Moved to `partner_services_schema.py`
   - Reason: Complete vehicle management schema

10. **restaurant_menu_items** - Moved to `partner_services_schema.py`
    - Reason: Full menu item details with dietary info

11. **tour_selected_rooms** - Moved to `tour_schema.py`
    - Reason: Junction table for tour-room relationships

12. **tour_selected_menu_items** - Moved to `tour_schema.py`
    - Reason: Junction table for tour-menu relationships

13. **service_images** - Moved to `partner_services_schema.py`
    - Reason: Polymorphic image storage for all services

14. **service_availability** - Moved to `partner_services_schema.py`
    - Reason: Booking availability management for services

**Retained Tables** (13 entries):
Core tables that remain in `models.py`:

1. users - User authentication and profiles
2. posts - Social media posts
3. comments - Post comments
4. likes - Post likes
5. partner_registrations - Partner application tracking
6. cities - City master data
7. regions - Regional grouping
8. provinces - Provincial data
9. tour_types - Tour type categories
10. promotions - Discount codes and banners
11. stories - Social stories
12. tags - Content tagging system
13. post_tags - Tag relationships

## File Organization

### Core Tables (`models.py`)
- User management and authentication
- Social features (posts, comments, likes, stories, tags)
- Partner registration workflow
- Geographic data (cities, regions, provinces)
- System data (tour types, promotions)

### Tour Management (`tour_schema.py`)
```
Tables:
- tours_admin
- tour_images
- tour_daily_itinerary
- tour_time_checkpoints
- tour_services
- tour_selected_rooms
- tour_selected_menu_items
- bookings
- favorites

Trigger Functions:
- update_tour_total_price() - Auto-calculate tour pricing
```

### Partner Services (`partner_services_schema.py`)
```
Tables:
- accommodation_services
- accommodation_rooms
- restaurant_services
- restaurant_menu_items
- transportation_services
- service_images
- service_availability
- service_reviews

Features:
- Comprehensive field definitions
- Validation constraints
- Performance indexes
- Polymorphic image storage
```

## Import Instructions

To initialize all database tables, run:

```python
from src.models.models import create_tables
from src.models.tour_schema import create_tour_tables
from src.models.partner_services_schema import create_partner_service_tables

# Create all tables
create_tables()
create_tour_tables()
create_partner_service_tables()
```

## Benefits

✅ **Single Source of Truth**: Each table defined in exactly one location
✅ **Better Maintainability**: Specialized schemas for complex features
✅ **Reduced Conflicts**: No duplicate SQL definitions
✅ **Clearer Documentation**: Each file has specific responsibility
✅ **Performance**: Proper indexes and constraints on specialized tables
✅ **Easier Updates**: Changes only made in one place

## Validation

All duplicate table definitions have been removed. The new structure prevents:
- Database conflicts from duplicate CREATE TABLE statements
- Inconsistent schema versions across files
- Confusion about which definition is authoritative
- Maintenance issues from schema changes in multiple locations

## Related Files

- `backend/src/models/models.py` - Core tables (242 lines, cleaned)
- `backend/src/models/tour_schema.py` - Tour management (285 lines)
- `backend/src/models/partner_services_schema.py` - Partner services (451 lines)
