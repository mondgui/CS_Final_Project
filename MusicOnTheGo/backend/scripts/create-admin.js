// Script to create an admin account
// Usage: node scripts/create-admin.js <email> <password> <name>

import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

async function createAdmin() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Admin';

  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.js <email> <password> [name]');
    console.error('Example: node scripts/create-admin.js admin@example.com password123 "Admin User"');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log('✅ Admin account already exists with this email!');
        process.exit(0);
      } else {
        // Update existing user to admin
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { email: email.toLowerCase() },
          data: {
            role: 'admin',
            password: hashedPassword,
            name: name || existingUser.name,
          },
        });
        console.log('✅ Existing user updated to admin role!');
        console.log(`   Email: ${email}`);
        console.log(`   Name: ${name || existingUser.name}`);
        await prisma.$disconnect();
        process.exit(0);
      }
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role: 'admin',
      },
    });

    console.log('✅ Admin account created successfully!');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   ID: ${adminUser.id}`);
    console.log('\n📝 You can now log in to the admin panel with these credentials.');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();
