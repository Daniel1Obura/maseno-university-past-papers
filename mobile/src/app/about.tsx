import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../components/screen-header';
import { useTheme } from '../context/theme-context';

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScreenHeader title="About App" />

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[styles.logoCircle, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons name="school-outline" size={36} color={colors.primary} />
        </View>

        <Text style={[styles.appName, { color: colors.text }]}>
          Past Papers
        </Text>
        <Text style={[styles.university, { color: colors.primary }]}>
          Maseno University
        </Text>
        <Text style={[styles.version, { color: colors.textMuted }]}>
          Version 1.0.0
        </Text>

        <Text style={[styles.description, { color: colors.textMuted }]}>
          Maseno University Past Papers application helps students at the University find, download, and share past
          examination papers for revision and further study. Papers are community-submitted and reviewed
          by an administrator before appearing in the app.
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.footerTitle, { color: colors.textSecondary }]}>
          Maseno University Past Papers
        </Text>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Knowledge - Excellence - Service
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, alignItems: 'center' },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
  },
  university: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  version: {
    fontSize: 11,
    marginTop: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 24,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 11,
    marginTop: 4,
  },
});