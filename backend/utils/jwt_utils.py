import os
import datetime
import jwt
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "my_ecommerce_secret_key_2026")
JWT_ALGORITHM = "HS256"
def generate_token(user_id, email, name):
    """
    Generate a JWT token for the user with 7 days expiration.
    """
    payload = {
        "user_id": str(user_id),
        "email": email,
        "name": name,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7),
        "iat": datetime.datetime.now(datetime.timezone.utc),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    if isinstance(token, bytes):
        return token.decode("utf-8")
    return token


def decode_token(token):
    """
    Decode and verify a JWT token.
    Returns the decoded payload dict or raises an exception.
    """
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
