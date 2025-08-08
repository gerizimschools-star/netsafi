-- NetSafi ISP Billing - Complete Functional Database Schema
-- This schema includes all tables and relationships for a fully functional ISP management system

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS voucher_usage_logs CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS user_session_logs CASCADE;
DROP TABLE IF EXISTS router_performance_logs CASCADE;
DROP TABLE IF EXISTS reseller_commissions CASCADE;
DROP TABLE IF EXISTS plan_usage_statistics CASCADE;
DROP TABLE IF EXISTS system_audit_logs CASCADE;
DROP TABLE IF EXISTS notification_logs CASCADE;
DROP TABLE IF EXISTS api_access_logs CASCADE;
DROP TABLE IF EXISTS financial_reports CASCADE;
DROP TABLE IF EXISTS license_renewals CASCADE;
DROP TABLE IF EXISTS vouchers CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS customer_users CASCADE;
DROP TABLE IF EXISTS internet_plans CASCADE;
DROP TABLE IF EXISTS reseller_routers CASCADE;
DROP TABLE IF EXISTS routers CASCADE;
DROP TABLE IF EXISTS resellers CASCADE;
DROP TABLE IF EXISTS reseller_tiers CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS payment_gateways CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admin Users Table
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'operator')),
    permissions TEXT[], -- Array of permissions
    profile_picture TEXT,
    department VARCHAR(100),
    job_title VARCHAR(100),
    employee_id VARCHAR(50) UNIQUE,
    date_joined DATE DEFAULT CURRENT_DATE,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(32),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Reseller Tiers Table
CREATE TABLE reseller_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    max_credit_limit INTEGER DEFAULT 100000,
    max_users INTEGER DEFAULT 500,
    max_routers INTEGER DEFAULT 10,
    min_monthly_sales INTEGER DEFAULT 0,
    benefits TEXT[],
    color_code VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Resellers Table
CREATE TABLE resellers (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Kenya',
    tier_id INTEGER REFERENCES reseller_tiers(id) DEFAULT 1,
    commission_rate DECIMAL(5,2) DEFAULT 15.00,
    credit_balance INTEGER DEFAULT 0,
    credit_limit INTEGER DEFAULT 50000,
    tax_id VARCHAR(50),
    business_license VARCHAR(100),
    bank_account_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    bank_branch VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": true}',
    api_key VARCHAR(64) UNIQUE,
    api_secret VARCHAR(128),
    api_rate_limit INTEGER DEFAULT 1000,
    last_api_call TIMESTAMP,
    total_sales INTEGER DEFAULT 0,
    total_commission INTEGER DEFAULT 0,
    joined_date DATE DEFAULT CURRENT_DATE,
    contract_start_date DATE,
    contract_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Routers Table
CREATE TABLE routers (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(100) NOT NULL,
    ip_address INET NOT NULL,
    port INTEGER DEFAULT 8728,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    model VARCHAR(100),
    firmware_version VARCHAR(50),
    location VARCHAR(255),
    description TEXT,
    max_users INTEGER DEFAULT 100,
    current_users INTEGER DEFAULT 0,
    bandwidth_limit_down INTEGER, -- Mbps
    bandwidth_limit_up INTEGER, -- Mbps
    total_data_transferred BIGINT DEFAULT 0, -- bytes
    uptime_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_seen TIMESTAMP,
    last_sync TIMESTAMP,
    sync_interval INTEGER DEFAULT 300, -- seconds
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'error')),
    is_online BOOLEAN DEFAULT false,
    cpu_usage DECIMAL(5,2) DEFAULT 0.00,
    memory_usage DECIMAL(5,2) DEFAULT 0.00,
    disk_usage DECIMAL(5,2) DEFAULT 0.00,
    temperature DECIMAL(5,2),
    voltage DECIMAL(5,2),
    connection_type VARCHAR(20) DEFAULT 'api' CHECK (connection_type IN ('api', 'ssh', 'telnet')),
    ssl_enabled BOOLEAN DEFAULT true,
    auto_sync BOOLEAN DEFAULT true,
    backup_enabled BOOLEAN DEFAULT true,
    backup_frequency VARCHAR(20) DEFAULT 'daily',
    last_backup TIMESTAMP,
    monitoring_enabled BOOLEAN DEFAULT true,
    alert_threshold_cpu INTEGER DEFAULT 80,
    alert_threshold_memory INTEGER DEFAULT 80,
    alert_threshold_disk INTEGER DEFAULT 90,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reseller-Router Mapping Table
CREATE TABLE reseller_routers (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE CASCADE,
    router_id INTEGER REFERENCES routers(id) ON DELETE CASCADE,
    access_level VARCHAR(20) DEFAULT 'full' CHECK (access_level IN ('full', 'readonly', 'limited')),
    assigned_date DATE DEFAULT CURRENT_DATE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reseller_id, router_id)
);

-- 6. Internet Plans Table
CREATE TABLE internet_plans (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_hours INTEGER NOT NULL,
    price INTEGER NOT NULL, -- in cents/minor currency units
    currency VARCHAR(3) DEFAULT 'KES',
    speed_down INTEGER NOT NULL, -- Mbps
    speed_up INTEGER NOT NULL, -- Mbps
    data_limit BIGINT, -- bytes (NULL for unlimited)
    category VARCHAR(20) DEFAULT 'general' CHECK (category IN ('hourly', 'daily', 'weekly', 'monthly', 'data', 'unlimited')),
    priority INTEGER DEFAULT 5, -- 1-10, higher is better priority
    burst_speed_down INTEGER, -- Mbps for burst
    burst_speed_up INTEGER, -- Mbps for burst
    burst_threshold INTEGER, -- MB after which burst stops
    fair_usage_policy BOOLEAN DEFAULT false,
    fup_limit BIGINT, -- bytes for FUP
    fup_speed_down INTEGER, -- Mbps after FUP
    fup_speed_up INTEGER, -- Mbps after FUP
    concurrent_sessions INTEGER DEFAULT 1,
    validity_days INTEGER DEFAULT 1,
    auto_renew BOOLEAN DEFAULT false,
    grace_period_hours INTEGER DEFAULT 0,
    overage_rate INTEGER, -- price per MB in cents
    tax_rate DECIMAL(5,2) DEFAULT 16.00, -- percentage
    commission_rate DECIMAL(5,2) DEFAULT 15.00, -- percentage
    min_commission INTEGER DEFAULT 0, -- minimum commission in cents
    max_commission INTEGER, -- maximum commission in cents
    popularity_score INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    target_audience TEXT[],
    features TEXT[],
    restrictions TEXT[],
    router_profile VARCHAR(100), -- Mikrotik profile name
    queue_type VARCHAR(50) DEFAULT 'default',
    parent_queue VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_promotional BOOLEAN DEFAULT false,
    promotion_start_date DATE,
    promotion_end_date DATE,
    promotion_discount DECIMAL(5,2) DEFAULT 0.00,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Customer Users Table
CREATE TABLE customer_users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    id_number VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Kenya',
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    current_plan_id INTEGER REFERENCES internet_plans(id),
    reseller_id INTEGER REFERENCES resellers(id),
    router_id INTEGER REFERENCES routers(id),
    mac_address VARCHAR(17), -- MAC address for device binding
    ip_address INET, -- Assigned IP address
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'blocked')),
    account_balance INTEGER DEFAULT 0, -- in cents
    credit_limit INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    total_data_used BIGINT DEFAULT 0, -- bytes
    session_count INTEGER DEFAULT 0,
    last_login TIMESTAMP,
    last_logout TIMESTAMP,
    registration_date DATE DEFAULT CURRENT_DATE,
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    grace_period_end TIMESTAMP,
    auto_renew BOOLEAN DEFAULT false,
    payment_method VARCHAR(50),
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    notification_preferences JSONB DEFAULT '{"email": false, "sms": true}',
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected')),
    kyc_documents JSONB,
    risk_score INTEGER DEFAULT 0,
    notes TEXT,
    tags TEXT[],
    referral_code VARCHAR(20) UNIQUE,
    referred_by INTEGER REFERENCES customer_users(id),
    created_by INTEGER REFERENCES resellers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Vouchers Table
CREATE TABLE vouchers (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    batch_id VARCHAR(50),
    plan_id INTEGER REFERENCES internet_plans(id) NOT NULL,
    reseller_id INTEGER REFERENCES resellers(id) NOT NULL,
    router_id INTEGER REFERENCES routers(id),
    amount INTEGER NOT NULL, -- in cents
    commission_amount INTEGER DEFAULT 0,
    serial_number VARCHAR(100),
    qr_code TEXT, -- Base64 encoded QR code
    pin_code VARCHAR(10),
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
    used_by INTEGER REFERENCES customer_users(id),
    used_at TIMESTAMP,
    used_from_ip INET,
    used_from_mac VARCHAR(17),
    activation_limit INTEGER DEFAULT 1,
    activation_count INTEGER DEFAULT 0,
    transfer_count INTEGER DEFAULT 0,
    max_transfers INTEGER DEFAULT 0,
    is_transferable BOOLEAN DEFAULT false,
    is_refundable BOOLEAN DEFAULT true,
    refund_policy TEXT,
    notes TEXT,
    metadata JSONB,
    print_count INTEGER DEFAULT 0,
    last_printed TIMESTAMP,
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. User Sessions Table
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    user_id INTEGER REFERENCES customer_users(id) NOT NULL,
    voucher_id INTEGER REFERENCES vouchers(id),
    plan_id INTEGER REFERENCES internet_plans(id) NOT NULL,
    router_id INTEGER REFERENCES routers(id) NOT NULL,
    session_id VARCHAR(100) UNIQUE, -- Mikrotik session ID
    username VARCHAR(50) NOT NULL,
    ip_address INET,
    mac_address VARCHAR(17),
    nas_ip_address INET,
    nas_port VARCHAR(50),
    framed_protocol VARCHAR(20),
    service_type VARCHAR(50),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    bytes_in BIGINT DEFAULT 0,
    bytes_out BIGINT DEFAULT 0,
    packets_in BIGINT DEFAULT 0,
    packets_out BIGINT DEFAULT 0,
    terminate_cause VARCHAR(100),
    session_status VARCHAR(20) DEFAULT 'active' CHECK (session_status IN ('active', 'terminated', 'expired')),
    max_duration_seconds INTEGER,
    max_bytes BIGINT,
    speed_limit_down INTEGER, -- Mbps
    speed_limit_up INTEGER, -- Mbps
    burst_limit_down INTEGER,
    burst_limit_up INTEGER,
    priority INTEGER DEFAULT 5,
    queue_name VARCHAR(100),
    realm VARCHAR(100),
    client_info JSONB,
    location_info JSONB,
    billing_start_time TIMESTAMP,
    billing_end_time TIMESTAMP,
    is_free_session BOOLEAN DEFAULT false,
    grace_period BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Invoices Table
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INTEGER REFERENCES customer_users(id),
    reseller_id INTEGER REFERENCES resellers(id),
    invoice_type VARCHAR(20) DEFAULT 'service' CHECK (invoice_type IN ('service', 'product', 'subscription', 'credit')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded')),
    currency VARCHAR(3) DEFAULT 'KES',
    subtotal INTEGER NOT NULL, -- in cents
    tax_rate DECIMAL(5,2) DEFAULT 16.00,
    tax_amount INTEGER DEFAULT 0,
    discount_rate DECIMAL(5,2) DEFAULT 0.00,
    discount_amount INTEGER DEFAULT 0,
    total_amount INTEGER NOT NULL,
    amount_paid INTEGER DEFAULT 0,
    amount_due INTEGER NOT NULL,
    due_date DATE NOT NULL,
    payment_terms VARCHAR(50) DEFAULT 'immediate',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    payment_date TIMESTAMP,
    description TEXT,
    notes TEXT,
    line_items JSONB, -- Array of invoice line items
    billing_address JSONB,
    shipping_address JSONB,
    metadata JSONB,
    sent_at TIMESTAMP,
    viewed_at TIMESTAMP,
    reminder_count INTEGER DEFAULT 0,
    last_reminder_sent TIMESTAMP,
    is_recurring BOOLEAN DEFAULT false,
    recurring_interval VARCHAR(20), -- monthly, yearly, etc.
    recurring_end_date DATE,
    parent_invoice_id INTEGER REFERENCES invoices(id),
    created_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Payment Transactions Table
CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    invoice_id INTEGER REFERENCES invoices(id),
    customer_id INTEGER REFERENCES customer_users(id),
    reseller_id INTEGER REFERENCES resellers(id),
    payment_method VARCHAR(50) NOT NULL,
    gateway VARCHAR(50) NOT NULL,
    gateway_transaction_id VARCHAR(100),
    gateway_reference VARCHAR(100),
    amount INTEGER NOT NULL, -- in cents
    currency VARCHAR(3) DEFAULT 'KES',
    fee_amount INTEGER DEFAULT 0,
    net_amount INTEGER NOT NULL,
    exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    failure_reason TEXT,
    gateway_response JSONB,
    customer_info JSONB,
    billing_info JSONB,
    metadata JSONB,
    processed_at TIMESTAMP,
    settled_at TIMESTAMP,
    refunded_at TIMESTAMP,
    refund_amount INTEGER DEFAULT 0,
    refund_reason TEXT,
    is_test BOOLEAN DEFAULT false,
    ip_address INET,
    user_agent TEXT,
    webhook_delivered BOOLEAN DEFAULT false,
    webhook_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. System Settings Table
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    value_type VARCHAR(20) DEFAULT 'string' CHECK (value_type IN ('string', 'integer', 'boolean', 'json', 'text')),
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false,
    is_readonly BOOLEAN DEFAULT false,
    validation_rule TEXT,
    default_value TEXT,
    updated_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Audit Logs Table
CREATE TABLE system_audit_logs (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    user_id INTEGER,
    user_type VARCHAR(20) DEFAULT 'admin' CHECK (user_type IN ('admin', 'reseller', 'customer')),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'error')),
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Notification Logs Table
CREATE TABLE notification_logs (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    recipient_id INTEGER,
    recipient_type VARCHAR(20) CHECK (recipient_type IN ('admin', 'reseller', 'customer')),
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'webhook')),
    template_name VARCHAR(100),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    failure_reason TEXT,
    gateway_reference VARCHAR(100),
    gateway_response JSONB,
    metadata JSONB,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_resellers_username ON resellers(username);
CREATE INDEX idx_resellers_email ON resellers(email);
CREATE INDEX idx_resellers_status ON resellers(status);
CREATE INDEX idx_routers_ip ON routers(ip_address);
CREATE INDEX idx_routers_status ON routers(status);
CREATE INDEX idx_plans_category ON internet_plans(category);
CREATE INDEX idx_plans_active ON internet_plans(is_active);
CREATE INDEX idx_users_phone ON customer_users(phone);
CREATE INDEX idx_users_reseller ON customer_users(reseller_id);
CREATE INDEX idx_users_status ON customer_users(status);
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_status ON vouchers(status);
CREATE INDEX idx_vouchers_reseller ON vouchers(reseller_id);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_status ON user_sessions(session_status);
CREATE INDEX idx_sessions_start_time ON user_sessions(start_time);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_transactions_status ON payment_transactions(status);
CREATE INDEX idx_transactions_gateway ON payment_transactions(gateway);
CREATE INDEX idx_audit_logs_user ON system_audit_logs(user_id, user_type);
CREATE INDEX idx_audit_logs_resource ON system_audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON system_audit_logs(created_at);

-- Insert default data
INSERT INTO reseller_tiers (name, commission_rate, max_credit_limit, max_users, max_routers, benefits) VALUES
('Bronze', 10.00, 50000, 100, 3, ARRAY['Basic Support', 'Monthly Reports']),
('Silver', 12.50, 100000, 250, 5, ARRAY['Priority Support', 'Weekly Reports', 'Custom Branding']),
('Gold', 15.00, 200000, 500, 10, ARRAY['Premium Support', 'Daily Reports', 'Custom Branding', 'API Access']),
('Platinum', 20.00, 500000, 1000, 25, ARRAY['Dedicated Support', 'Real-time Reports', 'Full Customization', 'Advanced API', 'Revenue Sharing']);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password_hash, email, first_name, last_name, role, permissions) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMye.fUk8Q.j4Zl.E/cPUvWZLIdjklQnzuy', 'admin@netsafi.com', 'System', 'Administrator', 'super_admin', 
 ARRAY['user_management', 'reseller_management', 'router_management', 'plan_management', 'financial_management', 'system_settings', 'audit_logs']);

-- Insert default system settings
INSERT INTO system_settings (key, value, value_type, category, description) VALUES
('company_name', 'NetSafi ISP', 'string', 'company', 'Company name'),
('company_email', 'info@netsafi.com', 'string', 'company', 'Company contact email'),
('company_phone', '+254700000000', 'string', 'company', 'Company contact phone'),
('default_currency', 'KES', 'string', 'billing', 'Default currency for billing'),
('tax_rate', '16.00', 'string', 'billing', 'Default tax rate percentage'),
('session_timeout', '30', 'integer', 'security', 'Session timeout in minutes'),
('max_login_attempts', '5', 'integer', 'security', 'Maximum failed login attempts'),
('backup_retention_days', '30', 'integer', 'system', 'Backup retention period in days'),
('enable_2fa', 'false', 'boolean', 'security', 'Enable two-factor authentication'),
('maintenance_mode', 'false', 'boolean', 'system', 'System maintenance mode');

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resellers_updated_at BEFORE UPDATE ON resellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routers_updated_at BEFORE UPDATE ON routers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_internet_plans_updated_at BEFORE UPDATE ON internet_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_users_updated_at BEFORE UPDATE ON customer_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON vouchers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_logs_updated_at BEFORE UPDATE ON notification_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW active_resellers AS
SELECT 
    r.*,
    rt.name as tier_name,
    rt.commission_rate as tier_commission_rate,
    COUNT(DISTINCT rr.router_id) as router_count,
    COUNT(DISTINCT cu.id) as customer_count,
    COALESCE(SUM(cu.total_spent), 0) as total_revenue
FROM resellers r
LEFT JOIN reseller_tiers rt ON r.tier_id = rt.id
LEFT JOIN reseller_routers rr ON r.id = rr.reseller_id
LEFT JOIN customer_users cu ON r.id = cu.reseller_id
WHERE r.status = 'active'
GROUP BY r.id, rt.name, rt.commission_rate;

CREATE OR REPLACE VIEW router_statistics AS
SELECT 
    r.*,
    COUNT(DISTINCT us.id) as active_sessions,
    COUNT(DISTINCT cu.id) as total_customers,
    COALESCE(SUM(us.bytes_in + us.bytes_out), 0) as total_data_transferred
FROM routers r
LEFT JOIN user_sessions us ON r.id = us.router_id AND us.session_status = 'active'
LEFT JOIN customer_users cu ON r.id = cu.router_id
GROUP BY r.id;

CREATE OR REPLACE VIEW plan_performance AS
SELECT 
    ip.*,
    COUNT(DISTINCT v.id) as voucher_count,
    COUNT(DISTINCT us.id) as session_count,
    COALESCE(SUM(v.amount), 0) as total_revenue,
    COALESCE(AVG(us.duration_seconds), 0) as avg_session_duration
FROM internet_plans ip
LEFT JOIN vouchers v ON ip.id = v.plan_id
LEFT JOIN user_sessions us ON ip.id = us.plan_id
WHERE ip.is_active = true
GROUP BY ip.id;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO netsafi_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO netsafi_user;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO netsafi_user;

COMMIT;
