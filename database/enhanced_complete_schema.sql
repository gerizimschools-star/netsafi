-- Enhanced Complete Database Schema for NetSafi ISP Management System
-- Comprehensive schema for admin, reseller, and user management

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS voucher_usage_logs CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS user_session_logs CASCADE;
DROP TABLE IF EXISTS router_performance_logs CASCADE;
DROP TABLE IF EXISTS reseller_commissions CASCADE;
DROP TABLE IF EXISTS plan_usage_statistics CASCADE;
DROP TABLE IF EXISTS system_audit_logs CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS api_access_logs CASCADE;
DROP TABLE IF EXISTS financial_reports CASCADE;
DROP TABLE IF EXISTS license_renewals CASCADE;

-- Create updated schema with all enhancements

-- Admin users table
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'operator')),
    permissions TEXT[], -- Array of permissions
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reseller tiers for different commission levels
CREATE TABLE reseller_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    max_credit_limit INTEGER DEFAULT 100000,
    max_users INTEGER DEFAULT 500,
    max_routers INTEGER DEFAULT 10,
    benefits TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced resellers table
CREATE TABLE resellers (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(255),
    address TEXT,
    tier_id INTEGER REFERENCES reseller_tiers(id),
    commission_rate DECIMAL(5,2) DEFAULT 15.00,
    credit_balance INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_commission_earned INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Inactive')),
    permissions TEXT[],
    api_key VARCHAR(255) UNIQUE,
    last_login TIMESTAMP,
    license_type VARCHAR(50) DEFAULT 'Basic' CHECK (license_type IN ('Basic', 'Pro', 'Enterprise')),
    license_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Router management table
CREATE TABLE routers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ip_address INET NOT NULL UNIQUE,
    location VARCHAR(255),
    model VARCHAR(100),
    router_type VARCHAR(50) DEFAULT 'mikrotik',
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    api_port INTEGER DEFAULT 8728,
    status VARCHAR(20) DEFAULT 'Online' CHECK (status IN ('Online', 'Offline', 'Maintenance')),
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE SET NULL,
    connected_users INTEGER DEFAULT 0,
    uptime_percentage DECIMAL(5,2) DEFAULT 0.00,
    data_transferred_gb DECIMAL(10,2) DEFAULT 0.00,
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced time-based plans
CREATE TABLE time_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_hours INTEGER NOT NULL,
    price INTEGER NOT NULL, -- Price in cents/smallest currency unit
    speed_download INTEGER NOT NULL, -- Mbps
    speed_upload INTEGER NOT NULL, -- Mbps
    data_limit_gb INTEGER, -- NULL for unlimited
    category VARCHAR(50) DEFAULT 'hourly' CHECK (category IN ('hourly', 'daily', 'weekly', 'monthly')),
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE SET NULL,
    popularity_score INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255),
    current_plan_id INTEGER REFERENCES time_plans(id),
    reseller_id INTEGER REFERENCES resellers(id),
    router_id INTEGER REFERENCES routers(id),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Expired', 'Inactive')),
    location VARCHAR(255),
    device_info TEXT,
    preferred_payment_method VARCHAR(50),
    total_spent INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    data_used_gb DECIMAL(10,2) DEFAULT 0.00,
    last_seen TIMESTAMP,
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions tracking
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES time_plans(id),
    router_id INTEGER REFERENCES routers(id),
    session_token VARCHAR(255) UNIQUE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER DEFAULT 0,
    data_used_mb INTEGER DEFAULT 0,
    ip_address INET,
    mac_address VARCHAR(17),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Terminated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced vouchers table
CREATE TABLE vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    plan_id INTEGER REFERENCES time_plans(id),
    reseller_id INTEGER REFERENCES resellers(id),
    router_id INTEGER REFERENCES routers(id),
    amount INTEGER NOT NULL,
    commission_amount INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Unused' CHECK (status IN ('Unused', 'Used', 'Expired', 'Cancelled')),
    used_by_user_id INTEGER REFERENCES users(id),
    used_at TIMESTAMP,
    expires_at TIMESTAMP,
    batch_id VARCHAR(100),
    qr_code_url VARCHAR(255),
    category VARCHAR(50) DEFAULT 'Regular',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions
CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    reseller_id INTEGER REFERENCES resellers(id),
    voucher_id INTEGER REFERENCES vouchers(id),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('voucher_purchase', 'plan_payment', 'credit_topup', 'commission', 'refund')),
    amount INTEGER NOT NULL,
    commission_amount INTEGER DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    gateway_response JSONB,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reseller credit transactions
CREATE TABLE reseller_credit_transactions (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'commission', 'adjustment')),
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference VARCHAR(255),
    description TEXT,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reseller commissions tracking
CREATE TABLE reseller_commissions (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE CASCADE,
    transaction_id INTEGER REFERENCES payment_transactions(id),
    voucher_id INTEGER REFERENCES vouchers(id),
    commission_amount INTEGER NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Cancelled')),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Router performance monitoring
CREATE TABLE router_performance_logs (
    id SERIAL PRIMARY KEY,
    router_id INTEGER REFERENCES routers(id) ON DELETE CASCADE,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    uptime_hours INTEGER,
    connected_users INTEGER,
    data_transfer_mb INTEGER,
    response_time_ms INTEGER,
    status VARCHAR(20) CHECK (status IN ('Online', 'Offline', 'Maintenance')),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plan usage statistics
CREATE TABLE plan_usage_statistics (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES time_plans(id) ON DELETE CASCADE,
    reseller_id INTEGER REFERENCES resellers(id),
    date DATE DEFAULT CURRENT_DATE,
    vouchers_generated INTEGER DEFAULT 0,
    vouchers_used INTEGER DEFAULT 0,
    total_revenue INTEGER DEFAULT 0,
    total_commission INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial reports
CREATE TABLE financial_reports (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id),
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue INTEGER DEFAULT 0,
    total_commission INTEGER DEFAULT 0,
    vouchers_sold INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    active_customers INTEGER DEFAULT 0,
    report_data JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('admin', 'reseller', 'user')),
    recipient_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'promotion')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(255),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API access logging
CREATE TABLE api_access_logs (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_ip INET,
    user_agent TEXT,
    request_data JSONB,
    response_status INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System audit logs
CREATE TABLE system_audit_logs (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('admin', 'reseller')),
    user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- License renewals tracking
CREATE TABLE license_renewals (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE CASCADE,
    old_license_type VARCHAR(50),
    new_license_type VARCHAR(50),
    old_expiry_date TIMESTAMP,
    new_expiry_date TIMESTAMP,
    renewal_fee INTEGER,
    payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed')),
    processed_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration
CREATE TABLE system_configuration (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_type VARCHAR(50) DEFAULT 'text',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    updated_by INTEGER REFERENCES admin_users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_resellers_status ON resellers(status);
CREATE INDEX idx_resellers_tier ON resellers(tier_id);
CREATE INDEX idx_routers_status ON routers(status);
CREATE INDEX idx_routers_reseller ON routers(reseller_id);
CREATE INDEX idx_plans_active ON time_plans(is_active);
CREATE INDEX idx_plans_category ON time_plans(category);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_reseller ON users(reseller_id);
CREATE INDEX idx_sessions_status ON user_sessions(status);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_vouchers_status ON vouchers(status);
CREATE INDEX idx_vouchers_reseller ON vouchers(reseller_id);
CREATE INDEX idx_transactions_status ON payment_transactions(status);
CREATE INDEX idx_transactions_type ON payment_transactions(transaction_type);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_audit_logs_user ON system_audit_logs(user_type, user_id);
CREATE INDEX idx_audit_logs_created ON system_audit_logs(created_at);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resellers_updated_at BEFORE UPDATE ON resellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routers_updated_at BEFORE UPDATE ON routers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_plans_updated_at BEFORE UPDATE ON time_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data

-- Insert reseller tiers
INSERT INTO reseller_tiers (name, commission_rate, max_credit_limit, max_users, max_routers, benefits) VALUES
('Bronze', 10.00, 50000, 100, 5, ARRAY['Basic Support', 'Monthly Reports']),
('Silver', 12.00, 100000, 300, 15, ARRAY['Priority Support', 'Weekly Reports', 'API Access']),
('Gold', 15.00, 200000, 500, 25, ARRAY['Dedicated Support', 'Daily Reports', 'API Access', 'Custom Branding']),
('Platinum', 18.00, 500000, 1000, 50, ARRAY['24/7 Support', 'Real-time Reports', 'Full API Access', 'White Label']);

-- Insert admin users
INSERT INTO admin_users (username, password_hash, email, full_name, role, permissions) VALUES
('admin', '$2b$10$hashedpassword', 'admin@netsafi.com', 'System Administrator', 'super_admin', ARRAY['all']),
('operator', '$2b$10$hashedpassword', 'operator@netsafi.com', 'Network Operator', 'operator', ARRAY['routers', 'users', 'reports']);

-- Insert sample resellers
INSERT INTO resellers (username, password_hash, company_name, contact_person, email, phone, location, tier_id, commission_rate, credit_balance, api_key, license_type, license_expires_at) VALUES
('nairobi_tech', '$2b$10$hashedpassword', 'Nairobi Tech Solutions', 'James Kimani', 'james@naitech.com', '+254701234567', 'Nairobi, Kenya', 3, 15.00, 125000, 'nts_api_key_2024', 'Pro', '2024-12-31 23:59:59'),
('coast_internet', '$2b$10$hashedpassword', 'Coast Internet Services', 'Fatma Said', 'fatma@coastnet.com', '+254702345678', 'Mombasa, Kenya', 2, 12.00, 75000, 'cis_api_key_2024', 'Basic', '2024-06-30 23:59:59'),
('lake_connect', '$2b$10$hashedpassword', 'Lake Connect Ltd', 'Peter Odhiambo', 'peter@lakeconnect.com', '+254703456789', 'Kisumu, Kenya', 2, 12.00, 45000, 'lcl_api_key_2024', 'Basic', '2024-08-31 23:59:59');

-- Insert sample routers
INSERT INTO routers (name, ip_address, location, model, username, password_hash, reseller_id, connected_users, uptime_percentage, data_transferred_gb) VALUES
('Gateway Alpha', '192.168.10.1', 'Nairobi Central Office', 'RB4011iGS+', 'admin', '$2b$10$hashedpassword', 1, 45, 99.8, 2100.50),
('Branch Beta', '192.168.11.1', 'Kiambu Branch Office', 'RB3011UiAS', 'admin', '$2b$10$hashedpassword', 1, 23, 99.5, 1400.25),
('Backup Gamma', '192.168.12.1', 'Backup Site', 'RB2011UiAS', 'admin', '$2b$10$hashedpassword', 1, 0, 95.2, 800.75),
('Coast Main', '192.168.20.1', 'Mombasa Main Office', 'RB4011iGS+', 'admin', '$2b$10$hashedpassword', 2, 34, 98.9, 1800.30),
('Lake Router', '192.168.30.1', 'Kisumu Office', 'RB3011UiAS', 'admin', '$2b$10$hashedpassword', 3, 12, 97.5, 600.15);

-- Insert sample time plans
INSERT INTO time_plans (name, description, duration_hours, price, speed_download, speed_upload, category, reseller_id, popularity_score, sales_count) VALUES
('Quick Browse', 'Perfect for quick browsing and social media', 1, 1500, 5, 2, 'hourly', 1, 85, 267),
('Extended Session', 'Extended browsing with high speed', 4, 4500, 15, 8, 'hourly', 1, 60, 45),
('All Day Basic', 'Full day internet access', 24, 8000, 8, 4, 'daily', 1, 75, 134),
('Daily Standard', 'High-speed all-day package', 24, 12000, 15, 8, 'daily', 1, 70, 89),
('Daily Premium', 'Premium high-speed internet', 24, 18000, 25, 15, 'daily', 1, 90, 156),
('Coast Basic', 'Coast region basic plan', 24, 7500, 8, 4, 'daily', 2, 65, 78),
('Lake Special', 'Lake region special offer', 12, 6000, 10, 5, 'hourly', 3, 55, 23);

-- Insert sample users
INSERT INTO users (username, full_name, email, phone, current_plan_id, reseller_id, router_id, location, device_info, preferred_payment_method, total_spent, sessions_count, data_used_gb) VALUES
('john_mwangi', 'John Mwangi', 'john@example.com', '+254712345678', 5, 1, 1, 'Nairobi', 'Samsung Galaxy S21', 'M-Pesa', 234000, 45, 125.50),
('grace_njeri', 'Grace Njeri', 'grace@example.com', '+254723456789', 4, 1, 2, 'Kiambu', 'iPhone 12', 'Airtel Money', 144000, 12, 82.30),
('peter_ochieng', 'Peter Ochieng', 'peter@example.com', '+254734567890', 1, 1, 1, 'Thika', 'Tecno Spark 8', 'M-Pesa', 45000, 30, 31.20),
('mary_wanjiku', 'Mary Wanjiku', 'mary@example.com', '+254745678901', 3, 1, 1, 'Nairobi', 'Huawei P40', 'Bank Transfer', 72000, 18, 68.70);

-- Insert sample vouchers
INSERT INTO vouchers (code, plan_id, reseller_id, router_id, amount, commission_amount, status, batch_id, category) VALUES
('NT240001', 1, 1, 1, 1500, 225, 'Unused', 'BATCH-001', 'Regular'),
('NT240002', 5, 1, 1, 18000, 2700, 'Used', 'BATCH-001', 'Premium'),
('NT240003', 3, 1, 2, 8000, 1200, 'Unused', 'BATCH-002', 'Regular'),
('CS240001', 6, 2, 4, 7500, 900, 'Unused', 'COAST-001', 'Regional'),
('LK240001', 7, 3, 5, 6000, 720, 'Used', 'LAKE-001', 'Special');

-- Insert sample payment transactions
INSERT INTO payment_transactions (user_id, reseller_id, voucher_id, transaction_type, amount, commission_amount, payment_method, payment_reference, status, processed_at) VALUES
(1, 1, 2, 'voucher_purchase', 18000, 2700, 'M-Pesa', 'MPesa-001-2024', 'Completed', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(2, 1, NULL, 'plan_payment', 12000, 1800, 'Airtel Money', 'Airtel-002-2024', 'Completed', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(NULL, 1, NULL, 'credit_topup', 25000, 0, 'Bank Transfer', 'BT-003-2024', 'Pending', CURRENT_TIMESTAMP),
(4, 1, NULL, 'plan_payment', 8000, 1200, 'Bank Transfer', 'BT-004-2024', 'Completed', CURRENT_TIMESTAMP - INTERVAL '3 hours');

-- Insert sample reseller credit transactions
INSERT INTO reseller_credit_transactions (reseller_id, transaction_type, amount, balance_before, balance_after, reference, description) VALUES
(1, 'credit', 25000, 100000, 125000, 'TOP-001', 'Monthly credit top-up'),
(1, 'commission', 2700, 125000, 127700, 'COM-001', 'Commission from voucher sale'),
(1, 'debit', 5000, 127700, 122700, 'DEB-001', 'Voucher generation cost'),
(2, 'credit', 15000, 60000, 75000, 'TOP-002', 'Credit reload'),
(3, 'commission', 720, 44280, 45000, 'COM-002', 'Commission from plan sale');

-- Insert system configuration
INSERT INTO system_configuration (config_key, config_value, config_type, description) VALUES
('company_name', 'NetSafi ISP Solutions', 'text', 'Company name displayed throughout the system'),
('default_currency', 'KES', 'text', 'Default currency for the system'),
('default_timezone', 'Africa/Nairobi', 'text', 'Default timezone for the system'),
('commission_rate_default', '15.00', 'decimal', 'Default commission rate for new resellers'),
('voucher_expiry_days', '30', 'integer', 'Default voucher expiry in days'),
('session_timeout_minutes', '5', 'integer', 'User session timeout in minutes'),
('max_login_attempts', '5', 'integer', 'Maximum login attempts before lockout'),
('backup_retention_days', '90', 'integer', 'Database backup retention period in days');

-- Insert sample notifications
INSERT INTO notifications (recipient_type, recipient_id, title, message, type, priority) VALUES
('reseller', 1, 'License Renewal Required', 'Your Pro license expires in 45 days. Renew now to avoid service interruption.', 'warning', 'high'),
('reseller', 1, 'Monthly Target Achieved', 'Congratulations! You have exceeded your monthly sales target by 23%.', 'success', 'normal'),
('reseller', 1, 'Router Online', 'Gateway Alpha router is back online and serving customers.', 'info', 'normal'),
('reseller', 2, 'Low Credit Alert', 'Your credit balance is below KES 20,000. Consider topping up.', 'warning', 'normal'),
('admin', 1, 'High Router Usage', 'Gateway Alpha router is at 95% capacity. Consider load balancing.', 'warning', 'high');

-- Create views for common queries

-- Reseller dashboard summary
CREATE OR REPLACE VIEW reseller_dashboard_summary AS
SELECT 
    r.id,
    r.company_name,
    r.credit_balance,
    r.commission_rate,
    rt.name as tier_name,
    COUNT(DISTINCT u.id) as total_customers,
    COUNT(DISTINCT CASE WHEN u.status = 'Active' THEN u.id END) as active_customers,
    COUNT(DISTINCT ro.id) as total_routers,
    COUNT(DISTINCT CASE WHEN ro.status = 'Online' THEN ro.id END) as online_routers,
    COUNT(DISTINCT tp.id) as total_plans,
    COUNT(DISTINCT v.id) as total_vouchers,
    COUNT(DISTINCT CASE WHEN v.status = 'Unused' THEN v.id END) as unused_vouchers,
    COALESCE(SUM(pt.amount), 0) as total_revenue,
    COALESCE(SUM(pt.commission_amount), 0) as total_commission
FROM resellers r
LEFT JOIN reseller_tiers rt ON r.tier_id = rt.id
LEFT JOIN users u ON r.id = u.reseller_id
LEFT JOIN routers ro ON r.id = ro.reseller_id
LEFT JOIN time_plans tp ON r.id = tp.reseller_id
LEFT JOIN vouchers v ON r.id = v.reseller_id
LEFT JOIN payment_transactions pt ON r.id = pt.reseller_id AND pt.status = 'Completed'
WHERE r.status = 'Active'
GROUP BY r.id, r.company_name, r.credit_balance, r.commission_rate, rt.name;

-- Financial summary view
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    DATE_TRUNC('month', pt.created_at) as month,
    pt.reseller_id,
    r.company_name,
    COUNT(*) as transaction_count,
    SUM(pt.amount) as total_revenue,
    SUM(pt.commission_amount) as total_commission,
    COUNT(DISTINCT pt.user_id) as unique_customers
FROM payment_transactions pt
JOIN resellers r ON pt.reseller_id = r.id
WHERE pt.status = 'Completed'
GROUP BY DATE_TRUNC('month', pt.created_at), pt.reseller_id, r.company_name
ORDER BY month DESC, total_revenue DESC;

-- Router performance summary
CREATE OR REPLACE VIEW router_performance_summary AS
SELECT 
    r.id,
    r.name,
    r.ip_address,
    r.location,
    r.status,
    r.connected_users,
    r.uptime_percentage,
    r.data_transferred_gb,
    rs.company_name as reseller_company,
    COUNT(us.id) as total_sessions,
    COALESCE(AVG(rpl.cpu_usage), 0) as avg_cpu_usage,
    COALESCE(AVG(rpl.memory_usage), 0) as avg_memory_usage
FROM routers r
LEFT JOIN resellers rs ON r.reseller_id = rs.id
LEFT JOIN user_sessions us ON r.id = us.router_id
LEFT JOIN router_performance_logs rpl ON r.id = rpl.router_id 
    AND rpl.recorded_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY r.id, r.name, r.ip_address, r.location, r.status, r.connected_users, 
         r.uptime_percentage, r.data_transferred_gb, rs.company_name;

-- Create stored procedures for common operations

-- Function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(
    p_reseller_id INTEGER,
    p_amount INTEGER
) RETURNS INTEGER AS $$
DECLARE
    commission_rate DECIMAL(5,2);
    commission_amount INTEGER;
BEGIN
    SELECT r.commission_rate INTO commission_rate
    FROM resellers r
    WHERE r.id = p_reseller_id;
    
    commission_amount := ROUND(p_amount * commission_rate / 100);
    
    RETURN commission_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to update reseller credit
CREATE OR REPLACE FUNCTION update_reseller_credit(
    p_reseller_id INTEGER,
    p_amount INTEGER,
    p_transaction_type VARCHAR(50),
    p_reference VARCHAR(255) DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT credit_balance INTO current_balance
    FROM resellers
    WHERE id = p_reseller_id;
    
    -- Calculate new balance
    IF p_transaction_type = 'credit' THEN
        new_balance := current_balance + p_amount;
    ELSIF p_transaction_type = 'debit' THEN
        IF current_balance >= p_amount THEN
            new_balance := current_balance - p_amount;
        ELSE
            RAISE EXCEPTION 'Insufficient credit balance';
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid transaction type';
    END IF;
    
    -- Update reseller balance
    UPDATE resellers 
    SET credit_balance = new_balance,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_reseller_id;
    
    -- Log transaction
    INSERT INTO reseller_credit_transactions (
        reseller_id, transaction_type, amount, 
        balance_before, balance_after, reference, description
    ) VALUES (
        p_reseller_id, p_transaction_type, p_amount,
        current_balance, new_balance, p_reference, p_description
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to generate voucher codes
CREATE OR REPLACE FUNCTION generate_voucher_codes(
    p_prefix VARCHAR(10),
    p_quantity INTEGER
) RETURNS TEXT[] AS $$
DECLARE
    codes TEXT[];
    i INTEGER;
    new_code TEXT;
BEGIN
    codes := ARRAY[]::TEXT[];
    
    FOR i IN 1..p_quantity LOOP
        new_code := p_prefix || LPAD(i::TEXT, 6, '0');
        codes := array_append(codes, new_code);
    END LOOP;
    
    RETURN codes;
END;
$$ LANGUAGE plpgsql;

-- Refresh materialized views (if any were created)
-- REFRESH MATERIALIZED VIEW reseller_analytics;

COMMIT;
