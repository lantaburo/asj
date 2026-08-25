"use client";

import Link from "next/link";
import {
  Plus,
  Brain,
  Globe,
  FileEdit,
  CheckCircle2,
  Clock,
  Share2,
  Link2,
  GripVertical,
  ExternalLink,
  Save,
  X,
  Pencil,
  ListOrdered,
} from "lucide-react";
import {
  toggleArticlePublish,
  submitToGoogle,
  updateArticle,
  generateArticleAction,
  suggestTitlesAction,
} from "@/features/cms/article.service";
import { useState } from "react";

export function ArticlesClient({ initialArticles }: { initialArticles: any[] }) {
  const [articles, setArticles] = useState<any[]>(initialArticles);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Drag state — hanya dari grip handle
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editVersion, setEditVersion] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  const selected = articles.find((a) => a.id === selectedId) ?? null;

  // ── Sidebar interactions ──

  function handleCardClick(art: any) {
    setSelectedId(art.id);
    setEditMode(false);
    setSuggestions([]);
  }

  // ── Edit mode ──

  function handleOpenEdit() {
    if (!selected) return;
    setEditTitle(selected.title ?? "");
    setEditContent(selected.content ?? "");
    setEditAuthor(selected.author ?? "");
    setEditVersion(selected.version ?? "1.0");
    setEditMode(true);
    setSuggestions([]);
  }

  function handleCancelEdit() {
    setEditMode(false);
    setSuggestions([]);
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await updateArticle(selected.id, {
        title: editTitle,
        content: editContent,
        author: editAuthor,
        version: editVersion,
      });
      setArticles((prev) =>
        prev.map((a) =>
          a.id === selected.id
            ? { ...a, title: editTitle, content: editContent, author: editAuthor, version: editVersion }
            : a
        )
      );
      setEditMode(false);
    } catch {
      alert("Gagal menyimpan artikel.");
    } finally {
      setSaving(false);
    }
  }

  // ── Quick actions ──

  async function handleToggle(id: string, current: boolean) {
    await toggleArticlePublish(id, current);
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPublished: !current } : a))
    );
  }

  async function handleGoogleSubmit(id: string, slug: string) {
    setSubmittingId(id);
    try {
      await submitToGoogle(`https://arkamajayasertifikasi.id/artikel/${slug}`);
      alert("Berhasil! URL telah dikirim ke Google Indexing API.");
    } catch {
      alert("Gagal submit ke Google.");
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleShare(title: string, slug: string) {
    const url = `https://arkamajayasertifikasi.id/artikel/${slug}`;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link artikel telah disalin ke clipboard!");
    }
  }

  async function handleCopy(slug: string) {
    await navigator.clipboard.writeText(`https://arkamajayasertifikasi.id/artikel/${slug}`);
    alert("Link artikel berhasil disalin!");
  }

  // ── Drag & drop — hanya dari grip handle ──
  // onDragStart ada di grip, onDragOver/onDrop ada di card (sebagai drop target)

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) setDragOverId(targetId);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const next = [...articles];
    const fromIdx = next.findIndex((a) => a.id === draggedId);
    const toIdx = next.findIndex((a) => a.id === targetId);
    const [item] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, item);
    setArticles(next);
    setDraggedId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverId(null);
  }

  // ── AI features ──

  async function handleGenerate() {
    if (!editTitle) return alert("Masukkan judul terlebih dahulu.");
    setGenerating(true);
    try {
      const result = await generateArticleAction(editTitle, editContent || "Berikan artikel mendalam", selectedModel);
      setEditContent(result);
    } catch (err: any) {
      alert(`Gagal generate: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSuggestTitles() {
    if (!editTitle) return alert("Masukkan topik terlebih dahulu.");
    setSuggesting(true);
    try {
      const result = await suggestTitlesAction(editTitle, selectedModel);
      setSuggestions(result.suggestions ?? []);
    } catch {
      alert("Gagal mendapatkan saran judul.");
    } finally {
      setSuggesting(false);
    }
  }

  // ── Shared styles ──
  const cardBase: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "10px 8px",
    borderRadius: "8px",
    marginBottom: "3px",
    cursor: "pointer",
    transition: "background 0.12s, border-color 0.12s",
    userSelect: "none",
  };

  const btnIcon: React.CSSProperties = {
    padding: "7px 10px",
    borderRadius: "6px",
    border: "1px solid var(--ajs-border)",
    background: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  };

  return (
    <div style={{ display: "flex", gap: "20px", height: "calc(100vh - 240px)", minHeight: "640px" }}>

      {/* ══════════════ LEFT SIDEBAR ══════════════ */}
      <div style={{
        width: "270px",
        flexShrink: 0,
        background: "white",
        borderRadius: "12px",
        border: "1px solid var(--ajs-border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ padding: "12px", borderBottom: "1px solid var(--ajs-border)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link
            href="/admin/artikel/buat"
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px", padding: "9px 12px" }}
          >
            <Plus size={14} /> Buat Artikel
          </Link>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href="/admin/artikel/susun"
              className="btn"
              style={{ flex: 1, border: "1px solid var(--ajs-border)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", padding: "7px 10px", color: "var(--ajs-navy)" }}
              title="Susun urutan artikel"
            >
              <ListOrdered size={13} /> Susun Artikel
            </Link>
            <Link
              href="/admin/ai-brain"
              className="btn"
              style={{ border: "1px solid var(--ajs-border)", padding: "7px 10px", display: "flex", alignItems: "center", color: "var(--ajs-muted)" }}
              title="AI Brain"
            >
              <Brain size={14} />
            </Link>
          </div>
        </div>

        {/* Count */}
        <div style={{ padding: "9px 12px 4px", fontSize: "11px", fontWeight: "700", color: "var(--ajs-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {articles.length} Artikel
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 8px" }}>
          {articles.length === 0 ? (
            <p style={{ textAlign: "center", padding: "32px 16px", color: "var(--ajs-muted)", fontSize: "13px" }}>
              Belum ada artikel.
            </p>
          ) : articles.map((art) => {
            const isSelected = selectedId === art.id;
            const isDragOver = dragOverId === art.id;
            const isDragging = draggedId === art.id;
            return (
              <div
                key={art.id}
                /* Drop target events ada di sini */
                onDragOver={(e) => handleDragOver(e, art.id)}
                onDrop={(e) => handleDrop(e, art.id)}
                /* Click untuk pilih artikel */
                onClick={() => handleCardClick(art)}
                style={{
                  ...cardBase,
                  border: `1.5px solid ${isSelected ? "var(--ajs-teal)" : isDragOver ? "var(--ajs-navy)" : "transparent"}`,
                  background: isSelected
                    ? "rgba(0,95,115,0.07)"
                    : isDragOver
                    ? "var(--ajs-gray)"
                    : "transparent",
                  opacity: isDragging ? 0.3 : 1,
                }}
              >
                {/* Grip — satu-satunya elemen yang draggable */}
                <div
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation(); // jangan trigger klik
                    handleDragStart(e, art.id);
                  }}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => e.stopPropagation()} // grip click tidak pilih artikel
                  style={{ paddingTop: "3px", color: "var(--ajs-muted)", cursor: "grab", flexShrink: 0, lineHeight: 0 }}
                  title="Geser untuk ubah urutan"
                >
                  <GripVertical size={13} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--ajs-navy)",
                    lineHeight: "1.35",
                    marginBottom: "5px",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                  }}>
                    {art.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {art.isPublished ? (
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#43A047", background: "#E8F5E9", padding: "2px 7px", borderRadius: "20px" }}>LIVE</span>
                    ) : (
                      <span style={{ fontSize: "10px", fontWeight: "700", color: "#FB8C00", background: "#FFF3E0", padding: "2px 7px", borderRadius: "20px" }}>DRAFT</span>
                    )}
                    <span style={{ fontSize: "10px", color: "var(--ajs-muted)" }}>
                      {new Date(art.publishDate ?? art.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════ RIGHT MAIN PANEL ══════════════ */}
      <div style={{
        flex: 1,
        minWidth: 0,
        background: "white",
        borderRadius: "12px",
        border: "1px solid var(--ajs-border)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* ── Empty state ── */}
        {!selected && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", color: "var(--ajs-muted)", padding: "40px" }}>
            <FileEdit size={48} style={{ opacity: 0.18 }} />
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 6px", fontWeight: "700", fontSize: "15px", color: "var(--ajs-navy)" }}>Pilih Artikel</p>
              <p style={{ margin: 0, fontSize: "13px" }}>Klik salah satu artikel di sidebar kiri untuk melihat atau mengeditnya.</p>
            </div>
          </div>
        )}

        {/* ── VIEW MODE ── */}
        {selected && !editMode && (
          <>
            {/* Toolbar */}
            <div style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--ajs-border)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "var(--ajs-navy)", lineHeight: 1.3 }}>
                  {selected.title}
                </h2>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--ajs-muted)" }}>
                  {selected.author} · v{selected.version} · {new Date(selected.publishDate ?? selected.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  onClick={handleOpenEdit}
                  className="btn btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 16px" }}
                >
                  <Pencil size={14} /> Edit Artikel
                </button>
                <button
                  onClick={() => handleToggle(selected.id, selected.isPublished)}
                  style={{
                    padding: "8px 13px", borderRadius: "6px", border: "1px solid var(--ajs-border)",
                    background: selected.isPublished ? "#FFF1F2" : "#F0FDF4",
                    color: selected.isPublished ? "#E11D48" : "#166534",
                    fontSize: "12px", fontWeight: "700", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  {selected.isPublished ? <Clock size={13} /> : <CheckCircle2 size={13} />}
                  {selected.isPublished ? "Set Draft" : "Publish"}
                </button>
                <button
                  onClick={() => handleGoogleSubmit(selected.id, selected.slug)}
                  disabled={!selected.isPublished || submittingId === selected.id}
                  style={{
                    padding: "8px 13px", borderRadius: "6px", border: "none",
                    background: "#4285F4", color: "white",
                    fontSize: "12px", fontWeight: "700",
                    cursor: selected.isPublished ? "pointer" : "not-allowed",
                    opacity: selected.isPublished ? 1 : 0.45,
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  <Globe size={13} /> {submittingId === selected.id ? "..." : "Google"}
                </button>
                <button onClick={() => handleShare(selected.title, selected.slug)} title="Share" style={{ ...btnIcon, color: "var(--ajs-navy)" }}>
                  <Share2 size={14} />
                </button>
                <button onClick={() => handleCopy(selected.slug)} title="Salin link" style={{ ...btnIcon, color: "var(--ajs-teal)" }}>
                  <Link2 size={14} />
                </button>
                <a
                  href={`/artikel/${selected.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Lihat di halaman publik"
                  style={{ ...btnIcon, color: "var(--ajs-muted)", textDecoration: "none" }}
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* Status bar */}
            <div style={{ padding: "8px 20px", borderBottom: "1px solid var(--ajs-border)", background: "var(--ajs-gray)", display: "flex", gap: "12px", alignItems: "center", fontSize: "11px" }}>
              {selected.isPublished ? (
                <span style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "700", color: "#43A047" }}>
                  <CheckCircle2 size={12} /> PUBLISHED
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: "5px", fontWeight: "700", color: "#FB8C00" }}>
                  <Clock size={12} /> DRAFT
                </span>
              )}
              {selected.seoDescription && (
                <span style={{ color: "var(--ajs-muted)", borderLeft: "1px solid var(--ajs-border)", paddingLeft: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "480px" }}>
                  SEO: {selected.seoDescription}
                </span>
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
              <pre style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
                fontSize: "14px",
                lineHeight: "1.75",
                color: "#2d3748",
                margin: 0,
              }}>
                {selected.content || "Konten tidak tersedia."}
              </pre>
            </div>
          </>
        )}

        {/* ── EDIT MODE ── */}
        {selected && editMode && (
          <>
            {/* Toolbar */}
            <div style={{
              padding: "12px 20px",
              borderBottom: "1px solid var(--ajs-border)",
              background: "var(--ajs-gray)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
            }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--ajs-navy)", display: "flex", alignItems: "center", gap: "7px" }}>
                <Pencil size={13} /> Mode Edit
              </span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--ajs-border)", fontSize: "12px", background: "white" }}
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                </select>
                <button
                  onClick={handleCancelEdit}
                  style={{ padding: "7px 14px", borderRadius: "6px", border: "1px solid var(--ajs-border)", background: "white", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <X size={13} /> Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ padding: "7px 18px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Save size={13} /> {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>

            {/* Form */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "grid", gap: "20px", alignContent: "start" }}>

              {/* Title */}
              <div style={{ display: "grid", gap: "7px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontWeight: "700", fontSize: "13px" }}>Judul Artikel</label>
                  <button
                    type="button"
                    onClick={handleSuggestTitles}
                    disabled={suggesting}
                    style={{ padding: "4px 10px", background: "white", color: "var(--ajs-teal)", border: "1px solid var(--ajs-teal)", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}
                  >
                    {suggesting ? "Mencari..." : "🪄 Suggest Judul SEO"}
                  </button>
                </div>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--ajs-border)", fontSize: "15px", fontWeight: "600", width: "100%" }}
                />
                {suggestions.length > 0 && (
                  <div style={{ padding: "12px", background: "var(--ajs-gray)", borderRadius: "8px", border: "1px solid var(--ajs-border)" }}>
                    <p style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: "700", color: "var(--ajs-muted)", textTransform: "uppercase" }}>Pilih Judul:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setEditTitle(s); setSuggestions([]); }}
                          style={{ padding: "5px 10px", background: "white", border: "1px solid var(--ajs-border)", borderRadius: "20px", fontSize: "12px", cursor: "pointer", textAlign: "left" }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Author + Version */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "grid", gap: "7px" }}>
                  <label style={{ fontWeight: "700", fontSize: "13px" }}>Penulis</label>
                  <input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--ajs-border)", fontSize: "14px", width: "100%" }} />
                </div>
                <div style={{ display: "grid", gap: "7px" }}>
                  <label style={{ fontWeight: "700", fontSize: "13px" }}>Versi</label>
                  <input value={editVersion} onChange={(e) => setEditVersion(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--ajs-border)", fontSize: "14px", width: "100%" }} />
                </div>
              </div>

              {/* Content */}
              <div style={{ display: "grid", gap: "7px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ fontWeight: "700", fontSize: "13px" }}>Konten (Markdown)</label>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    style={{ padding: "4px 12px", background: "var(--ajs-navy)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "700" }}
                  >
                    {generating ? "Menulis..." : "🪄 Generate Ulang"}
                  </button>
                </div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{
                    minHeight: "380px",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1px solid var(--ajs-border)",
                    fontSize: "13px",
                    lineHeight: "1.65",
                    fontFamily: "ui-monospace, 'SF Mono', monospace",
                    resize: "vertical",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <p style={{ margin: 0, padding: "12px 16px", background: "var(--ajs-gray)", borderRadius: "8px", fontSize: "12px", color: "var(--ajs-muted)" }}>
                SEO meta description & keywords di-regenerasi otomatis saat disimpan menggunakan <strong>{selectedModel}</strong>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
