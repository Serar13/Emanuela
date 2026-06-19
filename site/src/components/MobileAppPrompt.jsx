import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './MobileAppPrompt.css';

const APP_STORE_URL = 'https://apps.apple.com/ro/app/the-cheesecake-house';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=ro.cheesecakehouse.app';
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 3;
const DOWNLOAD_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 14;

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

function getPlatform() {
  if (typeof navigator === 'undefined') return 'generic';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'generic';
}

export default function MobileAppPrompt() {
  const { t } = useApp();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [eligible, setEligible] = useState(false);

  const platform = useMemo(() => getPlatform(), []);
  const primaryHref = platform === 'android' ? PLAY_STORE_URL : APP_STORE_URL;
  const secondaryHref = platform === 'android' ? APP_STORE_URL : PLAY_STORE_URL;
  const primaryLabel = platform === 'android' ? t('mobilePromptPrimaryAndroid') : t('mobilePromptPrimaryIos');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sessionShown = sessionStorage.getItem('cch_mobile_prompt_shown') === '1';
    const pageViews = parseInt(sessionStorage.getItem('cch_mobile_prompt_views') || '0', 10) + 1;
    sessionStorage.setItem('cch_mobile_prompt_views', String(pageViews));

    const dismissedAt = parseInt(localStorage.getItem('cch_mobile_prompt_dismissed_at') || '0', 10);
    const downloadedAt = parseInt(localStorage.getItem('cch_mobile_prompt_downloaded_at') || '0', 10);
    const now = Date.now();

    const cooledDown =
      now - dismissedAt > DISMISS_COOLDOWN_MS &&
      now - downloadedAt > DOWNLOAD_COOLDOWN_MS;

    const canShow =
      isMobileViewport() &&
      !isStandaloneDisplay() &&
      !sessionShown &&
      pageViews >= 2 &&
      cooledDown &&
      location.pathname !== '/profil';

    setEligible(canShow);
  }, [location.pathname]);

  useEffect(() => {
    if (!eligible) {
      setVisible(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      sessionStorage.setItem('cch_mobile_prompt_shown', '1');
      setVisible(true);
    }, 9000);

    return () => window.clearTimeout(timer);
  }, [eligible]);

  const handleClose = () => {
    localStorage.setItem('cch_mobile_prompt_dismissed_at', String(Date.now()));
    setVisible(false);
  };

  const handleDownload = () => {
    localStorage.setItem('cch_mobile_prompt_downloaded_at', String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="mobile-app-prompt" role="dialog" aria-label={t('mobilePromptTitle')} aria-live="polite">
      <button
        type="button"
        className="mobile-app-prompt-close"
        onClick={handleClose}
        aria-label={t('closeLabel')}
      >
        ✕
      </button>

      <div className="mobile-app-prompt-copy">
        <span className="mobile-app-prompt-kicker">{t('mobilePromptKicker')}</span>
        <h3>{t('mobilePromptTitle')}</h3>
        <p>{t('mobilePromptDesc')}</p>
      </div>

      <div className="mobile-app-prompt-actions">
        <a
          href={primaryHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-app-prompt-primary"
          onClick={handleDownload}
        >
          {primaryLabel}
        </a>
        <a
          href={secondaryHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-app-prompt-secondary"
          onClick={handleDownload}
        >
          {t('mobilePromptSecondary')}
        </a>
      </div>
    </div>
  );
}
