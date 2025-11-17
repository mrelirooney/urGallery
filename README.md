🎨 urGallery – Version 0 (MVP)

urGallery is a portfolio-builder made for artists and creators who want to show their work beautifully — without touching code.
This version focuses on rock-solid artist profiles and flexible portfolio pages with dynamic layouts.

🧩 Tech Stack
Layer	Tool	Purpose
Frontend	Next.js (React + TypeScript)	UI, routing, and rendering
Styling	Tailwind CSS	Utility-first, responsive styling
Animations	Framer Motion	Smooth artist-page interactions
Backend	Django + DRF (Django REST Framework)	API, models, serialization
Database	PostgreSQL	Persistent storage
Auth	JWT (SimpleJWT)	Secure access + refresh tokens
Storage	Django Media Files (Pillow)	Portfolio images & avatars
CORS	django-cors-headers	Frontend ↔ Backend communication
Version Control	GitHub	Repo + project history
⚙️ Backend Progress

✅ Django project structured cleanly
✅ accounts, artists, and portfolios apps connected
✅ Slugs enabled for artists & portfolios
✅ JWT authentication functional
✅ CORS configured + working with Next.js
✅ Media upload system working in Django Admin
✅ Models migrated (User, Profile, Portfolio, Page, PageMedia)
✅ REST API endpoints serving correct JSON
✅ Portfolio → Page → Media relationships complete

Big Wins:

Portfolio JSON dynamically delivers page layouts & media

Frontend successfully loads media from backend

Page ordering + media shape support included

🧱 Backend Models Overview
Model	Purpose
User	Email-based authentication
Profile	Display name, title, bio, location, avatar
Portfolio	Linked to a user; title, slug, ordering
Page	Linked to portfolio; layout, order, title, description
PageMedia	Image or asset for a page; tracks media shape
🖥️ Frontend Progress

✅ Next.js + Tailwind fully configured
✅ Artist Landing Page implemented

Header animation on scroll

Avatar + display name + title + bio + location

Portfolio section integrated
✅ Dynamic routing:

/artist/[slug]

/artist/[slug]/portfolio/[portfolioSlug]
✅ PageRenderer system built

Generates layouts dynamically

Reads data directly from API

Media + text primitives in place

Page numbers + arrow navigation working
✅ MediaSlot supports aspect ratios:
1:1, 4:5, 5:4, 9:16, 16:9
✅ Pagination fixed to bottom of wrapper

Component Highlights:

PortfolioWrapper – handles API fetching + pagination

PageRenderer – core dynamic layout engine

PageInfo / PageTitle / PageDescription – text primitives

MediaSlot – responsive image system

Pagination – page navigation UI

🔒 Security & Auth

JWT access + refresh token flow

CORS locked down to dev origins

Django ORM & permission-safe architecture

Planned: email verification + password reset

🗂️ Component Architecture (Current)
components/
 ├── artist/
 │   └── ArtistHeader.tsx
 ├── portfolio/
 │   ├── PortfolioWrapper.tsx
 │   ├── PageRenderer.tsx
 │   ├── MediaSlot.tsx
 │   ├── PageInfo.tsx
 │   ├── Pagination.tsx
 │   └── primitives/
 │       ├── PageTitle.tsx
 │       ├── PageDescription.tsx
 │       └── PortfolioTitle.tsx
 └── layout/
     └── BaseTwoBoxes.tsx

📈 Next Steps (Backend)

Add editing endpoints for:

Create Portfolio

Add pages

Upload media via API

Add permissions + privacy controls

Add URL validation for social links

Add theme system for artists

📈 Next Steps (Frontend)

Build Portfolio Editor (big next feature)

Add:

Add Page

Edit Page

Upload Media

Reorder Pages

Add layout selection UI

Work on mobile responsiveness

Clean up animation transitions

🚀 V0 Goal

A creator can:

Visit an artist page

View their portfolio

Flip through pages

See media + text arranged cleanly

Share their public link

V0 is about presentation, stability, and the foundation for editing tools.

🌟 Milestone Log
Status	Milestone
✅	Artist profile fetch + display
✅	Portfolio JSON fetch working
✅	PageRenderer hooked to backend
✅	Media displayed from Django
✅	Pagination fully functional
⚙️	Layout editor (coming next)
⚙️	Portfolio CRUD UI (coming next)