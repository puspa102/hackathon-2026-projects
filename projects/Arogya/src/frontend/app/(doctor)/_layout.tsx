import { Stack } from 'expo-router';

export default function DoctorLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="doctor" />
      <Stack.Screen name="doctor-profile" />
      <Stack.Screen name="doctor-booking" />
      <Stack.Screen name="chat" />
    </Stack>
  );
}
