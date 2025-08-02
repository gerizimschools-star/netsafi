import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  X
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data for the dashboard
  const stats = {
    activeUsers: 1248,
    totalRevenue: 45680,
    networkUptime: 99.8,
    pendingInvoices: 23
  };

  const recentUsers = [
    { id: 1, name: "John Doe", plan: "Premium", status: "Active", usage: "12.5 GB", lastSeen: "2 min ago" },
    { id: 2, name: "Jane Smith", plan: "Standard", status: "Active", usage: "8.2 GB", lastSeen: "5 min ago" },
    { id: 3, name: "Mike Johnson", plan: "Basic", status: "Expired", usage: "3.1 GB", lastSeen: "1 hour ago" },
    { id: 4, name: "Sarah Wilson", plan: "Premium", status: "Active", usage: "15.8 GB", lastSeen: "10 min ago" },
    { id: 5, name: "David Brown", plan: "Standard", status: "Suspended", usage: "0 GB", lastSeen: "2 days ago" }
  ];

  const recentInvoices = [
    { id: "INV-001", customer: "John Doe", amount: 49.99, status: "Paid", date: "2024-01-15" },
    { id: "INV-002", customer: "Jane Smith", amount: 29.99, status: "Pending", date: "2024-01-14" },
    { id: "INV-003", customer: "Mike Johnson", amount: 19.99, status: "Overdue", date: "2024-01-10" },
    { id: "INV-004", customer: "Sarah Wilson", amount: 49.99, status: "Paid", date: "2024-01-12" }
  ];

  const navItems = [
    { name: "Overview", icon: Activity, active: true },
    { name: "Users", icon: Users, active: false },
    { name: "Network", icon: Wifi, active: false },
    { name: "Billing", icon: DollarSign, active: false },
    { name: "Settings", icon: Settings, active: false }
  ];

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
                      +12% from last month
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
                    <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center text-sm text-green-600 mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8% from last month
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
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="grid gap-4 md:grid-cols-2">
              {/* Recent Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-lg">Recent Users</CardTitle>
                    <CardDescription>Latest user activity and status</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">{user.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.plan} Plan</p>
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

              {/* Recent Invoices */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-lg">Recent Invoices</CardTitle>
                    <CardDescription>Latest billing and payments</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{invoice.id}</p>
                        <p className="text-xs text-slate-500">{invoice.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">${invoice.amount}</p>
                        <Badge variant={invoice.status === 'Paid' ? 'default' : invoice.status === 'Pending' ? 'secondary' : 'destructive'}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage your ISP customers and their accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">User management interface coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Management</CardTitle>
                  <CardDescription>Handle billing, payments, and invoice generation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Invoice management interface coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="network">
              <Card>
                <CardHeader>
                  <CardTitle>Network Monitoring</CardTitle>
                  <CardDescription>Monitor network performance and connectivity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Wifi className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Network monitoring interface coming soon...</p>
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
