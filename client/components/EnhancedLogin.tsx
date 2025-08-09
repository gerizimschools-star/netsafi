import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Wifi, 
  Activity, 
  Lock,
  Mail,
  MessageSquare,
  Smartphone,
  Key,
  Clock,
  ArrowLeft,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import TwoFactorSetup from "@/components/TwoFactorSetup";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordData {
  username: string;
  userType: string;
  method: 'email' | 'sms';
}

export default function EnhancedLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'login' | '2fv' | '2fa-setup' | 'forgot-password'>('login');
  
  // Login form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    userType: "admin"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 2FV state
  const [tempUserId, setTempUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [twoFVCode, setTwoFVCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(3);

  // Forgot password state
  const [forgotPasswordData, setForgotPasswordData] = useState<ForgotPasswordData>({
    username: "",
    userType: "admin",
    method: "email"
  });
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  // Timer for OTP expiration
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (otpExpiresAt && currentStep === '2fv') {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expiry = otpExpiresAt.getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setOtpSent(false);
          setOtpExpiresAt(null);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpExpiresAt, currentStep]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.username || !formData.password) {
      setError("Username and password are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/enhanced-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (data.requiresTwoFactor) {
          // User needs 2FV
          setTempUserId(data.userId);
          setUserName(formData.username);
          setAvailableMethods(data.availableMethods || []);
          setSelectedMethod(data.availableMethods?.[0] || '');
          setCurrentStep('2fv');
        } else if (data.requiresTwoFactorSetup) {
          // User needs to set up 2FA
          setTempUserId(data.userId);
          setUserName(formData.username);
          setCurrentStep('2fa-setup');
        } else {
          // Login successful
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
          navigate("/dashboard");
        }
      } else {
        setError(data.message || 'Login failed');
        if (data.lockedUntil) {
          const lockTime = new Date(data.lockedUntil);
          setError(`Account locked until ${lockTime.toLocaleString()}`);
        }
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!selectedMethod.includes('otp')) return;

    setIsLoading(true);
    setError("");

    try {
      const method = selectedMethod === 'email_otp' ? 'email' : 'sms';
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: tempUserId,
          userType: formData.userType,
          method
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setOtpExpiresAt(new Date(data.expiresAt));
        toast({
          title: "OTP Sent",
          description: `Verification code sent via ${method}`,
        });
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorVerify = async () => {
    if (!twoFVCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/enhanced-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          twoFactorToken: twoFVCode,
          twoFactorMethod: selectedMethod
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.message || '2FV verification failed');
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!forgotPasswordData.username) {
      setError("Username or email is required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(forgotPasswordData),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordResetSent(true);
        toast({
          title: "Password Reset Sent",
          description: data.message,
        });
      } else {
        setError(data.message || 'Failed to send password reset');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSetupComplete = () => {
    navigate("/dashboard");
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setTempUserId("");
    setUserName("");
    setError("");
    setTwoFVCode("");
    setOtpSent(false);
    setOtpExpiresAt(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'totp': return <Smartphone className="h-4 w-4" />;
      case 'email_otp': return <Mail className="h-4 w-4" />;
      case 'sms_otp': return <MessageSquare className="h-4 w-4" />;
      case 'backup_code': return <Key className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'totp': return 'Authenticator App';
      case 'email_otp': return 'Email OTP';
      case 'sms_otp': return 'SMS OTP';
      case 'backup_code': return 'Backup Code';
      default: return method;
    }
  };

  // Render 2FA setup screen
  if (currentStep === '2fa-setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <TwoFactorSetup
          userId={tempUserId}
          userType={formData.userType as 'admin' | 'reseller'}
          onComplete={handleTwoFactorSetupComplete}
          mandatory={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 lg:p-8">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      {/* Background decorative elements */}
      <div className="hidden md:block absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-60 animate-pulse" />
      <div className="hidden md:block absolute bottom-20 right-20 w-32 h-32 bg-indigo-200 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="hidden lg:block absolute top-1/3 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />

      <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-4 sm:pb-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Wifi className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NetSafi Billing
          </CardTitle>
          <CardDescription className="text-slate-600 text-sm sm:text-base">
            {currentStep === 'login' && 'Secure Access to ISP Billing System'}
            {currentStep === '2fv' && 'Two-Factor Verification Required'}
            {currentStep === 'forgot-password' && 'Reset Your Password'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          {currentStep === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userType" className="text-slate-700 font-medium">Account Type</Label>
                <select
                  id="userType"
                  value={formData.userType}
                  onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value }))}
                  className="w-full h-11 px-3 border border-slate-200 bg-white/50 focus:bg-white rounded-md transition-colors"
                  disabled={isLoading}
                >
                  <option value="admin">Administrator</option>
                  <option value="reseller">Reseller</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 font-medium">
                  {formData.userType === 'reseller' ? 'Email' : 'Username'}
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={formData.userType === 'reseller' ? 'Enter your email' : 'Enter your username'}
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="h-11 border-slate-200 bg-white/50 focus:bg-white transition-colors"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="h-11 border-slate-200 bg-white/50 focus:bg-white transition-colors pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('forgot-password');
                    setForgotPasswordData(prev => ({ ...prev, userType: formData.userType }));
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              </div>
            </form>
          )}

          {/* Two-Factor Verification Form */}
          {currentStep === '2fv' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-blue-900">Additional Verification Required</h3>
                <p className="text-sm text-blue-700">Choose your preferred verification method</p>
              </div>

              {/* Method Selection */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Verification Method</Label>
                <div className="grid gap-2">
                  {availableMethods.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                        selectedMethod === method
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(method)}
                        <span className="text-sm font-medium">{getMethodName(method)}</span>
                      </div>
                      {selectedMethod === method && <CheckCircle className="h-4 w-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* OTP Request for email/SMS methods */}
              {selectedMethod.includes('otp') && !otpSent && (
                <Button
                  onClick={handleRequestOTP}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send {selectedMethod === 'email_otp' ? 'Email' : 'SMS'} Code
                </Button>
              )}

              {/* OTP Timer */}
              {otpSent && timeRemaining > 0 && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Code expires in {formatTime(timeRemaining)}</span>
                </div>
              )}

              {/* Verification Code Input */}
              {(selectedMethod === 'totp' || selectedMethod === 'backup_code' || otpSent) && (
                <div className="space-y-2">
                  <Label htmlFor="twoFVCode" className="text-slate-700 font-medium">
                    {selectedMethod === 'backup_code' ? 'Backup Code' : 'Verification Code'}
                  </Label>
                  <Input
                    id="twoFVCode"
                    type="text"
                    maxLength={selectedMethod === 'backup_code' ? 9 : 6}
                    placeholder={selectedMethod === 'backup_code' ? 'XXXX-XXXX' : '000000'}
                    value={twoFVCode}
                    onChange={(e) => {
                      const value = selectedMethod === 'backup_code' 
                        ? e.target.value.toUpperCase()
                        : e.target.value.replace(/\D/g, '');
                      setTwoFVCode(value);
                    }}
                    className="text-center text-xl font-mono tracking-wider h-12"
                    disabled={isLoading}
                    autoFocus
                  />
                  {attemptsRemaining < 3 && (
                    <p className="text-sm text-amber-600">
                      {attemptsRemaining} attempts remaining
                    </p>
                  )}
                </div>
              )}

              {/* Verify Button */}
              {(selectedMethod === 'totp' || selectedMethod === 'backup_code' || otpSent) && (
                <Button
                  onClick={handleTwoFactorVerify}
                  disabled={isLoading || !twoFVCode}
                  className="w-full"
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
              )}

              <Separator />

              <Button
                variant="outline"
                onClick={handleBackToLogin}
                disabled={isLoading}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          )}

          {/* Forgot Password Form */}
          {currentStep === 'forgot-password' && (
            <div className="space-y-4">
              {!passwordResetSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgotUserType" className="text-slate-700 font-medium">Account Type</Label>
                    <select
                      id="forgotUserType"
                      value={forgotPasswordData.userType}
                      onChange={(e) => setForgotPasswordData(prev => ({ ...prev, userType: e.target.value }))}
                      className="w-full h-11 px-3 border border-slate-200 bg-white/50 focus:bg-white rounded-md transition-colors"
                      disabled={isLoading}
                    >
                      <option value="admin">Administrator</option>
                      <option value="reseller">Reseller</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="forgotUsername" className="text-slate-700 font-medium">
                      {forgotPasswordData.userType === 'reseller' ? 'Email' : 'Username'}
                    </Label>
                    <Input
                      id="forgotUsername"
                      type="text"
                      placeholder={forgotPasswordData.userType === 'reseller' ? 'Enter your email' : 'Enter your username'}
                      value={forgotPasswordData.username}
                      onChange={(e) => setForgotPasswordData(prev => ({ ...prev, username: e.target.value }))}
                      className="h-11 border-slate-200 bg-white/50 focus:bg-white transition-colors"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Reset Method</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setForgotPasswordData(prev => ({ ...prev, method: 'email' }))}
                        className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                          forgotPasswordData.method === 'email'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={isLoading}
                      >
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForgotPasswordData(prev => ({ ...prev, method: 'sms' }))}
                        className={`flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                          forgotPasswordData.method === 'sms'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        disabled={isLoading}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>SMS</span>
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !forgotPasswordData.username}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Key className="h-4 w-4" />
                        <span>Send Reset {forgotPasswordData.method === 'email' ? 'Email' : 'SMS'}</span>
                      </div>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-medium">Reset Instructions Sent</h3>
                  <p className="text-sm text-gray-600">
                    If an account exists, you'll receive a password reset link via {forgotPasswordData.method}.
                  </p>
                </div>
              )}

              <Separator />

              <Button
                variant="outline"
                onClick={handleBackToLogin}
                disabled={isLoading}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          )}

          {/* Features Section (only show on login page) */}
          {currentStep === 'login' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Features</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                  </div>
                  <span className="text-xs text-slate-600 font-medium leading-tight">User Management</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Wifi className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                  </div>
                  <span className="text-xs text-slate-600 font-medium leading-tight">Network Control</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                  </div>
                  <span className="text-xs text-slate-600 font-medium leading-tight">Secure Access</span>
                </div>
              </div>
            </>
          )}

          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              © 2025 NetSafi ISP Billing. Secured with 2FV.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
