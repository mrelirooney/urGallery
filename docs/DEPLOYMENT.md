# urGallery – Production Deployment

## Quick Build (EC2)

**Current EC2 URLs** (API :8000, Site :3000):

```powershell
# Windows (PowerShell) – from project root
.\build-docker.ps1
```

```bash
# Linux/Mac – from project root
chmod +x build-docker.sh
./build-docker.sh
```

Or manually:

```bash
# Frontend
cd frontend
docker build \
  --build-arg NEXT_PUBLIC_API_BASE=http://ec2-18-224-202-229.us-east-2.compute.amazonaws.com:8000 \
  --build-arg NEXT_PUBLIC_SITE_BASE=http://ec2-18-224-202-229.us-east-2.compute.amazonaws.com:3000 \
  -t urgallery-frontend .

# Backend
cd backend
docker build -t urgallery-backend .
```

---

## Frontend

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE` | Yes (build) | Backend API URL (for client-side fetches) |
| `NEXT_PUBLIC_SITE_BASE` | Yes (build) | Frontend site URL |
| `DJANGO_BASE_URL` | Yes (runtime) | Backend URL for server-side fetches. In Docker Compose, use `http://backend:8000` so the frontend container can reach the backend on the internal network. |
| `NEXT_PUBLIC_APP_VERSION` | No | Version string (default: `0.0.0`) |

### Non-Docker Build

```bash
cd frontend
npm ci
npm run build
npm start
```

### Docker

The frontend image uses Next.js `output: "standalone"` for a minimal production bundle.

---

## Backend

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_API_BASE` | Yes (Docker) | Base URL the browser uses to reach the API (e.g. `http://localhost:8000` or `https://api.yourdomain.com`). Used for avatar, banner, and theme media URLs so they load in the browser. |
| `SERVE_MEDIA` | For local Docker | Set to `true` when `DEBUG=False` to serve uploaded media (avatars, banners). In production, use nginx or a CDN instead. |

### Static Files (Django Admin)

The backend uses **WhiteNoise** to serve static files (Django admin CSS/JS). Ensure `collectstatic` runs at startup (Docker Compose does this automatically). For production, you may use nginx or a CDN instead.

### Checklist

- Has CORS configured for your production frontend origin
- Serves media files (or uses S3/CDN) with correct URLs
