import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { initializeDatabase, checkDatabaseHealth } from "./database";

// Import API route handlers
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

      res.json({
        status: "healthy",
        database: dbHealth ? "connected" : "disconnected",
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

  // Network API routes
  app.get("/api/network", getNetworkLocations);
  app.get("/api/network/stats", getNetworkStats);
  app.get("/api/network/:id", getNetworkLocation);
  app.post("/api/network", addNetworkLocation);
  app.patch("/api/network/:id", updateNetworkStatus);
  app.post("/api/network/refresh", refreshNetworkData);
  app.delete("/api/network/:id", deleteNetworkLocation);

  return app;
}
