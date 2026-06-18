import { Feather, Ionicons } from "@expo/vector-icons";
import { useListItems } from "@workspace/api-client-react";
import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { ItemCard } from "@/components/ItemCard";

const FEATURES = [
  { icon: "search", label: "Browse lost & found items" },
  { icon: "plus-circle", label: "Report lost or found items" },
  { icon: "file-text", label: "Submit ownership claims" },
  { icon: "bell", label: "Get notified when items match" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: recentData } = useListItems({ limit: 4, status: "open" });
  const recentItems = recentData?.items ?? [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        Profile
      </Text>

      <View style={[styles.signInCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.muted }]}>
          <Ionicons name="person-outline" size={36} color={colors.mutedForeground} />
        </View>
        <Text style={[styles.signInTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Sign in to CampusFound
        </Text>
        <Text style={[styles.signInDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Create an account or sign in via the web app to access all features — report items, track your claims, and manage your profile.
        </Text>
        <Pressable
          onPress={() => Linking.openURL("https://replit.com")}
          style={({ pressed }) => [
            styles.signInBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="external-link" size={16} color={colors.primaryForeground} />
          <Text style={[styles.signInBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
            Open Web App
          </Text>
        </Pressable>
      </View>

      <View style={styles.featuresSection}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          What you can do
        </Text>
        <View style={[styles.featuresList, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          {FEATURES.map((f, i) => (
            <View key={f.label}>
              <View style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: colors.muted }]}>
                  <Feather name={f.icon as any} size={16} color={colors.primary} />
                </View>
                <Text style={[styles.featureText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                  {f.label}
                </Text>
              </View>
              {i < FEATURES.length - 1 && (
                <View style={[styles.featureDivider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>
      </View>

      {recentItems.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Recent Items
          </Text>
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    gap: 24,
  },
  title: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  signInCard: {
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  signInTitle: { fontSize: 18, textAlign: "center" },
  signInDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  signInBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    justifyContent: "center",
    marginTop: 4,
  },
  signInBtnText: { fontSize: 15 },
  featuresSection: { gap: 12 },
  sectionTitle: { fontSize: 17 },
  featuresList: {
    borderWidth: 1,
    overflow: "hidden",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { fontSize: 14, flex: 1 },
  featureDivider: { height: 1, marginLeft: 62 },
  recentSection: { gap: 12 },
});
