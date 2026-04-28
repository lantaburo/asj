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
        const password = String(formData.get("password") ?? "");
        const nextPath = resolveNextPath(searchParams.get("next"));

        if (!email || !password) {
          setError("Silakan masukkan email dan password Anda.");
          return;
        }

        startTransition(async () => {
          try {
            const response = await fetch("/api/auth/participant/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ email, password })
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
          required
          autoFocus
        />
      </label>

      <label className="field-group">
        <span className="field-label">Password</span>
        <input
          className="text-input"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </label>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="auth-form-meta">
        <span className="status-dot" aria-hidden="true" />
        <span>Gunakan kredensial yang Anda buat saat pendaftaran.</span>
      </div>

      <button className="cta-primary" type="submit" disabled={isPending}>
        {isPending ? "Masuk..." : "Masuk ke Dashboard"}
      </button>
    </form>
  );
}
