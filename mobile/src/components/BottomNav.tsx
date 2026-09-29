import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tabs = [
  {
    name: 'index',
    label: 'Home',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    name: 'search',
    label: 'Search',
    icon: 'search-outline',
    activeIcon: 'search',
  },
  {
    name: 'upload',
    label: 'Upload',
    icon: 'cloud-upload-outline',
    activeIcon: 'cloud-upload',
  },
  {
    name: 'downloads',
    label: 'Downloads',
    icon: 'download-outline',
    activeIcon: 'download',
  },
  {
    name: 'more',
    label: 'More',
    icon: 'menu-outline',
    activeIcon: 'menu',
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  const currentRoute =
    pathname === '/' ? 'index' : pathname.replace('/', '');

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = currentRoute === tab.name;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => router.push(tab.name === 'index' ? '/' : `/${tab.name}`)}
          >
            <View style={[styles.iconWrapper, active && styles.activeIconWrapper]}>
              <Ionicons
                name={active ? tab.activeIcon : tab.icon}
                size={22}
                color={active ? '#0756D9' : '#7A8699'}
              />
            </View>

            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
container: {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: 78,
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E8EDF5',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
  paddingHorizontal: 8,
  paddingBottom: 6,
  elevation: 10,
},

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrapper: {
    width: 42,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },

  activeIconWrapper: {
    backgroundColor: '#E8F0FF',
  },

  label: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '500',
    color: '#7A8699',
  },

  activeLabel: {
    color: '#0756D9',
    fontWeight: '700',
  },
});