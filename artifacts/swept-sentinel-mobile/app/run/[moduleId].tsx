import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Share, Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { fetch as expoFetch } from 'expo/fetch';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { saveRun } from '@/app/(tabs)/history';
import { InterstitialAdModal, useInterstitialManager } from '@/components/AdInterstitialManager';
import { RewardAdButton } from '@/components/RewardAdButton';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

type RunState = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

interface OutputLine {
  id: string;
  text: string;
  type: 'system' | 'data' | 'error';
}

export default function RunScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { moduleId, moduleName } = useLocalSearchParams<{ moduleId: string; moduleName: string }>();
  const { user, runCount, incrementRunCount } = useAuth();
  const { onRunComplete, showAd } = useInterstitialManager();

  const [target, setTarget] = useState('');
  const [runState, setRunState] = useState<RunState>('idle');
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [extraRuns, setExtraRuns] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isPro = !!user;
  const displayName = (moduleName || `Module #${moduleId}`).replace(/_/g, ' ');

  function addLine(text: string, type: OutputLine['type'] = 'data') {
    const line: OutputLine = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      text, type,
    };
    setLines(prev => [...prev, line]);
  }

  async function handleRun() {
    if (!target.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLines([]);
    setRunState('loading');

    try {
      // Execute module
      const execRes = await fetch(`${BASE}/api/sentinel/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ moduleId: parseInt(moduleId, 10), target: target.trim() }),
      });

      if (!execRes.ok) {
        const err = await execRes.json();
        if (err.error === 'guest_limit_reached') {
          addLine('GUEST LIMIT REACHED. Sign up for more runs.', 'error');
          setRunState('error');
          return;
        }
        throw new Error(err.error || 'Execution failed');
      }

      const { runId, streamUrl } = await execRes.json();
      setRunState('streaming');
      addLine(`[SYSTEM] Executing module ${moduleId} · target: ${target.trim()}`, 'system');
      addLine(`[SYSTEM] Stream ID: ${runId}`, 'system');

      // Stream output via SSE
      const streamRes = await expoFetch(`${BASE}${streamUrl}`, {
        headers: { Accept: 'text/event-stream' },
        credentials: 'include',
      });

      const reader = streamRes.body!.getReader();
      const decoder = new TextDecoder();
      const allLines: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const parts = chunk.split('\n');
        for (const part of parts) {
          if (part.startsWith('data: ')) {
            const text = part.slice(6).trim();
            if (text && text !== '[DONE]') {
              allLines.push(text);
              const type = text.toLowerCase().includes('error') || text.toLowerCase().includes('fail') ? 'error' : 'data';
              addLine(text, type);
            }
          }
        }
      }

      setRunState('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addLine(`[SYSTEM] Execution complete · ${allLines.length} lines`, 'system');

      // Save to history
      await incrementRunCount();
      const runRecord = {
        id: runId,
        moduleId: parseInt(moduleId, 10),
        moduleName: displayName,
        target: target.trim(),
        startedAt: new Date().toISOString(),
        lines: allLines,
        status: 'done' as const,
      };
      await saveRun(runRecord);

      // Show interstitial for free users
      if (!isPro) {
        onRunComplete();
        const totalRuns = runCount + 1 + extraRuns;
        if (totalRuns % 3 === 0) setShowInterstitial(true);
      }

    } catch (err: any) {
      addLine(`[ERROR] ${err.message || 'Stream failed'}`, 'error');
      setRunState('error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function handleShare() {
    const text = lines.map(l => l.text).join('\n');
    await Share.share({ message: `Swept Sentinel · ${displayName} · ${target}\n\n${text}` });
  }

  function handleClear() {
    setLines([]);
    setRunState('idle');
  }

  const isRunning = runState === 'loading' || runState === 'streaming';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: displayName.toUpperCase(),
          headerRight: () => (
            <View style={styles.headerBtns}>
              {lines.length > 0 && (
                <>
                  <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
                    <Ionicons name="share-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleClear} style={styles.headerBtn}>
                    <Ionicons name="refresh-outline" size={20} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          ),
        }}
      />

      {/* Target input row */}
      <View style={[styles.inputRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.prompt, { color: colors.primary }]}>&gt;</Text>
        <TextInput
          style={[styles.targetInput, { color: colors.foreground }]}
          placeholder="Enter target: IP, domain, email, username..."
          placeholderTextColor={colors.mutedForeground}
          value={target}
          onChangeText={setTarget}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleRun}
          editable={!isRunning}
          testID="target-input"
        />
        <TouchableOpacity
          style={[styles.runBtn, { backgroundColor: isRunning ? colors.muted : colors.primary }]}
          onPress={handleRun}
          disabled={isRunning || !target.trim()}
          testID="run-btn"
        >
          {isRunning
            ? <ActivityIndicator color={colors.primaryForeground} size="small" />
            : <Ionicons name="play" size={16} color={colors.primaryForeground} />
          }
        </TouchableOpacity>
      </View>

      {/* Output */}
      {lines.length === 0 && runState === 'idle' ? (
        <View style={styles.idleState}>
          <View style={[styles.moduleIdBox, { borderColor: colors.border }]}>
            <Text style={[styles.moduleIdLabel, { color: colors.mutedForeground }]}>MODULE</Text>
            <Text style={[styles.moduleIdNum, { color: colors.primary }]}>#{moduleId.padStart(3, '0')}</Text>
          </View>
          <Text style={[styles.idleName, { color: colors.foreground }]}>{displayName}</Text>
          <Text style={[styles.idleHint, { color: colors.mutedForeground }]}>
            Enter a target above and press{' '}
            <Ionicons name="play" size={12} color={colors.mutedForeground} /> to run
          </Text>
          {!isPro && (
            <RewardAdButton
              onRewardEarned={(n) => setExtraRuns(prev => prev + n)}
            />
          )}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={lines}
          keyExtractor={l => l.id}
          renderItem={({ item }) => (
            <Text
              style={[
                styles.line,
                {
                  color: item.type === 'error' ? colors.destructive
                    : item.type === 'system' ? colors.primary
                    : colors.foreground,
                  opacity: item.type === 'system' ? 0.6 : 1,
                },
              ]}
              selectable
            >
              {item.text}
            </Text>
          )}
          contentContainerStyle={[
            styles.outputList,
            { paddingBottom: insets.bottom + 16 },
          ]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Status bar */}
      {runState !== 'idle' && (
        <View style={[styles.statusBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={[
            styles.statusDot,
            { backgroundColor: runState === 'streaming' ? colors.success : runState === 'done' ? colors.primary : runState === 'error' ? colors.destructive : colors.warning }
          ]} />
          <Text style={[styles.statusTxt, { color: colors.mutedForeground }]}>
            {runState === 'loading' ? 'INITIALIZING...'
              : runState === 'streaming' ? `STREAMING · ${lines.length} LINES`
              : runState === 'done' ? `COMPLETE · ${lines.length} LINES`
              : 'ERROR'}
          </Text>
        </View>
      )}

      <InterstitialAdModal
        visible={showInterstitial}
        onDismiss={() => setShowInterstitial(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBtns: { flexDirection: 'row', gap: 4 },
  headerBtn: { padding: 4 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1,
  },
  prompt: { fontSize: 18, fontWeight: '700' as const },
  targetInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  runBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  idleState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  moduleIdBox: { borderWidth: 1, paddingHorizontal: 20, paddingVertical: 8, alignItems: 'center' },
  moduleIdLabel: { fontSize: 9, letterSpacing: 3 },
  moduleIdNum: { fontSize: 36, fontWeight: '700' as const, letterSpacing: 4 },
  idleName: { fontSize: 18, fontWeight: '600' as const, textAlign: 'center', letterSpacing: 1 },
  idleHint: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  outputList: { padding: 12, gap: 2 },
  line: { fontSize: 11, lineHeight: 18, letterSpacing: 0.3 },
  statusBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: 10, letterSpacing: 2 },
});
