import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SecurityManagement } from "@/components/SecurityManagement";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Link as LinkIcon,
  Save,
  Mail,
  MessageCircle,
  Image,
  Banknote,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showSMSConfigDialog, setShowSMSConfigDialog] = useState(false);
  const [showEmailConfigDialog, setShowEmailConfigDialog] = useState(false);
  const [showBankConfigDialog, setShowBankConfigDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [editingType, setEditingType] = useState("");

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Router Connected",
      message: "Nairobi Central Router is now online",
      type: "success",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      title: "Low Credit Alert",
      message: "Reseller 'Nairobi Tech' has low credit",
      type: "warning",
      time: "5 min ago",
      read: false,
    },
    {
      id: 3,
      title: "Payment Received",
      message: "KES 50 received via M-Pesa",
      type: "success",
      time: "10 min ago",
      read: true,
    },
    {
      id: 4,
      title: "User Session Expired",
      message: "John Mwangi's 1-hour session ended",
      type: "info",
      time: "15 min ago",
      read: true,
    },
  ]);

  // Mock data
  const [stats, setStats] = useState({
    activeUsers: 324,
    totalRevenue: 85600,
    activeRouters: 5,
    pendingVouchers: 23,
    dailyPlans: 156,
    resellers: 12,
  });

  const [timePlans, setTimePlans] = useState([
    {
      id: 1,
      name: "1 Hour Basic",
      duration: 1,
      price: 10,
      speed_down: 5,
      speed_up: 2,
      category: "hourly",
      active: true,
    },
    {
      id: 2,
      name: "2 Hour Standard",
      duration: 2,
      price: 18,
      speed_down: 10,
      speed_up: 5,
      category: "hourly",
      active: true,
    },
    {
      id: 3,
      name: "4 Hour Premium",
      duration: 4,
      price: 35,
      speed_down: 20,
      speed_up: 10,
      category: "hourly",
      active: true,
    },
    {
      id: 4,
      name: "Daily Basic",
      duration: 24,
      price: 50,
      speed_down: 5,
      speed_up: 2,
      category: "daily",
      active: true,
    },
    {
      id: 5,
      name: "Daily Standard",
      duration: 24,
      price: 80,
      speed_down: 10,
      speed_up: 5,
      category: "daily",
      active: true,
    },
    {
      id: 6,
      name: "Daily Premium",
      duration: 24,
      price: 120,
      speed_down: 20,
      speed_up: 10,
      category: "daily",
      active: true,
    },
  ]);

  const [routers, setRouters] = useState([
    {
      id: 1,
      name: "Nairobi Central",
      ip: "192.168.1.1",
      status: "Online",
      users: 89,
      model: "RB4011iGS+",
      location: "Nairobi",
      lastSync: "2 min ago",
      username: "admin",
      password: "mikrotik123",
    },
    {
      id: 2,
      name: "Mombasa Branch",
      ip: "192.168.2.1",
      status: "Online",
      users: 67,
      model: "RB4011iGS+",
      location: "Mombasa",
      lastSync: "3 min ago",
      username: "admin",
      password: "mikrotik456",
    },
    {
      id: 3,
      name: "Kisumu Office",
      ip: "192.168.3.1",
      status: "Maintenance",
      users: 0,
      model: "RB3011UiAS",
      location: "Kisumu",
      lastSync: "30 min ago",
      username: "admin",
      password: "mikrotik789",
    },
    {
      id: 4,
      name: "Nakuru Hub",
      ip: "192.168.4.1",
      status: "Online",
      users: 45,
      model: "RB3011UiAS",
      location: "Nakuru",
      lastSync: "1 min ago",
      username: "admin",
      password: "mikrotik321",
    },
    {
      id: 5,
      name: "Eldoret Station",
      ip: "192.168.5.1",
      status: "Online",
      users: 56,
      model: "RB2011UiAS",
      location: "Eldoret",
      lastSync: "4 min ago",
      username: "admin",
      password: "mikrotik654",
    },
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
      permissions: ["users", "vouchers", "plans"],
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
      permissions: ["users", "vouchers"],
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
      permissions: ["users"],
    },
  ]);

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Mwangi",
      phone: "+254712345678",
      plan: "Premium",
      status: "Active",
      usage: "12.5 GB",
      lastSeen: "2 min ago",
      amount: 2500,
      location: "Nairobi",
      joinDate: "2023-12-15",
      email: "john.mwangi@email.com",
    },
    {
      id: 2,
      name: "Grace Njeri",
      phone: "+254723456789",
      plan: "Standard",
      status: "Active",
      usage: "8.2 GB",
      lastSeen: "5 min ago",
      amount: 1500,
      location: "Mombasa",
      joinDate: "2024-01-02",
      email: "grace.njeri@email.com",
    },
    {
      id: 3,
      name: "Peter Ochieng",
      phone: "+254734567890",
      plan: "Basic",
      status: "Expired",
      usage: "3.1 GB",
      lastSeen: "1 hour ago",
      amount: 800,
      location: "Kisumu",
      joinDate: "2023-11-20",
      email: "peter.ochieng@email.com",
    },
    {
      id: 4,
      name: "Mary Wanjiku",
      phone: "+254745678901",
      plan: "Premium",
      status: "Active",
      usage: "15.8 GB",
      lastSeen: "10 min ago",
      amount: 2500,
      location: "Nakuru",
      joinDate: "2024-01-10",
      email: "mary.wanjiku@email.com",
    },
    {
      id: 5,
      name: "David Kamau",
      phone: "+254756789012",
      plan: "Standard",
      status: "Suspended",
      usage: "0 GB",
      lastSeen: "2 days ago",
      amount: 1500,
      location: "Eldoret",
      joinDate: "2023-12-01",
      email: "david.kamau@email.com",
    },
  ]);

  const [vouchers, setVouchers] = useState([
    {
      id: 1,
      code: "HOUR001",
      planName: "1 Hour Basic",
      amount: 10,
      status: "Unused",
      reseller: "Nairobi Tech",
      createdAt: "2024-01-15",
      expiresAt: "2024-02-15",
    },
    {
      id: 2,
      code: "HOUR002",
      planName: "2 Hour Standard",
      amount: 18,
      status: "Used",
      reseller: "Coast Internet",
      createdAt: "2024-01-14",
      expiresAt: "2024-02-14",
    },
    {
      id: 3,
      code: "DAY001",
      planName: "Daily Basic",
      amount: 50,
      status: "Unused",
      reseller: "Lake Connect",
      createdAt: "2024-01-16",
      expiresAt: "2024-02-16",
    },
    {
      id: 4,
      code: "PREM001",
      planName: "Daily Premium",
      amount: 120,
      status: "Unused",
      reseller: "Nairobi Tech",
      createdAt: "2024-01-17",
      expiresAt: "2024-02-17",
    },
  ]);

  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      username: "john_mwangi",
      plan: "1 Hour Basic",
      router: "Nairobi Central",
      timeLeft: "45:23",
      dataUsed: "125 MB",
      ip: "192.168.1.100",
    },
    {
      id: 2,
      username: "grace_njeri",
      plan: "Daily Premium",
      router: "Mombasa Branch",
      timeLeft: "18:45:12",
      dataUsed: "2.1 GB",
      ip: "192.168.2.150",
    },
    {
      id: 3,
      username: "peter_ochieng",
      plan: "2 Hour Standard",
      router: "Nakuru Hub",
      timeLeft: "1:15:30",
      dataUsed: "450 MB",
      ip: "192.168.4.75",
    },
  ]);

  const [invoices, setInvoices] = useState([
    {
      id: "INV-001",
      customer: "John Mwangi",
      phone: "+254712345678",
      amount: 2500,
      status: "Paid",
      date: "2024-01-15",
      paymentMethod: "M-Pesa",
      dueDate: "2024-01-31",
    },
    {
      id: "INV-002",
      customer: "Grace Njeri",
      phone: "+254723456789",
      amount: 1500,
      status: "Pending",
      date: "2024-01-14",
      paymentMethod: "Pending",
      dueDate: "2024-01-28",
    },
    {
      id: "INV-003",
      customer: "Peter Ochieng",
      phone: "+254734567890",
      amount: 800,
      status: "Overdue",
      date: "2024-01-10",
      paymentMethod: "Failed",
      dueDate: "2024-01-24",
    },
    {
      id: "INV-004",
      customer: "Mary Wanjiku",
      phone: "+254745678901",
      amount: 2500,
      status: "Paid",
      date: "2024-01-12",
      paymentMethod: "Airtel Money",
      dueDate: "2024-01-26",
    },
  ]);

  const [smsConfig, setSmsConfig] = useState({
    provider: "africastalking",
    apiKey: "",
    username: "",
    senderId: "NetSafi",
    enabled: true,
  });

  const [emailConfig, setEmailConfig] = useState({
    provider: "smtp",
    host: "smtp.gmail.com",
    port: "587",
    username: "",
    password: "",
    fromEmail: "noreply@netsafi.com",
    enabled: true,
  });

  const [bankConfig, setBankConfig] = useState({
    equity: { paybill: "247247", account: "", enabled: false },
    kcb: { paybill: "522522", account: "", enabled: false },
  });

  const [paymentConfig, setPaymentConfig] = useState({
    mpesa: {
      enabled: true,
      businessShortCode: "174379",
      passkey: "",
      consumerKey: "",
      consumerSecret: "",
    },
    airtelMoney: {
      enabled: true,
      clientId: "",
      clientSecret: "",
      merchantId: "",
    },
    tkash: { enabled: false, apiKey: "", merchantCode: "" },
    paypal: { enabled: false, clientId: "", clientSecret: "" },
  });

  const [adminPreferences, setAdminPreferences] = useState({
    language: "en",
    timezone: "EAT",
    currency: "KES",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "24h",
    theme: "light",
    dashboardLayout: "default",
    autoRefresh: true,
    refreshInterval: 30,
    companyName: "NetSafi ISP",
    contactEmail: "admin@netsafi.com",
    supportPhone: "+254700000000",
    maxSessionDuration: 24,
    defaultUserPlan: "Basic",
    enableDebugMode: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      enabled: true,
      newUser: true,
      lowCredit: true,
      systemAlerts: true,
      routerOffline: true,
      dailyReports: false,
      weeklyReports: true,
      monthlyReports: true,
    },
    smsNotifications: {
      enabled: true,
      criticalAlerts: true,
      routerDown: true,
      lowCredit: false,
      newReseller: true,
    },
    pushNotifications: {
      enabled: true,
      browserNotifications: true,
      soundEnabled: true,
      vibrationEnabled: false,
    },
    alertThresholds: {
      lowCreditAmount: 5000,
      highUsageMB: 1000,
      routerOfflineMinutes: 5,
      sessionTimeoutMinutes: 60,
    },
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    enableTwoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,
    enableApiAccess: true,
    apiRateLimit: 1000,
    enableAuditLog: true,
    backupFrequency: "daily",
    enableDarkMode: false,
    enableMobileApp: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    enableTwoFactor: false,
    trustedDevices: [],
    lastPasswordChange: "2024-01-01",
    loginHistory: [
      {
        date: "2024-01-18 10:30",
        ip: "192.168.1.100",
        location: "Nairobi",
        device: "Chrome/Windows",
      },
      {
        date: "2024-01-17 14:15",
        ip: "192.168.1.100",
        location: "Nairobi",
        device: "Chrome/Windows",
      },
      {
        date: "2024-01-16 09:45",
        ip: "192.168.1.105",
        location: "Nairobi",
        device: "Firefox/Windows",
      },
    ],
  });

  const [adminProfile, setAdminProfile] = useState({
    firstName: "System",
    lastName: "Administrator",
    username: "admin",
    email: "admin@netsafi.com",
    phone: "+254700000000",
    alternatePhone: "",
    department: "IT Management",
    jobTitle: "System Administrator",
    employeeId: "EMP001",
    dateJoined: "2023-01-15",
    profilePicture: "",
    bio: "Experienced system administrator managing NetSafi ISP operations.",
    address: {
      street: "123 Technology Street",
      city: "Nairobi",
      state: "Nairobi County",
      zipCode: "00100",
      country: "Kenya",
    },
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    permissions: [
      "full_access",
      "user_management",
      "system_settings",
      "financial_access",
    ],
    lastLogin: "2024-01-18 10:30",
    accountStatus: "Active",
    twoFactorEnabled: false,
  });

  const [showPaymentConfigDialog, setShowPaymentConfigDialog] = useState(false);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState("");
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [showNotificationSettingsDialog, setShowNotificationSettingsDialog] =
    useState(false);
  const [showSystemSettingsDialog, setShowSystemSettingsDialog] =
    useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);

  const permissionsList = [
    "users",
    "invoices",
    "vouchers",
    "plans",
    "routers",
    "reports",
    "settings",
  ];

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
    { name: "Settings", icon: Settings, active: activeTab === "settings" },
  ];

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Event Handlers
  const handleLogout = () => {
    navigate("/");
  };

  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setEditingType(type);
    setShowEditDialog(true);
  };

  const handleDelete = (id, type) => {
    if (confirm("Are you sure you want to delete this item?")) {
      switch (type) {
        case "plan":
          setTimePlans(timePlans.filter((p) => p.id !== id));
          break;
        case "router":
          setRouters(routers.filter((r) => r.id !== id));
          break;
        case "reseller":
          setResellers(resellers.filter((r) => r.id !== id));
          break;
        case "user":
          setUsers(users.filter((u) => u.id !== id));
          break;
        case "voucher":
          setVouchers(vouchers.filter((v) => v.id !== id));
          break;
      }
    }
  };

  const handleExportVouchers = () => {
    setShowExportDialog(true);
  };

  const handleMessage = (user) => {
    setSelectedItem(user);
    setShowMessageDialog(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedItem(invoice);
    setShowInvoiceDialog(true);
  };

  const handleDownloadInvoice = (invoice) => {
    // Generate PDF content
    const pdfContent = `Invoice ${invoice.id}\n\nCustomer: ${invoice.customer}\nAmount: KES ${invoice.amount}\nStatus: ${invoice.status}\nDate: ${invoice.date}\nDue Date: ${invoice.dueDate}\nPayment Method: ${invoice.paymentMethod}`;

    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice.id}.txt`;
    a.click();
    alert("Invoice downloaded successfully!");
  };

  const handleSendInvoiceToCustomer = (invoice) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(
        `Invoice ${invoice.id} sent to ${invoice.customer} at ${invoice.phone}`,
      );
      setShowInvoiceDialog(false);
    }, 1500);
  };

  const handlePaymentConfigSave = (formData) => {
    const gateway = selectedPaymentGateway;
    setPaymentConfig((prev) => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        enabled: formData.get("enabled") === "on",
        ...(gateway === "mpesa" && {
          businessShortCode: formData.get("businessShortCode"),
          passkey: formData.get("passkey"),
          consumerKey: formData.get("consumerKey"),
          consumerSecret: formData.get("consumerSecret"),
        }),
        ...(gateway === "airtelMoney" && {
          clientId: formData.get("clientId"),
          clientSecret: formData.get("clientSecret"),
          merchantId: formData.get("merchantId"),
        }),
      },
    }));
    setShowPaymentConfigDialog(false);
    alert(`${gateway} configuration saved successfully!`);
  };

  const handlePaymentGatewayConfig = (gateway) => {
    setSelectedPaymentGateway(gateway);
    setShowPaymentConfigDialog(true);
  };

  const handlePreferencesSave = (formData) => {
    setAdminPreferences({
      language: formData.get("language"),
      timezone: formData.get("timezone"),
      currency: formData.get("currency"),
      dateFormat: formData.get("dateFormat"),
      timeFormat: formData.get("timeFormat"),
      theme: formData.get("theme"),
      dashboardLayout: formData.get("dashboardLayout"),
      autoRefresh: formData.get("autoRefresh") === "on",
      refreshInterval: parseInt(formData.get("refreshInterval")),
      companyName: formData.get("companyName"),
      contactEmail: formData.get("contactEmail"),
      supportPhone: formData.get("supportPhone"),
      maxSessionDuration: parseInt(formData.get("maxSessionDuration")),
      defaultUserPlan: formData.get("defaultUserPlan"),
      enableDebugMode: formData.get("enableDebugMode") === "on",
    });
    setShowPreferencesDialog(false);
    alert("Administrator preferences saved successfully!");
  };

  const handleNotificationSettingsSave = (formData) => {
    setNotificationSettings({
      emailNotifications: {
        enabled: formData.get("emailEnabled") === "on",
        newUser: formData.get("emailNewUser") === "on",
        lowCredit: formData.get("emailLowCredit") === "on",
        systemAlerts: formData.get("emailSystemAlerts") === "on",
        routerOffline: formData.get("emailRouterOffline") === "on",
        dailyReports: formData.get("emailDailyReports") === "on",
        weeklyReports: formData.get("emailWeeklyReports") === "on",
        monthlyReports: formData.get("emailMonthlyReports") === "on",
      },
      smsNotifications: {
        enabled: formData.get("smsEnabled") === "on",
        criticalAlerts: formData.get("smsCriticalAlerts") === "on",
        routerDown: formData.get("smsRouterDown") === "on",
        lowCredit: formData.get("smsLowCredit") === "on",
        newReseller: formData.get("smsNewReseller") === "on",
      },
      pushNotifications: {
        enabled: formData.get("pushEnabled") === "on",
        browserNotifications: formData.get("pushBrowser") === "on",
        soundEnabled: formData.get("pushSound") === "on",
        vibrationEnabled: formData.get("pushVibration") === "on",
      },
      alertThresholds: {
        lowCreditAmount: parseInt(formData.get("lowCreditAmount")),
        highUsageMB: parseInt(formData.get("highUsageMB")),
        routerOfflineMinutes: parseInt(formData.get("routerOfflineMinutes")),
        sessionTimeoutMinutes: parseInt(formData.get("sessionTimeoutMinutes")),
      },
    });
    setShowNotificationSettingsDialog(false);
    alert("Notification settings saved successfully!");
  };

  const handleSystemSettingsSave = (formData) => {
    setSystemSettings({
      maintenanceMode: formData.get("maintenanceMode") === "on",
      allowRegistration: formData.get("allowRegistration") === "on",
      requireEmailVerification:
        formData.get("requireEmailVerification") === "on",
      enableTwoFactorAuth: formData.get("enableTwoFactorAuth") === "on",
      sessionTimeout: parseInt(formData.get("sessionTimeout")),
      maxLoginAttempts: parseInt(formData.get("maxLoginAttempts")),
      passwordMinLength: parseInt(formData.get("passwordMinLength")),
      requireStrongPassword: formData.get("requireStrongPassword") === "on",
      enableApiAccess: formData.get("enableApiAccess") === "on",
      apiRateLimit: parseInt(formData.get("apiRateLimit")),
      enableAuditLog: formData.get("enableAuditLog") === "on",
      backupFrequency: formData.get("backupFrequency"),
      enableDarkMode: formData.get("enableDarkMode") === "on",
      enableMobileApp: formData.get("enableMobileApp") === "on",
    });
    setShowSystemSettingsDialog(false);
    alert("System settings saved successfully!");
  };

  const handleSecuritySettingsSave = (formData) => {
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword && newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }

    setSecuritySettings((prev) => ({
      ...prev,
      enableTwoFactor: formData.get("enableTwoFactor") === "on",
      lastPasswordChange: newPassword
        ? new Date().toISOString().split("T")[0]
        : prev.lastPasswordChange,
    }));

    setShowSecurityDialog(false);
    alert("Security settings updated successfully!");
  };

  const handleProfileUpdate = (formData) => {
    setIsLoading(true);

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "phone"];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        alert(`${field} is required!`);
        setIsLoading(false);
        return;
      }
    }

    // Validate email format
    const email = formData.get("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address!");
      setIsLoading(false);
      return;
    }

    // Validate phone format
    const phone = formData.get("phone");
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      alert("Please enter a valid phone number!");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      setAdminProfile((prev) => ({
        ...prev,
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        username: formData.get("username"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        alternatePhone: formData.get("alternatePhone") || "",
        department: formData.get("department"),
        jobTitle: formData.get("jobTitle"),
        bio: formData.get("bio") || "",
        address: {
          street: formData.get("street") || "",
          city: formData.get("city") || "",
          state: formData.get("state") || "",
          zipCode: formData.get("zipCode") || "",
          country: formData.get("country") || "Kenya",
        },
        emergencyContact: {
          name: formData.get("emergencyName") || "",
          relationship: formData.get("emergencyRelationship") || "",
          phone: formData.get("emergencyPhone") || "",
        },
      }));

      setIsLoading(false);
      setShowProfileDialog(false);
      alert("Profile updated successfully!");
    }, 1500);
  };

  const handleSave = (formData, type) => {
    switch (type) {
      case "plan":
        if (selectedItem?.id) {
          setTimePlans(
            timePlans.map((p) =>
              p.id === selectedItem.id ? { ...p, ...formData } : p,
            ),
          );
        } else {
          const newPlan = { id: Date.now(), ...formData };
          setTimePlans([...timePlans, newPlan]);
        }
        break;
      case "router":
        if (selectedItem?.id) {
          setRouters(
            routers.map((r) =>
              r.id === selectedItem.id ? { ...r, ...formData } : r,
            ),
          );
        } else {
          const newRouter = {
            id: Date.now(),
            ...formData,
            status: "Online",
            users: 0,
            lastSync: "Just now",
          };
          setRouters([...routers, newRouter]);
        }
        break;
      case "reseller":
        if (selectedItem?.id) {
          setResellers(
            resellers.map((r) =>
              r.id === selectedItem.id ? { ...r, ...formData } : r,
            ),
          );
        } else {
          const newReseller = {
            id: Date.now(),
            ...formData,
            status: "Active",
            credit: 0,
            permissions: [],
          };
          setResellers([...resellers, newReseller]);
        }
        break;
      case "user":
        if (selectedItem?.id) {
          setUsers(
            users.map((u) =>
              u.id === selectedItem.id ? { ...u, ...formData } : u,
            ),
          );
        }
        break;
    }
    setShowEditDialog(false);
    setSelectedItem(null);
    setEditingType("");
  };

  const markNotificationRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleSendMessage = (formData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(
        `SMS sent to ${selectedItem?.name} (${selectedItem?.phone}): ${formData.get("message")}`,
      );
      setShowMessageDialog(false);
      setSelectedItem(null);
    }, 1500);
  };

  const handleSMSConfigSave = (formData) => {
    setSmsConfig({
      provider: formData.get("provider"),
      apiKey: formData.get("apiKey"),
      username: formData.get("username"),
      senderId: formData.get("senderId"),
      enabled: true,
    });
    setShowSMSConfigDialog(false);
    alert("SMS configuration saved successfully!");
  };

  const handleEmailConfigSave = (formData) => {
    setEmailConfig({
      provider: formData.get("provider"),
      host: formData.get("host"),
      port: formData.get("port"),
      username: formData.get("username"),
      password: formData.get("password"),
      fromEmail: formData.get("fromEmail"),
      enabled: true,
    });
    setShowEmailConfigDialog(false);
    alert("Email configuration saved successfully!");
  };

  const handleBankConfigSave = (formData) => {
    setBankConfig({
      equity: {
        paybill: "247247",
        account: formData.get("equityAccount"),
        enabled: formData.get("equityEnabled") === "on",
      },
      kcb: {
        paybill: "522522",
        account: formData.get("kcbAccount"),
        enabled: formData.get("kcbEnabled") === "on",
      },
    });
    setShowBankConfigDialog(false);
    alert("Bank configuration saved successfully!");
  };

  const downloadVoucherExport = (format) => {
    const data = vouchers.map((v) => ({
      Code: v.code,
      Plan: v.planName,
      Amount: `KES ${v.amount}`,
      Status: v.status,
      Reseller: v.reseller,
      Created: v.createdAt,
      Expires: v.expiresAt,
    }));

    if (format === "csv") {
      const csv = [
        Object.keys(data[0]).join(","),
        ...data.map((row) => Object.values(row).join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vouchers.csv";
      a.click();
    } else if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vouchers.json";
      a.click();
    }

    setShowExportDialog(false);
    alert(`Vouchers exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-sm border-r border-slate-200 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
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
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className="h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-3 lg:left-4 right-3 lg:right-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-sm lg:text-base"
            size="sm"
          >
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
            <h1 className="text-lg lg:text-xl font-semibold text-slate-800">
              NetSafi ISP Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 lg:h-10 lg:w-10 relative"
                >
                  <Bell className="h-4 w-4 lg:h-5 lg:w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  {unreadNotifications > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllNotificationsRead}
                    >
                      Mark all read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            notification.type === "success"
                              ? "bg-green-500"
                              : notification.type === "warning"
                                ? "bg-yellow-500"
                                : notification.type === "error"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                          }`}
                        />
                        <span className="font-medium text-sm">
                          {notification.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs lg:text-sm font-medium text-blue-700">
                      A
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">
                    Administrator
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setShowCredentialsDialog(true)}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Reseller Credentials
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowPreferencesDialog(true)}
                >
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
                    <p className="text-xs lg:text-sm text-slate-600">
                      Active Users
                    </p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">
                      {stats.activeUsers}
                    </p>
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
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">
                      KES {Math.floor(stats.totalRevenue / 1000)}K
                    </p>
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
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">
                      {stats.activeRouters}
                    </p>
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
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">
                      {stats.dailyPlans}
                    </p>
                  </div>
                  <Timer className="h-4 w-4 lg:h-5 lg:w-5 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-slate-600">
                      Resellers
                    </p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">
                      {stats.resellers}
                    </p>
                  </div>
                  <Users2 className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-slate-600">
                      Vouchers
                    </p>
                    <p className="text-lg lg:text-2xl font-bold text-slate-900">
                      {stats.pendingVouchers}
                    </p>
                  </div>
                  <Ticket className="h-4 w-4 lg:h-5 lg:w-5 text-pink-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-3 lg:space-y-4"
          >
            <div className="overflow-x-auto">
              <TabsList className="inline-flex w-max min-w-full lg:w-auto h-9 lg:h-10">
                <TabsTrigger
                  value="overview"
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="plans"
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Plans
                </TabsTrigger>
                <TabsTrigger
                  value="routers"
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Routers
                </TabsTrigger>
                <TabsTrigger
                  value="sessions"
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Sessions
                </TabsTrigger>
                <TabsTrigger
                  value="resellers"
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Resellers
                </TabsTrigger>
                <TabsTrigger
                  value="vouchers"
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Vouchers
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Users
                </TabsTrigger>
                <TabsTrigger
                  value="invoices"
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Invoices
                </TabsTrigger>
                <TabsTrigger
                  value="portal"
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Portal
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent
              value="overview"
              className="grid gap-3 lg:gap-4 lg:grid-cols-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.slice(0, 4).map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center space-x-3 p-2 lg:p-3 bg-slate-50 rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          notification.type === "success"
                            ? "bg-green-500"
                            : notification.type === "warning"
                              ? "bg-yellow-500"
                              : notification.type === "error"
                                ? "bg-red-500"
                                : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-xs lg:text-sm">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg">
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Online Routers
                    </span>
                    <span className="font-bold text-green-600">
                      {routers.filter((r) => r.status === "Online").length}/
                      {routers.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Active Sessions
                    </span>
                    <span className="font-bold text-blue-600">
                      {activeSessions.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Unused Vouchers
                    </span>
                    <span className="font-bold text-orange-600">
                      {vouchers.filter((v) => v.status === "Unused").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Active Resellers
                    </span>
                    <span className="font-bold text-purple-600">
                      {resellers.filter((r) => r.status === "Active").length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans">
              <Card>
                <CardHeader className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                  <div>
                    <CardTitle className="text-base lg:text-lg">
                      Time-Based Plans
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Manage hourly, daily, and monthly internet plans
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedItem(null);
                      setEditingType("plan");
                      setShowEditDialog(true);
                    }}
                  >
                    <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    Add Plan
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 lg:gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {timePlans.map((plan) => (
                      <Card key={plan.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge
                            variant={plan.active ? "default" : "secondary"}
                          >
                            {plan.active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">{plan.category}</Badge>
                        </div>
                        <h3 className="font-semibold text-base mb-2">
                          {plan.name}
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Duration:</span>
                            <span className="font-medium">
                              {plan.duration}h
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Price:</span>
                            <span className="font-medium text-green-600">
                              KES {plan.price}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Speed:</span>
                            <span className="font-medium">
                              {plan.speed_down}/{plan.speed_up} Mbps
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(plan, "plan")}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDelete(plan.id, "plan")}
                          >
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
                    <CardTitle className="text-base lg:text-lg">
                      Router Management
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Manage Mikrotik and other routers
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedItem(null);
                      setEditingType("router");
                      setShowEditDialog(true);
                    }}
                  >
                    <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    Add Router
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {routers.map((router) => (
                      <div
                        key={router.id}
                        className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              router.status === "Online"
                                ? "bg-green-100"
                                : router.status === "Maintenance"
                                  ? "bg-yellow-100"
                                  : "bg-red-100"
                            }`}
                          >
                            <Router
                              className={`h-5 w-5 ${
                                router.status === "Online"
                                  ? "text-green-600"
                                  : router.status === "Maintenance"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{router.name}</p>
                            <p className="text-sm text-slate-500">
                              {router.ip} • {router.location}
                            </p>
                            <p className="text-xs text-slate-400">
                              {router.model} • {router.users} users • Updated:{" "}
                              {router.lastSync}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              router.status === "Online"
                                ? "default"
                                : router.status === "Maintenance"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {router.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(router, "router")}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(router, "router")}
                            >
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
                  <CardTitle className="text-base lg:text-lg">
                    Active Sessions
                  </CardTitle>
                  <CardDescription className="text-xs lg:text-sm">
                    Monitor and manage active user sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{session.username}</p>
                            <p className="text-sm text-slate-500">
                              {session.plan} • {session.router}
                            </p>
                            <p className="text-xs text-slate-400">
                              IP: {session.ip} • Data used: {session.dataUsed}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              {session.timeLeft}
                            </p>
                            <p className="text-xs text-slate-500">
                              Time remaining
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
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
                    <CardTitle className="text-base lg:text-lg">
                      Reseller Management
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Manage resellers, permissions, and credit balances
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedItem(null);
                      setEditingType("reseller");
                      setShowEditDialog(true);
                    }}
                  >
                    <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                    Add Reseller
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {resellers.map((reseller) => (
                      <div
                        key={reseller.id}
                        className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{reseller.company}</p>
                            <p className="text-sm text-slate-500">
                              {reseller.contact} • {reseller.email}
                            </p>
                            <p className="text-xs text-slate-400">
                              Username: {reseller.username} • Commission:{" "}
                              {reseller.commission}% • Credit: KES{" "}
                              {reseller.credit.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              reseller.status === "Active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {reseller.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <CreditCard className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(reseller, "reseller")}
                            >
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
                    <CardTitle className="text-base lg:text-lg">
                      Voucher Management
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Generate and manage prepaid vouchers
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportVouchers}
                    >
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
                      <div
                        key={voucher.id}
                        className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                            <Ticket className="h-5 w-5 text-pink-600" />
                          </div>
                          <div>
                            <p className="font-medium font-mono">
                              {voucher.code}
                            </p>
                            <p className="text-sm text-slate-500">
                              {voucher.planName} • {voucher.reseller}
                            </p>
                            <p className="text-xs text-slate-400">
                              Created: {voucher.createdAt} • Expires:{" "}
                              {voucher.expiresAt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">KES {voucher.amount}</p>
                            <Badge
                              variant={
                                voucher.status === "Unused"
                                  ? "default"
                                  : voucher.status === "Used"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
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
                  <CardTitle className="text-base lg:text-lg">
                    User Management
                  </CardTitle>
                  <CardDescription className="text-xs lg:text-sm">
                    Manage customer accounts and their subscriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-slate-500">
                              {user.phone} • {user.location}
                            </p>
                            <p className="text-xs text-slate-400">
                              {user.plan} Plan - KES {user.amount}/month •
                              Usage: {user.usage}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              user.status === "Active"
                                ? "default"
                                : user.status === "Expired"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {user.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user, "user")}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMessage(user)}
                            >
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
                  <CardTitle className="text-base lg:text-lg">
                    Invoice Management
                  </CardTitle>
                  <CardDescription className="text-xs lg:text-sm">
                    Handle billing, payments, and mobile money transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 bg-slate-50 rounded-lg gap-3 lg:gap-0"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{invoice.id}</p>
                            <p className="text-sm text-slate-500">
                              {invoice.customer} • {invoice.phone}
                            </p>
                            <p className="text-xs text-slate-400">
                              Due: {invoice.dueDate} • Method:{" "}
                              {invoice.paymentMethod}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">
                              KES {invoice.amount.toLocaleString()}
                            </p>
                            <Badge
                              variant={
                                invoice.status === "Paid"
                                  ? "default"
                                  : invoice.status === "Pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
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
                    <CardTitle className="text-base lg:text-lg">
                      User Portal Customization
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Customize the user plan selection interface
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div>
                        <Label htmlFor="portal_title">Portal Title</Label>
                        <Input
                          id="portal_title"
                          defaultValue="NetSafi Internet Portal"
                        />
                      </div>
                      <div>
                        <Label htmlFor="portal_logo">Logo Upload</Label>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Input
                            id="portal_logo"
                            type="file"
                            accept="image/*"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Upload PNG, JPG or SVG. Max 2MB.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div>
                        <Label htmlFor="theme_color">Theme Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="theme_color"
                            defaultValue="#3B82F6"
                            type="color"
                            className="w-16"
                          />
                          <Input defaultValue="#3B82F6" className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="support_phone">Support Phone</Label>
                        <Input
                          id="support_phone"
                          defaultValue="+254700000000"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="welcome_message">Welcome Message</Label>
                      <Textarea
                        id="welcome_message"
                        defaultValue="Welcome to NetSafi high-speed internet service!"
                        rows={3}
                      />
                    </div>
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                      <div>
                        <p className="font-medium">Portal Preview</p>
                        <p className="text-sm text-slate-500">
                          View how the portal looks to users
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <Button
                          variant="outline"
                          asChild
                          className="w-full sm:w-auto"
                        >
                          <a
                            href="/portal"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Open Portal
                          </a>
                        </Button>
                        <Button className="w-full sm:w-auto">
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
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
                    <CardTitle className="text-base lg:text-lg">
                      Communication Settings
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Configure SMS and Email services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">SMS Configuration</p>
                          <p className="text-sm text-slate-500">
                            Configure SMS gateway for notifications
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSMSConfigDialog(true)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Email Configuration</p>
                          <p className="text-sm text-slate-500">
                            Configure SMTP for email notifications
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEmailConfigDialog(true)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">
                      Payment Gateway Configuration
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Configure mobile money and bank payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: "mpesa", name: "M-Pesa Daraja API", icon: "📱" },
                      { key: "airtelMoney", name: "Airtel Money", icon: "📲" },
                      { key: "tkash", name: "T-Kash", icon: "💳" },
                      { key: "paypal", name: "PayPal", icon: "💰" },
                    ].map((gateway) => (
                      <div
                        key={gateway.key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg gap-3 sm:gap-0"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{gateway.icon}</span>
                          <div>
                            <p className="font-medium">{gateway.name}</p>
                            <p className="text-sm text-slate-500">
                              Payment gateway integration
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={
                              paymentConfig[gateway.key]?.enabled || false
                            }
                            onCheckedChange={(checked) => {
                              setPaymentConfig((prev) => ({
                                ...prev,
                                [gateway.key]: {
                                  ...prev[gateway.key],
                                  enabled: checked,
                                },
                              }));
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePaymentGatewayConfig(gateway.key)
                            }
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg gap-3 sm:gap-0">
                      <div className="flex items-center space-x-3">
                        <Banknote className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium">
                            Bank Paybill Configuration
                          </p>
                          <p className="text-sm text-slate-500">
                            Configure Equity and KCB bank paybills
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={
                            bankConfig.equity.enabled || bankConfig.kcb.enabled
                          }
                          onCheckedChange={(checked) => {
                            setBankConfig((prev) => ({
                              equity: { ...prev.equity, enabled: checked },
                              kcb: { ...prev.kcb, enabled: checked },
                            }));
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowBankConfigDialog(true)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">
                      System Configuration
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Configure system-wide settings
                    </CardDescription>
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
                            <SelectItem value="KES">
                              Kenyan Shillings (KES)
                            </SelectItem>
                            <SelectItem value="USD">
                              US Dollars (USD)
                            </SelectItem>
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
                            <SelectItem value="EAT">
                              East Africa Time (EAT)
                            </SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="CAT">
                              Central Africa Time (CAT)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-refresh dashboard</p>
                          <p className="text-sm text-slate-500">
                            Refresh statistics every 30 seconds
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS notifications</p>
                          <p className="text-sm text-slate-500">
                            Send SMS for important events
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email reports</p>
                          <p className="text-sm text-slate-500">
                            Daily summary reports via email
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">
                      Administrator Settings
                    </CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Advanced system and preference settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">
                            Administrator Preferences
                          </p>
                          <p className="text-sm text-slate-500">
                            Configure personal settings and preferences
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreferencesDialog(true)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium">Notification Settings</p>
                          <p className="text-sm text-slate-500">
                            Configure alerts and notifications
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNotificationSettingsDialog(true)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="font-medium">Security Settings</p>
                          <p className="text-sm text-slate-500">
                            Manage passwords and security options
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSecurityDialog(true)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Server className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">System Settings</p>
                          <p className="text-sm text-slate-500">
                            Configure system-wide settings
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSystemSettingsDialog(true)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
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
            <p className="text-sm text-slate-400">
              © 2025 NetSafi ISP Billing. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Powering Internet Service Providers across Kenya
            </p>
          </div>
        </footer>
      </div>

      {/* Edit Dialog - Universal */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem
                ? `Edit ${editingType.charAt(0).toUpperCase() + editingType.slice(1)}`
                : `Add New ${editingType.charAt(0).toUpperCase() + editingType.slice(1)}`}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? `Update ${editingType} information`
                : `Create a new ${editingType}`}
            </DialogDescription>
          </DialogHeader>

          {editingType === "plan" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  name: formData.get("name"),
                  duration: parseInt(formData.get("duration")),
                  price: parseInt(formData.get("price")),
                  speed_down: parseInt(formData.get("speed_down")),
                  speed_up: parseInt(formData.get("speed_up")),
                  category: formData.get("category"),
                  active: true,
                };
                handleSave(data, "plan");
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  name="name"
                  defaultValue={selectedItem?.name}
                  placeholder="e.g., 1 Hour Basic"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="duration">Duration (hours)</Label>
                  <Input
                    name="duration"
                    type="number"
                    defaultValue={selectedItem?.duration}
                    placeholder="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (KES)</Label>
                  <Input
                    name="price"
                    type="number"
                    defaultValue={selectedItem?.price}
                    placeholder="10"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="speed_down">Download (Mbps)</Label>
                  <Input
                    name="speed_down"
                    type="number"
                    defaultValue={selectedItem?.speed_down}
                    placeholder="5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="speed_up">Upload (Mbps)</Label>
                  <Input
                    name="speed_up"
                    type="number"
                    defaultValue={selectedItem?.speed_up}
                    placeholder="2"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  name="category"
                  defaultValue={selectedItem?.category}
                  required
                >
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
                {selectedItem ? "Update Plan" : "Create Plan"}
              </Button>
            </form>
          )}

          {editingType === "router" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  name: formData.get("name"),
                  ip: formData.get("ip"),
                  location: formData.get("location"),
                  model: formData.get("model"),
                  username: formData.get("username"),
                  password: formData.get("password"),
                };
                handleSave(data, "router");
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Router Name</Label>
                <Input
                  name="name"
                  defaultValue={selectedItem?.name}
                  placeholder="e.g., Nairobi Central"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ip">IP Address</Label>
                <Input
                  name="ip"
                  defaultValue={selectedItem?.ip}
                  placeholder="192.168.1.1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  name="location"
                  defaultValue={selectedItem?.location}
                  placeholder="e.g., Nairobi"
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Router Model</Label>
                <Select
                  name="model"
                  defaultValue={selectedItem?.model}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RB4011iGS+">RB4011iGS+</SelectItem>
                    <SelectItem value="RB3011UiAS-RM">RB3011UiAS-RM</SelectItem>
                    <SelectItem value="RB2011UiAS-2HnD-IN">
                      RB2011UiAS-2HnD-IN
                    </SelectItem>
                    <SelectItem value="CCR1009-7G-1C-1S+">
                      CCR1009-7G-1C-1S+
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    name="username"
                    defaultValue={selectedItem?.username || "admin"}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    name="password"
                    type="password"
                    defaultValue={selectedItem?.password}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {selectedItem ? "Update Router" : "Add Router"}
              </Button>
            </form>
          )}

          {editingType === "reseller" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  username: formData.get("username"),
                  password: formData.get("password"),
                  company: formData.get("company"),
                  contact: formData.get("contact"),
                  email: formData.get("email"),
                  phone: formData.get("phone"),
                  location: formData.get("location"),
                  commission: parseFloat(formData.get("commission")),
                };
                handleSave(data, "reseller");
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  name="username"
                  defaultValue={selectedItem?.username}
                  placeholder="reseller_username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  defaultValue={selectedItem?.password}
                  placeholder="secure_password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  name="company"
                  defaultValue={selectedItem?.company}
                  placeholder="Company Ltd"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact Person</Label>
                <Input
                  name="contact"
                  defaultValue={selectedItem?.contact}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    name="email"
                    type="email"
                    defaultValue={selectedItem?.email}
                    placeholder="email@company.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    name="phone"
                    defaultValue={selectedItem?.phone}
                    placeholder="+254700000000"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    name="location"
                    defaultValue={selectedItem?.location}
                    placeholder="Nairobi"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="commission">Commission %</Label>
                  <Input
                    name="commission"
                    type="number"
                    defaultValue={selectedItem?.commission}
                    placeholder="15"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {selectedItem ? "Update Reseller" : "Create Reseller"}
              </Button>
            </form>
          )}

          {editingType === "user" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  name: formData.get("name"),
                  phone: formData.get("phone"),
                  email: formData.get("email"),
                  location: formData.get("location"),
                  plan: formData.get("plan"),
                  amount: parseInt(formData.get("amount")),
                };
                handleSave(data, "user");
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  name="name"
                  defaultValue={selectedItem?.name}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  name="phone"
                  defaultValue={selectedItem?.phone}
                  placeholder="+254712345678"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  name="email"
                  type="email"
                  defaultValue={selectedItem?.email}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  name="location"
                  defaultValue={selectedItem?.location}
                  placeholder="Nairobi"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="plan">Plan</Label>
                  <Select
                    name="plan"
                    defaultValue={selectedItem?.plan}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Monthly Amount</Label>
                  <Input
                    name="amount"
                    type="number"
                    defaultValue={selectedItem?.amount}
                    placeholder="2500"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Update User
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>Send SMS Message</DialogTitle>
            <DialogDescription>
              Send SMS to {selectedItem?.name} ({selectedItem?.phone})
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(new FormData(e.target));
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                name="message"
                placeholder="Type your message here..."
                required
                rows={4}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice View Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>Invoice {selectedItem?.id}</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Customer:</span>
                  <p className="font-medium">{selectedItem.customer}</p>
                </div>
                <div>
                  <span className="text-slate-600">Phone:</span>
                  <p className="font-medium">{selectedItem.phone}</p>
                </div>
                <div>
                  <span className="text-slate-600">Amount:</span>
                  <p className="font-medium text-green-600">
                    KES {selectedItem.amount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">Status:</span>
                  <Badge
                    variant={
                      selectedItem.status === "Paid"
                        ? "default"
                        : selectedItem.status === "Pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {selectedItem.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-600">Date:</span>
                  <p className="font-medium">{selectedItem.date}</p>
                </div>
                <div>
                  <span className="text-slate-600">Due Date:</span>
                  <p className="font-medium">{selectedItem.dueDate}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-600">Payment Method:</span>
                  <p className="font-medium">{selectedItem.paymentMethod}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDownloadInvoice(selectedItem)}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleSendInvoiceToCustomer(selectedItem)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to Customer
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Export Vouchers</DialogTitle>
            <DialogDescription>Choose export format</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => downloadVoucherExport("csv")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => downloadVoucherExport("json")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SMS Configuration Dialog */}
      <Dialog open={showSMSConfigDialog} onOpenChange={setShowSMSConfigDialog}>
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>SMS Configuration</DialogTitle>
            <DialogDescription>
              Configure SMS gateway settings
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSMSConfigSave(new FormData(e.target));
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="provider">SMS Provider</Label>
              <Select
                name="provider"
                defaultValue={smsConfig.provider}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="africastalking">
                    Africa's Talking
                  </SelectItem>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="nexmo">Nexmo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                name="apiKey"
                defaultValue={smsConfig.apiKey}
                placeholder="Your API key"
                required
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                name="username"
                defaultValue={smsConfig.username}
                placeholder="API username"
                required
              />
            </div>
            <div>
              <Label htmlFor="senderId">Sender ID</Label>
              <Input
                name="senderId"
                defaultValue={smsConfig.senderId}
                placeholder="NetSafi"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Save SMS Configuration
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Configuration Dialog */}
      <Dialog
        open={showEmailConfigDialog}
        onOpenChange={setShowEmailConfigDialog}
      >
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>Email Configuration</DialogTitle>
            <DialogDescription>Configure SMTP email settings</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailConfigSave(new FormData(e.target));
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="provider">Email Provider</Label>
              <Select
                name="provider"
                defaultValue={emailConfig.provider}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">SMTP</SelectItem>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="host">SMTP Host</Label>
                <Input
                  name="host"
                  defaultValue={emailConfig.host}
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="port">Port</Label>
                <Input
                  name="port"
                  defaultValue={emailConfig.port}
                  placeholder="587"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="username">Email Username</Label>
              <Input
                name="username"
                defaultValue={emailConfig.username}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Email Password</Label>
              <Input
                name="password"
                type="password"
                defaultValue={emailConfig.password}
                placeholder="App password"
                required
              />
            </div>
            <div>
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                name="fromEmail"
                defaultValue={emailConfig.fromEmail}
                placeholder="noreply@netsafi.com"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Save Email Configuration
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bank Configuration Dialog */}
      <Dialog
        open={showBankConfigDialog}
        onOpenChange={setShowBankConfigDialog}
      >
        <DialogContent className="max-w-md mx-auto m-4">
          <DialogHeader>
            <DialogTitle>Bank Paybill Configuration</DialogTitle>
            <DialogDescription>
              Configure Equity and KCB bank paybills
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBankConfigSave(new FormData(e.target));
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h4 className="font-medium">Equity Bank</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="equityEnabled"
                  defaultChecked={bankConfig.equity.enabled}
                />
                <Label>Enable Equity Bank Paybill</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Paybill Number</Label>
                  <Input value="247247" disabled />
                </div>
                <div>
                  <Label htmlFor="equityAccount">Account Number</Label>
                  <Input
                    name="equityAccount"
                    defaultValue={bankConfig.equity.account}
                    placeholder="Your account"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">KCB Bank</h4>
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="kcbEnabled"
                  defaultChecked={bankConfig.kcb.enabled}
                />
                <Label>Enable KCB Bank Paybill</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Paybill Number</Label>
                  <Input value="522522" disabled />
                </div>
                <div>
                  <Label htmlFor="kcbAccount">Account Number</Label>
                  <Input
                    name="kcbAccount"
                    defaultValue={bankConfig.kcb.account}
                    placeholder="Your account"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Save Bank Configuration
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enhanced Profile Settings Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-4xl mx-auto m-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Administrator Profile</h2>
                <p className="text-sm text-gray-500">
                  Manage your account information and preferences
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProfileUpdate(new FormData(e.target));
            }}
            className="space-y-8"
          >
            {/* Profile Picture Section */}
            <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {adminProfile.firstName.charAt(0)}
                  {adminProfile.lastName.charAt(0)}
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                  onClick={() =>
                    alert(
                      "Profile picture upload functionality would be implemented here",
                    )
                  }
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {adminProfile.firstName} {adminProfile.lastName}
                </h3>
                <p className="text-sm text-gray-600">{adminProfile.jobTitle}</p>
                <p className="text-sm text-gray-500">
                  {adminProfile.department}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline">{adminProfile.accountStatus}</Badge>
                  <Badge
                    variant={
                      adminProfile.twoFactorEnabled ? "default" : "secondary"
                    }
                  >
                    {adminProfile.twoFactorEnabled
                      ? "2FA Enabled"
                      : "2FA Disabled"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    name="firstName"
                    defaultValue={adminProfile.firstName}
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    name="lastName"
                    defaultValue={adminProfile.lastName}
                    required
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    name="username"
                    defaultValue={adminProfile.username}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    name="employeeId"
                    defaultValue={adminProfile.employeeId}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    name="jobTitle"
                    defaultValue={adminProfile.jobTitle}
                    placeholder="Enter job title"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    name="department"
                    defaultValue={adminProfile.department}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT Management">
                        IT Management
                      </SelectItem>
                      <SelectItem value="Network Operations">
                        Network Operations
                      </SelectItem>
                      <SelectItem value="Customer Support">
                        Customer Support
                      </SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Human Resources">
                        Human Resources
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio / Description</Label>
                <Textarea
                  name="bio"
                  defaultValue={adminProfile.bio}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    name="email"
                    type="email"
                    defaultValue={adminProfile.email}
                    required
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Primary Phone *</Label>
                  <Input
                    name="phone"
                    defaultValue={adminProfile.phone}
                    required
                    placeholder="+254700000000"
                  />
                </div>
                <div>
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input
                    name="alternatePhone"
                    defaultValue={adminProfile.alternatePhone}
                    placeholder="+254700000000"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold">Address Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    name="street"
                    defaultValue={adminProfile.address.street}
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    name="city"
                    defaultValue={adminProfile.address.city}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/County</Label>
                  <Input
                    name="state"
                    defaultValue={adminProfile.address.state}
                    placeholder="Enter state or county"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                  <Input
                    name="zipCode"
                    defaultValue={adminProfile.address.zipCode}
                    placeholder="Enter ZIP code"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    name="country"
                    defaultValue={adminProfile.address.country}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                      <SelectItem value="Uganda">Uganda</SelectItem>
                      <SelectItem value="Tanzania">Tanzania</SelectItem>
                      <SelectItem value="Rwanda">Rwanda</SelectItem>
                      <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold">Emergency Contact</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    name="emergencyName"
                    defaultValue={adminProfile.emergencyContact.name}
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Select
                    name="emergencyRelationship"
                    defaultValue={adminProfile.emergencyContact.relationship}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Phone Number</Label>
                  <Input
                    name="emergencyPhone"
                    defaultValue={adminProfile.emergencyContact.phone}
                    placeholder="+254700000000"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Account Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Account Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Date Joined</Label>
                  <Input
                    value={new Date(
                      adminProfile.dateJoined,
                    ).toLocaleDateString()}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label>Last Login</Label>
                  <Input
                    value={adminProfile.lastLogin}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {adminProfile.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline">
                      {permission
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProfileDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSecurityDialog(true)}
              >
                <Lock className="h-4 w-4 mr-2" />
                Security Settings
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reseller Credentials Dialog */}
      <Dialog
        open={showCredentialsDialog}
        onOpenChange={setShowCredentialsDialog}
      >
        <DialogContent className="max-w-lg mx-auto m-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reseller Login Credentials</DialogTitle>
            <DialogDescription>
              Use these credentials to access the reseller portal at /reseller
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {resellers.map((reseller) => (
              <Card key={reseller.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{reseller.company}</h3>
                  <Badge
                    variant={
                      reseller.status === "Active" ? "default" : "destructive"
                    }
                  >
                    {reseller.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Username:</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-slate-100 px-2 py-1 rounded">
                        {reseller.username}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(reseller.username)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Password:</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-slate-100 px-2 py-1 rounded">
                        {reseller.password}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(reseller.password)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Portal URL:</span>
                    <div className="flex items-center space-x-2">
                      <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                        /reseller
                      </code>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href="/reseller"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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
                Share these credentials securely with your resellers. They can
                access their portal at /reseller
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Configuration Dialog */}
      <Dialog
        open={showPaymentConfigDialog}
        onOpenChange={setShowPaymentConfigDialog}
      >
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPaymentGateway === "mpesa" && "M-Pesa Configuration"}
              {selectedPaymentGateway === "airtelMoney" &&
                "Airtel Money Configuration"}
              {selectedPaymentGateway === "tkash" && "T-Kash Configuration"}
              {selectedPaymentGateway === "paypal" && "PayPal Configuration"}
            </DialogTitle>
            <DialogDescription>
              Configure payment gateway settings
            </DialogDescription>
          </DialogHeader>

          {selectedPaymentGateway === "mpesa" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePaymentConfigSave(new FormData(e.target));
              }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="enabled"
                  defaultChecked={paymentConfig.mpesa?.enabled}
                />
                <Label>Enable M-Pesa Daraja API</Label>
              </div>
              <div>
                <Label htmlFor="businessShortCode">Business Short Code</Label>
                <Input
                  name="businessShortCode"
                  defaultValue={paymentConfig.mpesa?.businessShortCode}
                  placeholder="174379"
                  required
                />
              </div>
              <div>
                <Label htmlFor="passkey">Passkey</Label>
                <Input
                  name="passkey"
                  type="password"
                  defaultValue={paymentConfig.mpesa?.passkey}
                  placeholder="Your Daraja passkey"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="consumerKey">Consumer Key</Label>
                  <Input
                    name="consumerKey"
                    defaultValue={paymentConfig.mpesa?.consumerKey}
                    placeholder="Consumer key"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="consumerSecret">Consumer Secret</Label>
                  <Input
                    name="consumerSecret"
                    type="password"
                    defaultValue={paymentConfig.mpesa?.consumerSecret}
                    placeholder="Consumer secret"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Save M-Pesa Configuration
              </Button>
            </form>
          )}

          {selectedPaymentGateway === "airtelMoney" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePaymentConfigSave(new FormData(e.target));
              }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  name="enabled"
                  defaultChecked={paymentConfig.airtelMoney?.enabled}
                />
                <Label>Enable Airtel Money</Label>
              </div>
              <div>
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  name="clientId"
                  defaultValue={paymentConfig.airtelMoney?.clientId}
                  placeholder="Your client ID"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientSecret">Client Secret</Label>
                <Input
                  name="clientSecret"
                  type="password"
                  defaultValue={paymentConfig.airtelMoney?.clientSecret}
                  placeholder="Your client secret"
                  required
                />
              </div>
              <div>
                <Label htmlFor="merchantId">Merchant ID</Label>
                <Input
                  name="merchantId"
                  defaultValue={paymentConfig.airtelMoney?.merchantId}
                  placeholder="Your merchant ID"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Save Airtel Money Configuration
              </Button>
            </form>
          )}

          {(selectedPaymentGateway === "tkash" ||
            selectedPaymentGateway === "paypal") && (
            <div className="text-center py-8">
              <p className="text-slate-500">
                Configuration for {selectedPaymentGateway} coming soon!
              </p>
              <Button
                variant="outline"
                onClick={() => setShowPaymentConfigDialog(false)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
