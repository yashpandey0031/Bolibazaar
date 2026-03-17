import LiveAuction from "../models/liveAuction.model.js";
import User from "../models/user.model.js";
import CreditLedger from "../models/creditLedger.model.js";
import Product from "../models/product.model.js";

const BOT_NAME = "AuctionBot";
const roomUsers = new Map(); // sessionId -> Map<socketId, { userId, userName }>
const sessionTimers = new Map(); // sessionId -> timeout refs

let ioRef = null;

export const initLiveAuctionSocket = (io) => {
  ioRef = io;
};

const getRoomKey = (sessionId) => `liveAuction:${sessionId}`;

const getActiveUsers = (sessionId) => {
  const room = roomUsers.get(sessionId);
  if (!room) return [];

  const users = [];
  const seen = new Set();
  for (const { userId, userName } of room.values()) {
    if (seen.has(userId)) continue;
    seen.add(userId);
    users.push({ userId, userName });
  }
  return users;
};

const clearSessionTimers = (sessionId) => {
  const refs = sessionTimers.get(sessionId);
  if (!refs) return;
  Object.values(refs).forEach((ref) => {
    if (ref) clearTimeout(ref);
  });
  sessionTimers.delete(sessionId);
};

const setSessionTimer = (sessionId, key, ref) => {
  const refs = sessionTimers.get(sessionId) || {};
  refs[key] = ref;
  sessionTimers.set(sessionId, refs);
};

const serializeSession = (session) => {
  if (!session) return null;
  return {
    _id: session._id,
    status: session.status,
    product: session.product,
    itemSnapshot: session.itemSnapshot,
    startPrice: session.startPrice,
    minIncrement: session.minIncrement,
    highestBid: session.highestBid,
    highestBidder: session.highestBidder,
    highestBidderName: session.highestBidderName,
    highestBidderType: session.highestBidderType,
    botBidCount: session.botBidCount,
    botBidLimit: session.botBidLimit,
    startedAt: session.startedAt,
    lastBidAt: session.lastBidAt,
    endedAt: session.endedAt,
    winner: session.winner,
    winnerName: session.winnerName,
    winnerType: session.winnerType,
    winningBid: session.winningBid,
    bids: session.bids,
    announcements: session.announcements,
  };
};

const emitState = async (sessionId, targetSocket = null) => {
  if (!ioRef) return;

  const session = await LiveAuction.findById(sessionId)
    .populate("product", "itemName itemDescription itemCategory itemPhoto")
    .populate("highestBidder", "name")
    .populate("winner", "name");

  if (!session) return;

  const payload = {
    session: serializeSession(session),
    activeUsers: getActiveUsers(sessionId),
  };

  if (targetSocket) {
    targetSocket.emit("liveAuction:state", payload);
  } else {
    ioRef.to(getRoomKey(sessionId)).emit("liveAuction:state", payload);
    ioRef.emit("liveAuction:statusChanged", {
      active: session.status === "live",
      sessionId: session._id.toString(),
      itemName: session.itemSnapshot?.itemName,
    });
  }
};

const pushAnnouncement = async (sessionId, message, type = "bot") => {
  const announcement = { message, type, createdAt: new Date() };

  await LiveAuction.findByIdAndUpdate(sessionId, {
    $push: { announcements: announcement },
  });

  if (ioRef) {
    ioRef
      .to(getRoomKey(sessionId))
      .emit("liveAuction:announcement", announcement);
  }
};

const refundPreviousLeaderIfNeeded = async (
  session,
  { suppressNotifyUserId } = {},
) => {
  if (session.highestBidderType !== "user" || !session.highestBidder) return;

  const prevLeaderId = session.highestBidder.toString();
  const prevAmount = Number(session.highestBid || 0);
  if (prevAmount <= 0) return;

  await User.findByIdAndUpdate(prevLeaderId, {
    $inc: { credits: prevAmount },
  });

  await CreditLedger.create({
    userId: prevLeaderId,
    type: "returned",
    amount: prevAmount,
    auctionId: session.product,
    reason: "Outbid in live auction arena",
  });

  if (ioRef && prevLeaderId !== suppressNotifyUserId) {
    ioRef.to(`user:${prevLeaderId}`).emit("liveAuction:outbid", {
      returnedCredits: prevAmount,
      sessionId: session._id.toString(),
      itemName: session.itemSnapshot?.itemName,
    });
  }
};

const finalizeLiveAuction = async (sessionId, reason = "Bidding closed") => {
  clearSessionTimers(sessionId);

  const session = await LiveAuction.findById(sessionId);
  if (!session || session.status !== "live") return;

  session.status = "ended";
  session.endedAt = new Date();

  if (session.highestBidderType === "user" && session.highestBidder) {
    session.winner = session.highestBidder;
    session.winnerName = session.highestBidderName;
    session.winnerType = "user";
    session.winningBid = session.highestBid;

    await CreditLedger.create({
      userId: session.highestBidder,
      type: "won",
      amount: session.highestBid,
      auctionId: session.product,
      reason: "Won bot-moderated live auction",
    });

    await Product.findByIdAndUpdate(session.product, {
      winner: session.highestBidder,
      isSold: true,
      currentPrice: session.highestBid,
      $push: {
        bids: {
          bidder: session.highestBidder,
          bidAmount: session.highestBid,
          bidTime: new Date(),
        },
      },
    });

    await pushAnnouncement(
      sessionId,
      `Sold! ${session.winnerName} wins for Rs ${session.highestBid}.`,
      "system",
    );
  } else if (session.highestBidderType === "bot") {
    session.winner = null;
    session.winnerName = BOT_NAME;
    session.winnerType = "bot";
    session.winningBid = session.highestBid;

    await Product.findByIdAndUpdate(session.product, {
      isSold: true,
      currentPrice: session.highestBid,
    });

    await pushAnnouncement(
      sessionId,
      `No human bidder topped the final call. ${BOT_NAME} takes this round at Rs ${session.highestBid}.`,
      "system",
    );
  } else {
    session.winner = null;
    session.winnerName = null;
    session.winnerType = undefined;
    session.winningBid = null;

    await Product.findByIdAndUpdate(session.product, {
      isSold: true,
    });

    await pushAnnouncement(
      sessionId,
      "Auction closed with no valid bids.",
      "system",
    );
  }

  await session.save();

  if (ioRef) {
    ioRef.to(getRoomKey(sessionId)).emit("liveAuction:ended", {
      reason,
      winnerName: session.winnerName,
      winnerType: session.winnerType,
      winningBid: session.winningBid,
    });
  }

  await emitState(sessionId);
};

const scheduleFinalCalls = (sessionId, snapshotKey, noBid = false) => {
  clearSessionTimers(sessionId);

  const onceDelay = noBid ? 10000 : 7000;
  const twiceDelay = noBid ? 18000 : 12000;
  const soldDelay = noBid ? 26000 : 17000;

  const guardSnapshot = async () => {
    const live = await LiveAuction.findById(sessionId).select(
      "status highestBid bids minIncrement",
    );
    if (!live || live.status !== "live") return null;
    const currentKey = `${live.highestBid}|${live.bids.length}`;
    if (currentKey !== snapshotKey) return null;
    return live;
  };

  setSessionTimer(
    sessionId,
    "once",
    setTimeout(async () => {
      try {
        const live = await guardSnapshot();
        if (!live) return;
        if (noBid) {
          await pushAnnouncement(
            sessionId,
            `Any opening bid above Rs ${live.highestBid + live.minIncrement}?`,
          );
        } else {
          await pushAnnouncement(sessionId, "Going once...");
        }
      } catch (error) {
        console.error("Live auction final-call(once) error:", error.message);
      }
    }, onceDelay),
  );

  setSessionTimer(
    sessionId,
    "twice",
    setTimeout(async () => {
      try {
        const live = await guardSnapshot();
        if (!live) return;
        if (noBid) {
          await pushAnnouncement(sessionId, "Still open. Last call for bids.");
        } else {
          await pushAnnouncement(sessionId, "Going twice...");
        }
      } catch (error) {
        console.error("Live auction final-call(twice) error:", error.message);
      }
    }, twiceDelay),
  );

  setSessionTimer(
    sessionId,
    "sold",
    setTimeout(async () => {
      try {
        const live = await guardSnapshot();
        if (!live) return;
        await finalizeLiveAuction(sessionId, "No new bids received");
      } catch (error) {
        console.error("Live auction final-call(sold) error:", error.message);
      }
    }, soldDelay),
  );
};

const scheduleBotCounterBid = (sessionId, triggerAmount) => {
  setSessionTimer(
    sessionId,
    "bot",
    setTimeout(async () => {
      try {
        const session = await LiveAuction.findById(sessionId);
        if (!session || session.status !== "live") return;
        if (session.botBidCount >= session.botBidLimit) return;
        if (session.highestBidderType !== "user") return;
        if (Number(session.highestBid) !== Number(triggerAmount)) return;

        // Bot outbids current user leader, so return the user's currently held credits.
        await refundPreviousLeaderIfNeeded(session);

        const increment = Math.max(
          session.minIncrement,
          Math.min(25, Math.max(5, Math.floor(session.startPrice * 0.05))),
        );
        const botAmount = Number(session.highestBid) + increment;

        session.highestBid = botAmount;
        session.highestBidder = null;
        session.highestBidderName = BOT_NAME;
        session.highestBidderType = "bot";
        session.botBidCount += 1;
        session.lastBidAt = new Date();
        session.bids.push({
          bidder: null,
          bidderName: BOT_NAME,
          bidderType: "bot",
          amount: botAmount,
          bidTime: new Date(),
        });
        await session.save();

        await pushAnnouncement(
          sessionId,
          `${BOT_NAME} bids Rs ${botAmount}. Any higher offers?`,
        );

        if (ioRef) {
          ioRef.to(getRoomKey(sessionId)).emit("liveAuction:bidPlaced", {
            bidderName: BOT_NAME,
            bidderType: "bot",
            amount: botAmount,
          });
        }

        await emitState(sessionId);
        const snapshot = `${session.highestBid}|${session.bids.length}`;
        scheduleFinalCalls(sessionId, snapshot, false);
      } catch (error) {
        console.error("Live auction bot counter-bid error:", error.message);
      }
    }, 4500),
  );
};

export const startLiveAuctionAutomation = async (sessionId) => {
  if (!ioRef) return;

  const session = await LiveAuction.findById(sessionId).populate(
    "product",
    "itemName itemDescription itemCategory itemPhoto",
  );
  if (!session || session.status !== "live") return;

  ioRef.emit("liveAuction:activated", {
    sessionId: session._id.toString(),
    itemName: session.itemSnapshot.itemName,
  });

  setSessionTimer(
    sessionId,
    "intro1",
    setTimeout(async () => {
      try {
        await pushAnnouncement(
          sessionId,
          `${BOT_NAME}: Welcome to the Live Auction Arena for ${session.itemSnapshot.itemName}.`,
        );
      } catch (error) {
        console.error("Live auction intro(1) error:", error.message);
      }
    }, 1000),
  );

  setSessionTimer(
    sessionId,
    "intro2",
    setTimeout(async () => {
      try {
        const details = session.itemSnapshot.itemDescription?.trim();
        if (details) {
          await pushAnnouncement(sessionId, `${BOT_NAME}: ${details}`);
        }
        await pushAnnouncement(
          sessionId,
          `${BOT_NAME}: Starting at Rs ${session.startPrice}. Place your bids now!`,
        );

        const snapshot = `${session.highestBid}|${session.bids.length}`;
        scheduleFinalCalls(sessionId, snapshot, true);
      } catch (error) {
        console.error("Live auction intro(2) error:", error.message);
      }
    }, 3500),
  );
};

export const forceEndLiveAuction = async (sessionId, reason) => {
  await finalizeLiveAuction(sessionId, reason || "Auction ended by admin");
};

export const registerLiveAuctionHandlers = (io, socket) => {
  const userId = socket.user.id;
  const userName = socket.user.name;

  socket.on("liveAuction:join", async ({ sessionId }) => {
    if (!sessionId) return;

    const session = await LiveAuction.findById(sessionId);
    if (!session) {
      socket.emit("liveAuction:error", { message: "Live auction not found" });
      return;
    }

    const roomKey = getRoomKey(sessionId);
    socket.join(roomKey);

    if (!roomUsers.has(sessionId)) {
      roomUsers.set(sessionId, new Map());
    }

    const room = roomUsers.get(sessionId);
    room.set(socket.id, { userId, userName });

    io.to(roomKey).emit("liveAuction:userJoined", {
      userId,
      userName,
      activeUsers: getActiveUsers(sessionId),
    });

    await emitState(sessionId, socket);
  });

  socket.on("liveAuction:leave", ({ sessionId }) => {
    if (!sessionId || !roomUsers.has(sessionId)) return;

    const room = roomUsers.get(sessionId);
    const current = room.get(socket.id);
    room.delete(socket.id);

    socket.leave(getRoomKey(sessionId));

    if (room.size === 0) {
      roomUsers.delete(sessionId);
    }

    if (current) {
      io.to(getRoomKey(sessionId)).emit("liveAuction:userLeft", {
        userId: current.userId,
        userName: current.userName,
        activeUsers: getActiveUsers(sessionId),
      });
    }
  });

  socket.on("liveAuction:placeBid", async ({ sessionId, bidAmount }) => {
    try {
      if (!sessionId || bidAmount == null) return;

      const amount = Number(bidAmount);
      if (!Number.isFinite(amount)) {
        socket.emit("liveAuction:error", { message: "Invalid bid amount" });
        return;
      }

      const session = await LiveAuction.findById(sessionId);
      if (!session || session.status !== "live") {
        socket.emit("liveAuction:error", {
          message: "Live auction is not active",
        });
        return;
      }

      const minAllowed =
        Number(session.highestBid) + Number(session.minIncrement);
      if (amount < minAllowed) {
        socket.emit("liveAuction:error", {
          message: `Bid must be at least Rs ${minAllowed}`,
        });
        return;
      }

      const bidder = await User.findById(userId);
      if (!bidder) {
        socket.emit("liveAuction:error", { message: "Bidder not found" });
        return;
      }

      if (bidder.credits < amount) {
        socket.emit("liveAuction:error", {
          message: "Insufficient credits for this bid",
        });
        return;
      }

      await refundPreviousLeaderIfNeeded(session, {
        suppressNotifyUserId: userId,
      });

      bidder.credits -= amount;
      await bidder.save();

      await CreditLedger.create({
        userId,
        type: "deducted",
        amount,
        auctionId: session.product,
        reason: "Live auction bid placed",
      });

      session.highestBid = amount;
      session.highestBidder = userId;
      session.highestBidderName = userName;
      session.highestBidderType = "user";
      session.lastBidAt = new Date();
      session.bids.push({
        bidder: userId,
        bidderName: userName,
        bidderType: "user",
        amount,
        bidTime: new Date(),
      });
      await session.save();

      await pushAnnouncement(
        sessionId,
        `${BOT_NAME}: Highest bid is now Rs ${amount} by ${userName}. Any higher bids?`,
      );

      io.to(getRoomKey(sessionId)).emit("liveAuction:bidPlaced", {
        bidderName: userName,
        bidderType: "user",
        bidderId: userId,
        amount,
      });

      await emitState(sessionId);

      const snapshot = `${session.highestBid}|${session.bids.length}`;
      scheduleFinalCalls(sessionId, snapshot, false);
      scheduleBotCounterBid(sessionId, amount);
    } catch (error) {
      console.error("Live auction placeBid error:", error.message);
      socket.emit("liveAuction:error", {
        message: "Failed to place live bid",
      });
    }
  });

  socket.on("disconnect", () => {
    for (const [sessionId, room] of roomUsers.entries()) {
      if (!room.has(socket.id)) continue;
      const current = room.get(socket.id);
      room.delete(socket.id);
      if (room.size === 0) {
        roomUsers.delete(sessionId);
      }
      io.to(getRoomKey(sessionId)).emit("liveAuction:userLeft", {
        userId: current.userId,
        userName: current.userName,
        activeUsers: getActiveUsers(sessionId),
      });
    }
  });
};
