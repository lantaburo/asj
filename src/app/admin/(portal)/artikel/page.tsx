import { listArticles } from "@/features/cms/article.service";
import { ArticlesClient } from "@/features/cms/articles-client";

export default async function ArticlesPage() {
  const articles = await listArticles();

  return <ArticlesClient initialArticles={articles} />;
}
