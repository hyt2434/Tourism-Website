from flask import Flask
from flask_cors import CORS
from src.routes.auth_routes import auth_routes
from src.routes.filter_routes import filter_routes
from src.routes.tour_routes import tour_routes
from src.routes.suggestion_routes import suggestion_routes
from src.routes.promotion_routes import promotion_routes
from src.models.models import create_table
from flask_bcrypt import Bcrypt

app = Flask(__name__)
CORS(app)

bcrypt = Bcrypt(app)
app.bcrypt = bcrypt

create_table()

app.register_blueprint(auth_routes, url_prefix="/api/auth")
app.register_blueprint(filter_routes, url_prefix="/api/filter")
app.register_blueprint(tour_routes, url_prefix="/api/tour")
app.register_blueprint(suggestion_routes, url_prefix="/api/suggestions")
app.register_blueprint(promotion_routes, url_prefix="/api/promotions")

@app.route("/test")
def test():
    return "API is working!"

if __name__ == "__main__":
    app.run(debug=True, port=5000)
