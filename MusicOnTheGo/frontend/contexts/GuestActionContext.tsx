// contexts/GuestActionContext.tsx
// Gentle dialog when guests tap protected actions: "Create account" → role-selection, "Keep exploring" → dismiss
// runIfLoggedIn: check token at click time so guests always see the dialog (no reliance on React state).

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getTokenFromStorage } from "../lib/auth";

type GuestActionContextValue = {
  showGuestDialog: () => void;
  /** Run the callback only if user has a token; otherwise show the guest dialog. Use for every protected action. */
  runIfLoggedIn: (fn: () => void) => void;
};

const GuestActionContext = createContext<GuestActionContextValue | null>(null);

export function useGuestDialog() {
  const ctx = useContext(GuestActionContext);
  if (!ctx) {
    throw new Error("useGuestDialog must be used within GuestActionProvider");
  }
  return ctx;
}

export function GuestActionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  const showGuestDialog = useCallback(() => {
    setVisible(true);
  }, []);

  const runIfLoggedIn = useCallback(
    (fn: () => void) => {
      getTokenFromStorage().then((token) => {
        const hasToken = typeof token === "string" && token.trim().length > 0;
        if (hasToken) fn();
        else setVisible(true);
      });
    },
    []
  );

  const handleCreateAccount = useCallback(() => {
    setVisible(false);
    router.push("/role-selection");
  }, [router]);

  const handleKeepExploring = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <GuestActionContext.Provider value={{ showGuestDialog, runIfLoggedIn }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleKeepExploring}
      >
        <TouchableWithoutFeedback onPress={handleKeepExploring}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.card}>
                <View style={styles.iconWrap}>
                  <Ionicons name="heart-outline" size={36} color="#FF6A5C" />
                </View>
                <Text style={styles.title}>Join to unlock this</Text>
                <Text style={styles.message}>
                  Create a free account to book lessons, message teachers, and save your progress. Or keep exploring—no pressure.
                </Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleCreateAccount}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>Create account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleKeepExploring}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryButtonText}>Keep exploring</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </GuestActionContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FEFEFE",
    borderRadius: 24,
    width: "100%",
    maxWidth: 340,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFE8E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#FF6A5C",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "600",
  },
});
