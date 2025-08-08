-- NetSafi ISP Billing System - SQLite Schema for cPanel Hosting
-- This schema is optimized for shared hosting environments with SQLite support

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Admin Users table
CREATE TABLE admin_users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'operator')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login DATETIME,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    profile_picture TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    preferences TEXT, -- JSON string for preferences
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Resellers table
CREATE TABLE resellers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    business_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    credit_balance DECIMAL(10,2) DEFAULT 0.00,
    credit_limit DECIMAL(10,2) DEFAULT 1000.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referred_by) REFERENCES resellers(id)
);

-- Internet Plans table
CREATE TABLE internet_plans (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'residential' CHECK (category IN ('residential', 'business', 'enterprise', 'student', 'unlimited')),
    speed_download INTEGER NOT NULL, -- in Mbps
    speed_upload INTEGER NOT NULL, -- in Mbps
    data_limit INTEGER, -- in GB, NULL for unlimited
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
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
CREATE TABLE routers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    model TEXT NOT NULL,
    brand TEXT NOT NULL,
    ip_address TEXT UNIQUE NOT NULL,
    mac_address TEXT UNIQUE,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance', 'error')),
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
    configuration TEXT, -- JSON string for router config
    credentials TEXT, -- Encrypted JSON for router access credentials
    notes TEXT,
    maintenance_schedule TEXT,
    warranty_expiry DATE,
    purchase_date DATE,
    purchase_cost DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_reseller_id) REFERENCES resellers(id)
);

-- Customer Users table
CREATE TABLE customer_users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    id_number TEXT UNIQUE,
    id_type TEXT CHECK (id_type IN ('national_id', 'passport', 'drivers_license', 'student_id')),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state_region TEXT,
    postal_code TEXT,
    country TEXT NOT NULL,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    registration_type TEXT NOT NULL DEFAULT 'self' CHECK (registration_type IN ('self', 'reseller', 'admin')),
    registered_by TEXT,
    reseller_id TEXT,
    current_plan_id TEXT,
    plan_start_date DATETIME,
    plan_expiry_date DATETIME,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'inactive', 'blocked')),
    credit_balance DECIMAL(10,2) DEFAULT 0.00,
    total_data_used INTEGER DEFAULT 0,
    kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected', 'expired')),
    kyc_documents TEXT, -- JSON string for document references
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    last_login DATETIME,
    last_ip_address TEXT,
    session_count INTEGER DEFAULT 0,
    total_sessions_time INTEGER DEFAULT 0,
    preferences TEXT, -- JSON string for user preferences
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reseller_id) REFERENCES resellers(id),
    FOREIGN KEY (current_plan_id) REFERENCES internet_plans(id),
    FOREIGN KEY (referred_by) REFERENCES customer_users(id)
);

-- Vouchers table
CREATE TABLE vouchers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    code TEXT UNIQUE NOT NULL,
    pin TEXT,
    plan_id TEXT NOT NULL,
    generated_by TEXT NOT NULL,
    reseller_id TEXT,
    batch_id TEXT NOT NULL,
    face_value DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'used', 'expired', 'cancelled', 'transferred')),
    used_by TEXT,
    used_at DATETIME,
    expires_at DATETIME NOT NULL,
    qr_code_data TEXT,
    print_count INTEGER DEFAULT 0,
    last_printed_at DATETIME,
    transfer_history TEXT, -- JSON string for transfer records
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES internet_plans(id),
    FOREIGN KEY (generated_by) REFERENCES admin_users(id),
    FOREIGN KEY (reseller_id) REFERENCES resellers(id),
    FOREIGN KEY (used_by) REFERENCES customer_users(id)
);

-- User Sessions table
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    router_id TEXT NOT NULL,
    session_id TEXT UNIQUE NOT NULL,
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    duration INTEGER DEFAULT 0, -- in seconds
    data_uploaded INTEGER DEFAULT 0, -- in bytes
    data_downloaded INTEGER DEFAULT 0, -- in bytes
    ip_address TEXT,
    mac_address TEXT,
    device_info TEXT,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'terminated', 'expired', 'disconnected')),
    termination_reason TEXT,
    quality_score DECIMAL(3,1) DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES customer_users(id),
    FOREIGN KEY (router_id) REFERENCES routers(id)
);

-- Invoices table
CREATE TABLE invoices (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    invoice_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    reseller_id TEXT,
    plan_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
    due_date DATE NOT NULL,
    paid_date DATETIME,
    payment_method TEXT,
    payment_reference TEXT,
    description TEXT,
    line_items TEXT, -- JSON string for invoice line items
    billing_address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_users(id),
    FOREIGN KEY (reseller_id) REFERENCES resellers(id),
    FOREIGN KEY (plan_id) REFERENCES internet_plans(id)
);

-- Payment Transactions table
CREATE TABLE payment_transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    transaction_id TEXT UNIQUE NOT NULL,
    invoice_id TEXT,
    customer_id TEXT NOT NULL,
    reseller_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'airtel_money', 'credit_card', 'bank_transfer', 'cash', 'voucher', 'credit')),
    gateway TEXT,
    gateway_transaction_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    gateway_response TEXT, -- JSON string for gateway response
    reference_number TEXT,
    description TEXT,
    metadata TEXT, -- JSON string for additional data
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (customer_id) REFERENCES customer_users(id),
    FOREIGN KEY (reseller_id) REFERENCES resellers(id)
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'reseller', 'customer')),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    old_values TEXT, -- JSON string
    new_values TEXT, -- JSON string
    ip_address TEXT,
    user_agent TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System Settings table
CREATE TABLE system_settings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category TEXT DEFAULT 'general',
    data_type TEXT DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    recipient_id TEXT NOT NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('admin', 'reseller', 'customer')),
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT, -- JSON string for additional data
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- File Uploads table
CREATE TABLE file_uploads (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    uploaded_by_type TEXT NOT NULL CHECK (uploaded_by_type IN ('admin', 'reseller', 'customer')),
    purpose TEXT NOT NULL CHECK (purpose IN ('avatar', 'document', 'logo', 'attachment')),
    related_id TEXT,
    related_type TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_status ON admin_users(status);

CREATE INDEX idx_resellers_email ON resellers(email);
CREATE INDEX idx_resellers_status ON resellers(status);
CREATE INDEX idx_resellers_tier ON resellers(tier);
CREATE INDEX idx_resellers_api_key ON resellers(api_key);

CREATE INDEX idx_customer_users_username ON customer_users(username);
CREATE INDEX idx_customer_users_email ON customer_users(email);
CREATE INDEX idx_customer_users_phone ON customer_users(phone);
CREATE INDEX idx_customer_users_status ON customer_users(status);
CREATE INDEX idx_customer_users_reseller_id ON customer_users(reseller_id);

CREATE INDEX idx_routers_ip_address ON routers(ip_address);
CREATE INDEX idx_routers_status ON routers(status);
CREATE INDEX idx_routers_assigned_reseller_id ON routers(assigned_reseller_id);

CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_status ON vouchers(status);
CREATE INDEX idx_vouchers_plan_id ON vouchers(plan_id);
CREATE INDEX idx_vouchers_reseller_id ON vouchers(reseller_id);
CREATE INDEX idx_vouchers_batch_id ON vouchers(batch_id);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_router_id ON user_sessions(router_id);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);
CREATE INDEX idx_user_sessions_start_time ON user_sessions(start_time);

CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_reseller_id ON invoices(reseller_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

CREATE INDEX idx_payment_transactions_customer_id ON payment_transactions(customer_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_payment_method ON payment_transactions(payment_method);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_recipient_type ON notifications(recipient_type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Insert default admin user
INSERT INTO admin_users (
    id, username, email, password_hash, first_name, last_name, role, status, email_verified
) VALUES (
    'admin-default-001', 'admin', 'admin@netsafi.com', 
    '$2b$10$8K1p/a9NTzKp1z1z8K1p/aOZoHdkzpzOzOzOzOzOzOzOzOzOzOzO', -- Default: admin123
    'System', 'Administrator', 'super_admin', 'active', TRUE
);

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category) VALUES
('company_name', 'NetSafi ISP', 'Company name displayed in the system', 'general'),
('company_logo', '', 'Company logo URL', 'general'),
('default_currency', 'USD', 'Default currency for transactions', 'billing'),
('tax_rate', '0.16', 'Default tax rate (16%)', 'billing'),
('session_timeout', '3600', 'Session timeout in seconds', 'security'),
('max_login_attempts', '5', 'Maximum login attempts before lockout', 'security'),
('backup_retention_days', '30', 'Number of days to retain backups', 'system'),
('notification_retention_days', '90', 'Number of days to retain notifications', 'system');

-- Insert sample internet plans
INSERT INTO internet_plans (
    id, name, description, category, speed_download, speed_upload, 
    data_limit, price, billing_cycle, validity_days
) VALUES
('plan-basic-001', 'Basic Plan', 'Perfect for light browsing and email', 'residential', 5, 1, 10240, 10.00, 'monthly', 30),
('plan-standard-001', 'Standard Plan', 'Great for streaming and social media', 'residential', 10, 2, 25600, 20.00, 'monthly', 30),
('plan-premium-001', 'Premium Plan', 'High-speed for gaming and HD streaming', 'residential', 25, 5, 51200, 35.00, 'monthly', 30),
('plan-unlimited-001', 'Unlimited Plan', 'Unlimited data for heavy users', 'residential', 50, 10, NULL, 50.00, 'monthly', 30),
('plan-business-001', 'Business Starter', 'Reliable connectivity for small business', 'business', 20, 5, 102400, 75.00, 'monthly', 30);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_admin_users_timestamp 
    AFTER UPDATE ON admin_users
    BEGIN
        UPDATE admin_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_resellers_timestamp 
    AFTER UPDATE ON resellers
    BEGIN
        UPDATE resellers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_internet_plans_timestamp 
    AFTER UPDATE ON internet_plans
    BEGIN
        UPDATE internet_plans SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_routers_timestamp 
    AFTER UPDATE ON routers
    BEGIN
        UPDATE routers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_customer_users_timestamp 
    AFTER UPDATE ON customer_users
    BEGIN
        UPDATE customer_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_vouchers_timestamp 
    AFTER UPDATE ON vouchers
    BEGIN
        UPDATE vouchers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_invoices_timestamp 
    AFTER UPDATE ON invoices
    BEGIN
        UPDATE invoices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_system_settings_timestamp 
    AFTER UPDATE ON system_settings
    BEGIN
        UPDATE system_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
