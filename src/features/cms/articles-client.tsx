"use client";

import Link from "next/link";
import { 
  Plus, 
  Brain, 
  Send, 
  Globe, 
  Eye, 
  FileEdit, 
  CheckCircle2, 
  Clock,
  Share2,
  Link2 
} from "lucide-react";
import { toggleArticlePublish, submitToGoogle } from "@/features/cms/article.service";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ArticlesClient({ initialArticles }: { initialArticles: any[] }) {
  const router = useRouter();
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  async function handleToggle(id: string, current: boolean) {
    await toggleArticlePublish(id, current);
    router.refresh();
  }

  async function handleGoogleSubmit(id: string, slug: string) {
    setSubmittingId(id);
    try {
      const url = `https://arkamajayasertifikasi.id/artikel/${slug}`;
      await submitToGoogle(url);
      alert("Berhasil! URL telah dikirim ke Google Indexing API.");
    } catch (err) {
      alert("Gagal submit ke Google.");
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleShare(title: string, slug: string) {
    const url = `https://arkamajayasertifikasi.id/artikel/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.log("Share cancelled or failed");
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link artikel telah disalin ke clipboard!");
    }
  }

  async function handleCopy(slug: string) {
    const url = `https://arkamajayasertifikasi.id/artikel/${slug}`;
    await navigator.clipboard.writeText(url);
    alert("Link artikel berhasil disalin!");
  }

  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="britsafe-card__title" style={{ margin: 0 }}>AI Content Management</h1>
          <p className="britsafe-card__copy" style={{ fontSize: '13px', margin: 0 }}>Kelola artikel SEO dengan dukungan AI Gemini.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/ai-brain" className="btn" style={{ background: 'white', border: '1px solid var(--ajs-border)', color: 'var(--ajs-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={16} /> AI Brain
          </Link>
          <Link href="/admin/artikel/buat" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Buat Artikel
          </Link>
        </div>
      </header>

      <div className="britsafe-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--ajs-gray)' }}>
            <tr>
              <th style={{ padding: '15px 20px', fontSize: '12px', color: 'var(--ajs-muted)', fontWeight: '700' }}>JUDUL & INFO</th>
              <th style={{ padding: '15px 20px', fontSize: '12px', color: 'var(--ajs-muted)', fontWeight: '700' }}>PENULIS</th>
              <th style={{ padding: '15px 20px', fontSize: '12px', color: 'var(--ajs-muted)', fontWeight: '700' }}>STATUS</th>
              <th style={{ padding: '15px 20px', fontSize: '12px', color: 'var(--ajs-muted)', fontWeight: '700', textAlign: 'right' }}>AKSI CEPAT</th>
            </tr>
          </thead>
          <tbody>
            {initialArticles.map((art) => (
              <tr key={art.id} style={{ borderTop: '1px solid var(--ajs-border)' }}>
                <td style={{ padding: '20px' }}>
                  <div style={{ fontWeight: '700', color: 'var(--ajs-navy)', marginBottom: '4px' }}>{art.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ajs-muted)' }}>
                    v{art.version} • {new Date(art.publishDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </td>
                <td style={{ padding: '20px', fontSize: '14px' }}>{art.author}</td>
                <td style={{ padding: '20px' }}>
                  {art.isPublished ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#43A047', fontWeight: '700', fontSize: '12px' }}>
                      <CheckCircle2 size={14} /> PUBLISHED
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FB8C00', fontWeight: '700', fontSize: '12px' }}>
                      <Clock size={14} /> DRAFT
                    </div>
                  )}
                </td>
                <td style={{ padding: '20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleToggle(art.id, art.isPublished)}
                      style={{ 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--ajs-border)',
                        background: art.isPublished ? '#FFF1F2' : '#F0FDF4',
                        color: art.isPublished ? '#E11D48' : '#166534',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {art.isPublished ? "Set Draft" : "Publish Now"}
                    </button>
                    
                    <button 
                      onClick={() => handleGoogleSubmit(art.id, art.slug)}
                      disabled={!art.isPublished || submittingId === art.id}
                      style={{ 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        border: 'none',
                        background: '#4285F4',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: art.isPublished ? 'pointer' : 'not-allowed',
                        opacity: art.isPublished ? 1 : 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Globe size={14} /> {submittingId === art.id ? "Submitting..." : "Google Index"}
                    </button>

                    <button 
                      onClick={() => handleShare(art.title, art.slug)}
                      style={{ 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--ajs-border)',
                        background: 'white',
                        color: 'var(--ajs-navy)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Share Artikel"
                    >
                      <Share2 size={14} />
                    </button>

                    <button 
                      onClick={() => handleCopy(art.slug)}
                      style={{ 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        border: '1px solid var(--ajs-border)',
                        background: 'white',
                        color: 'var(--ajs-teal)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Copy Link"
                    >
                      <Link2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
