#!/usr/bin/env node

/**
 * NetSafi ISP Billing System - cPanel Server
 * Production server optimized for shared hosting environments
 */

import "dotenv/config";
import { createServer } from "./index";
import { getDatabaseType, getDatabaseInfo } from "./database-unified";

// Create Express application
const app = createServer();

// Server configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Production-specific middleware
if (process.env.NODE_ENV === 'production') {
  // Request timeout (30 seconds for shared hosting)
  app.use((req, res, next) => {
    res.setTimeout(30000, () => {
      res.status(408).json({
        error: 'Request timeout',
        message: 'The request took too long to process'
      });
    });
    next();
  });

  // Memory monitoring
  const monitorMemory = () => {
    const usage = process.memoryUsage();
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    
    if (usedMB > 200) { // Alert if using more than 200MB
      console.warn(`High memory usage: ${usedMB}MB`);
    }
  };

  // Monitor memory every 5 minutes
  setInterval(monitorMemory, 5 * 60 * 1000);
}

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully`);
  
  // Close server
  server.close(() => {
    console.log('HTTP server closed');
    
    // Exit process
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log('='.repeat(50));
  console.log('🚀 NetSafi ISP Billing System');
  console.log('='.repeat(50));
  console.log(`🌐 Server: http://${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${getDatabaseType()}`);
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log(`🔧 Node.js: ${process.version}`);
  console.log(`💾 Platform: ${process.platform} ${process.arch}`);
  
  const dbInfo = getDatabaseInfo();
  if (dbInfo.type === 'sqlite') {
    console.log(`📁 DB Path: ${dbInfo.config.path}`);
  } else {
    console.log(`🔗 DB Host: ${dbInfo.config.host}:${dbInfo.config.port}`);
  }
  
  console.log('='.repeat(50));
  console.log('✅ Server is ready for requests');
  console.log('🔍 Health check: /api/health');
  console.log('📖 API docs: /api/ping');
  console.log('='.repeat(50));
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string'
    ? 'Pipe ' + PORT
    : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Export for testing
export { app, server };
