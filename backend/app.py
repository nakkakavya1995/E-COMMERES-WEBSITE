import os
import sys
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv(BASE_DIR / ".env")
load_dotenv(PROJECT_ROOT / ".env")
load_dotenv()

from backend.routes.auth_routes import auth_bp
from backend.routes.product_routes import product_bp
from backend.routes.cart_routes import cart_bp
from backend.routes.order_routes import order_bp
from backend.routes.user_routes import user_bp
from backend.routes.payment_routes import payment_bp
from backend.routes.admin_routes import admin_bp

app = Flask(__name__)

app.url_map.strict_slashes = False

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "*"
            ]
        }
    },
    supports_credentials=True,
    allow_headers=[
        "Content-Type",
        "Authorization"
    ],
    methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ]
)
app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)

app.register_blueprint(
    product_bp,
    url_prefix="/api/products"
)

app.register_blueprint(
    cart_bp,
    url_prefix="/api/cart"
)

app.register_blueprint(
    order_bp,
    url_prefix="/api/orders"
)

app.register_blueprint(
    user_bp,
    url_prefix="/api/users"
)

app.register_blueprint(
    payment_bp,
    url_prefix="/api/payment"
)

app.register_blueprint(
    admin_bp,
    url_prefix="/api/admin"
)

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "NAKKA KAVYA E-Commerce API",
        "version": "1.0.0"
    }), 200

@app.errorhandler(404)
def not_found(e):
    return jsonify({
        "success": False,
        "message": "API endpoint not found"
    }), 404
@app.errorhandler(500)
def server_error(e):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500
    
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))

    print(f"Server starting on http://127.0.0.1:{port}")

    app.run(
        host="127.0.0.1",
        port=port,
        debug=True
    )