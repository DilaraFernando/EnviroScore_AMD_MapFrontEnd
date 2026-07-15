import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { scoreAPI } from "../../lib/api";

// District data with coords and default scores
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
type District = (typeof DISTRICTS)[number];

const ZONE_HEX: Record<Zone, string> = {
  Green: "#10b981",
  Yellow: "#f59e0b",
  Red: "#f43f5e",
};

function computeZone(score: number): Zone {
  return score >= 70 ? "Green" : score < 45 ? "Red" : "Yellow";
}

// Builds a full standalone HTML document with Leaflet + OpenStreetMap tiles
// (no API key required) and posts a message back to React Native whenever
// a marker is tapped.
function buildMapHtml(
  districts: District[],
  dbScores: Record<string, number>
) {
  const markerData = districts.map((d) => {
    const score = dbScores[d.id] ?? d.score;
    const zone = computeZone(score);
    return { ...d, score, zone, color: ZONE_HEX[zone] };
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const districts = ${JSON.stringify(markerData)};

    const map = L.map('map', {
      center: [7.8731, 80.7718],
      zoom: 7,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersById = {};

    districts.forEach((d) => {
      const icon = L.divIcon({
        className: '',
        html: \`
          <div style="
            width: 36px; height: 36px;
            background: \${d.color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 12px rgba(0,0,0,0.25);
            display: flex; align-items: center; justify-content: center;
            font-weight: 900; font-size: 11px; color: white;
            font-family: sans-serif;
          ">\${d.score}</div>
        \`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([d.lat, d.lng], { icon });
      marker.on('click', () => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'select', id: d.id }));
      });
      marker.addTo(map);
      markersById[d.id] = marker;
    });

    // Called from React Native (injectJavaScript) when a district is tapped in the sidebar list
    window.flyToDistrict = function (lat, lng) {
      map.flyTo([lat, lng], 10, { duration: 0.8 });
    };

    true;
  </script>
</body>
</html>
`;
}

export default function InteractiveMap() {
  const router = useRouter();
  const webviewRef = useRef<WebView>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<
    (District & { score: number; zone: Zone }) | null
  >(null);
  const [filterZone, setFilterZone] = useState<Zone | "All">("All");
  const [dbScores, setDbScores] = useState<Record<string, number>>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();

  // Load saved scores from backend
  useEffect(() => {
    scoreAPI
      .getAllScores()
      .then((res) => {
        const map: Record<string, number> = {};
        res.data.forEach((item: any) => {
          map[item.districtId] = item.score;
        });
        setDbScores(map);
      })
      .catch(() => {});
  }, []);

  const deleteScore = async (districtId: string) => {
    setDeleting(true);
    try {
      await scoreAPI.deleteScoreByDistrictId(districtId);
      setDbScores((prev) => {
        const next = { ...prev };
        delete next[districtId];
        return next;
      });
      setSelectedDistrict(null);
    } catch {
      Alert.alert("Error", "Failed to delete score.");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (districtId: string, districtName: string) => {
    Alert.alert(
      "Delete Score",
      `Remove the saved score for ${districtName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteScore(districtId) },
      ]
    );
  };

  const filteredDistricts = useMemo(
    () =>
      filterZone === "All"
        ? DISTRICTS
        : DISTRICTS.filter(
            (d) => computeZone(dbScores[d.id] ?? d.score) === filterZone
          ),
    [filterZone, dbScores]
  );

  const mapHtml = useMemo(
    () => buildMapHtml(filteredDistricts, dbScores),
    [filteredDistricts, dbScores]
  );

  const greenCount = DISTRICTS.filter(
    (d) => (dbScores[d.id] ?? d.score) >= 70
  ).length;
  const redCount = DISTRICTS.filter(
    (d) => (dbScores[d.id] ?? d.score) < 45
  ).length;
  const yellowCount = DISTRICTS.length - greenCount - redCount;

  const handleWebViewMessage = (event: any) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload.type === "select") {
        const d = DISTRICTS.find((item) => item.id === payload.id);
        if (d) {
          const score = dbScores[d.id] ?? d.score;
          setSelectedDistrict({ ...d, score, zone: computeZone(score) });
        }
      }
    } catch {
      // ignore malformed messages
    }
  };

  const focusDistrictOnMap = (d: District) => {
    webviewRef.current?.injectJavaScript(
      `window.flyToDistrict && window.flyToDistrict(${d.lat}, ${d.lng}); true;`
    );
  };

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => router.push("/(tabs)" as any)}
        >
          <View style={styles.logoDot}>
            <Text style={{ fontSize: 12 }}>🗺️</Text>
          </View>
          <Text style={styles.logoText}>EnviroScore-Map</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/calculate" as any)}>
          <Text style={styles.addScoreLink}>+ Add Score</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
      >
        {/* STATS */}
        <View style={styles.statsRow}>
          {[
            { label: "Green", count: greenCount, bg: "#ecfdf5", text: "#059669", dot: "#10b981" },
            { label: "Yellow", count: yellowCount, bg: "#fffbeb", text: "#d97706", dot: "#fbbf24" },
            { label: "Red", count: redCount, bg: "#fff1f2", text: "#e11d48", dot: "#f43f5e" },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: s.bg }]}>
              <Text style={[styles.statCount, { color: s.text }]}>{s.count}</Text>
              <View style={styles.statLabelRow}>
                <View style={[styles.statDot, { backgroundColor: s.dot }]} />
                <Text style={[styles.statLabel, { color: s.text }]}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* FILTER */}
        <View style={styles.filterRow}>
          {(["All", "Green", "Yellow", "Red"] as const).map((z) => (
            <TouchableOpacity
              key={z}
              onPress={() => setFilterZone(z)}
              style={[
                styles.filterChip,
                filterZone === z && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterZone === z && styles.filterChipTextActive,
                ]}
              >
                {z}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* MAP */}
        <View style={styles.mapContainer}>
          <WebView
            ref={webviewRef}
            key={filterZone}
            originWhitelist={["*"]}
            source={{ html: mapHtml }}
            onMessage={handleWebViewMessage}
            onLoadEnd={() => setMapLoaded(true)}
            style={styles.map}
          />
          {!mapLoaded && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="small" color="#000" />
              <Text style={styles.mapLoadingText}>Loading Map...</Text>
            </View>
          )}

          {/* Selected district overlay card */}
          {selectedDistrict && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoCardEyebrow}>
                    {selectedDistrict.province} Province
                  </Text>
                  <Text style={styles.infoCardTitle}>
                    {selectedDistrict.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedDistrict(null)}>
                  <Text style={styles.infoCardClose}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.infoCardScoreRow}>
                <Text style={styles.infoCardScore}>
                  {selectedDistrict.score}
                </Text>
                <View>
                  <View
                    style={[
                      styles.zoneBadge,
                      { backgroundColor: ZONE_HEX[selectedDistrict.zone] },
                    ]}
                  >
                    <Text style={styles.zoneBadgeText}>
                      ● {selectedDistrict.zone} Zone
                    </Text>
                  </View>
                  <Text style={styles.infoCardOutOf}>
                    /100 environmental score
                  </Text>
                </View>
              </View>
              <Text style={styles.infoCardNote}>{selectedDistrict.note}</Text>
              <View style={styles.infoCardActions}>
                <TouchableOpacity
                  style={styles.analyzeBtn}
                  onPress={() => router.push("/calculate" as any)}
                >
                  <Text style={styles.analyzeBtnText}>
                    Run Analysis →
                  </Text>
                </TouchableOpacity>
                {dbScores[selectedDistrict.id] !== undefined && (user?.role === "admin" || user?.role === "analyst") && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    disabled={deleting}
                    onPress={() => confirmDelete(selectedDistrict.id, selectedDistrict.name)}
                  >
                    <Text style={styles.deleteBtnText}>
                      {deleting ? "..." : "Delete Score"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* LEGEND */}
        <View style={styles.legendBlock}>
          <Text style={styles.sectionLabel}>Map Legend</Text>
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

        {/* DISTRICT LIST */}
        <View style={styles.listBlock}>
          <Text style={styles.sectionLabel}>Districts</Text>
          {[...filteredDistricts]
            .sort(
              (a, b) =>
                (dbScores[a.id] ?? a.score) - (dbScores[b.id] ?? b.score)
            )
            .map((d) => {
              const score = dbScores[d.id] ?? d.score;
              const zone = computeZone(score);
              const active = selectedDistrict?.id === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => {
                    setSelectedDistrict({ ...d, score, zone });
                    focusDistrictOnMap(d);
                  }}
                  style={[styles.districtRow, active && styles.districtRowActive]}
                >
                  <View style={styles.districtRowLeft}>
                    <View
                      style={[
                        styles.districtDot,
                        { backgroundColor: ZONE_HEX[zone] },
                      ]}
                    />
                    <View>
                      <Text
                        style={[
                          styles.districtName,
                          active && styles.districtNameActive,
                        ]}
                      >
                        {d.name}
                      </Text>
                      <Text
                        style={[
                          styles.districtProvince,
                          active && styles.districtProvinceActive,
                        ]}
                      >
                        {d.province}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.districtScore,
                      { color: active ? "#fff" : ZONE_HEX[zone] },
                    ]}
                  >
                    {score}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f5f7" },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 16 },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
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
  addScoreLink: { fontSize: 11, fontWeight: "900", color: "#9ca3af" },

  // STATS
  statsRow: { flexDirection: "row", gap: 8 },
  statBox: { flex: 1, borderRadius: 12, padding: 10, alignItems: "center" },
  statCount: { fontSize: 18, fontWeight: "900" },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statLabel: {
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // FILTER
  filterRow: { flexDirection: "row", gap: 6 },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  filterChipActive: { backgroundColor: "#000" },
  filterChipText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  filterChipTextActive: { color: "#fff" },

  // MAP
  mapContainer: {
    height: 340,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#e5e7eb",
  },
  map: { flex: 1 },
  mapLoadingOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  } as any,
  mapLoadingText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // INFO CARD (overlay on map)
  infoCard: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f1f1f1",
  },
  infoCardHeader: { flexDirection: "row", justifyContent: "space-between" },
  infoCardEyebrow: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoCardTitle: { fontSize: 16, fontWeight: "900", marginTop: 2 },
  infoCardClose: { fontSize: 20, color: "#9ca3af" },
  infoCardScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  infoCardScore: { fontSize: 34, fontWeight: "900" },
  zoneBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  zoneBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#fff",
    textTransform: "uppercase",
  },
  infoCardOutOf: { fontSize: 9, color: "#9ca3af", marginTop: 4 },
  infoCardNote: {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 16,
    marginTop: 10,
  },
  analyzeBtn: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  analyzeBtnText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  infoCardActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  deleteBtnText: { color: "#e11d48", fontSize: 10, fontWeight: "900" },

  // LEGEND
  legendBlock: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f1f1f1",
    padding: 14,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  legendRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginTop: 2 },
  legendLabel: { fontSize: 11, fontWeight: "900" },
  legendDesc: { fontSize: 9, color: "#9ca3af", marginTop: 1 },

  // DISTRICT LIST
  listBlock: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f1f1f1",
    padding: 10,
    gap: 10,
  },
  districtRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  districtRowActive: { backgroundColor: "#000" },
  districtRowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  districtDot: { width: 8, height: 8, borderRadius: 4 },
  districtName: { fontSize: 12, fontWeight: "900" },
  districtNameActive: { color: "#fff" },
  districtProvince: { fontSize: 9, color: "#9ca3af", marginTop: 1 },
  districtProvinceActive: { color: "#9ca3af" },
  districtScore: { fontSize: 13, fontWeight: "900" },
});