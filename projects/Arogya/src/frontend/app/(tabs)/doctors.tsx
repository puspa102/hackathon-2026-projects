import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import api from "@/services/api";

const PRIMARY = "#2A7B88";
const BG = "#F8F9FA";
const BORDER = "#E5E7EB";

export default function DoctorsScreen() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDoctors = useCallback(async () => {
    try {
      const data = await api.getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDoctors();
  }, [fetchDoctors]);

  const renderDoctor = ({ item }: { item: any }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=2A7B88&color=fff` }}
            style={styles.avatar}
          />
          {item.is_online && <View style={styles.onlineBadge} />}
        </View>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.name}</Text>
          <Text style={styles.specialty}>{item.specialty}</Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={14} color="#FBBF24" />
            <Text style={styles.ratingText}>{item.rating} • {item.experience} years exp.</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.detailsBtn}
          onPress={() => router.push({ pathname: "/(doctor)/doctor-profile", params: { id: item.id } } as any)}
        >
          <Text style={styles.detailsBtnText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.chatBtn}
          onPress={() => router.push({ pathname: "/(doctor)/chat", params: { doctorId: item.id } } as any)}
        >
          <MaterialIcons name="chat" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.chatBtnText}>Chat Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Specialists</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <MaterialIcons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Finding doctors...</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          renderItem={renderDoctor}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="medical-services" size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No doctors available</Text>
              <Text style={styles.emptySub}>Please check back later.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#111" },
  searchBtn: { padding: 4 },
  listContent: { padding: 16, backgroundColor: BG, flexGrow: 1 },
  doctorCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  doctorHeader: { flexDirection: "row", marginBottom: 16 },
  avatarContainer: { position: "relative" },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#eee" },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#fff",
  },
  doctorInfo: { flex: 1, marginLeft: 16, justifyContent: "center" },
  doctorName: { fontSize: 17, fontWeight: "bold", color: "#111" },
  specialty: { fontSize: 14, color: "#64748B", marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  cardActions: { flexDirection: "row", gap: 12 },
  detailsBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PRIMARY,
    alignItems: "center",
  },
  detailsBtnText: { color: PRIMARY, fontSize: 14, fontWeight: "600" },
  chatBtn: {
    flex: 1.5,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chatBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 15, color: "#64748B" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 100, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  emptySub: { fontSize: 14, color: "#64748B", textAlign: "center" },
});
