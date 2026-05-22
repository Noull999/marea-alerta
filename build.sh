#!/bin/bash
if [ -n "$DATABASE_URL" ]; then
  echo "Deploying database migrations..."
  npx prisma migrate deploy
else
  echo "Skipping migrations (no DATABASE_URL)"
fi
echo "Building Next.js..."
next build
