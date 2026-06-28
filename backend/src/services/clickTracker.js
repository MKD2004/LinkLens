import { createHash } from "crypto";
import { UAParser } from "ua-parser-js";
import ClickEvent from "../models/ClickEvent.js";
import lookupIP from "./geoip.js";
import { emitClick } from "./sse.js";

export default async function recordClick(shortId, req) {
  try {
    const rawIp = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
    const hashedIp = createHash("sha256").update(rawIp).digest("hex");

    const parser = new UAParser(req.headers["user-agent"]);
    const deviceType = parser.getDevice().type;
    const device =
      deviceType === "mobile" ? "Mobile" : deviceType === "tablet" ? "Tablet" : "Desktop";
    const browser = parser.getBrowser().name || "Other";

    const { country, city } = lookupIP(rawIp);

    const refererHeader = req.headers["referer"] || req.headers["referrer"];
    let referer = "Direct";
    if (refererHeader) {
      try {
        referer = new URL(refererHeader).hostname;
      } catch {
        referer = "Direct";
      }
    }

    const clickData = {
      shortId,
      ip: hashedIp,
      country,
      city,
      device,
      browser,
      referer,
      timestamp: new Date(),
    };

    await ClickEvent.create(clickData);

    emitClick(shortId, {
      type: "click",
      shortId,
      timestamp: clickData.timestamp,
      country: clickData.country,
      device: clickData.device,
      browser: clickData.browser,
      referer: clickData.referer,
    });
  } catch (err) {
    console.error("Click recording error:", err.message);
  }
}
