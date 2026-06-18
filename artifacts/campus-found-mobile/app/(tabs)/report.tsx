import { Feather, Ionicons } from "@expo/vector-icons";
import { useCreateItem } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
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
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type ItemType = "lost" | "found";

const CATEGORIES = [
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

export default function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const createItem = useCreateItem();

  const [type, setType] = useState<ItemType>("lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a title for the item.");
      return;
    }
    if (!category) {
      Alert.alert("Required", "Please select a category.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await createItem.mutateAsync({
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          category,
          location: location.trim() || undefined,
          dateLostFound: date.trim() || undefined,
        },
      });
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      if (err?.status === 401) {
        Alert.alert(
          "Sign In Required",
          "You need to sign in to report items. Please use the CampusFound web app to create an account first.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert("Error", "Failed to submit report. Please try again.");
      }
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setLocation("");
    setDate("");
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.successContainer, { paddingTop: topPad }]}>
          <View style={[styles.successIcon, { backgroundColor: "#F0FDF4" }]}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Item Reported!
          </Text>
          <Text style={[styles.successSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Your {type} item has been added to the campus database. Others can now see it and submit claims.
          </Text>
          <Pressable
            onPress={handleReset}
            style={[styles.newReportBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          >
            <Text style={[styles.newReportBtnText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
              Report Another Item
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/" as any)}
            style={[styles.browseBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <Text style={[styles.browseBtnText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              Browse Items
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Report Item
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Help reunite lost items with their owners
        </Text>
      </View>

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 84 : 90) },
        ]}
        showsVerticalScrollIndicator={false}
        bottomOffset={16}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            What happened? *
          </Text>
          <View style={styles.typeRow}>
            {(["lost", "found"] as ItemType[]).map((t) => {
              const active = type === t;
              const activeColor = t === "lost" ? "#F97316" : "#10B981";
              const activeBg = t === "lost" ? "#FFF7ED" : "#F0FDF4";
              return (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: active ? activeBg : colors.muted,
                      borderColor: active ? activeColor : colors.border,
                      borderRadius: colors.radius,
                      flex: 1,
                    },
                  ]}
                >
                  <Ionicons
                    name={t === "lost" ? "search-outline" : "hand-left-outline"}
                    size={22}
                    color={active ? activeColor : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.typeBtnText,
                      {
                        color: active ? activeColor : colors.mutedForeground,
                        fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
                      },
                    ]}
                  >
                    I {t === "lost" ? "Lost" : "Found"} Something
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Item Title *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.muted,
                borderColor: colors.border,
                color: colors.foreground,
                borderRadius: colors.radius,
                fontFamily: "Inter_400Regular",
              },
            ]}
            placeholder="e.g. Black JanSport Backpack"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Category *
          </Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: category === cat ? colors.primary : colors.muted,
                    borderColor: category === cat ? colors.primary : colors.border,
                    borderRadius: colors.radius / 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catChipText,
                    {
                      color: category === cat ? colors.primaryForeground : colors.foreground,
                      fontFamily: category === cat ? "Inter_600SemiBold" : "Inter_400Regular",
                    },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Description
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textarea,
              {
                backgroundColor: colors.muted,
                borderColor: colors.border,
                color: colors.foreground,
                borderRadius: colors.radius,
                fontFamily: "Inter_400Regular",
              },
            ]}
            placeholder="Describe the item in detail — color, brand, any identifiers..."
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Location
          </Text>
          <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Feather name="map-pin" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.inputInner, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="e.g. Main Library, 2nd Floor"
              placeholderTextColor={colors.mutedForeground}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Date {type === "lost" ? "Lost" : "Found"}
          </Text>
          <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Feather name="calendar" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.inputInner, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              value={date}
              onChangeText={setDate}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={createItem.isPending}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed || createItem.isPending ? 0.85 : 1,
            },
          ]}
        >
          {createItem.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <>
              <Feather name="send" size={18} color={colors.primaryForeground} />
              <Text style={[styles.submitButtonText, { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }]}>
                Submit Report
              </Text>
            </>
          )}
        </Pressable>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 4,
  },
  headerTitle: { fontSize: 28, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  section: { gap: 10 },
  sectionLabel: { fontSize: 15 },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeBtn: {
    padding: 14,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 8,
  },
  typeBtnText: { fontSize: 13, textAlign: "center" },
  input: {
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
  },
  textarea: { minHeight: 88 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputInner: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  catChipText: { fontSize: 13 },
  submitButton: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  submitButtonText: { fontSize: 16 },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 20,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: { fontSize: 28, letterSpacing: -0.5 },
  successSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  newReportBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  newReportBtnText: { fontSize: 16 },
  browseBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
  },
  browseBtnText: { fontSize: 16 },
});
