import { useApp } from '../context/AppContext';
import './AboutUs.css';

export default function AboutUs() {
  const { t, language } = useApp();
  const pick = (ro, en, hu) => language === 'hu' ? hu : language === 'en' ? en : ro;

  const timelineItems = [
    {
      year: pick('De aproape 20 de ani', 'For almost 20 years', 'Közel 20 éve'),
      title: pick('O afacere de familie', 'A family business', 'Családi vállalkozás'),
      desc: pick(
        'Laborator Emanuela a crescut în jurul deserturilor pregătite cu grijă, al seriozității și al relațiilor construite cu fiecare client.',
        'Laborator Emanuela grew around carefully prepared desserts, reliability, and relationships built with every customer.',
        'A Laborator Emanuela gondosan készített desszertekre, megbízhatóságra és az ügyfelekkel kialakított kapcsolatokra épült.'
      ),
      image: '/images/hero-anniversary-wide.jpg',
    },
    {
      year: 'Târgu Mureș',
      title: pick('Laborator și cofetării proprii', 'Our own laboratory and shops', 'Saját műhely és cukrászdák'),
      desc: pick(
        'De la torturi și prăjituri artizanale la comenzi personalizate, produsele Emanuela sunt pregătite pentru momentele de zi cu zi și pentru evenimente importante.',
        'From artisan cakes and pastries to custom orders, Emanuela products are made for everyday moments and important celebrations.',
        'A kézműves tortáktól és süteményektől az egyedi rendelésekig az Emanuela termékei hétköznapokra és különleges alkalmakra készülnek.'
      ),
      image: '/images/cake-citrus.jpg',
    },
    {
      year: 'Câmpia Turzii',
      title: pick('Mai aproape de comunitate', 'Closer to the community', 'Közelebb a közösséghez'),
      desc: pick(
        'Extinderea în Câmpia Turzii a dus experiența Emanuela într-o comunitate nouă, păstrând aceeași atenție pentru produs și servicii.',
        'The Câmpia Turzii location brought the Emanuela experience to a new community while keeping the same care for products and service.',
        'Az aranyosgyéresi üzlet új közösséghez vitte el az Emanuela élményt, változatlan figyelemmel a termékekre és a kiszolgálásra.'
      ),
      image: '/images/hero-birthday-wide.jpg',
    },
    {
      year: '2026',
      title: 'Emanuela Experience',
      desc: pick(
        'În centrul Târgu Mureșului, noul concept aduce împreună deserturile artizanale, cafeaua și un Dessert Bar în care fiecare își poate personaliza experiența.',
        'In central Târgu Mureș, the new concept brings together artisan desserts, coffee, and a Dessert Bar where every guest can customize the experience.',
        'Marosvásárhely központjában az új koncepció kézműves desszerteket, kávét és személyre szabható Dessert Bar élményt kínál.'
      ),
      image: '/images/hero-events-wide.jpeg',
    },
  ];

  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-intro-hero">
          <span className="section-subtitle">{t('aboutSubtitle')}</span>
          <h1 className="about-main-title">{pick('Povestea Emanuela', 'The Emanuela story', 'Az Emanuela története')}</h1>
          <div className="gold-divider" />
          <div className="about-quote-container">
            <p className="about-quote-text">
              {pick(
                '„Lingurițe de bunătate” înseamnă deserturi create cu grijă și bucuria de a fi parte din momentele importante ale oamenilor.',
                '“Spoonfuls of goodness” means desserts made with care and the joy of being part of people’s important moments.',
                'A „kanálnyi jóság” gondosan készített desszerteket és az emberek fontos pillanataiban való részvétel örömét jelenti.'
              )}
            </p>
            <span className="about-quote-motto">Lingurițe de bunătate</span>
          </div>
        </div>

        <div className="about-narrative-grid">
          <div className="about-narrative-card">
            <h3>{pick('Ce pregătim', 'What we make', 'Amit készítünk')}</h3>
            <p>{pick(
              'Prăjituri artizanale, monoporții moderne, torturi pentru aniversări, nunți și botezuri, candy bar-uri, mărturii și soluții dulci pentru evenimente corporate.',
              'Artisan pastries, modern individual desserts, cakes for birthdays, weddings and baptisms, candy bars, favors, and sweet solutions for corporate events.',
              'Kézműves sütemények, modern monodesszertek, születésnapi, esküvői és keresztelői torták, candy barok és céges rendezvénymegoldások.'
            )}</p>
          </div>
          <div className="about-narrative-card">
            <h3>{pick('Cum lucrăm', 'How we work', 'Hogyan dolgozunk')}</h3>
            <p>{pick(
              'Seriozitatea, responsabilitatea și grija pentru client sunt parte din produs. Pentru comenzile personalizate, echipa discută detaliile și confirmă soluția potrivită fiecărui eveniment.',
              'Reliability, responsibility, and customer care are part of the product. For custom orders, the team confirms every detail and the right solution for each event.',
              'A megbízhatóság, felelősség és ügyfélközpontúság a termék része. Egyedi rendelések esetén a csapat minden részletet egyeztet.'
            )}</p>
          </div>
        </div>

        <div className="about-timeline-section">
          <h2 className="timeline-section-title">{pick('Poveste în continuă creștere', 'A story that keeps growing', 'Folyamatosan növekvő történet')}</h2>
          <div className="timeline-container">
            <div className="timeline-line" />
            {timelineItems.map((item, index) => (
              <article className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} key={`${item.year}-${item.title}`}>
                <span className="timeline-badge">{item.year}</span>
                <div className="timeline-content">
                  <div className="timeline-img-wrapper"><img className="timeline-img" src={item.image} alt="" loading="lazy" /></div>
                  <div className="timeline-text-wrapper">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
