import axios from "axios";

const GEO_TIMEOUT_MS = 1800;

const normalizeIp = (ip = "") => ip.replace(/^::ffff:/, "").trim();

const isPrivateOrLocalIp = (ip = "") => {
  if (!ip) return true;

  return (
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
    ip.startsWith("fc") ||
    ip.startsWith("fd") ||
    ip.startsWith("fe80")
  );
};

const defaultLocation = {
  country: "Unknown",
  region: "Unknown",
  city: "Unknown",
  isp: "Unknown",
};

export const getLocationFromIp = async (ip) => {
  const cleanIp = normalizeIp(ip);

  if (!cleanIp || isPrivateOrLocalIp(cleanIp)) {
    return defaultLocation;
  }

  try {
    const response = await axios.get(`https://ipwho.is/${cleanIp}`, {
      timeout: GEO_TIMEOUT_MS,
    });

    if (response.data?.success !== false) {
      return {
        country: response.data?.country || "Unknown",
        region: response.data?.region || "Unknown",
        city: response.data?.city || "Unknown",
        isp: response.data?.connection?.isp || "Unknown",
      };
    }

    return defaultLocation;
  } catch (error) {
    console.log("Geo API timeout/failure:", error.message);
    return defaultLocation;
  }
};

export const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  // x-forwarded-for may contain multiple IPs: "client, proxy1, proxy2"
  const ip = forwarded ? forwarded.split(",")[0].trim() : null;
  return normalizeIp(ip || req.socket.remoteAddress || req.ip || "");
};
