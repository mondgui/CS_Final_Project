import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { api } from "../../../../lib/api";
import { useQuery } from "@tanstack/react-query";

type Review = {
  id: string;
  _id?: string;
  rating: number;
  comment: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    profileImage?: string;
  };
};

type Props = {
  teacherId?: string;
};

export default function ReviewsTab({ teacherId }: Props) {
  const [refreshing, setRefreshing] = useState(false);

  const { data: reviewsData, isLoading, refetch } = useQuery({
    queryKey: ["teacher-reviews", teacherId],
    queryFn: async () => {
      let id = teacherId;
      if (!id) {
        // If no teacherId provided, fetch current user's ID first
        const user = await api("/api/users/me", { auth: true });
        id = user?.id || user?._id;
        if (!id) throw new Error("User ID not found");
      }
      const response = await api(`/api/reviews/teacher/${id}`);
      return response;
    },
    enabled: true, // Always enable query
  });

  const reviews: Review[] = reviewsData?.reviews || reviewsData || [];
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  const totalReviews = reviews.length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#FF6A5C" size="large" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.ratingContainer}>
            <Text style={styles.averageRating}>{averageRating}</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(parseFloat(averageRating)) ? "star" : "star-outline"}
                  size={20}
                  color="#FFB800"
                />
              ))}
            </View>
            <Text style={styles.reviewCount}>
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </Text>
          </View>
        </View>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="star-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>No reviews yet</Text>
          <Text style={styles.emptySubtext}>
            Reviews from your students will appear here
          </Text>
        </Card>
      ) : (
        <View style={styles.reviewsList}>
          {reviews.map((review) => (
            <Card key={review.id || review._id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Avatar
                  src={review.student?.profileImage}
                  fallback={review.student?.name?.charAt(0) || "S"}
                  size={40}
                />
                <View style={styles.reviewInfo}>
                  <Text style={styles.studentName}>
                    {review.student?.name || "Student"}
                  </Text>
                  <View style={styles.reviewRatingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= review.rating ? "star" : "star-outline"}
                        size={14}
                        color="#FFB800"
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
              {review.comment && (
                <Text style={styles.reviewComment}>{review.comment}</Text>
              )}
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  summaryCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: "#FFF5F3",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingContainer: {
    alignItems: "center",
  },
  averageRating: {
    fontSize: 48,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    padding: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  reviewInfo: {
    flex: 1,
    gap: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  reviewRatingRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  reviewComment: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginTop: 4,
  },
  emptyCard: {
    padding: 32,
    alignItems: "center",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
