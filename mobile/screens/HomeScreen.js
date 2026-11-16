import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import AiInquiryModal from '../components/AiInquiryModal';

const FALLBACK_LOCATIONS = ['Târgu Mureș', 'Câmpia Turzii'];

export default function HomeScreen() {
  const {
    cart, addToCart, removeFromCart, updateQuantity, clearCart,
    placeOrder, colors, isLoggedIn, requestAuth: openAuth, t,
    products, categories: catalogCategories, productsLoading, locations
  } = useApp();
  const styles = getStyles(colors);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartVisible, setCartVisible] = useState(false);

  // AI Inquiry Modal State
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState(null);

  // Custom Animated Toast for "Adăugat în coș"
  const [toastProduct, setToastProduct] = useState(null);
  const toastAnim = useRef(new Animated.Value(-100)).current;
  const toastTimeoutRef = useRef(null);

  // Bottom Sheet & Backdrop animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(600)).current;

  // Checkout Fulfillment States
  const [fulfillmentType, setFulfillmentType] = useState('pickup'); // 'pickup' | 'delivery'
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Târgu Mureș');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card_stripe'); // 'card_stripe' | 'cash_pos'
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Location names sourced from Firestore (graceful fallback to static list).
  const locationNames = useMemo(() => {
    const names = (locations || []).map(l => l.name).filter(Boolean);
    return names.length > 0 ? names : FALLBACK_LOCATIONS;
  }, [locations]);

  const [pickupLocation, setPickupLocation] = useState(FALLBACK_LOCATIONS[0]);

  const selectedLocationObj = useMemo(
    () => (locations || []).find(l => l.name === pickupLocation),
    [locations, pickupLocation]
  );

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Toast notification in the app's style
  const showToast = (item) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastProduct(item);
    Animated.spring(toastAnim, {
      toValue: 20,
      useNativeDriver: true,
      bounciness: 8
    }).start();

    toastTimeoutRef.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true
      }).start(() => setToastProduct(null));
    }, 2800);
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    showToast(item);
  };

  // Open & Close Bottom Sheet with smooth stationary backdrop
  const openCart = () => {
    setCartVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();
  };

  const closeCart = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 220,
        useNativeDriver: true
      })
    ]).start(() => {
      setCartVisible(false);
    });
  };

  const openAiInquiry = (product) => {
    setInquiryProduct(product);
    setAiModalVisible(true);
  };

  const promptAuth = (reason) => {
    Alert.alert(
      t('needAccountTitle'),
      reason,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('connectOrRegister'),
          onPress: () => openAuth(reason)
        }
      ]
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!isLoggedIn) {
      promptAuth(t('connectingOrRegistering'));
      return;
    }

    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      Alert.alert('Adresă lipsă', 'Te rugăm să introduci adresa de livrare pentru a putea trimite comanda.');
      return;
    }

    setIsProcessingOrder(true);

    const orderMetadata = {
      items: cart,
      locationId: fulfillmentType === 'pickup' ? (selectedLocationObj?.id || '') : '',
      locationName: fulfillmentType === 'pickup' ? pickupLocation : `Livrare: ${deliveryCity}`,
      fulfillmentType,
      deliveryAddress: fulfillmentType === 'delivery' ? {
        city: deliveryCity,
        address: deliveryAddress.trim(),
        notes: deliveryNotes.trim()
      } : null,
      paymentMethod,
      paymentStatus: paymentMethod === 'card_stripe' ? 'paid_stripe' : 'pending_on_delivery'
    };

    try {
      const success = await placeOrder(cartTotal, orderMetadata);
      if (success) {
        const paymentMsg = paymentMethod === 'card_stripe'
          ? 'Plata prin Stripe a fost confirmată cu succes! 💳'
          : 'Plata se va efectua la livrare / ridicare.';

        const destMsg = fulfillmentType === 'pickup'
          ? `Ridicare pregătită la: ${pickupLocation}`
          : `Livrare la: ${deliveryAddress}, ${deliveryCity}`;

        Alert.alert(
          'Comandă Plasată cu Succes! 🎉',
          `${paymentMsg}\n\n${destMsg}\n\nTimp estimat de pregătire: ~30-45 minute. Îți mulțumim!`,
          [
            {
              text: 'Super!',
              onPress: () => {
                clearCart();
                closeCart();
              }
            }
          ]
        );
      } else {
        Alert.alert('Eroare', 'Nu s-a putut plasa comanda. Te rugăm să încerci din nou.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Eroare', 'A apărut o problemă la procesarea comenzii.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const categories = useMemo(() => [
    { id: 'all', name: t('all') || 'Toate', icon: 'grid-outline' },
    ...(catalogCategories || []).map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.slug?.includes('tort') ? 'restaurant-outline' : 'sparkles-outline'
    }))
  ], [catalogCategories, t]);

  return (
    <View style={styles.container}>
      {/* Category List */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[
                styles.categoryButton, 
                selectedCategory === cat.id && styles.categoryButtonActive,
                cat.id === 'secret' && styles.secretCategoryButton
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons 
                name={cat.icon} 
                size={16} 
                color={selectedCategory === cat.id ? '#12100e' : (cat.id === 'secret' ? colors.gold : colors.textMuted)} 
              />
              <Text style={[
                styles.categoryText, 
                selectedCategory === cat.id && styles.categoryTextActive,
                cat.id === 'secret' && styles.secretCategoryText
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            {productsLoading ? (
              <>
                <ActivityIndicator color={colors.gold} />
                <Text style={styles.emptyStateText}>{t('loadingCakes')}</Text>
              </>
            ) : (
              <Text style={styles.emptyStateText}>{t('cartEmpty')}</Text>
            )}
          </View>
        )}
        renderItem={({ item }) => {
          const isOnDemand = item.price <= 0 || item.availability === 'unavailable';

          return (
            <View style={[styles.productCard, item.category === 'secret' && styles.secretProductCard]}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} resizeMode="cover" />
              ) : null}
              <View style={styles.productInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.productName}>{item.name}</Text>
                  {item.category === 'secret' && (
                    <View style={styles.secretBadge}>
                      <Text style={styles.secretBadgeText}>{t('secretBadge')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.productDesc} numberOfLines={2}>{item.desc}</Text>
                
                {isOnDemand ? (
                  <TouchableOpacity style={styles.onDemandBadge} onPress={() => openAiInquiry(item)}>
                    <Ionicons name="sparkles" size={13} color={colors.gold} />
                    <Text style={styles.onDemandText}>Preț la cerere · Discută cu AI</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.productPrice}>{item.price.toFixed(2)} RON</Text>
                )}
              </View>

              {/* Action Button: AI Dialog for On-Demand vs Add to Cart for priced */}
              {isOnDemand ? (
                <TouchableOpacity 
                  style={[styles.addButton, styles.aiDialogButton]} 
                  onPress={() => openAiInquiry(item)}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color="#1b1713" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.addButton, item.category === 'secret' && styles.secretAddButton]} 
                  onPress={() => handleAddToCart(item)}
                >
                  <Ionicons name="add" size={22} color="#1b1713" />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

      {/* Floating Animated Toast in Mobile App Style */}
      {toastProduct && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
          <View style={styles.toastCard}>
            <View style={styles.toastIconBox}>
              <Ionicons name="checkmark-circle" size={22} color="#2e7d32" />
            </View>
            <View style={styles.toastInfo}>
              <Text style={styles.toastTitle}>Adăugat în coș!</Text>
              <Text style={styles.toastSubtitle} numberOfLines={1}>{toastProduct.name}</Text>
            </View>
            <TouchableOpacity style={styles.toastCartBtn} onPress={openCart}>
              <Text style={styles.toastCartBtnText}>Vezi coșul</Text>
              <Ionicons name="arrow-forward" size={14} color="#1b1713" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <TouchableOpacity style={styles.floatingCart} onPress={openCart}>
          <View style={styles.cartLeft}>
            <Ionicons name="cart" size={24} color="#12100e" />
            <View style={styles.badgeCount}>
              <Text style={styles.badgeText}>{cart.reduce((s, i) => s + i.quantity, 0)}</Text>
            </View>
          </View>
          <Text style={styles.cartCenter}>{t('cartTitle')}</Text>
          <Text style={styles.cartRight}>{cartTotal.toFixed(2)} RON</Text>
        </TouchableOpacity>
      )}

      {/* Cart Bottom Sheet with Stationary Animated Backdrop */}
      <Modal visible={cartVisible} animationType="none" transparent={true} onRequestClose={closeCart}>
        <View style={styles.modalWrapper}>
          {/* Backdrop remains static and automatically fades in */}
          <Animated.View style={[styles.modalBackdrop, { opacity: fadeAnim }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeCart} activeOpacity={1} />
          </Animated.View>

          {/* Bottom Sheet Slides Up Smoothly */}
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="cart" size={22} color={colors.gold} style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>{t('cartTitle')}</Text>
              </View>
              <TouchableOpacity onPress={closeCart} style={styles.closeModalBtn}>
                <Ionicons name="close" size={26} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Cart Items List */}
              {cart.map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>{item.price} RON / buc</Text>
                  </View>
                  <View style={styles.cartItemControls}>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                      <Ionicons name="remove" size={16} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
                      <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={18} color="#e57373" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Order Mode Toggle: Ridicare vs Livrare */}
              <View style={styles.checkoutConfig}>
                <Text style={styles.configLabel}>Modalitate Comandă:</Text>
                <View style={styles.orderModeRow}>
                  <TouchableOpacity
                    style={[styles.orderModeBtn, fulfillmentType === 'pickup' && styles.orderModeBtnActive]}
                    onPress={() => setFulfillmentType('pickup')}
                  >
                    <Ionicons 
                      name="storefront-outline" 
                      size={18} 
                      color={fulfillmentType === 'pickup' ? '#12100e' : colors.text} 
                      style={{ marginRight: 6 }} 
                    />
                    <Text style={[styles.orderModeText, fulfillmentType === 'pickup' && styles.orderModeTextActive]}>
                      Ridicare din locație
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.orderModeBtn, fulfillmentType === 'delivery' && styles.orderModeBtnActive]}
                    onPress={() => setFulfillmentType('delivery')}
                  >
                    <Ionicons 
                      name="car-outline" 
                      size={18} 
                      color={fulfillmentType === 'delivery' ? '#12100e' : colors.text} 
                      style={{ marginRight: 6 }} 
                    />
                    <Text style={[styles.orderModeText, fulfillmentType === 'delivery' && styles.orderModeTextActive]}>
                      Livrare la domiciliu
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sub-config depending on mode */}
                {fulfillmentType === 'pickup' ? (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.subConfigLabel}>Alege locația pentru ridicare:</Text>
                    <View style={styles.rowPicker}>
                      {locationNames.map(loc => (
                        <TouchableOpacity
                          key={loc}
                          style={[styles.pickerOption, pickupLocation === loc && styles.pickerOptionActive]}
                          onPress={() => setPickupLocation(loc)}
                        >
                          <Text style={[styles.pickerText, pickupLocation === loc && styles.pickerTextActive]}>
                            {loc.split('-')[0]}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.deliveryFormContainer}>
                    <Text style={styles.subConfigLabel}>Adresă de livrare:</Text>
                    <TextInput
                      style={styles.deliveryInput}
                      placeholder="Strada, Număr, Bloc, Apartament, Interfon"
                      placeholderTextColor={colors.textMuted}
                      value={deliveryAddress}
                      onChangeText={setDeliveryAddress}
                    />
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                      {['Târgu Mureș', 'Câmpia Turzii'].map(c => (
                        <TouchableOpacity
                          key={c}
                          style={[styles.cityChip, deliveryCity === c && styles.cityChipActive]}
                          onPress={() => setDeliveryCity(c)}
                        >
                          <Text style={[styles.cityChipText, deliveryCity === c && styles.cityChipTextActive]}>{c}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TextInput
                      style={[styles.deliveryInput, { marginTop: 8 }]}
                      placeholder="Instrucțiuni curier (opțional)"
                      placeholderTextColor={colors.textMuted}
                      value={deliveryNotes}
                      onChangeText={setDeliveryNotes}
                    />
                  </View>
                )}

                {/* Clarified Timp de Pregătire */}
                <View style={styles.prepTimeBox}>
                  <Ionicons name="timer-outline" size={20} color={colors.gold} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.prepTimeTitle}>Timp de pregătire: ~30-45 minute</Text>
                    <Text style={styles.prepTimeDesc}>
                      Fiecare produs este pregătit proaspăt și ambalat la temperatură controlată.
                    </Text>
                  </View>
                </View>

                {/* Online Payment (Stripe) vs Cash */}
                <Text style={[styles.configLabel, { marginTop: 16 }]}>Metodă de Plată:</Text>
                <View style={styles.paymentMethodsRow}>
                  <TouchableOpacity
                    style={[styles.paymentMethodCard, paymentMethod === 'card_stripe' && styles.paymentMethodCardActive]}
                    onPress={() => setPaymentMethod('card_stripe')}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="card" size={20} color={paymentMethod === 'card_stripe' ? colors.gold : colors.textMuted} />
                      <Text style={[styles.paymentMethodName, paymentMethod === 'card_stripe' && styles.paymentMethodNameActive]}>
                        Card Online (Stripe)
                      </Text>
                    </View>
                    <Text style={styles.paymentMethodSub}>Apple Pay, Google Pay, Card bancar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.paymentMethodCard, paymentMethod === 'cash_pos' && styles.paymentMethodCardActive]}
                    onPress={() => setPaymentMethod('cash_pos')}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="cash-outline" size={20} color={paymentMethod === 'cash_pos' ? colors.gold : colors.textMuted} />
                      <Text style={[styles.paymentMethodName, paymentMethod === 'cash_pos' && styles.paymentMethodNameActive]}>
                        La preluare / livrare
                      </Text>
                    </View>
                    <Text style={styles.paymentMethodSub}>Numerar sau Card POS</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Total and Checkout Button */}
              <View style={styles.modalFooter}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Comandă:</Text>
                  <Text style={styles.totalValue}>{cartTotal.toFixed(2)} RON</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.checkoutButton, isProcessingOrder && { opacity: 0.7 }]} 
                  onPress={handleCheckout}
                  disabled={isProcessingOrder}
                >
                  {isProcessingOrder ? (
                    <ActivityIndicator size="small" color="#1b1713" />
                  ) : (
                    <>
                      <Ionicons 
                        name={paymentMethod === 'card_stripe' ? "lock-closed-outline" : "paper-plane-outline"} 
                        size={20} 
                        color="#1b1713" 
                        style={{ marginRight: 8 }} 
                      />
                      <Text style={styles.checkoutButtonText}>
                        {paymentMethod === 'card_stripe' ? 'Plătește prin Stripe & Trimite' : 'Trimite Comanda'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* AI Assistant Modal for On-Demand Pricing */}
      <AiInquiryModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        product={inquiryProduct}
      />
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg
  },
  categoryContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBg
  },
  categoryScroll: {
    paddingHorizontal: 16
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBg,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  categoryButtonActive: {
    backgroundColor: colors.gold
  },
  secretCategoryButton: {
    borderColor: colors.gold,
    borderWidth: 1
  },
  categoryText: {
    color: colors.textMuted,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600'
  },
  categoryTextActive: {
    color: '#12100e'
  },
  secretCategoryText: {
    color: colors.gold
  },
  listContent: {
    padding: 16,
    paddingBottom: 110
  },
  emptyState: {
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyStateText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center'
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  productImage: {
    width: 90,
    height: 100,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#eadfd8'
  },
  secretProductCard: {
    borderColor: colors.gold,
    borderWidth: 1.5
  },
  productInfo: {
    flex: 1,
    marginRight: 8
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  productName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold'
  },
  secretBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8
  },
  secretBadgeText: {
    color: '#12100e',
    fontSize: 10,
    fontWeight: 'bold'
  },
  productDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 16
  },
  productPrice: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: 'bold'
  },
  onDemandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  onDemandText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center'
  },
  aiDialogButton: {
    backgroundColor: colors.champagne
  },
  secretAddButton: {
    backgroundColor: colors.text
  },
  toastContainer: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 9999
  },
  toastCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.gold,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8
  },
  toastIconBox: {
    marginRight: 10
  },
  toastInfo: {
    flex: 1
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text
  },
  toastSubtitle: {
    fontSize: 12,
    color: colors.textMuted
  },
  toastCartBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  toastCartBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1b1713'
  },
  floatingCart: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.gold,
    flexDirection: 'row',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  badgeCount: {
    backgroundColor: '#12100e',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6
  },
  badgeText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: 'bold'
  },
  cartCenter: {
    color: '#12100e',
    fontSize: 15,
    fontWeight: 'bold'
  },
  cartRight: {
    color: '#12100e',
    fontSize: 15,
    fontWeight: 'bold'
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)'
  },
  modalContainer: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '90%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  modalTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold'
  },
  closeModalBtn: {
    padding: 4
  },
  cartList: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10
  },
  cartItemInfo: {
    flex: 1
  },
  cartItemName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600'
  },
  cartItemPrice: {
    color: colors.gold,
    fontSize: 12,
    marginTop: 2
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  qtyBtn: {
    backgroundColor: colors.inputBg,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyText: {
    color: colors.text,
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: 'bold'
  },
  deleteBtn: {
    marginLeft: 12,
    padding: 4
  },
  checkoutConfig: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  configLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subConfigLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 6
  },
  orderModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10
  },
  orderModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border
  },
  orderModeBtnActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold
  },
  orderModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text
  },
  orderModeTextActive: {
    color: '#12100e',
    fontWeight: 'bold'
  },
  rowPicker: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8
  },
  pickerOption: {
    flex: 1,
    backgroundColor: colors.inputBg,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  pickerOptionActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldMuted
  },
  pickerText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold'
  },
  pickerTextActive: {
    color: colors.gold
  },
  deliveryFormContainer: {
    marginTop: 6
  },
  deliveryInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border
  },
  cityChip: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  cityChipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldMuted
  },
  cityChipText: {
    fontSize: 12,
    color: colors.textMuted
  },
  cityChipTextActive: {
    color: colors.gold,
    fontWeight: 'bold'
  },
  prepTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  prepTimeTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text
  },
  prepTimeDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  paymentMethodsRow: {
    gap: 8,
    marginTop: 4
  },
  paymentMethodCard: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.border
  },
  paymentMethodCardActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldMuted
  },
  paymentMethodName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8
  },
  paymentMethodNameActive: {
    color: colors.gold
  },
  paymentMethodSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    marginLeft: 28
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginTop: 14,
    paddingBottom: 24
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  totalLabel: {
    color: colors.textMuted,
    fontSize: 14
  },
  totalValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold'
  },
  checkoutButton: {
    backgroundColor: colors.gold,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  checkoutButtonText: {
    color: '#12100e',
    fontSize: 15,
    fontWeight: 'bold'
  }
});
