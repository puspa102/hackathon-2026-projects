import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useAuth } from "@/services/AuthContext";
import { authStorage } from "@/services/storage";
import { fetchProfile, updateProfile } from "@/services/profile";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientProfile {
  blood_group: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  allergies: string;
  medical_conditions: string;
}

interface FullUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  gender: string;
  date_of_birth: string;
  address: string;
  patient_profile: PatientProfile | null;
  doctor_profile: any | null;
}

interface EditableFields {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  address: string;
  blood_group: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  allergies: string;
  medical_conditions: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BRAND = "#2A7B88";
const BRAND_LIGHT = "#EAF3FA";
const DANGER = "#e74c3c";
const GREY = "#7f8c8d";
const CARD_BG = "#ffffff";
const SCREEN_BG = "#f4f6f8";

function displayValue(val: string | null | undefined): string {
  if (!val || val.trim() === "") return "—";
  return val;
}

function formatGender(val: string | null | undefined): string {
  if (!val) return "—";
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
}

function formatDob(val: string | null | undefined): string {
  if (!val) return "—";
  try {
    const [year, month, day] = val.split("-");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
  } catch {
    return val;
  }
}

function buildEditableFields(user: FullUser): EditableFields {
  const pp = user.patient_profile;
  return {
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    gender: user.gender ?? "",
    date_of_birth: user.date_of_birth ?? "",
    address: user.address ?? "",
    blood_group: pp?.blood_group ?? "",
    emergency_contact_name: pp?.emergency_contact_name ?? "",
    emergency_contact_phone: pp?.emergency_contact_phone ?? "",
    allergies: pp?.allergies ?? "",
    medical_conditions: pp?.medical_conditions ?? "",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Header({ onBell }: { onBell: () => void }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerBrand}>Arogya</Text>
      <TouchableOpacity
        onPress={onBell}
        style={styles.bellBtn}
        activeOpacity={0.7}
      >
        <MaterialIcons name="notifications-none" size={26} color="#2c3e50" />
      </TouchableOpacity>
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  last?: boolean;
}

function InfoRow({ label, value, last = false }: InfoRowProps) {
  return (
    <>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {!last && <View style={styles.rowDivider} />}
    </>
  );
}

interface InputRowProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  multiline?: boolean;
  last?: boolean;
}

function InputRow({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  last = false,
}: InputRowProps) {
  return (
    <>
      <View style={[styles.inputRow, multiline && styles.inputRowMulti]}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          style={[styles.textInput, multiline && styles.textInputMulti]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
          placeholderTextColor="#bdc3c7"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          autoCapitalize={
            keyboardType === "email-address" ? "none" : "sentences"
          }
        />
      </View>
      {!last && <View style={styles.rowDivider} />}
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { state, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<FullUser | null>(
    state.user ? (state.user as unknown as FullUser) : null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fields, setFields] = useState<EditableFields | null>(null);

  // ── Load fresh profile from API ──
  const loadProfile = useCallback(async () => {
    try {
      const data: FullUser = await fetchProfile();
      setProfile(data);
      // Keep AsyncStorage in sync
      await authStorage.setUserData(data);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ── Enter edit mode ──
  const handleEditPress = () => {
    if (!profile) return;
    setFields(buildEditableFields(profile));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFields(null);
    setIsEditing(false);
  };

  // ── Save changes ──
  const handleSave = async () => {
    if (!fields) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        first_name: fields.first_name,
        last_name: fields.last_name,
        email: fields.email,
        phone: fields.phone,
        gender: fields.gender,
        date_of_birth: fields.date_of_birth || null,
        address: fields.address,
        patient_profile: {
          blood_group: fields.blood_group,
          emergency_contact_name: fields.emergency_contact_name,
          emergency_contact_phone: fields.emergency_contact_phone,
          allergies: fields.allergies,
          medical_conditions: fields.medical_conditions,
        },
      };

      const updated: FullUser = await updateProfile(payload);
      setProfile(updated);
      await authStorage.setUserData(updated);
      setIsEditing(false);
      setFields(null);
      Alert.alert("Success", "Profile updated successfully.");
    } catch (err: any) {
      Alert.alert("Save Failed", err?.message ?? "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // ── Sign out ──
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  // ── Field updater ──
  const setField = (key: keyof EditableFields) => (val: string) => {
    setFields((prev) => (prev ? { ...prev, [key]: val } : prev));
  };

  // ─── Derived display values ────────────────────────────────────────────────
  const fullName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
      profile.username
    : "Loading…";

  const initials = profile
    ? `${(profile.first_name ?? "")[0] ?? ""}${(profile.last_name ?? "")[0] ?? ""}`.toUpperCase() ||
      (profile.username ?? "?")[0].toUpperCase()
    : "?";

  const pp = profile?.patient_profile;

  // ─── Loading state ─────────────────────────────────────────────────────────
  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Header onBell={() => {}} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BRAND} />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Edit Mode ─────────────────────────────────────────────────────────────
  if (isEditing && fields) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Header onBell={() => {}} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Edit Avatar */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
              <Text style={styles.editModeTitle}>Edit Profile</Text>
              <Text style={styles.editModeSubtitle}>
                Update your personal and health information
              </Text>
            </View>

            {/* Personal Info Inputs */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="person" size={18} color={BRAND} />
                <Text style={styles.sectionTitle}>Personal Info</Text>
              </View>
              <InputRow
                label="First Name"
                value={fields.first_name}
                onChangeText={setField("first_name")}
              />
              <InputRow
                label="Last Name"
                value={fields.last_name}
                onChangeText={setField("last_name")}
              />
              <InputRow
                label="Email"
                value={fields.email}
                onChangeText={setField("email")}
                keyboardType="email-address"
              />
              <InputRow
                label="Phone"
                value={fields.phone}
                onChangeText={setField("phone")}
                keyboardType="phone-pad"
              />
              <InputRow
                label="Gender"
                value={fields.gender}
                onChangeText={setField("gender")}
                placeholder="e.g. male, female, other"
              />
              <InputRow
                label="Date of Birth"
                value={fields.date_of_birth}
                onChangeText={setField("date_of_birth")}
                placeholder="YYYY-MM-DD"
              />
              <InputRow
                label="Address"
                value={fields.address}
                onChangeText={setField("address")}
                multiline
                last
              />
            </View>

            {/* Health Info Inputs */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="favorite" size={18} color={BRAND} />
                <Text style={styles.sectionTitle}>Health Info</Text>
              </View>
              <InputRow
                label="Blood Group"
                value={fields.blood_group}
                onChangeText={setField("blood_group")}
                placeholder="e.g. A+, O-"
              />
              <InputRow
                label="Emergency Contact"
                value={fields.emergency_contact_name}
                onChangeText={setField("emergency_contact_name")}
              />
              <InputRow
                label="Emergency Phone"
                value={fields.emergency_contact_phone}
                onChangeText={setField("emergency_contact_phone")}
                keyboardType="phone-pad"
              />
              <InputRow
                label="Allergies"
                value={fields.allergies}
                onChangeText={setField("allergies")}
                multiline
                placeholder="List any known allergies"
              />
              <InputRow
                label="Medical Conditions"
                value={fields.medical_conditions}
                onChangeText={setField("medical_conditions")}
                multiline
                placeholder="List any chronic conditions"
                last
              />
            </View>

            {/* Save / Cancel */}
            <TouchableOpacity
              style={[styles.primaryBtn, saving && styles.primaryBtnDisabled]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancelEdit}
              activeOpacity={0.8}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── View Mode ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header onBell={() => {}} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading overlay indicator (refresh) */}
        {loading && (
          <View style={styles.refreshingBadge}>
            <ActivityIndicator size="small" color={BRAND} />
            <Text style={styles.refreshingText}>Refreshing…</Text>
          </View>
        )}

        {/* ── Avatar + Identity ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {profile?.role
                ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                : "Patient"}
            </Text>
          </View>
          <Text style={styles.profileEmail}>
            {displayValue(profile?.email)}
          </Text>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialIcons name="badge" size={22} color={BRAND} />
            <Text style={styles.statLabel}>Role</Text>
            <Text style={styles.statValue}>
              {profile?.role
                ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                : "Patient"}
            </Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="calendar-today" size={22} color={BRAND} />
            <Text style={styles.statLabel}>Member Since</Text>
            <Text style={styles.statValue}>2024</Text>
          </View>
        </View>

        {/* ── Personal Info Section ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person-outline" size={18} color={BRAND} />
            <Text style={styles.sectionTitle}>Personal Info</Text>
          </View>
          <InfoRow
            label="Full Name"
            value={displayValue(fullName === "Loading…" ? null : fullName)}
          />
          <InfoRow label="Email" value={displayValue(profile?.email)} />
          <InfoRow label="Phone" value={displayValue(profile?.phone)} />
          <InfoRow label="Gender" value={formatGender(profile?.gender)} />
          <InfoRow
            label="Date of Birth"
            value={formatDob(profile?.date_of_birth)}
          />
          <InfoRow
            label="Address"
            value={displayValue(profile?.address)}
            last
          />
        </View>

        {/* ── Health Info Section ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="favorite-border" size={18} color={BRAND} />
            <Text style={styles.sectionTitle}>Health Info</Text>
          </View>
          <InfoRow label="Blood Group" value={displayValue(pp?.blood_group)} />
          <InfoRow
            label="Emergency Contact"
            value={displayValue(pp?.emergency_contact_name)}
          />
          <InfoRow
            label="Emergency Phone"
            value={displayValue(pp?.emergency_contact_phone)}
          />
          <InfoRow label="Allergies" value={displayValue(pp?.allergies)} />
          <InfoRow
            label="Medical Conditions"
            value={displayValue(pp?.medical_conditions)}
            last
          />
        </View>

        {/* ── Edit Profile Button ── */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleEditPress}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="edit"
            size={18}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.primaryBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* ── Sign Out Button ── */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="logout"
            size={18}
            color={DANGER}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.signOutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  headerBrand: {
    fontSize: 22,
    fontWeight: "800",
    color: BRAND,
    letterSpacing: -0.5,
  },
  bellBtn: {
    padding: 4,
  },

  // ── Scroll / Layout ──
  scrollView: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: GREY,
  },
  bottomSpacer: {
    height: 8,
  },

  // ── Refreshing badge ──
  refreshingBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    backgroundColor: BRAND_LIGHT,
    borderRadius: 10,
  },
  refreshingText: {
    fontSize: 13,
    color: BRAND,
    fontWeight: "500",
  },

  // ── Avatar Section ──
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  roleBadge: {
    backgroundColor: BRAND_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BRAND,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: BRAND,
  },
  profileEmail: {
    fontSize: 14,
    color: GREY,
    fontWeight: "400",
  },

  // ── Edit Mode Title ──
  editModeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 4,
  },
  editModeSubtitle: {
    fontSize: 13,
    color: GREY,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // ── Stats Row ──
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: GREY,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2c3e50",
  },

  // ── Section Cards ──
  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2c3e50",
    letterSpacing: -0.2,
  },

  // ── Info Rows (View Mode) ──
  infoRow: {
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: GREY,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2c3e50",
    lineHeight: 20,
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#ecf0f1",
  },

  // ── Input Rows (Edit Mode) ──
  inputRow: {
    paddingVertical: 10,
  },
  inputRowMulti: {
    paddingBottom: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: GREY,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  textInput: {
    fontSize: 15,
    fontWeight: "500",
    color: "#2c3e50",
    borderWidth: 1,
    borderColor: "#dfe6e9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9fafb",
  },
  textInputMulti: {
    minHeight: 72,
    textAlignVertical: "top",
    paddingTop: 10,
  },

  // ── Primary Button ──
  primaryBtn: {
    backgroundColor: BRAND,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.2,
  },

  // ── Cancel Button ──
  cancelBtn: {
    backgroundColor: "#ecf0f1",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7f8c8d",
  },

  // ── Sign Out Button ──
  signOutBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: DANGER,
    backgroundColor: "#fff5f5",
  },
  signOutBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: DANGER,
    letterSpacing: 0.2,
  },
});
