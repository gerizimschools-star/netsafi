-- Extended PHP Radius Database Schema
-- Router Integration, Resellers, Time-based Plans, and Enhanced Features

-- Routers table - Mikrotik and other router configurations
CREATE TABLE routers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ip_address INET NOT NULL UNIQUE,
    router_type VARCHAR(50) DEFAULT 'mikrotik', -- mikrotik, cisco, etc.
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL, -- encrypted
    api_port INTEGER DEFAULT 8728,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Maintenance')),
    location VARCHAR(100),
    model VARCHAR(100),
    firmware_version VARCHAR(50),
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time-based plans table - Enhanced plans with duration and speed
CREATE TABLE time_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_hours INTEGER NOT NULL, -- Duration in hours
    price INTEGER NOT NULL, -- Price in KES
    speed_download INTEGER NOT NULL, -- Download speed in Mbps
    speed_upload INTEGER NOT NULL, -- Upload speed in Mbps
    data_limit_gb INTEGER, -- Data limit in GB (NULL for unlimited)
    validity_days INTEGER DEFAULT 1, -- How many days the plan is valid
    is_active BOOLEAN DEFAULT true,
    category VARCHAR(50) DEFAULT 'hourly', -- hourly, daily, weekly, monthly
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resellers table - Reseller management
CREATE TABLE resellers (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location VARCHAR(100),
    commission_percentage DECIMAL(5,2) DEFAULT 10.00,
    credit_balance INTEGER DEFAULT 0, -- Credit balance in KES
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Inactive')),
    permissions TEXT[], -- Array of permissions
    parent_reseller_id INTEGER REFERENCES resellers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table - Track active internet sessions
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES time_plans(id),
    router_id INTEGER REFERENCES routers(id),
    session_id VARCHAR(255) UNIQUE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER DEFAULT 0,
    data_used_mb INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Terminated')),
    ip_address INET,
    mac_address VARCHAR(17),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table - System notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment gateways table - Configure payment methods
CREATE TABLE payment_gateways (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- mpesa, airtel, paypal, stripe, etc.
    is_active BOOLEAN DEFAULT true,
    configuration JSONB, -- Store gateway-specific config
    test_mode BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vouchers table - Prepaid vouchers
CREATE TABLE vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    plan_id INTEGER REFERENCES time_plans(id),
    reseller_id INTEGER REFERENCES resellers(id),
    amount INTEGER NOT NULL, -- Amount in KES
    status VARCHAR(20) DEFAULT 'Unused' CHECK (status IN ('Unused', 'Used', 'Expired')),
    used_by_user_id INTEGER REFERENCES users(id),
    used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User portal customization table
CREATE TABLE portal_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50) DEFAULT 'text',
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table - All financial transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    reseller_id INTEGER REFERENCES resellers(id),
    transaction_type VARCHAR(50) NOT NULL, -- payment, refund, commission, etc.
    amount INTEGER NOT NULL, -- Amount in KES
    currency VARCHAR(10) DEFAULT 'KES',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_routers_ip ON routers(ip_address);
CREATE INDEX idx_routers_status ON routers(status);
CREATE INDEX idx_time_plans_category ON time_plans(category);
CREATE INDEX idx_time_plans_active ON time_plans(is_active);
CREATE INDEX idx_resellers_username ON resellers(username);
CREATE INDEX idx_resellers_status ON resellers(status);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_status ON user_sessions(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_status ON vouchers(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Create triggers for updated_at columns
CREATE TRIGGER update_routers_updated_at BEFORE UPDATE ON routers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_plans_updated_at BEFORE UPDATE ON time_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resellers_updated_at BEFORE UPDATE ON resellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_gateways_updated_at BEFORE UPDATE ON payment_gateways FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portal_settings_updated_at BEFORE UPDATE ON portal_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample time-based plans
INSERT INTO time_plans (name, description, duration_hours, price, speed_download, speed_upload, category) VALUES
('1 Hour Basic', '1 hour internet at 5 Mbps', 1, 10, 5, 2, 'hourly'),
('2 Hour Standard', '2 hours internet at 10 Mbps', 2, 18, 10, 5, 'hourly'),
('4 Hour Premium', '4 hours internet at 20 Mbps', 4, 35, 20, 10, 'hourly'),
('Daily Basic', '24 hours internet at 5 Mbps', 24, 50, 5, 2, 'daily'),
('Daily Standard', '24 hours internet at 10 Mbps', 24, 80, 10, 5, 'daily'),
('Daily Premium', '24 hours internet at 20 Mbps', 24, 120, 20, 10, 'daily'),
('Weekly Basic', '168 hours (1 week) at 5 Mbps', 168, 300, 5, 2, 'weekly'),
('Weekly Standard', '168 hours (1 week) at 10 Mbps', 168, 500, 10, 5, 'weekly'),
('Monthly Basic', '720 hours (30 days) at 5 Mbps', 720, 800, 5, 2, 'monthly'),
('Monthly Premium', '720 hours (30 days) at 20 Mbps', 720, 2500, 20, 10, 'monthly');

-- Insert sample routers
INSERT INTO routers (name, ip_address, username, password, location, model) VALUES
('Nairobi Central Router', '192.168.1.1', 'admin', '$2b$10$encrypted_password_hash', 'Nairobi Central', 'RB4011iGS+'),
('Mombasa Branch Router', '192.168.2.1', 'admin', '$2b$10$encrypted_password_hash', 'Mombasa', 'RB4011iGS+'),
('Kisumu Office Router', '192.168.3.1', 'admin', '$2b$10$encrypted_password_hash', 'Kisumu', 'RB3011UiAS-RM'),
('Nakuru Hub Router', '192.168.4.1', 'admin', '$2b$10$encrypted_password_hash', 'Nakuru', 'RB3011UiAS-RM'),
('Eldoret Station Router', '192.168.5.1', 'admin', '$2b$10$encrypted_password_hash', 'Eldoret', 'RB2011UiAS-2HnD-IN');

-- Insert sample resellers
INSERT INTO resellers (username, password_hash, company_name, contact_person, email, phone, location, commission_percentage, credit_balance, permissions) VALUES
('reseller_nairobi', '$2b$10$encrypted_password_hash', 'Nairobi Tech Solutions', 'James Kimani', 'james@naitech.com', '+254701234567', 'Nairobi', 15.00, 50000, ARRAY['users', 'invoices', 'vouchers']),
('reseller_mombasa', '$2b$10$encrypted_password_hash', 'Coast Internet Services', 'Fatma Said', 'fatma@coastnet.com', '+254702345678', 'Mombasa', 12.00, 30000, ARRAY['users', 'vouchers']),
('reseller_kisumu', '$2b$10$encrypted_password_hash', 'Lake Connect Ltd', 'Peter Odhiambo', 'peter@lakeconnect.com', '+254703456789', 'Kisumu', 10.00, 25000, ARRAY['users', 'invoices']);

-- System configuration table for payment settings and other configurations
CREATE TABLE system_configurations (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_type VARCHAR(50) DEFAULT 'text',
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample payment gateways
INSERT INTO payment_gateways (name, type, is_active, configuration, test_mode) VALUES
('M-Pesa Daraja', 'mpesa', true, '{"consumer_key": "", "consumer_secret": "", "business_short_code": "174379", "passkey": "", "endpoint": "https://sandbox.safaricom.co.ke"}', true),
('Airtel Money', 'airtelMoney', true, '{"client_id": "", "client_secret": "", "merchant_id": "", "endpoint": "https://openapi.airtel.africa"}', true),
('T-Kash', 'tkash', false, '{"api_key": "", "merchant_code": "", "endpoint": "https://api.tkash.co.ke"}', true),
('PayPal', 'paypal', false, '{"client_id": "", "client_secret": "", "mode": "sandbox"}', true);

-- Insert payment and system configurations
INSERT INTO system_configurations (config_key, config_value, config_type, category, description) VALUES
('mpesa_enabled', 'true', 'boolean', 'payment', 'Enable M-Pesa payments'),
('mpesa_business_short_code', '174379', 'text', 'payment', 'M-Pesa business short code'),
('mpesa_consumer_key', '', 'text', 'payment', 'M-Pesa consumer key'),
('mpesa_consumer_secret', '', 'text', 'payment', 'M-Pesa consumer secret'),
('mpesa_passkey', '', 'text', 'payment', 'M-Pesa passkey'),
('airtel_money_enabled', 'true', 'boolean', 'payment', 'Enable Airtel Money payments'),
('airtel_money_client_id', '', 'text', 'payment', 'Airtel Money client ID'),
('airtel_money_client_secret', '', 'text', 'payment', 'Airtel Money client secret'),
('airtel_money_merchant_id', '', 'text', 'payment', 'Airtel Money merchant ID'),
('bank_paybill_enabled', 'false', 'boolean', 'payment', 'Enable bank paybill payments'),
('equity_paybill_number', '247247', 'text', 'payment', 'Equity Bank paybill number'),
('equity_account_number', '', 'text', 'payment', 'Equity Bank account number'),
('kcb_paybill_number', '522522', 'text', 'payment', 'KCB Bank paybill number'),
('kcb_account_number', '', 'text', 'payment', 'KCB Bank account number'),
('sms_provider', 'africastalking', 'text', 'communication', 'SMS service provider'),
('sms_api_key', '', 'text', 'communication', 'SMS API key'),
('sms_username', '', 'text', 'communication', 'SMS API username'),
('sms_sender_id', 'NetSafi', 'text', 'communication', 'SMS sender ID'),
('email_provider', 'smtp', 'text', 'communication', 'Email service provider'),
('email_host', 'smtp.gmail.com', 'text', 'communication', 'SMTP host'),
('email_port', '587', 'text', 'communication', 'SMTP port'),
('email_username', '', 'text', 'communication', 'Email username'),
('email_password', '', 'text', 'communication', 'Email password'),
('email_from_address', 'noreply@netsafi.com', 'text', 'communication', 'From email address');

-- Insert portal customization settings
INSERT INTO portal_settings (setting_key, setting_value, setting_type, category, description) VALUES
('portal_title', 'PHP Radius Internet Portal', 'text', 'branding', 'Portal title displayed to users'),
('portal_logo_url', '/images/logo.png', 'text', 'branding', 'URL to portal logo'),
('portal_theme_color', '#3B82F6', 'color', 'appearance', 'Primary theme color'),
('portal_background_image', '/images/background.jpg', 'text', 'appearance', 'Background image URL'),
('welcome_message', 'Welcome to our high-speed internet service!', 'text', 'content', 'Welcome message for users'),
('terms_of_service', 'By using our service you agree to our terms...', 'textarea', 'legal', 'Terms of service text'),
('contact_phone', '+254700000000', 'text', 'contact', 'Support phone number'),
('contact_email', 'support@phpradius.com', 'email', 'contact', 'Support email address'),
('session_timeout_minutes', '5', 'number', 'technical', 'Session timeout in minutes'),
('auto_logout_enabled', 'true', 'boolean', 'technical', 'Enable automatic logout');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, action_url) VALUES
(1, 'New Router Added', 'Nairobi Central Router has been successfully configured', 'success', '/dashboard?tab=network'),
(1, 'Low Credit Alert', 'Reseller "Nairobi Tech Solutions" has low credit balance', 'warning', '/dashboard?tab=resellers'),
(1, 'Payment Received', 'M-Pesa payment of KES 2,500 received from John Mwangi', 'success', '/dashboard?tab=invoices'),
(1, 'System Maintenance', 'Scheduled maintenance for Kisumu router at 2:00 AM', 'info', '/dashboard?tab=network');

-- Insert sample vouchers
INSERT INTO vouchers (code, plan_id, reseller_id, amount, expires_at) VALUES
('VOUCHER001', 1, 1, 10, CURRENT_TIMESTAMP + INTERVAL '30 days'),
('VOUCHER002', 2, 1, 18, CURRENT_TIMESTAMP + INTERVAL '30 days'),
('VOUCHER003', 4, 2, 50, CURRENT_TIMESTAMP + INTERVAL '30 days'),
('VOUCHER004', 5, 2, 80, CURRENT_TIMESTAMP + INTERVAL '30 days'),
('VOUCHER005', 6, 3, 120, CURRENT_TIMESTAMP + INTERVAL '30 days');

-- Insert sample transactions
INSERT INTO transactions (user_id, transaction_type, amount, payment_method, payment_reference, status, description) VALUES
(1, 'payment', 2500, 'M-Pesa', 'MPesa-Ref-001', 'Completed', 'Payment for Premium Monthly Plan'),
(2, 'payment', 1500, 'Airtel Money', 'Airtel-Ref-002', 'Completed', 'Payment for Standard Monthly Plan'),
(3, 'payment', 800, 'M-Pesa', 'MPesa-Ref-003', 'Failed', 'Payment for Basic Monthly Plan'),
(4, 'payment', 50, 'Voucher', 'VOUCHER003', 'Completed', 'Voucher redemption for Daily Basic Plan');
