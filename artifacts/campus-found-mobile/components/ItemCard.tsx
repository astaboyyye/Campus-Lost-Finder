import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface Item {
  id: number;
  title: string;
  description?: string | null;
  type: "lost" | "found";
  category: string;
  location?: string | null;
  dateLostFound?: string | null;
  imageUrl?: string | null;
  status: "open" | "claimed" | "resolved";
  userId: string;
  userName?: string | null;
  claimCount?: number | null;
  createdAt: string;
}

interface ItemCardProps {
  item: Item;
}

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: "laptop-outline",
  "Clothing": "shirt-outline",
  "Bags & Accessories": "bag-outline",
  "Books & Stationery": "book-outline",
  Keys: "key-outline",
  "ID & Documents": "card-outline",
  "Sports Equipment": "football-outline",
  Jewelry: "diamond-outline",
  Other: "ellipsis-horizontal-circle-outline",
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

export function ItemCard({ item }: ItemCardProps) {
  const colors = useColors();
  const router = useRouter();

  const isLost = item.type === "lost";
  const isResolved = item.status === "resolved";
  const isClaimed = item.status === "claimed";

  const typeColor = isLost ? "#F97316" : "#10B981";
  const typeBg = isLost ? "#FFF7ED" : "#F0FDF4";
  const iconName = (CATEGORY_ICONS[item.category] ?? "ellipsis-horizontal-circle-outline") as any;

  let statusLabel = "Open";
  let statusColor = colors.success;
  let statusBg = "#F0FDF4";
  if (isClaimed) {
    statusLabel = "Claimed";
    statusColor = "#F59E0B";
    statusBg = "#FFFBEB";
  } else if (isResolved) {
    statusLabel = "Resolved";
    statusColor = colors.mutedForeground;
    statusBg = colors.muted;
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
      onPress={() => router.push(`/item/${item.id}` as any)}
    >
      <View style={[styles.imageArea, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
        <Ionicons name={iconName} size={40} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: typeBg }]}>
            <Text style={[styles.badgeText, { color: typeColor }]}>
              {isLost ? "LOST" : "FOUND"}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusBg }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{item.category}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={2}>
          {item.title}
        </Text>

        {item.location ? (
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {formatDate(item.dateLostFound ?? item.createdAt)}
            </Text>
          </View>
          {item.userName ? (
            <View style={styles.avatarRow}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>
                  {item.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
                {item.userName.split(" ")[0]}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  imageArea: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 14,
    gap: 8,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    maxWidth: 100,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
