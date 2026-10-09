import os
import hmac
import hashlib
import razorpay
from pathlib import Path
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv()

payment_bp = Blueprint("payment", __name__)


def get_razorpay_client():
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        raise ValueError("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) not configured")
    return razorpay.Client(auth=(key_id, key_secret))


@payment_bp.route("/create-order", methods=["POST"])
def create_payment_order():
    try:
        data = request.get_json() or {}
        amount = data.get("amount")

        if amount is None or float(amount) <= 0:
            return jsonify({"success": False, "error": "A valid amount is required"}), 400

        # Razorpay expects amount in paise (1 INR = 100 paise)
        amount_in_paise = int(round(float(amount) * 100))

        client = get_razorpay_client()
        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"rcpt_{int(os.urandom(4).hex(), 16)}"[:40],
            "payment_capture": 1
        }

        razorpay_order = client.order.create(data=order_data)
        key_id = os.getenv("RAZORPAY_KEY_ID")

        return jsonify({
            "success": True,
            "order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "key_id": key_id
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@payment_bp.route("/verify", methods=["POST"])
def verify_payment():
    try:
        data = request.get_json() or {}

        razorpay_order_id = data.get("razorpay_order_id")
        razorpay_payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")

        if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
            return jsonify({
                "success": False,
                "message": "Missing required verification parameters"
            }), 400

        key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
        generated_signature = hmac.new(
            key_secret.encode("utf-8"),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        if hmac.compare_digest(generated_signature, razorpay_signature):
            return jsonify({
                "success": True,
                "message": "Payment verified successfully"
            }), 200

        return jsonify({
            "success": False,
            "message": "Payment verification signature mismatch"
        }), 400

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500