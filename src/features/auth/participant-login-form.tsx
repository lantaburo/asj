"use client";

import { useState, useTransition } from "react";

import { useRouter, useSearchParams } from "next/navigation";

function resolveNextPath(rawNextPath?: string | null) {
  if (!rawNextPath || !rawNextPath.startsWith("/") || rawNextPath.startsWith("//")) {
    return "/peserta";
  }

  return rawNextPath;
}

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export function ParticipantLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      style={{ display: "flex", flexDirection: "column" }}
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "").trim();
        const phone = String(formData.get("phone") ?? "").trim();
        const nextPath = resolveNextPath(searchParams.get("next"));
        const loginPayload = email
          ? {
              email
            }
          : {
              phone: phone || undefined
            };

        if (!email && !phone) {
          setError("Isi email atau nomor WhatsApp yang dipakai saat mendaftar.");
          return;
        }

        startTransition(async () => {
          try {
            const response = await fetch("/api/auth/participant/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(loginPayload)
            });

            const payload = (await response.json()) as ApiErrorResponse;

            if (!response.ok) {
              setError(payload.error?.message ?? "Login peserta gagal diproses.");
              return;
            }

            router.replace(nextPath);
            router.refresh();
          } catch (requestError) {
            setError(
              requestError instanceof Error
                ? requestError.message
                : "Terjadi kesalahan saat menghubungi server."
            );
          }
        });
      }}
    >
      <label className="field-group">
        <span className="field-label">Email Terdaftar</span>
        <input
          className="text-input"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="budi@example.com"
          autoFocus
        />
        <span className="field-helper">
          Gunakan email yang dipakai saat daftar atau saat melakukan absensi. Ini jadi prioritas utama saat login.
        </span>
      </label>

      <label className="field-group">
        <span className="field-label">Nomor WhatsApp</span>
        <input
          className="text-input"
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="081234567890"
        />
        <span className="field-helper">
          Isi nomor WhatsApp hanya jika Anda tidak memakai email untuk login.
        </span>
      </label>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="auth-form-meta">
        <span className="status-dot" aria-hidden="true" />
        <span>Setelah cocok, sesi peserta akan aktif lagi di browser ini selama 12 jam.</span>
      </div>

      <button className="cta-primary" type="submit" disabled={isPending}>
        {isPending ? "Memulihkan sesi..." : "Masuk ke Dashboard Peserta"}
      </button>
    </form>
  );
}
