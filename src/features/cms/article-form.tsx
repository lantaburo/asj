"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createArticle, generateArticleAction, suggestTitlesAction } from "@/features/cms/article.service";

export function ArticleForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  async function handleGenerate() {
    if (!title) return alert("Masukkan judul atau topik terlebih dahulu sebagai prompt.");
    setGenerating(true);
    try {
      const generated = await generateArticleAction(title, content || "Berikan artikel mendalam", selectedModel);
      setContent(generated);
    } catch (err: any) {
      alert(`Gagal generate artikel: ${err.message || "Cek API Key atau koneksi Anda"}`);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSuggestTitles() {
    if (!title) return alert("Masukkan topik atau kata kunci awal untuk mendapatkan saran judul.");
    setSuggesting(true);
    try {
      const result = await suggestTitlesAction(title, selectedModel);
      setSuggestions(result.suggestions || []);
    } catch (err) {
      alert("Gagal mendapatkan saran judul.");
    } finally {
      setSuggesting(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const author = formData.get("author") as string;
    const version = formData.get("version") as string;

    const imageUrl = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80";

    try {
      await createArticle({
        title,
        author,
        content,
        version,
        imageUrl
      });
      router.push("/admin/artikel");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Gagal membuat artikel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="britsafe-card" style={{ padding: '40px' }}>
      <div style={{ display: 'grid', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontWeight: '700', fontSize: '13px' }}>Model AI</label>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--ajs-border)', background: 'white' }}
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Stabil & Cepat)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Sangat Cerdas)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Masa Depan)</option>
            </select>
          </div>
          <div style={{ display: 'grid', gap: '8px' }}>
            <label style={{ fontWeight: '700', fontSize: '13px' }}>Penulis</label>
            <input 
              name="author" 
              required 
              id="article-author"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--ajs-border)' }} 
              defaultValue="Admin Arkama"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: '700', fontSize: '13px' }}>Judul Artikel / Topik</label>
            <button 
              type="button" 
              onClick={handleSuggestTitles}
              disabled={suggesting}
              style={{ padding: '5px 12px', background: 'white', color: 'var(--ajs-teal)', border: '1px solid var(--ajs-teal)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
            >
              {suggesting ? "Mencari Ide..." : "🪄 Suggest Judul SEO"}
            </button>
          </div>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required 
            placeholder="Ketik topik di sini, lalu klik 'Suggest Judul' untuk ide yang lebih menarik..."
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--ajs-border)' }} 
          />
          
          {suggestions.length > 0 && (
            <div style={{ marginTop: '8px', display: 'grid', gap: '8px', padding: '15px', background: 'var(--ajs-gray)', borderRadius: '8px', border: '1px solid var(--ajs-border)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ajs-muted)', textTransform: 'uppercase' }}>Pilih Judul yang Menarik:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {suggestions.map((s, idx) => (
                  <button 
                    key={idx} 
                    type="button" 
                    onClick={() => { setTitle(s); setSuggestions([]); }}
                    style={{ padding: '6px 12px', background: 'white', border: '1px solid var(--ajs-border)', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', textAlign: 'left' }}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--ajs-navy)')}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--ajs-border)')}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontWeight: '700', fontSize: '13px' }}>Konten (Markdown)</label>
            <button 
              type="button" 
              onClick={handleGenerate}
              disabled={generating}
              style={{ padding: '5px 15px', background: 'var(--ajs-navy)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
            >
              {generating ? "Menulis Artikel..." : "🪄 Generate Artikel Lengkap"}
            </button>
          </div>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required 
            style={{ minHeight: '400px', padding: '15px', borderRadius: '8px', border: '1px solid var(--ajs-border)', fontSize: '14px', lineHeight: '1.6' }} 
            placeholder="Gunakan judul di atas sebagai panduan AI..."
          />
        </div>

        <form action={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
          <input type="hidden" name="author" id="hidden-author" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>Versi / Revisi</label>
              <input name="version" defaultValue="1.0" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--ajs-border)' }} />
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              <label style={{ fontWeight: '700', fontSize: '13px' }}>Foto Cover</label>
              <input type="file" accept="image/*" style={{ padding: '8px', border: '1px dashed var(--ajs-border)', borderRadius: '8px' }} />
            </div>
          </div>

          <div style={{ background: 'var(--ajs-gray)', padding: '20px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--ajs-navy)' }}>SEO Preview (Auto-generated by AI Brain)</h4>
            <p style={{ fontSize: '12px', opacity: 0.7 }}>Meta description dan keywords akan dihasilkan otomatis menggunakan model <strong>{selectedModel}</strong> saat artikel disimpan.</p>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button 
              type="submit" 
              disabled={loading || generating} 
              className="btn btn-primary"
              onClick={() => {
                const authorInput = document.getElementById('article-author') as HTMLInputElement;
                const hiddenAuthor = document.getElementById('hidden-author') as HTMLInputElement;
                hiddenAuthor.value = authorInput.value;
              }}
            >
              {loading ? "Menyimpan..." : "Simpan & Publikasikan"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn" style={{ border: '1px solid var(--ajs-border)' }}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
