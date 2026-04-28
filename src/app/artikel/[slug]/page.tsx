import { getArticleBySlug } from "@/features/cms/article.service";
import { notFound } from "next/navigation";
import { LandingHeader } from "@/features/landing-page/landing-header";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
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

export default async function PublicArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);

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
      
      <main style={{ flex: 1, padding: '120px 20px 60px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
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

      <footer className="britsafe-footer">
        <div className="container">
          <div className="britsafe-footer__bottom" style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--ajs-navy)', color: 'white' }}>
            <p>&copy; {new Date().getFullYear()} ARKAMA JAYA SERTIFIKASI. Semua hak dilindungi.</p>
            <p style={{ opacity: 0.5 }}>Excellence in Safety Certification</p>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
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
