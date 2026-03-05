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

- User registration and login (email [or display name] + password). Email format validation on registration (V1). **Forgot password** link on login page (mandatory V1).
- Artist profile with display name, title, location, bio, avatar, banner, hashtags. Optional resume upload (minimal V1).
- Multiple portfolios per user; each portfolio has multiple pages.
- Comments on portfolios: any user with access can post; portfolios receive, store, and display comments (all tiers).
- Draft-based editor: edits go to `DraftPortfolio`/`DraftPage`; publish copies to live `Portfolio`/`Page`.
- Privacy levels: `draft`, `private`, `public`. Private portfolios require a password; same URL for all.
- Artist search on homepage.
- Category section on homepage: browse artists by title and location (complements search for discovery).
- Save artists and portfolios: all users can save for later; no public metrics (not social-media-like). Saves page with chronological/alphabetical sort and search.
- Subscription tiers: Free, Pro, Premium (monthly billing via Stripe).
- Settings: profile, contact links, **resume upload** (optional), customization (colors, theme, font), hashtags, **Security** (change password, change email), billing (manage subscription, cancel, downgrade), help form.
- Public artist landing page with theme patterns, custom colors, and custom fonts.

---

## Category Section

- **Purpose:** Browsable categories for discovery (e.g. recruiters/HR browsing by role or location). Complements search: search is for direct lookup; categories are for exploration.
- **Source data:** Derived from Profile `title` and `location`. Categories are the distinct values users have set (e.g. "Photographer", "Graphic Designer", "New York", "Los Angeles").
- **Homepage placement:** Category section on the home page—tiles, filters, or dropdowns. User selects a category to see artists in that bucket.
- **Featured section:** Premium accounts only. Pro excluded.
- **API:** List categories (by type: title vs location); list artists filtered by category. See Artists API.

---

## Comments

- **Scope:** Each portfolio can receive, store, and display comments. Available on all tiers (Free, Pro, Premium).
- **Who can comment:** Any authenticated user who has access to the portfolio (public = any logged-in user; private = users who have unlocked it).
- **Placement:** Comments shown on the portfolio view (e.g. below portfolio content or in a comments section).
- **Data:** Comment = author (user), portfolio, body, created_at. Owner can moderate (delete/hide) if needed.

---

## Resume (minimal V1)

- **What:** Optional resume upload (PDF). Users can add a resume in Settings (Profile section).
- **Display:** "Resume" link on artist profile (e.g. near contact buttons). Click opens modal showing the PDF.
- **Storage:** `resumes/`; one file per user. Replace on re-upload.
- **All tiers.** Keep minimal for V1.

---

## Saves

- **What:** Save artists and/or portfolios for later. No follower/following count—keeps urGallery professional, not social-media-like.
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

### Price raises

- Create new Price in Stripe (e.g. Pro $10/mo).
- Update backend config to use new Price ID for new Checkout Sessions.
- Existing subscribers: grandfather at old price, or migrate via Stripe API (with notice).

### Tier features (V1)

**Free**
- 2 portfolios
- 6 GB storage per portfolio (12 GB total); 4K images, YouTube/Vimeo embeds, audio
- 9 pages per portfolio
- 3 hashtags max
- 24 layout options (fixed set)
- Limited fonts (5–10)
- Limited color palette (dropdown options)
- urGallery branding on portfolio
- YouTube/Vimeo embeds only (no direct video uploads)
- No custom video backgrounds
- No private portfolios
- Basic analytics: total profile visits + total comments only (1 day, 1 week, 1 month; 30-day max display; no CSV/PDF; backend stores full history for upgrades)
- No search priority
- PDF exports allowed but with urGallery branding
- *Goal:* Let artists build something legit but feel the ceiling quickly.

**Pro** ($8/mo)
- 5 portfolios
- 12 pages per portfolio
- 5 hashtags max
- Search priority (boost in on-site search results)
- Category visibility boost (more than Free)
- All layouts (ongoing access to new layouts as they're added)
- Full font library
- Full color picker
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
- Advanced themes
- Animated backgrounds
- Video theme backgrounds
- Unlimited PDF exports
- 25 GB storage per portfolio (250 GB cap total for entire profile)
- 4K video uploads
- More customization options
- Enhanced analytics (time on page, traffic trends, returning vs new visitors, scheduled monthly email report)
- Advanced design tools (Premium gets first access when released; see Future Features)
- *Goal:* Power user / serious artist.

### Hashtags & Search priority

- **Hashtag limits:** Free 3, Pro 5, Premium 10. Hashtags help on-site discoverability and SEO; relevance matters more than quantity.
- **Search priority:** Pro and Premium get an automatic boost in urGallery on-site search results. When relevance is similar, paid users appear higher. Free users have no boost.
- **Category visibility:** Pro users get more automatic visibility in category sections than Free; Premium gets more than Pro. Exact boost values TBD when category page is built.
- **Category featured section:** Premium accounts only. Pro excluded.

### Storage & video resolution

- **Free:** 6 GB per portfolio (12 GB total); 4K images, YouTube/Vimeo embeds, audio only.
- **Pro:** 10 GB per portfolio (50 GB total across 5 portfolios). Video up to 1080p; 4K uploads auto-transcoded to 1080p.
- **Premium:** 25 GB per portfolio, 250 GB cap total for entire profile. Video up to 4K.
- **Bandwidth:** Use Cloudflare R2 or Backblaze B2 + Cloudflare for media storage to minimize egress costs (free egress vs ~$0.09/GB on AWS).

### Recruitment Mode (Premium only)

- **What:** Toggle to turn off fancy backgrounds (animations, video backgrounds, etc.) for a clean, corporate-friendly view. For artists sharing with recruiters, HR, or corporate clients.
- **Who controls it:** Portfolio owner enables it; visitors see the simplified view when it's on.

### Analytics (Free vs Pro vs Premium)

**Free — minimal**
- Total profile visits and total comments only. Displayed for 1 day, 1 week, 1 month. Data shown only for last 30 days. No CSV or PDF. Backend stores full history for future upgrades; Free users see only these two metrics within the 30-day window.

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
  - Customization: `color_A`, `color_B`, `color_C` (hex).
  - `font_family` (Google Font name).
  - `theme` (FK to Theme).
- **DefaultAvatar**: predefined avatar options (s3_key, label).

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
  - Text fields: `massive_header`, `big_header`, `sub_header`, `description`. Some pages use all four; others use a subset.
  - `order`, `layout` (enum; see Layout System).
  - `media_image`, `media_video`, `media_audio`, `media_shape` (1:1, 9:16, 16:9, 4:5, 5:4, 21:9).
- Pages ordered by `order`; `pages_count` auto-updated via signals.

---

## Layout System

- **Layout** = structure + accent treatment. Each layout option the user sees = one unique backend value.
- **Layout access by tier:** Free gets 24 layouts (fixed set). Pro and Premium get all layouts, including new ones as they're added.
- **Naming:** Short, descriptive suffixes (e.g. `split-box`, `split-L`). No long technical names.

### Layout types (backend `layout` field)

| Backend value | UI label | Structure |
|---------------|----------|-----------|
| `split-box` | Split (box) | Text left (cream), orange lines + box accent; media right |
| `split-L` | Split (L) | L-shaped accent framing text; text left, media right |
| `split-panels` | Split (panels) | Vertical accent panels left and right; text in center |
| `split-accent` | Split (accent) | Orange left panel with text; media right |
| `split-media-left` | Split (media left) | Media left (narrow), text right (stacked) |
| `split-sidebar` | Split (sidebar) | Narrow sidebar left; large accent block right; no media |
| `split-band` | Split (band) | Media right; L-shaped text area with bottom band |
| `split-banner` | Split (banner) | Tall media left; horizontal band; text right |
| `split-stack` | Split (stack) | Left: header above media; right: text panel |
| `hero-corners` | Hero (corners) | Centered hero text; four corner accents; no media |
| `triple` | Triple | Three equal columns; middle has accent background |
| `double` | Double | Two text columns; no media |

### Media shape (separate field)

- `media_shape`: `1:1`, `9:16`, `16:9`, `4:5`, `5:4`, `21:9`.
- Same layout can use any shape; shape is a page-level property, not part of layout name.

### Media type (inferred from upload)

- Image, video, audio. User uploads file; type inferred. Same layout renders any media type.
- Exception: specialized layouts (e.g. `audio-player`) if rendering differs.

### Combinations

- 12 layouts × 6 shapes × 3 media types = 198 possible page configurations.
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
- **Theme**: `svg_file` → `themes/svg/`, `preview_image` → `themes/previews/`.
- Upload via `FormData` PATCH to editor page endpoint; no separate media API.

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
- Editor UI: portfolio toolbar (title + actions), horizontal page thumbnails, drag-and-drop reorder (dnd-kit), layout picker, shape picker, privacy modal (includes share/copy-link), image upload per slot.

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
| **Profile** | user (1:1), slug, tier (free\|pro\|premium), display_name, title, location, bio, default_avatar, avatar_s3_key, banner_image, resume_file, social URLs, contact_order, color fields, font_family, theme |
| **DefaultAvatar** | s3_key, label |
| **Portfolio** | user, title, slug, privacy, password (hashed, for private), order_index, pages_count, cover_page |
| **Comment** | portfolio, user (author), body, created_at |
| **SavedArtist** | user (saver), profile (saved), created_at |
| **SavedPortfolio** | user (saver), portfolio (saved), created_at |
| **Page** | portfolio, massive_header, big_header, sub_header, description, order, layout, media_image, media_shape, media_image_2, media_shape_2, |
| **DraftPortfolio** | user, slug, title, privacy, has_unpublished_changes |
| **DraftPage** | draft_portfolio, massive_header, big_header, sub_header, description, order, layout, media_image, media_shape, media_image_2, media_shape_2, |
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

### Artists (`/api/artists/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `search/?q=<term>` | Search by display_name, title, location, slug; returns `{ results: [...] }` |
| GET | `categories/` | List categories (by type: `title` or `location`); returns `{ titles: [...], locations: [...] }` or similar |
| GET | `categories/<category_value>/` | List artists in category (filtered by title or location) |
| GET | `<artist_slug>/` | Artist landing: profile + portfolios (owner sees all; visitor sees public; private listed but locked) |
| GET | `<artist_slug>/portfolios/<portfolio_slug>/` | Portfolio detail (pages included); private returns metadata + blurred until password) |
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

### Search (Next.js API route)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/search?q=<term>` | Proxies to `/api/artists/search/?q=<term>` |

---

## Frontend Routes

| Path | Description |
|------|-------------|
| `/` | Home; hero logo + search + category section |
| `/login` | Login form; **Forgot password** link (mandatory V1) |
| `/forgot-password` | Request password reset (email input); sends reset link |
| `/signup` | Registration |
| `/signup/complete` | Post-signup profile completion |
| `/settings` | Settings (profile, contact, customization, **Security**, billing, about, terms, privacy, help) |
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

## Future Features

### Near-term (V2)

- **Email verification (V2):** Send confirmation link; user clicks to verify. Reduces fake accounts, ensures deliverability.
- **2FA (V2):** TOTP (authenticator app); optional for users. Recovery codes.
- **Advanced design tools:** Premium gets first access when released.
- **Charts and Graphs:** Chart and graphic display for the portfolio pages to show off user's metrics to clients.
- **Mobile app (V2/V3):** iOS and Android. Same API; native UI. Add when web is validated and resourced.

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
