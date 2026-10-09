import datetime
from flask import Blueprint, request, jsonify
from bson import ObjectId
from backend.config.database import carts_collection, products_collection
from backend.middleware.auth_middleware import token_required
from backend.models.cart_model import serialize_cart, calculate_cart_totals

cart_bp = Blueprint("cart_bp", __name__)


def sync_cart_with_catalog(cart):
    """
    Ensure items in the cart reflect actual current catalog prices, names, and images,
    and update the cart document if needed.
    """
    if not cart or not cart.get("items"):
        return cart

    updated_items = []
    has_changes = False

    for item in cart.get("items", []):
        pid = item.get("product_id")
        if ObjectId.is_valid(pid):
            prod = products_collection.find_one({"_id": ObjectId(pid)})
            if prod:
                qty = item.get("quantity", 1)
                # Cap quantity to current stock if stock is lower
                available_stock = prod.get("stock", 0)
                if available_stock <= 0:
                    has_changes = True
                    continue  # Remove item if zero stock
                if qty > available_stock:
                    qty = available_stock
                    has_changes = True

                updated_items.append({
                    "product_id": pid,
                    "name": prod.get("name", item.get("name")),
                    "price": float(prod.get("price", item.get("price"))),
                    "quantity": qty,
                    "image": prod.get("image", item.get("image")),
                })
            else:
                has_changes = True  # Product no longer exists
        else:
            updated_items.append(item)

    calculated = calculate_cart_totals(updated_items)
    cart["items"] = calculated["items"]
    cart["total"] = calculated["total"]

    if has_changes:
        carts_collection.update_one(
            {"_id": cart["_id"]},
            {"$set": {"items": calculated["items"], "total": calculated["total"], "updated_at": datetime.datetime.now(datetime.timezone.utc)}}
        )

    return cart


@cart_bp.route("", methods=["GET"], strict_slashes=False)
@cart_bp.route("/", methods=["GET"], strict_slashes=False)
@token_required
def get_cart(current_user):
    try:
        user_id = current_user["id"]
        cart = carts_collection.find_one({"user_id": user_id})

        if not cart:
            empty_cart = {
                "user_id": user_id,
                "items": [],
                "total": 0,
                "created_at": datetime.datetime.now(datetime.timezone.utc),
                "updated_at": datetime.datetime.now(datetime.timezone.utc),
            }
            res = carts_collection.insert_one(empty_cart)
            empty_cart["_id"] = res.inserted_id
            cart = empty_cart
        else:
            cart = sync_cart_with_catalog(cart)

        return jsonify({
            "success": True,
            "cart": serialize_cart(cart)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching cart: {str(e)}"}), 500


@cart_bp.route("/add", methods=["POST"])
@token_required
def add_to_cart(current_user):
    try:
        data = request.get_json() or {}
        product_id = data.get("product_id")
        quantity = int(data.get("quantity", 1))

        if not product_id or not ObjectId.is_valid(product_id):
            return jsonify({"success": False, "message": "Valid product ID is required"}), 400

        if quantity <= 0:
            return jsonify({"success": False, "message": "Quantity must be at least 1"}), 400

        product = products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            return jsonify({"success": False, "message": "Product not found"}), 404

        available_stock = int(product.get("stock", 0))
        if available_stock <= 0:
            return jsonify({"success": False, "message": "Product is currently out of stock"}), 400

        user_id = current_user["id"]
        cart = carts_collection.find_one({"user_id": user_id})

        if not cart:
            cart = {
                "user_id": user_id,
                "items": [],
                "total": 0,
                "created_at": datetime.datetime.now(datetime.timezone.utc),
                "updated_at": datetime.datetime.now(datetime.timezone.utc),
            }
            res = carts_collection.insert_one(cart)
            cart["_id"] = res.inserted_id

        items = cart.get("items", [])
        existing_item = next((item for item in items if str(item.get("product_id")) == str(product_id)), None)

        if existing_item:
            new_qty = existing_item["quantity"] + quantity
            if new_qty > available_stock:
                return jsonify({
                    "success": False,
                    "message": f"Cannot add {quantity} more. Only {available_stock} in stock (you already have {existing_item['quantity']} in cart)"
                }), 400
            existing_item["quantity"] = new_qty
        else:
            if quantity > available_stock:
                return jsonify({
                    "success": False,
                    "message": f"Cannot add {quantity} items. Only {available_stock} available in stock"
                }), 400
            items.append({
                "product_id": str(product["_id"]),
                "name": product["name"],
                "price": float(product["price"]),
                "quantity": quantity,
                "image": product.get("image", ""),
            })

        calculated = calculate_cart_totals(items)
        carts_collection.update_one(
            {"_id": cart["_id"]},
            {
                "$set": {
                    "items": calculated["items"],
                    "total": calculated["total"],
                    "updated_at": datetime.datetime.now(datetime.timezone.utc),
                }
            }
        )

        cart["items"] = calculated["items"]
        cart["total"] = calculated["total"]

        return jsonify({
            "success": True,
            "message": f"Added {product['name']} to cart",
            "cart": serialize_cart(cart)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error adding to cart: {str(e)}"}), 500


@cart_bp.route("/update/<product_id>", methods=["PUT"])
@token_required
def update_cart_item(current_user, product_id):
    try:
        data = request.get_json() or {}
        quantity = int(data.get("quantity", 1))

        user_id = current_user["id"]
        cart = carts_collection.find_one({"user_id": user_id})
        if not cart:
            return jsonify({"success": False, "message": "Cart not found"}), 404

        items = cart.get("items", [])
        existing_item = next((item for item in items if str(item.get("product_id")) == str(product_id)), None)

        if not existing_item:
            return jsonify({"success": False, "message": "Item not in cart"}), 404

        if quantity <= 0:
            # Remove item
            items = [item for item in items if str(item.get("product_id")) != str(product_id)]
        else:
            # Check stock
            if ObjectId.is_valid(product_id):
                product = products_collection.find_one({"_id": ObjectId(product_id)})
                if product:
                    available_stock = int(product.get("stock", 0))
                    if quantity > available_stock:
                        return jsonify({
                            "success": False,
                            "message": f"Requested quantity exceeds available stock ({available_stock} available)"
                        }), 400

            existing_item["quantity"] = quantity

        calculated = calculate_cart_totals(items)
        carts_collection.update_one(
            {"_id": cart["_id"]},
            {
                "$set": {
                    "items": calculated["items"],
                    "total": calculated["total"],
                    "updated_at": datetime.datetime.now(datetime.timezone.utc),
                }
            }
        )

        cart["items"] = calculated["items"]
        cart["total"] = calculated["total"]

        return jsonify({
            "success": True,
            "message": "Cart updated successfully",
            "cart": serialize_cart(cart)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error updating cart: {str(e)}"}), 500


@cart_bp.route("/remove/<product_id>", methods=["DELETE"])
@token_required
def remove_from_cart(current_user, product_id):
    try:
        user_id = current_user["id"]
        cart = carts_collection.find_one({"user_id": user_id})
        if not cart:
            return jsonify({"success": False, "message": "Cart not found"}), 404

        items = [item for item in cart.get("items", []) if str(item.get("product_id")) != str(product_id)]
        calculated = calculate_cart_totals(items)

        carts_collection.update_one(
            {"_id": cart["_id"]},
            {
                "$set": {
                    "items": calculated["items"],
                    "total": calculated["total"],
                    "updated_at": datetime.datetime.now(datetime.timezone.utc),
                }
            }
        )

        cart["items"] = calculated["items"]
        cart["total"] = calculated["total"]

        return jsonify({
            "success": True,
            "message": "Item removed from cart",
            "cart": serialize_cart(cart)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error removing item: {str(e)}"}), 500


@cart_bp.route("/clear", methods=["DELETE"])
@token_required
def clear_cart(current_user):
    try:
        user_id = current_user["id"]
        cart = carts_collection.find_one({"user_id": user_id})

        if cart:
            carts_collection.update_one(
                {"_id": cart["_id"]},
                {
                    "$set": {
                        "items": [],
                        "total": 0,
                        "updated_at": datetime.datetime.now(datetime.timezone.utc),
                    }
                }
            )
            cart["items"] = []
            cart["total"] = 0

        return jsonify({
            "success": True,
            "message": "Cart cleared successfully",
            "cart": serialize_cart(cart)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error clearing cart: {str(e)}"}), 500
