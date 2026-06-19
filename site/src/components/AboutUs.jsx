import React from 'react';
import { useApp } from '../context/AppContext';
import './AboutUs.css';

export default function AboutUs() {
  const { t, language } = useApp();

  const pick = (ro, en, hu) => {
    if (language === 'hu') return hu;
    if (language === 'en') return en;
    return ro;
  };

  const timelineItems = [
    {
      year: 'Martie 2017',
      title: pick('Ideea primei felii 🍰', 'The First Slice Idea 🍰', 'Az első szelet ötlete 🍰'),
      desc: pick(
        'Totul a pornit de la gustul consacrat de cheesecake american, bazat pe cremă de brânză, lucru care pe atunci nu era de găsit prin țară. Prima rețetă a fost împrumutată de pe Pinterest și perfecționată în bucătăria de acasă timp de 6 luni.',
        'It all started from the established taste of American cream cheese-based cheesecake, which was hard to find in the country back then. The first recipe was borrowed from Pinterest and perfected in the home kitchen over 6 months.',
        'Minden az amerikai krémsajtos sajttorta ismert ízével kezdődött, amit akkoriban alig lehetett megtalálni az országban. Az első recept a Pinterestről érkezett, majd 6 hónapon át tökéletesítettük az otthoni konyhában.'
      ),
      image: 'https://assets.boosteat.com/images/c165/2024-07-09/20240709100413212668d0b1d9a9d5/image.png'
    },
    {
      year: 'Octombrie 2017',
      title: pick('Primul punct de lucru 🏪', 'First Physical Location 🏪', 'Első üzletünk 🏪'),
      desc: pick(
        'Am deschis porțile primului nostru punct de lucru oficial în Târgu Mureș, transformând pasiunea de acasă într-un brand iubit pe plan local.',
        'We opened the doors of our first official physical location in Târgu Mureș, transforming home passion into a locally beloved brand.',
        'Megnyitottuk első hivatalos üzletünket Marosvásárhelyen, és az otthoni szenvedélyből helyben szeretett márkát építettünk.'
      ),
      image: 'https://assets.boosteat.com/images/c165/2024-04-11/202404111109122126617c4d828492/image.jpg'
    },
    {
      year: '2020',
      title: pick('Certificare & Calitate 🏅', 'Quality Certification 🏅', 'Minőségi tanúsítás 🏅'),
      desc: pick(
        'Am obținut certificarea pentru producție artizanală și am extins colaborările cu restaurantele partenere din Transilvania, consolidând reputația de laborator de referință.',
        'We obtained artisan production certification and expanded partnerships with restaurants across Transylvania, cementing our reputation as a leading patisserie lab.',
        'Megszereztük a kézműves termelési tanúsítványt, és bővítettük együttműködéseinket erdélyi partneréttermeinkkel, megerősítve vezető cukrászati laboratóriumi hírnevünket.'
      ),
      image: 'https://assets.boosteat.com/images/c165/2024-04-11/202404111109042126617c4d0cc3ad/image.jpg'
    },
    {
      year: '2021',
      title: pick('Standardizare & Francizare 📋', 'Standardization & Franchising 📋', 'Standardizálás és franchise 📋'),
      desc: pick(
        'Am început colaborarea cu Frenchwise pentru a dezvolta manualele de francizare. Acest parteneriat ne-a eficientizat procesele administrative, de producție în cofetării și în laborator.',
        'We started working with Frenchwise to develop franchise manuals. This partnership streamlined our administrative, production, and laboratory workflows.',
        'Megkezdtük együttműködésünket a Frenchwise-zal a franchise kézikönyvek kidolgozására. Ez a partnerség egyszerűsítette adminisztratív, gyártási és laborfolyamatainkat.'
      ),
      image: 'https://assets.boosteat.com/images/c165/2024-07-09/20240709100154212668d0a92d7f80/image.png'
    },
    {
      year: '2022',
      title: pick('Renovare & Rebranding 🎨', 'Renovation & Rebranding 🎨', 'Felújítás és arculatfrissítés 🎨'),
      desc: pick(
        'Am realizat un proces complet de rebranding și am renovat în totalitate cofetăria din Târgu Mureș pentru a o alinia la viziunea modernă și elegantă a brandului.',
        'We executed a complete rebranding process and fully renovated the bakery in Târgu Mureș to align it with our modern and elegant brand vision.',
        'Teljes rebrandinget hajtottunk végre, és teljesen felújítottuk a marosvásárhelyi cukrászdát, hogy illeszkedjen a márka modern és elegáns víziójához.'
      ),
      image: 'https://assets.boosteat.com/images/c165/2024-04-11/202404111109182126617c4dec3a46/image.jpg'
    },
    {
      year: '2023',
      title: pick('A doua locație în Târgu Mureș 🚀', 'Second Location in Târgu Mureș 🚀', 'Második üzlet Marosvásárhelyen 🚀'),
      desc: pick(
        'Am deschis cea de-a doua cofetărie în Târgu Mureș, pe Bd. Pandurilor 114-116, extinzând prezența noastră în oraș pentru a fi și mai aproape de clienții noștri fideli.',
        'We opened our second pastry shop in Târgu Mureș, at Bd. Pandurilor 114-116, expanding our presence to be even closer to our loyal customers.',
        'Megnyitottuk második marosvásárhelyi cukrászdánkat, a Pandurilor 114-116. számú bulváron, terjeszkedve, hogy még közelebb kerüljünk hűséges ügyfeleinkhez.'
      ),
      image: 'https://assets.boosteat.com/images/c211/2024-04-11/202404111148323266617ce109cf5f/image.jpg'
    },
    {
      year: '2024',
      title: pick('Expansiune în Câmpia Turzii 📍', 'Expansion to Câmpia Turzii 📍', 'Terjeszkedés Aranyosgyéresen 📍'),
      desc: pick(
        'Am deschis o nouă locație în Câmpia Turzii, pe Str. 1 Decembrie 1918 nr. 3-5, aducând lingurițe de bunătate mai aproape de iubitorii de dulce din regiune.',
        'We opened a new location in Câmpia Turzii, at Str. 1 Decembrie 1918 no. 3-5, bringing our sweet creations closer to dessert lovers in the region.',
        'Új helyszínt nyitottunk Aranyosgyéresen, az 1918. december 1. utca 3-5. szám alatt, közelebb hozva édes finomságainkat a régió édességkedvelőihez.'
      ),
      image: 'https://assets.boosteat.com/images/c165/2024-04-11/202404111120092126617c769f16c4/image.jpg'
    },
    {
      year: 'Prezent',
      title: pick('Laboratorul Nostru Premium 🧑‍🍳', 'Our Premium Laboratory 🧑‍🍳', 'Prémium laborunk 🧑‍🍳'),
      desc: pick(
        'Astăzi operăm un laborator modern de 200 mp unde lucrează 10 angajați calificați, cu o capacitate de producție de 200 produse/zi. Deservim 3 locații proprii în Târgu Mureș și Câmpia Turzii, alături de parteneriate cu restaurante de renume.',
        'Today we operate a modern 200 sqm laboratory with 10 skilled staff members and a production capacity of 200 products per day, serving our 3 locations in Târgu Mureș and Câmpia Turzii and partner restaurants.',
        'Ma egy modern, 200 négyzetméteres laboratóriumot működtetünk 10 képzett munkatárssal és napi 200 sajttorta DSV-tanúsított kapacitással. 3 saját üzletet és több mint 15 partneréttermet szolgálunk ki.'
      ),
      image: 'https://assets.boosteat.com/images/c165/2024-07-09/20240709102004212668d0ed471f47/image.png'
    }
  ];

  return (
    <section className="about-section">
      <div className="about-container">
        
        {/* Calligraphy Intro Section */}
        <div className="about-intro-hero">
          <span className="section-subtitle">{t('aboutSubtitle')}</span>
          <h1 className="about-main-title">{pick('Despre Noi', 'About Us', 'Rólunk')}</h1>
          <div className="gold-divider"></div>
          
          <div className="about-quote-container">
            <p className="about-quote-text">
              {pick(
                '„Din căutarea simplităţii, a bucuriei, a micilor plăceri & a unui simplu moment a luat naștere dintr-o pasiune felia care avea să ajungă un statement al perseverenţei și seriozităţii cu care ne tratăm produsele.”',
                '"From the search for simplicity, joy, small pleasures, and one simple moment, our signature slice was born from passion and became a statement of the perseverance and seriousness with which we treat our products."',
                '"Az egyszerűség, az öröm, az apró élvezetek és egy egyszerű pillanat kereséséből született meg szenvedélyből az a szelet, amely kitartásunk és a termékeinkhez való komoly hozzáállásunk jelképe lett."'
              )}
            </p>
            <span className="about-quote-motto">Find joy in the simple.</span>
          </div>
        </div>

        {/* Narrative Grid */}
        <div className="about-narrative-grid">
          <div className="about-narrative-card">
            <h3>{pick('Misiunea Noastră', 'Our Mission', 'Küldetésünk')}</h3>
            <p>
              {pick(
                'Misiunea noastră este să propunem diversitate în simplitate prin varietatea de arome, texturi și gusturi cu care se identifică produsele noastre artizanale. Ne dorim ca Laborator Emanuela să ofere tuturor dorința de aprofundare a bucuriei prin lucruri simple, aparent mărunte, însă cu potențial mare de transformare.',
                'Our mission is to offer diversity in simplicity through the variety of flavors, textures, and tastes that identify our artisan pastries. We want Laborator Emanuela to inspire everyone to find joy in simple things.',
                'Küldetésünk, hogy az egyszerűségben rejlő sokszínűséget mutassuk meg kézműves süteményeink ízein, textúráin és karakterén keresztül. Azt szeretnénk, hogy a Laborator Emanuela mindenkit arra inspiráljon, hogy az egyszerű dolgokban találja meg az örömöt.'
              )}
            </p>
            <p>
              {pick(
                'Pregătim totul cu atenție până la ultimul element dulce pus pe cheesecake, dar ceea ce oferă desertului aura specială este tehnica și ingredientele folosite. Folosim ce e mai bun de la natură și alegem de fiecare dată ingrediente naturale, pe care le mixăm cu grijă și le coacem la temperatura potrivită.',
                'We carefully prepare everything down to the last sweet element, but what gives the dessert its special aura is the technique and ingredients. We use nature\'s best, choosing natural ingredients mixed with care and baked perfectly.',
                'Mindent gondosan készítünk el az utolsó édes részletig, de desszertjeink különleges auráját a technika és az alapanyagok adják. A természet legjobbját használjuk, gondosan keverjük és tökéletes hőmérsékleten sütjük.'
              )}
            </p>
          </div>
          
          <div className="about-narrative-card">
            <h3>{pick('Vitrina Noastră', 'Our Showcase', 'Kirakatunk')}</h3>
            <p>
              {pick(
                'În vitrinele noastre sunt mereu 12 sortimente proaspete de cheesecake, pe lângă Pavlove delicate, Cookies mari și Bread-uri făcute în casă. Toate produsele noastre sunt create ținând cont de sezonalitate, respectând natura și menținând prețuri decente pentru a minimiza risipa.',
                'In our display cases there are always 12 fresh varieties of cheesecake, alongside delicate Pavlovas, large Cookies, and home-baked Bread. All our treats are made with seasonality in mind, respecting nature and minimizing waste.',
                'Vitrineinkben mindig 12 friss sajttorta-változat található, finom Pavlovák, nagy kekszek és házi kenyerek mellett. Minden termékünk a szezonalitást tiszteletben tartva készül, a pazarlás csökkentésére figyelve.'
              )}
            </p>
            <div className="showcase-highlights">
              <div className="highlight-item">
                <strong>Joy Of The Month</strong>
                <span>{pick('Un sortiment inedit, creat special în fiecare lună.', 'A unique variety, specially created every single month.', 'Egyedi íz, amelyet minden hónapban külön megalkotunk.')}</span>
              </div>
              <div className="highlight-item">
                <strong>Taste Of The Week</strong>
                <span>{pick('Arome iubite introduse săptămânal.', 'Beloved flavors introduced on a weekly basis.', 'Kedvelt ízek heti rendszerességgel.')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="about-timeline-section">
          <h2 className="timeline-section-title text-center">{pick('Cronologia Reușitelor Noastre', 'Our Achievements Timeline', 'Eredményeink idővonala')}</h2>
          <p className="timeline-subtitle text-center">
            {pick('Parcursul nostru de la prima rețetă perfecționată acasă până la laboratorul artizanal de astăzi', 'Our journey from the first home-perfected recipe to today\'s artisan laboratory', 'Utunk az első otthon tökéletesített recepttől a mai kézműves laboratóriumig')}
          </p>
          
          <div className="timeline-container">
            <div className="timeline-line"></div>
            
            {timelineItems.map((item, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div key={index} className={`timeline-item ${isLeft ? 'left' : 'right'}`}>
                  <div className="timeline-badge">{item.year}</div>
                  <div className="timeline-content">
                    {item.image && (
                      <div className="timeline-img-wrapper">
                        <img src={item.image} alt={item.title} className="timeline-img" loading="lazy" />
                      </div>
                    )}
                    <div className="timeline-text-wrapper">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seals Section */}
        <div className="about-achievements">
          <h3>{pick('Distincții & Certificări', 'Distinctions & Certifications', 'Díjak és minősítések')}</h3>
          <p className="achievements-intro text-center">
            {pick(
              'Suntem mândri de recunoașterea eforturilor noastre de a menține cele mai înalte standarde culinare din România.',
              'We are proud of the official recognition of our efforts to maintain the highest culinary standards in Romania.',
              'Büszkék vagyunk arra az elismerésre, amelyet a legmagasabb romániai kulináris standardok fenntartásáért végzett munkánkért kaptunk.'
            )}
          </p>
          <div className="achievements-seals-row">
            <div className="seal-card">
              <div className="seal-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', background: 'var(--color-gold-muted)', borderRadius: '12px', width: '80px', height: '80px' }}>🏅</div>
              <div className="seal-info">
                <h4>{pick('Producător Artizanal Certificat', 'Certified Artisan Producer', 'Tanúsított kézműves termelő')}</h4>
                <p>{pick(
                  'Laborator Emanuela produce exclusiv artizanal, folosind ingrediente naturale selectate cu grijă în fiecare produs.',
                  'Laborator Emanuela produces exclusively artisan goods, using carefully selected natural ingredients in every product.',
                  'A Laborator Emanuela kizárólag kézműves termékeket gyárt, gondosan válogatott természetes alapanyagok felhasználásával.'
                )}</p>
              </div>
            </div>

            <div className="seal-card">
              <img 
                src="https://assets.boosteat.com/images/c165/2024-07-08/20240708103123212668bbffb2ba85/image.png" 
                alt="Best Takeaway Food 2023 - Restaurant Guru" 
                className="seal-img"
              />
              <div className="seal-info">
                <h4>Best Takeaway Food</h4>
                <p>{pick(
                  'Premiu oferit de Restaurant Guru în 2023, reflectând recenziile și aprecierile excelente ale clienților noștri.',
                  'Awarded by Restaurant Guru in 2023, reflecting the excellent reviews and ratings from our customers.',
                  'A Restaurant Guru által 2023-ban odaítélt díj, amely ügyfeleink kiváló értékeléseit tükrözi.'
                )}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="about-stats-panel-row">
          <div className="stat-card-glow">
            <span className="stat-num">3</span>
            <span className="stat-label">{pick('Locații Fizice', 'Physical Shops', 'Fizikai üzletek')}</span>
            <span className="stat-sub">Tg. Mureș, Câmpia Turzii</span>
          </div>
          <div className="stat-card-glow">
            <span className="stat-num">200m²</span>
            <span className="stat-label">{pick('Laborator Premium', 'Premium Lab', 'Prémium labor')}</span>
            <span className="stat-sub">{pick('Tehnologie de vârf', 'State-of-the-art tech', 'Modern technológia')}</span>
          </div>
          <div className="stat-card-glow">
            <span className="stat-num">200+</span>
            <span className="stat-label">{pick('Torturi / zi', 'Cakes / Day', 'Torta / nap')}</span>
            <span className="stat-sub">{pick('Capacitate DSV', 'DSV-certified capacity', 'DSV tanúsított kapacitás')}</span>
          </div>
          <div className="stat-card-glow">
            <span className="stat-num">15+</span>
            <span className="stat-label">{pick('Restaurante Partenere', 'Restaurant Partners', 'Partner éttermek')}</span>
            <span className="stat-sub">{pick('În Transilvania', 'Across Transylvania', 'Erdély-szerte')}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
