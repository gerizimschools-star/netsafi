import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Smartphone, 
  Key, 
  Copy, 
  Check, 
  Download,
  AlertTriangle,
  QrCode,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorSetupProps {
  userId: string;
  userType: 'admin' | 'reseller';
  onComplete: () => void;
  onCancel?: () => void;
  mandatory?: boolean;
}

interface SetupData {
  qrCodeUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
}

export default function TwoFactorSetup({ 
  userId, 
  userType, 
  onComplete, 
  onCancel,
  mandatory = true
}: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const [showManualKey, setShowManualKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initiate2FASetup();
  }, []);

  const initiate2FASetup = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userType }),
      });

      const data = await response.json();

      if (data.success) {
        setSetupData(data.setup);
      } else {
        setError(data.message || 'Failed to setup 2FA');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnable2FA = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          userType, 
          token: verificationCode 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('backup');
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been successfully enabled.",
        });
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [key]: true });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadBackupCodes = () => {
    if (!setupData) return;

    const content = `NetSafi ISP Billing - Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleDateString()}

IMPORTANT: Store these codes in a safe place. Each code can only be used once.

${setupData.backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

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

    toast({
      title: "Backup Codes Downloaded",
      description: "Please store these codes in a secure location.",
    });
  };

  const formatCode = (code: string) => {
    return code.replace(/(\w{4})(\w{4})/, '$1 $2');
  };

  if (isLoading && !setupData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Setting up 2FA...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            Two-Factor Authentication Setup
          </CardTitle>
          <CardDescription>
            {mandatory ? (
              <div className="flex items-center justify-center space-x-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>2FA is mandatory for your account type</span>
              </div>
            ) : (
              "Enhance your account security with 2FA"
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <div className="flex justify-center space-x-4">
        {[
          { key: 'setup', label: 'Setup', icon: QrCode },
          { key: 'verify', label: 'Verify', icon: Smartphone },
          { key: 'backup', label: 'Backup Codes', icon: Key }
        ].map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === key ? 'bg-blue-500 text-white' :
              (step === 'verify' && key === 'setup') || (step === 'backup' && key !== 'backup') ?
              'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className={`text-sm ${step === key ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Setup */}
      {step === 'setup' && setupData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Scan QR Code</span>
            </CardTitle>
            <CardDescription>
              Use your authenticator app to scan this QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                <img 
                  src={setupData.qrCodeUrl} 
                  alt="2FA QR Code" 
                  className="w-48 h-48"
                />
              </div>
            </div>

            {/* Manual Entry */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>Manual Entry Key</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  type={showManualKey ? "text" : "password"}
                  value={setupData.manualEntryKey}
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualKey(!showManualKey)}
                >
                  {showManualKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(setupData.manualEntryKey, 'manual')}
                >
                  {copiedStates.manual ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                If you can't scan the QR code, enter this key manually in your authenticator app
              </p>
            </div>

            {/* Recommended Apps */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Recommended Authenticator Apps:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                <div>• Google Authenticator</div>
                <div>• Microsoft Authenticator</div>
                <div>• Authy</div>
                <div>• 1Password</div>
              </div>
            </div>

            <div className="flex justify-between">
              {!mandatory && onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button 
                onClick={() => setStep('verify')}
                className="ml-auto"
              >
                I've Added the Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Verify */}
      {step === 'verify' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Verify Setup</span>
            </CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification">Verification Code</Label>
              <Input
                id="verification"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setVerificationCode(value);
                }}
                className="text-center text-2xl font-mono tracking-widest"
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep('setup')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button 
                onClick={verifyAndEnable2FA}
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify & Enable 2FA'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Backup Codes */}
      {step === 'backup' && setupData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Backup Codes</span>
            </CardTitle>
            <CardDescription>
              Save these backup codes in a secure location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> These backup codes can be used if you lose access to your authenticator app. 
                Each code can only be used once. Store them securely!
              </AlertDescription>
            </Alert>

            {/* Backup Codes Grid */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                {setupData.backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-mono text-sm">{formatCode(code)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code, `backup-${index}`)}
                      className="h-6 w-6 p-0"
                    >
                      {copiedStates[`backup-${index}`] ? 
                        <Check className="h-3 w-3" /> : 
                        <Copy className="h-3 w-3" />
                      }
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={downloadBackupCodes}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Codes</span>
              </Button>

              <Button
                onClick={() => copyToClipboard(setupData.backupCodes.join('\n'), 'all-codes')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {copiedStates['all-codes'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>Copy All Codes</span>
              </Button>

              <Button
                onClick={onComplete}
                className="flex items-center space-x-2 ml-auto"
              >
                <Shield className="h-4 w-4" />
                <span>Complete Setup</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
