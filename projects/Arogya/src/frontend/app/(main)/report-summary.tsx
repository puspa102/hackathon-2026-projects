import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const BLUE = '#2A7B88';
const LIGHT_TEAL = '#E6F2F4';
const RED = '#C62828';
const LIGHT_RED = '#FFEBEE';
const BG = '#F8F9FA';
const GRAY = '#7A8CA3';
const BORDER = '#E5E7EB';

export default function ReportSummaryScreen() {

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
        <View style={styles.titleRow}>
          <View style={styles.sparkIconBg}>
            <MaterialIcons name="auto-awesome" size={20} color={BLUE} />
          </View>
          <Text style={styles.pageTitle}>AI Report Summary</Text>
        </View>
        <Text style={styles.pageSub}>Extracted from your latest consultation report (Oct 24, 2023).</Text>

        {/* Prescribed Medications */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Prescribed Medications</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3 ACTIVE</Text>
            </View>
          </View>

          <View style={styles.medItem}>
            <View style={styles.medIconBg}>
              <MaterialIcons name="medication" size={20} color={BLUE} />
            </View>
            <View style={styles.medInfo}>
              <View style={styles.medHeaderRow}>
                <Text style={styles.medName}>Lisinopril</Text>
                <Text style={styles.medTime}>MORNING</Text>
              </View>
              <Text style={styles.medDesc}>10mg Tablet • Oral</Text>
              <View style={styles.instructionRow}>
                <MaterialIcons name="info" size={14} color={BLUE} style={{ marginRight: 4 }} />
                <Text style={styles.instructionText}>Take 1 tablet daily after breakfast</Text>
              </View>
            </View>
          </View>

          <View style={styles.medItem}>
            <View style={styles.medIconBg}>
              <MaterialIcons name="medical-services" size={20} color={BLUE} />
            </View>
            <View style={styles.medInfo}>
              <View style={styles.medHeaderRow}>
                <Text style={styles.medName}>Metformin</Text>
                <Text style={styles.medTime}>TWICE DAILY</Text>
              </View>
              <Text style={styles.medDesc}>500mg Tablet • Oral</Text>
              <View style={styles.instructionRow}>
                <MaterialIcons name="info" size={14} color={BLUE} style={{ marginRight: 4 }} />
                <Text style={styles.instructionText}>Take with meals (Breakfast & Dinner)</Text>
              </View>
            </View>
          </View>

          <View style={[styles.medItem, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.medIconBg}>
              <MaterialIcons name="vaccines" size={20} color={BLUE} />
            </View>
            <View style={styles.medInfo}>
              <View style={styles.medHeaderRow}>
                <Text style={styles.medName}>Atorvastatin</Text>
                <Text style={styles.medTime}>EVENING</Text>
              </View>
              <Text style={styles.medDesc}>20mg Tablet • Oral</Text>
              <View style={styles.instructionRow}>
                <MaterialIcons name="info" size={14} color={BLUE} style={{ marginRight: 4 }} />
                <Text style={styles.instructionText}>Take 1 tablet before bedtime</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Follow-ups */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <MaterialIcons name="event" size={20} color="#111" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Follow-ups</Text>
          </View>

          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineLine} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineDate}>NOV 12, 2023</Text>
              <Text style={styles.timelineTitle}>Cardiology Review</Text>
              <Text style={styles.timelineDesc}>Dr. Aria Thorne • City Medical</Text>
            </View>
          </View>

          <View style={[styles.timelineItem, { marginBottom: 16 }]}>
            <View style={[styles.timelineDot, { backgroundColor: '#ccc' }]} />
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineDate, { color: '#666' }]}>DEC 05, 2023</Text>
              <Text style={styles.timelineTitle}>Blood Work Analysis</Text>
              <Text style={styles.timelineDesc}>Quest Labs - Morning Appointment</Text>
            </View>
          </View>

          <View style={styles.taskBox}>
            <Text style={styles.taskLabel}>Next Task:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <MaterialIcons name="check-box-outline-blank" size={20} color={GRAY} style={{ marginRight: 8 }} />
              <Text style={styles.taskText}>Fast 12h before Dec 5</Text>
            </View>
          </View>
        </View>

        {/* Warning Signs */}
        <View style={styles.warningCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <MaterialIcons name="warning" size={20} color={RED} style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: RED, flex: 1 }]}>Warning Signs & Immediate Actions</Text>
          </View>

          <View style={styles.warningItem}>
            <View style={styles.bulletRed} />
            <View>
              <Text style={styles.warningTitle}>Shortness of Breath</Text>
              <Text style={styles.warningDesc}>If you experience sudden difficulty breathing while at rest.</Text>
            </View>
          </View>
          <View style={styles.warningItem}>
            <View style={styles.bulletRed} />
            <View>
              <Text style={styles.warningTitle}>Chest Tightness</Text>
              <Text style={styles.warningDesc}>Any pressure or discomfort that radiates to neck or left arm.</Text>
            </View>
          </View>
          <View style={styles.warningItem}>
            <View style={styles.bulletRed} />
            <View>
              <Text style={styles.warningTitle}>Severe Dizziness</Text>
              <Text style={styles.warningDesc}>Fainting spells or persistent vertigo especially after new meds.</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.emergencyCallBtn}>
            <MaterialIcons name="medical-services" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.emergencyCallText}>Call Emergency Services</Text>
          </TouchableOpacity>
        </View>

        {/* Vital Trends */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Vital Trends</Text>
          <View style={styles.barChartPlaceholder}>
            <View style={[styles.bar, { height: 40 }]} />
            <View style={[styles.bar, { height: 60 }]} />
            <View style={[styles.bar, { height: 50 }]} />
            <View style={[styles.bar, { height: 80 }]} />
            <View style={[styles.bar, { height: 60 }]} />
            <View style={[styles.bar, { height: 90, backgroundColor: BLUE }]} />
          </View>
          <View style={styles.vitalTrendsFooter}>
            <View>
              <Text style={styles.vitalTrendsLabel}>AVG HEART RATE</Text>
              <Text style={styles.vitalTrendsValue}>72 <Text style={{ fontSize: 12 }}>BPM</Text></Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.vitalTrendsLabel}>RECOVERY STATUS</Text>
              <Text style={[styles.vitalTrendsValue, { fontSize: 14 }]}>On Track</Text>
            </View>
          </View>
        </View>

        {/* Lifestyle Adjustments */}
        <View style={styles.lifestyleCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <MaterialIcons name="spa" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { color: '#fff' }]}>Lifestyle Adjustments</Text>
          </View>

          <View style={styles.lifestyleItem}>
            <MaterialIcons name="check-circle" size={18} color={LIGHT_TEAL} style={{ marginRight: 12, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lifestyleTitle}>Sodium Reduction</Text>
              <Text style={styles.lifestyleDesc}>Limit daily intake to 1,500mg. Focus on fresh vegetables.</Text>
            </View>
          </View>
          <View style={styles.lifestyleItem}>
            <MaterialIcons name="check-circle" size={18} color={LIGHT_TEAL} style={{ marginRight: 12, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lifestyleTitle}>Light Activity</Text>
              <Text style={styles.lifestyleDesc}>20-minute gentle walks, 4 times a week. Avoid heavy lifting.</Text>
            </View>
          </View>
          <View style={[styles.lifestyleItem, { marginBottom: 0 }]}>
            <MaterialIcons name="check-circle" size={18} color={LIGHT_TEAL} style={{ marginRight: 12, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lifestyleTitle}>Hydration</Text>
              <Text style={styles.lifestyleDesc}>2.5 liters of water daily. Monitor for swelling in ankles.</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
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
  
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sparkIconBg: { backgroundColor: LIGHT_TEAL, width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: BLUE },
  pageSub: { fontSize: 13, color: '#555', marginBottom: 20, lineHeight: 20 },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  badge: { backgroundColor: '#E8EAED', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#555', letterSpacing: 0.5 },
  
  medItem: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F2F5', paddingBottom: 16 },
  medIconBg: { backgroundColor: '#E6F2F4', width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  medInfo: { flex: 1 },
  medHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  medName: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  medTime: { fontSize: 10, fontWeight: 'bold', color: BLUE, letterSpacing: 0.5 },
  medDesc: { fontSize: 12, color: '#555', marginBottom: 8 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start' },
  instructionText: { fontSize: 11, color: BLUE, flex: 1, fontWeight: '500' },
  
  timelineItem: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: BLUE, marginTop: 4, marginRight: 16, zIndex: 2 },
  timelineLine: { position: 'absolute', top: 16, left: 5, width: 2, height: '110%', backgroundColor: BORDER, zIndex: 1 },
  timelineContent: { flex: 1 },
  timelineDate: { fontSize: 10, fontWeight: 'bold', color: BLUE, letterSpacing: 0.5, marginBottom: 4 },
  timelineTitle: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  timelineDesc: { fontSize: 12, color: GRAY },
  
  taskBox: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, marginTop: 8 },
  taskLabel: { fontSize: 11, color: GRAY, marginBottom: 4 },
  taskText: { fontSize: 13, color: '#333' },
  
  warningCard: { backgroundColor: LIGHT_RED, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#FFCDD2' },
  warningItem: { flexDirection: 'row', marginBottom: 16 },
  bulletRed: { width: 6, height: 6, borderRadius: 3, backgroundColor: RED, marginTop: 6, marginRight: 12 },
  warningTitle: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  warningDesc: { fontSize: 12, color: '#555', lineHeight: 18, paddingRight: 10 },
  emergencyCallBtn: { backgroundColor: RED, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  emergencyCallText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  barChartPlaceholder: { height: 100, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: '#E6F2F4', borderRadius: 12, padding: 16, marginBottom: 16 },
  bar: { width: 30, backgroundColor: '#B2D8DD', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  vitalTrendsFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  vitalTrendsLabel: { fontSize: 10, fontWeight: 'bold', color: GRAY, letterSpacing: 0.5, marginBottom: 4 },
  vitalTrendsValue: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  
  lifestyleCard: { backgroundColor: BLUE, borderRadius: 16, padding: 20, marginBottom: 16 },
  lifestyleItem: { flexDirection: 'row', marginBottom: 16 },
  lifestyleTitle: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  lifestyleDesc: { fontSize: 12, color: LIGHT_TEAL, lineHeight: 18 },
});
