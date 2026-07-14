import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// No props required — navigation handled via useNavigation hook
export default function HomeScreen() {
  const navigation = useNavigation();

//   const goToLogin = () => navigation.navigate("Login");

  const stats = [
    { value: "26", label: "Districts Monitored" },
    { value: "3", label: "Zone Classifications" },
    { value: "Live", label: "Real-Time Data" },
  ];

  const features = [
    {
      icon: "📊",
      title: "Overview Dashboard",
      desc: "National eco-index at a glance. Track zone distributions, district scores, and live alerts across all 26 Sri Lankan districts.",
      path: "Dashboard",
    },
    {
      icon: "🧮",
      title: "Calculate Score",
      desc: "Simulate any district's environmental resilience by adjusting canopy cover, precipitation, and industrial footprint parameters.",
      path: "Calculate",
    },
    {
      icon: "🗺️",
      title: "Interactive Map",
      desc: "Visualise destruction zones on a live map. Red markers for critical areas, yellow for moderate risk, green for stable ecosystems.",
      path: "Map",
    },
  ];

  const zones = [
    {
      color: "#f43f5e",
      light: "#fff1f2",
      border: "#ffe4e6",
      text: "#e11d48",
      zone: "Red Zone",
      range: "Score < 45",
      desc: "Critical ecological distress. Immediate intervention required.",
    },
    {
      color: "#fbbf24",
      light: "#fffbeb",
      border: "#fef3c7",
      text: "#d97706",
      zone: "Yellow Zone",
      range: "Score 45–69",
      desc: "Moderate vulnerability. Passive surveillance active.",
    },
    {
      color: "#10b981",
      light: "#ecfdf5",
      border: "#d1fae5",
      text: "#059669",
      zone: "Green Zone",
      range: "Score ≥ 70",
      desc: "Optimal ecosystem stability. Preservation mode active.",
    },
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
        {/* <View style={styles.navbarRight}>
          <TouchableOpacity onPress={goToLogin} style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToLogin} style={styles.getStartedBtn}>
            <Text style={styles.getStartedBtnText}>Get Started →</Text>
          </TouchableOpacity>
        </View> */}
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
        {/* <View style={styles.heroButtonRow}>
          <TouchableOpacity onPress={goToLogin} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Enter Platform →</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToLogin} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>View Live Map</Text>
          </TouchableOpacity>
        </View> */}
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

      {/* FEATURES */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Platform Features</Text>
        <View style={styles.featuresWrap}>
          {features.map((f) => (
            <TouchableOpacity
              key={f.title}
            //   onPress={goToLogin}
              style={styles.featureCard}
              activeOpacity={0.8}
            >
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
              <Text style={styles.featureLink}>Explore →</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ZONE LEGEND */}
      <View style={styles.section}>
        <View style={styles.legendCard}>
          <Text style={styles.sectionLabel}>Zone Classification System</Text>
          <View style={styles.legendWrap}>
            {zones.map((z) => (
              <View
                key={z.zone}
                style={[
                  styles.legendItem,
                  { backgroundColor: z.light, borderColor: z.border },
                ]}
              >
                <View style={styles.legendHeader}>
                  <View style={[styles.legendDot, { backgroundColor: z.color }]} />
                  <Text style={[styles.legendZone, { color: z.text }]}>
                    {z.zone}
                  </Text>
                </View>
                <Text style={styles.legendRange}>{z.range}</Text>
                <Text style={styles.legendDesc}>{z.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.section}>
        <TouchableOpacity
        //   onPress={goToLogin}
          style={styles.ctaCard}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaTitle}>
            Ready to monitor Sri Lanka's ecosystems?
          </Text>
          <Text style={styles.ctaSubtitle}>
            Sign in to access the dashboard, calculator, and live interactive
            map.
          </Text>
          <View style={styles.ctaBtn}>
            <Text style={styles.ctaBtnText}>Enter EnviroScore Map →</Text>
          </View>
        </TouchableOpacity>
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

  // FEATURES
  featuresWrap: { gap: 12 },
  featureCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f1f1",
    borderRadius: 18,
    padding: 20,
  },
  featureIcon: { fontSize: 22, marginBottom: 12 },
  featureTitle: { fontSize: 14, fontWeight: "900", marginBottom: 6 },
  featureDesc: {
    fontSize: 11,
    color: "#9ca3af",
    lineHeight: 17,
    marginBottom: 12,
  },
  featureLink: { fontSize: 10, fontWeight: "900", color: "#9ca3af" },

  // ZONE LEGEND
  legendCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f1f1",
    borderRadius: 18,
    padding: 20,
  },
  legendWrap: { gap: 12 },
  legendItem: { borderWidth: 1, borderRadius: 14, padding: 14 },
  legendHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendZone: { fontSize: 11, fontWeight: "900" },
  legendRange: { fontSize: 10, fontWeight: "900", color: "#6b7280", marginBottom: 4 },
  legendDesc: { fontSize: 10, color: "#9ca3af", lineHeight: 15 },

  // CTA
  ctaCard: {
    backgroundColor: "#000",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
  },
  ctaTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  ctaSubtitle: {
    color: "#9ca3af",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 18,
  },
  ctaBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
  },
  ctaBtnText: { color: "#000", fontSize: 12, fontWeight: "900" },

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