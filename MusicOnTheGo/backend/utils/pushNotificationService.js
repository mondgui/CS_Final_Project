// backend/utils/pushNotificationService.js
import prisma from "./prisma.js";

/**
 * Send push notification to a user
 * Respects the user's pushNotificationsEnabled preference
 * 
 * @param {string} userId - The user ID to send notification to
 * @param {object} notification - Notification payload { title, body, data }
 * @returns {Promise<boolean>} - Returns true if notification was sent, false otherwise
 */
export async function sendPushNotification(userId, notification) {
  try {
    // Check if user has notifications enabled
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pushNotificationsEnabled: true },
    });

    if (!user || !user.pushNotificationsEnabled) {
      console.log(`[PushNotification] User ${userId} has notifications disabled, skipping.`);
      return false;
    }

    // Get all device tokens for this user
    const deviceTokens = await prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true, platform: true },
    });

    if (deviceTokens.length === 0) {
      console.log(`[PushNotification] No device tokens found for user ${userId}.`);
      return false;
    }

    // Send notification to all devices
    const expoPushTokens = deviceTokens.map((dt) => dt.token);
    
    // Use Expo Push Notification API
    const messages = expoPushTokens.map((token) => ({
      to: token,
      sound: "default",
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      badge: 1,
    }));

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Expo push API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Check for errors in the response
    const errors = result.data?.filter((r) => r.status === "error");
    if (errors && errors.length > 0) {
      console.error("[PushNotification] Some notifications failed:", errors);
      // Remove invalid tokens
      for (const error of errors) {
        if (error.details?.error === "DeviceNotRegistered") {
          await prisma.deviceToken.deleteMany({
            where: { token: error.to },
          });
          console.log(`[PushNotification] Removed invalid token: ${error.to}`);
        }
      }
    }

    const successCount = result.data?.filter((r) => r.status === "ok").length || 0;
    console.log(`[PushNotification] Sent ${successCount}/${expoPushTokens.length} notifications to user ${userId}.`);
    
    return successCount > 0;
  } catch (err) {
    console.error("[PushNotification] Error sending notification:", err);
    return false;
  }
}

/**
 * Send push notification to multiple users
 * 
 * @param {string[]} userIds - Array of user IDs
 * @param {object} notification - Notification payload
 * @returns {Promise<number>} - Number of successful notifications sent
 */
export async function sendPushNotificationToUsers(userIds, notification) {
  let successCount = 0;
  
  for (const userId of userIds) {
    const sent = await sendPushNotification(userId, notification);
    if (sent) successCount++;
  }
  
  return successCount;
}
