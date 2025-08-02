-- PHP Radius ISP Management Database Schema
-- PostgreSQL Database for Internet Service Provider Management

-- Users table - Customer information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    location VARCHAR(100) NOT NULL,
    plan VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Expired')),
    usage_gb DECIMAL(10,2) DEFAULT 0.00,
    monthly_amount INTEGER NOT NULL, -- Amount in KES
    join_date DATE DEFAULT CURRENT_DATE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plans table - Internet service plans
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price INTEGER NOT NULL, -- Price in KES
    data_limit_gb INTEGER, -- NULL for unlimited
    speed_mbps INTEGER NOT NULL,
    features TEXT[], -- Array of features
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table - Billing information
CREATE TABLE invoices (
    id VARCHAR(20) PRIMARY KEY, -- e.g., 'INV-001'
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    amount INTEGER NOT NULL, -- Amount in KES
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Overdue')),
    payment_method VARCHAR(50) DEFAULT 'Pending',
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    paid_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Network locations table - Network infrastructure
CREATE TABLE network_locations (
    id SERIAL PRIMARY KEY,
    location_name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'Online' CHECK (status IN ('Online', 'Offline', 'Maintenance')),
    active_users INTEGER DEFAULT 0,
    bandwidth_usage INTEGER DEFAULT 0, -- Percentage
    latency_ms INTEGER,
    uptime_percentage DECIMAL(5,2) DEFAULT 99.0,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods table - Available payment options
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon_emoji VARCHAR(10),
    is_available BOOLEAN DEFAULT true,
    transaction_fee_percentage DECIMAL(4,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage logs table - Track user data usage
CREATE TABLE usage_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    usage_gb DECIMAL(10,2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings table - Configuration
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table - Dashboard users
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    isp_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'operator', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_date ON usage_logs(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_network_locations_updated_at BEFORE UPDATE ON network_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO plans (name, price, data_limit_gb, speed_mbps, features) VALUES
('Basic', 800, 5, 10, ARRAY['5 GB Data', 'Basic Support', 'Standard Speed']),
('Standard', 1500, 15, 25, ARRAY['15 GB Data', 'Priority Support', 'High Speed', 'Free Router']),
('Premium', 2500, NULL, 50, ARRAY['Unlimited Data', '24/7 Support', 'Maximum Speed', 'Free Router', 'Static IP']);

INSERT INTO payment_methods (name, icon_emoji, is_available, transaction_fee_percentage) VALUES
('M-Pesa', '📱', true, 1.0),
('Airtel Money', '📲', true, 1.5),
('T-Kash', '💳', true, 2.0),
('Bank Transfer', '🏦', true, 0.0);

INSERT INTO network_locations (location_name, status, active_users, bandwidth_usage, latency_ms, uptime_percentage) VALUES
('Nairobi Central', 'Online', 324, 85, 12, 99.9),
('Mombasa', 'Online', 198, 72, 18, 98.5),
('Kisumu', 'Maintenance', 156, 0, NULL, 0.0),
('Nakuru', 'Online', 234, 68, 15, 99.2),
('Eldoret', 'Online', 178, 91, 10, 99.7);

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('default_currency', 'KES', 'Default currency for billing'),
('timezone', 'EAT', 'System timezone'),
('auto_refresh_interval', '30', 'Dashboard auto-refresh interval in seconds'),
('sms_notifications', 'true', 'Enable SMS notifications'),
('email_reports', 'false', 'Enable daily email reports');

-- Insert sample admin user (password: admin123 - should be hashed in real implementation)
INSERT INTO admin_users (username, password_hash, isp_id, full_name, email, role) VALUES
('admin', '$2b$10$rGNS8Y7.W8bQjZKJ2k8jOeX9mU5V4W7X2k1R2k8jOeX9mU5V4W7X2k', 'demo-isp-001', 'Administrator', 'admin@phpradius.com', 'admin');

-- Insert sample users
INSERT INTO users (name, email, phone, location, plan, status, usage_gb, monthly_amount) VALUES
('John Mwangi', 'john.mwangi@email.com', '+254712345678', 'Nairobi', 'Premium', 'Active', 12.5, 2500),
('Grace Njeri', 'grace.njeri@email.com', '+254723456789', 'Mombasa', 'Standard', 'Active', 8.2, 1500),
('Peter Ochieng', 'peter.ochieng@email.com', '+254734567890', 'Kisumu', 'Basic', 'Expired', 3.1, 800),
('Mary Wanjiku', 'mary.wanjiku@email.com', '+254745678901', 'Nakuru', 'Premium', 'Active', 15.8, 2500),
('David Kamau', 'david.kamau@email.com', '+254756789012', 'Eldoret', 'Standard', 'Suspended', 0.0, 1500),
('Susan Achieng', 'susan.achieng@email.com', '+254767890123', 'Nairobi', 'Premium', 'Active', 18.2, 2500),
('Samuel Kiprop', 'samuel.kiprop@email.com', '+254778901234', 'Eldoret', 'Basic', 'Active', 4.5, 800);

-- Insert sample invoices
INSERT INTO invoices (id, user_id, customer_name, customer_phone, amount, status, payment_method, due_date) VALUES
('INV-001', 1, 'John Mwangi', '+254712345678', 2500, 'Paid', 'M-Pesa', '2024-01-31'),
('INV-002', 2, 'Grace Njeri', '+254723456789', 1500, 'Pending', 'Pending', '2024-01-28'),
('INV-003', 3, 'Peter Ochieng', '+254734567890', 800, 'Overdue', 'Failed', '2024-01-24'),
('INV-004', 4, 'Mary Wanjiku', '+254745678901', 2500, 'Paid', 'Airtel Money', '2024-01-26'),
('INV-005', 5, 'David Kamau', '+254756789012', 1500, 'Pending', 'Pending', '2024-01-30'),
('INV-006', 6, 'Susan Achieng', '+254767890123', 2500, 'Paid', 'M-Pesa', '2024-02-01');
