def serialize_user(user):
    if not user:
        return None
    return {
        "id": str(user["_id"]),
        "_id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "address": user.get("address", ""),
        "created_at": user.get("created_at").isoformat() if user.get("created_at") else None,
    }
