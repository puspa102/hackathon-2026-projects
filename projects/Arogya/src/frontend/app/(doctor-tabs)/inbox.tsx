import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { DoctorHeader } from "@/components/doctor/doctor-header";
import api from "@/services/api";

interface Message {
  id: number;
  sender: number;
  doctor: number;
  message: string;
  is_from_doctor: boolean;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function InboxScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setError(null);
      const res = (await api.getMessages()) as
        | Message[]
        | { results: Message[] };
      const msgs = Array.isArray(res) ? res : ((res as any).results ?? []);
      setMessages(msgs);
    } catch (err: any) {
      console.error("Messages fetch error:", err);
      setError(err?.message ?? "Failed to load messages");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMessages();
  }, [fetchMessages]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <DoctorHeader brandName="Arogya" leftIcon="menu" showAvatarRight />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Loading messages…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.content,
            messages.length === 0 && styles.emptyContent,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0284C7"
            />
          }
        >
          {error && (
            <View style={styles.errorBanner}>
              <MaterialIcons name="wifi-off" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.iconCircle}>
                <MaterialIcons
                  name="mark-email-read"
                  size={48}
                  color="#94A3B8"
                />
              </View>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptySubtitle}>
                You have no messages in your inbox.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Recent Messages</Text>
              {messages.map((msg) => (
                <TouchableOpacity
                  key={msg.id}
                  style={styles.messageCard}
                  activeOpacity={0.8}
                >
                  <View style={styles.avatarCircle}>
                    <MaterialIcons name="person" size={22} color="#0284C7" />
                  </View>
                  <View style={styles.messageContent}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageSender}>
                        {msg.is_from_doctor
                          ? "You (Doctor)"
                          : `Patient #${msg.sender}`}
                      </Text>
                      <Text style={styles.messageTime}>
                        {timeAgo(msg.created_at)}
                      </Text>
                    </View>
                    <Text style={styles.messagePreview} numberOfLines={2}>
                      {msg.message}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  emptyContent: { flex: 1, justifyContent: "center" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 15, color: "#64748B" },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, color: "#DC2626", flex: 1 },

  emptyState: { alignItems: "center", paddingHorizontal: 40 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  messageCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  messageContent: { flex: 1 },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  messageSender: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  messageTime: { fontSize: 12, color: "#94A3B8" },
  messagePreview: { fontSize: 14, color: "#64748B", lineHeight: 20 },
});
