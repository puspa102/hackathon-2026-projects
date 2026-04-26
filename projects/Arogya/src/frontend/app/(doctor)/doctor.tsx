import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";

// This screen redirects to doctor-profile with the same params
export default function DoctorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    router.replace({
      pathname: "/(doctor)/doctor-profile" as any,
      params,
    });
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
