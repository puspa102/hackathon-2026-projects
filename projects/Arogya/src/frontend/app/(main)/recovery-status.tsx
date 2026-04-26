import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const BLUE = '#2A7B88';
const LIGHT_TEAL = '#E6F2F4';
const RED = '#C62828';
const BG = '#F8F9FA';
const BORDER = '#E5E7EB';

export default function RecoveryStatusScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.headerAvatar} />
          <Text style={styles.headerTitle}>CareLoop</Text>
        </View>
        <MaterialIcons name="notifications-none" size={24} color="#333" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.greetingTitle}>Good Morning, Alex</Text>
        <Text style={styles.greetingSub}>Here is your recovery overview for today.</Text>

        <TouchableOpacity style={styles.emergencyBtn}>
          <MaterialIcons name="emergency" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.emergencyBtnText}>EMERGENCY SOS</Text>
        </TouchableOpacity>

        {/* Recovery Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="auto-graph" size={20} color={BLUE} style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Recovery Status</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NORMAL</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressValue}>82%</Text>
              <Text style={styles.progressLabel}>PROGRESS</Text>
            </View>
          </View>
          
          <View style={styles.goalBox}>
            <Text style={styles.goalLabel}>WEEKLY GOAL</Text>
            <Text style={styles.goalText}>Complete 15 physical therapy sessions. You{"'"}re on track!</Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>MOBILITY</Text>
              <Text style={styles.metricValue}>Great</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>PAIN LEVEL</Text>
              <Text style={styles.metricValue}>Low</Text>
            </View>
          </View>
        </View>

        {/* Next Medication Card */}
        <View style={styles.medCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MaterialIcons name="medication" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Next Medication</Text>
          </View>
          <Text style={styles.medTime}>10:30 AM</Text>
          <Text style={styles.medName}>Lisinopril • 10mg</Text>
          <TouchableOpacity style={styles.confirmBtn}>
            <Text style={styles.confirmBtnText}>Confirm Intake</Text>
          </TouchableOpacity>
          <Text style={styles.medFooterText}>TAKEN WITH WATER AFTER MEAL</Text>
        </View>

        {/* Vitals History */}
        <View style={styles.card}>
          <View style={styles.vitalsHeader}>
            <Text style={styles.cardTitle}>Vitals History</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.linkText}>View Detailed Trends</Text>
              <MaterialIcons name="chevron-right" size={16} color={BLUE} />
            </TouchableOpacity>
          </View>

          <View style={styles.vitalRow}>
            <MaterialIcons name="favorite" size={24} color={BLUE} style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.vitalLabel}>HEART RATE</Text>
              <Text style={styles.vitalValue}>72 <Text style={styles.vitalUnit}>BPM</Text></Text>
            </View>
            <Text style={styles.vitalStatus}>Normal</Text>
          </View>

          <View style={styles.vitalRow}>
            <MaterialIcons name="monitor-heart" size={24} color={BLUE} style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.vitalLabel}>BLOOD PRESSURE</Text>
              <Text style={styles.vitalValue}>118/75 <Text style={styles.vitalUnit}>mmHg</Text></Text>
            </View>
            <Text style={styles.vitalStatus}>Steady</Text>
          </View>
        </View>

        {/* Check-in */}
        <View style={styles.checkInContainer}>
          <View style={styles.checkInHeader}>
            <Text style={styles.checkInBannerText}>CHECK-IN</Text>
          </View>
          <View style={styles.checkInBody}>
            <Text style={styles.checkInTitle}>Daily Check-in</Text>
            <Text style={styles.checkInDesc}>How are you feeling after this morning{"'"}s session?</Text>
            
            <View style={styles.emojiRow}>
              {['sentiment-very-dissatisfied', 'sentiment-dissatisfied', 'sentiment-neutral', 'sentiment-satisfied-alt', 'sentiment-very-satisfied'].map((icon, idx) => (
                <TouchableOpacity key={idx} style={[styles.emojiBtn, idx === 3 && styles.emojiBtnActive]}>
                  <MaterialIcons name={icon as any} size={24} color={idx === 3 ? BLUE : '#777'} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.completeBtn} onPress={() => router.push('/daily-checkin')}>
              <Text style={styles.completeBtnText}>Complete Check-in</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff'
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: BLUE },
  
  scrollContent: { padding: 16, paddingBottom: 40 },
  greetingTitle: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  greetingSub: { fontSize: 14, color: '#555', marginTop: 4, marginBottom: 16 },
  
  emergencyBtn: { backgroundColor: RED, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emergencyBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  badge: { backgroundColor: LIGHT_TEAL, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: BLUE, letterSpacing: 0.5 },
  
  progressContainer: { alignItems: 'center', marginBottom: 24 },
  progressCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 8, borderColor: BLUE, alignItems: 'center', justifyContent: 'center', borderRightColor: LIGHT_TEAL },
  progressValue: { fontSize: 32, fontWeight: 'bold', color: '#111' },
  progressLabel: { fontSize: 10, color: '#666', fontWeight: 'bold', letterSpacing: 1, marginTop: 4 },
  
  goalBox: { borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 16, marginBottom: 16 },
  goalLabel: { fontSize: 10, color: '#666', fontWeight: 'bold', letterSpacing: 1, marginBottom: 6 },
  goalText: { fontSize: 13, color: '#111', lineHeight: 18 },
  
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  metricBox: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16 },
  metricLabel: { fontSize: 10, color: '#666', fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  metricValue: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  
  medCard: { backgroundColor: BLUE, borderRadius: 16, padding: 20, marginBottom: 16 },
  medTime: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  medName: { fontSize: 14, color: LIGHT_TEAL, marginBottom: 20 },
  confirmBtn: { backgroundColor: LIGHT_TEAL, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  confirmBtnText: { color: BLUE, fontSize: 14, fontWeight: 'bold' },
  medFooterText: { fontSize: 10, color: LIGHT_TEAL, fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 },
  
  vitalsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  linkText: { fontSize: 12, color: BLUE, fontWeight: '500' },
  vitalRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 16, borderRadius: 12, marginBottom: 12 },
  vitalLabel: { fontSize: 10, color: '#666', fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  vitalValue: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  vitalUnit: { fontSize: 12, color: '#666', fontWeight: 'normal' },
  vitalStatus: { fontSize: 12, color: BLUE, fontWeight: 'bold' },
  
  checkInContainer: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  checkInHeader: { backgroundColor: '#444', paddingVertical: 30, alignItems: 'center', justifyContent: 'center' },
  checkInBannerText: { color: '#fff', fontSize: 24, fontWeight: 'bold', letterSpacing: 2, opacity: 0.5 },
  checkInBody: { padding: 20 },
  checkInTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  checkInDesc: { fontSize: 13, color: '#555', marginBottom: 20 },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  emojiBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: BORDER, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  emojiBtnActive: { backgroundColor: LIGHT_TEAL, borderColor: BLUE },
  completeBtn: { backgroundColor: BLUE, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
