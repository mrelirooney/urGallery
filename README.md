# 🎨 urGallery – Version 0 (MVP)

**urGallery** is a portfolio builder made for artists and creators who want to look professional — without touching code.  
Built with simplicity, control, and community in mind.

---

## 🧩 Tech Stack

| Layer | Tool | Purpose |
|-------|------|----------|
| Frontend | **Next.js (React + TypeScript)** | UI + routing |
| Styling | **Tailwind CSS** | Fast, responsive design |
| Backend | **Django + DRF (Django REST Framework)** | API + data models |
| Database | **PostgreSQL** | Persistent storage |
| Auth | **JWT (DRF SimpleJWT)** | Login / Signup / Token auth |
| CORS | **django-cors-headers** | Frontend ↔ Backend communication |
| Storage | **AWS S3 + django-storages + Pillow** | Media uploads |
| Email | **SendGrid** | Password reset + verification |
| Hosting | **Vercel (frontend)** / **Render or EC2 (backend)** | Deployment |
| Version Control | **GitHub** | Repo + version history |

---

## ⚙️ Backend Progress

✅ Virtual environment + PostgreSQL set up  
✅ `accounts`, `portfolios`, `themes`, `notifications` apps connected  
✅ JWT authentication fully working  
✅ CORS tested and configured  
✅ Pillow + media model support added  
✅ Models migrated (User, Profile, Portfolio, Page, Theme, DefaultAvatar, etc.)  
✅ Django Admin customized + functional  
✅ REST API routes live under `/api/`  

**Extra Wins:**  
- User → Profile → Portfolio relationships solid  
- Slug fields active for both Profiles and Portfolios  
- Media handling (avatars + static images) now functional locally  
- Constraints added for page order + media uniqueness  

---

## 🧱 Backend Models Overview

| Model | Description |
|--------|--------------|
| **User** | Custom user w/ email login (no usernames) |
| **Profile** | FK→User; display name, title, bio, location, avatar, socials |
| **Portfolio** | FK→User; title, privacy, order, cover_page |
| **Page** | FK→Portfolio; title, layout, order |
| **Media / PageMedia** | Linked assets w/ order index |
| **Theme** | User-selectable profile aesthetic options |
| **DefaultAvatar** | Pre-made profile avatars |
| **Notification** | (Future) app messages & alerts |

---

## 🖥️ Frontend Progress

✅ Next.js + Tailwind initialized  
✅ API connection verified through CORS  
✅ Login + Signup flow fully functional  
✅ Auth refresh updates Navbar instantly (no reloads)  
✅ Artist Landing Page live — fully connected to backend  
✅ Dynamic slugs for user pages (`/artist/[slug]`)  
✅ Profile section pulling name, title, location, bio, and avatar  
✅ Avatars served locally via `/media/avatars/`  

| ⚙️ **Portfolio slugs added (partial)** 
| Slug field created and migrated; auto-generation and public endpoint pending |

**Component highlights:**
- **ArtistHeader** – reusable profile display  
- **Container** – responsive layout wrapper  
- **Navbar** – dynamic auth display  
- **Auth components** – LoginCard, TextField, FormError, etc.  

---

## 🔒 Security & Auth

- JWT-based token system (access + refresh)  
- Secure `.env` handling for secrets  
- CORS locked to trusted origins  
- Django ORM protection + auth middleware  
- Planned: Email verification + password reset  

---

## 🗂️ Component Architecture (Current)

| Component | Purpose |
|------------|----------|
| **Button** | Reusable styled actions |
| **Input / Field** | Shared UI for forms |
| **Modal / AlertModal** | Universal pop-ups |
| **AvatarDisplay** | Profile & nav avatar logic |
| **Page / Portfolio** | Core artist content areas |
| **ArtistHeader** | Profile section on artist pages |

---

## 📈 Next Backend Steps

1. Finalize media upload flow (S3 or local for testing)  
2. Build Profile + Portfolio API endpoints for editing  
3. Add hashtags + filtering system  
4. Integrate email verification and password reset  
5. Test artist portfolio CRUD end-to-end  

---

## 🚀 V0 Goal

The goal for **Version 0** is simple:  
A creator can sign up, log in, build a profile, upload work, and share a clean public link — all without touching a line of code.

---

## 👥 Team Breakdown

| Role | Who | Focus |
|------|-----|-------|
| **Eli** | Frontend + partial backend | Design, flow, & usability |
| **MAP** | Backend + AWS setup | Infrastructure & API logic |
| **EH** | Design & themes | Color systems + layouts |

---

## 🌟 Recent Milestone Log

| Date | Milestone |
|------|------------|
| ✅ **Login flow fixed** | Navbar now updates instantly after login |
| ✅ **Signup fully functional** | Clean API connection to Django |
| ✅ **Slug system added** | Artist pages accessible via `/artist/[slug]` |
| ✅ **Avatar rendering** | Local `/media/avatars/` setup working |
| ✅ **Artist Landing Page** | Pulls profile data (name, title, location, bio) |
| ✅ **Portfolio + Page constraints** | Unique order + foreign key structure done |
| ✅ **Git milestone** | Frontend + backend both push cleanly to GitHub |

---

## 💬 Future Vision (V1+)

- User dashboards + analytics  
- Recruiter mode (find & contact artists)  
- Follower system + DMs  
- Paid tiers w/ premium layouts  
- AI auto-fill for portfolios  
- Template marketplace  

---

**urGallery V0 — built with love, patience, and too many console logs.**
