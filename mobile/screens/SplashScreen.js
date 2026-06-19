import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text, ActivityIndicator, StatusBar } from 'react-native';
import { useApp } from '../context/AppContext';

export default function SplashScreen() {
  const { setSplashDone, t } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashDone(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F2" />
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://laboratoremanuela.ro/wp-content/uploads/2022/05/logo-web.webp' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Laborator Emanuela</Text>
        <Text style={styles.subtitle}>Lingurițe de bunătate</Text>
      </View>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#E92D79" />
        <Text style={styles.loadingText}>{t('loadingCakes')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F2',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#241A1C',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#E92D79',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 6,
    fontWeight: '600',
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#7c6060',
    fontSize: 12,
    marginTop: 14,
  },
});
