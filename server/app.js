import cluster from "cluster";
import os from "os";
import morgan from "morgan";
import compression from "compression";
import helmet from "helmet";
import env from "./config/env.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { fileURLToPath } from "url";
import path from "path";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import incomeRoutes from "./routes/incomeRoute.js";
import expenseRoutes from "./routes/expenseRoute.js";
import dashboardRoutes from "./routes/dashboardRoute.js";
import forgotPasswordRoutes from "./routes/forgotPasswordRouter.js";

// Security and performance middlewares
import limiter from "./limits/rateLimit.js";


// Correct way to define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = env.PORT || 8000;
const numCPUs = os.cpus().length;

// Check critical envs before starting
if (!env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not configured. Set it in your .env.");
  process.exit(1);
}
if (!env.MONGO_URL) {
  console.error("FATAL: MONGO_URL is not configured. Set it in your .env.");
  process.exit(1);
}

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Forking server into ${numCPUs} workers...\n`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart workers if they die
  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `❌ Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`
    );
    console.log("🔄 Restarting new worker...");
    cluster.fork();
  });

  // Log when workers are online
  cluster.on("online", (worker) => {
    console.log(`✅ Worker ${worker.process.pid} is online`);
  });
} else {
  // Worker process: run Express app
  const app = express();

  // Middlewares
  app.use(morgan("dev"));
  app.use(compression());
  app.use(helmet());

  app.use(
    cors({
      origin: env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(limiter);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Connect DB
  connectDB();

  // Routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/income", incomeRoutes);
  app.use("/api/v1/expense", expenseRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);
  app.use("/api/v1/forgot-password", forgotPasswordRoutes);

  // Serve static assets in production
  // Uncomment the following lines if you have a frontend build to serve  

 // Serve static assets in production
app.use(express.static(path.join(__dirname, "dist")));

// Static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Fallback route for SPA (React/Vite Router)
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(`🔥 Error in worker ${process.pid}:`, err.stack);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  });

  // Start server
  app.listen(PORT, () => {
    console.log(
      `🚀 Worker ${process.pid} started. Server running on ${env.BACKEND_URL}:${PORT}`
    );
  });
}
