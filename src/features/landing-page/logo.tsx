"use client";

import { useState } from "react";

export function AJSLogo() {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`britsafe-logo ${hasError ? "text-logo-fallback" : ""}`} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      {!hasError && (
        <img
          src="/logo.png"
          alt="AJS Logo"
          style={{ height: "45px", width: "auto", transition: 'transform 0.3s ease' }}
          onError={() => setHasError(true)}
          className="header-logo-img"
        />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
        <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--ajs-navy)', letterSpacing: '-0.5px' }}>ARKAMA JAYA</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ajs-orange)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Sertifikasi</span>
      </div>
    </div>
  );
}
