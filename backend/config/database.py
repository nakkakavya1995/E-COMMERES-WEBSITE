import os
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "ecommerce_db")

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[DATABASE_NAME]

    # Initialize collections
    users_collection = db["users"]
    products_collection = db["products"]
    carts_collection = db["carts"]
    orders_collection = db["orders"]

    # Safe index creation
    try:
        users_collection.create_index([("email", ASCENDING)], unique=True)
    except Exception as ie:
        print(f"Notice: users email index: {ie}")

    try:
        carts_collection.create_index([("user_id", ASCENDING)], unique=True)
    except Exception as ie:
        print(f"Notice: carts user_id index: {ie}")

    try:
        products_collection.create_index([("category", ASCENDING)])
    except Exception as ie:
        print(f"Notice: products category index: {ie}")

    try:
        orders_collection.create_index([("user_id", ASCENDING)])
    except Exception as ie:
        print(f"Notice: orders user_id index: {ie}")

    print(f"Connected to MongoDB: {DATABASE_NAME}")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    raise e


def get_db():
    return db
