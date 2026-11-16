import React, { useState, useEffect } from 'react';
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
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../context/AppContext';
import { COLLECTIONS } from '../services/collections';
import { sendPushNotification } from '../services/pushService';

const PRESETS = [
  {
    title: '⚡ Flash 20% Reducere la Torturi!',
    body: 'Valabil doar astăzi la orice comandă din aplicație cu codul EMANUELA20.',
    category: 'flash',
    screen: 'Offers'
  },
  {
    title: '🤫 Meniu Secret Nou Deblocat!',
    body: 'Am lansat o rețetă inedită de mousse cu fistic artizanal în meniul secret.',
    category: 'secret',
    screen: 'Menu'
  },
  {
    title: '🍒 Degustare Gratuită Vineri!',
    body: 'Te așteptăm începând cu ora 18:00 la Târgu Mureș. Rezervă din timp o masă!',
    category: 'event',
    screen: 'Reservations'
  }
];

export default function AdminPushModal({ visible, onClose }) {
  const { colors, user } = useApp();
  const styles = getStyles(colors);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('flash');
  const [targetScreen, setTargetScreen] = useState('Offers');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Listen to recent notifications in real-time
  useEffect(() => {
    if (!visible) return;
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(rows);
      setHistoryLoading(false);
    }, (err) => {
      console.warn('Error loading notifications history:', err);
      setHistoryLoading(false);
    });

    return () => unsubscribe();
  }, [visible]);

  const handleApplyPreset = (p) => {
    setTitle(p.title);
    setBody(p.body);
    setCategory(p.category);
    setTargetScreen(p.screen);
  };

  const handleSendPush = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Câmpuri lipsă', 'Te rugăm să introduci titlul și mesajul notificării.');
      return;
    }

    setSending(true);
    try {
      const res = await sendPushNotification({
        title: title.trim(),
        body: body.trim(),
        category,
        targetScreen,
        sentBy: user?.name ? `Mobil (${user.name})` : 'Mobile Admin'
      });

      Alert.alert(
        'Notificare Trimisă! 🚀',
        `Notificarea a fost expediată cu succes către ${res.recipientsCount} dispozitive înregistrate.`
      );

      setTitle('');
      setBody('');
    } catch (err) {
      console.error(err);
      Alert.alert('Eroare', 'Nu s-a putut trimite notificarea: ' + err.message);
    } finally {
      setSending(false);
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.headerIcon}>
                <Ionicons name="notifications" size={18} color="#1b1713" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.headerTitle}>Panou Admin · Notificări Push</Text>
                <Text style={styles.headerSubtitle}>Trimite alerte direct pe telefoanele clienților</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={26} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* Presets Chips */}
            <Text style={styles.fieldLabel}>Șabloane Rapide:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {PRESETS.map((p, i) => (
                <TouchableOpacity key={i} style={styles.presetChip} onPress={() => handleApplyPreset(p)}>
                  <Text style={styles.presetChipText}>{p.title.split(' ')[0]} {p.title.split(' ')[1]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Inputs */}
            <Text style={styles.fieldLabel}>Titlu Notificare:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 🍰 Reducere 20% la Torturi!"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>Mesaj Push:</Text>
            <TextInput
              style={[styles.textInput, { height: 75, textAlignVertical: 'top' }]}
              placeholder="Ex: Folosește codul EMANUELA20 la orice comandă astăzi!"
              placeholderTextColor={colors.textMuted}
              multiline
              value={body}
              onChangeText={setBody}
            />

            {/* Selectors Row */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subFieldLabel}>Categorie:</Text>
                <View style={styles.categoryPicker}>
                  {['flash', 'secret', 'event'].map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.catOption, category === c && styles.catOptionActive]}
                      onPress={() => setCategory(c)}
                    >
                      <Text style={[styles.catOptionText, category === c && styles.catOptionTextActive]}>
                        {c === 'flash' ? '⚡ Flash' : c === 'secret' ? '🤫 Secret' : '🍒 Eveniment'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.subFieldLabel}>Ecran Țintă:</Text>
                <View style={styles.categoryPicker}>
                  {['Offers', 'Menu', 'Reservations'].map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.catOption, targetScreen === s && styles.catOptionActive]}
                      onPress={() => setTargetScreen(s)}
                    >
                      <Text style={[styles.catOptionText, targetScreen === s && styles.catOptionTextActive]}>
                        {s === 'Offers' ? 'Oferte' : s === 'Menu' ? 'Meniu' : 'Mese'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Live Mockup Preview */}
            <View style={styles.previewBox}>
              <View style={styles.previewTop}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 12 }}>🍰</Text>
                  <Text style={styles.previewBrand}>LABORATOR EMANUELA</Text>
                </View>
                <Text style={styles.previewTime}>acum</Text>
              </View>
              <Text style={styles.previewTitle}>{title.trim() || 'Titlu notificare...'}</Text>
              <Text style={styles.previewBody}>{body.trim() || 'Previzualizare mesaj push pe ecranul telefonului.'}</Text>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={[styles.sendButton, sending && { opacity: 0.7 }]}
              onPress={handleSendPush}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#1b1713" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color="#1b1713" style={{ marginRight: 8 }} />
                  <Text style={styles.sendButtonText}>Trimite Notificarea Acum</Text>
                </>
              )}
            </TouchableOpacity>

            {/* History Section */}
            <Text style={[styles.fieldLabel, { marginTop: 24 }]}>Istoric Notificări Recente:</Text>
            {historyLoading ? (
              <ActivityIndicator color={colors.gold} style={{ marginVertical: 10 }} />
            ) : history.length === 0 ? (
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>Nicio notificare trimisă încă.</Text>
            ) : (
              history.map(item => (
                <View key={item.id} style={styles.historyCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.historyTitle}>{item.title}</Text>
                    <View style={styles.sentPill}>
                      <Text style={styles.sentPillText}>Trimisă 🟢</Text>
                    </View>
                  </View>
                  <Text style={styles.historyBody}>{item.body}</Text>
                  <View style={styles.historyMetaRow}>
                    <Text style={styles.historyMeta}>De: {item.sentBy || 'Admin'}</Text>
                    <Text style={styles.historyMeta}>Destinație: {item.targetScreen || 'Offers'}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
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
    height: '90%',
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerIcon: {
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
    fontSize: 11,
    color: colors.textMuted
  },
  closeBtn: {
    padding: 4
  },
  scrollBody: {
    flex: 1,
    backgroundColor: colors.bg
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6
  },
  subFieldLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6
  },
  presetChip: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text
  },
  textInput: {
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12
  },
  categoryPicker: {
    gap: 4
  },
  catOption: {
    backgroundColor: colors.inputBg,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  catOptionActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold
  },
  catOptionText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600'
  },
  catOptionTextActive: {
    color: '#12100e',
    fontWeight: 'bold'
  },
  previewBox: {
    backgroundColor: '#1b1713',
    borderRadius: 14,
    padding: 14,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(242,191,120,0.3)'
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  previewBrand: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.champagne,
    letterSpacing: 1
  },
  previewTime: {
    fontSize: 9,
    color: '#aaa'
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4
  },
  previewBody: {
    fontSize: 11,
    color: '#cccccc',
    lineHeight: 15
  },
  sendButton: {
    backgroundColor: colors.gold,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b1713'
  },
  historyCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1
  },
  sentPill: {
    backgroundColor: 'rgba(129, 199, 132, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8
  },
  sentPillText: {
    fontSize: 10,
    color: '#81c784',
    fontWeight: 'bold'
  },
  historyBody: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16
  },
  historyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6
  },
  historyMeta: {
    fontSize: 10,
    color: colors.textMuted
  }
});
