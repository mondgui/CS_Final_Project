# Supabase Realtime Chat Migration Guide

## 🎯 Overview

**Use Supabase Realtime** for chat/messaging, keep Express + PostgreSQL for everything else.

**Why Supabase?**
- ✅ You already have Supabase set up (PostgreSQL hosting)
- ✅ Real-time subscriptions built-in (PostgreSQL changes → instant updates)
- ✅ No additional vendor lock-in (same database)
- ✅ Free tier: 500MB database, 2GB bandwidth
- ✅ Row Level Security (RLS) for security
- ✅ Works with your existing Prisma schema

---

## 📋 What Needs to Change

### 1. **Backend Changes** (Express)

#### Keep:
- ✅ All existing Express routes (bookings, users, inquiries, etc.)
- ✅ PostgreSQL database (Supabase)
- ✅ Prisma for database access
- ✅ Socket.io for bookings/availability (optional)

#### Remove/Modify:
- ❌ Socket.io message handling (`messageRoutes.js` Socket.io emissions)
- ❌ Keep message storage in PostgreSQL (Supabase) - **no change needed!**

#### Add:
- ✅ Enable Supabase Realtime on `Message` table
- ✅ Set up Row Level Security (RLS) policies
- ✅ Optional: Supabase client for admin operations

---

### 2. **Frontend Changes**

#### Remove:
- ❌ Socket.io client for messaging (`lib/socket.ts` - keep for bookings if needed)
- ❌ Socket.io listeners in `chat/[id].tsx` and `messages.tsx`

#### Add:
- ✅ Supabase JavaScript client (`@supabase/supabase-js`)
- ✅ Realtime subscriptions for messages
- ✅ Realtime subscriptions for conversation list

---

## 🔧 Step-by-Step Implementation

### **Step 1: Enable Supabase Realtime**

#### In Supabase Dashboard:

1. **Go to Database → Replication**
   - Find your `Message` table
   - Toggle **"Enable Realtime"** ON
   - This allows real-time subscriptions to message changes

2. **Go to Database → Tables → Message**
   - Click on the `Message` table
   - Go to **"Replication"** tab
   - Enable replication for the table

---

### **Step 2: Set Up Row Level Security (RLS)**

#### In Supabase Dashboard → SQL Editor:

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

-- Policy: Users can delete their own sent messages (optional)
CREATE POLICY "Users can delete their sent messages"
ON "Message"
FOR DELETE
USING (auth.uid()::text = "senderId");
```

**Note:** If you're using JWT tokens (not Supabase Auth), you'll need to:
- Either migrate to Supabase Auth
- Or use Service Role key (bypasses RLS) - **less secure but works**

---

### **Step 3: Install Supabase Client**

#### Frontend:
```bash
cd MusicOnTheGo/frontend
npm install @supabase/supabase-js
```

#### Backend (optional - for admin operations):
```bash
cd MusicOnTheGo/backend
npm install @supabase/supabase-js
```

---

### **Step 4: Create Supabase Client**

#### Create `frontend/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize Supabase with JWT token from your backend
export async function initSupabaseAuth(token: string) {
  try {
    // Set the session using your JWT token
    // Note: This requires custom JWT verification on Supabase side
    // OR use Supabase Auth instead of custom JWT
    
    // Option 1: Use Service Role (bypasses RLS - for development)
    // Option 2: Create custom JWT that Supabase can verify
    // Option 3: Use Supabase Auth (recommended for production)
    
    const { data, error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: '', // Not needed if using custom JWT
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase auth error:', error);
    return false;
  }
}

// Alternative: Use Service Role (bypasses RLS)
// Only use this if you're handling auth in your Express backend
export function getSupabaseClient(token?: string) {
  if (token) {
    // Create client with custom JWT
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }
  return supabase;
}
```

#### Add to `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get these from:** Supabase Dashboard → Settings → API

---

### **Step 5: Update Chat Screen**

#### Replace `frontend/app/chat/[id].tsx`:

**Before (Socket.io):**
```typescript
socket.on("new-message", (message) => {
  setMessages(prev => [...prev, message]);
});
```

**After (Supabase Realtime):**
```typescript
import { supabase, getSupabaseClient } from '../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// In your component:
useEffect(() => {
  if (!currentUserId || !contactId) return;
  
  const token = await storage.getItem('token');
  const client = getSupabaseClient(token);
  
  // Create room ID (consistent ordering)
  const roomId = [currentUserId, contactId].sort().join('_');
  
  // Subscribe to message changes
  const channel = client
    .channel(`messages:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'Message',
        filter: `roomId=eq.${roomId}`, // Filter by room
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new;
          setMessages(prev => [...prev, formatMessage(newMessage)]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedMessage = payload.new;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === updatedMessage.id ? formatMessage(updatedMessage) : msg
            )
          );
        }
      }
    )
    .subscribe();
  
  return () => {
    channel.unsubscribe();
  };
}, [currentUserId, contactId]);

// Send message
const handleSend = async () => {
  const token = await storage.getItem('token');
  const client = getSupabaseClient(token);
  
  const { data, error } = await client
    .from('Message')
    .insert({
      text: messageText,
      senderId: currentUserId,
      recipientId: contactId,
      read: false,
      roomId: [currentUserId, contactId].sort().join('_'), // Add roomId for filtering
    });
  
  if (error) {
    console.error('Error sending message:', error);
  }
};
```

**Note:** You'll need to add a `roomId` column to your `Message` table for efficient filtering, OR filter in the subscription.

---

### **Step 6: Update Messages List**

#### Replace `frontend/app/messages.tsx`:

**Before:**
```typescript
const { data } = useQuery({
  queryKey: ["conversations"],
  queryFn: () => api("/api/messages/conversations"),
});
```

**After:**
```typescript
import { supabase, getSupabaseClient } from '../lib/supabase';

useEffect(() => {
  if (!currentUserId) return;
  
  const token = await storage.getItem('token');
  const client = getSupabaseClient(token);
  
  // Subscribe to all messages involving current user
  const channel = client
    .channel('conversations')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'Message',
        filter: `senderId=eq.${currentUserId} OR recipientId=eq.${currentUserId}`,
      },
      (payload) => {
        // Update conversation list
        updateConversationList(payload.new);
      }
    )
    .subscribe();
  
  return () => {
    channel.unsubscribe();
  };
}, [currentUserId]);
```

---

### **Step 7: Add Room ID to Message Table (Optional but Recommended)**

#### Migration:
```sql
-- Add roomId column for efficient filtering
ALTER TABLE "Message" 
ADD COLUMN "roomId" TEXT;

-- Create index for faster queries
CREATE INDEX "Message_roomId_idx" ON "Message"("roomId");

-- Populate roomId for existing messages
UPDATE "Message"
SET "roomId" = LEAST("senderId", "recipientId") || '_' || GREATEST("senderId", "recipientId");
```

#### Update Prisma Schema:
```prisma
model Message {
  id          String   @id @default(uuid())
  senderId    String
  recipientId String
  text        String
  read        Boolean  @default(false)
  readAt      DateTime?
  roomId      String?  // Add this
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  sender      User     @relation("SentMessages", fields: [senderId], references: [id])
  recipient   User     @relation("ReceivedMessages", fields: [recipientId], references: [id])
  
  @@index([roomId]) // Add index
}
```

Then run:
```bash
npx prisma migrate dev --name add_room_id
```

---

## 🔐 Authentication Options

### **Option A: Use Supabase Auth (Recommended)**
- Migrate from custom JWT to Supabase Auth
- Full RLS support
- Better security
- More work upfront

### **Option B: Custom JWT with Service Role (Quick)**
- Keep your existing JWT auth
- Use Service Role key (bypasses RLS)
- Less secure but works immediately
- Good for MVP

### **Option C: Hybrid (Best of Both)**
- Use Supabase Auth for new users
- Keep existing JWT for current users
- Gradually migrate

---

## 📊 Data Structure (No Changes Needed!)

Your existing Prisma schema works perfectly:
```prisma
model Message {
  id          String   @id @default(uuid())
  senderId    String
  recipientId String
  text        String
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
  // ... rest of your schema
}
```

Supabase Realtime will watch this table and send updates automatically!

---

## ⚡ Real-time Features

### **What You Get:**
- ✅ **Instant messages** - No polling, real-time updates
- ✅ **Typing indicators** - Can use Supabase Presence
- ✅ **Read receipts** - Update `read` field, others see it instantly
- ✅ **Offline support** - Supabase handles reconnection
- ✅ **Unread counts** - Query with filters, updates in real-time

### **Example: Typing Indicator**
```typescript
const channel = supabase.channel(`typing:${roomId}`)
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    const typingUsers = Object.keys(state);
    setIsTyping(typingUsers.length > 0);
  })
  .subscribe();

// When user types:
channel.track({ typing: true });
```

---

## 🔄 Migration Strategy

### **Option A: Gradual Migration (Recommended)**
1. Keep Socket.io for now
2. Add Supabase Realtime alongside
3. Test both
4. Switch frontend to Supabase
5. Remove Socket.io message code

### **Option B: Clean Cut**
1. Enable Realtime on Message table
2. Set up RLS policies
3. Update frontend to use Supabase
4. Remove Socket.io message code
5. Test thoroughly

---

## 💰 Cost

**Supabase Free Tier:**
- 500MB database ✅ (you're already using this)
- 2GB bandwidth/month
- Unlimited API requests
- Real-time subscriptions included ✅

**For 100 active users:**
- Likely $0/month (stays in free tier)

**For 1,000 active users:**
- ~$25/month (Pro plan)

---

## ⏱️ Time Estimate

- **Enable Realtime**: 5 minutes
- **Set up RLS**: 15 minutes
- **Install client**: 5 minutes
- **Update chat screen**: 2-3 hours
- **Update messages list**: 1 hour
- **Testing**: 1-2 hours
- **Total**: ~4-6 hours (half a day)

---

## ✅ Pros & Cons

### **Pros:**
- ✅ Already using Supabase (no new vendor)
- ✅ Real-time works out of the box
- ✅ Same database (no data migration)
- ✅ Works with Prisma
- ✅ Free tier is generous
- ✅ Row Level Security built-in

### **Cons:**
- ❌ Need to handle auth (JWT vs Supabase Auth)
- ❌ RLS setup required
- ❌ Learning curve for Realtime subscriptions

---

## 🚀 Quick Start Checklist

- [ ] Enable Realtime on `Message` table in Supabase Dashboard
- [ ] Set up RLS policies (or use Service Role for MVP)
- [ ] Install `@supabase/supabase-js` in frontend
- [ ] Create `lib/supabase.ts` with client
- [ ] Get Supabase URL and Anon Key from dashboard
- [ ] Update chat screen to use Realtime subscriptions
- [ ] Update messages list to use Realtime subscriptions
- [ ] Test real-time messaging
- [ ] Remove Socket.io message code (optional)

---

## 📝 Next Steps

1. **Get Supabase credentials:**
   - Go to Supabase Dashboard → Settings → API
   - Copy `URL` and `anon public` key

2. **Enable Realtime:**
   - Database → Replication → Enable for `Message` table

3. **Start with chat screen:**
   - Install Supabase client
   - Replace Socket.io with Realtime subscription
   - Test sending/receiving messages

4. **Then update messages list:**
   - Add Realtime subscription for conversation updates

---

## 🎯 Recommendation

**Use Supabase Realtime!** Since you're already on Supabase:
- ✅ No new vendor
- ✅ Same database
- ✅ Real-time built-in
- ✅ Free tier covers your needs

**Start with Service Role key** (bypasses RLS) for MVP, then add RLS later for production.
