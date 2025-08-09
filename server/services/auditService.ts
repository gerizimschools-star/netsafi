import { run, query } from "../database-unified";

export interface AuditLogEntry {
  userId: string;
  userType: 'admin' | 'reseller' | 'customer';
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export interface SignInAttempt {
  userId?: string;
  username: string;
  userType: 'admin' | 'reseller' | 'customer';
  success: boolean;
  failureReason?: string;
  ipAddress?: string;
  userAgent?: string;
  twoFactorUsed?: boolean;
  twoFactorMethod?: 'totp' | 'email_otp' | 'sms_otp' | 'backup_code';
}

export interface PasswordResetEvent {
  userId: string;
  userType: 'admin' | 'reseller' | 'customer';
  initiatedBy: 'user' | 'admin';
  initiatorId?: string;
  method: 'email' | 'sms' | 'admin_reset';
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Log general audit events
   */
  static async logEvent(entry: AuditLogEntry): Promise<void> {
    try {
      await run(`
        INSERT INTO audit_logs (
          id, user_id, user_type, action, resource, details, 
          ip_address, user_agent, success, error_message, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        this.generateId(),
        entry.userId,
        entry.userType,
        entry.action,
        entry.resource,
        JSON.stringify(entry.details),
        entry.ipAddress,
        entry.userAgent,
        entry.success,
        entry.errorMessage
      ]);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Log sign-in attempts
   */
  static async logSignInAttempt(attempt: SignInAttempt): Promise<void> {
    try {
      await run(`
        INSERT INTO sign_in_logs (
          id, user_id, username, user_type, success, failure_reason,
          ip_address, user_agent, two_factor_used, two_factor_method,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        this.generateId(),
        attempt.userId,
        attempt.username,
        attempt.userType,
        attempt.success,
        attempt.failureReason,
        attempt.ipAddress,
        attempt.userAgent,
        attempt.twoFactorUsed,
        attempt.twoFactorMethod
      ]);

      // Also log as general audit event
      await this.logEvent({
        userId: attempt.userId || 'unknown',
        userType: attempt.userType,
        action: 'sign_in',
        resource: 'authentication',
        details: {
          username: attempt.username,
          twoFactorUsed: attempt.twoFactorUsed,
          twoFactorMethod: attempt.twoFactorMethod
        },
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent,
        success: attempt.success,
        errorMessage: attempt.failureReason
      });
    } catch (error) {
      console.error('Failed to log sign-in attempt:', error);
    }
  }

  /**
   * Log password reset events
   */
  static async logPasswordReset(event: PasswordResetEvent): Promise<void> {
    try {
      await run(`
        INSERT INTO password_reset_logs (
          id, user_id, user_type, initiated_by, initiator_id,
          method, success, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        this.generateId(),
        event.userId,
        event.userType,
        event.initiatedBy,
        event.initiatorId,
        event.method,
        event.success,
        event.ipAddress,
        event.userAgent
      ]);

      // Also log as general audit event
      await this.logEvent({
        userId: event.userId,
        userType: event.userType,
        action: 'password_reset',
        resource: 'user_management',
        details: {
          initiatedBy: event.initiatedBy,
          initiatorId: event.initiatorId,
          method: event.method
        },
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        success: event.success
      });
    } catch (error) {
      console.error('Failed to log password reset:', error);
    }
  }

  /**
   * Log account lockout events
   */
  static async logAccountLockout(
    userId: string,
    userType: 'admin' | 'reseller' | 'customer',
    reason: 'failed_login_attempts' | 'failed_2fa_attempts' | 'admin_action',
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      userType,
      action: 'account_lockout',
      resource: 'security',
      details: { reason },
      ipAddress,
      userAgent,
      success: true
    });
  }

  /**
   * Get audit logs with filtering
   */
  static async getAuditLogs(filters: {
    userId?: string;
    userType?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    let whereClause = '';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters.userId) {
      conditions.push('user_id = ?');
      params.push(filters.userId);
    }

    if (filters.userType) {
      conditions.push('user_type = ?');
      params.push(filters.userType);
    }

    if (filters.action) {
      conditions.push('action = ?');
      params.push(filters.action);
    }

    if (filters.resource) {
      conditions.push('resource = ?');
      params.push(filters.resource);
    }

    if (filters.startDate) {
      conditions.push('created_at >= ?');
      params.push(filters.startDate.toISOString());
    }

    if (filters.endDate) {
      conditions.push('created_at <= ?');
      params.push(filters.endDate.toISOString());
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    let limitClause = '';
    if (filters.limit) {
      limitClause = `LIMIT ${filters.limit}`;
      if (filters.offset) {
        limitClause += ` OFFSET ${filters.offset}`;
      }
    }

    const sql = `
      SELECT * FROM audit_logs 
      ${whereClause} 
      ORDER BY created_at DESC 
      ${limitClause}
    `;

    return await query(sql, params);
  }

  /**
   * Get sign-in statistics
   */
  static async getSignInStats(filters: {
    userId?: string;
    userType?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<any> {
    let whereClause = '';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters.userId) {
      conditions.push('user_id = ?');
      params.push(filters.userId);
    }

    if (filters.userType) {
      conditions.push('user_type = ?');
      params.push(filters.userType);
    }

    if (filters.startDate) {
      conditions.push('created_at >= ?');
      params.push(filters.startDate.toISOString());
    }

    if (filters.endDate) {
      conditions.push('created_at <= ?');
      params.push(filters.endDate.toISOString());
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const sql = `
      SELECT 
        COUNT(*) as total_attempts,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_attempts,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_attempts,
        SUM(CASE WHEN two_factor_used = 1 THEN 1 ELSE 0 END) as two_factor_logins,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM sign_in_logs 
      ${whereClause}
    `;

    const stats = await query(sql, params);
    return stats[0] || {};
  }

  /**
   * Clean up old audit logs based on retention policy
   */
  static async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Clean up audit logs
    const auditResult = await run(`
      DELETE FROM audit_logs WHERE created_at < ?
    `, [cutoffDate.toISOString()]);

    // Clean up sign-in logs
    const signInResult = await run(`
      DELETE FROM sign_in_logs WHERE created_at < ?
    `, [cutoffDate.toISOString()]);

    // Clean up password reset logs
    const passwordResult = await run(`
      DELETE FROM password_reset_logs WHERE created_at < ?
    `, [cutoffDate.toISOString()]);

    const totalCleaned = (auditResult.changes || 0) + 
                        (signInResult.changes || 0) + 
                        (passwordResult.changes || 0);

    console.log(`Cleaned up ${totalCleaned} old audit log entries`);
    return totalCleaned;
  }

  /**
   * Extract client information from request
   */
  static getClientInfo(req: any): { ipAddress?: string; userAgent?: string } {
    return {
      ipAddress: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent']
    };
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
