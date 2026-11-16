import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getActiveLocations } from '../services/catalog';
import { createReservation } from '../services/submissions';
import './Reservations.css';

const guestOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const timeOptions = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00',
];

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Reservations() {
  const { currentUser, setShowAuthModal, t } = useApp();
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [selectedLocId, setSelectedLocId] = useState('');
  const [formGuests, setFormGuests] = useState('2');
  const [formDate, setFormDate] = useState(today);
  const [formTime, setFormTime] = useState('18:00');
  const [formMessage, setFormMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let mounted = true;
    getActiveLocations()
      .then((rows) => {
        if (!mounted) return;
        setLocations(rows);
        setSelectedLocId(rows[0]?.id || '');
      })
      .catch((error) => {
        console.error('Reservations locations load failed:', error);
      })
      .finally(() => {
        if (mounted) setLocationsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const activeLocation = locations.find((location) => location.id === selectedLocId);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (!selectedLocId || !formDate || !formTime) {
      setFormError(t('reservationsErrorRequired'));
      return;
    }

    setSubmitting(true);
    try {
      await createReservation({
        userId: currentUser.uid,
        customerName: currentUser.name || currentUser.email || 'Client',
        locationId: selectedLocId,
        tableId: null,
        date: formDate,
        time: formTime,
        guests: Number(formGuests),
        notes: formMessage,
      });
      setFormSuccess(true);
    } catch (error) {
      console.error('createReservation failed:', error);
      setFormError(t('reservationsErrorSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="reservations-section">
      <div className="reservations-container">
        <div className="reservations-header text-center">
          <span className="section-subtitle">{t('reservationsSubtitle')}</span>
          <h1 className="reservations-main-title">{t('reservationsTitle')}</h1>
          <div className="gold-divider" />
          <p className="reservations-intro">{t('reservationsIntro')}</p>
        </div>

        <div className="reservations-card-wrapper">
          <div className="reservations-card">
            <div className="reservations-meta-top">
              <div className="location-select-group">
                <label className="input-label-meta">{t('reservationsChooseLocation')}</label>
                <select
                  value={selectedLocId}
                  onChange={(event) => setSelectedLocId(event.target.value)}
                  className="location-meta-select"
                  disabled={locationsLoading || locations.length === 0}
                >
                  {locationsLoading && <option>{t('loadingGeneric')}</option>}
                  {!locationsLoading && locations.length === 0 && <option>{t('reservationsNoLocations')}</option>}
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </div>

              {activeLocation?.phone && (
                <div className="phone-reservation-banner">
                  <div className="phone-banner-content">
                    <span className="phone-banner-label">{t('reservationsPhoneBookings')}</span>
                    <a href={`tel:${activeLocation.phone.replace(/\s+/g, '')}`} className="phone-banner-number">
                      {activeLocation.phone}
                    </a>
                  </div>
                  <a href={`tel:${activeLocation.phone.replace(/\s+/g, '')}`} className="phone-call-btn" aria-label="Sună locația">📞</a>
                </div>
              )}
            </div>

            {formSuccess ? (
              <div className="reservation-success-container animate-fade-in">
                <span className="success-badge-icon">✓</span>
                <h3>{t('reservationsSuccessTitle')}</h3>
                <p className="success-summary">
                  Cererea pentru {activeLocation?.name || 'locația aleasă'}, {formDate}, ora {formTime}, a fost înregistrată.
                </p>
                <p className="success-desc">{t('reservationsSuccessDesc')}</p>
                <button className="reset-reservation-btn" onClick={() => setFormSuccess(false)}>{t('reservationsBookAnother')}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="reservations-form">
                <div className="reservation-account-card">
                  {currentUser ? (
                    <>
                      <span className="reservation-account-label">{t('reservationsAccountLabel')}</span>
                      <strong className="reservation-account-name">{currentUser.name || currentUser.email}</strong>
                      <span className="reservation-account-meta">{currentUser.email}</span>
                    </>
                  ) : (
                    <>
                      <span className="reservation-account-label">{t('reservationsAccountRequiredTitle')}</span>
                      <p className="reservation-account-copy">{t('reservationsAccountRequiredDesc')}</p>
                      <button type="button" className="reservation-account-login-btn" onClick={() => setShowAuthModal(true)}>{t('reservationsLoginCta')}</button>
                    </>
                  )}
                </div>

                <div className="reservation-form-grid">
                  <div className="form-group-item">
                    <label>{t('reservationsGuests')}</label>
                    <select value={formGuests} onChange={(event) => setFormGuests(event.target.value)}>
                      {guestOptions.map((value) => <option key={value} value={value}>{value} {t('reservationsSeats')}</option>)}
                    </select>
                  </div>
                  <div className="form-group-item">
                    <label>{t('reservationsDate')}</label>
                    <input type="date" min={today()} required value={formDate} onChange={(event) => setFormDate(event.target.value)} />
                  </div>
                  <div className="form-group-item">
                    <label>{t('reservationsTime')}</label>
                    <select value={formTime} onChange={(event) => setFormTime(event.target.value)}>
                      {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
                    </select>
                  </div>
                </div>

                <div className="selected-table-callout animate-fade-in">
                  Disponibilitatea va fi verificată de echipa locației. Rezervarea devine valabilă după confirmare.
                </div>

                <div className="form-group-item">
                  <label>{t('reservationsMessage')}</label>
                  <textarea rows="4" placeholder={t('reservationsMessagePlaceholder')} value={formMessage} onChange={(event) => setFormMessage(event.target.value)} />
                </div>

                {formError && <p className="form-error-text">{formError}</p>}
                <button type="submit" className="reservations-submit-btn" disabled={submitting || locations.length === 0}>
                  {submitting ? t('reservationsSubmitting') : t('reservationsSubmit')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
