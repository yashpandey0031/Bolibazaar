import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import LoadingScreen from "../../components/LoadingScreen";
import { api } from "../../config/api";
import toast from "react-hot-toast";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import {
  useActiveLiveAuction,
  useStartLiveAuction,
} from "../../hooks/useLiveAuction";

export const AuctionManagement = () => {
  useDocumentTitle("Manage Auctions");
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, ended, sold
  const { data: activeLiveData, refetch: refetchActiveLive } =
    useActiveLiveAuction();
  const { mutateAsync: startLiveMutation, isPending: startingLive } =
    useStartLiveAuction();

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/auctions");
      setAuctions(res.data.auctions || []);
    } catch (error) {
      toast.error("Failed to load auctions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleStartLiveAuction = async (auction) => {
    if (
      !confirm(
        `Push "${auction.itemName}" to Live Auction House now? This will activate a real-time bot-moderated arena for all users.`,
      )
    ) {
      return;
    }

    try {
      await startLiveMutation({
        auctionId: auction._id,
        startPrice: auction.currentPrice || auction.startingPrice,
        minIncrement: 1,
      });
      toast.success("Live Auction House activated");
      refetchActiveLive();
      fetchAuctions();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to start live auction arena",
      );
    }
  };

  const handleDeclareWinner = async (auctionId) => {
    if (!confirm("Declare winner for this auction? Credits will be settled."))
      return;
    try {
      await api.post(`/admin/auctions/${auctionId}/declare-winner`);
      toast.success("Winner declared and credits settled!");
      fetchAuctions();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to declare winner");
    }
  };

  const handleDelete = async (auctionId) => {
    if (!confirm("Delete this auction permanently?")) return;
    try {
      await api.delete(`/admin/auctions/${auctionId}`);
      toast.success("Auction deleted");
      fetchAuctions();
    } catch (error) {
      toast.error("Failed to delete auction");
    }
  };

  const now = new Date();
  const filtered = auctions.filter((a) => {
    if (filter === "active") return new Date(a.itemEndDate) > now && !a.isSold;
    if (filter === "ended") return new Date(a.itemEndDate) <= now && !a.isSold;
    if (filter === "sold") return a.isSold;
    return true;
  });

  const getStatus = (auction) => {
    if (auction.isSold)
      return { label: "Sold", cls: "bg-amber-50 text-amber-700" };
    if (new Date(auction.itemEndDate) > now)
      return { label: "Active", cls: "bg-emerald-50 text-emerald-700" };
    return { label: "Ended", cls: "bg-gray-100 text-gray-600" };
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-8 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Auction Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {auctions.length} total auctions
            </p>
            {activeLiveData?.active && (
              <p className="text-xs text-rose-600 font-semibold mt-2">
                Live Arena Active:{" "}
                {activeLiveData.session?.itemSnapshot?.itemName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 bg-[#efe3c7] text-[#6a542f] border border-[#d7c9ab] text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#e6d7b8] transition-all"
            >
              + Create Auction
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "active", "ended", "sold"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f
                  ? "bg-[#8d6f31] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">
                (
                {f === "all"
                  ? auctions.length
                  : auctions.filter((a) => {
                      if (f === "active")
                        return new Date(a.itemEndDate) > now && !a.isSold;
                      if (f === "ended")
                        return new Date(a.itemEndDate) <= now && !a.isSold;
                      if (f === "sold") return a.isSold;
                      return true;
                    }).length}
                )
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Auction
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Seller
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Bids
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-16 text-center text-gray-400"
                    >
                      No auctions match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((auction) => {
                    const status = getStatus(auction);
                    return (
                      <tr
                        key={auction._id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                              <img
                                src={
                                  auction.itemPhoto ||
                                  "https://picsum.photos/40"
                                }
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                                {auction.itemName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {auction.itemCategory}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {auction.seller?.name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900 tabular-nums">
                            Rs {auction.currentPrice}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {auction.bids?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.cls}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(auction.itemEndDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/auction/${auction._id}`}
                              className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 transition"
                            >
                              View
                            </Link>
                            {new Date(auction.itemEndDate) > now &&
                              !auction.isSold && (
                                <button
                                  onClick={() =>
                                    handleStartLiveAuction(auction)
                                  }
                                  disabled={
                                    startingLive ||
                                    (activeLiveData?.active &&
                                      activeLiveData?.session?.product?._id !==
                                        auction._id)
                                  }
                                  className={`text-xs px-2.5 py-1.5 rounded-lg transition ${
                                    activeLiveData?.active &&
                                    activeLiveData?.session?.product?._id ===
                                      auction._id
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-[#efe3c7] text-[#6a542f] hover:bg-[#d7c9ab]"
                                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                                >
                                  {activeLiveData?.active &&
                                  activeLiveData?.session?.product?._id ===
                                    auction._id
                                    ? "Live Now"
                                    : "Go Live"}
                                </button>
                              )}
                            {!auction.isSold &&
                              new Date(auction.itemEndDate) <= now &&
                              auction.bids?.length > 0 && (
                                <button
                                  onClick={() =>
                                    handleDeclareWinner(auction._id)
                                  }
                                  className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-200 transition"
                                >
                                  Declare Winner
                                </button>
                              )}
                            <button
                              onClick={() => handleDelete(auction._id)}
                              className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
