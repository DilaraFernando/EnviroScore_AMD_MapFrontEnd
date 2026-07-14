import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import api from "../../lib/api";

// ─────────────────────────────────────────────────────────────
// District data with coords and default scores
// ─────────────────────────────────────────────────────────────
const DISTRICTS = [
  { id: "colombo", name: "Colombo", province: "Western", lat: 6.9271, lng: 79.8612, score: 52, zone: "Yellow" as const, note: "High urban density. Green canopy below threshold." },
  { id: "gampaha", name: "Gampaha", province: "Western", lat: 7.0917, lng: 80.0, score: 55, zone: "Yellow" as const, note: "Rapid industrial expansion threatening groundwater." },
  { id: "kalutara", name: "Kalutara", province: "Western", lat: 6.5854, lng: 79.9607, score: 78, zone: "Green" as const, note: "Excellent wet zone stability. Minor erosion risk." },
  { id: "kandy", name: "Kandy", province: "Central", lat: 7.2906, lng: 80.6337, score: 67, zone: "Green" as const, note: "Montane micro-climate with localized air quality issues." },
  { id: "matale", name: "Matale", province: "Central", lat: 7.4675, lng: 80.6234, score: 61, zone: "Yellow" as const, note: "Agriculture and forest transition zone." },
  { id: "nuwaraeliya", name: "Nuwara Eliya", province: "Central", lat: 6.9497, lng: 80.7891, score: 82, zone: "Green" as const, note: "High-altitude cloud forest. Outstanding carbon sink." },
  { id: "galle", name: "Galle", province: "Southern", lat: 6.0535, lng: 80.221, score: 71, zone: "Green" as const, note: "Coastal reef ecosystem. Urban coastline pressure rising." },
  { id: "matara", name: "Matara", province: "Southern", lat: 5.9549, lng: 80.555, score: 65, zone: "Green" as const, note: "Coastal erosion from tourism pressure increasing." },
  { id: "hambantota", name: "Hambantota", province: "Southern", lat: 6.1241, lng: 81.1185, score: 48, zone: "Yellow" as const, note: "Port development threatening mangrove ecosystems." },
  { id: "jaffna", name: "Jaffna", province: "Northern", lat: 9.6615, lng: 80.0255, score: 34, zone: "Red" as const, note: "CRITICAL: Arid limestone zone. Severe drought stress." },
  { id: "kilinochchi", name: "Kilinochchi", province: "Northern", lat: 9.3803, lng: 80.4037, score: 43, zone: "Yellow" as const, note: "Post-conflict recovery. Land degradation significant." },
  { id: "mannar", name: "Mannar", province: "Northern", lat: 8.981, lng: 79.9044, score: 38, zone: "Red" as const, note: "CRITICAL: Salt mining destroying wetland habitats." },
  { id: "mullaitivu", name: "Mullaitivu", province: "Northern", lat: 9.2671, lng: 80.8128, score: 56, zone: "Yellow" as const, note: "Lagoon recovery zone. Reforestation targets needed." },
  { id: "vavuniya", name: "Vavuniya", province: "Northern", lat: 8.7514, lng: 80.4971, score: 44, zone: "Yellow" as const, note: "Vanni forest belt encroachment growing concern." },
  { id: "batticaloa", name: "Batticaloa", province: "Eastern", lat: 7.717, lng: 81.7004, score: 57, zone: "Yellow" as const, note: "Lagoon salinity stress. Mangrove degradation." },
  { id: "ampara", name: "Ampara", province: "Eastern", lat: 7.2997, lng: 81.6747, score: 62, zone: "Yellow" as const, note: "Seasonal flooding threatening fertile basin zones." },
  { id: "trincomalee", name: "Trincomalee", province: "Eastern", lat: 8.5874, lng: 81.2152, score: 59, zone: "Yellow" as const, note: "Marine pollution from shipping traffic." },
  { id: "kurunegala", name: "Kurunegala", province: "North Western", lat: 7.4818, lng: 80.3609, score: 58, zone: "Yellow" as const, note: "Mono-crop agriculture reducing soil biodiversity." },
  { id: "puttalam", name: "Puttalam", province: "North Western", lat: 8.0362, lng: 79.8283, score: 47, zone: "Yellow" as const, note: "Prawn farming degrading wetland habitats." },
  { id: "anuradhapura", name: "Anuradhapura", province: "North Central", lat: 8.3114, lng: 80.4037, score: 39, zone: "Red" as const, note: "CRITICAL: Chronic dry spells. Critical soil moisture management." },
  { id: "polonnaruwa", name: "Polonnaruwa", province: "North Central", lat: 7.9403, lng: 81.0188, score: 46, zone: "Yellow" as const, note: "Tank siltation and catchment deforestation." },
  { id: "badulla", name: "Badulla", province: "Uva", lat: 6.9934, lng: 81.055, score: 64, zone: "Yellow" as const, note: "Tea monoculture degrading biodiversity corridors." },
  { id: "moneragala", name: "Moneragala", province: "Uva", lat: 6.8728, lng: 81.3507, score: 53, zone: "Yellow" as const, note: "Elephant corridor fragmentation escalating." },
  { id: "ratnapura", name: "Ratnapura", province: "Sabaragamuwa", lat: 6.6828, lng: 80.4005, score: 60, zone: "Yellow" as const, note: "Gem mining causing severe river sedimentation." },
  { id: "kegalle", name: "Kegalle", province: "Sabaragamuwa", lat: 7.2513, lng: 80.3464, score: 66, zone: "Green" as const, note: "Landslide risk increasing with slope deforestation." },
];

type Zone = "Green" | "Yellow" | "Red";
type District = typeof DISTRICTS[0];

const ZONE_HEX: Record<Zone, string> = {
  Green: "#10b981",
  Yellow: "#f59e0b",
  Red: "#f43f5e",
};

const scoreToZone = (score: number): Zone => (score >= 70 ? "Green" : score < 45 ? "Red" : "Yellow");

const { width: SCREEN_W } = Dimensions.get("window");
const IS_TABLET = SCREEN_W >= 768;

export default function InteractiveMap() {
  const navigation = useNavigation<any>();
  const [selectedDistrict, setSelectedDistrict] = useState<(District & { score: number; zone: Zone }) | null>(null);
  const [filterZone, setFilterZone] = useState<Zone | "All">("All");
  const [dbScores, setDbScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(!IS_TABLET); // on phones, list is a collapsible panel

  useEffect(() => {
    api
      .get("/calculate/all")
      .then((res) => {
        const map: Record<string, number> = {};
        res.data.forEach((item: any) => {
          map[item.districtId] = item.score;
        });
        setDbScores(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredDistricts =
    filterZone === "All" ? DISTRICTS : DISTRICTS.filter((d) => scoreToZone(dbScores[d.id] ?? d.score) === filterZone);

  const sortedDistricts = [...filteredDistricts].sort(
    (a, b) => (dbScores[a.id] ?? a.score) - (dbScores[b.id] ?? b.score)
  );

  const greenCount = DISTRICTS.filter((d) => scoreToZone(dbScores[d.id] ?? d.score) === "Green").length;
  const redCount = DISTRICTS.filter((d) => scoreToZone(dbScores[d.id] ?? d.score) === "Red").length;
  const yellowCount = DISTRICTS.length - greenCount - redCount;

  const selectDistrict = (d: District) => {
    const score = dbScores[d.id] ?? d.score;
    const zone = scoreToZone(score);
    setSelectedDistrict({ ...d, score, zone });
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* NAVBAR */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navBrand} onPress={() => navigation.navigate("Dashboard")}>
          <View style={styles.navLogo}>
            <Text style={{ fontSize: 12 }}>🗺️</Text>
          </View>
          <Text style={styles.navBrandText}>ENVIROSCORE-MAP</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Calculate")}>
          <Text style={styles.navAdd}>+ Add Score</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* MAP AREA */}
        <View style={styles.mapArea}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude: 7.8731,
              longitude: 80.7718,
              latitudeDelta: 3.2,
              longitudeDelta: 3.2,
            }}
          >
            {filteredDistricts.map((d) => {
              const score = dbScores[d.id] ?? d.score;
              const zone = scoreToZone(score);
              const color = ZONE_HEX[zone];
              return (
                <Marker
                  key={d.id}
                  coordinate={{ latitude: d.lat, longitude: d.lng }}
                  onPress={() => selectDistrict(d)}
                  tracksViewChanges={false}
                >
                  <View style={[styles.markerDot, { backgroundColor: color }]}>
                    <Text style={styles.markerText}>{score}</Text>
                  </View>
                </Marker>
              );
            })}
          </MapView>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#000" />
              <Text style={styles.loadingText}>LOADING MAP...</Text>
            </View>
          )}

          {/* Toggle list button (phones) */}
          {!IS_TABLET && (
            <TouchableOpacity style={styles.listToggle} onPress={() => setShowList((s) => !s)}>
              <Text style={styles.listToggleText}>{showList ? "✕" : "☰ Districts"}</Text>
            </TouchableOpacity>
          )}

          {/* Info Panel */}
          {selectedDistrict && (
            <View style={styles.infoPanel}>
              <View style={styles.infoPanelHeader}>
                <View>
                  <Text style={styles.infoProvince}>{selectedDistrict.province} PROVINCE</Text>
                  <Text style={styles.infoName}>{selectedDistrict.name}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedDistrict(null)}>
                  <Text style={styles.infoClose}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.infoScoreRow}>
                <Text style={styles.infoScore}>{selectedDistrict.score}</Text>
                <View>
                  <View
                    style={[
                      styles.zoneBadge,
                      { backgroundColor: ZONE_HEX[selectedDistrict.zone] },
                    ]}
                  >
                    <Text style={styles.zoneBadgeText}>● {selectedDistrict.zone} Zone</Text>
                  </View>
                  <Text style={styles.infoOutOf}>/100 environmental score</Text>
                </View>
              </View>
              <Text style={styles.infoNote}>{selectedDistrict.note}</Text>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => navigation.navigate("Calculate")}
              >
                <Text style={styles.infoButtonText}>
                  Run New Analysis for {selectedDistrict.name} →
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* SIDEBAR / LIST PANEL */}
        {(IS_TABLET || showList) && (
          <View style={[styles.sidebar, !IS_TABLET && styles.sidebarOverlay]}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarEyebrow}>LIVE MAP</Text>
              <Text style={styles.sidebarTitle}>Sri Lanka Environmental</Text>
              <Text style={[styles.sidebarTitle, styles.sidebarTitleMuted]}>Destruction Zones</Text>

              {/* Stats */}
              <View style={styles.statsRow}>
                {[
                  { label: "Green", count: greenCount, bg: "#ecfdf5", fg: "#059669", dot: "#10b981" },
                  { label: "Yellow", count: yellowCount, bg: "#fffbeb", fg: "#d97706", dot: "#fbbf24" },
                  { label: "Red", count: redCount, bg: "#fff1f2", fg: "#e11d48", dot: "#f43f5e" },
                ].map((s) => (
                  <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statCount, { color: s.fg }]}>{s.count}</Text>
                    <View style={styles.statLabelRow}>
                      <View style={[styles.statDot, { backgroundColor: s.dot }]} />
                      <Text style={[styles.statLabel, { color: s.fg }]}>{s.label}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Filter */}
              <View style={styles.filterRow}>
                {(["All", "Green", "Yellow", "Red"] as const).map((z) => (
                  <TouchableOpacity
                    key={z}
                    onPress={() => setFilterZone(z)}
                    style={[styles.filterBtn, filterZone === z && styles.filterBtnActive]}
                  >
                    <Text style={[styles.filterBtnText, filterZone === z && styles.filterBtnTextActive]}>
                      {z}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <Text style={styles.sidebarEyebrow}>MAP LEGEND</Text>
              {[
                { color: "#f43f5e", label: "Red Zone", desc: "Score < 45 — Critical destruction" },
                { color: "#fbbf24", label: "Yellow Zone", desc: "Score 45–69 — Moderate risk" },
                { color: "#10b981", label: "Green Zone", desc: "Score ≥ 70 — Stable ecosystem" },
              ].map((item) => (
                <View key={item.label} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.legendLabel}>{item.label}</Text>
                    <Text style={styles.legendDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* District List */}
            <FlatList
              data={sortedDistricts}
              keyExtractor={(d) => d.id}
              style={{ flex: 1 }}
              renderItem={({ item: d }) => {
                const score = dbScores[d.id] ?? d.score;
                const zone = scoreToZone(score);
                const dotColor = ZONE_HEX[zone];
                const isSelected = selectedDistrict?.id === d.id;
                return (
                  <TouchableOpacity
                    onPress={() => selectDistrict(d)}
                    style={[styles.districtRow, isSelected && styles.districtRowSelected]}
                  >
                    <View style={styles.districtRowTop}>
                      <View style={styles.districtRowLeft}>
                        <View style={[styles.districtDot, { backgroundColor: dotColor }]} />
                        <Text style={[styles.districtName, isSelected && styles.textWhite]}>{d.name}</Text>
                      </View>
                      <Text
                        style={[
                          styles.districtScore,
                          { color: isSelected ? "#fff" : dotColor },
                        ]}
                      >
                        {score}
                      </Text>
                    </View>
                    <Text style={styles.districtProvince}>{d.province}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f5f7" },
  navbar: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  navBrand: { flexDirection: "row", alignItems: "center", gap: 8 },
  navLogo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  navBrandText: { fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
  navAdd: { fontSize: 11, fontWeight: "900", color: "#9ca3af" },

  body: { flex: 1, flexDirection: IS_TABLET ? "row" : "column-reverse" },

  mapArea: { flex: 1, position: "relative" },
  markerDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  markerText: { color: "#fff", fontWeight: "900", fontSize: 10 },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: { fontSize: 11, fontWeight: "900", color: "#9ca3af", letterSpacing: 1 },

  listToggle: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#000",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  listToggleText: { color: "#fff", fontSize: 11, fontWeight: "900" },

  infoPanel: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  infoPanelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  infoProvince: { fontSize: 9, fontWeight: "900", color: "#9ca3af", letterSpacing: 1.5 },
  infoName: { fontSize: 17, fontWeight: "900", color: "#111" },
  infoClose: { fontSize: 20, color: "#9ca3af", paddingHorizontal: 4 },
  infoScoreRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  infoScore: { fontSize: 34, fontWeight: "900", color: "#111" },
  zoneBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-start" },
  zoneBadgeText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  infoOutOf: { fontSize: 9, color: "#9ca3af", marginTop: 4 },
  infoNote: { fontSize: 12, color: "#6b7280", lineHeight: 18, marginBottom: 12 },
  infoButton: { backgroundColor: "#000", borderRadius: 24, paddingVertical: 10, alignItems: "center" },
  infoButtonText: { color: "#fff", fontSize: 11, fontWeight: "900" },

  sidebar: {
    width: IS_TABLET ? 288 : "100%",
    height: IS_TABLET ? "100%" : "55%",
    backgroundColor: "#fff",
    borderRightWidth: IS_TABLET ? 1 : 0,
    borderTopWidth: IS_TABLET ? 0 : 1,
    borderColor: "#f0f0f0",
  },
  sidebarOverlay: {},
  sidebarHeader: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", gap: 10 },
  sidebarEyebrow: { fontSize: 9, fontWeight: "900", color: "#9ca3af", letterSpacing: 1.5, marginBottom: 2 },
  sidebarTitle: { fontSize: 14, fontWeight: "900", color: "#111" },
  sidebarTitleMuted: { color: "#d1d5db" },

  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: "center" },
  statCount: { fontSize: 17, fontWeight: "900" },
  statLabelRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statLabel: { fontSize: 9, fontWeight: "900" },

  filterRow: { flexDirection: "row", gap: 4 },
  filterBtn: { flex: 1, paddingVertical: 7, borderRadius: 10, backgroundColor: "#f9fafb", alignItems: "center" },
  filterBtnActive: { backgroundColor: "#000" },
  filterBtnText: { fontSize: 9, fontWeight: "900", color: "#6b7280" },
  filterBtnTextActive: { color: "#fff" },

  legend: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", gap: 8 },
  legendRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  legendDot: { width: 11, height: 11, borderRadius: 6, marginTop: 2 },
  legendLabel: { fontSize: 10, fontWeight: "900", color: "#111" },
  legendDesc: { fontSize: 9, color: "#9ca3af" },

  districtRow: { paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 8, marginVertical: 2, borderRadius: 12 },
  districtRowSelected: { backgroundColor: "#000" },
  districtRowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  districtRowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  districtDot: { width: 8, height: 8, borderRadius: 4 },
  districtName: { fontSize: 11, fontWeight: "900", color: "#111" },
  districtScore: { fontSize: 11, fontWeight: "900" },
  districtProvince: { fontSize: 9, color: "#9ca3af", marginLeft: 16, marginTop: 2 },
  textWhite: { color: "#fff" },
});