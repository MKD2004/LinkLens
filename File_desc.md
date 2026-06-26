# LinkLens — File Descriptions (Interview Prep)

## Root

### `backend/package.json`
- Node.js project config with `"type": "module"` (ES module imports throughout).
- Dependencies: Express, Mongoose, ioredis, nanoid, jsonwebtoken, bcryptjs, dotenv, cors, helmet, morgan, geoip-lite, ua-parser-js.
- Scripts: `npm run dev` (nodemon), `npm start` (node).

### `backend/.env`
- Environment variables: PORT, MONGODB_URI, JWT_SECRET, REDIS_URL, ALLOWED_ORIGINS, BASE_URL.
- Never committed to version control — `.env.example` has the same keys with placeholder values.

---

## Config

### `backend/src/config/db.js`
- Exports a `connectDB()` async function.
- Sets Node's DNS servers to Google (8.8.8.8, 8.8.4.4) to fix SRV lookup issues with `mongodb+srv://` URIs.
- Calls `mongoose.connect(MONGODB_URI)` — logs success or exits process on failure.
- Gracefully skips connection if URI is missing or not configured (placeholder check).

---

## Models

### `backend/src/models/User.js`
- Mongoose schema for registered users.
- Fields: `name` (String, required), `email` (String, required, unique, lowercase, trimmed), `passwordHash` (String, required).
- `timestamps: true` → auto `createdAt` and `updatedAt`.
- Instance method: `comparePassword(plain)` — uses `bcrypt.compare()` to check a plaintext password against the stored hash. Returns a boolean.

### `backend/src/models/Link.js`
- Mongoose schema for shortened URLs.
- Fields:
  - `shortId` (String, required, unique, indexed) — the 6-char nanoid or custom alias used in the short URL.
  - `originalUrl` (String, required) — the destination URL.
  - `customAlias` (String, sparse unique index) — optional human-readable alias. Sparse so multiple null values don't conflict.
  - `userId` (ObjectId ref → User, default null) — null for anonymous links, populated for authenticated users.
  - `title` (String, default null) — optional label.
  - `isActive` (Boolean, default true) — toggle to disable a link without deleting it.
  - `expiresAt` (Date, default null) — optional expiration timestamp.
- `timestamps: true` → auto `createdAt` and `updatedAt`.

### `backend/src/models/ClickEvent.js`
- Mongoose schema for analytics — each document = one click on a short link.
- Fields: `shortId`, `timestamp` (default Date.now), `ip` (will be SHA256 hashed), `country`, `city`, `device` (enum: Mobile/Desktop/Tablet), `browser`, `referer`.
- Compound indexes for fast analytics queries:
  - `{ shortId: 1, timestamp: -1 }` — recent clicks per link.
  - `{ shortId: 1, country: 1 }` — clicks by country.
  - `{ shortId: 1, device: 1 }` — clicks by device type.
- No `timestamps` option — append-only collection, `timestamp` field handles it.

---

## Middleware

### `backend/src/middleware/auth.js`
- JWT verification middleware for protected routes.
- Extracts Bearer token from the `Authorization` header.
- Verifies it using `jwt.verify()` with `JWT_SECRET` from env.
- On success: attaches decoded payload (userId, email) to `req.user`, calls `next()`.
- On failure: returns 401 `{ error: "unauthorized", message: "Invalid or expired token" }`.

### `backend/src/middleware/rateLimiter.js`
- Exports a `createRateLimiter({ limit, windowSecs, keyPrefix })` factory function — returns an Express middleware.
- **Algorithm: Redis sliding counter (INCR + TTL pipeline)**
  - Atomically increments a per-IP counter in Redis using a pipeline (`INCR` + `TTL` in one round-trip).
  - On first request (count === 1) or if TTL is missing (count -1, race condition guard): sets expiry with `EXPIRE`.
  - Redis key format: `<keyPrefix>:<ip>` — e.g. `ratelimit:shorten:::1` for localhost.
- **Response headers** set on every request (even allowed ones):
  - `X-RateLimit-Limit` — max requests allowed in the window.
  - `X-RateLimit-Remaining` — requests left (`max(0, limit - count)`).
  - `X-RateLimit-Reset` — Unix timestamp when the window resets.
- If `count > limit`: returns 429 `{ error: "rate_limit_exceeded", message, retryAfter }`.
- Entire function wrapped in try/catch — if Redis fails, `next()` is called anyway. Rate limiter failure never blocks traffic.
- Also exports two pre-configured named instances:
  - `shortenLimiter` — 10 requests / 60 min, keyPrefix `ratelimit:shorten`
  - `redirectLimiter` — 100 requests / 60 min, keyPrefix `ratelimit:redirect`

---

## Services

### `backend/src/services/redis.js`
- Redis client singleton using ioredis.
- Auto-prepends `redis://` to REDIS_URL if missing.
- Logs "Redis connected" on connect, logs errors without crashing the process.
- Exported as default — importing this file anywhere triggers the connection.

### `backend/src/services/geoip.js`
- Thin wrapper around the `geoip-lite` library.
- Exports a default `lookupIP(ip)` function — synchronous, no await needed.
- Returns `{ country, city }`. If the IP is private/unknown (e.g. localhost), returns `{ country: "Unknown", city: null }`.
- Used by `clickTracker.js` before hashing the IP.

### `backend/src/services/clickTracker.js`
- Exports a default async `recordClick(shortId, req)` function.
- Called fire-and-forget after every redirect — **never awaited**, so it never delays the response.
- What it does:
  1. **IP** — reads from `x-forwarded-for` header (first entry) or `req.ip`. SHA256-hashes it before storing (privacy).
  2. **Device & Browser** — uses `UAParser` from `ua-parser-js` to parse the `User-Agent` header. Maps ua-parser device types to `Mobile / Tablet / Desktop`.
  3. **GeoIP** — calls `lookupIP(rawIp)` (before hashing) to get country and city.
  4. **Referer** — reads `referer`/`referrer` header, extracts hostname via `new URL()`. Falls back to `"Direct"` if absent or unparseable.
  5. Saves a `ClickEvent` document with all enriched fields.
- Entire body wrapped in try/catch — errors are logged, never thrown. Click failure can never crash a redirect.

---

## Routes

### `backend/src/routes/authRoutes.js`
- **POST /register**
  - Accepts `{ name, email, password }`.
  - Validates all fields present, password >= 8 chars.
  - Checks for duplicate email → 409 if exists.
  - Hashes password with bcrypt (12 rounds), saves User document.
  - Signs a JWT with `{ userId, email }`, expires in 7 days.
  - Returns 201: `{ message: "registered", token, user: { id, name, email } }`.

- **POST /login**
  - Accepts `{ email, password }`.
  - Finds user by email, calls `user.comparePassword()`.
  - Wrong credentials → 401 `{ error: "invalid_credentials" }`.
  - Signs JWT same as register.
  - Returns 200: `{ token, user: { id, name, email } }`.

### `backend/src/routes/linkRoutes.js`
- **POST /api/links** — Create a short link. Protected by `shortenLimiter` (10 req/hour per IP).
  - Supports two modes: authenticated (JWT in header → userId set) and anonymous (no header → userId = null). Does NOT reject missing tokens.
  - Validates URL is present, parseable by `new URL()`, starts with http/https.
  - If `customAlias` provided: validates alphanumeric+hyphens regex, checks DB for conflicts → 409.
  - Generates `shortId` using nanoid (alphabet: alphanumeric, length: 6) with collision loop.
  - `customAlias` is omitted from the document entirely when not provided — never set to `null`. This is required because MongoDB sparse indexes still index explicit `null` values, which would cause a duplicate key error on the second anonymous link.
  - Saves Link document, returns 201: `{ shortId, shortUrl, originalUrl, createdAt }`.

- **GET /r/:shortId** — Redirect with Redis caching + async click tracking. Protected by `redirectLimiter` (100 req/hour per IP).
  - Step 1: Check Redis for `link:<shortId>`. Cache HIT → `res.redirect(301)` immediately, then `recordClick()` fire-and-forget.
  - Step 2: Cache MISS → query MongoDB. If not found → 404. If inactive → 403. If expired → 410.
  - Step 3: Write to Redis with `SETEX` (TTL: 86400s = 24h), then `res.redirect(301)`, then `recordClick()` fire-and-forget.
  - Critical ordering: `res.redirect()` is always called **before** `recordClick()` — click recording never affects response latency.
  - Console logs "Cache HIT" or "Cache MISS" for debugging.

- **Named export: `clearLinkCache(shortId)`** — deletes `link:<shortId>` from Redis. Used for cache invalidation when a link is toggled/deleted (wired up later).

---

## Entry Point

### `backend/src/index.js`
- Loads env vars via `dotenv/config`.
- Imports Redis client (triggers connection on startup).
- Applies global middleware in order: `helmet()` (security headers), `cors()` (ALLOWED_ORIGINS), `morgan("dev")` (request logging), `express.json()` (body parsing).
- Mounts routes: `/api/auth` → authRoutes, `/` → linkRoutes.
- Health check: `GET /api/health` → `{ status: "ok", timestamp }`.
- Connects to MongoDB via `connectDB()`, then starts Express server on PORT.
