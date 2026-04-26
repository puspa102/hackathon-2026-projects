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
const LIGHT_TEAL = "#E6F2F4";
const BG = "#F8F9FA";
const BORDER = "#E5E7EB";

interface CheckIn {
  id: number;
  symptoms: string;
  pain_level: number;
  fever: boolean;
  breathing_problem: boolean;
  bleeding: boolean;
  risk_level: "normal" | "warning" | "emergency";
  guidance: string;
  created_at: string;
}

const RISK_STYLE = {
  normal: {
    bg: "#DCFCE7",
    border: "#BBF7D0",
    icon: "#16A34A",
    label: "Normal",
    iconName: "check-circle" as const,
  },
  warning: {
    bg: "#FEF3C7",
    border: "#FDE68A",
    icon: "#D97706",
    label: "Warning",
    iconName: "warning" as const,
  },
  emergency: {
    bg: "#FEE2E2",
    border: "#FECACA",
    icon: "#DC2626",
    label: "Emergency",
    iconName: "error" as const,
  },
};

function buildSymptoms(c: CheckIn) {
  const items: {
    name: string;
    level: string;
    levelBg: string;
    levelText: string;
    icon: string;
  }[] = [];
  const symptoms = c.symptoms
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  symptoms.forEach((s) =>
    items.push({
      name: s,
      level: "REPORTED",
      levelBg: "#F1F5F9",
      levelText: "#64748B",
      icon: "circle",
    }),
  );
  if (c.fever)
    items.push({
      name: "Fever",
      level: "MOD",
      levelBg: "#FEF3C7",
      levelText: "#D97706",
      icon: "thermostat",
    });
  if (c.breathing_problem)
    items.push({
      name: "Breathing Issues",
      level: "HIGH",
      levelBg: "#FEE2E2",
      levelText: "#DC2626",
      icon: "air",
    });
  if (c.bleeding)
    items.push({
      name: "Bleeding",
      level: "HIGH",
      levelBg: "#FEE2E2",
      levelText: "#DC2626",
      icon: "water-drop",
    });
  if (c.pain_level >= 7)
    items.push({
      name: `Pain Level ${c.pain_level}/10`,
      level: "HIGH",
      levelBg: "#FEE2E2",
      levelText: "#DC2626",
      icon: "sentiment-very-dissatisfied",
    });
  else if (c.pain_level >= 4)
    items.push({
      name: `Pain Level ${c.pain_level}/10`,
      level: "MOD",
      levelBg: "#FEF3C7",
      levelText: "#D97706",
      icon: "sentiment-dissatisfied",
    });
  return items.slice(0, 5);
}

export default function RiskAssessmentScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const user = state.user;

  const [checkin, setCheckin] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = useCallback(async () => {
    try {
      setError(null);
      const token = await authStorage.getToken();
      const res = await fetch(`${API_BASE_URL}/checkins/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch check-ins");
      const data: CheckIn[] = await res.json();
      setCheckin(data[0] ?? null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLatest();
  }, [fetchLatest]);

  const riskStyle = RISK_STYLE[checkin?.risk_level ?? "normal"];
  const symptoms = checkin ? buildSymptoms(checkin) : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(
              (user?.first_name?.[0] ?? "") + (user?.last_name?.[0] ?? "")
            ).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.headerTitle}>CareConnect</Text>
        <MaterialIcons name="notifications-none" size={24} color="#333" />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading assessment…</Text>
        </View>
      ) : (
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
          {error && (
            <View style={styles.errorBanner}>
              <MaterialIcons name="wifi-off" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!checkin ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="assignment" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Check-ins Yet</Text>
              <Text style={styles.emptySub}>
                Complete a daily check-in to see your risk assessment here.
              </Text>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => router.push("/(tabs)/check-in" as any)}
              >
                <Text style={styles.startBtnText}>Start Check-in</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Risk Card */}
              <View
                style={[
                  styles.riskCard,
                  {
                    backgroundColor: riskStyle.bg,
                    borderColor: riskStyle.border,
                  },
                ]}
              >
                <View style={styles.riskHeader}>
                  <View
                    style={[
                      styles.riskIconBg,
                      { backgroundColor: riskStyle.icon },
                    ]}
                  >
                    <MaterialIcons
                      name={riskStyle.iconName}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <View style={{ marginLeft: 16 }}>
                    <Text style={[styles.riskLabel, { color: riskStyle.icon }]}>
                      RISK STATUS
                    </Text>
                    <Text style={[styles.riskTitle, { color: riskStyle.icon }]}>
                      {riskStyle.label}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.riskDesc, { color: riskStyle.icon }]}>
                  {checkin.guidance}
                </Text>
                <Text style={styles.riskDate}>
                  Last check-in:{" "}
                  {new Date(checkin.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>

              {/* Symptom Overview */}
              {symptoms.length > 0 && (
                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <MaterialIcons
                      name="monitor-heart"
                      size={20}
                      color={BLUE}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.cardTitle}>Symptom Overview</Text>
                  </View>
                  {symptoms.map((s, i) => (
                    <View
                      key={i}
                      style={[
                        styles.symptomRow,
                        i === symptoms.length - 1 && { marginBottom: 0 },
                      ]}
                    >
                      <MaterialIcons
                        name={s.icon as any}
                        size={20}
                        color={s.levelText}
                        style={{ marginRight: 12 }}
                      />
                      <Text style={styles.symptomName}>{s.name}</Text>
                      <View
                        style={[styles.badge, { backgroundColor: s.levelBg }]}
                      >
                        <Text
                          style={[styles.badgeText, { color: s.levelText }]}
                        >
                          {s.level}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Actions */}
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => router.push("/(doctor)/chat" as any)}
              >
                <MaterialIcons
                  name="chat"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.chatBtnText}>Chat with Doctor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.emergencyBtn}>
                <MaterialIcons
                  name="medical-services"
                  size={20}
                  color={BLUE}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.emergencyBtnText}>View Emergency Info</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "bold", color: BLUE },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 15, color: "#64748B" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, color: "#DC2626", flex: 1 },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 36,
    gap: 10,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  emptySub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  startBtn: {
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  startBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  riskCard: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1 },
  riskHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  riskIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  riskLabel: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 2,
  },
  riskTitle: { fontSize: 20, fontWeight: "bold" },
  riskDesc: { fontSize: 14, lineHeight: 22, marginBottom: 8 },
  riskDate: { fontSize: 12, color: "#94A3B8" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#111" },
  symptomRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  symptomName: { flex: 1, fontSize: 14, color: "#111" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: "bold", letterSpacing: 0.5 },
  chatBtn: {
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  chatBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  emergencyBtn: {
    backgroundColor: LIGHT_TEAL,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyBtnText: { color: BLUE, fontSize: 14, fontWeight: "bold" },
});
