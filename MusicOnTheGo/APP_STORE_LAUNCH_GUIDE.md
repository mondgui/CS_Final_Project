# Complete App Store & Google Play Launch Guide
## MusicOnTheGo - Step-by-Step Submission Process

This guide walks you through launching your Expo app on both iOS App Store and Google Play Store from scratch.

---

## 📋 PREREQUISITES

### Required Accounts & Subscriptions

#### 1. **Apple Developer Account** (for iOS)
- **Cost**: $99/year
- **Sign up**: https://developer.apple.com/programs/
- **What you need**: 
  - Apple ID
  - Credit card
  - Company/Individual information
- **Processing time**: Usually 24-48 hours for approval

#### 2. **Google Play Console Account** (for Android)
- **Cost**: $25 one-time fee
- **Sign up**: https://play.google.com/console/signup
- **What you need**:
  - Google account
  - Credit card
  - Developer information
- **Processing time**: Usually instant

#### 3. **Expo Account** (Free tier works, but EAS Build requires paid plan)
- **Sign up**: https://expo.dev/signup
- **EAS Build**: Built into Expo (recommended for production builds)
- **Cost**: Free tier available, but consider paid for faster builds

---

## 🔧 STEP 1: PREPARE YOUR APP FOR PRODUCTION

### 1.1 Update app.json Configuration

Ensure your `app.json` has all required production settings:

```json
{
  "expo": {
    "name": "MusicOnTheGo",
    "slug": "musiconthego",
    "version": "1.0.0",  // Update for each release
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",  // Must be 1024x1024 PNG
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.musiconthego",  // MUST be unique
      "buildNumber": "1",  // Increment with each build
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to find teachers and students near you."
      }
    },
    "android": {
      "package": "com.yourcompany.musiconthego",  // MUST be unique
      "versionCode": 1,  // Increment with each build
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/images/android-icon-foreground.png"
      },
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

**IMPORTANT NOTES:**
- `bundleIdentifier` (iOS) and `package` (Android) must be unique across the entire app store
- Use reverse domain notation: `com.yourcompany.appname`
- If you don't have a company, use something like: `com.yourname.musiconthego`
- **Never change these after your first release** - it will break updates!

### 1.2 Create Required Assets

#### App Icon
- **Size**: 1024x1024 pixels
- **Format**: PNG (no transparency for iOS)
- **Location**: `./assets/images/icon.png`
- **Requirements**: 
  - No rounded corners (stores add them)
  - Simple, recognizable design
  - Works well at small sizes

#### Android Adaptive Icon
- **Foreground**: 1024x1024 PNG (safe zone: 768x768 in center)
- **Background**: Color or image
- **Location**: Already configured in your app.json

#### Screenshots (Required for stores)
- **iOS Screenshots** (needed):
  - iPhone 6.7" (iPhone 14 Pro Max): 1290x2796 px
  - iPhone 6.5" (iPhone 11 Pro Max): 1242x2688 px
  - iPhone 5.5" (iPhone 8 Plus): 1242x2208 px
  - iPad Pro 12.9": 2048x2732 px
  
- **Android Screenshots** (at least 2 required):
  - Phone: 1080x1920 px (or larger)
  - Tablet (7"): 1080x1920 px
  - Tablet (10"): 2048x2732 px

**How to create screenshots:**
1. Run your app in simulator/emulator
2. Navigate to key screens
3. Take screenshots (Cmd+S on iOS simulator, use device screenshot)
4. You may need to edit them to show the best content

#### App Store Description
- **iOS**: Up to 4000 characters
- **Android**: Up to 4000 characters
- **Required**: Short description (up to 80 characters)

#### Privacy Policy (REQUIRED for both stores)
- You **must** have a publicly accessible privacy policy URL
- Must explain what data you collect and how you use it
- Can host on GitHub Pages, your website, or services like:
  - https://www.freeprivacypolicy.com/
  - https://www.privacypolicies.com/

---

## 📱 STEP 2: SET UP EAS BUILD (Expo Application Services)

### 2.1 Install EAS CLI

```bash
npm install -g eas-cli
```

### 2.2 Login to Expo

```bash
eas login
```

### 2.3 Configure EAS Build

```bash
cd MusicOnTheGo/frontend
eas build:configure
```

This creates an `eas.json` file. Review and update it:

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 2.4 Update app.json with Bundle Identifiers

Make sure you've added:
```json
"ios": {
  "bundleIdentifier": "com.yourcompany.musiconthego"
},
"android": {
  "package": "com.yourcompany.musiconthego"
}
```

---

## 🍎 STEP 3: iOS APP STORE SUBMISSION

### 3.1 Set Up Apple Developer Account

1. Go to https://developer.apple.com/programs/
2. Click "Enroll"
3. Sign in with Apple ID or create one
4. Choose individual or organization
5. Complete enrollment (takes 24-48 hours)

### 3.2 Create App Store Connect App

1. Go to https://appstoreconnect.apple.com/
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: MusicOnTheGo (or what you want to appear in App Store)
   - **Primary Language**: English (or your choice)
   - **Bundle ID**: Select or create `com.yourcompany.musiconthego`
     - To create: Go to Certificates, Identifiers & Profiles → Identifiers → App IDs → "+"
     - Choose "App" type
     - Enter bundle ID (must match app.json)
     - Enable capabilities you need (Push Notifications, etc.)
   - **SKU**: Unique identifier (e.g., `MOG-001`)
   - **User Access**: Full Access (unless using team)

### 3.3 Create iOS Build

#### Option A: Using EAS Build (Recommended)

```bash
cd MusicOnTheGo/frontend
eas build --platform ios --profile production
```

**What happens:**
1. EAS uploads your code to cloud
2. Builds iOS app in Apple's environment
3. Provides download link (takes 10-20 minutes)

**First time setup:**
- You'll need to provide Apple Developer account credentials
- EAS will handle certificates and provisioning profiles

#### Option B: Local Build (Advanced)

Requires macOS, Xcode, and more setup. EAS Build is recommended.

### 3.4 Configure App Store Connect

1. **App Information**
   - Go to your app in App Store Connect
   - Fill in:
     - Category: Education, Music, etc.
     - Privacy Policy URL: Your privacy policy link
     - Support URL: Your support website/email
     - Marketing URL (optional)

2. **Pricing and Availability**
   - Set price (usually Free)
   - Select countries/regions

3. **Prepare for Submission**

   a. **App Preview & Screenshots**
      - Add screenshots for each device size required
      - Can use same screenshots for multiple sizes initially
      - App Preview video (optional but recommended)

   b. **Description**
      - Name: MusicOnTheGo (or your app name)
      - Subtitle: Brief tagline (up to 30 characters)
      - Description: Full description (up to 4000 characters)
      - Keywords: Relevant keywords, comma-separated (up to 100 characters)
      - Support URL: Your website/contact
      - Marketing URL (optional)

   c. **App Icon**
      - Upload 1024x1024 PNG

   d. **Version Information**
      - Version: 1.0.0
      - Copyright: © 2024 Your Name/Company
      - Age Rating: Complete questionnaire (usually 4+ for educational apps)

   e. **Build**
      - Click "+" next to "Build"
      - Select your build from EAS (it should appear after building)
      - If not visible:
        1. Download `.ipa` from EAS
        2. Use Transporter app (macOS) or `eas submit` command:
           ```bash
           eas submit --platform ios
           ```

4. **App Review Information**
   - First Name, Last Name
   - Phone Number
   - Email Address
   - Demo Account (if your app requires login):
     - Username/Password for reviewer to test
     - Notes: Explain how to use the app
   - Notes (optional): Any special instructions

5. **Version Release**
   - Choose: "Manually release this version" (recommended for first time)
   - Or "Automatically release this version"

6. **Export Compliance**
   - Usually answer "No" unless using encryption
   - If using HTTPS (which you are), that's standard and usually "No"

7. **Advertising Identifier (IDFA)**
   - Answer whether you use it (probably "No" for now)

### 3.5 Submit for Review

1. Click "Add for Review" in top right
2. Review all items have checkmarks
3. Click "Submit for Review"
4. Status changes to "Waiting for Review"

**Review Time:**
- Usually 24-48 hours
- Can take up to 7 days
- You'll get email notifications about status

### 3.6 Common Rejection Reasons & How to Avoid

- **Missing Privacy Policy**: Must have valid URL
- **App crashes**: Test thoroughly before submitting
- **Missing functionality**: Demo account must work
- **Guideline violations**: Review Apple's guidelines
- **Incomplete information**: Fill all required fields

---

## 🤖 STEP 4: GOOGLE PLAY STORE SUBMISSION

### 4.1 Set Up Google Play Console

1. Go to https://play.google.com/console/
2. Accept Developer Agreement
3. Pay $25 one-time fee
4. Complete account details

### 4.2 Create App

1. Click "Create app"
2. Fill in:
   - **App name**: MusicOnTheGo
   - **Default language**: English
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Check boxes for your app type
3. Click "Create app"

### 4.3 Create Android Build

#### Using EAS Build

```bash
cd MusicOnTheGo/frontend
eas build --platform android --profile production
```

**What happens:**
- Builds APK or AAB (Android App Bundle)
- AAB is recommended for Google Play (smaller downloads)
- Takes 10-20 minutes

**First time:**
- EAS will generate a keystore for signing
- **IMPORTANT**: Save the keystore password somewhere secure!
- EAS stores it, but you should have a backup

#### Configure build type in eas.json:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"  // Recommended for Play Store
      }
    }
  }
}
```

### 4.4 Set Up App Content

1. **App Access**
   - Public (available to everyone)
   - Closed testing / Internal testing (for testing)

2. **Ad Content**
   - Does your app contain ads? (Yes/No)

3. **Content Rating**
   - Complete questionnaire about content
   - Usually results in "Everyone" for educational apps

4. **Target Audience**
   - Primary audience age group
   - Whether it's made for kids

5. **Data Safety** (REQUIRED - very important!)
   - Describe what data you collect:
     - Personal info (name, email)
     - Location data
     - Photos/media
   - Explain how data is used
   - State if data is shared with third parties
   - Security practices (encryption, etc.)

6. **Privacy Policy** (REQUIRED)
   - Must provide URL
   - Must match what you say in Data Safety

### 4.5 Create Store Listing

1. **App Details**
   - **App name**: MusicOnTheGo (up to 50 characters)
   - **Short description**: Brief tagline (up to 80 characters)
   - **Full description**: Detailed description (up to 4000 characters)
   - **App icon**: 512x512 PNG (no transparency)
   - **Feature graphic**: 1024x500 PNG (shown on Play Store)
   - **Screenshots**: At least 2 required
     - Phone: 16:9 or 9:16 aspect ratio
     - Minimum 320px, max 3840px
     - Recommended: 1080x1920 or similar

2. **Graphics Assets**
   - **App icon**: 512x512 (required)
   - **Feature graphic**: 1024x500 (required)
   - **Phone screenshots**: 16:9 or 9:16, at least 2 (required)
   - **Tablet screenshots**: Optional but recommended
   - **TV banner**: Optional (if supporting Android TV)

3. **Categorization**
   - **App category**: Education / Music / etc.
   - **Tags** (optional): Relevant keywords

4. **Contact Details**
   - **Email**: Your support email
   - **Phone** (optional)
   - **Website** (optional)

### 4.6 Upload Build

1. Go to "Production" (or "Internal testing" for testing first)
2. Click "Create new release"
3. **Upload build**:
   - Download `.aab` from EAS build
   - Or use `eas submit`:
     ```bash
     eas submit --platform android
     ```
4. **Release name**: 1.0.0 (or version name)
5. **Release notes**: What's new in this version (up to 500 characters)
6. Click "Review release"

### 4.7 Submit for Review

1. Review all sections are complete
2. Check for any warnings/errors
3. Click "Start rollout to Production"
4. Or start with "Internal testing" first to test

**Review Time:**
- Usually 1-3 days
- Can take up to 7 days for first submission
- You'll get email notifications

### 4.8 Testing Before Production

**Recommended approach:**

1. **Internal Testing Track**
   - Upload to Internal testing
   - Share link with yourself/friends
   - Test for a few days
   - Fix any issues

2. **Closed Testing Track** (optional)
   - Beta testing with selected users

3. **Production**
   - Only submit when confident

---

## 🧪 STEP 5: TESTING WITH TESTFLIGHT (iOS) & INTERNAL TESTING (Android)

### 5.1 iOS TestFlight Testing

1. **Build for TestFlight:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to TestFlight:**
   ```bash
   eas submit --platform ios
   ```
   Or manually upload via App Store Connect → TestFlight

3. **Add Testers:**
   - Go to App Store Connect → TestFlight
   - Add internal testers (up to 100, must be in your team)
   - Add external testers (up to 10,000, requires App Review)
   - Send invite links

4. **Test for a few days** before submitting to App Store

### 5.2 Android Internal Testing

1. **Upload to Internal Testing:**
   - In Play Console, go to Testing → Internal testing
   - Create release
   - Upload AAB
   - Add testers (email addresses)

2. **Share Testing Link:**
   - Google provides a testing link
   - Share with testers

3. **Test thoroughly** before production

### 5.3 Android Closed Testing (Required for New Developer Accounts)

**IMPORTANT**: If you see "You don't have access to production yet" in Play Console, you need to complete closed testing first.

#### Why Closed Testing?
- **New developer accounts** must have **12 opted-in testers** for **14 consecutive days** in closed testing before they can publish to production
- This is Google's policy to ensure app quality before public release
- After 14 days, you'll gain access to production (but the app won't automatically go public)

#### Step-by-Step Setup:

1. **Go to Closed Testing:**
   - In Play Console, navigate to: **Testing → Closed testing**
   - You'll see a default track called "Closed testing" (or create a new one)

2. **Create a Release:**
   - Click **"Create new release"** (or "Edit release" if one exists)
   - **Upload your `.aab` file** (the same one you'd use for production)
   - **Release name**: e.g., "1.0.0" or "v1.0.0"
   - **Release notes**: Brief description (e.g., "Initial closed testing release")
   - Click **"Review release"**
   - Click **"Start rollout to Closed testing"**

3. **Add Testers:**
   - Go to the **"Testers"** tab in Closed testing
   - Choose **"Create email list"** (or select an existing list)
   - **Name your list**: e.g., "Beta Testers"
   - **Add at least 12 email addresses** (you can add more)
     - These should be real Google accounts (Gmail or Google Workspace)
     - You can add your own email multiple times if needed (but real testers are better)
   - Click **"Save changes"**

4. **Get the Opt-In Link:**
   - After saving testers, you'll see an **"Opt-in URL"** (looks like: `https://play.google.com/apps/internaltest/...`)
   - **Copy this link** - you'll share it with testers

5. **Share with Testers:**
   - Send the opt-in link to all 12+ testers
   - **They must:**
     - Click the link
     - Click **"Become a tester"** button
     - Stay opted in for **14 consecutive days** (if they opt out, the timer resets)
   - After opting in, they can download your app from the Play Store using the same link

6. **Monitor Progress:**
   - Check **"Testing → Closed testing"** regularly
   - Ensure at least **12 testers remain opted in** for 14 consecutive days
   - Google will track this automatically

7. **After 14 Days:**
   - You'll receive an email notification (or check Play Console)
   - **Production access will be unlocked**
   - You can now publish to Production (but it won't happen automatically)
   - Closed testing can continue alongside production

#### Important Notes:
- ⚠️ **Testers must stay opted in**: If someone opts out, the 14-day counter may reset
- ⚠️ **Consecutive days**: The 14 days must be consecutive (not cumulative)
- ⚠️ **Minimum 12 testers**: You need at least 12 opted-in testers at all times
- ✅ **You can add more testers**: Having more than 12 is fine and recommended
- ✅ **Same AAB**: Use the same production-ready `.aab` file
- ✅ **Can test during this time**: Testers can use the app while waiting for production access

#### Troubleshooting:
- **"Create new release" is grayed out**: Check if there's a draft release - edit it instead
- **Can't add testers**: Make sure you've created a release first
- **Testers can't see the app**: They must click the opt-in link and become testers first
- **14 days passed but still no access**: Check that you had 12+ testers for the full 14 consecutive days

---

## 📊 STEP 6: POST-SUBMISSION PROCESS

### 6.1 Monitor Submission Status

**iOS:**
- App Store Connect → My Apps → Your App
- Status: Waiting for Review → In Review → Pending Developer Release / Ready for Sale

**Android:**
- Play Console → Your App → Release overview
- Status: Processing → Under review → Available on Google Play

### 6.2 Respond to Feedback

**If Rejected:**
- Read rejection reason carefully
- Fix issues
- Resubmit with explanation

**Common fixes:**
- Update privacy policy
- Fix crashes
- Provide working demo account
- Update app description

### 6.3 After Approval

**iOS:**
- App goes live automatically (if set) or manually release
- Monitor analytics in App Store Connect

**Android:**
- App is live on Play Store
- Monitor statistics in Play Console

---

## 🔄 STEP 7: UPDATING YOUR APP

### 7.1 Version Numbering

**iOS:**
- Update `version` in app.json (e.g., 1.0.0 → 1.0.1)
- `buildNumber` auto-increments with EAS

**Android:**
- Update `version` in app.json
- `versionCode` auto-increments with EAS

### 7.2 Release Process

1. **Make changes** to your code
2. **Update version** in app.json
3. **Build new version:**
   ```bash
   eas build --platform ios --profile production
   eas build --platform android --profile production
   ```
4. **Submit:**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```
5. **Update store listings** if needed (screenshots, description)
6. **Submit for review**

---

## 🛠️ TROUBLESHOOTING

### Common Issues

1. **Build fails:**
   - Check error message in EAS dashboard
   - Ensure all dependencies are compatible
   - Check app.json for errors

2. **App rejected:**
   - Read rejection email carefully
   - Common: Missing privacy policy, crashes, incomplete info
   - Fix and resubmit

3. **Keystore lost:**
   - EAS stores it, but keep backups
   - If lost, need to create new app listing (major issue!)

4. **Bundle ID/Package name conflicts:**
   - Must be unique
   - Check if already taken
   - Use reverse domain notation

---

## 📝 CHECKLIST BEFORE SUBMISSION

### iOS Checklist
- [ ] Apple Developer account ($99/year)
- [ ] App Store Connect app created
- [ ] Unique bundle identifier set
- [ ] App icon (1024x1024)
- [ ] Screenshots for required devices
- [ ] App description and metadata
- [ ] Privacy policy URL
- [ ] Demo account (if needed)
- [ ] App tested thoroughly
- [ ] Build uploaded
- [ ] All required fields filled
- [ ] Submitted for review

### Android Checklist
- [ ] Google Play Console account ($25)
- [ ] Unique package name set
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (at least 2)
- [ ] App description
- [ ] Privacy policy URL
- [ ] Data Safety form completed
- [ ] Content rating completed
- [ ] App tested thoroughly
- [ ] Build uploaded (.aab)
- [ ] Store listing complete
- [ ] Submitted for review

---

## 💰 COST SUMMARY

- **Apple Developer**: $99/year
- **Google Play**: $25 one-time
- **EAS Build**: Free tier available (limited builds/month)
  - Paid plans start at ~$29/month for unlimited builds
- **Privacy Policy Hosting**: Free (GitHub Pages) or ~$5/month
- **Total First Year**: ~$125-150 + hosting

---

## 🎯 QUICK START COMMANDS

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configure
cd MusicOnTheGo/frontend
eas build:configure

# 4. Build iOS
eas build --platform ios --profile production

# 5. Build Android
eas build --platform android --profile production

# 6. Submit iOS
eas submit --platform ios

# 7. Submit Android
eas submit --platform android
```

---

## 📚 ADDITIONAL RESOURCES

- **Expo Documentation**: https://docs.expo.dev/build/introduction/
- **Apple App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Google Play Policies**: https://play.google.com/about/developer-content-policy/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Privacy Policy Generator**: https://www.freeprivacypolicy.com/

---

## ⚠️ IMPORTANT NOTES

1. **Bundle IDs/Package Names are PERMANENT**: Once set, they cannot be changed
2. **Privacy Policy is MANDATORY**: Both stores require it
3. **Testing is CRITICAL**: Test thoroughly before submission
4. **Review takes time**: Be patient, first submission can take several days
5. **Follow guidelines**: Read store policies to avoid rejections
6. **Keep credentials safe**: Especially Android keystore passwords

---

Good luck with your launch! 🚀

If you need help with any specific step, refer to the official documentation or ask for clarification on any part of this process.
