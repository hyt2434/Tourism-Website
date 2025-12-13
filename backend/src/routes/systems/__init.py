from .city_routes import city_bp
from .filter_routes import filter_routes
from .suggestion_routes import suggestion_routes

routes = [
    city_bp,
    filter_routes,
    suggestion_routes
]
