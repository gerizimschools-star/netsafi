import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { query, get, run } from "../database-unified";
import { TwoFactorService } from "../services/twoFactorService";
import { OTPService } from "../services/otpService";
import { PasswordService } from "../services/passwordService";
import { AuditService } from "../services/auditService";
import { SecurityConfigService } from "../services/securityConfigService";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

// Enhanced login with comprehensive 2FV
export const enhancedLogin: RequestHandler = async (req, res) => {
  const clientInfo = AuditService.getClientInfo(req);
  
  try {
    const { username, password, userType = 'admin', twoFactorToken, twoFactorMethod } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Determine table and username field
    const table = userType === 'reseller' ? 'resellers' : 
                 userType === 'customer' ? 'customer_users' : 'admin_users';
    const usernameField = userType === 'reseller' ? 'email' : 
                         userType === 'customer' ? 'username' : 'username';

    // Find user
    const user = await get(`
      SELECT * FROM ${table} WHERE ${usernameField} = ? AND status = 'active'
    `, [username]);

    if (!user) {
      await AuditService.logSignInAttempt({
        username,
        userType,
        success: false,
        failureReason: 'User not found',
        ...clientInfo
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    const securitySettings = await get(`
      SELECT * FROM user_security_settings 
      WHERE user_id = ? AND user_type = ?
    `, [user.id, userType]);

    if (securitySettings?.account_locked_until) {
      const lockUntil = new Date(securitySettings.account_locked_until);
      if (new Date() < lockUntil) {
        await AuditService.logSignInAttempt({
          userId: user.id,
          username,
          userType,
          success: false,
          failureReason: 'Account locked',
          ...clientInfo
        });

        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked. Please try again later.',
          lockedUntil: lockUntil.toISOString()
        });
      }
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      // Increment failed attempts
      await handleFailedLogin(user.id, userType, clientInfo);

      await AuditService.logSignInAttempt({
        userId: user.id,
        username,
        userType,
        success: false,
        failureReason: 'Invalid password',
        ...clientInfo
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Password is correct, now handle 2FA
    const requires2FA = user.two_factor_enabled || user.two_factor_mandatory;
    
    if (requires2FA) {
      if (!twoFactorToken) {
        // Check what 2FA methods are available
        const availableMethods = await getAvailable2FAMethods(user);
        
        return res.status(200).json({
          success: true,
          requiresTwoFactor: true,
          availableMethods,
          userId: user.id,
          message: 'Two-factor verification required'
        });
      }

      // Verify 2FA token
      const verification = await verify2FAToken(
        user.id,
        userType,
        twoFactorToken,
        twoFactorMethod || 'totp',
        user
      );

      if (!verification.success) {
        await AuditService.logSignInAttempt({
          userId: user.id,
          username,
          userType,
          success: false,
          failureReason: verification.message,
          twoFactorUsed: true,
          twoFactorMethod: twoFactorMethod || 'totp',
          ...clientInfo
        });

        return res.status(401).json({
          success: false,
          message: verification.message,
          attemptsRemaining: verification.attemptsRemaining
        });
      }
    } else if (user.two_factor_mandatory && !user.two_factor_enabled) {
      // 2FA is mandatory but not set up
      return res.status(200).json({
        success: true,
        requiresTwoFactorSetup: true,
        userId: user.id,
        message: 'Two-factor authentication setup required'
      });
    }

    // Success - reset failed attempts and update last login
    await handleSuccessfulLogin(user.id, userType);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        userType,
        role: user.role || 'reseller',
        twoFactorVerified: requires2FA
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Log successful sign-in
    await AuditService.logSignInAttempt({
      userId: user.id,
      username,
      userType,
      success: true,
      twoFactorUsed: requires2FA,
      twoFactorMethod: requires2FA ? (twoFactorMethod || 'totp') : undefined,
      ...clientInfo
    });

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
    console.error('Enhanced login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Request OTP for 2FV
export const requestOTP: RequestHandler = async (req, res) => {
  const clientInfo = AuditService.getClientInfo(req);

  try {
    const { userId, userType, method } = req.body;

    if (!userId || !userType || !method) {
      return res.status(400).json({
        success: false,
        message: 'User ID, user type, and method are required'
      });
    }

    // Get user contact information
    const table = userType === 'reseller' ? 'resellers' :
                 userType === 'customer' ? 'customer_users' : 'admin_users';

    let user;
    if (userType === 'reseller') {
      user = await get(`SELECT email, phone, contact_name as first_name FROM ${table} WHERE id = ?`, [userId]);
    } else if (userType === 'customer') {
      user = await get(`SELECT email, phone, first_name FROM ${table} WHERE id = ?`, [userId]);
    } else {
      user = await get(`SELECT email, phone, first_name FROM ${table} WHERE id = ?`, [userId]);
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has active OTP
    const hasActiveOTP = await OTPService.hasActiveOTP(userId, userType, 'login');
    if (hasActiveOTP) {
      return res.status(429).json({
        success: false,
        message: 'An OTP is already active. Please wait before requesting a new one.'
      });
    }

    // Generate OTP
    const otpResult = await OTPService.generateOTP(userId, userType, 'login');

    // Send OTP based on method
    let sent = false;
    if (method === 'email' && user.email) {
      sent = await OTPService.sendOTPEmail(
        user.email,
        otpResult.code,
        'Login verification',
        otpResult.expiresAt
      );
    } else if (method === 'sms' && (user.phone || userType === 'admin')) {
      // For admin users, SMS goes to special admin phone number
      const phoneNumber = userType === 'admin' ? '0748261019' : user.phone;
      sent = await OTPService.sendOTPSMS(
        phoneNumber,
        otpResult.code,
        'Login verification',
        otpResult.expiresAt,
        userType
      );
    }

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP via ${method}`
      });
    }

    // Log the OTP request
    await AuditService.logEvent({
      userId,
      userType,
      action: 'otp_requested',
      resource: 'authentication',
      details: { method, purpose: 'login' },
      ...clientInfo,
      success: true
    });

    res.json({
      success: true,
      message: `OTP sent via ${method}`,
      expiresAt: otpResult.expiresAt,
      otpId: otpResult.otpId
    });

  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

// Forgot password
export const forgotPassword: RequestHandler = async (req, res) => {
  const clientInfo = AuditService.getClientInfo(req);

  try {
    const { username, userType = 'admin', method = 'email' } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username or email is required'
      });
    }

    // Find user
    const table = userType === 'reseller' ? 'resellers' : 
                 userType === 'customer' ? 'customer_users' : 'admin_users';
    const usernameField = userType === 'reseller' ? 'email' : 'username';

    const user = await get(`
      SELECT id, email, phone FROM ${table} 
      WHERE ${usernameField} = ? AND status = 'active'
    `, [username]);

    // Always return success to prevent user enumeration
    const successMessage = `If an account exists, a password reset ${method === 'email' ? 'email' : 'SMS'} has been sent.`;

    if (!user) {
      // Log failed attempt but don't reveal user doesn't exist
      await AuditService.logPasswordReset({
        userId: 'unknown',
        userType,
        initiatedBy: 'user',
        method,
        success: false,
        ...clientInfo
      });

      return res.json({
        success: true,
        message: successMessage
      });
    }

    // Initiate password reset
    const resetResult = await PasswordService.initiatePasswordReset({
      userId: user.id,
      userType,
      method,
      initiatedBy: 'user',
      ...clientInfo
    });

    res.json({
      success: true,
      message: successMessage
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
};

// Reset password with token
export const resetPassword: RequestHandler = async (req, res) => {
  const clientInfo = AuditService.getClientInfo(req);

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    const result = await PasswordService.resetPasswordWithToken(
      token,
      newPassword,
      clientInfo.ipAddress,
      clientInfo.userAgent
    );

    res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// Admin reset user password
export const adminResetUserPassword: RequestHandler = async (req, res) => {
  const clientInfo = AuditService.getClientInfo(req);

  try {
    const { adminId, targetUserId, targetUserType, newPassword, generateTemporary } = req.body;

    if (!adminId || !targetUserId || !targetUserType) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID, target user ID, and target user type are required'
      });
    }

    const result = await PasswordService.adminResetPassword(
      adminId,
      targetUserId,
      targetUserType,
      newPassword,
      generateTemporary,
      clientInfo.ipAddress,
      clientInfo.userAgent
    );

    res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// Toggle forgot password for user
export const toggleForgotPassword: RequestHandler = async (req, res) => {
  const clientInfo = AuditService.getClientInfo(req);

  try {
    const { adminId, targetUserId, targetUserType, enabled } = req.body;

    const result = await PasswordService.toggleForgotPassword(
      adminId,
      targetUserId,
      targetUserType,
      enabled,
      clientInfo.ipAddress,
      clientInfo.userAgent
    );

    res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    console.error('Toggle forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update forgot password setting'
    });
  }
};

// Get audit logs
export const getAuditLogs: RequestHandler = async (req, res) => {
  try {
    const {
      userId,
      userType,
      action,
      resource,
      startDate,
      endDate,
      limit = '50',
      offset = '0'
    } = req.query;

    const filters: any = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };

    if (userId) filters.userId = userId;
    if (userType) filters.userType = userType;
    if (action) filters.action = action;
    if (resource) filters.resource = resource;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const logs = await AuditService.getAuditLogs(filters);

    res.json({
      success: true,
      logs,
      pagination: {
        limit: filters.limit,
        offset: filters.offset
      }
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs'
    });
  }
};

// Get sign-in statistics
export const getSignInStats: RequestHandler = async (req, res) => {
  try {
    const { userId, userType, startDate, endDate } = req.query;

    const filters: any = {};
    if (userId) filters.userId = userId;
    if (userType) filters.userType = userType;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const stats = await AuditService.getSignInStats(filters);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get sign-in stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sign-in statistics'
    });
  }
};

// Get security configuration
export const getSecurityConfig: RequestHandler = async (req, res) => {
  try {
    const config = await SecurityConfigService.getSecurityConfig();

    res.json({
      success: true,
      config
    });

  } catch (error) {
    console.error('Get security config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve security configuration'
    });
  }
};

// Update security configuration
export const updateSecurityConfig: RequestHandler = async (req, res) => {
  try {
    const { adminId, config } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    const result = await SecurityConfigService.updateSecurityConfig(adminId, config);

    res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    console.error('Update security config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update security configuration'
    });
  }
};

// Validate password against current policy
export const validatePassword: RequestHandler = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const result = await SecurityConfigService.validatePassword(password);

    res.json({
      success: result.isValid,
      message: result.message,
      isValid: result.isValid
    });

  } catch (error) {
    console.error('Password validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate password'
    });
  }
};

// Helper functions
async function handleFailedLogin(
  userId: string,
  userType: string,
  clientInfo: { ipAddress?: string; userAgent?: string }
): Promise<void> {
  // Get current security configuration
  const securityConfig = await SecurityConfigService.getSecurityConfig();

  // Get or create security settings
  let securitySettings = await get(`
    SELECT * FROM user_security_settings
    WHERE user_id = ? AND user_type = ?
  `, [userId, userType]);

  const maxAttempts = securityConfig.maxLoginAttempts;
  const lockDuration = securityConfig.accountLockoutDurationMinutes;

  if (!securitySettings) {
    await run(`
      INSERT INTO user_security_settings (
        id, user_id, user_type, login_attempts, last_failed_login
      ) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
    `, [crypto.randomUUID(), userId, userType]);
    return;
  }

  const newAttempts = securitySettings.login_attempts + 1;
  let lockUntil = null;

  if (newAttempts >= maxAttempts) {
    lockUntil = new Date(Date.now() + lockDuration * 60 * 1000);
    
    // Log account lockout
    await AuditService.logAccountLockout(
      userId,
      userType,
      'failed_login_attempts',
      clientInfo.ipAddress,
      clientInfo.userAgent
    );
  }

  await run(`
    UPDATE user_security_settings 
    SET login_attempts = ?, last_failed_login = CURRENT_TIMESTAMP,
        account_locked_until = ?
    WHERE user_id = ? AND user_type = ?
  `, [newAttempts, lockUntil?.toISOString(), userId, userType]);
}

async function handleSuccessfulLogin(userId: string, userType: string): Promise<void> {
  const table = userType === 'reseller' ? 'resellers' : 
               userType === 'customer' ? 'customer_users' : 'admin_users';

  // Update last login
  await run(`
    UPDATE ${table} 
    SET last_login = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [userId]);

  // Reset failed attempts
  await run(`
    UPDATE user_security_settings 
    SET login_attempts = 0, last_failed_login = NULL, account_locked_until = NULL
    WHERE user_id = ? AND user_type = ?
  `, [userId, userType]);
}

async function getAvailable2FAMethods(user: any): Promise<string[]> {
  const methods = [];
  
  if (user.two_factor_enabled && user.two_factor_secret) {
    methods.push('totp');
  }
  
  if (user.email) {
    methods.push('email_otp');
  }
  
  if (user.phone) {
    methods.push('sms_otp');
  }
  
  if (user.two_factor_backup_codes) {
    methods.push('backup_code');
  }
  
  return methods;
}

async function verify2FAToken(
  userId: string,
  userType: string,
  token: string,
  method: string,
  user: any
): Promise<{ success: boolean; message: string; attemptsRemaining?: number }> {
  
  if (method === 'totp' || method === 'backup_code') {
    // Use existing TOTP/backup code verification
    const backupCodes = user.two_factor_backup_codes ? 
      JSON.parse(user.two_factor_backup_codes) : [];
    
    const verifyResult = TwoFactorService.verifyToken(
      user.two_factor_secret,
      token,
      backupCodes
    );

    if (verifyResult.isValid && verifyResult.usedBackupCode) {
      // Remove used backup code
      const updatedCodes = TwoFactorService.removeUsedBackupCode(backupCodes, token);
      const table = userType === 'reseller' ? 'resellers' : 'admin_users';
      await run(`
        UPDATE ${table} 
        SET two_factor_backup_codes = ? 
        WHERE id = ?
      `, [JSON.stringify(updatedCodes), user.id]);
    }

    return {
      success: verifyResult.isValid,
      message: verifyResult.isValid ? 'Verification successful' : 'Invalid verification code'
    };
    
  } else if (method === 'email_otp' || method === 'sms_otp') {
    // Use OTP service for email/SMS verification
    const verifyResult = await OTPService.verifyOTP(userId, userType, 'login', token);
    
    return {
      success: verifyResult.isValid,
      message: verifyResult.isExpired ? 'OTP has expired' :
               verifyResult.isLocked ? 'Too many failed attempts' :
               verifyResult.isValid ? 'Verification successful' : 'Invalid OTP',
      attemptsRemaining: verifyResult.attemptsRemaining
    };
  }

  return {
    success: false,
    message: 'Unsupported verification method'
  };
}
