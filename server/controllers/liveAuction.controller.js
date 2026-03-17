import LiveAuction from "../models/liveAuction.model.js";

export const getActiveLiveAuction = async (req, res) => {
  try {
    const liveSession = await LiveAuction.findOne({ status: "live" })
      .populate(
        "product",
        "itemName itemDescription itemCategory itemPhoto startingPrice currentPrice",
      )
      .sort({ createdAt: -1 });

    if (!liveSession) {
      return res.status(200).json({ active: false, session: null });
    }

    return res.status(200).json({ active: true, session: liveSession });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch active live auction",
      error: error.message,
    });
  }
};

export const getLiveAuctionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await LiveAuction.findById(id)
      .populate("product", "itemName itemDescription itemCategory itemPhoto")
      .populate("winner", "name")
      .populate("highestBidder", "name");

    if (!session) {
      return res
        .status(404)
        .json({ message: "Live auction session not found" });
    }

    return res.status(200).json({ session });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch live auction session",
      error: error.message,
    });
  }
};
