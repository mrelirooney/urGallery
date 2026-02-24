# urGallery – Production Deployment

## Frontend

### Environment Variables

Set these for production builds:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE` | Yes | Backend API URL (e.g. `https://api.yourdomain.com`) |
| `NEXT_PUBLIC_SITE_BASE` | Yes | Frontend site URL (e.g. `https://yourdomain.com`) |
| `NEXT_PUBLIC_APP_VERSION` | No | Version string shown in footer (default: `0.0.0`) |

### Build

```bash
cd frontend
npm ci
npm run build
npm start
```

### Docker

```bash
cd frontend
docker build \
  --build-arg NEXT_PUBLIC_API_BASE=https://api.yourdomain.com \
  --build-arg NEXT_PUBLIC_SITE_BASE=https://yourdomain.com \
  -t urgallery-frontend .
docker run -p 3000:3000 urgallery-frontend
```

The image uses Next.js `output: "standalone"` for a minimal production bundle.

### Backend

Ensure your Django backend:

- Has CORS configured for your production frontend origin
- Serves media files (or uses S3/CDN) with correct URLs
- Uses HTTPS in production
