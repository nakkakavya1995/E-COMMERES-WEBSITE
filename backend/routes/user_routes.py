import datetime
from flask import Blueprint, request, jsonify
from bson import ObjectId
from backend.config.database import users_collection
from backend.middleware.auth_middleware import token_required
from backend.models.user_model import serialize_user

user_bp = Blueprint("user_bp", __name__)


@user_bp.route("/profile", methods=["GET"])
@token_required
def get_profile(current_user):
    try:
        user_id = current_user["id"]
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404

        return jsonify({
            "success": True,
            "user": serialize_user(user)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching profile: {str(e)}"}), 500


@user_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile(current_user):
    try:
        user_id = current_user["id"]
        data = request.get_json() or {}

        update_fields = {}
        if "name" in data:
            name = data["name"].strip()
            if not name:
                return jsonify({"success": False, "message": "Name cannot be empty"}), 400
            update_fields["name"] = name

        if "phone" in data:
            update_fields["phone"] = data["phone"].strip()

        if "address" in data:
            update_fields["address"] = data["address"].strip()

        update_fields["updated_at"] = datetime.datetime.now(datetime.timezone.utc)

        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )

        updated_user = users_collection.find_one({"_id": ObjectId(user_id)})

        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": serialize_user(updated_user)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error updating profile: {str(e)}"}), 500
