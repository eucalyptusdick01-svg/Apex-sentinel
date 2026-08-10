/**
 * AdInterstitialManager — manages interstitial ad lifecycle.
 *
 * Shows after every N module completions for free users.
 * In Expo Go: shows a full-screen placeholder modal.
 *
 * To activate real AdMob interstitials:
 * 1. Install react-native-google-mobile-ads + configure (see constants/admob.ts)
 * 2. Replace the useInterstitialAd hook below with the real one:
 *    import { useInterstitialAd, TestIds } from 'react-native-google-mobile-ads';
 *    const { isLoaded, isClosed, load, show } = useInterstitialAd(AD_UNIT_IDS.interstitial);
 */

import React, { useState, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { FREE_RUNS_BEFORE_INTERSTITIAL } from '@/constants/admob';

interface InterstitialState {
  runsSinceAd: number;
  showAd: () => void;
  onRunComplete: () => void;
}

export function useInterstitialManager(): InterstitialState {
  const [runsSinceAd, setRunsSinceAd] = useState(0);
  const [showingAd, setShowingAd] = useState(false);

  const showAd = useCallback(() => {
    setShowingAd(true);
  }, []);

  const onRunComplete = useCallback(() => {
    setRunsSinceAd(prev => {
      const next = prev + 1;
      if (next >= FREE_RUNS_BEFORE_INTERSTITIAL) {
        setShowingAd(true);
        return 0;
      }
      return next;
    });
  }, []);

  return { runsSinceAd, showAd, onRunComplete };
}

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export function InterstitialAdModal({ visible, onDismiss }: Props) {
  const colors = useColors();
  const [countdown, setCountdown] = useState(5);

  React.useEffect(() => {
    if (!visible) { setCountdown(5); return; }
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [visible, countdown]);

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.adBox, { borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>ADVERTISEMENT</Text>
          <View style={[styles.placeholder, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
            <Text style={[styles.title, { color: colors.foreground }]}>Go Pro · No Ads</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Unlock all 230 modules{'\n'}unlimited runs · $5.99/week
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.closeBtn,
            {
              backgroundColor: countdown <= 0 ? colors.primary : colors.muted,
              opacity: countdown <= 0 ? 1 : 0.6,
            },
          ]}
          onPress={countdown <= 0 ? onDismiss : undefined}
          disabled={countdown > 0}
        >
          <Text style={[styles.closeTxt, { color: countdown <= 0 ? colors.primaryForeground : colors.mutedForeground }]}>
            {countdown > 0 ? `CLOSE IN ${countdown}s` : 'CLOSE ×'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  adBox: { width: '100%', borderWidth: 1, padding: 2, marginBottom: 24 },
  label: { fontSize: 9, letterSpacing: 2, textAlign: 'center', paddingVertical: 4 },
  placeholder: {
    height: 320, width: '100%', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: 1 },
  sub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  closeBtn: {
    paddingHorizontal: 32, paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 2 },
});
