import React from "react";
import { View, Text, StyleSheet } from "react-native";

// react-native-maps is a native-only module (iOS/Android) — it has no web
// implementation, so Metro can't bundle it into the browser build.
// This file is picked automatically instead of InteractiveMap.tsx whenever
// the app runs on web (Metro resolves "ComponentName.web.tsx" first).
// InteractiveMap.tsx (with the real MapView) still loads normally on
// iOS and Android — nothing about that file needs to change.
export default function InteractiveMap() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Interactive Map</Text>
      <Text style={styles.body}>
        The live map is only available on the iOS and Android app right now.
        Open this screen from your phone or an emulator to explore district
        eco-scores on the map.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f7",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: { fontSize: 20, fontWeight: "900", marginBottom: 12 },
  body: {
    fontSize: 13,
    color: "#737373",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 320,
  },
});