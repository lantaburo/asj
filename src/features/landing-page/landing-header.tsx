"use client";

import { useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { AJSLogo } from "@/features/landing-page/logo";
import { CertificateChecker } from "@/features/landing-page/certificate-checker";
import { X } from "lucide-react";

export function LandingHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="britsafe-header">
        <div className="container britsafe-header__container">
          <Link href="/">
            <AJSLogo />
          </Link>
          <nav className="britsafe-nav">
            <a href="#programs">Programs</a>
            <a href="#jadwal">Schedule</a>
            <Link href="/daftar">Daftar Pelatihan</Link>
            <button 
              onClick={() => setIsModalOpen(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontWeight: 600, 
                fontSize: '15px', 
                color: 'var(--ajs-navy)',
                cursor: 'pointer',
                padding: 0
              }}
            >
              Verifikasi Sertifikat
            </button>
            <Link href="/peserta">Dashboard Peserta</Link>
            <Link href="/masuk" className="britsafe-btn-auth">
              Workspace Internal
            </Link>
          </nav>
        </div>
      </header>

      {isModalOpen && createPortal(
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 10000, 
          background: 'rgba(2, 6, 23, 0.6)', 
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'softFadeIn 0.3s ease-out'
        }}>
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: '600px',
            animation: 'softFadeUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '-48px',
                right: '0',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <X size={20} />
            </button>
            <CertificateChecker />
          </div>
          <div 
            onClick={() => setIsModalOpen(false)} 
            style={{ position: 'absolute', inset: 0, zIndex: -1 }} 
          />
        </div>,
        document.body
      )}
    </>
  );
}
