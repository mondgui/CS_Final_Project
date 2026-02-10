# Submit Builds to Google Play from Expo (EAS Submit)

This guide covers how to submit your Android build from Expo to Google Play Console so you don’t have to download the AAB and upload it manually.

---

## Part 1: One-time setup

### 1. Google Play Console

- You already have an app (MusicOnTheGo) on [Google Play Console](https://play.google.com/console/).
- **Important:** You must have **uploaded at least one build manually once** (any track). After that, EAS Submit can upload via API.

### 2. Create a Google Service Account (for EAS Submit)

1. **Google Cloud project**  
   - Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project (or use an existing one).

2. **Create Service Account**  
   - Go to [IAM & Admin → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts).  
   - Click **Create Service Account**.  
   - Name it (e.g. `eas-play-submit`).  
   - Click **Done** (no roles needed here).

3. **Create JSON key**  
   - Open the new service account → **Keys** tab.  
   - **Add key** → **Create new key** → **JSON** → **Create**.  
   - Save the downloaded `.json` file somewhere safe (you’ll upload it to Expo).

4. **Enable Play Developer API**  
   - Open [Google Play Android Developer API](https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com) in the same Google Cloud project.  
   - Click **Enable**.

5. **Invite service account in Play Console**  
   - In [Google Play Console](https://play.google.com/console/) go to **Users and permissions** (or **Setup** → **Users and permissions**).  
   - Click **Invite new users**.  
   - **Email:** paste the service account email (e.g. `eas-play-submit@your-project.iam.gserviceaccount.com`).  
   - Under **App permissions**, select your app (MusicOnTheGo).  
   - Under **Account permissions** (or per-app), grant at least:
     - **Release to production, exclude devices, and use Play App Signing** (or “Release apps to production and testing tracks”)
     - Or assign the **Release manager** role for the app.  
   - Click **Invite user**.

### 3. Upload the key to Expo (EAS)

**Option A – Expo website**

1. Go to [expo.dev](https://expo.dev) → your account → project **MusicOnTheGo**.  
2. Open **Credentials** (or **Project** → **Credentials**).  
3. Under **Android**, select your app’s **Application identifier** (e.g. `com.mondgui.musiconthego`).  
4. Under **Service credentials**, click **Add a Google Service Account Key** (or **Change Google Service Account Key** → **Upload new key**).  
5. Upload the JSON key file you downloaded.  
6. Save.

**Option B – EAS CLI**

1. From your project (e.g. `MusicOnTheGo/frontend`):
   ```bash
   eas credentials --platform android
   ```
2. When asked **Which build profile do you want to configure?** → choose **production**.  
3. **What do you want to do?** → **Google Service Account** → **Upload a Google Service Account Key**.  
4. Enter the path to the JSON file (e.g. `~/Downloads/your-key.json`).

After this, you don’t need to do the service account setup again unless you revoke or replace the key.

---

## Part 2: Submitting a build (every time)

### From your computer

1. **Have a build**  
   - Either you already have a completed Android build on [expo.dev](https://expo.dev) (e.g. from **Builds**), or run:
     ```bash
     cd MusicOnTheGo/frontend
     eas build --platform android --profile production
     ```
   - Wait until the build is finished.

2. **Submit to Google Play**  
   From the same folder:
   ```bash
   eas submit --platform android
   ```
   - EAS will list recent Android builds; choose the one you want (or the latest).  
   - If you haven’t set a track in `eas.json`, you’ll be asked which track to use (e.g. **internal**, **alpha**, **beta**, **production**).  
   - The build is uploaded to that track in Google Play Console.

3. **In Google Play Console**  
   - Go to **Release** → **Testing** → **Internal testing** (or the track you chose).  
   - You’ll see the new build. Add release notes if needed, then **Review release** → **Start rollout to …** so testers get the update.

### Optional: build and submit in one step

```bash
eas build --platform android --profile production --auto-submit
```

This builds and then submits the new build to the track configured for the production submit profile.

### Optional: set default track in `eas.json`

In `MusicOnTheGo/frontend/eas.json`, you can set the track so you’re not prompted every time:

```json
{
  "submit": {
    "production": {
      "android": {
        "track": "internal"
      }
    }
  }
}
```

Use `internal`, `alpha`, `beta`, or `production` as needed.

---

## Summary

| Step | Where | What |
|------|--------|------|
| 1 | Google Cloud | Create project, service account, JSON key; enable Play Developer API |
| 2 | Google Play Console | Invite service account email; give release permissions for MusicOnTheGo |
| 3 | Expo (website or CLI) | Upload the JSON key under Android → Service credentials |
| 4 | Terminal | Run `eas submit --platform android` (after a build exists) |
| 5 | Google Play Console | Open the chosen track, add release notes, roll out |

After the one-time setup (steps 1–3), you only need to run `eas submit --platform android` (or use `--auto-submit` with `eas build`) and then finish the release in Play Console.
