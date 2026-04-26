import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="daily-checkin" />
      <Stack.Screen name="recovery-status" />
      <Stack.Screen name="medications" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="report-summary" />
      <Stack.Screen name="risk-assessment" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
