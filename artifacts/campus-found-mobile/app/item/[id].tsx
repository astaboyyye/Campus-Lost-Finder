import { Feather, Ionicons } from "@expo/vector-icons";
import { useGetItem, useCreateClaim } from "@workspace/api-client-react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: "laptop-outline",
  Clothing: "shirt-outline",
  "Bags & Accessories": "bag-outline",
  "Books & Stationery": "book-outline",
  Keys: "key-outline",
  "ID & Documents": "card-outline",
  "Sports Equipment": "football-outline",
  Jewelry: "diamond-outline",
  Other: "ellipsis-horizontal-circle-outline",
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Unknown";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function ItemDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimDesc, setClaimDesc] = useState("");
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  const { data: item, isLoading, error } = useGetItem(Number(id));
  const createClaim = useCreateClaim();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error || !item) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Item not found
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={[styles.backBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const isLost = item.type === "lost";
  const typeColor = isLost ? "#F97316" : "#10B981";
  const typeBg = isLost ? "#FFF7ED" : "#F0FDF4";
  const iconName = (CATEGORY_ICONS[item.category] ?? "ellipsis-horizontal-circle-outline") as any;

  const statusLabel = item.status === "open" ? "Open" : item.status === "claimed" ? "Claimed" : "Resolved";
  const statusColor = item.status === "open" ? colors.success : item.status === "claimed" ? "#F59E0B" : colors.mutedForeground;

  const handleClaim = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (claimDesc.trim().length < 10) {
      Alert.alert("Description too short", "Please provide at least 10 characters describing your proof of ownership.");
      return;
    }
    try {
      await createClaim.mutateAsync({
        data: { itemId: item.id, description: claimDesc.trim() },
      });
      setClaimSubmitted(true);
      setShowClaimForm(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      if (err?.status === 401) {
        Alert.alert(
          "Sign In Required",
          "Please sign in via the CampusFound web app to submit a claim.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "Failed to submit claim. Please try again.");
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBack} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
          Item Details
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 30) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.muted }]}>
          <Ionicons name={iconName} size={72} color={colors.primary} />
        </View>

        <View style={styles.mainContent}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: typeBg }]}>
              <Text style={[styles.badgeText, { color: typeColor }]}>
                {isLost ? "LOST" : "FOUND"}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.muted }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel.toUpperCase()}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.muted }]}>
              <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{item.category}</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {item.title}
          </Text>

          {item.description ? (
            <Text style={[styles.description, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {item.description}
            </Text>
          ) : null}

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            {item.location ? (
              <View style={styles.infoRow}>
                <Feather name="map-pin" size={16} color={colors.primary} />
                <View style={styles.infoTextBlock}>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Location</Text>
                  <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{item.location}</Text>
                </View>
              </View>
            ) : null}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <Feather name="calendar" size={16} color={colors.primary} />
              <View style={styles.infoTextBlock}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  Date {isLost ? "Lost" : "Found"}
                </Text>
                <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                  {formatDate(item.dateLostFound)}
                </Text>
              </View>
            </View>

            {item.userName ? (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.infoRow}>
                  <Feather name="user" size={16} color={colors.primary} />
                  <View style={styles.infoTextBlock}>
                    <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Reported by</Text>
                    <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{item.userName}</Text>
                  </View>
                </View>
              </>
            ) : null}

            {typeof item.claimCount === "number" && item.claimCount > 0 ? (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.infoRow}>
                  <Feather name="file-text" size={16} color={colors.primary} />
                  <View style={styles.infoTextBlock}>
                    <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Claims submitted</Text>
                    <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{item.claimCount}</Text>
                  </View>
                </View>
              </>
            ) : null}
          </View>

          {claimSubmitted ? (
            <View style={[styles.successBanner, { backgroundColor: "#F0FDF4", borderColor: "#10B981", borderRadius: colors.radius }]}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={[styles.successText, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>
                Claim submitted! The reporter will review it.
              </Text>
            </View>
          ) : item.status === "open" && !isLost ? (
            <>
              {!showClaimForm ? (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowClaimForm(true);
                  }}
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: colors.radius,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Ionicons name="hand-left-outline" size={20} color={colors.primaryForeground} />
                  <Text style={[styles.actionButtonText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                    This is Mine — Claim It
                  </Text>
                </Pressable>
              ) : (
                <View style={[styles.claimForm, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
                  <Text style={[styles.claimFormTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    Describe your proof of ownership
                  </Text>
                  <TextInput
                    style={[
                      styles.claimInput,
                      {
                        backgroundColor: colors.muted,
                        color: colors.foreground,
                        borderColor: colors.border,
                        borderRadius: colors.radius / 2,
                        fontFamily: "Inter_400Regular",
                      },
                    ]}
                    placeholder="E.g. I have the purchase receipt, serial number is XYZ123..."
                    placeholderTextColor={colors.mutedForeground}
                    value={claimDesc}
                    onChangeText={setClaimDesc}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  <View style={styles.claimActions}>
                    <Pressable
                      onPress={() => setShowClaimForm(false)}
                      style={[styles.cancelBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
                    >
                      <Text style={[styles.cancelBtnText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleClaim}
                      disabled={createClaim.isPending}
                      style={({ pressed }) => [
                        styles.submitBtn,
                        {
                          backgroundColor: colors.primary,
                          borderRadius: colors.radius,
                          opacity: pressed || createClaim.isPending ? 0.8 : 1,
                          flex: 1,
                        },
                      ]}
                    >
                      {createClaim.isPending ? (
                        <ActivityIndicator color={colors.primaryForeground} size="small" />
                      ) : (
                        <Text style={[styles.submitBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                          Submit Claim
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  errorText: { fontSize: 18 },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backBtnText: { fontSize: 15 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    justifyContent: "space-between",
  },
  headerBack: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    flex: 1,
    textAlign: "center",
  },
  scroll: { flex: 1 },
  scrollContent: { gap: 0 },
  imagePlaceholder: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  mainContent: {
    padding: 20,
    gap: 16,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 12,
  },
  infoTextBlock: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginLeft: 42,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
    borderWidth: 1,
  },
  successText: {
    fontSize: 14,
    flex: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 16,
  },
  claimForm: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  claimFormTitle: {
    fontSize: 15,
  },
  claimInput: {
    borderWidth: 1,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
  },
  claimActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { fontSize: 14 },
  submitBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: { fontSize: 14 },
});
