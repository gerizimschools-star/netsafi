import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Signal
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock data for the dashboard - updated with KES currency
  const stats = {
    activeUsers: 1248,
    totalRevenue: 2284000, // KES 2,284,000
    networkUptime: 99.8,
    pendingInvoices: 23,
    monthlyGrowth: 12,
    revenueGrowth: 8
  };

  const [users, setUsers] = useState([
    { id: 1, name: "John Mwangi", phone: "+254712345678", plan: "Premium", status: "Active", usage: "12.5 GB", lastSeen: "2 min ago", amount: 2500, location: "Nairobi" },
    { id: 2, name: "Grace Njeri", phone: "+254723456789", plan: "Standard", status: "Active", usage: "8.2 GB", lastSeen: "5 min ago", amount: 1500, location: "Mombasa" },
    { id: 3, name: "Peter Ochieng", phone: "+254734567890", plan: "Basic", status: "Expired", usage: "3.1 GB", lastSeen: "1 hour ago", amount: 800, location: "Kisumu" },
    { id: 4, name: "Mary Wanjiku", phone: "+254745678901", plan: "Premium", status: "Active", usage: "15.8 GB", lastSeen: "10 min ago", amount: 2500, location: "Nakuru" },
    { id: 5, name: "David Kamau", phone: "+254756789012", plan: "Standard", status: "Suspended", usage: "0 GB", lastSeen: "2 days ago", amount: 1500, location: "Eldoret" }
  ]);

  const [invoices, setInvoices] = useState([
    { id: "INV-001", customer: "John Mwangi", phone: "+254712345678", amount: 2500, status: "Paid", date: "2024-01-15", paymentMethod: "M-Pesa" },
    { id: "INV-002", customer: "Grace Njeri", phone: "+254723456789", amount: 1500, status: "Pending", date: "2024-01-14", paymentMethod: "Pending" },
    { id: "INV-003", customer: "Peter Ochieng", phone: "+254734567890", amount: 800, status: "Overdue", date: "2024-01-10", paymentMethod: "Failed" },
    { id: "INV-004", customer: "Mary Wanjiku", phone: "+254745678901", amount: 2500, status: "Paid", date: "2024-01-12", paymentMethod: "Airtel Money" },
    { id: "INV-005", customer: "David Kamau", phone: "+254756789012", amount: 1500, status: "Pending", date: "2024-01-16", paymentMethod: "Pending" }
  ]);

  const networkStats = [
    { location: "Nairobi Central", status: "Online", users: 324, bandwidth: "85%", latency: "12ms" },
    { location: "Mombasa", status: "Online", users: 198, bandwidth: "72%", latency: "18ms" },
    { location: "Kisumu", status: "Maintenance", users: 156, bandwidth: "0%", latency: "N/A" },
    { location: "Nakuru", status: "Online", users: 234, bandwidth: "68%", latency: "15ms" },
    { location: "Eldoret", status: "Online", users: 178, bandwidth: "91%", latency: "10ms" }
  ];

  const paymentMethods = [
    { name: "M-Pesa", icon: "📱", available: true },
    { name: "Airtel Money", icon: "📲", available: true },
    { name: "T-Kash", icon: "💳", available: true },
    { name: "Bank Transfer", icon: "🏦", available: true }
  ];

  const navItems = [
    { name: "Overview", icon: Activity, active: activeTab === "overview" },
    { name: "Users", icon: Users, active: activeTab === "users" },
    { name: "Network", icon: Wifi, active: activeTab === "network" },
    { name: "Billing", icon: DollarSign, active: activeTab === "invoices" },
    { name: "Settings", icon: Settings, active: activeTab === "settings" }
  ];

  const handleAddUser = (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      status: "Active",
      usage: "0 GB",
      lastSeen: "Just now"
    };
    setUsers([...users, newUser]);
    setShowAddUserDialog(false);
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
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-sm border-r border-slate-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              PHP Radius
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name.toLowerCase())}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                item.active 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link to="/">
            <Button variant="outline" className="w-full" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
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
        <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-slate-800">Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">A</span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700">Administrator</span>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-4 lg:p-6 space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Users</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.activeUsers.toLocaleString()}</p>
                    <div className="flex items-center text-sm text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{stats.monthlyGrowth}% from last month
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">KES {stats.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center text-sm text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{stats.revenueGrowth}% from last month
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Network Uptime</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.networkUptime}%</p>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.networkUptime}%` }} />
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Wifi className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Pending Invoices</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.pendingInvoices}</p>
                    <div className="flex items-center text-sm text-red-600 mt-1">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -3 from yesterday
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="invoices">Billing</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-lg">Recent Users</CardTitle>
                    <CardDescription>Latest user activity and status</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("users")}>
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {users.slice(0, 4).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">{user.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.plan} Plan - {user.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={user.status === 'Active' ? 'default' : user.status === 'Expired' ? 'destructive' : 'secondary'}>
                          {user.status}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">{user.usage}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-lg">Recent Invoices</CardTitle>
                    <CardDescription>Latest billing and payments</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("invoices")}>
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {invoices.slice(0, 4).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{invoice.id}</p>
                        <p className="text-xs text-slate-500">{invoice.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">KES {invoice.amount.toLocaleString()}</p>
                        <Badge variant={invoice.status === 'Paid' ? 'default' : invoice.status === 'Pending' ? 'secondary' : 'destructive'}>
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
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage your ISP customers and their accounts</CardDescription>
                  </div>
                  <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>Create a new customer account</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        handleAddUser({
                          name: formData.get('name'),
                          phone: formData.get('phone'),
                          plan: formData.get('plan'),
                          location: formData.get('location'),
                          amount: parseInt(formData.get('amount'))
                        });
                      }} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input name="name" placeholder="e.g. John Mwangi" required />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input name="phone" placeholder="+254712345678" required />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input name="location" placeholder="e.g. Nairobi" required />
                        </div>
                        <div>
                          <Label htmlFor="plan">Plan</Label>
                          <Select name="plan" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select plan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Basic">Basic - KES 800</SelectItem>
                              <SelectItem value="Standard">Standard - KES 1,500</SelectItem>
                              <SelectItem value="Premium">Premium - KES 2,500</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="amount">Monthly Amount (KES)</Label>
                          <Input name="amount" type="number" placeholder="2500" required />
                        </div>
                        <Button type="submit" className="w-full">Create User</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-4">
                    <Search className="h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search users by name or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-700">{user.name[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-slate-500">{user.phone} • {user.location}</p>
                            <p className="text-xs text-slate-400">{user.plan} Plan - KES {user.amount.toLocaleString()}/month</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={user.status === 'Active' ? 'default' : user.status === 'Expired' ? 'destructive' : 'secondary'}>
                            {user.status}
                          </Badge>
                          <div className="flex space-x-1">
                            {user.status === 'Active' ? (
                              <Button variant="outline" size="sm" onClick={() => handleSuspendUser(user.id)}>
                                Suspend
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => handleActivateUser(user.id)}>
                                Activate
                              </Button>
                            )}
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

            {/* Billing Tab */}
            <TabsContent value="invoices">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle>Invoice & Payment Management</CardTitle>
                    <CardDescription>Handle billing, payments, and mobile money transactions</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Invoice
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {paymentMethods.map((method) => (
                      <Card key={method.name} className="p-4">
                        <div className="text-center">
                          <div className="text-2xl mb-2">{method.icon}</div>
                          <p className="font-medium text-sm">{method.name}</p>
                          <Badge variant={method.available ? "default" : "secondary"} className="mt-1">
                            {method.available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{invoice.id}</p>
                            <p className="text-sm text-slate-500">{invoice.customer} • {invoice.phone}</p>
                            <p className="text-xs text-slate-400">Due: {invoice.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">KES {invoice.amount.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">{invoice.paymentMethod}</p>
                          </div>
                          <Badge variant={invoice.status === 'Paid' ? 'default' : invoice.status === 'Pending' ? 'secondary' : 'destructive'}>
                            {invoice.status}
                          </Badge>
                          {invoice.status === 'Pending' && (
                            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                              <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setSelectedUser(invoice)}>
                                  <Smartphone className="h-3 w-3 mr-1" />
                                  Pay
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Process Mobile Payment</DialogTitle>
                                  <DialogDescription>
                                    Process payment for {selectedUser?.customer} - KES {selectedUser?.amount.toLocaleString()}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Alert>
                                    <Smartphone className="h-4 w-4" />
                                    <AlertDescription>
                                      Payment will be sent to {selectedUser?.phone}
                                    </AlertDescription>
                                  </Alert>
                                  <div className="grid grid-cols-2 gap-2">
                                    {paymentMethods.map((method) => (
                                      <Button
                                        key={method.name}
                                        variant="outline"
                                        onClick={() => handleProcessPayment(selectedUser?.id, method.name)}
                                        className="p-4 h-auto flex flex-col"
                                      >
                                        <span className="text-xl mb-1">{method.icon}</span>
                                        <span className="text-sm">{method.name}</span>
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
                <CardHeader>
                  <CardTitle>Network Monitoring</CardTitle>
                  <CardDescription>Monitor network performance and connectivity across all locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {networkStats.map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            location.status === 'Online' ? 'bg-green-100' : 
                            location.status === 'Maintenance' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            <Router className={`h-5 w-5 ${
                              location.status === 'Online' ? 'text-green-600' : 
                              location.status === 'Maintenance' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{location.location}</p>
                            <p className="text-sm text-slate-500">{location.users} active users</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-xs text-slate-500">Bandwidth</p>
                            <p className="font-medium">{location.bandwidth}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-500">Latency</p>
                            <p className="font-medium">{location.latency}</p>
                          </div>
                          <Badge variant={
                            location.status === 'Online' ? 'default' : 
                            location.status === 'Maintenance' ? 'secondary' : 'destructive'
                          }>
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
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure your ISP management system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Payment Configuration</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">M-Pesa Integration</p>
                          <p className="text-sm text-slate-500">Safaricom M-Pesa payments</p>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">Airtel Money Integration</p>
                          <p className="text-sm text-slate-500">Airtel mobile payments</p>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">General Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Default Currency</Label>
                        <Select defaultValue="KES">
                          <SelectTrigger className="mt-1">
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
                        <Label>Time Zone</Label>
                        <Select defaultValue="EAT">
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EAT">East Africa Time (EAT)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
