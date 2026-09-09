-- ==============================================================================
-- MAUL THRIFT - FINANCE & INVENTORY MANAGEMENT SYSTEM
-- PostgreSQL Schema for Supabase
-- Based on DESIGN.md
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS bals CASCADE;

-- 3. BALS TABLE (Raw Bal purchases & Sortir data)
CREATE TABLE bals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bal_code VARCHAR(50) UNIQUE NOT NULL,
    bal_name VARCHAR(255) NOT NULL,
    purchase_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    shipping_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
    laundry_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
    packing_cost NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_capital NUMERIC(15, 2) GENERATED ALWAYS AS (purchase_price + shipping_cost + laundry_cost + packing_cost) STORED,
    total_grade_a_qty INTEGER NOT NULL DEFAULT 0,
    total_grade_b_qty INTEGER NOT NULL DEFAULT 0,
    total_defective_qty INTEGER NOT NULL DEFAULT 0,
    hpp_per_pcs NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'DELETED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PRODUCTS TABLE (Itemized single-stock inventory)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    bal_id UUID REFERENCES bals(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('HOODIE', 'CREWNECK', 'JACKET', 'PANTS', 'OTHERS')),
    grade VARCHAR(20) NOT NULL CHECK (grade IN ('GRADE_A', 'GRADE_B')),
    photo_url TEXT,
    selling_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    hpp_allocated NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'READY' CHECK (status IN ('READY', 'BOOKED', 'SOLD')),
    sold_price NUMERIC(15, 2),
    sold_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TRANSACTIONS TABLE (POS Sales & Operational Expenses)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('INCOME_SALE', 'EXPENSE_OPERATIONAL')),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    bal_id UUID REFERENCES bals(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    net_profit NUMERIC(15, 2) NOT NULL DEFAULT 0,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. INDEXES for High Performance
CREATE INDEX idx_products_bal_id ON products(bal_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_grade ON products(grade);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- 7. SUPABASE STORAGE BUCKET SETUP (For Product Photos)
-- In Supabase dashboard or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-photos', 'product-photos', true);
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-photos');
-- CREATE POLICY "Allow Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-photos');

-- 8. SEED SAMPLE DATA (Initial realistic dataset for demo / test)
INSERT INTO bals (id, bal_code, bal_name, purchase_price, shipping_cost, laundry_cost, packing_cost, total_grade_a_qty, total_grade_b_qty, total_defective_qty, hpp_per_pcs, status)
VALUES 
('d1111111-1111-1111-1111-111111111111', 'BAL-2026-001', 'Bal Segel Crewneck Vintage USA Grade A/B', 4500000, 250000, 300000, 150000, 65, 30, 5, 54737, 'ACTIVE'),
('d2222222-2222-2222-2222-222222222222', 'BAL-2026-002', 'Bal Hoodie Brand Japan & Korea', 5200000, 300000, 350000, 180000, 50, 25, 8, 80400, 'ACTIVE');

INSERT INTO products (id, sku, bal_id, name, category, grade, photo_url, selling_price, hpp_allocated, status, sold_price, sold_at)
VALUES
('p1111111-1111-1111-1111-111111111111', 'CRW-A-001', 'd1111111-1111-1111-1111-111111111111', 'Nike Vintage Small Swoosh Navy Blue (Size L)', 'CREWNECK', 'GRADE_A', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80', 175000, 54737, 'SOLD', 170000, NOW() - INTERVAL '2 days'),
('p2222222-2222-2222-2222-222222222222', 'CRW-A-002', 'd1111111-1111-1111-1111-111111111111', 'Champion Reverse Weave Grey Classic (Size XL)', 'CREWNECK', 'GRADE_A', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80', 210000, 54737, 'SOLD', 210000, NOW() - INTERVAL '1 day'),
('p3333333-3333-3333-3333-333333333333', 'CRW-B-003', 'd1111111-1111-1111-1111-111111111111', 'Adidas Trefoil Sweatshirt Black (Minor fading)', 'CREWNECK', 'GRADE_B', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80', 125000, 54737, 'READY', NULL, NULL),
('p4444444-4444-4444-4444-444444444444', 'HD-A-001', 'd2222222-2222-2222-2222-222222222222', 'Stussy World Tour Hoodie Black (Size M)', 'HOODIE', 'GRADE_A', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&q=80', 285000, 80400, 'READY', NULL, NULL),
('p5555555-5555-5555-5555-555555555555', 'HD-B-002', 'd2222222-2222-2222-2222-222222222222', 'Carhartt Heavyweight Zip Hoodie Brown', 'HOODIE', 'GRADE_B', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80', 195000, 80400, 'BOOKED', NULL, NULL);

INSERT INTO transactions (id, transaction_type, product_id, bal_id, description, amount, net_profit, transaction_date)
VALUES
('t1111111-1111-1111-1111-111111111111', 'INCOME_SALE', 'p1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Penjualan: Nike Vintage Small Swoosh Navy Blue', 170000, 115263, NOW() - INTERVAL '2 days'),
('t2222222-2222-2222-2222-222222222222', 'INCOME_SALE', 'p2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'Penjualan: Champion Reverse Weave Grey Classic', 210000, 155263, NOW() - INTERVAL '1 day'),
('t3333333-3333-3333-3333-333333333333', 'EXPENSE_OPERATIONAL', NULL, NULL, 'Beli Plastik Polymailer & Tag Gun Refill', 120000, -120000, NOW() - INTERVAL '3 days');
