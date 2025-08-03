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
  Phone,
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
  WifiOff,
  Menu,
  X,
  Home,
  Save,
  Upload,
  Trash,
  Power,
  Signal
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
  maxRouters: number;
  daysUntilExpiry: number;
}

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
  assignedPlans: number[];
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
}

export default function ResellerPortal() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dialog states
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showVoucherDialog, setShowVoucherDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
  const [showRouterDialog, setShowRouterDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  const [resellerData, setResellerData] = useState({
    company: "Nairobi Tech Solutions",
    username: "nairobi_tech",
    contact: "James Kimani",
    email: "james@naitech.com",
    phone: "+254701234567",
    location: "Nairobi",
    website: "https://naitech.com",
    credit: 125000,
    commission: 15,
    tier: "Gold",
    permissions: ["users", "vouchers", "plans", "reports", "api", "routers"],
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
    features: ["User Management", "Voucher Generation", "Router Management", "Plan Creation", "API Access", "Advanced Reports", "Bulk Operations"],
    maxUsers: 1000,
    maxVouchers: 5000,
    maxRouters: 50,
    daysUntilExpiry: 320
  });

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  const [routers, setRouters] = useState<RouterType[]>([
    {
      id: 1,
      name: "Main Gateway - Nairobi",
      ip: "192.168.10.1",
      location: "Nairobi Central Office",
      model: "RB4011iGS+",
      status: "Online",
      users: 45,
      lastSync: "2 min ago",
      username: "admin",
      password: "secure123",
      assignedPlans: [1, 2, 4, 6]
    },
    {
      id: 2,
      name: "Branch Router - Kiambu",
      ip: "192.168.11.1",
      location: "Kiambu Branch",
      model: "RB3011UiAS",
      status: "Online",
      users: 23,
      lastSync: "5 min ago",
      username: "admin",
      password: "kiambu456",
      assignedPlans: [1, 2, 4]
    },
    {
      id: 3,
      name: "Backup Router - Nairobi",
      ip: "192.168.12.1",
      location: "Nairobi Backup Site",
      model: "RB2011UiAS",
      status: "Maintenance",
      users: 0,
      lastSync: "2 hours ago",
      username: "admin",
      password: "backup789",
      assignedPlans: []
    }
  ]);

  const [plans, setPlans] = useState<PlanType[]>([
    {
      id: 1,
      name: "Quick Browse - 1 Hour",
      duration: 1,
      price: 15,
      speed_down: 5,
      speed_up: 2,
      category: "hourly",
      commission: 2.25,
      active: true,
      description: "Perfect for quick browsing and social media"
    },
    {
      id: 2,
      name: "Standard Browse - 2 Hours",
      duration: 2,
      price: 25,
      speed_down: 10,
      speed_up: 5,
      category: "hourly",
      commission: 3.75,
      active: true,
      description: "Ideal for streaming and downloads"
    },
    {
      id: 3,
      name: "Extended Session - 4 Hours",
      duration: 4,
      price: 45,
      speed_down: 15,
      speed_up: 8,
      category: "hourly",
      commission: 6.75,
      active: true,
      description: "Extended browsing with high speed"
    },
    {
      id: 4,
      name: "All Day Basic - 24 Hours",
      duration: 24,
      price: 80,
      speed_down: 8,
      speed_up: 4,
      category: "daily",
      commission: 12,
      active: true,
      description: "Full day internet access"
    },
    {
      id: 5,
      name: "All Day Standard - 24 Hours",
      duration: 24,
      price: 120,
      speed_down: 15,
      speed_up: 8,
      category: "daily",
      commission: 18,
      active: true,
      description: "High-speed all-day package"
    },
    {
      id: 6,
      name: "All Day Premium - 24 Hours",
      duration: 24,
      price: 180,
      speed_down: 25,
      speed_up: 15,
      category: "daily",
      commission: 27,
      active: true,
      description: "Premium high-speed internet"
    }
  ]);

  const [users, setUsers] = useState([
    { 
      id: 1, 
      name: "John Mwangi", 
      phone: "+254712345678", 
      email: "john@example.com",
      plan: "All Day Premium", 
      status: "Active", 
      usage: "12.5 GB", 
      lastSeen: "2 min ago", 
      amount: 180, 
      joinDate: "2023-12-15",
      location: "Nairobi",
      deviceInfo: "Samsung Galaxy S21",
      paymentMethod: "M-Pesa",
      totalSpent: 2340,
      sessionsCount: 45,
      router: "Main Gateway - Nairobi"
    },
    { 
      id: 2, 
      name: "Grace Njeri", 
      phone: "+254723456789", 
      email: "grace@example.com",
      plan: "All Day Standard", 
      status: "Active", 
      usage: "8.2 GB", 
      lastSeen: "5 min ago", 
      amount: 120, 
      joinDate: "2024-01-02",
      location: "Kiambu",
      deviceInfo: "iPhone 12",
      paymentMethod: "Airtel Money",
      totalSpent: 1440,
      sessionsCount: 12,
      router: "Branch Router - Kiambu"
    },
    { 
      id: 3, 
      name: "Peter Ochieng", 
      phone: "+254734567890", 
      email: "peter@example.com",
      plan: "Quick Browse", 
      status: "Expired", 
      usage: "3.1 GB", 
      lastSeen: "1 hour ago", 
      amount: 15, 
      joinDate: "2023-11-20",
      location: "Nairobi",
      deviceInfo: "Tecno Spark 8",
      paymentMethod: "M-Pesa",
      totalSpent: 450,
      sessionsCount: 30,
      router: "Main Gateway - Nairobi"
    }
  ]);

  const [vouchers, setVouchers] = useState([
    { 
      id: 1, 
      code: "NT2024001", 
      plan: "Quick Browse - 1 Hour", 
      planId: 1, 
      amount: 15, 
      status: "Unused", 
      createdAt: "2024-01-15", 
      expiresAt: "2024-03-15", 
      usedAt: null, 
      usedBy: null,
      batchId: "BATCH-001",
      qrCode: true,
      category: "Promotional",
      router: "Main Gateway - Nairobi"
    },
    { 
      id: 2, 
      code: "NT2024002", 
      plan: "All Day Standard", 
      planId: 5, 
      amount: 120, 
      status: "Used", 
      createdAt: "2024-01-14", 
      expiresAt: "2024-03-14", 
      usedAt: "2024-01-16", 
      usedBy: "John Mwangi",
      batchId: "BATCH-001",
      qrCode: true,
      category: "Regular",
      router: "Main Gateway - Nairobi"
    }
  ]);

  const [stats, setStats] = useState({
    activeUsers: 48,
    totalVouchers: 250,
    usedVouchers: 156,
    totalSales: 285000,
    commission: 42750,
    monthlyGrowth: 18.5,
    pendingCredits: 12000,
    averageOrderValue: 95,
    conversionRate: 72.3,
    customerSatisfaction: 94.8,
    networkUptime: 99.7,
    supportTickets: 3,
    activeRouters: 2,
    activePlans: 6
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
      title: "Router Online", 
      message: "Main Gateway - Nairobi router is back online and serving customers.", 
      type: "success", 
      priority: "normal",
      time: "1 day ago", 
      read: true
    }
  ]);

  const navItems = [
    { id: "dashboard", name: "Dashboard", icon: Home, active: activeView === "dashboard" },
    { id: "analytics", name: "Analytics", icon: BarChart3, active: activeView === "analytics" },
    { id: "users", name: "Users", icon: Users2, active: activeView === "users" },
    { id: "vouchers", name: "Vouchers", icon: Ticket, active: activeView === "vouchers" },
    { id: "routers", name: "Routers", icon: Router, active: activeView === "routers" },
    { id: "plans", name: "Plans", icon: Timer, active: activeView === "plans" },
    { id: "financial", name: "Financial", icon: DollarSign, active: activeView === "financial" },
    { id: "license", name: "License", icon: Key, active: activeView === "license" }
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

  const handleAddRouter = () => {
    setSelectedRouter(null);
    setShowRouterDialog(true);
  };

  const handleEditRouter = (router: RouterType) => {
    setSelectedRouter(router);
    setShowRouterDialog(true);
  };

  const handleDeleteRouter = (id: number) => {
    if (confirm('Are you sure you want to delete this router?')) {
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
      assignedPlans: []
    };

    if (selectedRouter?.id) {
      setRouters(routers.map(r => r.id === selectedRouter.id ? { ...r, ...routerData } : r));
      alert('Router updated successfully!');
    } else {
      setRouters([...routers, { id: Date.now(), ...routerData }]);
      alert('Router added successfully!');
    }
    setShowRouterDialog(false);
  };

  const handleAddPlan = () => {
    setSelectedPlan(null);
    setShowPlanDialog(true);
  };

  const handleEditPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    setShowPlanDialog(true);
  };

  const handleDeletePlan = (id: number) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter(p => p.id !== id));
      alert('Plan deleted successfully!');
    }
  };

  const handleSavePlan = (formData: FormData) => {
    const planData = {
      name: formData.get('name') as string,
      duration: parseInt(formData.get('duration') as string),
      price: parseInt(formData.get('price') as string),
      speed_down: parseInt(formData.get('speed_down') as string),
      speed_up: parseInt(formData.get('speed_up') as string),
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      commission: Math.round(parseInt(formData.get('price') as string) * (resellerData.commission / 100) * 100) / 100,
      active: true
    };

    if (selectedPlan?.id) {
      setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, ...planData } : p));
      alert('Plan updated successfully!');
    } else {
      setPlans([...plans, { id: Date.now(), ...planData }]);
      alert('Plan created successfully!');
    }
    setShowPlanDialog(false);
  };

  const handleGenerateVouchers = () => {
    setShowVoucherDialog(true);
  };

  const handleSaveVouchers = (formData: FormData) => {
    const planId = parseInt(formData.get('planId') as string);
    const quantity = parseInt(formData.get('quantity') as string);
    const routerId = parseInt(formData.get('routerId') as string);
    
    const plan = plans.find(p => p.id === planId);
    const router = routers.find(r => r.id === routerId);
    
    if (plan && router && quantity > 0) {
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
          usedBy: null,
          batchId: `BATCH-${Date.now()}`,
          qrCode: true,
          category: "Regular",
          router: router.name
        });
      }
      setVouchers([...vouchers, ...newVouchers]);
      setStats(prev => ({ ...prev, totalVouchers: prev.totalVouchers + quantity }));
      alert(`${quantity} vouchers generated successfully!`);
    }
    setShowVoucherDialog(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
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
      {/* Enhanced Side Navigation */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm border-r ${darkMode ? 'border-gray-700' : 'border-slate-200'} transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className={`flex items-center justify-between h-16 px-4 lg:px-6 border-b ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <span className={`text-base lg:text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent`}>
              NetSafi Reseller
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="p-3 lg:p-4 space-y-1 lg:space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 rounded-lg text-left transition-colors text-sm lg:text-base ${
                item.active 
                  ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                  : `${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
              }`}
            >
              <item.icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-3 lg:left-4 right-3 lg:right-4 space-y-2">
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
            <div className="flex items-center space-x-2 text-sm">
              <Wallet className="h-4 w-4 text-green-600" />
              <span className={`${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>Credit:</span>
              <span className="font-bold text-green-600">KES {resellerData.credit.toLocaleString()}</span>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full text-sm lg:text-base" size="sm">
            <LogOut className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Enhanced Header */}
        <header className={`h-14 lg:h-16 ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700' : 'border-slate-200'} flex items-center justify-between px-3 lg:px-6`}>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h1 className={`text-lg lg:text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
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
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-3 lg:p-6 space-y-4 lg:space-y-6">
          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Active Users</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.activeUsers}</p>
                      </div>
                      <Users2 className="h-5 w-5 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Active Routers</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.activeRouters}</p>
                      </div>
                      <Router className="h-5 w-5 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Active Plans</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.activePlans}</p>
                      </div>
                      <Timer className="h-5 w-5 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Commission</p>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>KES {Math.floor(stats.commission / 1000)}K</p>
                      </div>
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button onClick={handleAddRouter} className="h-20 flex-col bg-gradient-to-br from-purple-500 to-indigo-600">
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
                <Button onClick={() => setShowSettingsDialog(true)} variant="outline" className="h-20 flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  Settings
                </Button>
              </div>
            </div>
          )}

          {/* Routers View */}
          {activeView === "routers" && (
            <div className="space-y-6">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div>
                    <CardTitle className={`${darkMode ? 'text-white' : ''}`}>Router Management</CardTitle>
                    <CardDescription className={`${darkMode ? 'text-gray-400' : ''}`}>
                      Manage your network routers and monitor their status
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddRouter}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Router
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {routers.map((router) => (
                      <Card key={router.id} className="p-4 border border-slate-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              router.status === 'Online' ? 'bg-green-100' : 
                              router.status === 'Maintenance' ? 'bg-yellow-100' : 'bg-red-100'
                            }`}>
                              <Router className={`h-6 w-6 ${
                                router.status === 'Online' ? 'text-green-600' : 
                                router.status === 'Maintenance' ? 'text-yellow-600' : 'text-red-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold">{router.name}</h3>
                                <Badge variant={router.status === 'Online' ? 'default' : router.status === 'Maintenance' ? 'secondary' : 'destructive'}>
                                  {router.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-slate-600">
                                <div>
                                  <span className="font-medium">IP: </span>
                                  {router.ip}
                                </div>
                                <div>
                                  <span className="font-medium">Model: </span>
                                  {router.model}
                                </div>
                                <div>
                                  <span className="font-medium">Users: </span>
                                  {router.users}
                                </div>
                                <div>
                                  <span className="font-medium">Last Sync: </span>
                                  {router.lastSync}
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-slate-500">
                                Location: {router.location}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditRouter(router)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteRouter(router.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Plans View */}
          {activeView === "plans" && (
            <div className="space-y-6">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div>
                    <CardTitle className={`${darkMode ? 'text-white' : ''}`}>Plan Management</CardTitle>
                    <CardDescription className={`${darkMode ? 'text-gray-400' : ''}`}>
                      Create and manage internet plans for your customers
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddPlan}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                      <Card key={plan.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant={plan.active ? "default" : "secondary"}>
                            {plan.active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{plan.category}</Badge>
                        </div>
                        <h3 className="font-semibold text-base mb-2">{plan.name}</h3>
                        <p className="text-sm text-slate-600 mb-3">{plan.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Duration:</span>
                            <span className="font-medium">{plan.duration}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Price:</span>
                            <span className="font-medium text-green-600">KES {plan.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Speed:</span>
                            <span className="font-medium">{plan.speed_down}/{plan.speed_up} Mbps</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Commission:</span>
                            <span className="font-medium text-purple-600">KES {plan.commission}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditPlan(plan)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDeletePlan(plan.id)}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users View */}
          {activeView === "users" && (
            <div className="space-y-6">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle className={`${darkMode ? 'text-white' : ''}`}>Customer Management</CardTitle>
                  <CardDescription className={`${darkMode ? 'text-gray-400' : ''}`}>
                    View and manage your customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
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
                                <div>
                                  <span className="font-medium">Phone: </span>
                                  {user.phone}
                                </div>
                                <div>
                                  <span className="font-medium">Plan: </span>
                                  {user.plan}
                                </div>
                                <div>
                                  <span className="font-medium">Router: </span>
                                  {user.router}
                                </div>
                                <div>
                                  <span className="font-medium">Spent: </span>
                                  KES {user.totalSpent.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Vouchers View */}
          {activeView === "vouchers" && (
            <div className="space-y-6">
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div>
                    <CardTitle className={`${darkMode ? 'text-white' : ''}`}>Voucher Management</CardTitle>
                    <CardDescription className={`${darkMode ? 'text-gray-400' : ''}`}>
                      Generate and manage vouchers for your plans
                    </CardDescription>
                  </div>
                  <Button onClick={handleGenerateVouchers}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Vouchers
                  </Button>
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
                                  <span className="font-medium">Router: </span>
                                  {voucher.router}
                                </div>
                                <div>
                                  <span className="font-medium">Expires: </span>
                                  {voucher.expiresAt}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(voucher.code)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <QrCode className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other views can be added here */}
          {activeView === "analytics" && (
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Analytics and reporting features coming soon...</p>
              </CardContent>
            </Card>
          )}

          {activeView === "financial" && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Financial management features coming soon...</p>
              </CardContent>
            </Card>
          )}

          {activeView === "license" && (
            <Card>
              <CardHeader>
                <CardTitle>License Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p>License management features coming soon...</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Router Dialog */}
      <Dialog open={showRouterDialog} onOpenChange={setShowRouterDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>{selectedRouter ? 'Edit Router' : 'Add New Router'}</DialogTitle>
            <DialogDescription>
              {selectedRouter ? 'Update router configuration' : 'Add a new router to your network'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSaveRouter(new FormData(e.target));
          }} className="space-y-4">
            <div>
              <Label htmlFor="name">Router Name</Label>
              <Input name="name" defaultValue={selectedRouter?.name} placeholder="e.g., Main Gateway" required />
            </div>
            <div>
              <Label htmlFor="ip">IP Address</Label>
              <Input name="ip" defaultValue={selectedRouter?.ip} placeholder="192.168.1.1" required />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input name="location" defaultValue={selectedRouter?.location} placeholder="e.g., Main Office" required />
            </div>
            <div>
              <Label htmlFor="model">Router Model</Label>
              <Select name="model" defaultValue={selectedRouter?.model} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RB4011iGS+">RB4011iGS+</SelectItem>
                  <SelectItem value="RB3011UiAS">RB3011UiAS</SelectItem>
                  <SelectItem value="RB2011UiAS">RB2011UiAS</SelectItem>
                  <SelectItem value="CCR1009-7G-1C-1S+">CCR1009-7G-1C-1S+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input name="username" defaultValue={selectedRouter?.username || "admin"} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
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
            <DialogDescription>
              {selectedPlan ? 'Update plan configuration' : 'Create a new internet plan'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSavePlan(new FormData(e.target));
          }} className="space-y-4">
            <div>
              <Label htmlFor="name">Plan Name</Label>
              <Input name="name" defaultValue={selectedPlan?.name} placeholder="e.g., All Day Premium" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea name="description" defaultValue={selectedPlan?.description} placeholder="Brief description of the plan" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input name="duration" type="number" defaultValue={selectedPlan?.duration} placeholder="24" required />
              </div>
              <div>
                <Label htmlFor="price">Price (KES)</Label>
                <Input name="price" type="number" defaultValue={selectedPlan?.price} placeholder="120" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="speed_down">Download Speed (Mbps)</Label>
                <Input name="speed_down" type="number" defaultValue={selectedPlan?.speed_down} placeholder="15" required />
              </div>
              <div>
                <Label htmlFor="speed_up">Upload Speed (Mbps)</Label>
                <Input name="speed_up" type="number" defaultValue={selectedPlan?.speed_up} placeholder="8" required />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={selectedPlan?.category} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
            <DialogDescription>Create vouchers for your plans and assign to routers</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSaveVouchers(new FormData(e.target));
          }} className="space-y-4">
            <div>
              <Label htmlFor="planId">Select Plan</Label>
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
              <Label htmlFor="routerId">Assign to Router</Label>
              <Select name="routerId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a router" />
                </SelectTrigger>
                <SelectContent>
                  {routers.filter(r => r.status === 'Online').map((router) => (
                    <SelectItem key={router.id} value={router.id.toString()}>
                      {router.name}
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
                  <span>Router status alerts</span>
                  <Switch defaultChecked />
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
