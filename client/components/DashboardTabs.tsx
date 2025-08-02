import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Router,
  Zap,
  Users2,
  Ticket,
  Globe,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Play,
  Pause,
  Power,
  Signal,
  Wifi,
  Clock,
  Download,
  Upload,
  Building,
  Key,
  CreditCard,
  Palette,
  FileText,
  Link as LinkIcon
} from "lucide-react";

interface TabsProps {
  routers: any[];
  setRouters: (routers: any[]) => void;
  resellers: any[];
  setResellers: (resellers: any[]) => void;
  vouchers: any[];
  setVouchers: (vouchers: any[]) => void;
  activeSessions: any[];
  setActiveSessions: (sessions: any[]) => void;
  showAddDialog: boolean;
  setShowAddDialog: (show: boolean) => void;
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  selectedItem: any;
  setSelectedItem: (item: any) => void;
  handleCreateRouter: (formData: FormData) => void;
  handleCreateReseller: (formData: FormData) => void;
  permissionsList: string[];
}

export default function DashboardTabs({
  routers,
  setRouters,
  resellers,
  setResellers,
  vouchers,
  setVouchers,
  activeSessions,
  setActiveSessions,
  showAddDialog,
  setShowAddDialog,
  showEditDialog,
  setShowEditDialog,
  selectedItem,
  setSelectedItem,
  handleCreateRouter,
  handleCreateReseller,
  permissionsList
}: TabsProps) {

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

  const handleResellerAction = (resellerId: number, action: string) => {
    setResellers(resellers.map(reseller => 
      reseller.id === resellerId 
        ? { ...reseller, status: action === 'suspend' ? 'Suspended' : 'Active' }
        : reseller
    ));
  };

  return (
    <>
      {/* Routers Tab */}
      <TabsContent value="routers">
        <Card>
          <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div>
              <CardTitle className="text-base lg:text-lg">Router Management</CardTitle>
              <CardDescription className="text-xs lg:text-sm">Manage Mikrotik and other routers</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
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
                        Commission: {reseller.commission}% • Credit: KES {reseller.credit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={reseller.status === 'Active' ? 'default' : 'destructive'}>
                      {reseller.status}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleResellerAction(reseller.id, reseller.status === 'Active' ? 'suspend' : 'activate')}
                      >
                        {reseller.status === 'Active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
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
                  <Input id="portal_title" defaultValue="PHP Radius Internet Portal" />
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
                <Textarea id="welcome_message" defaultValue="Welcome to our high-speed internet service!" />
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
    </>
  );
}
