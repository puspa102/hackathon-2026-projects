import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { authStorage } from "@/services/storage";
import { API_BASE_URL } from "@/services/config";
import { useAuth } from "@/services/AuthContext";

const BLUE = "#2A7B88";
const BORDER = "#E5E7EB";
const GRAY = "#7A8CA3";
const GREEN = "#E6F2F4";

interface DashboardData {
  today_checkin_done: boolean;
  today_checkin: any;
  latest_checkin: any;
  next_medicine: any;
  medicines_count: number;
  unread_alerts_count: number;
  doctor_message: any;
  recent_checkins: any[];
}

function getRiskColor(level?: string): string {
  if (level === "emergency") return "#DC2626";
  if (level === "warning") return "#D97706";
  return "#16A34A";
}

function getRiskLabel(level?: string): string {
  if (level === "emergency") return "Emergency ⚠️";
  if (level === "warning") return "Needs Attention";
  if (level === "normal") return "Normal ✓";
  return "No data yet";
}

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const token = await authStorage.getToken();
      const res = await fetch(`${API_BASE_URL}/accounts/dashboard/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load dashboard");
      setData(await res.json());
    } catch (err: any) {
      setError(err?.message ?? "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [fetchDashboard]);

  const user = state.user;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() && router.back()}
          style={{ padding: 4 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={BLUE}
          />
        }
      >
        <View style={styles.greetingHeader}>
          <View>
            <Text style={styles.greetingTitle}>Dashboard</Text>
            <Text style={styles.greetingSub}>
              Welcome back, {user?.first_name || user?.username || "there"}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={BLUE} />
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <MaterialIcons name="wifi-off" size={32} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setLoading(true);
                fetchDashboard();
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : data ? (
          <>
            <View style={styles.quickStatsRow}>
              <View style={styles.quickStatBox}>
                <Text style={styles.quickStatValue}>
                  {data.medicines_count}
                </Text>
                <Text style={styles.quickStatLabel}>Meds</Text>
              </View>
              <View style={styles.quickStatBox}>
                <Text style={styles.quickStatValue}>
                  {data.unread_alerts_count}
                </Text>
                <Text style={styles.quickStatLabel}>Alerts</Text>
              </View>
              <View style={styles.quickStatBox}>
                <Text style={styles.quickStatValue}>
                  {data.today_checkin_done ? "✓" : "—"}
                </Text>
                <Text style={styles.quickStatLabel}>Check-in</Text>
              </View>
            </View>

            {data.next_medicine && (
              <View style={styles.card}>
                <View style={styles.medicationHeader}>
                  <Text style={styles.medicationLabel}>NEXT MEDICATION</Text>
                  <View style={styles.timeTag}>
                    <MaterialIcons name="schedule" size={14} color={BLUE} />
                    <Text style={styles.timeTagText}>
                      {data.next_medicine.reminder_time?.substring(0, 5)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.medicationName}>
                  {data.next_medicine.name} {data.next_medicine.dosage}
                </Text>
                <Text style={styles.medicationSub}>
                  {data.next_medicine.frequency}
                </Text>
              </View>
            )}

            <View style={styles.statusCard}>
              <View style={styles.statusIconBg}>
                <MaterialIcons name="auto-graph" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.statusLabel}>Recovery Status</Text>
                <Text
                  style={[
                    styles.statusValue,
                    { color: getRiskColor(data.latest_checkin?.risk_level) },
                  ]}
                >
                  {getRiskLabel(data.latest_checkin?.risk_level)}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={BLUE} />
            </View>

            <View style={styles.cardRow}>
              <View style={styles.checkinIconBg}>
                <MaterialIcons name="assignment" size={20} color="#333" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.checkinLabel}>Today's Check-in</Text>
                <Text style={styles.checkinValue}>
                  {data.today_checkin_done ? "Completed ✓" : "Pending"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/check-in" as any)}
              >
                <Text style={styles.linkText}>
                  {data.today_checkin_done ? "View" : "Start"}
                </Text>
              </TouchableOpacity>
            </View>

            {data.unread_alerts_count > 0 && (
              <View style={styles.alertBanner}>
                <MaterialIcons
                  name="notifications-active"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.alertBannerText}>
                  {data.unread_alerts_count} unread alert
                  {data.unread_alerts_count > 1 ? "s" : ""}
                </Text>
              </View>
            )}

            {data.doctor_message && (
              <View style={styles.messageCard}>
                <View style={styles.docAvatar}>
                  <MaterialIcons name="local-hospital" size={24} color={BLUE} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.messageTitle}>
                    {data.doctor_message.title}
                  </Text>
                  <Text style={styles.messageText} numberOfLines={3}>
                    {data.doctor_message.message}
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : null}

        <View style={{ height: 60 }} />
      </ScrollView>

      <TouchableOpacity style={styles.emergencyBtn} onPress={() => {}}>
        <MaterialIcons
          name="emergency"
          size={20}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.emergencyBtnText}>EMERGENCY</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAFBFD" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FAFBFD",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: BLUE },
  scrollContent: { padding: 20, paddingBottom: 100 },
  greetingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greetingTitle: { fontSize: 26, fontWeight: "bold", color: "#111" },
  greetingSub: { fontSize: 14, color: "#666", marginTop: 2 },
  centered: { alignItems: "center", paddingVertical: 48, gap: 12 },
  loadingText: { fontSize: 15, color: GRAY },
  errorCard: {
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    borderRadius: 16,
    padding: 24,
    gap: 12,
  },
  errorText: { fontSize: 14, color: "#DC2626", textAlign: "center" },
  retryBtn: {
    backgroundColor: BLUE,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  quickStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  quickStatBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: BLUE,
    marginBottom: 4,
  },
  quickStatLabel: { fontSize: 11, color: GRAY, fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  medicationLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: BLUE,
    letterSpacing: 1,
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeTagText: { fontSize: 12, color: BLUE, fontWeight: "bold", marginLeft: 4 },
  medicationName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  medicationSub: { fontSize: 14, color: GRAY },
  statusCard: {
    backgroundColor: GREEN,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#B2D8DD",
  },
  statusIconBg: {
    backgroundColor: BLUE,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLabel: { fontSize: 13, color: BLUE, fontWeight: "bold" },
  statusValue: { fontSize: 16, fontWeight: "bold" },
  cardRow: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checkinIconBg: {
    backgroundColor: "#F0F2F5",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  checkinLabel: { fontSize: 13, color: GRAY },
  checkinValue: { fontSize: 16, fontWeight: "bold", color: "#111" },
  linkText: { color: BLUE, fontSize: 14, fontWeight: "bold" },
  alertBanner: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  alertBannerText: { color: "#fff", fontSize: 15, fontWeight: "600", flex: 1 },
  messageCard: {
    backgroundColor: GREEN,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    marginBottom: 16,
  },
  docAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#B2D8DD",
    alignItems: "center",
    justifyContent: "center",
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#444",
    fontStyle: "italic",
    lineHeight: 20,
  },
  emergencyBtn: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#D32F2F",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#D32F2F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },
});
