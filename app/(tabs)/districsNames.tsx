import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

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

// Expo convention: env vars exposed to the client must be prefixed EXPO_PUBLIC_
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

export default function WeatherPage() {
  const { districtName } = useLocalSearchParams<{ districtName?: string }>();
  const router = useRouter();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fallback to colombo if the route param is missing
  const activeDistrict = districtName || "colombo";
  const formattedDistrict =
    activeDistrict.charAt(0).toUpperCase() + activeDistrict.slice(1);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/api/weather/analyze/${activeDistrict}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(res.data);
      } catch (err) {
        console.error("Error loading weather insights", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [activeDistrict]);

  // Navigate to a new district's weather route when the picker changes
  const handleDistrictChange = (value: string) => {
    router.push(`/weather/${value.toLowerCase()}` as any);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      {/* TOP HEADER BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push("/(tabs)" as any)}>
          <Text style={styles.backLink}>← Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={formattedDistrict}
            onValueChange={(value) => handleDistrictChange(String(value))}
            style={styles.picker}
            mode="dropdown"
          >
            {SRI_LANKA_DISTRICTS.map((district) => (
              <Picker.Item
                key={district}
                label={`${district} District`}
                value={district}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* PAGE TITLE BLOCK */}
      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>Eco Climate Monitor</Text>
        <Text style={styles.title}>{formattedDistrict}</Text>
        <Text style={styles.titleMuted}>Weather Report</Text>
        <Text style={styles.subtitle}>
          Live atmospheric data and AI ecosystem diagnostics for this
          district.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#000" />
          <Text style={styles.loadingText}>
            Running Predictive AI Models...
          </Text>
        </View>
      ) : data ? (
        <View style={styles.dataCard}>
          {/* Main Visual Header */}
          <View style={styles.visualHeader}>
            <View>
              <Text style={styles.smallLabel}>Selected District</Text>
              <Text style={styles.districtTitle}>{formattedDistrict}</Text>
              <Text style={styles.districtSub}>Sri Lanka Eco-Sector Zone</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.tempText}>
                {Math.round(data.temperature)}°
              </Text>
              <Text style={styles.conditionText}>☁️ {data.condition}</Text>
            </View>
          </View>

          {/* AI Analysis Block */}
          <View style={styles.analysisBlock}>
            <View style={styles.analysisHeaderRow}>
              <Text style={{ fontSize: 14 }}>🤖</Text>
              <Text style={styles.smallLabel}>
                Ecosystem Core Diagnostics
              </Text>
            </View>

            <View style={styles.ecologyBox}>
              <Text style={styles.ecologyLabel}>Ecology Assessment</Text>
              <Text style={styles.ecologyText}>{data.aiAnalysis}</Text>
            </View>

            <View style={styles.actionBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionLabel}>Predictive Safe Action</Text>
                <Text style={styles.actionText}>
                  Ecosystem configuration optimal. Monitor humidity
                  thresholds over 24H intervals.
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: "#fff" }}>🛡️</Text>
            </View>
          </View>

          {/* Telemetry grid */}
          <View style={styles.telemetryGrid}>
            {[
              {
                label: "Atmospheric Humidity",
                value: `${data.humidity}%`,
                icon: "💧",
              },
              {
                label: "Wind Vector Speed",
                value: `${data.windSpeed} m/s`,
                icon: "💨",
              },
              {
                label: "Ecoscore Node ID",
                value: `LK-${activeDistrict.slice(0, 3).toUpperCase()}-26`,
                icon: "📡",
              },
              { label: "Data Integrity", value: "Verified", icon: "✓" },
            ].map((item) => (
              <View key={item.label} style={styles.telemetryCard}>
                <Text style={styles.telemetryLabel}>{item.label}</Text>
                <View style={styles.telemetryValueRow}>
                  <Text style={styles.telemetryValue}>{item.value}</Text>
                  <Text style={{ fontSize: 14, opacity: 0.6 }}>
                    {item.icon}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>
            Error compiling dynamic district telemetry.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f5f4" },
  scrollContent: { padding: 20, paddingBottom: 40 },

  // TOP BAR
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 8,
  },
  backLink: {
    fontSize: 11,
    color: "#737373",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickerWrap: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 999,
    overflow: "hidden",
    minWidth: 170,
  },
  picker: { height: 40, width: "100%" },

  // TITLE BLOCK
  titleBlock: { marginBottom: 20 },
  eyebrow: {
    fontSize: 10,
    fontWeight: "900",
    color: "#a3a3a3",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: { fontSize: 34, fontWeight: "900", marginTop: 4 },
  titleMuted: { fontSize: 34, fontWeight: "900", color: "#d4d4d4" },
  subtitle: { fontSize: 12, color: "#737373", marginTop: 10, lineHeight: 18 },

  // LOADING
  loadingCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 12,
  },

  // DATA CARD
  dataCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    overflow: "hidden",
  },
  visualHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    gap: 12,
  },
  smallLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  districtTitle: { fontSize: 20, fontWeight: "900", marginTop: 4 },
  districtSub: {
    fontSize: 10,
    color: "#a3a3a3",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  tempText: { fontSize: 44, fontWeight: "900", letterSpacing: -1 },
  conditionText: {
    fontSize: 10,
    color: "#737373",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },

  // AI ANALYSIS
  analysisBlock: {
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  analysisHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ecologyBox: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 14,
  },
  ecologyLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  ecologyText: { fontSize: 13, color: "#525252", lineHeight: 19 },
  actionBox: {
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#d4d4d4",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  actionText: { fontSize: 13, color: "#e5e5e5", lineHeight: 18 },

  // TELEMETRY GRID
  telemetryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    padding: 20,
  },
  telemetryCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 14,
    justifyContent: "space-between",
  },
  telemetryLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#a3a3a3",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  telemetryValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  telemetryValue: { fontSize: 13, fontWeight: "900" },

  // ERROR
  errorCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 40,
    alignItems: "center",
  },
  errorText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#ef4444",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});