import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Footer.css';

export default function Footer() {
  const { currentUser, setShowAuthModal, t } = useApp();

  return (
    <footer className="main-footer-section">
      <div className="footer-container">
        
        {/* Main Grid */}
        <div className="footer-main-grid">
          
          {/* Brand Col */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <img
                src="/images/logo-emanuela.webp"
                alt="Laborator Emanuela"
                className="footer-logo-img"
              />
              <div className="footer-brand-text">
                <h4>LABORATOR EMANUELA</h4>
                <span className="footer-brand-motto">{t('footerMotto')}</span>
              </div>
            </div>
            <p className="footer-description">{t('footerBrandDesc')}</p>

            {/* Social icons */}
            <div className="social-links-container">
              <a href="https://www.facebook.com/laboratoremanuela/" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://www.instagram.com/laboratoremanuela/" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-nav-col">
            <h4>{t('footerQuickLinks')}</h4>
            <ul className="footer-links-list">
              <li><Link to="/">{t('navHome')}</Link></li>
              <li><Link to="/meniu">{t('navMenu')}</Link></li>
              <li><Link to="/despre-noi">{t('navAbout')}</Link></li>
              <li><Link to="/candy-bar">{t('navCandyBar')}</Link></li>
              <li><Link to="/rezervari">{t('navReservations')}</Link></li>
              <li><Link to="/contact">{t('navContact')}</Link></li>
              {currentUser ? (
                <li><Link to="/profil" className="footer-profile-link">{t('footerProfile')}</Link></li>
              ) : (
                <li><button onClick={() => setShowAuthModal(true)} className="footer-login-link-btn">{t('footerLogin')}</button></li>
              )}
            </ul>
          </div>

          {/* Schedule Summary */}
          <div className="footer-info-col">
            <h4>{t('footerInfoTitle')}</h4>
            <div className="footer-schedule-grid">
              <div className="schedule-item">
                <span className="schedule-city">📍 Tg. Mureș — Str. Ciucului 12</span>
                <span className="schedule-hours">{t('footerMonSat')}: 08:00–20:00</span>
                <span className="schedule-hours">{t('footerSun')}: 10:00–16:00</span>
              </div>
              <div className="schedule-item">
                <span className="schedule-city">📍 Tg. Mureș — Bd. Pandurilor 114-116</span>
                <span className="schedule-hours">{t('footerMonSat')}: 08:00–20:00</span>
                <span className="schedule-hours">{t('footerSun')}: 10:00–16:00</span>
              </div>
              <div className="schedule-item">
                <span className="schedule-city">📍 Câmpia Turzii — Str. 1 Decembrie 3-5</span>
                <span className="schedule-hours">{t('footerMonSat')}: 08:00–20:00</span>
                <span className="schedule-hours">{t('footerSun')}: 10:00–16:00</span>
              </div>
            </div>
            <p className="footer-phone-events" style={{ marginTop: '16px', fontSize: '14px' }}>
              📞 {t('footerEventsPhone')}: <strong>0755 047 191</strong>
            </p>
          </div>

          {/* Mobile App Promotion Column */}
          <div className="footer-app-col">
            <h4>{t('footerAppTitle')}</h4>
            <p className="footer-app-desc">{t('footerAppDesc')}</p>
            <div className="footer-app-buttons">
              <a 
                href="https://apps.apple.com/ro/app/laborator-emanuela"
                target="_blank" 
                rel="noopener noreferrer" 
                className="app-badge-btn"
                aria-label="Download on the App Store"
              >
                <svg viewBox="0 0 170 170" width="20" height="20" fill="currentColor" className="app-badge-icon">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.13-1.92-14.35-6.12-3.57-2.8-7.5-7.7-11.78-14.7-6.27-10.27-11.21-22.18-14.84-35.72-3.63-13.54-5.45-26.33-5.45-38.39 0-16.14 3.86-29.39 11.58-39.73 7.71-10.35 17.51-15.6 29.4-15.77 5.07 0 10.37 1.34 15.9 4.03 5.53 2.7 9.39 4.03 11.57 4.03 2.05 0 5.86-1.37 11.45-4.11 5.59-2.74 10.74-4.07 15.47-4.01 13.55.25 24.16 5.17 31.83 14.75-12.63 7.64-18.86 17.75-18.7 30.33.16 10.19 3.93 18.7 11.3 25.53 7.37 6.83 16.03 10.4 25.99 10.71-2.21 6.53-4.88 13.06-8.01 19.59zM119.22 28.56c0-7.85 2.8-15.11 8.41-21.78 6.53-7.85 14.28-11.97 22.84-11.97.16.89.24 1.73.24 2.53 0 7.55-2.81 14.71-8.43 21.49-6.4 7.64-14.12 11.69-23.15 11.69-.32-1.04-.49-2.03-.49-2.96z" />
                </svg>
                <div className="app-badge-text">
                  <span className="app-badge-subtitle">Download on the</span>
                  <span className="app-badge-title">App Store</span>
                </div>
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=ro.laboratoremanuela.app"
                target="_blank" 
                rel="noopener noreferrer" 
                className="app-badge-btn"
                aria-label="Get it on Google Play"
              >
                <svg viewBox="0 0 512 512" width="20" height="20" fill="currentColor" className="app-badge-icon">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58-33.3-60.7 60.7 60.7 60.7 58-33.3c17.2-9.9 17.2-25.9 0-34.8zM325.3 277.7l60.1 60.1L104.6 499l220.7-221.3z" />
                </svg>
                <div className="app-badge-text">
                  <span className="app-badge-subtitle">GET IT ON</span>
                  <span className="app-badge-title">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-seals-bottom-section">
          <p className="footer-copyright-centered">
            © Copyright 2026 LABORATOR EMANUELA — Toate drepturile rezervate.
          </p>
          <div className="footer-legal-links-inline">
            <a href="#privacy">{t('footerPrivacy')}</a>
            <span className="inline-sep">•</span>
            <a href="#terms">{t('footerTerms')}</a>
            <span className="inline-sep">•</span>
            <a href="#cookies">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
