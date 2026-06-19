import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getActiveLocations } from '../services/catalog';
import {
  createReservation,
  checkReservationConflict,
} from '../services/submissions';
import './Reservations.css';

const RESERVATION_DURATION_MINUTES = 90;

const LOCATION_MAP_IMAGES = {
  'cluj-napoca': '/cluj_layout_3d.png',
  bistrita: '/bistrita_layout_3d.png',
  'tg-mures': '/tg_mures_floorplan.png',
};

/**
 * Static floor-plan table definitions calibrated against the rendered 3D plans.
 * Each hotspot uses the real table footprint instead of a generic floating badge.
 */
const STATIC_FLOOR_PLANS = {
  'cluj-napoca': [
    { id: 'cluj-1', name: 'Masa 1', seats: 4, x: 17.4, y: 45.6, w: 9.1, h: 9.1 },
    { id: 'cluj-2', name: 'Masa 2', seats: 4, x: 17.2, y: 58.1, w: 9.1, h: 9.1 },
    { id: 'cluj-3', name: 'Masa 3', seats: 4, x: 32.1, y: 57.7, w: 9.1, h: 9.1 },
    { id: 'cluj-4', name: 'Masa 4', seats: 4, x: 17.4, y: 70.4, w: 9.1, h: 9.1 },
    { id: 'cluj-5', name: 'Masa 5', seats: 4, x: 32.0, y: 69.7, w: 9.1, h: 9.1 },
    { id: 'cluj-6', name: 'Masa 6', seats: 4, x: 17.8, y: 82.6, w: 9.1, h: 9.1 },
    { id: 'cluj-7', name: 'Masa 7', seats: 4, x: 32.3, y: 82.5, w: 9.1, h: 9.1 },
    { id: 'cluj-8', name: 'Masa 8', seats: 4, x: 49.6, y: 82.2, w: 9.1, h: 9.1 },
    { id: 'cluj-9', name: 'Masa 9', seats: 4, x: 79.2, y: 31.0, w: 9.1, h: 9.1 },
    { id: 'cluj-10', name: 'Masa 10', seats: 4, x: 79.1, y: 54.5, w: 9.1, h: 9.1 },
    { id: 'cluj-11', name: 'Masa 11', seats: 4, x: 78.5, y: 76.4, w: 9.1, h: 9.1 },
  ],
  bistrita: [
    { id: 'bistrita-1', name: 'Masa 1', seats: 4, x: 24.6, y: 30.8, w: 7.8, h: 7.8 },
    { id: 'bistrita-2', name: 'Masa 2', seats: 4, x: 39.0, y: 30.8, w: 7.8, h: 7.8 },
    { id: 'bistrita-3', name: 'Masa 3', seats: 4, x: 52.1, y: 30.8, w: 7.8, h: 7.8 },
    { id: 'bistrita-4', name: 'Masa 4', seats: 4, x: 65.9, y: 30.8, w: 7.8, h: 7.8 },
    { id: 'bistrita-5', name: 'Masa 5', seats: 4, x: 27.5, y: 51.1, w: 10.4, h: 10.4 },
    { id: 'bistrita-6', name: 'Masa 6', seats: 4, x: 44.0, y: 49.6, w: 10.4, h: 10.4 },
    { id: 'bistrita-7', name: 'Masa 7', seats: 3, x: 23.5, y: 73.0, w: 9.4, h: 9.4 },
  ],
  'tg-mures': [
    { id: 'mures-1', name: 'Masa 1', seats: 2, x: 18.0, y: 78.9, w: 8.9, h: 8.9 },
    { id: 'mures-2', name: 'Masa 2', seats: 4, x: 60.3, y: 37.8, w: 9.1, h: 9.1 },
    { id: 'mures-3', name: 'Masa 3', seats: 4, x: 59.8, y: 54.8, w: 9.1, h: 9.1 },
    { id: 'mures-4', name: 'Masa 4', seats: 4, x: 58.4, y: 72.5, w: 9.1, h: 9.1 },
    { id: 'mures-5', name: 'Masa 5', seats: 4, x: 80.2, y: 35.3, w: 8.8, h: 8.8 },
    { id: 'mures-6', name: 'Masa 6', seats: 4, x: 80.7, y: 53.6, w: 8.8, h: 8.8 },
    { id: 'mures-7', name: 'Masa 7', seats: 4, x: 80.3, y: 70.4, w: 8.8, h: 8.8 },
  ],
};

export default function Reservations() {
  const { currentUser, setShowAuthModal, t } = useApp();

  // Locations loaded from Firestore (name, phone, address only).
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  const [selectedLocId, setSelectedLocId] = useState('');
  const [formGuests, setFormGuests] = useState('2');
  const [formDate, setFormDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [formTime, setFormTime] = useState('18:00');
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [formMessage, setFormMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Load active locations (for display info only — table positions are static).
  useEffect(() => {
    let mounted = true;
    getActiveLocations()
      .then((locs) => {
        if (!mounted) return;
        setLocations(locs);
        setLocationsLoading(false);
        if (locs.length > 0) setSelectedLocId(locs[0].id);
      })
      .catch((err) => {
        console.error('Reservations locations load failed:', err);
        if (!mounted) return;
        setLocationsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // Reset selected table when location changes.
  useEffect(() => { setSelectedTableId(null); }, [selectedLocId]);

  // Tables come from the static floor-plan config — no Firestore query needed.
  const tables = STATIC_FLOOR_PLANS[selectedLocId] || [];
  const guestOptions = Array.from(
    new Set(tables.map((table) => Number(table.seats)).filter(Boolean))
  )
    .sort((a, b) => a - b)
    .map((value) => ({
      value: String(value),
      label: `${value} ${t('reservationsSeats')}`,
    }));
  const guestsNum = parseInt(formGuests, 10) || parseInt(guestOptions[0]?.value || '1', 10);
  const matchingTables = tables.filter((table) => !table.seats || table.seats >= guestsNum);

  const activeLocation = locations.find((l) => l.id === selectedLocId) || null;
  const selectedTableObj = matchingTables.find((t) => t.id === selectedTableId) || null;
  const activeMapImage = selectedLocId ? LOCATION_MAP_IMAGES[selectedLocId] : null;
  const selectTableDescription = t('reservationsSelectTableDesc').replace('{guests}', String(guestsNum));

  const handleTableClick = (table) => {
    setSelectedTableId((prev) => (prev === table.id ? null : table.id));
  };
  
  useEffect(() => {
    if (selectedTableId && !matchingTables.some((table) => table.id === selectedTableId)) {
      setSelectedTableId(null);
    }
  }, [matchingTables, selectedTableId]);

  useEffect(() => {
    if (guestOptions.length === 0) return;
    if (!guestOptions.some((option) => option.value === formGuests)) {
      setFormGuests(guestOptions[0].value);
    }
  }, [guestOptions, formGuests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (!formDate || !formTime || !selectedLocId) {
      setFormError(t('reservationsErrorRequired'));
      return;
    }

    if (!selectedTableId) {
      setFormError(t('reservationsErrorTable'));
      return;
    }

    setSubmitting(true);
    try {
      const conflict = await checkReservationConflict({
        tableId: selectedTableId,
        date: formDate,
        time: formTime,
        durationMinutes: RESERVATION_DURATION_MINUTES,
      });

      if (conflict) {
        setFormError(t('reservationsErrorConflict'));
        setSubmitting(false);
        return;
      }

      await createReservation({
        userId: currentUser.uid,
        customerName: currentUser.name || currentUser.email || 'Client',
        locationId: selectedLocId,
        tableId: selectedTableId,
        date: formDate,
        time: formTime,
        durationMinutes: RESERVATION_DURATION_MINUTES,
        guests: guestsNum,
        notes: formMessage,
      });

      setFormSuccess(true);
    } catch (err) {
      console.error('createReservation failed:', err);
      setFormError(t('reservationsErrorSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  const timeOptions = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  return (
    <section className="reservations-section">
      <div className="reservations-container">

        {/* Header */}
        <div className="reservations-header text-center">
          <span className="section-subtitle">{t('reservationsSubtitle')}</span>
          <h1 className="reservations-main-title">{t('reservationsTitle')}</h1>
          <div className="gold-divider"></div>
          <p className="reservations-intro">{t('reservationsIntro')}</p>
        </div>

        <div className="reservations-card-wrapper">
          <div className="reservations-card">

            {/* Top location & Phone info */}
            <div className="reservations-meta-top">
              <div className="location-select-group">
                <label className="input-label-meta">{t('reservationsChooseLocation')}</label>
                <select
                  value={selectedLocId}
                  onChange={(e) => setSelectedLocId(e.target.value)}
                  className="location-meta-select"
                  disabled={locationsLoading || locations.length === 0}
                >
                  {locationsLoading && <option>{t('loadingGeneric')}</option>}
                  {!locationsLoading && locations.length === 0 && (
                    <option>{t('reservationsNoLocations')}</option>
                  )}
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {activeLocation && activeLocation.phone && (
                <div className="phone-reservation-banner">
                  <div className="phone-banner-content">
                    <span className="phone-banner-label">{t('reservationsPhoneBookings')}</span>
                    <a href={`tel:${activeLocation.phone.replace(/\s+/g, '')}`} className="phone-banner-number">
                      {activeLocation.phone}
                    </a>
                  </div>
                  <a href={`tel:${activeLocation.phone.replace(/\s+/g, '')}`} className="phone-call-btn" aria-label="Call location">
                    📞
                  </a>
                </div>
              )}
            </div>

            {formSuccess ? (
              <div className="reservation-success-container animate-fade-in">
                <span className="success-badge-icon">🎉</span>
                <h3>{t('reservationsSuccessTitle')}</h3>
                <p className="success-summary">
                  {`${t('reservationsSuccessSummaryPrefix')} ${activeLocation ? activeLocation.name.replace('The Cheesecake House ', '') : ''} ${t('reservationsSuccessSummaryMiddle')} ${formDate} ${t('reservationsSuccessSummaryAt')} ${formTime}.`}
                </p>
                {selectedTableObj && (
                  <p className="success-table-summary">
                    📍 {`${t('reservationsSelectedTable')} ${selectedTableObj.name}${selectedTableObj.seats ? ` (${selectedTableObj.seats} ${t('reservationsSeats')})` : ''}`}
                  </p>
                )}
                <p className="success-desc">{t('reservationsSuccessDesc')}</p>
                <button className="reset-reservation-btn" onClick={() => setFormSuccess(false)}>
                  {t('reservationsBookAnother')}
                </button>
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
                      <button
                        type="button"
                        className="reservation-account-login-btn"
                        onClick={() => setShowAuthModal(true)}
                      >
                        {t('reservationsLoginCta')}
                      </button>
                    </>
                  )}
                </div>

                <div className="form-group-item">
                  <label>{t('reservationsGuests')}</label>
                  <select value={formGuests} onChange={(e) => setFormGuests(e.target.value)}>
                    {guestOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-double-column">
                  <div className="form-group-item">
                    <label>{t('reservationsDate')}</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label>{t('reservationsTime')}</label>
                    <select value={formTime} onChange={(e) => setFormTime(e.target.value)}>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Static floor-plan table selection */}
                <div className="seating-map-group">
                  <label className="map-group-label">
                    🪑 {t('reservationsSelectTable')}
                  </label>
                  <p className="map-group-desc">
                    {selectTableDescription}
                  </p>

                  {matchingTables.length === 0 ? (
                    <p>{t('reservationsNoTables')}</p>
                  ) : (
                    <div
                      className={`floor-plan-map location-map-${selectedLocId || 'default'}`}
                      style={activeMapImage ? { backgroundImage: `url(${activeMapImage})` } : undefined}
                    >
                      {matchingTables.map((table) => {
                        const isSelected = selectedTableId === table.id;
                        const x = Number(table.x ?? 50);
                        const y = Number(table.y ?? 50);
                        const w = Number(table.w ?? 9);
                        const h = Number(table.h ?? w);
                        const rotate = Number(table.rotate ?? 0);
                        return (
                          <button
                            key={table.id}
                            type="button"
                            className={`table-node ${isSelected ? 'selected' : ''}`}
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              width: `${w}%`,
                              height: `${h}%`,
                              transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
                            }}
                            onClick={() => handleTableClick(table)}
                            title={`${table.name}${table.seats ? ` - ${table.seats} ${t('reservationsSeats')}` : ''}`}
                            aria-pressed={isSelected}
                          >
                            <span className="table-node-surface" aria-hidden="true" />
                            <span className="table-node-copy">
                              <span className="table-label-node">{table.name}</span>
                              {table.seats != null && (
                                <span className="table-seats-count">{table.seats}p</span>
                              )}
                            </span>
                            {isSelected && <span className="selected-indicator-checkmark">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {matchingTables.length > 0 && (
                    <div className="map-legend">
                      <span className="legend-item"><span className="legend-color free"></span>{t('reservationsAvailable')}</span>
                      <span className="legend-item"><span className="legend-color selected"></span>{t('reservationsSelected')}</span>
                    </div>
                  )}

                  {selectedTableObj && (
                    <div className="selected-table-callout animate-fade-in">
                      🎉 {`${t('reservationsSelectedCalloutPrefix')} ${selectedTableObj.name}${selectedTableObj.seats ? ` (${selectedTableObj.seats} ${t('reservationsSeats')})` : ''}.`}
                    </div>
                  )}
                </div>

                <div className="form-group-item">
                  <label>{t('reservationsMessage')}</label>
                  <textarea
                    rows="4"
                    placeholder={t('reservationsMessagePlaceholder')}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                  ></textarea>
                </div>

                {!currentUser && (
                  <p className="map-group-desc">
                    🔒 {t('reservationsAuthHint')}
                  </p>
                )}

                {formError && (
                  <p className="form-error-text" style={{ color: '#c0392b' }}>{formError}</p>
                )}

                <button type="submit" className="reservations-submit-btn" disabled={submitting}>
                  ✨ {submitting ? t('reservationsSubmitting') : t('reservationsSubmit')}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
