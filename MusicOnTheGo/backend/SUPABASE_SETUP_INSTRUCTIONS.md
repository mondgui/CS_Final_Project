# Supabase Realtime Setup Instructions

## Step 1: Get Supabase Credentials

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

## Step 2: Add to Frontend .env

Add these to `MusicOnTheGo/frontend/.env` (or create it if it doesn't exist):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Enable Realtime on Message Table

**Important:** The "Replication" page is for external data replication (BigQuery, etc.), NOT for enabling Realtime subscriptions.

To enable Realtime on the Message table:

### Method 1: Via Table Settings (Recommended)
1. Go to **Database** → **Tables**
2. **Click on the `Message` table** (it should be clickable - if not, see troubleshooting below)
3. Once inside the Message table view, look for:
   - A **"Settings"** or **"Configuration"** tab/button
   - Or a **"Realtime"** toggle/switch
4. Toggle **"Enable Realtime"** to **ON**

### Method 2: Via SQL (Alternative)
If you can't access the table settings, run this SQL in **SQL Editor**:

```sql
-- Enable Realtime for Message table
ALTER PUBLICATION supabase_realtime ADD TABLE "Message";
```

### Method 3: Check if Realtime Publication Exists
If the above doesn't work, first check if the publication exists:

```sql
-- Check existing publications
SELECT * FROM pg_publication;

-- If supabase_realtime doesn't exist, create it
CREATE PUBLICATION supabase_realtime FOR TABLE "Message";
```

### Troubleshooting: Table Not Clickable
If the Message table row is not clickable:
1. Try refreshing the page
2. Check if you have proper permissions
3. Try accessing via direct URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/database/tables/Message`
4. Use Method 2 (SQL) instead

## Step 4: Set Up Row Level Security (RLS)

Go to **SQL Editor** in Supabase Dashboard and run:

```sql
-- Enable RLS on Message table
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read messages where they are sender or recipient
CREATE POLICY "Users can read their own messages"
ON "Message"
FOR SELECT
USING (
  auth.uid()::text = "senderId" OR 
  auth.uid()::text = "recipientId"
);

-- Policy: Users can insert messages where they are the sender
CREATE POLICY "Users can send messages"
ON "Message"
FOR INSERT
WITH CHECK (auth.uid()::text = "senderId");

-- Policy: Users can update messages where they are the recipient (mark as read)
CREATE POLICY "Users can update received messages"
ON "Message"
FOR UPDATE
USING (auth.uid()::text = "recipientId");
```

**Note:** If you're using custom JWT (not Supabase Auth), you have two options:

### Option A: Use Service Role Key (Quick - for MVP)
- Use Service Role key instead of anon key
- Bypasses RLS (less secure but works immediately)
- Good for development/MVP

### Option B: Configure Custom JWT (Production)
- Configure Supabase to verify your custom JWT tokens
- Full RLS support
- More secure

For now, we'll use Option A (Service Role) to get it working quickly.

## Step 5: Run Prisma Migration

```bash
cd MusicOnTheGo/backend
npx prisma migrate dev --name add_room_id_to_messages
```

This will:
- Add `roomId` column to `Message` table
- Create indexes for efficient queries

## Step 6: Populate roomId for Existing Messages

After migration, run this SQL in Supabase SQL Editor:

```sql
-- Populate roomId for existing messages
UPDATE "Message"
SET "roomId" = LEAST("senderId", "recipientId") || '_' || GREATEST("senderId", "recipientId")
WHERE "roomId" IS NULL;
```

## Step 7: Update Backend to Set roomId

The backend will automatically set `roomId` when creating new messages (code updated).

## That's It!

After these steps, the frontend code will automatically use Supabase Realtime for chat.
