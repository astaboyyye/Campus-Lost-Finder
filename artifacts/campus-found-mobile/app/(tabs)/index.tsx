import { Feather, Ionicons } from "@expo/vector-icons";
import { useListItems, useGetItemStats } from "@workspace/api-client-react";
import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ItemCard } from "@/components/ItemCard";
import { useColors } from "@/hooks/useColors";

type FilterType = "all" | "lost" | "found";
type FilterStatus = "all" | "open" | "resolved";

const CATEGORIES = [
  "All",
  "Electronics",
  "Clothing",
  "Bags & Accessories",
  "Books & Stationery",
  "Keys",
  "ID & Documents",
  "Sports Equipment",
  "Jewelry",
  "Other",
];

export default function BrowseScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCategories, setShowCategories] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, refetch, isRefetching } = useListItems({
    type: typeFilter !== "all" ? typeFilter : undefined,
    search: activeSearch || undefined,
    status: "open",
    category: categoryFilter !== "All" ? categoryFilter : undefined,
    limit: 30,
  });

  const { data: stats } = useGetItemStats();

  const handleSearch = useCallback(() => {
    setActiveSearch(search.trim());
  }, [search]);

  const handleClear = useCallback(() => {
    setSearch("");
    setActiveSearch("");
  }, []);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const ListHeader = (
    <View>
      <View style={[styles.hero, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <View style={styles.brandRow}>
          <View style={[styles.brandIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="location" size={20} color="#fff" />
          </View>
          <Text style={[styles.brandName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Campus<Text style={{ color: colors.primary }}>Found</Text>
          </Text>
        </View>

        {stats ? (
          <View style={styles.statsRow}>
            <View style={[styles.statPill, { backgroundColor: "#FFF7ED" }]}>
              <Text style={[styles.statNum, { color: "#F97316" }]}>{stats.totalLost}</Text>
              <Text style={[styles.statLabel, { color: "#F97316" }]}>Lost</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: "#F0FDF4" }]}>
              <Text style={[styles.statNum, { color: "#10B981" }]}>{stats.totalFound}</Text>
              <Text style={[styles.statLabel, { color: "#10B981" }]}>Found</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: colors.muted }]}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{stats.totalResolved}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Returned</Text>
            </View>
          </View>
        ) : null}

        <View style={[styles.searchRow, { backgroundColor: colors.input, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
            placeholder="Search lost & found items..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={handleClear} hitSlop={8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <View style={styles.filterRow}>
          {(["all", "lost", "found"] as FilterType[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTypeFilter(t)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: typeFilter === t ? colors.primary : colors.muted,
                  borderRadius: colors.radius / 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: typeFilter === t ? colors.primaryForeground : colors.mutedForeground,
                    fontFamily: typeFilter === t ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {t === "all" ? "All Items" : t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setShowCategories(!showCategories)}
            style={[
              styles.filterChip,
              {
                backgroundColor: categoryFilter !== "All" ? colors.secondary : colors.muted,
                borderRadius: colors.radius / 2,
                flexDirection: "row",
                gap: 4,
                alignItems: "center",
              },
            ]}
          >
            <Feather
              name="filter"
              size={12}
              color={categoryFilter !== "All" ? colors.secondaryForeground : colors.mutedForeground}
            />
            <Text
              style={[
                styles.filterChipText,
                {
                  color: categoryFilter !== "All" ? colors.secondaryForeground : colors.mutedForeground,
                  fontFamily: categoryFilter !== "All" ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {categoryFilter}
            </Text>
          </Pressable>
        </View>

        {showCategories && (
          <View style={styles.categoryDropdown}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => {
                  setCategoryFilter(cat);
                  setShowCategories(false);
                }}
                style={[
                  styles.categoryItem,
                  {
                    backgroundColor: categoryFilter === cat ? colors.primary : "transparent",
                    borderRadius: colors.radius / 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryItemText,
                    {
                      color: categoryFilter === cat ? colors.primaryForeground : colors.foreground,
                      fontFamily: categoryFilter === cat ? "Inter_600SemiBold" : "Inter_400Regular",
                    },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.resultsRow}>
          <Text style={[styles.resultsText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {isLoading ? "Loading…" : `${total} item${total !== 1 ? "s" : ""} found`}
          </Text>
          {activeSearch ? (
            <Pressable onPress={handleClear} style={styles.clearSearch}>
              <Text style={[styles.clearSearchText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                Clear search
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );

  const EmptyState = (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={56} color={colors.mutedForeground} />
      <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
        No items found
      </Text>
      <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ItemCard item={item} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : EmptyState}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 4,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 22,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    gap: 2,
  },
  statNum: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterChipText: {
    fontSize: 13,
  },
  categoryDropdown: {
    gap: 2,
    paddingVertical: 4,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  categoryItemText: {
    fontSize: 14,
  },
  resultsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultsText: {
    fontSize: 13,
  },
  clearSearch: {
    paddingHorizontal: 4,
  },
  clearSearchText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingState: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyState: {
    paddingTop: 60,
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});
