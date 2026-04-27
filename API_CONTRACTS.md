# API Contracts AJS

Dokumen ringkas ini merangkum kontrak endpoint utama yang sudah ada di sistem.

## Public

- `GET /api/public/programs`
  - Mengembalikan `Program.isActive = true` beserta `Batch.status = OPEN`.
- `GET /api/public/certificates/[qrCode]`
  - Mengembalikan data verifikasi sertifikat berbasis `Enrollment.qrVerifyCode`.

## Auth

- `POST /api/auth/magic-link`
  - Input: `email` atau `phone`, opsional `fullName`
  - Output: instruksi magic link dummy, data user, dan session cookie HTTP-only
- `POST /api/auth/admin/login`
  - Input: `email`, `password`
  - Output: data user admin dan session cookie HTTP-only
- `POST /api/auth/logout`
  - Output: session cookie dibersihkan

## Enrollment

- `POST /api/enrollment`
  - Input: `batchId`, opsional `registrationDocs`
  - Auth: user diambil dari session cookie hasil `POST /api/auth/magic-link`
  - Validasi: batch terbuka, user aktif, kuota tersedia, tidak duplicate
- `GET /api/enrollments`
  - Akses: role verifikator (`SUPER_ADMIN`, `ADMIN`, `ASSESSOR`, `INSTRUCTOR`)
  - Output: daftar enrollment untuk kebutuhan admin
- `GET /api/enrollments/[enrollmentId]`
  - Akses: role verifikator
  - Output: detail enrollment dan K3 log terkait
- `PATCH /api/enrollments/[enrollmentId]/assessment`
  - Akses: role verifikator
  - Input: `assessmentStatus`, opsional `certificateNum`, `expiryDate`
  - `verifiedById` diambil dari session user yang sedang login

## Attendance

- `POST /api/attendance/scan`
  - Input: `sessionId`, `gpsCoordinates`, opsional `selfieUrl`, `deviceInfo`, `status`
  - Auth: user diambil dari session cookie hasil `POST /api/auth/magic-link`
  - Validasi: user terdaftar di batch session terkait dan belum absen pada sesi yang sama

## Master Data Internal

- `GET/POST /api/programs`
  - `category` mendukung: `BNSP`, `KEMENAKER`, `INHOUSE`, `SERTIFIKASI`, `AUDIT`, `LAINNYA`
  - Jika `category = LAINNYA`, kirim `customCategory`
- `GET/PATCH /api/programs/[programId]`
- `GET/POST /api/batches`
- `GET/PATCH /api/batches/[batchId]`
- `GET/POST /api/classrooms`
- `GET/PATCH /api/classrooms/[classroomId]`
- `GET/POST /api/sessions`
- `GET/PATCH /api/sessions/[sessionId]`
- `GET/POST /api/internal-members`
  - Input utama: `fullName`, `email`, `role`, opsional `phone`, `isActive`
  - Jika `role = INSTRUCTOR`, `instructorLevel` wajib (`JUNIOR`, `MADYA`, `SENIOR`, `MASTER`)
  - Jika `role = SUPER_ADMIN` atau `ADMIN`, `password` wajib
- `GET/POST /api/unit-schemas`
  - Input utama: `code`, `title`, opsional `programId`, `level`, `description`, `isActive`
- `GET/PATCH /api/unit-schemas/[schemaId]`
- `POST /api/unit-schemas/[schemaId]/units`
  - Input utama: `unitCode`, `title`, opsional `orderIndex`, `isMandatory`, `criteria`
- Akses seluruh endpoint master data: `SUPER_ADMIN` atau `ADMIN`

## K3 Logbook

- `GET/POST /api/k3-logs`
- `GET/PATCH /api/k3-logs/[logId]`
- Akses endpoint internal K3 log: role verifikator
- `verifiedById` tidak diterima dari client dan selalu diambil dari session verifikator yang sedang login

## Operasional

- `GET /api/health`
  - Liveness probe
- `GET /api/readiness`
  - Readiness probe dengan cek database
