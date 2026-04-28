import { getArticleBySlug, getRelatedArticles } from "@/features/cms/article.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LandingHeader } from "@/features/landing-page/landing-header";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Artikel Tidak Ditemukan' };

  return {
    title: `${article.title} | Arkama Jaya Sertifikasi`,
    description: article.seoDescription,
    keywords: article.seoKeywords,
    openGraph: {
      title: article.title,
      description: article.seoDescription,
      images: article.imageUrl ? [article.imageUrl] : [],
    }
  };
}

export default async function PublicArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const relatedArticles = await getRelatedArticles(slug);

  if (!article) {
    notFound();
  }

  // Format the date
  const publishDate = new Date(article.publishDate || article.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8F9FA' }}>
      <LandingHeader />
      
      <div style={{ flex: 1, padding: '120px 20px 60px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="article-layout">
          
          <aside className="article-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--ajs-navy)', borderBottom: '2px solid var(--ajs-teal)', paddingBottom: '10px', marginBottom: '10px' }}>
              Artikel Terkait
            </h3>
            {relatedArticles.length === 0 ? (
              <p style={{ color: 'var(--ajs-muted)', fontSize: '14px' }}>Belum ada artikel terkait.</p>
            ) : (
              relatedArticles.map((related: any) => (
                <Link key={related.slug} href={`/artikel/${related.slug}`} style={{ textDecoration: 'none', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {related.imageUrl ? (
                    <div style={{ width: '80px', height: '60px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden' }}>
                      <img src={related.imageUrl} alt={related.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '80px', height: '60px', flexShrink: 0, borderRadius: '6px', background: 'var(--ajs-gray)' }} />
                  )}
                  <div>
                    <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--ajs-navy)', lineHeight: 1.3, fontWeight: '600' }}>
                      {related.title.length > 50 ? related.title.substring(0, 50) + '...' : related.title}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--ajs-muted)' }}>
                      {new Date(related.publishDate || related.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </aside>

          <main style={{ minWidth: 0 }}>
            <article className="britsafe-card" style={{ padding: '40px', background: 'white' }}>
          {article.imageUrl && (
            <div style={{ marginBottom: '30px', borderRadius: '12px', overflow: 'hidden' }}>
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' }} 
              />
            </div>
          )}
          
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'var(--ajs-navy)', marginBottom: '16px', lineHeight: 1.2 }}>
            {article.title}
          </h1>
          
          <div style={{ display: 'flex', gap: '16px', color: 'var(--ajs-muted)', fontSize: '14px', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid var(--ajs-border)' }}>
            <span>Oleh: <strong>{article.author}</strong></span>
            <span>&bull;</span>
            <span>{publishDate}</span>
          </div>

          <div 
            className="article-content"
            style={{ 
              fontSize: '16px', 
              lineHeight: '1.8', 
              color: '#333'
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
            </article>
          </main>
        </div>
      </div>

      <footer className="britsafe-footer">
        <div className="container">
          <div className="britsafe-footer__bottom" style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--ajs-navy)', color: 'white' }}>
            <p>&copy; {new Date().getFullYear()} ARKAMA JAYA SERTIFIKASI. Semua hak dilindungi.</p>
            <p style={{ opacity: 0.5 }}>Excellence in Safety Certification</p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 992px) {
          .article-layout { grid-template-columns: 300px 1fr !important; }
        }
        .article-sidebar a:hover h4 { color: var(--ajs-teal) !important; }
        .article-content h2 { margin-top: 32px; margin-bottom: 16px; font-size: 24px; color: var(--ajs-navy); }
        .article-content h3 { margin-top: 24px; margin-bottom: 12px; font-size: 20px; color: var(--ajs-navy); }
        .article-content p { margin-bottom: 20px; }
        .article-content ul { margin-bottom: 20px; padding-left: 20px; }
        .article-content li { margin-bottom: 8px; }
        .article-content a { color: var(--ajs-teal); text-decoration: none; }
        .article-content a:hover { text-decoration: underline; }
        .article-content blockquote { border-left: 4px solid var(--ajs-teal); padding-left: 16px; margin: 20px 0; color: #666; font-style: italic; }
      `}} />
    </div>
  );
}
