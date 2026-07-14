import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

type Stat = {
  value: string;
  label: string;
};

// No props required — navigation handled via expo-router's useRouter hook
export default function Index() {
  const router = useRouter();

  // Cast as `any` until app/login.tsx and app/home.tsx exist —
  // once those route files are added, Expo Router's typed routes
  // will recognize them and you can drop the `as any`.
  const goToLogin = () => router.push("/login" as any);
  const goToHome = () => router.push("/home" as any);

  const stats: Stat[] = [
    { value: "26", label: "Districts Monitored" },
    { value: "3", label: "Zone Classifications" },
    { value: "Live", label: "Real-Time Data" },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      {/* NAVBAR */}
      <View style={styles.navbar}>
        <View style={styles.navbarLeft}>
          <View style={styles.logoDot}>
            <Text style={{ fontSize: 12 }}>🗺️</Text>
          </View>
          <Text style={styles.logoText}>EnviroScore-Map</Text>
        </View>
        <View style={styles.navbarRight}>
          <TouchableOpacity onPress={goToLogin} style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
          {/* Get Started now navigates straight to the Home page */}
          <TouchableOpacity onPress={goToHome} style={styles.getStartedBtn}>
            <Text style={styles.getStartedBtnText}>Get Started →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>
            Live Environmental Monitoring — Sri Lanka
          </Text>
        </View>
        <Text style={styles.heroTitle}>
          EnviroScore{"\n"}
          <Text style={styles.heroTitleMuted}>Map</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          A data science platform tracking environmental destruction across
          all 26 Sri Lankan districts. Simulate ecosystems, identify danger
          zones, and visualise green resilience in real time.
        </Text>
        <View style={styles.heroButtonRow}>
          <TouchableOpacity onPress={goToHome} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Enter Platform →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToLogin} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>View Live Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* STATS STRIP */}
      <View style={styles.statsCard}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* PLATFORM FEATURES — heading kept, everything below it removed */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Platform Features</Text>
      </View>

      <Text style={styles.footer}>
        © 2026 EnviroScore Map Inc. — RAD 3rd Semester Project
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // NAVBAR
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  navbarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  navbarRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  logoDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoText: {
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  loginBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  loginBtnText: { fontSize: 11, fontWeight: "900", color: "#6b7280" },
  getStartedBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#000",
    borderRadius: 999,
  },
  getStartedBtnText: { fontSize: 11, fontWeight: "900", color: "#fff" },

  // HERO
  hero: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: "center",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f1f1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#6b7280",
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 46,
    marginBottom: 14,
  },
  heroTitleMuted: { color: "#d1d5db" },
  heroSubtitle: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 26,
    maxWidth: 340,
  },
  heroButtonRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  primaryBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: "#000",
    borderRadius: 999,
  },
  primaryBtnText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  secondaryBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
  },
  secondaryBtnText: { color: "#000", fontSize: 12, fontWeight: "900" },

  // STATS
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f1f1",
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 28,
    justifyContent: "space-between",
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 24, fontWeight: "900" },
  statLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: "center",
  },

  // SECTION
  section: { paddingHorizontal: 24, marginBottom: 28 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 16,
  },

  // FOOTER
  footer: {
    textAlign: "center",
    fontSize: 9,
    color: "#d1d5db",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 8,
  },
});