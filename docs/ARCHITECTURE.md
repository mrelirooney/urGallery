# urGallery — Architecture

> Technical architecture for frontend, backend, database, storage, and authentication.

---

## Frontend

### Stack

- **Framework**: Next.js 16 (App Router)
- **Build**: Turbopack
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript
- **Output**: `standalone` (for Docker deployment)

### Key Dependencies

- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — drag-and-drop (page reorder)
- `html2canvas` — page thumbnail capture in editor
- `lucide-react`, `react-icons` — icons

### Structure

- `src/app/` — App Router pages (/, /login, /signup, /settings, /[slug], /[slug]/[portfolioSlug], /[slug]/[portfolioSlug]/edit)
- `src/components/` — React components (artist, portfolio, layout, auth, settings)
- `src/lib/` — API client, auth client, types, helpers
- `src/hooks/` — useAuth, useSearch, useHistory

### API Integration

- `NEXT_PUBLIC_API_BASE` — backend base URL (e.g. `http://localhost:8000`)
- `BACKEND_INTERNAL_URL` — used for Next.js rewrites (proxy target)
- Rewrites: `/api/*` and `/media/*` proxied to Django (avoids CORS with single origin)
- `credentials: "include"` on fetch for cookies
- `X-CSRFToken` header on mutations (read from `csrftoken` cookie)

### Build & Deploy

- `next build --turbopack` → standalone output
- Docker: multi-stage build (node:21-alpine); copies `.next/standalone` + `public` + `.next/static`

---

## Backend

### Stack

- **Framework**: Django 5.2
- **API**: Django REST Framework
- **Auth**: djangorestframework-simplejwt
- **Server**: Gunicorn
- **Static**: WhiteNoise
- **Images**: Pillow

### Apps

| App | Purpose |
|-----|---------|
| `config` | Settings, URLs, WSGI |
| `api` | Auth, My profile/portfolios, themes, help |
| `accounts` | User, Profile, DefaultAvatar, auth views |
| `artists` | Artist landing, portfolio detail, search |
| `portfolios` | Portfolio/Page models, draft editor, publish |
| `themes` | Theme model, admin |
| `tags` | Hashtag, UserHashtag |
| `notifications` | Notification model |

### URL Structure

- `/api/auth/` — login, register, me, logout, refresh, csrf
- `/api/artists/` — search, landing, portfolio detail
- `/api/portfolios/` — editor (draft CRUD, reorder, publish), public portfolio
- `/api/my/` — profile, portfolios (authenticated)
- `/api/themes/` — list themes
- `/api/help/` — help form
- `/admin/` — Django admin
- `/media/` — user uploads (when `SERVE_MEDIA` or DEBUG)

### Middleware

- `CorsMiddleware` (first)
- `WhiteNoiseMiddleware`
- `SessionMiddleware`
- `CsrfViewMiddleware`
- `AuthenticationMiddleware`

---

## Database

### Engine

- **PostgreSQL 15** (primary)
- `dj-database-url` for `DATABASE_URL` (Docker / production)
- Fallback: local Postgres (`urgallery_dev`, `localhost:5432`)

### Schema

- Managed via Django migrations
- Models: User, Profile, DefaultAvatar, Portfolio, Page, DraftPortfolio, DraftPage, Theme, Media, PageMedia, Hashtag, UserHashtag, Notification
- `AUTH_USER_MODEL = "accounts.User"`

### Docker

- `postgres:15` image
- Volume: `postgres_data` for persistence
- `DATABASE_URL` passed to backend service

---

## Storage

### Media Files

- **Backend**: Django `FileField` / `ImageField`
- **Root**: `backend/media/` (`MEDIA_ROOT`)
- **URL**: `/media/` (`MEDIA_URL`)

### Upload Paths

| Path | Content |
|------|---------|
| `avatars/` | User avatar images |
| `banners/` | Profile banner images |
| `portfolio_pages/` | Live page media |
| `draft_portfolio_pages/` | Draft page media |
| `themes/svg/` | Theme SVG patterns |
| `themes/previews/` | Theme preview thumbnails |
| `media/covers/`, `media/files/` | Media model (if used) |

### URL Resolution

- `build_media_url(request, path)` in `config.utils`
- Uses `PUBLIC_API_BASE` when set (e.g. Docker) so browser can reach media URLs
- Otherwise returns relative path (Next.js rewrites `/media/*` to backend)

### Serving

- **Dev**: Django serves media when `DEBUG=True`
- **Docker**: `SERVE_MEDIA=true` allows Django to serve when `DEBUG=False`
- **Production**: Intended for nginx/CDN or S3; `DefaultAvatar` and `avatar_s3_key` support S3 keys for avatars

### Static Files

- `STATIC_ROOT = staticfiles/`
- `collectstatic` run at container startup
- WhiteNoise serves static in production

---

## Authentication

### Method

- **JWT** (SimpleJWT) stored in **HttpOnly cookies**
- Cookies: `access` (access token), `refresh` (refresh token)
- `CookieJWTAuthentication`: reads JWT from `access` cookie or `Authorization: Bearer` header

### Flow

1. **Login**: POST `/api/auth/login/` with `{ email, password }` → backend sets `access` and `refresh` cookies
2. **Refresh**: POST `/api/auth/refresh/` → rotates tokens, updates cookies
3. **Me**: GET `/api/auth/me/` → returns user + profile (requires valid token)
4. **Logout**: POST `/api/auth/logout/` → clears cookies

### CSRF

- Required for state-changing requests (POST, PATCH, PUT, DELETE)
- Frontend calls GET `/api/auth/csrf/` to obtain `csrftoken` cookie
- Mutations send `X-CSRFToken` header with value from cookie

### Configuration

- `ACCESS_TOKEN_LIFETIME`: 1 day
- `REFRESH_TOKEN_LIFETIME`: 7 days
- `ROTATE_REFRESH_TOKENS`: True
- `BLACKLIST_AFTER_ROTATION`: True
- `AUTH_COOKIE_HTTP_ONLY`: True
- `AUTH_COOKIE_SAMESITE`: Lax (dev); None for cross-origin prod
- `CORS_ALLOW_CREDENTIALS`: True
- `CSRF_TRUSTED_ORIGINS` / `CORS_ALLOWED_ORIGINS` must include frontend origin

### Fallback

- `SessionAuthentication` in DRF for compatibility (e.g. admin)
