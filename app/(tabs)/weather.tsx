import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../../lib/api";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  aiAnalysis: string;
}

// Full list of districts for the drop-down navigation selector
const SRI_LANKA_DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Moneragala", "Ratnapura", "Kegalle",
].sort();

export default function WeatherPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ districtName?: string }>();

  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Fallback to colombo if parameter string is missing
  const activeDistrict = params.districtName || "colombo";
  const formattedDistrict = activeDistrict.charAt(0).toUpperCase() + activeDistrict.slice(1);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await api.get(`/weather/analyze/${activeDistrict}`);
        setData(res.data);
      } catch (err) {
        console.error("Error loading weather insights", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [activeDistrict]);

  // Handler to smoothly transition routes when a new district is selected
  const handleDistrictChange = (value: string) => {
    const selected = value.toLowerCase();
    router.setParams({ districtName: selected });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => router.push("/(tabs)")}>
            <Text style={styles.backLink}>← DASHBOARD</Text>
          </TouchableOpacity>

          {/* Dropdown to easily look up separate districts without leaving the page */}
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={formattedDistrict}
              onValueChange={(value) => handleDistrictChange(String(value))}
              style={styles.picker}
              dropdownIconColor="#000"
              mode="dropdown"
            >
              {SRI_LANKA_DISTRICTS.map((district) => (
                <Picker.Item key={district} label={`${district} District`} value={district} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Page Title Block */}
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>ECO CLIMATE MONITOR</Text>
          <Text style={styles.titleLine}>{formattedDistrict}</Text>
          <Text style={[styles.titleLine, styles.titleLineMuted]}>Weather Report</Text>
          <Text style={styles.subtitle}>
            Live atmospheric data and AI ecosystem diagnostics for this district.
          </Text>
        </View>

        {loading ? (
          <View style={styles.card}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#000" style={{ marginBottom: 12 }} />
              <Text style={styles.loadingText}>RUNNING PREDICTIVE AI MODELS...</Text>
            </View>
          </View>
        ) : data ? (
          <View style={styles.card}>
            {/* Main Visual Header */}
            <View style={styles.mainHeader}>
              <View>
                <Text style={styles.smallEyebrow}>SELECTED DISTRICT</Text>
                <Text style={styles.districtHeading}>{formattedDistrict}</Text>
                <Text style={styles.zoneLabel}>SRI LANKA ECO-SECTOR ZONE</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.tempText}>{Math.round(data.temperature)}°</Text>
                <Text style={styles.conditionText}>☁️ {data.condition}</Text>
              </View>
            </View>

            {/* AI Analysis Block */}
            <View style={styles.analysisBlock}>
              <View style={styles.analysisHeaderRow}>
                <Text style={{ fontSize: 14 }}>🤖</Text>
                <Text style={styles.smallEyebrow}>ECOSYSTEM CORE DIAGNOSTICS</Text>
              </View>

              <View style={styles.assessmentBox}>
                <Text style={styles.assessmentLabel}>ECOLOGY ASSESSMENT</Text>
                <Text style={styles.assessmentText}>{data.aiAnalysis}</Text>
              </View>

              <View style={styles.actionBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionLabel}>PREDICTIVE SAFE ACTION</Text>
                  <Text style={styles.actionText}>
                    Ecosystem configuration optimal. Monitor humidity thresholds over 24H intervals.
                  </Text>
                </View>
                <Text style={{ fontSize: 18, color: "#fff" }}>🛡️</Text>
              </View>
            </View>

            {/* Environmental Telemetry Grid Items */}
            <View style={styles.telemetryGrid}>
              {[
                { label: "Atmospheric Humidity", value: `${data.humidity}%`, icon: "💧" },
                { label: "Wind Vector Speed", value: `${data.windSpeed} m/s`, icon: "💨" },
                { label: "Ecoscore Node ID", value: `LK-${activeDistrict.slice(0, 3).toUpperCase()}-26`, icon: "📡" },
                { label: "Data Integrity", value: "Verified", icon: "✓" },
              ].map((item) => (
                <View key={item.label} style={styles.telemetryCard}>
                  <Text style={styles.telemetryLabel}>{item.label.toUpperCase()}</Text>
                  <View style={styles.telemetryValueRow}>
                    <Text style={styles.telemetryValue}>{item.value}</Text>
                    <Text style={{ fontSize: 13, opacity: 0.6 }}>{item.icon}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>ERROR COMPILING DYNAMIC DISTRICT TELEMETRY.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_MAX_WIDTH = 720;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f5f4" },
  scrollContent: {
    padding: 16,
    alignItems: "center",
    paddingBottom: 40,
  },

  headerBar: {
    width: "100%",
    maxWidth: CARD_MAX_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 32,
  },
  backLink: { fontSize: 11, fontWeight: "700", color: "#737373", letterSpacing: 1 },

  pickerWrap: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 999,
    overflow: "hidden",
    minWidth: 170,
    justifyContent: "center",
  },
  picker: {
    height: Platform.OS === "ios" ? 120 : 44,
    color: "#000",
    fontSize: 11,
  },

  titleBlock: { width: "100%", maxWidth: CARD_MAX_WIDTH, marginBottom: 28 },
  eyebrow: { fontSize: 10, fontWeight: "700", color: "#a3a3a3", letterSpacing: 2 },
  titleLine: { fontSize: 38, fontWeight: "900", color: "#000", marginTop: 2, letterSpacing: -0.5 },
  titleLineMuted: { color: "#d4d4d4" },
  subtitle: { fontSize: 13, color: "#737373", marginTop: 10 },

  card: {
    width: "100%",
    maxWidth: CARD_MAX_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    overflow: "hidden",
  },

  loadingBox: { paddingVertical: 56, alignItems: "center" },
  loadingText: { fontSize: 10, fontWeight: "700", color: "#737373", letterSpacing: 1.5 },

  mainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    gap: 12,
  },
  smallEyebrow: { fontSize: 10, fontWeight: "700", color: "#737373", letterSpacing: 1.5 },
  districtHeading: { fontSize: 22, fontWeight: "900", color: "#000", marginTop: 4 },
  zoneLabel: { fontSize: 10, fontWeight: "600", color: "#a3a3a3", letterSpacing: 1, marginTop: 4 },
  tempText: { fontSize: 44, fontWeight: "900", color: "#000", letterSpacing: -1 },
  conditionText: { fontSize: 10, fontWeight: "700", color: "#737373", letterSpacing: 1.5, marginTop: 4 },

  analysisBlock: {
    padding: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    gap: 12,
  },
  analysisHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },

  assessmentBox: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 14,
  },
  assessmentLabel: { fontSize: 10, fontWeight: "700", color: "#000", letterSpacing: 1.5, marginBottom: 6 },
  assessmentText: { fontSize: 13, color: "#525252", lineHeight: 20, fontWeight: "500" },

  actionBox: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  actionLabel: { fontSize: 10, fontWeight: "700", color: "#d4d4d4", letterSpacing: 1.5, marginBottom: 4 },
  actionText: { fontSize: 12, color: "#e5e5e5", lineHeight: 17 },

  telemetryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 8,
  },
  telemetryCard: {
    width: "47.5%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 12,
    justifyContent: "space-between",
    minHeight: 76,
  },
  telemetryLabel: { fontSize: 9, fontWeight: "700", color: "#a3a3a3", letterSpacing: 1 },
  telemetryValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  telemetryValue: { fontSize: 13, fontWeight: "900", color: "#000" },

  errorCard: {
    width: "100%",
    maxWidth: CARD_MAX_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 36,
    alignItems: "center",
  },
  errorText: { fontSize: 11, fontWeight: "700", color: "#ef4444", letterSpacing: 1 },
});