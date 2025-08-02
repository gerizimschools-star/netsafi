import { RequestHandler } from "express";
import { query } from "../database";

// Get all users
export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    const result = await query(`
      SELECT id, name, email, phone, location, plan, status, usage_gb, monthly_amount, 
             join_date, last_seen, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get single user
export const getUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// Create new user
export const createUser: RequestHandler = async (req, res) => {
  try {
    const { name, email, phone, location, plan, monthly_amount } = req.body;
    
    // Validate required fields
    if (!name || !phone || !location || !plan || !monthly_amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const result = await query(`
      INSERT INTO users (name, email, phone, location, plan, monthly_amount)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, email, phone, location, plan, monthly_amount]);
    
    res.status(201).json({
      success: true,
      user: result.rows[0],
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'Phone number or email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }
};

// Update user
export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, location, plan, status, monthly_amount } = req.body;
    
    const result = await query(`
      UPDATE users 
      SET name = $1, email = $2, phone = $3, location = $4, plan = $5, status = $6, monthly_amount = $7
      WHERE id = $8
      RETURNING *
    `, [name, email, phone, location, plan, status, monthly_amount, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: result.rows[0],
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Delete user
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Update user status
export const updateUserStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Active', 'Suspended', 'Expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const result = await query(`
      UPDATE users 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: result.rows[0],
      message: `User ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// Get user statistics
export const getUserStats: RequestHandler = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE status = 'Active') as active_users,
        COUNT(*) FILTER (WHERE status = 'Suspended') as suspended_users,
        COUNT(*) FILTER (WHERE status = 'Expired') as expired_users,
        SUM(monthly_amount) FILTER (WHERE status = 'Active') as monthly_revenue
      FROM users
    `);
    
    res.json({
      success: true,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
};
