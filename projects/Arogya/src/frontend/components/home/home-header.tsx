import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/services/AuthContext";

export function HomeHeader() {
  const { state } = useAuth();
  const user = state.user;
  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() ||
      user.username?.[0]?.toUpperCase() ||
      "?"
    : "?";

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.avatarFrame}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <Text style={styles.logoText}>Arogya</Text>
      </View>
      <MaterialIcons name="notifications-none" size={26} color="#64748B" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF1",
    backgroundColor: "#FFFFFF",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  avatarFrame: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#16a085",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  initials: { fontSize: 15, fontWeight: "700", color: "#ffffff" },
  logoText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#16a085",
    letterSpacing: -0.3,
  },
});
