import EnhancedLogin from "@/components/EnhancedLogin";

export default function Index() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ispId: "",
    username: "",
    password: "",
    userType: "admin"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [authStep, setAuthStep] = useState<'login' | '2fa' | '2fa-setup'>('login');
  const [tempUserId, setTempUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.username || !formData.password) {
      setError("Username and password are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          userType: formData.userType
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.requiresTwoFactor) {
          // User needs to provide 2FA token
          setTempUserId(data.userId);
          setUserName(formData.username);
          setAuthStep('2fa');
        } else if (data.requiresTwoFactorSetup) {
          // User needs to set up 2FA (mandatory)
          setTempUserId(data.userId);
          setUserName(formData.username);
          setAuthStep('2fa-setup');
        } else {
          // Login successful
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
          navigate("/dashboard");
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorVerify = async (token: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          userType: formData.userType,
          twoFactorToken: token
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.message || '2FA verification failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorSetupComplete = () => {
    // After 2FA setup is complete, redirect to dashboard
    navigate("/dashboard");
  };

  const handleBackToLogin = () => {
    setAuthStep('login');
    setTempUserId("");
    setUserName("");
    setError("");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Render 2FA verification screen
  if (authStep === '2fa') {
    return (
      <TwoFactorVerification
        onVerify={handleTwoFactorVerify}
        onBack={handleBackToLogin}
        isLoading={isLoading}
        error={error}
        userName={userName}
      />
    );
  }

  // Render 2FA setup screen
  if (authStep === '2fa-setup') {
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

      {/* Background decorative elements - hidden on mobile for cleaner look */}
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
            Internet Service Provider Billing System
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <Lock className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType" className="text-slate-700 font-medium">Account Type</Label>
              <select
                id="userType"
                value={formData.userType}
                onChange={(e) => handleInputChange("userType", e.target.value)}
                className="w-full h-11 px-3 border border-slate-200 bg-white/50 focus:bg-white rounded-md transition-colors"
                disabled={isLoading}
              >
                <option value="admin">Administrator</option>
                <option value="reseller">Reseller</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-medium">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
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
                  onChange={(e) => handleInputChange("password", e.target.value)}
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
                  <span>Sign In to Admin Panel</span>
                </div>
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
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
                <span className="text-xs text-slate-600 font-medium leading-tight">Billing System</span>
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              © 2025 NetSafi ISP Billing. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
