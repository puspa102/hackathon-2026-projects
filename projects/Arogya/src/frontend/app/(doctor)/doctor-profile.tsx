import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { authStorage } from "@/services/storage";
import { API_BASE_URL } from "@/services/config";

const PRIMARY = "#2A7B88";
const DARK_TEAL = "#1B5C66";
const LIGHT_TEAL = "#E6F2F4";
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

function getInitials(name: string): string {
  return name
    .replace("Dr. ", "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function DoctorProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const doctorId = params.doctorId ? Number(params.doctorId) : null;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.canGoBack() && router.back()}
            style={{ marginRight: 10 }}
          >
            <MaterialIcons name="arrow-back" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doctor Profile</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  if (!doctor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.canGoBack() && router.back()}
            style={{ marginRight: 10 }}
          >
            <MaterialIcons name="arrow-back" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doctor Profile</Text>
        </View>
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={48} color="#CBD5E1" />
          <Text style={styles.emptyText}>Doctor not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = getInitials(doctor.name);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() && router.back()}
          style={{ marginRight: 10 }}
        >
          <MaterialIcons name="arrow-back" size={24} color={PRIMARY} />
        </TouchableOpacity>
        <View
          style={[
            styles.logo,
            { alignItems: "center", justifyContent: "center" },
          ]}
        >
          <MaterialIcons name="local-hospital" size={18} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Arogya</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.docAvatar}>
            <Text style={styles.docAvatarText}>{initials}</Text>
          </View>
          <View
            style={[
              styles.verifiedBadge,
              { borderColor: doctor.available ? "#2ECC71" : "#94A3B8" },
            ]}
          >
            <Text
              style={[
                styles.verifiedText,
                { color: doctor.available ? "#2ECC71" : "#94A3B8" },
              ]}
            >
              {doctor.available ? "✔ Available" : "✘ Unavailable"}
            </Text>
          </View>
        </View>

        <Text style={styles.docName}>{doctor.name}</Text>
        <View style={styles.specPill}>
          <Text style={styles.specText}>{doctor.specialization}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="local-hospital"
              size={18}
              color={PRIMARY}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.infoText}>{doctor.hospital}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="location-on"
              size={18}
              color={PRIMARY}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.infoText}>{doctor.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="phone"
              size={18}
              color={PRIMARY}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.infoText}>{doctor.phone}</Text>
          </View>
          {doctor.email && (
            <View style={styles.infoRow}>
              <MaterialIcons
                name="email"
                size={18}
                color={PRIMARY}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.infoText}>{doctor.email}</Text>
            </View>
          )}
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          {doctor.name} is a specialist in {doctor.specialization} at{" "}
          {doctor.hospital}. Located in {doctor.location}, they are currently{" "}
          {doctor.available
            ? "accepting new patients"
            : "not available for new bookings"}
          .
        </Text>

        {/* Specialties */}
        <Text style={styles.sectionTitle}>Specialization</Text>
        <View style={styles.tagsRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{doctor.specialization}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() =>
            router.push({
              pathname: "/(doctor)/chat" as any,
              params: { doctorId: doctor.id },
            })
          }
        >
          <Text style={styles.chatBtnText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.bookBtn,
            !doctor.available && { backgroundColor: "#94A3B8" },
          ]}
          disabled={!doctor.available}
          onPress={() =>
            router.push({
              pathname: "/(doctor)/doctor-booking" as any,
              params: { doctorId: doctor.id },
            })
          }
        >
          <Text style={styles.bookBtnText}>
            {doctor.available ? "Book Appointment" : "Unavailable"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomColor: BORDER,
    borderBottomWidth: 1,
    backgroundColor: "#fff",
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 8,
    borderRadius: 14,
    backgroundColor: PRIMARY,
  },
  headerTitle: { fontWeight: "bold", fontSize: 18, color: PRIMARY, flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: { fontSize: 16, color: GRAY },
  scrollContent: { padding: 20, paddingBottom: 120 },
  avatarContainer: { alignItems: "center", marginBottom: 12 },
  docAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: LIGHT_TEAL,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  docAvatarText: { fontSize: 36, fontWeight: "700", color: PRIMARY },
  verifiedBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    backgroundColor: "#F6FFF8",
  },
  verifiedText: { fontWeight: "bold", fontSize: 13 },
  docName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 8,
  },
  specPill: {
    backgroundColor: LIGHT_TEAL,
    alignSelf: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 20,
  },
  specText: { color: PRIMARY, fontSize: 13, fontWeight: "700" },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoText: { fontSize: 14, color: "#333", flex: 1 },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
    marginBottom: 8,
    marginTop: 4,
  },
  aboutText: { color: GRAY, fontSize: 14, marginBottom: 16, lineHeight: 22 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  tag: {
    backgroundColor: LIGHT_TEAL,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: { color: PRIMARY, fontWeight: "bold", fontSize: 13 },
  bottomRow: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: LIGHT_TEAL,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 8,
  },
  chatBtnText: { color: PRIMARY, fontWeight: "bold", fontSize: 15 },
  bookBtn: {
    flex: 2,
    backgroundColor: DARK_TEAL,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginLeft: 8,
  },
  bookBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});
