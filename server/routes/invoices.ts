import { RequestHandler } from "express";
import { query } from "../database";

// Get all invoices
export const getAllInvoices: RequestHandler = async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, u.name as customer_name, u.phone as customer_phone
      FROM invoices i
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
    `);
    
    res.json({
      success: true,
      invoices: result.rows
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices'
    });
  }
};

// Get single invoice
export const getInvoice: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT i.*, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
      FROM invoices i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice'
    });
  }
};

// Create new invoice
export const createInvoice: RequestHandler = async (req, res) => {
  try {
    const { user_id, amount, due_date } = req.body;
    
    // Get user details
    const userResult = await query('SELECT name, phone FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = userResult.rows[0];
    
    // Generate invoice ID
    const countResult = await query('SELECT COUNT(*) FROM invoices');
    const invoiceNumber = String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0');
    const invoiceId = `INV-${invoiceNumber}`;
    
    const result = await query(`
      INSERT INTO invoices (id, user_id, customer_name, customer_phone, amount, due_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [invoiceId, user_id, user.name, user.phone, amount, due_date]);
    
    res.status(201).json({
      success: true,
      invoice: result.rows[0],
      message: 'Invoice created successfully'
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice'
    });
  }
};

// Update invoice status
export const updateInvoiceStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_method } = req.body;
    
    if (!['Paid', 'Pending', 'Overdue'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const setPaidDate = status === 'Paid' ? ', paid_date = CURRENT_DATE' : '';
    
    const result = await query(`
      UPDATE invoices 
      SET status = $1, payment_method = $2, updated_at = CURRENT_TIMESTAMP ${setPaidDate}
      WHERE id = $3
      RETURNING *
    `, [status, payment_method || 'Pending', id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      invoice: result.rows[0],
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice'
    });
  }
};

// Process payment
export const processPayment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;
    
    const result = await query(`
      UPDATE invoices 
      SET status = 'Paid', payment_method = $1, paid_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [payment_method, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      invoice: result.rows[0],
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    });
  }
};

// Get invoice statistics
export const getInvoiceStats: RequestHandler = async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(*) FILTER (WHERE status = 'Paid') as paid_invoices,
        COUNT(*) FILTER (WHERE status = 'Pending') as pending_invoices,
        COUNT(*) FILTER (WHERE status = 'Overdue') as overdue_invoices,
        SUM(amount) FILTER (WHERE status = 'Paid') as total_revenue,
        SUM(amount) FILTER (WHERE status = 'Pending') as pending_amount
      FROM invoices
    `);
    
    res.json({
      success: true,
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error('Error fetching invoice statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice statistics'
    });
  }
};

// Get monthly revenue
export const getMonthlyRevenue: RequestHandler = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        DATE_TRUNC('month', paid_date) as month,
        SUM(amount) as revenue
      FROM invoices 
      WHERE status = 'Paid' AND paid_date >= DATE_TRUNC('year', CURRENT_DATE)
      GROUP BY DATE_TRUNC('month', paid_date)
      ORDER BY month
    `);
    
    res.json({
      success: true,
      monthly_revenue: result.rows
    });
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly revenue'
    });
  }
};
