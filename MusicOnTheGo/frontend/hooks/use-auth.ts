// frontend/hooks/use-auth.ts
// Provides isLoggedIn for guest vs authenticated access (Guideline 5.1.1)

import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { getTokenFromStorage } from "../lib/auth";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const checkAuth = useCallback(async () => {
    const token = await getTokenFromStorage();
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [checkAuth])
  );

  return {
    isLoggedIn: isLoggedIn === true,
    // Require login for any action until we know the user has a token (treat loading as guest)
    isGuest: isLoggedIn !== true,
    isLoading: isLoggedIn === null,
    refetch: checkAuth,
  };
}
