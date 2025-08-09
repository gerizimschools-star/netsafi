import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { initializeDatabase, checkDatabaseHealth, getDatabaseType, getDatabaseInfo } from "./database-unified";

// Import API route handlers
// Import existing route handlers
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getUserStats
} from "./routes/users";

import {
  getAllInvoices,
  getInvoice,
  createInvoice,
  updateInvoiceStatus,
  processPayment,
  getInvoiceStats,
  getMonthlyRevenue
} from "./routes/invoices";

import {
  getNetworkLocations,
  getNetworkLocation,
  updateNetworkStatus,
  getNetworkStats,
  refreshNetworkData,
  addNetworkLocation,
  deleteNetworkLocation
} from "./routes/network";

// Import auth routes
import {
  login,
  setup2FA,
  verify2FA,
  disable2FA,
  generateBackupCodes,
  check2FAStatus
} from "./routes/auth";

// Import enhanced auth routes
import {
  enhancedLogin,
  requestOTP,
  forgotPassword,
  resetPassword,
  adminResetUserPassword,
  toggleForgotPassword,
  getAuditLogs,
  getSignInStats,
  getSecurityConfig,
  updateSecurityConfig,
  validatePassword
} from "./routes/enhancedAuth";

// Import new comprehensive route handlers
import {
  getAllRouters,
  getRouter,
  createRouter,
  updateRouter,
  deleteRouter,
  updateRouterStatus,
  syncRouter,
  getRouterStats,
  assignRouterToReseller
} from "./routes/routers";

import {
  getAllPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
  getPlanCategories,
  getPlanStats,
  duplicatePlan
} from "./routes/plans";

import {
  getAllResellers,
  getReseller,
  createReseller,
  updateReseller,
  deleteReseller,
  updateResellerStatus,
  updateVerificationStatus,
  updateResellerCredit,
  getResellerStats,
  getResellerTiers,
  regenerateApiCredentials
} from "./routes/resellers";

import {
  getAllVouchers,
  getVoucher,
  generateVouchers,
  updateVoucher,
  cancelVoucher,
  useVoucher,
  getVoucherStats,
  exportVouchers,
  getBatchInfo
} from "./routes/vouchers";

import {
  getAllCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  updateCustomerPlan,
  getCustomerStats,
  searchCustomers,
  sendMessage
} from "./routes/customers";

export function createServer() {
  const app = express();

  // Production security middleware
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);

    // Security headers
    app.use((req, res, next) => {
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    });
  }

  // CORS configuration
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
      ? [process.env.APP_URL, process.env.CORS_ORIGIN].filter(Boolean)
      : true,
    credentials: true,
    optionsSuccessStatus: 200
  };

  // Middleware
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging for production
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_ACCESS_LOGS === 'true') {
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      });
      next();
    });
  }

  // Initialize database on startup
  initializeDatabase();

  // Health check endpoints
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  app.get("/api/health", async (_req, res) => {
    try {
      const dbHealth = await checkDatabaseHealth();
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      const dbInfo = getDatabaseInfo();
      res.json({
        status: "healthy",
        database: {
          type: getDatabaseType(),
          status: dbHealth ? "connected" : "disconnected",
          config: dbInfo.config
        },
        uptime: `${Math.floor(uptime / 60)} minutes`,
        memory: {
          used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
        },
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development"
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        error: "Health check failed",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Database health check endpoint
  app.get("/api/health/db", async (_req, res) => {
    try {
      const dbHealth = await checkDatabaseHealth();
      if (dbHealth) {
        res.json({
          status: "healthy",
          database: "connected",
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          status: "unhealthy",
          database: "disconnected",
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        database: "error",
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // System info endpoint (development only)
  if (process.env.NODE_ENV !== 'production') {
    app.get("/api/system/info", (_req, res) => {
      res.json({
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Authentication API routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/setup-2fa", setup2FA);
  app.post("/api/auth/verify-2fa", verify2FA);
  app.post("/api/auth/disable-2fa", disable2FA);
  app.post("/api/auth/generate-backup-codes", generateBackupCodes);
  app.get("/api/auth/2fa-status", check2FAStatus);

  // Enhanced Authentication API routes
  app.post("/api/auth/enhanced-login", enhancedLogin);
  app.post("/api/auth/request-otp", requestOTP);
  app.post("/api/auth/forgot-password", forgotPassword);
  app.post("/api/auth/reset-password", resetPassword);
  app.post("/api/auth/admin-reset-password", adminResetUserPassword);
  app.post("/api/auth/toggle-forgot-password", toggleForgotPassword);
  app.get("/api/auth/audit-logs", getAuditLogs);
  app.get("/api/auth/signin-stats", getSignInStats);

  // Legacy demo endpoint
  app.get("/api/demo", handleDemo);

  // Users API routes
  app.get("/api/users", getAllUsers);
  app.get("/api/users/stats", getUserStats);
  app.get("/api/users/:id", getUser);
  app.post("/api/users", createUser);
  app.put("/api/users/:id", updateUser);
  app.patch("/api/users/:id/status", updateUserStatus);
  app.delete("/api/users/:id", deleteUser);

  // Invoices API routes
  app.get("/api/invoices", getAllInvoices);
  app.get("/api/invoices/stats", getInvoiceStats);
  app.get("/api/invoices/revenue/monthly", getMonthlyRevenue);
  app.get("/api/invoices/:id", getInvoice);
  app.post("/api/invoices", createInvoice);
  app.patch("/api/invoices/:id/status", updateInvoiceStatus);
  app.patch("/api/invoices/:id/payment", processPayment);

  // Network API routes (legacy)
  app.get("/api/network", getNetworkLocations);
  app.get("/api/network/stats", getNetworkStats);
  app.get("/api/network/:id", getNetworkLocation);
  app.post("/api/network", addNetworkLocation);
  app.patch("/api/network/:id", updateNetworkStatus);
  app.post("/api/network/refresh", refreshNetworkData);
  app.delete("/api/network/:id", deleteNetworkLocation);

  // Comprehensive Router API routes
  app.get("/api/routers", getAllRouters);
  app.get("/api/routers/stats", getRouterStats);
  app.get("/api/routers/:id", getRouter);
  app.post("/api/routers", createRouter);
  app.put("/api/routers/:id", updateRouter);
  app.patch("/api/routers/:id/status", updateRouterStatus);
  app.post("/api/routers/:id/sync", syncRouter);
  app.delete("/api/routers/:id", deleteRouter);
  app.post("/api/routers/assign", assignRouterToReseller);

  // Internet Plans API routes
  app.get("/api/plans", getAllPlans);
  app.get("/api/plans/stats", getPlanStats);
  app.get("/api/plans/categories", getPlanCategories);
  app.get("/api/plans/:id", getPlan);
  app.post("/api/plans", createPlan);
  app.put("/api/plans/:id", updatePlan);
  app.patch("/api/plans/:id/toggle", togglePlanStatus);
  app.post("/api/plans/:id/duplicate", duplicatePlan);
  app.delete("/api/plans/:id", deletePlan);

  // Resellers API routes
  app.get("/api/resellers", getAllResellers);
  app.get("/api/resellers/stats", getResellerStats);
  app.get("/api/resellers/tiers", getResellerTiers);
  app.get("/api/resellers/:id", getReseller);
  app.post("/api/resellers", createReseller);
  app.put("/api/resellers/:id", updateReseller);
  app.patch("/api/resellers/:id/status", updateResellerStatus);
  app.patch("/api/resellers/:id/verification", updateVerificationStatus);
  app.patch("/api/resellers/:id/credit", updateResellerCredit);
  app.post("/api/resellers/:id/regenerate-api", regenerateApiCredentials);
  app.delete("/api/resellers/:id", deleteReseller);

  // Vouchers API routes
  app.get("/api/vouchers", getAllVouchers);
  app.get("/api/vouchers/stats", getVoucherStats);
  app.get("/api/vouchers/export", exportVouchers);
  app.get("/api/vouchers/batch/:batch_id", getBatchInfo);
  app.get("/api/vouchers/:id", getVoucher);
  app.post("/api/vouchers/generate", generateVouchers);
  app.put("/api/vouchers/:id", updateVoucher);
  app.patch("/api/vouchers/:id/cancel", cancelVoucher);
  app.post("/api/vouchers/:code/use", useVoucher);

  // Customers API routes
  app.get("/api/customers", getAllCustomers);
  app.get("/api/customers/stats", getCustomerStats);
  app.get("/api/customers/search", searchCustomers);
  app.get("/api/customers/:id", getCustomer);
  app.post("/api/customers", createCustomer);
  app.put("/api/customers/:id", updateCustomer);
  app.patch("/api/customers/:id/status", updateCustomerStatus);
  app.patch("/api/customers/:id/plan", updateCustomerPlan);
  app.post("/api/customers/:id/message", sendMessage);
  app.delete("/api/customers/:id", deleteCustomer);

  return app;
}
