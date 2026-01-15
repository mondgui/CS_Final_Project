# Quick Start Guide - PostgreSQL Setup

## 🎯 Fastest Path: Supabase (5 minutes)

### Step 1: Create Supabase Project
1. Visit: https://supabase.com
2. Sign up (GitHub login is fastest)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `musiconthego`
   - **Database Password**: ⚠️ **SAVE THIS PASSWORD!**
   - **Region**: Choose closest
5. Click **"Create new project"**
6. Wait 2-3 minutes

### Step 2: Get Connection String
1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Click **URI** tab
4. Copy the connection string
5. It looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
6. **Replace `[YOUR-PASSWORD]`** with your actual password

### Step 3: Update .env File
1. Open `backend/.env` (or create from `.env.example`)
2. Add your connection string:
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
   ```
3. Make sure to add `?sslmode=require` at the end

### Step 4: Run Setup Script
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

Or manually:
```bash
# Backup old package.json
mv package.json package-old.json
mv package-new.json package.json

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:migrate
```

### Step 5: Verify
```bash
# Start the server
npm run start:dev

# In another terminal, test the API
curl http://localhost:5050/api/health
# Should return: {"status":"ok","message":"Backend server is running"}
```

---

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Connection string copied
- [ ] DATABASE_URL added to .env
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma Client generated (`npm run prisma:generate`)
- [ ] Migrations run (`npm run prisma:migrate`)
- [ ] Server starts (`npm run start:dev`)
- [ ] Health check works (`curl http://localhost:5050/api/health`)

---

## 🆘 Need Help?

### Connection Issues?
- Check password is correct (no brackets)
- Make sure `?sslmode=require` is at the end
- Try the connection string from Supabase dashboard

### Migration Issues?
- Make sure database is accessible
- Check DATABASE_URL format
- Verify PostgreSQL version (14+)

### Still Stuck?
- Check `SETUP_POSTGRESQL.md` for detailed instructions
- Or use Neon.tech as alternative (same process)

---

## 🎉 Once Setup is Complete

You'll have:
- ✅ PostgreSQL database running
- ✅ All tables created (Users, Bookings, Messages, etc.)
- ✅ Prisma Client ready to use
- ✅ NestJS server ready to start

**Next**: We'll start creating the NestJS modules (Auth, Users, Bookings, etc.)
