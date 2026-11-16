import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedArticles } from '../services/content';
import './JournalPage.css';

export default function JournalPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getPublishedArticles().then(setArticles).finally(() => setLoading(false)); }, []);
  return <div className="journal-page">
    <header className="journal-hero"><p>Jurnal Emanuela</p><h1>Idei pentru momente<br /><em>cu gust.</em></h1><span>Ghiduri, povești din laborator și recomandări pentru torturi și evenimente.</span></header>
    <section className="journal-list">
      {loading && <p>Se încarcă articolele…</p>}
      {!loading && articles.length === 0 && <div className="journal-empty"><h2>Pregătim primele povești.</h2><p>Revino curând pentru articole noi din laborator.</p></div>}
      {articles.map((article, index) => <Link className="journal-item" to={`/jurnal/${article.id}`} key={article.id}>
        <div className="journal-item-image">{article.imageUrl && <img src={article.imageUrl} alt={article.title} />}<span>0{index + 1}</span></div>
        <div><small>{article.category || 'Din laborator'}</small><h2>{article.title}</h2><p>{article.excerpt}</p><b>Citește articolul →</b></div>
      </Link>)}
    </section>
  </div>;
}
