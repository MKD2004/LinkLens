import geoip from "geoip-lite";

export default function lookupIP(ip) {
  const result = geoip.lookup(ip);
  if (!result) return { country: "Unknown", city: null };
  return { country: result.country, city: result.city || null };
}
