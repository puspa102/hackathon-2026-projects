import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { authStorage } from "@/services/storage";
import { API_BASE_URL } from "@/services/config";
import { useAuth } from "@/services/AuthContext";
import { api } from "@/services/api";
import { useRef } from "react";

const BLUE = "#2A7B88";
const LIGHT_TEAL = "#E6F2F4";
const RED = "#C62828";
const BG = "#F8F9FA";
const BORDER = "#E5E7EB";

interface DashboardData {
  next_medicine: {
    name: string;
    dosage: string;
    reminder_time: string;
    frequency: string;
  } | null;
  latest_checkin: {
    risk_level: string;
    pain_level: number;
    guidance: string;
    symptoms: string;
  } | null;
  today_checkin_done: boolean;
  medicines_count: number;
  unread_alerts_count: number;
}

function getRiskLabel(level?: string) {
  if (level === "emergency")
    return { label: "EMERGENCY", bg: "#FEE2E2", text: "#DC2626" };
  if (level === "warning")
    return { label: "WARNING", bg: "#FEF3C7", text: "#D97706" };
  return { label: "NORMAL", bg: LIGHT_TEAL, text: BLUE };
}

function getPainLabel(level: number): string {
  if (level >= 8) return "Severe";
  if (level >= 5) return "Moderate";
  if (level > 0) return "Mild";
  return "None";
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

export default function RecoveryStatusScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const user = state.user;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await api.aiRecoveryChat({
        condition: data?.latest_checkin?.symptoms || "General Health Management",
        status: data?.latest_checkin?.guidance || "Normal",
        message: chatInput,
        history: chatMessages
      });
      setChatMessages(prev => [...prev, { role: "assistant", content: res.response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const token = await authStorage.getToken();
      const res = await fetch(`${API_BASE_URL}/accounts/dashboard/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      setData(await res.json());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const risk = getRiskLabel(data?.latest_checkin?.risk_level);
  const greeting = `Hello, ${user?.first_name || user?.username || "there"}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {(
              (user?.first_name?.[0] ?? "") + (user?.last_name?.[0] ?? "")
            ).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.headerTitle}>Arogya</Text>
        <MaterialIcons name="notifications-none" size={24} color="#333" />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading status…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={BLUE}
            />
          }
        >
          <Text style={styles.greetingTitle}>{greeting}</Text>
          <Text style={styles.greetingSub}>
            Here is your recovery overview for today.
          </Text>

          <TouchableOpacity 
            style={[styles.emergencyBtn, { backgroundColor: BLUE, marginBottom: 10 }]}
            onPress={() => setShowAiChat(true)}
          >
            <MaterialIcons
              name="auto-awesome"
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.emergencyBtnText}>AI Recovery Companion</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emergencyBtn}>
            <MaterialIcons
              name="emergency"
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.emergencyBtnText}>EMERGENCY SOS</Text>
          </TouchableOpacity>
          {/* Recovery Status Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons
                  name="auto-graph"
                  size={20}
                  color={BLUE}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.cardTitle}>Recovery Status</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: risk.bg }]}>
                <Text style={[styles.badgeText, { color: risk.text }]}>
                  {risk.label}
                </Text>
              </View>
            </View>

            {data?.latest_checkin ? (
              <>
                <View style={styles.metricsRow}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>PAIN LEVEL</Text>
                    <Text style={styles.metricValue}>
                      {getPainLabel(data.latest_checkin.pain_level)}
                    </Text>
                    <Text style={styles.metricSub}>
                      {data.latest_checkin.pain_level}/10
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>CHECK-IN</Text>
                    <Text style={styles.metricValue}>
                      {data.today_checkin_done ? "Done ✓" : "Pending"}
                    </Text>
                  </View>
                </View>
                {data.latest_checkin.guidance ? (
                  <View style={styles.goalBox}>
                    <Text style={styles.goalLabel}>GUIDANCE</Text>
                    <Text style={styles.goalText}>
                      {data.latest_checkin.guidance}
                    </Text>
                  </View>
                ) : null}
              </>
            ) : (
              <View style={styles.noDataBox}>
                <MaterialIcons name="assignment" size={32} color="#CBD5E1" />
                <Text style={styles.noDataText}>No check-in data yet</Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/check-in" as any)}
                >
                  <Text style={styles.startLink}>
                    Start your first check-in →
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Next Medication */}
          {data?.next_medicine ? (
            <View style={styles.medCard}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <MaterialIcons
                  name="medication"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}
                >
                  Next Medication
                </Text>
              </View>
              <Text style={styles.medTime}>
                {formatTime(data.next_medicine.reminder_time)}
              </Text>
              <Text style={styles.medName}>
                {data.next_medicine.name} • {data.next_medicine.dosage}
              </Text>
              <TouchableOpacity style={styles.confirmBtn}>
                <Text style={styles.confirmBtnText}>Confirm Intake</Text>
              </TouchableOpacity>
              <Text style={styles.medFooterText}>
                {data.next_medicine.frequency?.toUpperCase()}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.card,
                { alignItems: "center", paddingVertical: 24 },
              ]}
            >
              <MaterialIcons name="medication" size={36} color="#CBD5E1" />
              <Text style={{ color: "#94A3B8", marginTop: 8, fontSize: 14 }}>
                No medications scheduled
              </Text>
            </View>
          )}

          {/* Summary stats */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricBox, { flex: 1 }]}>
              <MaterialIcons name="medication" size={20} color={BLUE} />
              <Text style={styles.metricLabel}>TOTAL MEDS</Text>
              <Text style={styles.metricValue}>
                {data?.medicines_count ?? 0}
              </Text>
            </View>
            <View style={[styles.metricBox, { flex: 1 }]}>
              <MaterialIcons
                name="notifications"
                size={20}
                color={data?.unread_alerts_count ? "#DC2626" : BLUE}
              />
              <Text style={styles.metricLabel}>ALERTS</Text>
              <Text
                style={[
                  styles.metricValue,
                  { color: data?.unread_alerts_count ? "#DC2626" : "#111" },
                ]}
              >
                {data?.unread_alerts_count ?? 0}
              </Text>
            </View>
          </View>

          {/* Check-in prompt */}
          <View style={styles.checkInContainer}>
            <View style={styles.checkInBody}>
              <Text style={styles.checkInTitle}>Daily Check-in</Text>
              <Text style={styles.checkInDesc}>
                {data?.today_checkin_done
                  ? "Today's check-in is complete. Great job!"
                  : "How are you feeling today? Complete your check-in."}
              </Text>
              <TouchableOpacity
                style={[
                  styles.completeBtn,
                  data?.today_checkin_done && { backgroundColor: "#16A34A" },
                ]}
                onPress={() => router.push("/(tabs)/check-in" as any)}
              >
                <Text style={styles.completeBtnText}>
                  {data?.today_checkin_done
                    ? "View Check-in"
                    : "Complete Check-in"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* AI Chat Modal */}
      <Modal
        visible={showAiChat}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAiChat(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { height: "90%" }]}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="auto-awesome" size={24} color={BLUE} />
              <Text style={styles.modalTitle}>AI Recovery Companion</Text>
              <TouchableOpacity onPress={() => setShowAiChat(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalScroll}
              contentContainerStyle={{ paddingBottom: 20 }}
              ref={scrollRef}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              <Text style={styles.welcomeText}>
                Hello! I'm your AI recovery companion. How are you feeling right now?
              </Text>
              {chatMessages.map((msg, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.messageBubble, 
                    msg.role === "user" ? styles.userBubble : styles.assistantBubble
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    msg.role === "user" ? styles.userText : styles.assistantText
                  ]}>
                    {String(msg.content)}
                  </Text>
                </View>
              ))}
              {chatLoading && (
                <View style={styles.loadingBubble}>
                  <ActivityIndicator size="small" color={BLUE} />
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Type your message..."
                value={chatInput}
                onChangeText={setChatInput}
                multiline
              />
              <TouchableOpacity 
                style={styles.sendBtn} 
                onPress={sendChatMessage}
                disabled={chatLoading || !chatInput.trim()}
              >
                <MaterialIcons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "bold", color: BLUE },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 15, color: "#64748B" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  greetingTitle: { fontSize: 24, fontWeight: "bold", color: "#111" },
  greetingSub: { fontSize: 14, color: "#555", marginTop: 4, marginBottom: 16 },
  emergencyBtn: {
    backgroundColor: RED,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emergencyBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#111" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: "bold", letterSpacing: 0.5 },
  metricsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  metricBox: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  metricValue: { fontSize: 16, fontWeight: "bold", color: "#111" },
  metricSub: { fontSize: 12, color: "#94A3B8" },
  goalBox: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
  },
  goalLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  goalText: { fontSize: 13, color: "#111", lineHeight: 18 },
  noDataBox: { alignItems: "center", paddingVertical: 20, gap: 8 },
  noDataText: { fontSize: 14, color: "#94A3B8" },
  startLink: { fontSize: 14, color: BLUE, fontWeight: "600" },
  medCard: {
    backgroundColor: BLUE,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  medTime: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  medName: { fontSize: 14, color: LIGHT_TEAL, marginBottom: 20 },
  confirmBtn: {
    backgroundColor: LIGHT_TEAL,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmBtnText: { color: BLUE, fontSize: 14, fontWeight: "bold" },
  medFooterText: {
    fontSize: 10,
    color: LIGHT_TEAL,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  checkInContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  checkInBody: { padding: 20 },
  checkInTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
  },
  checkInDesc: { fontSize: 13, color: "#555", marginBottom: 20 },
  completeBtn: {
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  completeBtnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  // Modal & Chat Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  modalScroll: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: "#64748B",
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: BLUE,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F5F9",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: "#fff",
  },
  assistantText: {
    color: "#111",
  },
  loadingBubble: {
    alignSelf: "flex-start",
    padding: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: BLUE,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
