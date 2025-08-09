import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query, get, run } from "../database-unified";
import { TwoFactorService } from "../services/twoFactorService";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

// Login endpoint
export const login: RequestHandler = async (req, res) => {
  try {
    const { username, password, userType = 'admin', twoFactorToken } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Determine table based on user type
    const table = userType === 'reseller' ? 'resellers' : 'admin_users';
    const usernameField = userType === 'reseller' ? 'email' : 'username';

    // Find user
    const user = await get(`
      SELECT * FROM ${table} WHERE ${usernameField} = ? AND status = 'active'
    `, [username]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      if (!twoFactorToken) {
        return res.status(200).json({
          success: true,
          requiresTwoFactor: true,
          userId: user.id,
          message: 'Two-factor authentication required'
        });
      }

      // Verify 2FA token
      const backupCodes = user.two_factor_backup_codes ? 
        JSON.parse(user.two_factor_backup_codes) : [];
      
      const verifyResult = TwoFactorService.verifyToken(
        user.two_factor_secret,
        twoFactorToken,
        backupCodes
      );

      if (!verifyResult.isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid two-factor authentication code'
        });
      }

      // If backup code was used, remove it
      if (verifyResult.usedBackupCode) {
        const updatedCodes = TwoFactorService.removeUsedBackupCode(backupCodes, twoFactorToken);
        await run(`
          UPDATE ${table} 
          SET two_factor_backup_codes = ? 
          WHERE id = ?
        `, [JSON.stringify(updatedCodes), user.id]);
      }
    } else if (user.two_factor_mandatory) {
      // 2FA is mandatory but not set up
      return res.status(200).json({
        success: true,
        requiresTwoFactorSetup: true,
        userId: user.id,
        message: 'Two-factor authentication setup required'
      });
    }

    // Update last login
    await run(`
      UPDATE ${table} 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        userType,
        role: user.role || 'reseller',
        twoFactorVerified: true
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove sensitive data
    const { password_hash, two_factor_secret, two_factor_backup_codes, ...safeUser } = user;

    res.json({
      success: true,
      token,
      user: safeUser,
      userType,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Setup 2FA
export const setup2FA: RequestHandler = async (req, res) => {
  try {
    const { userId, userType = 'admin' } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const table = userType === 'reseller' ? 'resellers' : 'admin_users';
    const emailField = userType === 'reseller' ? 'email' : 'email';
    const nameField = userType === 'reseller' ? 'contact_name' : 'first_name';

    // Get user details
    const user = await get(`
      SELECT id, ${emailField} as email, ${nameField} as name FROM ${table} 
      WHERE id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate 2FA setup
    const twoFactorSetup = await TwoFactorService.generateSecret(user.email, user.name);

    // Store the secret temporarily (not enabled yet)
    await run(`
      UPDATE ${table} 
      SET two_factor_secret = ?, two_factor_backup_codes = ? 
      WHERE id = ?
    `, [
      twoFactorSetup.secret,
      JSON.stringify(twoFactorSetup.backupCodes),
      userId
    ]);

    res.json({
      success: true,
      setup: {
        qrCodeUrl: twoFactorSetup.qrCodeUrl,
        manualEntryKey: twoFactorSetup.manualEntryKey,
        backupCodes: twoFactorSetup.backupCodes
      },
      message: '2FA setup initiated'
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup 2FA'
    });
  }
};

// Verify and enable 2FA
export const verify2FA: RequestHandler = async (req, res) => {
  try {
    const { userId, userType = 'admin', token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        message: 'User ID and verification token are required'
      });
    }

    const table = userType === 'reseller' ? 'resellers' : 'admin_users';

    // Get user's secret
    const user = await get(`
      SELECT two_factor_secret FROM ${table} WHERE id = ?
    `, [userId]);

    if (!user || !user.two_factor_secret) {
      return res.status(400).json({
        success: false,
        message: '2FA setup not found'
      });
    }

    // Verify the token
    const verifyResult = TwoFactorService.verifyToken(user.two_factor_secret, token);

    if (!verifyResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Enable 2FA
    await run(`
      UPDATE ${table} 
      SET two_factor_enabled = TRUE, two_factor_setup_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [userId]);

    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully'
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA'
    });
  }
};

// Disable 2FA (requires current password and 2FA token)
export const disable2FA: RequestHandler = async (req, res) => {
  try {
    const { userId, userType = 'admin', currentPassword, twoFactorToken } = req.body;

    if (!userId || !currentPassword || !twoFactorToken) {
      return res.status(400).json({
        success: false,
        message: 'User ID, current password, and 2FA token are required'
      });
    }

    const table = userType === 'reseller' ? 'resellers' : 'admin_users';

    // Get user
    const user = await get(`
      SELECT * FROM ${table} WHERE id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid current password'
      });
    }

    // Verify 2FA token
    const backupCodes = user.two_factor_backup_codes ? 
      JSON.parse(user.two_factor_backup_codes) : [];
    
    const verifyResult = TwoFactorService.verifyToken(
      user.two_factor_secret,
      twoFactorToken,
      backupCodes
    );

    if (!verifyResult.isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid two-factor authentication code'
      });
    }

    // Disable 2FA (only if not mandatory for this user type)
    if (user.two_factor_mandatory) {
      return res.status(400).json({
        success: false,
        message: 'Two-factor authentication is mandatory for your account type'
      });
    }

    await run(`
      UPDATE ${table} 
      SET two_factor_enabled = FALSE, 
          two_factor_secret = NULL, 
          two_factor_backup_codes = NULL,
          two_factor_setup_at = NULL 
      WHERE id = ?
    `, [userId]);

    res.json({
      success: true,
      message: 'Two-factor authentication disabled'
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA'
    });
  }
};

// Generate new backup codes
export const generateBackupCodes: RequestHandler = async (req, res) => {
  try {
    const { userId, userType = 'admin', currentPassword, twoFactorToken } = req.body;

    if (!userId || !currentPassword || !twoFactorToken) {
      return res.status(400).json({
        success: false,
        message: 'User ID, current password, and 2FA token are required'
      });
    }

    const table = userType === 'reseller' ? 'resellers' : 'admin_users';

    // Get user
    const user = await get(`
      SELECT * FROM ${table} WHERE id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid current password'
      });
    }

    // Verify 2FA token
    const verifyResult = TwoFactorService.verifyToken(user.two_factor_secret, twoFactorToken);

    if (!verifyResult.isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid two-factor authentication code'
      });
    }

    // Generate new backup codes
    const newBackupCodes = TwoFactorService.regenerateBackupCodes();

    await run(`
      UPDATE ${table} 
      SET two_factor_backup_codes = ? 
      WHERE id = ?
    `, [JSON.stringify(newBackupCodes), userId]);

    res.json({
      success: true,
      backupCodes: newBackupCodes,
      message: 'New backup codes generated'
    });

  } catch (error) {
    console.error('Backup codes generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate backup codes'
    });
  }
};

// Check 2FA status
export const check2FAStatus: RequestHandler = async (req, res) => {
  try {
    const { userId, userType = 'admin' } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const table = userType === 'reseller' ? 'resellers' : 'admin_users';

    const user = await get(`
      SELECT two_factor_enabled, two_factor_mandatory, two_factor_setup_at 
      FROM ${table} WHERE id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      twoFactorEnabled: user.two_factor_enabled || false,
      twoFactorMandatory: user.two_factor_mandatory || false,
      setupAt: user.two_factor_setup_at,
      requiresSetup: TwoFactorService.shouldEnforce2FA(
        userType as 'admin' | 'reseller',
        user.two_factor_enabled,
        user.two_factor_mandatory
      )
    });

  } catch (error) {
    console.error('2FA status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check 2FA status'
    });
  }
};
