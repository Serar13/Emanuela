import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const SWEET_PASSPORT_ITEMS = [
  { id: 'p1', name: 'Mousse Trio Ciocolată', desc: 'Ciocolată albă, lapte și neagră belgiană', emoji: '🍫' },
  { id: 'p2', name: 'Tartă Fistic de Bronte', desc: 'Cremă pură de fistic și bezea crocantă', emoji: '🌰' },
  { id: 'p3', name: 'Pavlova Fructe de Pădure', desc: 'Bezea crocantă și frișcă proaspătă', emoji: '🍓' },
  { id: 'p4', name: 'Cheesecake Cireșe Negre', desc: 'Cremă fină de brânză și vișine aromate', emoji: '🍒' },
  { id: 'p5', name: 'Desert Pahar Diplomat', desc: 'Fructe exotice și cremă aerată', emoji: '🧁' },
  { id: 'p6', name: 'Tartă Meringue Lămâie', desc: 'Cremă acrișoară și bezea flambată', emoji: '🍋' },
  { id: 'p7', name: 'Caramel Sărat & Alune', desc: 'Blat crocant cu caramel artizanal', emoji: '🍯' },
  { id: 'p8', name: 'Mousse Mango & Maracuja', desc: 'Inserție tropicală fresh și ciocolată albă', emoji: '🥭' }
];

export default function LoyaltyScreen() {
  const { stamps, maxStamps, vipPoints, user, colors, isLoggedIn, requestAuth: openAuth, t } = useApp();
  const styles = getStyles(colors);
  const [qrVisible, setQrVisible] = useState(false);

  // Sweet Passport Tasted Items State
  const [tastedIds, setTastedIds] = useState(['p1', 'p3']);

  const handleTogglePassportItem = (item) => {
    if (!isLoggedIn) {
      requestAuth();
      return;
    }
    const alreadyTasted = tastedIds.includes(item.id);
    if (alreadyTasted) {
      setTastedIds(prev => prev.filter(id => id !== item.id));
    } else {
      const nextTasted = [...tastedIds, item.id];
      setTastedIds(nextTasted);
      if (nextTasted.length === SWEET_PASSPORT_ITEMS.length) {
        Alert.alert(
          'Felicitări, Connoisseur Emanuela! 👑🎉',
          'Ai degustat toate cele 8 arome semnătură! Ai deblocat o prăjitură gratuită din orice vitrină și acces la sesiunile private de degustare.'
        );
      } else {
        Alert.alert(
          `Aromă Ștampilată! 🏷️ ${item.emoji}`,
          `Ai adăugat "${item.name}" în Pașaportul tău Dulce! (${nextTasted.length}/${SWEET_PASSPORT_ITEMS.length} arome degustate)`
        );
      }
    }
  };

  // Determine VIP Tier
  let vipTier = 'Bronze Member';
  let nextTierPoints = 250;
  let progress = vipPoints / nextTierPoints;
  let tierColor = '#cd7f32';

  if (vipPoints >= 500) {
    vipTier = 'Gold Ambassador';
    nextTierPoints = 1000;
    progress = (vipPoints - 500) / 500;
    tierColor = '#d4af37';
  } else if (vipPoints >= 200) {
    vipTier = 'Silver Connoisseur';
    nextTierPoints = 500;
    progress = (vipPoints - 200) / 300;
    tierColor = '#c0c0c0';
  }

  // Generate stamp grid items
  const renderStamps = () => {
    const stampItems = [];
    for (let i = 0; i < maxStamps; i++) {
      const isStamped = i < stamps;
      stampItems.push(
        <View key={i} style={[styles.stampSlot, isStamped && styles.stampSlotActive]}>
          {isStamped ? (
            <Ionicons name="pizza" size={28} color={colors.bg} />
          ) : (
            <Text style={styles.stampNumber}>{i + 1}</Text>
          )}
        </View>
      );
    }
    return stampItems;
  };

  const requestAuth = () => {
    const reason = t('needAccountDesc');
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 1. Stamp Card Header */}
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Emanuela Loyalty Card</Text>
          <Ionicons name="ribbon" size={24} color={colors.gold} />
        </View>
        <Text style={styles.cardSubtitle}>{t('stampNotice')}</Text>
        
        {/* Stamp Grid */}
        <View style={styles.stampGrid}>
          {renderStamps()}
        </View>

        <Text style={styles.stampsLeftText}>
          {maxStamps - stamps} {t('stampsLeftText')}
        </Text>
      </View>

      {/* QR Code trigger */}
      <TouchableOpacity style={styles.qrButton} onPress={() => (isLoggedIn ? setQrVisible(true) : requestAuth())}>
        <Ionicons name="qr-code-outline" size={22} color={colors.cardBg} />
        <Text style={styles.qrButtonText}>Scanează la Casă</Text>
      </TouchableOpacity>

      {/* 2. THE SWEET TASTE PASSPORT (Pașaportul Dulce Emanuela) */}
      <View style={styles.passportCard}>
        <View style={styles.passportHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 8 }}>📖</Text>
            <View>
              <Text style={styles.passportTitle}>Pașaportul Dulce Emanuela</Text>
              <Text style={styles.passportSubtitle}>Harta celor 8 arome semnătură ale laboratorului</Text>
            </View>
          </View>
          <View style={styles.passportCounterBadge}>
            <Text style={styles.passportCounterText}>
              {tastedIds.length} / {SWEET_PASSPORT_ITEMS.length}
            </Text>
          </View>
        </View>

        {/* Passport Progress Bar */}
        <View style={styles.passportProgressBarBg}>
          <View style={[styles.passportProgressBarFill, { width: `${(tastedIds.length / SWEET_PASSPORT_ITEMS.length) * 100}%` }]} />
        </View>

        <Text style={styles.passportMilestoneText}>
          {tastedIds.length >= 8 
            ? '👑 Felicitări! Ești oficial Connoisseur Emanuela!'
            : tastedIds.length >= 4 
            ? '🥈 Nivel: Explorator Gurmand · Încă 4 arome până la Connoisseur'
            : '🥉 Nivel: Inițiat în Dulce · Apasă pe o aromă degustată pentru ștampilă'}
        </Text>

        {/* Passport Grid */}
        <View style={styles.passportGrid}>
          {SWEET_PASSPORT_ITEMS.map(item => {
            const isTasted = tastedIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.passportItemCard, isTasted && styles.passportItemCardTasted]}
                onPress={() => handleTogglePassportItem(item)}
                activeOpacity={0.7}
              >
                <View style={styles.passportItemTop}>
                  <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                  <View style={[styles.stampPill, isTasted && styles.stampPillActive]}>
                    <Ionicons 
                      name={isTasted ? "checkmark-circle" : "ellipse-outline"} 
                      size={14} 
                      color={isTasted ? '#12100e' : colors.textMuted} 
                    />
                    <Text style={[styles.stampPillText, isTasted && styles.stampPillTextActive]}>
                      {isTasted ? 'Degustat' : 'Netestat'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.passportItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.passportItemDesc} numberOfLines={2}>{item.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Connoisseur perk note */}
        <View style={styles.connoisseurNote}>
          <Ionicons name="sparkles" size={16} color={colors.gold} />
          <Text style={styles.connoisseurNoteText}>
            Colecționează toate cele 8 ștampile pentru a debloca o prăjitură gratuită la alegere și invitație la degustările exclusive din laborator!
          </Text>
        </View>
      </View>

      {/* 3. VIP Tracker section */}
      <View style={styles.vipContainer}>
        <View style={styles.vipHeader}>
          <View>
            <Text style={styles.vipLabel}>Statut Club VIP</Text>
            <Text style={[styles.vipValue, { color: tierColor }]}>{vipTier}</Text>
          </View>
          <Text style={styles.vipPoints}>{vipPoints} {t('vipPointsLabel')}</Text>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: tierColor }]} />
        </View>

        <Text style={styles.progressText}>
          {vipPoints < nextTierPoints 
            ? `Mai ai nevoie de ${nextTierPoints - vipPoints} puncte pentru următorul nivel.`
            : 'Felicitări! Ești la nivelul maxim.'}
        </Text>
      </View>

      {/* 4. Rewards Description list */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Beneficii Niveluri VIP</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={20} color="#cd7f32" style={styles.infoIcon} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoHeadline}>Bronze Member (0 - 199 pct)</Text>
            <Text style={styles.infoBody}>Primești 15 puncte de fidelitate la fiecare felie achiziționată.</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={20} color="#c0c0c0" style={styles.infoIcon} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoHeadline}>Silver Connoisseur (200 - 499 pct)</Text>
            <Text style={styles.infoBody}>Băutură din cafea gratuită la fiecare 3 vizite + acces la pre-comenzi.</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={20} color="#d4af37" style={styles.infoIcon} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoHeadline}>Gold Ambassador (500+ pct)</Text>
            <Text style={styles.infoBody}>Invitații la degustări secrete + rezervări prioritare gratuite.</Text>
          </View>
        </View>
      </View>

      {/* QR Code Modal Simulator */}
      <Modal visible={qrVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContainer}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>Scanează Codul</Text>
              <TouchableOpacity onPress={() => setQrVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.qrModalDesc}>
              Arată codul de client personalului. Punctele sunt acordate și validate de echipa Emanuela.
            </Text>

            <View style={styles.qrBox}>
              <Ionicons name="person-circle-outline" size={72} color={colors.gold} />
              <Text style={[styles.qrModalTitle, { marginTop: 12 }]}>EM-{(user?.uid || '').slice(-8).toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </Modal>
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
  cardContainer: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardTitle: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: 'bold'
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 20
  },
  stampGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  stampSlot: {
    width: '28%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: colors.inputBg
  },
  stampSlotActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
    borderStyle: 'solid'
  },
  stampNumber: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: 'bold'
  },
  stampsLeftText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8
  },
  qrButton: {
    backgroundColor: colors.gold,
    borderRadius: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  qrButtonText: {
    color: '#12100e',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8
  },
  passportCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.gold,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6
  },
  passportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  passportTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text
  },
  passportSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  passportCounterBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  passportCounterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#12100e'
  },
  passportProgressBarBg: {
    height: 6,
    backgroundColor: colors.inputBg,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8
  },
  passportProgressBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 3
  },
  passportMilestoneText: {
    fontSize: 11,
    color: colors.gold,
    fontWeight: '600',
    marginBottom: 14
  },
  passportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between'
  },
  passportItemCard: {
    width: '48.5%',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8
  },
  passportItemCardTasted: {
    borderColor: colors.gold,
    backgroundColor: colors.goldMuted
  },
  passportItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  stampPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
    borderWidth: 1,
    borderColor: colors.border
  },
  stampPillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold
  },
  stampPillText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textMuted
  },
  stampPillTextActive: {
    color: '#12100e',
    fontWeight: 'bold'
  },
  passportItemName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2
  },
  passportItemDesc: {
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 13
  },
  connoisseurNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  connoisseurNoteText: {
    fontSize: 11,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 15
  },
  vipContainer: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  vipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  vipLabel: {
    color: colors.textMuted,
    fontSize: 12
  },
  vipValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2
  },
  vipPoints: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold'
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.inputBg,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4
  },
  infoSection: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 14
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2
  },
  infoTextContainer: {
    flex: 1
  },
  infoHeadline: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold'
  },
  infoBody: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  qrModalContainer: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text
  },
  qrModalDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20
  },
  qrBox: {
    backgroundColor: colors.inputBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gold
  }
});
