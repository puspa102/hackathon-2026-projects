import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';

import { useAuth } from '@/services/AuthContext';
import { authStorage } from '@/services/storage';
import { API_BASE_URL } from '@/services/config';

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND = '#16a085';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DoctorProfileFields {
  specialization: string;
  license_number: string;
  hospital: string;
  experience_years: number | string | null;
  bio: string;
  consultation_fee: number | string | null;
}

interface DoctorUser {
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
  doctor_profile: DoctorProfileFields | null;
}

interface EditForm {
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  address: string;
  specialization: string;
  license_number: string;
  hospital: string;
  experience_years: string;
  bio: string;
  consultation_fee: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string): string {
  const f = first?.trim()?.[0] ?? '';
  const l = last?.trim()?.[0] ?? '';
  return `${f}${l}`.toUpperCase();
}

function buildFormFromUser(u: DoctorUser): EditForm {
  const dp = u.doctor_profile;
  return {
    first_name: u.first_name ?? '',
    last_name: u.last_name ?? '',
    phone: u.phone ?? '',
    gender: u.gender ?? '',
    date_of_birth: u.date_of_birth ?? '',
    address: u.address ?? '',
    specialization: dp?.specialization ?? '',
    license_number: dp?.license_number ?? '',
    hospital: dp?.hospital ?? '',
    experience_years: dp?.experience_years != null ? String(dp.experience_years) : '',
    bio: dp?.bio ?? '',
    consultation_fee: dp?.consultation_fee != null ? String(dp.consultation_fee) : '',
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DoctorProfileScreen() {
  const { state, logout } = useAuth();

  const [user, setUser] = useState<DoctorUser | null>(
    state.user ? (state.user as unknown as DoctorUser) : null
  );
  const [form, setForm] = useState<EditForm>(() =>
    state.user ? buildFormFromUser(state.user as unknown as DoctorUser) : buildFormFromUser({} as DoctorUser)
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const applyUser = useCallback((u: DoctorUser) => {
    setUser(u);
    setForm(buildFormFromUser(u));
  }, []);

  useEffect(() => {
    // Show cached data immediately
    if (state.user) {
      applyUser(state.user as unknown as DoctorUser);
    }

    // Fetch fresh data from API
    const loadProfile = async () => {
      try {
        const token = await authStorage.getToken();
        const res = await fetch(`${API_BASE_URL}/accounts/profile/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data: DoctorUser = await res.json();
        applyUser(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save handler ────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await authStorage.getToken();

      const body = {
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        gender: form.gender,
        date_of_birth: form.date_of_birth || null,
        address: form.address,
        doctor_profile: {
          specialization: form.specialization,
          license_number: form.license_number,
          hospital: form.hospital,
          experience_years: form.experience_years !== '' ? Number(form.experience_years) : null,
          bio: form.bio,
          consultation_fee: form.consultation_fee !== '' ? Number(form.consultation_fee) : null,
        },
      };

      const res = await fetch(`${API_BASE_URL}/accounts/profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? err.message ?? 'Update failed');
      }

      const updated: DoctorUser = await res.json();
      applyUser(updated);
      await authStorage.setUserData(updated);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Logout handler ──────────────────────────────────────────────────────────

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  // ── Derived values ──────────────────────────────────────────────────────────

  const dp = user?.doctor_profile ?? null;
  const fullName = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();
  const initials = getInitials(user?.first_name ?? '', user?.last_name ?? '');

  // ── Loading state (no cached user yet) ─────────────────────────────────────

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BRAND} />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerBrand}>Arogya</Text>
        <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
          <MaterialIcons name="notifications-none" size={26} color="#475569" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Avatar Hero Card ── */}
          <View style={styles.heroCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || 'DR'}</Text>
            </View>
            <Text style={styles.heroName}>
              {fullName ? `Dr. ${fullName}` : 'Dr. —'}
            </Text>
            {dp?.specialization ? (
              <Text style={styles.heroSpec}>{dp.specialization}</Text>
            ) : null}
            {user?.email ? (
              <Text style={styles.heroEmail}>{user.email}</Text>
            ) : null}

            {/* Credential badge row */}
            {(dp?.license_number || dp?.hospital) ? (
              <View style={styles.badgeRow}>
                {dp.license_number ? (
                  <View style={styles.credBadge}>
                    <MaterialIcons name="verified-user" size={13} color={BRAND} />
                    <Text style={styles.credBadgeText}>{dp.license_number}</Text>
                  </View>
                ) : null}
                {dp.hospital ? (
                  <View style={styles.credBadge}>
                    <MaterialIcons name="local-hospital" size={13} color={BRAND} />
                    <Text style={styles.credBadgeText}>{dp.hospital}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* Refresh spinner while updating in background */}
          {loading && user ? (
            <ActivityIndicator size="small" color={BRAND} style={styles.refreshSpinner} />
          ) : null}

          {/* ══════════════════════════════════════════
               VIEW MODE
          ══════════════════════════════════════════ */}
          {!editing ? (
            <>
              {/* Professional Info */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Professional Info</Text>
                <InfoRow label="Full Name"         value={fullName ? `Dr. ${fullName}` : null} />
                <InfoRow label="Specialization"    value={dp?.specialization} />
                <InfoRow label="License Number"    value={dp?.license_number} />
                <InfoRow label="Hospital"          value={dp?.hospital} />
                <InfoRow
                  label="Experience"
                  value={dp?.experience_years != null ? `${dp.experience_years} years` : null}
                />
                <InfoRow
                  label="Consultation Fee"
                  value={dp?.consultation_fee != null ? `₹${dp.consultation_fee}` : null}
                  last
                />
              </View>

              {/* Personal Info */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Personal Info</Text>
                <InfoRow label="Email"        value={user?.email} />
                <InfoRow label="Phone"        value={user?.phone} />
                <InfoRow label="Gender"       value={user?.gender} />
                <InfoRow label="Date of Birth" value={user?.date_of_birth} />
                <InfoRow label="Address"      value={user?.address} />
                <InfoRow label="Bio"          value={dp?.bio} last />
              </View>

              {/* Actions */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setEditing(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={handleLogout}
                activeOpacity={0.85}
              >
                <Text style={styles.signOutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* ══════════════════════════════════════════
                EDIT MODE
            ══════════════════════════════════════════ */
            <>
              {/* Professional Info (editable) */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Professional Info</Text>
                <InputField
                  label="First Name"
                  value={form.first_name}
                  onChangeText={v => setForm(f => ({ ...f, first_name: v }))}
                />
                <InputField
                  label="Last Name"
                  value={form.last_name}
                  onChangeText={v => setForm(f => ({ ...f, last_name: v }))}
                />
                <InputField
                  label="Specialization"
                  value={form.specialization}
                  onChangeText={v => setForm(f => ({ ...f, specialization: v }))}
                />
                <InputField
                  label="License Number"
                  value={form.license_number}
                  onChangeText={v => setForm(f => ({ ...f, license_number: v }))}
                />
                <InputField
                  label="Hospital"
                  value={form.hospital}
                  onChangeText={v => setForm(f => ({ ...f, hospital: v }))}
                />
                <InputField
                  label="Experience (years)"
                  value={form.experience_years}
                  onChangeText={v => setForm(f => ({ ...f, experience_years: v }))}
                  keyboardType="numeric"
                />
                <InputField
                  label="Consultation Fee (₹)"
                  value={form.consultation_fee}
                  onChangeText={v => setForm(f => ({ ...f, consultation_fee: v }))}
                  keyboardType="numeric"
                  last
                />
              </View>

              {/* Personal Info (editable) */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Personal Info</Text>
                <InputField
                  label="Phone"
                  value={form.phone}
                  onChangeText={v => setForm(f => ({ ...f, phone: v }))}
                  keyboardType="phone-pad"
                />
                <InputField
                  label="Gender"
                  value={form.gender}
                  onChangeText={v => setForm(f => ({ ...f, gender: v }))}
                  placeholder="e.g. Male / Female / Other"
                />
                <InputField
                  label="Date of Birth"
                  value={form.date_of_birth}
                  onChangeText={v => setForm(f => ({ ...f, date_of_birth: v }))}
                  placeholder="YYYY-MM-DD"
                />
                <InputField
                  label="Address"
                  value={form.address}
                  onChangeText={v => setForm(f => ({ ...f, address: v }))}
                  multiline
                />
                <InputField
                  label="Bio"
                  value={form.bio}
                  onChangeText={v => setForm(f => ({ ...f, bio: v }))}
                  multiline
                  last
                />
              </View>

              {/* Save */}
              <TouchableOpacity
                style={[styles.primaryBtn, saving && styles.disabledBtn]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>

              {/* Cancel */}
              <TouchableOpacity
                style={[styles.cancelBtn, saving && styles.disabledBtn]}
                onPress={() => {
                  setEditing(false);
                  if (user) setForm(buildFormFromUser(user));
                }}
                disabled={saving}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value?: string | number | null;
  last?: boolean;
}) {
  const display =
    value != null && String(value).trim() !== '' ? String(value) : '—';
  return (
    <View style={[infoStyles.row, last && infoStyles.rowLast]}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value} numberOfLines={4}>
        {display}
      </Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLast: { borderBottomWidth: 0 },
  label: { fontSize: 13, color: '#64748B', fontWeight: '500', flex: 1.1 },
  value: { fontSize: 14, color: '#0F172A', fontWeight: '600', flex: 1.9, textAlign: 'right' },
});

// ─────────────────────────────────────────────────────────────────────────────

function InputField({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
  placeholder,
  last = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  multiline?: boolean;
  placeholder?: string;
  last?: boolean;
}) {
  return (
    <View style={[inputStyles.group, last && inputStyles.groupLast]}>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        style={[inputStyles.input, multiline && inputStyles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={placeholder ?? label}
        placeholderTextColor="#94A3B8"
        textAlignVertical={multiline ? 'top' : 'center'}
        autoCapitalize="none"
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  group: { marginBottom: 14 },
  groupLast: { marginBottom: 0 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FAFBFC',
  },
  inputMultiline: {
    minHeight: 88,
    paddingTop: 11,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 15, color: '#64748B' },

  // ── Header ────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBrand: {
    fontSize: 22,
    fontWeight: '800',
    color: BRAND,
    letterSpacing: -0.3,
  },
  headerIconBtn: { padding: 4 },

  // ── Scroll ────────────────────────────────────────────────────────
  scroll: { flex: 1, backgroundColor: '#f4f6f8' },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 48,
  },

  refreshSpinner: { marginBottom: 10 },

  // ── Hero Card ─────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 5,
    textAlign: 'center',
  },
  heroSpec: {
    fontSize: 15,
    color: BRAND,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  heroEmail: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 16,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  credBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8F8F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  credBadgeText: {
    fontSize: 12,
    color: BRAND,
    fontWeight: '600',
  },

  // ── Info / Edit Card ──────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  // ── Buttons ───────────────────────────────────────────────────────
  primaryBtn: {
    backgroundColor: BRAND,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  disabledBtn: { opacity: 0.55 },

  cancelBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },

  signOutBtn: {
    borderWidth: 1.5,
    borderColor: '#e74c3c',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  signOutBtnText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '700',
  },
});
