# urGallery — Product Requirements Document (MVP)

> Documents the current MVP state for backend/API rebuild reference. No code—Markdown only.
> See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical stack, auth, storage, and deployment.

---

## Product Overview

- **urGallery** is a portfolio platform for artists/creatives.
- Artists create profiles, customize appearance, and build multi-page portfolios.
- Portfolios are viewable at `/{artist_slug}` with `?portfolio=<portfolio_slug>` for a specific portfolio. Shared links scroll to the portfolio section first; user can scroll up to see the profile.

---

## Core Features

- User registration and login (email [or display name] + password). Registration form includes confirm password (passwords must match). Email format validation on registration (V1). **Forgot password** link on login page (mandatory V1).
- Artist profile with display name, title, location, bio, avatar, banner. Hashtags used for search/discoverability only (not displayed on profile). Optional resume upload (minimal V1).
- Multiple portfolios per user; each portfolio has multiple pages.
- Comments on portfolios: any user with access can post; portfolios receive, store, and display comments (all tiers).
- Draft-based editor: edits go to `DraftPortfolio`/`DraftPage`; publish copies to live `Portfolio`/`Page`.
- Privacy levels: `draft`, `private`, `public`. Private portfolios require a password; same URL for all.
- Artist search on homepage.
- Category section on homepage: browse artists by title and location (complements search for discovery).
- Explorer page: when a user searches for a type of artist, recommends portfolios from artists with similar job titles and niches.
- Save artists and portfolios: all users can save for later; no public metrics (not social-media-like). Saves page with chronological/alphabetical sort and search.
- Subscription tiers: Free, Pro, Premium (monthly billing via Stripe).
- Settings: profile, **Discoverability** (contact links, hashtags), **resume upload** (optional), customization (colors, theme, font), **Security** (change password, change email), billing (manage subscription, cancel, downgrade), help form.
- Public artist landing page with theme patterns, custom colors, and custom fonts.
- Admin analytics (admin users only): site-wide metrics (visitors, users, revenue, location, titles, portfolio counts) in Settings or dedicated admin route.

---

## Category Section (V1)

- **Purpose:** Browsable categories for discovery (e.g. recruiters/HR browsing by role or location). Complements search: search is for direct lookup; categories are for exploration.
- **Source data:** Derived from Profile `title` and `location`. Categories are the distinct values users have set (e.g. "Photographer", "Graphic Designer", "New York", "Los Angeles").
- **Homepage placement:** Category section on the home page—tiles, filters, or dropdowns. User selects a category to see artists in that bucket.
- **Featured section:** Premium accounts only. Pro excluded.
- **API:** List categories (by type: title vs location); list artists filtered by category. See Artists API.

---

## Explorer Page (V1)

- **Purpose:** When a user searches for a type of artist (e.g. "Photographer", "Graphic Designer"), the Explorer page recommends portfolios from artists with similar job titles and niches.
- **Flow:** User enters a search term on the homepage (or Explorer page) → lands on Explorer page with search results + a "Recommended for you" or "Similar artists" section showing portfolios from artists in the same niche/job title.
- **Source data:** Derived from Profile `title`, hashtags, and optionally `location`. Match search term to titles and hashtags; return artists with similar titles/niches; surface their public portfolios.
- **Placement:** Dedicated route (e.g. `/explore` or `/explore?q=photographer`). Can be reached from homepage search (submit → navigate to Explorer with results) or direct link.
- **UI:** Search bar at top; grid or list of portfolio cards (cover image, artist name, title, portfolio name). Click opens artist landing with that portfolio in view.
- **API:** `GET /api/artists/explore/?q=<term>` (or similar) returns recommended portfolios/artists filtered by job title and niche similarity. Complements existing search and category APIs.
- **All tiers.** Discovery is open to everyone.

---

## Comments — ✅ Implemented (laptop)

- **Scope:** Each portfolio can receive, store, and display comments. Available on all tiers (Free, Pro, Premium).
- **Who can comment:** Any authenticated user who has access to the portfolio (public = any logged-in user; private = users who have unlocked it).
- **Placement:** Slide-in panel from right (same z-index as portfolio menu); portal-rendered so it overlays footer/compact profile. Scroll lock via `overflow: hidden` on html/body.
- **Data:** Comment = author (user), portfolio, body, created_at. Author can delete own comments.
- **UI:** Chronological order (oldest at top, newest at bottom); list anchored at bottom, auto-scrolls to newest. Send button: transparent by default; Color #3 background + Color #2 icon on hover. Sign-in prompt for guests.

---

## Resume (minimal V1) — ✅ Implemented

- **What:** Optional resume upload (PDF). Users add a resume in Settings → Resume section.
- **Settings flow:** Resume section in Settings nav. Upload PDF; file selection shows "Selected: [filename].pdf — click Done to save." Cancel and Done buttons on all viewports (mobile, tablet, desktop). When uploaded, displays "Resume uploaded — [filename]" with Remove option.
- **Display:** "Resume" button on artist profile (near contact buttons; `rounded-xs`). Click opens modal with PDF viewer.
- **Modal:** Rendered via portal (above navbar); `z-index: 9999`; `rounded-xs`; body scroll locked while open; closes on backdrop click.
- **Technical:** Backend `X_FRAME_OPTIONS = "SAMEORIGIN"` for PDF iframe; `PUBLIC_API_BASE` empty so media URLs are relative; frontend normalizes localhost URLs for ngrok compatibility.
- **Storage:** `resumes/`; one file per user. Replace on re-upload.
- **All tiers.** Keep minimal for V1.

---

## Saves

- **What:** Save artists and/or portfolios for later. No follower/following count — keeps urGallery professional, not social-media-like.
- **Who:** All tiers (authenticated). Save button on artist profile and portfolio view.
- **Saves page:** List of saved artists and portfolios. Default sort: chronological (newest first). Optional: alphabetical. Search by artist name, portfolio name, title, location.
- **Privacy:** No one sees who saved what. No public "saved X times" metric.
- **Analytics (Pro/Premium only):** Owner sees "Your profile was saved X times" / "This portfolio was saved X times" in their analytics. No names, owner-only.

---

## Subscription Plans

- **Tiers:** Free, Pro, Premium. Names are price-agnostic so prices can be raised without renaming.
- **V1 pricing:** Free $0/mo, Pro $8/mo, Premium $15/mo. Monthly subscription model.
- **Provider:** Stripe. Subscriptions billed monthly. Stripe fee: 2.9% + $0.30 per successful charge.

### Tier storage

- User/Profile has `tier`: `free` | `pro` | `premium`. Default: `free`.
- Actual prices live in Stripe (Products + Prices). Backend stores Stripe Price IDs in config/env; tier is the source of truth for entitlements.

### Flow

1. User clicks upgrade (e.g. "Upgrade to Pro") → backend creates Stripe Checkout Session with Pro Price ID.
2. User completes payment on Stripe-hosted page → Stripe redirects back + sends webhook.
3. Backend handles `checkout.session.completed` (and subscription lifecycle webhooks) → updates `tier` in DB.
4. Webhooks are the source of truth; do not rely on redirect alone.

### Cancel / Downgrade

- **Unsubscribe (cancel):** User can cancel their subscription at any time. No more charges; access continues until the end of the current billing period, then tier reverts to `free`. Implement via Stripe Customer Portal or backend endpoint that cancels the subscription at period end.
- **Downgrade:** User can switch to a lower tier (e.g. Premium → Pro, or Pro → Free). Pro → Free = cancel. Premium → Pro = change subscription to Pro Price; proration handled by Stripe.
- **Settings placement:** Cancel/downgrade controls in Settings (e.g. "Manage subscription" or "Billing"). Link to Stripe Customer Portal for self-service, or in-app downgrade flow.
- **Transparency:** Clear messaging that cancellation stops future charges, access lasts until period end, and no hidden fees. Users should never feel locked in.

### Downgrade behavior (paid → Free)

- **Portfolios beyond Free limit:** When a user downgrades from Pro/Premium to Free, portfolios beyond the 1-portfolio Free limit are **preserved** (not deleted). They remain in the database and appear in the portfolio menu, but:
  - They are **blurred out** in the portfolio menu (owner sees them but cannot select or view them).
  - They are **unreachable** by any user (owner or visitors) until the user upgrades again. No direct links, no API access.
  - On upgrade, all portfolios become accessible again.
- **Layouts, themes, colors:** When downgrading from paid to Free, the profile and portfolio(s) revert to default Free options:
  - **Colors:** Revert to 1 of 9 preset color swatches (no custom profile, portfolio, or accent colors).
  - **Layouts:** Pages using Pro layouts revert to the nearest Free layout (or a default Free layout).
  - **Themes:** Revert to a default Free theme.
  - **Fonts:** Revert to limited Free font set.
  - Content (text, media) is preserved; only the styling/customization is downgraded.

### Price raises

- Create new Price in Stripe (e.g. Pro $10/mo).
- Update backend config to use new Price ID for new Checkout Sessions.
- Existing subscribers: grandfather at old price, or migrate via Stripe API (with notice).

### Tier features (V1)

**Free**
- 1 portfolio
- 6 GB storage per portfolio (6 GB total); 4K images, YouTube/Vimeo embeds, audio
- 9 pages per portfolio
- 3 hashtags max
- 24 layout options (fixed set)
- Limited fonts (9)
- **Colors:** Fixed to 1 of 9 preset color swatches only. No custom profile, portfolio, or accent colors—default color layout for their page unless they upgrade.
- urGallery branding on portfolio
- YouTube/Vimeo embeds only (no direct video uploads)
- No custom video backgrounds
- No private portfolios
- Basic analytics: total profile visits + total comments only (1 day, 1 week, 1 month; 30-day max display; no CSV/PDF; backend stores full history for upgrades)
- No search priority
- PDF exports allowed but with urGallery branding
- **Try-before-you-buy:** Free users can use Pro/Premium features (layouts, themes, colors, fonts) while editing profile or portfolio—with warnings—but cannot publish changes until they upgrade. See Editor Functionality.
- **Try-before-you-buy (editor):** Free users can browse and use Pro/Premium features (layouts, themes, colors, fonts) while editing profile or portfolio—but cannot publish changes that use them. See Editor Functionality.
- *Goal:* Let artists build something legit but feel the ceiling quickly.

**Pro** ($8/mo)
- 5 portfolios
- 12 pages per portfolio
- 5 hashtags max
- Search priority (boost in on-site search results)
- Category visibility boost (more than Free)
- All layouts (ongoing access to new layouts as they're added)
- Full font library
- Full color picker (profile, portfolio, accent—choose any colors)
- Direct video uploads (up to 1080p; 4K auto-transcoded to 1080p)
- 10 GB storage per portfolio (50 GB total across 5 portfolios)
- Analytics
- Private portfolios
- Clean PDF exports (no urGallery branding)
- No urGallery branding on portfolio
- *Goal:* Most people upgrade here.

**Premium** ($15/mo)
- Everything in Pro, plus:
- Unlimited portfolios
- 15 pages per portfolio
- 10 hashtags max
- Search priority (boost in on-site search results)
- Category visibility boost (more than Pro)
- Featured in category section (Premium only)
- Recruitment Mode (toggle off fancy backgrounds for corporate/recruiter viewing)
- Animated theme backgrounds
- Video theme backgrounds
- 25 GB storage per portfolio (250 GB cap total for entire profile)
- 4K video uploads
- More customization options
- Enhanced analytics (time on page, traffic trends, returning vs new visitors, scheduled monthly email report)
- Advanced design tools (Premium gets first access when released; see Future Features)
- *Goal:* Power user / serious artist.

### Hashtags & Search priority

- **Hashtag management (V1):** Settings → Discoverability. "Contact Links" sub-header above contact fields; "Hashtags" subsection below. Add up to 5 hashtags (fixed `#` prefix, submit on Enter or Add button). Normalize input (strip special chars, keep spaces); block duplicates. Hashtag boxes: `rounded-xs`, light-brown background, X to delete. API: `GET/POST /api/my/hashtags/`, `POST /api/my/hashtags/add/`, `DELETE /api/my/hashtags/<id>/`.
- **Search integration (V1):** Hashtags have weight in artist search but rank below name, display name, title, and location. Relevance tiers: 5=name starts with, 4=name contains, 3=title contains, 2=location/slug, 1=hashtag match, 0=no match. Multi-word hashtags (e.g. "after effects") match via name and slug.
- **Hashtag limits (tier):** Free 3, Pro 5, Premium 10. Relevance matters more than quantity.
- **Search priority:** Pro and Premium get an automatic boost in urGallery on-site search results. When relevance is similar, paid users appear higher. Free users have no boost.
- **Category visibility:** Pro users get more automatic visibility in category sections than Free; Premium gets more than Pro. Exact boost values TBD when category page is built.
- **Category featured section:** Premium accounts only. Pro excluded.

### Storage & video resolution

- **Free:** 6 GB per portfolio (6 GB total, 1 portfolio); 4K images, YouTube/Vimeo embeds, audio only.
- **Pro:** 10 GB per portfolio (50 GB total across 5 portfolios). Video up to 1080p; 4K uploads auto-transcoded to 1080p.
- **Premium:** 25 GB per portfolio, 250 GB cap total for entire profile. Video up to 4K.
- **Bandwidth:** Use Cloudflare R2 or Backblaze B2 + Cloudflare for media storage to minimize egress costs (free egress vs ~$0.09/GB on AWS).

### Recruitment Mode (Premium only)

- **What:** Toggle to turn off fancy backgrounds (animations, video backgrounds, etc.) for a clean, corporate-friendly view. For artists sharing with recruiters, HR, or corporate clients.
- **Who controls it:** Portfolio owner enables it; visitors see the simplified view when it's on.

### Analytics (Free vs Pro vs Premium)

**Free — minimal**
- Total profile visits and total comments only. Displayed for 1 day, 1 week, 1 month. Data shown only for last 30 days. No CSV or PDF. Backend stores full history for future upgrades; Free users see only these two metrics within the 30-day window.
- **Analytics page (Settings):** Most of the Analytics page is blurred for Free users. Only the two Free metrics (profile visits, comments) are visible. All other metrics (Pro/Premium) appear behind a blur overlay with "Upgrade to Pro to see this" (or similar). Optionally show blurred chart shapes or section headers so Free users see what they're missing without accessing the data.

**Pro — basic analytics**
- Profile visits (month to month)
- Unique profile visits
- Portfolio publishes per month (how many times they published a portfolio each month)
- Total pages across all portfolios (sum of pages in all their portfolios)
- Portfolio views: sum total, per portfolio, per page; historical data retained even if portfolio is deleted
- Page views: per page, per portfolio
- Comments metrics (e.g. comment count per portfolio, recent activity)
- Save count (how many users saved this profile/portfolio; owner-only)
- CSV export of basic metrics
- Processed PDF report (basic metrics only; mirrors dashboard data)

**Premium — advanced analytics**
- Everything in Pro, plus:
- Referrers (where traffic came from)
- Geography (country/region)
- Device breakdown (mobile vs desktop)
- Popular pages ranking
- Time on page (average time spent per page)
- Traffic trends (week-over-week, month-over-month comparisons)
- Returning vs new visitors
- CSV export of full metrics
- Processed PDF report (full metrics; charts, summaries, presentation-ready)
- Scheduled monthly email report (PDF delivered to inbox)

### Admin analytics (admin users only)

- **Purpose:** Site-wide metrics for platform admins. Only users with admin/staff privileges can access.
- **Placement:** Admin section in Settings (e.g. "Admin" or "Site analytics" nav item), or dedicated `/admin/analytics` route. Visible only when `user.is_staff` or equivalent.
- **Metrics:**
  - **Visitors:** Site-wide visitor counts (total, unique, by time period)
  - **Users:** Total users, paying users (Pro + Premium), non-paying users (Free)
  - **Location data:** User/visitor geography (country, region) aggregated
  - **Title data:** Distribution of artist titles (e.g. Photographer, Graphic Designer) across the platform
  - **Portfolio counts:** Total portfolios, portfolios per tier, pages per portfolio (aggregated)
  - **Total pages across all portfolios:** Sum of pages across all portfolios site-wide
  - **Total comments:** Site-wide comment count
  - **Save count:** Total saves (artists + portfolios) across the platform
  - **Device breakdown:** Mobile vs desktop (visitor/usage)
  - **Referrers:** Where traffic came from (sources, domains)
  - **Revenue:** Money generated per month (from Stripe); total revenue all-time
  - **Exports:** CSV export of basic metrics; processed PDF report
- **Data sources:** Django DB aggregates, Stripe API for revenue, analytics/telemetry for visitors. Consider OTEL or existing analytics pipeline.
- **API:** `GET /api/admin/analytics/` (or similar) — admin-only; returns aggregated metrics. Frontend renders charts/tables.
- **Access control:** Backend enforces `is_staff` or `is_superuser`; 403 for non-admins.

---

## User Accounts

- **User** (Django `AbstractUser`):
  - Email or Display Name as login. Email format validated on registration.
- **Security (Settings):**
  - Change password: requires current password; user cannot change without it.
  - Change email: requires current password; format validated.
  - Fields: `first_name`, `last_name`, `display_name`, `title`, `location`, `bio`, `avatar`, `banner`, `contacts`, `hashtags`.
- **Profile** (1:1 with User):
  - `slug` (unique, URL-safe; auto-generated from display name).
  - Public fields: `display_name` , `title`, `location`, `bio`.
    - (if `display_name` is blank, then the `first_name` + `last_name` becomes the `display_name`)
  - Avatar: `default_avatar` (FK) or `avatar_s3_key` or User.avatar.
  - `banner_image`.
  - `resume_file` (optional): uploaded PDF; stored in `resumes/`. If set, shown as "Resume" link on profile.
  - Social links: `website_url`, `instagram_url`, `twitter_url`, `behance_url`, `dribbble_url`, `youtube_url`, `tiktok_url`, `linkedin_url`, `twitch_url`, `email_contact`.
  - `contact_order` (JSON array) for ordering contact buttons.
  - Customization: `background_color`, `foreground_color`, `text_color`, `accent_color` (hex).
  - `font_family` (Google Font name).
  - `theme` (FK to Theme).
- **DefaultAvatar**: predefined avatar options (s3_key, label).

### Password Reset Flow (Implemented)

- **Forgot password** (`/forgot-password`): User enters email → backend sends reset link (or prints to console in local dev). Link format: `{FRONTEND_BASE_URL}/reset-password?uid={uid}&token={token}`. Token is unique per request; expires when password is changed.
- **Reset password** (`/reset-password`): User lands via email link with `uid` and `token` in query string. Form: email (optional, for records), new password, confirm password. Backend validates token, rejects if new password equals current password, then updates password. Success: "Your password has been changed" + Login button.
- **Email delivery:** Local dev uses `django.core.mail.backends.console.EmailBackend` (emails print to Django terminal). Production requires SMTP/SES configured via `EMAIL_BACKEND`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, etc.

---

## Portfolio System

- **Portfolio**:
  - `user` (FK), `title`, `slug` (unique per user and per portfolio).
  - `privacy`: `draft` | `private` | `public`.
  - `password` (hashed): required when `privacy` is `private`; used to unlock blurred content.
  - `order_index`, `pages_count`, `cover_page` (FK to Page).
- **DraftPortfolio** (editor workspace):
  - Mirrors Portfolio; `has_unpublished_changes` flag.
  - Slug matches live portfolio; created on first editor load.
- Publish flow: copy DraftPortfolio + DraftPages → Portfolio + Pages; media files copied to live upload paths.

---

## Portfolio Pages

- **Page** / **DraftPage**:
  - Text fields: `title`, `description`, `description_body`, `title_2`, `description_2`, `title_3`, `description_3`. Layouts use subsets of these.
  - `order`, `layout` (enum; see Layout System).
  - `media_image`, `media_shape` (1:1, 9:16, 16:9, 4:5, 5:4), `media_image_2`, `media_shape_2`.
- Pages ordered by `order`; `pages_count` auto-updated via signals.

---

## Layout System

- **Layout** = structure + accent treatment. Each layout option the user sees = one unique backend value.
- **Layout access by tier:** Free gets 24 layouts (fixed set). Pro and Premium get all layouts, including new ones as they're added.
- **Naming:** Backend uses `layout-1` through `layout-15`. The layout picker shows human labels with global numbering (e.g. `Layout 01` = `layout-1`, `Layout 08` = `layout-8`).

### Layout categories (picker UI)

Layouts are grouped in the editor **Layouts** panel:

| Category | Layouts | Notes |
|----------|---------|-------|
| **Media and Text** | `layout-1`, `2`, `3`, `4`, `5`, `6`, `9`, `11`, `13` | Default expanded category when current page layout is in this group |
| **Text Only** | `layout-8`, `14`, `15` | No primary media slot |
| **Media Only** | — | Placeholder: “Layouts Coming soon” (no selectable layouts yet) |

Excluded from picker: `layout-7`, `layout-10` (backend only); `layout-12` (implemented but hidden, WIP).

### Layout picker (editor UI)

- **Trigger:** “Layouts” button in the editor toolbar (`EditorTopBar`).
- **Panel:** Right slide-in drawer (same interaction pattern as Comments / Portfolio menu), not a centered modal. Close via backdrop click or Escape.
- **Panel chrome:** Background is off-black (`#11100e`) when the artist profile background is dark, off-white (`#faf7f2`) when profile background is light. Menu text uses contrasting off-white/off-black. Right-aligned title, categories, and options with extra right padding (`pr-8`).
- **Selection states:** Unselected options at 70% text opacity; hovered or current layout at 100% opacity. Hover row background = accent at 10% opacity; **current** layout row = accent at 20% opacity.
- **Hover preview:** Live preview of the current page content in the hovered layout, scaled to fit the area left of the panel (1280×720 virtual canvas + CSS `transform: scale`). Preview uses **portfolio section background color** (Color #2 / `text_color`), matching live portfolio and editor canvas—not profile background. Soft glow + thin border behind preview (off-white glow on dark overlay, off-black on light overlay; border at ~35% opacity, glow layers at low opacity).
- **Click:** Applies layout to the current page (PATCH draft page), closes panel.
- **Registry:** `layoutRegistry.ts` is the source of truth for categories, labels, and picker-visible layouts.
- **V1 soft launch:** Portfolio editing is desktop-first; layout picker preview is hidden below `sm` breakpoint.

### Layout types (backend `layout` field)

| Backend value | Structure |
|---------------|-----------|
| `layout-1` | Fixed frame – two equal panels, text left, image right (laptop); mobile: vertical stack (image → header → accent block) |
| `layout-2` | Image full height between accent bands, text overlay on image (tablet/laptop); mobile: media on top, text below, accent band right |
| `layout-3` | Full-bleed media, centered text + orange bar overlay, four corner accents |
| `layout-4` | Full-bleed two columns – left 1/3 accent (title, description, body), right 2/3 media |
| `layout-5` | Constrained frame – left text with L-shaped accent border, right media |
| `layout-6` | 25% / 75% split – left text, right vertical media strip; split bg (top transparent, bottom accent) |
| `layout-7` | (Backend only; frontend not implemented) |
| `layout-8` | Text only – centered accent block, title + line + description, four corner markers |
| `layout-9` | Full-bleed 60/40 split – left transparent + accent band (title, description), right media |
| `layout-10` | (Backend only; frontend not implemented) |
| `layout-11` | Full-bleed 67/33 split – left media, right 33% accent band with title + description |
| `layout-12` | Title above; tall accent band; image bottom-aligned left overlapping band; description below (60% width, right-aligned). Implemented; hidden in layout picker (WIP). |
| `layout-13` | Row 1: MASSIVE HEADER full width + left accent; Row 2: 60% image, 40% BIG HEADER + body + right accent |
| `layout-14` | Three equal columns – blocks 1 & 3 thin accent border, block 2 solid accent background; full bleed |
| `layout-15` | Two equal columns, both accent background; below lg: single full-width block with two sections + divider |

Refer to the mockups in urGallery/frontend/public/mockups for visuals of how the mockups look

### Media shape (separate field)

- `media_shape`: `1:1`, `9:16`, `16:9`, `4:5`, `5:4`.
- Same layout can use any shape; shape is a page-level property, not part of layout name.

### Media type (inferred from upload)

- Image, video, audio. User uploads file; type inferred. Same layout renders any media type.
- Exception: specialized layouts (e.g. `audio-player`) if rendering differs.

### Combinations

- 13 layouts in picker (layout-7, layout-10 backend-only; layout-12 implemented but hidden) × 5 shapes × 3 media types = many possible page configurations.
- Layout, shape, and media type are independent; combined in frontend.

---

## Theme System

- **Theme** model:
  - `key`, `name`, `description`, `version`, `is_active`.
  - `css_vars_json`, `assets_manifest`, `preview_s3_key`.
  - `svg_file` (upload), `preview_image` (upload).
- Profile links to Theme via `theme` FK.
- Serializer returns `svg_url`, `preview_url` for frontend.
- Profile can override with custom hex colors and `font_family`.

---

## Media Upload

- **Page media**: `media_image`, `media_image_2` on Page/DraftPage.
  - Upload paths: `portfolio_pages/` (live), `draft_portfolio_pages/` (draft).
- **Profile**: `banner_image` → `banners/`; User.avatar → `avatars/`; `resume_file` → `resumes/`.
- Upload via `FormData` PATCH to editor page endpoint; no separate media API.

### Media compression (photos & videos)

- **Purpose:** Compress photos and videos on upload so larger media don't bloat storage or bandwidth. Keeps the site performant and costs manageable.
- **Photos:** Resize and compress images on upload (e.g. max dimension 2048–4096px, JPEG/WebP at ~80–85% quality). Preserve aspect ratio. Store compressed version; original can be discarded or archived. Apply to portfolio page images, avatars, banners, theme previews.
- **Videos:** Transcode on upload per tier (see Storage & video resolution). Pro: 4K uploads auto-transcoded to 1080p. Free: no direct video uploads. Premium: 4K allowed. Use efficient codecs (e.g. H.264/H.265) and bitrate limits. Consider async processing (queue) for large uploads.
- **Implementation:** Backend processing on upload (Pillow/ImageMagick for images; FFmpeg or cloud transcoding for video). Optional: client-side pre-compression before upload to reduce transfer size.

---

## Editor Functionality

- **Entry**: `/{artist_slug}/{portfolio_slug}/edit` (authenticated, owner only).
- **Load**: GET `/api/portfolios/<portfolio_slug>/editor/` → DraftPortfolio + DraftPages (creates draft if missing).
- **Save draft**: PATCH same URL with `title`, `privacy`, `password` (if private), optional `pages` array.
- **Add page**: POST `/api/portfolios/<portfolio_slug>/editor/pages/`.
- **Update page**: PATCH `/api/portfolios/<portfolio_slug>/editor/pages/<page_id>/` (JSON or FormData for images).
- **Delete page**: DELETE same URL.
- **Reorder**: PATCH `/api/portfolios/<portfolio_slug>/editor/reorder/` with `page_ids` array.
- **Publish**: POST `/api/portfolios/<portfolio_slug>/editor/publish/`.
- Editor UI: portfolio toolbar (title + actions), horizontal page thumbnails, drag-and-drop reorder (dnd-kit), **layout picker panel** (categorized, hover preview—see Layout System), shape picker, privacy modal (includes share/copy-link), image upload per slot.
- **Desktop-first (V1 soft launch):** Portfolio editor and layout picker target laptop/desktop; mobile/tablet editing deferred.
- **Undo / Redo:** Undo and redo buttons in the editor toolbar. Track edit history (page content, layout, media, reorder, add/delete page) and allow stepping back/forward. Disable Undo when at oldest state, Redo when at newest. Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z or Ctrl+Y (redo).

### Free tier: Try-before-you-buy (editor & profile)

- **Pro feature access:** Free users can select and use Pro/Premium features while editing (layouts, themes, colors, fonts, etc.). They experience the full product during editing.
- **Warnings:** When a Free user selects a Pro/Premium feature, show a clear warning (tooltip, banner, or badge) that it is a Pro/Premium feature and that they must upgrade to publish.
- **Publish block:** When a Free user attempts to publish and has used any Pro/Premium feature, the site blocks the action and shows an upgrade modal: "Your portfolio/profile uses Pro features. Upgrade to Pro to publish." Include CTA to upgrade.
- **Backend:** Publish endpoint validates tier and feature usage; returns error with upgrade prompt when Free user tries to publish Pro-content.
- **Optional:** Pre-publish summary: "Your portfolio uses X Pro features. Upgrade to publish, or switch to Free features to publish now."

### Privacy

- **Public:** Anyone can view the portfolio at `/{artist_slug}/{portfolio_slug}`. No gate.
- **Private:** Same URL. Content is blurred until the visitor enters the correct password. Access is remembered for the session (or set duration) via token/cookie.
- All portfolios use the same link format; privacy only controls whether a password is required.
- **Portfolio toolbar:** The row under the compact profile that holds portfolio title and owner actions. Used on both the live page and the editor page for consistency.
- **Owner on live view:** Owner sees Edit button (only they can see it). Owner can also toggle public/private from the live portfolio view. Privacy toggle and Share button live in the portfolio toolbar next to the Edit button (e.g. globe/lock icon or switch). Same pattern as Edit—owner-only control, visible only when viewing their own portfolio.
- **Share:** Share feature appears in two places: (1) in the portfolio toolbar on the live view (Edit, Privacy, Share); (2) in the privacy modal on the editor page. Both offer copy-link / share options. Shareable link format: `/{artist_slug}?portfolio={portfolio_slug}#portfolio-shell` — opens the artist page with the portfolio section in view first.

---

## Public Portfolio Pages

- **Artist landing**: `/{artist_slug}` → profile section + portfolio section. Single page; both sections on one scrollable view.
- **Portfolio view**: Same page. Use `?portfolio=<portfolio_slug>` (and optionally `#portfolio-shell`) to show a specific portfolio. Portfolio section appears below the profile.
- **Shared portfolio links**: When a user opens a shared link (e.g. `/{artist_slug}?portfolio={portfolio_slug}` or `/{artist_slug}?portfolio={portfolio_slug}#portfolio-shell`), the page scrolls to the portfolio section so the portfolio is shown first. The user can scroll up to see the profile, or scroll back down to the portfolio. Legacy `/{artist_slug}/{portfolio_slug}` URLs redirect to `/{artist_slug}?portfolio={portfolio_slug}#portfolio-shell`.
- **Portfolio switching:** When the user selects another portfolio from the portfolio menu (hamburger → menu → click portfolio title), the portfolio section updates in place. The page does not scroll or jump; only the portfolio content changes. URL updates via `?portfolio=<portfolio_slug>`.
- **Visibility:** Owner sees all their portfolios (draft, private, public). Visitors see public portfolios; private portfolios appear in the list but require password to view.
- **Private portfolios:** Blurred content + password prompt until visitor enters correct password. Access remembered via token/cookie.
- **Owner controls on live view:** Edit button, privacy toggle (public/private), and Share button in the portfolio toolbar, next to each other; visible only to owner.
- **Resume link:** If profile has `resume_file`, show "Resume" link (e.g. near contact buttons). Click opens modal with PDF viewer.
- Components: `ArtistHeader`, `PortfolioSelector`, `PortfolioWrapper`, `PageRenderer`, `Pagination`, `Comments` (or similar), `ThemePatternLayer`, `ColorThemeSetter`, `GoogleFontsLoader`.

---

## Data Models

| Model | Key Fields |
|-------|------------|
| **User** | email, first_name, last_name, display_name, title, location, bio, avatar |
| **Profile** | user (1:1), slug, tier (free\|pro\|premium), display_name, title, location, bio, default_avatar, avatar_s3_key, banner_image, resume_file, social URLs, contact_order, hashtags (via user), background_color, foreground_color, text_color, accent_color, font_family, theme |
| **DefaultAvatar** | s3_key, label |
| **Portfolio** | user, title, slug, privacy, password (hashed, for private), order_index, pages_count, cover_page |
| **Comment** | portfolio, user (author), body, created_at |
| **SavedArtist** | user (saver), profile (saved), created_at |
| **SavedPortfolio** | user (saver), portfolio (saved), created_at |
| **Page** | portfolio, title, description, description_body, order, layout, media_image, media_shape, media_image_2, media_shape_2, title_2, description_2, title_3, description_3 |
| **DraftPortfolio** | user, slug, title, privacy, has_unpublished_changes |
| **DraftPage** | draft_portfolio, title, description, description_body, order, layout, media_image, media_shape, media_image_2, media_shape_2, title_2, description_2, title_3, description_3 |
| **Theme** | key, name, version, is_active, svg_file, preview_image, css_vars_json |
| **Media** | title, description, cover_image, file, external_url, owner |
| **PageMedia** | page, media, order (M2M-style) |
| **Hashtag** | name, slug |
| **UserHashtag** | user, hashtag |
| **Notification** | user, type, title, body, action_url, read_at |

---

## API Endpoints

**Slug convention:** `artist_slug` = profile/landing page identifier; `portfolio_slug` = specific portfolio identifier.

### Auth (`/api/auth/`)

| Method | Path | Description |
|--------|------|--------------|
| GET | `csrf/` | Set CSRF cookie |
| POST | `login/` | Login; sets access/refresh in HttpOnly cookies |
| POST | `refresh/` | Refresh token; updates cookies |
| POST | `register/` | Create account (email, password) |
| GET | `me/` | Current user + profile (slug, display_name, avatar_url, etc.) |
| POST | `logout/` | Clear auth cookies |
| POST | `change-password/` | Change password (authenticated; body: `current_password`, `new_password`; requires current password) |
| POST | `change-email/` | Change email (authenticated; body: `new_email`, `current_password`; requires current password) |
| POST | `forgot-password/` | Request password reset; sends email with reset link (body: `email`) |
| POST | `reset-password/` | Complete password reset (body: `uid`, `token`, `new_password`); rejects if new password equals current password |

### Artists (`/api/artists/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `search/?q=<term>` | Search by display_name, title, location, slug, hashtags (weighted: name > title > location > hashtag); returns `{ results: [...] }` |
| GET | `explore/?q=<term>` | Explorer: recommended portfolios from artists with similar job titles/niches. Returns `{ results: [...], portfolios: [...] }` or similar for grid display. |
| GET | `categories/` | List categories (by type: `title` or `location`); returns `{ titles: [...], locations: [...] }` or similar |
| GET | `categories/<category_value>/` | List artists in category (filtered by title or location) |
| GET | `<artist_slug>/` | Artist landing: profile + portfolios (owner sees all; visitor sees public; private listed but locked) |
| GET | `<artist_slug>/portfolios/<portfolio_slug>/` | Portfolio detail (pages included); private returns metadata + blurred until password |
| POST | `<artist_slug>/portfolios/<portfolio_slug>/unlock/` | Validate password for private portfolio; returns access token |
| PATCH | `<artist_slug>/portfolios/<portfolio_slug>/privacy/` | Toggle public/private (owner only; for live-view toggle) |
| GET | `<artist_slug>/portfolios/<portfolio_slug>/comments/` | List comments (requires portfolio access) |
| POST | `<artist_slug>/portfolios/<portfolio_slug>/comments/` | Create comment (authenticated; requires portfolio access) |
| DELETE | `<artist_slug>/portfolios/<portfolio_slug>/comments/<id>/` | Delete comment (author or portfolio owner) |

### Portfolios (`/api/portfolios/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `<artist_slug>/` | Artist landing (alternate; profile + portfolios) |
| GET | `<artist_slug>/<portfolio_slug>/` | Portfolio detail (alternate); private returns blurred until password |
| GET | `<portfolio_slug>/editor/` | Load/create draft; return DraftPortfolio + DraftPages |
| PATCH | `<portfolio_slug>/editor/` | Save draft metadata + optional pages |
| POST | `<portfolio_slug>/editor/pages/` | Create draft page |
| GET/PATCH/DELETE | `<portfolio_slug>/editor/pages/<id>/` | Get/update/delete draft page (PATCH supports FormData for images) |
| PATCH | `<portfolio_slug>/editor/reorder/` | Reorder pages; body: `{ page_ids: [...] }` |
| POST | `<portfolio_slug>/editor/publish/` | Publish draft → live |

### My (authenticated) (`/api/my/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `profile/` | Current user's profile (full) |
| PATCH | `profile/` | Update profile; supports FormData for avatar, banner_image, resume_file |
| GET | `hashtags/` | List current user's hashtags |
| POST | `hashtags/add/` | Add hashtag (body: `{ name: "..." }`) |
| DELETE | `hashtags/<id>/` | Remove hashtag by UserHashtag id |
| GET | `portfolios/` | List user's portfolios |
| POST | `portfolios/` | Create portfolio |
| GET | `portfolios/<portfolio_slug>/` | Portfolio detail |
| PATCH | `portfolios/<portfolio_slug>/` | Update portfolio |
| DELETE | `portfolios/<portfolio_slug>/` | Delete portfolio + associated draft |
| GET | `saves/` | List saved artists and portfolios (authenticated) |
| POST | `saves/artists/<artist_slug>/` | Save artist (authenticated) |
| DELETE | `saves/artists/<artist_slug>/` | Unsave artist |
| POST | `saves/portfolios/<artist_slug>/<portfolio_slug>/` | Save portfolio (authenticated) |
| DELETE | `saves/portfolios/<artist_slug>/<portfolio_slug>/` | Unsave portfolio |

### Themes (`/api/themes/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `` | List active themes |

### Help (`/api/help/`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `` | Send help/feedback email (authenticated) |

### Admin (`/api/admin/`) — admin users only

| Method | Path | Description |
|--------|------|-------------|
| GET | `analytics/` | Site-wide metrics: visitors, total users, paying/non-paying users, location data, title distribution, portfolio counts, revenue per month, total revenue. Requires `is_staff` or `is_superuser`. |

### Search (Next.js API route)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/search?q=<term>` | Proxies to `/api/artists/search/?q=<term>` |

---

## Frontend Routes

| Path | Description |
|------|-------------|
| `/` | Home; hero logo + search + category section |
| `/explore` | Explorer page; `?q=<term>` for search. Recommended portfolios from artists with similar job titles/niches. |
| `/login` | Login form; **Forgot password** link (mandatory V1) |
| `/forgot-password` | Request password reset (email input); sends reset link; success message "Check your email" |
| `/reset-password` | Set new password (from email link); form: email, new password, confirm password; success: "Your password has been changed" + Login button; validates new ≠ current password |
| `/signup` | Registration (email, password, confirm password; validates passwords match) |
| `/signup/complete` | Post-signup profile completion |
| `/settings` | Settings (profile, **Discoverability**, customization, **Security**, billing, about, terms, privacy, help). Admin users also see Admin analytics section. |
| `/help` | Standalone help form; get help or send feedback to urGallery. |
| `/admin/analytics` | Admin-only: site-wide metrics (visitors, users, revenue, location, titles, portfolio counts). Optional dedicated route; can live under Settings. |
| `/saves` | Saved artists and portfolios (chronological/alphabetical, search) |
| `/{artist_slug}` | Artist landing (profile + portfolio section); `?portfolio=<portfolio_slug>` for specific portfolio |
| `/{artist_slug}/{portfolio_slug}` | Redirects to `/{artist_slug}?portfolio={portfolio_slug}#portfolio-shell` |
| `/{artist_slug}/{portfolio_slug}/edit` | Portfolio editor |
| `/about`, `/terms`, `/privacy` | Static pages |

---

## Environment / Config

- Key env vars: `NEXT_PUBLIC_API_BASE`, `HELP_EMAIL_RECIPIENT`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_PREMIUM`.
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for full config, CORS, CSRF, and deployment.

---

## Deployment & DevOps (Factory.ai)

- **Factory.ai** is used for agent-native software development and CI/CD. Droids (AI agents) can automate coding tasks, deployments, and maintenance. See [factory.ai](https://factory.ai) and [Factory docs](https://docs.factory.ai).
- **Repository:** Code is hosted on GitHub. Changes are pushed to GitHub for Factory to pick up.
- **Stack for deployment:** Next.js frontend (standalone), Django backend, PostgreSQL, Docker.
- **Docs for DevOps:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for env vars, Docker build, and production checklist. See [ARCHITECTURE.md](./ARCHITECTURE.md) for full technical stack.

### Pushing to GitHub

From the project root:

```bash
git status                    # Check what changed
git add .                     # Stage all changes (or git add <file> for specific files)
git commit -m "Your message"  # Commit with a descriptive message
git push origin main          # Push to GitHub (use 'master' if that's your default branch)
```

**New branch** (e.g. for Factory to review):
```bash
git checkout -b feature/your-branch-name
git add .
git commit -m "Description of changes"
git push -u origin feature/your-branch-name
```

First-time setup: `git remote add origin https://github.com/YOUR_ORG/urGallery.git` (if not already configured).

---

## MVP Implementation Status

| Feature | Status |
|---------|--------|
| Auth (login, register, forgot/reset password, change password, change email) | ✅ |
| Artist profile (display name, title, location, bio, avatar, banner) | ✅ |
| **Resume upload & display** | ✅ |
| Multiple portfolios per user | ✅ |
| Portfolio editor (draft-based, publish) | ✅ |
| Layout picker panel (categories, hover preview, scaled preview) | ✅ |
| Privacy levels (public, private with password) | ✅ |
| Artist search on homepage (incl. hashtag-weighted relevance) | ✅ |
| Public artist landing page (theme, colors, fonts) | ✅ |
| Settings (profile, **Discoverability** (contact links, hashtags), resume, customization, Security, help) | ✅ |
| Search result hover styling (background Color 3, text Color 2) | ✅ |
| Comments on portfolios | ✅ (laptop) |
| Category section (browse by title/location) | ⬜ |
| Explorer page (recommended portfolios by job title/niche) | ⬜ |
| Admin analytics (site-wide metrics for admin users) | ⬜ |
| Saves (save artists/portfolios, Saves page) | ✅ |
| Subscription tiers (Stripe billing) | ⬜ |
| **Hashtags** (Settings management + search integration) | ✅ |
| Tier-based limits (portfolios, pages, storage) | ⬜ |

**Remaining MVP features: 5** — Category section, Explorer page, Subscription/billing, Tier limits, Admin analytics.

Individual layout templates and mobile editor polish are still being refined ahead of June 15 soft launch.

---

## Future Features

### Near-term (V2)

- **Email verification (V2):** Send confirmation link; user clicks to verify. Reduces fake accounts, ensures deliverability.
- **2FA (V2):** TOTP (authenticator app); optional for users. Recovery codes.
- **Advanced design tools:** Premium gets first access when released.
- **Charts and Graphs:** Chart and graphic display for the portfolio pages to show off user's metrics to clients.
- **Mobile app (V2):** iOS and Android. Same API; native UI. Add when web is validated and resourced.

### Big Vision / Later Versions for Artists

- **Validating email addresses** when signing in
- **Grants and fellowship opportunities** — a place to host and discover them
- **Resources to grow your art business** — curated resources section
- **Monthly Art Challenges**
  - Add a "Challenge Gallery" tag so submissions can be browsed
  - Winners or highlights get featured on the homepage or newsletter
- **AI Auto-fill:** Upload multiple media → AI drafts portfolio pages
- **AutoCurate:** "Suggest better portfolio titles / rewrite my artist bio"
- **Gentle reminders:** e.g. "You haven't added anything new since January—want to upload your latest?"
- **Annual email or video summary**
- **Custom domain support** (CNAME + SSL)
- **Spanish i18n support** (UI strings only; user content stays as-is)
- **Subdomains:** username.urgallery.io (vanity URLs)
- **Domain sales** via registrar API
- **Notifications:** new views, comments, recruiter activity
- **Co-curation:** Artists invite others to co-curate a portfolio or create group pages
- **Monthly freebies:** mockups, LUTs, sound packs, brushes, etc.
- **"Summarize my portfolio into a grant application or resume paragraph"**
- **Inactivity outreach (60+ days):** "We miss your art. Here's a new challenge just for you." Optional coupon for next renewal
- **Proof of originality + duplicate detection**
- **"Verified by urGallery" badge** (visible; once ready for big tech integrations)

### Company / Jobs (V2)

- **Target:** Launch when artist base reaches ~10,000 users. Companies can post jobs; artists can discover and apply.
- **Tier names:** Basic, Pro, Premium (consistent with artist tiers).

**Basic** ($80/month)
- Post 2 jobs per month
- Job postings expire in 15 days
- Future ideas (maybe): Sell your work online; low quantities; little options

**Pro** ($150/month)
- Post up to 5 jobs per month
- Job postings expire in 30 days
- AI Profile Fetcher (results in 7 days)
- Analytics
- Future ideas (maybe): Sell your work online; mid quantities; mid options

**Premium** ($200/month)
- Post up to 8 jobs per month
- Job postings expire in 45 days
- Multiple people can connect to the same account
- AI Profile Fetcher (results in 3 days)
- More analytics
- Future ideas (maybe): Sell your work online; high quantities; high options
