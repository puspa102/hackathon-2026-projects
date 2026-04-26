import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const PRIMARY = '#2A7B88';
const LIGHT = '#F8F9FB';
const BORDER = '#E5E7EB';
const GRAY = '#7A8CA3';
const TAG = '#EAF3FA';
const STAR = '#F7B500';
const VERIFIED = '#2ECC71';

export default function DoctorProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
          <MaterialIcons name="arrow-back" size={24} color={PRIMARY} />
        </TouchableOpacity>
        <View style={[styles.logo, { alignItems: 'center', justifyContent: 'center' }]}>
          <MaterialIcons name="local-hospital" size={18} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>CareLoop</Text>
        <View style={styles.headerRight}>
          <View style={styles.bellIcon}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </View>
          <View style={styles.profilePic}>
            <Text style={{ fontSize: 18 }}>👤</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Doctor Image and Verified */}
        <View style={styles.imageContainer}>
          <View style={[styles.docImage, { alignItems: 'center', justifyContent: 'center' }]}>
            <MaterialIcons name="person" size={60} color={PRIMARY} />
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={{ color: VERIFIED, fontWeight: 'bold', fontSize: 13 }}>✔ Verified</Text>
          </View>
        </View>
        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          Dr. Sarah Jenkins is a board-certified cardiologist with over 12 years of experience in cardiovascular medicine. She specializes in preventative cardiology and diagnostic imaging, committed to providing patient-centered care with the latest medical advancements.
        </Text>
        {/* Specialties */}
        <Text style={styles.sectionTitle}>Specialties</Text>
        <View style={styles.tagsRow}>
          <Tag label="Heart Surgery" />
          <Tag label="Valve Replacement" />
        </View>
        <View style={styles.tagsRow}>
          <Tag label="Cardiovascular Imaging" />
          <Tag label="Angioplasty" />
        </View>
        {/* Patient Reviews */}
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Patient Reviews</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.reviewCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <View style={[styles.reviewAvatar, { backgroundColor: '#eaf3fa' }]}>
              <MaterialIcons name="person" size={24} color={PRIMARY} />
            </View>
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={styles.reviewName}>Elena Rodriguez</Text>
              <Text style={styles.reviewDate}>2 days ago</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: STAR, fontWeight: 'bold', fontSize: 15 }}>★</Text>
              <Text style={styles.reviewRating}>5.0</Text>
            </View>
          </View>
          <Text style={styles.reviewText}>
            “Dr. Jenkins was extremely thorough and explained my treatment plan in a way that was easy to understand. Highly recommend!”
          </Text>
        </View>
      </ScrollView>
      {/* Bottom Buttons */}
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.chatBtn}>
          <Text style={styles.chatBtnText}>Start Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookBtn}>
          <Text style={styles.bookBtnText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomColor: BORDER, borderBottomWidth: 1, backgroundColor: '#fff',
  },
  logo: { width: 28, height: 28, marginRight: 8, borderRadius: 14, backgroundColor: PRIMARY },
  headerTitle: { fontWeight: 'bold', fontSize: 18, color: PRIMARY, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  bellIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  profilePic: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: BORDER },
  scrollContent: { padding: 20, paddingBottom: 100 },
  imageContainer: { alignItems: 'center', marginBottom: 16 },
  docImage: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#EAF3FA' },
  verifiedBadge: {
    position: 'absolute', right: 100, bottom: 0, backgroundColor: '#F6FFF8',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: VERIFIED,
  },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, color: '#222', marginTop: 10, marginBottom: 4 },
  aboutText: { color: GRAY, fontSize: 14, marginBottom: 8 },
  tagsRow: { flexDirection: 'row', marginBottom: 6 },
  tag: {
    backgroundColor: TAG, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5, marginRight: 8, marginBottom: 4,
  },
  tagText: { color: PRIMARY, fontWeight: 'bold', fontSize: 13 },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  seeAll: { color: PRIMARY, fontWeight: 'bold', fontSize: 13 },
  reviewCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 8, borderWidth: 1, borderColor: BORDER,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  reviewName: { fontWeight: 'bold', fontSize: 14, color: '#222' },
  reviewDate: { color: GRAY, fontSize: 12 },
  reviewRating: { fontWeight: 'bold', fontSize: 13, color: '#222', marginLeft: 4 },
  reviewText: { color: GRAY, fontSize: 14, marginTop: 8, fontStyle: 'italic', lineHeight: 20 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  bottomRow: {
    flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: BORDER,
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  chatBtn: {
    flex: 1, backgroundColor: '#EAF3FA', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginRight: 8,
  },
  chatBtnText: { color: PRIMARY, fontWeight: 'bold', fontSize: 15 },
  bookBtn: {
    flex: 2, backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginLeft: 8,
  },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
