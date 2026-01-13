import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "../../lib/api";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Call forgot password API
      await api("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Card style={styles.card}>
              <View style={styles.successContent}>
                <View style={styles.successIconContainer}>
                  <View style={styles.successIconBackground}>
                    <Ionicons name="mail" size={48} color="#059669" />
                  </View>
                </View>

                <View style={styles.successTextContainer}>
                  <Text style={styles.successTitle}>Check Your Email</Text>
                  <Text style={styles.successMessage}>
                    We've sent password reset instructions to {email}
                  </Text>
                </View>

                <Button
                  onPress={() => router.push("/(auth)/login")}
                  style={styles.backButton}
                >
                  Back to Login
                </Button>
              </View>
            </Card>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Form state
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButtonTop}
          >
            <Ionicons name="arrow-back" size={20} color="#666" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <Card style={styles.card}>
            <View style={styles.formContent}>
              <View style={styles.headerSection}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Enter your email and we'll send you reset instructions
                </Text>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.formSection}>
                <Label style={styles.label}>Email</Label>
                <Input
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              <Button
                onPress={handleSubmit}
                disabled={loading}
                style={styles.submitButton}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </View>
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
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  content: {
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  backButtonTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#666",
  },
  card: {
    padding: 24,
  },
  formContent: {
    gap: 24,
  },
  headerSection: {
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF6A5C",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: "#FFE0D6",
    borderColor: "#FF6A5C",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: "#FF6A5C",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  formSection: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    backgroundColor: "#FFF5F3",
    borderColor: "#FFE0D6",
  },
  submitButton: {
    marginTop: 8,
  },
  // Success state styles
  successContent: {
    alignItems: "center",
    gap: 24,
  },
  successIconContainer: {
    marginBottom: 8,
  },
  successIconBackground: {
    backgroundColor: "#D6FFE1",
    borderRadius: 50,
    padding: 16,
  },
  successTextContainer: {
    alignItems: "center",
    gap: 8,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  successMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  backButton: {
    width: "100%",
    marginTop: 8,
  },
});
