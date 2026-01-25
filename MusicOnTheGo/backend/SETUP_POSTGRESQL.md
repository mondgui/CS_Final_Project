# PostgreSQL Setup Guide

## Option 1: Supabase (Recommended - Easiest)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (easiest) or email
4. Create a new organization (if needed)

### Step 2: Create a New Project
1. Click "New Project"
2. Fill in:
   - **Name**: `musiconthego` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine
3. Click "Create new project"
4. Wait 2-3 minutes for project to be created

### Step 3: Get Connection String
1. Go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password

### Step 4: Add to .env File
Create or update `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
PORT=5050
JWT_SECRET="your-jwt-secret-key-here"
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
```

---

## Option 2: Neon (Alternative - Also Free)

### Step 1: Create Neon Account
1. Go to https://neon.tech
2. Click "Sign Up"
3. Sign up with GitHub or email

### Step 2: Create a New Project
1. Click "Create a project"
2. Fill in:
   - **Name**: `musiconthego`
   - **Region**: Choose closest
   - **PostgreSQL version**: 15 or 16 (both work)
3. Click "Create project"

### Step 3: Get Connection String
1. On the project dashboard, you'll see **Connection string**
2. Copy it (looks like):
   ```
   postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 4: Add to .env File
Same as Supabase - add `DATABASE_URL` to `.env`

---

## Option 3: Local PostgreSQL (Advanced)

### Step 1: Install PostgreSQL
**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install with default settings

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database
```bash
# Create database
createdb musiconthego

# Or using psql:
psql postgres
CREATE DATABASE musiconthego;
\q
```

### Step 3: Connection String
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/musiconthego"
```

---

## Next Steps After Setup

Once you have your `DATABASE_URL`:

1. **Update .env file** with the connection string
2. **Install dependencies**:
   ```bash
   cd backend
   mv package.json package-old.json
   mv package-new.json package.json
   npm install
   ```

3. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

4. **Run migrations**:
   ```bash
   npm run prisma:migrate
   ```
   - This will create all tables in your database

5. **Verify** (optional):
   ```bash
   npm run prisma:studio
   ```
   - Opens a visual database browser

---

## Recommended: Supabase

**Why Supabase?**
- ✅ Free tier (500MB database, 2GB bandwidth)
- ✅ Easy setup (5 minutes)
- ✅ Web dashboard to view data
- ✅ Automatic backups
- ✅ SSL included
- ✅ No credit card required

**Free Tier Limits:**
- 500MB database storage
- 2GB bandwidth/month
- Unlimited API requests
- Perfect for development and small production apps

---

## Troubleshooting

### Connection Error
- Check password is correct
- Check connection string format
- Make sure SSL is enabled (`?sslmode=require`)

### Migration Fails
- Make sure database is empty (or we'll handle existing data)
- Check connection string is correct
- Verify PostgreSQL version (14+)

### Can't Connect
- Check firewall settings
- Verify connection string
- Try connecting from Supabase/Neon dashboard first
