/**
 * AdBanner — stub component that shows a placeholder in Expo Go.
 *
 * To activate real AdMob banner ads:
 * 1. Install: pnpm add react-native-google-mobile-ads
 * 2. Configure AdMob in app.json (see constants/admob.ts)
 * 3. Replace this component with the real BannerAd import below
 *
 * Real implementation (uncomment after native build setup):
 * ---------------------------------------------------------
 * import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
 * import { AD_UNIT_IDS } from '@/constants/admob';
 *
 * export function AdBanner() {
 *   return (
 *     <BannerAd
 *       unitId={AD_UNIT_IDS.banner}
 *       size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
 *       requestOptions={{ requestNonPersonalizedAdsOnly: true }}
 *     />
 *   );
 * }
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  visible?: boolean;
}

export function AdBanner({ visible = true }: Props) {
  const colors = useColors();
  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>ADVERTISEMENT</Text>
      <View style={[styles.placeholder, { borderColor: colors.border }]}>
        <Text style={[styles.adText, { color: colors.mutedForeground }]}>
          AD · Swept Sentinel Pro — Unlock all 230 modules
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { paddingBottom: 34 } : {}),
  },
  label: {
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 4,
  },
  placeholder: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
