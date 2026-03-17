import express from "express";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.config.js";
import {
  authRoutes,
  userRoutes,
  auctionRoutes,
  contactRoutes,
  adminRoutes,
  aiRoutes,
} from "./routes/index.js";
import creditRoutes from "./routes/credit.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import liveAuctionRoutes from "./routes/liveAuction.routes.js";
import { connectDB } from "./config/db.config.js";

export const app = express();

const normalizeOrigin = (origin = "") => origin.replace(/\/+$/, "");
const allowedOrigins = (env.origin || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const requestOrigin = normalizeOrigin(origin);
      if (allowedOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(compression());
app.use(express.json());

// DB connection for Vercel serveless deployment
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    await connectDB();
    next();
  });
}

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/auction", auctionRoutes);
app.use("/contact", contactRoutes);
app.use("/admin", adminRoutes);
app.use("/ai", aiRoutes);
app.use("/credits", creditRoutes);
app.use("/notifications", notificationRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/live-auction", liveAuctionRoutes);

export default app; // Exporting default app for serverless deployment
