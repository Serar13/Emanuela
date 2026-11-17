import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../context/AppContext';

export default function StaffPortalScreen({ onClose }) {
  const { colors, user, userRole, isAdmin, isKitchen, isStaff, updateOrderStatus, setUserRole, products } = useApp();

  const [activeTab, setActiveTab] = useState(isKitchen ? 'orders' : 'orders'); // 'orders' | 'tables' | 'stock'
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'pending' | 'preparing' | 'ready' | 'completed'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  // Subscribe to real-time orders from Firestore
  useEffect(() => {
    setLoadingOrders(true);
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setOrders(items);
      setLoadingOrders(false);
    }, (err) => {
      console.error('Error fetching live orders for staff portal:', err);
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch {
      Alert.alert('Eroare', 'Nu am putut actualiza statusul comenzii.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Anulează Comanda',
      'Sigur dorești să anulezi această comandă?',
      [
        { text: 'Nu', style: 'cancel' },
        { 
          text: 'Da, anulează', 
          style: 'destructive',
          onPress: () => handleStatusChange(orderId, 'cancelled')
        }
      ]
    );
  };

  const handleToggleProductStock = async (productId, currentAvailability) => {
    try {
      const newAvail = currentAvailability === 'available' ? 'out_of_stock' : 'available';
      const ref = doc(db, 'products', productId);
      await updateDoc(ref, {
        availability: newAvail,
        updatedAt: serverTimestamp()
      });
    } catch {
      Alert.alert('Eroare', 'Nu am putut actualiza stocul produsului.');
    }
  };

  const handleChangeMyRole = async (newRole) => {
    if (!user?.uid) return;
    try {
      await setUserRole(user.uid, newRole);
      setRoleModalVisible(false);
      Alert.alert('Rol Actualizat', `Ai comutat pe rolul: ${newRole}`);
    } catch {
      Alert.alert('Eroare', 'Nu am putut schimba rolul.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'preparing':
        return { label: 'În preparare', bg: '#ffedd5', text: '#c2410c', icon: 'woman-outline' };
      case 'ready':
        return { label: 'Gata / Pe drum', bg: '#e0f2fe', text: '#0369a1', icon: 'gift-outline' };
      case 'completed':
        return { label: 'Finalizată', bg: '#dcfce7', text: '#15803d', icon: 'checkmark-circle-outline' };
      case 'cancelled':
        return { label: 'Anulată', bg: '#fee2e2', text: '#b91c1c', icon: 'close-circle-outline' };
      case 'pending':
      default:
        return { label: 'În așteptare (Nouă)', bg: '#fef3c7', text: '#b45309', icon: 'time-outline' };
    }
  };

  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'pending') return order.status === 'pending';
    if (orderFilter === 'preparing') return order.status === 'preparing';
    if (orderFilter === 'ready') return order.status === 'ready' || order.status === 'in_delivery';
    if (orderFilter === 'completed') return order.status === 'completed';
    return true;
  });

  const getRoleLabel = (r) => {
    switch (r) {
      case 'admin': return '👑 Administrator';
      case 'kitchen':
      case 'bucatar': return '👩‍🍳 Bucătar / Laborator';
      case 'staff':
      case 'ospatar': return '🍽️ Staff Sală / Ospătar';
      case 'delivery': return '🛵 Curier Livrări';
      default: return '👤 Client';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Top Bar with Role & Close */}
      <View style={[styles.header, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <View style={styles.roleBadgeContainer}>
            <Text style={styles.roleBadgeText}>{getRoleLabel(userRole)}</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Panou Operațional Emanuela
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.switchRoleBtn, { borderColor: colors.border }]}
            onPress={() => setRoleModalVisible(!roleModalVisible)}
          >
            <Ionicons name="swap-horizontal" size={16} color={colors.gold} />
            <Text style={[styles.switchRoleText, { color: colors.gold }]}>Rol</Text>
          </TouchableOpacity>

          {onClose && (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Role Switcher Drawer (if active) */}
      {roleModalVisible && (
        <View style={[styles.roleSwitchCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.roleSwitchTitle, { color: colors.text }]}>Comută rolul de lucru:</Text>
          <View style={styles.roleButtonsRow}>
            {[
              { id: 'admin', label: '👑 Admin' },
              { id: 'kitchen', label: '👩‍🍳 Bucătar' },
              { id: 'staff', label: '🍽️ Staff' },
              { id: 'delivery', label: '🛵 Curier' },
              { id: 'customer', label: '👤 Client' }
            ].map(r => (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.roleChoiceBtn,
                  userRole === r.id && { backgroundColor: colors.gold, borderColor: colors.gold }
                ]}
                onPress={() => handleChangeMyRole(r.id)}
              >
                <Text style={[
                  styles.roleChoiceText,
                  { color: userRole === r.id ? '#fff' : colors.text }
                ]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Main Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'orders' && styles.tabBtnActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons 
            name="restaurant" 
            size={18} 
            color={activeTab === 'orders' ? colors.gold : colors.textMuted} 
          />
          <Text style={[
            styles.tabBtnText, 
            { color: activeTab === 'orders' ? colors.gold : colors.textMuted }
          ]}>
            Comenzi ({orders.filter(o => o.status === 'pending' || o.status === 'preparing').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'stock' && styles.tabBtnActive]}
          onPress={() => setActiveTab('stock')}
        >
          <Ionicons 
            name="cube" 
            size={18} 
            color={activeTab === 'stock' ? colors.gold : colors.textMuted} 
          />
          <Text style={[
            styles.tabBtnText, 
            { color: activeTab === 'stock' ? colors.gold : colors.textMuted }
          ]}>
            Vitrină & Stoc
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab 1: Orders (KDS) */}
      {activeTab === 'orders' && (
        <View style={styles.tabContent}>
          {/* Order Status Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {[
              { id: 'all', label: 'Toate' },
              { id: 'pending', label: '🟡 Noi (În așteptare)' },
              { id: 'preparing', label: '👩‍🍳 În preparare' },
              { id: 'ready', label: '📦 Gata / Pe drum' },
              { id: 'completed', label: '✅ Finalizate' }
            ].map(f => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterChip,
                  orderFilter === f.id && { backgroundColor: colors.gold, borderColor: colors.gold }
                ]}
                onPress={() => setOrderFilter(f.id)}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: orderFilter === f.id ? '#fff' : colors.text }
                ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Orders List */}
          {loadingOrders ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Se încarcă comenzile în timp real...</Text>
            </View>
          ) : filteredOrders.length === 0 ? (
            <View style={styles.centerBox}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyOrdersTitle, { color: colors.text }]}>Nicio comandă în această categorie</Text>
              <Text style={[styles.emptyOrdersSub, { color: colors.textMuted }]}>
                Comenzile noi vor apărea automat aici în timp real.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredOrders}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
              renderItem={({ item }) => {
                const badge = getStatusBadge(item.status);
                const isDelivery = item.fulfillmentType === 'delivery' || item.deliveryType === 'delivery';
                const isUpdating = updatingOrderId === item.id;

                return (
                  <View style={[styles.orderCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                    {/* Header */}
                    <View style={styles.orderCardHeader}>
                      <View>
                        <Text style={[styles.orderCardId, { color: colors.text }]}>#{item.id.slice(0, 8)}</Text>
                        <Text style={[styles.orderClientText, { color: colors.textMuted }]}>
                          Client: <Text style={{ fontWeight: 'bold', color: colors.text }}>{item.customerName || 'Anonim'}</Text>
                          {item.customerPhone ? ` • ${item.customerPhone}` : ''}
                        </Text>
                      </View>
                      <View style={[styles.statusBadgePill, { backgroundColor: badge.bg }]}>
                        <Ionicons name={badge.icon} size={14} color={badge.text} />
                        <Text style={[styles.statusBadgeLabel, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>

                    {/* Fulfillment Details */}
                    <View style={styles.fulfillmentRow}>
                      <Ionicons name={isDelivery ? "car-outline" : "storefront-outline"} size={16} color={colors.gold} />
                      <Text style={[styles.fulfillmentText, { color: colors.text }]}>
                        {isDelivery 
                          ? `Livrare: ${item.address || 'Adresă la telefon'}`
                          : `Ridicare din: ${item.pickupLocation?.name || item.locationName || 'Laborator Emanuela'}`
                        }
                      </Text>
                    </View>

                    {/* Payment Info */}
                    <View style={styles.paymentRow}>
                      <Ionicons 
                        name={item.paymentMethod === 'card_stripe' || item.paymentStatus === 'paid_stripe' ? "card" : "cash-outline"} 
                        size={15} 
                        color={item.paymentMethod === 'card_stripe' ? '#15803d' : '#b45309'} 
                      />
                      <Text style={[styles.paymentText, { color: item.paymentMethod === 'card_stripe' ? '#15803d' : '#b45309' }]}>
                        {item.paymentMethod === 'card_stripe' || item.paymentStatus === 'paid_stripe'
                          ? 'Plătit Online (Stripe) 💳'
                          : 'Plată la primire (Numerar / POS) 💵'}
                      </Text>
                    </View>

                    {/* Notes if any */}
                    {item.notes && (
                      <View style={styles.notesBox}>
                        <Text style={styles.notesLabel}>⚠️ Mențiuni client:</Text>
                        <Text style={styles.notesText}>{item.notes}</Text>
                      </View>
                    )}

                    {/* Items List */}
                    <View style={styles.itemsBox}>
                      <Text style={[styles.itemsHeading, { color: colors.textMuted }]}>PRODUSE DE PREGĂTIT:</Text>
                      {(item.items || []).map((it, idx) => (
                        <View key={idx} style={styles.itemRow}>
                          <View style={styles.itemQtyBadge}>
                            <Text style={styles.itemQtyText}>{it.quantity}x</Text>
                          </View>
                          <Text style={[styles.itemName, { color: colors.text }]}>{it.name}</Text>
                          <Text style={[styles.itemPrice, { color: colors.textMuted }]}>
                            {(Number(it.price) * Number(it.quantity)).toFixed(2)} RON
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Total */}
                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Total Comandă:</Text>
                      <Text style={[styles.totalValue, { color: colors.gold }]}>
                        {Number(item.total || 0).toFixed(2)} RON
                      </Text>
                    </View>

                    {/* Action Buttons for Kitchen / Staff */}
                    <View style={styles.actionsRow}>
                      {isUpdating ? (
                        <ActivityIndicator size="small" color={colors.gold} style={{ padding: 10 }} />
                      ) : (
                        <>
                          {item.status === 'pending' && (
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.actionBtnPreparing]}
                              onPress={() => handleStatusChange(item.id, 'preparing')}
                            >
                              <Ionicons name="woman" size={16} color="#fff" />
                              <Text style={styles.actionBtnText}>Începe Prepararea</Text>
                            </TouchableOpacity>
                          )}

                          {item.status === 'preparing' && (
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.actionBtnReady]}
                              onPress={() => handleStatusChange(item.id, 'ready')}
                            >
                              <Ionicons name="gift" size={16} color="#fff" />
                              <Text style={styles.actionBtnText}>Gata de Ridicare / Pe Drum</Text>
                            </TouchableOpacity>
                          )}

                          {(item.status === 'ready' || item.status === 'in_delivery') && (
                            <TouchableOpacity
                              style={[styles.actionBtn, styles.actionBtnComplete]}
                              onPress={() => handleStatusChange(item.id, 'completed')}
                            >
                              <Ionicons name="checkmark-circle" size={16} color="#fff" />
                              <Text style={styles.actionBtnText}>Finalizează Comanda</Text>
                            </TouchableOpacity>
                          )}

                          {item.status !== 'completed' && item.status !== 'cancelled' && (
                            <TouchableOpacity
                              style={styles.cancelBtn}
                              onPress={() => handleCancelOrder(item.id)}
                            >
                              <Ionicons name="close" size={18} color="#ef4444" />
                            </TouchableOpacity>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      )}

      {/* Tab 2: Stock & Display Case */}
      {activeTab === 'stock' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
          <Text style={[styles.stockTitle, { color: colors.text }]}>Gestionare Disponibilitate Vitrină</Text>
          <Text style={[styles.stockSubtitle, { color: colors.textMuted }]}>
            Apasă pe un produs pentru a-l marca rapid ca În Stoc sau Epuizat Temporar în aplicație și site.
          </Text>

          {products.map(p => {
            const isAvail = p.availability !== 'out_of_stock';
            return (
              <View key={p.id} style={[styles.stockCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <View style={styles.stockCardLeft}>
                  <Text style={[styles.productNameStock, { color: colors.text }]}>{p.name}</Text>
                  <Text style={[styles.productMetaStock, { color: colors.textMuted }]}>
                    {p.price} RON • {p.weight || p.unit || 'buc'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.stockToggleBtn,
                    { backgroundColor: isAvail ? '#dcfce7' : '#fee2e2', borderColor: isAvail ? '#15803d' : '#b91c1c' }
                  ]}
                  onPress={() => handleToggleProductStock(p.id, p.availability)}
                >
                  <Ionicons 
                    name={isAvail ? "checkmark-circle" : "alert-circle"} 
                    size={16} 
                    color={isAvail ? '#15803d' : '#b91c1c'} 
                  />
                  <Text style={[styles.stockToggleText, { color: isAvail ? '#15803d' : '#b91c1c' }]}>
                    {isAvail ? 'În Stoc Vitrină' : 'Epuizat Temporar'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(233, 45, 121, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#E92D79',
    fontWeight: 'bold',
    fontSize: 12,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  switchRoleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 6,
  },
  roleSwitchCard: {
    margin: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  roleSwitchTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleChoiceBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roleChoiceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#E92D79',
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  filterScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxHeight: 52,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    alignSelf: 'center',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
  },
  emptyOrdersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptyOrdersSub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  orderCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderCardId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderClientText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  fulfillmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  fulfillmentText: {
    fontSize: 12,
    fontWeight: '500',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  notesBox: {
    backgroundColor: '#fef9c3',
    borderLeftWidth: 3,
    borderLeftColor: '#facc15',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#854d0e',
  },
  notesText: {
    fontSize: 12,
    color: '#854d0e',
    fontStyle: 'italic',
    marginTop: 2,
  },
  itemsBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  itemsHeading: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  itemQtyBadge: {
    backgroundColor: 'rgba(233, 45, 121, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  itemQtyText: {
    color: '#E92D79',
    fontWeight: 'bold',
    fontSize: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 12,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBtnPreparing: {
    backgroundColor: '#ea580c',
  },
  actionBtnReady: {
    backgroundColor: '#0284c7',
  },
  actionBtnComplete: {
    backgroundColor: '#16a34a',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cancelBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  stockTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockSubtitle: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  stockCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  stockCardLeft: {
    flex: 1,
  },
  productNameStock: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  productMetaStock: {
    fontSize: 11,
    marginTop: 2,
  },
  stockToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  stockToggleText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
