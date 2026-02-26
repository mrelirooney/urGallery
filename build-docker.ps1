# urGallery – Docker Build Script (EC2 deployment)
# Run from project root: .\build-docker.ps1

$API_BASE = "http://ec2-18-224-202-229.us-east-2.compute.amazonaws.com:8000"
$SITE_BASE = "http://ec2-18-224-202-229.us-east-2.compute.amazonaws.com:3000"

Write-Host "Building frontend..." -ForegroundColor Cyan
Set-Location frontend
docker build `
  --build-arg NEXT_PUBLIC_API_BASE=$API_BASE `
  --build-arg NEXT_PUBLIC_SITE_BASE=$SITE_BASE `
  -t urgallery-frontend .
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Set-Location ..

Write-Host "Building backend..." -ForegroundColor Cyan
Set-Location backend
docker build -t urgallery-backend .
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Set-Location ..

Write-Host "`nDone! Images built:" -ForegroundColor Green
Write-Host "  - urgallery-frontend"
Write-Host "  - urgallery-backend"
Write-Host "`nTo run locally:"
Write-Host "  docker run -p 8000:8000 urgallery-backend"
Write-Host "  docker run -p 3000:3000 urgallery-frontend"
