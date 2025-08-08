import { Request, Response } from 'express';
import { query } from '../database';
import bcrypt from 'bcryptjs';

// Get all routers
export const getAllRouters = async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT 
        r.*,
        au.first_name || ' ' || au.last_name as created_by_name,
        (SELECT COUNT(*) FROM user_sessions us WHERE us.router_id = r.id AND us.session_status = 'active') as active_sessions,
        (SELECT COUNT(*) FROM customer_users cu WHERE cu.router_id = r.id) as total_customers
      FROM routers r
      LEFT JOIN admin_users au ON r.created_by = au.id
      ORDER BY r.created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching routers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch routers',
      error: error.message
    });
  }
};

// Get single router
export const getRouter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(`
      SELECT 
        r.*,
        au.first_name || ' ' || au.last_name as created_by_name,
        (SELECT COUNT(*) FROM user_sessions us WHERE us.router_id = r.id AND us.session_status = 'active') as active_sessions,
        (SELECT COUNT(*) FROM customer_users cu WHERE cu.router_id = r.id) as total_customers,
        (SELECT COALESCE(SUM(us.bytes_in + us.bytes_out), 0) FROM user_sessions us WHERE us.router_id = r.id) as total_data_transferred
      FROM routers r
      LEFT JOIN admin_users au ON r.created_by = au.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Router not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching router:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch router',
      error: error.message
    });
  }
};

// Create new router
export const createRouter = async (req: Request, res: Response) => {
  try {
    const {
      name,
      ip_address,
      port = 8728,
      username,
      password,
      model,
      firmware_version,
      location,
      description,
      max_users = 100,
      bandwidth_limit_down,
      bandwidth_limit_up,
      connection_type = 'api',
      ssl_enabled = true,
      auto_sync = true,
      backup_enabled = true,
      backup_frequency = 'daily',
      monitoring_enabled = true,
      alert_threshold_cpu = 80,
      alert_threshold_memory = 80,
      alert_threshold_disk = 90
    } = req.body;

    // Validate required fields
    if (!name || !ip_address || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, IP address, username, and password are required'
      });
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(`
      INSERT INTO routers (
        name, ip_address, port, username, password_hash, model, firmware_version,
        location, description, max_users, bandwidth_limit_down, bandwidth_limit_up,
        connection_type, ssl_enabled, auto_sync, backup_enabled, backup_frequency,
        monitoring_enabled, alert_threshold_cpu, alert_threshold_memory, alert_threshold_disk,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
      ) RETURNING *
    `, [
      name, ip_address, port, username, password_hash, model, firmware_version,
      location, description, max_users, bandwidth_limit_down, bandwidth_limit_up,
      connection_type, ssl_enabled, auto_sync, backup_enabled, backup_frequency,
      monitoring_enabled, alert_threshold_cpu, alert_threshold_memory, alert_threshold_disk,
      1 // TODO: Get actual user ID from JWT token
    ]);

    res.status(201).json({
      success: true,
      message: 'Router created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating router:', error);
    
    if (error.code === '23505') { // Duplicate key error
      return res.status(409).json({
        success: false,
        message: 'Router with this IP address already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create router',
      error: error.message
    });
  }
};

// Update router
export const updateRouter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      ip_address,
      port,
      username,
      password,
      model,
      firmware_version,
      location,
      description,
      max_users,
      bandwidth_limit_down,
      bandwidth_limit_up,
      connection_type,
      ssl_enabled,
      auto_sync,
      backup_enabled,
      backup_frequency,
      monitoring_enabled,
      alert_threshold_cpu,
      alert_threshold_memory,
      alert_threshold_disk,
      status
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

    addField('name', name);
    addField('ip_address', ip_address);
    addField('port', port);
    addField('username', username);
    addField('model', model);
    addField('firmware_version', firmware_version);
    addField('location', location);
    addField('description', description);
    addField('max_users', max_users);
    addField('bandwidth_limit_down', bandwidth_limit_down);
    addField('bandwidth_limit_up', bandwidth_limit_up);
    addField('connection_type', connection_type);
    addField('ssl_enabled', ssl_enabled);
    addField('auto_sync', auto_sync);
    addField('backup_enabled', backup_enabled);
    addField('backup_frequency', backup_frequency);
    addField('monitoring_enabled', monitoring_enabled);
    addField('alert_threshold_cpu', alert_threshold_cpu);
    addField('alert_threshold_memory', alert_threshold_memory);
    addField('alert_threshold_disk', alert_threshold_disk);
    addField('status', status);

    // Hash password if provided
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      addField('password_hash', password_hash);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);
    
    const result = await query(`
      UPDATE routers 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Router not found'
      });
    }

    res.json({
      success: true,
      message: 'Router updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating router:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update router',
      error: error.message
    });
  }
};

// Delete router
export const deleteRouter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if router has active sessions
    const sessionsCheck = await query(`
      SELECT COUNT(*) as active_sessions
      FROM user_sessions
      WHERE router_id = $1 AND session_status = 'active'
    `, [id]);

    if (parseInt(sessionsCheck.rows[0].active_sessions) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete router with active sessions'
      });
    }

    const result = await query(`
      DELETE FROM routers WHERE id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Router not found'
      });
    }

    res.json({
      success: true,
      message: 'Router deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting router:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete router',
      error: error.message
    });
  }
};

// Update router status
export const updateRouterStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, is_online } = req.body;

    const result = await query(`
      UPDATE routers 
      SET status = $1, is_online = $2, last_seen = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [status, is_online, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Router not found'
      });
    }

    res.json({
      success: true,
      message: 'Router status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating router status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update router status',
      error: error.message
    });
  }
};

// Sync router data (simulate)
export const syncRouter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // In a real implementation, this would connect to the router and sync data
    const result = await query(`
      UPDATE routers 
      SET 
        last_sync = CURRENT_TIMESTAMP,
        is_online = true,
        status = 'active',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Router not found'
      });
    }

    res.json({
      success: true,
      message: 'Router synced successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error syncing router:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync router',
      error: error.message
    });
  }
};

// Get router statistics
export const getRouterStats = async (req: Request, res: Response) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_routers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_routers,
        COUNT(CASE WHEN is_online = true THEN 1 END) as online_routers,
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_routers,
        COALESCE(SUM(current_users), 0) as total_connected_users,
        COALESCE(AVG(uptime_percentage), 0) as avg_uptime
      FROM routers
    `);

    res.json({
      success: true,
      data: stats.rows[0]
    });
  } catch (error) {
    console.error('Error fetching router stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch router statistics',
      error: error.message
    });
  }
};

// Assign router to reseller
export const assignRouterToReseller = async (req: Request, res: Response) => {
  try {
    const { router_id, reseller_id, access_level = 'full', is_primary = false } = req.body;

    // Check if assignment already exists
    const existingAssignment = await query(`
      SELECT * FROM reseller_routers 
      WHERE router_id = $1 AND reseller_id = $2
    `, [router_id, reseller_id]);

    if (existingAssignment.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Router is already assigned to this reseller'
      });
    }

    const result = await query(`
      INSERT INTO reseller_routers (router_id, reseller_id, access_level, is_primary)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [router_id, reseller_id, access_level, is_primary]);

    res.status(201).json({
      success: true,
      message: 'Router assigned to reseller successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error assigning router to reseller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign router to reseller',
      error: error.message
    });
  }
};
