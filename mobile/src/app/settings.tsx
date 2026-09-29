import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../components/screen-header';
import { useTheme } from '../context/theme-context';

export default function SettingsScreen() {
  const { mode, toggleMode, colors } = useTheme();

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScreenHeader title="Settings" />

      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Dark Mode
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                {mode === 'dark' ? 'Currently on' : 'Currently off'}
              </Text>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleMode}
              trackColor={{ true: colors.primary }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Downloads continue in background
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                Already on - a download keeps running even if you
                leave this screen
              </Text>
            </View>
            <Switch value disabled />
          </View>
        </View>

        <View
          style={[styles.noticeCard, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            Dark mode applies across the whole app and is remembered
            the next time you open it.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  rowText: { flex: 1, marginRight: 10 },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});