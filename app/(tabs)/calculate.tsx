import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Slider from "@react-native-community/slider";
import Svg, { Circle } from "react-native-svg";
import { useRouter } from "expo-router";
import api from "../../lib/api";

type District = {
  id: string;
  name: string;
  province: string;
  baseTemp: string;
  baseHumidity: number;
  lat: number;
  lng: number;
  note: string;
};

type Zone = "Green" | "Yellow" | "Red";

type Report = {
  district: string;
  districtId: string;
  province: string;
  lat: number;
  lng: number;
  score: number;
  zone: Zone;
  moisture: number;
  temp: string;
  humidity: number;
  problemNote: string;
  inputs: { canopy: number; rainfall: number; industrial: string };
};

const SRI_LANKAN_DISTRICTS: District[] = [
  { id: "colombo", name: "Colombo", province: "Western", baseTemp: "31.8°C", baseHumidity: 82, lat: 6.9271, lng: 79.8612, note: "High urban density leading to surface heat island effects. Needs structural green canopy restoration and wetland buffer management." },
  { id: "gampaha", name: "Gampaha", province: "Western", baseTemp: "30.2°C", baseHumidity: 75, lat: 7.0917, lng: 80.0, note: "Industrial mixed zone with rapid construction footprints. Groundwater preservation and urban forest nodes are critical." },
  { id: "kalutara", name: "Kalutara", province: "Western", baseTemp: "28.5°C", baseHumidity: 88, lat: 6.5854, lng: 79.9607, note: "Excellent eco-forest wet zone stability. Highly resilient ecosystem but vulnerable to minor soil erosion during peak monsoons." },
  { id: "kandy", name: "Kandy", province: "Central", baseTemp: "26.4°C", baseHumidity: 80, lat: 7.2906, lng: 80.6337, note: "Montane micro-climate matrix. Heavy canopy cover but experiencing localized ambient air threats due to valley topology trap." },
  { id: "matale", name: "Matale", province: "Central", baseTemp: "27.0°C", baseHumidity: 76, lat: 7.4675, lng: 80.6234, note: "Mixed agriculture and forest zone. Spice cultivation contributes positively but expanding urbanization poses risks." },
  { id: "nuwaraeliya", name: "Nuwara Eliya", province: "Central", baseTemp: "18.5°C", baseHumidity: 85, lat: 6.9497, lng: 80.7891, note: "High-altitude cloud forest ecosystem. Highly sensitive to agro-chemical soil shifts. Outstanding carbon sink capabilities." },
  { id: "galle", name: "Galle", province: "Southern", baseTemp: "29.8°C", baseHumidity: 83, lat: 6.0535, lng: 80.221, note: "Coastal marine ecosystem balance. Reef structures provide great wave energy dissipation, but urban coastline pressure is rising." },
  { id: "matara", name: "Matara", province: "Southern", baseTemp: "29.4°C", baseHumidity: 80, lat: 5.9549, lng: 80.555, note: "Coastal and riverine ecosystem mix. Tourism pressure affecting coastal dune systems and estuarine biodiversity." },
  { id: "hambantota", name: "Hambantota", province: "Southern", baseTemp: "31.0°C", baseHumidity: 72, lat: 6.1241, lng: 81.1185, note: "Semi-arid coastal plain. Rapid port and industrial development threatening lagoon and mangrove ecosystems." },
  { id: "jaffna", name: "Jaffna", province: "Northern", baseTemp: "33.1°C", baseHumidity: 70, lat: 9.6615, lng: 80.0255, note: "Arid limestone topography with limited fresh water nodes. Vulnerable to prolonged heatwaves. Requires intense drought-resilient vegetation." },
  { id: "kilinochchi", name: "Kilinochchi", province: "Northern", baseTemp: "32.0°C", baseHumidity: 71, lat: 9.3803, lng: 80.4037, note: "Post-conflict recovery zone. Reforestation efforts underway but land degradation remains significant." },
  { id: "mannar", name: "Mannar", province: "Northern", baseTemp: "32.8°C", baseHumidity: 68, lat: 8.981, lng: 79.9044, note: "Dryland and coastal zone. Important bird sanctuary areas under pressure from salt mining and overfishing." },
  { id: "mullaitivu", name: "Mullaitivu", province: "Northern", baseTemp: "31.5°C", baseHumidity: 73, lat: 9.2671, lng: 80.8128, note: "Coastal lagoon and forest recovery zone. High biodiversity potential if reforestation targets are met." },
  { id: "vavuniya", name: "Vavuniya", province: "Northern", baseTemp: "32.2°C", baseHumidity: 69, lat: 8.7514, lng: 80.4971, note: "Transitional dry zone. Encroachment on Vanni forest belts is a growing concern." },
  { id: "batticaloa", name: "Batticaloa", province: "Eastern", baseTemp: "30.5°C", baseHumidity: 78, lat: 7.717, lng: 81.7004, note: "Lagoon-estuary system under salinity stress. Mangrove degradation accelerating coastal erosion." },
  { id: "ampara", name: "Ampara", province: "Eastern", baseTemp: "30.8°C", baseHumidity: 76, lat: 7.2997, lng: 81.6747, note: "Paddy and forest mosaic. Seasonal flooding events threatening fertile basin zones. Climate adaptation needed." },
  { id: "trincomalee", name: "Trincomalee", province: "Eastern", baseTemp: "31.2°C", baseHumidity: 74, lat: 8.5874, lng: 81.2152, note: "Strategic harbor and coral reef zone. Industrial shipping traffic contributing to marine pollution." },
  { id: "kurunegala", name: "Kurunegala", province: "North Western", baseTemp: "29.5°C", baseHumidity: 74, lat: 7.4818, lng: 80.3609, note: "Coconut triangle district. Mono-crop agriculture reducing soil biodiversity and water retention." },
  { id: "puttalam", name: "Puttalam", province: "North Western", baseTemp: "31.8°C", baseHumidity: 71, lat: 8.0362, lng: 79.8283, note: "Lagoon and salt flat ecosystem. Prawn farming and salt extraction industries degrading wetland habitats." },
  { id: "anuradhapura", name: "Anuradhapura", province: "North Central", baseTemp: "32.5°C", baseHumidity: 68, lat: 8.3114, lng: 80.4037, note: "Dry zone cascade tank network matrix. Chronic seasonal dry spells threat. Critical soil moisture management required." },
  { id: "polonnaruwa", name: "Polonnaruwa", province: "North Central", baseTemp: "31.8°C", baseHumidity: 70, lat: 7.9403, lng: 81.0188, note: "Ancient irrigation reservoir ecosystem. Siltation of tanks and deforestation of catchment areas are primary threats." },
  { id: "badulla", name: "Badulla", province: "Uva", baseTemp: "22.5°C", baseHumidity: 82, lat: 6.9934, lng: 81.055, note: "Uva highland ecosystem. Tea monoculture and stream channel degradation affecting biodiversity corridors." },
  { id: "moneragala", name: "Moneragala", province: "Uva", baseTemp: "28.0°C", baseHumidity: 74, lat: 6.8728, lng: 81.3507, note: "Elephant corridor zone. Human-wildlife conflict escalating due to forest fragmentation." },
  { id: "ratnapura", name: "Ratnapura", province: "Sabaragamuwa", baseTemp: "27.2°C", baseHumidity: 86, lat: 6.6828, lng: 80.4005, note: "Wet zone gem mining district. River sedimentation from mining activities severely impacts aquatic ecosystems." },
  { id: "kegalle", name: "Kegalle", province: "Sabaragamuwa", baseTemp: "27.8°C", baseHumidity: 83, lat: 7.2513, lng: 80.3464, note: "Hilly terrain with rubber and tea estates. Landslide risk increasing with deforestation on steep slopes." },
];

const ZONE_COLORS: Record<Zone, string> = {
  Green: "#10b981",
  Yellow: "#f59e0b",
  Red: "#f43f5e",
};

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CalculateScore() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"input" | "result">("input");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState("kalutara");
  const [simulatedCanopy, setSimulatedCanopy] = useState<number>(35);
  const [simulatedRainfall, setSimulatedRainfall] = useState<number>(140);
  const [industrialImpact, setIndustrialImpact] = useState<string>("low");
  const [finalReport, setFinalReport] = useState<Report | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const filteredDistricts = useMemo(
    () =>
      SRI_LANKAN_DISTRICTS.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const selectedDistrict = useMemo(
    () =>
      SRI_LANKAN_DISTRICTS.find((d) => d.id === selectedId) ||
      SRI_LANKAN_DISTRICTS[0],
    [selectedId]
  );

  const runAnalysis = () => {
    const base = selectedDistrict;
    const penalty =
      industrialImpact === "high" ? 18 : industrialImpact === "medium" ? 8 : 0;
    let score = Math.round(
      simulatedCanopy * 0.7 +
        base.baseHumidity * 0.4 -
        Math.abs(simulatedRainfall - 160) * 0.08 -
        penalty
    );
    score = Math.min(100, Math.max(12, score));
    const zone: Zone = score >= 70 ? "Green" : score < 45 ? "Red" : "Yellow";

    const report: Report = {
      district: base.name,
      districtId: base.id,
      province: base.province,
      lat: base.lat,
      lng: base.lng,
      score,
      zone,
      moisture: Math.min(
        100,
        Math.round(simulatedRainfall * 0.22 + base.baseHumidity * 0.35)
      ),
      temp: base.baseTemp,
      humidity: base.baseHumidity,
      problemNote: base.note,
      inputs: {
        canopy: simulatedCanopy,
        rainfall: simulatedRainfall,
        industrial: industrialImpact,
      },
    };
    setFinalReport(report);
    setViewMode("result");
    setSaved(false);
  };

  const saveToBackend = async () => {
    if (!finalReport) return;
    setSaving(true);
    try {
      await api.post("/calculate/save", finalReport);
      setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
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
        <TouchableOpacity onPress={() => router.push("/(tabs)" as any)}>
          <Text style={styles.headerBack}>← Dashboard</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
      >
        {viewMode === "input" && (
          <View style={{ gap: 20 }}>
            <View>
              <Text style={styles.eyebrow}>Eco Calculator</Text>
              <Text style={styles.pageTitle}>
                District Score{"\n"}
                <Text style={styles.pageTitleMuted}>Simulator</Text>
              </Text>
              <Text style={styles.pageSubtitle}>
                Select a district and adjust environmental parameters to
                calculate its ecosystem resilience score.
              </Text>
            </View>

            <View style={styles.card}>
              {/* District Selector */}
              <Text style={styles.fieldLabel}>Search District</Text>
              <TextInput
                placeholder="Filter districts..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />

              <ScrollView
                style={styles.districtList}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {filteredDistricts.map((d) => {
                  const active = selectedId === d.id;
                  return (
                    <TouchableOpacity
                      key={d.id}
                      onPress={() => setSelectedId(d.id)}
                      style={[
                        styles.districtRow,
                        active && styles.districtRowActive,
                      ]}
                    >
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
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Selected district info */}
              <View style={styles.infoGrid}>
                <View style={styles.infoCell}>
                  <Text style={styles.infoLabel}>Selected District</Text>
                  <Text style={styles.infoValue}>{selectedDistrict.name}</Text>
                </View>
                <View style={styles.infoCell}>
                  <Text style={styles.infoLabel}>Base Temperature</Text>
                  <Text style={styles.infoValue}>
                    {selectedDistrict.baseTemp}
                  </Text>
                </View>
                <View style={styles.infoCell}>
                  <Text style={styles.infoLabel}>Province</Text>
                  <Text style={styles.infoValue}>
                    {selectedDistrict.province}
                  </Text>
                </View>
                <View style={styles.infoCell}>
                  <Text style={styles.infoLabel}>Base Humidity</Text>
                  <Text style={styles.infoValue}>
                    {selectedDistrict.baseHumidity}%
                  </Text>
                </View>
              </View>

              {/* Canopy slider */}
              <View style={styles.sliderBlock}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.sliderLabel}>Green Canopy Cover</Text>
                  <Text style={styles.sliderValue}>{simulatedCanopy}%</Text>
                </View>
                <Slider
                  minimumValue={5}
                  maximumValue={100}
                  step={1}
                  value={simulatedCanopy}
                  onValueChange={setSimulatedCanopy}
                  minimumTrackTintColor="#000"
                  maximumTrackTintColor="#f0f0f0"
                  thumbTintColor="#000"
                />
                <View style={styles.sliderRangeRow}>
                  <Text style={styles.sliderRangeText}>5% (Barren)</Text>
                  <Text style={styles.sliderRangeText}>
                    100% (Dense Forest)
                  </Text>
                </View>
              </View>

              {/* Rainfall slider */}
              <View style={styles.sliderBlock}>
                <View style={styles.sliderHeader}>
                  <Text style={styles.sliderLabel}>Monthly Precipitation</Text>
                  <Text style={styles.sliderValue}>{simulatedRainfall}mm</Text>
                </View>
                <Slider
                  minimumValue={40}
                  maximumValue={400}
                  step={1}
                  value={simulatedRainfall}
                  onValueChange={setSimulatedRainfall}
                  minimumTrackTintColor="#000"
                  maximumTrackTintColor="#f0f0f0"
                  thumbTintColor="#000"
                />
                <View style={styles.sliderRangeRow}>
                  <Text style={styles.sliderRangeText}>40mm (Drought)</Text>
                  <Text style={styles.sliderRangeText}>400mm (Heavy)</Text>
                </View>
              </View>

              {/* Industrial footprint */}
              <View style={{ gap: 8 }}>
                <Text style={styles.sliderLabel}>Industrial Footprint</Text>
                <View style={styles.impactRow}>
                  {[
                    { val: "low", label: "Low", sub: "Rural / Eco" },
                    { val: "medium", label: "Medium", sub: "Suburban" },
                    { val: "high", label: "High", sub: "Industrial" },
                  ].map((opt) => {
                    const active = industrialImpact === opt.val;
                    return (
                      <TouchableOpacity
                        key={opt.val}
                        onPress={() => setIndustrialImpact(opt.val)}
                        style={[
                          styles.impactOption,
                          active && styles.impactOptionActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.impactOptionLabel,
                            active && styles.impactOptionLabelActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text
                          style={[
                            styles.impactOptionSub,
                            active && styles.impactOptionSubActive,
                          ]}
                        >
                          {opt.sub}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity style={styles.analyzeBtn} onPress={runAnalysis}>
                <Text style={styles.analyzeBtnText}>Analyze Eco-Status →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {viewMode === "result" && finalReport && (
          <View style={{ gap: 20 }}>
            <View style={styles.resultHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.eyebrow}>
                  {finalReport.province} Province
                </Text>
                <Text style={styles.pageTitle}>
                  {finalReport.district}
                  {"\n"}
                  <Text style={styles.pageTitleMuted}>Matrix Report</Text>
                </Text>
              </View>
              <TouchableOpacity
                style={styles.recalcBtn}
                onPress={() => setViewMode("input")}
              >
                <Text style={styles.recalcBtnText}>← Recalculate</Text>
              </TouchableOpacity>
            </View>

            {/* Score + Zone status */}
            <View style={styles.scoreRow}>
              <View style={[styles.card, styles.scoreCard]}>
                <Text style={styles.infoLabel}>Environmental Score</Text>
                <View style={styles.scoreCircleWrap}>
                  <Svg width={128} height={128} viewBox="0 0 100 100">
                    <Circle
                      cx={50}
                      cy={50}
                      r={RADIUS}
                      fill="none"
                      stroke="#f0f0f0"
                      strokeWidth={8}
                    />
                    <Circle
                      cx={50}
                      cy={50}
                      r={RADIUS}
                      fill="none"
                      stroke={ZONE_COLORS[finalReport.zone]}
                      strokeWidth={8}
                      strokeLinecap="round"
                      strokeDasharray={`${CIRCUMFERENCE}`}
                      strokeDashoffset={
                        CIRCUMFERENCE * (1 - finalReport.score / 100)
                      }
                      rotation={-90}
                      originX={50}
                      originY={50}
                    />
                  </Svg>
                  <View style={styles.scoreCircleCenter}>
                    <Text style={styles.scoreCircleText}>
                      {finalReport.score}
                    </Text>
                  </View>
                </View>
                <Text style={styles.infoLabel}>out of 100</Text>
              </View>

              <View style={[styles.card, styles.zoneCard]}>
                <Text style={styles.infoLabel}>Sustainability Status</Text>
                <View
                  style={[
                    styles.zoneBadge,
                    { backgroundColor: ZONE_COLORS[finalReport.zone] },
                  ]}
                >
                  <Text style={styles.zoneBadgeText}>
                    ● {finalReport.zone} Zone
                  </Text>
                </View>
                <Text style={styles.zoneTitle}>
                  {finalReport.zone === "Green" &&
                    "Optimal Ecosystem Stability"}
                  {finalReport.zone === "Yellow" &&
                    "Moderate Ecological Vulnerability"}
                  {finalReport.zone === "Red" && "Severe Ecological Distress"}
                </Text>
                <Text style={styles.zoneNote}>{finalReport.problemNote}</Text>
                <Text style={styles.zoneCode}>
                  SL-ECO-{finalReport.district.toUpperCase()}-
                  {finalReport.score}
                </Text>
              </View>
            </View>

            {/* Metrics */}
            <View style={styles.metricsGrid}>
              {[
                { label: "Soil Moisture", value: `${finalReport.moisture}%`, icon: "💧" },
                { label: "Canopy Cover", value: `${finalReport.inputs.canopy}%`, icon: "🌿" },
                { label: "Precipitation", value: `${finalReport.inputs.rainfall}mm`, icon: "🌧️" },
                { label: "Humidity", value: `${finalReport.humidity}%`, icon: "🌫️" },
              ].map((m) => (
                <View key={m.label} style={styles.metricCard}>
                  <Text style={{ fontSize: 16 }}>{m.icon}</Text>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <Text style={styles.metricValue}>{m.value}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={saveToBackend}
                disabled={saving || saved}
                style={[styles.saveBtn, saved && styles.saveBtnSaved]}
              >
                <Text style={styles.saveBtnText}>
                  {saving
                    ? "Saving..."
                    : saved
                    ? "✓ Saved to Database"
                    : "Save Analysis"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/map" as any)}
                style={styles.mapBtn}
              >
                <Text style={styles.mapBtnText}>View on Map →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.footer}>© 2026 EnviroScore Map Inc.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f5f7" },
  scrollContent: { padding: 20, paddingBottom: 40 },

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
  headerBack: { fontSize: 11, fontWeight: "900", color: "#9ca3af" },

  // PAGE TEXT
  eyebrow: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "900",
    marginTop: 2,
    lineHeight: 30,
  },
  pageTitleMuted: { color: "#d1d5db" },
  pageSubtitle: { fontSize: 12, color: "#9ca3af", marginTop: 8, lineHeight: 18 },

  // CARD
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f1f1",
    borderRadius: 18,
    padding: 18,
    gap: 16,
  },

  // District search + list
  fieldLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  searchInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    fontWeight: "700",
  },
  districtList: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: "#f1f1f1",
    borderRadius: 12,
    backgroundColor: "#fafafa",
  },
  districtRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
    marginVertical: 2,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  districtRowActive: { backgroundColor: "#000" },
  districtName: { fontSize: 11, fontWeight: "700", color: "#000" },
  districtNameActive: { color: "#fff" },
  districtProvince: {
    fontSize: 8,
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  districtProvinceActive: { color: "rgba(255,255,255,0.6)" },

  // Info grid
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#f1f1f1",
    borderRadius: 12,
    padding: 14,
  },
  infoCell: { width: "50%", paddingVertical: 6 },
  infoLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: { fontSize: 14, fontWeight: "900", marginTop: 2 },

  // Sliders
  sliderBlock: { gap: 4 },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#fff",
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  sliderRangeRow: { flexDirection: "row", justifyContent: "space-between" },
  sliderRangeText: { fontSize: 9, color: "#d1d5db", fontWeight: "700" },

  // Industrial impact
  impactRow: { flexDirection: "row", gap: 8 },
  impactOption: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  impactOptionActive: { backgroundColor: "#000", borderColor: "#000" },
  impactOptionLabel: { fontSize: 11, fontWeight: "900", color: "#000" },
  impactOptionLabelActive: { color: "#fff" },
  impactOptionSub: { fontSize: 9, color: "#9ca3af", marginTop: 2 },
  impactOptionSubActive: { color: "#9ca3af" },

  // Analyze button
  analyzeBtn: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  analyzeBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Result header
  resultHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  recalcBtn: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  recalcBtnText: { fontSize: 11, fontWeight: "900" },

  // Score + zone
  scoreRow: { gap: 12 },
  scoreCard: { alignItems: "center" },
  scoreCircleWrap: {
    width: 128,
    height: 128,
    marginTop: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreCircleCenter: { position: "absolute", alignItems: "center" },
  scoreCircleText: { fontSize: 32, fontWeight: "900" },
  zoneCard: { gap: 8 },
  zoneBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  zoneBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#fff",
    textTransform: "uppercase",
  },
  zoneTitle: { fontSize: 18, fontWeight: "900" },
  zoneNote: { fontSize: 12, color: "#9ca3af", lineHeight: 18 },
  zoneCode: {
    fontSize: 9,
    fontWeight: "900",
    color: "#d1d5db",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Metrics grid
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metricCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f1f1",
    borderRadius: 14,
    padding: 14,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 8,
  },
  metricValue: { fontSize: 18, fontWeight: "900", marginTop: 2 },

  // Actions
  actionsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  saveBtn: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveBtnSaved: { backgroundColor: "#10b981" },
  saveBtnText: { color: "#fff", fontSize: 12, fontWeight: "900" },
  mapBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  mapBtnText: { fontSize: 12, fontWeight: "900" },

  // Footer
  footer: {
    textAlign: "center",
    fontSize: 9,
    color: "#d1d5db",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 24,
  },
});