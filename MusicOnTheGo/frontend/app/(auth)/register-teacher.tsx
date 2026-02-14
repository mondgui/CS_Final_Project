// frontend/app/register-teacher.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { storage } from "../../lib/storage";
import { getCurrentLocationData, type LocationData } from "../../lib/location";

const INSTRUMENT_OPTIONS = [
  { label: "Piano", value: "piano" },
  { label: "Guitar", value: "guitar" },
  { label: "Violin", value: "violin" },
  { label: "Voice / Singing", value: "voice" },
  { label: "Drums", value: "drums" },
  { label: "Bass", value: "bass" },
  { label: "Saxophone", value: "saxophone" },
  { label: "Flute", value: "flute" },
  { label: "Trumpet", value: "trumpet" },
  { label: "Clarinet", value: "clarinet" },
  { label: "Cello", value: "cello" },
  { label: "Trombone", value: "trombone" },
  { label: "Banjo", value: "banjo" },
  { label: "Accordion", value: "accordion" },
  { label: "Oboe", value: "oboe" },
  { label: "Mandolin", value: "mandolin" },
  { label: "Synthesizer / Keyboard", value: "synth" },
  { label: "Percussion (General)", value: "percussion" },
  { label: "Harp", value: "harp" },
  { label: "Music Theory", value: "Music Theory"},
];

export default function RegisterTeacher() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [location, setLocation] = useState("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [otherInstrument, setOtherInstrument] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setLocationLoading(true);
    try {
      const data = await getCurrentLocationData();
      if (data) {
        setLocationData(data);
        setLocation(data.location);
      } else {
        console.warn("Could not detect location automatically");
      }
    } catch (error) {
      console.error("Location detection error:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  const toggleInstrument = (value: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const registerTeacher = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      alert("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const custom = otherInstrument.trim();
    const allInstruments = [...selectedInstruments, ...(custom ? [custom] : [])];

    if (allInstruments.length === 0) {
      alert("Please select at least one instrument you teach.");
      return;
    }

    try {
      setLoading(true);

      const response = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: "teacher",
          instruments: allInstruments,
          location: locationData?.location || location,
          city: locationData?.city || "",
          state: locationData?.state || "",
          country: locationData?.country || "",
          latitude: locationData?.latitude,
          longitude: locationData?.longitude,
        }),
      });

      if (response?.token) {
        await storage.setItem("token", response.token);
      }

      router.push({
        pathname: "/(teacher)/profile-setup",
        params: {
          fullName,
          instruments: JSON.stringify(allInstruments),
          location,
        },
      });
    } catch (err: any) {
      // Handle validation errors from backend
      if (err.message && Array.isArray(err.message)) {
        // Backend validation errors come as an array
        alert(err.message.join("\n"));
      } else if (err.message) {
        alert(err.message);
      } else {
        alert("Registration failed. Please check your information and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Ionicons
          name="musical-notes-outline"
          size={40}
          color="white"
          style={{ alignSelf: "center", marginBottom: 10 }}
        />

        <Text style={styles.headerTitle}>Teacher Registration</Text>
        <Text style={styles.headerSubtitle}>
          Teach music and grow your student community
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#6B7280"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              placeholder="Create a password"
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#6B7280"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Instrument(s) You Teach</Text>
          <View style={styles.chipRow}>
            {INSTRUMENT_OPTIONS.map((option) => {
              const selected = selectedInstruments.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.chipWrapper}
                  onPress={() => toggleInstrument(option.value)}
                  activeOpacity={0.8}
                >
                  {selected ? (
                    <LinearGradient
                      colors={["#FF9076", "#FF6A5C"]}
                      style={styles.chip}
                    >
                      <Text style={styles.chipTextSelected}>{option.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.chip, styles.chipUnselected]}>
                      <Text style={styles.chipText}>{option.label}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Other instruments not listed above</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Viola, Bassoon, Marimba, ukulele, etc."
            placeholderTextColor="#6B7280"
            value={otherInstrument}
            onChangeText={setOtherInstrument}
          />

          <Text style={styles.label}>Location</Text>
          <View style={styles.locationContainer}>
            <TextInput
              style={[styles.input, styles.locationInput]}
              placeholder="City, State, Country"
              placeholderTextColor="#6B7280"
              value={location}
              onChangeText={setLocation}
              editable={!locationLoading}
            />
            <TouchableOpacity
              style={styles.locationButton}
              onPress={detectLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="#FF6A5C" />
              ) : (
                <Ionicons name="location" size={20} color="#FF6A5C" />
              )}
            </TouchableOpacity>
          </View>
          {locationData && (
            <Text style={styles.locationHint}>
              ✓ Location detected: {locationData.city}, {locationData.state}
            </Text>
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={registerTeacher}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? "Please wait..." : "Save and Continue"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.footerLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: { width: 40, marginBottom: 10 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "white",
    opacity: 0.9,
    textAlign: "center",
  },
  formContainer: { paddingHorizontal: 20, paddingVertical: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F7F7F7",
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#E0E0E0",
    color: "#111827",
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: "#111827",
  },
  eyeIcon: {
    padding: 4,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  chipWrapper: {
    marginRight: 8,
    marginBottom: 8,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipUnselected: {
    backgroundColor: "#FFE4DB",
  },
  chipText: {
    fontSize: 13,
    color: "#FF6A5C",
    fontWeight: "600",
  },
  chipTextSelected: {
    fontSize: 13,
    color: "white",
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#FF6A5C",
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 30,
    alignItems: "center",
  },
  submitText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
  footerText: {
    textAlign: "center",
    marginTop: 15,
    color: "#555",
  },
  footerLink: {
    color: "#FF6A5C",
    fontWeight: "600",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationInput: {
    flex: 1,
  },
  locationButton: {
    padding: 12,
    backgroundColor: "#FFE4DB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
    height: 44,
  },
  locationHint: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 4,
    marginLeft: 4,
  },
});
