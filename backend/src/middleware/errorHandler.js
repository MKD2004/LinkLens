export default function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${err.message}`);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "validation_error", message: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "duplicate", message: "Resource already exists" });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "unauthorized", message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "unauthorized", message: "Token expired" });
  }

  const isDev = process.env.NODE_ENV === "development";
  return res.status(500).json({
    error: "server_error",
    message: isDev ? err.message : "Something went wrong",
    ...(isDev && { stack: err.stack }),
  });
}
