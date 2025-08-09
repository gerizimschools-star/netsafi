import { get, run, query } from "../database-unified";

export interface SecurityConfig {
  // OTP Settings
  otpExpirationMinutes: number;
  otpMaxAttempts: number;
  otpLength: number;
  
  // Account Lockout Settings
  maxLoginAttempts: number;
  accountLockoutDurationMinutes: number;
  
  // Password Settings
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  passwordResetExpirationMinutes: number;
  
  // Feature Toggles
  forgotPasswordEnabled: boolean;
  resetPasswordAfterFailedOTPEnabled: boolean;
  
  // Audit Settings
  auditLogRetentionDays: number;
  sessionTimeoutMinutes: number;
}

export class SecurityConfigService {
  private static readonly DEFAULT_CONFIG: SecurityConfig = {
    // OTP Settings
    otpExpirationMinutes: 5,
    otpMaxAttempts: 3,
    otpLength: 6,
    
    // Account Lockout Settings
    maxLoginAttempts: 5,
    accountLockoutDurationMinutes: 15,
    
    // Password Settings
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    passwordResetExpirationMinutes: 15,
    
    // Feature Toggles
    forgotPasswordEnabled: true,
    resetPasswordAfterFailedOTPEnabled: true,
    
    // Audit Settings
    auditLogRetentionDays: 90,
    sessionTimeoutMinutes: 60
  };

  /**
   * Get current security configuration
   */
  static async getSecurityConfig(): Promise<SecurityConfig> {
    try {
      const settings = await query(`
        SELECT key, value, data_type FROM system_settings 
        WHERE category = 'security'
      `);

      const config = { ...this.DEFAULT_CONFIG };

      // Apply stored settings
      for (const setting of settings) {
        const key = this.mapSettingKeyToConfigKey(setting.key);
        if (key && key in config) {
          config[key as keyof SecurityConfig] = this.parseSettingValue(
            setting.value, 
            setting.data_type
          );
        }
      }

      return config;
    } catch (error) {
      console.error('Error loading security config:', error);
      return this.DEFAULT_CONFIG;
    }
  }

  /**
   * Update security configuration
   */
  static async updateSecurityConfig(
    adminId: string,
    updates: Partial<SecurityConfig>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const currentConfig = await this.getSecurityConfig();
      const newConfig = { ...currentConfig, ...updates };

      // Validate configuration values
      const validation = this.validateSecurityConfig(newConfig);
      if (!validation.isValid) {
        return { success: false, message: validation.message };
      }

      // Update database settings
      for (const [key, value] of Object.entries(updates)) {
        const settingKey = this.mapConfigKeyToSettingKey(key);
        if (settingKey) {
          await run(`
            INSERT OR REPLACE INTO system_settings (key, value, data_type, category, updated_at)
            VALUES (?, ?, ?, 'security', CURRENT_TIMESTAMP)
          `, [settingKey, value.toString(), this.getDataType(value)]);
        }
      }

      // Log the configuration change
      await this.logConfigurationChange(adminId, updates);

      return { success: true, message: 'Security configuration updated successfully' };
    } catch (error) {
      console.error('Error updating security config:', error);
      return { success: false, message: 'Failed to update security configuration' };
    }
  }

  /**
   * Validate security configuration values
   */
  private static validateSecurityConfig(config: SecurityConfig): { isValid: boolean; message: string } {
    if (config.otpExpirationMinutes < 1 || config.otpExpirationMinutes > 60) {
      return { isValid: false, message: 'OTP expiration must be between 1 and 60 minutes' };
    }

    if (config.otpMaxAttempts < 1 || config.otpMaxAttempts > 10) {
      return { isValid: false, message: 'OTP max attempts must be between 1 and 10' };
    }

    if (config.maxLoginAttempts < 1 || config.maxLoginAttempts > 20) {
      return { isValid: false, message: 'Max login attempts must be between 1 and 20' };
    }

    if (config.accountLockoutDurationMinutes < 1 || config.accountLockoutDurationMinutes > 1440) {
      return { isValid: false, message: 'Account lockout duration must be between 1 and 1440 minutes (24 hours)' };
    }

    if (config.passwordMinLength < 4 || config.passwordMinLength > 128) {
      return { isValid: false, message: 'Password minimum length must be between 4 and 128 characters' };
    }

    if (config.passwordResetExpirationMinutes < 5 || config.passwordResetExpirationMinutes > 1440) {
      return { isValid: false, message: 'Password reset expiration must be between 5 and 1440 minutes (24 hours)' };
    }

    return { isValid: true, message: 'Configuration is valid' };
  }

  /**
   * Get OTP configuration for use by OTP service
   */
  static async getOTPConfig() {
    const config = await this.getSecurityConfig();
    return {
      expirationMinutes: config.otpExpirationMinutes,
      maxAttempts: config.otpMaxAttempts,
      length: config.otpLength
    };
  }

  /**
   * Get password policy for validation
   */
  static async getPasswordPolicy() {
    const config = await this.getSecurityConfig();
    return {
      minLength: config.passwordMinLength,
      requireUppercase: config.passwordRequireUppercase,
      requireLowercase: config.passwordRequireLowercase,
      requireNumbers: config.passwordRequireNumbers,
      requireSymbols: config.passwordRequireSymbols
    };
  }

  /**
   * Validate password against current policy
   */
  static async validatePassword(password: string): Promise<{ isValid: boolean; message: string }> {
    const policy = await this.getPasswordPolicy();

    if (password.length < policy.minLength) {
      return { isValid: false, message: `Password must be at least ${policy.minLength} characters long` };
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }

    if (policy.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }

    return { isValid: true, message: 'Password meets all requirements' };
  }

  // Helper methods
  private static mapSettingKeyToConfigKey(settingKey: string): string | null {
    const mapping: Record<string, string> = {
      'otp_expiration_minutes': 'otpExpirationMinutes',
      'otp_max_attempts': 'otpMaxAttempts',
      'otp_length': 'otpLength',
      'max_login_attempts': 'maxLoginAttempts',
      'account_lockout_duration_minutes': 'accountLockoutDurationMinutes',
      'password_min_length': 'passwordMinLength',
      'password_require_uppercase': 'passwordRequireUppercase',
      'password_require_lowercase': 'passwordRequireLowercase',
      'password_require_numbers': 'passwordRequireNumbers',
      'password_require_symbols': 'passwordRequireSymbols',
      'password_reset_expiration_minutes': 'passwordResetExpirationMinutes',
      'forgot_password_enabled': 'forgotPasswordEnabled',
      'reset_password_after_failed_otp_enabled': 'resetPasswordAfterFailedOTPEnabled',
      'audit_log_retention_days': 'auditLogRetentionDays',
      'session_timeout': 'sessionTimeoutMinutes'
    };
    return mapping[settingKey] || null;
  }

  private static mapConfigKeyToSettingKey(configKey: string): string | null {
    const mapping: Record<string, string> = {
      'otpExpirationMinutes': 'otp_expiration_minutes',
      'otpMaxAttempts': 'otp_max_attempts',
      'otpLength': 'otp_length',
      'maxLoginAttempts': 'max_login_attempts',
      'accountLockoutDurationMinutes': 'account_lockout_duration_minutes',
      'passwordMinLength': 'password_min_length',
      'passwordRequireUppercase': 'password_require_uppercase',
      'passwordRequireLowercase': 'password_require_lowercase',
      'passwordRequireNumbers': 'password_require_numbers',
      'passwordRequireSymbols': 'password_require_symbols',
      'passwordResetExpirationMinutes': 'password_reset_expiration_minutes',
      'forgotPasswordEnabled': 'forgot_password_enabled',
      'resetPasswordAfterFailedOTPEnabled': 'reset_password_after_failed_otp_enabled',
      'auditLogRetentionDays': 'audit_log_retention_days',
      'sessionTimeoutMinutes': 'session_timeout'
    };
    return mapping[configKey] || null;
  }

  private static parseSettingValue(value: string, dataType: string): any {
    switch (dataType) {
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'number':
        return parseInt(value, 10);
      case 'float':
        return parseFloat(value);
      default:
        return value;
    }
  }

  private static getDataType(value: any): string {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'number' : 'float';
    }
    return 'string';
  }

  private static async logConfigurationChange(adminId: string, changes: Partial<SecurityConfig>): Promise<void> {
    try {
      await run(`
        INSERT INTO audit_logs (
          id, user_id, user_type, action, resource, details, success, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        crypto.randomUUID(),
        adminId,
        'admin',
        'security_config_update',
        'system_settings',
        JSON.stringify(changes),
        true
      ]);
    } catch (error) {
      console.error('Error logging configuration change:', error);
    }
  }
}
