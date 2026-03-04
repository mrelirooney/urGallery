# UAT Docker Checklist

## Switching Environments Step 9: DOCKER UAT (PROD-LIKE TEST)

**Purpose:** Run urGallery locally in a production-like configuration to catch Dev-vs-Prod issues early (auth cookies, CSRF, static/media, builds).

**Dev Environment:**
- Backend: `python manage.py runserver` (DEBUG=True)
- Frontend: `next dev`
- Looser rules, fast iteration

**UAT (Docker Prod-like):**
- Backend: DEBUG=False (gunicorn recommended)
- Frontend: `next build` + `next start` (production mode)
- Env vars mimic production values
- Intended to catch login/profile/save/upload issues BEFORE AWS

**UAT Required Checks:**
1. Backend starts with DEBUG=False
2. Frontend runs as a built app (not next dev)
3. API base URL points to backend container/service
4. Cookies are set and sent (credentials included)
5. CSRF token is present and write actions work
6. Static assets load correctly (no missing CSS/JS)
7. Media behavior is understood (local vs external storage)

**Notes:**
- Docker UAT should be run before pushing to Production.
- If login breaks in AWS, reproduce in Docker UAT first.

---

## Switching Environments Step 10: SMOKE TEST (UAT / PROD)

**Purpose:** A fast checklist to confirm the app works for real users after switching environments or deploying.

**Run this after:**
- Step 1–9 env switches are set
- Backend + Frontend are running in UAT/Prod mode

### AUTH (Login / Session)
- [ ] Visit site -> load landing without errors
- [ ] Log in successfully
- [ ] Refresh page -> still logged in
- [ ] Navigate to Profile -> loads correctly (no 401/403)
- [ ] Log out -> session clears correctly

### EDITOR (Core MVP Flow)
- [ ] Open Portfolio Editor
- [ ] Create or edit a page
- [ ] Save Draft -> persists after refresh
- [ ] Publish -> appears on live portfolio view
- [ ] Permissions correct (no random 403 on save/publish)

### MEDIA (Uploads / Display)
- [ ] Upload or attach an image/video (if enabled)
- [ ] Media displays in editor
- [ ] Media displays on live page
- [ ] No broken links / 404s for media

### SEARCH (If applicable)
- [ ] Search returns results
- [ ] Clicking result routes correctly
- [ ] No console errors

### STATIC / UI
- [ ] Tailwind styles load correctly (no unstyled page)
- [ ] No missing JS chunks (/_next/static/*)
- [ ] Images load (especially Next \<Image /> domains)

### ERROR CHECK (Quick)
- [ ] Open browser console -> no repeated errors
- [ ] Backend logs -> no repeated 500s
- [ ] Any auth calls include cookies (credentials/withCredentials)

**DONE CRITERIA:** If Auth + Editor + Static pass, the deploy is considered successful.
