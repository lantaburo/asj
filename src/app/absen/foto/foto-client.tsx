"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type SessionInfo = {
  id: string;
  title: string;
  sessionDate: string;
  programTitle: string;
};

type Status = "starting" | "camera" | "captured" | "uploading" | "success" | "error" | "already";

export function FotoAbsenClient({
  session,
  userName
}: {
  session: SessionInfo;
  userName: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("starting");
  const [errorMsg, setErrorMsg] = useState("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setStatus("starting");
    try {
      // Try front camera first
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
        });
      } catch {
        // Fallback: any camera without constraints
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStatus("camera");
    } catch {
      setErrorMsg("Tidak dapat mengakses kamera. Pastikan izin kamera sudah diberikan dan coba refresh halaman.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror the selfie so it looks natural
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();
    setStatus("captured");
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedPhoto(null);
    startCamera();
  }, [startCamera]);

  const submit = useCallback(async () => {
    if (!capturedPhoto) return;
    setStatus("uploading");

    try {
      const res = await fetch(capturedPhoto);
      const blob = await res.blob();

      const formData = new FormData();
      formData.append("sessionId", session.id);
      formData.append("photo", blob, "selfie.jpg");

      const response = await fetch("/api/attendance/foto", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.status === 409 && data.code === "DUPLICATE_ATTENDANCE") {
        setStatus("already");
        return;
      }

      if (!response.ok) {
        setErrorMsg(data.message || "Gagal merekam kehadiran. Coba lagi.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Periksa koneksi dan coba lagi.");
      setStatus("error");
    }
  }, [capturedPhoto, session.id]);

  const formattedDate = new Date(session.sessionDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Makassar"
  });

  return (
    <div style={{
      background: "white",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      borderTop: "4px solid var(--ajs-green)"
    }}>
      {/* Header info */}
      <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid var(--ajs-border)" }}>
        <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--ajs-orange)", marginBottom: "6px" }}>
          Presensi Kehadiran
        </div>
        <h1 style={{ fontSize: "20px", fontWeight: "800", color: "var(--ajs-navy)", margin: "0 0 4px 0" }}>
          {session.title}
        </h1>
        <div style={{ fontSize: "13px", color: "var(--ajs-muted)" }}>
          {session.programTitle} · {formattedDate}
        </div>
        <div style={{ marginTop: "8px", fontSize: "13px", color: "var(--ajs-text)" }}>
          Halo, <strong>{userName}</strong>
        </div>
      </div>

      {/* Camera / Photo area */}
      <div style={{ padding: "24px" }}>

        {/* Starting camera */}
        {status === "starting" && (
          <div style={centeredBox}>
            <div style={spinner} />
            <p style={{ color: "var(--ajs-muted)", marginTop: "16px", fontSize: "14px" }}>Memuat kamera...</p>
          </div>
        )}

        {/* Live camera */}
        {status === "camera" && (
          <>
            <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", background: "#000", aspectRatio: "4/3" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
              />
              <div style={{
                position: "absolute",
                inset: 0,
                border: "3px solid rgba(0,166,81,0.6)",
                borderRadius: "12px",
                pointerEvents: "none"
              }} />
            </div>
            <p style={{ textAlign: "center", fontSize: "13px", color: "var(--ajs-muted)", margin: "12px 0 16px" }}>
              Pastikan wajah Anda terlihat jelas
            </p>
            <button onClick={takePhoto} style={primaryBtn}>
              📸 Ambil Foto Sekarang
            </button>
          </>
        )}

        {/* Captured photo preview */}
        {status === "captured" && capturedPhoto && (
          <>
            <div style={{ borderRadius: "12px", overflow: "hidden", aspectRatio: "4/3", background: "#000" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={capturedPhoto} alt="Foto presensi" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <p style={{ textAlign: "center", fontSize: "13px", color: "var(--ajs-muted)", margin: "12px 0 16px" }}>
              Pastikan foto terlihat jelas sebelum konfirmasi
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={retake} style={outlineBtn}>
                🔄 Ulangi
              </button>
              <button onClick={submit} style={{ ...primaryBtn, flex: 2 }}>
                ✅ Konfirmasi Kehadiran
              </button>
            </div>
          </>
        )}

        {/* Uploading */}
        {status === "uploading" && (
          <div style={centeredBox}>
            <div style={spinner} />
            <p style={{ color: "var(--ajs-muted)", marginTop: "16px", fontSize: "14px" }}>Mengunggah foto...</p>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div style={{ ...centeredBox, gap: "12px" }}>
            <div style={{ fontSize: "64px", lineHeight: 1 }}>✅</div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--ajs-green)", margin: 0 }}>
              Kehadiran Tercatat!
            </h2>
            <p style={{ fontSize: "14px", color: "var(--ajs-muted)", textAlign: "center", margin: 0 }}>
              Foto Anda berhasil diunggah sebagai bukti kehadiran sesi ini.
            </p>
          </div>
        )}

        {/* Already recorded */}
        {status === "already" && (
          <div style={{ ...centeredBox, gap: "12px" }}>
            <div style={{ fontSize: "56px", lineHeight: 1 }}>🟡</div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--ajs-orange)", margin: 0 }}>
              Sudah Tercatat
            </h2>
            <p style={{ fontSize: "14px", color: "var(--ajs-muted)", textAlign: "center", margin: 0 }}>
              Kehadiran Anda untuk sesi ini sudah direkam sebelumnya.
            </p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div style={{ ...centeredBox, gap: "12px" }}>
            <div style={{ fontSize: "56px", lineHeight: 1 }}>❌</div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--ajs-red)", margin: 0 }}>
              Gagal
            </h2>
            <p style={{ fontSize: "14px", color: "var(--ajs-muted)", textAlign: "center", margin: 0 }}>
              {errorMsg}
            </p>
            <button onClick={retake} style={{ ...outlineBtn, marginTop: "8px" }}>
              Coba Lagi
            </button>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}

const centeredBox: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px",
  minHeight: "200px"
};

const primaryBtn: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "14px 20px",
  background: "var(--ajs-navy)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer"
};

const outlineBtn: React.CSSProperties = {
  display: "block",
  flex: 1,
  padding: "14px 16px",
  background: "transparent",
  color: "var(--ajs-navy)",
  border: "2px solid var(--ajs-border)",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer"
};

const spinner: React.CSSProperties = {
  width: "40px",
  height: "40px",
  border: "3px solid var(--ajs-border)",
  borderTop: "3px solid var(--ajs-navy)",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite"
};
