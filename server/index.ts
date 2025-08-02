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

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database on startup
  initializeDatabase();

  // Health check endpoints
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/health", async (_req, res) => {
    const dbHealth = await checkDatabaseHealth();
    res.json({
      status: "ok",
      database: dbHealth ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    });
  });

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
