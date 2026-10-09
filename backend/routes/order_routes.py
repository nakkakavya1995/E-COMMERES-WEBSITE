import datetime
from flask import Blueprint, request, jsonify
from bson import ObjectId
from backend.config.database import orders_collection, carts_collection, products_collection
from backend.middleware.auth_middleware import token_required
from backend.models.order_model import serialize_order

order_bp = Blueprint("order_bp", __name__)


@order_bp.route("", methods=["POST"], strict_slashes=False)
@order_bp.route("/", methods=["POST"], strict_slashes=False)
@token_required
def create_order(current_user):
    try:
        user_id = current_user["id"]
        data = request.get_json() or {}
        shipping = data.get("shipping_address") or {}

        # 1. Validate shipping address fields
        required_fields = ["name", "phone", "address", "city", "state", "pincode"]
        missing_fields = [f for f in required_fields if not str(shipping.get(f, "")).strip()]
        if missing_fields:
            return jsonify({
                "success": False,
                "message": f"Missing required shipping fields: {', '.join(missing_fields)}"
            }), 400

        # Validate phone
        phone_cleaned = str(shipping.get("phone", "")).strip().replace(" ", "").replace("-", "")
        if len(phone_cleaned) < 10:
            return jsonify({"success": False, "message": "Please enter a valid phone number (at least 10 digits)"}), 400

        # Validate pincode
        pincode_cleaned = str(shipping.get("pincode", "")).strip()
        if len(pincode_cleaned) < 4:
            return jsonify({"success": False, "message": "Please enter a valid postal/pincode"}), 400

        # 2. Validate Cart
        cart = carts_collection.find_one({"user_id": user_id})
        if not cart or not cart.get("items"):
            return jsonify({"success": False, "message": "Your cart is empty. Add products before checkout."}), 400

        cart_items = cart.get("items", [])
        if len(cart_items) == 0:
            return jsonify({"success": False, "message": "Cart is empty"}), 400

        # 3. Validate Stock for all items
        order_items = []
        total_amount = 0.0

        for item in cart_items:
            pid = item.get("product_id")
            qty = int(item.get("quantity", 1))

            if not ObjectId.is_valid(pid):
                return jsonify({"success": False, "message": f"Invalid product ID: {pid}"}), 400

            product = products_collection.find_one({"_id": ObjectId(pid)})
            if not product:
                return jsonify({"success": False, "message": f"Product '{item.get('name')}' is no longer available"}), 400

            current_stock = int(product.get("stock", 0))
            if current_stock < qty:
                return jsonify({
                    "success": False,
                    "message": f"Insufficient stock for '{product.get('name')}'. Only {current_stock} remaining."
                }), 400

            price = float(product.get("price", 0))
            subtotal = round(price * qty, 2)
            total_amount += subtotal

            order_items.append({
                "product_id": str(product["_id"]),
                "name": product["name"],
                "price": price,
                "quantity": qty,
                "image": product.get("image", ""),
                "subtotal": subtotal,
            })

        total_amount = round(total_amount, 2)

        # 4. Generate readable order ID
        count = orders_collection.count_documents({})
        custom_order_id = f"ORD-{10001 + count}"
        payment_method = str(data.get("payment_method") or "Cash on Delivery")
        payment_id = str(data.get("payment_id") or "")
        razorpay_order_id = str(data.get("razorpay_order_id") or "")

        order_doc = {
            "order_id": custom_order_id,
            "user_id": user_id,
            "items": order_items,
            "total": total_amount,
            "shipping_address": {
                "name": str(shipping.get("name", "")).strip(),
                "phone": str(shipping.get("phone", "")).strip(),
                "address": str(shipping.get("address", "")).strip(),
                "city": str(shipping.get("city", "")).strip(),
                "state": str(shipping.get("state", "")).strip(),
                "pincode": str(shipping.get("pincode", "")).strip(),
            },
            "payment_method": payment_method,
            "payment_id": payment_id,
            "razorpay_order_id": razorpay_order_id,
            "payment_status": "Paid" if payment_id else ("Pending" if payment_method == "Cash on Delivery" else "Completed"),
            "status": "Confirmed",
            "created_at": datetime.datetime.now(datetime.timezone.utc),
        }

        # 5. Insert order
        res = orders_collection.insert_one(order_doc)
        order_doc["_id"] = res.inserted_id

        # 6. Decrement product stock
        for item in order_items:
            products_collection.update_one(
                {"_id": ObjectId(item["product_id"])},
                {"$inc": {"stock": -item["quantity"]}}
            )

        # 7. Clear cart
        carts_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "items": [],
                    "total": 0,
                    "updated_at": datetime.datetime.now(datetime.timezone.utc),
                }
            }
        )

        return jsonify({
            "success": True,
            "message": "Order placed successfully!",
            "order": serialize_order(order_doc)
        }), 201

    except Exception as e:
        return jsonify({"success": False, "message": f"Failed to place order: {str(e)}"}), 500


@order_bp.route("", methods=["GET"], strict_slashes=False)
@order_bp.route("/", methods=["GET"], strict_slashes=False)
@token_required
def get_user_orders(current_user):
    try:
        user_id = current_user["id"]
        orders_cursor = orders_collection.find({"user_id": user_id}).sort("created_at", -1)
        orders = [serialize_order(o) for o in orders_cursor]

        return jsonify({
            "success": True,
            "count": len(orders),
            "orders": orders
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching orders: {str(e)}"}), 500


@order_bp.route("/<order_id>", methods=["GET"])
@token_required
def get_order_by_id(current_user, order_id):
    try:
        user_id = current_user["id"]
        query = {"user_id": user_id}

        if ObjectId.is_valid(order_id):
            query["$or"] = [{"_id": ObjectId(order_id)}, {"order_id": order_id}]
        else:
            query["order_id"] = order_id

        order = orders_collection.find_one(query)
        if not order:
            return jsonify({"success": False, "message": "Order not found"}), 404

        return jsonify({
            "success": True,
            "order": serialize_order(order)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching order: {str(e)}"}), 500


@order_bp.route("/<order_id>/cancel", methods=["PUT"])
@token_required
def cancel_order(current_user, order_id):
    try:
        user_id = current_user["id"]
        query = {"user_id": user_id}

        if ObjectId.is_valid(order_id):
            query["$or"] = [{"_id": ObjectId(order_id)}, {"order_id": order_id}]
        else:
            query["order_id"] = order_id

        order = orders_collection.find_one(query)
        if not order:
            return jsonify({"success": False, "message": "Order not found"}), 404

        if order.get("status") in ["Cancelled", "Delivered"]:
            return jsonify({
                "success": False,
                "message": f"Order cannot be cancelled because it is already {order.get('status')}."
            }), 400

        # Restore product stock
        for item in order.get("items", []):
            pid = item.get("product_id")
            qty = int(item.get("quantity", 1))
            if ObjectId.is_valid(pid):
                products_collection.update_one(
                    {"_id": ObjectId(pid)},
                    {"$inc": {"stock": qty}}
                )

        orders_collection.update_one(
            query,
            {
                "$set": {
                    "status": "Cancelled",
                    "updated_at": datetime.datetime.now(datetime.timezone.utc)
                }
            }
        )

        updated_order = orders_collection.find_one(query)
        return jsonify({
            "success": True,
            "message": "Order has been cancelled successfully",
            "order": serialize_order(updated_order)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error cancelling order: {str(e)}"}), 500

