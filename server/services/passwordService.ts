import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, run, get } from "../database-unified";
import { OTPService } from './otpService';
import { AuditService } from './auditService';
import { SecurityConfigService } from './securityConfigService';

export interface PasswordComplexityRules {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
}

export interface PasswordResetRequest {
  userId: string;
  userType: 'admin' | 'reseller' | 'customer';
  method: 'email' | 'sms';
  initiatedBy: 'user' | 'admin';
  initiatorId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PasswordResetResult {
  success: boolean;
  message: string;
  tokenId?: string;
  expiresAt?: Date;
}

export class PasswordService {
  private static readonly DEFAULT_COMPLEXITY: PasswordComplexityRules = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true
  };

  /**
   * Validate password against complexity rules
   */
  static async validatePassword(password: string, customRules?: Partial<PasswordComplexityRules>): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    // Use SecurityConfigService for password validation
    const result = await SecurityConfigService.validatePassword(password);
    return {
      isValid: result.isValid,
      errors: result.isValid ? [] : [result.message]
    };
  }

  /**
   * Hash password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Initiate password reset process
   */
  static async initiatePasswordReset(request: PasswordResetRequest): Promise<PasswordResetResult> {
    try {
      // Get user information
      const table = request.userType === 'admin' ? 'admin_users' : 
                   request.userType === 'reseller' ? 'resellers' : 'customer_users';
      
      const user = await get(`SELECT * FROM ${table} WHERE id = ?`, [request.userId]);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Check if forgot password is enabled for this user
      const securitySettings = await get(`
        SELECT forgot_password_enabled FROM user_security_settings 
        WHERE user_id = ? AND user_type = ?
      `, [request.userId, request.userType]);

      if (securitySettings && !securitySettings.forgot_password_enabled) {
        await AuditService.logPasswordReset({
          userId: request.userId,
          userType: request.userType,
          initiatedBy: request.initiatedBy,
          initiatorId: request.initiatorId,
          method: request.method,
          success: false,
          ipAddress: request.ipAddress,
          userAgent: request.userAgent
        });

        return {
          success: false,
          message: 'Password reset is disabled for this account'
        };
      }

      // Generate reset token
      const tokenId = crypto.randomUUID();
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = await bcrypt.hash(resetToken, 10);
      
      // Get expiration time from settings
      const expirationMinutes = await this.getPasswordResetExpiration();
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      // Invalidate existing tokens
      await run(`
        UPDATE password_reset_tokens 
        SET used = TRUE 
        WHERE user_id = ? AND user_type = ? AND used = FALSE
      `, [request.userId, request.userType]);

      // Store new token
      await run(`
        INSERT INTO password_reset_tokens (
          id, user_id, user_type, token_hash, expires_at, created_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [tokenId, request.userId, request.userType, tokenHash, expiresAt.toISOString()]);

      // Send reset notification based on method
      let notificationSent = false;
      if (request.method === 'email' && user.email) {
        notificationSent = await this.sendPasswordResetEmail(
          user.email, 
          resetToken, 
          user.first_name || user.contact_name || user.username,
          expiresAt
        );
      } else if (request.method === 'sms' && user.phone) {
        notificationSent = await this.sendPasswordResetSMS(
          user.phone, 
          resetToken, 
          expiresAt
        );
      }

      // Log the attempt
      await AuditService.logPasswordReset({
        userId: request.userId,
        userType: request.userType,
        initiatedBy: request.initiatedBy,
        initiatorId: request.initiatorId,
        method: request.method,
        success: notificationSent,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent
      });

      return {
        success: notificationSent,
        message: notificationSent 
          ? `Password reset ${request.method === 'email' ? 'email' : 'SMS'} sent successfully`
          : `Failed to send password reset ${request.method === 'email' ? 'email' : 'SMS'}`,
        tokenId: notificationSent ? tokenId : undefined,
        expiresAt: notificationSent ? expiresAt : undefined
      };

    } catch (error) {
      console.error('Password reset initiation error:', error);
      return {
        success: false,
        message: 'Failed to initiate password reset'
      };
    }
  }

  /**
   * Verify reset token
   */
  static async verifyResetToken(token: string): Promise<{
    isValid: boolean;
    tokenRecord?: any;
    message: string;
  }> {
    try {
      // Get all active reset tokens
      const tokens = await query(`
        SELECT * FROM password_reset_tokens 
        WHERE used = FALSE AND expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC
      `);

      // Check each token (since we hash them)
      for (const tokenRecord of tokens) {
        const isMatch = await bcrypt.compare(token, tokenRecord.token_hash);
        if (isMatch) {
          return {
            isValid: true,
            tokenRecord,
            message: 'Valid reset token'
          };
        }
      }

      return {
        isValid: false,
        message: 'Invalid or expired reset token'
      };

    } catch (error) {
      console.error('Token verification error:', error);
      return {
        isValid: false,
        message: 'Token verification failed'
      };
    }
  }

  /**
   * Reset password with token
   */
  static async resetPasswordWithToken(
    token: string, 
    newPassword: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify token
      const tokenResult = await this.verifyResetToken(token);
      if (!tokenResult.isValid || !tokenResult.tokenRecord) {
        return {
          success: false,
          message: tokenResult.message
        };
      }

      const tokenRecord = tokenResult.tokenRecord;

      // Validate new password
      const passwordValidation = await this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.errors.join(', ')
        };
      }

      // Hash new password
      const passwordHash = await this.hashPassword(newPassword);

      // Update password
      const table = tokenRecord.user_type === 'admin' ? 'admin_users' : 
                   tokenRecord.user_type === 'reseller' ? 'resellers' : 'customer_users';

      await run(`
        UPDATE ${table} 
        SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [passwordHash, tokenRecord.user_id]);

      // Mark token as used
      await run(`
        UPDATE password_reset_tokens 
        SET used = TRUE, used_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [tokenRecord.id]);

      // Reset failed login attempts
      await this.resetFailedLoginAttempts(tokenRecord.user_id, tokenRecord.user_type);

      // Log the password reset
      await AuditService.logPasswordReset({
        userId: tokenRecord.user_id,
        userType: tokenRecord.user_type,
        initiatedBy: 'user',
        method: 'email', // Assuming email for token-based reset
        success: true,
        ipAddress,
        userAgent
      });

      return {
        success: true,
        message: 'Password reset successfully'
      };

    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Failed to reset password'
      };
    }
  }

  /**
   * Admin reset user password
   */
  static async adminResetPassword(
    adminId: string,
    targetUserId: string,
    targetUserType: 'reseller' | 'customer',
    newPassword?: string,
    generateTemporary: boolean = false,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; message: string; temporaryPassword?: string }> {
    try {
      // Validate admin permissions
      const admin = await get(`SELECT role FROM admin_users WHERE id = ?`, [adminId]);
      if (!admin || !['super_admin', 'admin'].includes(admin.role)) {
        return {
          success: false,
          message: 'Insufficient permissions'
        };
      }

      let passwordToSet = newPassword;
      
      if (generateTemporary || !newPassword) {
        // Generate temporary password
        passwordToSet = this.generateTemporaryPassword();
      }

      // Validate password
      const passwordValidation = await this.validatePassword(passwordToSet!);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.errors.join(', ')
        };
      }

      // Hash password
      const passwordHash = await this.hashPassword(passwordToSet!);

      // Update password
      const table = targetUserType === 'reseller' ? 'resellers' : 'customer_users';
      await run(`
        UPDATE ${table} 
        SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [passwordHash, targetUserId]);

      // Reset failed login attempts
      await this.resetFailedLoginAttempts(targetUserId, targetUserType);

      // Log the admin action
      await AuditService.logPasswordReset({
        userId: targetUserId,
        userType: targetUserType,
        initiatedBy: 'admin',
        initiatorId: adminId,
        method: 'admin_reset',
        success: true,
        ipAddress,
        userAgent
      });

      return {
        success: true,
        message: 'Password reset successfully',
        temporaryPassword: generateTemporary || !newPassword ? passwordToSet : undefined
      };

    } catch (error) {
      console.error('Admin password reset error:', error);
      return {
        success: false,
        message: 'Failed to reset password'
      };
    }
  }

  /**
   * Toggle forgot password feature for user
   */
  static async toggleForgotPassword(
    adminId: string,
    targetUserId: string,
    targetUserType: 'admin' | 'reseller' | 'customer',
    enabled: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate admin permissions
      const admin = await get(`SELECT role FROM admin_users WHERE id = ?`, [adminId]);
      if (!admin || !['super_admin', 'admin'].includes(admin.role)) {
        return {
          success: false,
          message: 'Insufficient permissions'
        };
      }

      // Update or insert security settings
      await run(`
        INSERT OR REPLACE INTO user_security_settings (
          id, user_id, user_type, forgot_password_enabled, updated_at
        ) VALUES (
          COALESCE(
            (SELECT id FROM user_security_settings WHERE user_id = ? AND user_type = ?),
            ?
          ),
          ?, ?, ?, CURRENT_TIMESTAMP
        )
      `, [
        targetUserId, targetUserType,
        crypto.randomUUID(),
        targetUserId, targetUserType, enabled
      ]);

      // Log the action
      await AuditService.logEvent({
        userId: adminId,
        userType: 'admin',
        action: 'toggle_forgot_password',
        resource: 'user_security',
        details: {
          targetUserId,
          targetUserType,
          enabled
        },
        ipAddress,
        userAgent,
        success: true
      });

      return {
        success: true,
        message: `Forgot password ${enabled ? 'enabled' : 'disabled'} for user`
      };

    } catch (error) {
      console.error('Toggle forgot password error:', error);
      return {
        success: false,
        message: 'Failed to update forgot password setting'
      };
    }
  }

  // Private helper methods
  private static async getPasswordComplexityRules(customRules?: Partial<PasswordComplexityRules>): Promise<PasswordComplexityRules> {
    try {
      const settings = await query(`
        SELECT key, value FROM system_settings 
        WHERE key IN ('password_min_length', 'password_require_uppercase', 
                     'password_require_lowercase', 'password_require_numbers', 
                     'password_require_symbols')
      `);

      const rules = { ...this.DEFAULT_COMPLEXITY };
      
      for (const setting of settings) {
        switch (setting.key) {
          case 'password_min_length':
            rules.minLength = parseInt(setting.value) || rules.minLength;
            break;
          case 'password_require_uppercase':
            rules.requireUppercase = setting.value === 'true';
            break;
          case 'password_require_lowercase':
            rules.requireLowercase = setting.value === 'true';
            break;
          case 'password_require_numbers':
            rules.requireNumbers = setting.value === 'true';
            break;
          case 'password_require_symbols':
            rules.requireSymbols = setting.value === 'true';
            break;
        }
      }

      return { ...rules, ...customRules };
    } catch (error) {
      console.error('Error getting password complexity rules:', error);
      return { ...this.DEFAULT_COMPLEXITY, ...customRules };
    }
  }

  private static async getPasswordResetExpiration(): Promise<number> {
    try {
      const setting = await get(`
        SELECT value FROM system_settings 
        WHERE key = 'password_reset_expiration_minutes'
      `);
      return parseInt(setting?.value) || 15;
    } catch (error) {
      return 15;
    }
  }

  private static generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each required category
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Symbol
    
    // Fill remaining positions
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  private static async sendPasswordResetEmail(
    email: string, 
    token: string, 
    name: string,
    expiresAt: Date
  ): Promise<boolean> {
    // TODO: Integrate with email service
    console.log(`[PASSWORD RESET EMAIL] To: ${email}, Token: ${token}, Name: ${name}, Expires: ${expiresAt}`);
    
    // Simulate email sending
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 100);
    });
  }

  private static async sendPasswordResetSMS(
    phone: string, 
    token: string,
    expiresAt: Date
  ): Promise<boolean> {
    // TODO: Integrate with SMS service
    console.log(`[PASSWORD RESET SMS] To: ${phone}, Token: ${token}, Expires: ${expiresAt}`);
    
    // Simulate SMS sending
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 100);
    });
  }

  private static async resetFailedLoginAttempts(userId: string, userType: string): Promise<void> {
    await run(`
      UPDATE user_security_settings 
      SET login_attempts = 0, last_failed_login = NULL, account_locked_until = NULL
      WHERE user_id = ? AND user_type = ?
    `, [userId, userType]);
  }
}
