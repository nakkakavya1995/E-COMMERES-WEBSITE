# NAKKA KAVYA → Full-Stack E-Commerce Application

An online shopping platform built with **React.js + Vite** on the frontend, **Python Flask + PyMongo** on the backend, and **MongoDB** as the database.

---

## 🛠️ Technology Stack

### Frontend
- **React.js** (v19) & **Vite**
- **React Router DOM** (v7) for client-side routing & protected route guarding
- **Axios** with automatic JWT Bearer token request interceptors & 401 response interceptors
- **Lucide React** for icons
- **Modern Responsive CSS** with custom properties, card shadows, hover lift states, and mobile drawer navigation

### Backend
- **Python 3.12**
- **Flask** with REST API Blueprints
- **Flask-CORS** with full cross-origin resource sharing configuration
- **PyMongo** for MongoDB integration
- **PyJWT** for JSON Web Token authentication
- **bcrypt** for salted password hashing
- **python-dotenv** for environment configuration

### Database
- **MongoDB** (`ecommerce_db`)
- Collections: `users`, `products`, `carts`, `orders`

---

## 📂 Project Structure

```text
E-commerce/
│
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   └── database.py          # PyMongo client & collection accessors
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user_model.py        # User schema helpers & serializers
│   │   ├── product_model.py     # Product schema helpers & serializers
│   │   ├── cart_model.py        # Cart schema helpers & calculations
│   │   └── order_model.py       # Order schema helpers & serializers
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth_routes.py       # Register, Login (JWT + bcrypt)
│   │   ├── product_routes.py    # List (search/category/price), Details, CRUD
│   │   ├── cart_routes.py       # Get, Add, Update qty, Remove item, Clear
│   │   ├── order_routes.py      # Checkout/Place order, List orders, Order details
│   │   └── user_routes.py       # Get Profile, Update Profile
│   │
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth_middleware.py   # JWT @token_required decorator
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   └── jwt_utils.py         # Token generation & verification
│   │
│   ├── app.py                   # Flask entry point with CORS & error handling
│   ├── requirements.txt         # Backend Python packages
│   ├── .env                     # MongoDB URI, DB Name, JWT Secret
│   └── seed_data.py             # 21 realistic products across all categories
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx       # Header, search, cart count badge, auth state
    │   │   ├── ProductCard.jsx  # Image, INR price, stock status, add to cart
    │   │   ├── ProtectedRoute.jsx # Route guard redirecting to /login
    │   │   └── Footer.jsx       # Footer with features strip & contact
    │   │
    │   ├── context/
    │   │   ├── AuthContext.jsx  # Auth state, login, logout, token sync
    │   │   └── CartContext.jsx  # Live cart state synchronized with MongoDB
    │   │
    │   ├── pages/
    │   │   ├── Home.jsx         # Hero, categories, featured, latest, CTA
    │   │   ├── Products.jsx     # Search + Category + Min/Max price filters
    │   │   ├── ProductDetails.jsx # Large image, stock check, quantity selector
    │   │   ├── Cart.jsx         # MongoDB-synced item +/- buttons, totals
    │   │   ├── Checkout.jsx     # Shipping address validation & place order
    │   │   ├── Orders.jsx       # Past order history with colored status badges
    │   │   ├── Profile.jsx      # View & update profile details
    │   │   ├── Login.jsx        # User login
    │   │   └── Register.jsx     # Full registration with validation
    │   │
    │   ├── services/
    │   │   └── api.js           # Axios client configured for http://127.0.0.1:5000/api
    │   │
    │   ├── App.jsx              # React Router setup
    │   ├── main.jsx             # React root with Context Providers
    │   └── index.css            # Modern responsive CSS styles
    │
    ├── package.json
    └── vite.config.js
```

---

## 🚀 How to Run the Application

### Prerequisites
- Python 3.10+
- Node.js (v18+) & npm
- MongoDB running locally on `mongodb://localhost:27017/`

### 1. Start the Backend Server

```powershell
cd backend
python -m pip install -r requirements.txt
python seed_data.py      # Seed the catalog with 21 products (optional / one-time)
python app.py
```
> The Flask API will start on **`http://127.0.0.1:5000`**.

### 2. Start the Frontend Application

In a separate terminal window:

```powershell
cd frontend
npm install
npm run dev
```
> The Vite frontend will start on **`http://127.0.0.1:5173`** (or `http://localhost:5173`).

---

## 🌐 REST API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new user (`name`, `email`, `password`, `confirm_password`)
- `POST /api/auth/login` — Sign in and receive JWT token (`email`, `password`)

### Products
- `GET /api/products` — List products with filters:
  - `?search=laptop`
  - `?category=Electronics`
  - `?min_price=30000&max_price=80000`
  - `?featured=true`
- `GET /api/products/<id>` — Get single product details
- `POST /api/products` — Create new product
- `PUT /api/products/<id>` — Update product
- `DELETE /api/products/<id>` — Delete product

### Cart (Requires JWT)
- `GET /api/cart` — Retrieve user's cart from MongoDB
- `POST /api/cart/add` — Add product to cart with quantity check against stock
- `PUT /api/cart/update/<product_id>` — Update item quantity in MongoDB
- `DELETE /api/cart/remove/<product_id>` — Remove item from cart in MongoDB
- `DELETE /api/cart/clear` — Clear all items in user's cart in MongoDB

### Orders (Requires JWT)
- `POST /api/orders` — Place order with shipping address, validate & decrement stock, clear cart
- `GET /api/orders` — Retrieve user's order history
- `GET /api/orders/<order_id>` — Retrieve specific order details

### User Profile (Requires JWT)
- `GET /api/users/profile` — Get profile info
- `PUT /api/users/profile` — Update `name`, `phone`, `address`
