-- NetSafi ISP Billing System - SQLite Development Schema
-- Simplified schema for development environment

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'admin',
    status TEXT NOT NULL DEFAULT 'active',
    last_login DATETIME,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    two_factor_backup_codes TEXT,
    two_factor_setup_at DATETIME,
    two_factor_mandatory BOOLEAN DEFAULT TRUE,
    profile_picture TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    preferences TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Resellers table
CREATE TABLE IF NOT EXISTS resellers (
    id TEXT PRIMARY KEY,
    business_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'bronze',
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    credit_balance DECIMAL(10,2) DEFAULT 0.00,
    credit_limit DECIMAL(10,2) DEFAULT 1000.00,
    status TEXT NOT NULL DEFAULT 'pending',
    verification_status TEXT DEFAULT 'unverified',
    api_key TEXT UNIQUE,
    api_secret TEXT,
    business_registration TEXT,
    tax_id TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state_region TEXT,
    postal_code TEXT,
    country TEXT NOT NULL,
    website TEXT,
    bank_name TEXT,
    bank_account TEXT,
    bank_routing TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    total_customers INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Internet Plans table
CREATE TABLE IF NOT EXISTS internet_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'residential',
    speed_download INTEGER NOT NULL,
    speed_upload INTEGER NOT NULL,
    data_limit INTEGER,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    validity_days INTEGER NOT NULL DEFAULT 30,
    simultaneous_connections INTEGER DEFAULT 1,
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    priority_order INTEGER DEFAULT 0,
    fair_usage_policy TEXT,
    terms_conditions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Routers table
CREATE TABLE IF NOT EXISTS routers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    brand TEXT NOT NULL,
    ip_address TEXT UNIQUE NOT NULL,
    mac_address TEXT UNIQUE,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'offline',
    assigned_reseller_id TEXT,
    max_capacity INTEGER NOT NULL DEFAULT 100,
    current_users INTEGER DEFAULT 0,
    firmware_version TEXT,
    last_seen DATETIME,
    last_sync DATETIME,
    uptime INTEGER DEFAULT 0,
    cpu_usage DECIMAL(5,2) DEFAULT 0.00,
    memory_usage DECIMAL(5,2) DEFAULT 0.00,
    disk_usage DECIMAL(5,2) DEFAULT 0.00,
    bandwidth_in INTEGER DEFAULT 0,
    bandwidth_out INTEGER DEFAULT 0,
    total_data_transferred INTEGER DEFAULT 0,
    configuration TEXT,
    credentials TEXT,
    notes TEXT,
    maintenance_schedule TEXT,
    warranty_expiry DATE,
    purchase_date DATE,
    purchase_cost DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer Users table
CREATE TABLE IF NOT EXISTS customer_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT,
    id_number TEXT UNIQUE,
    id_type TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state_region TEXT,
    postal_code TEXT,
    country TEXT NOT NULL,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    registration_type TEXT NOT NULL DEFAULT 'self',
    registered_by TEXT,
    reseller_id TEXT,
    current_plan_id TEXT,
    plan_start_date DATETIME,
    plan_expiry_date DATETIME,
    status TEXT NOT NULL DEFAULT 'active',
    credit_balance DECIMAL(10,2) DEFAULT 0.00,
    total_data_used INTEGER DEFAULT 0,
    kyc_status TEXT DEFAULT 'pending',
    kyc_documents TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    last_login DATETIME,
    last_ip_address TEXT,
    session_count INTEGER DEFAULT 0,
    total_sessions_time INTEGER DEFAULT 0,
    preferences TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    pin TEXT,
    plan_id TEXT NOT NULL,
    generated_by TEXT NOT NULL,
    reseller_id TEXT,
    batch_id TEXT NOT NULL,
    face_value DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'unused',
    used_by TEXT,
    used_at DATETIME,
    expires_at DATETIME NOT NULL,
    qr_code_data TEXT,
    print_count INTEGER DEFAULT 0,
    last_printed_at DATETIME,
    transfer_history TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    router_id TEXT NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    duration INTEGER DEFAULT 0,
    data_uploaded INTEGER DEFAULT 0,
    data_downloaded INTEGER DEFAULT 0,
    ip_address TEXT,
    mac_address TEXT,
    device_info TEXT,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    termination_reason TEXT,
    quality_score DECIMAL(3,1) DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    reseller_id TEXT,
    plan_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_date DATETIME,
    payment_method TEXT,
    payment_reference TEXT,
    description TEXT,
    line_items TEXT,
    billing_address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payment Transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id TEXT PRIMARY KEY,
    transaction_id TEXT UNIQUE NOT NULL,
    invoice_id TEXT,
    customer_id TEXT NOT NULL,
    reseller_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT NOT NULL,
    gateway TEXT,
    gateway_transaction_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    gateway_response TEXT,
    reference_number TEXT,
    description TEXT,
    metadata TEXT,
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category TEXT DEFAULT 'general',
    data_type TEXT DEFAULT 'string',
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT OR IGNORE INTO admin_users (
    id, username, email, password_hash, first_name, last_name, role, status, email_verified
) VALUES (
    'admin-default-001', 'admin', 'admin@netsafi.com', 
    '$2b$10$8K1p/a9NTzKp1z1z8K1p/aOZoHdkzpzOzOzOzOzOzOzOzOzOzOzO',
    'System', 'Administrator', 'super_admin', 'active', 1
);

-- Insert sample internet plans
INSERT OR IGNORE INTO internet_plans (
    id, name, description, category, speed_download, speed_upload, 
    data_limit, price, billing_cycle, validity_days
) VALUES
('plan-basic-001', 'Basic Plan', 'Perfect for light browsing and email', 'residential', 5, 1, 10240, 10.00, 'monthly', 30),
('plan-standard-001', 'Standard Plan', 'Great for streaming and social media', 'residential', 10, 2, 25600, 20.00, 'monthly', 30),
('plan-premium-001', 'Premium Plan', 'High-speed for gaming and HD streaming', 'residential', 25, 5, 51200, 35.00, 'monthly', 30),
('plan-unlimited-001', 'Unlimited Plan', 'Unlimited data for heavy users', 'residential', 50, 10, NULL, 50.00, 'monthly', 30),
('plan-business-001', 'Business Starter', 'Reliable connectivity for small business', 'business', 20, 5, 102400, 75.00, 'monthly', 30);

-- Insert default system settings
INSERT OR IGNORE INTO system_settings (key, value, description, category) VALUES
('company_name', 'NetSafi ISP', 'Company name displayed in the system', 'general'),
('company_logo', '', 'Company logo URL', 'general'),
('default_currency', 'USD', 'Default currency for transactions', 'billing'),
('tax_rate', '0.16', 'Default tax rate (16%)', 'billing'),
('session_timeout', '3600', 'Session timeout in seconds', 'security'),
('max_login_attempts', '5', 'Maximum login attempts before lockout', 'security');
