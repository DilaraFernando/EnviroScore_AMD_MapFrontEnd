import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../lib/api";

// Prop name matches what App passes: onLoginSuccess
interface LoginProps {
  onLoginSuccess: (userData: { username: string; role: string }) => void;
}

type Mode = "login" | "register";

export default function Login({ onLoginSuccess }: LoginProps) {
  const navigation = useNavigation<any>();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "viewer" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "register" && !form.username) {
      setError("Username is required.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";

      // Payload: 'username' mapped to 'name' to match backend model destructuring
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.username, email: form.email, password: form.password, role: form.role };

      const res = await api.post(endpoint, payload);
      const { token, user } = res.data;

      await AsyncStorage.setItem("token", token);

      // Mapped from user.name to correctly match server response payload
      onLoginSuccess({
        username: user.name || user.username || "",
        role: user.role,
      });

      navigation.navigate("Dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (m: Mode) => {
    setMode(m);
    setError("");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <TouchableOpacity style={styles.logoRow} onPress={() => navigation.navigate("Home")}>
            <View style={styles.logoBadge}>
              <Text style={{ fontSize: 14 }}>🗺️</Text>
            </View>
            <Text style={styles.logoText}>ENVIROSCORE-MAP</Text>
          </TouchableOpacity>

          {/* Card */}
          <View style={styles.card}>
            {/* Toggle */}
            <View style={styles.toggleRow}>
              {(["login", "register"] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => toggleMode(m)}
                  style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
                >
                  <Text style={[styles.toggleBtnText, mode === m && styles.toggleBtnTextActive]}>
                    {m === "login" ? "Sign In" : "Register"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.headingBlock}>
              <Text style={styles.heading}>{mode === "login" ? "Welcome back" : "Create account"}</Text>
              <Text style={styles.subheading}>
                {mode === "login"
                  ? "Sign in to access the EnviroScore platform."
                  : "Register to start analysing Sri Lanka's ecosystems."}
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              {mode === "register" && (
                <View>
                  <Text style={styles.label}>USERNAME</Text>
                  <TextInput
                    placeholder="Your name"
                    placeholderTextColor="#9ca3af"
                    value={form.username}
                    onChangeText={(v) => handleChange("username", v)}
                    style={styles.input}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View>
                <Text style={styles.label}>EMAIL</Text>
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor="#9ca3af"
                  value={form.email}
                  onChangeText={(v) => handleChange("email", v)}
                  onSubmitEditing={handleSubmit}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View>
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                  placeholder="******"
                  placeholderTextColor="#9ca3af"
                  value={form.password}
                  onChangeText={(v) => handleChange("password", v)}
                  onSubmitEditing={handleSubmit}
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {mode === "register" && (
                <View>
                  <Text style={styles.label}>ROLE</Text>
                  <View style={styles.pickerWrap}>
                    <Picker
                      selectedValue={form.role}
                      onValueChange={(v) => handleChange("role", String(v))}
                      style={styles.picker}
                      mode="dropdown"
                    >
                      <Picker.Item label="Viewer — Read-only access" value="viewer" />
                      <Picker.Item label="Analyst — Save analyses" value="analyst" />
                      <Picker.Item label="Admin — Full access" value="admin" />
                    </Picker>
                  </View>
                </View>
              )}
            </View>

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === "login" ? "Sign In →" : "Create Account →"}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={() => toggleMode(mode === "login" ? "register" : "login")}>
                <Text style={styles.switchLink}>{mode === "login" ? "Register" : "Sign In"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.backHome} onPress={() => navigation.navigate("Home")}>
            <Text style={styles.backHomeText}>← Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f5f5f7" },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },

  logoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 28 },
  logoBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },

  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 20,
    padding: 26,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 999,
    padding: 4,
    marginBottom: 22,
  },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: "center" },
  toggleBtnActive: { backgroundColor: "#000" },
  toggleBtnText: { fontSize: 11, fontWeight: "900", color: "#9ca3af" },
  toggleBtnTextActive: { color: "#fff" },

  headingBlock: { marginBottom: 18 },
  heading: { fontSize: 20, fontWeight: "900", color: "#000" },
  subheading: { fontSize: 11, color: "#9ca3af", marginTop: 3 },

  label: { fontSize: 9, fontWeight: "900", color: "#9ca3af", letterSpacing: 1, marginBottom: 5 },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
  },
  pickerWrap: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: { height: Platform.OS === "ios" ? 120 : 46, color: "#000" },

  errorBox: {
    marginTop: 16,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#ffe4e6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: { fontSize: 11, fontWeight: "700", color: "#e11d48" },

  submitBtn: {
    marginTop: 20,
    backgroundColor: "#000",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: "#fff", fontSize: 12, fontWeight: "900" },

  switchRow: { flexDirection: "row", justifyContent: "center", marginTop: 16, flexWrap: "wrap" },
  switchText: { fontSize: 10, color: "#9ca3af" },
  switchLink: { fontSize: 10, fontWeight: "900", color: "#000", textDecorationLine: "underline" },

  backHome: { marginTop: 24 },
  backHomeText: { fontSize: 10, fontWeight: "900", color: "#9ca3af" },
});