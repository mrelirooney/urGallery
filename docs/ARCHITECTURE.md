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

- `src/app/` — App Router pages (`/`, `/login`, `/signup`, `/settings`, `/saves`, `/help`, `/[slug]`, `/[slug]/[portfolioSlug]`, `/[slug]/[portfolioSlug]/edit`, `/forgot-password`, `/reset-password`)
- `src/components/` — React components (`artist/`, `portfolio/`, `layout/`, `auth/`, `settings/`)
- `src/lib/` — API client, auth client, types, helpers
  - `lib/api.ts` — optional `apiFetch` wrapper (cookies + CSRF); many components use direct `fetch` with `API_BASE` + credentials + CSRF + ngrok-skip-browser-warning
  - `lib/auth/client.ts` — auth and editor flows (`AuthAPI`, `EditorAPI`); other endpoints (profile, hashtags, saves, comments, etc.) use direct `fetch` in components
  - `lib/api/artistLanding.ts` — server-side artist landing fetch
  - `lib/types.ts` — shared TypeScript interfaces
- `src/hooks/` — `useAuth`, `useSearch`, `useHistory`

### Portfolio editor (frontend)

Route: `/{artist_slug}/{portfolio_slug}/edit`. Shell: `PortfolioEditorShell.tsx`.

| Component | Purpose |
|-----------|---------|
| `EditorTopBar.tsx` | Toolbar: undo/redo, page thumbnails, portfolio title, **Layouts** button |
| `PageRenderer.tsx` (editor) | Renders draft page by `layout` enum; editor vs read-only modes |
| `LayoutPickerPanel.tsx` | Right slide-in layout menu (portal); backdrop, categories, hover/selection states |
| `ScaledLayoutPreview.tsx` | Hover preview: fixed 1280×720 stage, CSS scale, portfolio-bg colors, glow/border |
| `layoutRegistry.ts` | Picker categories, human labels (`Layout 01`…), layout-12 exclusion |
| `PrivacyModal.tsx` | Privacy + publish flow |
| `PageThumbnailCapture.tsx` | `html2canvas` snapshots for thumbnail strip |

**Layout picker behavior:** Opens from toolbar; accordion categories (Media and Text, Text Only, Media Only placeholder). Hover shows scaled live preview in the gap left of the 400px panel; click PATCHes layout and closes. Panel colors derive from profile lightness (`isLightColor`) using fixed off-black/off-white tokens; preview canvas uses `customColors.text` (portfolio section bg).

**Color tokens (artist pages):** Profile = Color #1 (`background_color` → `--artist-profile-bg`). Portfolio section = Color #2 (`text_color` → `--artist-portfolio-bg`, `--artist-background`). Accent = Color #3 (`accent_color`). Set by `ColorThemeSetter`; cleared on non-artist routes by `ColorThemeGuard`. Artist layout injects `--body-background` gradient via inline script before paint; root `layout.tsx` uses `suppressHydrationWarning` on `<html>`/`<body>` and `globals.css` sets `body { background: var(--body-background, var(--background)) }`.

### API Integration Rules

- `NEXT_PUBLIC_API_BASE` — backend base URL (e.g. `http://localhost:8000`)
- `BACKEND_INTERNAL_URL` — used for Next.js rewrites (proxy target)
- Rewrites: `/api/*` and `/media/*` proxied to Django (avoids CORS with single origin)
- **Search:** Next.js API route `GET /api/search?q=<term>` proxies to Django `/api/artists/search/?q=<term>`; frontend `useSearch` calls this route (forwards cookies)
- **ngrok (local dev):** When using ngrok to tunnel (e.g. for mobile testing or webhooks), add the ngrok URL to backend `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`. Frontend sends `ngrok-skip-browser-warning: true` on API calls to bypass ngrok's interstitial.
- `credentials: "include"` on all fetch calls for HttpOnly cookies
- `X-CSRFToken` header on all mutations (read from `csrftoken` cookie)
- **Tokens are in HttpOnly cookies. Never read them from localStorage.**

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
| `api` | Profile (my), My portfolios, themes, help |
| `accounts` | User, Profile, DefaultAvatar, auth views |
| `artists` | Artist landing, portfolio detail, search, comments |
| `portfolios` | Portfolio/Page models, Comment model, draft editor, publish |
| `saves` | SavedArtist, SavedPortfolio |
| `themes` | Theme model |
| `tags` | Hashtag, UserHashtag |
| `notifications` | Notification model |

### URL Map

```
/api/auth/
  csrf/                       GET   → set CSRF cookie
  login/                      POST  → JWT login (sets HttpOnly cookies)
  refresh/                    POST  → rotate tokens
  register/                   POST  → create account
  me/                         GET   → current user + profile
  logout/                     POST  → clear cookies
  change-password/            POST  → requires current_password + new_password
  change-email/               POST  → requires new_email + current_password
  forgot-password/            POST  → send reset email (unauthenticated)
  reset-password/             POST  → complete reset with uid + token

/api/artists/
  search/?q=<term>            GET   → search artists
  <artist_slug>/              GET   → artist landing (profile + portfolios)
  <artist_slug>/portfolios/<portfolio_slug>/              GET
  <artist_slug>/portfolios/<portfolio_slug>/comments/     GET, POST
  <artist_slug>/portfolios/<portfolio_slug>/comments/<id>/  DELETE

/api/portfolios/
  <portfolio_slug>/editor/               GET, PATCH
  <portfolio_slug>/editor/pages/         POST
  <portfolio_slug>/editor/pages/<id>/    GET, PATCH, DELETE
  <portfolio_slug>/editor/reorder/       PATCH
  <portfolio_slug>/editor/publish/       POST

/api/my/
  profile/                    GET, PATCH  (FormData: avatar, banner_image, resume_file)
  hashtags/                   GET   → list user's hashtags
  hashtags/add/               POST  → add hashtag (body: { name: "..." })
  hashtags/<id>/              DELETE → remove hashtag by UserHashtag id
  portfolios/                 GET, POST
  portfolios/<slug>/          GET, PATCH, DELETE
  saves/                      GET   (?sort=alpha, ?q=<term>)
  saves/artists/<artist_slug>/                           POST, DELETE
  saves/portfolios/<artist_slug>/<portfolio_slug>/       POST, DELETE

/api/themes/                  GET

/api/help/                    POST  (authenticated)
```

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

### Key Models

| Model | Key Fields |
|-------|------------|
| **User** | email, first_name, last_name, display_name, title, location, bio, avatar |
| **Profile** | user (1:1), slug, tier (free\|pro\|premium), display_name, title, location, bio, default_avatar, avatar_s3_key, banner_image, resume_file, social URLs, contact_order, color fields, font_family, theme |
| **Portfolio** | user, title, slug, privacy, password (hashed, for private), order_index, pages_count, cover_page |
| **Page** | portfolio, title, description, description_body, order, layout, media_image, media_shape, media_image_2, media_shape_2, title_2, description_2, title_3, description_3 |
| **DraftPortfolio** | user, slug, title, privacy, has_unpublished_changes |
| **DraftPage** | draft_portfolio, (same fields as Page) |
| **Comment** | portfolio, author (user), body, created_at |
| **SavedArtist** | user (saver), profile (saved), created_at |
| **SavedPortfolio** | user (saver), portfolio (saved), created_at |
| **Theme** | key, name, version, is_active, svg_file, preview_image, css_vars_json |
| **Media** | title, description, cover_image, file, external_url, owner |
| **PageMedia** | page, media, order (M2M-style) |
| **Hashtag** | name, slug |
| **UserHashtag** | user, hashtag |
| **Notification** | user, type, title, body, action_url, read_at |

---

## Storage

### Upload Paths

| Path | Content |
|------|---------|
| `avatars/` | User avatar images |
| `banners/` | Profile banner images |
| `resumes/` | Optional resume PDFs (one per user) |
| `portfolio_pages/` | Live page media |
| `draft_portfolio_pages/` | Draft page media |
| `themes/svg/` | Theme SVG patterns |
| `themes/previews/` | Theme preview thumbnails |

### URL Resolution

- `build_media_url(request, path)` in `config.utils`
- Uses `PUBLIC_API_BASE` when set (e.g. Docker) so browser can reach media URLs
- Otherwise returns relative path (Next.js rewrites `/media/*` to backend)

### Serving

- **Dev**: Django serves media when `DEBUG=True`
- **Docker**: `SERVE_MEDIA=true` allows Django to serve when `DEBUG=False`
- **Production**: Use S3-compatible storage (Cloudflare R2 or Backblaze B2) via `django-storages` for all user uploads

---

## Authentication

### Method

- **JWT** (SimpleJWT) stored in **HttpOnly cookies**
- Cookies: `access` (access token), `refresh` (refresh token)
- `CookieJWTAuthentication`: reads JWT from `access` cookie

### Flow

1. **Login**: `POST /api/auth/login/` with `{ email, password }` → backend sets `access` and `refresh` cookies
2. **Refresh**: `POST /api/auth/refresh/` → rotates tokens, updates cookies
3. **Me**: `GET /api/auth/me/` → returns user + profile (requires valid token)
4. **Logout**: `POST /api/auth/logout/` → clears cookies

### Password Reset Flow

1. User submits email at `/forgot-password` → `POST /api/auth/forgot-password/`
2. Backend sends email with link: `/reset-password?uid=<uid>&token=<token>`
3. User clicks link → frontend submits `POST /api/auth/reset-password/` with `{ uid, token, new_password }`

### CSRF

- Required for all state-changing requests (POST, PATCH, PUT, DELETE)
- Frontend calls `GET /api/auth/csrf/` on app start to obtain `csrftoken` cookie
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

---

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DEBUG` | Django debug mode | `False` |
| `SECRET_KEY` | Django secret key | (random string) |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `urgallery.io,www.urgallery.io` (prod); `127.0.0.1,localhost,<ngrok-subdomain>.ngrok-free.dev` (local + ngrok) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins | `https://urgallery.io` (prod); `http://localhost:3000,http://127.0.0.1:3000,https://<ngrok-subdomain>.ngrok-free.dev` (local + ngrok) |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pw@host/db` |
| `PUBLIC_API_BASE` | Browser-accessible API URL (media URLs) | `https://api.urgallery.io` |
| `FRONTEND_BASE_URL` | Frontend URL for password reset emails | `https://urgallery.io` |
| `NEXT_PUBLIC_API_BASE` | Frontend env: backend URL | `https://api.urgallery.io` |
| `SERVE_MEDIA` | Serve media from Django (Docker) | `true` |
| `EMAIL_BACKEND` | Django email backend | `django.core.mail.backends.smtp.EmailBackend` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_HOST_USER` | SMTP user | `noreply@urgallery.io` |
| `EMAIL_HOST_PASSWORD` | SMTP password | (secret) |
| `DEFAULT_FROM_EMAIL` | From address | `noreply@urgallery.io` |
| `HELP_EMAIL_RECIPIENT` | Help form recipient | `support@urgallery.io` |
| `STRIPE_SECRET_KEY` | Stripe secret key (V1) | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `STRIPE_PRICE_PRO` | Stripe Price ID for Pro | `price_...` |
| `STRIPE_PRICE_PREMIUM` | Stripe Price ID for Premium | `price_...` |
