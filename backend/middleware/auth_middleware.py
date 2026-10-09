from functools import wraps
from flask import request, jsonify, g
from bson import ObjectId
import jwt
from backend.utils.jwt_utils import decode_token
from backend.config.database import users_collection


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")

        if auth_header:
            parts = auth_header.split(" ")
            if len(parts) == 2 and parts[0].lower() == "bearer":
                token = parts[1]
            elif len(parts) == 1:
                token = parts[0]

        if not token:
            return jsonify({"success": False, "message": "Authentication token is missing"}), 401

        try:
            payload = decode_token(token)
            user_id = payload.get("user_id")
            if not user_id:
                return jsonify({"success": False, "message": "Invalid token payload"}), 401

            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"success": False, "message": "User not found"}), 401

            # Format user object
            current_user = {
                "id": str(user["_id"]),
                "_id": str(user["_id"]),
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "phone": user.get("phone", ""),
                "address": user.get("address", ""),
            }
            g.current_user = current_user

        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "message": "Token has expired, please log in again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "message": "Invalid token"}), 401
        except Exception as e:
            return jsonify({"success": False, "message": f"Authentication failed: {str(e)}"}), 401

        return f(current_user, *args, **kwargs)

    return decorated
