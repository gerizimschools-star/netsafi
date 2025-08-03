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
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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
  Info,
  AlertTriangle,
  Star,
  Award,
  Target,
  Globe,
  Zap,
  LineChart,
  PieChart,
  FileText,
  Lock,
  Unlock,
  Key,
  Smartphone as Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  Timer,
  Gauge,
  TrendingDown,
  Activity,
  Wifi,
  Server,
  Database,
  Cloud,
  Headphones,
  ShoppingCart,
  Package,
  Percent,
  Calculator,
  BanknoteIcon,
  Receipt,
  Archive,
  History,
  Bookmark,
  Flag,
  Heart,
  Lightbulb,
  Megaphone,
  MonitorSpeaker,
  PaintBucket,
  Palette,
  QrCode,
  Scan,
  Share,
  Sparkles,
  Sun,
  Moon,
  Languages,
  Volume2,
  Webcam,
  Wrench,
  Layers,
  Network,
  Router,
  SignalHigh,
  WifiOff
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'promotion';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  time: string;
  actionUrl?: string;
}

interface License {
  id: string;
  type: 'Basic' | 'Pro' | 'Enterprise';
  issuedDate: string;
  expiryDate: string;
  status: 'Active' | 'Expired' | 'Suspended' | 'Renewal Required';
  features: string[];
  maxUsers: number;
  maxVouchers: number;
  daysUntilExpiry: number;
}

export default function ResellerPortal() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");

  // Dialog states
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showVoucherDialog, setShowVoucherDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);

  const [resellerData, setResellerData] = useState({
    company: "Nairobi Tech Solutions",
    username: "nairobi_tech",
    contact: "James Kimani",
    email: "james@naitech.com",
    phone: "+254701234567",
    location: "Nairobi",
    website: "https://naitech.com",
    credit: 75000,
    commission: 15,
    tier: "Gold",
    permissions: ["users", "vouchers", "plans", "reports", "api"],
    joinDate: "2023-11-15",
    lastLogin: "2024-01-18 14:30",
    timezone: "Africa/Nairobi",
    currency: "KES"
  });

  const [license, setLicense] = useState<License>({
    id: "LIC-NT-2024-001",
    type: "Pro",
    issuedDate: "2024-01-01",
    expiryDate: "2024-12-31",
    status: "Active",
    features: ["User Management", "Voucher Generation", "API Access", "Advanced Reports", "Bulk Operations"],
    maxUsers: 1000,
    maxVouchers: 5000,
    daysUntilExpiry: 320
  });

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  const [users, setUsers] = useState([
    { 
      id: 1, 
      name: "John Mwangi", 
      phone: "+254712345678", 
      email: "john@example.com",
      plan: "Premium", 
      status: "Active", 
      usage: "12.5 GB", 
      lastSeen: "2 min ago", 
      amount: 2500, 
      joinDate: "2023-12-15",
      location: "Nairobi",
      deviceInfo: "Samsung Galaxy S21",
      paymentMethod: "M-Pesa",
      totalSpent: 15000,
      sessionsCount: 45
    },
    { 
      id: 2, 
      name: "Grace Njeri", 
      phone: "+254723456789", 
      email: "grace@example.com",
      plan: "Standard", 
      status: "Active", 
      usage: "8.2 GB", 
      lastSeen: "5 min ago", 
      amount: 1500, 
      joinDate: "2024-01-02",
      location: "Kiambu",
      deviceInfo: "iPhone 12",
      paymentMethod: "Airtel Money",
      totalSpent: 4500,
      sessionsCount: 12
    },
    { 
      id: 3, 
      name: "Peter Ochieng", 
      phone: "+254734567890", 
      email: "peter@example.com",
      plan: "Basic", 
      status: "Expired", 
      usage: "3.1 GB", 
      lastSeen: "1 hour ago", 
      amount: 800, 
      joinDate: "2023-11-20",
      location: "Kisumu",
      deviceInfo: "Tecno Spark 8",
      paymentMethod: "M-Pesa",
      totalSpent: 2400,
      sessionsCount: 8
    },
    { 
      id: 4, 
      name: "Mary Wanjiku", 
      phone: "+254745678901", 
      email: "mary@example.com",
      plan: "Premium", 
      status: "Active", 
      usage: "15.8 GB", 
      lastSeen: "10 min ago", 
      amount: 2500, 
      joinDate: "2024-01-10",
      location: "Nakuru",
      deviceInfo: "Huawei P40",
      paymentMethod: "Bank Transfer",
      totalSpent: 7500,
      sessionsCount: 23
    }
  ]);

  const [vouchers, setVouchers] = useState([
    { 
      id: 1, 
      code: "NT2024001", 
      plan: "1 Hour Basic", 
      planId: 1, 
      amount: 10, 
      status: "Unused", 
      createdAt: "2024-01-15", 
      expiresAt: "2024-03-15", 
      usedAt: null, 
      usedBy: null,
      batchId: "BATCH-001",
      qrCode: true,
      category: "Promotional"
    },
    { 
      id: 2, 
      code: "NT2024002", 
      plan: "2 Hour Standard", 
      planId: 2, 
      amount: 18, 
      status: "Used", 
      createdAt: "2024-01-14", 
      expiresAt: "2024-03-14", 
      usedAt: "2024-01-16", 
      usedBy: "John Mwangi",
      batchId: "BATCH-001",
      qrCode: true,
      category: "Regular"
    },
    { 
      id: 3, 
      code: "NT2024003", 
      plan: "Daily Basic", 
      planId: 4, 
      amount: 50, 
      status: "Unused", 
      createdAt: "2024-01-16", 
      expiresAt: "2024-03-16", 
      usedAt: null, 
      usedBy: null,
      batchId: "BATCH-002",
      qrCode: true,
      category: "Premium"
    }
  ]);

  const [availablePlans] = useState([
    { id: 1, name: "1 Hour Basic", duration: 1, price: 10, speed_down: 5, speed_up: 2, category: "hourly", commission: 1.5 },
    { id: 2, name: "2 Hour Standard", duration: 2, price: 18, speed_down: 10, speed_up: 5, category: "hourly", commission: 2.7 },
    { id: 3, name: "4 Hour Premium", duration: 4, price: 35, speed_down: 20, speed_up: 10, category: "hourly", commission: 5.25 },
    { id: 4, name: "Daily Basic", duration: 24, price: 50, speed_down: 5, speed_up: 2, category: "daily", commission: 7.5 },
    { id: 5, name: "Daily Standard", duration: 24, price: 80, speed_down: 10, speed_up: 5, category: "daily", commission: 12 },
    { id: 6, name: "Daily Premium", duration: 24, price: 120, speed_down: 20, speed_up: 10, category: "daily", commission: 18 },
    { id: 7, name: "Weekly Basic", duration: 168, price: 300, speed_down: 5, speed_up: 2, category: "weekly", commission: 45 },
    { id: 8, name: "Monthly Premium", duration: 720, price: 2500, speed_down: 20, speed_up: 10, category: "monthly", commission: 375 }
  ]);

  const [stats, setStats] = useState({
    activeUsers: 48,
    totalVouchers: 250,
    usedVouchers: 156,
    totalSales: 185000,
    commission: 27750,
    monthlyGrowth: 18.5,
    pendingCredits: 12000,
    averageOrderValue: 85,
    conversionRate: 72.3,
    customerSatisfaction: 94.8,
    networkUptime: 99.7,
    supportTickets: 3
  });

  const [analytics, setAnalytics] = useState({
    salesTrend: [
      { month: "Jan", sales: 45000, commission: 6750 },
      { month: "Feb", sales: 52000, commission: 7800 },
      { month: "Mar", sales: 48000, commission: 7200 },
      { month: "Apr", sales: 61000, commission: 9150 },
      { month: "May", sales: 58000, commission: 8700 },
      { month: "Jun", sales: 65000, commission: 9750 }
    ],
    topPlans: [
      { plan: "Daily Premium", sales: 45, revenue: 5400 },
      { plan: "Daily Standard", sales: 32, revenue: 2560 },
      { plan: "Monthly Premium", sales: 8, revenue: 20000 },
      { plan: "2 Hour Standard", sales: 68, revenue: 1224 }
    ],
    userDistribution: [
      { location: "Nairobi", users: 28, percentage: 58.3 },
      { location: "Mombasa", users: 12, percentage: 25.0 },
      { location: "Kisumu", users: 5, percentage: 10.4 },
      { location: "Nakuru", users: 3, percentage: 6.3 }
    ]
  });

  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: 1, 
      title: "License Renewal Required", 
      message: "Your Pro license expires in 45 days. Renew now to avoid service interruption.", 
      type: "warning", 
      priority: "high",
      time: "2 hours ago", 
      read: false,
      actionUrl: "#license"
    },
    { 
      id: 2, 
      title: "Monthly Target Achieved!", 
      message: "Congratulations! You've exceeded your monthly sales target by 23%.", 
      type: "success", 
      priority: "normal",
      time: "5 hours ago", 
      read: false
    },
    { 
      id: 3, 
      title: "New Feature: Bulk Operations", 
      message: "You can now perform bulk actions on users and vouchers. Check it out!", 
      type: "info", 
      priority: "normal",
      time: "1 day ago", 
      read: true
    },
    { 
      id: 4, 
      title: "Low Credit Alert", 
      message: "Your credit balance is below KES 20,000. Consider topping up.", 
      type: "warning", 
      priority: "normal",
      time: "2 days ago", 
      read: true
    }
  ]);

  const [transactions] = useState([
    { id: 1, type: "Voucher Sale", amount: 120, commission: 18, date: "2024-01-18", customer: "Mary Wanjiku", status: "Completed", reference: "TXN-001" },
    { id: 2, type: "Commission", amount: 1875, commission: 0, date: "2024-01-17", customer: "System", status: "Completed", reference: "COM-Dec" },
    { id: 3, type: "Credit Top-up", amount: 25000, commission: 0, date: "2024-01-15", customer: "Self", status: "Pending", reference: "TOP-001" },
    { id: 4, type: "Voucher Sale", amount: 50, commission: 7.5, date: "2024-01-14", customer: "Grace Njeri", status: "Completed", reference: "TXN-002" }
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

  const handleRenewLicense = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLicense(prev => ({
        ...prev,
        expiryDate: "2025-12-31",
        status: "Active",
        daysUntilExpiry: 686
      }));
      setIsLoading(false);
      setShowLicenseDialog(false);
      alert("License renewed successfully! Your Pro license is now valid until December 31, 2025.");
    }, 2000);
  };

  const handleGenerateApiKey = () => {
    const newApiKey = "nts_" + Math.random().toString(36).substr(2, 24);
    alert(`New API Key Generated: ${newApiKey}\n\nPlease save this key securely as it won't be shown again.`);
    setShowApiDialog(false);
  };

  const handleBulkAction = (action: string, selectedItems: number[]) => {
    setIsLoading(true);
    setTimeout(() => {
      if (action === "delete" && activeTab === "users") {
        setUsers(users.filter(user => !selectedItems.includes(user.id)));
      } else if (action === "activate" && activeTab === "users") {
        setUsers(users.map(user => 
          selectedItems.includes(user.id) ? { ...user, status: "Active" } : user
        ));
      }
      setIsLoading(false);
      setShowBulkActionsDialog(false);
      alert(`Bulk action "${action}" completed for ${selectedItems.length} items.`);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getLicenseStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-50 border-green-200';
      case 'Expired': return 'text-red-600 bg-red-50 border-red-200';
      case 'Renewal Required': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

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
              Advanced ISP Reseller Management System
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
                <strong>Demo Credentials:</strong><br />
                Username: nairobi_tech<br />
                Password: netsafi2025
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      {/* Enhanced Header */}
      <header className={`${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700' : 'border-slate-200'} sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent`}>
                  {resellerData.company}
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {resellerData.tier} Tier
                  </Badge>
                  <Badge variant={license.status === 'Active' ? 'default' : 'destructive'} className="text-xs">
                    License: {license.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* License Status Indicator */}
              {license.daysUntilExpiry < 60 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowLicenseDialog(true)}
                  className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Expires in {license.daysUntilExpiry} days
                </Button>
              )}

              {/* Credit Balance */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCreditDialog(true)}
                className="hidden sm:flex"
              >
                <Wallet className="h-4 w-4 mr-2" />
                KES {resellerData.credit.toLocaleString()}
              </Button>

              {/* Notifications */}
              <Button 
                variant="outline" 
                size="sm" 
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>

              {/* Settings */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSettingsDialog(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>

              {/* Logout */}
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
            <TabsList className="inline-flex w-max min-w-full lg:w-auto h-12 p-1">
              <TabsTrigger value="dashboard" className="text-xs lg:text-sm px-3 lg:px-4 py-2">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs lg:text-sm px-3 lg:px-4 py-2">
                <LineChart className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs lg:text-sm px-3 lg:px-4 py-2">
                <Users2 className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="vouchers" className="text-xs lg:text-sm px-3 lg:px-4 py-2">
                <Ticket className="h-4 w-4 mr-2" />
                Vouchers
              </TabsTrigger>
              <TabsTrigger value="financial" className="text-xs lg:text-sm px-3 lg:px-4 py-2">
                <DollarSign className="h-4 w-4 mr-2" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="license" className="text-xs lg:text-sm px-3 lg:px-4 py-2">
                <Key className="h-4 w-4 mr-2" />
                License
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Enhanced Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Active Users</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.activeUsers}</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{stats.monthlyGrowth}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Total Sales</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>KES {Math.floor(stats.totalSales / 1000)}K</p>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12.5%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Commission</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>KES {Math.floor(stats.commission / 1000)}K</p>
                      <p className="text-xs text-purple-600 flex items-center mt-1">
                        <Percent className="h-3 w-3 mr-1" />
                        {resellerData.commission}% rate
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Conversion Rate</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.conversionRate}%</p>
                      <p className="text-xs text-orange-600 flex items-center mt-1">
                        <Target className="h-3 w-3 mr-1" />
                        Excellent
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Indicators */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle className={`text-lg ${darkMode ? 'text-white' : ''}`}>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Customer Satisfaction</span>
                      <span className={`font-bold text-green-600`}>{stats.customerSatisfaction}%</span>
                    </div>
                    <Progress value={stats.customerSatisfaction} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Network Uptime</span>
                      <span className={`font-bold text-blue-600`}>{stats.networkUptime}%</span>
                    </div>
                    <Progress value={stats.networkUptime} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Voucher Usage Rate</span>
                      <span className={`font-bold text-purple-600`}>{Math.round((stats.usedVouchers / stats.totalVouchers) * 100)}%</span>
                    </div>
                    <Progress value={(stats.usedVouchers / stats.totalVouchers) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle className={`text-lg ${darkMode ? 'text-white' : ''}`}>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowVoucherDialog(true)}>
                    <Gift className="h-4 w-4 mr-2" />
                    Generate Vouchers
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowUserDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowBulkActionsDialog(true)}>
                    <Package className="h-4 w-4 mr-2" />
                    Bulk Actions
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowApiDialog(true)}>
                    <Key className="h-4 w-4 mr-2" />
                    API Management
                  </Button>
                </CardContent>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle className={`text-lg ${darkMode ? 'text-white' : ''} flex items-center`}>
                    <Bell className="h-5 w-5 mr-2" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${
                        notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                        notification.type === 'success' ? 'bg-green-50 border-green-400' : 
                        notification.type === 'error' ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-400'
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

          {/* Enhanced Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : ''}`}>Sales Trend (6 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.salesTrend.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.month}</p>
                          <p className="text-sm text-slate-500">Sales: KES {item.sales.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">KES {item.commission.toLocaleString()}</p>
                          <p className="text-xs text-slate-400">Commission</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : ''}`}>Top Performing Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topPlans.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{item.plan}</p>
                            <p className="text-sm text-slate-500">{item.sales} sales</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">KES {item.revenue.toLocaleString()}</p>
                          <p className="text-xs text-slate-400">Revenue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={`${darkMode ? 'text-white' : ''}`}>User Distribution by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {analytics.userDistribution.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <MapPin className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : ''}`}>{item.location}</h3>
                      <p className="text-2xl font-bold text-blue-600">{item.users}</p>
                      <p className="text-sm text-slate-500">{item.percentage}% of total</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div>
                  <CardTitle className={`${darkMode ? 'text-white' : ''}`}>Customer Management</CardTitle>
                  <CardDescription className={`${darkMode ? 'text-gray-400' : ''}`}>
                    Manage your customers with advanced tools and analytics
                  </CardDescription>
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
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button onClick={() => setShowUserDialog(true)} size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.filter(user => 
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.phone.includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((user) => (
                    <Card key={user.id} className="p-4 border border-slate-200">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">{user.name}</h3>
                              <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                                {user.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-slate-600">
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{user.phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{user.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{user.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3" />
                                <span>KES {user.totalSpent.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                {user.plan} Plan
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {user.sessionsCount} sessions
                              </span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                {user.usage} used
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setShowUserDialog(true); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setShowMessageDialog(true); }}>
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Vouchers Tab */}
          <TabsContent value="vouchers" className="space-y-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div>
                  <CardTitle className={`${darkMode ? 'text-white' : ''}`}>Voucher Management</CardTitle>
                  <CardDescription className={`${darkMode ? 'text-gray-400' : ''}`}>
                    Generate, manage, and track prepaid vouchers with QR codes
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Generator
                  </Button>
                  <Button onClick={() => setShowVoucherDialog(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vouchers.map((voucher) => (
                    <Card key={voucher.id} className="p-4 border border-slate-200">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Ticket className="h-6 w-6 text-pink-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold font-mono">{voucher.code}</h3>
                              <Badge variant={voucher.status === 'Unused' ? 'default' : 'secondary'}>
                                {voucher.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {voucher.category}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-slate-600">
                              <div>
                                <span className="font-medium">Plan: </span>
                                {voucher.plan}
                              </div>
                              <div>
                                <span className="font-medium">Value: </span>
                                KES {voucher.amount}
                              </div>
                              <div>
                                <span className="font-medium">Created: </span>
                                {voucher.createdAt}
                              </div>
                              <div>
                                <span className="font-medium">Expires: </span>
                                {voucher.expiresAt}
                              </div>
                            </div>
                            {voucher.usedBy && (
                              <div className="mt-2 text-sm text-green-600">
                                Used by: {voucher.usedBy} on {voucher.usedAt}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {voucher.qrCode && (
                            <Button variant="outline" size="sm">
                              <QrCode className="h-3 w-3" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(voucher.code)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : ''}`}>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Total Revenue</span>
                    <span className="font-bold text-green-600">KES {stats.totalSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Commission Earned</span>
                    <span className="font-bold text-blue-600">KES {stats.commission.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Pending Credits</span>
                    <span className="font-bold text-orange-600">KES {stats.pendingCredits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Average Order</span>
                    <span className="font-bold text-purple-600">KES {stats.averageOrderValue}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className={`col-span-2 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : ''}`}>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            transaction.type === 'Commission' ? 'bg-green-100' :
                            transaction.type === 'Credit Top-up' ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                            {transaction.type === 'Commission' ? (
                              <CreditCard className="h-4 w-4 text-green-600" />
                            ) : transaction.type === 'Credit Top-up' ? (
                              <Wallet className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Receipt className="h-4 w-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{transaction.type}</p>
                            <p className="text-xs text-slate-500">{transaction.customer} • {transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+KES {transaction.amount.toLocaleString()}</p>
                          <Badge variant={transaction.status === 'Completed' ? 'default' : 'secondary'} className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* License Management Tab */}
          <TabsContent value="license" className="space-y-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader>
                <CardTitle className={`${darkMode ? 'text-white' : ''} flex items-center`}>
                  <Key className="h-5 w-5 mr-2" />
                  License Management
                </CardTitle>
                <CardDescription className={`${darkMode ? 'text-gray-400' : ''}`}>
                  Manage your reseller license and feature access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* License Status Card */}
                <div className={`p-6 rounded-lg border-2 ${getLicenseStatusColor(license.status)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{license.type} License</h3>
                      <p className="text-sm">License ID: {license.id}</p>
                    </div>
                    <Badge variant={license.status === 'Active' ? 'default' : 'destructive'} className="text-lg px-3 py-1">
                      {license.status}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium">Issued Date</p>
                      <p className="text-lg">{license.issuedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Expiry Date</p>
                      <p className="text-lg">{license.expiryDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Days Until Expiry</p>
                      <p className={`text-lg font-bold ${license.daysUntilExpiry < 60 ? 'text-red-600' : 'text-green-600'}`}>
                        {license.daysUntilExpiry} days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Max Users</p>
                      <p className="text-lg">{license.maxUsers.toLocaleString()}</p>
                    </div>
                  </div>

                  {license.daysUntilExpiry < 60 && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your license expires in {license.daysUntilExpiry} days. Renew now to avoid service interruption.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* License Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>Included Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {license.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* License Actions */}
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => setShowLicenseDialog(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew License
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>

                {/* Usage Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Users ({stats.activeUsers}/{license.maxUsers})</span>
                          <span>{Math.round((stats.activeUsers / license.maxUsers) * 100)}%</span>
                        </div>
                        <Progress value={(stats.activeUsers / license.maxUsers) * 100} className="h-3" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Vouchers ({stats.totalVouchers}/{license.maxVouchers})</span>
                          <span>{Math.round((stats.totalVouchers / license.maxVouchers) * 100)}%</span>
                        </div>
                        <Progress value={(stats.totalVouchers / license.maxVouchers) * 100} className="h-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* License Renewal Dialog */}
      <Dialog open={showLicenseDialog} onOpenChange={setShowLicenseDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>Renew License</DialogTitle>
            <DialogDescription>
              Extend your {license.type} license for another year
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold">{license.type} License Renewal</h3>
              <p className="text-sm text-slate-600 mt-1">
                Current expiry: {license.expiryDate}
              </p>
              <p className="text-sm text-slate-600">
                New expiry: December 31, 2025
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>License Fee</span>
                <span className="font-bold">KES 25,000</span>
              </div>
              <div className="flex justify-between">
                <span>Discount (Early Renewal)</span>
                <span className="text-green-600">-KES 2,500</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>KES 22,500</span>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Early renewal gives you 10% discount and extends from current expiry date.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button 
                onClick={handleRenewLicense}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Renew Now
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowLicenseDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Management Dialog */}
      <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
        <DialogContent className="max-w-lg mx-auto m-4">
          <DialogHeader>
            <DialogTitle>API Management</DialogTitle>
            <DialogDescription>
              Manage your API access and generate new keys
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current API Key</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input value="nts_••••••••••••••••••••" disabled className="font-mono" />
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  Created: January 1, 2024 • Last used: 2 hours ago
                </p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h3 className="font-semibold">API Endpoints Available:</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>GET /api/users</span>
                  <Badge variant="outline">Read</Badge>
                </div>
                <div className="flex justify-between">
                  <span>POST /api/vouchers</span>
                  <Badge variant="outline">Create</Badge>
                </div>
                <div className="flex justify-between">
                  <span>GET /api/analytics</span>
                  <Badge variant="outline">Read</Badge>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                API access is included in your {license.type} license. Rate limit: 1000 requests/hour.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button onClick={handleGenerateApiKey} className="flex-1">
                <Key className="h-4 w-4 mr-2" />
                Generate New Key
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Documentation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-lg mx-auto m-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Portal Settings</DialogTitle>
            <DialogDescription>
              Customize your reseller portal experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Appearance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-slate-500">Toggle dark/light theme</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Kiswahili</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Email notifications</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>SMS alerts</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Credit alerts</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Regional Settings</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Timezone</Label>
                  <Select value={resellerData.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                      <SelectItem value="Africa/Lagos">Africa/Lagos</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={resellerData.currency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button className="flex-1">Save Settings</Button>
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
