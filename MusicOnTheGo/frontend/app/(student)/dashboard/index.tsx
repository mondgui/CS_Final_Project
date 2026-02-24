// app/(student)/dashboard/index.tsx

import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../../../lib/api";
import { getSupabaseClient } from "../../../lib/supabase";
import { Card } from "../../../components/ui/card";
import { useAuth } from "../../../hooks/use-auth";
import { useGuestDialog } from "../../../contexts/GuestActionContext";

import HomeTab from "./_tabs/HomeTab";
import LessonsTab from "./_tabs/LessonsTab";
import SettingsTab from "./_tabs/SettingsTab";

// ---------- TYPES ---------- //

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

type TabKey = "home" | "lessons" | "settings";

type TabConfig = {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Bottom tabs config
const TABS: TabConfig[] = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "lessons", label: "My Lessons", icon: "calendar-outline" },
  { key: "settings", label: "Settings", icon: "settings-outline" },
];

// ---------- MAIN COMPONENT ---------- //

export default function StudentDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { isLoggedIn, isGuest } = useAuth();
  const { runIfLoggedIn } = useGuestDialog();
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  // Load user with React Query (only when logged in)
  const { data: user } = useQuery({
    queryKey: ["student-user"],
    queryFn: async () => {
      return await api("/api/users/me", { auth: true });
    },
    enabled: isLoggedIn,
  });

  // Fetch unread message count (only when logged in)
  const { data: unreadCount, refetch: refetchUnreadCount } = useQuery({
    queryKey: ["unread-messages-count"],
    queryFn: async () => {
      try {
        const response = await api("/api/messages/unread-count", { auth: true });
        return response?.count || 0;
      } catch {
        return 0;
      }
    },
    refetchInterval: 30000,
    enabled: isLoggedIn,
  });

  // Refetch unread count when screen comes into focus (e.g., returning from chat)
  useFocusEffect(
    useCallback(() => {
      refetchUnreadCount();
    }, [refetchUnreadCount])
  );

  // Supabase Realtime: invalidate unread count on new message or mark-as-read
  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    let channel: { unsubscribe: () => void } | null = null;

    (async () => {
      try {
        const supabaseClient = await getSupabaseClient();
        const currentUserId = user!.id;

        channel = supabaseClient
          .channel("student-unread")
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "Message" }, (payload) => {
            if (!mounted) return;
            const row = (payload.new as any);
            if (String(row.recipientId) === String(currentUserId)) {
              queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
            }
          })
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "Message" }, (payload) => {
            if (!mounted) return;
            const row = payload.new as any;
            if (String(row.recipientId) === String(currentUserId) && row.read) {
              queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
            }
          })
          .subscribe();
      } catch (e) {
        if (mounted) console.warn("[Student Dashboard] Supabase Realtime (unread):", e);
      }
    })();

    return () => {
      mounted = false;
      if (channel) channel.unsubscribe();
    };
  }, [user?.id, queryClient]);

  // Teachers query with infinite pagination (works for guests — public API)
  const {
    data: teachersData,
    fetchNextPage,
    hasNextPage,
    isFetching: loadingTeachers,
    isFetchingNextPage: loadingMoreTeachers,
    refetch: refetchTeachers,
  } = useInfiniteQuery({
    queryKey: ["teachers"],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string> = {
        page: pageParam.toString(),
        limit: "20",
      };

      try {
        const response = await api("/api/users/teachers", {
          method: "GET",
          params,
        });

        const teachersData = response?.teachers || (Array.isArray(response) ? response : []);
        const pagination = response?.pagination;

        return {
          teachers: Array.isArray(teachersData) ? teachersData : [],
          pagination: pagination || { hasMore: (teachersData?.length || 0) >= 20 },
          nextPage: pagination?.hasMore ? pageParam + 1 : undefined,
        };
      } catch (error: any) {
        // Return empty array on error
        return {
          teachers: [],
          pagination: { hasMore: false },
          nextPage: undefined,
        };
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  // Flatten all pages into a single array
  const teachers = useMemo(() => {
    return teachersData?.pages.flatMap((page) => page.teachers) || [];
  }, [teachersData]);

  // Fetch student's bookings (only when logged in)
  const { data: bookingsData } = useInfiniteQuery({
    queryKey: ["student-bookings"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api("/api/bookings/student/me", {
        auth: true,
        params: {
          page: pageParam.toString(),
          limit: "20",
        },
      });

      const bookings = response?.bookings || response || [];
      const pagination = response?.pagination;

      return {
        bookings: Array.isArray(bookings) ? bookings : [],
        pagination: pagination || { hasMore: bookings.length >= 20 },
        nextPage: pagination?.hasMore ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: isLoggedIn,
  });

  // Extract unique teachers from bookings
  const myTeachers = useMemo(() => {
    const allBookings = bookingsData?.pages.flatMap((page) => page.bookings) || [];
    const teacherMap = new Map<string, Teacher>();

    allBookings.forEach((booking: any) => {
      if (booking.teacher && (booking.teacher.id || booking.teacher._id)) {
        const teacherId = String(booking.teacher.id || booking.teacher._id);
        if (!teacherMap.has(teacherId)) {
          teacherMap.set(teacherId, {
            id: teacherId,
            _id: teacherId, // Legacy support
            name: booking.teacher.name || "Teacher",
            email: booking.teacher.email || "",
            instruments: booking.teacher.instruments || [],
            experience: booking.teacher.experience || "",
            location: booking.teacher.location || "",
            rate: booking.teacher.rate,
            about: booking.teacher.about,
            specialties: booking.teacher.specialties || [],
            profileImage: booking.teacher.profileImage,
          });
        }
      }
    });

    return Array.from(teacherMap.values());
  }, [bookingsData]);

  const hasMoreTeachers = hasNextPage || false;

  // Check if student has contacted a teacher (only when logged in)
  const { data: conversationsData } = useQuery({
    queryKey: ["student-conversations-check"],
    queryFn: async () => {
      const response = await api("/api/messages/conversations", {
        auth: true,
        params: { page: "1", limit: "5" },
      });
      const list = response?.conversations || response || [];
      return Array.isArray(list) ? list : [];
    },
    enabled: !!user?.id,
  });
  const hasConversation = (conversationsData?.length ?? 0) > 0;
  const hasContactedTeacher = myTeachers.length > 0 || hasConversation;

  const loadMoreTeachers = () => {
    if (hasNextPage && !loadingMoreTeachers) {
      fetchNextPage();
    }
  };

  // Refresh user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["student-user"] });
    }, [queryClient])
  );

  // Header text personalization for students
  const studentName = user?.name || "Find Your Teacher";
  const instrumentsArray = Array.isArray(user?.instruments)
    ? user.instruments.filter(Boolean)
    : [];

  let instrumentPhrase: string | null = null;
  if (instrumentsArray.length === 1) {
    instrumentPhrase = instrumentsArray[0];
  } else if (instrumentsArray.length >= 2) {
    // Use the first two instruments for the header
    instrumentPhrase = `${instrumentsArray[0]} & ${instrumentsArray[1]}`;
  }

  const headerSubtitle = instrumentPhrase
    ? `Find inspiring ${instrumentPhrase} teachers, organize your lessons, and stay motivated with a supportive music community.`
    : "Find inspiring music teachers, organize your lessons, and stay motivated with a supportive music community.";

  return (
    <View style={styles.container}>
      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
      >
        {/* Gradient Header */}
        <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
          <View style={styles.headerTopRow}>
            {/* Profile Picture */}
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={() => runIfLoggedIn(() => router.push("/(student)/edit-profile"))}
              activeOpacity={0.7}
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.profilePicture}
                />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Ionicons name="person" size={24} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {/* Text Content */}
            <View style={styles.headerTextContainer}>
              <Text style={styles.appTitle}>{studentName}</Text>
              <Text style={styles.welcomeSub}>{headerSubtitle}</Text>
            </View>

            {/* Messages Button */}
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => runIfLoggedIn(() => router.push("/messages"))}
              >
                <Ionicons name="chatbubbles-outline" size={24} color="white" />
                {unreadCount !== undefined && unreadCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? "99+" : String(unreadCount)}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Persistent notice until student contacts a teacher (home tab only); for guests, prompt to sign in */}
        {activeTab === "home" && (isGuest ? (
          <View style={styles.contactBannerWrapper}>
            <Card style={styles.contactBanner}>
              <View style={styles.contactBannerContent}>
                <Ionicons name="information-circle-outline" size={26} color="#FF6A5C" style={styles.contactBannerIcon} />
                <View style={styles.contactBannerTextBlock}>
                  <Text style={styles.contactBannerTitle}>Browse teachers</Text>
                  <Text style={styles.contactBannerText}>
                    You can explore teacher profiles. Teachers cannot see you or contact you first—explore profiles and send an inquiry to the teacher that meets your needs. Sign in to book lessons, message teachers, and manage your account.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        ) : !hasContactedTeacher && (
          <View style={styles.contactBannerWrapper}>
            <Card style={styles.contactBanner}>
              <View style={styles.contactBannerContent}>
                <Ionicons name="megaphone-outline" size={26} color="#FF6A5C" style={styles.contactBannerIcon} />
                <View style={styles.contactBannerTextBlock}>
                  <Text style={styles.contactBannerTitle}>How to connect with teachers</Text>
                  <Text style={styles.contactBannerText}>
                    Teachers cannot see you or contact you first. Visit a teacher’s profile below and send them an inquiry. You make the first move.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        ))}

        {/* Screen content depending on active tab */}
        <View style={styles.contentWrapper}>
            {activeTab === "home" && (
              <HomeTab
                teachers={teachers}
                loading={loadingTeachers}
                loadingMore={loadingMoreTeachers}
                hasMore={hasMoreTeachers}
                onLoadMore={loadMoreTeachers}
                myTeachers={myTeachers}
                studentCity={user?.location ? (user.location as string).split(",")[0]?.trim() || undefined : undefined}
              />
            )}
          {activeTab === "lessons" && <LessonsTab />}
          {activeTab === "settings" && <SettingsTab />}
        </View>
      </ScrollView>

      {/* Bottom Gradient Tab Bar */}
      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} runIfLoggedIn={runIfLoggedIn} />
    </View>
  );
}

// ---------- BOTTOM TAB BAR ---------- //

type BottomTabBarProps = {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  runIfLoggedIn: (fn: () => void) => void;
};

function BottomTabBar({ activeTab, setActiveTab, runIfLoggedIn }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { bottom: 12 + insets.bottom }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const isProtected = tab.key === "lessons";
        const onPress = () =>
          isProtected ? runIfLoggedIn(() => setActiveTab(tab.key)) : setActiveTab(tab.key);

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={onPress}
          >
            <LinearGradient
              colors={
                isActive ? ["#FF9076", "#FF6A5C"] : ["#F4F4F4", "#F4F4F4"]
              }
              style={[styles.tabPill, isActive && styles.tabPillActive]}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={isActive ? "white" : "#FF6A5C"}
              />
            </LinearGradient>
            <Text
              style={[styles.tabLabel, isActive && styles.tabLabelActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---------- STYLES ---------- //

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F3",
  },

  header: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  profilePictureContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  profilePicture: {
    width: "100%",
    height: "100%",
  },
  profilePicturePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTextContainer: {
    flex: 1,
  },
  appTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  welcomeSub: {
    color: "white",
    opacity: 0.9,
    marginTop: 4,
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },

  contactBannerWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  contactBanner: {
    padding: 16,
    backgroundColor: "#FFE8E2",
    borderWidth: 2,
    borderColor: "#FF6A5C",
    borderRadius: 12,
  },
  contactBannerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  contactBannerIcon: {
    marginTop: 2,
  },
  contactBannerTextBlock: {
    flex: 1,
  },
  contactBannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C2410C",
    marginBottom: 6,
  },
  contactBannerText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },

  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  // Bottom tab bar
  tabBar: {
    position: "absolute",
    bottom: 15,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },

  tabPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  tabPillActive: {},

  tabLabel: {
    fontSize: 11,
    color: "#888",
  },

  tabLabelActive: {
    color: "#FF6A5C",
    fontWeight: "700",
  },
});

