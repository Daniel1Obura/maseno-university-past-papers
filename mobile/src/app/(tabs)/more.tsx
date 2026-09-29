import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../context/theme-context';

const mainItems = [
  {
    title: 'Browse & Search',
    subtitle: 'Find past examination papers',
    icon: 'search-outline' as const,
  },
  {
    title: 'Submit Papers',
    subtitle: 'Submit a past examination paper',
    icon: 'cloud-upload-outline' as const,
  },
  {
    title: 'Report Issues',
    subtitle: 'Report a problem with a paper or this app',
    icon: 'flag-outline' as const,
  },
];

const otherItems = [
  {
    title: 'My Downloads',
    subtitle: 'View papers downloaded on this device',
    icon: 'download-outline' as const,
  },
  {
    title: 'Settings',
    subtitle: 'Manage app preferences',
    icon: 'settings-outline' as const,
  },
  {
    title: 'Help & Support',
    subtitle: 'Get help using the application',
    icon: 'help-circle-outline' as const,
  },
  {
    title: 'About App',
    subtitle: 'Learn more about this application and its developers',
    icon: 'information-circle-outline' as const,
  },
];

function MenuItem({
  title,
  subtitle,
  icon,
  onPress,
  colors,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>

      <View style={styles.menuText}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.menuSubtitle, { color: colors.textMuted }]}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color={colors.textMuted}
      />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.headerTitle}>More</Text>
            <Text style={styles.headerSubtitle}>
              More options and information
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="ellipsis-horizontal"
              size={25}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* App Information Card */}
        <View
          style={[
            styles.appCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.appLogo, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons
              name="school-outline"
              size={30}
              color={colors.primary}
            />
          </View>

          <View style={styles.appInfo}>
            <Text style={[styles.appTitle, { color: colors.text }]}>
              Maseno University
            </Text>
            <Text style={[styles.appUniversity, { color: colors.primary }]}>
              Past Papers
            </Text>
            <Text style={[styles.appDescription, { color: colors.textMuted }]}>
              Access past examination papers quickly and easily.
            </Text>
          </View>
        </View>

        {/* Main Features */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Quick Actions
        </Text>

        <View
          style={[
            styles.menuCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {mainItems.map((item, index) => (
            <View
              key={item.title}
              style={[
                { backgroundColor: colors.surface },
                index !== mainItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <MenuItem
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                colors={colors}
                onPress={() => {
                  if (item.title === 'Report Issues') {
                    router.push('/report');
                  } else if (item.title === 'Submit Papers') {
                    router.push('/upload');
                  } else if (item.title === 'Browse & Search') {
                    router.push('/search');
                  }
                }}
              />
            </View>
          ))}
        </View>

        {/* Other Options */}
        <Text
          style={[
            styles.sectionTitleSpaced,
            { color: colors.textSecondary },
          ]}
        >
          More Options
        </Text>

        <View
          style={[
            styles.menuCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {otherItems.map((item, index) => (
            <View
              key={item.title}
              style={[
                { backgroundColor: colors.surface },
                index !== otherItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <MenuItem
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                colors={colors}
                onPress={() => {
                  if (item.title === 'My Downloads') {
                    router.push('/downloads');
                  } else if (item.title === 'Settings') {
                    router.push('/settings');
                  } else if (item.title === 'Help & Support') {
                    router.push('/help');
                  } else if (item.title === 'About App') {
                    router.push('/about');
                  }
                }}
              />
            </View>
          ))}
        </View>

        {/* Admin Notice */}
        <View
          style={[
            styles.adminCard,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <View style={[styles.adminIcon, { backgroundColor: colors.surface }]}>
            <Ionicons
              name="shield-checkmark-outline"
              size={23}
              color={colors.primary}
            />
          </View>

          <View style={styles.adminText}>
            <Text style={[styles.adminTitle, { color: colors.text }]}>
              Admin Access
            </Text>
            <Text style={[styles.adminSubtitle, { color: colors.textMuted }]}>
              Administration features are available through the
              separate admin dashboard.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={[styles.footerTitle, { color: colors.textSecondary }]}>
          Maseno University 
        </Text>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Knowledge - Excellence - Service
        </Text>
        <Text style={[styles.version, { color: colors.textMuted }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 110 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  headerSubtitle: { color: '#DCE9FF', fontSize: 13, marginTop: 4 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  appLogo: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: { flex: 1, marginLeft: 14 },
  appTitle: { fontSize: 17, fontWeight: '800' },
  appUniversity: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  appDescription: { fontSize: 11, marginTop: 5, lineHeight: 16 },
  sectionTitle: {
    marginHorizontal: 18,
    marginTop: 24,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitleSpaced: {
    marginHorizontal: 18,
    marginTop: 44,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '800',
  },
  menuCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1, marginLeft: 13, marginRight: 8 },
  menuTitle: { fontSize: 14, fontWeight: '700' },
  menuSubtitle: { fontSize: 11, marginTop: 3 },
  adminCard: {
    marginHorizontal: 16,
    marginTop: 22,
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminText: { flex: 1, marginLeft: 12 },
  adminTitle: { fontSize: 14, fontWeight: '800' },
  adminSubtitle: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  footerTitle: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 24,
  },
  footerText: { textAlign: 'center', fontSize: 10, marginTop: 4 },
  version: { textAlign: 'center', fontSize: 10, marginTop: 5 },
});