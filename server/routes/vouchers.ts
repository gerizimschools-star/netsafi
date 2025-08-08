import { Request, Response } from 'express';
import { query } from '../database';
import crypto from 'crypto';
import QRCode from 'qrcode';

// Generate voucher code
const generateVoucherCode = (prefix: string = 'NT'): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Generate PIN code
const generatePinCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Get all vouchers
export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    const { status, plan_id, reseller_id, batch_id } = req.query;
    
    let whereConditions = [];
    let values = [];
    let paramCount = 1;

    if (status) {
      whereConditions.push(`v.status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (plan_id) {
      whereConditions.push(`v.plan_id = $${paramCount}`);
      values.push(plan_id);
      paramCount++;
    }

    if (reseller_id) {
      whereConditions.push(`v.reseller_id = $${paramCount}`);
      values.push(reseller_id);
      paramCount++;
    }

    if (batch_id) {
      whereConditions.push(`v.batch_id = $${paramCount}`);
      values.push(batch_id);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await query(`
      SELECT 
        v.*,
        ip.name as plan_name,
        ip.duration_hours,
        ip.speed_down,
        ip.speed_up,
        r.company_name as reseller_company,
        r.contact_person as reseller_contact,
        cu.full_name as used_by_name,
        cu.phone as used_by_phone,
        rt.name as router_name,
        au.first_name || ' ' || au.last_name as created_by_name
      FROM vouchers v
      LEFT JOIN internet_plans ip ON v.plan_id = ip.id
      LEFT JOIN resellers r ON v.reseller_id = r.id
      LEFT JOIN customer_users cu ON v.used_by = cu.id
      LEFT JOIN routers rt ON v.router_id = rt.id
      LEFT JOIN admin_users au ON v.created_by = au.id
      ${whereClause}
      ORDER BY v.created_at DESC
    `, values);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vouchers',
      error: error.message
    });
  }
};

// Get single voucher
export const getVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        v.*,
        ip.name as plan_name,
        ip.description as plan_description,
        ip.duration_hours,
        ip.speed_down,
        ip.speed_up,
        ip.data_limit,
        r.company_name as reseller_company,
        r.contact_person as reseller_contact,
        r.phone as reseller_phone,
        cu.full_name as used_by_name,
        cu.phone as used_by_phone,
        cu.email as used_by_email,
        rt.name as router_name,
        rt.ip_address as router_ip,
        au.first_name || ' ' || au.last_name as created_by_name
      FROM vouchers v
      LEFT JOIN internet_plans ip ON v.plan_id = ip.id
      LEFT JOIN resellers r ON v.reseller_id = r.id
      LEFT JOIN customer_users cu ON v.used_by = cu.id
      LEFT JOIN routers rt ON v.router_id = rt.id
      LEFT JOIN admin_users au ON v.created_by = au.id
      WHERE v.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voucher',
      error: error.message
    });
  }
};

// Generate vouchers (batch)
export const generateVouchers = async (req: Request, res: Response) => {
  try {
    const {
      plan_id,
      reseller_id,
      router_id,
      quantity = 1,
      custom_amount,
      expiry_days = 30,
      prefix = 'NT',
      notes,
      generate_qr = true,
      is_transferable = false,
      max_transfers = 0
    } = req.body;

    // Validate required fields
    if (!plan_id || !reseller_id || !router_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID, Reseller ID, Router ID, and quantity are required'
      });
    }

    if (quantity > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 1000 vouchers can be generated at once'
      });
    }

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
    const amount = custom_amount || plan.price;
    const commission_amount = Math.round(amount * (plan.commission_rate / 100));
    const batch_id = `BATCH_${Date.now()}`;
    const expiry_date = new Date();
    expiry_date.setDate(expiry_date.getDate() + expiry_days);

    const vouchers = [];
    
    for (let i = 0; i < quantity; i++) {
      const code = generateVoucherCode(prefix);
      const pin_code = generatePinCode();
      const serial_number = `${batch_id}_${String(i + 1).padStart(4, '0')}`;
      
      let qr_code = null;
      if (generate_qr) {
        try {
          qr_code = await QRCode.toDataURL(code);
        } catch (qrError) {
          console.warn('Failed to generate QR code:', qrError);
        }
      }

      const voucherData = {
        code,
        batch_id,
        plan_id,
        reseller_id,
        router_id,
        amount,
        commission_amount,
        serial_number,
        qr_code,
        pin_code,
        expiry_date: expiry_date.toISOString().split('T')[0],
        is_transferable,
        max_transfers,
        notes
      };

      vouchers.push(voucherData);
    }

    // Insert vouchers in batch
    const voucherInserts = vouchers.map((v, index) => {
      const valueIndex = index * 15;
      return `($${valueIndex + 1}, $${valueIndex + 2}, $${valueIndex + 3}, $${valueIndex + 4}, $${valueIndex + 5}, $${valueIndex + 6}, $${valueIndex + 7}, $${valueIndex + 8}, $${valueIndex + 9}, $${valueIndex + 10}, $${valueIndex + 11}, $${valueIndex + 12}, $${valueIndex + 13}, $${valueIndex + 14}, $${valueIndex + 15})`;
    });

    const flatValues = vouchers.flatMap(v => [
      v.code, v.batch_id, v.plan_id, v.reseller_id, v.router_id, v.amount,
      v.commission_amount, v.serial_number, v.qr_code, v.pin_code, v.expiry_date,
      v.is_transferable, v.max_transfers, v.notes, 1 // created_by
    ]);

    const result = await query(`
      INSERT INTO vouchers (
        code, batch_id, plan_id, reseller_id, router_id, amount, commission_amount,
        serial_number, qr_code, pin_code, expiry_date, is_transferable, max_transfers,
        notes, created_by
      ) VALUES ${voucherInserts.join(', ')}
      RETURNING *
    `, flatValues);

    res.status(201).json({
      success: true,
      message: `${quantity} vouchers generated successfully`,
      data: {
        batch_id,
        vouchers: result.rows,
        summary: {
          total_vouchers: quantity,
          total_amount: amount * quantity,
          total_commission: commission_amount * quantity,
          plan_name: plan.name,
          expiry_date: expiry_date.toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    console.error('Error generating vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate vouchers',
      error: error.message
    });
  }
};

// Update voucher
export const updateVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      amount,
      expiry_date,
      status,
      notes,
      is_transferable,
      max_transfers,
      router_id
    } = req.body;

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

    addField('amount', amount);
    addField('expiry_date', expiry_date);
    addField('status', status);
    addField('notes', notes);
    addField('is_transferable', is_transferable);
    addField('max_transfers', max_transfers);
    addField('router_id', router_id);

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);
    
    const result = await query(`
      UPDATE vouchers 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    res.json({
      success: true,
      message: 'Voucher updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update voucher',
      error: error.message
    });
  }
};

// Cancel voucher
export const cancelVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await query(`
      UPDATE vouchers 
      SET status = 'cancelled', notes = COALESCE(notes || ' | ', '') || 'Cancelled: ' || $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND status = 'active'
      RETURNING *
    `, [reason || 'Manual cancellation', id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found or already used/cancelled'
      });
    }

    res.json({
      success: true,
      message: 'Voucher cancelled successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error cancelling voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel voucher',
      error: error.message
    });
  }
};

// Use voucher (customer activation)
export const useVoucher = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { user_id, mac_address, ip_address } = req.body;

    // Find voucher
    const voucherResult = await query(`
      SELECT v.*, ip.* FROM vouchers v
      JOIN internet_plans ip ON v.plan_id = ip.id
      WHERE v.code = $1 AND v.status = 'active' AND v.expiry_date >= CURRENT_DATE
    `, [code]);

    if (voucherResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found, expired, or already used'
      });
    }

    const voucher = voucherResult.rows[0];

    // Check activation limit
    if (voucher.activation_count >= voucher.activation_limit) {
      return res.status(400).json({
        success: false,
        message: 'Voucher activation limit exceeded'
      });
    }

    // Update voucher as used
    const updateResult = await query(`
      UPDATE vouchers 
      SET 
        status = 'used',
        used_by = $1,
        used_at = CURRENT_TIMESTAMP,
        used_from_ip = $2,
        used_from_mac = $3,
        activation_count = activation_count + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [user_id, ip_address, mac_address, voucher.id]);

    // Create user session
    const sessionResult = await query(`
      INSERT INTO user_sessions (
        user_id, voucher_id, plan_id, router_id, username, ip_address, mac_address,
        max_duration_seconds, max_bytes, speed_limit_down, speed_limit_up
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *
    `, [
      user_id, voucher.id, voucher.plan_id, voucher.router_id,
      `user_${user_id}`, ip_address, mac_address,
      voucher.duration_hours * 3600, voucher.data_limit,
      voucher.speed_down, voucher.speed_up
    ]);

    res.json({
      success: true,
      message: 'Voucher activated successfully',
      data: {
        voucher: updateResult.rows[0],
        session: sessionResult.rows[0],
        plan: {
          name: voucher.name,
          duration_hours: voucher.duration_hours,
          speed_down: voucher.speed_down,
          speed_up: voucher.speed_up
        }
      }
    });
  } catch (error) {
    console.error('Error using voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to use voucher',
      error: error.message
    });
  }
};

// Get voucher statistics
export const getVoucherStats = async (req: Request, res: Response) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_vouchers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_vouchers,
        COUNT(CASE WHEN status = 'used' THEN 1 END) as used_vouchers,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_vouchers,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_vouchers,
        COALESCE(SUM(amount), 0) as total_value,
        COALESCE(SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END), 0) as active_value,
        COALESCE(SUM(commission_amount), 0) as total_commission,
        COUNT(DISTINCT reseller_id) as active_resellers,
        COUNT(DISTINCT batch_id) as total_batches
      FROM vouchers
    `);

    const planStats = await query(`
      SELECT 
        ip.name as plan_name,
        COUNT(v.id) as voucher_count,
        COALESCE(SUM(v.amount), 0) as total_value,
        COUNT(CASE WHEN v.status = 'used' THEN 1 END) as used_count
      FROM internet_plans ip
      LEFT JOIN vouchers v ON ip.id = v.plan_id
      GROUP BY ip.id, ip.name
      ORDER BY voucher_count DESC
      LIMIT 10
    `);

    const dailyUsage = await query(`
      SELECT 
        DATE(used_at) as date,
        COUNT(*) as vouchers_used,
        COALESCE(SUM(amount), 0) as daily_revenue
      FROM vouchers
      WHERE used_at >= CURRENT_DATE - INTERVAL '30 days'
      AND status = 'used'
      GROUP BY DATE(used_at)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        plan_performance: planStats.rows,
        daily_usage: dailyUsage.rows
      }
    });
  } catch (error) {
    console.error('Error fetching voucher stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch voucher statistics',
      error: error.message
    });
  }
};

// Export vouchers (CSV/Excel)
export const exportVouchers = async (req: Request, res: Response) => {
  try {
    const { batch_id, reseller_id, format = 'csv' } = req.query;
    
    let whereConditions = [];
    let values = [];
    let paramCount = 1;

    if (batch_id) {
      whereConditions.push(`v.batch_id = $${paramCount}`);
      values.push(batch_id);
      paramCount++;
    }

    if (reseller_id) {
      whereConditions.push(`v.reseller_id = $${paramCount}`);
      values.push(reseller_id);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await query(`
      SELECT 
        v.code,
        v.pin_code,
        v.serial_number,
        ip.name as plan_name,
        v.amount,
        v.expiry_date,
        v.status,
        r.company_name as reseller,
        v.created_at
      FROM vouchers v
      LEFT JOIN internet_plans ip ON v.plan_id = ip.id
      LEFT JOIN resellers r ON v.reseller_id = r.id
      ${whereClause}
      ORDER BY v.created_at DESC
    `, values);

    if (format === 'json') {
      res.json({
        success: true,
        data: result.rows
      });
    } else {
      // CSV format
      const csvHeader = 'Code,PIN,Serial Number,Plan,Amount,Expiry Date,Status,Reseller,Created Date\n';
      const csvData = result.rows.map(row => 
        `${row.code},${row.pin_code},${row.serial_number},"${row.plan_name}",${row.amount},${row.expiry_date},${row.status},"${row.reseller}",${row.created_at}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="vouchers_${Date.now()}.csv"`);
      res.send(csvHeader + csvData);
    }
  } catch (error) {
    console.error('Error exporting vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export vouchers',
      error: error.message
    });
  }
};

// Get batch information
export const getBatchInfo = async (req: Request, res: Response) => {
  try {
    const { batch_id } = req.params;

    const result = await query(`
      SELECT 
        v.batch_id,
        COUNT(*) as total_vouchers,
        COUNT(CASE WHEN v.status = 'active' THEN 1 END) as active_vouchers,
        COUNT(CASE WHEN v.status = 'used' THEN 1 END) as used_vouchers,
        COALESCE(SUM(v.amount), 0) as total_value,
        ip.name as plan_name,
        r.company_name as reseller_company,
        MIN(v.created_at) as created_at,
        MIN(v.expiry_date) as expiry_date
      FROM vouchers v
      LEFT JOIN internet_plans ip ON v.plan_id = ip.id
      LEFT JOIN resellers r ON v.reseller_id = r.id
      WHERE v.batch_id = $1
      GROUP BY v.batch_id, ip.name, r.company_name
    `, [batch_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching batch info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch information',
      error: error.message
    });
  }
};
