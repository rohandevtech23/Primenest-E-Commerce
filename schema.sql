-- ==============================================================================
-- PrimeNest E-Commerce Database Schema & Initial Data
-- Database Engine: PostgreSQL 14+ / 17+
-- ==============================================================================

-- To create the database manually from psql, you can run:
-- CREATE DATABASE primenest_db;
-- \c primenest_db;

-- ------------------------------------------------------------------------------
-- 1. CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory VARCHAR(100),
    variants JSONB DEFAULT '[]'::jsonb,
    variant_label VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. PRODUCT IMAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(30),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. USER ADDRESSES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure order IDs start with prefix 78645 (e.g. 78645001, 78645002...)
ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 78645001;

-- ------------------------------------------------------------------------------
-- 7. ORDER ITEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON UPDATE CASCADE ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ------------------------------------------------------------------------------
-- SEED DATA: CATEGORIES
-- ------------------------------------------------------------------------------
INSERT INTO categories (name, slug)
VALUES
    ('Men', 'men'),
    ('Women', 'women'),
    ('Accessories', 'accessories'),
    ('Footwear', 'footwear'),
    ('Perfume', 'perfume')
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------------------------
-- SEED DATA: PRODUCTS & PRODUCT IMAGES
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    cat_men INT;
    cat_women INT;
    cat_acc INT;
    cat_footwear INT;
    cat_perfume INT;
    p_id INT;
BEGIN
    SELECT id INTO cat_men FROM categories WHERE slug = 'men';
    SELECT id INTO cat_women FROM categories WHERE slug = 'women';
    SELECT id INTO cat_acc FROM categories WHERE slug = 'accessories';
    SELECT id INTO cat_footwear FROM categories WHERE slug = 'footwear';
    SELECT id INTO cat_perfume FROM categories WHERE slug = 'perfume';

    -- 1. Essential Oxford Shirt
    IF NOT EXISTS (SELECT 1 FROM products WHERE slug = 'essential-oxford-shirt') THEN
        INSERT INTO products (name, slug, description, price, stock, category_id, subcategory, variants, variant_label)
        VALUES (
            'Essential Oxford Shirt',
            'essential-oxford-shirt',
            'Tailored classic button-down shirt crafted from 100% premium long-staple cotton with breathable finish.',
            1899.00,
            45,
            cat_men,
            'Casual Shirts',
            '[{"label": "S", "stock": 10}, {"label": "M", "stock": 15}, {"label": "L", "stock": 12}, {"label": "XL", "stock": 8}]'::jsonb,
            'Size'
        ) RETURNING id INTO p_id;

        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (p_id, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85', TRUE);
    END IF;

    -- 2. Relaxed Linen Dress
    IF NOT EXISTS (SELECT 1 FROM products WHERE slug = 'relaxed-linen-dress') THEN
        INSERT INTO products (name, slug, description, price, stock, category_id, subcategory, variants, variant_label)
        VALUES (
            'Relaxed Linen Dress',
            'relaxed-linen-dress',
            'Breathable summer dress in soft-washed pure European linen with functional side pockets and graceful silhouette.',
            2499.00,
            30,
            cat_women,
            'Dresses',
            '[{"label": "XS", "stock": 5}, {"label": "S", "stock": 10}, {"label": "M", "stock": 10}, {"label": "L", "stock": 5}]'::jsonb,
            'Size'
        ) RETURNING id INTO p_id;

        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (p_id, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85', TRUE);
    END IF;

    -- 3. Minimal Leather Watch
    IF NOT EXISTS (SELECT 1 FROM products WHERE slug = 'minimal-leather-watch') THEN
        INSERT INTO products (name, slug, description, price, stock, category_id, subcategory, variants, variant_label)
        VALUES (
            'Minimal Leather Watch',
            'minimal-leather-watch',
            'Precision Japanese quartz movement housed in brushed stainless steel with genuine Italian leather strap.',
            3299.00,
            20,
            cat_acc,
            'Watches',
            '[{"label": "Black Strap", "stock": 10}, {"label": "Tan Brown", "stock": 10}]'::jsonb,
            'Color'
        ) RETURNING id INTO p_id;

        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (p_id, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85', TRUE);
    END IF;

    -- 4. Signature Eau de Parfum
    IF NOT EXISTS (SELECT 1 FROM products WHERE slug = 'signature-eau-de-parfum') THEN
        INSERT INTO products (name, slug, description, price, stock, category_id, subcategory, variants, variant_label)
        VALUES (
            'Signature Eau de Parfum',
            'signature-eau-de-parfum',
            'A timeless artisanal blend of rich cedarwood, bergamot, and warm amber notes that lasts throughout the day.',
            2799.00,
            50,
            cat_perfume,
            'Luxury Fragrance',
            '[{"label": "50ml", "stock": 25}, {"label": "100ml", "stock": 25}]'::jsonb,
            'Volume'
        ) RETURNING id INTO p_id;

        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (p_id, 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=900&q=85', TRUE);
    END IF;

    -- 5. Classic Leather Sneakers
    IF NOT EXISTS (SELECT 1 FROM products WHERE slug = 'classic-leather-sneakers') THEN
        INSERT INTO products (name, slug, description, price, stock, category_id, subcategory, variants, variant_label)
        VALUES (
            'Classic Leather Sneakers',
            'classic-leather-sneakers',
            'Minimalist low-top sneakers in supple white leather with cushioned insole and non-slip durable rubber cupsole.',
            3499.00,
            40,
            cat_footwear,
            'Sneakers',
            '[{"label": "UK 7", "stock": 8}, {"label": "UK 8", "stock": 12}, {"label": "UK 9", "stock": 12}, {"label": "UK 10", "stock": 8}]'::jsonb,
            'Shoe Size'
        ) RETURNING id INTO p_id;

        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (p_id, 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=85', TRUE);
    END IF;

    -- 6. Ceramic Table Lamp
    IF NOT EXISTS (SELECT 1 FROM products WHERE slug = 'ceramic-table-lamp') THEN
        INSERT INTO products (name, slug, description, price, stock, category_id, subcategory, variants, variant_label)
        VALUES (
            'Ceramic Table Lamp',
            'ceramic-table-lamp',
            'Handcrafted stoneware base with natural linen lampshade, radiating a warm ambient glow in any living space.',
            1999.00,
            25,
            cat_home,
            'Lighting',
            '[{"label": "Sandstone", "stock": 15}, {"label": "Terracotta", "stock": 10}]'::jsonb,
            'Finish'
        ) RETURNING id INTO p_id;

        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (p_id, 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85', TRUE);
    END IF;

    -- 7. Botanical Hydrating Serum
    IF NOT EXISTS (SELECT 1 FROM products WHERE slug = 'botanical-hydrating-serum') THEN
        INSERT INTO products (name, slug, description, price, stock, category_id, subcategory, variants, variant_label)
        VALUES (
            'Botanical Hydrating Serum',
            'botanical-hydrating-serum',
            'Infused with multi-molecular hyaluronic acid and niacinamide for deeply hydrated, radiant skin.',
            1499.00,
            60,
            cat_beauty,
            'Skincare',
            '[{"label": "30ml", "stock": 40}, {"label": "50ml", "stock": 20}]'::jsonb,
            'Size'
        ) RETURNING id INTO p_id;

        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (p_id, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85', TRUE);
    END IF;

    -- 8. Organic Cotton Kids Set
    IF NOT EXISTS (SELECT 1 FROM products WHERE slug = 'organic-cotton-kids-set') THEN
        INSERT INTO products (name, slug, description, price, stock, category_id, subcategory, variants, variant_label)
        VALUES (
            'Organic Cotton Kids Set',
            'organic-cotton-kids-set',
            'Ultra-soft two-piece leisure set made from GOTS-certified organic cotton for sensitive skin and all-day play.',
            1299.00,
            35,
            cat_kids,
            'Clothing Sets',
            '[{"label": "2-3Y", "stock": 10}, {"label": "4-5Y", "stock": 15}, {"label": "6-7Y", "stock": 10}]'::jsonb,
            'Age'
        ) RETURNING id INTO p_id;

        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (p_id, 'https://images.unsplash.com/photo-1715285091754-c7241fe113fc?auto=format&fit=crop&w=900&q=85', TRUE);
    END IF;

    -- 9. Slim-Fit Selvedge Jeans
    IF NOT EXISTS (SELECT 1 FROM products WHERE slug = 'slim-fit-selvedge-jeans') THEN
        INSERT INTO products (name, slug, description, price, stock, category_id, subcategory, variants, variant_label)
        VALUES (
            'Slim-Fit Selvedge Jeans',
            'slim-fit-selvedge-jeans',
            'Durable 13.5oz Japanese selvedge denim in a modern slim tapered fit that ages uniquely with wear.',
            2999.00,
            40,
            cat_men,
            'Jeans',
            '[{"label": "30", "stock": 8}, {"label": "32", "stock": 16}, {"label": "34", "stock": 12}, {"label": "36", "stock": 4}]'::jsonb,
            'Waist'
        ) RETURNING id INTO p_id;

        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (p_id, 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=900&q=85', TRUE);
    END IF;

    -- 10. Handwoven Leather Tote Bag
    IF NOT EXISTS (SELECT 1 FROM products WHERE slug = 'handwoven-leather-tote') THEN
        INSERT INTO products (name, slug, description, price, stock, category_id, subcategory, variants, variant_label)
        VALUES (
            'Handwoven Leather Tote',
            'handwoven-leather-tote',
            'Spacious everyday tote handcrafted with supple woven calfskin leather, zippered interior, and brass hardware.',
            3999.00,
            18,
            cat_acc,
            'Bags',
            '[{"label": "Caramel Brown", "stock": 10}, {"label": "Midnight Black", "stock": 8}]'::jsonb,
            'Color'
        ) RETURNING id INTO p_id;

        INSERT INTO product_images (product_id, image_url, is_primary)
        VALUES (p_id, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85', TRUE);
    END IF;
END $$;
