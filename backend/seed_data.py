import os
import sys
from pathlib import Path
import datetime

# Add root directory to path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR.parent) not in sys.path:
    sys.path.insert(0, str(BASE_DIR.parent))

from backend.config.database import products_collection

SAMPLE_PRODUCTS = [
    # 1 Rupee Flash Deal / Testing Product
    {
        "name": "₹1 Special Deal - Digital Gift Card",
        "description": "Exclusive 1 Rupee special item! Perfect for quick testing of Razorpay checkout and instant confirmation.",
        "price": 1.0,
        "category": "Special Deals",
        "image": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80",
        "stock": 999,
        "featured": True,
    },
    # Electronics
    {
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "description": "Industry-leading noise canceling with Auto NC Optimizer, crystal clear hands-free calling, and 30-hour battery life with quick charging.",
        "price": 26990.0,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "stock": 18,
        "featured": True,
    },
    {
        "name": "Amazon Echo Studio Smart Speaker",
        "description": "High-fidelity smart speaker with 3D audio, Dolby Atmos, and built-in Alexa smart home hub.",
        "price": 19999.0,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80",
        "stock": 12,
        "featured": False,
    },
    {
        "name": "Canon EOS R50 Mirrorless Camera",
        "description": "Compact and lightweight 24.2 MP APS-C mirrorless camera with Dual Pixel CMOS AF II and 4K 30p uncropped video.",
        "price": 63990.0,
        "category": "Electronics",
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
        "stock": 8,
        "featured": True,
    },

    # Mobiles
    {
        "name": "Samsung Galaxy S24 Ultra",
        "description": "Galaxy AI powered flagship with 200MP camera, Snapdragon 8 Gen 3, titanium frame, and built-in S Pen.",
        "price": 129999.0,
        "category": "Mobiles",
        "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
        "stock": 15,
        "featured": True,
    },
    {
        "name": "Apple iPhone 16 Pro",
        "description": "A18 Pro chip, Super Retina XDR display with ProMotion, Camera Control button, and titanium aerospace design.",
        "price": 119900.0,
        "category": "Mobiles",
        "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
        "stock": 10,
        "featured": True,
    },
    {
        "name": "OnePlus 12 5G",
        "description": "16GB RAM, 512GB Storage, Snapdragon 8 Gen 3, 50MP Sony LYT-808 Camera, 100W SUPERVOOC charging.",
        "price": 64999.0,
        "category": "Mobiles",
        "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
        "stock": 14,
        "featured": False,
    },

    # Laptops
    {
        "name": "HP Pavilion 15 Laptop",
        "description": "12th Gen Intel Core i5, 16GB DDR4, 512GB SSD, 15.6-inch FHD Micro-Edge Display, Windows 11 with MS Office.",
        "price": 55000.0,
        "category": "Laptops",
        "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
        "stock": 10,
        "featured": True,
    },
    {
        "name": "Apple MacBook Air M3",
        "description": "13.6-inch Liquid Retina Display, 8-Core CPU, 10-Core GPU, 16GB Unified Memory, 512GB SSD Storage, Midnight finish.",
        "price": 114900.0,
        "category": "Laptops",
        "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
        "stock": 9,
        "featured": True,
    },
    {
        "name": "Dell XPS 13 Plus",
        "description": "Edge-to-edge capacitive touch function row, zero-lattice keyboard, seamless glass touchpad, 3.5K OLED touch display.",
        "price": 139990.0,
        "category": "Laptops",
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
        "stock": 6,
        "featured": False,
    },

    # Gaming
    {
        "name": "Sony PlayStation 5 Slim Console",
        "description": "1TB SSD Storage, Ultra-High Speed SSD, Integrated I/O, Ray Tracing, 4K-TV Gaming, DualSense Wireless Controller.",
        "price": 49990.0,
        "category": "Gaming",
        "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
        "stock": 7,
        "featured": True,
    },
    {
        "name": "Logitech G Pro X Superlight 2 Gaming Mouse",
        "description": "60g ultra-lightweight wireless esports gaming mouse with HERO 2 sensor, LIGHTFORCE hybrid optical-mechanical switches.",
        "price": 12995.0,
        "category": "Gaming",
        "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
        "stock": 25,
        "featured": False,
    },
    {
        "name": "ASUS ROG Swift 27-inch Gaming Monitor",
        "description": "WQHD 2560x1440, Fast IPS, 240Hz refresh rate, 1ms response time, G-SYNC compatible, HDR400.",
        "price": 42500.0,
        "category": "Gaming",
        "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
        "stock": 11,
        "featured": False,
    },

    # Fashion
    {
        "name": "Men's Classic Wool Blend Trench Coat",
        "description": "Double-breasted tailored slim-fit overcoat designed with warm premium wool blend fabric and storm flap.",
        "price": 4499.0,
        "category": "Fashion",
        "image": "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80",
        "stock": 30,
        "featured": False,
    },
    {
        "name": "Women's Elegant Silk Wrap Dress",
        "description": "Flowing 100% mulberry silk wrap dress with subtle tie-waist detail and flattering midi silhouette.",
        "price": 5999.0,
        "category": "Fashion",
        "image": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80",
        "stock": 20,
        "featured": True,
    },
    {
        "name": "Urban Denim Jacket with Sherpa Collar",
        "description": "Heavyweight indigo cotton denim jacket featuring soft sherpa fleece lining and vintage washed brass buttons.",
        "price": 3299.0,
        "category": "Fashion",
        "image": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
        "stock": 22,
        "featured": False,
    },

    # Shoes
    {
        "name": "Nike Air Jordan 1 Retro High OG",
        "description": "Iconic basketball sneaker featuring premium leather upper, encapsulated Air-Sole unit, and signature rubber traction outsole.",
        "price": 16995.0,
        "category": "Shoes",
        "image": "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
        "stock": 14,
        "featured": True,
    },
    {
        "name": "Adidas Ultraboost Light Running Shoes",
        "description": "Lightest Boost cushioning yet with Primeknit+ upper for supreme comfort and Continental natural rubber grip.",
        "price": 11999.0,
        "category": "Shoes",
        "image": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
        "stock": 19,
        "featured": False,
    },
    {
        "name": "Timberland 6-Inch Premium Waterproof Boots",
        "description": "Rugged nubuck leather construction with seam-sealed waterproof engineering, padded collar, and lug sole.",
        "price": 13500.0,
        "category": "Shoes",
        "image": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80",
        "stock": 8,
        "featured": False,
    },

    # Accessories
    {
        "name": "Fossil Minimalist Chronograph Leather Watch",
        "description": "Sleek 44mm stainless steel case, genuine rich brown leather band, quartz chronograph movement, 50m water resistant.",
        "price": 8495.0,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
        "stock": 25,
        "featured": True,
    },
    {
        "name": "Ray-Ban Aviator Classic Polarized Sunglasses",
        "description": "Timeless teardrop pilot shape with gold metal frame, green classic G-15 polarized crystal lenses, 100% UV protection.",
        "price": 10590.0,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
        "stock": 17,
        "featured": False,
    },
    {
        "name": "Bellroy Slim Leather Bi-fold Wallet",
        "description": "Environmentally certified leather with quick-draw slots, pull tab for hidden cards, and flat bill section.",
        "price": 3999.0,
        "category": "Accessories",
        "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
        "stock": 35,
        "featured": False,
    },
]


def seed_database():
    print("Clearing and re-seeding products collection...")
    products_collection.delete_many({})

    now = datetime.datetime.now(datetime.timezone.utc)
    for prod in SAMPLE_PRODUCTS:
        prod["created_at"] = now

    result = products_collection.insert_many(SAMPLE_PRODUCTS)
    print(f"Successfully seeded {len(result.inserted_ids)} products into ecommerce_db!")


if __name__ == "__main__":
    seed_database()
