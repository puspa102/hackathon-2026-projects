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
  Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { authStorage } from "@/services/storage";
import { API_BASE_URL } from "@/services/config";

const BLUE = "#2A7B88";
const RED = "#C62828";
const BG = "#F8F9FA";
const GRAY = "#7A8CA3";
const BORDER = "#E5E7EB";

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  reminder_time: string;
  start_date: string;
  end_date: string | null;
  instructions: string | null;
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
}

function isActive(med: Medicine): boolean {
  const today = new Date().toISOString().split("T")[0];
  if (med.start_date > today) return false;
  if (med.end_date && med.end_date < today) return false;
  return true;
}

export default function MedicationsScreen() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicines = useCallback(async () => {
    try {
      setError(null);
      const token = await authStorage.getToken();
      const res = await fetch(`${API_BASE_URL}/medicines/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load medications");
      const data = await res.json();
      const list: Medicine[] = Array.isArray(data)
        ? data
        : (data.results ?? []);
      setMedicines(list);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load medications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMedicines();
  }, [fetchMedicines]);

  const activeMeds = medicines.filter(isActive);
  const todayMeds = activeMeds;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.canGoBack() && router.back()}
            style={{ padding: 4 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medications</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading medications…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() && router.back()}
          style={{ padding: 4 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medications</Text>
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
        <Text style={styles.greetingTitle}>Your Medications</Text>
        <Text style={styles.greetingSub}>
          {todayMeds.length > 0
            ? `You have ${todayMeds.length} medication${todayMeds.length > 1 ? "s" : ""} scheduled.`
            : "No medications scheduled right now."}
        </Text>

        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="wifi-off" size={16} color={RED} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {todayMeds.length === 0 && !error && (
          <View style={styles.emptyCard}>
            <MaterialIcons name="medication" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No medications</Text>
            <Text style={styles.emptySub}>
              You have no active medications. Ask your doctor to prescribe some.
            </Text>
          </View>
        )}

        {todayMeds.map((med) => (
          <View key={med.id} style={styles.medCard}>
            <View style={styles.medHeader}>
              <View style={styles.medIconBg}>
                <MaterialIcons name="medication" size={24} color={BLUE} />
              </View>
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDosage}>
                  {med.dosage} • {med.frequency}
                </Text>
              </View>
              <View style={styles.timeTag}>
                <MaterialIcons name="schedule" size={14} color={BLUE} />
                <Text style={styles.timeTagText}>
                  {formatTime(med.reminder_time)}
                </Text>
              </View>
            </View>

            {med.instructions ? (
              <Text style={styles.instructions}>{med.instructions}</Text>
            ) : null}

            <View style={styles.medFooter}>
              <Text style={styles.dateRange}>
                From {med.start_date}
                {med.end_date ? ` to ${med.end_date}` : " (ongoing)"}
              </Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.takenBtn}>
                <MaterialIcons
                  name="check-circle"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.takenBtnText}>Mark Taken</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.snoozeBtn}>
                <MaterialIcons
                  name="snooze"
                  size={18}
                  color="#444"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.snoozeBtnText}>Snooze</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: BLUE },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 15, color: GRAY },
  scrollContent: { padding: 16, paddingBottom: 40 },
  greetingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  greetingSub: { fontSize: 14, color: "#555", marginBottom: 20 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, color: RED, flex: 1 },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  emptySub: { fontSize: 14, color: GRAY, textAlign: "center" },
  medCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  medHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  medIconBg: {
    backgroundColor: "#E6F2F4",
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  medInfo: { flex: 1 },
  medName: { fontSize: 17, fontWeight: "bold", color: "#111", marginBottom: 2 },
  medDosage: { fontSize: 13, color: GRAY },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F2F4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeTagText: { fontSize: 12, color: BLUE, fontWeight: "bold", marginLeft: 4 },
  instructions: {
    fontSize: 13,
    color: "#555",
    marginBottom: 12,
    lineHeight: 18,
  },
  medFooter: { marginBottom: 12 },
  dateRange: { fontSize: 12, color: GRAY },
  actionRow: { flexDirection: "row", gap: 12 },
  takenBtn: {
    flex: 1,
    backgroundColor: BLUE,
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  takenBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  snoozeBtn: {
    flex: 1,
    backgroundColor: "#E8EAED",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  snoozeBtnText: { color: "#333", fontSize: 14, fontWeight: "bold" },
});
