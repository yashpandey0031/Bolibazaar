import mongoose from "mongoose";

const liveBidSchema = new mongoose.Schema(
  {
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bidderName: {
      type: String,
      required: true,
    },
    bidderType: {
      type: String,
      enum: ["user", "bot"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    bidTime: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const liveAnnouncementSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["bot", "system"],
      default: "bot",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const liveAuctionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    itemSnapshot: {
      itemName: { type: String, required: true },
      itemDescription: { type: String, default: "" },
      itemCategory: { type: String, default: "" },
      itemPhoto: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["live", "ended"],
      default: "live",
    },
    startPrice: {
      type: Number,
      required: true,
      min: 1,
    },
    minIncrement: {
      type: Number,
      default: 1,
      min: 1,
    },
    highestBid: {
      type: Number,
      required: true,
      min: 0,
    },
    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    highestBidderName: {
      type: String,
      default: null,
    },
    highestBidderType: {
      type: String,
      enum: ["user", "bot"],
      default: undefined,
    },
    botBidCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    botBidLimit: {
      type: Number,
      default: 2,
      min: 0,
    },
    startedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastBidAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    winnerName: {
      type: String,
      default: null,
    },
    winnerType: {
      type: String,
      enum: ["user", "bot"],
      default: undefined,
    },
    winningBid: {
      type: Number,
      default: null,
    },
    bids: [liveBidSchema],
    announcements: [liveAnnouncementSchema],
  },
  { timestamps: true },
);

liveAuctionSchema.index({ status: 1, createdAt: -1 });
liveAuctionSchema.index({ product: 1, createdAt: -1 });

const LiveAuction = mongoose.model("LiveAuction", liveAuctionSchema);

export default LiveAuction;
