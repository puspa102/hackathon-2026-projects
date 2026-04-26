import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const BLUE = '#2A7B88';
const LIGHT_TEAL = '#E6F2F4';
const YELLOW_TEXT = '#E65100';
const BROWN_TEXT = '#5D4037';
const BG = '#F8F9FA';
const BORDER = '#E5E7EB';

const HIGH_BG = '#FFEBEE';
const HIGH_TEXT = '#C62828';
const MOD_BG = '#FFF8E1';
const MOD_TEXT = '#F57F17';

export default function RiskAssessmentScreen() {
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
        
        {/* Risk Status */}
        <View style={styles.riskCard}>
          <View style={styles.riskHeader}>
            <View style={styles.warningIconBg}>
              <MaterialIcons name="warning" size={28} color="#fff" />
            </View>
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.riskLabel}>RISK STATUS</Text>
              <Text style={styles.riskTitle}>Moderate Warning</Text>
            </View>
          </View>
          <Text style={styles.riskDesc}>
            Your recent assessment indicates potential respiratory concerns that require clinical attention within the next 24 hours.
          </Text>
        </View>

        {/* Physician's Insight */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialIcons name="assignment-ind" size={20} color={BLUE} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Physician{"'"}s Insight</Text>
          </View>

          <View style={styles.docRow}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/women/68.jpg' }} style={styles.docAvatar} />
            <View>
              <Text style={styles.docName}>Dr. Elena Martinez</Text>
              <Text style={styles.docSpec}>Pulmonology Specialist</Text>
            </View>
          </View>

          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>
              {"\""}The combination of your reported shortness of breath and elevated heart rate suggests a need for an immediate diagnostic review. Please avoid strenuous activity.{"\""}
            </Text>
          </View>
        </View>

        {/* Symptom Overview */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialIcons name="monitor-heart" size={20} color={BLUE} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Symptom Overview</Text>
          </View>

          <View style={styles.symptomRow}>
            <MaterialIcons name="air" size={20} color={HIGH_TEXT} style={{ marginRight: 12 }} />
            <Text style={styles.symptomName}>Shortness of Breath</Text>
            <View style={[styles.badge, { backgroundColor: HIGH_BG }]}>
              <Text style={[styles.badgeText, { color: HIGH_TEXT }]}>HIGH</Text>
            </View>
          </View>

          <View style={styles.symptomRow}>
            <MaterialIcons name="thermostat" size={20} color={MOD_TEXT} style={{ marginRight: 12 }} />
            <Text style={styles.symptomName}>Mild Fever (38.1°C)</Text>
            <View style={[styles.badge, { backgroundColor: MOD_BG }]}>
              <Text style={[styles.badgeText, { color: MOD_TEXT }]}>MOD</Text>
            </View>
          </View>

          <View style={[styles.symptomRow, { marginBottom: 0 }]}>
            <MaterialIcons name="local-florist" size={20} color={BLUE} style={{ marginRight: 12 }} />
            <Text style={styles.symptomName}>Allergy Exposure</Text>
            <View style={[styles.badge, { backgroundColor: '#E8EAED' }]}>
              <Text style={[styles.badgeText, { color: '#555' }]}>LOW</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.chatBtn} onPress={() => router.push('/chat')}>
          <MaterialIcons name="chat" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.chatBtnText}>Chat with Doctor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.emergencyBtn}>
          <MaterialIcons name="medical-services" size={20} color={BLUE} style={{ marginRight: 8 }} />
          <Text style={styles.emergencyBtnText}>View Emergency Info</Text>
        </TouchableOpacity>

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
  
  riskCard: { backgroundColor: '#FFE6C7', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#FFD8A8' },
  riskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  warningIconBg: { backgroundColor: YELLOW_TEXT, width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  riskLabel: { fontSize: 10, fontWeight: 'bold', color: YELLOW_TEXT, letterSpacing: 1, marginBottom: 2 },
  riskTitle: { fontSize: 20, fontWeight: 'bold', color: BROWN_TEXT },
  riskDesc: { fontSize: 14, color: '#795548', lineHeight: 22 },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: BORDER },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  
  docRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  docAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  docName: { fontSize: 14, fontWeight: 'bold', color: BLUE, marginBottom: 2 },
  docSpec: { fontSize: 12, color: '#555' },
  
  quoteBox: { backgroundColor: '#F0F2F5', borderRadius: 12, padding: 16 },
  quoteText: { fontSize: 13, color: '#333', fontStyle: 'italic', lineHeight: 20 },
  
  symptomRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, marginBottom: 12 },
  symptomName: { flex: 1, fontSize: 14, color: '#111' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  
  chatBtn: { backgroundColor: BLUE, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  chatBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  emergencyBtn: { backgroundColor: LIGHT_TEAL, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  emergencyBtnText: { color: BLUE, fontSize: 14, fontWeight: 'bold' },
});
