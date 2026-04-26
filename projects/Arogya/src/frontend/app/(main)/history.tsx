import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons, Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const PRIMARY = '#2563EB';
const BACKGROUND = '#F8FAFC';
const TEXT_DARK = '#1E293B';
const TEXT_GRAY = '#64748B';
const BORDER = '#E2E8F0';
const WHITE = '#FFFFFF';
const GREEN = '#10B981';
const RED = '#EF4444';

export default function MedicalHistoryScreen() {

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="bandage" size={24} color={PRIMARY} />
          <Text style={styles.logoText}>CareLoop</Text>
        </View>
        <Image 
          source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' }} 
          style={styles.headerAvatar} 
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Medical History</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={TEXT_GRAY} />
          <TextInput 
            placeholder="Search reports, vaccines..." 
            placeholderTextColor={TEXT_GRAY}
            style={styles.searchInput}
          />
        </View>

        {/* Recent Blood Work Card */}
        <TouchableOpacity style={styles.recentCard}>
          <View style={styles.cardHeader}>
            <View style={styles.reportIconContainer}>
              <MaterialCommunityIcons name="file-alert" size={24} color={PRIMARY} />
            </View>
            <View style={styles.processedBadge}>
              <Text style={styles.processedText}>Processed</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Recent Blood Work</Text>
            <Text style={styles.cardSubtitle}>LabCorp • Oct 24, 2023</Text>
          </View>
          <MaterialCommunityIcons name="file-document-outline" size={80} color="#F1F5F9" style={styles.watermarkIcon} />
        </TouchableOpacity>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="medical-bag" size={24} color={PRIMARY} style={styles.statIcon} />
            <Text style={styles.statTitle}>Immunizations</Text>
            <Text style={styles.statValue}>12 Total Records</Text>
            <View style={styles.greenBadge}>
              <Text style={styles.greenBadgeText}>UP TO DATE</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="pill" size={24} color={RED} style={styles.statIcon} />
            <Text style={styles.statTitle}>Prescriptions</Text>
            <Text style={styles.statValue}>4 Active</Text>
            <View style={styles.redBadge}>
              <Text style={styles.redBadgeText}>RENEW SOON</Text>
            </View>
          </View>
        </View>

        {/* Historical Categories */}
        <Text style={styles.sectionHeader}>HISTORICAL CATEGORIES</Text>
        
        <View style={styles.categoryList}>
          <CategoryItem 
            icon="stethoscope" 
            title="Past Surgeries" 
            subtitle="Appenndectomy (2018)" 
            iconColor="#3B82F6"
          />
          <CategoryItem 
            icon="human-bone-cecut" 
            title="Imaging Reports" 
            subtitle="Chest X-Ray • Aug 12, 2023" 
            iconColor="#64748B"
          />
          <CategoryItem 
            icon="dna" 
            title="Genetic Screening" 
            subtitle="Comprehensive Profile (2022)" 
            iconColor="#10B981"
          />
        </View>

        {/* CTA Banner */}
        <LinearGradient
          colors={['#1E40AF', '#1E3A8A']}
          style={styles.ctaBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Request Medical Records</Text>
            <Text style={styles.ctaSubtitle}>Transfer your history from another provider easily with one tap.</Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Start Request</Text>
            </TouchableOpacity>
          </View>
          <MaterialCommunityIcons name="cloud-sync" size={100} color="rgba(255,255,255,0.1)" style={styles.ctaWatermark} />
        </LinearGradient>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryItem({ icon, title, subtitle, iconColor }: any) {
  return (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={[styles.categoryIconBg, { backgroundColor: iconColor + '10' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryTitle}>{title}</Text>
        <Text style={styles.categorySubtitle}>{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={TEXT_GRAY} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: WHITE,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: '800', color: PRIMARY, marginLeft: 8 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: BORDER },
  
  scrollContent: { padding: 20 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: TEXT_DARK, marginBottom: 20 },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 25,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: TEXT_DARK },
  
  recentCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  reportIconContainer: {
    backgroundColor: '#EFF6FF',
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  processedText: { color: GREEN, fontSize: 12, fontWeight: '700' },
  cardBody: { zIndex: 1 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: TEXT_DARK, marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: TEXT_GRAY, fontWeight: '500' },
  watermarkIcon: { position: 'absolute', right: -10, bottom: -10, zIndex: 0 },
  
  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  statBox: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  statIcon: { marginBottom: 12 },
  statTitle: { fontSize: 15, fontWeight: '800', color: TEXT_DARK, marginBottom: 4 },
  statValue: { fontSize: 13, color: TEXT_GRAY, marginBottom: 12 },
  greenBadge: { backgroundColor: '#ECFDF5', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  greenBadgeText: { color: GREEN, fontSize: 10, fontWeight: '800' },
  redBadge: { backgroundColor: '#FEF2F2', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  redBadgeText: { color: RED, fontSize: 10, fontWeight: '800' },
  
  sectionHeader: { fontSize: 13, fontWeight: '800', color: TEXT_GRAY, letterSpacing: 1, marginBottom: 15 },
  categoryList: { gap: 12, marginBottom: 30 },
  categoryItem: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  categoryIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  categoryInfo: { flex: 1 },
  categoryTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK, marginBottom: 2 },
  categorySubtitle: { fontSize: 13, color: TEXT_GRAY },
  
  ctaBanner: {
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  ctaContent: { zIndex: 1 },
  ctaTitle: { color: WHITE, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  ctaSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20, marginBottom: 20, paddingRight: 40 },
  ctaButton: {
    backgroundColor: WHITE,
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaButtonText: { color: PRIMARY, fontWeight: '800', fontSize: 15 },
  ctaWatermark: { position: 'absolute', right: -20, bottom: -20, opacity: 0.2 },
});
