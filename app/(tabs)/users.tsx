import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { authAPI } from "../../lib/api";
import { User } from "../../types";

const ROLE_BADGE: Record<string, { bg: string; text: string }> = {
  admin: { bg: "#fef3c7", text: "#92400e" },
  analyst: { bg: "#dbeafe", text: "#1e40af" },
  viewer: { bg: "#f3f4f6", text: "#6b7280" },
};

export default function UsersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      router.replace("/(tabs)");
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authAPI.getAllUsers();
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return null;
  }

  const adminCount = users.filter((u) => u.role === "admin").length;
  const analystCount = users.filter((u) => u.role === "analyst").length;
  const viewerCount = users.filter((u) => u.role === "viewer").length;

  return (
    <SafeAreaView style={styles.screen}>
      {/* NAVBAR */}
      <View style={styles.navbar}>
        <View style={styles.navTop}>
          <View style={styles.navBrand}>
            <View style={styles.navLogo}>
              <Text style={{ fontSize: 12 }}>🗺️</Text>
            </View>
            <Text style={styles.navBrandText}>ENVIROSCORE-MAP</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <Text style={styles.backLink}>← Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* PAGE HEADER */}
        <View>
          <Text style={styles.eyebrow}>ADMIN PANEL</Text>
          <Text style={styles.pageTitle}>Registered Users</Text>
          <Text style={[styles.pageTitle, styles.pageTitleMuted]}>
            Platform Accounts
          </Text>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: "#f9fafb" }]}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: "#fef3c7" }]}>
            <Text style={[styles.statValue, { color: "#92400e" }]}>{adminCount}</Text>
            <Text style={[styles.statLabel, { color: "#92400e" }]}>Admins</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: "#dbeafe" }]}>
            <Text style={[styles.statValue, { color: "#1e40af" }]}>{analystCount}</Text>
            <Text style={[styles.statLabel, { color: "#1e40af" }]}>Analysts</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: "#ecfdf5" }]}>
            <Text style={[styles.statValue, { color: "#059669" }]}>{viewerCount}</Text>
            <Text style={[styles.statLabel, { color: "#059669" }]}>Viewers</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#000" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : !!error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchUsers}>
              <Text style={styles.retryBtnText}>Retry →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.userList}>
            {users.map((u) => {
              const badge = ROLE_BADGE[u.role] || ROLE_BADGE.viewer;
              return (
                <View key={u.id || u.email} style={styles.userCard}>
                  <View style={styles.userRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {u.name?.charAt(0)?.toUpperCase() || "?"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>{u.name}</Text>
                      <Text style={styles.userEmail}>{u.email}</Text>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.roleBadgeText, { color: badge.text }]}>
                        {u.role?.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  {u.createdAt && (
                    <Text style={styles.userDate}>
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.footerText}>© 2026 EnviroScore Map Inc. — Admin Panel</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f5f7" },

  navbar: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  navTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  navBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
  navLogo: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  navBrandText: { fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  backLink: { fontSize: 11, fontWeight: "900", color: "#9ca3af" },

  mainContent: { padding: 16, gap: 16, paddingBottom: 40 },

  eyebrow: { fontSize: 10, fontWeight: "900", color: "#9ca3af", letterSpacing: 1.5 },
  pageTitle: { fontSize: 28, fontWeight: "900", color: "#000", letterSpacing: -0.5, lineHeight: 32 },
  pageTitleMuted: { color: "#d1d5db" },

  statsRow: { flexDirection: "row", gap: 8 },
  statBox: { flex: 1, borderRadius: 14, padding: 12, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "900", color: "#000" },
  statLabel: { fontSize: 9, fontWeight: "900", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 },

  loadingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    padding: 40,
    alignItems: "center",
    gap: 10,
  },
  loadingText: { fontSize: 11, fontWeight: "700", color: "#9ca3af" },

  errorCard: {
    backgroundColor: "#fff1f2",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ffe4e6",
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  errorText: { fontSize: 11, fontWeight: "700", color: "#e11d48", textAlign: "center" },
  retryBtn: { backgroundColor: "#000", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  retryBtnText: { color: "#fff", fontSize: 11, fontWeight: "900" },

  userList: { gap: 10 },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    padding: 16,
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  userName: { fontSize: 13, fontWeight: "900", color: "#000" },
  userEmail: { fontSize: 10, color: "#9ca3af", marginTop: 1 },
  roleBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  roleBadgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  userDate: { fontSize: 9, color: "#d1d5db", marginTop: 8, fontWeight: "700" },

  footerText: {
    textAlign: "center",
    fontSize: 9,
    color: "#d1d5db",
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 12,
  },
});
