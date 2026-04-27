# Phase Pengerjaan AJS

## Tujuan

Dokumen ini memecah implementasi Sistem Informasi Pelatihan K3 PT Arkama Jaya Sertifikasi (AJS) menjadi beberapa phase yang realistis, modular, dan siap dieksekusi di stack:

- Next.js App Router
- Prisma ORM
- PostgreSQL on Railway
- Zod validation

Fokus MVP awal:

- Boilerplate full-stack dan backend API inti
- Arsitektur modular per domain
- Landing page publik yang mengambil data langsung dari sistem informasi
- Fondasi yang siap diekspansi ke sektor lain selain K3 Umum

## Prinsip Arsitektur

1. Modular per domain, bukan per layer besar.
2. Satu sumber data untuk operasional dan landing page.
3. Public data dipisahkan lewat endpoint khusus `public`.
4. Logic bisnis ditempatkan di `src/features/*`, bukan langsung di route handler.
5. Siapkan sejak awal titik ekspansi untuk:
   - industri lain: Mining, Migas, dll
   - auth production-ready
   - S3 document storage
   - geo-fencing attendance

## Struktur Modular yang Disarankan

```text
src/
  app/
    api/
      auth/
        magic-link/
          route.ts
      attendance/
        scan/
          route.ts
      enrollment/
        route.ts
      public/
        programs/
          route.ts
  features/
    attendance/
      attendance.schema.ts
      attendance.service.ts
      attendance.repository.ts
      attendance.mapper.ts
    auth/
      auth.schema.ts
      auth.service.ts
    batches/
      batch.service.ts
      batch.repository.ts
    enrollments/
      enrollment.schema.ts
      enrollment.service.ts
      enrollment.repository.ts
    programs/
      program.service.ts
      program.repository.ts
    landing-page/
      landing-page.service.ts
      landing-page.mapper.ts
    users/
      user.service.ts
      user.repository.ts
  lib/
    prisma.ts
    zod-error.ts
    api-response.ts
    env.ts
  prisma/
    schema.prisma
    seed.ts
```

## Phase 0 - Foundation Setup

### Scope

- Inisialisasi project Next.js dengan App Router dan TypeScript
- Install Prisma, Zod, PostgreSQL driver
- Setup `.env`, koneksi `DATABASE_URL`, dan Railway-ready config
- Buat `lib/prisma.ts` dengan pola singleton untuk development
- Masukkan schema Prisma sesuai brief
- Jalankan migration awal dan seed dasar

### Output

- Project bisa dijalankan lokal
- Prisma client aktif
- Database schema terbentuk
- Struktur folder modular awal siap dipakai

### Catatan

Phase ini wajib selesai dulu karena semua API dan landing page akan bergantung pada model data yang sama.

## Phase 1 - Core Domain & Shared Backend Layer

### Scope

- Buat shared utility:
  - handler error standar
  - formatter response JSON
  - helper parsing Zod error
  - env validation
- Bentuk repository dan service layer per domain inti:
  - users
  - programs
  - batches
  - enrollments
  - attendance

### Output

- Route handler tetap tipis
- Logic bisnis tidak bercampur dengan HTTP concern
- Dasar modular sudah rapi untuk scaling fitur berikutnya

### Definition of Done

- Seluruh akses Prisma dilakukan lewat repository/service
- Error handling konsisten di seluruh endpoint

## Phase 2 - Authentication & RBAC Foundation

### Scope

- Implement endpoint `POST /api/auth/magic-link`
- Validasi email atau phone menggunakan Zod
- Cek user existing atau auto-create user baru dengan role default `TRAINEE`
- Return JSON dummy instruction pengiriman token
- Siapkan abstraksi agar nanti mudah diganti ke provider OTP/Magic Link produksi

### Output

- Auth flow dummy untuk onboarding awal
- Fondasi identitas pengguna sudah tersambung ke tabel `User`

### Catatan

Untuk MVP, token bisa dummy. Untuk production phase berikutnya tinggal sambungkan ke:

- email delivery
- WhatsApp OTP
- session/JWT

## Phase 3 - Master Data Pelatihan

### Scope

- Modul `Program`
- Modul `Batch`
- Modul `Classroom`
- Modul `ClassSession`
- Logic status batch: `OPEN`, `ONGOING`, `COMPLETED`
- Hitung slot tersedia berdasarkan `quota - jumlah enrollment`

### Output

- Data pelatihan dan jadwal tersusun rapi
- Program dan batch siap dipakai internal admin dan publik landing page

### Catatan

Ini phase penting karena landing page publik harus membaca dari data ini secara langsung, bukan dari konten manual terpisah.

## Phase 4 - Public Landing Page Data API

### Scope

- Implement `GET /api/public/programs`
- Query hanya `Program.isActive = true`
- Sertakan relasi `Batch` dengan `status = OPEN`
- Keluarkan payload yang siap konsumsi front-end:
  - program title
  - category
  - industryType
  - description
  - open batches
  - quota
  - price
  - date range

### Output

- Satu endpoint publik yang menjadi source of truth landing page
- Landing page bisa menampilkan daftar program, harga, jadwal, dan kuota tanpa input ulang

### Catatan Implementasi Front

Landing page front harus dibangun dengan pola:

- section program unggulan
- daftar batch aktif
- CTA daftar
- sinkron ke data `Program` dan `Batch`

Artinya perubahan di backoffice langsung mempengaruhi front publik.

## Phase 5 - Enrollment Workflow

### Scope

- Implement `POST /api/enrollment`
- Validasi input batch dan user
- Pastikan user hanya bisa daftar ke batch valid
- Cek kuota sebelum membuat enrollment
- Simpan `registrationDocs` sebagai placeholder URL object untuk integrasi S3 berikutnya
- Hindari duplicate enrollment untuk user pada batch yang sama bila aturan itu diinginkan

### Output

- Pendaftaran trainee ke batch berjalan
- Sistem sudah menghitung sisa kuota secara aman

### Catatan

Jika ingin benar-benar aman saat traffic naik, pengecekan kuota nanti sebaiknya dilindungi transaction atau row-level strategy di phase hardening.

## Phase 6 - Attendance & Validasi Kehadiran

### Scope

- Implement `POST /api/attendance/scan`
- Input:
  - `sessionId`
  - `userId`
  - `gpsCoordinates`
- Validasi peserta memang terdaftar pada batch dari session tersebut
- Simpan attendance
- Tangani error duplicate attendance dengan status `409`

### Output

- Fondasi absensi digital berjalan
- Validasi minimal antara session, batch, dan enrollment sudah aman

### Lanjutan Setelah MVP

- geo-fencing radius
- selfie validation
- device fingerprint
- check-in window berdasarkan `startTime` dan `endTime`

## Phase 7 - Pengaturan Landing Page

### Tujuan

Menyiapkan landing page publik agar tidak statis dan tetap mengikuti data dari sistem informasi.

### Scope MVP

- Landing page membaca data program dari endpoint publik
- Batch aktif, harga, jadwal, dan kuota tampil otomatis
- Section utama yang bersifat operasional tidak diisi manual di kode

### Aturan Sinkronisasi Front

- Program tampil jika `Program.isActive = true`
- Batch tampil di landing page jika `Batch.status = OPEN`
- Kuota yang ditampilkan sebaiknya adalah sisa slot, bukan quota mentah
- Harga tampil dari `Batch.price`
- Label sektor tampil dari `Program.industryType`
- Deskripsi program tampil dari `Program.description`
- Tombol daftar mengarah ke flow auth lalu enrollment

Dengan aturan ini, landing page benar-benar menjadi representasi publik dari data operasional yang ada di sistem.

### Scope Pengaturan Tambahan

Karena schema saat ini sudah kuat untuk data operasional, tetapi belum punya tabel khusus pengaturan konten landing page, maka ada 2 opsi:

1. MVP cepat
   - hero, company profile, CTA, contact masih hardcoded atau dari env/config
   - daftar program dan jadwal tetap dinamis dari database
2. MVP plus
   - tambahkan modul baru seperti `SiteSetting` atau `LandingPageSetting`
   - kelola hero title, subtitle, CTA, kontak, alamat, FAQ, dan urutan section dari admin panel

### Rekomendasi

Ambil pendekatan bertahap:

- data operasional publik tetap dari `Program` dan `Batch`
- data marketing/static content dipindah ke modul `SiteSetting` setelah API inti stabil

Dengan begitu front tetap modular dan tidak perlu rework besar.

## Phase 8 - K3 Logbook, Assessment, dan Sertifikasi

### Scope

- Modul `K3Log`
- Verifikasi log oleh assessor/instruktur
- Update `assessmentStatus`
- Persiapan generate nomor sertifikat dan QR verification

### Output

- Fondasi alur pasca-pelatihan siap
- Sistem mulai menutup loop dari training ke sertifikasi

## Phase 9 - Hardening, QA, dan Deployment

### Scope

- Seed data dev/staging
- API contract review
- Basic testing untuk service dan route handler
- Logging dan observability
- Railway deployment flow
- Prisma migration flow untuk staging/production
- Data validation dan error scenarios

### Output

- Sistem siap masuk staging
- Risiko bug operasional awal lebih kecil

## Urutan Eksekusi yang Paling Aman

1. Phase 0
2. Phase 1
3. Phase 2
4. Phase 3
5. Phase 4
6. Phase 5
7. Phase 6
8. Phase 7
9. Phase 8
10. Phase 9

## Prioritas MVP

Jika ingin fokus cepat ke hasil yang bisa dipakai demo atau pilot, maka MVP yang saya sarankan adalah:

1. Foundation setup
2. Prisma schema dan migration
3. Auth magic link dummy
4. Public programs API
5. Enrollment API
6. Attendance scan API
7. Landing page publik dinamis berbasis endpoint public

## Risiko yang Perlu Diantisipasi

- Schema sekarang belum mencakup pengaturan konten landing page non-operasional
- Kuota batch perlu pendekatan transaction-safe jika trafik pendaftaran tinggi
- Attendance geo-fencing butuh aturan radius dan sumber koordinat kelas/sesi
- Magic link dummy harus dipisahkan jelas dari auth produksi agar tidak jadi technical debt

## Rekomendasi Sprint

### Sprint 1

- Phase 0
- Phase 1
- Phase 2

### Sprint 2

- Phase 3
- Phase 4
- Phase 5

### Sprint 3

- Phase 6
- Phase 7
- Phase 8

### Sprint 4

- Phase 9
- hardening
- deployment staging

## Kesimpulan

Pendekatan terbaik untuk brief AJS adalah membangun sistem dalam 2 poros utama sejak awal:

- poros operasional internal: auth, program, batch, enrollment, attendance, logbook
- poros publik: landing page yang membaca data langsung dari sistem internal lewat public API

Dengan pola ini, kita menjaga sistem tetap modular, landing page tidak duplikasi data, dan ekspansi ke sektor K3 lain di masa depan tetap mudah.
