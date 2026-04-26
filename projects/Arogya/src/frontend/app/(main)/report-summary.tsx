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

const PRIMARY = "#2A7B88";
const DARK_TEAL = "#1B5C66";
const LIGHT_TEAL = "#E6F2F4";
const RED = "#C62828";
const LIGHT_RED = "#FFEBEE";
const BG = "#F5F7F9";
const BORDER = "#E5E7EB";
const GRAY = "#7A8CA3";

interface Medicine {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  reminder_time: string;
  instructions: string | null;
  start_date: string;
  end_date: string | null;
}

interface Report {
  id: number;
  file: string;
  file_type: string;
  uploaded_at: string;
  status: string;
  extracted_text: string;
  verified_by: number | null;
  verified_at: string | null;
}

interface CheckIn {
  id: number;
  risk_level: string;
  pain_level: number;
  symptoms: string;
  guidance: string;
  created_at: string;
}

function formatTime(t: string): string {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function isActive(med: Medicine): boolean {
  const today = new Date().toISOString().split("T")[0];
  if (med.start_date > today) return false;
  if (med.end_date && med.end_date < today) return false;
  return true;
}

function getFreqLabel(freq: string): string {
  const f = freq?.toLowerCase() ?? "";
  if (f.includes("twice") || f.includes("2")) return "TWICE DAILY";
  if (f.includes("three") || f.includes("3")) return "THREE TIMES";
  if (f.includes("morning")) return "MORNING";
  if (f.includes("evening") || f.includes("night")) return "EVENING";
  return freq?.toUpperCase() ?? "DAILY";
}

function getInitials(first: string, last: string, username: string): string {
  return (
    ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() ||
    username?.[0]?.toUpperCase() ||
    "U"
  );
}

const MED_ICONS = [
  "medication",
  "medical-services",
  "vaccines",
  "healing",
  "local-pharmacy",
];
const BAR_HEIGHTS = [40, 60, 50, 80, 60, 90];

export default function ReportSummaryScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const user = state.user;
  const initials = getInitials(
    user?.first_name ?? "",
    user?.last_name ?? "",
    user?.username ?? "",
  );

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [latestCheckin, setLatestCheckin] = useState<CheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const token = await authStorage.getToken();
      const h = { Authorization: `Token ${token}` };
      const [mRes, rRes, cRes] = await Promise.all([
        fetch(`${API_BASE_URL}/medicines/`, { headers: h }),
        fetch(`${API_BASE_URL}/reports/`, { headers: h }),
        fetch(`${API_BASE_URL}/checkins/`, { headers: h }),
      ]);
      if (mRes.ok) setMedicines(await mRes.json());
      if (rRes.ok) setReports(await rRes.json());
      if (cRes.ok) {
        const checkins: CheckIn[] = await cRes.json();
        setLatestCheckin(checkins[0] ?? null);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll();
  }, [fetchAll]);

  const activeMeds = medicines.filter(isActive);
  const latestReport = reports[0] ?? null;
  const riskColor =
    latestCheckin?.risk_level === "emergency"
      ? "#DC2626"
      : latestCheckin?.risk_level === "warning"
        ? "#D97706"
        : "#16A34A";
  const recoveryLabel =
    latestCheckin?.risk_level === "emergency"
      ? "Critical"
      : latestCheckin?.risk_level === "warning"
        ? "Monitor"
        : "On Track";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.brand}>CareConnect</Text>
        <TouchableOpacity>
          <MaterialIcons name="notifications-none" size={26} color="#111" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading summary…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PRIMARY}
            />
          }
        >
          <View style={styles.titleRow}>
            <View style={styles.sparkBox}>
              <MaterialIcons name="auto-awesome" size={18} color={PRIMARY} />
            </View>
            <Text style={styles.pageTitle}>AI Report Summary</Text>
          </View>
          <Text style={styles.pageSub}>
            {latestReport
              ? `From report uploaded ${new Date(latestReport.uploaded_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
              : "Based on your latest health data"}
          </Text>

          {/* Prescribed Medications */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Prescribed Medications</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeMeds.length} ACTIVE</Text>
              </View>
            </View>

            {activeMeds.length === 0 ? (
              <View style={styles.emptySection}>
                <MaterialIcons name="medication" size={32} color="#CBD5E1" />
                <Text style={styles.emptyText}>No active medications</Text>
                <Text style={styles.emptySub2}>
                  Medications prescribed by your doctor will appear here.
                </Text>
              </View>
            ) : (
              activeMeds.map((med, i) => (
                <View
                  key={med.id}
                  style={[
                    styles.medItem,
                    i === activeMeds.length - 1 && styles.medItemLast,
                  ]}
                >
                  <View style={styles.medIconBox}>
                    <MaterialIcons
                      name={MED_ICONS[i % MED_ICONS.length] as any}
                      size={20}
                      color={PRIMARY}
                    />
                  </View>
                  <View style={styles.medBody}>
                    <View style={styles.medTopRow}>
                      <Text style={styles.medName}>{med.name}</Text>
                      <Text style={styles.medTimeBadge}>
                        {getFreqLabel(med.frequency)}
                      </Text>
                    </View>
                    <Text style={styles.medDose}>{med.dosage}</Text>
                    <View style={styles.medInstRow}>
                      <MaterialIcons
                        name="schedule"
                        size={13}
                        color={PRIMARY}
                        style={{ marginRight: 5 }}
                      />
                      <Text style={styles.medInstText}>
                        {med.instructions ??
                          `Take at ${formatTime(med.reminder_time)}`}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Latest Report Extracted Text */}
          {latestReport?.extracted_text ? (
            <View style={styles.card}>
              <View style={styles.followHeader}>
                <MaterialIcons
                  name="description"
                  size={20}
                  color="#111"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.cardTitle}>Report Insights</Text>
              </View>
              <Text style={styles.extractedText} numberOfLines={8}>
                {latestReport.extracted_text}
              </Text>
              {latestReport.verified_by && (
                <View style={styles.verifiedRow}>
                  <MaterialIcons
                    name="verified"
                    size={16}
                    color="#16A34A"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.verifiedText}>Verified by doctor</Text>
                </View>
              )}
            </View>
          ) : !latestReport ? (
            <View
              style={[
                styles.card,
                { alignItems: "center", paddingVertical: 24 },
              ]}
            >
              <MaterialIcons name="description" size={40} color="#CBD5E1" />
              <Text style={styles.emptyText}>No reports uploaded yet</Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/reports" as any)}
              >
                <Text style={styles.uploadLink}>
                  Upload your first report →
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Latest Check-in Status */}
          {latestCheckin && (
            <View
              style={[
                styles.card,
                { backgroundColor: "#FFEBEE", borderColor: "#FFCDD2" },
              ]}
            >
              <View style={styles.warnHeader}>
                <MaterialIcons
                  name="monitor-heart"
                  size={20}
                  color={riskColor}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.cardTitle, { color: riskColor, flex: 1 }]}>
                  Latest Check-in Status
                </Text>
              </View>
              <Text
                style={[
                  styles.extractedText,
                  { color: "#333", fontStyle: "normal" },
                ]}
              >
                {latestCheckin.guidance}
              </Text>
              {latestCheckin.pain_level > 0 && (
                <View style={styles.tagsRow}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      Pain: {latestCheckin.pain_level}/10
                    </Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      Risk: {latestCheckin.risk_level}
                    </Text>
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={[styles.emergencyBtn, { backgroundColor: riskColor }]}
              >
                <MaterialIcons
                  name="medical-services"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.emergencyBtnText}>
                  {latestCheckin.risk_level === "emergency"
                    ? "Call Emergency Services"
                    : "Chat with Doctor"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Vital Trends */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 16 }]}>
              Vital Trends
            </Text>
            <View style={styles.barChart}>
              {BAR_HEIGHTS.map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    {
                      height: h,
                      backgroundColor:
                        i === BAR_HEIGHTS.length - 1 ? PRIMARY : "#B2D8DD",
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.vitalFooter}>
              <View>
                <Text style={styles.vitalLabel}>RISK LEVEL</Text>
                <Text style={[styles.vitalValue, { color: riskColor }]}>
                  {(latestCheckin?.risk_level ?? "normal").toUpperCase()}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.vitalLabel}>STATUS</Text>
                <Text
                  style={[
                    styles.vitalValue,
                    { fontSize: 16, color: riskColor },
                  ]}
                >
                  {recoveryLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* General Health Tips */}
          <View
            style={[
              styles.card,
              { backgroundColor: DARK_TEAL, borderColor: DARK_TEAL },
            ]}
          >
            <View style={styles.lifeHeader}>
              <MaterialIcons
                name="spa"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.cardTitle, { color: "#fff" }]}>
                General Health Tips
              </Text>
            </View>
            {[
              {
                title: "Stay Hydrated",
                desc: "Drink at least 2 liters of water daily to support recovery.",
              },
              {
                title: "Light Activity",
                desc: "Gentle walks help circulation and speed up recovery.",
              },
              {
                title: "Rest Well",
                desc: "Aim for 7–8 hours of sleep every night.",
              },
            ].map((item) => (
              <View key={item.title} style={styles.lifeItem}>
                <MaterialIcons
                  name="check-circle"
                  size={18}
                  color="#A8D8DC"
                  style={{ marginRight: 12, marginTop: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.lifeTitle}>{item.title}</Text>
                  <Text style={styles.lifeDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 48 }} />
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  brand: { flex: 1, fontSize: 18, fontWeight: "700", color: PRIMARY },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 15, color: GRAY },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  sparkBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: LIGHT_TEAL,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  pageTitle: { fontSize: 20, fontWeight: "700", color: "#111" },
  pageSub: { fontSize: 13, color: "#555", lineHeight: 20, marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  badge: {
    backgroundColor: "#EBEBEB",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#555",
    letterSpacing: 0.5,
  },
  emptySection: { alignItems: "center", paddingVertical: 16, gap: 6 },
  emptyText: { fontSize: 15, fontWeight: "600", color: "#94A3B8" },
  emptySub2: { fontSize: 13, color: GRAY, textAlign: "center" },
  uploadLink: { fontSize: 14, color: PRIMARY, fontWeight: "600", marginTop: 8 },
  medItem: {
    flexDirection: "row",
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },
  medItemLast: { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 },
  medIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: LIGHT_TEAL,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  medBody: { flex: 1 },
  medTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  medName: { fontSize: 15, fontWeight: "700", color: "#111", flex: 1 },
  medTimeBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: PRIMARY,
    letterSpacing: 0.5,
  },
  medDose: { fontSize: 12, color: "#666", marginBottom: 6 },
  medInstRow: { flexDirection: "row", alignItems: "flex-start" },
  medInstText: {
    fontSize: 11,
    color: PRIMARY,
    flex: 1,
    fontWeight: "500",
    lineHeight: 16,
  },
  followHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  extractedText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
    fontStyle: "italic",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  verifiedText: { fontSize: 13, color: "#16A34A", fontWeight: "600" },
  warnHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 12, color: GRAY, fontWeight: "500" },
  emergencyBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  emergencyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    backgroundColor: LIGHT_TEAL,
    borderRadius: 12,
    height: 110,
    padding: 16,
    marginBottom: 14,
  },
  bar: { width: 30, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  vitalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  vitalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: GRAY,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  vitalValue: { fontSize: 22, fontWeight: "700", color: "#111" },
  lifeHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  lifeItem: { flexDirection: "row", marginBottom: 14 },
  lifeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 3,
  },
  lifeDesc: { fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 18 },
});
