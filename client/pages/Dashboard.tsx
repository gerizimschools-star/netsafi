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
  Filter,
  Download,
  Plus,
  LogOut,
  Menu,
  X,
  Edit,
  Trash2,
  Eye,
  Smartphone,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Router,
  Signal,
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
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data for the dashboard - updated with KES currency
  const [stats, setStats] = useState({
    activeUsers: 1248,
    totalRevenue: 2284000,
    networkUptime: 99.8,
    pendingInvoices: 23,
    monthlyGrowth: 12,
    revenueGrowth: 8,
    dataUsage: 15.6,
    newUsersToday: 47
  });

  const [users, setUsers] = useState([
    { id: 1, name: "John Mwangi", phone: "+254712345678", plan: "Premium", status: "Active", usage: "12.5 GB", lastSeen: "2 min ago", amount: 2500, location: "Nairobi", joinDate: "2023-12-15", email: "john.mwangi@email.com" },
    { id: 2, name: "Grace Njeri", phone: "+254723456789", plan: "Standard", status: "Active", usage: "8.2 GB", lastSeen: "5 min ago", amount: 1500, location: "Mombasa", joinDate: "2024-01-02", email: "grace.njeri@email.com" },
    { id: 3, name: "Peter Ochieng", phone: "+254734567890", plan: "Basic", status: "Expired", usage: "3.1 GB", lastSeen: "1 hour ago", amount: 800, location: "Kisumu", joinDate: "2023-11-20", email: "peter.ochieng@email.com" },
    { id: 4, name: "Mary Wanjiku", phone: "+254745678901", plan: "Premium", status: "Active", usage: "15.8 GB", lastSeen: "10 min ago", amount: 2500, location: "Nakuru", joinDate: "2024-01-10", email: "mary.wanjiku@email.com" },
    { id: 5, name: "David Kamau", phone: "+254756789012", plan: "Standard", status: "Suspended", usage: "0 GB", lastSeen: "2 days ago", amount: 1500, location: "Eldoret", joinDate: "2023-12-01", email: "david.kamau@email.com" },
    { id: 6, name: "Susan Achieng", phone: "+254767890123", plan: "Premium", status: "Active", usage: "18.2 GB", lastSeen: "1 min ago", amount: 2500, location: "Nairobi", joinDate: "2024-01-05", email: "susan.achieng@email.com" },
    { id: 7, name: "Samuel Kiprop", phone: "+254778901234", plan: "Basic", status: "Active", usage: "4.5 GB", lastSeen: "30 min ago", amount: 800, location: "Eldoret", joinDate: "2024-01-12", email: "samuel.kiprop@email.com" }
  ]);

  const [invoices, setInvoices] = useState([
    { id: "INV-001", customer: "John Mwangi", phone: "+254712345678", amount: 2500, status: "Paid", date: "2024-01-15", paymentMethod: "M-Pesa", dueDate: "2024-01-31" },
    { id: "INV-002", customer: "Grace Njeri", phone: "+254723456789", amount: 1500, status: "Pending", date: "2024-01-14", paymentMethod: "Pending", dueDate: "2024-01-28" },
    { id: "INV-003", customer: "Peter Ochieng", phone: "+254734567890", amount: 800, status: "Overdue", date: "2024-01-10", paymentMethod: "Failed", dueDate: "2024-01-24" },
    { id: "INV-004", customer: "Mary Wanjiku", phone: "+254745678901", amount: 2500, status: "Paid", date: "2024-01-12", paymentMethod: "Airtel Money", dueDate: "2024-01-26" },
    { id: "INV-005", customer: "David Kamau", phone: "+254756789012", amount: 1500, status: "Pending", date: "2024-01-16", paymentMethod: "Pending", dueDate: "2024-01-30" },
    { id: "INV-006", customer: "Susan Achieng", phone: "+254767890123", amount: 2500, status: "Paid", date: "2024-01-17", paymentMethod: "M-Pesa", dueDate: "2024-02-01" }
  ]);

  const [networkStats, setNetworkStats] = useState([
    { location: "Nairobi Central", status: "Online", users: 324, bandwidth: 85, latency: "12ms", uptime: 99.9, lastUpdate: "1 min ago" },
    { location: "Mombasa", status: "Online", users: 198, bandwidth: 72, latency: "18ms", uptime: 98.5, lastUpdate: "2 min ago" },
    { location: "Kisumu", status: "Maintenance", users: 156, bandwidth: 0, latency: "N/A", uptime: 0, lastUpdate: "5 min ago" },
    { location: "Nakuru", status: "Online", users: 234, bandwidth: 68, latency: "15ms", uptime: 99.2, lastUpdate: "1 min ago" },
    { location: "Eldoret", status: "Online", users: 178, bandwidth: 91, latency: "10ms", uptime: 99.7, lastUpdate: "3 min ago" }
  ]);

  const paymentMethods = [
    { name: "M-Pesa", icon: "📱", available: true, fee: "1%" },
    { name: "Airtel Money", icon: "📲", available: true, fee: "1.5%" },
    { name: "T-Kash", icon: "💳", available: true, fee: "2%" },
    { name: "Bank Transfer", icon: "🏦", available: true, fee: "0%" }
  ];

  const plans = [
    { name: "Basic", price: 800, features: ["5 GB Data", "Basic Support", "Standard Speed"] },
    { name: "Standard", price: 1500, features: ["15 GB Data", "Priority Support", "High Speed", "Free Router"] },
    { name: "Premium", price: 2500, features: ["Unlimited Data", "24/7 Support", "Maximum Speed", "Free Router", "Static IP"] }
  ];

  const navItems = [
    { name: "Overview", icon: Activity, active: activeTab === "overview" },
    { name: "Users", icon: Users, active: activeTab === "users" },
    { name: "Network", icon: Wifi, active: activeTab === "network" },
    { name: "Billing", icon: DollarSign, active: activeTab === "invoices" },
    { name: "Settings", icon: Settings, active: activeTab === "settings" }
  ];

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 3) - 1,
        totalRevenue: prev.totalRevenue + Math.floor(Math.random() * 1000),
        networkUptime: 99.5 + Math.random() * 0.5
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAddUser = (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      status: "Active",
      usage: "0 GB",
      lastSeen: "Just now",
      joinDate: new Date().toISOString().split('T')[0],
      email: `${userData.name.toLowerCase().replace(' ', '.')}@email.com`
    };
    setUsers([...users, newUser]);
    setShowAddUserDialog(false);
  };

  const handleEditUser = (userData) => {
    setUsers(users.map(user => 
      user.id === selectedUser.id ? { ...user, ...userData } : user
    ));
    setShowEditUserDialog(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleSuspendUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: "Suspended" } : user
    ));
  };

  const handleActivateUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: "Active" } : user
    ));
  };

  const handleProcessPayment = (invoiceId, method) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === invoiceId 
        ? { ...invoice, status: "Paid", paymentMethod: method }
        : invoice
    ));
    setShowPaymentDialog(false);
    setSelectedInvoice(null);
  };

  const handleGenerateInvoice = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newInvoice = {
        id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
        customer: user.name,
        phone: user.phone,
        amount: user.amount,
        status: "Pending",
        date: new Date().toISOString().split('T')[0],
        paymentMethod: "Pending",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      setInvoices([...invoices, newInvoice]);
    }
  };

  const handleRefreshNetwork = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setNetworkStats(prev => prev.map(stat => ({
        ...stat,
        bandwidth: Math.max(0, stat.bandwidth + Math.floor(Math.random() * 10) - 5),
        users: Math.max(0, stat.users + Math.floor(Math.random() * 20) - 10),
        lastUpdate: "Just now"
      })));
      setIsRefreshing(false);
    }, 2000);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm) ||
                         user.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || user.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesFilter = filterStatus === "all" || invoice.status.toLowerCase() === filterStatus;
    return matchesFilter;
  });

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
                setSidebarOpen(false); // Close sidebar on mobile after selection
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
          <Link to="/">
            <Button variant="outline" className="w-full text-sm lg:text-base" size="sm">
              <LogOut className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
              Sign Out
            </Button>
          </Link>
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
            <h1 className="text-lg lg:text-xl font-semibold text-slate-800">Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:h-10 lg:w-10">
              <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs lg:text-sm font-medium text-blue-700">A</span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700">Administrator</span>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-3 lg:p-6 space-y-4 lg:space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-slate-600">Active Users</p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">{stats.activeUsers.toLocaleString()}</p>
                    <div className="flex items-center text-xs lg:text-sm text-green-600 mt-1">
                      <TrendingUp className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-1" />
                      +{stats.monthlyGrowth}%
                    </div>
                  </div>
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-slate-600">Revenue</p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">KES {Math.floor(stats.totalRevenue / 1000)}K</p>
                    <div className="flex items-center text-xs lg:text-sm text-green-600 mt-1">
                      <TrendingUp className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-1" />
                      +{stats.revenueGrowth}%
                    </div>
                  </div>
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-slate-600">Uptime</p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">{stats.networkUptime.toFixed(1)}%</p>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 lg:h-2 mt-2">
                      <div className="bg-green-500 h-1.5 lg:h-2 rounded-full" style={{ width: `${stats.networkUptime}%` }} />
                    </div>
                  </div>
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Wifi className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-slate-600">Pending</p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">{stats.pendingInvoices}</p>
                    <div className="flex items-center text-xs lg:text-sm text-red-600 mt-1">
                      <TrendingDown className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-1" />
                      -3
                    </div>
                  </div>
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 lg:space-y-4">
            <div className="overflow-x-auto">
              <TabsList className="inline-flex w-max min-w-full lg:w-auto h-9 lg:h-10">
                <TabsTrigger value="overview" className="text-xs lg:text-sm px-2 lg:px-3">Overview</TabsTrigger>
                <TabsTrigger value="users" className="text-xs lg:text-sm px-2 lg:px-3">Users</TabsTrigger>
                <TabsTrigger value="invoices" className="text-xs lg:text-sm px-2 lg:px-3">Billing</TabsTrigger>
                <TabsTrigger value="network" className="text-xs lg:text-sm px-2 lg:px-3">Network</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs lg:text-sm px-2 lg:px-3">Settings</TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="grid gap-3 lg:gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4">
                  <div>
                    <CardTitle className="text-base lg:text-lg">Recent Users</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Latest user activity and status</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("users")} className="text-xs lg:text-sm">
                    <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 lg:space-y-3">
                  {users.slice(0, 4).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 lg:p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs lg:text-sm font-medium text-blue-700">{user.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-xs lg:text-sm">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.plan} - {user.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={user.status === 'Active' ? 'default' : user.status === 'Expired' ? 'destructive' : 'secondary'} className="text-xs">
                          {user.status}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">{user.usage}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 lg:pb-4">
                  <div>
                    <CardTitle className="text-base lg:text-lg">Recent Invoices</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Latest billing and payments</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("invoices")} className="text-xs lg:text-sm">
                    <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 lg:space-y-3">
                  {invoices.slice(0, 4).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-2 lg:p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-xs lg:text-sm">{invoice.id}</p>
                        <p className="text-xs text-slate-500">{invoice.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-xs lg:text-sm">KES {invoice.amount.toLocaleString()}</p>
                        <Badge variant={invoice.status === 'Paid' ? 'default' : invoice.status === 'Pending' ? 'secondary' : 'destructive'} className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 pb-3 lg:pb-4">
                  <div>
                    <CardTitle className="text-base lg:text-lg">User Management</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Manage your ISP customers and their accounts</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="text-xs lg:text-sm">
                          <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md mx-auto">
                        <DialogHeader>
                          <DialogTitle className="text-base lg:text-lg">Add New User</DialogTitle>
                          <DialogDescription className="text-xs lg:text-sm">Create a new customer account</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target);
                          const planPrice = plans.find(p => p.name === formData.get('plan'))?.price || 0;
                          handleAddUser({
                            name: formData.get('name'),
                            phone: formData.get('phone'),
                            plan: formData.get('plan'),
                            location: formData.get('location'),
                            amount: planPrice
                          });
                        }} className="space-y-3 lg:space-y-4">
                          <div>
                            <Label htmlFor="name" className="text-xs lg:text-sm">Full Name</Label>
                            <Input name="name" placeholder="e.g. John Mwangi" required className="text-xs lg:text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-xs lg:text-sm">Phone Number</Label>
                            <Input name="phone" placeholder="+254712345678" required className="text-xs lg:text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="location" className="text-xs lg:text-sm">Location</Label>
                            <Input name="location" placeholder="e.g. Nairobi" required className="text-xs lg:text-sm" />
                          </div>
                          <div>
                            <Label htmlFor="plan" className="text-xs lg:text-sm">Plan</Label>
                            <Select name="plan" required>
                              <SelectTrigger className="text-xs lg:text-sm">
                                <SelectValue placeholder="Select plan" />
                              </SelectTrigger>
                              <SelectContent>
                                {plans.map(plan => (
                                  <SelectItem key={plan.name} value={plan.name}>
                                    {plan.name} - KES {plan.price.toLocaleString()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" className="w-full text-xs lg:text-sm">Create User</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-2 mb-3 lg:mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2 lg:top-2.5 h-3 w-3 lg:h-4 lg:w-4 text-slate-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 lg:pl-10 text-xs lg:text-sm"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-32 text-xs lg:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 lg:space-y-3">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 lg:p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                          <div className="w-9 h-9 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">{user.name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm lg:text-base">{user.name}</p>
                            <p className="text-xs lg:text-sm text-slate-500">{user.phone} • {user.location}</p>
                            <p className="text-xs text-slate-400">{user.plan} Plan - KES {user.amount.toLocaleString()}/month</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end space-x-2 lg:space-x-3">
                          <Badge variant={user.status === 'Active' ? 'default' : user.status === 'Expired' ? 'destructive' : 'secondary'} className="text-xs">
                            {user.status}
                          </Badge>
                          <div className="flex space-x-1">
                            {user.status === 'Active' ? (
                              <Button variant="outline" size="sm" onClick={() => handleSuspendUser(user.id)} className="text-xs px-2">
                                <Pause className="h-3 w-3 mr-1" />
                                Suspend
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => handleActivateUser(user.id)} className="text-xs px-2">
                                <Play className="h-3 w-3 mr-1" />
                                Activate
                              </Button>
                            )}
                            <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)} className="px-2">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md mx-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-base lg:text-lg">Edit User</DialogTitle>
                                  <DialogDescription className="text-xs lg:text-sm">Update user information</DialogDescription>
                                </DialogHeader>
                                {selectedUser && (
                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    const planPrice = plans.find(p => p.name === formData.get('plan'))?.price || selectedUser.amount;
                                    handleEditUser({
                                      name: formData.get('name'),
                                      phone: formData.get('phone'),
                                      plan: formData.get('plan'),
                                      location: formData.get('location'),
                                      amount: planPrice
                                    });
                                  }} className="space-y-3 lg:space-y-4">
                                    <div>
                                      <Label htmlFor="name" className="text-xs lg:text-sm">Full Name</Label>
                                      <Input name="name" defaultValue={selectedUser.name} required className="text-xs lg:text-sm" />
                                    </div>
                                    <div>
                                      <Label htmlFor="phone" className="text-xs lg:text-sm">Phone Number</Label>
                                      <Input name="phone" defaultValue={selectedUser.phone} required className="text-xs lg:text-sm" />
                                    </div>
                                    <div>
                                      <Label htmlFor="location" className="text-xs lg:text-sm">Location</Label>
                                      <Input name="location" defaultValue={selectedUser.location} required className="text-xs lg:text-sm" />
                                    </div>
                                    <div>
                                      <Label htmlFor="plan" className="text-xs lg:text-sm">Plan</Label>
                                      <Select name="plan" defaultValue={selectedUser.plan} required>
                                        <SelectTrigger className="text-xs lg:text-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {plans.map(plan => (
                                            <SelectItem key={plan.name} value={plan.name}>
                                              {plan.name} - KES {plan.price.toLocaleString()}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button type="submit" className="w-full text-xs lg:text-sm">Update User</Button>
                                  </form>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => handleGenerateInvoice(user.id)} className="px-2">
                              <DollarSign className="h-3 w-3" />
                            </Button>
                            <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)} className="px-2">
                                  <MessageSquare className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md mx-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-base lg:text-lg">Send Message</DialogTitle>
                                  <DialogDescription className="text-xs lg:text-sm">
                                    Send SMS to {selectedUser?.name} ({selectedUser?.phone})
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  alert('Message sent successfully!');
                                  setShowMessageDialog(false);
                                }} className="space-y-3 lg:space-y-4">
                                  <div>
                                    <Label htmlFor="message" className="text-xs lg:text-sm">Message</Label>
                                    <Textarea 
                                      name="message" 
                                      placeholder="Type your message here..."
                                      required 
                                      className="text-xs lg:text-sm"
                                    />
                                  </div>
                                  <Button type="submit" className="w-full text-xs lg:text-sm">
                                    <Send className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                                    Send Message
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="invoices">
              <Card>
                <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 pb-3 lg:pb-4">
                  <div>
                    <CardTitle className="text-base lg:text-lg">Invoice & Payment Management</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Handle billing, payments, and mobile money transactions</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="text-xs lg:text-sm">
                      <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      Export
                    </Button>
                    <Button size="sm" className="text-xs lg:text-sm">
                      <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      New Invoice
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
                    {paymentMethods.map((method) => (
                      <Card key={method.name} className="p-3 lg:p-4">
                        <div className="text-center">
                          <div className="text-xl lg:text-2xl mb-1 lg:mb-2">{method.icon}</div>
                          <p className="font-medium text-xs lg:text-sm">{method.name}</p>
                          <Badge variant={method.available ? "default" : "secondary"} className="mt-1 text-xs">
                            {method.available ? "Available" : "Unavailable"}
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">Fee: {method.fee}</p>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mb-3 lg:mb-4">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-32 text-xs lg:text-sm">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 lg:space-y-3">
                    {filteredInvoices.map((invoice) => (
                      <div key={invoice.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 lg:p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                          <div className="w-9 h-9 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm lg:text-base">{invoice.id}</p>
                            <p className="text-xs lg:text-sm text-slate-500">{invoice.customer} • {invoice.phone}</p>
                            <p className="text-xs text-slate-400">Due: {invoice.dueDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end space-x-3 lg:space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-sm lg:text-base">KES {invoice.amount.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">{invoice.paymentMethod}</p>
                          </div>
                          <Badge variant={invoice.status === 'Paid' ? 'default' : invoice.status === 'Pending' ? 'secondary' : 'destructive'} className="text-xs">
                            {invoice.status}
                          </Badge>
                          {invoice.status === 'Pending' && (
                            <Dialog open={showPaymentDialog && selectedInvoice?.id === invoice.id} onOpenChange={setShowPaymentDialog}>
                              <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setSelectedInvoice(invoice)} className="text-xs px-2">
                                  <Smartphone className="h-3 w-3 mr-1" />
                                  Pay
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md mx-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-base lg:text-lg">Process Mobile Payment</DialogTitle>
                                  <DialogDescription className="text-xs lg:text-sm">
                                    Process payment for {selectedInvoice?.customer} - KES {selectedInvoice?.amount.toLocaleString()}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3 lg:space-y-4">
                                  <Alert>
                                    <Smartphone className="h-3 w-3 lg:h-4 lg:w-4" />
                                    <AlertDescription className="text-xs lg:text-sm">
                                      Payment will be sent to {selectedInvoice?.phone}
                                    </AlertDescription>
                                  </Alert>
                                  <div className="grid grid-cols-2 gap-2">
                                    {paymentMethods.map((method) => (
                                      <Button
                                        key={method.name}
                                        variant="outline"
                                        onClick={() => handleProcessPayment(selectedInvoice?.id, method.name)}
                                        className="p-3 lg:p-4 h-auto flex flex-col text-xs lg:text-sm"
                                      >
                                        <span className="text-lg lg:text-xl mb-1">{method.icon}</span>
                                        <span>{method.name}</span>
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network">
              <Card>
                <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div>
                    <CardTitle className="text-base lg:text-lg">Network Monitoring</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Monitor network performance and connectivity across all locations</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRefreshNetwork} disabled={isRefreshing} className="text-xs lg:text-sm">
                    <RefreshCw className={`h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 lg:gap-4">
                    {networkStats.map((location, index) => (
                      <div key={index} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 lg:p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                          <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center ${
                            location.status === 'Online' ? 'bg-green-100' : 
                            location.status === 'Maintenance' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            <Router className={`h-4 w-4 lg:h-5 lg:w-5 ${
                              location.status === 'Online' ? 'text-green-600' : 
                              location.status === 'Maintenance' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm lg:text-base">{location.location}</p>
                            <p className="text-xs lg:text-sm text-slate-500">{location.users} active users</p>
                            <p className="text-xs text-slate-400">Updated: {location.lastUpdate}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end space-x-4 lg:space-x-6">
                          <div className="text-center">
                            <p className="text-xs text-slate-500">Bandwidth</p>
                            <div className="flex items-center space-x-1">
                              <p className="font-medium text-xs lg:text-sm">{location.bandwidth}%</p>
                              <Progress value={location.bandwidth} className="w-12 h-1.5" />
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-500">Latency</p>
                            <p className="font-medium text-xs lg:text-sm">{location.latency}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-500">Uptime</p>
                            <p className="font-medium text-xs lg:text-sm">{location.uptime}%</p>
                          </div>
                          <Badge variant={
                            location.status === 'Online' ? 'default' : 
                            location.status === 'Maintenance' ? 'secondary' : 'destructive'
                          } className="text-xs">
                            {location.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="grid gap-4 lg:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">Payment Configuration</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Configure mobile payment integrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 lg:space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.name} className="flex items-center justify-between p-3 lg:p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg lg:text-xl">{method.icon}</span>
                          <div>
                            <p className="font-medium text-sm lg:text-base">{method.name}</p>
                            <p className="text-xs lg:text-sm text-slate-500">Transaction fee: {method.fee}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch checked={method.available} />
                          <Badge variant={method.available ? "default" : "secondary"} className="text-xs">
                            {method.available ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">System Settings</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Configure general system preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 lg:space-y-6">
                    <div className="grid gap-3 lg:gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs lg:text-sm">Default Currency</Label>
                        <Select defaultValue="KES">
                          <SelectTrigger className="mt-1 text-xs lg:text-sm">
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
                        <Label className="text-xs lg:text-sm">Time Zone</Label>
                        <Select defaultValue="EAT">
                          <SelectTrigger className="mt-1 text-xs lg:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EAT">East Africa Time (EAT)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm lg:text-base">Auto-refresh Dashboard</p>
                          <p className="text-xs lg:text-sm text-slate-500">Automatically update statistics every 30 seconds</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm lg:text-base">SMS Notifications</p>
                          <p className="text-xs lg:text-sm text-slate-500">Send SMS notifications for important events</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm lg:text-base">Email Reports</p>
                          <p className="text-xs lg:text-sm text-slate-500">Send daily summary reports via email</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">Plan Configuration</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">Manage internet plans and pricing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 lg:space-y-4">
                      {plans.map((plan) => (
                        <div key={plan.name} className="p-3 lg:p-4 bg-slate-50 rounded-lg">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-0">
                            <div>
                              <p className="font-medium text-sm lg:text-base">{plan.name} Plan</p>
                              <p className="text-lg lg:text-xl font-bold text-slate-900">KES {plan.price.toLocaleString()}/month</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-xs lg:text-sm">
                              <Edit className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                              Edit Plan
                            </Button>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs lg:text-sm text-slate-600 mb-1">Features:</p>
                            <div className="flex flex-wrap gap-1">
                              {plan.features.map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
