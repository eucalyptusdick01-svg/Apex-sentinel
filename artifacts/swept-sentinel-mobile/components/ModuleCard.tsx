import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

export interface Module {
  id: number;
  name: string;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  NETWORK:    '#00ccff',
  SOCIAL:     '#00ffcc',
  RECON:      '#ff00cc',
  EXPLOIT:    '#ffcc00',
  INTEL:      '#cc00ff',
  ADVANCED:   '#ffffff',
  CRYPTO:     '#00ff88',
  WEB:        '#ff8800',
  DNS:        '#00ccff',
  DEFAULT:    '#8b9bb4',
};

function getCategoryColor(category: string): string {
  const key = Object.keys(CATEGORY_COLORS).find(k => category.toUpperCase().includes(k));
  return key ? CATEGORY_COLORS[key] : CATEGORY_COLORS.DEFAULT;
}

interface Props {
  module: Module;
  onPress: (module: Module) => void;
}

export function ModuleCard({ module, onPress }: Props) {
  const colors = useColors();
  const accentColor = getCategoryColor(module.category);

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(module);
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.7}
      testID={`module-${module.id}`}
    >
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {module.name.replace(/_/g, ' ')}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
        </View>
        <View style={styles.meta}>
          <Text style={[styles.category, { color: accentColor }]}>
            {module.category.toUpperCase()}
          </Text>
          <Text style={[styles.id, { color: colors.mutedForeground }]}>
            #{String(module.id).padStart(3, '0')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accent: {
    width: 3,
  },
  body: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600' as const,
    flex: 1,
    letterSpacing: 0.5,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
  },
  id: {
    fontSize: 10,
    letterSpacing: 1,
  },
});
