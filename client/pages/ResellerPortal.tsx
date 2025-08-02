import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Building
} from "lucide-react";

export default function ResellerPortal() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [resellerData, setResellerData] = useState({
    company: "Nairobi Tech Solutions",
    username: "nairobi_tech",
    contact: "James Kimani",
    credit: 50000,
    commission: 15,
    permissions: ["users", "vouchers", "plans"]
  });

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: ""
  });

  const [vouchers] = useState([
    { id: 1, code: "HOUR001", plan: "1 Hour Basic", amount: 10, status: "Unused", createdAt: "2024-01-15" },
    { id: 2, code: "HOUR002", plan: "2 Hour Standard", amount: 18, status: "Used", createdAt: "2024-01-14" },
    { id: 3, code: "DAY001", plan: "Daily Basic", amount: 50, status: "Unused", createdAt: "2024-01-16" }
  ]);

  const [stats] = useState({
    totalVouchers: 150,
    usedVouchers: 89,
    totalSales: 125000,
    commission: 18750
  });

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
                Don't have an account? Contact your administrator
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
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200">
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
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Vouchers</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalVouchers}</p>
                </div>
                <Ticket className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Used</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.usedVouchers}</p>
                </div>
                <Users2 className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Sales</p>
                  <p className="text-2xl font-bold text-slate-900">KES {Math.floor(stats.totalSales / 1000)}K</p>
                </div>
                <DollarSign className="h-5 w-5 text-purple-600" />
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

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-600">Contact Person</p>
                <p className="font-medium">{resellerData.contact}</p>
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
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {resellerData.permissions.map((permission) => (
                <Badge key={permission} variant="secondary" className="capitalize">
                  {permission}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vouchers Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Vouchers</CardTitle>
              <CardDescription>Manage your voucher inventory</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vouchers.map((voucher) => (
                <div key={voucher.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Ticket className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium font-mono">{voucher.code}</p>
                      <p className="text-sm text-slate-500">{voucher.plan}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">KES {voucher.amount}</p>
                      <Badge variant={voucher.status === 'Unused' ? 'default' : 'secondary'}>
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
      </main>
    </div>
  );
}
