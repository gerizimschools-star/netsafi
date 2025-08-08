import { Request, Response } from 'express';
import { query } from '../database';

// Get all internet plans
export const getAllPlans = async (req: Request, res: Response) => {
  try {
    const { category, is_active, is_featured } = req.query;
    
    let whereConditions = [];
    let values = [];
    let paramCount = 1;

    if (category) {
      whereConditions.push(`category = $${paramCount}`);
      values.push(category);
      paramCount++;
    }

    if (is_active !== undefined) {
      whereConditions.push(`is_active = $${paramCount}`);
      values.push(is_active === 'true');
      paramCount++;
    }

    if (is_featured !== undefined) {
      whereConditions.push(`is_featured = $${paramCount}`);
      values.push(is_featured === 'true');
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await query(`
      SELECT 
        ip.*,
        au.first_name || ' ' || au.last_name as created_by_name,
        (SELECT COUNT(*) FROM vouchers v WHERE v.plan_id = ip.id) as voucher_count,
        (SELECT COUNT(*) FROM vouchers v WHERE v.plan_id = ip.id AND v.status = 'active') as active_voucher_count,
        (SELECT COUNT(*) FROM user_sessions us WHERE us.plan_id = ip.id) as session_count,
        (SELECT COALESCE(SUM(v.amount), 0) FROM vouchers v WHERE v.plan_id = ip.id) as total_revenue
      FROM internet_plans ip
      LEFT JOIN admin_users au ON ip.created_by = au.id
      ${whereClause}
      ORDER BY ip.priority DESC, ip.created_at DESC
    `, values);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message
    });
  }
};

// Get single plan
export const getPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        ip.*,
        au.first_name || ' ' || au.last_name as created_by_name,
        (SELECT COUNT(*) FROM vouchers v WHERE v.plan_id = ip.id) as voucher_count,
        (SELECT COUNT(*) FROM vouchers v WHERE v.plan_id = ip.id AND v.status = 'active') as active_voucher_count,
        (SELECT COUNT(*) FROM user_sessions us WHERE us.plan_id = ip.id) as session_count,
        (SELECT COALESCE(SUM(v.amount), 0) FROM vouchers v WHERE v.plan_id = ip.id) as total_revenue,
        (SELECT COALESCE(AVG(us.duration_seconds), 0) FROM user_sessions us WHERE us.plan_id = ip.id) as avg_session_duration
      FROM internet_plans ip
      LEFT JOIN admin_users au ON ip.created_by = au.id
      WHERE ip.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan',
      error: error.message
    });
  }
};

// Create new plan
export const createPlan = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      duration_hours,
      price,
      currency = 'KES',
      speed_down,
      speed_up,
      data_limit,
      category = 'general',
      priority = 5,
      burst_speed_down,
      burst_speed_up,
      burst_threshold,
      fair_usage_policy = false,
      fup_limit,
      fup_speed_down,
      fup_speed_up,
      concurrent_sessions = 1,
      validity_days = 1,
      auto_renew = false,
      grace_period_hours = 0,
      overage_rate,
      tax_rate = 16.00,
      commission_rate = 15.00,
      min_commission = 0,
      max_commission,
      target_audience = [],
      features = [],
      restrictions = [],
      router_profile,
      queue_type = 'default',
      parent_queue,
      is_active = true,
      is_featured = false,
      is_promotional = false,
      promotion_start_date,
      promotion_end_date,
      promotion_discount = 0.00
    } = req.body;

    // Validate required fields
    if (!name || !duration_hours || !price || !speed_down || !speed_up) {
      return res.status(400).json({
        success: false,
        message: 'Name, duration, price, and speeds are required'
      });
    }

    const result = await query(`
      INSERT INTO internet_plans (
        name, description, duration_hours, price, currency, speed_down, speed_up,
        data_limit, category, priority, burst_speed_down, burst_speed_up, burst_threshold,
        fair_usage_policy, fup_limit, fup_speed_down, fup_speed_up, concurrent_sessions,
        validity_days, auto_renew, grace_period_hours, overage_rate, tax_rate,
        commission_rate, min_commission, max_commission, target_audience, features,
        restrictions, router_profile, queue_type, parent_queue, is_active, is_featured,
        is_promotional, promotion_start_date, promotion_end_date, promotion_discount,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
        $35, $36, $37, $38, $39
      ) RETURNING *
    `, [
      name, description, duration_hours, price, currency, speed_down, speed_up,
      data_limit, category, priority, burst_speed_down, burst_speed_up, burst_threshold,
      fair_usage_policy, fup_limit, fup_speed_down, fup_speed_up, concurrent_sessions,
      validity_days, auto_renew, grace_period_hours, overage_rate, tax_rate,
      commission_rate, min_commission, max_commission, target_audience, features,
      restrictions, router_profile, queue_type, parent_queue, is_active, is_featured,
      is_promotional, promotion_start_date, promotion_end_date, promotion_discount,
      1 // TODO: Get actual user ID from JWT token
    ]);

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Plan with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create plan',
      error: error.message
    });
  }
};

// Update plan
export const updatePlan = async (req: Request, res: Response) => {
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

    // Add all possible fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        addField(key, updateData[key]);
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
      UPDATE internet_plans 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update plan',
      error: error.message
    });
  }
};

// Delete plan
export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if plan has vouchers
    const vouchersCheck = await query(`
      SELECT COUNT(*) as voucher_count
      FROM vouchers
      WHERE plan_id = $1
    `, [id]);

    if (parseInt(vouchersCheck.rows[0].voucher_count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete plan with existing vouchers. Deactivate it instead.'
      });
    }

    const result = await query(`
      DELETE FROM internet_plans WHERE id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete plan',
      error: error.message
    });
  }
};

// Toggle plan status
export const togglePlanStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      UPDATE internet_plans 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const status = result.rows[0].is_active ? 'activated' : 'deactivated';

    res.json({
      success: true,
      message: `Plan ${status} successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error toggling plan status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle plan status',
      error: error.message
    });
  }
};

// Get plan categories
export const getPlanCategories = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        category,
        COUNT(*) as plan_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
        COALESCE(SUM(sales_count), 0) as total_sales,
        COALESCE(AVG(price), 0) as avg_price
      FROM internet_plans
      GROUP BY category
      ORDER BY plan_count DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching plan categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan categories',
      error: error.message
    });
  }
};

// Get plan statistics
export const getPlanStats = async (req: Request, res: Response) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_plans,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_plans,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_plans,
        COUNT(CASE WHEN is_promotional = true THEN 1 END) as promotional_plans,
        COALESCE(SUM(sales_count), 0) as total_sales,
        COALESCE(AVG(price), 0) as avg_price,
        COALESCE(MIN(price), 0) as min_price,
        COALESCE(MAX(price), 0) as max_price
      FROM internet_plans
    `);

    const categoryStats = await query(`
      SELECT 
        category,
        COUNT(*) as count,
        COALESCE(SUM(sales_count), 0) as sales
      FROM internet_plans
      WHERE is_active = true
      GROUP BY category
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        categories: categoryStats.rows
      }
    });
  } catch (error) {
    console.error('Error fetching plan stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan statistics',
      error: error.message
    });
  }
};

// Duplicate plan
export const duplicatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { new_name } = req.body;

    if (!new_name) {
      return res.status(400).json({
        success: false,
        message: 'New plan name is required'
      });
    }

    const originalPlan = await query(`
      SELECT * FROM internet_plans WHERE id = $1
    `, [id]);

    if (originalPlan.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Original plan not found'
      });
    }

    const plan = originalPlan.rows[0];
    
    const result = await query(`
      INSERT INTO internet_plans (
        name, description, duration_hours, price, currency, speed_down, speed_up,
        data_limit, category, priority, burst_speed_down, burst_speed_up, burst_threshold,
        fair_usage_policy, fup_limit, fup_speed_down, fup_speed_up, concurrent_sessions,
        validity_days, auto_renew, grace_period_hours, overage_rate, tax_rate,
        commission_rate, min_commission, max_commission, target_audience, features,
        restrictions, router_profile, queue_type, parent_queue, is_active, is_featured,
        is_promotional, promotion_start_date, promotion_end_date, promotion_discount,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
        $35, $36, $37, $38, $39
      ) RETURNING *
    `, [
      new_name, plan.description, plan.duration_hours, plan.price, plan.currency,
      plan.speed_down, plan.speed_up, plan.data_limit, plan.category, plan.priority,
      plan.burst_speed_down, plan.burst_speed_up, plan.burst_threshold,
      plan.fair_usage_policy, plan.fup_limit, plan.fup_speed_down, plan.fup_speed_up,
      plan.concurrent_sessions, plan.validity_days, plan.auto_renew,
      plan.grace_period_hours, plan.overage_rate, plan.tax_rate, plan.commission_rate,
      plan.min_commission, plan.max_commission, plan.target_audience, plan.features,
      plan.restrictions, plan.router_profile, plan.queue_type, plan.parent_queue,
      false, false, false, null, null, 0.00, 1 // TODO: Get actual user ID
    ]);

    res.status(201).json({
      success: true,
      message: 'Plan duplicated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error duplicating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate plan',
      error: error.message
    });
  }
};
