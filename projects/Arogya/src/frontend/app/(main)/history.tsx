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
  TextInput,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { authStorage } from "@/services/storage";
import { API_BASE_URL } from "@/services/config";
import { useAuth } from "@/services/AuthContext";

const PRIMARY = "#2A7B88";
const DARK_TEAL = "#1B5C66";
const BG = "#F8FAFC";
const BORDER = "#E2E8F0";
const GRAY = "#64748B";

interface CheckIn {
  id: number;
  symptoms: string;
  pain_level: number;
  fever: boolean;
  breathing_problem: boolean;
  risk_level: "normal" | "warning" | "emergency";
  guidance: string;
  created_at: string;
}

interface Report {
  id: number;
  file: string;
  file_type: "pdf" | "image";
  uploaded_at: string;
  status: "pending" | "processed";
  extracted_text: string;
}

const RISK_COLOR: Record<string, string> = {
  normal: "#16A34A",
  warning: "#D97706",
  emergency: "#DC2626",
};
const RISK_BG: Record<string, string> = {
  normal: "#DCFCE7",
  warning: "#FEF3C7",
  emergency: "#FEE2E2",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getFileName(url: string): string {
  return (
    url
      ?.split("/")
      .pop()
      ?.replace(/_/g, " ")
      .replace(/\.[^/.]+$/, "") ?? "Report"
  );
}

function getInitials(first: string, last: string, username: string): string {
  return (
    ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() ||
    username?.[0]?.toUpperCase() ||
    "U"
  );
}

export default function MedicalHistoryScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const user = state.user;

  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"checkins" | "reports">(
    "checkins",
  );

  const initials = getInitials(
    user?.first_name ?? "",
    user?.last_name ?? "",
    user?.username ?? "",
  );

  const fetchAll = useCallback(async () => {
    try {
      const token = await authStorage.getToken();
      const headers = { Authorization: `Token ${token}` };
      const [cRes, rRes] = await Promise.all([
        fetch(`${API_BASE_URL}/checkins/`, { headers }),
        fetch(`${API_BASE_URL}/reports/`, { headers }),
      ]);
      if (cRes.ok) setCheckins(await cRes.json());
      if (rRes.ok) setReports(await rRes.json());
    } catch {
      // silent
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

  const filteredCheckins = checkins.filter(
    (c) =>
      !search ||
      c.symptoms.toLowerCase().includes(search.toLowerCase()) ||
      c.risk_level.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredReports = reports.filter(
    (r) =>
      !search ||
      getFileName(r.file).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.brand}>CareConnect</Text>
        <TouchableOpacity>
          <MaterialIcons name="notifications-none" size={26} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView
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
        <Text style={styles.pageTitle}>Medical History</Text>

        {/* Search */}
        <View style={styles.searchBar}>
          <MaterialIcons
            name="search"
            size={20}
            color={GRAY}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search symptoms, reports…"
            placeholderTextColor="#AAB4BD"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <MaterialIcons name="close" size={18} color={GRAY} />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <MaterialIcons name="fact-check" size={22} color={PRIMARY} />
            <Text style={styles.statValue}>{checkins.length}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="description" size={22} color={PRIMARY} />
            <Text style={styles.statValue}>{reports.length}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="verified" size={22} color="#16A34A" />
            <Text style={styles.statValue}>
              {reports.filter((r) => r.status === "processed").length}
            </Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="warning" size={22} color="#D97706" />
            <Text style={styles.statValue}>
              {checkins.filter((c) => c.risk_level !== "normal").length}
            </Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>

        {/* Tab Switch */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "checkins" && styles.tabActive]}
            onPress={() => setActiveTab("checkins")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "checkins" && styles.tabTextActive,
              ]}
            >
              Check-ins ({checkins.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "reports" && styles.tabActive]}
            onPress={() => setActiveTab("reports")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "reports" && styles.tabTextActive,
              ]}
            >
              Reports ({reports.length})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.loadingText}>Loading history…</Text>
          </View>
        ) : activeTab === "checkins" ? (
          filteredCheckins.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="assignment" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No check-ins yet</Text>
              <Text style={styles.emptySub}>
                Start your daily check-in to track your health history.
              </Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.push("/(tabs)/check-in" as any)}
              >
                <Text style={styles.primaryBtnText}>Start Check-in</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredCheckins.map((c) => (
              <View key={c.id} style={styles.checkinCard}>
                <View style={styles.checkinHeader}>
                  <View
                    style={[
                      styles.riskDot,
                      {
                        backgroundColor: RISK_COLOR[c.risk_level] ?? "#16A34A",
                      },
                    ]}
                  />
                  <View style={styles.checkinMeta}>
                    <Text style={styles.checkinDate}>
                      {timeAgo(c.created_at)}
                    </Text>
                    <Text style={styles.checkinTime}>
                      {new Date(c.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: RISK_BG[c.risk_level] ?? "#DCFCE7" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.riskBadgeText,
                        { color: RISK_COLOR[c.risk_level] ?? "#16A34A" },
                      ]}
                    >
                      {c.risk_level.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.symptomsText} numberOfLines={2}>
                  {c.symptoms}
                </Text>
                {c.pain_level > 0 && (
                  <View style={styles.tagsRow}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>
                        Pain: {c.pain_level}/10
                      </Text>
                    </View>
                    {c.fever && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>Fever</Text>
                      </View>
                    )}
                    {c.breathing_problem && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>Breathing</Text>
                      </View>
                    )}
                  </View>
                )}
                {c.guidance ? (
                  <Text style={styles.guidanceText} numberOfLines={2}>
                    {c.guidance}
                  </Text>
                ) : null}
              </View>
            ))
          )
        ) : filteredReports.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="description" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptySub}>
              Upload your medical reports to track them here.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push("/(tabs)/reports" as any)}
            >
              <Text style={styles.primaryBtnText}>Upload Report</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredReports.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.reportCard}
              onPress={() => router.push("/(main)/report-summary" as any)}
            >
              <View
                style={[
                  styles.reportIconBox,
                  {
                    backgroundColor:
                      r.file_type === "pdf" ? "#E6F2F4" : "#FFF3E0",
                  },
                ]}
              >
                <MaterialIcons
                  name={r.file_type === "pdf" ? "description" : "image"}
                  size={22}
                  color={r.file_type === "pdf" ? PRIMARY : "#F57C00"}
                />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle} numberOfLines={1}>
                  {getFileName(r.file)}
                </Text>
                <Text style={styles.reportDate}>{timeAgo(r.uploaded_at)}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      r.status === "processed" ? "#DCFCE7" : "#F1F5F9",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: r.status === "processed" ? "#16A34A" : "#64748B" },
                  ]}
                >
                  {r.status === "processed" ? "VERIFIED" : "PENDING"}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color="#CBD5E1"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          ))
        )}

        {/* CTA Banner */}
        <View style={styles.ctaBanner}>
          <View style={styles.ctaContent}>
            <MaterialIcons
              name="cloud-sync"
              size={24}
              color="#fff"
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.ctaTitle}>Request Medical Records</Text>
            <Text style={styles.ctaSub}>
              Transfer your history from another provider easily.
            </Text>
            <TouchableOpacity style={styles.ctaBtn}>
              <Text style={styles.ctaBtnText}>Start Request</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#111" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statValue: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  statLabel: { fontSize: 10, color: GRAY, fontWeight: "600" },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: PRIMARY },
  tabText: { fontSize: 13, fontWeight: "600", color: GRAY },
  tabTextActive: { color: "#fff" },
  centered: { alignItems: "center", paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 15, color: GRAY },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  emptySub: { fontSize: 14, color: GRAY, textAlign: "center", lineHeight: 20 },
  primaryBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  checkinCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  checkinHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  riskDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  checkinMeta: { flex: 1 },
  checkinDate: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  checkinTime: { fontSize: 12, color: GRAY },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  riskBadgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  symptomsText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  tag: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 12, color: GRAY, fontWeight: "500" },
  guidanceText: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
    lineHeight: 18,
  },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  reportIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reportInfo: { flex: 1 },
  reportTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  reportDate: { fontSize: 12, color: GRAY },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  ctaBanner: {
    backgroundColor: DARK_TEAL,
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
  },
  ctaContent: {},
  ctaTitle: { color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 8 },
  ctaSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaBtn: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctaBtnText: { color: DARK_TEAL, fontWeight: "800", fontSize: 14 },
});
