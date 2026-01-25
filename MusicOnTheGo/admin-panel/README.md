# MusicOnTheGo Admin Panel

Admin dashboard for managing the MusicOnTheGo platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL if different from default:
```
VITE_API_URL=http://localhost:5050
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:3001

## Creating an Admin Account

Admin accounts cannot be created through the regular registration process. Use one of these methods:

### Method 1: Using the Script (Recommended)

Run the script from the backend directory:

```bash
cd ../backend
node scripts/create-admin.js <email> <password> [name]
```

**Example:**
```bash
node scripts/create-admin.js admin@musiconthego.com admin123 "Admin User"
```

This will:
- Create a new admin account if the email doesn't exist
- Update an existing user to admin role if the email already exists

### Method 2: Using Prisma Studio

1. Open Prisma Studio:
```bash
cd ../backend
npm run prisma:studio
```

2. Navigate to the `User` model
3. Click "Add record"
4. Fill in the fields:
   - `email`: Your admin email
   - `password`: Hash the password using bcrypt (or use the script above)
   - `name`: Admin name
   - `role`: Select "admin"
5. Save the record

### Method 3: Direct SQL (Advanced)

If you have direct database access, you can insert an admin user directly:

```sql
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  -- bcrypt hashed password (example placeholder)
  '$2a$10$...',
  'Admin User',
  'admin',
  NOW(),
  NOW()
);
```

## Login

After creating an admin account, open http://localhost:3001 and log in with your admin email and password.
