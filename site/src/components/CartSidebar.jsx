import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { createOrder } from '../services/submissions';
import './CartSidebar.css';

const FALLBACK_LOCATIONS = [
  { 
    id: 'targu-mures-unirii', 
    name: 'Emanuela - Cartierul Unirii', 
    city: 'Târgu Mureș', 
    address: 'Strada Voinicenilor nr. 50', 
    schedule: 'Luni - Sâmbătă: 08:00–20:00, Duminică: 10:00–16:00', 
    phone: '0755 047 191' 
  },
  { 
    id: 'targu-mures-tudor', 
    name: 'Emanuela - Cartierul Tudor', 
    city: 'Târgu Mureș', 
    address: 'Bulevardul Pandurilor nr. 114-116', 
    schedule: 'Luni - Sâmbătă: 08:00–20:00, Duminică: 10:00–16:00', 
    phone: '0786 217 772' 
  },
  { 
    id: 'emanuela-experience', 
    name: 'Emanuela Experience', 
    city: 'Târgu Mureș', 
    address: 'Strada Bartók Béla nr. 1-3', 
    schedule: 'Zilnic: 08:00–20:00', 
    phone: '0755 047 191' 
  },
  { 
    id: 'campia-turzii', 
    name: 'Emanuela - Câmpia Turzii', 
    city: 'Câmpia Turzii', 
    address: 'Strada 1 Decembrie 1918 nr. 3-5', 
    schedule: 'Luni - Duminică: 08:00–20:00', 
    phone: '0766 517 010' 
  }
];

export default function CartSidebar() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    cartTotal, 
    clearCart,
    locations,
    selectedStore,
    t,
    currentUser,
    setShowAuthModal
  } = useApp();

  const navigate = useNavigate();

  const availableLocations = (locations && locations.length > 0) 
    ? locations.filter(l => l.active !== false) 
    : FALLBACK_LOCATIONS;

  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' or 'pickup'
  const [pickupLocationId, setPickupLocationId] = useState(() => {
    return selectedStore?.id || availableLocations[0]?.id || 'targu-mures-unirii';
  });

  const [paymentMethod, setPaymentMethod] = useState('card_stripe'); // 'card_stripe' or 'cash_pos'
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    address: '', 
    notes: '' 
  });

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderSummary, setPlacedOrderSummary] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Prefill ONLY authenticated user's actual saved data (never dummy values)
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      }));
    } else {
      setFormData({ name: '', phone: '', address: '', notes: '' });
    }
  }, [currentUser]);

  // Keep pickup location synced if store changes
  useEffect(() => {
    if (selectedStore?.id && availableLocations.some(l => l.id === selectedStore.id)) {
      setPickupLocationId(selectedStore.id);
    }
  }, [selectedStore, availableLocations]);

  if (!isCartOpen) return null;

  const selectedPickupLocation = availableLocations.find(l => l.id === pickupLocationId) || availableLocations[0];
  const transportFee = deliveryType === 'delivery' ? (cartTotal >= 100 ? 0 : 9.99) : 0;
  const grandTotal = cartTotal + transportFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    // Format in blocks of 4
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardData(prev => ({ ...prev, number: val }));
  };

  const handleCardExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardData(prev => ({ ...prev, expiry: val }));
  };

  const handleCardCvcChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardData(prev => ({ ...prev, cvc: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Require authentication (Firestore rules require a signed-in user).
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    setSubmitError('');

    // Delivery validation
    if (deliveryType === 'delivery' && !formData.address.trim()) {
      setSubmitError(t('deliveryAddressRequired') || 'Te rugăm să introduci adresa completă de livrare.');
      return;
    }

    // Pickup location validation
    if (deliveryType === 'pickup' && !pickupLocationId) {
      setSubmitError(t('pickupLocationRequired') || 'Te rugăm să alegi locația pentru ridicare.');
      return;
    }

    // Card Stripe validation
    if (paymentMethod === 'card_stripe') {
      const cleanNum = cardData.number.replace(/\D/g, '');
      if (cleanNum.length < 15) {
        setSubmitError('Te rugăm să introduci un număr valid de card (16 cifre).');
        return;
      }
      if (!cardData.expiry || cardData.expiry.length < 5) {
        setSubmitError('Te rugăm să introduci data expirării cardului (LL/AA).');
        return;
      }
      if (!cardData.cvc || cardData.cvc.length < 3) {
        setSubmitError('Te rugăm să introduci codul de securitate CVC (3 cifre).');
        return;
      }
    }

    setSubmitting(true);

    try {
      // Simulate real Stripe payment authorization
      if (paymentMethod === 'card_stripe') {
        await new Promise(r => setTimeout(r, 800));
      }

      const items = cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const activeLocation = deliveryType === 'pickup' 
        ? selectedPickupLocation 
        : (selectedStore || availableLocations[0]);

      const orderPayload = {
        userId: currentUser.uid,
        customerName: formData.name,
        customerPhone: formData.phone,
        source: 'site',
        deliveryType,
        fulfillmentType: deliveryType,
        locationId: activeLocation ? activeLocation.id : null,
        locationName: activeLocation ? activeLocation.name : 'Laborator Emanuela',
        ...(deliveryType === 'pickup' && activeLocation ? {
          pickupLocation: {
            id: activeLocation.id,
            name: activeLocation.name,
            address: activeLocation.address,
            city: activeLocation.city,
            phone: activeLocation.phone || '0755 047 191',
            schedule: activeLocation.schedule || 'Luni - Sâmbătă: 08:00–20:00'
          }
        } : {}),
        address: deliveryType === 'delivery' ? formData.address.trim() : '',
        paymentMethod,
        paymentStatus: paymentMethod === 'card_stripe' ? 'paid_stripe' : 'pending_on_delivery',
        items,
        total: grandTotal,
        notes: formData.notes.trim(),
      };

      const id = await createOrder(orderPayload);

      setPlacedOrderSummary({
        id,
        ...orderPayload,
        pickupLocationDetails: activeLocation
      });

      setOrderSuccess(true);
      clearCart();
    } catch (err) {
      console.error('createOrder failed:', err);
      setSubmitError(t('formSubmitError') || 'Nu am putut trimite comanda. Te rugăm să reîncerci.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setOrderSuccess(false);
    setPlacedOrderSummary(null);
    setIsCartOpen(false);
  };

  const handleGoToOrderHistory = () => {
    setIsCartOpen(false);
    setOrderSuccess(false);
    setPlacedOrderSummary(null);
    navigate('/comenzi');
  };

  return (
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="cart-header">
          <h2>{t('cartTitle')}</h2>
          <button className="close-cart-btn" onClick={() => setIsCartOpen(false)} aria-label="Închide coșul">✕</button>
        </div>

        {orderSuccess && placedOrderSummary ? (
          /* Order Success Screen */
          <div className="order-success-container">
            <span className="success-icon">🎉</span>
            <h3>{t('orderSuccessTitle') || 'Comandă plasată cu succes!'}</h3>
            <p className="order-id-badge">{t('orderSuccessId')} <strong>#{placedOrderSummary.id.slice(0, 8)}</strong></p>
            
            <div className="order-status-banner" role="status" aria-live="polite">
              <span className="order-status-dot" aria-hidden="true"></span>
              <div className="order-status-copy">
                <strong>{t('orderPendingTitle') || 'Comanda este în așteptare'}</strong>
                <span>{t('orderPendingDesc') || 'Comanda a fost înregistrată și trimisă în bucătărie.'}</span>
              </div>
            </div>

            {/* Payment badge */}
            <div className={`order-payment-banner ${placedOrderSummary.paymentMethod === 'card_stripe' ? 'stripe' : 'cash'}`}>
              <span className="pay-banner-icon">
                {placedOrderSummary.paymentMethod === 'card_stripe' ? '💳' : '💵'}
              </span>
              <div className="pay-banner-text">
                <strong>
                  {placedOrderSummary.paymentMethod === 'card_stripe' 
                    ? (t('paymentStripeAuthorized') || 'Plată confirmată prin Stripe 💳')
                    : 'Plată la primire (Numerar / POS)'}
                </strong>
                <span>
                  {placedOrderSummary.paymentMethod === 'card_stripe'
                    ? 'Tranzacția a fost autorizată cu succes.'
                    : 'Vei achita suma totală la sosirea comenzii.'}
                </span>
              </div>
            </div>

            {/* Summary details card */}
            <div className="summary-card">
              <h4>{t('orderSuccessDetails')}</h4>
              <p><strong>{t('orderStatusLabel')}</strong> {t('orderPendingShort') || 'În așteptare'}</p>
              <p><strong>{t('orderSuccessName')}</strong> {placedOrderSummary.customerName}</p>
              <p><strong>{t('orderSuccessPhone')}</strong> {placedOrderSummary.customerPhone}</p>
              
              {placedOrderSummary.fulfillmentType === 'delivery' ? (
                <p><strong>{t('orderSuccessAddress')}</strong> {placedOrderSummary.address}</p>
              ) : (
                <p>
                  <strong>{t('orderSuccessPickup')}</strong>{' '}
                  {placedOrderSummary.pickupLocationDetails?.name} — {placedOrderSummary.pickupLocationDetails?.address}
                </p>
              )}
              
              <p className="success-total">
                {t('totalShortLabel') || 'Total:'} <strong>{placedOrderSummary.total.toFixed(2)} RON</strong>
              </p>
            </div>

            {/* Action buttons */}
            <button className="success-history-btn" onClick={handleGoToOrderHistory}>
              📦 {t('btnViewOrderHistory') || 'Vezi istoricul comenzilor mele'}
            </button>
            <button className="success-close-btn" onClick={handleCloseSuccess}>
              {t('btnContinueShopping')}
            </button>
          </div>
        ) : (
          /* Normal Cart Content */
          <>
            {/* Scrollable Items list */}
            <div className="cart-items-container scroller">
              {cart.length === 0 ? (
                <div className="empty-cart-message">
                  <span className="empty-cart-icon">🧁</span>
                  <p>{t('cartEmpty')}</p>
                  <p className="empty-cart-sub">{t('cartEmptySub')}</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="cart-item">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="cart-item-img" 
                    />
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.product.name}</h4>
                      <p className="cart-item-meta">{item.product.weight} • {item.product.price.toFixed(2)} RON</p>
                      
                      <div className="cart-item-actions">
                        <div className="quantity-selector">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="qty-btn"
                            aria-label="Scade cantitatea"
                          >
                            -
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="qty-btn"
                            aria-label="Creste cantitatea"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="cart-item-remove" 
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          {t('removeItem')}
                        </button>
                      </div>
                    </div>
                    <span className="cart-item-total">
                      {(item.product.price * item.quantity).toFixed(2)} RON
                    </span>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              /* Checkout Details & Form */
              <div className="cart-checkout-section scroller">
                
                {/* Delivery Type selector */}
                <div className="delivery-toggle-container">
                  <button 
                    type="button"
                    className={`toggle-option ${deliveryType === 'delivery' ? 'active' : ''}`}
                    onClick={() => setDeliveryType('delivery')}
                  >
                    {t('deliveryOption')}
                  </button>
                  <button 
                    type="button"
                    className={`toggle-option ${deliveryType === 'pickup' ? 'active' : ''}`}
                    onClick={() => setDeliveryType('pickup')}
                  >
                    {t('pickupOption')}
                  </button>
                </div>

                {/* Form or Auth Gate */}
                {currentUser ? (
                  <form className="checkout-form" onSubmit={handleSubmit}>
                    
                    {/* Pick-up location selector (when Ridicare personală is selected) */}
                    {deliveryType === 'pickup' ? (
                      <div className="pickup-location-box">
                        <label htmlFor="pickup-location-select" className="section-field-label">
                          📍 {t('pickupSelectLocation') || 'Alege cofetăria pentru ridicare *'}
                        </label>
                        <select
                          id="pickup-location-select"
                          value={pickupLocationId}
                          onChange={(e) => setPickupLocationId(e.target.value)}
                          className="location-dropdown"
                          required
                        >
                          {availableLocations.map(loc => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name} — {loc.city} ({loc.address})
                            </option>
                          ))}
                        </select>

                        {/* Selected location details callout */}
                        {selectedPickupLocation && (
                          <div className="pickup-location-card">
                            <div className="pickup-card-row">
                              <span className="pickup-card-icon">🏢</span>
                              <div>
                                <strong>{selectedPickupLocation.name}</strong>
                                <p className="pickup-card-addr">{selectedPickupLocation.address}, {selectedPickupLocation.city}</p>
                              </div>
                            </div>
                            <div className="pickup-card-row">
                              <span className="pickup-card-icon">🕒</span>
                              <span className="pickup-card-sched">
                                {selectedPickupLocation.schedule || 'Luni - Sâmbătă: 08:00–20:00'}
                              </span>
                            </div>
                            <div className="pickup-card-row">
                              <span className="pickup-card-icon">📞</span>
                              <span className="pickup-card-phone">{selectedPickupLocation.phone || '0755 047 191'}</span>
                            </div>
                            <div className="pickup-notice-bar">
                              🧁 {t('pickupNotice') || 'Comanda ta va fi pregătită cu grijă și te va aștepta la vitrină.'}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Delivery Notice */
                      <div className="delivery-info-banner">
                        <span className="delivery-banner-icon">🚚</span>
                        <div className="delivery-banner-text">
                          <strong>Livrare din laboratorul Emanuela Târgu Mureș</strong>
                          <span>{t('deliveryFreeText') || 'Livrare gratuită pentru comenzi ≥ 250 RON.'}</span>
                        </div>
                      </div>
                    )}

                    {/* Customer Name */}
                    <div className="form-group">
                      <label htmlFor="checkout-name">{t('inputName')} *</label>
                      <input 
                        type="text" 
                        id="checkout-name"
                        name="name" 
                        required 
                        value={formData.name} 
                        onChange={handleInputChange}
                        placeholder={t('inputNamePlaceholder')}
                      />
                    </div>

                    {/* Customer Phone */}
                    <div className="form-group">
                      <label htmlFor="checkout-phone">{t('inputPhone')} *</label>
                      <input 
                        type="tel" 
                        id="checkout-phone"
                        name="phone" 
                        required 
                        value={formData.phone} 
                        onChange={handleInputChange}
                        placeholder={t('inputPhonePlaceholder')}
                      />
                    </div>

                    {/* Delivery Address (only shown for delivery) */}
                    {deliveryType === 'delivery' && (
                      <div className="form-group">
                        <label htmlFor="checkout-address">{t('inputAddress')} *</label>
                        <input 
                          type="text" 
                          id="checkout-address"
                          name="address" 
                          required 
                          value={formData.address} 
                          onChange={handleInputChange}
                          placeholder={t('inputAddressPlaceholder')}
                        />
                      </div>
                    )}

                    {/* Order Notes */}
                    <div className="form-group">
                      <label htmlFor="checkout-notes">{t('inputNotes')}</label>
                      <input 
                        type="text" 
                        id="checkout-notes"
                        name="notes" 
                        value={formData.notes} 
                        onChange={handleInputChange}
                        placeholder={t('inputNotesPlaceholder')}
                      />
                    </div>

                    {/* Payment Method Selector */}
                    <div className="payment-method-section">
                      <label className="section-field-label">
                        {t('paymentMethodLabel') || 'Metodă de plată:'}
                      </label>
                      <div className="payment-toggle-grid">
                        <button
                          type="button"
                          className={`payment-choice-btn ${paymentMethod === 'card_stripe' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('card_stripe')}
                        >
                          <div className="choice-header">
                            <span className="choice-icon">💳</span>
                            <span className="choice-title">{t('paymentCardStripe') || 'Card online (Stripe)'}</span>
                          </div>
                          <span className="choice-sub">
                            {t('paymentCardStripeSub') || 'Visa, Mastercard, Apple Pay, Google Pay'}
                          </span>
                        </button>

                        <button
                          type="button"
                          className={`payment-choice-btn ${paymentMethod === 'cash_pos' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('cash_pos')}
                        >
                          <div className="choice-header">
                            <span className="choice-icon">💵</span>
                            <span className="choice-title">{t('paymentCashPos') || 'La preluare / livrare'}</span>
                          </div>
                          <span className="choice-sub">
                            {t('paymentCashPosSub') || 'Numerar sau Card POS'}
                          </span>
                        </button>
                      </div>

                      {/* Stripe Card Input Form */}
                      {paymentMethod === 'card_stripe' && (
                        <div className="stripe-card-form-box">
                          <div className="stripe-brand-header">
                            <span className="stripe-badge-text">STRIPE SECURE CHECKOUT</span>
                            <div className="card-icons-row">
                              <span className="card-logo-pill">VISA</span>
                              <span className="card-logo-pill">MC</span>
                              <span className="card-logo-pill">APPLE PAY</span>
                            </div>
                          </div>

                          <div className="form-group" style={{ marginTop: '8px' }}>
                            <label htmlFor="card-number">{t('paymentCardNumber') || 'Număr card'}</label>
                            <input
                              type="text"
                              id="card-number"
                              name="cardNumber"
                              value={cardData.number}
                              onChange={handleCardNumberChange}
                              placeholder="4242 •••• •••• 4242"
                              maxLength={19}
                              required={paymentMethod === 'card_stripe'}
                            />
                          </div>

                          <div className="stripe-split-row">
                            <div className="form-group" style={{ flex: 1 }}>
                              <label htmlFor="card-expiry">{t('paymentCardExpiry') || 'LL / AA'}</label>
                              <input
                                type="text"
                                id="card-expiry"
                                name="cardExpiry"
                                value={cardData.expiry}
                                onChange={handleCardExpiryChange}
                                placeholder="12/28"
                                maxLength={5}
                                required={paymentMethod === 'card_stripe'}
                              />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                              <label htmlFor="card-cvc">{t('paymentCardCvc') || 'CVC'}</label>
                              <input
                                type="password"
                                id="card-cvc"
                                name="cardCvc"
                                value={cardData.cvc}
                                onChange={handleCardCvcChange}
                                placeholder="•••"
                                maxLength={4}
                                required={paymentMethod === 'card_stripe'}
                              />
                            </div>
                          </div>

                          <div className="stripe-security-notice">
                            🔒 {t('paymentStripeSecure') || 'Plată 100% securizată prin Stripe • Criptare SSL 256-bit'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Summary math */}
                    <div className="checkout-summary">
                      <div className="summary-row">
                        <span>{t('subtotalLabel')}</span>
                        <span>{cartTotal.toFixed(2)} RON</span>
                      </div>
                      {deliveryType === 'delivery' && (
                        <div className="summary-row">
                          <span>{t('shippingLabel')}</span>
                          <span>{transportFee === 0 ? t('freeLabel') : `${transportFee.toFixed(2)} RON`}</span>
                        </div>
                      )}
                      <div className="summary-row total-row">
                        <span>{t('totalLabel')}</span>
                        <span>{grandTotal.toFixed(2)} RON</span>
                      </div>
                    </div>

                    {submitError && (
                      <p className="form-error-text" style={{ color: '#c0392b', marginTop: '8px', fontSize: '13px' }}>
                        ⚠️ {submitError}
                      </p>
                    )}

                    <button type="submit" className="place-order-btn" disabled={submitting}>
                      {submitting 
                        ? (paymentMethod === 'card_stripe' 
                            ? (t('paymentProcessing') || 'Se autorizează plata Stripe...') 
                            : t('sendingGeneric'))
                        : (paymentMethod === 'card_stripe'
                            ? `💳 ${t('btnPayAndOrder') || 'Plătește prin Stripe & Trimite'} (${grandTotal.toFixed(2)} RON)`
                            : `🚀 ${t('btnPlaceOrderCash') || 'Trimite comanda'} (${grandTotal.toFixed(2)} RON)`)
                      }
                    </button>
                  </form>
                ) : (
                  <div className="cart-auth-gate text-center">
                    <span className="gate-icon">🔒</span>
                    <h4>{t('cartAuthTitle')}</h4>
                    <p>{t('cartAuthDesc')}</p>
                    <button 
                      type="button" 
                      className="gate-login-btn"
                      onClick={() => setShowAuthModal(true)}
                    >
                      {t('cartAuthButton')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
