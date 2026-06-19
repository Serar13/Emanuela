import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const LOCAL_TRANSLATIONS = {
  ro: {
    storyTitle: "Povestea Noastră",
    statsTitle: "Laborator Emanuela în Cifre",
    valuesTitle: "Valorile Noastre",
    connectWithUs: "Urmărește-ne online",
    brandBadge: "🍰 LABORATOR DE PRĂJITURI ARTIZANALE",
    brandBadgeDesc: "Din 2017, creăm lingurițe de bunătate în laboratorul nostru din Târgu Mureș.",

    // Stats
    statCakes: "Sortimente",
    statLocations: "Locații",
    statYears: "Ani de Pasiune",

    // Timeline
    t1Title: "2017 - Prima rețetă perfectă",
    t1Desc: "Din dorința de a aduce produse de cofetărie de calitate superioară în Târgu Mureș, primele rețete au fost perfecționate cu grijă timp de câteva luni. Astfel s-a născut Laborator Emanuela.",
    t2Title: "2018-2019 - Primul Laborator",
    t2Desc: "Am început în Târgu Mureș ca un laborator mic ce livra prăjituri și torturi către restaurante partenere. Succesul rapid ne-a motivat să deschidem prima cofetărie proprie.",
    t3Title: "2020 - Extinderea gamei",
    t3Desc: "Am extins gama de produse artizanale și am consolidat parteneriatele cu restaurantele din Transilvania, construind reputația de laborator de referință.",
    t4Title: "2024 - Expansiune în Câmpia Turzii",
    t4Desc: "Am deschis o nouă locație în Câmpia Turzii, pe Str. 1 Decembrie 1918 nr. 3-5, aducând lingurițe de bunătate mai aproape de iubitorii de dulce din regiune.",

    // Values
    v1Title: "Simplitate",
    v1Desc: "Motto-ul nostru este 'Lingurițe de bunătate'. Credem în simplitatea gustului autentic și în ingredientele naturale.",
    v2Title: "Calitate Artizanală",
    v2Desc: "Folosim exclusiv ingrediente premium și preparăm manual în propriul laborator, respectând cele mai înalte standarde.",
    v3Title: "Comunitate",
    v3Desc: "Fiecare cofetărie este gândită ca un refugiu cald unde te poți bucura de clipe dulci alături de cei dragi."
  },
  en: {
    storyTitle: "Our Story",
    statsTitle: "Laborator Emanuela in Numbers",
    valuesTitle: "Our Values",
    connectWithUs: "Connect with Us Online",
    brandBadge: "🍰 ARTISAN PASTRY LABORATORY",
    brandBadgeDesc: "Since 2017, crafting sweet spoonfuls in our Târgu Mureș laboratory.",

    // Stats
    statCakes: "Flavors",
    statLocations: "Locations",
    statYears: "Years of Passion",

    // Timeline
    t1Title: "2017 - The First Perfect Recipe",
    t1Desc: "Driven by the desire to bring superior quality pastries to Târgu Mureș, the first recipes were carefully perfected over several months. This is how Laborator Emanuela was born.",
    t2Title: "2018-2019 - First Laboratory",
    t2Desc: "We started in Târgu Mureș as a small laboratory supplying cakes and pastries to partner restaurants. The immediate success motivated us to open our first retail shop.",
    t3Title: "2020 - Expanding the Range",
    t3Desc: "We expanded our artisan product range and strengthened partnerships with restaurants across Transylvania, building our reputation as a leading pastry lab.",
    t4Title: "2024 - Expansion to Câmpia Turzii",
    t4Desc: "We opened a new location in Câmpia Turzii, at Str. 1 Decembrie 1918 no. 3-5, bringing our sweet creations closer to dessert lovers in the region.",

    // Values
    v1Title: "Simplicity",
    v1Desc: "Our motto is 'Sweet spoonfuls'. We believe in the simple beauty of authentic flavors and natural ingredients.",
    v2Title: "Artisan Quality",
    v2Desc: "We use only premium ingredients and prepare everything by hand in our own lab, maintaining the highest culinary standards.",
    v3Title: "Community",
    v3Desc: "Our shops are designed as warm spaces where you can share sweet, memorable moments with friends and family."
  },
  hu: {
    storyTitle: "Történetünk",
    statsTitle: "A Laborator Emanuela számokban",
    valuesTitle: "Értékeink",
    connectWithUs: "Kövess minket online",
    brandBadge: "🍰 KÉZMŰVES CUKRÁSZATI LABORATÓRIUM",
    brandBadgeDesc: "2017 óta kézzel készített édességeket kínálunk marosvásárhelyi laboratóriumunkból.",

    // Stats
    statCakes: "Termékek",
    statLocations: "Helyszínek",
    statYears: "Szenvedély Évei",

    // Timeline
    t1Title: "2017 - Az első tökéletes recept",
    t1Desc: "A minőségi cukrászsütemények Marosvásárhelyre hozásának vágyától vezérelve az első recepteket gondosan tökéletesítettük. Így született meg a Laborator Emanuela.",
    t2Title: "2018-2019 - Az Első Laboratórium",
    t2Desc: "Kis laboratóriumként kezdtük Marosvásárhelyen, süteményeket és tortákat szállítva partneréttermeinknek. A gyors siker arra ösztönzött minket, hogy megnyissuk első saját cukrászdánkat.",
    t3Title: "2020 - A kínálat bővítése",
    t3Desc: "Bővítettük kézműves termékkínálatunkat és erősítettük együttműködéseinket erdélyi partneréttermeinkkel.",
    t4Title: "2024 - Terjeszkedés Aranyosgyéresen",
    t4Desc: "Új helyszínt nyitottunk Aranyosgyéresen, az 1918. december 1. utca 3-5. szám alatt, közelebb hozva finomságainkat a régió édességkedvelőihez.",

    // Values
    v1Title: "Egyszerűség",
    v1Desc: "Mottónk: 'Édes kanalak'. Hiszünk az autentikus ízek és természetes alapanyagok egyszerű szépségében.",
    v2Title: "Kézműves Minőség",
    v2Desc: "Kizárólag prémium alapanyagokat használunk, és kézzel készítünk mindent saját laborunkban, a legmagasabb minőségben.",
    v3Title: "Közösség",
    v3Desc: "Cukrászdáinkat meleg, barátságos menedékként alakítottuk ki, ahol édes pillanatokat oszthat meg szeretteivel."
  }
};

export default function AboutScreen() {
  const { colors, language } = useApp();
  const styles = getStyles(colors);

  const loc = LOCAL_TRANSLATIONS[language] || LOCAL_TRANSLATIONS['ro'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Brand Hero Header */}
      <View style={styles.heroCard}>
        <View style={styles.logoCircle}>
          <Ionicons name="restaurant" size={32} color={colors.gold} />
        </View>
        <Text style={styles.brandTitle}>Laborator Emanuela</Text>
        <Text style={styles.brandMotto}>Lingurițe de bunătate</Text>

        {/* Brand Badge Section */}
        <View style={styles.royalBadge}>
          <Text style={styles.royalBadgeTitle}>{loc.brandBadge}</Text>
          <Text style={styles.royalBadgeDesc}>{loc.brandBadgeDesc}</Text>
        </View>
      </View>

      {/* Social Media Section */}
      <View style={styles.socialsRow}>
        <TouchableOpacity 
          style={[styles.socialCard, { borderColor: '#e1306c' }]} 
          onPress={() => Linking.openURL('https://www.instagram.com/laboratoremanuela')}
        >
          <Ionicons name="logo-instagram" size={20} color="#e1306c" />
          <Text style={styles.socialLabel}>Instagram</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialCard, { borderColor: '#1877f2' }]}
          onPress={() => Linking.openURL('https://www.facebook.com/laboratoremanuela')}
        >
          <Ionicons name="logo-facebook" size={20} color="#1877f2" />
          <Text style={styles.socialLabel}>Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.socialCard, { borderColor: colors.gold }]}
          onPress={() => Linking.openURL('https://laboratoremanuela.ro')}
        >
          <Ionicons name="globe-outline" size={20} color={colors.gold} />
          <Text style={styles.socialLabel}>Website</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <Text style={styles.sectionTitle}>{loc.statsTitle}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>60+</Text>
          <Text style={styles.statLabel}>{loc.statCakes}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>{loc.statLocations}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>7+</Text>
          <Text style={styles.statLabel}>{loc.statYears}</Text>
        </View>
      </View>

      {/* Timeline Story Section */}
      <Text style={styles.sectionTitle}>{loc.storyTitle}</Text>
      <View style={styles.timelineCard}>
        {/* Timeline Item 1 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={styles.timelineDotActive} />
            <View style={styles.timelineLine} />
          </View>
          <View style={styles.timelineRight}>
            <Text style={styles.timelineYear}>{loc.t1Title}</Text>
            <Text style={styles.timelineText}>{loc.t1Desc}</Text>
          </View>
        </View>

        {/* Timeline Item 2 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={styles.timelineDotActive} />
            <View style={styles.timelineLine} />
          </View>
          <View style={styles.timelineRight}>
            <Text style={styles.timelineYear}>{loc.t2Title}</Text>
            <Text style={styles.timelineText}>{loc.t2Desc}</Text>
          </View>
        </View>

        {/* Timeline Item 3 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={styles.timelineDotActive} />
            <View style={styles.timelineLine} />
          </View>
          <View style={styles.timelineRight}>
            <Text style={styles.timelineYear}>{loc.t3Title}</Text>
            <Text style={styles.timelineText}>{loc.t3Desc}</Text>
          </View>
        </View>

        {/* Timeline Item 4 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={styles.timelineDotActive} />
          </View>
          <View style={styles.timelineRight}>
            <Text style={styles.timelineYear}>{loc.t4Title}</Text>
            <Text style={styles.timelineText}>{loc.t4Desc}</Text>
          </View>
        </View>
      </View>

      {/* Values Section */}
      <Text style={styles.sectionTitle}>{loc.valuesTitle}</Text>
      <View style={styles.valuesContainer}>
        {/* Value 1 */}
        <View style={styles.valueCard}>
          <View style={styles.valueIconContainer}>
            <Ionicons name="sparkles" size={20} color={colors.gold} />
          </View>
          <Text style={styles.valueTitle}>{loc.v1Title}</Text>
          <Text style={styles.valueDesc}>{loc.v1Desc}</Text>
        </View>

        {/* Value 2 */}
        <View style={styles.valueCard}>
          <View style={styles.valueIconContainer}>
            <Ionicons name="ribbon" size={20} color={colors.gold} />
          </View>
          <Text style={styles.valueTitle}>{loc.v2Title}</Text>
          <Text style={styles.valueDesc}>{loc.v2Desc}</Text>
        </View>

        {/* Value 3 */}
        <View style={styles.valueCard}>
          <View style={styles.valueIconContainer}>
            <Ionicons name="people" size={20} color={colors.gold} />
          </View>
          <Text style={styles.valueTitle}>{loc.v3Title}</Text>
          <Text style={styles.valueDesc}>{loc.v3Desc}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  brandMotto: {
    fontSize: 11,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
    fontWeight: '700',
    textAlign: 'center',
  },
  royalBadge: {
    backgroundColor: colors.goldMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
  },
  royalBadgeTitle: {
    fontSize: 11,
    color: colors.gold,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  royalBadgeDesc: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 15,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 10,
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '31%',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.gold,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  timelineCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
  },
  timelineDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.cardBg,
    marginTop: 4,
    zIndex: 5,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: 2,
    marginBottom: -4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineYear: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.gold,
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
    textAlign: 'justify',
  },
  valuesContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  valueCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'column',
  },
  valueIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.goldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  valueTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  valueDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  socialsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 20,
    width: '100%',
  },
  socialCard: {
    width: '23.5%',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  socialLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'center',
  }
});
