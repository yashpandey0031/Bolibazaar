import express from "express";
import { generateDescription } from "../controllers/ai.controller.js";
import { secureRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate-description", secureRoute, generateDescription);

export default router;
