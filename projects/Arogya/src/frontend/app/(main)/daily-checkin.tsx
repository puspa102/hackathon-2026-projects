import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function DailyCheckinRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the proper check-in screen
    router.replace("/(tabs)/check-in" as any);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2A7B88" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
