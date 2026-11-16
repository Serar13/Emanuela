import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getArticle } from '../services/content';
import './JournalPage.css';

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(undefined);
  useEffect(() => { getArticle(slug).then((row) => {
    setArticle(row);
    if (row?.seoTitle || row?.title) document.title = row.seoTitle || `${row.title} | Laborator Emanuela`;
  }); }, [slug]);
  if (article === undefined) return <div className="article-state">Se încarcă…</div>;
  if (!article) return <div className="article-state"><h1>Articolul nu a fost găsit.</h1><Link to="/jurnal">Înapoi la jurnal</Link></div>;
  return <article className="article-page">
    <header><Link to="/jurnal">← Jurnal Emanuela</Link><small>{article.category || 'Din laborator'}</small><h1>{article.title}</h1><p>{article.excerpt}</p><div>{article.author || 'Echipa Emanuela'} · {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('ro-RO') : 'Emanuela'}</div></header>
    {article.imageUrl && <img className="article-cover" src={article.imageUrl} alt={article.title} />}
    <div className="article-body">{String(article.content || '').split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
  </article>;
}
