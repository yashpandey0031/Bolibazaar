import { api } from "../config/api.js";

export const getActiveLiveAuction = async () => {
  const res = await api.get("/live-auction/active");
  return res.data;
};

export const getLiveAuctionById = async (id) => {
  const res = await api.get(`/live-auction/${id}`);
  return res.data;
};

export const startLiveAuction = async ({
  auctionId,
  startPrice,
  minIncrement,
}) => {
  const res = await api.post(`/admin/auctions/${auctionId}/start-live`, {
    startPrice,
    minIncrement,
  });
  return res.data;
};

export const endLiveAuction = async (sessionId) => {
  const res = await api.post(`/admin/live-auctions/${sessionId}/end`);
  return res.data;
};
