/**
 * RewardAdButton — lets free users watch an ad to earn extra module runs.
 *
 * To activate real AdMob rewarded ads:
 * 1. Install react-native-google-mobile-ads + configure (see constants/admob.ts)
 * 2. Replace the stub below with:
 *    import { useRewardedAd } from 'react-native-google-mobile-ads';
 *    import { AD_UNIT_IDS } from '@/constants/admob';
 *    const { isLoaded, load, show, reward } = useRewardedAd(AD_UNIT_IDS.rewarded);
 */

import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Modal, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

interface Props {
  onRewardEarned: (runsEarned: number) => void;
  runsEarned?: number;
}

export function RewardAdButton({ onRewardEarned, runsEarned = 3 }: Props) {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  async function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowModal(true);
    setAdProgress(0);
    setLoading(true);

    // Simulate a rewarded ad (5s countdown)
    for (let i = 1; i <= 5; i++) {
      await new Promise(r => setTimeout(r, 1000));
      setAdProgress(i);
    }
    setLoading(false);
  }

  function handleClaim() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowModal(false);
    onRewardEarned(runsEarned);
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.btn, { borderColor: colors.primary, backgroundColor: colors.card }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Ionicons name="play-circle" size={18} color={colors.primary} />
        <Text style={[styles.txt, { color: colors.primary }]}>
          WATCH AD · GET {runsEarned} RUNS
        </Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modal, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.primary }]}>REWARDED AD</Text>
            
            {loading ? (
              <>
                <ActivityIndicator color={colors.primary} size="large" style={{ marginVertical: 24 }} />
                <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                  <View style={[styles.progressFill, { width: `${(adProgress / 5) * 100}%`, backgroundColor: colors.primary }]} />
                </View>
                <Text style={[styles.countdown, { color: colors.mutedForeground }]}>
                  {5 - adProgress}s remaining
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={48} color={colors.success} style={{ marginVertical: 16 }} />
                <Text style={[styles.reward, { color: colors.foreground }]}>
                  +{runsEarned} MODULE RUNS EARNED
                </Text>
                <TouchableOpacity
                  style={[styles.claimBtn, { backgroundColor: colors.primary }]}
                  onPress={handleClaim}
                >
                  <Text style={[styles.claimTxt, { color: colors.primaryForeground }]}>CLAIM REWARD</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, marginHorizontal: 16, marginVertical: 8,
    justifyContent: 'center',
  },
  txt: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 2 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  modal: { width: '100%', padding: 24, borderWidth: 1, alignItems: 'center', gap: 8 },
  title: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 3 },
  progressBar: { width: '100%', height: 4, marginTop: 8 },
  progressFill: { height: '100%' },
  countdown: { fontSize: 12, letterSpacing: 1, marginTop: 8 },
  reward: { fontSize: 16, fontWeight: '700' as const, letterSpacing: 1, textAlign: 'center' },
  claimBtn: { marginTop: 16, paddingHorizontal: 32, paddingVertical: 12, width: '100%', alignItems: 'center' },
  claimTxt: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 2 },
});
