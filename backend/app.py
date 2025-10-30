from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_routes
from models import create_table
from flask_bcrypt import Bcrypt

app = Flask(__name__)
CORS(app)

bcrypt = Bcrypt(app)
app.bcrypt = bcrypt

create_table()

app.register_blueprint(auth_routes, url_prefix="/api/auth")

@app.route("/test")
def test():
    return "API is working!"

if __name__ == "__main__":
    app.run(debug=True, port=5000)
