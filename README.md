🎨 urGallery – Version 0 (MVP)

urGallery is a portfolio-builder made for artists and creators who want to showcase their work beautifully — without touching code.
Version 0 focuses on rock-solid artist profiles, clean public portfolios, and now a fully functional Portfolio Editor that supports drafts, publishing, custom layouts, dynamic page ordering, and responsive media shapes.

🧩 Tech Stack
Layer	Tool / Framework	Purpose
Frontend	Next.js (React + TypeScript)	UI, routing, rendering
Styling	Tailwind CSS	Utility-first responsive styling
Animations	Framer Motion	Smooth interactions
Backend	Django + Django REST Framework (DRF)	API, models, serializers
Database	PostgreSQL	Persistent storage
Auth	JWT (SimpleJWT)	Secure access + refresh tokens
Storage	Django Media Files (Pillow)	Portfolio images
CORS	django-cors-headers	Frontend ↔ Backend communication
Version Control	GitHub	Repo + collaboration
⚙️ Backend Progress
✅ Core Django System

Clean project structure

accounts, artists, and portfolios apps fully connected

JWT auth fully functional

CORS configured with Next.js

Media file system working (upload → backend → frontend)

All migrations completed (User, Profile, Portfolio, DraftPortfolio, Page, DraftPage)

✅ Portfolio Data Model (Finalized)

Portfolio (live) and DraftPortfolio (editor copy)

Page and DraftPage with:

title, description

layout (media-left, media-top, etc.)

media_image

media_shape (1:1, 4:5, 16:9, etc.)

order

is_public

✅ Backend Features Completed

Draft and Live portfolio separation

Editor PATCH update logic (pages, layouts, media, shapes, order)

Publish endpoint copies draft → live

Slugs enabled for artists & portfolios

Portfolio JSON dynamically delivers layouts & media

Handles both relative & absolute image URLs

Improved serializers for editor + live views

🏆 Big Backend Wins

Full draft → publish pipeline

Live pages always reflect last published state

Draft editor never affects live view unless published

Image URLs consistently resolve in both environments

🖥️ Frontend Progress
🌟 Portfolio Editor (MVP Complete)
✔ Page & Content Editing

Edit page titles, descriptions, and media

Add new pages

Delete pages (with safeguard: cannot delete last page)

Reorder pages via thumbnail drag-and-drop

Live thumbnail selection auto-scrolls editor

✔ Layout + Media Shape System

LayoutPickerModal (media-left, media-right, media-bottom, centered, etc.)

ShapePickerModal (1:1, 4:5, 5:4, 9:16, 16:9)

Editor preview reactive to layout + shape

Live portfolio respects layout & shape after publish

✔ Draft vs Publish Workflow

Editor loads draft state

Save Draft → persists full editor state

Publish → copies draft → live portfolio

Live view never changes until you publish

Loading states + smart re-fetching built into wrappers

✔ Undo / Redo Engine

Works for text edits, layout changes, media changes, and page structure

Toolbar buttons

Keyboard shortcuts:

Undo: Ctrl+Z

Redo: Ctrl+Shift+Z

History persists during session

✔ Image Handling

Image uploads update preview

Live portfolios build correct media URLs

Works for both relative and absolute django paths

🌟 Artist Public Pages (Previously Completed)

Artist header (avatar, name, title, bio, location)

Animated hero header on scroll

Linked portfolios section

Clean responsive design

🌟 Public Portfolio Pages (Live View)

Dynamic routing:

/artist/[slug]

/[slug]/[portfolioSlug]

PageRenderer generates layouts dynamically

Pagination UI with clickable dots

Responsive media rendering via MediaSlot

PortfolioWrapper handles all fetch + state

🔒 Security & Auth

JWT access + refresh token system

Secure token handling from Next.js

Artist-only editing access

CORS locked to dev origins

Django permissions safe by default

(Future) Email verification + password reset

🗂️ Component Architecture (Updated)
components/
 ├── artist/
 │   └── ArtistHeader.tsx
 ├── portfolio/
 │   ├── PortfolioWrapper.tsx        // Live portfolio
 │   ├── PageRenderer.tsx            // Live + editor rendering
 │   ├── MediaSlot.tsx               // Live media display
 │   ├── PageInfo.tsx
 │   ├── Pagination.tsx
 │   ├── primitives/
 │   │     ├── PageTitle.tsx
 │   │     ├── PageDescription.tsx
 │   │     └── PortfolioTitle.tsx
 │   └── editor/
 │         ├── PortfolioEditorShell.tsx
 │         ├── EditorTopBar.tsx
 │         ├── LayoutPickerModal.tsx
 │         ├── ShapePickerModal.tsx
 │         ├── MediaSlot.tsx         // Editor version
 │         ├── PageRenderer.tsx      // Editor version
 │         └── hooks/
 │               ├── useHistory.ts
 │               └── useAuth.ts

📈 Next Steps (Backend)

Fix is_public persistence in editor + publish

Ensure PATCH includes privacy field

Improve image upload state normalization

Add server-side validation for layout + shape compatibility

Optional: add themes / color palettes

📈 Next Steps (Frontend)

Fix Privacy toggle sync with backend

Make Publish auto-save if draft isn't saved

Prevent “image flash then disappear” after upload

Improve layout previews visually in the editor

Add redirect after publish

Add better loading + error states

🚀 V0 Goal (Complete)

A creator can:

Visit an artist page

View their public portfolio

Flip through portfolio pages

Experience dynamic layouts

Read text + view images cleanly

Share a clean public link

Edit their portfolio through the full editor

Save drafts and publish live updates

V0 establishes stability, clarity, and the full foundation needed for V1’s AI-powered features.

🌟 Milestone Log (Updated)
Status	Milestone
✅	Artist profile fetch + display
✅	Portfolio JSON fetch working
✅	PageRenderer layout engine
✅	Media displayed from Django
✅	Pagination fully functional
✅	Draft/Live portfolio system
✅	Editor page CRUD
✅	Layout & shape picker
✅	Image uploads to backend
✅	Undo/redo system
⚙️	Privacy and publish polish
⚙️	Editor UI/UX refinement
⚙️	Final V0 QA