import { Request, Response } from 'express';
import { query } from '../database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Get all resellers
export const getAllResellers = async (req: Request, res: Response) => {
  try {
    const { status, tier_id, verification_status } = req.query;
    
    let whereConditions = [];
    let values = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`r.status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (tier_id) {
      whereConditions.push(`r.tier_id = $${paramCount}`);
      values.push(tier_id);
      paramCount++;
    }

    if (verification_status) {
      whereConditions.push(`r.verification_status = $${paramCount}`);
      values.push(verification_status);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await query(`
      SELECT 
        r.*,
        rt.name as tier_name,
        rt.commission_rate as tier_commission_rate,
        rt.max_credit_limit as tier_max_credit,
        rt.benefits as tier_benefits,
        (SELECT COUNT(*) FROM customer_users cu WHERE cu.reseller_id = r.id) as customer_count,
        (SELECT COUNT(*) FROM reseller_routers rr WHERE rr.reseller_id = r.id) as router_count,
        (SELECT COUNT(*) FROM vouchers v WHERE v.reseller_id = r.id) as voucher_count,
        (SELECT COUNT(*) FROM vouchers v WHERE v.reseller_id = r.id AND v.status = 'active') as active_voucher_count,
        (SELECT COALESCE(SUM(v.amount), 0) FROM vouchers v WHERE v.reseller_id = r.id) as total_voucher_value,
        (SELECT COALESCE(SUM(v.commission_amount), 0) FROM vouchers v WHERE v.reseller_id = r.id) as total_commission_earned
      FROM resellers r
      LEFT JOIN reseller_tiers rt ON r.tier_id = rt.id
      ${whereClause}
      ORDER BY r.created_at DESC
    `, values);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching resellers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resellers',
      error: error.message
    });
  }
};

// Get single reseller
export const getReseller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        r.*,
        rt.name as tier_name,
        rt.commission_rate as tier_commission_rate,
        rt.max_credit_limit as tier_max_credit,
        rt.benefits as tier_benefits,
        (SELECT COUNT(*) FROM customer_users cu WHERE cu.reseller_id = r.id) as customer_count,
        (SELECT COUNT(*) FROM customer_users cu WHERE cu.reseller_id = r.id AND cu.status = 'active') as active_customer_count,
        (SELECT COUNT(*) FROM reseller_routers rr WHERE rr.reseller_id = r.id) as router_count,
        (SELECT COUNT(*) FROM vouchers v WHERE v.reseller_id = r.id) as voucher_count,
        (SELECT COUNT(*) FROM vouchers v WHERE v.reseller_id = r.id AND v.status = 'active') as active_voucher_count,
        (SELECT COALESCE(SUM(v.amount), 0) FROM vouchers v WHERE v.reseller_id = r.id) as total_voucher_value,
        (SELECT COALESCE(SUM(v.commission_amount), 0) FROM vouchers v WHERE v.reseller_id = r.id) as total_commission_earned,
        (SELECT COALESCE(SUM(cu.total_spent), 0) FROM customer_users cu WHERE cu.reseller_id = r.id) as total_customer_spending
      FROM resellers r
      LEFT JOIN reseller_tiers rt ON r.tier_id = rt.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reseller not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching reseller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reseller',
      error: error.message
    });
  }
};

// Create new reseller
export const createReseller = async (req: Request, res: Response) => {
  try {
    const {
      username,
      password,
      email,
      company_name,
      contact_person,
      phone,
      alternate_phone,
      address,
      city,
      state,
      postal_code,
      country = 'Kenya',
      tier_id = 1,
      commission_rate = 15.00,
      credit_limit = 50000,
      tax_id,
      business_license,
      bank_account_name,
      bank_account_number,
      bank_name,
      bank_branch,
      preferred_language = 'en',
      timezone = 'Africa/Nairobi',
      notification_preferences = { email: true, sms: true, push: true },
      contract_start_date,
      contract_end_date
    } = req.body;

    // Validate required fields
    if (!username || !password || !email || !company_name || !contact_person || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, email, company name, contact person, and phone are required'
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate API credentials
    const api_key = crypto.randomBytes(32).toString('hex');
    const api_secret = crypto.randomBytes(64).toString('hex');

    const result = await query(`
      INSERT INTO resellers (
        username, password_hash, email, company_name, contact_person, phone,
        alternate_phone, address, city, state, postal_code, country, tier_id,
        commission_rate, credit_limit, tax_id, business_license, bank_account_name,
        bank_account_number, bank_name, bank_branch, preferred_language, timezone,
        notification_preferences, api_key, api_secret, contract_start_date, contract_end_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
      ) RETURNING id, username, email, company_name, contact_person, phone, status, verification_status, api_key, created_at
    `, [
      username, password_hash, email, company_name, contact_person, phone,
      alternate_phone, address, city, state, postal_code, country, tier_id,
      commission_rate, credit_limit, tax_id, business_license, bank_account_name,
      bank_account_number, bank_name, bank_branch, preferred_language, timezone,
      JSON.stringify(notification_preferences), api_key, api_secret, contract_start_date, contract_end_date
    ]);

    res.status(201).json({
      success: true,
      message: 'Reseller created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating reseller:', error);
    
    if (error.code === '23505') {
      if (error.constraint.includes('username')) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }
      if (error.constraint.includes('email')) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create reseller',
      error: error.message
    });
  }
};

// Update reseller
export const updateReseller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields from update data
    delete updateData.password_hash;
    delete updateData.api_key;
    delete updateData.api_secret;

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

    // Handle password update separately
    if (updateData.password) {
      const password_hash = await bcrypt.hash(updateData.password, 10);
      addField('password_hash', password_hash);
      delete updateData.password;
    }

    // Add other fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
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
      UPDATE resellers 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, username, email, company_name, contact_person, phone, status, verification_status, updated_at
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reseller not found'
      });
    }

    res.json({
      success: true,
      message: 'Reseller updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating reseller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reseller',
      error: error.message
    });
  }
};

// Delete reseller
export const deleteReseller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if reseller has customers
    const customersCheck = await query(`
      SELECT COUNT(*) as customer_count
      FROM customer_users
      WHERE reseller_id = $1
    `, [id]);

    if (parseInt(customersCheck.rows[0].customer_count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete reseller with existing customers. Suspend the account instead.'
      });
    }

    const result = await query(`
      DELETE FROM resellers WHERE id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reseller not found'
      });
    }

    res.json({
      success: true,
      message: 'Reseller deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reseller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reseller',
      error: error.message
    });
  }
};

// Update reseller status
export const updateResellerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: active, suspended, or inactive'
      });
    }

    const result = await query(`
      UPDATE resellers 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, company_name, status, updated_at
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reseller not found'
      });
    }

    res.json({
      success: true,
      message: `Reseller status updated to ${status}`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating reseller status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reseller status',
      error: error.message
    });
  }
};

// Update reseller verification status
export const updateVerificationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verification_status, notes } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(verification_status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Must be: pending, verified, or rejected'
      });
    }

    const result = await query(`
      UPDATE resellers 
      SET verification_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, company_name, verification_status, updated_at
    `, [verification_status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reseller not found'
      });
    }

    res.json({
      success: true,
      message: `Reseller verification status updated to ${verification_status}`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update verification status',
      error: error.message
    });
  }
};

// Update reseller credit
export const updateResellerCredit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, operation, notes } = req.body; // operation: 'add' or 'subtract'

    if (!amount || !operation || !['add', 'subtract'].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: 'Amount and operation (add/subtract) are required'
      });
    }

    const currentReseller = await query(`
      SELECT credit_balance, credit_limit FROM resellers WHERE id = $1
    `, [id]);

    if (currentReseller.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reseller not found'
      });
    }

    const currentBalance = parseInt(currentReseller.rows[0].credit_balance);
    const creditLimit = parseInt(currentReseller.rows[0].credit_limit);
    
    let newBalance;
    if (operation === 'add') {
      newBalance = currentBalance + parseInt(amount);
      if (newBalance > creditLimit) {
        return res.status(400).json({
          success: false,
          message: `New balance would exceed credit limit of ${creditLimit}`
        });
      }
    } else {
      newBalance = currentBalance - parseInt(amount);
      if (newBalance < 0) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient credit balance'
        });
      }
    }

    const result = await query(`
      UPDATE resellers 
      SET credit_balance = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, company_name, credit_balance, updated_at
    `, [newBalance, id]);

    // Log the credit transaction
    await query(`
      INSERT INTO system_audit_logs (user_id, user_type, action, resource_type, resource_id, new_values, metadata)
      VALUES ($1, 'admin', 'credit_update', 'reseller', $2, $3, $4)
    `, [
      1, // TODO: Get actual admin user ID
      id,
      JSON.stringify({ new_balance: newBalance, previous_balance: currentBalance }),
      JSON.stringify({ operation, amount, notes })
    ]);

    res.json({
      success: true,
      message: `Credit ${operation === 'add' ? 'added' : 'deducted'} successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating reseller credit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reseller credit',
      error: error.message
    });
  }
};

// Get reseller statistics
export const getResellerStats = async (req: Request, res: Response) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_resellers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_resellers,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_resellers,
        COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_resellers,
        COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_verification,
        COALESCE(SUM(credit_balance), 0) as total_credit_balance,
        COALESCE(SUM(total_sales), 0) as total_sales,
        COALESCE(SUM(total_commission), 0) as total_commission_earned,
        COALESCE(AVG(commission_rate), 0) as avg_commission_rate
      FROM resellers
    `);

    const tierStats = await query(`
      SELECT 
        rt.name as tier_name,
        COUNT(r.id) as reseller_count,
        COALESCE(SUM(r.total_sales), 0) as tier_sales,
        COALESCE(AVG(r.commission_rate), 0) as avg_commission
      FROM reseller_tiers rt
      LEFT JOIN resellers r ON rt.id = r.tier_id
      GROUP BY rt.id, rt.name
      ORDER BY reseller_count DESC
    `);

    const monthlySignups = await query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as signups
      FROM resellers
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        tiers: tierStats.rows,
        monthly_signups: monthlySignups.rows
      }
    });
  } catch (error) {
    console.error('Error fetching reseller stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reseller statistics',
      error: error.message
    });
  }
};

// Get reseller tiers
export const getResellerTiers = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        rt.*,
        COUNT(r.id) as reseller_count,
        COALESCE(SUM(r.total_sales), 0) as total_tier_sales
      FROM reseller_tiers rt
      LEFT JOIN resellers r ON rt.id = r.tier_id
      WHERE rt.is_active = true
      GROUP BY rt.id
      ORDER BY rt.commission_rate ASC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching reseller tiers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reseller tiers',
      error: error.message
    });
  }
};

// Regenerate API credentials
export const regenerateApiCredentials = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const api_key = crypto.randomBytes(32).toString('hex');
    const api_secret = crypto.randomBytes(64).toString('hex');

    const result = await query(`
      UPDATE resellers 
      SET api_key = $1, api_secret = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, username, company_name, api_key
    `, [api_key, api_secret, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reseller not found'
      });
    }

    res.json({
      success: true,
      message: 'API credentials regenerated successfully',
      data: {
        api_key,
        api_secret
      }
    });
  } catch (error) {
    console.error('Error regenerating API credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate API credentials',
      error: error.message
    });
  }
};
