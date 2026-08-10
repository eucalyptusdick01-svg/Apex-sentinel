import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { AdBanner } from '@/components/AdBanner';
import { useAuth } from '@/contexts/AuthContext';

export interface RunRecord {
  id: string;
  moduleId: number;
  moduleName: string;
  target: string;
  startedAt: string;
  lines: string[];
  status: 'done' | 'error';
}

const STORAGE_KEY = 'runHistory';

export async function saveRun(run: RunRecord) {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const history: RunRecord[] = raw ? JSON.parse(raw) : [];
  history.unshift(run);
  const trimmed = history.slice(0, 50); // keep last 50
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export async function loadHistory(): Promise<RunRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function TimeAgo({ date }: { date: string }) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  let label = 'just now';
  if (days > 0) label = `${days}d ago`;
  else if (hours > 0) label = `${hours}h ago`;
  else if (mins > 0) label = `${mins}m ago`;
  const colors = useColors();
  return <Text style={{ color: colors.mutedForeground, fontSize: 10, letterSpacing: 1 }}>{label.toUpperCase()}</Text>;
}

export default function HistoryScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadHistory();
      setRuns(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function clearHistory() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.removeItem(STORAGE_KEY);
    setRuns([]);
  }

  function toggleExpand(id: string) {
    Haptics.selectionAsync();
    setExpanded(prev => prev === id ? null : id);
  }

  const isPro = !!user;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header,
        { borderBottomColor: colors.border, paddingTop: Platform.OS === 'web' ? 67 + 8 : 8 }
      ]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>RUN HISTORY</Text>
        {runs.length > 0 && (
          <TouchableOpacity onPress={clearHistory}>
            <Ionicons name="trash-outline" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : runs.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="time-outline" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No runs yet</Text>
          <Text style={[styles.emptyTxt, { color: colors.mutedForeground }]}>
            Run a module from the Modules tab
          </Text>
        </View>
      ) : (
        <FlatList
          data={runs}
          keyExtractor={r => r.id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 80 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => toggleExpand(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.cardTop, { borderLeftColor: item.status === 'error' ? colors.destructive : colors.primary }]}>
                <View style={styles.cardMeta}>
                  <Text style={[styles.modName, { color: colors.foreground }]} numberOfLines={1}>
                    {item.moduleName.replace(/_/g, ' ')}
                  </Text>
                  <Text style={[styles.target, { color: colors.primary }]} numberOfLines={1}>
                    {item.target}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <TimeAgo date={item.startedAt} />
                  <Ionicons
                    name={expanded === item.id ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={colors.mutedForeground}
                  />
                </View>
              </View>

              {expanded === item.id && (
                <View style={[styles.output, { borderTopColor: colors.border }]}>
                  {item.lines.slice(0, 20).map((line, i) => (
                    <Text key={i} style={[styles.outputLine, { color: line.includes('ERROR') || line.includes('error') ? colors.destructive : colors.mutedForeground }]} numberOfLines={2}>
                      {line}
                    </Text>
                  ))}
                  {item.lines.length > 20 && (
                    <Text style={[styles.outputLine, { color: colors.mutedForeground }]}>
                      ... +{item.lines.length - 20} more lines
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      <AdBanner visible={!isPro} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 3 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600' as const },
  emptyTxt: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  card: { marginHorizontal: 16, marginVertical: 4, borderWidth: 1, overflow: 'hidden' },
  cardTop: {
    flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8,
    borderLeftWidth: 3,
  },
  cardMeta: { flex: 1, gap: 2 },
  modName: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.5 },
  target: { fontSize: 12, letterSpacing: 0.5 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  output: { borderTopWidth: 1, padding: 10, gap: 2 },
  outputLine: { fontSize: 11, letterSpacing: 0.3, lineHeight: 16 },
});
