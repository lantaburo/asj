"use client";

import { useState, useTransition } from "react";

import { useRouter, useSearchParams } from "next/navigation";

function resolveNextPath(rawNextPath?: string | null) {
  if (!rawNextPath || !rawNextPath.startsWith("/") || rawNextPath.startsWith("//")) {
    return "/admin";
  }

  return rawNextPath;
}

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      style={{ display: 'flex', flexDirection: 'column' }}
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");
        const nextPath = resolveNextPath(searchParams.get("next"));

        startTransition(async () => {
          try {
            const response = await fetch("/api/auth/admin/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                email,
                password
              })
            });

            const payload = (await response.json()) as ApiErrorResponse;

            if (!response.ok) {
              setError(payload.error?.message ?? "Login admin gagal diproses.");
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
        <span className="field-label">Email Admin</span>
        <input
          className="text-input"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="admin@perusahaan.com"
          autoFocus
          required
        />
        <span className="field-helper">
          Gunakan email admin internal yang dikonfigurasi untuk environment ini.
        </span>
      </label>

      <label className="field-group">
        <span className="field-label">Password</span>
        <div className="password-frame">
          <input
            className="text-input"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Masukkan password admin"
            required
          />
          <button
            className="input-toggle"
            type="button"
            onClick={() => setShowPassword((currentValue) => !currentValue)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>
        <span className="field-helper">
          Password minimal 6 karakter. Session admin akan aktif selama 12 jam setelah autentikasi berhasil.
        </span>
      </label>

      {error ? <div className="error-banner">{error}</div> : null}

      <div className="auth-form-meta">
        <span className="status-dot" aria-hidden="true" />
        <span>Cookie session bersifat HTTP-only dan tidak bisa diakses JavaScript.</span>
      </div>

      <button className="cta-primary" type="submit" disabled={isPending}>
        {isPending ? "Memproses..." : "Masuk ke Admin"}
      </button>
    </form>
  );
}
