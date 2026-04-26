import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const BLUE = '#2A7B88';
const BORDER = '#E5E7EB';
const GRAY = '#7A8CA3';
const GREEN = '#E6F2F4';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.headerAvatar} 
          />
          <Text style={styles.headerTitle}>CareLoop</Text>
        </View>
        <MaterialIcons name="notifications-none" size={24} color="#333" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingHeader}>
          <View>
            <Text style={styles.greetingTitle}>Dashboard</Text>
            <Text style={styles.greetingSub}>Welcome back, Sarah</Text>
          </View>
          <TouchableOpacity style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>Oct 25, 2024</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStatBox}>
            <Text style={styles.quickStatValue}>92%</Text>
            <Text style={styles.quickStatLabel}>Health</Text>
          </View>
          <View style={styles.quickStatBox}>
            <Text style={styles.quickStatValue}>12</Text>
            <Text style={styles.quickStatLabel}>Tasks</Text>
          </View>
          <View style={styles.quickStatBox}>
            <Text style={styles.quickStatValue}>3</Text>
            <Text style={styles.quickStatLabel}>Meds</Text>
          </View>
        </View>

        {/* Next Medication */}
        <View style={styles.card}>
          <View style={styles.medicationHeader}>
            <Text style={styles.medicationLabel}>UPCOMING MEDICATION</Text>
            <View style={styles.timeTag}>
              <MaterialIcons name="schedule" size={14} color={BLUE} />
              <Text style={styles.timeTagText}>10:30 AM</Text>
            </View>
          </View>
          <Text style={styles.medicationName}>Lisinopril 10mg</Text>
          <Text style={styles.medicationSub}>1 Capsule • After Breakfast</Text>
          <TouchableOpacity style={styles.primaryButton}>
            <MaterialIcons name="check-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Confirm Intake</Text>
          </TouchableOpacity>
        </View>

        {/* Recovery Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconBg}>
            <MaterialIcons name="auto-graph" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.statusLabel}>Recovery Progress</Text>
            <Text style={styles.statusValue}>Normal • 82% Stable</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={BLUE} />
        </View>

        {/* Today's Check-in */}
        <View style={styles.cardRow}>
          <View style={styles.checkinIconBg}>
            <MaterialIcons name="assignment" size={20} color="#333" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.checkinLabel}>Today{"'"}s Check-in</Text>
            <Text style={styles.checkinValue}>Pending</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/daily-checkin')}>
            <Text style={styles.linkText}>Start</Text>
          </TouchableOpacity>
        </View>

        {/* Vitals History */}
        <View style={styles.card}>
          <View style={styles.vitalsHeader}>
            <Text style={styles.cardTitle}>Vitals History</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>View Details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.vitalsRow}>
            <View style={styles.vitalBox}>
              <Text style={styles.vitalLabel}>Heart Rate</Text>
              <Text style={styles.vitalValue}>72 <Text style={styles.vitalUnit}>bpm</Text></Text>
            </View>
            <View style={styles.vitalBox}>
              <Text style={styles.vitalLabel}>Blood Pressure</Text>
              <Text style={styles.vitalValue}>120/80 <Text style={styles.vitalUnit}>mmHg</Text></Text>
            </View>
          </View>
        </View>

        {/* Message from Doctor */}
        <View style={styles.messageCard}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/44.jpg' }} 
            style={styles.doctorAvatar} 
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.messageTitle}>Message from Dr. Miller</Text>
            <Text style={styles.messageText}>{"\""}Great progress on your walking goals this week, Sarah. Keep it up!{"\""}</Text>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* EMERGENCY BUTTON */}
      <TouchableOpacity style={styles.emergencyBtn}>
        <MaterialIcons name="emergency" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.emergencyBtnText}>EMERGENCY</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFBFD' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FAFBFD'
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: BLUE },
  
  scrollContent: { padding: 20, paddingBottom: 40 },
  greetingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greetingTitle: { fontSize: 26, fontWeight: 'bold', color: '#111' },
  greetingSub: { fontSize: 14, color: '#666', marginTop: 2 },
  dateBadge: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: BORDER },
  dateBadgeText: { fontSize: 12, color: BLUE, fontWeight: 'bold' },
  
  quickStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  quickStatBox: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 16, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: BORDER },
  quickStatValue: { fontSize: 18, fontWeight: 'bold', color: BLUE, marginBottom: 4 },
  quickStatLabel: { fontSize: 11, color: GRAY, fontWeight: 'bold' },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  medicationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  medicationLabel: { fontSize: 12, fontWeight: 'bold', color: BLUE, letterSpacing: 1 },
  timeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F2F4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  timeTagText: { fontSize: 12, color: BLUE, fontWeight: 'bold', marginLeft: 4 },
  medicationName: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  medicationSub: { fontSize: 14, color: GRAY, marginBottom: 16 },
  primaryButton: { backgroundColor: BLUE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  statusCard: { backgroundColor: GREEN, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#B2D8DD' },
  statusIconBg: { backgroundColor: BLUE, width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusLabel: { fontSize: 13, color: BLUE, fontWeight: 'bold' },
  statusValue: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  
  cardRow: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  checkinIconBg: { backgroundColor: '#F0F2F5', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  checkinLabel: { fontSize: 13, color: GRAY },
  checkinValue: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  linkText: { color: BLUE, fontSize: 14, fontWeight: 'bold' },
  
  vitalsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  vitalsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  vitalBox: { backgroundColor: '#F8F9FB', borderRadius: 12, padding: 16, flex: 1, marginHorizontal: 4 },
  vitalLabel: { fontSize: 12, color: GRAY, marginBottom: 8, fontWeight: '500' },
  vitalValue: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  vitalUnit: { fontSize: 14, color: GRAY, fontWeight: 'normal' },
  
  messageCard: { backgroundColor: '#E6F2F4', borderRadius: 16, padding: 20, flexDirection: 'row', marginBottom: 16 },
  doctorAvatar: { width: 48, height: 48, borderRadius: 24 },
  messageTitle: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  messageText: { fontSize: 14, color: '#444', fontStyle: 'italic', lineHeight: 20 },
  
  emergencyBtn: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#D32F2F', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 30, shadowColor: '#D32F2F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  emergencyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
});
