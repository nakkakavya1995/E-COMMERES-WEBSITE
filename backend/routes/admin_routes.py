import datetime
from flask import Blueprint, request, jsonify
from bson import ObjectId
from backend.config.database import (
    users_collection,
    products_collection,
    orders_collection,
)
from backend.models.order_model import serialize_order
from backend.models.product_model import serialize_product
from backend.models.user_model import serialize_user

admin_bp = Blueprint("admin_bp", __name__)


@admin_bp.route("/stats", methods=["GET"])
def get_admin_stats():
    try:
        total_users = users_collection.count_documents({})
        total_products = products_collection.count_documents({})
        total_orders = orders_collection.count_documents({})

        # Calculate Total Sales (Sum of order totals)
        sales_pipeline = [
            {"$group": {"_id": None, "total_sales": {"$sum": "$total"}}}
        ]
        sales_result = list(orders_collection.aggregate(sales_pipeline))
        total_sales = round(sales_result[0]["total_sales"], 2) if sales_result else 0.0

        # Recent 6 orders
        recent_orders_cursor = orders_collection.find().sort("created_at", -1).limit(6)
        recent_orders = [serialize_order(o) for o in recent_orders_cursor]

        # Low stock products (stock <= 5)
        low_stock_cursor = products_collection.find({"stock": {"$lte": 5}}).sort("stock", 1).limit(5)
        low_stock_products = [serialize_product(p) for p in low_stock_cursor]

        # Category Breakdown
        category_pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        categories_data = [
            {"category": item["_id"] or "Uncategorized", "count": item["count"]}
            for item in orders_collection.aggregate(category_pipeline)
        ]

        # Status counts
        status_pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_counts = {
            item["_id"] or "Confirmed": item["count"]
            for item in orders_collection.aggregate(status_pipeline)
        }

        # Recent 5 users
        recent_users_cursor = users_collection.find().sort("created_at", -1).limit(5)
        recent_users = [serialize_user(u) for u in recent_users_cursor]

        return jsonify({
            "success": True,
            "stats": {
                "total_users": total_users,
                "total_products": total_products,
                "total_orders": total_orders,
                "total_sales": total_sales,
                "status_counts": status_counts,
            },
            "recent_orders": recent_orders,
            "low_stock_products": low_stock_products,
            "recent_users": recent_users,
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error loading admin statistics: {str(e)}"}), 500


@admin_bp.route("/orders", methods=["GET"])
def get_all_orders():
    try:
        orders_cursor = orders_collection.find().sort("created_at", -1)
        orders = [serialize_order(o) for o in orders_cursor]
        return jsonify({
            "success": True,
            "count": len(orders),
            "orders": orders
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching orders: {str(e)}"}), 500


@admin_bp.route("/orders/<order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    try:
        data = request.get_json() or {}
        new_status = data.get("status", "").strip()

        if not new_status:
            return jsonify({"success": False, "message": "Status is required"}), 400

        query = {"order_id": order_id}
        if ObjectId.is_valid(order_id):
            query = {"$or": [{"_id": ObjectId(order_id)}, {"order_id": order_id}]}

        res = orders_collection.update_one(
            query,
            {"$set": {"status": new_status, "updated_at": datetime.datetime.now(datetime.timezone.utc)}}
        )

        if res.matched_count == 0:
            return jsonify({"success": False, "message": "Order not found"}), 404

        updated_order = orders_collection.find_one(query)
        return jsonify({
            "success": True,
            "message": f"Order status updated to {new_status}",
            "order": serialize_order(updated_order)
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error updating order status: {str(e)}"}), 500


@admin_bp.route("/users", methods=["GET"])
def get_all_users():
    try:
        users_cursor = users_collection.find().sort("created_at", -1)
        users = [serialize_user(u) for u in users_cursor]
        return jsonify({
            "success": True,
            "count": len(users),
            "users": users
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching users: {str(e)}"}), 500
