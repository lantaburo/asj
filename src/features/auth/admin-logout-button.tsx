"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

type ApiErrorResponse = {
  error?: {
    message?: string;
  };
};

export function AdminLogoutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="logout-cluster">
      <button
        className="cta-secondary"
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);

          startTransition(async () => {
            try {
              const response = await fetch("/api/auth/logout", {
                method: "POST"
              });

              if (!response.ok) {
                const payload = (await response.json()) as ApiErrorResponse;
                setError(payload.error?.message ?? "Logout gagal diproses.");
                return;
              }

              router.replace("/masuk");
              router.refresh();
            } catch (requestError) {
              setError(
                requestError instanceof Error
                  ? requestError.message
                  : "Terjadi kesalahan saat logout."
              );
            }
          });
        }}
      >
        {isPending ? "Mengakhiri sesi..." : "Akhiri Sesi Admin"}
      </button>

      <span className="subtle-note">
        Logout akan menghapus cookie session admin dari browser ini.
      </span>

      {error ? <div className="error-banner">{error}</div> : null}
    </div>
  );
}
