import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { DoctorHeader } from "@/components/doctor/doctor-header";
import { useAuth } from "@/services/AuthContext";
import api from "@/services/api";

interface UrgentAlert {
  patient_id: number;
  patient_name: string;
  risk_level: "emergency" | "warning";
  pain_level: number;
  symptoms: string;
  fever: boolean;
  breathing_problem: boolean;
  bleeding: boolean;
  guidance: string;
  checkin_id: number;
  created_at: string;
}

interface Appointment {
  id: number;
  patient_info: {
    id: number;
    full_name: string;
    first_name: string;
    last_name: string;
  };
  scheduled_date: string;
  scheduled_time: string;
  appointment_type: "video" | "in_clinic" | "home_visit";
  status: string;
}

interface PendingReport {
  id: number;
  patient: number;
  status: string;
  uploaded_at: string;
  extracted_text: string;
}

interface DashboardData {
  active_patients_count: number;
  new_patients_count: number;
  pending_tasks_count: number;
  urgent_alerts: UrgentAlert[];
  today_appointments: Appointment[];
  pending_reports: PendingReport[];
}

const APPOINTMENT_TYPE_ICONS: Record<string, string> = {
  video: "videocam",
  in_clinic: "local-hospital",
  home_visit: "home",
};

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  video: "Video Consultation",
  in_clinic: "In-Clinic Visit",
  home_visit: "Home Visit",
};

export default function DashboardScreen() {
  const { state } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const result = (await api.getDoctorDashboard()) as DashboardData;
      setData(result);
    } catch (err: any) {
      console.error("Doctor dashboard fetch error:", err);
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

  const formatTime = (timeStr: string) => {
    if (!timeStr) return { time: "--:--", ampm: "" };
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return { time: `${String(displayHour).padStart(2, "0")}:${m}`, ampm };
  };

  const urgentCount = data
    ? data.urgent_alerts.filter((a) => a.risk_level === "emergency").length
    : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <DoctorHeader
          brandName="Arogya"
          showAvatarLeft
          rightIcon="notifications"
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Loading dashboard…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <DoctorHeader
        brandName="Arogya"
        showAvatarLeft
        rightIcon="notifications"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0284C7"
          />
        }
      >
        <View style={styles.hero}>
          <Text style={styles.welcomeText}>
            Welcome back, Dr.{" "}
            {state.user?.first_name || state.user?.username || "Doctor"}
          </Text>
          <Text style={styles.title}>Your Dashboard</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="wifi-off" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: "#EBF3FB" }]}>
            <Text style={[styles.statNumber, { color: "#0284C7" }]}>
              {String(data?.active_patients_count ?? 0).padStart(2, "0")}
            </Text>
            <Text style={styles.statLabel}>ACTIVE</Text>
          </View>
          <View style={[styles.statCard, { borderColor: "#F0FDF4" }]}>
            <Text style={[styles.statNumber, { color: "#16A34A" }]}>
              {String(data?.new_patients_count ?? 0).padStart(2, "0")}
            </Text>
            <Text style={styles.statLabel}>NEW</Text>
          </View>
          <View style={[styles.statCard, { borderColor: "#FEF2F2" }]}>
            <Text style={[styles.statNumber, { color: "#DC2626" }]}>
              {String(data?.pending_tasks_count ?? 0).padStart(2, "0")}
            </Text>
            <Text style={styles.statLabel}>TASKS</Text>
          </View>
        </View>

        {/* Urgent Alerts */}
        {(data?.urgent_alerts?.length ?? 0) > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Urgent Alerts</Text>
              {urgentCount > 0 && (
                <View style={styles.badgeCritical}>
                  <Text style={styles.badgeCriticalText}>
                    {urgentCount} Critical
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.alertsContainer}>
              {data!.urgent_alerts.slice(0, 5).map((alert) => (
                <View
                  key={alert.checkin_id}
                  style={[
                    styles.alertCard,
                    {
                      borderLeftColor:
                        alert.risk_level === "emergency"
                          ? "#DC2626"
                          : "#D97706",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.alertIconWrapper,
                      {
                        backgroundColor:
                          alert.risk_level === "emergency"
                            ? "#FEF2F2"
                            : "#FEF3C7",
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={alert.breathing_problem ? "air" : "warning"}
                      size={24}
                      color={
                        alert.risk_level === "emergency" ? "#DC2626" : "#D97706"
                      }
                    />
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertName}>{alert.patient_name}</Text>
                    <Text
                      style={[
                        styles.alertDesc,
                        {
                          color:
                            alert.risk_level === "emergency"
                              ? "#DC2626"
                              : "#D97706",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {alert.risk_level === "emergency"
                        ? "Emergency"
                        : "Warning"}
                      {alert.pain_level > 0
                        ? `: Pain Lvl ${alert.pain_level}`
                        : ""}
                      {alert.breathing_problem ? " · Low O2" : ""}
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.reviewButton}>Review</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Today's Consultations */}
        {(data?.today_appointments?.length ?? 0) > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Consultations</Text>
            </View>
            <View style={styles.consultationsContainer}>
              {data!.today_appointments.map((appt, index) => {
                const { time, ampm } = formatTime(appt.scheduled_time);
                const isLast = index === data!.today_appointments.length - 1;
                return (
                  <View key={appt.id}>
                    <View style={styles.consultationRow}>
                      <View style={styles.timeBlock}>
                        <Text style={styles.timeText}>{time}</Text>
                        <Text style={styles.ampmText}>{ampm}</Text>
                      </View>
                      <View style={styles.consultContent}>
                        <Text style={styles.consultName}>
                          {appt.patient_info?.full_name ||
                            `${appt.patient_info?.first_name ?? ""} ${appt.patient_info?.last_name ?? ""}`.trim()}
                        </Text>
                        <View style={styles.consultTypeRow}>
                          <MaterialIcons
                            name={
                              (APPOINTMENT_TYPE_ICONS[appt.appointment_type] ??
                                "event") as any
                            }
                            size={14}
                            color="#64748B"
                          />
                          <Text style={styles.consultType}>
                            {APPOINTMENT_TYPE_LABELS[appt.appointment_type] ??
                              appt.appointment_type}
                          </Text>
                        </View>
                      </View>
                      <MaterialIcons
                        name="chevron-right"
                        size={24}
                        color="#CBD5E1"
                      />
                    </View>
                    {!isLast && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* No appointments placeholder */}
        {(data?.today_appointments?.length ?? 0) === 0 && !loading && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Consultations</Text>
            </View>
            <View style={styles.emptyCard}>
              <MaterialIcons name="event-available" size={36} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                No consultations scheduled for today
              </Text>
            </View>
          </>
        )}

        {/* Reports to Verify */}
        {(data?.pending_reports?.length ?? 0) > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reports to Verify</Text>
            </View>
            {data!.pending_reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <MaterialIcons
                    name="description"
                    size={24}
                    color="#475569"
                    style={styles.reportIcon}
                  />
                  <View style={styles.reportContent}>
                    <View style={styles.reportTitleRow}>
                      <Text style={styles.reportTitle} numberOfLines={1}>
                        Discharge Report #{report.id}
                      </Text>
                      <View style={styles.badgeAI}>
                        <Text style={styles.badgeAIText}>PENDING</Text>
                      </View>
                    </View>
                    <Text style={styles.reportSubtitle}>
                      Uploaded{" "}
                      {new Date(report.uploaded_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.reportActions}>
                  <TouchableOpacity style={styles.verifyButton}>
                    <Text style={styles.verifyButtonText}>Verify</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.eyeButton}>
                    <MaterialIcons
                      name="visibility"
                      size={20}
                      color="#0F172A"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1, backgroundColor: "#FAFBFC" },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 15, color: "#64748B" },
  hero: { marginBottom: 24 },
  welcomeText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  errorText: { fontSize: 13, color: "#DC2626", flex: 1 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    letterSpacing: 0.5,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  badgeCritical: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCriticalText: { color: "#DC2626", fontSize: 12, fontWeight: "700" },

  alertsContainer: { marginBottom: 32 },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  alertIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  alertContent: { flex: 1 },
  alertName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  alertDesc: { fontSize: 14, fontWeight: "500" },
  reviewButton: { color: "#0284C7", fontWeight: "700", fontSize: 15 },

  consultationsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  consultationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 8,
    marginLeft: 64,
  },
  timeBlock: { alignItems: "center", width: 48, marginRight: 16 },
  timeText: { fontSize: 16, fontWeight: "700", color: "#0284C7" },
  ampmText: { fontSize: 12, fontWeight: "600", color: "#94A3B8" },
  consultContent: { flex: 1 },
  consultName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  consultTypeRow: { flexDirection: "row", alignItems: "center" },
  consultType: { fontSize: 14, color: "#64748B", marginLeft: 6 },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  emptyText: { fontSize: 14, color: "#94A3B8", textAlign: "center" },

  reportCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  reportHeader: { flexDirection: "row", marginBottom: 16 },
  reportIcon: { marginTop: 2, marginRight: 12 },
  reportContent: { flex: 1 },
  reportTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  badgeAI: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeAIText: { color: "#D97706", fontSize: 10, fontWeight: "700" },
  reportSubtitle: { fontSize: 13, color: "#64748B" },
  reportActions: { flexDirection: "row", gap: 12 },
  verifyButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0284C7",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  verifyButtonText: { color: "#0284C7", fontWeight: "700", fontSize: 15 },
  eyeButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
