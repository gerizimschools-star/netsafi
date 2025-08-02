import { RequestHandler } from "express";
import { query } from "../database";

// Get all network locations
export const getNetworkLocations: RequestHandler = async (req, res) => {
  try {
    const result = await query(`
      SELECT id, location_name, status, active_users, bandwidth_usage, 
             latency_ms, uptime_percentage, last_update, created_at
      FROM network_locations 
      ORDER BY location_name
    `);
    
    res.json({
      success: true,
      locations: result.rows
    });
  } catch (error) {
    console.error('Error fetching network locations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch network locations'
    });
  }
};

// Get single network location
export const getNetworkLocation: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM network_locations WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Network location not found'
      });
    }
    
    res.json({
      success: true,
      location: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching network location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch network location'
    });
  }
};

// Update network location status
export const updateNetworkStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, bandwidth_usage, latency_ms, active_users } = req.body;
    
    if (!['Online', 'Offline', 'Maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const result = await query(`
      UPDATE network_locations 
      SET status = $1, bandwidth_usage = $2, latency_ms = $3, active_users = $4, 
          last_update = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `, [status, bandwidth_usage, latency_ms, active_users, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Network location not found'
      });
    }
    
    res.json({
      success: true,
      location: result.rows[0],
      message: 'Network status updated successfully'
    });
  } catch (error) {
    console.error('Error updating network status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update network status'
    });
  }
};

// Get network statistics
export const getNetworkStats: RequestHandler = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_locations,
        COUNT(*) FILTER (WHERE status = 'Online') as online_locations,
        COUNT(*) FILTER (WHERE status = 'Offline') as offline_locations,
        COUNT(*) FILTER (WHERE status = 'Maintenance') as maintenance_locations,
        SUM(active_users) as total_active_users,
        AVG(bandwidth_usage) FILTER (WHERE status = 'Online') as avg_bandwidth_usage,
        AVG(uptime_percentage) as avg_uptime
      FROM network_locations
    `);
    
    res.json({
      success: true,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error('Error fetching network statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch network statistics'
    });
  }
};

// Refresh network data (simulate real-time updates)
export const refreshNetworkData: RequestHandler = async (req, res) => {
  try {
    // Simulate network monitoring by updating random values
    await query(`
      UPDATE network_locations 
      SET 
        bandwidth_usage = CASE 
          WHEN status = 'Online' THEN GREATEST(0, LEAST(100, bandwidth_usage + (RANDOM() - 0.5) * 10))
          ELSE 0 
        END,
        active_users = CASE 
          WHEN status = 'Online' THEN GREATEST(0, active_users + FLOOR((RANDOM() - 0.5) * 20))
          ELSE 0 
        END,
        latency_ms = CASE 
          WHEN status = 'Online' THEN GREATEST(5, latency_ms + FLOOR((RANDOM() - 0.5) * 5))
          ELSE NULL 
        END,
        last_update = CURRENT_TIMESTAMP
    `);
    
    // Get updated data
    const result = await query(`
      SELECT id, location_name, status, active_users, bandwidth_usage, 
             latency_ms, uptime_percentage, last_update
      FROM network_locations 
      ORDER BY location_name
    `);
    
    res.json({
      success: true,
      locations: result.rows,
      message: 'Network data refreshed successfully'
    });
  } catch (error) {
    console.error('Error refreshing network data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh network data'
    });
  }
};

// Add new network location
export const addNetworkLocation: RequestHandler = async (req, res) => {
  try {
    const { location_name, status = 'Online' } = req.body;
    
    if (!location_name) {
      return res.status(400).json({
        success: false,
        message: 'Location name is required'
      });
    }
    
    const result = await query(`
      INSERT INTO network_locations (location_name, status, active_users, bandwidth_usage, latency_ms, uptime_percentage)
      VALUES ($1, $2, 0, 0, 10, 99.0)
      RETURNING *
    `, [location_name, status]);
    
    res.status(201).json({
      success: true,
      location: result.rows[0],
      message: 'Network location added successfully'
    });
  } catch (error) {
    console.error('Error adding network location:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'Location name already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to add network location'
      });
    }
  }
};

// Delete network location
export const deleteNetworkLocation: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM network_locations WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Network location not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Network location deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting network location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete network location'
    });
  }
};
