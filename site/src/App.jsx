import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageTransition from './components/PageTransition';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import CartSidebar from './components/CartSidebar';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import MobileAppPrompt from './components/MobileAppPrompt';
import { prefetchCatalog, preloadImages } from './services/prefetch';
// Home is the landing page — keep it in the initial bundle.
import Home from './pages/Home';
import './App.css';
import './components/Skeleton.css';

// Secondary pages are code-split and prefetched in the background once the
// app is interactive, so navigation stays instant without bloating first load.
const MenuPage = lazy(() => import('./pages/MenuPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CandyBarPage = lazy(() => import('./pages/CandyBarPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Lazy route chunks, prefetched on idle (after Home is interactive).
const ROUTE_IMPORTERS = [
  () => import('./pages/MenuPage'),
  () => import('./pages/ReservationsPage'),
  () => import('./pages/AboutPage'),
  () => import('./pages/CandyBarPage'),
  () => import('./pages/ReviewsPage'),
  () => import('./pages/ContactPage'),
  () => import('./pages/ProfilePage'),
];

const CANDY_BAR_BROCHURE_SLIDES = [
  'https://assets.unlayer.com/projects/0/1781076599848-tinywow_ofertacb_90246948_1.jpg?w=1420px',
  'https://assets.unlayer.com/projects/0/1781076614454-tinywow_ofertacb_90246948_2.jpg?w=1420px',
  'https://assets.unlayer.com/projects/0/1781076638923-tinywow_ofertacb_90246948_3.jpg?w=1420px',
  'https://assets.unlayer.com/projects/0/1781076649625-tinywow_ofertacb_90246948_4.jpg?w=1420px',
  'https://assets.unlayer.com/projects/0/1781076659460-tinywow_ofertacb_90246948_5.jpg?w=1420px',
  'https://assets.unlayer.com/projects/0/1781076669378-tinywow_ofertacb_90246948_6.jpg?w=1420px',
  'https://assets.unlayer.com/projects/0/1781076680050-tinywow_ofertacb_90246948_7.jpg?w=1420px',
  'https://assets.unlayer.com/projects/0/1781076691749-tinywow_ofertacb_90246948_8.jpg?w=1420px',
];

const CANDY_BAR_MENU_IMAGES = [
  'https://assets.boosteat.com/images/c165/2023-05-10/20230510120118212645b878ee4599/image.jpeg',
  'https://assets.boosteat.com/images/c165/2023-05-10/20230510120557212645b88a5f418f/image.jpeg',
  'https://assets.boosteat.com/images/c165/2023-05-10/20230510120611212645b88b3ac05c/image.jpeg',
  'https://assets.boosteat.com/images/c165/2023-05-10/20230510120633212645b88c9e70d1/image.jpeg',
  'https://assets.boosteat.com/images/c165/2023-05-10/20230510120530212645b888a4069f/image.jpeg',
  'https://assets.boosteat.com/images/c165/2023-05-10/20230510120628212645b88c4558cb/image.jpeg',
  'https://assets.boosteat.com/images/c165/2023-05-10/20230510120548212645b889ca1dc8/image.jpeg',
];

function prefetchRoutes() {
  const idle =
    window.requestIdleCallback || ((cb) => setTimeout(() => cb(), 200));
  ROUTE_IMPORTERS.forEach((imp) => idle(() => imp().catch(() => {})));
}

function preconnect(url) {
  const origin = new URL(url).origin;
  if (document.head.querySelector(`link[data-preconnect="${origin}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = origin;
  link.crossOrigin = 'anonymous';
  link.dataset.preconnect = origin;
  document.head.appendChild(link);
}

function warmCandyBarAssets() {
  preconnect(CANDY_BAR_BROCHURE_SLIDES[0]);
  preconnect(CANDY_BAR_MENU_IMAGES[0]);
  preloadImages(CANDY_BAR_BROCHURE_SLIDES, 10000);
  preloadImages(CANDY_BAR_MENU_IMAGES, 10000);
}

function RouteFallback() {
  return (
    <div className="route-fallback" aria-hidden="true">
      <div className="skeleton skeleton-hero" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line short" />
    </div>
  );
}

function MainApp() {
  const seen =
    typeof sessionStorage !== 'undefined' &&
    sessionStorage.getItem('cch_splash_seen') === '1';
  const [splashDone, setSplashDone] = useState(seen);

  // Start warming data + route chunks immediately — this runs underneath the
  // splash so the Home page is ready by the time the intro finishes.
  useEffect(() => {
    prefetchCatalog();
    prefetchRoutes();
    warmCandyBarAssets();
  }, []);

  const finishSplash = () => {
    try {
      sessionStorage.setItem('cch_splash_seen', '1');
    } catch {
      /* sessionStorage may be unavailable (private mode) — ignore */
    }
    setSplashDone(true);
  };

  return (
    <>
      {!splashDone && <SplashScreen onDone={finishSplash} />}

      <div className="app-wrapper smooth-scroll">
        {/* Global Header */}
        <Header />

        {/* Pages Switch Router */}
        <main className="main-content-layout">
          <Suspense fallback={<RouteFallback />}>
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/meniu" element={<MenuPage />} />
                <Route path="/despre-noi" element={<AboutPage />} />
                <Route path="/candy-bar" element={<CandyBarPage />} />
                <Route path="/recenzii" element={<ReviewsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/rezervari" element={<ReservationsPage />} />
                <Route path="/profil" element={<ProfilePage />} />
              </Routes>
            </PageTransition>
          </Suspense>
        </main>

        {/* Global Overlays */}
        <CartSidebar />
        <AuthModal />
        <MobileAppPrompt />

        {/* Global Footer */}
        <Footer />
      </div>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <MainApp />
      </Router>
    </AppProvider>
  );
}
