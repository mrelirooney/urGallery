#!/bin/bash
# urGallery – Docker Build Script (EC2 deployment)
# Run from project root: ./build-docker.sh

API_BASE="http://ec2-18-224-202-229.us-east-2.compute.amazonaws.com:8000"
SITE_BASE="http://ec2-18-224-202-229.us-east-2.compute.amazonaws.com:3000"

echo "Building frontend..."
cd frontend
docker build \
  --build-arg NEXT_PUBLIC_API_BASE="$API_BASE" \
  --build-arg NEXT_PUBLIC_SITE_BASE="$SITE_BASE" \
  -t urgallery-frontend . || exit 1
cd ..

echo "Building backend..."
cd backend
docker build -t urgallery-backend . || exit 1
cd ..

echo ""
echo "Done! Images built:"
echo "  - urgallery-frontend"
echo "  - urgallery-backend"
echo ""
echo "To run locally:"
echo "  docker run -p 8000:8000 urgallery-backend"
echo "  docker run -p 3000:3000 urgallery-frontend"
