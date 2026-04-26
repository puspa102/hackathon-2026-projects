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
import { useAuth } from "@/services/AuthContext";

const PRIMARY = "#2A7B88";
const DARK_TEAL = "#1B5C66";
const BG = "#F5F7F9";
const BORDER = "#E5E7EB";
const GRAY = "#7A8CA3";

interface Report {
  id: number;
  file: string;
  file_type: "pdf" | "image";
  uploaded_at: string;
  status: "pending" | "processed";
  extracted_text: string;
}

function getFileName(url: string): string {
  return (
    url
      ?.split("/")
      .pop()
      ?.replace(/\.[^/.]+$/, "") ?? "Report"
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const PLACEHOLDER_REPORTS = [
  {
    id: -1,
    title: "Cardiology Report",
    date: "Oct 12, 2023",
    icon: "article",
    iconBg: "#E6F2F4",
    iconColor: PRIMARY,
  },
  {
    id: -2,
    title: "Vaccination Record",
    date: "Sep 28, 2023",
    icon: "vaccines",
    iconBg: "#E8F5E9",
    iconColor: "#388E3C",
  },
  {
    id: -3,
    title: "Thyroid Panel",
    date: "Aug 15, 2023",
    icon: "biotech",
    iconBg: "#FFF3E0",
    iconColor: "#F57C00",
  },
];

export default function ReportsScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = state.user;
  const initials = getInitials(
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
      user?.username ||
      "U",
  );

  const fetchReports = useCallback(async () => {
    try {
      const token = await authStorage.getToken();
      const res = await fetch(`${API_BASE_URL}/reports/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      // silently fall back to placeholder
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  const displayReports = reports.length > 0 ? reports : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.brand}>CareConnect</Text>
        <TouchableOpacity style={styles.bellBtn}>
          <MaterialIcons name="notifications-none" size={26} color="#111" />
        </TouchableOpacity>
      </View>

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
        <Text style={styles.pageTitle}>Upload Medical{"\n"}Report</Text>
        <Text style={styles.pageSub}>
          Securely share your laboratory results, prescriptions, or imaging
          reports with your care team.
        </Text>

        {/* Upload Drop Zone */}
        <View style={styles.dropZone}>
          <View style={styles.uploadCircle}>
            <MaterialIcons name="cloud-upload" size={32} color="#fff" />
          </View>
          <Text style={styles.dropTitle}>Drag and drop files here</Text>
          <Text style={styles.dropSub}>
            Support for PDF, JPG, PNG (Max 10MB)
          </Text>

          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() =>
              Alert.alert("Upload", "Document picker coming soon.")
            }
          >
            <MaterialIcons
              name="attach-file"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.browseBtnText}>Browse Files</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.photoBtn}
            onPress={() => Alert.alert("Camera", "Camera upload coming soon.")}
          >
            <MaterialIcons
              name="photo-camera"
              size={20}
              color="#444"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.photoBtnText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Queue */}
        <Text style={styles.queueLabel}>QUEUE (2 FILES)</Text>
        <View style={styles.queueCard}>
          {/* File 1 */}
          <View style={styles.queueItem}>
            <View style={[styles.fileIconBox, { backgroundColor: DARK_TEAL }]}>
              <MaterialIcons name="description" size={20} color="#fff" />
            </View>
            <View style={styles.fileInfo}>
              <View style={styles.fileRow}>
                <Text style={styles.fileName} numberOfLines={1}>
                  Blood_Work_Res...
                </Text>
                <Text style={styles.fileSize}>2.4 MB</Text>
                <TouchableOpacity>
                  <MaterialIcons name="close" size={18} color={GRAY} />
                </TouchableOpacity>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: "80%", backgroundColor: "#4CAF50" },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.queueDivider} />

          {/* File 2 */}
          <View style={styles.queueItem}>
            <View style={[styles.fileIconBox, { backgroundColor: "#9E9E9E" }]}>
              <MaterialIcons name="image" size={20} color="#fff" />
            </View>
            <View style={styles.fileInfo}>
              <View style={styles.fileRow}>
                <Text style={styles.fileName} numberOfLines={1}>
                  X-Ray_Lum...
                </Text>
                <Text style={[styles.fileSize, { color: GRAY }]}>
                  Pending...
                </Text>
                <TouchableOpacity>
                  <MaterialIcons name="close" size={18} color={GRAY} />
                </TouchableOpacity>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: "40%", backgroundColor: "#E0E0E0" },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Did you know card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <MaterialIcons name="info" size={18} color={DARK_TEAL} />
            </View>
            <Text style={styles.infoTitle}>Did you know?</Text>
          </View>
          <Text style={styles.infoText}>
            Uploading your reports manually allows our AI to analyze trends in
            your health data over time.
          </Text>
        </View>

        {/* Recent Reports */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginVertical: 20 }} />
        ) : displayReports ? (
          displayReports.slice(0, 5).map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              activeOpacity={0.85}
              onPress={() => router.push("/(main)/report-summary" as any)}
            >
              <View
                style={[
                  styles.reportIconBox,
                  {
                    backgroundColor:
                      report.file_type === "pdf" ? "#E6F2F4" : "#FFF3E0",
                  },
                ]}
              >
                <MaterialIcons
                  name={report.file_type === "pdf" ? "article" : "image"}
                  size={22}
                  color={report.file_type === "pdf" ? PRIMARY : "#F57C00"}
                />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle} numberOfLines={1}>
                  {getFileName(report.file)}
                </Text>
                <Text style={styles.reportDate}>
                  {formatDate(report.uploaded_at)}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
            </TouchableOpacity>
          ))
        ) : (
          PLACEHOLDER_REPORTS.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.reportCard}
              activeOpacity={0.85}
              onPress={() => router.push("/(main)/report-summary" as any)}
            >
              <View
                style={[styles.reportIconBox, { backgroundColor: r.iconBg }]}
              >
                <MaterialIcons
                  name={r.icon as any}
                  size={22}
                  color={r.iconColor}
                />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{r.title}</Text>
                <Text style={styles.reportDate}>{r.date}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },

  // Header
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
  avatarText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  brand: { flex: 1, fontSize: 18, fontWeight: "700", color: PRIMARY },
  bellBtn: { padding: 4 },

  // Content
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },

  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
    lineHeight: 34,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  pageSub: { fontSize: 14, color: "#555", lineHeight: 21, marginBottom: 24 },

  // Drop Zone
  dropZone: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  uploadCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  dropTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
    textAlign: "center",
  },
  dropSub: { fontSize: 13, color: GRAY, marginBottom: 20, textAlign: "center" },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DARK_TEAL,
    borderRadius: 12,
    height: 48,
    width: "100%",
    marginBottom: 12,
  },
  browseBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF0F2",
    borderRadius: 12,
    height: 48,
    width: "100%",
  },
  photoBtnText: { color: "#333", fontSize: 15, fontWeight: "600" },

  // Queue
  queueLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: GRAY,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  queueCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  queueItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  fileInfo: { flex: 1 },
  fileRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  fileName: { flex: 1, fontSize: 13, fontWeight: "600", color: "#111" },
  fileSize: { fontSize: 12, color: "#111", fontWeight: "600", marginRight: 8 },
  progressBg: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: 4, borderRadius: 2 },
  queueDivider: { height: 1, backgroundColor: "#F1F5F9" },

  // Info card
  infoCard: {
    backgroundColor: DARK_TEAL,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  infoText: { fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 20 },

  // Recent Reports
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111" },
  viewAll: { fontSize: 14, color: PRIMARY, fontWeight: "700" },

  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  reportIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  reportInfo: { flex: 1 },
  reportTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 3,
  },
  reportDate: { fontSize: 12, color: GRAY },
});
