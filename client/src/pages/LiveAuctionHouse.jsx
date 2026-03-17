import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import LoadingScreen from "../components/LoadingScreen.jsx";
import { connectSocket } from "../config/socket.js";
import { useActiveLiveAuction } from "../hooks/useLiveAuction.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

const LiveAuctionHouse = () => {
  useDocumentTitle("Live Auction House");

  const { user } = useSelector((state) => state.auth);
  const credits = user?.user?.credits ?? 0;
  const userId = user?.user?._id;

  const { data: activeData, isLoading, refetch } = useActiveLiveAuction();

  const [session, setSession] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [bidAmount, setBidAmount] = useState("");

  const sessionId = session?._id;
  const minimumBid = useMemo(() => {
    if (!session) return 0;
    return Number(session.highestBid || 0) + Number(session.minIncrement || 1);
  }, [session]);

  const leadingUserId = useMemo(() => {
    if (!session?.highestBidder) return null;
    if (typeof session.highestBidder === "string") return session.highestBidder;
    return session.highestBidder._id || null;
  }, [session]);

  useEffect(() => {
    if (!activeData?.active || !activeData?.session) {
      setSession(null);
      setActiveUsers([]);
      setAnnouncements([]);
      return;
    }

    setSession(activeData.session);
    setAnnouncements(activeData.session.announcements || []);
  }, [activeData]);

  useEffect(() => {
    if (!sessionId) return;

    const socket = connectSocket();

    const onConnect = () => {
      socket.emit("liveAuction:join", { sessionId });
    };

    const onState = ({ session: stateSession, activeUsers: users }) => {
      if (!stateSession || stateSession._id !== sessionId) return;
      setSession(stateSession);
      setActiveUsers(users || []);
      if (Array.isArray(stateSession.announcements)) {
        setAnnouncements(stateSession.announcements);
      }
    };

    const onAnnouncement = (announcement) => {
      setAnnouncements((prev) => [...prev.slice(-49), announcement]);
    };

    const onBidPlaced = ({ bidderName, amount, bidderType }) => {
      const who = bidderType === "bot" ? "AuctionBot" : bidderName;
      toast.success(`${who} bid Rs ${amount}`);
    };

    const onEnded = ({ winnerName, winnerType, winningBid }) => {
      if (winnerType === "user" && winnerName) {
        toast.success(`Auction ended: ${winnerName} won at Rs ${winningBid}`);
      } else if (winnerType === "bot") {
        toast("Auction ended: AuctionBot won this round", { icon: "🤖" });
      } else {
        toast("Auction ended with no winner", { icon: "⏱️" });
      }
      refetch();
    };

    const onError = ({ message }) => {
      toast.error(message || "Live auction error");
    };

    const onUserJoined = ({ activeUsers: users }) => {
      setActiveUsers(users || []);
    };

    const onUserLeft = ({ activeUsers: users }) => {
      setActiveUsers(users || []);
    };

    socket.on("connect", onConnect);
    socket.on("liveAuction:state", onState);
    socket.on("liveAuction:announcement", onAnnouncement);
    socket.on("liveAuction:bidPlaced", onBidPlaced);
    socket.on("liveAuction:ended", onEnded);
    socket.on("liveAuction:error", onError);
    socket.on("liveAuction:userJoined", onUserJoined);
    socket.on("liveAuction:userLeft", onUserLeft);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.emit("liveAuction:leave", { sessionId });
      socket.off("connect", onConnect);
      socket.off("liveAuction:state", onState);
      socket.off("liveAuction:announcement", onAnnouncement);
      socket.off("liveAuction:bidPlaced", onBidPlaced);
      socket.off("liveAuction:ended", onEnded);
      socket.off("liveAuction:error", onError);
      socket.off("liveAuction:userJoined", onUserJoined);
      socket.off("liveAuction:userLeft", onUserLeft);
    };
  }, [sessionId, refetch]);

  const handlePlaceBid = (e) => {
    e.preventDefault();
    if (!sessionId || !session || session.status !== "live") return;

    const amount = Number(bidAmount);
    if (!Number.isFinite(amount)) {
      toast.error("Enter a valid number");
      return;
    }

    if (amount < minimumBid) {
      toast.error(`Minimum bid is Rs ${minimumBid}`);
      return;
    }

    if (amount > credits) {
      toast.error("You do not have enough credits");
      return;
    }

    const socket = connectSocket();
    socket.emit("liveAuction:placeBid", { sessionId, bidAmount: amount });
    setBidAmount("");
  };

  if (isLoading) return <LoadingScreen />;

  if (!session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Live Auction House
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Arena is waiting for admin to go live
            </h1>
            <p className="text-sm text-gray-500 mt-3">
              As soon as an admin pushes an item to the live arena, it will show
              up here for everyone.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-[#8d6f31] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#6a542f] transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#8d6f31] font-semibold">
              Live Auction House
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              {session.itemSnapshot?.itemName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {session.itemSnapshot?.itemDescription}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Your Credits
            </p>
            <p className="text-2xl font-bold text-[#8d6f31] tabular-nums">
              {credits}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-[#f7f1e2] rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-500">
                  Start
                </p>
                <p className="text-lg font-bold text-[#6a542f] tabular-nums">
                  Rs {session.startPrice}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-500">
                  Highest
                </p>
                <p className="text-lg font-bold text-emerald-700 tabular-nums">
                  Rs {session.highestBid}
                </p>
              </div>
              <div className="bg-sky-50 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-500">
                  Leading
                </p>
                <p className="text-sm font-semibold text-sky-700 truncate">
                  {session.highestBidderName || "No bidder yet"}
                </p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-wider text-gray-500">
                  Bot Bids
                </p>
                <p className="text-lg font-bold text-rose-700 tabular-nums">
                  {session.botBidCount}/{session.botBidLimit}
                </p>
              </div>
            </div>

            <form
              onSubmit={handlePlaceBid}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={minimumBid}
                step={session.minIncrement || 1}
                placeholder={`Minimum Rs ${minimumBid}`}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d6f31]/30"
              />
              <button
                type="submit"
                disabled={session.status !== "live"}
                className="sm:w-48 bg-[#8d6f31] text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-[#6a542f] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Place Bid
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-3">
              Minimum increment: Rs {session.minIncrement}. Your bid amount must
              be within your available credits.
            </p>
          </section>

          <section className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900">
              Arena Activity
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {activeUsers.length} participant
              {activeUsers.length === 1 ? "" : "s"} connected
            </p>

            <div className="mt-4 h-[420px] overflow-y-auto pr-1 space-y-2">
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Waiting for bot announcement...
                </p>
              ) : (
                announcements
                  .slice()
                  .reverse()
                  .map((item, idx) => (
                    <div
                      key={`${item.createdAt}-${idx}`}
                      className="rounded-xl bg-gray-50 border border-gray-100 p-3"
                    >
                      <p className="text-sm text-gray-700">{item.message}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </section>
        </div>

        {session.status !== "live" && (
          <div className="mt-6 bg-[#efe3c7] border border-[#d7c9ab] rounded-xl p-4 text-sm text-[#6a542f]">
            Auction ended. Winner: {session.winnerName || "No winner"}
            {session.winningBid ? ` at Rs ${session.winningBid}.` : "."}
          </div>
        )}

        {leadingUserId === userId && session.status === "live" && (
          <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-700">
            You are currently leading.
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveAuctionHouse;
