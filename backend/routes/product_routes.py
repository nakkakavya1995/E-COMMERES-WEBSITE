import re
import datetime
from flask import Blueprint, request, jsonify
from bson import ObjectId
from backend.config.database import products_collection
from backend.models.product_model import serialize_product

product_bp = Blueprint("product_bp", __name__)


@product_bp.route("", methods=["GET"], strict_slashes=False)
@product_bp.route("/", methods=["GET"], strict_slashes=False)
def get_products():
    try:
        search = request.args.get("search", "").strip()
        category = request.args.get("category", "").strip()
        min_price = request.args.get("min_price", "").strip()
        max_price = request.args.get("max_price", "").strip()
        featured = request.args.get("featured", "").strip()

        query = {}

        # Category filter
        if category and category.lower() != "all":
            query["category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}

        # Search filter across name, category, and description
        if search:
            search_regex = {"$regex": re.escape(search), "$options": "i"}
            query["$or"] = [
                {"name": search_regex},
                {"category": search_regex},
                {"description": search_regex},
            ]

        # Price range filter
        price_query = {}
        if min_price:
            try:
                price_query["$gte"] = float(min_price)
            except ValueError:
                pass
        if max_price:
            try:
                price_query["$lte"] = float(max_price)
            except ValueError:
                pass
        if price_query:
            query["price"] = price_query

        # Featured filter
        if featured:
            if featured.lower() in ["true", "1"]:
                query["featured"] = True

        products_cursor = products_collection.find(query).sort("created_at", -1)
        products = [serialize_product(p) for p in products_cursor]

        return jsonify({
            "success": True,
            "count": len(products),
            "products": products
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching products: {str(e)}"}), 500


@product_bp.route("/<product_id>", methods=["GET"])
def get_product_by_id(product_id):
    try:
        if not ObjectId.is_valid(product_id):
            return jsonify({"success": False, "message": "Invalid product ID format"}), 400

        product = products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            return jsonify({"success": False, "message": "Product not found"}), 404

        return jsonify({
            "success": True,
            "product": serialize_product(product)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error fetching product: {str(e)}"}), 500


@product_bp.route("", methods=["POST"], strict_slashes=False)
@product_bp.route("/", methods=["POST"], strict_slashes=False)
def create_product():
    try:
        data = request.get_json() or {}
        name = data.get("name", "").strip()
        description = data.get("description", "").strip()
        price = data.get("price")
        category = data.get("category", "").strip()
        image = data.get("image", "").strip()
        stock = data.get("stock", 0)
        featured = bool(data.get("featured", False))

        if not name or price is None or not category:
            return jsonify({"success": False, "message": "Name, price, and category are required"}), 400

        try:
            price_val = float(price)
            stock_val = int(stock)
        except ValueError:
            return jsonify({"success": False, "message": "Price and stock must be numeric"}), 400

        new_product = {
            "name": name,
            "description": description,
            "price": price_val,
            "category": category,
            "image": image or "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
            "stock": max(0, stock_val),
            "featured": featured,
            "created_at": datetime.datetime.now(datetime.timezone.utc),
        }

        result = products_collection.insert_one(new_product)
        new_product["_id"] = result.inserted_id

        return jsonify({
            "success": True,
            "message": "Product created successfully",
            "product": serialize_product(new_product)
        }), 201

    except Exception as e:
        return jsonify({"success": False, "message": f"Error creating product: {str(e)}"}), 500


@product_bp.route("/<product_id>", methods=["PUT"])
def update_product(product_id):
    try:
        if not ObjectId.is_valid(product_id):
            return jsonify({"success": False, "message": "Invalid product ID format"}), 400

        data = request.get_json() or {}
        update_fields = {}

        if "name" in data:
            update_fields["name"] = data["name"].strip()
        if "description" in data:
            update_fields["description"] = data["description"].strip()
        if "price" in data:
            update_fields["price"] = float(data["price"])
        if "category" in data:
            update_fields["category"] = data["category"].strip()
        if "image" in data:
            update_fields["image"] = data["image"].strip()
        if "stock" in data:
            update_fields["stock"] = max(0, int(data["stock"]))
        if "featured" in data:
            update_fields["featured"] = bool(data["featured"])

        update_fields["updated_at"] = datetime.datetime.now(datetime.timezone.utc)

        result = products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_fields}
        )

        if result.matched_count == 0:
            return jsonify({"success": False, "message": "Product not found"}), 404

        updated_product = products_collection.find_one({"_id": ObjectId(product_id)})
        return jsonify({
            "success": True,
            "message": "Product updated successfully",
            "product": serialize_product(updated_product)
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error updating product: {str(e)}"}), 500


@product_bp.route("/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    try:
        if not ObjectId.is_valid(product_id):
            return jsonify({"success": False, "message": "Invalid product ID format"}), 400

        result = products_collection.delete_one({"_id": ObjectId(product_id)})
        if result.deleted_count == 0:
            return jsonify({"success": False, "message": "Product not found"}), 404

        return jsonify({"success": True, "message": "Product deleted successfully"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error deleting product: {str(e)}"}), 500
