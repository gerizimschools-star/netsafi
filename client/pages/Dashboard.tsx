import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Wifi, 
  DollarSign, 
  Activity, 
  Settings, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  Bell,
  Search,
  Download,
  Plus,
  LogOut,
  Menu,
  X,
  Edit,
  Trash2,
  Eye,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  Router,
  RefreshCw,
  Send,
  User,
  Calendar,
  MapPin,
  Phone,
  Globe,
  Zap,
  AlertTriangle,
  BarChart3,
  Pause,
  Play,
  MessageSquare,
  Ticket,
  UserCheck,
  CreditCard,
  Palette,
  Lock,
  Unlock,
  Server,
  Timer,
  Coins,
  Building,
  Users2,
  Key,
  FileText,
  Gauge,
  Power,
  Copy,
  Star,
  Upload,
  Signal,
  Info,
  Link as LinkIcon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "New Router Connected", message: "Nairobi Central Router is now online", type: "success", time: "2 min ago", read: false },
    { id: 2, title: "Low Credit Alert", message: "Reseller 'Nairobi Tech' has low credit", type: "warning", time: "5 min ago", read: false },
    { id: 3, title: "Payment Received", message: "KES 50 received via M-Pesa", type: "success", time: "10 min ago", read: true },
    { id: 4, title: "User Session Expired", message: "John Mwangi's 1-hour session ended", type: "info", time: "15 min ago", read: true }
  ]);

  // Mock data
  const [stats, setStats] = useState({
    activeUsers: 324,
    totalRevenue: 85600,
    activeRouters: 5,
    pendingVouchers: 23,
    dailyPlans: 156,
    resellers: 12
  });

  const [timePlans, setTimePlans] = useState([
    { id: 1, name: "1 Hour Basic", duration: 1, price: 10, speed_down: 5, speed_up: 2, category: "hourly", active: true },
    { id: 2, name: "2 Hour Standard", duration: 2, price: 18, speed_down: 10, speed_up: 5, category: "hourly", active: true },
    { id: 3, name: "4 Hour Premium", duration: 4, price: 35, speed_down: 20, speed_up: 10, category: "hourly", active: true },
    { id: 4, name: "Daily Basic", duration: 24, price: 50, speed_down: 5, speed_up: 2, category: "daily", active: true },
    { id: 5, name: "Daily Standard", duration: 24, price: 80, speed_down: 10, speed_up: 5, category: "daily", active: true },
    { id: 6, name: "Daily Premium", duration: 24, price: 120, speed_down: 20, speed_up: 10, category: "daily", active: true }
  ]);

  const [routers, setRouters] = useState([
    { id: 1, name: "Nairobi Central", ip: "192.168.1.1", status: "Online", users: 89, model: "RB4011iGS+", location: "Nairobi", lastSync: "2 min ago" },
    { id: 2, name: "Mombasa Branch", ip: "192.168.2.1", status: "Online", users: 67, model: "RB4011iGS+", location: "Mombasa", lastSync: "3 min ago" },
    { id: 3, name: "Kisumu Office", ip: "192.168.3.1", status: "Maintenance", users: 0, model: "RB3011UiAS", location: "Kisumu", lastSync: "30 min ago" },
    { id: 4, name: "Nakuru Hub", ip: "192.168.4.1", status: "Online", users: 45, model: "RB3011UiAS", location: "Nakuru", lastSync: "1 min ago" },
    { id: 5, name: "Eldoret Station", ip: "192.168.5.1", status: "Online", users: 56, model: "RB2011UiAS", location: "Eldoret", lastSync: "4 min ago" }
  ]);

  const [resellers, setResellers] = useState([
    { 
      id: 1, 
      username: "nairobi_tech", 
      password: "netsafi2025", 
      company: "Nairobi Tech Solutions", 
      contact: "James Kimani", 
      email: "james@naitech.com", 
      phone: "+254701234567", 
      location: "Nairobi", 
      commission: 15, 
      credit: 50000, 
      status: "Active", 
      permissions: ["users", "vouchers", "plans"] 
    },
    { 
      id: 2, 
      username: "coast_internet", 
      password: "coast123", 
      company: "Coast Internet Services", 
      contact: "Fatma Said", 
      email: "fatma@coastnet.com", 
      phone: "+254702345678", 
      location: "Mombasa", 
      commission: 12, 
      credit: 30000, 
      status: "Active", 
      permissions: ["users", "vouchers"] 
    },
    { 
      id: 3, 
      username: "lake_connect", 
      password: "lake456", 
      company: "Lake Connect Ltd", 
      contact: "Peter Odhiambo", 
      email: "peter@lakeconnect.com", 
      phone: "+254703456789", 
      location: "Kisumu", 
      commission: 10, 
      credit: 5000, 
      status: "Suspended", 
      permissions: ["users"] 
    }
  ]);

  const [users, setUsers] = useState([
    { id: 1, name: "John Mwangi", phone: "+254712345678", plan: "Premium", status: "Active", usage: "12.5 GB", lastSeen: "2 min ago", amount: 2500, location: "Nairobi", joinDate: "2023-12-15", email: "john.mwangi@email.com" },
    { id: 2, name: "Grace Njeri", phone: "+254723456789", plan: "Standard", status: "Active", usage: "8.2 GB", lastSeen: "5 min ago", amount: 1500, location: "Mombasa", joinDate: "2024-01-02", email: "grace.njeri@email.com" },
    { id: 3, name: "Peter Ochieng", phone: "+254734567890", plan: "Basic", status: "Expired", usage: "3.1 GB", lastSeen: "1 hour ago", amount: 800, location: "Kisumu", joinDate: "2023-11-20", email: "peter.ochieng@email.com" },
    { id: 4, name: "Mary Wanjiku", phone: "+254745678901", plan: "Premium", status: "Active", usage: "15.8 GB", lastSeen: "10 min ago", amount: 2500, location: "Nakuru", joinDate: "2024-01-10", email: "mary.wanjiku@email.com" },
    { id: 5, name: "David Kamau", phone: "+254756789012", plan: "Standard", status: "Suspended", usage: "0 GB", lastSeen: "2 days ago", amount: 1500, location: "Eldoret", joinDate: "2023-12-01", email: "david.kamau@email.com" }
  ]);

  const [vouchers, setVouchers] = useState([
    { id: 1, code: "HOUR001", planName: "1 Hour Basic", amount: 10, status: "Unused", reseller: "Nairobi Tech", createdAt: "2024-01-15", expiresAt: "2024-02-15" },
    { id: 2, code: "HOUR002", planName: "2 Hour Standard", amount: 18, status: "Used", reseller: "Coast Internet", createdAt: "2024-01-14", expiresAt: "2024-02-14" },
    { id: 3, code: "DAY001", planName: "Daily Basic", amount: 50, status: "Unused", reseller: "Lake Connect", createdAt: "2024-01-16", expiresAt: "2024-02-16" },
    { id: 4, code: "PREM001", planName: "Daily Premium", amount: 120, status: "Unused", reseller: "Nairobi Tech", createdAt: "2024-01-17", expiresAt: "2024-02-17" }
  ]);

  const [activeSessions, setActiveSessions] = useState([
    { id: 1, username: "john_mwangi", plan: "1 Hour Basic", router: "Nairobi Central", timeLeft: "45:23", dataUsed: "125 MB", ip: "192.168.1.100" },
    { id: 2, username: "grace_njeri", plan: "Daily Premium", router: "Mombasa Branch", timeLeft: "18:45:12", dataUsed: "2.1 GB", ip: "192.168.2.150" },
    { id: 3, username: "peter_ochieng", plan: "2 Hour Standard", router: "Nakuru Hub", timeLeft: "1:15:30", dataUsed: "450 MB", ip: "192.168.4.75" }
  ]);

  const [invoices, setInvoices] = useState([
    { id: "INV-001", customer: "John Mwangi", phone: "+254712345678", amount: 2500, status: "Paid", date: "2024-01-15", paymentMethod: "M-Pesa", dueDate: "2024-01-31" },
    { id: "INV-002", customer: "Grace Njeri", phone: "+254723456789", amount: 1500, status: "Pending", date: "2024-01-14", paymentMethod: "Pending", dueDate: "2024-01-28" },
    { id: "INV-003", customer: "Peter Ochieng", phone: "+254734567890", amount: 800, status: "Overdue", date: "2024-01-10", paymentMethod: "Failed", dueDate: "2024-01-24" },
    { id: "INV-004", customer: "Mary Wanjiku", phone: "+254745678901", amount: 2500, status: "Paid", date: "2024-01-12", paymentMethod: "Airtel Money", dueDate: "2024-01-26" }
  ]);

  const permissionsList = ["users", "invoices", "vouchers", "plans", "routers", "reports", "settings"];

  const navItems = [
    { name: "Overview", icon: Activity, active: activeTab === "overview" },
    { name: "Plans", icon: Timer, active: activeTab === "plans" },
    { name: "Routers", icon: Router, active: activeTab === "routers" },
    { name: "Sessions", icon: Zap, active: activeTab === "sessions" },
    { name: "Resellers", icon: Users2, active: activeTab === "resellers" },
    { name: "Vouchers", icon: Ticket, active: activeTab === "vouchers" },
    { name: "Users", icon: Users, active: activeTab === "users" },
    { name: "Invoices", icon: DollarSign, active: activeTab === "invoices" },
    { name: "Portal", icon: Globe, active: activeTab === "portal" },
    { name: "Settings", icon: Settings, active: activeTab === "settings" }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    navigate("/");
  };

  const handleCreatePlan = (formData) => {
    const newPlan = {
      id: timePlans.length + 1,
      name: formData.get('name'),
      duration: parseInt(formData.get('duration')),
      price: parseInt(formData.get('price')),
      speed_down: parseInt(formData.get('speed_down')),
      speed_up: parseInt(formData.get('speed_up')),
      category: formData.get('category'),
      active: true
    };
    setTimePlans([...timePlans, newPlan]);
    setShowAddDialog(false);
  };

  const handleCreateReseller = (formData) => {
    const newReseller = {
      id: resellers.length + 1,
      username: formData.get('username'),
      password: formData.get('password') || 'default123',
      company: formData.get('company'),
      contact: formData.get('contact'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      commission: parseFloat(formData.get('commission')),
      credit: 0,
      status: "Active",
      permissions: []
    };
    setResellers([...resellers, newReseller]);
    setShowAddDialog(false);
  };

  const handleCreateRouter = (formData) => {
    const newRouter = {
      id: routers.length + 1,
      name: formData.get('name'),
      ip: formData.get('ip'),
      status: "Online",
      users: 0,
      model: formData.get('model'),
      location: formData.get('location'),
      lastSync: "Just now"
    };
    setRouters([...routers, newRouter]);
    setShowAddDialog(false);
  };

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleTerminateSession = (sessionId: number) => {
    setActiveSessions(activeSessions.filter(session => session.id !== sessionId));
  };

  const handleRouterAction = (routerId: number, action: string) => {
    setRouters(routers.map(router => 
      router.id === routerId 
        ? { ...router, status: action === 'restart' ? 'Online' : action === 'maintenance' ? 'Maintenance' : router.status }
        : router
    ));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-sm border-r border-slate-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-slate-200">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <span className="text-base lg:text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              NetSafi Billing
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
              key={item.name}
              onClick={() => {
                setActiveTab(item.name.toLowerCase());
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 rounded-lg text-left transition-colors text-sm lg:text-base ${
                item.active 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-3 lg:left-4 right-3 lg:right-4">
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

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="h-14 lg:h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-3 lg:px-6">
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg lg:text-xl font-semibold text-slate-800">NetSafi ISP Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-10 lg:w-10 relative">
                  <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <span className="font-medium text-sm">{notification.title}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs lg:text-sm font-medium text-blue-700">A</span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">Administrator</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCredentialsDialog(true)}>
                  <Key className="mr-2 h-4 w-4" />
                  Reseller Credentials
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-3 lg:p-6 space-y-4 lg:space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-slate-600">Active Users</p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">{stats.activeUsers}</p>
                  </div>
                  <Users className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-slate-600">Revenue</p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">KES {Math.floor(stats.totalRevenue / 1000)}K</p>
                  </div>
                  <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-slate-600">Routers</p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">{stats.activeRouters}</p>
                  </div>
                  <Router className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-slate-600">Plans</p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">{stats.dailyPlans}</p>
                  </div>
                  <Timer className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-slate-600">Resellers</p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">{stats.resellers}</p>
                  </div>
                  <Users2 className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-slate-600">Vouchers</p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">{stats.pendingVouchers}</p>
                  </div>
                  <Ticket className="h-4 w-4 lg:h-5 lg:w-5 text-pink-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 lg:space-y-4">
            <div className="overflow-x-auto">
              <TabsList className="inline-flex w-max min-w-full lg:w-auto h-9 lg:h-10">
                <TabsTrigger value="overview" className="text-xs lg:text-sm px-2 lg:px-3">Overview</TabsTrigger>
                <TabsTrigger value="plans" className="text-xs lg:text-sm px-2 lg:px-3">Plans</TabsTrigger>
                <TabsTrigger value="routers" className="text-xs lg:text-sm px-2 lg:px-3">Routers</TabsTrigger>
                <TabsTrigger value="sessions" className="text-xs lg:text-sm px-2 lg:px-3">Sessions</TabsTrigger>
                <TabsTrigger value="resellers" className="text-xs lg:text-sm px-2 lg:px-3">Resellers</TabsTrigger>
                <TabsTrigger value="vouchers" className="text-xs lg:text-sm px-2 lg:px-3">Vouchers</TabsTrigger>
                <TabsTrigger value="users" className="text-xs lg:text-sm px-2 lg:px-3">Users</TabsTrigger>
                <TabsTrigger value="invoices" className="text-xs lg:text-sm px-2 lg:px-3">Invoices</TabsTrigger>
                <TabsTrigger value="portal" className="text-xs lg:text-sm px-2 lg:px-3">Portal</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs lg:text-sm px-2 lg:px-3">Settings</TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="grid gap-3 lg:gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.slice(0, 4).map((notification) => (
                    <div key={notification.id} className="flex items-center space-x-3 p-2 lg:p-3 bg-slate-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-xs lg:text-sm">{notification.title}</p>
                        <p className="text-xs text-slate-500">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Online Routers</span>
                    <span className="font-bold text-green-600">{routers.filter(r => r.status === 'Online').length}/{routers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Active Sessions</span>
                    <span className="font-bold text-blue-600">{activeSessions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Unused Vouchers</span>
                    <span className="font-bold text-orange-600">{vouchers.filter(v => v.status === 'Unused').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Active Resellers</span>
                    <span className="font-bold text-purple-600">{resellers.filter(r => r.status === 'Active').length}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans">
              <Card>
                <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div>
                    <CardTitle className="text-base lg:text-lg">Time-Based Plans</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Manage hourly, daily, and monthly internet plans</CardDescription>
                  </div>
                  <Dialog open={showAddDialog && activeTab === 'plans'} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="text-xs lg:text-sm">
                        <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                        Add Plan
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Plan</DialogTitle>
                        <DialogDescription>Create a time-based internet plan</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleCreatePlan(new FormData(e.target));
                      }} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Plan Name</Label>
                          <Input name="name" placeholder="e.g., 1 Hour Basic" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="duration">Duration (hours)</Label>
                            <Input name="duration" type="number" placeholder="1" required />
                          </div>
                          <div>
                            <Label htmlFor="price">Price (KES)</Label>
                            <Input name="price" type="number" placeholder="10" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="speed_down">Download (Mbps)</Label>
                            <Input name="speed_down" type="number" placeholder="5" required />
                          </div>
                          <div>
                            <Label htmlFor="speed_up">Upload (Mbps)</Label>
                            <Input name="speed_up" type="number" placeholder="2" required />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select name="category" required>
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
                        <Button type="submit" className="w-full">Create Plan</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 lg:gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {timePlans.map((plan) => (
                      <Card key={plan.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant={plan.active ? "default" : "secondary"}>
                            {plan.active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{plan.category}</Badge>
                        </div>
                        <h3 className="font-semibold text-base mb-2">{plan.name}</h3>
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
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Routers Tab */}
            <TabsContent value="routers">
              <Card>
                <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div>
                    <CardTitle className="text-base lg:text-lg">Router Management</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Manage Mikrotik and other routers</CardDescription>
                  </div>
                  <Dialog open={showAddDialog && activeTab === 'routers'} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="text-xs lg:text-sm">
                        <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                        Add Router
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Router</DialogTitle>
                        <DialogDescription>Connect a new Mikrotik or compatible router</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleCreateRouter(new FormData(e.target));
                      }} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Router Name</Label>
                          <Input name="name" placeholder="e.g., Nairobi Central" required />
                        </div>
                        <div>
                          <Label htmlFor="ip">IP Address</Label>
                          <Input name="ip" placeholder="192.168.1.1" required />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input name="location" placeholder="e.g., Nairobi" required />
                        </div>
                        <div>
                          <Label htmlFor="model">Router Model</Label>
                          <Select name="model" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="RB4011iGS+">RB4011iGS+</SelectItem>
                              <SelectItem value="RB3011UiAS-RM">RB3011UiAS-RM</SelectItem>
                              <SelectItem value="RB2011UiAS-2HnD-IN">RB2011UiAS-2HnD-IN</SelectItem>
                              <SelectItem value="CCR1009-7G-1C-1S+">CCR1009-7G-1C-1S+</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="username">Username</Label>
                            <Input name="username" defaultValue="admin" required />
                          </div>
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input name="password" type="password" required />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">Add Router</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {routers.map((router) => (
                      <div key={router.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            router.status === 'Online' ? 'bg-green-100' : 
                            router.status === 'Maintenance' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            <Router className={`h-5 w-5 ${
                              router.status === 'Online' ? 'text-green-600' : 
                              router.status === 'Maintenance' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{router.name}</p>
                            <p className="text-sm text-slate-500">{router.ip} • {router.location}</p>
                            <p className="text-xs text-slate-400">{router.model} • {router.users} users • Updated: {router.lastSync}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={router.status === 'Online' ? 'default' : router.status === 'Maintenance' ? 'secondary' : 'destructive'}>
                            {router.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm" onClick={() => handleRouterAction(router.id, 'restart')}>
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRouterAction(router.id, 'maintenance')}>
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg">Active Sessions</CardTitle>
                  <CardDescription className="text-xs lg:text-sm">Monitor and manage active user sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <div key={session.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{session.username}</p>
                            <p className="text-sm text-slate-500">{session.plan} • {session.router}</p>
                            <p className="text-xs text-slate-400">IP: {session.ip} • Data used: {session.dataUsed}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-green-600">{session.timeLeft}</p>
                            <p className="text-xs text-slate-500">Time remaining</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleTerminateSession(session.id)}>
                            <Power className="h-3 w-3 mr-1" />
                            End
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Resellers Tab */}
            <TabsContent value="resellers">
              <Card>
                <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div>
                    <CardTitle className="text-base lg:text-lg">Reseller Management</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Manage resellers, permissions, and credit balances</CardDescription>
                  </div>
                  <Dialog open={showAddDialog && activeTab === 'resellers'} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="text-xs lg:text-sm">
                        <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                        Add Reseller
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Reseller</DialogTitle>
                        <DialogDescription>Create a new reseller account with permissions</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleCreateReseller(new FormData(e.target));
                      }} className="space-y-4">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input name="username" placeholder="reseller_username" required />
                        </div>
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input name="password" placeholder="secure_password" required />
                        </div>
                        <div>
                          <Label htmlFor="company">Company Name</Label>
                          <Input name="company" placeholder="Company Ltd" required />
                        </div>
                        <div>
                          <Label htmlFor="contact">Contact Person</Label>
                          <Input name="contact" placeholder="John Doe" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input name="email" type="email" placeholder="email@company.com" required />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input name="phone" placeholder="+254700000000" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <Input name="location" placeholder="Nairobi" required />
                          </div>
                          <div>
                            <Label htmlFor="commission">Commission %</Label>
                            <Input name="commission" type="number" placeholder="15" required />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-3 block">Permissions</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {permissionsList.map((permission) => (
                              <div key={permission} className="flex items-center space-x-2">
                                <Checkbox id={permission} name="permissions" value={permission} />
                                <Label htmlFor={permission} className="text-sm capitalize">{permission}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button type="submit" className="w-full">Create Reseller</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resellers.map((reseller) => (
                      <div key={reseller.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{reseller.company}</p>
                            <p className="text-sm text-slate-500">{reseller.contact} • {reseller.email}</p>
                            <p className="text-xs text-slate-400">
                              Username: {reseller.username} • Commission: {reseller.commission}% • Credit: KES {reseller.credit.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={reseller.status === 'Active' ? 'default' : 'destructive'}>
                            {reseller.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <CreditCard className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
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
            <TabsContent value="vouchers">
              <Card>
                <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div>
                    <CardTitle className="text-base lg:text-lg">Voucher Management</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Generate and manage prepaid vouchers</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      Generate
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vouchers.map((voucher) => (
                      <div key={voucher.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Ticket className="h-5 w-5 text-pink-600" />
                          </div>
                          <div>
                            <p className="font-medium font-mono">{voucher.code}</p>
                            <p className="text-sm text-slate-500">{voucher.planName} • {voucher.reseller}</p>
                            <p className="text-xs text-slate-400">Created: {voucher.createdAt} • Expires: {voucher.expiresAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">KES {voucher.amount}</p>
                            <Badge variant={voucher.status === 'Unused' ? 'default' : voucher.status === 'Used' ? 'secondary' : 'destructive'}>
                              {voucher.status}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg">User Management</CardTitle>
                  <CardDescription className="text-xs lg:text-sm">Manage customer accounts and their subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.phone} • {user.location}</p>
                            <p className="text-xs text-slate-400">{user.plan} Plan - KES {user.amount}/month • Usage: {user.usage}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.status === 'Active' ? 'default' : user.status === 'Expired' ? 'destructive' : 'secondary'}>
                            {user.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
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

            {/* Invoices Tab */}
            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg">Invoice Management</CardTitle>
                  <CardDescription className="text-xs lg:text-sm">Handle billing, payments, and mobile money transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{invoice.id}</p>
                            <p className="text-sm text-slate-500">{invoice.customer} • {invoice.phone}</p>
                            <p className="text-xs text-slate-400">Due: {invoice.dueDate} • Method: {invoice.paymentMethod}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">KES {invoice.amount.toLocaleString()}</p>
                            <Badge variant={invoice.status === 'Paid' ? 'default' : invoice.status === 'Pending' ? 'secondary' : 'destructive'}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Portal Tab */}
            <TabsContent value="portal">
              <div className="grid gap-4 lg:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">User Portal Customization</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Customize the user plan selection interface</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="portal_title">Portal Title</Label>
                        <Input id="portal_title" defaultValue="NetSafi Internet Portal" />
                      </div>
                      <div>
                        <Label htmlFor="portal_logo">Logo URL</Label>
                        <Input id="portal_logo" defaultValue="/images/logo.png" />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="theme_color">Theme Color</Label>
                        <div className="flex space-x-2">
                          <Input id="theme_color" defaultValue="#3B82F6" type="color" className="w-16" />
                          <Input defaultValue="#3B82F6" className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="support_phone">Support Phone</Label>
                        <Input id="support_phone" defaultValue="+254700000000" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="welcome_message">Welcome Message</Label>
                      <Textarea id="welcome_message" defaultValue="Welcome to NetSafi high-speed internet service!" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Portal Preview</p>
                        <p className="text-sm text-slate-500">View how the portal looks to users</p>
                      </div>
                      <Button variant="outline" asChild>
                        <a href="/portal" target="_blank" rel="noopener noreferrer">
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Open Portal
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">Portal Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-logout inactive users</p>
                        <p className="text-sm text-slate-500">Automatically logout users after 5 minutes of inactivity</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Show data usage</p>
                        <p className="text-sm text-slate-500">Display real-time data usage to users</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable voucher redemption</p>
                        <p className="text-sm text-slate-500">Allow users to redeem vouchers directly</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="grid gap-4 lg:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">System Configuration</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Configure system-wide settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="currency">Default Currency</Label>
                        <Select defaultValue="KES">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KES">Kenyan Shillings (KES)</SelectItem>
                            <SelectItem value="USD">US Dollars (USD)</SelectItem>
                            <SelectItem value="EUR">Euros (EUR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select defaultValue="EAT">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EAT">East Africa Time (EAT)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="CAT">Central Africa Time (CAT)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-refresh dashboard</p>
                          <p className="text-sm text-slate-500">Refresh statistics every 30 seconds</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS notifications</p>
                          <p className="text-sm text-slate-500">Send SMS for important events</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email reports</p>
                          <p className="text-sm text-slate-500">Daily summary reports via email</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">Payment Gateway Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: 'M-Pesa Daraja API', status: true, icon: '📱' },
                      { name: 'Airtel Money', status: true, icon: '📲' },
                      { name: 'T-Kash', status: false, icon: '💳' },
                      { name: 'PayPal', status: false, icon: '💰' }
                    ].map((gateway) => (
                      <div key={gateway.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{gateway.icon}</span>
                          <div>
                            <p className="font-medium">{gateway.name}</p>
                            <p className="text-sm text-slate-500">Payment gateway integration</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch checked={gateway.status} />
                          <Button variant="outline" size="sm">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-6 mt-8">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">NetSafi ISP Billing</span>
            </div>
            <p className="text-sm text-slate-400">© 2025 NetSafi ISP Billing. All rights reserved.</p>
            <p className="text-xs text-slate-500 mt-1">Powering Internet Service Providers across Kenya</p>
          </div>
        </footer>
      </div>

      {/* Profile Settings Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>Update your account information</DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input name="fullName" defaultValue="Administrator" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input name="email" type="email" defaultValue="admin@netsafi.com" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input name="phone" defaultValue="+254700000000" />
            </div>
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input name="currentPassword" type="password" />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input name="newPassword" type="password" />
            </div>
            <Button type="submit" className="w-full">Update Profile</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reseller Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle>Reseller Login Credentials</DialogTitle>
            <DialogDescription>Use these credentials to access the reseller portal at /reseller</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {resellers.map((reseller) => (
              <Card key={reseller.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{reseller.company}</h3>
                  <Badge variant={reseller.status === 'Active' ? 'default' : 'destructive'}>
                    {reseller.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Username:</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-slate-100 px-2 py-1 rounded">{reseller.username}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(reseller.username)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Password:</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-slate-100 px-2 py-1 rounded">{reseller.password}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(reseller.password)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Portal URL:</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-slate-100 px-2 py-1 rounded text-xs">/reseller</code>
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/reseller" target="_blank" rel="noopener noreferrer">
                          <LinkIcon className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Share these credentials securely with your resellers. They can access their portal at /reseller
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
