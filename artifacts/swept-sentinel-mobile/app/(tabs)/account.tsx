import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

type Tab = 'login' | 'register';

function AuthForm() {
  const colors = useColors();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!email || !password) { setError('Email and password required'); return; }
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') await login(email, password);
      else await register(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAwareScrollViewCompat bottomOffset={16} keyboardShouldPersistTaps="handled">
      <View style={[styles.authContainer, { paddingTop: Platform.OS === 'web' ? 67 + 16 : 16 }]}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={[styles.logoBox, { borderColor: colors.primary }]}>
            <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.logoTitle, { color: colors.primary }]}>SWEPT SENTINEL</Text>
            <Text style={[styles.logoSub, { color: colors.mutedForeground }]}>OSINT INTELLIGENCE PLATFORM</Text>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={[styles.tabRow, { borderColor: colors.border }]}>
          {(['login', 'register'] as Tab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, { backgroundColor: tab === t ? colors.primary : 'transparent' }]}
              onPress={() => { setTab(t); setError(''); Haptics.selectionAsync(); }}
            >
              <Text style={[styles.tabTxt, { color: tab === t ? colors.primaryForeground : colors.mutedForeground }]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={[styles.inputWrap, { borderColor: error ? colors.destructive : colors.border, backgroundColor: colors.card }]}>
            <Ionicons name="mail-outline" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="operator@domain.com"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              testID="email-input"
            />
          </View>

          <View style={[styles.inputWrap, { borderColor: error ? colors.destructive : colors.border, backgroundColor: colors.card }]}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              testID="password-input"
            />
          </View>

          {error !== '' && (
            <View style={[styles.errorRow, { backgroundColor: colors.destructive + '22' }]}>
              <Ionicons name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorTxt, { color: colors.destructive }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
            onPress={handleSubmit}
            disabled={loading}
            testID="submit-btn"
          >
            {loading
              ? <ActivityIndicator color={colors.primaryForeground} size="small" />
              : <Text style={[styles.submitTxt, { color: colors.primaryForeground }]}>
                  {tab === 'login' ? 'ACCESS TERMINAL' : 'CREATE ACCOUNT'}
                </Text>
            }
          </TouchableOpacity>
        </View>

        {/* Pricing note */}
        <View style={[styles.pricing, { borderColor: colors.border }]}>
          <Text style={[styles.pricingTitle, { color: colors.foreground }]}>PRO ACCESS</Text>
          <Text style={[styles.pricingItem, { color: colors.mutedForeground }]}>▸ All 230 OSINT modules</Text>
          <Text style={[styles.pricingItem, { color: colors.mutedForeground }]}>▸ Unlimited runs · No ads</Text>
          <Text style={[styles.pricingItem, { color: colors.mutedForeground }]}>▸ Breach intel · Threat feeds</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary }]}>$5.99<Text style={[styles.pricePer, { color: colors.mutedForeground }]}>/week</Text></Text>
            <Text style={[styles.priceDivider, { color: colors.border }]}>·</Text>
            <Text style={[styles.price, { color: colors.primary }]}>$19.99<Text style={[styles.pricePer, { color: colors.mutedForeground }]}>/month</Text></Text>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

function ProfileView() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const [subLoading, setSubLoading] = useState(false);
  const [subStatus, setSubStatus] = useState<string | null>(null);

  React.useEffect(() => {
    fetch(`${BASE}/api/stripe/subscription`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setSubStatus(d.plan === 'pro' ? 'PRO' : 'FREE'))
      .catch(() => setSubStatus('FREE'));
  }, []);

  async function openBillingPortal() {
    setSubLoading(true);
    try {
      const res = await fetch(`${BASE}/api/stripe/portal`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.url) {
        const { Linking } = require('react-native');
        Linking.openURL(data.url);
      }
    } catch {
      Alert.alert('Error', 'Could not open billing portal');
    } finally {
      setSubLoading(false);
    }
  }

  async function handleLogout() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.profile, { paddingTop: Platform.OS === 'web' ? 67 + 16 : 16 }]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: colors.card, borderColor: colors.primary }]}>
        <Ionicons name="person" size={40} color={colors.primary} />
      </View>

      <Text style={[styles.email, { color: colors.foreground }]}>{user?.email}</Text>
      <View style={[styles.planBadge, { backgroundColor: subStatus === 'PRO' ? colors.primary + '22' : colors.muted, borderColor: subStatus === 'PRO' ? colors.primary : colors.border }]}>
        <Text style={[styles.planTxt, { color: subStatus === 'PRO' ? colors.primary : colors.mutedForeground }]}>
          {subStatus ?? '...'} {subStatus === 'PRO' ? '✓' : ''}
        </Text>
      </View>

      <View style={[styles.section, { borderColor: colors.border }]}>
        {subStatus === 'PRO' ? (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.border }]}
            onPress={openBillingPortal}
            disabled={subLoading}
          >
            {subLoading
              ? <ActivityIndicator color={colors.primary} size="small" />
              : <>
                  <Ionicons name="card-outline" size={18} color={colors.primary} />
                  <Text style={[styles.actionTxt, { color: colors.primary }]}>MANAGE SUBSCRIPTION</Text>
                </>
            }
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.primary, backgroundColor: colors.primary + '11' }]}
            onPress={() => {
              const { Linking } = require('react-native');
              Linking.openURL(`https://${process.env.EXPO_PUBLIC_DOMAIN}/pricing`);
            }}
          >
            <Ionicons name="rocket" size={18} color={colors.primary} />
            <Text style={[styles.actionTxt, { color: colors.primary }]}>UPGRADE TO PRO</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.border }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.actionTxt, { color: colors.mutedForeground }]}>SIGN OUT</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        SWEPT SENTINEL v1.0.0 · sweptsentinel.com
      </Text>
    </ScrollView>
  );
}

export default function AccountScreen() {
  const { user, isLoading } = useAuth();
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={[styles.loadCenter, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {user ? <ProfileView /> : <AuthForm />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loadCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  authContainer: { padding: 24, gap: 24 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoBox: { width: 56, height: 56, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  logoTitle: { fontSize: 16, fontWeight: '700' as const, letterSpacing: 2 },
  logoSub: { fontSize: 9, letterSpacing: 2, marginTop: 2 },
  tabRow: { flexDirection: 'row', borderWidth: 1, overflow: 'hidden' },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabTxt: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 2 },
  form: { gap: 12 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 14, paddingVertical: 0 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 8 },
  errorTxt: { fontSize: 12, flex: 1 },
  submitBtn: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  submitTxt: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 2 },
  pricing: { borderWidth: 1, padding: 16, gap: 6 },
  pricingTitle: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 3, marginBottom: 4 },
  pricingItem: { fontSize: 13, letterSpacing: 0.5 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  price: { fontSize: 20, fontWeight: '700' as const },
  pricePer: { fontSize: 13, fontWeight: '400' as const },
  priceDivider: { fontSize: 20 },
  profile: { padding: 24, alignItems: 'center', gap: 16 },
  avatar: { width: 80, height: 80, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  email: { fontSize: 16, fontWeight: '600' as const, textAlign: 'center' },
  planBadge: { borderWidth: 1, paddingHorizontal: 16, paddingVertical: 6 },
  planTxt: { fontSize: 12, fontWeight: '700' as const, letterSpacing: 2 },
  section: { width: '100%', borderWidth: 1, overflow: 'hidden', gap: 0 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  actionTxt: { fontSize: 13, fontWeight: '700' as const, letterSpacing: 1.5 },
  version: { fontSize: 10, letterSpacing: 2, marginTop: 8 },
});
