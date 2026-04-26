import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const BLUE = '#2A7B88';
const RED = '#C62828';
const BG = '#F8F9FA';
const GRAY = '#7A8CA3';
const BORDER = '#E5E7EB';

export default function MedicationsScreen() {

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.headerAvatar} />
          <Text style={styles.headerTitle}>CareLoop</Text>
        </View>
        <MaterialIcons name="notifications-none" size={24} color="#333" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.greetingTitle}>Good Morning, Sarah</Text>
        <Text style={styles.greetingSub}>You have 3 medications scheduled for today.</Text>

        {/* Due Now Card */}
        <View style={styles.dueCard}>
          <View style={styles.dueImageContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80' }} 
              style={styles.dueImage} 
            />
            <View style={styles.dueBadge}>
              <Text style={styles.dueBadgeText}>DUE NOW</Text>
            </View>
          </View>
          
          <View style={styles.dueContent}>
            <View style={styles.timeRow}>
              <MaterialIcons name="schedule" size={16} color={BLUE} style={{ marginRight: 6 }} />
              <Text style={styles.timeText}>08:00 AM</Text>
            </View>
            <Text style={styles.medName}>Lisinopril</Text>
            
            <View style={styles.tagsRow}>
              <View style={styles.tag}><Text style={styles.tagText}>10 mg</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>1 Capsule</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>With Food</Text></View>
            </View>

            <View style={styles.actionColumn}>
              <TouchableOpacity style={styles.takenBtn}>
                <MaterialIcons name="check-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.takenBtnText}>Taken</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.snoozeBtn}>
                <MaterialIcons name="snooze" size={18} color="#444" style={{ marginRight: 8 }} />
                <Text style={styles.snoozeBtnText}>Snooze</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.missedBtn}>
                <MaterialIcons name="close" size={18} color={RED} style={{ marginRight: 8 }} />
                <Text style={styles.missedBtnText}>Missed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Daily Adherence */}
        <View style={styles.adherenceCard}>
          <Text style={styles.adherenceTitle}>Daily Adherence</Text>
          <View style={styles.adherenceRow}>
            <View style={styles.adherenceCircle}>
              <Text style={styles.adherencePercent}>66%</Text>
            </View>
            <View style={styles.adherenceInfo}>
              <Text style={styles.adherenceStatus}>2 of 3 taken</Text>
              <Text style={styles.adherenceSub}>Keep it up, Sarah!</Text>
            </View>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '66%' }]} />
          </View>
        </View>

        {/* Upcoming Today */}
        <View style={styles.upcomingHeader}>
          <Text style={styles.sectionTitle}>Upcoming Today</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>View Calendar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.upcomingItem}>
          <View style={styles.upcomingIconBg}>
            <MaterialIcons name="medication" size={24} color={BLUE} />
          </View>
          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingName}>Metformin</Text>
            <Text style={styles.upcomingDesc}>500mg • After Lunch</Text>
          </View>
          <Text style={styles.upcomingTime}>01:00 PM</Text>
        </View>

        <View style={styles.upcomingItem}>
          <View style={styles.upcomingIconBg}>
            <MaterialIcons name="medical-services" size={24} color={BLUE} />
          </View>
          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingName}>Atorvastatin</Text>
            <Text style={styles.upcomingDesc}>20mg • Before Bed</Text>
          </View>
          <Text style={styles.upcomingTime}>09:00 PM</Text>
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
  greetingSub: { fontSize: 14, color: '#555', marginTop: 4, marginBottom: 20 },
  
  dueCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  dueImageContainer: { height: 140, position: 'relative' },
  dueImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  dueBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: BLUE, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  dueBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  
  dueContent: { padding: 20 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  timeText: { fontSize: 14, color: BLUE, fontWeight: 'bold' },
  medName: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 12 },
  
  tagsRow: { flexDirection: 'row', marginBottom: 20, gap: 8 },
  tag: { backgroundColor: '#F0F2F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 12, color: '#444' },
  
  actionColumn: { gap: 12 },
  takenBtn: { backgroundColor: BLUE, borderRadius: 10, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  takenBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  snoozeBtn: { backgroundColor: '#E8EAED', borderRadius: 10, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  snoozeBtnText: { color: '#333', fontSize: 14, fontWeight: 'bold' },
  missedBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: RED, borderRadius: 10, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  missedBtnText: { color: RED, fontSize: 14, fontWeight: 'bold' },
  
  adherenceCard: { backgroundColor: '#E6F2F4', borderRadius: 16, padding: 20, marginBottom: 20 },
  adherenceTitle: { fontSize: 16, fontWeight: 'bold', color: BLUE, marginBottom: 16 },
  adherenceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  adherenceCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 6, borderColor: BLUE, alignItems: 'center', justifyContent: 'center', borderRightColor: '#ccc' },
  adherencePercent: { fontSize: 16, fontWeight: 'bold', color: BLUE },
  adherenceInfo: { marginLeft: 16 },
  adherenceStatus: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  adherenceSub: { fontSize: 13, color: '#555' },
  progressBarBg: { height: 4, backgroundColor: '#D0E0DC', borderRadius: 2 },
  progressBarFill: { height: 4, backgroundColor: BLUE, borderRadius: 2 },
  
  upcomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  linkText: { fontSize: 12, color: BLUE, fontWeight: '500' },
  
  upcomingItem: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: BORDER },
  upcomingIconBg: { backgroundColor: '#E6F2F4', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  upcomingInfo: { flex: 1, marginLeft: 12 },
  upcomingName: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  upcomingDesc: { fontSize: 12, color: GRAY },
  upcomingTime: { fontSize: 12, fontWeight: 'bold', color: BLUE },
});
