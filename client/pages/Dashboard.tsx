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
  Gauge
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
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
    { id: 1, username: "nairobi_tech", company: "Nairobi Tech Solutions", contact: "James Kimani", email: "james@naitech.com", phone: "+254701234567", location: "Nairobi", commission: 15, credit: 50000, status: "Active", permissions: ["users", "vouchers", "plans"] },
    { id: 2, username: "coast_internet", company: "Coast Internet Services", contact: "Fatma Said", email: "fatma@coastnet.com", phone: "+254702345678", location: "Mombasa", commission: 12, credit: 30000, status: "Active", permissions: ["users", "vouchers"] },
    { id: 3, username: "lake_connect", company: "Lake Connect Ltd", contact: "Peter Odhiambo", email: "peter@lakeconnect.com", phone: "+254703456789", location: "Kisumu", commission: 10, credit: 5000, status: "Suspended", permissions: ["users"] }
  ]);

  const [vouchers, setVouchers] = useState([
    { id: 1, code: "HOUR001", planName: "1 Hour Basic", amount: 10, status: "Unused", reseller: "Nairobi Tech", createdAt: "2024-01-15", expiresAt: "2024-02-15" },
    { id: 2, code: "HOUR002", planName: "2 Hour Standard", amount: 18, status: "Used", reseller: "Coast Internet", createdAt: "2024-01-14", expiresAt: "2024-02-14" },
    { id: 3, code: "DAY001", planName: "Daily Basic", amount: 50, status: "Unused", reseller: "Lake Connect", createdAt: "2024-01-16", expiresAt: "2024-02-16" }
  ]);

  const [activeSessions, setActiveSessions] = useState([
    { id: 1, username: "john_mwangi", plan: "1 Hour Basic", router: "Nairobi Central", timeLeft: "45:23", dataUsed: "125 MB", ip: "192.168.1.100" },
    { id: 2, username: "grace_njeri", plan: "Daily Premium", router: "Mombasa Branch", timeLeft: "18:45:12", dataUsed: "2.1 GB", ip: "192.168.2.150" },
    { id: 3, username: "peter_ochieng", plan: "2 Hour Standard", router: "Nakuru Hub", timeLeft: "1:15:30", dataUsed: "450 MB", ip: "192.168.4.75" }
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
              PHP Radius
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
            <h1 className="text-lg lg:text-xl font-semibold text-slate-800">ISP Admin Dashboard</h1>
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
                  <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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

            {/* Continue with remaining tabs... */}
            {/* I'll add the remaining tabs in the next part to keep the response manageable */}
            
          </Tabs>
        </main>
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
              <Input name="email" type="email" defaultValue="admin@phpradius.com" />
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
    </div>
  );
}
