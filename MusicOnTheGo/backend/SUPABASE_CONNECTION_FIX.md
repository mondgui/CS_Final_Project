# Supabase Connection String Fix

## The Issue

Supabase has two types of connection strings:
1. **Session mode** (port 5432) - For migrations and Prisma
2. **Transaction mode** (port 6543) - For connection pooling

For Prisma migrations, we need the **Session mode** connection string.

## How to Get the Correct Connection String

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com
2. Go to your project
3. Click **Settings** → **Database**

### Step 2: Get Session Mode Connection String
1. Scroll to **Connection string** section
2. Look for **Session mode** (not Transaction mode)
3. Click the **URI** tab
4. Copy the connection string

It should look like:
```
postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
```

OR (older format):
```
postgresql://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres
```

### Step 3: Update Your .env

Make sure your DATABASE_URL looks like this:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.fbodbftncfapeusvsicb.supabase.co:5432/postgres?sslmode=require"
```

**Important:**
- Replace `[YOUR-PASSWORD]` with your actual database password
- Make sure it ends with `?sslmode=require`
- Use port **5432** (Session mode), not 6543

## Alternative: Use Connection Pooling String

If the direct connection doesn't work, try the **Transaction mode** connection string (port 6543):

```env
DATABASE_URL="postgresql://postgres.fbodbftncfapeusvsicb:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
```

Note: This uses port 6543 and a different host format.

## Test Connection

After updating .env, test the connection:

```bash
# Test if Prisma can connect
npm run prisma:generate

# Try to run migrations
npm run prisma:migrate
```

## Common Issues

### Issue: "Can't reach database server"
**Solutions:**
1. Check your password is correct (no brackets, exact copy)
2. Make sure you're using Session mode (port 5432)
3. Try the Transaction mode connection string (port 6543)
4. Check if your IP is allowed (Supabase might have IP restrictions)

### Issue: "Connection refused"
**Solutions:**
1. Check Supabase project is active (not paused)
2. Verify the project region matches
3. Try the pooler connection string instead

### Issue: "SSL required"
**Solutions:**
1. Make sure `?sslmode=require` is at the end
2. Or try `?sslmode=prefer`

## Still Having Issues?

1. **Check Supabase Dashboard:**
   - Go to Settings → Database
   - Check if project is active
   - Verify connection string format

2. **Try Direct Connection:**
   - In Supabase, go to Settings → Database
   - Look for "Connection string" → "Direct connection"
   - Use that instead of pooler

3. **Check IP Restrictions:**
   - Supabase might block connections
   - Check Settings → Database → Connection pooling
   - Make sure your IP is allowed
