# LinkLens

URL shortener with real-time analytics.

## Tech Stack

Node.js, Express, MongoDB, Redis, React, Vite

## Local Setup

```bash
git clone https://github.com/MKD2004/LinkLens.git
cd LinkLens/backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register a new user |
| POST | /api/auth/login | No | Login, get JWT |
| POST | /api/links | Optional | Create a short link |
| GET | /api/links | Yes | List your links (paginated) |
| PATCH | /api/links/:shortId/toggle | Yes | Toggle link active/inactive |
| DELETE | /api/links/:shortId | Yes | Delete link and its click data |
| GET | /r/:shortId | No | Redirect to original URL |
| GET | /api/health | No | Service health check |

Auth: pass `Authorization: Bearer <token>` header.

Pagination: `GET /api/links?page=1&limit=10` (max limit 50).
