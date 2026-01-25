# Frontend-Backend Connection Setup Guide

## ⚠️ Important: Old Accounts Are Gone

**The MongoDB database was not migrated to PostgreSQL.** All your old user accounts (students and teachers) are gone. You need to **re-register** all accounts.

---

## Step 1: Start the Backend Server

### Make sure the backend is running:

```bash
cd MusicOnTheGo/backend
npm run start:dev
```

You should see:
```
🚀 Server running on port 5050
📝 API available at http://localhost:5050/api
```

**Important**: The server must be running before the frontend can connect!

---

## Step 2: Verify Backend is Accessible

### If using a physical device (iPhone/iPad):

The frontend is trying to connect to `http://192.168.12.138:5050`. This means:

1. **Your computer's IP is `192.168.12.138`** ✅
2. **The backend must listen on all interfaces** (not just localhost)

### Update Backend to Listen on All Interfaces

The backend needs to listen on `0.0.0.0` instead of just `localhost` to be accessible from other devices on your network.

**Option 1: Update `main.ts`** (Recommended):

```typescript
// backend/src/main.ts
const port = process.env.PORT || 5050;
await app.listen(port, '0.0.0.0'); // Listen on all interfaces
```

**Option 2: Use environment variable**:

```bash
# In backend/.env
PORT=5050
```

Then update `main.ts`:
```typescript
await app.listen(port, '0.0.0.0');
```

---

## Step 3: Test Backend Connection

### From your computer:

```bash
curl http://localhost:5050/api
```

Should return a response (health check or similar).

### From your device (if on same network):

Open browser on your phone and go to:
```
http://192.168.12.138:5050/api
```

Should return a response.

---

## Step 4: Re-Register Accounts

Since MongoDB data wasn't migrated, you need to create new accounts:

### Register a Student:

```bash
POST http://192.168.12.138:5050/api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "name": "Student Name",
  "role": "student"
}
```

### Register a Teacher:

```bash
POST http://192.168.12.138:5050/api/auth/register
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "password123",
  "name": "Teacher Name",
  "role": "teacher"
}
```

### Or use the frontend:

1. Open the app
2. Go to "Sign Up"
3. Create new accounts

---

## Step 5: Update Frontend API URL (if needed)

The frontend is already configured to use `http://192.168.12.138:5050` (from your error message).

### If your IP changed:

1. **Find your computer's IP**:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Or
   ipconfig getifaddr en0
   ```

2. **Create/update `.env` file in `frontend/` directory**:
   ```bash
   cd MusicOnTheGo/frontend
   echo "EXPO_PUBLIC_API_URL=http://YOUR_IP:5050" > .env
   ```

3. **Restart Expo**:
   ```bash
   # Stop Expo (Ctrl+C)
   # Then restart
   npm start
   ```

---

## Step 6: Verify Connection

### Check Backend Logs:

When you try to login from the frontend, you should see requests in the backend terminal:

```
[Nest] LOG [RoutesResolver] POST /api/auth/login
```

### Test Login:

Use Postman or curl:

```bash
POST http://192.168.12.138:5050/api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

Should return:
```json
{
  "access_token": "...",
  "user": { ... }
}
```

---

## Troubleshooting

### Error: "Network request timed out"

**Causes:**
1. Backend server is not running
2. Backend is only listening on `localhost` (not accessible from device)
3. Firewall blocking port 5050
4. Wrong IP address

**Solutions:**
1. ✅ Make sure backend is running: `npm run start:dev`
2. ✅ Update `main.ts` to listen on `0.0.0.0`
3. ✅ Check firewall settings (allow port 5050)
4. ✅ Verify IP address: `ifconfig` or `ipconfig`

### Error: "Cannot connect to server"

**Causes:**
1. Backend crashed
2. Port 5050 is in use
3. Database connection failed

**Solutions:**
1. Check backend terminal for errors
2. Check if another process is using port 5050: `lsof -i :5050`
3. Verify database connection in `.env`

### Old accounts don't work

**Cause:** MongoDB data wasn't migrated to PostgreSQL.

**Solution:** Re-register all accounts (see Step 4).

---

## Quick Checklist

- [ ] Backend server is running (`npm run start:dev`)
- [ ] Backend listens on `0.0.0.0` (all interfaces)
- [ ] Can access `http://YOUR_IP:5050/api` from device browser
- [ ] Created new accounts (old MongoDB accounts are gone)
- [ ] Frontend `.env` has correct `EXPO_PUBLIC_API_URL`
- [ ] Restarted Expo after changing `.env`

---

## Next Steps

Once connection works:

1. ✅ Test login with new accounts
2. ✅ Test Socket.io connection (real-time features)
3. ✅ Test all features (bookings, messages, etc.)
4. ✅ Migrate any important data manually if needed
