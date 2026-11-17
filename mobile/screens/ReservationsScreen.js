import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getTablesByLocation } from '../services/firestore';

const FALLBACK_LOCATIONS = ['Emanuela Experience', 'Emanuela - Câmpia Turzii'];

const dayLabelToDate = (label) => {
  const d = new Date();
  if (label === 'Mâine') d.setDate(d.getDate() + 1);
  else if (label === 'Poimâine') d.setDate(d.getDate() + 2);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function ReservationsScreen() {
  const {
    reservations, addReservation, colors, isLoggedIn,
    requestAuth: openAuth, t, products, locations
  } = useApp();
  const styles = getStyles(colors);

  const locationNames = useMemo(() => {
    const names = (locations || []).map(l => l.name).filter(Boolean);
    return names.length > 0 ? names : FALLBACK_LOCATIONS;
  }, [locations]);

  const [location, setLocation] = useState(locationNames[0] || 'Emanuela Experience');
  const [guests, setGuests] = useState(2);
  const [day, setDay] = useState('Astăzi');
  const [time, setTime] = useState('18:00');
  const [selectedTable, setSelectedTable] = useState(null);
  const [dbTables, setDbTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);

  // Sync initial location when locations load
  useEffect(() => {
    if (locations && locations.length > 0 && !locations.some(l => l.name === location)) {
      setLocation(locations[0].name);
    }
  }, [locations, location]);

  const selectedLocationObj = useMemo(
    () => (locations || []).find(l => l.name === location) || (locations && locations[0]),
    [locations, location]
  );

  // Load real Firestore tables for the selected location
  useEffect(() => {
    if (!selectedLocationObj?.id) return;
    setLoadingTables(true);
    getTablesByLocation(selectedLocationObj.id)
      .then((tables) => {
        const formatted = tables.map((t) => ({
          id: t.id,
          name: t.name || 'Masă',
          zone: t.zone || t.notes || 'Salon',
          seats: Number(t.seats) || 2,
          x: typeof t.x === 'number' ? `${t.x}%` : (t.x || '50%'),
          y: typeof t.y === 'number' ? `${t.y}%` : (t.y || '50%'),
          shape: t.shape === 'square' ? 'square' : t.shape === 'rectangle' ? 'rect' : 'round',
          reservable: t.reservable !== false,
          active: t.active !== false
        }));
        setDbTables(formatted);
      })
      .catch((err) => {
        console.error('Failed to load tables for location:', err);
      })
      .finally(() => {
        setLoadingTables(false);
      });
  }, [selectedLocationObj?.id]);

  // Animation pulse for selected table on 2D map
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Current floor plan tables from Firestore
  const currentTables = useMemo(() => {
    return dbTables.filter(t => t.active && t.reservable);
  }, [dbTables]);

  // Reset selected table if location changes
  useEffect(() => {
    setSelectedTable(null);
  }, [location]);

  const [preOrderQuantities, setPreOrderQuantities] = useState({});

  const preorderProducts = useMemo(
    () => (products || []).slice(0, 8),
    [products]
  );

  const targetDate = dayLabelToDate(day);

  const handleQuantityChange = (productId, change) => {
    setPreOrderQuantities(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty + change;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: newQty };
    });
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

  const handleBook = async () => {
    if (!isLoggedIn) {
      promptAuth(t('needAccountDesc'));
      return;
    }

    const preOrderItems = Object.keys(preOrderQuantities).map(id => {
      const prod = preorderProducts.find(p => p.id === id);
      return {
        productId: id,
        name: prod ? prod.name : '',
        quantity: preOrderQuantities[id],
        price: prod ? prod.price : 0
      };
    });

    if (selectedTable && selectedTable.seats < guests) {
      Alert.alert(
        'Capacitate depășită',
        `Masa ${selectedTable.name} are o capacitate de ${selectedTable.seats} locuri. Pentru ${guests} persoane, vă rugăm să alegeți o masă mai încăpătoare sau să ajustați numărul de persoane.`
      );
      return;
    }

    const newRes = {
      location,
      locationId: selectedLocationObj?.id || '',
      tableId: selectedTable?.id || '',
      tableSeats: selectedTable?.seats,
      table: selectedTable ? `${selectedTable.name} (${selectedTable.zone}, ${selectedTable.seats} locuri)` : 'Masa alocată de personal',
      date: `${day}, la ora ${time}`,
      rawDate: targetDate,
      time,
      durationMinutes: 90,
      guests,
      preOrder: preOrderItems
    };

    const ok = await addReservation(newRes);
    if (!ok) return;

    let summaryText = `${day}, ora ${time}\n${guests} persoane`;
    if (selectedTable) {
      summaryText += `\nMasă aleasă: ${selectedTable.name} (${selectedTable.zone})`;
    }
    if (preOrderItems.length > 0) {
      summaryText += `\n\nPre-comandă:\n` + preOrderItems.map(item => `${item.quantity}x ${item.name}`).join('\n');
    }

    Alert.alert(
      'Rezervare Înregistrată! 🎉',
      `Echipa Laborator Emanuela ${location} a preluat cererea ta.\n\nDetalii:\n${summaryText}`,
      [{ text: 'Super!' }]
    );

    setPreOrderQuantities({});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
      {/* 1. Location & Date Selector */}
      <View style={styles.configCard}>
        <Text style={styles.sectionLabel}>{t('chooseLocation')}</Text>
        <View style={styles.pickerRow}>
          {locationNames.map(loc => (
            <TouchableOpacity
              key={loc}
              style={[styles.pickerBtn, location === loc && styles.pickerBtnActive]}
              onPress={() => setLocation(loc)}
            >
              <Ionicons 
                name="location-outline" 
                size={16} 
                color={location === loc ? '#12100e' : colors.text} 
                style={{ marginRight: 6 }} 
              />
              <Text style={[styles.pickerText, location === loc && styles.pickerTextActive]}>
                {loc.split('-')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Selector */}
        <Text style={styles.sectionLabel}>{t('chooseDay')}</Text>
        <View style={styles.pickerRow}>
          {['Astăzi', 'Mâine', 'Poimâine'].map(d => (
            <TouchableOpacity 
              key={d}
              style={[styles.pickerBtn, day === d && styles.pickerBtnActive]}
              onPress={() => setDay(d)}
            >
              <Text style={[styles.pickerText, day === d && styles.pickerTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Compact Grid Time Slots (No endless horizontal scroll) */}
        <Text style={styles.sectionLabel}>Interval Orar Disponibil:</Text>
        <View style={styles.timeGrid}>
          {['12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00'].map(tSlot => (
            <TouchableOpacity 
              key={tSlot}
              style={[styles.timeGridBtn, time === tSlot && styles.timeGridBtnActive]}
              onPress={() => setTime(tSlot)}
            >
              <Text style={[styles.timeGridText, time === tSlot && styles.timeGridTextActive]}>
                {tSlot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Guests Stepper & Quick Presets */}
        <Text style={styles.sectionLabel}>Număr Persoane:</Text>
        <View style={styles.guestsStepperRow}>
          <TouchableOpacity 
            style={styles.stepperBtn} 
            onPress={() => setGuests(prev => Math.max(1, prev - 1))}
          >
            <Ionicons name="remove" size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.guestsDisplay}>
            <Ionicons name="people" size={18} color={colors.gold} style={{ marginRight: 6 }} />
            <Text style={styles.guestsDisplayText}>{guests} {guests === 1 ? 'persoană' : 'persoane'}</Text>
          </View>

          <TouchableOpacity 
            style={styles.stepperBtn} 
            onPress={() => setGuests(prev => Math.min(16, prev + 1))}
          >
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Quick Chips for Guest count */}
        <View style={styles.quickGuestsRow}>
          {[2, 4, 6, 8, 10].map(n => (
            <TouchableOpacity 
              key={n}
              style={[styles.quickGuestChip, guests === n && styles.quickGuestChipActive]}
              onPress={() => setGuests(n)}
            >
              <Text style={[styles.quickGuestText, guests === n && styles.quickGuestTextActive]}>
                {n} pers
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. Interactive Animated 2D Floor Plan */}
      <View style={styles.floorPlanCard}>
        <View style={styles.floorPlanHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="map-outline" size={18} color={colors.gold} style={{ marginRight: 6 }} />
            <Text style={styles.floorPlanTitle}>Harta 2D a localului · {location}</Text>
          </View>
          <Text style={styles.floorPlanSubtitle}>Apasă pe o masă pentru a o rezerva</Text>
        </View>

        {/* 2D Architectural Canvas */}
        <View style={styles.blueprintCanvas}>
          {/* Top Bar / Reception landmark */}
          <View style={styles.landmarkBar}>
            <Ionicons name="cafe-outline" size={14} color={colors.gold} />
            <Text style={styles.landmarkText}>Vitrină Torturi & Bar Emanuela</Text>
          </View>

          {/* Entrance Door landmark */}
          <View style={styles.landmarkEntrance}>
            <Ionicons name="enter-outline" size={12} color={colors.textMuted} />
            <Text style={styles.entranceText}>Intrare</Text>
          </View>

          {/* Render Interactive Tables */}
          {currentTables.map(tbl => {
            const isSelected = selectedTable?.id === tbl.id;
            const isTooSmall = tbl.seats < guests;

            return (
              <TouchableOpacity
                key={tbl.id}
                style={[
                  styles.tableNode,
                  { left: tbl.x, top: tbl.y, opacity: isTooSmall ? 0.45 : 1 },
                  tbl.shape === 'round' && styles.tableRound,
                  tbl.shape === 'rect' && styles.tableRect,
                  isSelected && styles.tableNodeSelected
                ]}
                onPress={() => {
                  if (isSelected) {
                    setSelectedTable(null);
                  } else {
                    if (isTooSmall) {
                      Alert.alert(
                        'Capacitate insuficientă',
                        `Masa ${tbl.name} are capacitate de ${tbl.seats} locuri. Ați selectat ${guests} persoane. Vă rugăm să alegeți o masă mai mare.`
                      );
                      return;
                    }
                    setSelectedTable(tbl);
                  }
                }}
                activeOpacity={0.8}
              >
                {isSelected ? (
                  <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
                    <Text style={styles.tableNodeTextSelected}>{tbl.name}</Text>
                    <Text style={styles.tableSeatTextSelected}>{tbl.seats}p</Text>
                  </Animated.View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.tableNodeText}>{tbl.name}</Text>
                    <Text style={styles.tableSeatText}>{tbl.seats}p</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Table Selection Summary Badge */}
        {selectedTable ? (
          <View style={styles.selectedTableBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#81c784" style={{ marginRight: 6 }} />
            <Text style={styles.selectedTableBannerText}>
              Ai selectat: <Text style={{ fontWeight: 'bold' }}>{selectedTable.name}</Text> ({selectedTable.zone}, capacitate {selectedTable.seats} locuri)
            </Text>
            <TouchableOpacity onPress={() => setSelectedTable(null)}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.inputBg, borderColor: colors.border }]} />
              <Text style={styles.legendText}>Liberă</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.gold, borderColor: colors.gold }]} />
              <Text style={styles.legendText}>Selectată (puls)</Text>
            </View>
          </View>
        )}
      </View>

      {/* 3. Pre-order Optional Section */}
      <View style={styles.preOrderCard}>
        <View style={styles.preOrderHeader}>
          <Ionicons name="cart-outline" size={18} color={colors.gold} />
          <Text style={styles.preOrderTitle}>{t('preOrderTitle')}</Text>
        </View>
        <Text style={styles.preOrderDesc}>{t('preOrderDesc')}</Text>
        
        <View style={styles.preOrderList}>
          {preorderProducts.map(product => {
            const currentQty = preOrderQuantities[product.id] || 0;
            return (
              <View key={product.id} style={styles.preOrderItemRow}>
                <View style={styles.preOrderProductInfo}>
                  <Text style={styles.preOrderProductName}>{product.name}</Text>
                  <Text style={styles.preOrderProductPrice}>{product.price} RON</Text>
                </View>
                
                <View style={styles.qtyContainer}>
                  {currentQty > 0 ? (
                    <>
                      <TouchableOpacity 
                        style={styles.qtyBtn}
                        onPress={() => handleQuantityChange(product.id, -1)}
                      >
                        <Ionicons name="remove" size={16} color={colors.gold} />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{currentQty}</Text>
                    </>
                  ) : null}
                  <TouchableOpacity 
                    style={styles.qtyBtn}
                    onPress={() => handleQuantityChange(product.id, 1)}
                  >
                    <Ionicons name="add" size={16} color={colors.gold} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* 4. Book Button */}
      <TouchableOpacity 
        style={styles.bookButton}
        onPress={handleBook}
      >
        <Ionicons name="calendar-outline" size={18} color="#12100e" style={{ marginRight: 8 }} />
        <Text style={styles.bookButtonText}>Confirmă Rezervarea Mesei</Text>
      </TouchableOpacity>

      {/* 5. Active Reservations list */}
      <Text style={styles.sectionTitle}>{t('activeReservations')}</Text>
      {reservations.length === 0 ? (
        <View style={styles.emptyReservations}>
          <Text style={styles.emptyText}>{t('noActiveReservations')}</Text>
        </View>
      ) : (
        reservations.map(res => (
          <View key={res.id} style={styles.resCard}>
            <View style={styles.resHeader}>
              <View style={styles.resLocationRow}>
                <Ionicons name="location" size={16} color={colors.gold} />
                <Text style={styles.resLocation}>{res.location}</Text>
              </View>
              <View style={styles.resBadge}>
                <Text style={styles.resBadgeText}>{res.status}</Text>
              </View>
            </View>
            {!!res.table && <Text style={styles.resDetails}>📍 {res.table}</Text>}
            <Text style={styles.resTime}>🕒 {res.date} • {res.guests} persoane</Text>
            
            {res.preOrder && res.preOrder.length > 0 && (
              <View style={styles.resPreOrderContainer}>
                <Text style={styles.resPreOrderLabel}>🛒 Pre-comandă:</Text>
                {res.preOrder.map((item, idx) => (
                  <Text key={idx} style={styles.resPreOrderItem}>
                    • {item.quantity}x {item.name}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  configCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 6
  },
  pickerRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8
  },
  pickerBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.inputBg,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  pickerBtnActive: {
    borderColor: colors.gold,
    backgroundColor: colors.gold
  },
  pickerText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  pickerTextActive: {
    color: '#12100e',
    fontWeight: 'bold'
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14
  },
  timeGridBtn: {
    width: '22.5%',
    backgroundColor: colors.inputBg,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  timeGridBtnActive: {
    borderColor: colors.gold,
    backgroundColor: colors.gold
  },
  timeGridText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: 'bold'
  },
  timeGridTextActive: {
    color: '#12100e'
  },
  guestsStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 6,
    marginBottom: 8
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  guestsDisplay: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  guestsDisplayText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text
  },
  quickGuestsRow: {
    flexDirection: 'row',
    gap: 6
  },
  quickGuestChip: {
    flex: 1,
    backgroundColor: colors.inputBg,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  quickGuestChipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldMuted
  },
  quickGuestText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600'
  },
  quickGuestTextActive: {
    color: colors.gold,
    fontWeight: 'bold'
  },
  floorPlanCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  floorPlanHeader: {
    marginBottom: 12
  },
  floorPlanTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text
  },
  floorPlanSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  blueprintCanvas: {
    width: '100%',
    height: 220,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden'
  },
  landmarkBar: {
    position: 'absolute',
    top: 6,
    left: '15%',
    right: '15%',
    height: 28,
    backgroundColor: colors.cardBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  landmarkText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text
  },
  landmarkEntrance: {
    position: 'absolute',
    bottom: 6,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  entranceText: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase'
  },
  tableNode: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3
  },
  tableRound: {
    borderRadius: 24
  },
  tableRect: {
    width: 60,
    height: 44,
    borderRadius: 8,
    transform: [{ translateX: -30 }, { translateY: -22 }]
  },
  tableNodeSelected: {
    backgroundColor: colors.gold,
    borderColor: '#12100e',
    borderWidth: 2
  },
  tableNodeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text
  },
  tableSeatText: {
    fontSize: 9,
    color: colors.textMuted
  },
  tableNodeTextSelected: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#12100e'
  },
  tableSeatTextSelected: {
    fontSize: 9,
    color: '#12100e',
    fontWeight: '600'
  },
  selectedTableBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBg,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.gold
  },
  selectedTableBannerText: {
    fontSize: 12,
    color: colors.text,
    flex: 1
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1
  },
  legendText: {
    fontSize: 11,
    color: colors.textMuted
  },
  preOrderCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16
  },
  preOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  preOrderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 6
  },
  preOrderDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
    lineHeight: 16
  },
  preOrderList: {
    marginTop: 2
  },
  preOrderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  preOrderProductInfo: {
    flex: 1,
    marginRight: 10
  },
  preOrderProductName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text
  },
  preOrderProductPrice: {
    fontSize: 11,
    color: colors.gold,
    marginTop: 2,
    fontWeight: '600'
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 18,
    padding: 2
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 8
  },
  bookButton: {
    backgroundColor: colors.gold,
    borderRadius: 22,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  bookButtonText: {
    color: '#12100e',
    fontSize: 15,
    fontWeight: 'bold'
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10
  },
  emptyReservations: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13
  },
  resCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10
  },
  resHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  resLocationRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  resLocation: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6
  },
  resBadge: {
    backgroundColor: 'rgba(129, 199, 132, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  resBadgeText: {
    color: '#81c784',
    fontSize: 10,
    fontWeight: 'bold'
  },
  resDetails: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4
  },
  resTime: {
    color: colors.textMuted,
    fontSize: 12
  },
  resPreOrderContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  resPreOrderLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2
  },
  resPreOrderItem: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  }
});
