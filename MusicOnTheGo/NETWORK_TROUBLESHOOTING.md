# Network Connection Troubleshooting

## Error: Network request failed

This means your phone can't reach the backend server. Let's troubleshoot step by step.

---

## Step 1: Verify Backend is Running

Check if the backend server is actually running:

```bash
cd MusicOnTheGo/backend
npm run start:dev
```

You should see:
```
🚀 Server running on port 5050
📝 API available at http://localhost:5050/api
🌐 Network access: http://YOUR_IP:5050/api
```

**If the server isn't running, start it first!**

---

## Step 2: Verify Backend is Listening on All Interfaces

The backend must listen on `0.0.0.0` (all interfaces), not just `localhost`.

Check `backend/src/main.ts`:

```typescript
const host = process.env.HOST || '0.0.0.0'; // Should be 0.0.0.0
await app.listen(port, host);
```

If it's set to `localhost` or `127.0.0.1`, change it to `0.0.0.0`.

---

## Step 3: Verify Your Computer's IP Address

Make sure `192.168.0.105` is your current IP:

**Mac/Linux:**
```bash
ipconfig getifaddr en0
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
# Look for IPv4 Address under your active network adapter
```

**If your IP changed, update the frontend `.env` file:**
```bash
cd MusicOnTheGo/frontend
echo "EXPO_PUBLIC_API_URL=http://YOUR_NEW_IP:5050" > .env
```

Then restart Expo:
```bash
npx expo start --clear
```

---

## Step 4: Test Connection from Your Computer

Test if the backend is accessible from your computer:

```bash
curl http://localhost:5050/api
# or
curl http://192.168.0.105:5050/api
```

If this works, the backend is running. If not, check backend logs for errors.

---

## Step 5: Test Connection from Your Phone's Browser

On your phone, open a web browser and go to:
```
http://192.168.0.105:5050/api
```

**If this works:**
- Backend is accessible
- Issue is with the Expo app or network configuration

**If this doesn't work:**
- Backend might not be listening on all interfaces
- Firewall might be blocking port 5050
- IP address might be wrong

---

## Step 6: Check Firewall

**Mac:**
1. System Settings → Network → Firewall
2. Make sure port 5050 is allowed
3. Or temporarily disable firewall to test

**Windows:**
1. Windows Defender Firewall → Advanced Settings
2. Add inbound rule for port 5050
3. Or temporarily disable firewall to test

---

## Step 7: Verify Both Devices on Same Network

Make sure both devices are on the **same Wi-Fi network**:

- Phone: Settings → Wi-Fi → Check network name
- Computer: Check Wi-Fi network name

They must match!

---

## Step 8: Check Backend Logs

When you try to register, check the backend terminal. You should see:

```
[Nest] LOG [RoutesResolver] POST /api/auth/register
```

**If you don't see this:**
- Request isn't reaching the backend
- Check network configuration

**If you see errors:**
- Fix the errors first
- Common issues: database connection, missing environment variables

---

## Step 9: Try Alternative Connection Methods

### Option A: Use Expo Tunnel (if on different networks)

```bash
cd MusicOnTheGo/frontend
npx expo start --tunnel
```

This creates a tunnel, but it's slower.

### Option B: Use ngrok (for testing)

```bash
# Install ngrok
brew install ngrok  # Mac
# or download from ngrok.com

# Start backend
cd MusicOnTheGo/backend
npm run start:dev

# In another terminal, create tunnel
ngrok http 5050

# Use the ngrok URL in frontend .env
EXPO_PUBLIC_API_URL=https://xxxxx.ngrok.io
```

---

## Quick Checklist

- [ ] Backend server is running (`npm run start:dev`)
- [ ] Backend is listening on `0.0.0.0` (check `main.ts`)
- [ ] IP address is correct (`192.168.0.105`)
- [ ] Frontend `.env` has correct IP
- [ ] Both devices on same Wi-Fi network
- [ ] Firewall allows port 5050
- [ ] Can access `http://192.168.0.105:5050/api` from phone browser
- [ ] Backend logs show requests when trying to register

---

## Common Issues

### Issue: "Network request failed" but backend is running

**Solution:**
1. Check backend is listening on `0.0.0.0`
2. Check firewall settings
3. Verify IP address hasn't changed
4. Restart both backend and Expo

### Issue: Can access from browser but not from app

**Solution:**
1. Clear Expo cache: `npx expo start --clear`
2. Restart Expo
3. Check `.env` file is in `frontend/` directory
4. Verify `.env` has correct IP

### Issue: IP address keeps changing

**Solution:**
1. Set static IP on your router for your computer
2. Or use a service like ngrok for testing
3. Or update `.env` each time IP changes

---

## Still Not Working?

1. **Check backend terminal for errors**
2. **Check Expo terminal for errors**
3. **Try accessing backend from phone browser first**
4. **Verify network connectivity:**
   ```bash
   # On your computer
   ping 192.168.0.105
   ```

If ping works but HTTP doesn't, it's a firewall or port issue.
