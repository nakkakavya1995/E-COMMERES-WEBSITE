import re
import datetime
import bcrypt
import secrets
from pymongo.errors import DuplicateKeyError
from flask import Blueprint, request, jsonify
from backend.config.database import users_collection
from backend.utils.jwt_utils import generate_token
from backend.models.user_model import serialize_user

auth_bp = Blueprint("auth_bp", __name__)

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json() or {}
        name = data.get("name", "").strip()
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")
        confirm_password = data.get("confirm_password", "")

        # Validations
        if not name:
            return jsonify({"success": False, "message": "Full Name is required"}), 400

        if not email or not re.match(EMAIL_REGEX, email):
            return jsonify({"success": False, "message": "A valid email address is required"}), 400

        if not password or len(password) < 6:
            return jsonify({"success": False, "message": "Password must be at least 6 characters long"}), 400

        if password != confirm_password:
            return jsonify({"success": False, "message": "Password confirmation does not match"}), 400

        # Duplicate email check
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            return jsonify({"success": False, "message": "Email is already registered"}), 400

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        new_user = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "phone": data.get("phone", "").strip(),
            "address": data.get("address", "").strip(),
            "created_at": datetime.datetime.now(datetime.timezone.utc),
        }

        result = users_collection.insert_one(new_user)
        new_user["_id"] = result.inserted_id

        # Generate JWT token
        token = generate_token(str(result.inserted_id), email, name)

        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "token": token,
            "user": serialize_user(new_user)
        }), 201

    except DuplicateKeyError:
        return jsonify({"success": False, "message": "Email is already registered"}), 400
    except Exception as e:
        return jsonify({"success": False, "message": f"Registration failed: {str(e)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"success": False, "message": "Email and password are required"}), 400

        user = users_collection.find_one({"email": email})
        if not user:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        # Check password
        user_password_hash = user.get("password", "")
        if not bcrypt.checkpw(password.encode("utf-8"), user_password_hash.encode("utf-8")):
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        # Generate JWT token
        token = generate_token(str(user["_id"]), user["email"], user["name"])

        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": token,
            "user": serialize_user(user)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Login failed: {str(e)}"}), 500

@auth_bp.route("/google", methods=["POST"])
def google_login():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        name = data.get("name", "").strip()
        firebase_uid = data.get("firebase_uid", "")

        if not email or not firebase_uid:
            return jsonify({"success": False, "message": "Email and Firebase UID are required"}), 400

        user = users_collection.find_one({"email": email})
        
        if not user:
            # Create a new user for Google login
            random_password = secrets.token_urlsafe(32)
            hashed_password = bcrypt.hashpw(random_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            
            new_user = {
                "name": name or "Google User",
                "email": email,
                "password": hashed_password,
                "firebase_uid": firebase_uid,
                "phone": "",
                "address": "",
                "created_at": datetime.datetime.now(datetime.timezone.utc),
            }
            
            result = users_collection.insert_one(new_user)
            new_user["_id"] = result.inserted_id
            user = new_user

        # Generate JWT token
        token = generate_token(str(user["_id"]), user["email"], user["name"])

        return jsonify({
            "success": True,
            "message": "Google Login successful",
            "token": token,
            "user": serialize_user(user)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Google Login failed: {str(e)}"}), 500


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json() or {}
        email = data.get("email", "").strip().lower()
        new_password = data.get("new_password", "")
        confirm_password = data.get("confirm_password", "")

        if not email or not re.match(EMAIL_REGEX, email):
            return jsonify({"success": False, "message": "Please enter a valid email address"}), 400

        hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        user = users_collection.find_one({"email": email})
        if not user:
            name = data.get("name") or email.split("@")[0].title()
            new_user = {
                "name": name,
                "email": email,
                "password": hashed_password,
                "phone": "",
                "address": "",
                "created_at": datetime.datetime.now(datetime.timezone.utc),
            }
            users_collection.insert_one(new_user)
            return jsonify({
                "success": True,
                "message": "Password updated successfully! You can now log in with your new password."
            }), 200

        users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "password": hashed_password,
                    "updated_at": datetime.datetime.now(datetime.timezone.utc),
                }
            }
        )

        return jsonify({
            "success": True,
            "message": "Password reset successfully! You can now log in with your new password."
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Password reset failed: {str(e)}"}), 500

