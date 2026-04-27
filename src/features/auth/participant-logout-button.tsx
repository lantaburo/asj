"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export function ParticipantLogoutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="logout-cluster">
      <button
        className="btn btn-outline"
        type="button"
        disabled={isPending}
        style={{ color: "var(--ajs-navy)", borderColor: "var(--ajs-border)" }}
        onClick={() => {
          setError(null);

          startTransition(async () => {
            try {
              const response = await fetch("/api/auth/logout", {
                method: "POST"
              });

              if (!response.ok) {
                const payload = (await response.json()) as ApiErrorResponse;
                setError(payload.error?.message ?? "Logout peserta gagal diproses.");
                return;
              }

              router.replace("/peserta/masuk");
              router.refresh();
            } catch (requestError) {
              setError(
                requestError instanceof Error
                  ? requestError.message
                  : "Terjadi kesalahan saat logout peserta."
              );
            }
          });
        }}
      >
        {isPending ? "Mengakhiri sesi..." : "Logout Peserta"}
      </button>

      <span className="subtle-note">
        Gunakan tombol ini jika dashboard dibuka di perangkat bersama.
      </span>

      {error ? <div className="error-banner">{error}</div> : null}
    </div>
  );
}
