import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { authStorage } from "@/services/storage";
import { API_BASE_URL } from "@/services/config";
import { useAuth } from "@/services/AuthContext";

const PRIMARY = "#2A7B88";
const DARK_TEAL = "#1B5C66";
const BORDER = "#E5E7EB";
const GRAY = "#7A8CA3";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string | null;
  location: string;
  available: boolean;
}

function getAvailableDays() {
  const days: {
    date: Date;
    label: string;
    num: number;
    month: string;
    iso: string;
  }[] = [];
  const now = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const weekDay = d
      .toLocaleDateString("en-US", { weekday: "short" })
      .toUpperCase();
    days.push({
      date: d,
      label: weekDay,
      num: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      iso: d.toISOString().split("T")[0],
    });
  }
  return days;
}

const MORNING_SLOTS = ["09:00", "09:30", "10:00", "10:30"];
const AFTERNOON_SLOTS = ["13:00", "13:30", "14:00", "15:00"];
const EVENING_SLOTS = ["17:00", "18:00"];

function displaySlot(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function getInitials(name: string): string {
  return name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DoctorBookingScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const params = useLocalSearchParams();
  const doctorId = params.doctorId ? Number(params.doctorId) : null;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const days = getAvailableDays();
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"video" | "in_clinic">(
    "in_clinic",
  );

  const fetchDoctor = useCallback(async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }
    try {
      const token = await authStorage.getToken();
      const res = await fetch(`${API_BASE_URL}/doctors/${doctorId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) setDoctor(await res.json());
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  const handleConfirm = async () => {
    if (!selectedSlot) {
      Alert.alert(
        "Select a time",
        "Please choose a time slot before confirming.",
      );
      return;
    }
    setBooking(true);
    try {
      const token = await authStorage.getToken();
      const body = {
        patient: state.user?.id,
        doctor: doctorId,
        scheduled_date: selectedDay.iso,
        scheduled_time: `${selectedSlot}:00`,
        appointment_type: selectedType,
        chief_complaint: "",
        status: "pending",
      };
      const res = await fetch(`${API_BASE_URL}/appointments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.detail || err.non_field_errors?.[0] || "Booking failed",
        );
      }
      Alert.alert(
        "✅ Appointment Booked!",
        `Your appointment with ${doctor?.name ?? "the doctor"} is confirmed for ${selectedDay.iso} at ${displaySlot(selectedSlot)}.`,
        [
          {
            text: "OK",
            onPress: () =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(tabs)" as any),
          },
        ],
      );
    } catch (e: any) {
      Alert.alert("Booking Failed", e?.message ?? "Please try again.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.canGoBack() && router.back()}
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Loading doctor info…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!doctorId || !doctor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.canGoBack() && router.back()}
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
          <Text style={styles.loadingText}>Doctor not found</Text>
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.back()}
          >
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = getInitials(doctor.name);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() && router.back()}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <View style={styles.docAvatar}>
            <Text style={styles.docAvatarText}>{initials}</Text>
          </View>
          <View style={styles.specPill}>
            <Text style={styles.specText}>{doctor.specialization}</Text>
          </View>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <View style={styles.docMeta}>
            <MaterialIcons name="local-hospital" size={14} color={GRAY} />
            <Text style={styles.docMetaText}>{doctor.hospital}</Text>
          </View>
          <View style={styles.docMeta}>
            <MaterialIcons name="location-on" size={14} color={GRAY} />
            <Text style={styles.docMetaText}>{doctor.location}</Text>
          </View>
          <View
            style={[
              styles.availPill,
              { backgroundColor: doctor.available ? "#DCFCE7" : "#F1F5F9" },
            ]}
          >
            <View
              style={[
                styles.availDot,
                { backgroundColor: doctor.available ? "#16A34A" : "#94A3B8" },
              ]}
            />
            <Text
              style={[
                styles.availText,
                { color: doctor.available ? "#16A34A" : "#64748B" },
              ]}
            >
              {doctor.available
                ? "Available for booking"
                : "Currently unavailable"}
            </Text>
          </View>
        </View>

        {/* Appointment Type */}
        <Text style={styles.sectionTitle}>Type</Text>
        <View style={styles.typeRow}>
          {(
            [
              ["in_clinic", "In-Clinic Visit", "local-hospital"],
              ["video", "Video Call", "videocam"],
            ] as const
          ).map(([val, label, icon]) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.typeBtn,
                selectedType === val && styles.typeBtnActive,
              ]}
              onPress={() => setSelectedType(val)}
            >
              <MaterialIcons
                name={icon as any}
                size={18}
                color={selectedType === val ? "#fff" : GRAY}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.typeBtnText,
                  selectedType === val && styles.typeBtnTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Picker */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Text style={styles.monthLabel}>{selectedDay.month}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
        >
          {days.map((d) => {
            const isSelected = d.iso === selectedDay.iso;
            return (
              <TouchableOpacity
                key={d.iso}
                style={[styles.dateBox, isSelected && styles.dateBoxActive]}
                onPress={() => {
                  setSelectedDay(d);
                  setSelectedSlot(null);
                }}
              >
                <Text
                  style={[styles.dateDay, isSelected && styles.dateDayActive]}
                >
                  {d.label}
                </Text>
                <Text
                  style={[styles.dateNum, isSelected && styles.dateNumActive]}
                >
                  {d.num}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Slots */}
        {[
          ["MORNING", MORNING_SLOTS],
          ["AFTERNOON", AFTERNOON_SLOTS],
          ["EVENING", EVENING_SLOTS],
        ].map(([label, slots]) => (
          <View key={label as string}>
            <Text style={styles.slotLabel}>{label as string}</Text>
            <View style={styles.slotsGrid}>
              {(slots as string[]).map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slotBtn,
                    selectedSlot === slot && styles.slotBtnActive,
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selectedSlot === slot && styles.slotTextActive,
                    ]}
                  >
                    {displaySlot(slot)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <MaterialIcons
              name="person"
              size={18}
              color={PRIMARY}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.summaryLabel}>Doctor</Text>
            <Text style={styles.summaryValue}>{doctor.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialIcons
              name="calendar-today"
              size={18}
              color={PRIMARY}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{selectedDay.iso}</Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialIcons
              name="access-time"
              size={18}
              color={PRIMARY}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>
              {selectedSlot ? displaySlot(selectedSlot) : "Not selected"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialIcons
              name="medical-services"
              size={18}
              color={PRIMARY}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={styles.summaryValue}>
              {selectedType === "video" ? "Video Call" : "In-Clinic"}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (!doctor.available || booking) && { opacity: 0.6 },
            ]}
            onPress={handleConfirm}
            disabled={!doctor.available || booking}
          >
            {booking ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.confirmBtnText}>
                {doctor.available
                  ? "Confirm Appointment"
                  : "Doctor Unavailable"}
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.policyText}>
            Free cancellation up to 24 hours before the appointment.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FA" },
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
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: PRIMARY },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 15, color: GRAY },
  backLink: { marginTop: 8 },
  backLinkText: { color: PRIMARY, fontSize: 15, fontWeight: "600" },
  content: { padding: 16, paddingBottom: 40 },
  doctorCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BORDER,
  },
  docAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E6F2F4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  docAvatarText: { fontSize: 28, fontWeight: "700", color: PRIMARY },
  specPill: {
    backgroundColor: "#E6F2F4",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  specText: { color: PRIMARY, fontSize: 12, fontWeight: "700" },
  doctorName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
  },
  docMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  docMetaText: { fontSize: 13, color: GRAY },
  availPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    marginTop: 10,
  },
  availDot: { width: 8, height: 8, borderRadius: 4 },
  availText: { fontSize: 12, fontWeight: "600" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  monthLabel: { fontSize: 13, color: PRIMARY, fontWeight: "600" },
  typeRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: "#fff",
  },
  typeBtnActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  typeBtnText: { fontSize: 14, fontWeight: "600", color: GRAY },
  typeBtnTextActive: { color: "#fff" },
  dateScroll: { marginBottom: 24 },
  dateBox: {
    width: 64,
    height: 80,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dateBoxActive: { backgroundColor: DARK_TEAL, borderColor: DARK_TEAL },
  dateDay: { fontSize: 11, fontWeight: "600", color: GRAY, marginBottom: 4 },
  dateDayActive: { color: "#B2D8DC" },
  dateNum: { fontSize: 22, fontWeight: "700", color: "#111" },
  dateNumActive: { color: "#fff" },
  slotLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: GRAY,
    letterSpacing: 1,
    marginBottom: 10,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  slotBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BORDER,
  },
  slotBtnActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  slotText: { fontSize: 13, color: "#333", fontWeight: "500" },
  slotTextActive: { color: "#fff", fontWeight: "700" },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  summaryLabel: { flex: 1, fontSize: 14, color: GRAY },
  summaryValue: { fontSize: 14, fontWeight: "600", color: "#111" },
  confirmBtn: {
    backgroundColor: DARK_TEAL,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  policyText: { fontSize: 11, color: GRAY, textAlign: "center" },
});
