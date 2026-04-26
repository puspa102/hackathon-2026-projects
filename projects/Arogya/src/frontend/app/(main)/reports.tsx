import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const BLUE = '#2A7B88';
const LIGHT = '#FAFBFD';
const GRAY = '#7A8CA3';
const GREEN_BG = '#E6F2F4';
const GREEN_TEXT = '#2A7B88';

export default function ReportsScreen() {

  const recentUploads = [
    { id: 1, name: 'Discharge_Summary.pdf', date: 'Oct 12, 2023', size: '2.4 MB', type: 'pdf', status: 'PROCESSED' },
    { id: 2, name: 'Blood_Work_Oct.jpg', date: 'Oct 10, 2023', size: '1.1 MB', type: 'image', status: 'PENDING' },
    { id: 3, name: 'Physio_Plan_v2.pdf', date: 'Sep 28, 2023', size: '3.8 MB', type: 'pdf', status: 'PROCESSED' },
  ];

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
        <Text style={styles.pageTitle}>Upload Medical Report</Text>
        <Text style={styles.pageSub}>Scan your hospital discharge papers to get your recovery plan.</Text>

        {/* Drop Area */}
        <View style={styles.dropArea}>
          <View style={styles.cloudIconBg}>
            <MaterialIcons name="cloud-upload" size={32} color={BLUE} />
          </View>
          <Text style={styles.dropText}>Drop files here</Text>
          <Text style={styles.supportText}>Supports PDF, JPG, PNG</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.uploadPdfBtn]}>
            <MaterialIcons name="picture-as-pdf" size={20} color="#fff" style={{ marginBottom: 8 }} />
            <Text style={styles.uploadPdfText}>Upload PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.takePhotoBtn]}>
            <MaterialIcons name="photo-camera" size={20} color="#333" style={{ marginBottom: 8 }} />
            <Text style={styles.takePhotoText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Uploads */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Uploads</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentUploads.map(item => (
          <View key={item.id} style={styles.uploadCard}>
            <View style={styles.fileIconBg}>
              <MaterialIcons name={item.type === 'pdf' ? 'description' : 'image'} size={24} color={item.type === 'pdf' ? GREEN_TEXT : BLUE} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{item.name}</Text>
              <Text style={styles.fileDetails}>{item.date} • {item.size}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === 'PROCESSED' ? styles.statusProcessed : styles.statusPending]}>
              <Text style={[styles.statusText, item.status === 'PROCESSED' ? styles.statusTextProcessed : styles.statusTextPending]}>
                {item.status}
              </Text>
            </View>
          </View>
        ))}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color={BLUE} style={{ marginRight: 12, marginTop: 2 }} />
          <Text style={styles.infoText}>
            Your data is encrypted and handled securely. Recovery plans are generated using verified medical guidelines for your safety.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: LIGHT },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: LIGHT
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: BLUE },

  scrollContent: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  pageSub: { fontSize: 15, color: '#555', marginTop: 8, marginBottom: 24, lineHeight: 22 },

  dropArea: {
    borderWidth: 1.5, borderColor: BLUE, borderStyle: 'dashed', borderRadius: 16,
    padding: 30, alignItems: 'center', marginBottom: 20, backgroundColor: '#fff'
  },
  cloudIconBg: { backgroundColor: '#E6F2F4', width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  dropText: { fontSize: 18, fontWeight: 'bold', color: BLUE, marginBottom: 4 },
  supportText: { fontSize: 13, color: '#555' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 32 },
  actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  uploadPdfBtn: { backgroundColor: BLUE },
  takePhotoBtn: { backgroundColor: '#E8ECF1' },
  uploadPdfText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  takePhotoText: { color: '#333', fontSize: 14, fontWeight: 'bold' },

  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  viewAllText: { fontSize: 14, color: BLUE, fontWeight: 'bold' },

  uploadCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row',
    alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#F0F2F5',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1
  },
  fileIconBg: { backgroundColor: '#F8F9FB', width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  fileDetails: { fontSize: 12, color: GRAY },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusProcessed: { backgroundColor: GREEN_BG },
  statusPending: { backgroundColor: '#F0F2F5' },
  statusText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  statusTextProcessed: { color: GREEN_TEXT },
  statusTextPending: { color: '#555' },

  infoBox: { backgroundColor: '#E6F2F4', borderRadius: 12, padding: 16, flexDirection: 'row', marginTop: 16 },
  infoText: { flex: 1, fontSize: 13, color: '#333', lineHeight: 20 },
});
