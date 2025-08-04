import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { 
  Shield, Users2, Ticket, DollarSign, LogOut, Eye, Plus, Download, CreditCard, Building,
  User, Settings, BarChart3, MessageSquare, Edit, Trash2, Copy, Search, Filter,
  Calendar, TrendingUp, Wallet, Gift, UserPlus, Send, RefreshCw, CheckCircle, XCircle,
  Clock, Bell, Info, AlertTriangle, Target, Globe, Zap, Timer, Router, Menu, X, Home,
  Save, Upload, Trash, Power, Signal, Phone, Mail, MapPin, QrCode, Share, 
  Smartphone, Activity, Network, Database, Cloud, Receipt, Archive, History,
  Star, Award, Layers, Gauge, TrendingDown, Package, Percent, Calculator
} from "lucide-react";

interface RouterType {
  id: number;
  name: string;
  ip: string;
  location: string;
  model: string;
  status: 'Online' | 'Offline' | 'Maintenance';
  users: number;
  lastSync: string;
  username: string;
  password: string;
  uptime: string;
  dataTransferred: string;
}

interface PlanType {
  id: number;
  name: string;
  duration: number;
  price: number;
  speed_down: number;
  speed_up: number;
  category: string;
  commission: number;
  active: boolean;
  description: string;
  popularity: number;
  salesCount: number;
}

interface UserType {
  id: number;
  name: string;
  phone: string;
  email: string;
  plan: string;
  status: 'Active' | 'Expired' | 'Suspended';
  usage: string;
  lastSeen: string;
  amount: number;
  joinDate: string;
  location: string;
  router: string;
  totalSpent: number;
  sessionsCount: number;
  paymentMethod: string;
}

export default function ResellerPortal() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedRouter, setSelectedRouter] = useState<RouterType | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState("7d");

  // Dialog states
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showVoucherDialog, setShowVoucherDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [showRouterDialog, setShowRouterDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const [resellerData] = useState({
    company: "Nairobi Tech Solutions",
    username: "nairobi_tech",
    contact: "James Kimani",
    email: "james@naitech.com",
    phone: "+254701234567",
    location: "Nairobi, Kenya",
    credit: 125000,
    commission: 15,
    tier: "Gold",
    joinDate: "2023-11-15",
    license: "Pro"
  });

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Router Gateway Alpha is Online", message: "Your router is back online and serving 45 users", type: "success", time: "2 min ago", read: false },
    { id: 2, title: "Low Credit Warning", message: "Your credit balance is below KES 10,000", type: "warning", time: "5 min ago", read: false },
    { id: 3, title: "Voucher Sales Report", message: "15 vouchers sold today generating KES 2,340", type: "info", time: "1 hour ago", read: true },
    { id: 4, title: "Commission Payment", message: "KES 3,500 commission credited to your account", type: "success", time: "2 hours ago", read: true },
    { id: 5, title: "New Plan Added", message: "Daily Premium plan is now available for vouchers", type: "info", time: "1 day ago", read: true }
  ]);

  const [resellerSettings, setResellerSettings] = useState({
    notifications: {
      email: {
        enabled: true,
        lowCredit: true,
        routerOffline: true,
        dailyReports: false,
        voucherSales: true,
        commissionPayments: true
      },
      sms: {
        enabled: true,
        criticalAlerts: true,
        routerDown: true,
        lowCredit: false
      },
      push: {
        enabled: true,
        browserNotifications: true,
        soundEnabled: true
      }
    },
    preferences: {
      language: "en",
      timezone: "EAT",
      currency: "KES",
      dateFormat: "dd/MM/yyyy",
      autoRefresh: true,
      refreshInterval: 30,
      defaultVoucherExpiry: 30
    },
    thresholds: {
      lowCreditAmount: 10000,
      routerOfflineMinutes: 5,
      highUsageGB: 50
    }
  });

  const [license] = useState({
    id: "LIC-NT-2024-001",
    type: "Pro",
    status: "Active",
    expiryDate: "2024-12-31",
    daysUntilExpiry: 45,
    features: ["User Management", "Router Control", "Plan Creation", "Advanced Analytics", "API Access"],
    maxUsers: 1000,
    maxRouters: 50,
    maxVouchers: 5000
  });

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  // Generate realistic chart data
  const generateDailyData = () => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    return days.map(day => ({
      date: format(day, 'MMM dd'),
      income: Math.floor(Math.random() * 15000) + 5000,
      vouchers: Math.floor(Math.random() * 50) + 10,
      users: Math.floor(Math.random() * 20) + 5,
      commission: Math.floor((Math.random() * 15000 + 5000) * 0.15)
    }));
  };

  const [dailyData] = useState(generateDailyData());

  const monthlyData = [
    { month: 'Jan', income: 285000, commission: 42750, vouchers: 450, users: 89 },
    { month: 'Feb', income: 320000, commission: 48000, vouchers: 520, users: 104 },
    { month: 'Mar', income: 295000, commission: 44250, vouchers: 480, users: 96 },
    { month: 'Apr', income: 380000, commission: 57000, vouchers: 580, users: 115 },
    { month: 'May', income: 420000, commission: 63000, vouchers: 650, users: 128 },
    { month: 'Jun', income: 465000, commission: 69750, vouchers: 720, users: 142 }
  ];

  const planPerformanceData = [
    { name: 'Daily Premium', sales: 156, revenue: 28080, color: '#8884d8' },
    { name: 'Daily Standard', sales: 89, revenue: 10680, color: '#82ca9d' },
    { name: 'All Day Basic', sales: 134, revenue: 10720, color: '#ffc658' },
    { name: 'Quick Browse', sales: 267, revenue: 4005, color: '#ff7300' },
    { name: 'Extended Session', sales: 45, revenue: 2025, color: '#0088fe' }
  ];

  const customerDistribution = [
    { location: 'Nairobi', count: 45, percentage: 52.3 },
    { location: 'Kiambu', count: 23, percentage: 26.7 },
    { location: 'Thika', count: 12, percentage: 14.0 },
    { location: 'Machakos', count: 6, percentage: 7.0 }
  ];

  const [routers, setRouters] = useState<RouterType[]>([
    {
      id: 1, name: "Gateway Alpha", ip: "192.168.10.1", location: "Nairobi Central",
      model: "RB4011iGS+", status: "Online", users: 45, lastSync: "2 min ago",
      username: "admin", password: "secure123", uptime: "99.8%", dataTransferred: "2.1 TB"
    },
    {
      id: 2, name: "Branch Beta", ip: "192.168.11.1", location: "Kiambu Office",
      model: "RB3011UiAS", status: "Online", users: 23, lastSync: "1 min ago",
      username: "admin", password: "branch456", uptime: "99.5%", dataTransferred: "1.4 TB"
    },
    {
      id: 3, name: "Backup Gamma", ip: "192.168.12.1", location: "Backup Site",
      model: "RB2011UiAS", status: "Maintenance", users: 0, lastSync: "2 hours ago",
      username: "admin", password: "backup789", uptime: "95.2%", dataTransferred: "0.8 TB"
    }
  ]);

  const [plans, setPlans] = useState<PlanType[]>([
    {
      id: 1, name: "Quick Browse", duration: 1, price: 15, speed_down: 5, speed_up: 2,
      category: "hourly", commission: 2.25, active: true, popularity: 85,
      description: "Perfect for quick browsing and social media", salesCount: 267
    },
    {
      id: 2, name: "Extended Session", duration: 4, price: 45, speed_down: 15, speed_up: 8,
      category: "hourly", commission: 6.75, active: true, popularity: 60,
      description: "Extended browsing with high speed", salesCount: 45
    },
    {
      id: 3, name: "All Day Basic", duration: 24, price: 80, speed_down: 8, speed_up: 4,
      category: "daily", commission: 12, active: true, popularity: 75,
      description: "Full day internet access", salesCount: 134
    },
    {
      id: 4, name: "Daily Standard", duration: 24, price: 120, speed_down: 15, speed_up: 8,
      category: "daily", commission: 18, active: true, popularity: 70,
      description: "High-speed all-day package", salesCount: 89
    },
    {
      id: 5, name: "Daily Premium", duration: 24, price: 180, speed_down: 25, speed_up: 15,
      category: "daily", commission: 27, active: true, popularity: 90,
      description: "Premium high-speed internet", salesCount: 156
    }
  ]);

  const [users, setUsers] = useState<UserType[]>([
    {
      id: 1, name: "John Mwangi", phone: "+254712345678", email: "john@example.com",
      plan: "Daily Premium", status: "Active", usage: "12.5 GB", lastSeen: "2 min ago",
      amount: 180, joinDate: "2023-12-15", location: "Nairobi", router: "Gateway Alpha",
      totalSpent: 2340, sessionsCount: 45, paymentMethod: "M-Pesa"
    },
    {
      id: 2, name: "Grace Njeri", phone: "+254723456789", email: "grace@example.com",
      plan: "Daily Standard", status: "Active", usage: "8.2 GB", lastSeen: "5 min ago",
      amount: 120, joinDate: "2024-01-02", location: "Kiambu", router: "Branch Beta",
      totalSpent: 1440, sessionsCount: 12, paymentMethod: "Airtel Money"
    },
    {
      id: 3, name: "Peter Ochieng", phone: "+254734567890", email: "peter@example.com",
      plan: "Quick Browse", status: "Expired", usage: "3.1 GB", lastSeen: "1 hour ago",
      amount: 15, joinDate: "2023-11-20", location: "Thika", router: "Gateway Alpha",
      totalSpent: 450, sessionsCount: 30, paymentMethod: "M-Pesa"
    },
    {
      id: 4, name: "Mary Wanjiku", phone: "+254745678901", email: "mary@example.com",
      plan: "All Day Basic", status: "Active", usage: "6.8 GB", lastSeen: "15 min ago",
      amount: 80, joinDate: "2024-01-10", location: "Nairobi", router: "Gateway Alpha",
      totalSpent: 720, sessionsCount: 18, paymentMethod: "Bank Transfer"
    }
  ]);

  const [vouchers, setVouchers] = useState([
    {
      id: 1, code: "NT240001", plan: "Quick Browse", amount: 15, status: "Unused",
      createdAt: "2024-01-15", expiresAt: "2024-03-15", router: "Gateway Alpha"
    },
    {
      id: 2, code: "NT240002", plan: "Daily Premium", amount: 180, status: "Used",
      createdAt: "2024-01-14", expiresAt: "2024-03-14", router: "Gateway Alpha",
      usedBy: "John Mwangi", usedAt: "2024-01-16"
    }
  ]);

  const [transactions] = useState([
    { id: 1, date: "2024-01-18", amount: 15750, type: "Voucher Sales", status: "Completed" },
    { id: 2, date: "2024-01-17", amount: 2362, type: "Commission", status: "Completed" },
    { id: 3, date: "2024-01-16", amount: 25000, type: "Credit Top-up", status: "Pending" },
    { id: 4, date: "2024-01-15", amount: 12400, type: "Voucher Sales", status: "Completed" }
  ]);

  const stats = {
    totalIncome: dailyData.reduce((sum, day) => sum + day.income, 0),
    totalCommission: dailyData.reduce((sum, day) => sum + day.commission, 0),
    activeUsers: users.filter(u => u.status === 'Active').length,
    totalVouchers: vouchers.length,
    activeRouters: routers.filter(r => r.status === 'Online').length,
    activePlans: plans.filter(p => p.active).length
  };

  const navItems = [
    { id: "dashboard", name: "Dashboard", icon: Home },
    { id: "analytics", name: "Analytics", icon: BarChart3 },
    { id: "users", name: "Users", icon: Users2 },
    { id: "vouchers", name: "Vouchers", icon: Ticket },
    { id: "routers", name: "Routers", icon: Router },
    { id: "plans", name: "Plans", icon: Timer },
    { id: "financial", name: "Financial", icon: DollarSign },
    { id: "license", name: "License", icon: Shield }
  ];

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

  // Router Management Functions
  const handleAddRouter = () => {
    setSelectedRouter(null);
    setShowRouterDialog(true);
  };

  const handleEditRouter = (router: RouterType) => {
    setSelectedRouter(router);
    setShowRouterDialog(true);
  };

  const handleDeleteRouter = (id: number) => {
    if (confirm('Are you sure you want to delete this router? This action cannot be undone.')) {
      setRouters(routers.filter(r => r.id !== id));
      alert('Router deleted successfully!');
    }
  };

  const handleSaveRouter = (formData: FormData) => {
    const routerData = {
      name: formData.get('name') as string,
      ip: formData.get('ip') as string,
      location: formData.get('location') as string,
      model: formData.get('model') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      status: 'Online' as const,
      users: 0,
      lastSync: 'Just now',
      uptime: '100%',
      dataTransferred: '0 GB'
    };

    if (selectedRouter?.id) {
      setRouters(routers.map(r => r.id === selectedRouter.id ? { ...r, ...routerData } : r));
    } else {
      setRouters([...routers, { id: Date.now(), ...routerData }]);
    }
    setShowRouterDialog(false);
    alert(selectedRouter ? 'Router updated successfully!' : 'Router added successfully!');
  };

  const handleToggleRouter = (id: number) => {
    setRouters(routers.map(r => 
      r.id === id 
        ? { ...r, status: r.status === 'Online' ? 'Offline' : 'Online' as const }
        : r
    ));
  };

  const handleRestartRouter = (id: number) => {
    setIsLoading(true);
    setTimeout(() => {
      setRouters(routers.map(r => 
        r.id === id ? { ...r, lastSync: 'Just now', status: 'Online' as const } : r
      ));
      setIsLoading(false);
      alert('Router restarted successfully!');
    }, 2000);
  };

  // Plan Management Functions
  const handleAddPlan = () => {
    setSelectedPlan(null);
    setShowPlanDialog(true);
  };

  const handleEditPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    setShowPlanDialog(true);
  };

  const handleDeletePlan = (id: number) => {
    if (confirm('Are you sure you want to delete this plan? This will affect existing vouchers.')) {
      setPlans(plans.filter(p => p.id !== id));
      alert('Plan deleted successfully!');
    }
  };

  const handleSavePlan = (formData: FormData) => {
    const price = parseInt(formData.get('price') as string);
    const planData = {
      name: formData.get('name') as string,
      duration: parseInt(formData.get('duration') as string),
      price: price,
      speed_down: parseInt(formData.get('speed_down') as string),
      speed_up: parseInt(formData.get('speed_up') as string),
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      commission: Math.round(price * 0.15 * 100) / 100,
      active: true,
      popularity: 50,
      salesCount: 0
    };

    if (selectedPlan?.id) {
      setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, ...planData } : p));
    } else {
      setPlans([...plans, { id: Date.now(), ...planData }]);
    }
    setShowPlanDialog(false);
    alert(selectedPlan ? 'Plan updated successfully!' : 'Plan created successfully!');
  };

  const handleTogglePlan = (id: number) => {
    setPlans(plans.map(p => 
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  // User Management Functions
  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleSuspendUser = (id: number) => {
    if (confirm('Are you sure you want to suspend this user?')) {
      setUsers(users.map(u => 
        u.id === id ? { ...u, status: 'Suspended' as const } : u
      ));
      alert('User suspended successfully!');
    }
  };

  const handleSendMessage = (user: UserType) => {
    setSelectedUser(user);
    setShowMessageDialog(true);
  };

  const handleMessageSubmit = (formData: FormData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Message sent to ${selectedUser?.name} via SMS`);
      setShowMessageDialog(false);
    }, 1500);
  };

  // Voucher Management Functions
  const handleGenerateVouchers = () => {
    setShowVoucherDialog(true);
  };

  const handleVoucherGeneration = (formData: FormData) => {
    const planId = parseInt(formData.get('planId') as string);
    const quantity = parseInt(formData.get('quantity') as string);
    const plan = plans.find(p => p.id === planId);
    
    if (plan && quantity > 0) {
      const newVouchers = Array.from({ length: quantity }, (_, i) => ({
        id: Date.now() + i,
        code: `NT${Date.now().toString().slice(-6)}${String(i + 1).padStart(2, '0')}`,
        plan: plan.name,
        amount: plan.price,
        status: "Unused",
        createdAt: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        router: routers[0]?.name || "Gateway Alpha"
      }));
      
      setVouchers([...vouchers, ...newVouchers]);
      alert(`${quantity} vouchers generated successfully!`);
    }
    setShowVoucherDialog(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Financial Functions
  const handleRequestCredit = () => {
    setShowCreditDialog(true);
  };

  const handleCreditRequest = (formData: FormData) => {
    const amount = parseInt(formData.get('amount') as string);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Credit request for KES ${amount.toLocaleString()} submitted successfully!`);
      setShowCreditDialog(false);
    }, 2000);
  };

  // License Functions
  const handleRenewLicense = () => {
    setShowLicenseDialog(true);
  };

  const handleLicenseRenewal = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('License renewed successfully! Valid until December 31, 2025.');
      setShowLicenseDialog(false);
    }, 2000);
  };

  // Notification Functions
  const markNotificationRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleSettingsSave = (formData: FormData) => {
    setResellerSettings({
      notifications: {
        email: {
          enabled: formData.get('emailEnabled') === 'on',
          lowCredit: formData.get('emailLowCredit') === 'on',
          routerOffline: formData.get('emailRouterOffline') === 'on',
          dailyReports: formData.get('emailDailyReports') === 'on',
          voucherSales: formData.get('emailVoucherSales') === 'on',
          commissionPayments: formData.get('emailCommissionPayments') === 'on'
        },
        sms: {
          enabled: formData.get('smsEnabled') === 'on',
          criticalAlerts: formData.get('smsCriticalAlerts') === 'on',
          routerDown: formData.get('smsRouterDown') === 'on',
          lowCredit: formData.get('smsLowCredit') === 'on'
        },
        push: {
          enabled: formData.get('pushEnabled') === 'on',
          browserNotifications: formData.get('pushBrowser') === 'on',
          soundEnabled: formData.get('pushSound') === 'on'
        }
      },
      preferences: {
        language: formData.get('language') as string,
        timezone: formData.get('timezone') as string,
        currency: formData.get('currency') as string,
        dateFormat: formData.get('dateFormat') as string,
        autoRefresh: formData.get('autoRefresh') === 'on',
        refreshInterval: parseInt(formData.get('refreshInterval') as string),
        defaultVoucherExpiry: parseInt(formData.get('defaultVoucherExpiry') as string)
      },
      thresholds: {
        lowCreditAmount: parseInt(formData.get('lowCreditAmount') as string),
        routerOfflineMinutes: parseInt(formData.get('routerOfflineMinutes') as string),
        highUsageGB: parseInt(formData.get('highUsageGB') as string)
      }
    });
    setShowSettingsDialog(false);
    alert('Settings saved successfully!');
  };

  const handleProfileUpdate = (formData: FormData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Profile updated successfully!');
      setShowProfileDialog(false);
    }, 1500);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              NetSafi Reseller Portal
            </CardTitle>
            <CardDescription className="text-gray-600">
              Professional ISP Management System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-700">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="border-gray-300 focus:border-blue-500"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800">
                <Shield className="h-4 w-4 mr-2" />
                Sign In to Portal
              </Button>
            </form>
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Demo Login:</strong><br />
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">NetSafi</h1>
              <p className="text-xs text-gray-500">Reseller Portal</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                activeView === item.id 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700 font-medium">Credit Balance</span>
              <span className="text-green-800 font-bold">KES {resellerData.credit.toLocaleString()}</span>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{resellerData.company}</h1>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">{resellerData.tier} Tier</Badge>
                <Badge className="text-xs bg-green-100 text-green-800">License Active</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={() => setShowNotificationsDialog(true)} className="relative">
              <Bell className="h-4 w-4" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Monthly Income</p>
                        <p className="text-2xl font-bold text-gray-900">KES {Math.floor(stats.totalIncome / 1000)}K</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +12.5% from last month
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                          <Users2 className="h-3 w-3 mr-1" />
                          {users.length} total customers
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users2 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                        <p className="text-2xl font-bold text-gray-900">KES {Math.floor(stats.totalCommission / 1000)}K</p>
                        <p className="text-xs text-purple-600 flex items-center mt-1">
                          <Percent className="h-3 w-3 mr-1" />
                          15% commission rate
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Network Status</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeRouters}/{routers.length}</p>
                        <p className="text-xs text-orange-600 flex items-center mt-1">
                          <Router className="h-3 w-3 mr-1" />
                          Routers online
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Router className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Income Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Income Trend</CardTitle>
                    <CardDescription>Revenue and commission over the last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value: any) => [`KES ${value.toLocaleString()}`, ""]} />
                          <Area type="monotone" dataKey="income" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="commission" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Performance Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Performance</CardTitle>
                    <CardDescription>Revenue distribution by plan type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={planPerformanceData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="revenue"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {planPerformanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`KES ${value.toLocaleString()}`, "Revenue"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button onClick={handleAddRouter} className="h-20 flex-col bg-gradient-to-br from-blue-500 to-blue-600">
                      <Router className="h-6 w-6 mb-2" />
                      Add Router
                    </Button>
                    <Button onClick={handleAddPlan} variant="outline" className="h-20 flex-col">
                      <Timer className="h-6 w-6 mb-2" />
                      Create Plan
                    </Button>
                    <Button onClick={handleGenerateVouchers} variant="outline" className="h-20 flex-col">
                      <Ticket className="h-6 w-6 mb-2" />
                      Generate Vouchers
                    </Button>
                    <Button onClick={handleRequestCredit} variant="outline" className="h-20 flex-col">
                      <Wallet className="h-6 w-6 mb-2" />
                      Request Credit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics View */}
          {activeView === "analytics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Business Analytics</h2>
                  <p className="text-gray-600">Comprehensive insights into your business performance</p>
                </div>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="3m">Last 3 months</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Monthly Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue Growth</CardTitle>
                  <CardDescription>Track your business growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [`KES ${value.toLocaleString()}`, ""]} />
                        <Legend />
                        <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3} name="Income" />
                        <Line type="monotone" dataKey="commission" stroke="#8b5cf6" strokeWidth={3} name="Commission" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Distribution</CardTitle>
                    <CardDescription>Geographic breakdown of your customer base</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {customerDistribution.map((location, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <MapPin className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium">{location.location}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{location.count} users</p>
                            <p className="text-sm text-gray-500">{location.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Plans</CardTitle>
                    <CardDescription>Plans ranked by sales volume and revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {planPerformanceData.map((plan, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="font-bold text-green-600">#{index + 1}</span>
                            </div>
                            <span className="font-medium">{plan.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">KES {plan.revenue.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{plan.sales} sales</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Routers View */}
          {activeView === "routers" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Router Management</h2>
                  <p className="text-gray-600">Monitor and manage your network infrastructure</p>
                </div>
                <Button onClick={handleAddRouter}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Router
                </Button>
              </div>

              <div className="grid gap-6">
                {routers.map((router) => (
                  <Card key={router.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            router.status === 'Online' ? 'bg-green-100' : 
                            router.status === 'Maintenance' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            <Router className={`h-6 w-6 ${
                              router.status === 'Online' ? 'text-green-600' : 
                              router.status === 'Maintenance' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{router.name}</h3>
                              <Badge variant={router.status === 'Online' ? 'default' : router.status === 'Maintenance' ? 'secondary' : 'destructive'}>
                                {router.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">IP Address</p>
                                <p className="font-medium">{router.ip}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Location</p>
                                <p className="font-medium">{router.location}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Connected Users</p>
                                <p className="font-medium">{router.users}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Uptime</p>
                                <p className="font-medium text-green-600">{router.uptime}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleToggleRouter(router.id)}>
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRestartRouter(router.id)} disabled={isLoading}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditRouter(router)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteRouter(router.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Plans View */}
          {activeView === "plans" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Plan Management</h2>
                  <p className="text-gray-600">Create and manage internet plans for your customers</p>
                </div>
                <Button onClick={handleAddPlan}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                  <Card key={plan.id} className="relative">
                    {plan.popularity > 80 && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-orange-500">Popular</Badge>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={plan.active ? "default" : "secondary"}>
                          {plan.active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{plan.category}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Price</span>
                          <span className="text-lg font-bold text-green-600">KES {plan.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Duration</span>
                          <span className="font-medium">{plan.duration} hours</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Speed</span>
                          <span className="font-medium">{plan.speed_down}/{plan.speed_up} Mbps</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Commission</span>
                          <span className="font-medium text-purple-600">KES {plan.commission}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Sales</span>
                          <span className="font-medium">{plan.salesCount} vouchers sold</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 mt-6">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditPlan(plan)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleTogglePlan(plan.id)}>
                          {plan.active ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Users View */}
          {activeView === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
                  <p className="text-gray-600">View and manage your customer accounts</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Search customers..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {users.filter(user => 
                  user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.phone.includes(searchTerm) ||
                  user.email.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                              <Badge variant={user.status === 'Active' ? 'default' : user.status === 'Expired' ? 'destructive' : 'secondary'}>
                                {user.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Phone</p>
                                <p className="font-medium">{user.phone}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Current Plan</p>
                                <p className="font-medium">{user.plan}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Total Spent</p>
                                <p className="font-medium text-green-600">KES {user.totalSpent.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Last Seen</p>
                                <p className="font-medium">{user.lastSeen}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleSendMessage(user)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleSuspendUser(user.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Vouchers View */}
          {activeView === "vouchers" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Voucher Management</h2>
                  <p className="text-gray-600">Generate and manage prepaid vouchers</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button onClick={handleGenerateVouchers}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              <div className="grid gap-6">
                {vouchers.map((voucher) => (
                  <Card key={voucher.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Ticket className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold font-mono text-gray-900">{voucher.code}</h3>
                              <Badge variant={voucher.status === 'Unused' ? 'default' : 'secondary'}>
                                {voucher.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Plan</p>
                                <p className="font-medium">{voucher.plan}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Value</p>
                                <p className="font-medium text-green-600">KES {voucher.amount}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Expires</p>
                                <p className="font-medium">{voucher.expiresAt}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Router</p>
                                <p className="font-medium">{voucher.router}</p>
                              </div>
                            </div>
                            {voucher.usedBy && (
                              <div className="mt-2 text-sm text-blue-600">
                                Used by: {voucher.usedBy} on {voucher.usedAt}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(voucher.code)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Financial View */}
          {activeView === "financial" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Financial Management</h2>
                  <p className="text-gray-600">Track revenue, commissions, and manage credits</p>
                </div>
                <Button onClick={handleRequestCredit}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Credit
                </Button>
              </div>

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">KES {stats.totalIncome.toLocaleString()}</p>
                        <p className="text-xs text-green-600 mt-1">This month</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                        <p className="text-2xl font-bold text-purple-600">KES {stats.totalCommission.toLocaleString()}</p>
                        <p className="text-xs text-purple-600 mt-1">15% rate</p>
                      </div>
                      <Percent className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Credit Balance</p>
                        <p className="text-2xl font-bold text-blue-600">KES {resellerData.credit.toLocaleString()}</p>
                        <p className="text-xs text-blue-600 mt-1">Available</p>
                      </div>
                      <Wallet className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest financial activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === 'Commission' ? 'bg-purple-100' :
                            transaction.type === 'Credit Top-up' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {transaction.type === 'Commission' ? (
                              <Percent className="h-5 w-5 text-purple-600" />
                            ) : transaction.type === 'Credit Top-up' ? (
                              <Wallet className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Receipt className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.type}</p>
                            <p className="text-sm text-gray-500">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+KES {transaction.amount.toLocaleString()}</p>
                          <Badge variant={transaction.status === 'Completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* License View */}
          {activeView === "license" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">License Management</h2>
                  <p className="text-gray-600">Manage your reseller license and permissions</p>
                </div>
                <Button onClick={handleRenewLicense}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renew License
                </Button>
              </div>

              {/* License Status */}
              <Card className={`border-2 ${license.daysUntilExpiry < 30 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{license.type} License</h3>
                      <p className="text-sm text-gray-600">License ID: {license.id}</p>
                    </div>
                    <Badge variant={license.status === 'Active' ? 'default' : 'destructive'} className="text-lg px-4 py-2">
                      {license.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expires</p>
                      <p className="text-lg font-bold">{license.expiryDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Days Remaining</p>
                      <p className={`text-lg font-bold ${license.daysUntilExpiry < 30 ? 'text-red-600' : 'text-green-600'}`}>
                        {license.daysUntilExpiry} days
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Max Users</p>
                      <p className="text-lg font-bold">{license.maxUsers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Max Routers</p>
                      <p className="text-lg font-bold">{license.maxRouters}</p>
                    </div>
                  </div>

                  {license.daysUntilExpiry < 30 && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your license expires in {license.daysUntilExpiry} days. Renew now to avoid service interruption.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* License Features */}
              <Card>
                <CardHeader>
                  <CardTitle>License Features</CardTitle>
                  <CardDescription>Features included in your {license.type} license</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {license.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>Current usage against license limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Users ({stats.activeUsers}/{license.maxUsers})</span>
                        <span className="text-sm text-gray-500">{Math.round((stats.activeUsers / license.maxUsers) * 100)}%</span>
                      </div>
                      <Progress value={(stats.activeUsers / license.maxUsers) * 100} className="h-3" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Routers ({stats.activeRouters}/{license.maxRouters})</span>
                        <span className="text-sm text-gray-500">{Math.round((stats.activeRouters / license.maxRouters) * 100)}%</span>
                      </div>
                      <Progress value={(stats.activeRouters / license.maxRouters) * 100} className="h-3" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Vouchers ({stats.totalVouchers}/{license.maxVouchers})</span>
                        <span className="text-sm text-gray-500">{Math.round((stats.totalVouchers / license.maxVouchers) * 100)}%</span>
                      </div>
                      <Progress value={(stats.totalVouchers / license.maxVouchers) * 100} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      {/* Router Dialog */}
      <Dialog open={showRouterDialog} onOpenChange={setShowRouterDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>{selectedRouter ? 'Edit Router' : 'Add New Router'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSaveRouter(new FormData(e.target));
          }} className="space-y-4">
            <div>
              <Label>Router Name</Label>
              <Input name="name" defaultValue={selectedRouter?.name} placeholder="Gateway Alpha" required />
            </div>
            <div>
              <Label>IP Address</Label>
              <Input name="ip" defaultValue={selectedRouter?.ip} placeholder="192.168.1.1" required />
            </div>
            <div>
              <Label>Location</Label>
              <Input name="location" defaultValue={selectedRouter?.location} placeholder="Main Office" required />
            </div>
            <div>
              <Label>Model</Label>
              <Select name="model" defaultValue={selectedRouter?.model} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RB4011iGS+">RB4011iGS+</SelectItem>
                  <SelectItem value="RB3011UiAS">RB3011UiAS</SelectItem>
                  <SelectItem value="RB2011UiAS">RB2011UiAS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Username</Label>
                <Input name="username" defaultValue={selectedRouter?.username} required />
              </div>
              <div>
                <Label>Password</Label>
                <Input name="password" type="password" defaultValue={selectedRouter?.password} required />
              </div>
            </div>
            <Button type="submit" className="w-full">
              {selectedRouter ? 'Update Router' : 'Add Router'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>{selectedPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSavePlan(new FormData(e.target));
          }} className="space-y-4">
            <div>
              <Label>Plan Name</Label>
              <Input name="name" defaultValue={selectedPlan?.name} placeholder="Daily Premium" required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea name="description" defaultValue={selectedPlan?.description} placeholder="Plan description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration (hours)</Label>
                <Input name="duration" type="number" defaultValue={selectedPlan?.duration} required />
              </div>
              <div>
                <Label>Price (KES)</Label>
                <Input name="price" type="number" defaultValue={selectedPlan?.price} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Download Speed (Mbps)</Label>
                <Input name="speed_down" type="number" defaultValue={selectedPlan?.speed_down} required />
              </div>
              <div>
                <Label>Upload Speed (Mbps)</Label>
                <Input name="speed_up" type="number" defaultValue={selectedPlan?.speed_up} required />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select name="category" defaultValue={selectedPlan?.category} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              {selectedPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Voucher Generation Dialog */}
      <Dialog open={showVoucherDialog} onOpenChange={setShowVoucherDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>Generate Vouchers</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleVoucherGeneration(new FormData(e.target));
          }} className="space-y-4">
            <div>
              <Label>Select Plan</Label>
              <Select name="planId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.filter(p => p.active).map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name} - KES {plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input name="quantity" type="number" min="1" max="100" placeholder="10" required />
            </div>
            <Button type="submit" className="w-full">Generate Vouchers</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>Send SMS to {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleMessageSubmit(new FormData(e.target));
          }} className="space-y-4">
            <div>
              <Label>Message</Label>
              <Textarea name="message" placeholder="Type your message..." required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credit Request Dialog */}
      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>Request Credit</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreditRequest(new FormData(e.target));
          }} className="space-y-4">
            <div>
              <Label>Amount (KES)</Label>
              <Input name="amount" type="number" min="1000" placeholder="10000" required />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select name="method" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Request Credit'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* License Renewal Dialog */}
      <Dialog open={showLicenseDialog} onOpenChange={setShowLicenseDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>Renew License</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold">Pro License Renewal</h3>
              <p className="text-sm text-gray-600">Extend your license for another year</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>License Fee</span>
                <span className="font-bold">KES 25,000</span>
              </div>
            </div>
            <Button onClick={handleLicenseRenewal} className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Renew License'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
