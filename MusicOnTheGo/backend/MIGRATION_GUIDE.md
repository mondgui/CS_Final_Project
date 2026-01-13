# Migration Guide: Express + MongoDB → NestJS + PostgreSQL

## Current Status

✅ **Phase 1: Prisma Schema Created**
- All models converted to Prisma schema
- Relationships defined
- Indexes added

🔄 **Phase 2: NestJS Setup (In Progress)**
- Basic NestJS structure created
- Prisma service set up
- Module structure defined

## Next Steps

### 1. Install Dependencies
```bash
cd backend
# Backup old package.json
mv package.json package-old.json
mv package-new.json package.json

# Install new dependencies
npm install
```

### 2. Set Up PostgreSQL Database

**Option A: Supabase (Recommended - Free Tier)**
1. Go to https://supabase.com
2. Create account and project
3. Get connection string from Settings → Database
4. Add to `.env`:
```
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

**Option B: Neon (Alternative - Free Tier)**
1. Go to https://neon.tech
2. Create account and project
3. Get connection string
4. Add to `.env`

**Option C: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Then create database:
createdb musiconthego
# Connection string:
DATABASE_URL="postgresql://postgres:password@localhost:5432/musiconthego"
```

### 3. Run Prisma Migrations
```bash
# Generate Prisma Client
npm run prisma:generate

# Create initial migration
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Migrate Data from MongoDB (When Ready)
- Export data from MongoDB
- Transform to PostgreSQL format
- Import using Prisma or SQL scripts

## Module Structure

Each feature will be a NestJS module:
- `auth/` - Authentication
- `users/` - User management
- `bookings/` - Booking system
- `messages/` - Messaging
- `availability/` - Teacher availability
- `practice/` - Practice sessions
- `resources/` - Resources
- `community/` - Community posts
- `reviews/` - Reviews
- `inquiries/` - Inquiries
- `admin/` - Admin routes
- `upload/` - File uploads
- `chat/` - Socket.io gateway

## Migration Order

1. ✅ Prisma schema (DONE)
2. 🔄 NestJS setup (IN PROGRESS)
3. ⏳ Auth module
4. ⏳ Users module
5. ⏳ Bookings module
6. ⏳ Messages module
7. ⏳ Other modules
8. ⏳ Socket.io integration
9. ⏳ Testing
10. ⏳ Deployment
