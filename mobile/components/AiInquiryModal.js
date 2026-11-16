import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { createOfferRequest } from '../services/firestore';

const QUICK_SUGGESTIONS = [
  "🎂 Tort aniversare (15-20 persoane)",
  "💍 Tort nuntă cu etaje & degustare",
  "🧁 Candy Bar pentru 50+ invitați",
  "🍓 Mousse ciocolată & fructe de pădure",
  "🌿 Fără zahăr adăugat / Fără gluten"
];

export default function AiInquiryModal({ visible, onClose, product }) {
  const { colors, user, isLoggedIn, t } = useApp();
  const styles = getStyles(colors);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Client contact info for guest or override
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);

  const scrollViewRef = useRef(null);

  // Initialize conversation when modal opens with a product
  useEffect(() => {
    if (visible && product) {
      const initialGreeting = {
        id: 'msg-init-1',
        sender: 'ai',
        text: `Bună! Sunt asistentul virtual al laboratorului Emanuela. 🍰\n\nPentru produsul "${product.name}", prețul este personalizat în funcție de numărul de invitați, ingrediente și decor.\n\nPovestește-mi puțin: pentru ce fel de eveniment îl dorești (aniversare, nuntă, botez), pentru câte persoane și la ce dată?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialGreeting]);
      setSubmitted(false);
      setShowContactForm(false);
      if (user) {
        setContactName(user.name || '');
        setContactPhone(user.phone || '');
      }
    }
  }, [visible, product, user]);

  const generateAiReply = (userText, history) => {
    const textLower = userText.toLowerCase();

    // Smart logic for event context & pricing estimation
    let reply = "";
    let extractedPeople = null;

    // Detect number of guests / portions
    const numberMatch = textLower.match(/(\d+)\s*(persoane|invitati|oameni|portii|kg)/);
    if (numberMatch) {
      extractedPeople = parseInt(numberMatch[1], 10);
    }

    if (textLower.includes('pret') || textLower.includes('cost') || textLower.includes('cat costa') || extractedPeople) {
      if (extractedPeople) {
        const estKg = Math.max(1.5, (extractedPeople * 0.12).toFixed(1));
        const estMin = Math.round(estKg * 110);
        const estMax = Math.round(estKg * 140);
        reply = `Pentru aproximativ ${extractedPeople} persoane, recomandăm un tort de circa ${estKg} kg. Prețul orientativ în laboratorul nostru este între ${estMin} și ${estMax} RON (aprox. 110 - 140 RON/kg în funcție de ingrediente și complexitatea decorului).\n\nCe arome vă tentează cel mai mult? Preferi ciocolată fină, fructe proaspete, mousse trio sau fistic?`;
      } else {
        reply = `Prețurile noastre pentru torturi personalizate încep de la aproximativ 110 RON/kg, în funcție de compoziția aleasă (fructe naturale, ciocolată belgiană, decor artizanal).\n\nCâte persoane estimezi că vor participa la eveniment?`;
      }
    } else if (textLower.includes('candy') || textLower.includes('bar')) {
      reply = `Candy Bar-ul Emanuela include o varietate delicioasă de deserturi individuale: mini-pavlova, shot-uri de mousse, tartelete cu fructe proaspete, macarons și brioșe tematice. Recomandăm circa 3-4 piese per invitat. Dorești să includem și servicii de amenajare la locație?`;
    } else if (textLower.includes('nunta') || textLower.includes('botez')) {
      reply = `Felicitări pentru eveniment! 💍 Oferim și sesiune de degustare pentru viitorii miri sau părinți, ca să alegeți combinația favorită de compoziții. În ce dată și în ce locație (Târgu Mureș / Câmpia Turzii sau împrejurimi) va avea loc evenimentul?`;
    } else if (textLower.includes('gluten') || textLower.includes('zahar') || textLower.includes('alergii') || textLower.includes('vegan')) {
      reply = `Putem adapta compoziția cu îndulcitori naturali sau fără făină de grâu pentru anumite rețete de mousse și bezea. Totuși, menționăm că în laborator se lucrează și cu gluten și lactate. Te rugăm să ne specifici orice alergie exactă pentru a lua toate măsurile de siguranță!`;
    } else if (textLower.includes('ciocolata') || textLower.includes('fructe') || textLower.includes('fistic') || textLower.includes('vanilie')) {
      reply = `O alegere excelentă! La Laborator Emanuela folosim ciocolată belgiană veritabilă și piureuri naturale din fructe. Pentru un plus de prospețime, putem adăuga un strat crocant de pralină sau inserție de fructe de pădure. Sună bine?`;
    } else if (textLower.includes('data') || textLower.includes('cand') || textLower.includes('maine') || textLower.includes('saptamana') || textLower.includes('luna')) {
      reply = `Am notat perioada dorită! Pentru comenzi mari și torturi de eveniment, recomandăm plasarea comenzii cu cel puțin 5-7 zile înainte pentru a rezerva data în laborator.\n\nDacă dorești, poți apăsa oricând pe „Trimite cererea” de mai jos, iar cofetarul nostru șef va pregăti oferta exactă pentru tine!`;
    } else {
      reply = `Am înțeles detaliile menționate. La Laborator Emanuela realizăm fiecare desert artizanal, doar cu ingrediente premium. Vrei să adaugi și o tematică anume sau un mesaj personalizat pe tort? Dacă ai toate detaliile, putem trimite cererea direct către cofetărie!`;
    }

    return reply;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiText = generateAiReply(userMsg.text, newHistory);
      const aiMsg = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...newHistory, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickSuggestion = (text) => {
    setInputText(text);
  };

  const handleSaveAndSubmit = async () => {
    const name = contactName.trim() || user?.name || 'Client App';
    const phone = contactPhone.trim() || user?.phone || '';

    if (!phone && !isLoggedIn) {
      setShowContactForm(true);
      Alert.alert('Informații de contact', 'Te rugăm să introduci un număr de telefon pentru a primi oferta personalizată de la cofetărie.');
      return;
    }

    setIsSubmitting(true);
    try {
      const offerData = {
        source: 'mobile_ai_chat',
        productId: product?.id || '',
        productName: product?.name || 'Preț la cerere',
        customerName: name,
        phone: phone,
        email: user?.email || '',
        status: 'new',
        aiChatTranscript: messages.map(m => `[${m.sender.toUpperCase()} - ${m.timestamp}]: ${m.text}`).join('\n\n'),
        messages: messages.map(m => ({
          sender: m.sender,
          text: m.text,
          timestamp: m.timestamp
        })),
        eventType: 'Personalizat / AI Chat',
        notes: `Inițiat din aplicație pentru produsul: ${product?.name}`
      };

      await createOfferRequest(offerData);
      setSubmitted(true);
      setShowContactForm(false);
    } catch (err) {
      console.error('Error submitting offer request:', err);
      Alert.alert('Eroare', 'Nu s-a putut trimite cererea. Te rugăm să încerci din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.botAvatar}>
                <Ionicons name="sparkles" size={18} color="#1b1713" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.headerTitle}>Asistent AI Emanuela</Text>
                <Text style={styles.headerSubtitle}>Consultanță & Preț la cerere</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Product context banner */}
            {product && (
              <View style={styles.productBanner}>
                <Ionicons name="pricetag-outline" size={14} color={colors.gold} />
                <Text style={styles.productBannerText} numberOfLines={1}>
                  Produs: <Text style={{ fontWeight: 'bold' }}>{product.name}</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Body: Chat messages or Success State */}
          {submitted ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconBox}>
                <Ionicons name="checkmark-circle" size={56} color="#81c784" />
              </View>
              <Text style={styles.successTitle}>Cererea a fost trimisă!</Text>
              <Text style={styles.successDesc}>
                Detaliile stabilite în conversație au fost transmise laboratorului nostru. Echipa noastră va analiza cerințele și te va contacta în cel mai scurt timp cu o ofertă personalizată.
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                <Text style={styles.doneBtnText}>Am înțeles, mulțumesc!</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView
                ref={scrollViewRef}
                style={styles.chatScroll}
                contentContainerStyle={styles.chatContent}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                keyboardShouldPersistTaps="handled"
              >
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.msgBubble,
                      msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                    ]}
                  >
                    {msg.sender === 'ai' && (
                      <View style={styles.senderHeader}>
                        <Ionicons name="sparkles" size={12} color={colors.gold} />
                        <Text style={styles.senderLabel}>Emanuela AI</Text>
                      </View>
                    )}
                    <Text style={msg.sender === 'user' ? styles.userText : styles.aiText}>
                      {msg.text}
                    </Text>
                    <Text style={msg.sender === 'user' ? styles.userTimestamp : styles.aiTimestamp}>
                      {msg.timestamp}
                    </Text>
                  </View>
                ))}

                {isTyping && (
                  <View style={[styles.msgBubble, styles.aiBubble, styles.typingBubble]}>
                    <ActivityIndicator size="small" color={colors.gold} />
                    <Text style={[styles.aiText, { marginLeft: 8, fontStyle: 'italic', fontSize: 13 }]}>
                      Emanuela AI scrie...
                    </Text>
                  </View>
                )}

                {/* Optional Contact fields drawer */}
                {showContactForm && (
                  <View style={styles.contactCard}>
                    <Text style={styles.contactTitle}>Date de contact pentru ofertă:</Text>
                    <TextInput
                      style={styles.contactInput}
                      placeholder="Numele tău"
                      placeholderTextColor={colors.textMuted}
                      value={contactName}
                      onChangeText={setContactName}
                    />
                    <TextInput
                      style={styles.contactInput}
                      placeholder="Număr de telefon (ex: 0740...)"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="phone-pad"
                      value={contactPhone}
                      onChangeText={setContactPhone}
                    />
                  </View>
                )}
              </ScrollView>

              {/* Quick suggestions chips */}
              <View style={styles.chipsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
                  {QUICK_SUGGESTIONS.map((sug, i) => (
                    <TouchableOpacity key={i} style={styles.chip} onPress={() => handleQuickSuggestion(sug)}>
                      <Text style={styles.chipText}>{sug}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Input row & Action buttons */}
              <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Scrie un mesaj sau o cerință..."
                    placeholderTextColor={colors.textMuted}
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                  />
                  <TouchableOpacity
                    style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
                    onPress={handleSend}
                    disabled={!inputText.trim()}
                  >
                    <Ionicons name="arrow-up" size={20} color="#1b1713" />
                  </TouchableOpacity>
                </View>

                {/* Finalize & Submit Button */}
                <TouchableOpacity
                  style={[styles.submitOfferBtn, isSubmitting && { opacity: 0.7 }]}
                  onPress={handleSaveAndSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#1b1713" />
                  ) : (
                    <>
                      <Ionicons name="paper-plane-outline" size={18} color="#1b1713" style={{ marginRight: 8 }} />
                      <Text style={styles.submitOfferBtnText}>Trimite cererea și solicită oferta cofetăriei</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (colors) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end'
  },
  sheetContainer: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '88%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardBg
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted
  },
  closeBtn: {
    padding: 4
  },
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10
  },
  productBannerText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 6
  },
  chatScroll: {
    flex: 1,
    backgroundColor: colors.bg
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20
  },
  msgBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.gold,
    borderBottomRightRadius: 4
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold,
    marginLeft: 4,
    textTransform: 'uppercase'
  },
  aiText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20
  },
  userText: {
    fontSize: 14,
    color: '#1b1713',
    lineHeight: 20,
    fontWeight: '500'
  },
  aiTimestamp: {
    fontSize: 10,
    color: colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 4
  },
  userTimestamp: {
    fontSize: 10,
    color: 'rgba(27,23,19,0.7)',
    alignSelf: 'flex-end',
    marginTop: 4
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  chipsContainer: {
    paddingVertical: 8,
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  chip: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  chipText: {
    fontSize: 12,
    color: colors.text
  },
  inputContainer: {
    padding: 12,
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    color: colors.text,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  submitOfferBtn: {
    backgroundColor: colors.champagne,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitOfferBtnText: {
    color: '#1b1713',
    fontWeight: 'bold',
    fontSize: 13
  },
  contactCard: {
    backgroundColor: colors.cardBg,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold,
    marginTop: 10,
    marginBottom: 10
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8
  },
  contactInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.bg
  },
  successIconBox: {
    marginBottom: 16
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center'
  },
  successDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  doneBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12
  },
  doneBtnText: {
    color: '#1b1713',
    fontWeight: 'bold',
    fontSize: 14
  }
});
