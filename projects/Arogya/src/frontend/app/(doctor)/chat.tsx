import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { authStorage } from "@/services/storage";
import { API_BASE_URL } from "@/services/config";
import { useAuth } from "@/services/AuthContext";

const BLUE = "#2A7B88";
const LIGHT_BLUE = "#E6F2F4";
const BG = "#F8F9FB";
const GRAY = "#7A8CA3";
const BORDER = "#E5E7EB";

interface Message {
  id: number;
  sender: number;
  sender_name: string;
  doctor: number | null;
  doctor_name: string | null;
  message: string;
  is_from_doctor: boolean;
  created_at: string;
}

function timeLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const params = useLocalSearchParams();
  const doctorId = params.doctorId ? Number(params.doctorId) : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const token = await authStorage.getToken();
      const res = await fetch(`${API_BASE_URL}/chat/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      const msgs: Message[] = Array.isArray(data) ? data : (data.results ?? []);
      setMessages(msgs.reverse()); // oldest first
    } catch (err: any) {
      setError(err?.message ?? "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const token = await authStorage.getToken();
      const body: any = { message: message.trim() };
      if (doctorId) body.doctor = doctorId;

      const res = await fetch(`${API_BASE_URL}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to send message");
      }
      const newMsg: Message = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setMessage("");
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const myId = state.user?.id;
  const isDoctor = state.user?.role === "doctor";

  const chatTitle = isDoctor
    ? "Patient Messages"
    : messages[0]?.doctor_name
      ? `Dr. ${messages[0].doctor_name}`
      : "Doctor Chat";

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/(tabs)" as any)
          }
          style={{ padding: 8 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{chatTitle}</Text>
          <Text style={styles.headerStatus}>Arogya Health</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionIcon}>
            <MaterialIcons name="videocam" size={24} color={BLUE} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <MaterialIcons name="call" size={24} color={BLUE} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={BLUE} />
            <Text style={styles.loadingText}>Loading messages…</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {error && (
              <View style={styles.errorBanner}>
                <MaterialIcons name="wifi-off" size={14} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {messages.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={48}
                  color="#CBD5E1"
                />
                <Text style={styles.emptyTitle}>No messages yet</Text>
                <Text style={styles.emptySub}>
                  Send a message to start the conversation.
                </Text>
              </View>
            )}

            {messages.map((msg) => {
              const isMine = msg.sender === myId;
              return (
                <View
                  key={msg.id}
                  style={isMine ? styles.messageRight : styles.messageLeft}
                >
                  <View style={isMine ? styles.bubbleRight : styles.bubbleLeft}>
                    <Text style={isMine ? styles.textRight : styles.textLeft}>
                      {String(msg.message)}
                    </Text>
                  </View>
                  <Text style={isMine ? styles.timeRight : styles.timeLeft}>
                    {timeLabel(msg.created_at)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <View style={styles.textInputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor={GRAY}
                value={message}
                onChangeText={setMessage}
                multiline
                editable={!sending}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!message.trim() || sending) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!message.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialIcons
                  name="send"
                  size={20}
                  color="#fff"
                  style={{ marginLeft: 2 }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerInfo: { flex: 1, marginLeft: 4 },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#111" },
  headerStatus: { fontSize: 12, color: GRAY },
  headerActions: { flexDirection: "row", alignItems: "center" },
  actionIcon: { padding: 8, marginLeft: 8 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 15, color: GRAY },
  scrollContent: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: BG,
    flexGrow: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { fontSize: 13, color: "#DC2626", flex: 1 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  emptySub: { fontSize: 14, color: GRAY, textAlign: "center" },
  messageRight: {
    alignSelf: "flex-end",
    maxWidth: "80%",
    marginBottom: 16,
  },
  bubbleRight: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderTopRightRadius: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  textRight: { fontSize: 15, color: "#111", lineHeight: 22 },
  timeRight: {
    fontSize: 11,
    color: GRAY,
    textAlign: "right",
    marginTop: 4,
  },
  messageLeft: {
    alignSelf: "flex-start",
    maxWidth: "80%",
    marginBottom: 16,
  },
  bubbleLeft: {
    backgroundColor: BLUE,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    padding: 14,
  },
  textLeft: { fontSize: 15, color: "#fff", lineHeight: 22 },
  timeLeft: { fontSize: 11, color: GRAY, marginTop: 4 },
  inputContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  textInput: { fontSize: 15, color: "#111", maxHeight: 100 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.5 },
});
