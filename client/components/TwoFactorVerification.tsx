import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Smartphone, 
  Key, 
  ArrowLeft,
  AlertTriangle,
  Clock
} from "lucide-react";

interface TwoFactorVerificationProps {
  onVerify: (token: string) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  error?: string;
  userName?: string;
}

export default function TwoFactorVerification({ 
  onVerify, 
  onBack, 
  isLoading, 
  error,
  userName
}: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;
    
    await onVerify(verificationCode);
  };

  const formatCodeInput = (value: string) => {
    if (isBackupCode) {
      // Format backup codes as XXXX-XXXX
      const cleaned = value.replace(/[^A-Fa-f0-9]/g, '');
      if (cleaned.length <= 4) return cleaned.toUpperCase();
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`.toUpperCase();
    } else {
      // Format TOTP as 6 digits
      return value.replace(/\D/g, '');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCodeInput(e.target.value);
    setVerificationCode(formatted);
  };

  const isValidLength = isBackupCode ? 
    verificationCode.replace('-', '').length === 8 : 
    verificationCode.length === 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-slate-600">
            {userName && `Welcome back, ${userName}. `}
            Enter your authentication code to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Type Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  setIsBackupCode(false);
                  setVerificationCode('');
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  !isBackupCode 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>Authenticator</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsBackupCode(true);
                  setVerificationCode('');
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  isBackupCode 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Key className="h-4 w-4" />
                <span>Backup Code</span>
              </button>
            </div>

            {/* Code Input */}
            <div className="space-y-2">
              <Label htmlFor="verification" className="flex items-center space-x-2">
                {isBackupCode ? (
                  <>
                    <Key className="h-4 w-4" />
                    <span>Backup Code</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4" />
                    <span>Authenticator Code</span>
                  </>
                )}
              </Label>
              <Input
                id="verification"
                type="text"
                maxLength={isBackupCode ? 9 : 6} // XXXX-XXXX or 000000
                placeholder={isBackupCode ? "XXXX-XXXX" : "000000"}
                value={verificationCode}
                onChange={handleCodeChange}
                className="text-center text-xl font-mono tracking-wider h-12"
                disabled={isLoading}
                autoComplete="one-time-code"
                autoFocus
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {isBackupCode ? 'Enter your 8-character backup code' : 'Enter the 6-digit code from your app'}
                </span>
                {!isBackupCode && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Code refreshes every 30s</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading || !isValidLength}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Verify & Continue</span>
                </div>
              )}
            </Button>
          </form>

          <Separator />

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>

          {/* Help Text */}
          <div className="text-center space-y-2">
            <div className="text-xs text-gray-500">
              {isBackupCode ? (
                <div className="space-y-1">
                  <p>Use a backup code if you don't have access to your authenticator app.</p>
                  <p><strong>Note:</strong> Each backup code can only be used once.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p>Check your authenticator app for the current 6-digit code.</p>
                  <p>Can't access your app? Use a backup code instead.</p>
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium">Security Notice</p>
                <p>This extra step helps protect your account from unauthorized access.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
