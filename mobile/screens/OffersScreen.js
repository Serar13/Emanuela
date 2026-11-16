import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Modal,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const OFFER_TABS = [
  { id: 'all', label: 'Toate', icon: 'sparkles-outline' },
  { id: 'flash', label: 'Flash Deals', icon: 'flash-outline' },
  { id: 'secret', label: 'Meniu Secret', icon: 'lock-open-outline' },
  { id: 'vouchers', label: 'Cadouri & VIP', icon: 'gift-outline' },
  { id: 'news', label: 'Evenimente', icon: 'newspaper-outline' }
];

export default function OffersScreen({ navigation }) {
  const { offers, colors, isLoggedIn, requestAuth: openAuth, t, birthdayVoucherActive } = useApp();
  const styles = getStyles(colors);

  const [activeTab, setActiveTab] = useState('all');
  const [activeModalOffer, setActiveModalOffer] = useState(null);

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

  const handleActivateOffer = (offer) => {
    if (!isLoggedIn) {
      requestAuth();
      return;
    }
    setActiveModalOffer(offer);
  };

  const flashOffers = useMemo(() => offers.filter(o => o.category === 'flash'), [offers]);
  const secretOffers = useMemo(() => offers.filter(o => o.category === 'secret'), [offers]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* 1. Header Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={13} color="#12100e" />
            <Text style={styles.heroBadgeText}>Privilegii Club Emanuela</Text>
          </View>
          <Text style={styles.heroTitle}>Oferte & Rețete Exclusive</Text>
          <Text style={styles.heroSubtitle}>
            Beneficiază de reduceri fulger, sortimente speciale deblocate și cadouri de fidelitate.
          </Text>
        </View>
      </View>

      {/* 2. Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {OFFER_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon} 
                size={15} 
                color={isActive ? '#12100e' : colors.textMuted} 
                style={{ marginRight: 6 }} 
              />
              <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. Flash Offers Section */}
      {(activeTab === 'all' || activeTab === 'flash') && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="flash" size={18} color="#e57373" style={{ marginRight: 6 }} />
              <Text style={styles.sectionHeading}>Oferte Flash Limitate</Text>
            </View>
            <View style={styles.countdownBadge}>
              <Ionicons name="time-outline" size={12} color="#e57373" />
              <Text style={styles.countdownText}>Expiră curând</Text>
            </View>
          </View>

          {flashOffers.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>Nu există oferte flash active chiar acum. Revino curând!</Text>
            </View>
          ) : (
            flashOffers.map(offer => (
              <View key={offer.id} style={styles.flashCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>-20% REDUCERE</Text>
                  </View>
                  <Text style={styles.expiryTag}>Valabil până: {offer.expiry || 'Săptămâna aceasta'}</Text>
                </View>

                <Text style={styles.cardTitle}>{offer.title}</Text>
                <Text style={styles.cardDesc}>{offer.desc}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.codeSnippet}>
                    <Text style={styles.codeSnippetLabel}>Cod Promo:</Text>
                    <Text style={styles.codeSnippetValue}>{offer.code || 'EMANUELA20'}</Text>
                  </View>
                  <TouchableOpacity style={styles.activateBtn} onPress={() => handleActivateOffer(offer)}>
                    <Text style={styles.activateBtnText}>Activează</Text>
                    <Ionicons name="arrow-forward" size={14} color="#12100e" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* 4. Secret Menu Section */}
      {(activeTab === 'all' || activeTab === 'secret') && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="lock-open" size={18} color={colors.gold} style={{ marginRight: 6 }} />
              <Text style={styles.sectionHeading}>Meniu Secret Deblocat</Text>
            </View>
            <View style={styles.secretTag}>
              <Text style={styles.secretTagText}>Doar în aplicație</Text>
            </View>
          </View>

          {secretOffers.length === 0 ? (
            <View style={styles.secretCardPlaceholder}>
              <Ionicons name="sparkles" size={24} color={colors.gold} style={{ marginBottom: 6 }} />
              <Text style={styles.secretCardTitle}>Rețete Secrete de Sezon</Text>
              <Text style={styles.secretCardDesc}>
                Descoperă sortimentele inedite de mousse cu fistic de Bronte, tartele cu fructe exotice și rețetele de laborator disponibile exclusiv pentru membrii aplicației.
              </Text>
              <TouchableOpacity
                style={styles.goToMenuBtn}
                onPress={() => navigation?.navigate?.('Menu')}
              >
                <Text style={styles.goToMenuBtnText}>Explorează în Catalog</Text>
              </TouchableOpacity>
            </View>
          ) : (
            secretOffers.map(offer => (
              <View key={offer.id} style={styles.secretCard}>
                <View style={styles.secretIconRow}>
                  <View style={styles.secretCrownBox}>
                    <Ionicons name="star" size={16} color="#12100e" />
                  </View>
                  <Text style={styles.secretCardCategory}>Sortiment Secret</Text>
                </View>

                <Text style={styles.secretCardTitle}>{offer.title}</Text>
                <Text style={styles.secretCardDesc}>{offer.desc}</Text>

                <TouchableOpacity
                  style={styles.goToMenuBtn}
                  onPress={() => navigation?.navigate?.('Menu')}
                >
                  <Ionicons name="restaurant-outline" size={16} color="#12100e" style={{ marginRight: 6 }} />
                  <Text style={styles.goToMenuBtnText}>Vezi în Meniu</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      {/* 5. Vouchers & VIP Rewards */}
      {(activeTab === 'all' || activeTab === 'vouchers') && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="gift" size={18} color={colors.champagne} style={{ marginRight: 6 }} />
              <Text style={styles.sectionHeading}>Vouchere & Recompense VIP</Text>
            </View>
          </View>

          {/* Birthday Slice Gift Card */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardLeft}>
              <View style={styles.rewardIconCircle}>
                <Text style={{ fontSize: 22 }}>🎂</Text>
              </View>
            </View>
            <View style={styles.rewardContent}>
              <Text style={styles.rewardTitle}>Felie Cadou de Ziua Ta</Text>
              <Text style={styles.rewardDesc}>
                De ziua ta aniversară, o prăjitură artizanală din orice vitrină a laboratorului este din partea casei!
              </Text>
              <View style={styles.rewardStatusPill}>
                <Ionicons name="checkmark-circle" size={14} color="#81c784" />
                <Text style={styles.rewardStatusText}>Activ pentru toți membrii înregistrați</Text>
              </View>
            </View>
          </View>

          {/* 9+1 Stamp Card */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardLeft}>
              <View style={[styles.rewardIconCircle, { backgroundColor: colors.goldMuted }]}>
                <Text style={{ fontSize: 22 }}>🍰</Text>
              </View>
            </View>
            <View style={styles.rewardContent}>
              <Text style={styles.rewardTitle}>Club 9 + 1 Gratuit</Text>
              <Text style={styles.rewardDesc}>
                Cumpără 9 porții la pahar sau felii de tort, iar a 10-a este gratuită automat prin cardul de fidelitate.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 6. Events & News */}
      {(activeTab === 'all' || activeTab === 'news') && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="newspaper" size={18} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={styles.sectionHeading}>Noutăți din Laborator</Text>
            </View>
          </View>

          <View style={styles.newsCard}>
            <View style={styles.newsDateBadge}>
              <Ionicons name="calendar-outline" size={12} color={colors.gold} />
              <Text style={styles.newsDateText}>12 Iunie 2026</Text>
            </View>
            <Text style={styles.newsTitle}>Degustare specială la Târgu Mureș 🍒</Text>
            <Text style={styles.newsDesc}>
              Te invităm vineri începând cu ora 18:00 la o degustare gratuită de rețete experimentale cu cireșe de sezon. Locuri limitate! Poți rezerva direct masa din ecranul Rezervări.
            </Text>
          </View>

          <View style={styles.newsCard}>
            <View style={styles.newsDateBadge}>
              <Ionicons name="calendar-outline" size={12} color={colors.gold} />
              <Text style={styles.newsDateText}>08 Iunie 2026</Text>
            </View>
            <Text style={styles.newsTitle}>Noutăți din laboratorul Câmpia Turzii 🌿</Text>
            <Text style={styles.newsDesc}>
              Pregătim sortimente noi și candy bar-uri personalizate pentru nunți și botezuri. Consultă-ne pentru oferte personalizate!
            </Text>
          </View>
        </View>
      )}

      {/* Promo Code Modal Simulator */}
      <Modal visible={activeModalOffer !== null} transparent={true} animationType="fade" onRequestClose={() => setActiveModalOffer(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.promoModalBox}>
            <View style={styles.promoModalHeader}>
              <Text style={styles.promoModalTitle}>Cod Promoțional</Text>
              <TouchableOpacity onPress={() => setActiveModalOffer(null)}>
                <Ionicons name="close" size={26} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.promoOfferName}>{activeModalOffer?.title}</Text>
            <Text style={styles.promoOfferDesc}>
              Prezintă acest cod la casa de marcat sau adaugă-l în comandă pentru a primi reducerea.
            </Text>

            <View style={styles.codeTicket}>
              <Text style={styles.codeTicketText}>{activeModalOffer?.code || 'EMANUELA20'}</Text>
              <Text style={styles.codeTicketSub}>Valabil la orice comandă</Text>
            </View>

            <TouchableOpacity style={styles.closePromoBtn} onPress={() => setActiveModalOffer(null)}>
              <Text style={styles.closePromoBtnText}>Gata, mulțumesc!</Text>
            </TouchableOpacity>
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
  heroBanner: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.gold,
    marginBottom: 16,
    overflow: 'hidden'
  },
  heroContent: {
    zIndex: 2
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
    gap: 4
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#12100e'
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border
  },
  tabBtnActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted
  },
  tabBtnTextActive: {
    color: '#12100e',
    fontWeight: 'bold'
  },
  sectionBlock: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 115, 115, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  countdownText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#e57373'
  },
  flashCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  discountBadge: {
    backgroundColor: '#e57373',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  discountBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#12100e'
  },
  expiryTag: {
    fontSize: 11,
    color: colors.textMuted
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 14
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12
  },
  codeSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  codeSnippetLabel: {
    fontSize: 11,
    color: colors.textMuted
  },
  codeSnippetValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.gold,
    letterSpacing: 1
  },
  activateBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  activateBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#12100e'
  },
  secretTag: {
    backgroundColor: colors.goldMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  secretTagText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.gold
  },
  secretCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.gold,
    marginBottom: 12
  },
  secretCardPlaceholder: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    textAlign: 'center'
  },
  secretIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6
  },
  secretCrownBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secretCardCategory: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.gold,
    textTransform: 'uppercase'
  },
  secretCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6
  },
  secretCardDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 16
  },
  goToMenuBtn: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  goToMenuBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#12100e'
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    alignItems: 'center'
  },
  rewardLeft: {
    marginRight: 14
  },
  rewardIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rewardContent: {
    flex: 1
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4
  },
  rewardDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    marginBottom: 6
  },
  rewardStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  rewardStatusText: {
    fontSize: 11,
    color: '#81c784',
    fontWeight: '600'
  },
  newsCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10
  },
  newsDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6
  },
  newsDateText: {
    fontSize: 11,
    color: colors.textMuted
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6
  },
  newsDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18
  },
  emptyCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center'
  },
  emptyCardText: {
    fontSize: 12,
    color: colors.textMuted
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  promoModalBox: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  promoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12
  },
  promoModalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.gold
  },
  promoOfferName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6
  },
  promoOfferDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16
  },
  codeTicket: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderStyle: 'dashed',
    marginBottom: 16
  },
  codeTicketText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gold,
    letterSpacing: 2
  },
  codeTicketSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4
  },
  closePromoBtn: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center'
  },
  closePromoBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#12100e'
  }
});
