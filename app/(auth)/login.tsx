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
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { authAPI } from "../../lib/api";

type Mode = "login" | "register";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
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
      const res =
        mode === "login"
          ? await authAPI.login(form.email, form.password)
          : await authAPI.register(form.username, form.email, form.password, form.role);

      const { token, user } = res.data;
      await login(user, token);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const AuthSession = await import("expo-auth-session");

      const discovery = {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
      };

      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
        scopes: ["openid", "profile", "email"],
        redirectUri: AuthSession.makeRedirectUri({ scheme: "enviroscoremap" }),
        responseType: AuthSession.ResponseType.IdToken,
      });

      const result = await request.promptAsync(discovery);

      if (result.type === "success" && result.params?.id_token) {
        const res = await authAPI.googleLogin(result.params.id_token);
        const { token, user } = res.data;
        await login(user, token);
        router.replace("/(tabs)");
      } else if (result.type === "cancel") {
        // User cancelled
      } else {
        setError("Google authentication was interrupted. Please try again.");
      }
    } catch (err: any) {
      console.warn("Google OAuth flow error:", err);
      setError(
        "Google Sign-In is not configured yet. Set up EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env to enable it."
      );
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
          <TouchableOpacity style={styles.logoRow} onPress={() => router.push("/home")}>
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

            {/* Google Sign-In Button */}
            {mode === "login" && (
              <>
                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={handleGoogleLogin}
                  disabled={loading}
                >
                  <Text style={styles.googleBtnText}>G</Text>
                  <Text style={styles.googleBtnLabel}>Sign in with Google</Text>
                </TouchableOpacity>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}

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

          <TouchableOpacity style={styles.backHome} onPress={() => router.push("/home")}>
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

  // Google Sign-In
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#4285F4",
  },
  googleBtnLabel: { fontSize: 12, fontWeight: "700", color: "#374151" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 6,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: { fontSize: 9, fontWeight: "900", color: "#9ca3af", letterSpacing: 1 },

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