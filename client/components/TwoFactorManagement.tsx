import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Key, 
  Download,
  RefreshCw,
  X,
  CheckCircle,
  AlertTriangle,
  Smartphone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorManagementProps {
  userId: string;
  userType: 'admin' | 'reseller';
}

interface TwoFactorStatus {
  twoFactorEnabled: boolean;
  twoFactorMandatory: boolean;
  setupAt?: string;
  requiresSetup: boolean;
}

export default function TwoFactorManagement({ userId, userType }: TwoFactorManagementProps) {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [showBackupCodesForm, setShowBackupCodesForm] = useState(false);
  const [disableForm, setDisableForm] = useState({
    currentPassword: '',
    twoFactorToken: ''
  });
  const [backupCodesForm, setBackupCodesForm] = useState({
    currentPassword: '',
    twoFactorToken: ''
  });
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTwoFactorStatus();
  }, [userId, userType]);

  const fetchTwoFactorStatus = async () => {
    try {
      const response = await fetch(`/api/auth/2fa-status?userId=${userId}&userType=${userType}`);
      const data = await response.json();
      
      if (data.success) {
        setStatus(data);
      } else {
        setError(data.message || 'Failed to fetch 2FA status');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  const handleDisable2FA = async () => {
    if (!disableForm.currentPassword || !disableForm.twoFactorToken) {
      setError('Both current password and 2FA token are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/disable-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userType,
          currentPassword: disableForm.currentPassword,
          twoFactorToken: disableForm.twoFactorToken
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled.",
        });
        setShowDisableForm(false);
        setDisableForm({ currentPassword: '', twoFactorToken: '' });
        fetchTwoFactorStatus();
      } else {
        setError(data.message || 'Failed to disable 2FA');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    if (!backupCodesForm.currentPassword || !backupCodesForm.twoFactorToken) {
      setError('Both current password and 2FA token are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/generate-backup-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userType,
          currentPassword: backupCodesForm.currentPassword,
          twoFactorToken: backupCodesForm.twoFactorToken
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewBackupCodes(data.backupCodes);
        toast({
          title: "Backup Codes Generated",
          description: "New backup codes have been generated successfully.",
        });
        setBackupCodesForm({ currentPassword: '', twoFactorToken: '' });
      } else {
        setError(data.message || 'Failed to generate backup codes');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `NetSafi ISP Billing - Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleDateString()}

IMPORTANT: Store these codes in a safe place. Each code can only be used once.

${newBackupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Instructions:
- Use these codes if you lose access to your authenticator app
- Each code can only be used once
- Generate new codes if you use more than half of them
- Keep these codes secure and separate from your authenticator device
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netsafi-2fa-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!status) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading 2FA status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Two-Factor Authentication</span>
        </CardTitle>
        <CardDescription>
          Manage your account's two-factor authentication settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {status.twoFactorEnabled ? (
              <ShieldCheck className="h-8 w-8 text-green-600" />
            ) : (
              <ShieldAlert className="h-8 w-8 text-amber-600" />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {status.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
                {status.twoFactorMandatory && (
                  <Badge variant="secondary" className="text-xs">
                    Mandatory
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {status.twoFactorEnabled
                  ? `Activated on ${status.setupAt ? new Date(status.setupAt).toLocaleDateString() : 'Unknown date'}`
                  : 'Two-factor authentication is not enabled'
                }
              </p>
            </div>
          </div>
          {status.twoFactorEnabled && (
            <CheckCircle className="h-6 w-6 text-green-600" />
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {!status.twoFactorEnabled ? (
            <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium mb-2">Set Up Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mb-4">
                {status.twoFactorMandatory 
                  ? 'Two-factor authentication is required for your account type.'
                  : 'Add an extra layer of security to your account.'
                }
              </p>
              <Button className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Set Up 2FA
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Generate New Backup Codes */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>Backup Codes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600 mb-3">
                    Generate new backup codes for emergency access
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBackupCodesForm(true)}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate New Codes
                  </Button>
                </CardContent>
              </Card>

              {/* Disable 2FA */}
              {!status.twoFactorMandatory && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <X className="h-4 w-4" />
                      <span>Disable 2FA</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 mb-3">
                      Remove two-factor authentication from your account
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDisableForm(true)}
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Disable 2FA
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Disable 2FA Form */}
        {showDisableForm && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium text-red-600">Disable Two-Factor Authentication</h4>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Disabling 2FA will make your account less secure. You'll need to provide your current password and a 2FA code.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="disable-password">Current Password</Label>
                  <Input
                    id="disable-password"
                    type="password"
                    value={disableForm.currentPassword}
                    onChange={(e) => setDisableForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disable-2fa">2FA Code</Label>
                  <Input
                    id="disable-2fa"
                    type="text"
                    maxLength={6}
                    value={disableForm.twoFactorToken}
                    onChange={(e) => setDisableForm(prev => ({ ...prev, twoFactorToken: e.target.value.replace(/\D/g, '') }))}
                    placeholder="000000"
                    className="text-center font-mono"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDisableForm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisable2FA}
                  disabled={isLoading || !disableForm.currentPassword || !disableForm.twoFactorToken}
                >
                  {isLoading ? 'Disabling...' : 'Disable 2FA'}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Generate Backup Codes Form */}
        {showBackupCodesForm && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">Generate New Backup Codes</h4>
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  This will generate new backup codes and invalidate your existing ones. Make sure to save them securely.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-password">Current Password</Label>
                  <Input
                    id="backup-password"
                    type="password"
                    value={backupCodesForm.currentPassword}
                    onChange={(e) => setBackupCodesForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-2fa">2FA Code</Label>
                  <Input
                    id="backup-2fa"
                    type="text"
                    maxLength={6}
                    value={backupCodesForm.twoFactorToken}
                    onChange={(e) => setBackupCodesForm(prev => ({ ...prev, twoFactorToken: e.target.value.replace(/\D/g, '') }))}
                    placeholder="000000"
                    className="text-center font-mono"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBackupCodesForm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateBackupCodes}
                  disabled={isLoading || !backupCodesForm.currentPassword || !backupCodesForm.twoFactorToken}
                >
                  {isLoading ? 'Generating...' : 'Generate Codes'}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* New Backup Codes Display */}
        {newBackupCodes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">Your New Backup Codes</h4>
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Save these codes securely. Each code can only be used once.
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  {newBackupCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                      <Badge variant="secondary" className="text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-mono text-sm">{code}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={downloadBackupCodes}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Codes
                </Button>
                <Button
                  onClick={() => setNewBackupCodes([])}
                >
                  I've Saved These Codes
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
