import { ArticleForm } from "@/features/cms/article-form";

export default function CreateArticlePage() {
  return (
    <div style={{ display: 'grid', gap: '30px' }}>
      <h1 className="britsafe-card__title">Buat Artikel Baru</h1>
      <ArticleForm />
    </div>
  );
}
