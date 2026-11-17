import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getUserOrders } from '../services/submissions';
import './OrdersPage.css';

export default function OrdersPage() {
  const { currentUser, setShowAuthModal, t } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError('');

    getUserOrders(currentUser.uid)
      .then((data) => {
        if (isMounted) {
          setOrders(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error fetching user orders:', err);
          setError('Nu am putut încărca istoricul comenzilor. Te rugăm să reîncerci.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const formatOrderDate = (timestamp) => {
    if (!timestamp) return 'Recent';
    try {
      const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return d.toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'preparing':
        return { label: t('orderStatusPreparing') || 'În preparare', tone: 'warning', icon: '👩‍🍳' };
      case 'ready':
        return { label: t('orderStatusReady') || 'Gata de ridicare', tone: 'info', icon: '🎁' };
      case 'in_delivery':
        return { label: t('orderStatusInDelivery') || 'În livrare', tone: 'info', icon: '🛵' };
      case 'completed':
        return { label: t('orderStatusCompleted') || 'Finalizată', tone: 'success', icon: '✅' };
      case 'cancelled':
        return { label: t('orderStatusCancelled') || 'Anulată', tone: 'danger', icon: '❌' };
      case 'pending':
      default:
        return { label: t('orderStatusPending') || 'În așteptare', tone: 'pending', icon: '🟡' };
    }
  };

  const getStepActiveIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'preparing': return 1;
      case 'ready':
      case 'in_delivery': return 2;
      case 'completed': return 3;
      default: return 0;
    }
  };

  return (
    <div className="orders-page-container animate-fade-in">
      <div className="orders-page-hero">
        <div className="orders-hero-content text-center">
          <span className="orders-badge">📋 {t('orderHistoryTitle') || 'Istoric Comenzi'}</span>
          <h1 className="orders-title">Comenzile Tale</h1>
          <p className="orders-subtitle">
            {t('orderHistorySubtitle') || 'Urmărește statusul comenzilor plasate în timp real.'}
          </p>
        </div>
      </div>

      <div className="orders-page-content">
        {!currentUser ? (
          <div className="orders-locked-card text-center">
            <span className="locked-icon">🔒</span>
            <h3>Conectează-te pentru a vedea comenzile</h3>
            <p>Pentru a avea acces la istoricul comenzilor tale și urmărirea în timp real, te rugăm să te autentifici în cont.</p>
            <button className="orders-login-btn" onClick={() => setShowAuthModal(true)}>
              Conectează-te
            </button>
          </div>
        ) : loading ? (
          <div className="orders-loading-state text-center">
            <div className="orders-spinner" />
            <p>Încărcăm comenzile tale...</p>
          </div>
        ) : error ? (
          <div className="orders-error-card text-center">
            <p>{error}</p>
            <button className="orders-retry-btn" onClick={() => window.location.reload()}>
              Reîncearcă
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty-state text-center">
            <span className="empty-orders-icon">🍰</span>
            <h3>{t('orderHistoryEmpty') || 'Nu ai nicio comandă plasată încă.'}</h3>
            <p>{t('orderHistoryEmptySub') || 'Descoperă prăjiturile artizanale și plasează o comandă gustoasă!'}</p>
            <button className="orders-shop-btn" onClick={() => navigate('/meniu')}>
              Vezi Meniul de Prăjituri
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const isDelivery = order.fulfillmentType === 'delivery' || order.deliveryType === 'delivery';
              const activeStep = getStepActiveIndex(order.status);
              const isCancelled = order.status === 'cancelled';

              return (
                <div key={order.id} className="order-history-card">
                  {/* Card Header */}
                  <div className="order-card-header">
                    <div className="order-header-left">
                      <span className="order-id-label">Comanda #{order.id.slice(0, 8)}</span>
                      <span className="order-date-text">{formatOrderDate(order.createdAt)}</span>
                    </div>
                    <div className={`order-status-pill tone-${statusInfo.tone}`}>
                      <span className="status-pill-icon">{statusInfo.icon}</span>
                      <span className="status-pill-text">{statusInfo.label}</span>
                    </div>
                  </div>

                  {/* Progress Tracker (unless cancelled) */}
                  {!isCancelled && (
                    <div className="order-tracker-bar">
                      <div className={`tracker-step ${activeStep >= 0 ? 'completed' : ''} ${activeStep === 0 ? 'current' : ''}`}>
                        <div className="step-dot">1</div>
                        <span className="step-label">Înregistrată</span>
                      </div>
                      <div className={`tracker-line ${activeStep >= 1 ? 'filled' : ''}`} />
                      <div className={`tracker-step ${activeStep >= 1 ? 'completed' : ''} ${activeStep === 1 ? 'current' : ''}`}>
                        <div className="step-dot">2</div>
                        <span className="step-label">În preparare</span>
                      </div>
                      <div className={`tracker-line ${activeStep >= 2 ? 'filled' : ''}`} />
                      <div className={`tracker-step ${activeStep >= 2 ? 'completed' : ''} ${activeStep === 2 ? 'current' : ''}`}>
                        <div className="step-dot">3</div>
                        <span className="step-label">{isDelivery ? 'În livrare' : 'Gata de ridicare'}</span>
                      </div>
                      <div className={`tracker-line ${activeStep >= 3 ? 'filled' : ''}`} />
                      <div className={`tracker-step ${activeStep >= 3 ? 'completed' : ''} ${activeStep === 3 ? 'current' : ''}`}>
                        <div className="step-dot">4</div>
                        <span className="step-label">Finalizată</span>
                      </div>
                    </div>
                  )}

                  {/* Fulfillment & Payment Details */}
                  <div className="order-card-meta-grid">
                    <div className="meta-block">
                      <span className="meta-label">Metodă preluare:</span>
                      <span className="meta-value">
                        {isDelivery ? '🚗 Livrare la adresă' : '🏢 Ridicare din cofetărie'}
                      </span>
                    </div>

                    <div className="meta-block">
                      <span className="meta-label">
                        {isDelivery ? 'Adresă de livrare:' : 'Locație ridicare:'}
                      </span>
                      <span className="meta-value">
                        {isDelivery 
                          ? (order.address || 'Adresă specificată telefonic')
                          : (order.pickupLocation?.name 
                              ? `${order.pickupLocation.name} (${order.pickupLocation.address})`
                              : order.locationName || 'Laborator Emanuela'
                            )
                        }
                      </span>
                    </div>

                    <div className="meta-block">
                      <span className="meta-label">Modalitate de plată:</span>
                      <span className="meta-value">
                        {order.paymentMethod === 'card_stripe' || order.paymentStatus === 'paid_stripe' ? (
                          <span className="badge-stripe-paid">💳 Plătit online cu Cardul (Stripe)</span>
                        ) : (
                          <span className="badge-cash-delivery">💵 La primire (Numerar / POS)</span>
                        )}
                      </span>
                    </div>

                    {order.notes && (
                      <div className="meta-block meta-block-full">
                        <span className="meta-label">Observații / Mențiuni:</span>
                        <span className="meta-value notes-text">"{order.notes}"</span>
                      </div>
                    )}
                  </div>

                  {/* Products Table */}
                  <div className="order-items-wrapper">
                    <h4 className="order-items-title">Produse comandate</h4>
                    <div className="order-items-list">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="order-product-row">
                          <div className="product-row-info">
                            <span className="product-qty-badge">{item.quantity}x</span>
                            <span className="product-title-text">{item.name}</span>
                          </div>
                          <span className="product-row-price">
                            {(Number(item.price) * Number(item.quantity)).toFixed(2)} RON
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer with Total */}
                  <div className="order-card-footer">
                    <div className="footer-left-info">
                      <span className="client-name">Destinatar: {order.customerName}</span>
                      {order.customerPhone && <span className="client-phone"> • Tel: {order.customerPhone}</span>}
                    </div>
                    <div className="footer-right-total">
                      <span className="total-label-small">Total achitat:</span>
                      <span className="total-amount-bold">{Number(order.total || 0).toFixed(2)} RON</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="orders-back-strip text-center">
        <Link to="/profil" className="back-profile-link">← Înapoi la Profilul Meu</Link>
        <span className="divider-dot">•</span>
        <Link to="/meniu" className="back-menu-link">Descoperă Prăjiturile Noastre →</Link>
      </div>
    </div>
  );
}
