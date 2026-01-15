# Quick Fix for Frontend Connection

## ⚠️ Two Critical Issues

### 1. Old Accounts Are Gone
**MongoDB data was NOT migrated to PostgreSQL.** All your old accounts are gone. You need to **re-register** all users.

### 2. Backend Not Accessible from Device

The frontend is trying to connect to `http://192.168.12.138:5050`, but the backend might not be accessible.

---

## Immediate Fixes

### Step 1: Update Backend to Listen on Network

I've updated `main.ts` to listen on `0.0.0.0` (all interfaces). **Restart your backend**:

```bash
cd MusicOnTheGo/backend
# Stop the current server (Ctrl+C)
npm run start:dev
```

### Step 2: Verify Backend is Running

Check the backend terminal - you should see:
```
🚀 Server running on port 5050
📝 API available at http://localhost:5050/api
🌐 Network access: http://YOUR_IP:5050/api
```

### Step 3: Test Connection

From your device's browser, try:
```
http://192.168.12.138:5050/api
```

If you see a response (even an error), the connection works!

### Step 4: Re-Register Accounts

**Old MongoDB accounts don't exist anymore.** You need to create new accounts:

1. **Open the app**
2. **Go to "Sign Up"**
3. **Create new student/teacher accounts**

Or use Postman/curl:

```bash
POST http://192.168.12.138:5050/api/auth/register
Content-Type: application/json

{
  "email": "student@test.com",
  "password": "password123",
  "name": "Test Student",
  "role": "student"
}
```

---

## If Still Not Working

### Check Backend is Running:
```bash
cd MusicOnTheGo/backend
npm run start:dev
```

### Check Your IP:
```bash
# Mac
ipconfig getifaddr en0

# Should match: 192.168.12.138
```

### Check Firewall:
Make sure port 5050 is not blocked by firewall.

### Check Frontend .env:
```bash
cd MusicOnTheGo/frontend
cat .env
# Should have: EXPO_PUBLIC_API_URL=http://192.168.12.138:5050
```

---

## Summary

1. ✅ Backend updated to listen on all interfaces
2. ⏳ **Restart backend**: `npm run start:dev`
3. ⏳ **Re-register accounts** (old ones are gone)
4. ⏳ **Test connection** from device

**The main issue is that old MongoDB accounts don't exist in PostgreSQL. You must create new accounts!**
