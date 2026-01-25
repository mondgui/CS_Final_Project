# Creating an Admin Account

Admin accounts cannot be created through the regular registration API (which only allows "student" or "teacher" roles). Use one of these methods:

## Method 1: Using the Script (Easiest)

Run the create-admin script:

```bash
node scripts/create-admin.js <email> <password> [name]
```

**Example:**
```bash
node scripts/create-admin.js admin@musiconthego.com mySecurePassword123 "Admin User"
```

**Features:**
- Creates a new admin account if email doesn't exist
- Updates existing user to admin role if email exists
- Hashes password automatically

## Method 2: Update Existing User via Prisma Studio

1. Start Prisma Studio:
```bash
npm run prisma:studio
```

2. Find the user in the `User` table
3. Click "Edit record"
4. Change `role` to `admin`
5. Save

## Method 3: Using Node.js REPL

```bash
node
```

Then:
```javascript
import prisma from './utils/prisma.js';
import bcrypt from 'bcryptjs';

const email = 'admin@example.com';
const password = 'your-password';
const hashedPassword = await bcrypt.hash(password, 10);

await prisma.user.upsert({
  where: { email },
  update: { role: 'admin', password: hashedPassword },
  create: {
    email,
    password: hashedPassword,
    name: 'Admin User',
    role: 'admin',
  },
});

console.log('Admin account created!');
await prisma.$disconnect();
```

## After Creating Admin Account

1. Make sure your backend server is running:
```bash
npm run dev
```

2. Start the admin panel:
```bash
cd ../admin-panel
npm install
npm run dev
```

3. Open http://localhost:3001 and log in with your admin credentials.
