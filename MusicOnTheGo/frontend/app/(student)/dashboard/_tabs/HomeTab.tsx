import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Avatar } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Select, SelectItem } from "../../../../components/ui/select";

type Teacher = {
  id: string;
  _id?: string; // Legacy support
  name: string;
  email: string;
  instruments: string[];
  experience: string;
  location: string;
  rate?: number;
  about?: string;
  specialties?: string[];
  profileImage?: string;
  averageRating?: number | null;
  reviewCount?: number;
};

/** Normalize location string to city (first part before comma) for comparison */
function getCityFromLocation(location: string | undefined): string {
  if (!location || !location.trim()) return "";
  return location.split(",")[0]?.trim().toLowerCase() || "";
}

type HomeTabProps = {
  teachers: Teacher[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  myTeachers?: Teacher[]; // Teachers the student has booked with
  studentCity?: string; // Student's city from profile (e.g. first part of location) for "Teachers in my city"
  isGuest?: boolean;
  onRequireLogin?: (redirect?: string) => void;
};

export default function HomeTab({
  teachers,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  myTeachers = [],
  studentCity,
  isGuest = false,
  onRequireLogin,
}: HomeTabProps) {
  const router = useRouter();
  const [selectedInstrument, setSelectedInstrument] = useState("all");
  const [instrumentSearchText, setInstrumentSearchText] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [showAvailableTeachers, setShowAvailableTeachers] = useState(false);
  const [instrumentModalVisible, setInstrumentModalVisible] = useState(false);
  const [instrumentModalInput, setInstrumentModalInput] = useState("");

  // Get IDs of my teachers to filter them out from available teachers
  const myTeacherIds = useMemo(() => {
    return new Set(myTeachers.map((t) => t.id || t._id)); // Support both for transition
  }, [myTeachers]);

  // Normalized student city for matching (e.g. "new york")
  const studentCityNorm = useMemo(
    () => (studentCity && studentCity.trim() ? studentCity.trim().toLowerCase() : null),
    [studentCity]
  );

  // Filter teachers based on filters
  // Also exclude teachers that the student already has bookings with
  const filteredTeachers = teachers.filter((teacher) => {
    // Exclude teachers the student already has bookings with
    const teacherId = teacher.id || teacher._id; // Support both for transition
    if (myTeacherIds.has(teacherId)) {
      return false;
    }

    const instrumentFilter = instrumentSearchText.trim();
    const matchesInstrument = instrumentFilter
      ? teacher.instruments.some((inst) =>
          inst.toLowerCase().includes(instrumentFilter.toLowerCase())
        )
      : selectedInstrument === "all" ||
        teacher.instruments.some(
          (inst) => inst.toLowerCase() === selectedInstrument.toLowerCase()
        );

    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "low" && (!teacher.rate || teacher.rate < 45)) ||
      (priceRange === "medium" &&
        teacher.rate &&
        teacher.rate >= 45 &&
        teacher.rate < 55) ||
      (priceRange === "high" && teacher.rate && teacher.rate >= 55);

    return matchesInstrument && matchesPrice;
  });

  // When student has a city set, split available teachers: "in my city" first, then "other"
  const { teachersInMyCity, otherTeachers } = useMemo(() => {
    if (!studentCityNorm) {
      return { teachersInMyCity: [] as Teacher[], otherTeachers: filteredTeachers };
    }
    const inCity: Teacher[] = [];
    const other: Teacher[] = [];
    const studentCityStr = studentCityNorm;
    filteredTeachers.forEach((t) => {
      const teacherCity = getCityFromLocation(t.location);
      if (teacherCity && teacherCity === studentCityStr) {
        inCity.push(t);
      } else {
        other.push(t);
      }
    });
    return { teachersInMyCity: inCity, otherTeachers: other };
  }, [filteredTeachers, studentCityNorm]);

  // Render teacher card
  const renderTeacher = useCallback(
    ({ item: teacher }: { item: Teacher }) => (
      <Card
        key={teacher.id || teacher._id}
        style={styles.teacherCard}
        onPress={() => router.push(`/(student)/teacher/${teacher.id || teacher._id}` as Href)}
      >
        <View style={styles.teacherCardContent}>
          <Avatar
            src={teacher.profileImage}
            fallback={teacher.name.charAt(0)}
            size={64}
          />

          <View style={styles.teacherInfo}>
            <View>
              <Text style={styles.cardTitle}>{teacher.name}</Text>
              <Text style={styles.cardSubtitle}>
                {teacher.instruments?.length
                  ? teacher.instruments.join(", ")
                  : "No instruments listed"}
              </Text>
            </View>

            <View style={styles.teacherMeta}>
              {teacher.averageRating !== null && teacher.averageRating !== undefined && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#FFB800" />
                  <Text style={styles.ratingText}>{teacher.averageRating.toFixed(1)}</Text>
                  {teacher.reviewCount !== undefined && teacher.reviewCount > 0 && (
                    <Text style={styles.reviewsText}>({teacher.reviewCount})</Text>
                  )}
                </View>
              )}
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color="#666" />
                <Text style={styles.locationText}>
                  {teacher.location
                    ? teacher.location.split(",")[0]
                    : "Location TBD"}
                </Text>
              </View>
            </View>

            {teacher.specialties && teacher.specialties.length > 0 && (
              <View style={styles.specialtiesRow}>
                {teacher.specialties.slice(0, 3).map((specialty, index) => (
                  <Badge
                    key={index}
                    variant={index % 2 === 0 ? "default" : "warning"}
                    style={styles.specialtyBadge}
                  >
                    {specialty}
                  </Badge>
                ))}
                {teacher.specialties.length > 3 && (
                  <Text style={styles.moreSpecialtiesText}>
                    +{teacher.specialties.length - 3} more
                  </Text>
                )}
              </View>
            )}

            <View style={styles.teacherFooter}>
              <Text style={styles.priceText}>
                {typeof teacher.rate === 'number' && teacher.rate > 0 ? `$${teacher.rate}/hour` : "Rate TBD"}
              </Text>
              <Button
                size="sm"
                onPress={() => {
                  router.push(`/(student)/teacher/${teacher.id || teacher._id}` as Href);
                }}
              >
                View Profile
              </Button>
            </View>
          </View>
        </View>
      </Card>
    ),
    [router]
  );

  const keyExtractor = useCallback((item: Teacher) => item.id || item._id || "", []);

  return (
    <View style={styles.section}>
      {/* Quick Access Cards */}
      <View style={styles.quickAccessRow}>
        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            if (isGuest && onRequireLogin) onRequireLogin("/(student)/practice-log");
            else router.push("/(student)/practice-log");
          }}
        >
          <Ionicons name="trending-up-outline" size={20} color="#FF6A5C" />
          <Text style={styles.quickAccessText} numberOfLines={1}>Progress</Text>
        </Card>

        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            if (isGuest && onRequireLogin) onRequireLogin("/(student)/resources");
            else router.push("/(student)/resources");
          }}
        >
          <Ionicons name="book-outline" size={20} color="#FF9076" />
          <Text style={styles.quickAccessText} numberOfLines={1}>Resources</Text>
        </Card>

        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            if (isGuest && onRequireLogin) onRequireLogin("/(student)/community");
            else router.push("/(student)/community");
          }}
        >
          <Ionicons name="people-outline" size={20} color="#10B981" />
          <Text style={styles.quickAccessText} numberOfLines={1}>Community</Text>
        </Card>

        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            if (isGuest && onRequireLogin) onRequireLogin("/(student)/practice-tools");
            else router.push("/(student)/practice-tools");
          }}
        >
          <Ionicons name="construct-outline" size={20} color="#4A90E2" />
          <Text style={styles.quickAccessText} numberOfLines={1}>Tools</Text>
        </Card>
      </View>

      {/* Filters */}
      <Card style={styles.filtersCard}>
        <View style={styles.filtersHeader}>
          <Ionicons name="filter-outline" size={16} color="#FF6A5C" />
          <Text style={styles.filtersTitle}>Filters</Text>
        </View>
        <View style={styles.filtersRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Instrument</Text>
            <TouchableOpacity
              style={styles.instrumentTrigger}
              onPress={() => {
                setInstrumentModalInput(instrumentSearchText.trim());
                setInstrumentModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.instrumentTriggerText} numberOfLines={1}>
                {instrumentSearchText.trim()
                  ? instrumentSearchText.trim()
                  : selectedInstrument === "all"
                    ? "All"
                    : selectedInstrument}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            <Modal
              visible={instrumentModalVisible}
              transparent
              animationType="slide"
              onRequestClose={() => {
                const t = instrumentModalInput.trim();
                if (t) {
                  setInstrumentSearchText(t);
                  setSelectedInstrument("all");
                }
                setInstrumentModalVisible(false);
              }}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => {
                  const t = instrumentModalInput.trim();
                  if (t) {
                    setInstrumentSearchText(t);
                    setSelectedInstrument("all");
                  }
                  setInstrumentModalVisible(false);
                }}
              >
                <KeyboardAvoidingView
                  behavior={Platform.OS === "ios" ? "padding" : undefined}
                  style={styles.modalKeyboardView}
                >
                  <View style={styles.instrumentModalContent} onStartShouldSetResponder={() => true}>
                    <View style={styles.instrumentModalHeader}>
                      <Text style={styles.instrumentModalTitle}>Instrument</Text>
                      <TouchableOpacity
                        onPress={() => {
                          const t = instrumentModalInput.trim();
                          if (t) {
                            setInstrumentSearchText(t);
                            setSelectedInstrument("all");
                          }
                          setInstrumentModalVisible(false);
                        }}
                      >
                        <Ionicons name="close" size={24} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.instrumentModalHint}>Type an instrument or pick one below</Text>
                    <TextInput
                      placeholder="e.g. Ukulele, Cello, Clarinet"
                      placeholderTextColor="#999"
                      value={instrumentModalInput}
                      onChangeText={setInstrumentModalInput}
                      style={styles.instrumentModalInput}
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        const t = instrumentModalInput.trim();
                        if (t) {
                          setInstrumentSearchText(t);
                          setSelectedInstrument("all");
                        }
                        setInstrumentModalVisible(false);
                      }}
                    />
                    <ScrollView style={styles.instrumentModalList} keyboardShouldPersistTaps="handled">
                      {[
                        { value: "all", label: "All" },
                        { value: "Piano", label: "Piano" },
                        { value: "Guitar", label: "Guitar" },
                        { value: "Violin", label: "Violin" },
                        { value: "Voice", label: "Voice" },
                        { value: "Drums", label: "Drums" },
                        { value: "Bass", label: "Bass" },
                        { value: "Saxophone", label: "Saxophone" },
                        { value: "Flute", label: "Flute" },
                      ].map(({ value, label }) => {
                        const isSelected =
                          !instrumentModalInput.trim() && selectedInstrument === value;
                        return (
                          <TouchableOpacity
                            key={value}
                            style={[styles.instrumentModalOption, isSelected && styles.instrumentModalOptionSelected]}
                            onPress={() => {
                              setSelectedInstrument(value);
                              setInstrumentSearchText("");
                              setInstrumentModalVisible(false);
                            }}
                          >
                            <Text style={[styles.instrumentModalOptionText, isSelected && styles.instrumentModalOptionTextSelected]}>
                              {label}
                            </Text>
                            {isSelected && <Ionicons name="checkmark" size={20} color="#FF6A5C" />}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </KeyboardAvoidingView>
              </TouchableOpacity>
            </Modal>
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Price Range</Text>
            <Select value={priceRange} onValueChange={setPriceRange} placeholder="All">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="low">Under $45</SelectItem>
              <SelectItem value="medium">$45 - $55</SelectItem>
              <SelectItem value="high">$55+</SelectItem>
            </Select>
          </View>
        </View>
      </Card>

      {/* My Teachers Section */}
      {myTeachers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.teachersHeader}>
            <Text style={styles.sectionTitle}>My Teachers</Text>
            <Badge variant="default">{myTeachers.length}</Badge>
          </View>
          <FlatList
            data={myTeachers}
            renderItem={renderTeacher}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Available Teachers Section - Collapsible */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.teachersHeader}
          onPress={() => setShowAvailableTeachers(!showAvailableTeachers)}
          activeOpacity={0.7}
        >
          <View style={styles.collapsibleHeader}>
            <Text style={styles.sectionTitleInline}>Available Teachers</Text>
            <Badge variant="default">
              {`${teachers.length} total, ${filteredTeachers.length} available${studentCityNorm ? ` · ${teachersInMyCity.length} in your city` : ""}`}
            </Badge>
          </View>
          <Ionicons
            name={showAvailableTeachers ? "chevron-up" : "chevron-down"}
            size={24}
            color="#FF6A5C"
          />
        </TouchableOpacity>

      {showAvailableTeachers && (
        <>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6A5C" />
              <Text style={styles.loadingText}>Loading teachers...</Text>
            </View>
          )}

          {loading && filteredTeachers.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6A5C" />
              <Text style={styles.loadingText}>Loading teachers...</Text>
            </View>
          ) : filteredTeachers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>
                {teachers.length === 0
                  ? "No teachers available yet. Check back soon."
                  : `No teachers match your filters. (${teachers.length} teachers found but filtered out)`}
              </Text>
              {teachers.length > 0 && (
                <Text style={[styles.emptyText, { marginTop: 8, fontSize: 12, color: "#999" }]}>
                  Try adjusting your filters.
                </Text>
              )}
            </View>
          ) : (
            <>
              {/* Teachers in my city - shown first when student has location set */}
              {studentCityNorm && teachersInMyCity.length > 0 && (
                <View style={styles.subsection}>
                  <View style={styles.teachersHeader}>
                    <Ionicons name="location" size={18} color="#FF6A5C" />
                    <Text style={styles.subsectionTitle}>
                      Teachers in {studentCity ? studentCity.trim() : "your city"}
                    </Text>
                    <Badge variant="default">{teachersInMyCity.length}</Badge>
                  </View>
                  <FlatList
                    data={teachersInMyCity}
                    renderItem={renderTeacher}
                    keyExtractor={keyExtractor}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              )}

              {/* Other teachers (or all available when no city filter) */}
              {otherTeachers.length > 0 && (
                <View style={styles.subsection}>
                  <View style={styles.teachersHeader}>
                    <Text style={styles.subsectionTitle}>
                      {studentCityNorm ? "Other teachers" : "All available"}
                    </Text>
                    <Badge variant="secondary">{otherTeachers.length}</Badge>
                  </View>
                  <FlatList
                    data={otherTeachers}
                    renderItem={renderTeacher}
                    keyExtractor={keyExtractor}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    onEndReached={onLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                      loadingMore ? (
                        <View style={styles.loadingMoreContainer}>
                          <ActivityIndicator size="small" color="#FF6A5C" />
                          <Text style={styles.loadingMoreText}>Loading more teachers...</Text>
                        </View>
                      ) : null
                    }
                  />
                </View>
              )}

              {/* Edge case: city set but no teachers in city and no others (filtered to zero in both) is already handled by filteredTeachers.length === 0 above */}
            </>
          )}
        </>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
  quickAccessRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  quickAccessCard: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    minHeight: 70,
    justifyContent: "center",
    minWidth: 0, // Allow flex shrinking
  },
  quickAccessText: {
    fontSize: (() => {
      const w = Dimensions.get("window").width;
      const cardWidth = (w - 40 - 30) / 4;
      const fontSizeByWidth = Math.floor(cardWidth / 7);
      if (w < 340) return Math.max(7, Math.min(9, fontSizeByWidth));
      if (w < 380) return Math.max(8, Math.min(10, fontSizeByWidth));
      return Math.max(9, Math.min(12, fontSizeByWidth));
    })(),
    fontWeight: "600",
    color: "#333",
    marginTop: 6,
    textAlign: "center",
    width: "100%",
  },
  filtersCard: {
    marginBottom: 20,
  },
  filtersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  filtersRow: {
    flexDirection: "row",
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  instrumentTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  instrumentTriggerText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalKeyboardView: {
    justifyContent: "flex-end",
  },
  instrumentModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 24,
  },
  instrumentModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  instrumentModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  instrumentModalHint: {
    fontSize: 12,
    color: "#888",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 6,
  },
  instrumentModalInput: {
    backgroundColor: "#FFF5F3",
    borderWidth: 1,
    borderColor: "#FFE0D6",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  instrumentModalList: {
    maxHeight: 280,
  },
  instrumentModalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4",
  },
  instrumentModalOptionSelected: {
    backgroundColor: "#FFF5F3",
  },
  instrumentModalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  instrumentModalOptionTextSelected: {
    color: "#FF6A5C",
    fontWeight: "600",
  },
  teachersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  collapsibleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  sectionTitleInline: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 0,
  },
  subsection: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#333",
    marginBottom: 0,
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#777",
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    color: "#777",
    textAlign: "center",
    fontSize: 14,
  },
  teacherCard: {
    marginBottom: 12,
  },
  teacherCardContent: {
    flexDirection: "row",
    gap: 16,
  },
  teacherInfo: {
    flex: 1,
    gap: 8,
  },
  teacherMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFB800",
  },
  reviewsText: {
    fontSize: 12,
    color: "#666",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#666",
  },
  specialtiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
    marginTop: 4,
  },
  specialtyBadge: {
    marginRight: 0,
  },
  moreSpecialtiesText: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
  teacherFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF6A5C",
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardSubtitle: { color: "#777", marginTop: 3 },
});

