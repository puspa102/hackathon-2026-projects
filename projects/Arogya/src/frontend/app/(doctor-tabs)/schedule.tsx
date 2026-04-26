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
import api from "@/services/api";

interface PatientInfo {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  username: string;
}

interface Appointment {
  id: number;
  patient_info: PatientInfo;
  scheduled_date: string;
  scheduled_time: string;
  appointment_type: "video" | "in_clinic" | "home_visit";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  chief_complaint: string;
  notes: string;
}

const TYPE_ICON: Record<string, string> = {
  video: "videocam",
  in_clinic: "local-hospital",
  home_visit: "home",
};

const TYPE_LABEL: Record<string, string> = {
  video: "Video Consultation",
  in_clinic: "In-Clinic Visit",
  home_visit: "Home Visit",
};

const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  completed: { bg: "#DCFCE7", text: "#16A34A", label: "Completed" },
  confirmed: { bg: "#E0F2FE", text: "#0284C7", label: "Confirmed" },
  pending: { bg: "#F1F5F9", text: "#64748B", label: "Pending" },
  cancelled: { bg: "#FEE2E2", text: "#DC2626", label: "Cancelled" },
};

const DOT_COLOR: Record<string, string> = {
  completed: "#16A34A",
  confirmed: "#0284C7",
  pending: "#E2E8F0",
  cancelled: "#DC2626",
};

const DOT_ICON: Record<string, string> = {
  completed: "check",
  confirmed: "schedule",
  pending: "business-center",
  cancelled: "close",
};

function formatDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function formatTime(timeStr: string): { time: string; ampm: string } {
  if (!timeStr) return { time: "--:--", ampm: "" };
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return { time: `${String(displayHour).padStart(2, "0")}:${m}`, ampm };
}

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build the 5-day window centred on today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 2 + i);
    return d;
  });

  const fetchAppointments = useCallback(async (date: Date) => {
    try {
      setError(null);
      const dateStr = formatDateString(date);
      const res = (await api.getAppointments({
        date: dateStr,
      })) as Appointment[];
      setAppointments(Array.isArray(res) ? res : []);
    } catch (err: any) {
      console.error("Appointments fetch error:", err);
      setError(err?.message ?? "Failed to load appointments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments(selectedDate);
  }, [selectedDate, fetchAppointments]);

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    setLoading(true);
  };

  const displayDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const completedCount = appointments.filter(
    (a) => a.status === "completed",
  ).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <DoctorHeader
        brandName="Arogya"
        leftIcon="menu"
        rightIcon="search"
        showAvatarRight
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
        <View style={styles.headerRow}>
          <Text style={styles.title}>Daily Schedule</Text>
        </View>
        <Text style={styles.dateSubtitle}>{displayDate}</Text>

        {/* Day Picker */}
        <View style={styles.dayPicker}>
          {days.map((day, i) => {
            const isSelected =
              formatDateString(day) === formatDateString(selectedDate);
            return (
              <TouchableOpacity
                key={i}
                style={[styles.dayItem, isSelected && styles.dayItemActive]}
                onPress={() => handleDayPress(day)}
              >
                <Text
                  style={[
                    styles.dayItemLabel,
                    isSelected && styles.dayItemLabelActive,
                  ]}
                >
                  {getDayLabel(day)}
                </Text>
                <Text
                  style={[
                    styles.dayItemNumber,
                    isSelected && styles.dayItemNumberActive,
                  ]}
                >
                  {day.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="wifi-off" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0284C7" />
            <Text style={styles.loadingText}>Loading schedule…</Text>
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="event-available" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No appointments</Text>
            <Text style={styles.emptySub}>
              No appointments scheduled for this day.
            </Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {appointments.map((appt, index) => {
              const { time, ampm } = formatTime(appt.scheduled_time);
              const badge = STATUS_BADGE[appt.status] ?? STATUS_BADGE.pending;
              const dotColor = DOT_COLOR[appt.status] ?? "#E2E8F0";
              const dotIcon = DOT_ICON[appt.status] ?? "schedule";
              const isLast = index === appointments.length - 1;
              const patientName =
                appt.patient_info?.full_name ||
                `${appt.patient_info?.first_name ?? ""} ${appt.patient_info?.last_name ?? ""}`.trim() ||
                appt.patient_info?.username;

              return (
                <View key={appt.id} style={styles.timelineRow}>
                  {/* Left time column */}
                  <View style={styles.timeColumn}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: dotColor },
                      ]}
                    >
                      <MaterialIcons
                        name={dotIcon as any}
                        size={14}
                        color="#FFFFFF"
                      />
                    </View>
                    <Text style={styles.timeText}>{time}</Text>
                    <Text style={styles.ampmSmall}>{ampm}</Text>
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  {/* Event card */}
                  <View
                    style={[
                      styles.eventCard,
                      appt.status === "confirmed" && styles.eventCardActive,
                    ]}
                  >
                    <View style={styles.eventHeader}>
                      <View style={styles.placeholderAvatar}>
                        <Text style={styles.avatarLetter}>
                          {appt.patient_info?.first_name?.[0]?.toUpperCase() ??
                            appt.patient_info?.username?.[0]?.toUpperCase() ??
                            "?"}
                        </Text>
                      </View>
                      <View style={styles.eventTitleCol}>
                        <Text style={styles.eventName}>{patientName}</Text>
                        <View style={styles.eventTypeRow}>
                          <MaterialIcons
                            name={
                              (TYPE_ICON[appt.appointment_type] ??
                                "event") as any
                            }
                            size={14}
                            color="#475569"
                          />
                          <Text style={styles.eventTypeText}>
                            {TYPE_LABEL[appt.appointment_type] ??
                              appt.appointment_type}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: badge.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: badge.text },
                          ]}
                        >
                          {badge.label}
                        </Text>
                      </View>
                    </View>

                    {appt.chief_complaint ? (
                      <Text style={styles.complaint} numberOfLines={2}>
                        {appt.chief_complaint}
                      </Text>
                    ) : null}

                    {appt.status === "confirmed" &&
                      appt.appointment_type === "video" && (
                        <View style={styles.eventActionsRow}>
                          <TouchableOpacity style={styles.primaryButton}>
                            <Text style={styles.primaryButtonText}>
                              Start Video Call
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.iconButton}>
                            <MaterialIcons
                              name="more-vert"
                              size={20}
                              color="#475569"
                            />
                          </TouchableOpacity>
                        </View>
                      )}

                    {appt.status === "completed" && (
                      <TouchableOpacity style={styles.secondaryButton}>
                        <Text style={styles.secondaryButtonText}>
                          View Notes
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Summary cards */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: "#F0F9FF", borderColor: "#E0F2FE" },
            ]}
          >
            <MaterialIcons
              name="event"
              size={24}
              color="#0284C7"
              style={styles.summaryIcon}
            />
            <Text style={[styles.summaryValue, { color: "#0284C7" }]}>
              {String(appointments.length).padStart(2, "0")}
            </Text>
            <Text style={[styles.summaryLabel, { color: "#0369A1" }]}>
              Appointments Today
            </Text>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: "#F0FDF4", borderColor: "#DCFCE7" },
            ]}
          >
            <MaterialIcons
              name="check-circle"
              size={24}
              color="#16A34A"
              style={styles.summaryIcon}
            />
            <Text style={[styles.summaryValue, { color: "#16A34A" }]}>
              {completedCount}
            </Text>
            <Text style={[styles.summaryLabel, { color: "#15803D" }]}>
              Completed
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1, backgroundColor: "#FAFBFC" },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  dateSubtitle: { fontSize: 16, color: "#475569", marginBottom: 24 },

  dayPicker: { flexDirection: "row", gap: 8, marginBottom: 32 },
  dayItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 12,
  },
  dayItemActive: { backgroundColor: "#0284C7", borderColor: "#0284C7" },
  dayItemLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  dayItemLabelActive: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E0F2FE",
    marginBottom: 4,
  },
  dayItemNumber: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  dayItemNumberActive: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },

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

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: { fontSize: 15, color: "#64748B" },

  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 40,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  emptySub: { fontSize: 14, color: "#64748B", textAlign: "center" },

  timelineContainer: { marginBottom: 24 },
  timelineRow: { flexDirection: "row", marginBottom: 16 },

  timeColumn: { width: 52, alignItems: "center", marginRight: 12 },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    marginBottom: 4,
  },
  timeText: { fontSize: 13, color: "#0284C7", fontWeight: "700" },
  ampmSmall: { fontSize: 11, color: "#94A3B8" },
  timelineLine: {
    position: "absolute",
    top: 32,
    bottom: -20,
    width: 2,
    backgroundColor: "#E2E8F0",
    zIndex: 1,
  },

  eventCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
  },
  eventCardActive: {
    borderColor: "#BAE6FD",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  placeholderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarLetter: { fontSize: 16, fontWeight: "700", color: "#0284C7" },
  eventTitleCol: { flex: 1 },
  eventName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  eventTypeRow: { flexDirection: "row", alignItems: "center" },
  eventTypeText: { fontSize: 13, color: "#64748B", marginLeft: 4 },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 11, fontWeight: "600" },

  complaint: { fontSize: 13, color: "#64748B", marginBottom: 12 },

  secondaryButton: {
    backgroundColor: "#FAFBFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#0F52BA", fontSize: 14, fontWeight: "600" },

  eventActionsRow: { flexDirection: "row", gap: 8 },
  primaryButton: {
    flex: 1,
    backgroundColor: "#0284C7",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  iconButton: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  statsContainer: { flexDirection: "row", gap: 12 },
  summaryCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 16 },
  summaryIcon: { marginBottom: 12 },
  summaryValue: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  summaryLabel: { fontSize: 13, fontWeight: "500" },

  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
