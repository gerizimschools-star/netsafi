import crypto from 'crypto';
import { query, run, get } from "../database-unified";

export interface OTPConfig {
  expirationMinutes: number;
  maxAttempts: number;
  length: number;
}

export interface OTPResult {
  otpId: string;
  code: string;
  expiresAt: Date;
}

export interface OTPVerifyResult {
  isValid: boolean;
  attemptsRemaining: number;
  isExpired: boolean;
  isLocked: boolean;
}

export class OTPService {
  private static readonly DEFAULT_CONFIG: OTPConfig = {
    expirationMinutes: 5,
    maxAttempts: 3,
    length: 6
  };

  /**
   * Generate and store OTP for user
   */
  static async generateOTP(
    userId: string, 
    userType: 'admin' | 'reseller' | 'customer',
    purpose: 'login' | 'password_reset' | 'account_verification',
    config: Partial<OTPConfig> = {}
  ): Promise<OTPResult> {
    const otpConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Generate OTP code
    const code = this.generateNumericOTP(otpConfig.length);
    const otpId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + otpConfig.expirationMinutes * 60 * 1000);

    // Invalidate any existing OTPs for this user and purpose
    await run(`
      UPDATE otp_codes 
      SET status = 'expired' 
      WHERE user_id = ? AND user_type = ? AND purpose = ? AND status = 'active'
    `, [userId, userType, purpose]);

    // Store new OTP
    await run(`
      INSERT INTO otp_codes (
        id, user_id, user_type, purpose, code_hash, expires_at, 
        max_attempts, attempts_used, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      otpId,
      userId,
      userType,
      purpose,
      await this.hashOTP(code),
      expiresAt.toISOString(),
      otpConfig.maxAttempts,
      0,
      'active'
    ]);

    return {
      otpId,
      code,
      expiresAt
    };
  }

  /**
   * Verify OTP code
   */
  static async verifyOTP(
    userId: string,
    userType: 'admin' | 'reseller' | 'customer',
    purpose: 'login' | 'password_reset' | 'account_verification',
    code: string
  ): Promise<OTPVerifyResult> {
    // Get active OTP for user
    const otpRecord = await get(`
      SELECT * FROM otp_codes 
      WHERE user_id = ? AND user_type = ? AND purpose = ? AND status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1
    `, [userId, userType, purpose]);

    if (!otpRecord) {
      return {
        isValid: false,
        attemptsRemaining: 0,
        isExpired: true,
        isLocked: false
      };
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);
    if (now > expiresAt) {
      await run(`
        UPDATE otp_codes SET status = 'expired' WHERE id = ?
      `, [otpRecord.id]);
      
      return {
        isValid: false,
        attemptsRemaining: 0,
        isExpired: true,
        isLocked: false
      };
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts_used >= otpRecord.max_attempts) {
      await run(`
        UPDATE otp_codes SET status = 'locked' WHERE id = ?
      `, [otpRecord.id]);
      
      return {
        isValid: false,
        attemptsRemaining: 0,
        isExpired: false,
        isLocked: true
      };
    }

    // Increment attempt count
    const newAttempts = otpRecord.attempts_used + 1;
    await run(`
      UPDATE otp_codes SET attempts_used = ? WHERE id = ?
    `, [newAttempts, otpRecord.id]);

    // Verify OTP code
    const isValidCode = await this.verifyOTPHash(code, otpRecord.code_hash);
    
    if (isValidCode) {
      // Mark as used
      await run(`
        UPDATE otp_codes SET status = 'used', used_at = CURRENT_TIMESTAMP WHERE id = ?
      `, [otpRecord.id]);
      
      return {
        isValid: true,
        attemptsRemaining: otpRecord.max_attempts - newAttempts,
        isExpired: false,
        isLocked: false
      };
    }

    const remainingAttempts = otpRecord.max_attempts - newAttempts;
    const isLocked = remainingAttempts <= 0;

    if (isLocked) {
      await run(`
        UPDATE otp_codes SET status = 'locked' WHERE id = ?
      `, [otpRecord.id]);
    }

    return {
      isValid: false,
      attemptsRemaining: remainingAttempts,
      isExpired: false,
      isLocked
    };
  }

  /**
   * Check if user has active OTP
   */
  static async hasActiveOTP(
    userId: string,
    userType: 'admin' | 'reseller' | 'customer',
    purpose: 'login' | 'password_reset' | 'account_verification'
  ): Promise<boolean> {
    const otpRecord = await get(`
      SELECT id FROM otp_codes 
      WHERE user_id = ? AND user_type = ? AND purpose = ? 
      AND status = 'active' AND expires_at > CURRENT_TIMESTAMP
    `, [userId, userType, purpose]);

    return !!otpRecord;
  }

  /**
   * Clean up expired OTPs
   */
  static async cleanupExpiredOTPs(): Promise<number> {
    const result = await run(`
      UPDATE otp_codes 
      SET status = 'expired' 
      WHERE status = 'active' AND expires_at <= CURRENT_TIMESTAMP
    `);
    
    return result.changes || 0;
  }

  /**
   * Get OTP statistics for monitoring
   */
  static async getOTPStats(userId?: string): Promise<any> {
    let query = `
      SELECT 
        purpose,
        status,
        COUNT(*) as count,
        AVG(attempts_used) as avg_attempts
      FROM otp_codes 
    `;
    
    const params: any[] = [];
    if (userId) {
      query += ` WHERE user_id = ?`;
      params.push(userId);
    }
    
    query += ` GROUP BY purpose, status ORDER BY purpose, status`;
    
    return await query(query, params);
  }

  // Private methods
  private static generateNumericOTP(length: number): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  private static async hashOTP(code: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(code, 10);
  }

  private static async verifyOTPHash(code: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(code, hash);
  }

  /**
   * Send OTP via email (placeholder - integrate with email service)
   */
  static async sendOTPEmail(
    email: string, 
    code: string, 
    purpose: string,
    expiresAt: Date
  ): Promise<boolean> {
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    console.log(`[EMAIL OTP] To: ${email}, Code: ${code}, Purpose: ${purpose}, Expires: ${expiresAt}`);
    
    // Simulate email sending
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 100);
    });
  }

  /**
   * Send OTP via SMS (placeholder - integrate with SMS service)
   */
  static async sendOTPSMS(
    phone: string, 
    code: string, 
    purpose: string,
    expiresAt: Date
  ): Promise<boolean> {
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`[SMS OTP] To: ${phone}, Code: ${code}, Purpose: ${purpose}, Expires: ${expiresAt}`);
    
    // Simulate SMS sending
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 100);
    });
  }
}
