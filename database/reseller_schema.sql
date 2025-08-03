-- Enhanced Reseller Management Schema
-- Complete reseller system with advanced features

-- Reseller tiers table - Different reseller levels
CREATE TABLE reseller_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    min_commission DECIMAL(5,2) DEFAULT 5.00,
    max_commission DECIMAL(5,2) DEFAULT 20.00,
    credit_limit INTEGER DEFAULT 100000, -- Maximum credit in KES
    monthly_target INTEGER DEFAULT 50000, -- Monthly sales target in KES
    benefits TEXT[], -- Array of benefits
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced resellers table with additional fields
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS tier_id INTEGER REFERENCES reseller_tiers(id);
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS monthly_sales INTEGER DEFAULT 0;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS api_key VARCHAR(255) UNIQUE;
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS webhook_url VARCHAR(255);
ALTER TABLE resellers ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "sms": false}';

-- Reseller credit transactions table
CREATE TABLE reseller_credit_transactions (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- credit, debit, commission, penalty
    amount INTEGER NOT NULL, -- Amount in KES
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference VARCHAR(255),
    description TEXT,
    status VARCHAR(20) DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed', 'Failed', 'Reversed')),
    created_by INTEGER REFERENCES admin_users(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reseller voucher batches table
CREATE TABLE reseller_voucher_batches (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE CASCADE,
    batch_name VARCHAR(255),
    plan_id INTEGER REFERENCES time_plans(id),
    quantity INTEGER NOT NULL,
    generated_count INTEGER DEFAULT 0,
    unit_price INTEGER NOT NULL, -- Price per voucher in KES
    total_cost INTEGER NOT NULL,
    expires_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Generated', 'Distributed', 'Expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced vouchers table with reseller batch reference
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS batch_id INTEGER REFERENCES reseller_voucher_batches(id);
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS reseller_commission INTEGER DEFAULT 0;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS qr_code_url VARCHAR(255);

-- Reseller customers table - Track customers per reseller
CREATE TABLE reseller_customers (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    customer_type VARCHAR(50) DEFAULT 'individual', -- individual, business
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_spent INTEGER DEFAULT 0,
    last_purchase TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    notes TEXT,
    UNIQUE(reseller_id, user_id)
);

-- Reseller sales tracking
CREATE TABLE reseller_sales (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES reseller_customers(id),
    voucher_id INTEGER REFERENCES vouchers(id),
    sale_amount INTEGER NOT NULL,
    commission_amount INTEGER NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    payment_method VARCHAR(50),
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed', 'Refunded'))
);

-- Reseller performance metrics table
CREATE TABLE reseller_performance (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_sales INTEGER DEFAULT 0,
    total_commission INTEGER DEFAULT 0,
    vouchers_sold INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    active_customers INTEGER DEFAULT 0,
    target_achievement DECIMAL(5,2) DEFAULT 0.00, -- Percentage of target achieved
    ranking INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reseller_id, period_start, period_end)
);

-- Reseller notifications table
CREATE TABLE reseller_notifications (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'promotion')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    action_url VARCHAR(255),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reseller API access logs
CREATE TABLE reseller_api_logs (
    id SERIAL PRIMARY KEY,
    reseller_id INTEGER REFERENCES resellers(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_data JSONB,
    response_status INTEGER,
    response_data JSONB,
    ip_address INET,
    user_agent TEXT,
    processing_time INTEGER, -- milliseconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_reseller_credit_transactions_reseller_id ON reseller_credit_transactions(reseller_id);
CREATE INDEX idx_reseller_credit_transactions_type ON reseller_credit_transactions(transaction_type);
CREATE INDEX idx_reseller_voucher_batches_reseller_id ON reseller_voucher_batches(reseller_id);
CREATE INDEX idx_reseller_voucher_batches_status ON reseller_voucher_batches(status);
CREATE INDEX idx_reseller_customers_reseller_id ON reseller_customers(reseller_id);
CREATE INDEX idx_reseller_customers_user_id ON reseller_customers(user_id);
CREATE INDEX idx_reseller_sales_reseller_id ON reseller_sales(reseller_id);
CREATE INDEX idx_reseller_sales_date ON reseller_sales(sale_date);
CREATE INDEX idx_reseller_performance_reseller_id ON reseller_performance(reseller_id);
CREATE INDEX idx_reseller_performance_period ON reseller_performance(period_start, period_end);
CREATE INDEX idx_reseller_notifications_reseller_id ON reseller_notifications(reseller_id);
CREATE INDEX idx_reseller_notifications_read ON reseller_notifications(is_read);
CREATE INDEX idx_reseller_api_logs_reseller_id ON reseller_api_logs(reseller_id);
CREATE INDEX idx_reseller_api_logs_created_at ON reseller_api_logs(created_at);

-- Insert sample reseller tiers
INSERT INTO reseller_tiers (name, min_commission, max_commission, credit_limit, monthly_target, benefits) VALUES
('Bronze', 5.00, 10.00, 50000, 25000, ARRAY['Basic Support', 'Monthly Reports']),
('Silver', 10.00, 15.00, 100000, 50000, ARRAY['Priority Support', 'Weekly Reports', 'Marketing Materials']),
('Gold', 15.00, 20.00, 200000, 100000, ARRAY['Dedicated Support', 'Daily Reports', 'Marketing Materials', 'Custom Vouchers']),
('Platinum', 20.00, 25.00, 500000, 250000, ARRAY['24/7 Support', 'Real-time Reports', 'White Label Portal', 'API Access']);

-- Update existing resellers with tier assignments
UPDATE resellers SET tier_id = 2 WHERE id = 1; -- Nairobi Tech Solutions -> Silver
UPDATE resellers SET tier_id = 1 WHERE id = 2; -- Coast Internet -> Bronze  
UPDATE resellers SET tier_id = 1 WHERE id = 3; -- Lake Connect -> Bronze

-- Generate API keys for existing resellers
UPDATE resellers SET api_key = 'nts_' || substr(md5(random()::text), 1, 24) WHERE username = 'reseller_nairobi';
UPDATE resellers SET api_key = 'cis_' || substr(md5(random()::text), 1, 24) WHERE username = 'reseller_mombasa';
UPDATE resellers SET api_key = 'lcl_' || substr(md5(random()::text), 1, 24) WHERE username = 'reseller_kisumu';

-- Insert sample reseller customers
INSERT INTO reseller_customers (reseller_id, user_id, customer_type, total_spent) VALUES
(1, 1, 'individual', 7500), -- John Mwangi -> Nairobi Tech
(1, 4, 'individual', 2500), -- Mary Wanjiku -> Nairobi Tech
(2, 2, 'business', 4500),   -- Grace Njeri -> Coast Internet
(3, 3, 'individual', 800);  -- Peter Ochieng -> Lake Connect

-- Insert sample voucher batches
INSERT INTO reseller_voucher_batches (reseller_id, batch_name, plan_id, quantity, generated_count, unit_price, total_cost, status) VALUES
(1, 'January 2024 - Basic Plans', 1, 100, 50, 10, 1000, 'Generated'),
(1, 'Premium Package Q1', 6, 25, 25, 120, 3000, 'Generated'),
(2, 'Coast Special - Daily Plans', 4, 50, 30, 50, 2500, 'Generated'),
(3, 'New Year Promotion', 2, 75, 20, 18, 1350, 'Pending');

-- Insert sample credit transactions
INSERT INTO reseller_credit_transactions (reseller_id, transaction_type, amount, balance_before, balance_after, description) VALUES
(1, 'credit', 25000, 25000, 50000, 'Initial credit top-up'),
(1, 'debit', 3000, 50000, 47000, 'Voucher batch purchase - Premium Package Q1'),
(1, 'commission', 1875, 47000, 48875, 'Commission for December sales'),
(2, 'credit', 15000, 15000, 30000, 'Monthly credit allocation'),
(2, 'debit', 2500, 30000, 27500, 'Voucher batch purchase - Coast Special'),
(3, 'credit', 10000, 15000, 25000, 'Credit top-up via M-Pesa');

-- Insert sample sales records
INSERT INTO reseller_sales (reseller_id, customer_id, sale_amount, commission_amount, commission_rate, payment_method) VALUES
(1, 1, 2500, 375, 15.00, 'M-Pesa'),
(1, 2, 2500, 375, 15.00, 'Airtel Money'),
(2, 3, 1500, 180, 12.00, 'M-Pesa'),
(3, 4, 800, 80, 10.00, 'Voucher');

-- Insert sample performance data
INSERT INTO reseller_performance (reseller_id, period_start, period_end, total_sales, total_commission, vouchers_sold, new_customers, active_customers, target_achievement) VALUES
(1, '2024-01-01', '2024-01-31', 75000, 11250, 45, 8, 25, 150.00),
(2, '2024-01-01', '2024-01-31', 45000, 5400, 28, 5, 18, 90.00),
(3, '2024-01-01', '2024-01-31', 18000, 1800, 15, 2, 8, 72.00);

-- Insert sample notifications for resellers
INSERT INTO reseller_notifications (reseller_id, title, message, type, priority) VALUES
(1, 'Target Achieved!', 'Congratulations! You have exceeded your monthly target by 50%', 'success', 'high'),
(1, 'Low Credit Alert', 'Your credit balance is below KES 10,000. Please top up to continue operations.', 'warning', 'normal'),
(2, 'New Plan Available', 'Weekly Standard plan is now available for voucher generation at competitive rates.', 'info', 'normal'),
(3, 'Commission Payment', 'Your January commission of KES 1,800 has been processed and added to your account.', 'success', 'normal');

-- Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_reseller_monthly_sales()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Completed' THEN
        UPDATE resellers 
        SET monthly_sales = monthly_sales + NEW.sale_amount
        WHERE id = NEW.reseller_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reseller_sales 
    AFTER INSERT OR UPDATE ON reseller_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_reseller_monthly_sales();

-- Create function to calculate commission
CREATE OR REPLACE FUNCTION calculate_reseller_commission(
    p_reseller_id INTEGER,
    p_sale_amount INTEGER
) RETURNS INTEGER AS $$
DECLARE
    commission_rate DECIMAL(5,2);
    commission_amount INTEGER;
BEGIN
    SELECT r.commission_percentage INTO commission_rate
    FROM resellers r
    WHERE r.id = p_reseller_id;
    
    commission_amount := ROUND(p_sale_amount * commission_rate / 100);
    
    RETURN commission_amount;
END;
$$ LANGUAGE plpgsql;

-- Create function to update credit balance
CREATE OR REPLACE FUNCTION update_reseller_credit(
    p_reseller_id INTEGER,
    p_amount INTEGER,
    p_transaction_type VARCHAR(50),
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
    SET credit_balance = new_balance
    WHERE id = p_reseller_id;
    
    -- Log transaction
    INSERT INTO reseller_credit_transactions (
        reseller_id, transaction_type, amount, 
        balance_before, balance_after, description
    ) VALUES (
        p_reseller_id, p_transaction_type, p_amount,
        current_balance, new_balance, p_description
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create view for reseller dashboard summary
CREATE OR REPLACE VIEW reseller_dashboard_summary AS
SELECT 
    r.id,
    r.company_name,
    r.username,
    r.credit_balance,
    r.commission_percentage,
    rt.name as tier_name,
    COALESCE(perf.total_sales, 0) as monthly_sales,
    COALESCE(perf.total_commission, 0) as monthly_commission,
    COALESCE(perf.vouchers_sold, 0) as vouchers_sold,
    COALESCE(perf.active_customers, 0) as active_customers,
    COALESCE(perf.target_achievement, 0) as target_achievement,
    (SELECT COUNT(*) FROM reseller_notifications rn WHERE rn.reseller_id = r.id AND rn.is_read = false) as unread_notifications
FROM resellers r
LEFT JOIN reseller_tiers rt ON r.tier_id = rt.id
LEFT JOIN reseller_performance perf ON r.id = perf.reseller_id 
    AND perf.period_start = DATE_TRUNC('month', CURRENT_DATE)
    AND perf.period_end = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'
WHERE r.status = 'Active';

-- Create materialized view for reseller analytics
CREATE MATERIALIZED VIEW reseller_analytics AS
SELECT 
    r.id as reseller_id,
    r.company_name,
    rt.name as tier,
    COUNT(DISTINCT rc.user_id) as total_customers,
    COUNT(DISTINCT v.id) as total_vouchers_generated,
    COUNT(DISTINCT CASE WHEN v.status = 'Used' THEN v.id END) as vouchers_used,
    COALESCE(SUM(rs.sale_amount), 0) as lifetime_sales,
    COALESCE(SUM(rs.commission_amount), 0) as lifetime_commission,
    COALESCE(AVG(rs.sale_amount), 0) as avg_sale_amount,
    r.created_at as join_date,
    r.last_login
FROM resellers r
LEFT JOIN reseller_tiers rt ON r.tier_id = rt.id
LEFT JOIN reseller_customers rc ON r.id = rc.reseller_id
LEFT JOIN vouchers v ON r.id = v.reseller_id
LEFT JOIN reseller_sales rs ON r.id = rs.reseller_id
WHERE r.status = 'Active'
GROUP BY r.id, r.company_name, rt.name, r.created_at, r.last_login;

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW reseller_analytics;

-- Create automatic refresh for analytics (run daily)
-- This would typically be set up as a cron job or scheduled task
