# Automatic Location Detection Setup

## ✅ What's Been Implemented

### Frontend Changes:
1. **Location Utility** (`frontend/lib/location.ts`)
   - Requests location permission
   - Gets GPS coordinates
   - Reverse geocodes to get city, state, country
   - Returns standardized location data

2. **Registration Screens Updated**
   - Both student and teacher registration now auto-detect location
   - Location button to manually trigger detection
   - Shows detected location with green checkmark
   - Still allows manual entry if needed

### Backend Changes:
1. **Prisma Schema Updated**
   - Added `city`, `state`, `country` fields
   - Added `latitude`, `longitude` for distance calculations
   - Kept `location` field for backward compatibility

2. **Register DTO Updated**
   - Accepts new location fields (city, state, country, lat, lng)
   - All fields are optional for backward compatibility

3. **Auth Service Updated**
   - Saves all location fields to database

---

## 📦 Required Package

You need to install `expo-location`:

```bash
cd MusicOnTheGo/frontend
npx expo install expo-location
```

---

## 🔧 Configuration

### iOS (Info.plist)

Add location permission description to `app.json`:

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to find teachers and students near you."
      }
    }
  }
}
```

### Android (AndroidManifest.xml)

Expo automatically adds location permissions, but you can verify in `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

---

## 🚀 How It Works

1. **User opens registration screen**
   - App automatically requests location permission
   - Gets GPS coordinates
   - Reverse geocodes to get city, state, country

2. **Location displayed**
   - Shows "City, State, Country" format
   - Green checkmark confirms location detected
   - User can still edit manually if needed

3. **On registration**
   - Sends all location data to backend:
     - `location`: "City, State, Country" (formatted string)
     - `city`: "City"
     - `state`: "State/Province"
     - `country`: "Country"
     - `latitude`: 40.7128
     - `longitude`: -74.0060

4. **Backend stores**
   - All location fields saved to database
   - Can be used for:
     - Standardized location search
     - Distance calculations (using lat/lng)
     - Location-based filtering

---

## 🎯 Benefits

1. **Standardized Data**
   - No more "NYC" vs "New York" vs "New York City"
   - Consistent format: "City, State, Country"

2. **Better Search**
   - Can search by city, state, or country
   - Can calculate distances using coordinates

3. **User Experience**
   - One tap to get location
   - No typing required
   - More accurate than manual entry

---

## 📝 Next Steps

1. **Install expo-location**:
   ```bash
   cd MusicOnTheGo/frontend
   npx expo install expo-location
   ```

2. **Run database migration**:
   ```bash
   cd MusicOnTheGo/backend
   npm run prisma:migrate
   ```
   Enter migration name: `add_location_fields`

3. **Test registration**:
   - Open registration screen
   - Allow location permission
   - Verify location is detected
   - Complete registration

4. **Update "Find Nearby" feature** (future):
   - Use latitude/longitude for distance calculations
   - Filter by city/state/country
   - Sort by distance

---

## 🔍 Testing

### Test Location Detection:

1. Open registration screen
2. Should see location button next to location field
3. Tap button (or it auto-detects on load)
4. Allow location permission
5. Should see: "✓ Location detected: City, State"

### Test Manual Entry:

1. Location field should still be editable
2. Can type location manually if needed
3. Manual entry will still work (just won't have lat/lng)

---

## ⚠️ Notes

- Location permission is required for automatic detection
- If permission denied, user can still enter location manually
- Coordinates are optional (null if not provided)
- Backward compatible with old registration flow

---

## 🐛 Troubleshooting

### Location not detected:
- Check location permission is granted
- Check device has GPS enabled
- Check device is not in airplane mode
- Try tapping the location button manually

### Permission denied:
- User can still register with manual location entry
- App will work without location (just won't auto-fill)

### Reverse geocoding fails:
- Falls back to manual entry
- User can still complete registration
