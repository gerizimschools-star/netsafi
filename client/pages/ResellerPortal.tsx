import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Users2, 
  Ticket, 
  DollarSign, 
  LogOut, 
  Eye, 
  Plus,
  Download,
  CreditCard,
  Building,
  User,
  Settings,
  BarChart3,
  MessageSquare,
  Smartphone,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Wallet,
  Gift,
  UserPlus,
  Send,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  Info
} from "lucide-react";

export default function ResellerPortal() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showVoucherDialog, setShowVoucherDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showCreditDialog, setShowCreditDialog] = useState(false);

  const [resellerData, setResellerData] = useState({
    company: "Nairobi Tech Solutions",
    username: "nairobi_tech",
    contact: "James Kimani",
    email: "james@naitech.com",
    phone: "+254701234567",
    location: "Nairobi",
    credit: 50000,
    commission: 15,
    permissions: ["users", "vouchers", "plans", "reports"],
    joinDate: "2023-11-15",
    lastLogin: "2024-01-18 14:30"
  });

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  const [users, setUsers] = useState([
    { id: 1, name: "John Mwangi", phone: "+254712345678", plan: "Premium", status: "Active", usage: "12.5 GB", lastSeen: "2 min ago", amount: 2500, joinDate: "2023-12-15" },
    { id: 2, name: "Grace Njeri", phone: "+254723456789", plan: "Standard", status: "Active", usage: "8.2 GB", lastSeen: "5 min ago", amount: 1500, joinDate: "2024-01-02" },
    { id: 3, name: "Peter Ochieng", phone: "+254734567890", plan: "Basic", status: "Expired", usage: "3.1 GB", lastSeen: "1 hour ago", amount: 800, joinDate: "2023-11-20" },
    { id: 4, name: "Mary Wanjiku", phone: "+254745678901", plan: "Premium", status: "Active", usage: "15.8 GB", lastSeen: "10 min ago", amount: 2500, joinDate: "2024-01-10" }
  ]);

  const [vouchers, setVouchers] = useState([
    { id: 1, code: "HOUR001", plan: "1 Hour Basic", planId: 1, amount: 10, status: "Unused", createdAt: "2024-01-15", expiresAt: "2024-02-15", usedAt: null, usedBy: null },
    { id: 2, code: "HOUR002", plan: "2 Hour Standard", planId: 2, amount: 18, status: "Used", createdAt: "2024-01-14", expiresAt: "2024-02-14", usedAt: "2024-01-16", usedBy: "John Mwangi" },
    { id: 3, code: "DAY001", plan: "Daily Basic", planId: 4, amount: 50, status: "Unused", createdAt: "2024-01-16", expiresAt: "2024-02-16", usedAt: null, usedBy: null },
    { id: 4, code: "PREM001", plan: "Daily Premium", planId: 6, amount: 120, status: "Unused", createdAt: "2024-01-17", expiresAt: "2024-02-17", usedAt: null, usedBy: null }
  ]);

  const [availablePlans] = useState([
    { id: 1, name: "1 Hour Basic", duration: 1, price: 10, speed_down: 5, speed_up: 2, category: "hourly" },
    { id: 2, name: "2 Hour Standard", duration: 2, price: 18, speed_down: 10, speed_up: 5, category: "hourly" },
    { id: 4, name: "Daily Basic", duration: 24, price: 50, speed_down: 5, speed_up: 2, category: "daily" },
    { id: 6, name: "Daily Premium", duration: 24, price: 120, speed_down: 20, speed_up: 10, category: "daily" }
  ]);

  const [stats, setStats] = useState({
    totalVouchers: 150,
    usedVouchers: 89,
    totalSales: 125000,
    commission: 18750,
    activeUsers: 45,
    monthlyGrowth: 12.5,
    pendingCredits: 5000
  });

  const [transactions] = useState([
    { id: 1, type: "Commission", amount: 1500, date: "2024-01-18", description: "December commission payment", status: "Completed" },
    { id: 2, type: "Voucher Sale", amount: 50, date: "2024-01-17", description: "Daily Basic voucher", status: "Completed" },
    { id: 3, type: "Credit Top-up", amount: 10000, date: "2024-01-15", description: "Account credit reload", status: "Pending" },
    { id: 4, type: "Voucher Sale", amount: 120, date: "2024-01-14", description: "Daily Premium voucher", status: "Completed" }
  ]);

  const [notifications] = useState([
    { id: 1, title: "Low Credit Alert", message: "Your credit balance is below KES 10,000", type: "warning", time: "5 min ago", read: false },
    { id: 2, title: "Commission Payment", message: "December commission of KES 18,750 has been processed", type: "success", time: "2 hours ago", read: false },
    { id: 3, title: "New Plan Available", message: "Weekly Standard plan is now available for voucher generation", type: "info", time: "1 day ago", read: true }
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username && loginForm.password) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setShowUserDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleGenerateVouchers = () => {
    setSelectedVoucher(null);
    setShowVoucherDialog(true);
  };

  const handleSaveUser = (formData) => {
    const userData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      plan: formData.get('plan'),
      amount: parseInt(formData.get('amount')),
      status: 'Active',
      usage: '0 GB',
      lastSeen: 'Just now',
      joinDate: new Date().toISOString().split('T')[0]
    };

    if (selectedUser?.id) {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...userData } : u));
    } else {
      setUsers([...users, { id: Date.now(), ...userData }]);
    }
    setShowUserDialog(false);
  };

  const handleGenerateVouchersSubmit = (formData) => {
    const planId = parseInt(formData.get('planId'));
    const quantity = parseInt(formData.get('quantity'));
    const plan = availablePlans.find(p => p.id === planId);
    
    if (plan && quantity > 0) {
      const newVouchers = [];
      for (let i = 0; i < quantity; i++) {
        newVouchers.push({
          id: Date.now() + i,
          code: `${plan.category.toUpperCase()}${String(Date.now() + i).slice(-6)}`,
          plan: plan.name,
          planId: plan.id,
          amount: plan.price,
          status: "Unused",
          createdAt: new Date().toISOString().split('T')[0],
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          usedAt: null,
          usedBy: null
        });
      }
      setVouchers([...vouchers, ...newVouchers]);
      setStats(prev => ({ ...prev, totalVouchers: prev.totalVouchers + quantity }));
      alert(`${quantity} vouchers generated successfully!`);
    }
    setShowVoucherDialog(false);
  };

  const handleSendMessage = (formData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`SMS sent to ${selectedUser?.name} (${selectedUser?.phone}): ${formData.get('message')}`);
      setShowMessageDialog(false);
      setSelectedUser(null);
    }, 1500);
  };

  const handleRequestCredit = (formData) => {
    const amount = parseInt(formData.get('amount'));
    const method = formData.get('method');
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      alert(`Credit request of KES ${amount.toLocaleString()} via ${method} submitted successfully!`);
      setShowCreditDialog(false);
    }, 2000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const filteredVouchers = vouchers.filter(voucher => 
    voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    voucher.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              NetSafi Reseller Portal
            </CardTitle>
            <CardDescription className="text-slate-600">
              Access your reseller dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                <Shield className="h-4 w-4 mr-2" />
                Sign In to Portal
              </Button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Demo Credentials: <br />
                Username: nairobi_tech <br />
                Password: netsafi2025
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {resellerData.company}
                </h1>
                <p className="text-sm text-slate-500">Reseller Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCreditDialog(true)}
                className="hidden sm:flex"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Credit: KES {resellerData.credit.toLocaleString()}
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-max min-w-full lg:w-auto">
              <TabsTrigger value="dashboard" className="text-xs lg:text-sm px-2 lg:px-3">Dashboard</TabsTrigger>
              <TabsTrigger value="users" className="text-xs lg:text-sm px-2 lg:px-3">Users</TabsTrigger>
              <TabsTrigger value="vouchers" className="text-xs lg:text-sm px-2 lg:px-3">Vouchers</TabsTrigger>
              <TabsTrigger value="reports" className="text-xs lg:text-sm px-2 lg:px-3">Reports</TabsTrigger>
              <TabsTrigger value="account" className="text-xs lg:text-sm px-2 lg:px-3">Account</TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Active Users</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
                    </div>
                    <Users2 className="h-5 w-5 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Vouchers</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.totalVouchers}</p>
                    </div>
                    <Ticket className="h-5 w-5 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Sales</p>
                      <p className="text-2xl font-bold text-slate-900">KES {Math.floor(stats.totalSales / 1000)}K</p>
                    </div>
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Commission</p>
                      <p className="text-2xl font-bold text-green-600">KES {Math.floor(stats.commission / 1000)}K</p>
                    </div>
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Notifications */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Recent Transactions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(0, 4).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{transaction.type}</p>
                          <p className="text-xs text-slate-500">{transaction.description}</p>
                          <p className="text-xs text-slate-400">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">+KES {transaction.amount.toLocaleString()}</p>
                          <Badge variant={transaction.status === 'Completed' ? 'default' : 'secondary'} className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${
                        notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                        notification.type === 'success' ? 'bg-green-50 border-green-400' : 'bg-blue-50 border-blue-400'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage your customers and their subscriptions</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search users..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <Button onClick={handleAddUser} size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.phone}</p>
                          <p className="text-xs text-slate-400">{user.plan} Plan - KES {user.amount}/month</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                          {user.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setShowMessageDialog(true); }}>
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vouchers Tab */}
          <TabsContent value="vouchers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div>
                  <CardTitle>Voucher Management</CardTitle>
                  <CardDescription>Generate and manage prepaid vouchers</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      placeholder="Search vouchers..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={handleGenerateVouchers} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredVouchers.map((voucher) => (
                    <div key={voucher.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                          <Ticket className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium font-mono">{voucher.code}</p>
                          <p className="text-sm text-slate-500">{voucher.plan}</p>
                          <p className="text-xs text-slate-400">
                            Created: {voucher.createdAt} • Expires: {voucher.expiresAt}
                            {voucher.usedBy && ` • Used by: ${voucher.usedBy}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">KES {voucher.amount}</p>
                          <Badge variant={voucher.status === 'Unused' ? 'default' : 'secondary'}>
                            {voucher.status}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(voucher.code)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Summary</CardTitle>
                  <CardDescription>Your performance this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Sales</span>
                    <span className="font-bold text-green-600">KES {stats.totalSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Commission Earned</span>
                    <span className="font-bold text-blue-600">KES {stats.commission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Growth Rate</span>
                    <span className="font-bold text-purple-600">+{stats.monthlyGrowth}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Active Users</span>
                    <span className="font-bold text-orange-600">{stats.activeUsers}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={handleGenerateVouchers}>
                    <Gift className="h-4 w-4 mr-2" />
                    Generate Vouchers
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleAddUser}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowCreditDialog(true)}>
                    <Wallet className="h-4 w-4 mr-2" />
                    Request Credit
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your reseller account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-600">Company Name</p>
                      <p className="font-medium">{resellerData.company}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Contact Person</p>
                      <p className="font-medium">{resellerData.contact}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <p className="font-medium">{resellerData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Phone</p>
                      <p className="font-medium">{resellerData.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Location</p>
                      <p className="font-medium">{resellerData.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Username</p>
                      <p className="font-medium">{resellerData.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Credit Balance</p>
                      <p className="font-medium text-green-600">KES {resellerData.credit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Commission Rate</p>
                      <p className="font-medium">{resellerData.commission}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Join Date</p>
                      <p className="font-medium">{resellerData.joinDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Last Login</p>
                      <p className="font-medium">{resellerData.lastLogin}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Permissions</CardTitle>
                  <CardDescription>Your access permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {resellerData.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary" className="capitalize">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Update Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {selectedUser ? 'Update user information' : 'Create a new user account'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSaveUser(new FormData(e.target));
          }} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input name="name" defaultValue={selectedUser?.name} placeholder="John Doe" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input name="phone" defaultValue={selectedUser?.phone} placeholder="+254712345678" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="plan">Plan</Label>
                <Select name="plan" defaultValue={selectedUser?.plan} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic">Basic</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Monthly Amount (KES)</Label>
                <Input name="amount" type="number" defaultValue={selectedUser?.amount} placeholder="2500" required />
              </div>
            </div>
            <Button type="submit" className="w-full">
              {selectedUser ? 'Update User' : 'Add User'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Voucher Generation Dialog */}
      <Dialog open={showVoucherDialog} onOpenChange={setShowVoucherDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>Generate Vouchers</DialogTitle>
            <DialogDescription>Create new prepaid vouchers for your customers</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleGenerateVouchersSubmit(new FormData(e.target));
          }} className="space-y-4">
            <div>
              <Label htmlFor="planId">Select Plan</Label>
              <Select name="planId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name} - KES {plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input name="quantity" type="number" min="1" max="100" placeholder="10" required />
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Vouchers will be valid for 30 days from creation date.
              </AlertDescription>
            </Alert>
            <Button type="submit" className="w-full">
              <Gift className="h-4 w-4 mr-2" />
              Generate Vouchers
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>Send SMS Message</DialogTitle>
            <DialogDescription>
              Send SMS to {selectedUser?.name} ({selectedUser?.phone})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(new FormData(e.target));
          }} className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea name="message" placeholder="Type your message here..." required rows={4} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credit Request Dialog */}
      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>Request Credit</DialogTitle>
            <DialogDescription>Top up your account credit balance</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleRequestCredit(new FormData(e.target));
          }} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input name="amount" type="number" min="1000" placeholder="10000" required />
            </div>
            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select name="method" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="airtel">Airtel Money</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Current Balance: KES {resellerData.credit.toLocaleString()}
              </AlertDescription>
            </Alert>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Request Credit
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
