# Verify Database Migration

## Check if New Tables Exist

Since Prisma says "Already in sync", let's verify the new tables exist:

### Option 1: Use Prisma Studio (Recommended)

```bash
cd MusicOnTheGo/backend
npm run prisma:studio
```

This will open Prisma Studio in your browser. Check if you can see:
- `Goal` table
- `Recording` table  
- `ResourceAssignment` table

### Option 2: Create Migration Explicitly

If the tables don't exist, create a migration:

```bash
cd MusicOnTheGo/backend
npx prisma migrate dev --name add_goals_recordings_resource_assignments --create-only
```

This creates the migration file without applying it. Then review it, and if it looks correct:

```bash
npx prisma migrate dev
```

### Option 3: Test the Server

Start the server and try to use the new endpoints:

```bash
npm run start:dev
```

Then test:
- `POST /api/practice/goals` - Create a goal
- `POST /api/practice/recordings` - Create a recording

If these work, the tables exist. If you get database errors, the tables need to be created.

---

## If Tables Don't Exist

If the tables are missing, you can:

1. **Reset and migrate** (⚠️ WARNING: This will delete all data):
   ```bash
   npx prisma migrate reset
   npx prisma migrate dev
   ```

2. **Create migration manually**:
   ```bash
   npx prisma migrate dev --name add_goals_recordings_resource_assignments
   ```

---

## Quick Test

After starting the server, try this in Postman/curl:

```bash
# Register a student first, then:
POST http://localhost:5050/api/practice/goals
Authorization: Bearer YOUR_TOKEN
{
  "title": "Learn Piano",
  "category": "Skill",
  "targetDate": "2024-12-31"
}
```

If this works, the tables exist! ✅
