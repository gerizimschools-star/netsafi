import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Key, 
  User,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Filter,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username?: string;
  email?: string;
  contact_name?: string;
  business_name?: string;
  status: string;
  userType: 'reseller' | 'customer';
}

interface AuditLog {
  id: string;
  user_id: string;
  user_type: string;
  action: string;
  resource: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  created_at: string;
}

interface PasswordResetForm {
  userId: string;
  userType: 'reseller' | 'customer';
  newPassword: string;
  confirmPassword: string;
  generateTemporary: boolean;
}

export default function AdminPasswordManagement() {
  const [activeTab, setActiveTab] = useState("reset-passwords");
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Password reset state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetForm, setResetForm] = useState<PasswordResetForm>({
    userId: "",
    userType: "reseller",
    newPassword: "",
    confirmPassword: "",
    generateTemporary: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUserType, setFilterUserType] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch resellers
      const resellersResponse = await fetch('/api/resellers');
      const resellersData = await resellersResponse.json();
      
      // Fetch customers  
      const customersResponse = await fetch('/api/customers');
      const customersData = await customersResponse.json();

      const allUsers: User[] = [
        ...(resellersData.resellers || []).map((r: any) => ({ ...r, userType: 'reseller' as const })),
        ...(customersData.customers || []).map((c: any) => ({ ...c, userType: 'customer' as const }))
      ];

      setUsers(allUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/auth/audit-logs?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    if (!resetForm.generateTemporary) {
      if (!resetForm.newPassword || resetForm.newPassword !== resetForm.confirmPassword) {
        setError("Passwords don't match or are empty");
        return;
      }
    }

    setIsLoading(true);
    setError("");

    try {
      const adminData = JSON.parse(localStorage.getItem('user_data') || '{}');
      
      const response = await fetch('/api/auth/admin-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: adminData.id,
          targetUserId: selectedUser.id,
          targetUserType: selectedUser.userType,
          newPassword: resetForm.generateTemporary ? undefined : resetForm.newPassword,
          generateTemporary: resetForm.generateTemporary
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.temporaryPassword) {
          setTemporaryPassword(data.temporaryPassword);
        }
        
        toast({
          title: "Password Reset Successful",
          description: data.message,
        });

        // Reset form
        setResetForm({
          userId: "",
          userType: "reseller",
          newPassword: "",
          confirmPassword: "",
          generateTemporary: false
        });
        setSelectedUser(null);
        
        // Refresh audit logs
        fetchAuditLogs();
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleForgotPassword = async (user: User, enabled: boolean) => {
    setIsLoading(true);

    try {
      const adminData = JSON.parse(localStorage.getItem('user_data') || '{}');
      
      const response = await fetch('/api/auth/toggle-forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: adminData.id,
          targetUserId: user.id,
          targetUserType: user.userType,
          enabled
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Setting Updated",
          description: data.message,
        });
        
        fetchAuditLogs();
      } else {
        setError(data.message || 'Failed to update setting');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'User ID', 'User Type', 'Action', 'Resource', 'Success', 'IP Address', 'Details'].join(','),
      ...auditLogs.map(log => [
        new Date(log.created_at).toISOString(),
        log.user_id,
        log.user_type,
        log.action,
        log.resource,
        log.success ? 'Yes' : 'No',
        log.ip_address || '',
        JSON.stringify(log.details || {}).replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.business_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterUserType === "all" || user.userType === filterUserType;
    
    return matchesSearch && matchesType;
  });

  const filteredLogs = auditLogs.filter(log => {
    const matchesAction = filterAction === "all" || log.action.includes(filterAction);
    return matchesAction;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Password Management & Security</span>
          </CardTitle>
          <CardDescription>
            Manage user passwords, security settings, and view audit logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reset-passwords">Password Reset</TabsTrigger>
              <TabsTrigger value="security-settings">Security Settings</TabsTrigger>
              <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
            </TabsList>

            {/* Password Reset Tab */}
            <TabsContent value="reset-passwords" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* User Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select User</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <select
                        value={filterUserType}
                        onChange={(e) => setFilterUserType(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-md"
                      >
                        <option value="all">All Types</option>
                        <option value="reseller">Resellers</option>
                        <option value="customer">Customers</option>
                      </select>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {filteredUsers.map((user) => (
                        <button
                          key={`${user.userType}-${user.id}`}
                          onClick={() => {
                            setSelectedUser(user);
                            setResetForm(prev => ({
                              ...prev,
                              userId: user.id,
                              userType: user.userType
                            }));
                          }}
                          className={`w-full text-left p-3 border rounded-lg transition-colors ${
                            selectedUser?.id === user.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {user.username || user.contact_name || user.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.business_name || user.email}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={user.userType === 'reseller' ? 'default' : 'secondary'}>
                                {user.userType}
                              </Badge>
                              <Badge variant={user.status === 'active' ? 'outline' : 'destructive'}>
                                {user.status}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Password Reset Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reset Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedUser ? (
                      <>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium">{selectedUser.username || selectedUser.contact_name}</div>
                          <div className="text-sm text-blue-700">
                            {selectedUser.userType} • {selectedUser.email}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="generateTemporary"
                              checked={resetForm.generateTemporary}
                              onChange={(e) => setResetForm(prev => ({
                                ...prev,
                                generateTemporary: e.target.checked,
                                newPassword: "",
                                confirmPassword: ""
                              }))}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="generateTemporary" className="text-sm">
                              Generate temporary password
                            </Label>
                          </div>
                        </div>

                        {!resetForm.generateTemporary && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <div className="relative">
                                <Input
                                  id="newPassword"
                                  type={showPassword ? "text" : "password"}
                                  value={resetForm.newPassword}
                                  onChange={(e) => setResetForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                  placeholder="Enter new password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm Password</Label>
                              <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                value={resetForm.confirmPassword}
                                onChange={(e) => setResetForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Confirm new password"
                              />
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleResetPassword}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Resetting...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Key className="h-4 w-4" />
                              <span>Reset Password</span>
                            </div>
                          )}
                        </Button>

                        {temporaryPassword && (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-2">
                                <p><strong>Temporary password generated:</strong></p>
                                <div className="p-2 bg-gray-100 rounded font-mono text-sm">
                                  {temporaryPassword}
                                </div>
                                <p className="text-xs text-gray-600">
                                  Please share this with the user securely. They should change it on first login.
                                </p>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a user to reset their password</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Settings Tab */}
            <TabsContent value="security-settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Forgot Password Settings</CardTitle>
                  <CardDescription>
                    Control which users can use the forgot password feature
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={`${user.userType}-${user.id}`} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">
                            {user.username || user.contact_name || user.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <span>{user.business_name || user.email}</span>
                            <Badge variant={user.userType === 'reseller' ? 'default' : 'secondary'}>
                              {user.userType}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleForgotPassword(user, false)}
                            disabled={isLoading}
                          >
                            Disable
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleToggleForgotPassword(user, true)}
                            disabled={isLoading}
                          >
                            Enable
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Logs Tab */}
            <TabsContent value="audit-logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Security Audit Logs</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadAuditLogs}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-md"
                      >
                        <option value="all">All Actions</option>
                        <option value="sign_in">Sign In</option>
                        <option value="password_reset">Password Reset</option>
                        <option value="2fa">Two-Factor Auth</option>
                        <option value="otp">OTP</option>
                        <option value="account_lockout">Account Lockout</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchAuditLogs}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      <div className="space-y-2">
                        {filteredLogs.map((log) => (
                          <div key={log.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant={log.success ? 'outline' : 'destructive'}>
                                  {log.action}
                                </Badge>
                                <span className="text-sm text-gray-600">{log.resource}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(log.created_at).toLocaleString()}
                              </div>
                            </div>
                            <div className="mt-2 text-sm">
                              <div className="text-gray-600">
                                User: {log.user_id} ({log.user_type})
                              </div>
                              {log.ip_address && (
                                <div className="text-gray-500">IP: {log.ip_address}</div>
                              )}
                              {log.error_message && (
                                <div className="text-red-600">Error: {log.error_message}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
