import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { DoctorHeader } from "@/components/doctor/doctor-header";
import api from "@/services/api";

interface CheckIn {
  id: number;
  risk_level: "normal" | "warning" | "emergency";
  pain_level: number;
  symptoms: string;
  created_at: string;
}

interface Patient {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  latest_checkin: CheckIn | null;
}

const RISK_BADGE: Record<
  string,
  { bg: string; text: string; icon: string; label: string }
> = {
  emergency: {
    bg: "#FEE2E2",
    text: "#DC2626",
    icon: "error",
    label: "Emergency",
  },
  warning: {
    bg: "#FEF3C7",
    text: "#D97706",
    icon: "warning",
    label: "Warning",
  },
  normal: {
    bg: "#DCFCE7",
    text: "#16A34A",
    icon: "check-circle",
    label: "Normal",
  },
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return "Unknown";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default function PatientsScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filtered, setFiltered] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    try {
      setError(null);
      const res = (await api.getDoctorPatients()) as {
        count: number;
        patients: Patient[];
      };
      setPatients(res.patients ?? []);
      setFiltered(res.patients ?? []);
    } catch (err: any) {
      console.error("Patients fetch error:", err);
      setError(err?.message ?? "Failed to load patients");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPatients();
  }, [fetchPatients]);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text.trim()) {
      setFiltered(patients);
      return;
    }
    const q = text.toLowerCase();
    setFiltered(
      patients.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.username.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.latest_checkin?.symptoms ?? "").toLowerCase().includes(q),
      ),
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <DoctorHeader brandName="Arogya" leftIcon="menu" showAvatarRight />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Loading patients…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <DoctorHeader brandName="Arogya" leftIcon="menu" showAvatarRight />

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
          <Text style={styles.title}>Patient Directory</Text>
          <Text style={styles.subtitle}>
            Monitor and manage your active patient list.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="wifi-off" size={16} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color="#64748B"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, condition…"
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {filtered.length === 0 && !loading && (
          <View style={styles.emptyCard}>
            <MaterialIcons name="people-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No patients yet</Text>
            <Text style={styles.emptySub}>
              Patients will appear here once they book an appointment with you.
            </Text>
          </View>
        )}

        {filtered.map((patient) => {
          const risk = patient.latest_checkin?.risk_level ?? "normal";
          const badge = RISK_BADGE[risk] ?? RISK_BADGE.normal;
          return (
            <View key={patient.id} style={styles.patientCard}>
              <View style={styles.patientHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {patient.first_name?.[0]?.toUpperCase() ??
                      patient.username?.[0]?.toUpperCase() ??
                      "?"}
                  </Text>
                </View>
                <View style={styles.patientNameCol}>
                  <Text style={styles.patientName}>
                    {patient.full_name || patient.username}
                  </Text>
                  <Text style={styles.patientId}>@{patient.username}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <MaterialIcons
                    name={badge.icon as any}
                    size={10}
                    color={badge.text}
                  />
                  <Text style={[styles.badgeText, { color: badge.text }]}>
                    {badge.label}
                  </Text>
                </View>
              </View>

              <View style={styles.patientDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Condition</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {patient.latest_checkin?.symptoms?.split(",")[0] ??
                      "No check-in yet"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Last Check-in</Text>
                  <Text style={styles.detailValue}>
                    {patient.latest_checkin
                      ? timeAgo(patient.latest_checkin.created_at)
                      : "Never"}
                  </Text>
                </View>
                {patient.latest_checkin?.pain_level !== undefined &&
                  patient.latest_checkin.pain_level > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pain Level</Text>
                      <Text style={styles.detailValue}>
                        {patient.latest_checkin.pain_level}/10
                      </Text>
                    </View>
                  )}
              </View>

              <View style={styles.patientActions}>
                <TouchableOpacity style={styles.viewRecordsButton}>
                  <Text style={styles.viewRecordsText}>View Records</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.messageButton}>
                  <MaterialIcons name="mail" size={20} color="#0284C7" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 15, color: "#64748B" },

  hero: { marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: { fontSize: 15, color: "#64748B" },

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

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#0F172A" },

  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FAFBFC",
    borderRadius: 16,
    padding: 32,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  emptySub: { fontSize: 14, color: "#64748B", textAlign: "center" },

  patientCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: "700", color: "#0284C7" },
  patientNameCol: { flex: 1 },
  patientName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  patientId: { fontSize: 13, color: "#64748B" },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

  patientDetails: { marginBottom: 16, gap: 8 },
  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { fontSize: 14, color: "#64748B" },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    maxWidth: "60%",
    textAlign: "right",
  },

  patientActions: { flexDirection: "row", gap: 12 },
  viewRecordsButton: {
    flex: 1,
    backgroundColor: "#E0F2FE",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  viewRecordsText: { color: "#0284C7", fontSize: 14, fontWeight: "600" },
  messageButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
