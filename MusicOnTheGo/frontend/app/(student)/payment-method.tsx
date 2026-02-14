import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Card } from "../../components/ui/card";

export default function PaymentMethodScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={["#FF9076", "#FF6A5C"]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="card-outline" size={32} color="white" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Payment Method</Text>
              <Text style={styles.headerSubtitle}>Billing & payments</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <Card style={styles.messageCard}>
            <View style={styles.iconRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="heart" size={28} color="#FF6A5C" />
              </View>
            </View>
            <Text style={styles.messageTitle}>MusicOnTheGo is free for now</Text>
            <Text style={styles.messageText}>
              We have not monetized this app yet because we want to make sure it
              is exactly what our valuable music teachers and students need.
            </Text>
            <Text style={styles.messageText}>
              While it remains free, we truly appreciate you trying it. If you
              have a moment, we would love a review on the App Store and/or Play Store—and please
              send us your suggestions and feedback through the Contact Us form.
              Your input helps us build something that really works for you.
            </Text>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => router.push("/(student)/contact-support")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF9076", "#FF6A5C"]}
                style={styles.contactButtonGradient}
              >
                <Ionicons name="mail-outline" size={20} color="white" />
                <Text style={styles.contactButtonText}>Contact Us</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F3",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  backText: {
    color: "white",
    fontSize: 16,
    opacity: 0.9,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  messageCard: {
    padding: 24,
  },
  iconRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFE0D6",
    alignItems: "center",
    justifyContent: "center",
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  messageText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
    marginBottom: 14,
  },
  contactButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  contactButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
