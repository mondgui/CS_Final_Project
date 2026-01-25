// frontend/lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from './api';
import { storage } from './storage';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

let notificationToken: string | null = null;

/**
 * Request notification permissions and register device token
 * Should be called when user logs in or app starts
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Check if device is physical (not simulator)
    if (!Device.isDevice) {
      // Silently return - simulator doesn't support push notifications
      return null;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    // Get the Expo push token
    // Note: For EAS Build, projectId is automatically detected
    // For local development, you may need to set EXPO_PUBLIC_PROJECT_ID in .env
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID || undefined,
    });

    notificationToken = tokenData.data;

    // Register token with backend (if user is logged in)
    const authToken = await storage.getItem('token');
    if (authToken && notificationToken) {
      try {
        await api('/api/notifications/register-token', {
          method: 'POST',
          auth: true,
          body: JSON.stringify({
            token: notificationToken,
            platform: Platform.OS,
            deviceId: Device.modelName || null,
          }),
        });
      } catch (err) {
        // Silently fail - user might not be logged in yet
      }
    }

    return notificationToken;
  } catch (err) {
    // Silently fail - notifications are optional
    return null;
  }
}

/**
 * Unregister device token (e.g., on logout)
 */
export async function unregisterPushToken(): Promise<void> {
  if (!notificationToken) return;

  try {
    const authToken = await storage.getItem('token');
    if (authToken) {
      await api('/api/notifications/unregister-token', {
        method: 'DELETE',
        auth: true,
        body: JSON.stringify({ token: notificationToken }),
      });
    }
  } catch (err) {
    // Silently fail
  } finally {
    notificationToken = null;
  }
}

/**
 * Get the current notification token (if registered)
 */
export function getNotificationToken(): string | null {
  return notificationToken;
}

/**
 * Set up notification listeners
 * Returns cleanup function
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
): () => void {
  // Listener for notifications received while app is in foreground
  const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
    onNotificationReceived?.(notification);
  });

  // Listener for when user taps on a notification
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    onNotificationTapped?.(response);
  });

  // Return cleanup function
  return () => {
    Notifications.removeNotificationSubscription(receivedListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}
