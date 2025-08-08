import { Request, Response } from 'express';
import { query } from '../database';
import crypto from 'crypto';

// Generate username
const generateUsername = (name: string, phone: string): string => {
  const cleanName = name.toLowerCase().replace(/[^a-z]/g, '');
  const phoneDigits = phone.slice(-4);
  return `${cleanName.slice(0, 6)}${phoneDigits}`;
};

// Generate referral code
const generateReferralCode = (): string => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Get all customers
export const getAllCustomers = async (req: Request, res: Response) => {
  try {
    const { status, reseller_id, router_id, plan_id } = req.query;
    
    let whereConditions = [];
    let values = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`cu.status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (reseller_id) {
      whereConditions.push(`cu.reseller_id = $${paramCount}`);
      values.push(reseller_id);
      paramCount++;
    }

    if (router_id) {
      whereConditions.push(`cu.router_id = $${paramCount}`);
      values.push(router_id);
      paramCount++;
    }

    if (plan_id) {
      whereConditions.push(`cu.current_plan_id = $${paramCount}`);
      values.push(plan_id);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await query(`
      SELECT 
        cu.*,
        ip.name as current_plan_name,
        ip.price as current_plan_price,
        ip.duration_hours as current_plan_duration,
        r.company_name as reseller_company,
        r.contact_person as reseller_contact,
        rt.name as router_name,
        rt.ip_address as router_ip,
        ref.full_name as referred_by_name,
        (SELECT COUNT(*) FROM user_sessions us WHERE us.user_id = cu.id) as total_sessions,
        (SELECT COUNT(*) FROM user_sessions us WHERE us.user_id = cu.id AND us.session_status = 'active') as active_sessions,
        (SELECT COUNT(*) FROM vouchers v WHERE v.used_by = cu.id) as vouchers_used,
        (SELECT COUNT(*) FROM customer_users ref_cu WHERE ref_cu.referred_by = cu.id) as referrals_count
      FROM customer_users cu
      LEFT JOIN internet_plans ip ON cu.current_plan_id = ip.id
      LEFT JOIN resellers r ON cu.reseller_id = r.id
      LEFT JOIN routers rt ON cu.router_id = rt.id
      LEFT JOIN customer_users ref ON cu.referred_by = ref.id
      ${whereClause}
      ORDER BY cu.created_at DESC
    `, values);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
};

// Get single customer
export const getCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        cu.*,
        ip.name as current_plan_name,
        ip.description as current_plan_description,
        ip.price as current_plan_price,
        ip.duration_hours as current_plan_duration,
        ip.speed_down as current_plan_speed_down,
        ip.speed_up as current_plan_speed_up,
        r.company_name as reseller_company,
        r.contact_person as reseller_contact,
        r.phone as reseller_phone,
        rt.name as router_name,
        rt.ip_address as router_ip,
        ref.full_name as referred_by_name,
        ref.phone as referred_by_phone,
        (SELECT COUNT(*) FROM user_sessions us WHERE us.user_id = cu.id) as total_sessions,
        (SELECT COUNT(*) FROM user_sessions us WHERE us.user_id = cu.id AND us.session_status = 'active') as active_sessions,
        (SELECT COUNT(*) FROM vouchers v WHERE v.used_by = cu.id) as vouchers_used,
        (SELECT COUNT(*) FROM customer_users ref_cu WHERE ref_cu.referred_by = cu.id) as referrals_count,
        (SELECT COALESCE(SUM(us.bytes_in + us.bytes_out), 0) FROM user_sessions us WHERE us.user_id = cu.id) as total_data_used_bytes,
        (SELECT COALESCE(AVG(us.duration_seconds), 0) FROM user_sessions us WHERE us.user_id = cu.id) as avg_session_duration
      FROM customer_users cu
      LEFT JOIN internet_plans ip ON cu.current_plan_id = ip.id
      LEFT JOIN resellers r ON cu.reseller_id = r.id
      LEFT JOIN routers rt ON cu.router_id = rt.id
      LEFT JOIN customer_users ref ON cu.referred_by = ref.id
      WHERE cu.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get recent sessions
    const sessions = await query(`
      SELECT 
        us.*,
        ip.name as plan_name,
        rt.name as router_name
      FROM user_sessions us
      LEFT JOIN internet_plans ip ON us.plan_id = ip.id
      LEFT JOIN routers rt ON us.router_id = rt.id
      WHERE us.user_id = $1
      ORDER BY us.start_time DESC
      LIMIT 10
    `, [id]);

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        recent_sessions: sessions.rows
      }
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message
    });
  }
};

// Create new customer
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const {
      phone,
      full_name,
      email,
      date_of_birth,
      gender,
      id_number,
      address,
      city,
      state,
      postal_code,
      country = 'Kenya',
      emergency_contact_name,
      emergency_contact_phone,
      current_plan_id,
      reseller_id,
      router_id,
      mac_address,
      ip_address,
      payment_method,
      preferred_language = 'en',
      timezone = 'Africa/Nairobi',
      notification_preferences = { email: false, sms: true },
      notes,
      tags = [],
      referred_by_code
    } = req.body;

    // Validate required fields
    if (!phone || !full_name || !reseller_id) {
      return res.status(400).json({
        success: false,
        message: 'Phone, full name, and reseller ID are required'
      });
    }

    // Generate username and referral code
    const username = generateUsername(full_name, phone);
    const referral_code = generateReferralCode();

    // Handle referral
    let referred_by = null;
    if (referred_by_code) {
      const referralResult = await query(`
        SELECT id FROM customer_users WHERE referral_code = $1
      `, [referred_by_code]);
      
      if (referralResult.rows.length > 0) {
        referred_by = referralResult.rows[0].id;
      }
    }

    const result = await query(`
      INSERT INTO customer_users (
        username, email, phone, full_name, date_of_birth, gender, id_number,
        address, city, state, postal_code, country, emergency_contact_name,
        emergency_contact_phone, current_plan_id, reseller_id, router_id,
        mac_address, ip_address, payment_method, preferred_language, timezone,
        notification_preferences, notes, tags, referral_code, referred_by, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
      ) RETURNING *
    `, [
      username, email, phone, full_name, date_of_birth, gender, id_number,
      address, city, state, postal_code, country, emergency_contact_name,
      emergency_contact_phone, current_plan_id, reseller_id, router_id,
      mac_address, ip_address, payment_method, preferred_language, timezone,
      JSON.stringify(notification_preferences), notes, tags, referral_code, referred_by, reseller_id
    ]);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    if (error.code === '23505') {
      if (error.constraint.includes('phone')) {
        return res.status(409).json({
          success: false,
          message: 'Phone number already exists'
        });
      }
      if (error.constraint.includes('email')) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
      if (error.constraint.includes('username')) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
};

// Update customer
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Build dynamic update query
    let updateFields = [];
    let values = [];
    let paramCount = 1;

    const addField = (field: string, value: any) => {
      if (value !== undefined && value !== null) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    };

    // Add fields (excluding sensitive ones)
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'uuid' && key !== 'created_at') {
        if (key === 'notification_preferences') {
          addField(key, JSON.stringify(updateData[key]));
        } else {
          addField(key, updateData[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);
    
    const result = await query(`
      UPDATE customer_users 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
};

// Delete customer
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if customer has active sessions
    const sessionsCheck = await query(`
      SELECT COUNT(*) as active_sessions
      FROM user_sessions
      WHERE user_id = $1 AND session_status = 'active'
    `, [id]);

    if (parseInt(sessionsCheck.rows[0].active_sessions) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with active sessions. Suspend the account instead.'
      });
    }

    const result = await query(`
      DELETE FROM customer_users WHERE id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};

// Update customer status
export const updateCustomerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended', 'expired', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: active, suspended, expired, or blocked'
      });
    }

    const result = await query(`
      UPDATE customer_users 
      SET status = $1, notes = COALESCE(notes || ' | ', '') || $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, username, full_name, phone, status, updated_at
    `, [status, `Status changed to ${status}: ${reason || 'No reason provided'}`, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // If suspending or blocking, terminate active sessions
    if (['suspended', 'blocked'].includes(status)) {
      await query(`
        UPDATE user_sessions 
        SET session_status = 'terminated', end_time = CURRENT_TIMESTAMP, terminate_cause = $1
        WHERE user_id = $2 AND session_status = 'active'
      `, [`Account ${status}`, id]);
    }

    res.json({
      success: true,
      message: `Customer status updated to ${status}`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating customer status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer status',
      error: error.message
    });
  }
};

// Update customer plan
export const updateCustomerPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { plan_id, auto_renew = false } = req.body;

    // Get plan details
    const planResult = await query(`
      SELECT * FROM internet_plans WHERE id = $1 AND is_active = true
    `, [plan_id]);

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or inactive'
      });
    }

    const plan = planResult.rows[0];
    const subscription_start_date = new Date();
    const subscription_end_date = new Date();
    subscription_end_date.setDate(subscription_end_date.getDate() + plan.validity_days);

    const result = await query(`
      UPDATE customer_users 
      SET 
        current_plan_id = $1,
        subscription_start_date = $2,
        subscription_end_date = $3,
        auto_renew = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, username, full_name, phone, current_plan_id, subscription_start_date, subscription_end_date
    `, [plan_id, subscription_start_date, subscription_end_date, auto_renew, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer plan updated successfully',
      data: {
        customer: result.rows[0],
        plan: {
          name: plan.name,
          price: plan.price,
          duration_hours: plan.duration_hours,
          speed_down: plan.speed_down,
          speed_up: plan.speed_up
        }
      }
    });
  } catch (error) {
    console.error('Error updating customer plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer plan',
      error: error.message
    });
  }
};

// Get customer statistics
export const getCustomerStats = async (req: Request, res: Response) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_customers,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_customers,
        COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked_customers,
        COALESCE(SUM(total_spent), 0) as total_revenue,
        COALESCE(SUM(account_balance), 0) as total_account_balance,
        COALESCE(SUM(total_data_used), 0) as total_data_used,
        COALESCE(AVG(total_spent), 0) as avg_customer_value,
        COUNT(CASE WHEN registration_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_customers_30d
      FROM customer_users
    `);

    const planDistribution = await query(`
      SELECT 
        ip.name as plan_name,
        COUNT(cu.id) as customer_count,
        COALESCE(SUM(cu.total_spent), 0) as plan_revenue
      FROM internet_plans ip
      LEFT JOIN customer_users cu ON ip.id = cu.current_plan_id
      GROUP BY ip.id, ip.name
      ORDER BY customer_count DESC
    `);

    const resellerDistribution = await query(`
      SELECT 
        r.company_name,
        COUNT(cu.id) as customer_count,
        COALESCE(SUM(cu.total_spent), 0) as reseller_revenue
      FROM resellers r
      LEFT JOIN customer_users cu ON r.id = cu.reseller_id
      GROUP BY r.id, r.company_name
      ORDER BY customer_count DESC
    `);

    const monthlySignups = await query(`
      SELECT 
        DATE_TRUNC('month', registration_date) as month,
        COUNT(*) as signups,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_signups
      FROM customer_users
      WHERE registration_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', registration_date)
      ORDER BY month
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        plan_distribution: planDistribution.rows,
        reseller_distribution: resellerDistribution.rows,
        monthly_signups: monthlySignups.rows
      }
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer statistics',
      error: error.message
    });
  }
};

// Search customers
export const searchCustomers = async (req: Request, res: Response) => {
  try {
    const { q, limit = 50 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchQuery = `%${q}%`;
    
    const result = await query(`
      SELECT 
        cu.id, cu.username, cu.full_name, cu.phone, cu.email, cu.status,
        ip.name as current_plan_name,
        r.company_name as reseller_company
      FROM customer_users cu
      LEFT JOIN internet_plans ip ON cu.current_plan_id = ip.id
      LEFT JOIN resellers r ON cu.reseller_id = r.id
      WHERE 
        cu.full_name ILIKE $1 OR 
        cu.phone ILIKE $1 OR 
        cu.email ILIKE $1 OR 
        cu.username ILIKE $1
      ORDER BY cu.full_name
      LIMIT $2
    `, [searchQuery, limit]);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search customers',
      error: error.message
    });
  }
};

// Send message to customer
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message, channel = 'sms', template_name, subject } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Get customer details
    const customerResult = await query(`
      SELECT phone, email, full_name, notification_preferences
      FROM customer_users
      WHERE id = $1
    `, [id]);

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const customer = customerResult.rows[0];
    const recipient_phone = customer.phone;
    const recipient_email = customer.email;

    // Create notification log
    const result = await query(`
      INSERT INTO notification_logs (
        recipient_id, recipient_type, channel, template_name, subject, message,
        recipient_email, recipient_phone, status
      ) VALUES (
        $1, 'customer', $2, $3, $4, $5, $6, $7, 'sent'
      ) RETURNING *
    `, [id, channel, template_name, subject, message, recipient_email, recipient_phone]);

    res.json({
      success: true,
      message: `Message sent to ${customer.full_name} via ${channel}`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};
