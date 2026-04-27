# Dokumentasi Implementasi AJS

Dokumen ini dipakai sebagai catatan perubahan selama eksekusi project. Seluruh update mengacu ke [AJS_IMPLEMENTATION_PHASES.md](/Users/manbook/ajs/AJS_IMPLEMENTATION_PHASES.md) dan tidak keluar dari urutan phase yang sudah disepakati.

## Update 1 - Phase 0 Foundation Setup

Perubahan yang sudah dibuat:

- Menambahkan `package.json` untuk fondasi Next.js, Prisma, dan Zod.
- Menambahkan `tsconfig.json`, `next-env.d.ts`, `next.config.mjs`, `.gitignore`, dan `.env.example`.
- Menambahkan `prisma/schema.prisma` sesuai brief AJS.
- Menambahkan `prisma/seed.ts` untuk data demo awal.
- Menambahkan `src/lib/prisma.ts` dengan pola singleton untuk development.
- Menambahkan helper shared backend:
  - `src/lib/env.ts`
  - `src/lib/app-error.ts`
  - `src/lib/api-response.ts`
  - `src/lib/zod-error.ts`
  - `src/lib/handle-api-error.ts`
- Menambahkan fondasi App Router:
  - `src/app/layout.tsx`
  - `src/app/globals.css`

Catatan:

- Fokus update ini hanya Foundation Setup dan Shared Backend Layer awal, sesuai Phase 0 dan pintu masuk ke Phase 1.

## Update 2 - Phase 1 Shared Backend Layer

Perubahan yang sudah dibuat:

- Menambahkan `users` repository dan service untuk pengecekan user aktif.
- Menyiapkan `programs`, `batches`, `enrollments`, dan `attendance` repository/service agar route handler tetap tipis.
- Menambahkan validasi Zod per fitur:
  - `src/features/auth/auth.schema.ts`
  - `src/features/enrollments/enrollment.schema.ts`
  - `src/features/attendance/attendance.schema.ts`

Catatan:

- Layer ini dipakai sebagai fondasi modular untuk endpoint yang masuk pada phase berikutnya.

## Update 3 - Phase 2 sampai Phase 6 API Inti

Perubahan yang sudah dibuat:

- Menambahkan `POST /api/auth/magic-link` dengan alur dummy magic link.
- Menambahkan `GET /api/public/programs` untuk kebutuhan landing page publik.
- Menambahkan `POST /api/enrollment` dengan pengecekan batch terbuka, user aktif, duplicate enrollment, dan sisa kuota.
- Menambahkan `POST /api/attendance/scan` dengan validasi keterdaftaran peserta pada batch session terkait.
- Menjaga error handling tetap konsisten dengan `try/catch`, `ZodError`, `AppError`, dan Prisma unique constraint.

Catatan:

- Endpoint yang dibuat tetap berada di scope roadmap: auth, public data, enrollment, dan attendance.

## Update 4 - Phase 4 dan Phase 7 MVP Landing Page

Perubahan yang sudah dibuat:

- Menambahkan `src/app/page.tsx` sebagai landing page publik.
- Menambahkan `src/app/daftar/page.tsx` sebagai penghubung ke flow auth lalu enrollment.
- Menambahkan `src/features/landing-page/landing-page-client.tsx`.
- Menambahkan helper `src/features/landing-page/landing-page.service.ts`.
- Landing page mengambil data dari `GET /api/public/programs`.
- Section program, batch, harga, dan kuota sudah mengikuti data dari sistem informasi.

Catatan:

- Landing page saat ini fokus pada data operasional publik. Pengaturan konten non-operasional seperti hero text editable, FAQ, atau kontak admin panel belum ditambahkan karena itu masuk tahap lanjutan sesuai roadmap.

## Update 5 - Verifikasi Build dan Perapihan Type

Perubahan yang sudah dibuat:

- Membersihkan install dependency yang korup lalu melakukan install ulang secara bersih.
- Menjalankan generate Prisma client.
- Menjalankan build check Next.js.
- Memperbaiki type DTO pada `src/features/programs/program.types.ts` agar selaras dengan enum Prisma untuk `ProgramCategory` dan `BatchStatus`.

Catatan:

- Perapihan ini muncul langsung dari build verification dan tetap berada dalam scope phase implementasi yang sama.
- Build produksi berhasil untuk route publik, route API, dan halaman `/daftar`.

## Update 6 - Phase 3 Master Data Pelatihan

Perubahan yang sudah dibuat:

- Menambahkan modul `programs` untuk kebutuhan internal:
  - `src/features/programs/program.schema.ts`
  - ekspansi `program.repository.ts`
  - ekspansi `program.service.ts`
- Menambahkan modul `batches`:
  - `src/features/batches/batch.schema.ts`
  - ekspansi `batch.repository.ts`
  - `src/features/batches/batch.service.ts`
- Menambahkan modul `classrooms`:
  - `src/features/classrooms/classroom.schema.ts`
  - `src/features/classrooms/classroom.repository.ts`
  - `src/features/classrooms/classroom.service.ts`
- Menambahkan modul `sessions`:
  - `src/features/sessions/session.schema.ts`
  - `src/features/sessions/session.repository.ts`
  - `src/features/sessions/session.service.ts`
- Menambahkan route handler internal:
  - `GET/POST /api/programs`
  - `GET/PATCH /api/programs/[programId]`
  - `GET/POST /api/batches`
  - `GET/PATCH /api/batches/[batchId]`
  - `GET/POST /api/classrooms`
  - `GET/PATCH /api/classrooms/[classroomId]`
  - `GET/POST /api/sessions`
  - `GET/PATCH /api/sessions/[sessionId]`
- Menambahkan halaman internal monitoring master data di `src/app/admin/master-data/page.tsx`.

Catatan:

- Pada phase ini saya belum menambahkan delete endpoint agar perubahan data tetap aman.
- Sinkronisasi status batch `OPEN`, `ONGOING`, dan `COMPLETED` sekarang dijalankan dari layer batch sebelum query penting dibaca.
- Build produksi kembali berhasil, termasuk halaman `/admin/master-data` dan seluruh endpoint internal master data.

## Update 7 - Phase 8 K3 Logbook, Assessment, dan Sertifikasi

Perubahan yang sudah dibuat:

- Menambahkan perluasan modul enrollment untuk assessment dan QR verification:
  - `src/features/enrollments/enrollment-assessment.schema.ts`
  - ekspansi `enrollment.repository.ts`
  - ekspansi `enrollment.service.ts`
- Menambahkan modul `K3Log`:
  - `src/features/k3-logs/k3-log.schema.ts`
  - `src/features/k3-logs/k3-log.repository.ts`
  - `src/features/k3-logs/k3-log.service.ts`
- Menambahkan route handler:
  - `GET /api/enrollments`
  - `GET /api/enrollments/[enrollmentId]`
  - `PATCH /api/enrollments/[enrollmentId]/assessment`
  - `GET/POST /api/k3-logs`
  - `GET/PATCH /api/k3-logs/[logId]`
  - `GET /api/public/certificates/[qrCode]`
- Menambahkan halaman:
  - `src/app/admin/sertifikasi/page.tsx`
  - `src/app/verifikasi/[qrCode]/page.tsx`
- Menambahkan role guard verifikator di `src/features/users/user.service.ts`.
- Menambahkan data seed tambahan untuk assessor, enrollment demo, dan satu K3 log demo.

Catatan:

- Sertifikat akan otomatis dibuatkan nomor default saat assessment diubah ke `KOMPETEN` bila nomor belum diisi manual.
- QR verification saat ini bertumpu pada `Enrollment.qrVerifyCode`, sesuai skema awal AJS.
- Build produksi berhasil kembali, termasuk halaman `/admin/sertifikasi`, `/verifikasi/[qrCode]`, dan seluruh endpoint Phase 8.

## Update 8 - Phase 9 Hardening, QA, dan Deployment

Perubahan yang sudah dibuat:

- Menambahkan hardening deployment:
  - `next.config.mjs` memakai `output: "standalone"`
  - `railway.json` dengan `preDeployCommand`, `startCommand`, readiness healthcheck, dan restart policy
- Menambahkan script operasional pada `package.json`:
  - `db:migrate:dev`
  - `db:migrate:deploy`
  - `db:migrate:status`
  - `ops:readiness`
  - `test`
  - `test:watch`
- Menambahkan observability dasar:
  - `src/lib/logger.ts`
  - log terstruktur pada `src/lib/handle-api-error.ts`
- Menambahkan health endpoint:
  - `GET /api/health`
  - `GET /api/readiness`
  - helper `src/lib/health.ts`
- Menambahkan script readiness lokal:
  - `scripts/check-readiness.ts`
- Menambahkan baseline testing dengan Vitest:
  - `vitest.config.ts`
  - `vitest.d.ts`
  - `src/features/landing-page/landing-page.service.test.ts`
  - `src/features/auth/auth.service.test.ts`
  - `src/app/api/public/programs/route.test.ts`
- Menambahkan dokumen operasional:
  - `DEPLOYMENT_RAILWAY.md`
  - `API_CONTRACTS.md`
- Menambahkan baseline migration Prisma:
  - `prisma/migrations/migration_lock.toml`
  - `prisma/migrations/20260427090000_init/migration.sql`

Catatan:

- Flow production sekarang diarahkan ke `prisma migrate deploy`, bukan `db push`.
- Readiness probe memeriksa koneksi database agar deploy Railway baru aktif saat aplikasi benar-benar siap.
- `npm test` berhasil dengan 8 test lulus.
- `npm run build` berhasil setelah penambahan standalone output, health routes, dan file test.
- `npm run ops:readiness` belum dijalankan pada turn ini karena `DATABASE_URL` belum tersedia di environment kerja.

## Update 9 - Akses Superadmin Siap Pakai

Perubahan yang sudah dibuat:

- Menambahkan kredensial admin internal yang benar-benar dapat dipakai:
  - field `User.passwordHash` pada Prisma schema
  - migration `20260427113000_add_user_password_hash`
  - seed akun `SUPER_ADMIN` berbasis environment
- Menambahkan fondasi autentikasi admin:
  - helper hash password `src/lib/password.ts`
  - helper session cookie HTTP-only `src/lib/auth-session.ts`
  - endpoint `POST /api/auth/admin/login`
  - endpoint `POST /api/auth/logout`
- Menambahkan halaman internal siap pakai:
  - `src/app/masuk/page.tsx`
  - `src/app/admin/layout.tsx`
  - `src/app/admin/page.tsx`
- Menambahkan komponen interaktif:
  - `src/features/auth/admin-login-form.tsx`
  - `src/features/auth/admin-logout-button.tsx`
- Menambahkan guard RBAC:
  - halaman `/admin` kini meminta session login
  - `/admin/master-data` dibatasi untuk `SUPER_ADMIN` dan `ADMIN`
  - endpoint master data internal dibatasi untuk `SUPER_ADMIN` dan `ADMIN`
  - endpoint enrollment admin, assessment, dan K3 log dibatasi untuk role verifikator
- Menambahkan CTA `Masuk Admin` di landing page publik.
- Menambahkan test auth admin dan menyesuaikan Prisma env guard test.

Cara pakai sekarang:

1. Jika PostgreSQL lokal belum berjalan, jalankan `npm run db:local:prepare`.
2. Jika database sudah aktif, jalankan migration dan seed dengan `npm run db:migrate:deploy` lalu `npm run db:seed`.
3. Buka `/masuk`.
4. Login memakai `AJS_SUPERADMIN_EMAIL` dan `AJS_SUPERADMIN_PASSWORD`.
5. Setelah login, buka `/admin`, `/admin/master-data`, atau `/admin/sertifikasi`.

Catatan:

- Nilai default development saat ini:
  - email: `superadmin@ajs.local`
  - password: `Superadmin123!`
- Helper lokal tambahan:
  - `npm run db:local:start` untuk menyalakan PostgreSQL lokal sementara via `pkgx`
  - `npm run db:local:status` untuk cek status instance lokal
  - `npm run db:local:stop` untuk mematikan instance lokal
- Untuk staging/production, nilai secret session dan password superadmin wajib diganti dari default.
- `npm test` berhasil dengan 11 test lulus.
- `npm run build` berhasil setelah penambahan auth admin, guard halaman, dan guard API internal.

## Update 10 - Hardening Enrollment, Attendance, dan Audit Verifikator

Perubahan yang sudah dibuat:

- Mengubah flow auth peserta agar `POST /api/auth/magic-link` juga membentuk session cookie HTTP-only untuk user publik.
- Menghapus `userId` dari payload client untuk:
  - `POST /api/enrollment`
  - `POST /api/attendance/scan`
- Memindahkan resolusi identitas peserta ke sisi server melalui session aktif, sehingga enrollment dan attendance tidak lagi percaya `userId` dari browser.
- Menambahkan hardening enrollment:
  - unique constraint Prisma `Enrollment(batchId, userId)`
  - migration `20260427170000_add_enrollment_batch_user_unique`
  - transaksi pendaftaran dengan lock pada row batch agar pengecekan kuota tidak mudah race condition
- Menambahkan hardening attendance agar duplicate check-in pada session yang sama dikembalikan sebagai error domain `409`.
- Mengunci audit trail K3 log:
  - `verifiedById` dihapus dari payload client
  - verifikator diambil dari session server-side pada create dan update log
- Memperbaiki panel sertifikasi internal:
  - tombol verifikasi log sekarang selaras dengan schema backend
  - daftar log per peserta tidak lagi menampilkan semua log lintas enrollment
  - opsi status assessment diselaraskan dengan enum database
- Menambahkan test baru:
  - `src/features/enrollments/enrollment.service.test.ts`
  - `src/features/attendance/attendance.service.test.ts`
  - `src/features/k3-logs/k3-log.service.test.ts`
- Memperbarui `API_CONTRACTS.md` agar sesuai dengan kontrak session baru.

Catatan:

- `npm test` berhasil dengan 18 test lulus.
- `npm run build` berhasil setelah perubahan auth session publik, hardening enrollment, dan perapihan panel sertifikasi.

## Update 11 - Aktivasi Operasional API dari UI Admin

Perubahan yang sudah dibuat:

- Menambahkan panel baru `API Operations` di halaman `/admin/master-data`:
  - flow bertahap 4 step agar UI tidak menumpuk (`Program -> Batch -> Classroom -> Session`)
  - satu form aktif per langkah, dengan auto-lanjut ke langkah berikutnya setelah create berhasil
  - form `Create Program` (`POST /api/programs`)
  - form `Create Batch` (`POST /api/batches`)
  - form `Create Classroom` (`POST /api/classrooms`)
  - form `Create Session` (`POST /api/sessions`)
- Menambahkan quick check endpoint operasional:
  - `GET /api/health`
  - `GET /api/readiness`
- Menambahkan normalisasi input schema agar payload ala form browser lebih toleran:
  - angka string untuk `capacity` dan `quota`
  - nilai `""` pada UUID opsional (`classroomId`, `instructorId`) diperlakukan sebagai `null`
- Menambahkan test schema baru untuk menjaga perilaku validasi ini tetap stabil.

Catatan:

- `npm test` berhasil dengan 22 test lulus.
- `npm run build` berhasil setelah penambahan panel operasi API.

## Update 12 - Setup Form Pendaftaran Internal dan Kategori Lanjutan

Perubahan yang sudah dibuat:

- Menambahkan endpoint baru member internal:
  - `GET /api/internal-members`
  - `POST /api/internal-members`
- Menambahkan setup form pendaftaran member internal pada panel API Operations:
  - field `fullName`, `email`, `phone`, `role`, `isActive`
  - field `instructorLevel` wajib jika role `INSTRUCTOR`
  - field `password` wajib jika role `SUPER_ADMIN` atau `ADMIN`
- Menambahkan dukungan level instruktur pada model user:
  - enum `InstructorLevel` (`JUNIOR`, `MADYA`, `SENIOR`, `MASTER`)
  - kolom `User.instructorLevel`
- Menambahkan dukungan kategori program yang lebih luas:
  - enum tambahan `INHOUSE`, `SERTIFIKASI`, `AUDIT`, `LAINNYA`
  - kolom `Program.customCategory` untuk label kategori custom saat memilih `LAINNYA`
- Menambahkan migration:
  - `20260427223000_add_program_custom_category_and_instructor_level`
- Menambahkan test validasi baru:
  - `src/features/users/internal-member.schema.test.ts`

Catatan:

- `npm run db:generate`, `npm run db:migrate:deploy`, `npm run db:seed`, `npm test`, dan `npm run build` berhasil.
- Smoke test API berhasil untuk:
  - `POST /api/programs` dengan `category = LAINNYA` + `customCategory`
  - `POST /api/internal-members` dengan role `INSTRUCTOR` + `instructorLevel`

## Update 13 - Setup Form Pendaftaran Peserta (Publik) dan Stabilitas Runtime

Perubahan yang sudah dibuat:

- Merapikan layout halaman `/daftar` agar tidak menumpuk di layar kecil:
  - grid utama diubah menjadi responsif (`repeat(auto-fit, minmax(280px, 1fr))`)
- Memperkuat komponen `RegisterForm`:
  - menampilkan notifikasi khusus jika belum ada batch terbuka
  - select batch dan tombol submit otomatis dinonaktifkan ketika kuota belum tersedia
  - grid field kontak dibuat responsif (`repeat(auto-fit, minmax(220px, 1fr))`)
  - handling error submit diperbaiki (tanpa `any`)
- Menstabilkan runtime lokal setelah perubahan enum Prisma:
  - regenerasi Prisma Client (`npm run db:generate`)
  - restart dev server agar schema enum baru terbaca penuh

Catatan:

- Verifikasi operasional pada 27 April 2026:
  - `GET /api/health` sukses
  - `GET /api/readiness` sukses (database `up`)
  - `GET /api/public/programs` sukses setelah regenerate + restart server
  - flow pendaftaran publik sukses:
    - `POST /api/auth/magic-link`
    - `POST /api/enrollment`
  - flow pendaftaran member internal sukses:
    - `POST /api/auth/admin/login`
    - `POST /api/internal-members`

## Update 14 - Modul Unit Skema, Dashboard Peserta, dan Navigasi Akses

Perubahan yang sudah dibuat:

- Menambahkan modul database unit skema:
  - tabel `UnitSchema` (master skema kompetensi)
  - tabel `SchemaUnit` (detail unit per skema)
  - relasi optional `UnitSchema.programId -> Program.id`
  - migration baru: `20260427234000_add_unit_schema_models`
- Menambahkan backend Unit Skema:
  - `src/features/unit-schemas/unit-schema.schema.ts`
  - `src/features/unit-schemas/unit-schema.repository.ts`
  - `src/features/unit-schemas/unit-schema.service.ts`
- Menambahkan endpoint API Unit Skema:
  - `GET/POST /api/unit-schemas`
  - `GET/PATCH /api/unit-schemas/[schemaId]`
  - `POST /api/unit-schemas/[schemaId]/units`
- Menambahkan halaman admin Unit Skema:
  - `GET /admin/unit-skema`
  - panel create skema + add unit pada satu halaman operasional
- Menambahkan halaman peserta:
  - `GET /peserta`
  - menampilkan ringkasan enrollment, log praktik, sertifikat, dan unit skema terkait program peserta
- Menambahkan menu navigasi baru agar akses lebih jelas:
  - nav admin: `Unit Skema`
  - nav publik: `Portal Peserta` (home, daftar, absen, masuk)
  - success state form daftar sekarang punya tombol cepat ke `/peserta`

Catatan:

- `npm run db:generate` dan `npm run db:migrate:deploy` berhasil untuk model Unit Skema.
