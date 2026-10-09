def serialize_order(order):
    if not order:
        return None
    return {
        "id": str(order["_id"]),
        "_id": str(order["_id"]),
        "order_id": order.get("order_id", f"ORD-{str(order['_id'])[-6:].upper()}"),
        "user_id": str(order.get("user_id", "")),
        "items": [
            {
                "product_id": str(item.get("product_id", "")),
                "name": item.get("name", ""),
                "price": float(item.get("price", 0)),
                "quantity": int(item.get("quantity", 1)),
                "image": item.get("image", ""),
                "subtotal": round(float(item.get("price", 0)) * int(item.get("quantity", 1)), 2),
            }
            for item in order.get("items", [])
        ],
        "total": float(order.get("total", 0)),
        "shipping_address": order.get("shipping_address", {}),
        "payment_method": order.get("payment_method", "Cash on Delivery"),
        "payment_id": order.get("payment_id", ""),
        "payment_status": order.get("payment_status", "Pending"),
        "status": order.get("status", "Confirmed"),
        "created_at": order.get("created_at").isoformat() if order.get("created_at") and hasattr(order.get("created_at"), "isoformat") else str(order.get("created_at", "")),
    }
