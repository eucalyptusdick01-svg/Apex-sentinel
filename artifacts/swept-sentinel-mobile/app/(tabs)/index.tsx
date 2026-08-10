import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { ModuleCard, Module } from '@/components/ModuleCard';
import { AdBanner } from '@/components/AdBanner';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
const GUEST_RUN_LIMIT = 4;

const CATEGORIES = ['ALL', 'NETWORK', 'DNS', 'WEB', 'SOCIAL', 'RECON', 'INTEL', 'CRYPTO', 'EXPLOIT', 'ADVANCED'];

export default function ModulesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, runCount } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  const { data: modules = [], isLoading, isError, refetch } = useQuery<Module[]>({
    queryKey: ['modules'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/sentinel/modules`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load modules');
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  const filtered = useMemo(() => {
    return modules.filter(m => {
      const matchSearch = search === '' || m.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'ALL' || m.category.toUpperCase().includes(category);
      return matchSearch && matchCat;
    });
  }, [modules, search, category]);

  const isGuest = !user;
  const runsLeft = isGuest ? Math.max(0, GUEST_RUN_LIMIT - runCount) : null;
  const guestLimitReached = isGuest && runCount >= GUEST_RUN_LIMIT;

  const handleModulePress = useCallback((module: Module) => {
    if (guestLimitReached) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push('/account' as any);
      return;
    }
    router.push({ pathname: '/run/[moduleId]', params: { moduleId: String(module.id), moduleName: module.name } } as any);
  }, [guestLimitReached]);

  const isPro = !isGuest;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[
        styles.searchRow,
        { backgroundColor: colors.card, borderBottomColor: colors.border,
          paddingTop: Platform.OS === 'web' ? 67 + 8 : 8 }
      ]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search modules..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            testID="module-search"
          />
          {search !== '' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        {isGuest && (
          <View style={[styles.runBadge, { backgroundColor: runsLeft === 0 ? colors.destructive : colors.primary }]}>
            <Text style={[styles.runBadgeTxt, { color: runsLeft === 0 ? colors.destructiveForeground : colors.primaryForeground }]}>
              {runsLeft === 0 ? 'LIMIT' : `${runsLeft} LEFT`}
            </Text>
          </View>
        )}
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={c => c}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.catList, { borderBottomColor: colors.border }]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.catChip,
              { borderColor: item === category ? colors.primary : colors.border,
                backgroundColor: item === category ? colors.primary + '22' : 'transparent' }
            ]}
            onPress={() => { Haptics.selectionAsync(); setCategory(item); }}
          >
            <Text style={[styles.catTxt, { color: item === category ? colors.primary : colors.mutedForeground }]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Guest limit banner */}
      {guestLimitReached && (
        <TouchableOpacity
          style={[styles.limitBanner, { backgroundColor: colors.destructive + '22', borderColor: colors.destructive }]}
          onPress={() => router.push('/account' as any)}
        >
          <Ionicons name="lock-closed" size={14} color={colors.destructive} />
          <Text style={[styles.limitTxt, { color: colors.destructive }]}>
            Guest limit reached · Sign up free to continue
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.destructive} />
        </TouchableOpacity>
      )}

      {/* Module list */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.loadTxt, { color: colors.mutedForeground }]}>LOADING MODULES...</Text>
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={32} color={colors.destructive} />
          <Text style={[styles.loadTxt, { color: colors.mutedForeground }]}>Failed to load modules</Text>
          <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { borderColor: colors.primary }]}>
            <Text style={[styles.retryTxt, { color: colors.primary }]}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={m => String(m.id)}
          renderItem={({ item }) => (
            <ModuleCard
              module={item}
              onPress={handleModulePress}
            />
          )}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search" size={32} color={colors.mutedForeground} />
              <Text style={[styles.loadTxt, { color: colors.mutedForeground }]}>No modules found</Text>
            </View>
          }
          scrollEnabled={filtered.length > 0}
        />
      )}

      {/* Banner ad for free users */}
      <AdBanner visible={!isPro} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 1,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  runBadge: { paddingHorizontal: 8, paddingVertical: 4 },
  runBadgeTxt: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1 },
  catList: { paddingHorizontal: 12, paddingVertical: 8, gap: 6, borderBottomWidth: 1 },
  catChip: { paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  catTxt: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1.5 },
  limitBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 8, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1,
  },
  limitTxt: { flex: 1, fontSize: 12, letterSpacing: 0.5 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  loadTxt: { fontSize: 12, letterSpacing: 2, textAlign: 'center' },
  retryBtn: { borderWidth: 1, paddingHorizontal: 20, paddingVertical: 8 },
  retryTxt: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 2 },
});
