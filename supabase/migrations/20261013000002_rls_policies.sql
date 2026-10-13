-- ============================================================================
-- ToolCart UK - Milestone 4 Database Migration: Row-Level Security (RLS)
-- Description: Strict isolation of wholesale pricing and public read policies
-- ============================================================================

-- 1. Enable RLS on all 11 tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_objects ENABLE ROW LEVEL SECURITY;

-- 2. Products RLS Policies
-- Public storefront can read approved products only
CREATE POLICY "Public read approved products"
    ON products FOR SELECT
    USING (sellability_status = 'approved');

-- Service role / Admin has unrestricted access
CREATE POLICY "Service role full access on products"
    ON products FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. Product Specifications RLS Policies
-- Public can read specs for approved products
CREATE POLICY "Public read approved specifications"
    ON product_specifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = product_specifications.product_id
            AND p.sellability_status = 'approved'
        )
    );

CREATE POLICY "Service role full access on specifications"
    ON product_specifications FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. Categories RLS Policies
CREATE POLICY "Public read categories"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Service role full access on categories"
    ON categories FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. Suppliers RLS Policies
-- Basic supplier profile visible to public; detailed margins protected
CREATE POLICY "Public read basic supplier info"
    ON suppliers FOR SELECT
    USING (true);

CREATE POLICY "Service role full access on suppliers"
    ON suppliers FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. Wholesale Offers RLS Policies (CRITICAL SECURITY MANDATE)
-- Explicitly revoke all access from public (anon and authenticated) roles
REVOKE ALL ON wholesale_offers FROM anon, authenticated;

-- Service role exclusively has full read/write access
CREATE POLICY "Service role exclusive access on wholesale offers"
    ON wholesale_offers FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. Orders RLS Policies
-- Customers can view their own orders via authenticated user ID or email JWT claim
CREATE POLICY "Customers read own orders"
    ON orders FOR SELECT
    TO authenticated
    USING (
        auth.uid() = customer_id
        OR customer_email = (auth.jwt() ->> 'email')
    );

-- Anyone can submit checkout orders
CREATE POLICY "Public create checkout orders"
    ON orders FOR INSERT
    WITH CHECK (state = 'cart_pending');

CREATE POLICY "Service role full access on orders"
    ON orders FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 8. Order Items RLS Policies
CREATE POLICY "Customers read own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
            AND (
                o.customer_id = auth.uid()
                OR o.customer_email = (auth.jwt() ->> 'email')
            )
        )
    );

CREATE POLICY "Public insert order items"
    ON order_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role full access on order items"
    ON order_items FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 9. Order Audit Logs RLS Policies
CREATE POLICY "Customers read own order audit logs"
    ON order_audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_audit_logs.order_id
            AND (
                o.customer_id = auth.uid()
                OR o.customer_email = (auth.jwt() ->> 'email')
            )
        )
    );

CREATE POLICY "Service role full access on order audit logs"
    ON order_audit_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 10. Trade Customers RLS Policies
CREATE POLICY "Trade customers read own record"
    ON trade_customers FOR SELECT
    TO authenticated
    USING (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Public apply for trade account"
    ON trade_customers FOR INSERT
    WITH CHECK (status = 'pending');

CREATE POLICY "Service role full access on trade customers"
    ON trade_customers FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 11. Pricing Rules RLS Policies
-- Wholesale margin rules are confidential business logic
REVOKE ALL ON pricing_rules FROM anon, authenticated;

CREATE POLICY "Service role exclusive access on pricing rules"
    ON pricing_rules FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 12. Storage Objects RLS Policies
CREATE POLICY "Public read storage objects"
    ON storage_objects FOR SELECT
    USING (true);

CREATE POLICY "Service role full access on storage objects"
    ON storage_objects FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
