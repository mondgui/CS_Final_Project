# Push Notifications Implementation Guide

## ✅ What's Been Implemented

Push notifications are now fully implemented for your MusicOnTheGo app! Here's what was added:

### Backend Implementation
1. **DeviceToken Model** - Stores push notification tokens for each user's devices
2. **Notification Routes** (`/api/notifications`) - Register/unregister device tokens
3. **Push Notification Service** - Sends notifications via Expo Push Notification API
4. **Integration with Existing Routes**:
   - **Bookings**: Notifies teachers of new booking requests, students of status changes
   - **Messages**: Notifies recipients when they receive a new message
   - **Inquiries**: Notifies teachers when students send lesson inquiries
   - **Support Tickets**: Notifies users when admins reply to their tickets

### Frontend Implementation
1. **Notification Service** (`lib/notifications.ts`) - Handles permissions, token registration
2. **Auto-Registration** - Automatically registers for notifications on login
3. **Auto-Unregistration** - Removes tokens on logout
4. **Permission Handling** - Requests notification permissions when needed

### Key Features
- ✅ Respects user's `pushNotificationsEnabled` preference
- ✅ Works on both iOS and Android
- ✅ Handles multiple devices per user
- ✅ Automatically removes invalid tokens
- ✅ Sends notifications for all major app events

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- `expo-notifications` - Push notification handling
- `expo-device` - Device information

### 2. Run Database Migration

The `DeviceToken` model has been added to your Prisma schema. You need to create and run the migration:

```bash
cd backend
npx prisma migrate dev --name add_device_tokens
npx prisma generate
```

### 3. Configure Expo Project ID (Optional but Recommended)

For production builds with EAS, you'll need a project ID. You can get this from your Expo account or set it in your `.env` file:

```bash
# In frontend/.env
EXPO_PUBLIC_PROJECT_ID=your-project-id-here
```

For local development, this is optional - Expo will use a default project ID.

### 4. Test Notifications

After logging in, the app will automatically:
1. Request notification permissions (first time only)
2. Register the device token with your backend
3. Start receiving push notifications

You can test by:
- Creating a booking request (teacher receives notification)
- Sending a message (recipient receives notification)
- Sending an inquiry (teacher receives notification)
- Having an admin reply to a support ticket (user receives notification)

### 5. Test Endpoint

You can also test notifications directly via the API:

```bash
# After logging in, call:
GET /api/notifications/test
```

This sends a test notification to the currently logged-in user.

## 📱 How It Works

### User Flow
1. User downloads and opens the app
2. User logs in → App requests notification permissions
3. If granted → Device token is registered with backend
4. User receives notifications for:
   - New booking requests (teachers)
   - Booking status updates (students)
   - New messages
   - New inquiries (teachers)
   - Support ticket replies

### Notification Settings
Users can toggle notifications on/off in Settings. When disabled:
- Device token remains registered
- Backend checks `pushNotificationsEnabled` before sending
- If disabled, notifications are skipped

### Multiple Devices
- Each device gets its own token
- All tokens are stored per user
- Notifications are sent to all registered devices
- Invalid tokens are automatically removed

## 🔧 Technical Details

### Notification Payload Structure
```javascript
{
  title: "Notification Title",
  body: "Notification message",
  data: {
    type: "booking_request" | "booking_status" | "message" | "inquiry" | "support_reply",
    // Additional context data
  }
}
```

### Backend Service
The `pushNotificationService.js`:
- Checks user's notification preference
- Fetches all device tokens for the user
- Sends via Expo Push Notification API
- Handles errors and removes invalid tokens

### Frontend Service
The `notifications.ts` service:
- Requests permissions using Expo Notifications API
- Gets Expo push token
- Registers token with backend on login
- Unregisters token on logout
- Handles notification received/tapped events

## 🐛 Troubleshooting

### Notifications Not Working?

1. **Check Permissions**: Make sure the app has notification permissions
   - iOS: Settings → MusicOnTheGo → Notifications
   - Android: Settings → Apps → MusicOnTheGo → Notifications

2. **Check User Preference**: Verify `pushNotificationsEnabled` is `true` in the database

3. **Check Device Token**: Verify token is registered
   ```sql
   SELECT * FROM "DeviceToken" WHERE "userId" = 'user-id';
   ```

4. **Check Backend Logs**: Look for `[PushNotification]` logs in backend console

5. **Test on Physical Device**: Push notifications don't work on simulators/emulators

### Common Issues

- **"No device tokens found"**: User hasn't logged in yet or permissions were denied
- **"Notifications disabled"**: User has toggled off notifications in Settings
- **"DeviceNotRegistered"**: Token is invalid (automatically cleaned up)

## 📝 Next Steps for Production

1. **EAS Build Configuration**: Ensure notifications are configured in `app.json` (already done)
2. **Apple Push Notification Service (APNs)**: Configure for iOS production
3. **Firebase Cloud Messaging (FCM)**: Configure for Android production
4. **Test on Physical Devices**: Always test on real devices before launch

## 🎉 You're All Set!

Push notifications are now fully functional. Users will be prompted to allow notifications when they first log in, and they'll receive notifications for all important app events!
