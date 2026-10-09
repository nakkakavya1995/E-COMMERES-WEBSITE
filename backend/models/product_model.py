def serialize_product(product):
    if not product:
        return None
    return {
        "id": str(product["_id"]),
        "_id": str(product["_id"]),
        "name": product.get("name", ""),
        "description": product.get("description", ""),
        "price": float(product.get("price", 0)),
        "category": product.get("category", ""),
        "image": product.get("image", ""),
        "stock": int(product.get("stock", 0)),
        "featured": bool(product.get("featured", False)),
        "created_at": product.get("created_at").isoformat() if product.get("created_at") and hasattr(product.get("created_at"), "isoformat") else str(product.get("created_at", "")),
    }
