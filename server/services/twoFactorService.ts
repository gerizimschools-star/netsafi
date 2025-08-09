import * as speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyResult {
  isValid: boolean;
  usedBackupCode?: boolean;
}

export class TwoFactorService {
  private static readonly SERVICE_NAME = 'NetSafi ISP';
  private static readonly BACKUP_CODES_COUNT = 10;

  /**
   * Generate a new 2FA secret and QR code for setup
   */
  static async generateSecret(userEmail: string, userName: string): Promise<TwoFactorSetup> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${userName} (${userEmail})`,
      issuer: this.SERVICE_NAME,
      length: 32
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32,
      qrCodeUrl,
      manualEntryKey: secret.base32,
      backupCodes
    };
  }

  /**
   * Verify a TOTP token or backup code
   */
  static verifyToken(
    secret: string, 
    token: string, 
    backupCodes: string[] = []
  ): TwoFactorVerifyResult {
    // First try TOTP verification
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow for slight time drift
    });

    if (verified) {
      return { isValid: true };
    }

    // If TOTP fails, check backup codes
    const normalizedToken = token.replace(/\s/g, '').toUpperCase();
    const isBackupCodeValid = backupCodes.some(code => 
      code.replace(/\s/g, '').toUpperCase() === normalizedToken
    );

    return {
      isValid: isBackupCodeValid,
      usedBackupCode: isBackupCodeValid
    };
  }

  /**
   * Generate backup codes for emergency access
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      // Format as XXXX-XXXX
      const formattedCode = `${code.slice(0, 4)}-${code.slice(4, 8)}`;
      codes.push(formattedCode);
    }
    
    return codes;
  }

  /**
   * Remove a used backup code from the list
   */
  static removeUsedBackupCode(backupCodes: string[], usedCode: string): string[] {
    const normalizedUsedCode = usedCode.replace(/\s/g, '').toUpperCase();
    return backupCodes.filter(code => 
      code.replace(/\s/g, '').toUpperCase() !== normalizedUsedCode
    );
  }

  /**
   * Generate new backup codes (for when user requests new ones)
   */
  static regenerateBackupCodes(): string[] {
    return this.generateBackupCodes();
  }

  /**
   * Check if 2FA is properly configured
   */
  static is2FAConfigured(secret?: string, backupCodes?: string[]): boolean {
    return !!(secret && backupCodes && backupCodes.length > 0);
  }

  /**
   * Create a temporary 2FA bypass token (for emergency access)
   */
  static generateBypassToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate the format of a 2FA token
   */
  static isValidTokenFormat(token: string): boolean {
    // TOTP tokens are 6 digits
    if (/^\d{6}$/.test(token)) {
      return true;
    }

    // Backup codes are XXXX-XXXX format
    if (/^[A-F0-9]{4}-[A-F0-9]{4}$/i.test(token.replace(/\s/g, ''))) {
      return true;
    }

    return false;
  }

  /**
   * Get current TOTP token (for testing purposes)
   */
  static getCurrentToken(secret: string): string {
    return speakeasy.totp({
      secret,
      encoding: 'base32'
    });
  }

  /**
   * Check if user should be forced to set up 2FA
   */
  static shouldEnforce2FA(
    userType: 'admin' | 'reseller',
    twoFactorEnabled: boolean,
    twoFactorMandatory: boolean = true
  ): boolean {
    // For admin and reseller accounts, 2FA is mandatory
    if ((userType === 'admin' || userType === 'reseller') && twoFactorMandatory) {
      return !twoFactorEnabled;
    }
    
    return false;
  }
}
