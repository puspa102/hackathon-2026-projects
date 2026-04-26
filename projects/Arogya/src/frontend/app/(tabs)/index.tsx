import { useEffect, useState, useCallback } from "react";
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
import { useRouter } from "expo-router";
import { useAuth } from "@/services/AuthContext";
import { notificationService } from "@/services/notifications";
import { CheckInCard } from "@/components/home/check-in-card";
import { DoctorMessageCard } from "@/components/home/doctor-message-card";
import { EmergencyButton } from "@/components/home/emergency-button";
import { HomeHeader } from "@/components/home/home-header";
import { MedicationCard } from "@/components/home/medication-card";
import { SectionCard } from "@/components/home/section-card";
import { StatusCard } from "@/components/home/status-card";
import { fetchDashboard } from "@/services/home";

function getRiskStatusValue(riskLevel?: string | null): string {
  switch (riskLevel) {
    case "emergency":
      return "Emergency ⚠️";
    case "warning":
      return "Needs Attention";
    case "normal":
      return "Normal ✓";
    default:
      return "No data yet";
  }
}

function getRiskBadgeColor(riskLevel: string): string {
  switch (riskLevel) {
    case "emergency":
      return "#e74c3c";
    case "warning":
      return "#f39c12";
    default:
      return "#16a085";
  }
}

function capitalizeFirst(str?: string): string {
  if (!str) return "Unknown";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const user = state.user;

  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchDashboard();
      setDashboard(data);
      
      // Handle Notifications & Alarms
      const hasPerms = await notificationService.requestPermissions();
      if (hasPerms && data.next_medicine) {
        await notificationService.cancelAll(); // Clear old ones to prevent duplicates
        await notificationService.scheduleMedicationAlarm(
          data.next_medicine.name,
          data.next_medicine.reminder_time
        );
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = useCallback(() => {
    loadDashboard(true);
  }, [loadDashboard]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <HomeHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2A7B88"]}
            tintColor="#2A7B88"
          />
        }
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.title}>
            Hello, {user?.first_name || user?.username || "there"} 👋
          </Text>
          <Text style={styles.subtitle}>
            Here's your health summary for today.
          </Text>
        </View>

        {/* Loading State */}
        {loading && !dashboard ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2A7B88" />
          </View>
        ) : error && !dashboard ? (
          /* Error State */
          <View style={styles.errorCard}>
            <MaterialIcons name="error-outline" size={40} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadDashboard()}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : dashboard ? (
          <>
            {/* Next Medication Card */}
            {dashboard.next_medicine ? (
              <MedicationCard
                label="NEXT MEDICATION"
                medication={`${dashboard.next_medicine.name} ${dashboard.next_medicine.dosage}`}
                dueText={
                  "Due at " +
                  dashboard.next_medicine.reminder_time.substring(0, 5)
                }
                actionLabel="Mark as Taken"
              />
            ) : (
              <View style={styles.placeholderCard}>
                <MaterialIcons
                  name="medication"
                  size={28}
                  color="#b2bec3"
                  style={{ marginBottom: 6 }}
                />
                <Text style={styles.noDataText}>No medications today</Text>
              </View>
            )}

            {/* Recovery Status Card */}
            <StatusCard
              title="Recovery Status"
              value={getRiskStatusValue(dashboard?.latest_checkin?.risk_level)}
            />

            {/* Today's Check-in Card */}
            <CheckInCard
              title="TODAY'S CHECK-IN"
              value={dashboard?.today_checkin_done ? "Completed ✓" : "Pending"}
              actionLabel={dashboard?.today_checkin_done ? "View" : "Start"}
              onPress={() => router.push("/(tabs)/check-in")}
            />

            {/* AI Health Suite */}
            <View style={styles.aiSection}>
              <View style={styles.aiHeader}>
                <MaterialIcons name="auto-awesome" size={20} color="#16a085" />
                <Text style={styles.aiTitle}>AI HEALTH SUITE</Text>
              </View>
              <View style={styles.aiGrid}>
                <TouchableOpacity 
                  style={styles.aiCard}
                  onPress={() => router.push("/(main)/risk-assessment")}
                >
                  <View style={[styles.aiIconBg, { backgroundColor: "#E6F4F1" }]}>
                    <MaterialIcons name="psychology" size={24} color="#16a085" />
                  </View>
                  <Text style={styles.aiCardLabel}>Symptom Analysis</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.aiCard}
                  onPress={() => router.push("/(main)/recovery-status")}
                >
                  <View style={[styles.aiIconBg, { backgroundColor: "#EBF5FF" }]}>
                    <MaterialIcons name="forum" size={24} color="#0284C7" />
                  </View>
                  <Text style={styles.aiCardLabel}>Recovery Chat</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Unread Alerts Banner */}
            {dashboard?.unread_alerts_count > 0 && (
              <TouchableOpacity
                style={styles.alertBanner}
                onPress={() => {}}
                activeOpacity={0.85}
              >
                <MaterialIcons
                  name="notifications-active"
                  size={22}
                  color="#ffffff"
                />
                <Text style={styles.alertBannerText}>
                  {dashboard.unread_alerts_count} unread alert
                  {dashboard.unread_alerts_count > 1 ? "s" : ""}
                </Text>
                <MaterialIcons name="chevron-right" size={22} color="#ffffff" />
              </TouchableOpacity>
            )}

            {/* Recent Check-ins Section */}
            <SectionCard title="Recent Check-ins">
              {dashboard?.recent_checkins?.length > 0 ? (
                dashboard.recent_checkins
                  .slice(0, 3)
                  .map((item: any, index: number) => (
                    <View
                      key={item.id ?? index}
                      style={[
                        styles.checkinRow,
                        index ===
                          Math.min(dashboard.recent_checkins.length, 3) - 1 && {
                          borderBottomWidth: 0,
                        },
                      ]}
                    >
                      <Text style={styles.checkinDate}>
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                      <View
                        style={[
                          styles.riskBadge,
                          {
                            backgroundColor: getRiskBadgeColor(item.risk_level),
                          },
                        ]}
                      >
                        <Text style={styles.riskBadgeText}>
                          {capitalizeFirst(item.risk_level)}
                        </Text>
                      </View>
                    </View>
                  ))
              ) : (
                <Text style={styles.noDataText}>
                  No check-ins yet. Start your first one!
                </Text>
              )}
            </SectionCard>

            {/* Doctor Message Card */}
            {dashboard?.doctor_message && (
              <DoctorMessageCard
                title={dashboard.doctor_message.title}
                message={dashboard.doctor_message.message}
              />
            )}

            {/* Emergency Button */}
            <EmergencyButton label="EMERGENCY" />
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFEFF",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 18,
  },
  hero: {
    marginBottom: 2,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.7,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#334155",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  errorCard: {
    backgroundColor: "#FFF5F5",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    fontSize: 14,
    color: "#B91C1C",
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 6,
    backgroundColor: "#16a085",
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  retryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  placeholderCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E4EBF3",
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  alertBanner: {
    backgroundColor: "#e74c3c",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alertBannerText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  checkinRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  checkinDate: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  noDataText: {
    fontSize: 14,
    color: "#95a5a6",
    textAlign: "center",
    paddingVertical: 8,
  },
  aiSection: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 1,
  },
  aiGrid: {
    flexDirection: "row",
    gap: 12,
  },
  aiCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  aiIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  aiCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
  },
});
