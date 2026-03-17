import express from "express";
import {
  getActiveLiveAuction,
  getLiveAuctionById,
} from "../controllers/liveAuction.controller.js";
import { secureRoute } from "../middleware/auth.middleware.js";

const liveAuctionRoutes = express.Router();
liveAuctionRoutes.use(secureRoute);

liveAuctionRoutes.get("/active", getActiveLiveAuction);
liveAuctionRoutes.get("/:id", getLiveAuctionById);

export default liveAuctionRoutes;
