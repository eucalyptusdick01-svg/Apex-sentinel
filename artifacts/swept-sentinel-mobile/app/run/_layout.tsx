import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function RunLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.foreground, fontSize: 13, letterSpacing: 2 },
        headerBackTitle: 'MODULES',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
