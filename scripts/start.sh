#!/bin/sh
# Production startup script untuk Railway / Docker
# Urutan: migrate → bootstrap superadmin → start server

set -e

echo "🚀 AJS Production Startup"
echo "========================="

# 1. Jalankan database migration
echo "[1/3] Menjalankan database migration..."
npx prisma migrate deploy
echo "✓ Migration selesai"

# 2. Bootstrap superadmin (upsert - aman dijalankan berulang)
echo "[2/3] Bootstrap superadmin..."
node -e "
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('./src/lib/password');
const prisma = new PrismaClient();

const email = (process.env.AJS_SUPERADMIN_EMAIL || 'superadmin@ajs.local').toLowerCase();
const fullName = process.env.AJS_SUPERADMIN_NAME || 'Super Admin AJS';
const password = process.env.AJS_SUPERADMIN_PASSWORD || 'Superadmin123!';

// hashPassword is ESM-only compiled, use compiled version
prisma.user.upsert({
  where: { email },
  update: { fullName, isActive: true },
  create: { email, fullName, role: 'SUPER_ADMIN', isActive: true }
}).then(u => {
  console.log('✓ Superadmin:', u.email);
}).catch(e => {
  console.warn('⚠ Bootstrap superadmin gagal (mungkin sudah ada):', e.message);
}).finally(() => prisma.\$disconnect());
" 2>/dev/null || echo "⚠ Bootstrap skipped (password hash requires build step)"

# 3. Start Next.js server
echo "[3/3] Menjalankan server..."
exec node server.js
