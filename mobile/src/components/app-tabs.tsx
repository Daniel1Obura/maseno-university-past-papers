import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTheme } from '@/context/theme-context';

export default function AppTabs() {
  const { colors } = useTheme();

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      indicatorColor={colors.surfaceAlt}
      rippleColor={colors.surfaceAlt}
      shadowColor={colors.border}
      badgeBackgroundColor={colors.danger}
      badgeTextColor="#FFFFFF"
      iconColor={{
        default: colors.textMuted,
        selected: colors.primary,
      }}
      labelVisibilityMode="labeled"
      labelStyle={{
        default: {
          color: colors.textMuted,
          fontSize: 10,
          fontWeight: '600',
        },
        selected: {
          color: colors.primary,
          fontSize: 10,
          fontWeight: '800',
        },
      }}
    >
      {/* HOME */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'house',
            selected: 'house.fill',
          }}
          md={{
            default: 'home',
            selected: 'home',
          }}
        />

        <NativeTabs.Trigger.Label>
          Home
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* SEARCH */}
      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'magnifyingglass',
            selected: 'magnifyingglass',
          }}
          md={{
            default: 'search',
            selected: 'search',
          }}
        />

        <NativeTabs.Trigger.Label>
          Search
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* UPLOAD */}
      <NativeTabs.Trigger name="upload">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'plus.circle',
            selected: 'plus.circle.fill',
          }}
          md={{
            default: 'add_circle',
            selected: 'add_circle',
          }}
          selectedColor={colors.primary}
        />

        <NativeTabs.Trigger.Label>
          Upload
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* DOWNLOADS */}
      <NativeTabs.Trigger name="downloads">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'arrow.down.circle',
            selected: 'arrow.down.circle.fill',
          }}
          md={{
            default: 'download',
            selected: 'download',
          }}
        />

        <NativeTabs.Trigger.Label>
          Downloads
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* MORE */}
      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'ellipsis.circle',
            selected: 'ellipsis.circle.fill',
          }}
          md={{
            default: 'more_horiz',
            selected: 'more_horiz',
          }}
        />

        <NativeTabs.Trigger.Label>
        More 
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}