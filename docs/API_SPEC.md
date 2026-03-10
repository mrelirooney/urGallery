# urGallery — Backend API Specification

> API contract for the urGallery Django backend. Use with [ARCHITECTURE.md](./ARCHITECTURE.md) (stack, auth, storage) and [PRD.md](./PRD.md) (product behavior and endpoint lists). This doc specifies **implemented** endpoints, request/response shapes, and behavior not fully detailed elsewhere.

---

## Base URL and conventions

- **Base URL:** `NEXT_PUBLIC_API_BASE` (e.g. `http://localhost:8000`). All paths below are relative to this base.
- **Prefix:** All API routes live under `/api/` (e.g. `/api/auth/login/`).
- **Media:** User-uploaded media are served under `/media/` (or proxied from backend). See ARCHITECTURE.md for `build_media_url` and `PUBLIC_API_BASE`.
- **Content types:** JSON for most requests/responses. `multipart/form-data` (FormData) for profile PATCH (avatar, banner, resume) and for editor page PATCH when uploading images.
- **Slug convention:** `artist_slug` = Profile.slug (artist/landing identifier). `portfolio_slug` = Portfolio.slug (per-user).

---

## Authentication and headers

- **JWT in cookies:** Access and refresh tokens are stored in HttpOnly cookies (`access`, `refresh`). No token in request body or `Authorization` header for normal requests.
- **CSRF:** All state-changing requests (POST, PATCH, PUT, DELETE) require a valid CSRF token. Frontend obtains it via `GET /api/auth/csrf/` and sends `X-CSRFToken` header (value from `csrftoken` cookie). Use `credentials: "include"` on fetch.
- **Auth required:** Endpoints under “Auth required” below return `401 Unauthorized` if the user is not authenticated.

---

## Error responses

- **400 Bad Request:** Validation or business rule failure. Body typically `{ "error": "..." }` or `{ "detail": "..." }` or serializer `errors` dict.
- **401 Unauthorized:** Missing or invalid JWT (e.g. expired access token).
- **403 Forbidden:** Authenticated but not allowed (e.g. not owner).
- **404 Not Found:** Resource not found (e.g. wrong slug or id).
- **500 Internal Server Error:** Server error; body may include `detail` or `error`.

---

## 1. Auth — `/api/auth/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/auth/csrf/` | No | Set CSRF cookie |
| POST | `/api/auth/login/` | No | Login; set access/refresh cookies |
| POST | `/api/auth/refresh/` | No (uses refresh cookie) | Rotate tokens; update cookies |
| POST | `/api/auth/register/` | No | Create account |
| GET | `/api/auth/me/` | Yes | Current user + profile summary |
| POST | `/api/auth/logout/` | No | Clear auth cookies |
| POST | `/api/auth/change-password/` | Yes | Change password |
| POST | `/api/auth/change-email/` | Yes | Change email |
| POST | `/api/auth/forgot-password/` | No | Send reset email |
| POST | `/api/auth/reset-password/` | No | Complete reset with token |

### `GET /api/auth/csrf/`

- **Response:** `200` — `{ "detail": "CSRF cookie set" }`. Sets `csrftoken` cookie.

### `POST /api/auth/login/`

- **Request body:** `{ "email": string, "password": string }`
- **Success:** `200` — `{ "message": "Login successful" }`. Sets `access` and `refresh` HttpOnly cookies.
- **Errors:** `400` — invalid credentials (serializer validation).

### `POST /api/auth/refresh/`

- **Request:** No body. Uses `refresh` cookie.
- **Success:** `200` — response may include new tokens; backend sets updated `access` (and optionally `refresh`) cookies.
- **Errors:** `401` if refresh token missing or invalid.

### `POST /api/auth/register/`

- **Request body:** `{ "email": string, "password": string }`
- **Success:** `201` — `{ "detail": "Account created successfully" }`
- **Errors:** `400` — `{ "error": "email and password are required" }` or `{ "error": "Email already in use" }`

### `GET /api/auth/me/`

- **Auth required.** Returns current user and profile summary.
- **Response:** `200` — e.g. `{ "id", "email", "first_name", "last_name", "slug", "display_name", "title", "location", "bio", "avatar_url" }`. `slug` and display fields come from Profile.

### `POST /api/auth/logout/`

- **Response:** `200` — `{ "detail": "Logged out" }`. Clears `access` and `refresh` cookies.

### `POST /api/auth/change-password/`

- **Auth required.** Request body: `{ "current_password": string, "new_password": string }`
- **Success:** `200` — `{ "detail": "Password updated successfully" }`
- **Errors:** `400` — missing fields, wrong current password, new password same as current, or new password &lt; 8 characters.

### `POST /api/auth/change-email/`

- **Auth required.** Request body: `{ "new_email": string, "current_password": string }`
- **Success:** `200` — `{ "detail": "Email updated successfully" }`
- **Errors:** `400` — missing fields, wrong current password, or email already in use.

### `POST /api/auth/forgot-password/`

- **Request body:** `{ "email": string }`
- **Response:** Always `200` — `{ "detail": "If that email is registered, a reset link has been sent." }` (no leak of email existence). Sends email with link to `{FRONTEND_BASE_URL}/reset-password?uid={uid}&token={token}`.

### `POST /api/auth/reset-password/`

- **Request body:** `{ "uid": string, "token": string, "new_password": string }`
- **Success:** `200` — `{ "detail": "Password reset successfully. You can now log in." }`
- **Errors:** `400` — missing fields, invalid/expired link, password &lt; 8 characters, or new password equals current password.

---

## 2. Artists (public) — `/api/artists/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/artists/search/?q=<term>` | No | Search artists |
| GET | `/api/artists/<artist_slug>/` | No | Artist landing (profile + portfolios) |
| GET | `/api/artists/<artist_slug>/portfolios/<portfolio_slug>/` | No | Portfolio detail with pages |
| POST | `/api/artists/<artist_slug>/portfolios/<portfolio_slug>/unlock/` | No | Unlock private portfolio with password |
| PATCH | `/api/artists/<artist_slug>/portfolios/<portfolio_slug>/privacy/` | Yes (owner) | Set public/private (+ password for private) |
| GET | `/api/artists/<artist_slug>/portfolios/<portfolio_slug>/comments/` | No* | List comments |
| POST | `/api/artists/<artist_slug>/portfolios/<portfolio_slug>/comments/` | Yes | Create comment |
| DELETE | `/api/artists/<artist_slug>/portfolios/<portfolio_slug>/comments/<id>/` | Yes (author only) | Delete comment |

\* Listing comments: portfolio must be visible to requester (public, or private and requester is owner). For private, content may still be gated by unlock.

### `GET /api/artists/search/?q=<term>`

- **Query:** `q` — search term (optional; if empty, returns empty results).
- **Response:** `200` — `{ "results": [ { "slug", "display_name", "title", "location", "avatar_url" }, ... ] }`. Up to 12 results, ordered by relevance (name start &gt; name contains &gt; title &gt; location/slug &gt; hashtag). On server error may include `"error": string`.

### `GET /api/artists/<artist_slug>/`

- **Response:** `200` — `{ "profile": { ... }, "portfolios": [ ... ] }`
  - **profile:** Full artist profile (slug, display_name, title, location, bio, avatar_url, banner_image_url, resume_url, contact URLs, contact_order, background_color, foreground_color, text_color, accent_color, font_family, theme with svg_url/preview_url).
  - **portfolios:** List of non-draft portfolios for this artist. Each: `id`, `slug`, `title`, `privacy`, `order_index`, `pages_count`, and optionally `first_page` (id, title, layout, description) for preview. Ordered: public first, then by order_index, id.

### `GET /api/artists/<artist_slug>/portfolios/<portfolio_slug>/`

- **Response:** `200` — Full portfolio with pages (PublicPortfolioSerializer). Fields include `id`, `title`, `slug`, `privacy`, `order_index`, `pages_count`, `cover_page`, `pages` (array of pages with id, title, description, order, layout, media_image, media_shape, media_image_2, media_shape_2, title_2, description_2; media fields as absolute URLs). Private portfolios return same structure; frontend blurs until unlock.

### `POST /api/artists/<artist_slug>/portfolios/<portfolio_slug>/unlock/`

- **Request body:** `{ "password": string }`
- **Success:** `200` — `{ "token": "<signed_token>", "expires_at": <unix_ts> }`. Client stores token (e.g. cookie) and sends it when loading private portfolio content; token valid 7 days.
- **Errors:** `400` — portfolio not private, or incorrect password.

### `PATCH /api/artists/<artist_slug>/portfolios/<portfolio_slug>/privacy/`

- **Auth required.** Owner only.
- **Request body:** `{ "privacy": "public" | "private", "password": string }`. `password` required when setting to private.
- **Success:** `200` — `{ "privacy": "public" | "private" }`
- **Errors:** `403` not owner, `400` invalid privacy or missing password for private.

### `GET /api/artists/<artist_slug>/portfolios/<portfolio_slug>/comments/`

- **Response:** `200` — Array of comments. Each: `id`, `body`, `author_id`, `author_display_name`, `author_avatar_url`, `created_at`. Requires portfolio access (public or owner for private).

### `POST /api/artists/<artist_slug>/portfolios/<portfolio_slug>/comments/`

- **Auth required.** Request body: `{ "body": string }`
- **Success:** `201` — Created comment (same shape as list).
- **Errors:** `400` validation, `404` portfolio not found or no access.

### `DELETE /api/artists/<artist_slug>/portfolios/<portfolio_slug>/comments/<id>/`

- **Auth required.** Only the **comment author** can delete (not portfolio owner in current implementation).
- **Success:** `204` No Content.
- **Errors:** `403` Permission denied, `404` comment not found.

---

## 3. Portfolios (editor) — `/api/portfolios/`

All editor routes are under `/api/portfolios/<portfolio_slug>/editor/`. **Auth required;** user must own the portfolio (identified by slug).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/portfolios/<portfolio_slug>/editor/` | Load or create draft; return draft + pages |
| PATCH | `/api/portfolios/<portfolio_slug>/editor/` | Update draft metadata and/or pages (bulk save) |
| POST | `/api/portfolios/<portfolio_slug>/editor/pages/` | Create draft page |
| GET | `/api/portfolios/<portfolio_slug>/editor/pages/<page_id>/` | Get draft page |
| PATCH | `/api/portfolios/<portfolio_slug>/editor/pages/<page_id>/` | Update draft page (JSON or FormData for images) |
| DELETE | `/api/portfolios/<portfolio_slug>/editor/pages/<page_id>/` | Delete draft page |
| PATCH | `/api/portfolios/<portfolio_slug>/editor/reorder/` | Reorder pages |
| POST | `/api/portfolios/<portfolio_slug>/editor/publish/` | Publish draft to live |

### `GET /api/portfolios/<portfolio_slug>/editor/`

- **Response:** `200` — Draft portfolio (PortfolioDetailSerializer). Fields: `id`, `title`, `slug`, `description`, `privacy`, `password` (plaintext only if draft has it and not hashed; otherwise ""), `has_unpublished_changes`, `created_at`, `updated_at`, `pages`. Each page: `id`, `title`, `description`, `order`, `layout`, `media_image`, `media_shape`, `media_image_2`, `media_shape_2`, `title_2`, `description_2`, `created_at`, `updated_at`. Media as absolute URLs. If no draft exists, one is created from the live portfolio.

### `PATCH /api/portfolios/<portfolio_slug>/editor/`

- **Request body (JSON):** Optional top-level: `title`, `description`, `privacy`, `password`. Optional `pages`: array of page objects; each may include `id`, `title`, `description`, `layout`, `media_shape`, `media_shape_2`, `title_2`, `description_2`, `order`. Page `id` can be integer (existing) or omitted/new (create). Omitting a page id or sending a non-integer id creates a new page. Pages not in the list are deleted. Order is normalized to 0, 1, 2, ...
- **Success:** `200` — Full draft payload (same as GET).
- **Errors:** `400` validation (e.g. invalid privacy or layout).

### `POST /api/portfolios/<portfolio_slug>/editor/pages/`

- **Request body:** Optional `title`, `description`, `layout`. Default layout: `layout-1`. New page appended at end of order.
- **Success:** `201` — Created page (PageEditorSerializer): id, title, description, order, layout, media_*, etc., with media as URLs.

### `GET /api/portfolios/<portfolio_slug>/editor/pages/<page_id>/`

- **Response:** `200` — Single draft page (same shape as in GET editor).

### `PATCH /api/portfolios/<portfolio_slug>/editor/pages/<page_id>/`

- **Request:** JSON and/or FormData. Fields: title, description, layout, media_shape, media_shape_2, title_2, description_2. For image uploads send `media_image` and/or `media_image_2` as files.
- **Success:** `200` — Updated page (same shape as GET).

### `DELETE /api/portfolios/<portfolio_slug>/editor/pages/<page_id>/`

- **Success:** `204` No Content. Page order is normalized after delete.

### `PATCH /api/portfolios/<portfolio_slug>/editor/reorder/`

- **Request body:** `{ "page_ids": [ id1, id2, ... ] }` — draft page IDs in desired order.
- **Success:** `200` — `{ "page_ids": [ ... ] }` in new order. Unlisted or invalid IDs are skipped.

### `POST /api/portfolios/<portfolio_slug>/editor/publish/`

- **Request:** No body.
- **Success:** `200` — Live portfolio (PublicPortfolioSerializer) after copying draft → live (title, description, privacy, hashed password, pages and media). Draft’s `has_unpublished_changes` set to false.
- **Errors:** `500` with `detail` if publish fails.

---

## 4. My (authenticated) — `/api/my/`

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/my/profile/` | Get full profile |
| PATCH | `/api/my/profile/` | Update profile (FormData for files) |
| GET | `/api/my/hashtags/` | List user hashtags |
| POST | `/api/my/hashtags/add/` | Add hashtag |
| DELETE | `/api/my/hashtags/<id>/` | Remove hashtag (UserHashtag id) |
| GET | `/api/my/portfolios/` | List my portfolios |
| POST | `/api/my/portfolios/` | Create portfolio |
| GET | `/api/my/portfolios/<slug>/` | Get my portfolio |
| PATCH | `/api/my/portfolios/<slug>/` | Update portfolio |
| DELETE | `/api/my/portfolios/<slug>/` | Delete portfolio (+ draft) |
| GET | `/api/my/saves/` | List saved artists and portfolios |
| POST | `/api/my/saves/artists/<artist_slug>/` | Save artist |
| DELETE | `/api/my/saves/artists/<artist_slug>/` | Unsave artist |
| POST | `/api/my/saves/portfolios/<artist_slug>/<portfolio_slug>/` | Save portfolio |
| DELETE | `/api/my/saves/portfolios/<artist_slug>/<portfolio_slug>/` | Unsave portfolio |

### `GET /api/my/profile/`

- **Response:** `200` — Full profile (ProfileWriteSerializer fields) plus `first_name`, `last_name`, `avatar_url`, `banner_image_url`, `resume_url`. Includes contact URLs, contact_order, colors (background_color, foreground_color, text_color, accent_color), font_family, theme. Avatar from User.avatar or profile fallbacks; banner and resume from Profile.

### `PATCH /api/my/profile/`

- **Request:** JSON and/or FormData. All profile fields optional (partial update). Files: `avatar` (User), `banner_image`, `resume_file` (PDF only). To remove resume: `remove_resume: true`.
- **Success:** `200` — Updated profile (same shape as GET). Validation: contact fields must not contain phone numbers; colors must be hex e.g. `#faf7f2`; font_family must be in allowed list (see api/serializers.py).
- **Errors:** `400` — e.g. non-PDF resume, invalid hex, invalid font.

### `GET /api/my/hashtags/`

- **Response:** `200` — `[ { "id": <UserHashtag id>, "name": "<hashtag name>" }, ... ]` ordered by created_at.

### `POST /api/my/hashtags/add/`

- **Request body:** `{ "name": string }`. Name normalized (strip `#`, special chars; letters, numbers, spaces kept). Stored lowercase.
- **Success:** `201` — `{ "id": <UserHashtag id>, "name": "<hashtag name>" }`
- **Errors:** `400` — empty name, over limit (5), or duplicate hashtag for user.

### `DELETE /api/my/hashtags/<id>/`

- **Path:** `id` = UserHashtag primary key (integer).
- **Success:** `204` No Content. **Errors:** `404` if not user’s hashtag.

### `GET /api/my/portfolios/`

- **Response:** `200` — Array of portfolios (PortfolioSerializer): id, user, title, privacy, order_index, pages_count, created_at, updated_at, slug. Ordered by order_index, id.

### `POST /api/my/portfolios/`

- **Request body:** `{ "title": string, "privacy": "draft" | "private" | "public" (optional, default "private") }`. Slug may be generated from title.
- **Success:** `201` — Created portfolio (same shape as list).

### `GET /api/my/portfolios/<slug>/` — `PATCH` / `DELETE`

- **GET:** `200` — Single portfolio (same shape).
- **PATCH:** Partial update (e.g. title, privacy). `200` — updated portfolio.
- **DELETE:** `204`. Deletes live portfolio and associated draft if present.

### `GET /api/my/saves/`

- **Query:** `sort=recent` (default) or `sort=alpha`; `q=<term>` to filter by display_name, title, or location (artists) or portfolio title (portfolios).
- **Response:** `200` — `{ "artists": [ ... ], "portfolios": [ ... ] }`
  - **artists:** id, artist_slug, display_name, title, location, avatar_url, background_color, text_color, accent_color, created_at.
  - **portfolios:** id, portfolio_slug, portfolio_title, artist_slug, artist_display_name, cover_image_url, background_color, text_color, accent_color, created_at.

### `POST /api/my/saves/artists/<artist_slug>/` — `DELETE`

- **POST:** `201` Saved, `200` Already saved. **Errors:** `400` Cannot save your own profile.
- **DELETE:** `204` if removed, `404` if not saved.

### `POST /api/my/saves/portfolios/<artist_slug>/<portfolio_slug>/` — `DELETE`

- Only public or private portfolios (no draft). **POST:** `201`/`200`. **Errors:** `400` Cannot save your own portfolio. **DELETE:** `204`/`404`.

---

## 5. Themes — `/api/themes/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/themes/` | No | List active themes |

- **Response:** `200` — Array of themes. Each: id, key, name, version, is_active, css_vars_json, assets_manifest, preview_s3_key, svg_url, preview_url (svg_url and preview_url are absolute media URLs).

---

## 6. Help — `/api/help/`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/help/` | Yes | Send help/feedback email |

- **Request body:** `message` (required), `subject` (optional), `email` (optional reply-to).
- **Success:** `200` — `{ "detail": "Message sent successfully." }`
- **Errors:** `400` message missing or length &gt; 5000; `500` send failure.

---

## 7. Enums and constants (backend)

- **Privacy:** `draft`, `private`, `public`
- **Portfolio layout (page):** `layout-1` (current single layout value; see portfolios/models.PortfolioPageLayout)
- **Media shape:** `1:1`, `9:16`, `16:9`, `4:5`, `5:4`, `21:9`
- **Hashtag limit:** 5 (enforced in my/hashtags/add)
- **Allowed fonts (profile):** Inter, DM Sans, Space Grotesk, Plus Jakarta Sans, Space Mono, Chakra Petch, Sora, Poppins, Bebas Neue, Orbitron, Playfair Display, Fraunces, Exo, Unbounded, IBM Plex Mono, Raleway

---

## 8. Not implemented (PRD / future)

- **Categories:** `GET /api/artists/categories/` and `GET /api/artists/categories/<category_value>/` are not implemented in the backend.
- **Subscription/billing:** Stripe checkout, webhooks, and tier enforcement are not covered in this spec; see PRD and ARCHITECTURE for env vars and flow.
- **Comment delete by owner:** Only comment author can delete; PRD mentions “author or portfolio owner” — owner delete is not implemented.

---

## 9. Media upload paths (reference)

From ARCHITECTURE.md:

| Path | Content |
|------|---------|
| `avatars/` | User avatar images |
| `banners/` | Profile banner images |
| `resumes/` | Resume PDFs (one per user) |
| `portfolio_pages/` | Live page media |
| `draft_portfolio_pages/` | Draft page media |
| `themes/svg/`, `themes/previews/` | Theme assets |

---

*Last updated from backend code and docs. For auth flow, CORS, and deployment, see [ARCHITECTURE.md](./ARCHITECTURE.md). For product behavior and tier limits, see [PRD.md](./PRD.md).*
