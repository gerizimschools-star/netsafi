import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface SecurityConfig {
  otpExpirationMinutes: number;
  otpMaxAttempts: number;
  otpLength: number;
  maxLoginAttempts: number;
  accountLockoutDurationMinutes: number;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  passwordResetExpirationMinutes: number;
  forgotPasswordEnabled: boolean;
  resetPasswordAfterFailedOTPEnabled: boolean;
  auditLogRetentionDays: number;
  sessionTimeoutMinutes: number;
}

interface SecurityMetrics {
  signInMetrics: {
    total_sign_in_attempts: number;
    successful_sign_ins: number;
    failed_sign_ins: number;
    two_factor_sign_ins: number;
    unique_users_signed_in: number;
    unique_ips: number;
  };
  passwordResetMetrics: {
    total_password_resets: number;
    successful_password_resets: number;
    admin_initiated_resets: number;
    user_initiated_resets: number;
  };
  accountLockouts: number;
  otpMetrics: {
    total_otp_requests: number;
    successful_otp_verifications: number;
    expired_otps: number;
    locked_otps: number;
  };
}

interface AuditLog {
  id: string;
  user_id: string;
  user_type: string;
  action: string;
  resource: string;
  details: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export function SecurityManagement() {
  const [config, setConfig] = useState<SecurityConfig | null>(null);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch security configuration
  const fetchSecurityConfig = async () => {
    try {
      const response = await fetch('/api/auth/security-config');
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
      } else {
        setError('Failed to load security configuration');
      }
    } catch (err) {
      setError('Failed to load security configuration');
    }
  };

  // Fetch security metrics
  const fetchSecurityMetrics = async () => {
    try {
      const response = await fetch('/api/auth/security-metrics');
      const data = await response.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load security metrics:', err);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async (limit = 50) => {
    try {
      const response = await fetch(`/api/auth/audit-logs?limit=${limit}`);
      const data = await response.json();
      if (data.success) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  // Update security configuration
  const updateSecurityConfig = async (updates: Partial<SecurityConfig>) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const response = await fetch('/api/auth/security-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: userData.id,
          config: updates
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Security configuration updated successfully');
        await fetchSecurityConfig();
      } else {
        setError(data.message || 'Failed to update security configuration');
      }
    } catch (err) {
      setError('Failed to update security configuration');
    } finally {
      setIsLoading(false);
    }
  };

  // Test password validation
  const [testPassword, setTestPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<any>(null);

  const validateTestPassword = async () => {
    if (!testPassword) return;

    try {
      const response = await fetch('/api/auth/validate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: testPassword }),
      });

      const data = await response.json();
      setPasswordValidation(data);
    } catch (err) {
      console.error('Password validation failed:', err);
    }
  };

  useEffect(() => {
    fetchSecurityConfig();
    fetchSecurityMetrics();
    fetchAuditLogs();
  }, []);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading security management dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Management</h1>
          <p className="text-gray-600">Manage two-factor verification, password policies, and security settings</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="2fv-settings">2FV Settings</TabsTrigger>
          <TabsTrigger value="password-policy">Password Policy</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Sign-in Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sign-in Activity</CardTitle>
                <CardDescription>Recent authentication statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Attempts</span>
                  <Badge variant="secondary">{metrics?.signInMetrics.total_sign_in_attempts || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Successful</span>
                  <Badge variant="default">{metrics?.signInMetrics.successful_sign_ins || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Failed</span>
                  <Badge variant="destructive">{metrics?.signInMetrics.failed_sign_ins || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">2FA Used</span>
                  <Badge variant="outline">{metrics?.signInMetrics.two_factor_sign_ins || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Password Reset Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Password Resets</CardTitle>
                <CardDescription>Password management activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Resets</span>
                  <Badge variant="secondary">{metrics?.passwordResetMetrics.total_password_resets || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Successful</span>
                  <Badge variant="default">{metrics?.passwordResetMetrics.successful_password_resets || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Admin Initiated</span>
                  <Badge variant="outline">{metrics?.passwordResetMetrics.admin_initiated_resets || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">User Initiated</span>
                  <Badge variant="outline">{metrics?.passwordResetMetrics.user_initiated_resets || 0}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Security Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Status</CardTitle>
                <CardDescription>System security indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Lockouts</span>
                  <Badge variant="destructive">{metrics?.accountLockouts || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">OTP Requests</span>
                  <Badge variant="secondary">{metrics?.otpMetrics.total_otp_requests || 0}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">OTP Success Rate</span>
                  <Badge variant="default">
                    {metrics?.otpMetrics.total_otp_requests ? 
                      Math.round((metrics.otpMetrics.successful_otp_verifications / metrics.otpMetrics.total_otp_requests) * 100) : 0}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unique IPs</span>
                  <Badge variant="outline">{metrics?.signInMetrics.unique_ips || 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2FV Settings Tab */}
        <TabsContent value="2fv-settings">
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Verification Settings</CardTitle>
              <CardDescription>Configure OTP and account lockout settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OTP Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">OTP Configuration</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="otpExpiration">OTP Expiration (minutes)</Label>
                    <Input
                      id="otpExpiration"
                      type="number"
                      min="1"
                      max="60"
                      value={config.otpExpirationMinutes}
                      onChange={(e) => setConfig({...config, otpExpirationMinutes: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otpMaxAttempts">Maximum OTP Attempts</Label>
                    <Input
                      id="otpMaxAttempts"
                      type="number"
                      min="1"
                      max="10"
                      value={config.otpMaxAttempts}
                      onChange={(e) => setConfig({...config, otpMaxAttempts: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Account Lockout Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Lockout</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      min="1"
                      max="20"
                      value={config.maxLoginAttempts}
                      onChange={(e) => setConfig({...config, maxLoginAttempts: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      min="1"
                      max="1440"
                      value={config.accountLockoutDurationMinutes}
                      onChange={(e) => setConfig({...config, accountLockoutDurationMinutes: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Feature Toggles */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Feature Controls</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="forgotPassword">Forgot Password</Label>
                      <p className="text-sm text-gray-600">Allow users to reset their passwords</p>
                    </div>
                    <Switch
                      id="forgotPassword"
                      checked={config.forgotPasswordEnabled}
                      onCheckedChange={(checked) => setConfig({...config, forgotPasswordEnabled: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="resetAfterOTP">Reset Password After Failed OTP</Label>
                      <p className="text-sm text-gray-600">Show password reset after 3 failed OTP attempts</p>
                    </div>
                    <Switch
                      id="resetAfterOTP"
                      checked={config.resetPasswordAfterFailedOTPEnabled}
                      onCheckedChange={(checked) => setConfig({...config, resetPasswordAfterFailedOTPEnabled: checked})}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => updateSecurityConfig({
                  otpExpirationMinutes: config.otpExpirationMinutes,
                  otpMaxAttempts: config.otpMaxAttempts,
                  maxLoginAttempts: config.maxLoginAttempts,
                  accountLockoutDurationMinutes: config.accountLockoutDurationMinutes,
                  forgotPasswordEnabled: config.forgotPasswordEnabled,
                  resetPasswordAfterFailedOTPEnabled: config.resetPasswordAfterFailedOTPEnabled
                })}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Updating...' : 'Update 2FV Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Policy Tab */}
        <TabsContent value="password-policy">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Password Requirements</CardTitle>
                <CardDescription>Configure password complexity rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="4"
                    max="128"
                    value={config.passwordMinLength}
                    onChange={(e) => setConfig({...config, passwordMinLength: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Character Requirements</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                      <Switch
                        id="requireUppercase"
                        checked={config.passwordRequireUppercase}
                        onCheckedChange={(checked) => setConfig({...config, passwordRequireUppercase: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
                      <Switch
                        id="requireLowercase"
                        checked={config.passwordRequireLowercase}
                        onCheckedChange={(checked) => setConfig({...config, passwordRequireLowercase: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireNumbers">Require Numbers</Label>
                      <Switch
                        id="requireNumbers"
                        checked={config.passwordRequireNumbers}
                        onCheckedChange={(checked) => setConfig({...config, passwordRequireNumbers: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSymbols">Require Special Characters</Label>
                      <Switch
                        id="requireSymbols"
                        checked={config.passwordRequireSymbols}
                        onCheckedChange={(checked) => setConfig({...config, passwordRequireSymbols: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resetExpiration">Password Reset Link Expiration (minutes)</Label>
                  <Input
                    id="resetExpiration"
                    type="number"
                    min="5"
                    max="1440"
                    value={config.passwordResetExpirationMinutes}
                    onChange={(e) => setConfig({...config, passwordResetExpirationMinutes: parseInt(e.target.value)})}
                  />
                </div>

                <Button 
                  onClick={() => updateSecurityConfig({
                    passwordMinLength: config.passwordMinLength,
                    passwordRequireUppercase: config.passwordRequireUppercase,
                    passwordRequireLowercase: config.passwordRequireLowercase,
                    passwordRequireNumbers: config.passwordRequireNumbers,
                    passwordRequireSymbols: config.passwordRequireSymbols,
                    passwordResetExpirationMinutes: config.passwordResetExpirationMinutes
                  })}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Updating...' : 'Update Password Policy'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password Validator</CardTitle>
                <CardDescription>Test password against current policy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testPassword">Test Password</Label>
                  <Input
                    id="testPassword"
                    type="password"
                    placeholder="Enter password to test"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                  />
                </div>

                <Button onClick={validateTestPassword} className="w-full" variant="outline">
                  Validate Password
                </Button>

                {passwordValidation && (
                  <Alert className={passwordValidation.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertDescription className={passwordValidation.isValid ? "text-green-800" : "text-red-800"}>
                      {passwordValidation.message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Current Requirements:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Minimum {config.passwordMinLength} characters</li>
                    {config.passwordRequireUppercase && <li>• At least one uppercase letter</li>}
                    {config.passwordRequireLowercase && <li>• At least one lowercase letter</li>}
                    {config.passwordRequireNumbers && <li>• At least one number</li>}
                    {config.passwordRequireSymbols && <li>• At least one special character</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Logs</CardTitle>
              <CardDescription>Recent security events and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Timestamp</th>
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Action</th>
                        <th className="text-left p-2">Resource</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 text-xs text-gray-600">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{log.user_id}</span>
                              <Badge variant="outline" className="text-xs">{log.user_type}</Badge>
                            </div>
                          </td>
                          <td className="p-2">{log.action}</td>
                          <td className="p-2">{log.resource}</td>
                          <td className="p-2">
                            <Badge variant={log.success ? "default" : "destructive"}>
                              {log.success ? "Success" : "Failed"}
                            </Badge>
                          </td>
                          <td className="p-2 text-xs text-gray-600">{log.ip_address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {auditLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No audit logs found
                  </div>
                )}

                <Button onClick={() => fetchAuditLogs(100)} variant="outline" className="w-full">
                  Load More Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Advanced security and maintenance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="5"
                      max="1440"
                      value={config.sessionTimeoutMinutes}
                      onChange={(e) => setConfig({...config, sessionTimeoutMinutes: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auditRetention">Audit Log Retention (days)</Label>
                    <Input
                      id="auditRetention"
                      type="number"
                      min="1"
                      max="3650"
                      value={config.auditLogRetentionDays}
                      onChange={(e) => setConfig({...config, auditLogRetentionDays: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => updateSecurityConfig({
                    sessionTimeoutMinutes: config.sessionTimeoutMinutes,
                    auditLogRetentionDays: config.auditLogRetentionDays
                  })}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Updating...' : 'Update System Settings'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
                <CardDescription>Database cleanup and maintenance operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Clean up old audit logs based on the retention policy. This operation cannot be undone.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={async () => {
                    if (confirm('Are you sure you want to clean up old audit logs? This cannot be undone.')) {
                      try {
                        const response = await fetch('/api/auth/cleanup-audit-logs', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ retentionDays: config.auditLogRetentionDays })
                        });
                        const data = await response.json();
                        if (data.success) {
                          setSuccess(`Cleaned up ${data.cleanedCount} old audit log entries`);
                          fetchAuditLogs();
                        } else {
                          setError(data.message);
                        }
                      } catch (err) {
                        setError('Failed to cleanup audit logs');
                      }
                    }
                  }}
                  variant="destructive"
                  className="w-full"
                >
                  Cleanup Old Audit Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
