import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  endLiveAuction,
  getActiveLiveAuction,
  getLiveAuctionById,
  startLiveAuction,
} from "../services/liveAuction.service.js";

export const useActiveLiveAuction = () => {
  return useQuery({
    queryKey: ["activeLiveAuction"],
    queryFn: getActiveLiveAuction,
    refetchInterval: 7000,
  });
};

export const useLiveAuctionById = (id) => {
  return useQuery({
    queryKey: ["liveAuctionSession", id],
    queryFn: () => getLiveAuctionById(id),
    enabled: !!id,
  });
};

export const useStartLiveAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ auctionId, startPrice, minIncrement }) =>
      startLiveAuction({ auctionId, startPrice, minIncrement }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeLiveAuction"] });
    },
  });
};

export const useEndLiveAuction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId) => endLiveAuction(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeLiveAuction"] });
    },
  });
};
