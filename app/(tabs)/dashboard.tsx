import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

interface DashboardProps {
  user: { username: string; role: string } | null;
  onLogout: () => void;
}

const DISTRICT_STATS = [
  { name: "Colombo", score: 52, zone: "Yellow", trend: -2.1, temp: 29, condition: "Mostly Cloudy" },
  { name: "Kalutara", score: 78, zone: "Green", trend: 1.4, temp: 28, condition: "Partly Cloudy" },
  { name: "Galle", score: 71, zone: "Green", trend: 0.8, temp: 28, condition: "Light Rain" },
  { name: "Jaffna", score: 34, zone: "Red", trend: -3.5, temp: 31, condition: "Sunny" },
  { name: "Kandy", score: 67, zone: "Green", trend: 0.3, temp: 25, condition: "Cloudy" },
  { name: "Anuradhapura", score: 39, zone: "Red", trend: -1.9, temp: 32, condition: "Sunny" },
  { name: "Gampaha", score: 55, zone: "Yellow", trend: -0.7, temp: 29, condition: "Mostly Cloudy" },
  { name: "Nuwara Eliya", score: 82, zone: "Green", trend: 2.1, temp: 18, condition: "Heavy Rain" },
] as const;

type Zone = "Green" | "Yellow" | "Red";

const ZONE_HEX: Record<Zone, string> = {
  Green: "#10b981",
  Yellow: "#fbbf24",
  Red: "#f43f5e",
};

const ZONE_TEXT: Record<Zone, string> = {
  Green: "#059669",
  Yellow: "#d97706",
  Red: "#e11d48",
};

const ZONE_BG: Record<Zone, { bg: string; border: string }> = {
  Green: { bg: "#ecfdf5", border: "#d1fae5" },
  Yellow: { bg: "#fffbeb", border: "#fef3c7" },
  Red: { bg: "#fff1f2", border: "#ffe4e6" },
};

const { width: SCREEN_W } = Dimensions.get("window");
const IS_TABLET = SCREEN_W >= 768;

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const navigation = useNavigation<any>();
  const [activeAlert, setActiveAlert] = useState(0);
  const animatedWidths = useRef(DISTRICT_STATS.map(() => new Animated.Value(0))).current;

  const greenCount = DISTRICT_STATS.filter((d) => d.zone === "Green").length;
  const yellowCount = DISTRICT_STATS.filter((d) => d.zone === "Yellow").length;
  const redCount = DISTRICT_STATS.filter((d) => d.zone === "Red").length;
  const avgScore = Math.round(DISTRICT_STATS.reduce((s, d) => s + d.score, 0) / DISTRICT_STATS.length);

  const alerts: { district: string; msg: string; zone: Zone }[] = [
    { district: "Jaffna", msg: "Critical drought stress detected — score dropped to 34/100.", zone: "Red" },
    { district: "Anuradhapura", msg: "Seasonal dry spell at peak. Soil moisture at 18% — intervention needed.", zone: "Red" },
    { district: "Colombo", msg: "Urban heat island effect intensifying. Green canopy below threshold.", zone: "Yellow" },
  ];

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animations = DISTRICT_STATS.map((d, i) =>
        Animated.timing(animatedWidths[i], {
          toValue: d.score,
          duration: 900,
          delay: i * 80,
          useNativeDriver: false,
        })
      );
      Animated.parallel(animations).start();
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlert((prev) => (prev + 1) % alerts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const alert = alerts[activeAlert];

  const navLinks = [
    { label: "Overview", screen: "Dashboard" },
    { label: "Calculate Score", screen: "Calculate" },
    { label: "Interactive Map", screen: "Map" },
    { label: "Weather Analytics", screen: "Weather", params: { districtName: "colombo" } },
  ];

  const statCards = [
    { label: "National Avg Score", value: `${avgScore}`, unit: "/100", icon: "📊", sub: "Across 26 districts" },
    { label: "Green Zones", value: `${greenCount}`, unit: " districts", icon: "🌿", sub: "Optimal resilience", color: "#059669" },
    { label: "At-Risk Zones", value: `${redCount}`, unit: " critical", icon: "⚠️", sub: "Immediate action needed", color: "#e11d48" },
    { label: "Active Data Nodes", value: "26", unit: " live", icon: "📡", sub: "Real-time monitoring" },
  ];

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
          <View style={styles.userBlock}>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.userName}>{user?.username || "Guest"}</Text>
              <Text style={styles.userRole}>{user?.role || "Viewer"}</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {IS_TABLET && (
          <View style={styles.navLinksRow}>
            {navLinks.map((link) => (
              <TouchableOpacity
                key={link.label}
                onPress={() => navigation.navigate(link.screen, link.params)}
                style={[styles.navLinkBtn, link.screen === "Dashboard" && styles.navLinkBtnActive]}
              >
                <Text style={[styles.navLinkText, link.screen === "Dashboard" && styles.navLinkTextActive]}>
                  {link.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Mobile nav links (scrollable row) if not tablet */}
        {!IS_TABLET && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            {navLinks.map((link) => (
              <TouchableOpacity
                key={link.label}
                onPress={() => navigation.navigate(link.screen, link.params)}
                style={[
                  styles.navLinkBtnMobile,
                  link.screen === "Dashboard" && styles.navLinkBtnActive,
                ]}
              >
                <Text style={[styles.navLinkText, link.screen === "Dashboard" && styles.navLinkTextActive]}>
                  {link.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* PAGE HEADER */}
        <View style={styles.pageHeaderRow}>
          <View>
            <Text style={styles.eyebrow}>OVERVIEW DASHBOARD</Text>
            <Text style={styles.pageTitle}>Sri Lanka</Text>
            <Text style={[styles.pageTitle, styles.pageTitleMuted]}>Environmental Index</Text>
          </View>
          <View style={styles.headerBtnRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate("Calculate")}>
              <Text style={styles.primaryBtnText}>+ Run Simulation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate("Map")}>
              <Text style={styles.secondaryBtnText}>View Live Map →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ALERT TICKER */}
        <View style={[styles.alertBox, { backgroundColor: ZONE_BG[alert.zone].bg, borderColor: ZONE_BG[alert.zone].border }]}>
          <View style={[styles.alertDot, { backgroundColor: ZONE_HEX[alert.zone] }]} />
          <Text style={[styles.alertDistrict, { color: ZONE_TEXT[alert.zone] }]}>{alert.district}</Text>
          <Text style={styles.alertMsg} numberOfLines={2}>{alert.msg}</Text>
          <Text style={styles.alertCount}>{activeAlert + 1}/{alerts.length}</Text>
        </View>

        {/* TOP STAT CARDS */}
        <View style={styles.statsGrid}>
          {statCards.map((card) => (
            <View key={card.label} style={styles.statCard}>
              <View style={styles.statCardHeader}>
                <Text style={styles.statCardLabel}>{card.label}</Text>
                <Text style={{ fontSize: 15 }}>{card.icon}</Text>
              </View>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValue, card.color ? { color: card.color } : null]}>{card.value}</Text>
                <Text style={styles.statUnit}>{card.unit}</Text>
              </View>
              <Text style={styles.statSub}>{card.sub}</Text>
            </View>
          ))}
        </View>

        {/* ZONE DISTRIBUTION BAR */}
        <View style={styles.panel}>
          <View style={styles.zoneHeaderRow}>
            <View>
              <Text style={styles.eyebrowSmall}>ZONE DISTRIBUTION</Text>
              <Text style={styles.panelSubTitle}>8 Districts Monitored</Text>
            </View>
            <View style={styles.zoneLegendRow}>
              <View style={styles.zoneLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: ZONE_HEX.Green }]} />
                <Text style={[styles.legendText, { color: ZONE_TEXT.Green }]}>Green {greenCount}</Text>
              </View>
              <View style={styles.zoneLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: ZONE_HEX.Yellow }]} />
                <Text style={[styles.legendText, { color: ZONE_TEXT.Yellow }]}>Yellow {yellowCount}</Text>
              </View>
              <View style={styles.zoneLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: ZONE_HEX.Red }]} />
                <Text style={[styles.legendText, { color: ZONE_TEXT.Red }]}>Red {redCount}</Text>
              </View>
            </View>
          </View>
          <View style={styles.distributionBar}>
            <View style={{ flex: greenCount, backgroundColor: ZONE_HEX.Green }} />
            <View style={{ flex: yellowCount, backgroundColor: ZONE_HEX.Yellow }} />
            <View style={{ flex: redCount, backgroundColor: ZONE_HEX.Red }} />
          </View>
        </View>

        {/* DISTRICT SCORE LIST */}
        <View style={styles.panel}>
          <View style={styles.zoneHeaderRow}>
            <View>
              <Text style={styles.eyebrowSmall}>DISTRICT PERFORMANCE</Text>
              <Text style={styles.panelSubTitle}>Live Eco-Score Index</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Calculate")}>
              <Text style={styles.runAnalysisLink}>Run Analysis →</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 12, marginTop: 6 }}>
            {DISTRICT_STATS.map((d, i) => (
              <View key={d.name} style={styles.districtRow}>
                <Text style={styles.districtName}>{d.name}</Text>
                <View style={styles.districtBarTrack}>
                  <Animated.View
                    style={[
                      styles.districtBarFill,
                      {
                        backgroundColor: ZONE_HEX[d.zone as Zone],
                        width: animatedWidths[i].interpolate({
                          inputRange: [0, 100],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.districtScore}>{d.score}</Text>
                <Text style={[styles.districtTrend, { color: d.trend > 0 ? "#059669" : "#f43f5e" }]}>
                  {d.trend > 0 ? "▲" : "▼"} {Math.abs(d.trend)}
                </Text>
                <View style={[styles.districtDot, { backgroundColor: ZONE_HEX[d.zone as Zone] }]} />
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footerText}>© 2026 EnviroScore Map Inc. — All 26 District Nodes Active</Text>
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

  userBlock: { flexDirection: "row", alignItems: "center", gap: 10 },
  userName: { fontSize: 11, fontWeight: "900" },
  userRole: { fontSize: 9, color: "#9ca3af", fontWeight: "700", letterSpacing: 1, marginTop: 1 },
  logoutBtn: { backgroundColor: "#000", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  logoutBtnText: { color: "#fff", fontSize: 11, fontWeight: "900" },

  navLinksRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 999,
    padding: 4,
    marginTop: 10,
    gap: 2,
    alignSelf: "flex-start",
  },
  navLinkBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  navLinkBtnMobile: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 6,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  navLinkBtnActive: { backgroundColor: "#000" },
  navLinkText: { fontSize: 11, fontWeight: "900", color: "#9ca3af" },
  navLinkTextActive: { color: "#fff" },

  mainContent: { padding: 16, gap: 16, paddingBottom: 40 },

  pageHeaderRow: { gap: 14 },
  eyebrow: { fontSize: 10, fontWeight: "900", color: "#9ca3af", letterSpacing: 1.5 },
  pageTitle: { fontSize: 28, fontWeight: "900", color: "#000", letterSpacing: -0.5, lineHeight: 32 },
  pageTitleMuted: { color: "#d1d5db" },
  headerBtnRow: { flexDirection: "row", gap: 8 },
  primaryBtn: { backgroundColor: "#000", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  primaryBtnText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  secondaryBtnText: { fontSize: 11, fontWeight: "900", color: "#000" },

  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  alertDot: { width: 8, height: 8, borderRadius: 4 },
  alertDistrict: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  alertMsg: { flex: 1, fontSize: 11, color: "#6b7280" },
  alertCount: { fontSize: 9, color: "#d1d5db", fontWeight: "700" },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: IS_TABLET ? "23.5%" : "47.5%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 16,
    padding: 14,
  },
  statCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  statCardLabel: { fontSize: 9, fontWeight: "900", color: "#9ca3af", letterSpacing: 0.5, flex: 1, marginRight: 6 },
  statValueRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  statValue: { fontSize: 24, fontWeight: "900", color: "#000", letterSpacing: -0.5 },
  statUnit: { fontSize: 10, color: "#9ca3af", fontWeight: "700" },
  statSub: { fontSize: 9, color: "#9ca3af", marginTop: 4 },

  panel: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  zoneHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  eyebrowSmall: { fontSize: 9, fontWeight: "900", color: "#9ca3af", letterSpacing: 1 },
  panelSubTitle: { fontSize: 13, fontWeight: "900", color: "#000", marginTop: 2 },
  zoneLegendRow: { flexDirection: "row", gap: 12 },
  zoneLegendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { fontSize: 10, fontWeight: "900" },

  distributionBar: { flexDirection: "row", height: 12, borderRadius: 999, overflow: "hidden" },

  runAnalysisLink: { fontSize: 10, fontWeight: "900", color: "#9ca3af" },

  districtRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  districtName: { fontSize: 11, fontWeight: "900", color: "#4b5563", width: 84 },
  districtBarTrack: { flex: 1, height: 8, backgroundColor: "#f3f4f6", borderRadius: 999, overflow: "hidden" },
  districtBarFill: { height: "100%", borderRadius: 999 },
  districtScore: { fontSize: 11, fontWeight: "900", color: "#000", width: 24, textAlign: "right" },
  districtTrend: { fontSize: 9, fontWeight: "900", width: 42 },
  districtDot: { width: 7, height: 7, borderRadius: 4 },

  footerText: {
    textAlign: "center",
    fontSize: 9,
    color: "#d1d5db",
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 12,
  },
});