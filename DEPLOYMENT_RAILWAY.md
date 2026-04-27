# Railway Deployment Flow AJS

Dokumen ini merangkum alur deploy AJS untuk fase hardening dan deployment.

## Tujuan

- Deploy aplikasi Next.js AJS ke Railway dengan Postgres.
- Menjalankan migrasi Prisma sebelum deployment aktif.
- Menyediakan endpoint readiness untuk healthcheck Railway.

## Konfigurasi yang Sudah Disiapkan

- `next.config.mjs` menggunakan `output: "standalone"`.
- `package.json` sudah memiliki:
  - `npm run build`
  - `npm run start`
  - `npm run db:migrate:deploy`
  - `npm run db:migrate:status`
  - `npm run ops:readiness`
- `railway.json` sudah menyiapkan:
  - `preDeployCommand`
  - `startCommand`
  - `healthcheckPath`
  - restart policy

## Variabel Environment Minimum

- `DATABASE_URL`
- `AUTH_SESSION_SECRET`
- `AJS_SUPERADMIN_EMAIL`
- `AJS_SUPERADMIN_NAME`
- `AJS_SUPERADMIN_PASSWORD`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SITE_URL`

## Endpoint Operasional

- Liveness: `/api/health`
- Readiness: `/api/readiness`

## Alur Deploy yang Disarankan

1. Commit schema dan migration Prisma ke repository.
2. Pastikan `DATABASE_URL` service AJS mengarah ke PostgreSQL Railway.
3. Jalankan build.
4. Jalankan pre-deploy migration dengan `npm run db:migrate:deploy`.
5. Railway menunggu `/api/readiness` memberi status `200`.
6. Setelah healthy, deployment baru menjadi aktif.

## Checklist Staging/Production

- Pastikan `prisma/migrations` ikut ter-commit.
- Jangan gunakan `prisma db push` di production.
- Gunakan `npm run db:migrate:status` untuk review status migration.
- Gunakan `npm run ops:readiness` untuk cek koneksi database dari environment target.
- Ganti `AUTH_SESSION_SECRET` dengan secret panjang yang tidak memakai nilai default development.
- Ganti `AJS_SUPERADMIN_PASSWORD` dari nilai default sebelum environment dibuka ke tim operasional.
