import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

// How long the splash stays fully visible (milliseconds).
const SHOW_DURATION_MS = 3500;
const FADE_DURATION_MS = 500;
const DOT = '\u2022';

export default function BrandedSplash() {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }, SHOW_DURATION_MS);

    return () => clearTimeout(timer);
  }, [opacity]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.overlay, { opacity }]}
      // Fade the whole splash (background, text and logo) as ONE layer,
      // so nothing lingers after the rest has faded.
      needsOffscreenAlphaCompositing
      renderToHardwareTextureAndroid
      // Hide the native splash as soon as this screen is drawn,
      // so there is no flash between the two.
      onLayout={() => {
        SplashScreen.hideAsync().catch(() => {});
      }}
    >
      <LinearGradient
        colors={['#0B63F0', '#053A99']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative waves */}
      <View style={[styles.wave, styles.waveBack]} />
      <View style={[styles.wave, styles.waveFront]} />

      <View style={styles.content}>
        {/* App icon */}
        <View style={styles.appIcon}>
          <Ionicons name="document-text-outline" size={46} color="#0756D9" />
          <View style={styles.capBadge}>
            <Ionicons name="school" size={30} color="#0B3F9E" />
          </View>
        </View>

        <Text style={styles.title}>Maseno University</Text>
        <Text style={styles.titleSecondary}>Past Papers</Text>

        <Text style={styles.tagline}>
          {`Access ${DOT} Download ${DOT} Share ${DOT} Learn`}
        </Text>

        {/* University seal: round white disc, image sized so its
            square corners stay hidden inside the circle */}
        <View style={styles.logoCircle}>
          <Image
            source={require('../../assets/images/maseno-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.motto}>
          {`Knowledge ${DOT} Excellence ${DOT} Service`}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 999,
    backgroundColor: '#0756D9',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },

  appIcon: {
    width: 92,
    height: 92,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
  },

  capBadge: {
    position: 'absolute',
    right: 14,
    bottom: 12,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },

  titleSecondary: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },

  tagline: {
    color: '#DCE9FF',
    fontSize: 14,
    marginTop: 14,
    textAlign: 'center',
  },

  // Disc is 140px; the 96px square image has a diagonal of ~136px,
  // so its corners fit inside the circle.
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    overflow: 'hidden',
  },

  logo: {
    width: 96,
    height: 96,
  },

  motto: {
    color: '#DCE9FF',
    fontSize: 13,
    marginTop: 22,
    textAlign: 'center',
  },

  wave: {
    position: 'absolute',
    left: -160,
    right: -160,
    height: 260,
    borderRadius: '50%',
  },

  waveBack: {
    bottom: -170,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  waveFront: {
    bottom: -200,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});