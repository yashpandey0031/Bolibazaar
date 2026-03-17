import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";

const JWT_SECRET = env.jwt_secret;

export const secureRoute = (req, res, next) => {
  let token = req.cookies?.auth_token;

  // Fallback for browsers/environments where third-party cookies are blocked.
  if (!token) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decode = jwt.verify(token, JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
