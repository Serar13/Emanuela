import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getActiveProducts, getApprovedReviews } from '../services/catalog';
import { getPublishedArticles, getSiteContent } from '../services/content';
import './Home.css';

const FALLBACK_REVIEWS = [
  {
    id: 'alexandra-nemes',
    name: 'Alexandra Nemes',
    text: 'Foarte bun tortul comandat pentru botezul fiului nostru. Candy bar-ul a fost la fel de delicios!',
  },
  {
    id: 'kristina-cuc',
    name: 'Kristina Cuc',
    text: 'Super delicii, super pufoșenii. Bunătate în fiecare detaliu.',
  },
  {
    id: 'andreea-suciu',
    name: 'Andreea Liliana Suciu',
    text: 'Sunteți enervanți de perfecți! Cele mai bune produse!',
  },
];

const DEFAULT_COLLECTIONS = [
  {
    number: '01',
    title: 'Torturi cu poveste',
    text: 'Aniversări, nunți și zile care merită un tort creat doar pentru ele.',
    image: '/images/editorial/cake-square-02.jpeg',
    to: '/meniu',
  },
  {
    number: '02',
    title: 'Candy bar',
    text: 'Un colț dulce construit în jurul oamenilor, temei și atmosferei evenimentului.',
    image: '/images/candy-bar-01.png',
    to: '/candy-bar',
  },
  {
    number: '03',
    title: 'Mici bunătăți',
    text: 'Monoporții, macarons și prăjituri artizanale pentru momentele de zi cu zi.',
    image: '/images/editorial/event-wide.jpeg',
    to: '/meniu',
  },
];

const DEFAULT_JOURNAL = [
  {
    category: 'Ghid Emanuela',
    title: 'Cum comanzi un tort online?',
    text: 'De la numărul de porții la compoziție și decor: pașii unei comenzi fără surprize.',
    image: '/images/editorial/pastry-square-01.jpeg',
    href: 'https://laboratoremanuela.ro/cum-comanzi-un-tort-online/',
  },
  {
    category: 'Evenimente',
    title: '7 pași pentru un Candy Bar de vis',
    text: 'Gramaj, varietate, culori și detalii care transformă masa de desert într-un punct de atracție.',
    image: '/images/candy-bar-02.png',
    href: 'https://laboratoremanuela.ro/7-pasi-pentru-un-candy-bar-de-vis/',
  },
  {
    category: 'Din laborator',
    title: 'Cine suntem și de ce facem ce facem',
    text: 'O afacere de familie crescută în jurul deserturilor și al momentelor importante.',
    image: '/images/editorial/atelier-seasonal.jpg',
    href: 'https://laboratoremanuela.ro/cine-suntem-si-de-ce-facem-ce-facem/',
  },
];

export default function Home() {
  const { locations } = useApp();
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [content, setContent] = useState({});
  const [articles, setArticles] = useState(DEFAULT_JOURNAL);

  useEffect(() => {
    let active = true;
    Promise.all([getActiveProducts(), getApprovedReviews(), getSiteContent('home'), getPublishedArticles()])
      .then(([productRows, reviewRows, homeContent, articleRows]) => {
        if (!active) return;
        const featured = productRows.filter((product) => product.featured);
        setProducts((featured.length ? featured : productRows).slice(0, 3));
        if (reviewRows.length) setReviews(reviewRows.slice(0, 3));
        if (homeContent) setContent(homeContent);
        if (articleRows.length) setArticles(articleRows.slice(0, 3));
      })
      .catch((error) => console.error('Home content failed:', error));
    return () => { active = false; };
  }, []);

  const collections = DEFAULT_COLLECTIONS.map((item, index) => {
    const key = index + 1;
    return {
      ...item,
      title: content[`collection${key}Title`] || item.title,
      text: content[`collection${key}Text`] || item.text,
      image: content[`collection${key}Image`] || item.image,
    };
  });
  const heroTitle = content.heroTitle || 'Momentele mari încep cu o linguriță.';
  const heroWords = heroTitle.split(' ');
  const heroAccent = heroWords.pop();

  return (
    <div className="em-home">
      <section className="em-hero">
        <div className="em-hero-copy">
          <p className="em-eyebrow">{content.eyebrow || 'Laborator de prăjituri · Târgu Mureș'}</p>
          <h1>{heroWords.join(' ')} <em>{heroAccent}</em></h1>
          <p className="em-hero-lead">
            {content.heroLead || 'Deserturi artizanale, torturi și candy bar-uri create pentru zilele pe care vrei să le ții minte.'}
          </p>
          <div className="em-hero-actions">
            <Link className="em-button em-button-primary" to="/meniu">Descoperă bunătățile</Link>
            <Link className="em-text-link" to="/candy-bar">Planifică un eveniment <span>↗</span></Link>
          </div>
          <div className="em-hero-proof">
            <span><strong>{content.yearsValue || '19+'}</strong> {content.yearsLabel || 'ani de pasiune'}</span>
            <span><strong>{content.locationsValue || '4'}</strong> {content.locationsLabel || 'experiențe Emanuela'}</span>
            <span><strong>{content.careValue || '100%'}</strong> {content.careLabel || 'pregătit cu grijă'}</span>
          </div>
        </div>

        <div className="em-hero-visual" aria-label="Selecție Laborator Emanuela">
          <div className="em-hero-image-main">
            <img src={content.heroImage || '/images/hero-events-wide.jpeg'} alt="Candy bar Laborator Emanuela" />
          </div>
          <div className="em-hero-image-detail">
            <img src={content.heroDetailImage || '/images/mousse-baby-pink.jpeg'} alt="Mousse Baby Pink" />
          </div>
          <span className="em-hero-note">pregătit în laborator<br />pentru tine</span>
        </div>
      </section>

      <div className="em-ribbon" aria-hidden="true">
        <span>Torturi aniversare</span><i>✦</i><span>Prăjituri</span><i>✦</i>
        <span>Candy bar</span><i>✦</i><span>Evenimente</span><i>✦</i><span>Monoporții</span>
      </div>

      <section className="em-section em-collections">
        <header className="em-section-head">
          <div><p className="em-eyebrow">Alege momentul</p><h2>Bunătate, în toate formele ei.</h2></div>
          <p>De la o prăjitură luată în drum spre casă până la masa dulce a unui eveniment cu sute de invitați.</p>
        </header>

        <div className="em-collection-grid">
          {collections.map((collection) => (
            <Link className="em-collection-card" to={collection.to} key={collection.title}>
              <img src={collection.image} alt={collection.title} />
              <span className="em-card-number">{collection.number}</span>
              <div className="em-collection-copy">
                <h3>{collection.title}</h3>
                <p>{collection.text}</p>
                <span className="em-card-link">Explorează <b>↗</b></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="em-section em-products-section">
        <div className="em-products-intro">
          <p className="em-eyebrow">Din vitrină</p>
          <h2>Preferatele<br /><em>momentului.</em></h2>
          <p>Texturi fine, gusturi familiare și mici surprize care se schimbă odată cu sezonul.</p>
          <Link className="em-text-link dark" to="/meniu">Vezi meniul complet <span>→</span></Link>
        </div>

        <div className="em-product-strip">
          {(products.length ? products : [
            { id: 'pink', name: 'Mousse Baby Pink', image: '/images/mousse-baby-pink.jpeg', price: 16 },
            { id: 'choco', name: 'Tort Choco Vanilla', image: '/images/tort-choco-vanilla.jpeg', price: 127.5 },
            { id: 'macarons', name: 'Macarons', image: '/images/macarons.jpg', price: 90 },
          ]).map((product, index) => (
            <Link className="em-product-editorial" to="/meniu" key={product.id}>
              <div className="em-product-image">
                <img src={product.image} alt={product.name} />
                {index === 0 && <span>Alegerea casei</span>}
              </div>
              <div><h3>{product.name}</h3><p>{Number(product.price).toFixed(2)} lei</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="em-story">
        <div className="em-story-image">
          <img src={content.storyImage || '/images/editorial/atelier-seasonal.jpg'} alt="Selecție pregătită în laborator" />
          <span className="em-script-note">aproape 20 de ani<br />de bunătate</span>
        </div>
        <div className="em-story-copy">
          <p className="em-eyebrow">Din laborator</p>
          <h2>{content.storyTitle || 'Nu facem doar deserturi. Facem parte din poveste.'}</h2>
          <p>{content.storyText || 'Botezul, nunta, aniversarea sau desertul de duminică sunt amintiri. Noi venim cu texturile, culorile și gustul care le rămân alături.'}</p>
          <blockquote>„{content.storyQuote || 'Lingurițe de bunătate, pregătite cu mult drag.'}”</blockquote>
          <Link className="em-button em-button-light" to="/despre-noi">Povestea Emanuela</Link>
        </div>
      </section>

      <section className="em-section em-event-feature">
        <div className="em-event-copy">
          <p className="em-eyebrow">Evenimente cu bun gust</p>
          <h2>{content.eventTitle || 'Un Candy Bar care atrage toate privirile. Și poftele.'}</h2>
          <p>{content.eventText || 'Alege numărul de invitați, gramajul și stilul evenimentului. Calculatorul îți oferă o estimare, iar echipa Emanuela construiește oferta finală.'}</p>
          <ul>
            <li>pachete Basic, Premium și Deluxe</li>
            <li>recomandare de gramaj pentru fiecare invitat</li>
            <li>opțiuni pentru nuntă, botez și corporate</li>
          </ul>
          <Link className="em-button em-button-primary" to="/candy-bar">Deschide calculatorul</Link>
        </div>
        <div className="em-event-collage">
          <img className="em-event-large" src={content.eventImage || '/images/candy-bar-01.png'} alt="Candy bar Emanuela" />
          <img className="em-event-small" src={content.eventDetailImage || '/images/wedding-cake-flowers.jpg'} alt="Tort de nuntă Emanuela" />
          <div className="em-event-badge"><strong>150 g</strong><span>recomandarea noastră / invitat</span></div>
        </div>
      </section>

      <section className="em-testimonials">
        <header><p className="em-eyebrow">Spus de voi</p><h2>Bunătatea se povestește mai departe.</h2></header>
        <div className="em-review-grid">
          {reviews.map((review, index) => (
            <article className="em-review" key={review.id || review.name}>
              <span className="em-review-index">0{index + 1}</span>
              <p>“{review.text}”</p>
              <footer><span>★★★★★</span><strong>{review.name}</strong></footer>
            </article>
          ))}
        </div>
      </section>

      <section className="em-section em-journal">
        <header className="em-section-head">
          <div><p className="em-eyebrow">Jurnal Emanuela</p><h2>Din culisele momentelor dulci.</h2></div>
          <p>Idei, recomandări și răspunsuri utile înainte de următoarea comandă sau următorul eveniment.</p>
        </header>
        <div className="em-journal-grid">
          {articles.map((article) => (
            <Link to={article.id ? `/jurnal/${article.id}` : article.href} className="em-journal-card" key={article.id || article.title}>
              <img src={article.imageUrl || article.image} alt="" />
              <span>{article.category}</span><h3>{article.title}</h3><p>{article.excerpt || article.text}</p><b>Citește articolul →</b>
            </Link>
          ))}
        </div>
        <Link className="em-text-link dark" to="/jurnal">Vezi toate articolele <span>→</span></Link>
      </section>

      <section className="em-locations">
        <div><p className="em-eyebrow">Ne vedem la Emanuela</p><h2>Patru locuri.<br />Aceeași bunătate.</h2></div>
        <div className="em-location-list">
          {(locations.length ? locations : [
            { id: 'unirii', name: 'Târgu Mureș · Unirii', address: 'Strada Ciucului nr. 12' },
            { id: 'tudor', name: 'Târgu Mureș · Tudor', address: 'Bulevardul Pandurilor 114–116' },
            { id: 'campia', name: 'Câmpia Turzii', address: 'Strada 1 Decembrie 1918 nr. 3–5' },
            { id: 'experience', name: 'Emanuela Experience', address: 'Strada Bartók Béla nr. 1–3' },
          ]).map((location) => (
            <Link to="/contact" key={location.id}>
              <span>{location.name.replace('Laborator Emanuela ', '')}</span><small>{location.address}</small><b>↗</b>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
