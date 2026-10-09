def calculate_cart_totals(items):
    total = 0.0
    total_items = 0
    formatted_items = []
    
    for item in items:
        qty = int(item.get("quantity", 1))
        price = float(item.get("price", 0))
        subtotal = round(price * qty, 2)
        total += subtotal
        total_items += qty
        
        formatted_items.append({
            "product_id": str(item.get("product_id")),
            "name": item.get("name", ""),
            "price": price,
            "quantity": qty,
            "image": item.get("image", ""),
            "subtotal": subtotal,
        })
        
    return {
        "items": formatted_items,
        "total": round(total, 2),
        "total_items": total_items,
    }


def serialize_cart(cart):
    if not cart:
        return {
            "items": [],
            "total": 0,
            "total_items": 0,
        }
    items = cart.get("items", [])
    totals = calculate_cart_totals(items)
    return {
        "id": str(cart["_id"]) if "_id" in cart else None,
        "user_id": str(cart.get("user_id", "")),
        "items": totals["items"],
        "total": totals["total"],
        "total_items": totals["total_items"],
        "updated_at": cart.get("updated_at").isoformat() if cart.get("updated_at") and hasattr(cart.get("updated_at"), "isoformat") else None,
    }
